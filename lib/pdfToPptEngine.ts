import JSZip from 'jszip';
import {
  extractPdfPages,
  renderPdfPageToDataUrl,
  parsePdfPageRangeString,
} from './pdfClientEngine';

export type PptAspectRatio = '16:9' | '4:3';
export type PptSlideMode = 'visual_slide_with_notes' | 'editable_text_boxes';

export interface ReconstructedSlideItem {
  slideNumber: number;
  pageNumber: number;
  title: string;
  bullets: string[];
  speakerNotes: string;
  previewDataUrl: string;
}

export interface PdfToPptResult {
  fileName: string;
  slideCount: number;
  aspectRatio: PptAspectRatio;
  slides: ReconstructedSlideItem[];
  pptxBytes: Uint8Array;
  pptxBlob: Blob;
}

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] || '';
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

/**
 * Builds a valid ECMA-376 OpenXML PowerPoint (.pptx) archive from slide items using JSZip.
 */
export async function buildPptxArchive(
  slides: ReconstructedSlideItem[],
  aspectRatio: PptAspectRatio = '16:9',
  mode: PptSlideMode = 'visual_slide_with_notes'
): Promise<Uint8Array> {
  const zip = new JSZip();

  // EMUs (English Metric Units): 1 inch = 914,400 EMUs
  // 16:9 Widescreen = 13.333 in x 7.5 in = 12,192,000 x 6,858,000 EMUs
  // 4:3 Standard = 10 in x 7.5 in = 9,144,000 x 6,858,000 EMUs
  const cx = aspectRatio === '16:9' ? 12192000 : 9144000;
  const cy = 6858000;

  const slideOverrides = slides
    .map(
      (_, i) =>
        `  <Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
    )
    .join('\n');

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
${slideOverrides}
</Types>`
  );

  zip.folder('_rels')?.file(
    '.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  );

  const ppt = zip.folder('ppt');

  const presRels = slides
    .map(
      (_, i) =>
        `  <Relationship Id="rIdSlide${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
    )
    .join('\n');

  ppt?.folder('_rels')?.file(
    'presentation.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdMaster1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
${presRels}
</Relationships>`
  );

  const sldIdLst = slides
    .map((_, i) => `    <p:sldId id="${256 + i}" r:id="rIdSlide${i + 1}"/>`)
    .join('\n');

  ppt?.file(
    'presentation.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rIdMaster1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
${sldIdLst}
  </p:sldIdLst>
  <p:sldSz cx="${cx}" cy="${cy}" type="${aspectRatio === '16:9' ? 'screen16x9' : 'screen4x3'}"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`
  );

  ppt?.folder('slideMasters')?.folder('_rels')?.file(
    'slideMaster1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdLayout1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`
  );

  ppt?.folder('slideMasters')?.file(
    'slideMaster1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rIdLayout1"/></p:sldLayoutIdLst>
</p:sldMaster>`
  );

  ppt?.folder('slideLayouts')?.folder('_rels')?.file(
    'slideLayout1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdMaster1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`
  );

  ppt?.folder('slideLayouts')?.file(
    'slideLayout1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
</p:sldLayout>`
  );

  const slidesFolder = ppt?.folder('slides');
  const slidesRelsFolder = slidesFolder?.folder('_rels');
  const mediaFolder = ppt?.folder('media');

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const slideIdx = i + 1;
    const previewUrl = s.previewDataUrl || '';
    const isPng = previewUrl.startsWith('data:image/png');
    const imgExt = isPng ? 'png' : 'jpeg';
    const imgFileName = `slide_img_${slideIdx}.${imgExt}`;

    if (previewUrl) {
      const imgBytes = dataUrlToUint8Array(previewUrl);
      mediaFolder?.file(imgFileName, imgBytes);
    }

    slidesRelsFolder?.file(
      `slide${slideIdx}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdLayout1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rIdImg1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${imgFileName}"/>
</Relationships>`
    );

    const bulletParagraphs = (s.bullets.length > 0 ? s.bullets : [s.speakerNotes || s.title])
      .slice(0, 12)
      .map(
        (bText) =>
          `<a:p><a:r><a:rPr lang="en-US" sz="1600" dirty="0"/><a:t>${escapeXml(
            bText
          )}</a:t></a:r></a:p>`
      )
      .join('');

    const picXml =
      mode === 'visual_slide_with_notes'
        ? `<p:pic>
            <p:nvPicPr>
              <p:cNvPr id="2" name="SlideImage${slideIdx}"/>
              <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>
              <p:nvPr/>
            </p:nvPicPr>
            <p:blipFill>
              <a:blip r:embed="rIdImg1"/>
              <a:stretch><a:fillRect/></a:stretch>
            </p:blipFill>
            <p:spPr>
              <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
              <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            </p:spPr>
          </p:pic>`
        : `<p:sp>
            <p:nvSpPr>
              <p:cNvPr id="3" name="TitleBox${slideIdx}"/>
              <p:cNvSpPr txBox="1"/>
              <p:nvPr/>
            </p:nvSpPr>
            <p:spPr>
              <a:xfrm><a:off x="609600" y="457200"/><a:ext cx="${cx - 1219200}" cy="914400"/></a:xfrm>
              <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            </p:spPr>
            <p:txBody>
              <a:bodyPr wrap="square"/>
              <a:lstStyle/>
              <a:p><a:r><a:rPr lang="en-US" sz="2800" b="1"/><a:t>${escapeXml(
                s.title
              )}</a:t></a:r></a:p>
            </p:txBody>
          </p:sp>
          <p:sp>
            <p:nvSpPr>
              <p:cNvPr id="4" name="ContentBox${slideIdx}"/>
              <p:cNvSpPr txBox="1"/>
              <p:nvPr/>
            </p:nvSpPr>
            <p:spPr>
              <a:xfrm><a:off x="609600" y="1524000"/><a:ext cx="${cx - 1219200}" cy="${cy - 2133600}"/></a:xfrm>
              <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            </p:spPr>
            <p:txBody>
              <a:bodyPr wrap="square"/>
              <a:lstStyle/>
              ${bulletParagraphs}
            </p:txBody>
          </p:sp>`;

    slidesFolder?.file(
      `slide${slideIdx}.xml`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      ${picXml}
    </p:spTree>
  </p:cSld>
</p:sld>`
    );
  }

  return await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

/**
 * Converts a PDF byte buffer into a PowerPoint (.pptx) presentation deck.
 */
export async function convertPdfToPpt(
  pdfBytes: Uint8Array,
  originalFileName = 'presentation.pdf',
  options: {
    aspectRatio?: PptAspectRatio;
    mode?: PptSlideMode;
    dpi?: 72 | 150 | 300;
    pageRange?: string;
  } = {}
): Promise<PdfToPptResult> {
  const aspectRatio = options.aspectRatio || '16:9';
  const mode = options.mode || 'visual_slide_with_notes';
  const dpi = options.dpi || 150;

  const allPages = await extractPdfPages(pdfBytes);
  const selectedNums = parsePdfPageRangeString(options.pageRange || 'all', allPages.length);
  const selectedSet = new Set(selectedNums);
  const filteredPages = allPages.filter((p) => selectedSet.has(p.pageNumber));

  const slides: ReconstructedSlideItem[] = [];

  for (let i = 0; i < filteredPages.length; i++) {
    const p = filteredPages[i];
    const rendered = await renderPdfPageToDataUrl(pdfBytes, p.pageNumber, {
      dpi,
      format: 'image/jpeg',
      quality: 0.9,
    });

    const nonEmptyLines = p.lines.map((l) => l.text.trim()).filter(Boolean);
    const title = nonEmptyLines[0] || `Slide ${i + 1} (Page ${p.pageNumber})`;
    const bullets = nonEmptyLines.slice(1, 12);

    slides.push({
      slideNumber: i + 1,
      pageNumber: p.pageNumber,
      title,
      bullets,
      speakerNotes: p.rawText,
      previewDataUrl: rendered.dataUrl,
    });
  }

  const pptxBytes = await buildPptxArchive(slides, aspectRatio, mode);
  const pptxBlob = new Blob([pptxBytes as unknown as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
  const baseName = originalFileName.replace(/\.pdf$/i, '') || 'presentation';

  return {
    fileName: `${baseName}.pptx`,
    slideCount: slides.length,
    aspectRatio,
    slides,
    pptxBytes,
    pptxBlob,
  };
}


export const SLIDE_DIMENSIONS_EMU: Record<PptAspectRatio, { cx: number; cy: number }> = {
  '16:9': { cx: 12192000, cy: 6858000 },
  '4:3': { cx: 9144000, cy: 6858000 },
};
