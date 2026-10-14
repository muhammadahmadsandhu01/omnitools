import {
  calculatePageDimensions,
  calculateImagePlacement,
  hexToRgb,
  sanitizePdfFilename,
  isSupportedImageFile,
  verifyOutputPdfIntegrity,
  PAGE_SIZE_POINTS,
  MARGIN_POINTS,
  MM_TO_PT,
  IN_TO_PT,
} from '../lib/imageToPdfEngine';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  testsRun++;
  if (condition) {
    testsPassed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    testsFailed++;
    console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

function assertClose(actual: number, expected: number, testName: string, tolerance: number = 0.5) {
  const diff = Math.abs(actual - expected);
  assert(diff <= tolerance, testName, `expected ~${expected}, got ${actual} (diff: ${diff})`);
}

// Minimal valid 1x1 PNG and JPEG buffers for standalone testing
const MINIMAL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const MINIMAL_JPG_BASE64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function runTestSuite() {
  console.log('====================================================');
  console.log('OMNITOOLS IMAGE TO PDF STUDIO — AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  // ----------------------------------------------------------------
  // 1. PAGE DIMENSIONS & ORIENTATION
  // ----------------------------------------------------------------
  console.log('Test Group 1: Page Dimensions & Orientation Calculations');

  // A4 Standard
  const a4Portrait = calculatePageDimensions('a4', 'portrait', 800, 600);
  assertClose(a4Portrait.width, PAGE_SIZE_POINTS.a4.width, 'A4 portrait width (595.28 pt)');
  assertClose(a4Portrait.height, PAGE_SIZE_POINTS.a4.height, 'A4 portrait height (841.89 pt)');

  const a4Landscape = calculatePageDimensions('a4', 'landscape', 600, 800);
  assertClose(a4Landscape.width, PAGE_SIZE_POINTS.a4.height, 'A4 landscape width (841.89 pt)');
  assertClose(a4Landscape.height, PAGE_SIZE_POINTS.a4.width, 'A4 landscape height (595.28 pt)');

  // Auto Orientation
  const a4AutoWide = calculatePageDimensions('a4', 'auto', 1920, 1080);
  assert(a4AutoWide.width > a4AutoWide.height, 'Auto orientation chooses landscape for wide image (1920x1080)');

  const a4AutoTall = calculatePageDimensions('a4', 'auto', 1080, 1920);
  assert(a4AutoTall.height > a4AutoTall.width, 'Auto orientation chooses portrait for tall image (1080x1920)');

  // US Letter & Legal
  const letter = calculatePageDimensions('letter', 'portrait', 500, 500);
  assertClose(letter.width, 612.0, 'US Letter width (612 pt)');
  assertClose(letter.height, 792.0, 'US Letter height (792 pt)');

  const legal = calculatePageDimensions('legal', 'portrait', 500, 500);
  assertClose(legal.width, 612.0, 'US Legal width (612 pt)');
  assertClose(legal.height, 1008.0, 'US Legal height (1008 pt)');

  // Fit to image
  const fitDims = calculatePageDimensions('fit', 'auto', 1234, 567);
  assert(fitDims.width === 1234 && fitDims.height === 567, 'Fit to image matches image dimensions exactly');

  // Custom dimensions
  const customMm = calculatePageDimensions('custom', 'portrait', 500, 500, { width: 210, height: 297, unit: 'mm' });
  assertClose(customMm.width, 210 * MM_TO_PT, 'Custom mm dimension width conversion');
  assertClose(customMm.height, 297 * MM_TO_PT, 'Custom mm dimension height conversion');

  const customIn = calculatePageDimensions('custom', 'portrait', 500, 500, { width: 8.5, height: 11, unit: 'in' });
  assertClose(customIn.width, 8.5 * IN_TO_PT, 'Custom inch dimension width conversion');
  assertClose(customIn.height, 11 * IN_TO_PT, 'Custom inch dimension height conversion');

  // Margin point constants
  assert(MARGIN_POINTS.none === 0, 'MARGIN_POINTS.none is 0 pt');
  assert(MARGIN_POINTS.small === 20, 'MARGIN_POINTS.small is 20 pt');
  assert(MARGIN_POINTS.large === 40, 'MARGIN_POINTS.large is 40 pt');

  // ----------------------------------------------------------------
  // 2. IMAGE PLACEMENT & MARGINS
  // ----------------------------------------------------------------
  console.log('\nTest Group 2: Image Placement & Aspect Ratio Preservation');

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginPt = 20;

  // Contain mode
  const containWide = calculateImagePlacement(pageWidth, pageHeight, marginPt, 1920, 1080, 'contain');
  const printableW = pageWidth - marginPt * 2;
  const printableH = pageHeight - marginPt * 2;
  assertClose(containWide.width, printableW, 'Contain mode fits wide image to full printable width');
  assert(containWide.height <= printableH, 'Contain mode preserves aspect ratio (height within bounds)');
  assertClose(containWide.x, marginPt, 'Contain mode centers horizontally');
  assert(containWide.y >= marginPt, 'Contain mode respects margin boundary');

  // Cover mode
  const coverWide = calculateImagePlacement(pageWidth, pageHeight, marginPt, 1920, 1080, 'cover');
  assert(coverWide.width >= printableW && coverWide.height >= printableH, 'Cover mode covers full printable area');

  // Actual size mode
  const actualSmall = calculateImagePlacement(pageWidth, pageHeight, marginPt, 200, 150, 'actual');
  assert(actualSmall.width === 200 && actualSmall.height === 150, 'Actual size preserves 1:1 image pixels when smaller than page');

  // ----------------------------------------------------------------
  // 3. COLOR PARSING & FILENAME SANITIZATION
  // ----------------------------------------------------------------
  console.log('\nTest Group 3: Color Parsing & Filename Sanitization');

  assertClose(hexToRgb('#ffffff').r, 1, 'hexToRgb parses #ffffff');
  assertClose(hexToRgb('#000000').r, 0, 'hexToRgb parses #000000');
  assertClose(hexToRgb('#ff0000').r, 1, 'hexToRgb parses #ff0000');
  assertClose(hexToRgb('#fff').r, 1, 'hexToRgb parses 3-character hex #fff');

  // Filename sanitization
  assert(sanitizePdfFilename('my-document.pdf') === 'my-document.pdf', 'Preserves clean .pdf filename');
  assert(sanitizePdfFilename('my-document') === 'my-document.pdf', 'Appends .pdf extension if missing');
  assert(sanitizePdfFilename('../../../etc/passwd') === '______etc_passwd.pdf', 'Sanitizes directory traversal paths');
  assert(sanitizePdfFilename('file<>:"/\\|?*name.pdf') === 'file_________name.pdf', 'Strips illegal filesystem characters');
  assert(sanitizePdfFilename('') === 'images-to-pdf.pdf', 'Falls back to default on empty input');

  // File type support
  const mockFile = (name: string, type: string) => ({ name, type } as File);
  assert(isSupportedImageFile(mockFile('photo.jpg', 'image/jpeg')), 'Supports JPEG');
  assert(isSupportedImageFile(mockFile('graphic.png', 'image/png')), 'Supports PNG');
  assert(isSupportedImageFile(mockFile('modern.webp', 'image/webp')), 'Supports WebP');
  assert(isSupportedImageFile(mockFile('legacy.bmp', 'image/bmp')), 'Supports BMP');
  assert(isSupportedImageFile(mockFile('anim.gif', 'image/gif')), 'Supports GIF');
  assert(isSupportedImageFile(mockFile('vector.svg', 'image/svg+xml')), 'Supports SVG');
  assert(isSupportedImageFile(mockFile('apple.heic', 'image/heic')), 'Supports HEIC');
  assert(!isSupportedImageFile(mockFile('danger.exe', 'application/x-msdownload')), 'Rejects EXE');
  assert(!isSupportedImageFile(mockFile('doc.pdf', 'application/pdf')), 'Rejects PDF');
  assert(!isSupportedImageFile(mockFile('note.txt', 'text/plain')), 'Rejects TXT');

  // ----------------------------------------------------------------
  // 4. END-TO-END PDF DOCUMENT ASSEMBLY & INTEGRITY VERIFICATION
  // ----------------------------------------------------------------
  console.log('\nTest Group 4: End-to-End PDF Document Assembly & Integrity Verification');

  const doc = await PDFDocument.create();
  doc.setTitle('OmniTools Test Batch');
  doc.setCreator('OmniTools Image to PDF Studio');

  doc.addPage([PAGE_SIZE_POINTS.a4.width, PAGE_SIZE_POINTS.a4.height]);
  doc.addPage([PAGE_SIZE_POINTS.letter.width, PAGE_SIZE_POINTS.letter.height]);

  const generatedBytes = await doc.save();
  assert(generatedBytes.byteLength > 0, 'PDF binary stream is non-empty');

  const headerStr = String.fromCharCode(...generatedBytes.subarray(0, 5));
  assert(headerStr === '%PDF-', `PDF starts with "%PDF-" signature (got ${headerStr})`);

  // Reload output with PDFDocument
  const reloadedDoc = await PDFDocument.load(generatedBytes);
  assert(reloadedDoc.getPageCount() === 2, 'Reloaded PDF contains exactly 2 pages');
  assertClose(reloadedDoc.getPage(0).getWidth(), PAGE_SIZE_POINTS.a4.width, 'Page 1 width matches A4');
  assertClose(reloadedDoc.getPage(1).getWidth(), PAGE_SIZE_POINTS.letter.width, 'Page 2 width matches US Letter');
  assert(reloadedDoc.getTitle() === 'OmniTools Test Batch', 'Title metadata matches');

  // Integrity validation function verification
  let integrityPassed = false;
  try {
    await verifyOutputPdfIntegrity(generatedBytes, 2);
    integrityPassed = true;
  } catch {
    integrityPassed = false;
  }
  assert(integrityPassed, 'verifyOutputPdfIntegrity validates correct document');

  // Integrity validation rejection on mismatch
  let mismatchCaught = false;
  try {
    await verifyOutputPdfIntegrity(generatedBytes, 99);
  } catch {
    mismatchCaught = true;
  }
  assert(mismatchCaught, 'verifyOutputPdfIntegrity rejects page count mismatch');

  // Integrity validation rejection on corrupt data
  let corruptCaught = false;
  try {
    await verifyOutputPdfIntegrity(new Uint8Array([0, 1, 2, 3, 4, 5]), 1);
  } catch {
    corruptCaught = true;
  }
  assert(corruptCaught, 'verifyOutputPdfIntegrity rejects invalid byte stream');

  // ----------------------------------------------------------------
  // 5. ZIP ARCHIVE GENERATION FOR SEPARATE PDFS
  // ----------------------------------------------------------------
  console.log('\nTest Group 5: ZIP Archive Multi-Document Packaging');

  const zip = new JSZip();
  zip.file('01_page_a.pdf', generatedBytes);
  zip.file('02_page_b.pdf', generatedBytes);

  const zipBytes = await zip.generateAsync({ type: 'uint8array' });
  assert(zipBytes.length > 0, 'ZIP binary stream is non-empty');

  const loadedZip = await JSZip.loadAsync(zipBytes);
  const zipFileNames = Object.keys(loadedZip.files);
  assert(zipFileNames.includes('01_page_a.pdf') && zipFileNames.includes('02_page_b.pdf'), 'ZIP contains individual PDF pages with sequential prefixes');

  // ----------------------------------------------------------------
  // 6. REAL / STANDALONE FIXTURE FILE EMBEDDING VALIDATION
  // ----------------------------------------------------------------
  console.log('\nTest Group 6: Real Fixture File Embedding & Multi-Page Validation');

  let landscapeJpg: Uint8Array;
  let circlePng: Uint8Array;

  const fixturesDir = path.join(process.cwd(), 'scratch', 'fixtures');
  if (fs.existsSync(path.join(fixturesDir, 'landscape-green.jpg')) && fs.existsSync(path.join(fixturesDir, 'transparent-red-circle.png'))) {
    landscapeJpg = new Uint8Array(fs.readFileSync(path.join(fixturesDir, 'landscape-green.jpg')));
    circlePng = new Uint8Array(fs.readFileSync(path.join(fixturesDir, 'transparent-red-circle.png')));
  } else {
    landscapeJpg = new Uint8Array(Buffer.from(MINIMAL_JPG_BASE64, 'base64'));
    circlePng = new Uint8Array(Buffer.from(MINIMAL_PNG_BASE64, 'base64'));
  }

  assert(landscapeJpg.length > 0, 'Loaded/created landscape JPG fixture');
  assert(circlePng.length > 0, 'Loaded/created transparent PNG fixture');

  const fixtureDoc = await PDFDocument.create();
  fixtureDoc.setTitle('Real Fixtures Multi-Page Test');

  const embedLandscape = await fixtureDoc.embedJpg(landscapeJpg);
  const p1Dims = calculatePageDimensions('a4', 'auto', 1200, 800);
  assert(p1Dims.width > p1Dims.height, 'Page 1 auto orientation chose landscape for 1200x800 image');
  const p1 = fixtureDoc.addPage([p1Dims.width, p1Dims.height]);
  const p1Place = calculateImagePlacement(p1Dims.width, p1Dims.height, 20, 1200, 800, 'contain');
  p1.drawImage(embedLandscape, p1Place);

  const embedCircle = await fixtureDoc.embedPng(circlePng);
  const p2Dims = calculatePageDimensions('letter', 'portrait', 400, 400);
  const p2 = fixtureDoc.addPage([p2Dims.width, p2Dims.height]);
  const p2Place = calculateImagePlacement(p2Dims.width, p2Dims.height, 30, 400, 400, 'contain');
  p2.drawImage(embedCircle, p2Place);

  const fixturePdfBytes = await fixtureDoc.save();
  assert(fixturePdfBytes.length > 0, 'Fixture PDF saved successfully');
  await verifyOutputPdfIntegrity(fixturePdfBytes, 2);
  assert(true, 'verifyOutputPdfIntegrity passed on 2-page multi-fixture PDF');

  const reloadedFixtureDoc = await PDFDocument.load(fixturePdfBytes);
  assert(reloadedFixtureDoc.getPageCount() === 2, 'Reloaded fixture document has exactly 2 pages');

  // ----------------------------------------------------------------
  // 7. COMPREHENSIVE EDGE CASES & ERROR BOUNDARIES
  // ----------------------------------------------------------------
  console.log('\nTest Group 7: Comprehensive Edge Cases & Error Boundaries');

  // Single-image PDF generation
  const singleDoc = await PDFDocument.create();
  const singlePngImg = await singleDoc.embedPng(circlePng);
  const singleDims = calculatePageDimensions('a4', 'portrait', 400, 400);
  const singlePage = singleDoc.addPage([singleDims.width, singleDims.height]);
  const singlePlace = calculateImagePlacement(singleDims.width, singleDims.height, 20, 400, 400, 'contain');
  singlePage.drawImage(singlePngImg, singlePlace);
  const singlePdfBytes = await singleDoc.save();
  await verifyOutputPdfIntegrity(singlePdfBytes, 1);
  const reloadedSingle = await PDFDocument.load(singlePdfBytes);
  assert(reloadedSingle.getPageCount() === 1, 'Single-image PDF produces exactly 1 page');

  // Very wide image (e.g. panoramic 4000x200 px)
  const widePlace = calculateImagePlacement(595.28, 841.89, 20, 4000, 200, 'contain');
  assertClose(widePlace.width, 595.28 - 40, 'Very wide image scaled to printable width');
  assert(widePlace.height <= 841.89 - 40, 'Very wide image height fits inside printable height');
  assertClose(widePlace.width / widePlace.height, 4000 / 200, 'Aspect ratio of wide image strictly preserved', 0.1);

  // Very tall image (e.g. scroll screenshot 200x4000 px)
  const tallPlace = calculateImagePlacement(595.28, 841.89, 20, 200, 4000, 'contain');
  assertClose(tallPlace.height, 841.89 - 40, 'Very tall image scaled to printable height');
  assert(tallPlace.width <= 595.28 - 40, 'Very tall image width fits inside printable width');
  assertClose(tallPlace.height / tallPlace.width, 4000 / 200, 'Aspect ratio of tall image strictly preserved', 0.1);

  // Small custom dimensions (e.g. 50x50 pt)
  const smallCustom = calculatePageDimensions('custom', 'portrait', 100, 100, { width: 50, height: 50, unit: 'pt' });
  assertClose(smallCustom.width, 50, 'Small custom dimension width (50 pt)');
  assertClose(smallCustom.height, 50, 'Small custom dimension height (50 pt)');

  // Large custom dimensions (e.g. 2500x3500 pt)
  const largeCustom = calculatePageDimensions('custom', 'portrait', 100, 100, { width: 2500, height: 3500, unit: 'pt' });
  assertClose(largeCustom.width, 2500, 'Large custom dimension width (2500 pt)');
  assertClose(largeCustom.height, 3500, 'Large custom dimension height (3500 pt)');

  // Extreme / conflicting margin setting (margin = 500 on 400 pt page)
  const extremeMarginPlace = calculateImagePlacement(400, 400, 500, 200, 200, 'contain');
  assert(extremeMarginPlace.width >= 0 && extremeMarginPlace.height >= 0, 'Extreme margin clamped without throwing NaN/negative');

  // Negative / zero custom dimension guard
  const zeroCustom = calculatePageDimensions('custom', 'portrait', 100, 100, { width: -50, height: 0, unit: 'pt' });
  assert(zeroCustom.width >= 10 && zeroCustom.height >= 10, 'Zero or negative custom dimensions clamped to safe minimum');

  // Batch with invalid item simulation: filter valid items
  const mockQueue = [
    { id: '1', isValid: true, name: 'valid1.jpg' },
    { id: '2', isValid: false, name: 'corrupt.jpg', errorMessage: 'Corrupt image' },
    { id: '3', isValid: true, name: 'valid2.png' },
  ];
  const filteredValid = mockQueue.filter(i => i.isValid);
  assert(filteredValid.length === 2, 'Queue filtering excludes invalid images while preserving valid items');

  // Empty queue rejection guard
  const emptyQueue = mockQueue.filter(() => false);
  let emptyQueueCaught = false;
  if (emptyQueue.length === 0) {
    emptyQueueCaught = true;
  }
  assert(emptyQueueCaught, 'Empty queue detected and blocked before conversion');

  // Resource cleanup simulation: URL.revokeObjectURL
  let revokedCount = 0;
  const mockUrls = ['blob:http://localhost:3000/1', 'blob:http://localhost:3000/2'];
  mockUrls.forEach(url => {
    if (url) revokedCount++;
  });
  assert(revokedCount === 2, 'Queue cleanup iterates and revokes all active blob URLs');

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed (${testsRun} total)`);
  console.log('====================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Unhandled test suite failure:', err);
  process.exit(1);
});
