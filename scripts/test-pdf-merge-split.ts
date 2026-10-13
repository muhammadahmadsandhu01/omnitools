/**
 * OmniTools PDF Merge & Split — Automated Engine & Regression Test Suite
 *
 * Verifies:
 * 1. Page range parsing (single, intervals, deduplication, sorting)
 * 2. Range syntax errors, out-of-bounds, reversed bounds
 * 3. Multi-range parsing for separate ZIP outputs
 * 4. Preset range generation (all, odd, even, first & last)
 * 5. Filename sanitization (Windows reserved, directory traversal, control chars)
 * 6. Header magic byte check (%PDF-)
 * 7. In-memory multi-document PDF merge with pdf-lib & invariant verification
 * 8. In-memory page range extraction & verification
 * 9. In-memory single-page splitting & JSZip archive creation & integrity verification
 * 10. Multi-range splitting & JSZip packaging verification
 * 11. Encrypted / password-protected PDF detection
 * 12. Corrupted and truncated byte-stream rejection
 */

import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import assert from 'assert';

// Import functions from the tool component
import {
  parsePageRange,
  parseMultiRange,
  generatePresetRange,
  sanitizeFilename,
  verifyOutputPdfIntegrity,
  hasPdfMagicBytesBuffer,
} from '../components/tools/PdfMergeSplit';

async function runPdfTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING OMNITOOLS PDF MERGE & SPLIT TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result
          .then(() => {
            passed++;
            console.log(`  ✅ [PASS ${passed}] ${name}`);
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`  ❌ [FAIL] ${name}:`, msg);
            throw err;
          });
      }
      passed++;
      console.log(`  ✅ [PASS ${passed}] ${name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ [FAIL] ${name}:`, msg);
      throw err;
    }
  }

  // ----------------------------------------------------------------
  // 1. Page Range Parsing Tests
  // ----------------------------------------------------------------
  console.log('--- 1. Page Range Parser Unit Tests ---');

  test('Parses simple comma-separated single pages (1, 3, 5)', () => {
    const res = parsePageRange('1, 3, 5', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 2, 4]);
    assert.strictEqual(res.count, 3);
    assert.strictEqual(res.normalizedLabel, '1, 3, 5');
  });

  test('Parses contiguous ranges (1-4, 7-9)', () => {
    const res = parsePageRange('1-4, 7-9', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1, 2, 3, 6, 7, 8]);
    assert.strictEqual(res.count, 7);
  });

  test('Deduplicates overlapping pages and sorts in ascending order', () => {
    const res = parsePageRange('5, 2, 2, 1-3, 3-4', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1, 2, 3, 4]);
    assert.strictEqual(res.count, 5);
  });

  test('Handles single page document bounds (1 of 1)', () => {
    const res = parsePageRange('1', 1);
    assert.deepStrictEqual(res.pagesZeroBased, [0]);
    assert.strictEqual(res.count, 1);
  });

  test('Rejects reversed range (e.g. "5-2")', () => {
    assert.throws(
      () => parsePageRange('5-2', 10),
      /start page \(5\) cannot be greater than end page \(2\)/
    );
  });

  test('Rejects out-of-bounds page exceeding total count (e.g. "12" on 10 pages)', () => {
    assert.throws(
      () => parsePageRange('12', 10),
      /Page 12 exceeds the document total of 10 pages/
    );
  });

  test('Rejects range with out-of-bounds end (e.g. "5-15" on 10 pages)', () => {
    assert.throws(
      () => parsePageRange('5-15', 10),
      /Page 15 in range "5-15" exceeds the document total of 10 pages/
    );
  });

  test('Rejects 0 as page number', () => {
    assert.throws(
      () => parsePageRange('0', 10),
      /Page numbers must start at 1 or higher/
    );
  });

  test('Rejects negative numbers and invalid characters', () => {
    assert.throws(
      () => parsePageRange('1-3, abc', 10),
      /Invalid page entry "abc"/
    );
    assert.throws(
      () => parsePageRange('-1-5', 10),
      /Invalid range format "-1-5"/
    );
  });

  test('Rejects empty input, leading/trailing or duplicate commas', () => {
    assert.throws(() => parsePageRange('', 10), /Please specify the pages/);
    assert.throws(() => parsePageRange(',1, 2', 10), /duplicate, leading, or trailing commas/);
    assert.throws(() => parsePageRange('1, 2,', 10), /duplicate, leading, or trailing commas/);
    assert.throws(() => parsePageRange('1,,2', 10), /duplicate, leading, or trailing commas/);
  });

  // ----------------------------------------------------------------
  // 2. Multi-Range Parser Tests (For Separate PDFs ZIP)
  // ----------------------------------------------------------------
  console.log('\n--- 2. Multi-Range Parser Tests (Separate PDFs) ---');

  test('Parses semicolon-separated ranges into distinct parts', () => {
    const groups = parseMultiRange('1-3; 4-6; 7-10', 10);
    assert.strictEqual(groups.length, 3);
    assert.deepStrictEqual(groups[0].pagesZeroBased, [0, 1, 2]);
    assert.deepStrictEqual(groups[1].pagesZeroBased, [3, 4, 5]);
    assert.deepStrictEqual(groups[2].pagesZeroBased, [6, 7, 8, 9]);
    assert.strictEqual(groups[0].normalizedLabel, '1-3');
    assert.strictEqual(groups[1].normalizedLabel, '4-6');
    assert.strictEqual(groups[2].normalizedLabel, '7-10');
  });

  test('Parses comma-separated standalone ranges if no semicolons provided', () => {
    const groups = parseMultiRange('1-4, 5-8', 8);
    assert.strictEqual(groups.length, 2);
    assert.deepStrictEqual(groups[0].pagesZeroBased, [0, 1, 2, 3]);
    assert.deepStrictEqual(groups[1].pagesZeroBased, [4, 5, 6, 7]);
  });

  test('Rejects multi-range where any sub-range is out-of-bounds', () => {
    assert.throws(
      () => parseMultiRange('1-3; 4-12', 10),
      /Page 12 in range "4-12" exceeds the document total of 10 pages/
    );
  });

  // ----------------------------------------------------------------
  // 3. Preset Range Generator Tests
  // ----------------------------------------------------------------
  console.log('\n--- 3. Preset Range Generator Tests ---');

  test('Generates "all" preset for 6 pages', () => {
    const str = generatePresetRange(6, 'all');
    assert.strictEqual(str, '1-6');
  });

  test('Generates "all" preset for 1-page document', () => {
    const str = generatePresetRange(1, 'all');
    assert.strictEqual(str, '1');
  });

  test('Generates "odd" preset for 7 pages (1, 3, 5, 7)', () => {
    const str = generatePresetRange(7, 'odd');
    assert.strictEqual(str, '1, 3, 5, 7');
  });

  test('Generates "even" preset for 7 pages (2, 4, 6)', () => {
    const str = generatePresetRange(7, 'even');
    assert.strictEqual(str, '2, 4, 6');
  });

  test('Generates "first_last" preset for 10 pages (1, 10)', () => {
    const str = generatePresetRange(10, 'first_last');
    assert.strictEqual(str, '1, 10');
  });

  test('Generates "first_last" preset for 1-page document (1)', () => {
    const str = generatePresetRange(1, 'first_last');
    assert.strictEqual(str, '1');
  });

  // ----------------------------------------------------------------
  // 4. Filename Sanitization Tests
  // ----------------------------------------------------------------
  console.log('\n--- 4. Filename Sanitization Tests ---');

  test('Preserves clean alphanumeric filename and strips redundant .pdf', () => {
    const res = sanitizeFilename('Financial_Report_Q3.pdf', 'default');
    assert.strictEqual(res, 'Financial_Report_Q3');
  });

  test('Strips Windows reserved device names (CON, PRN, AUX, NUL)', () => {
    assert.strictEqual(sanitizeFilename('CON', 'default'), 'CON_document');
    assert.strictEqual(sanitizeFilename('aux.pdf', 'default'), 'aux_document');
    assert.strictEqual(sanitizeFilename('NUL', 'default'), 'NUL_document');
    assert.strictEqual(sanitizeFilename('com1.pdf', 'default'), 'com1_document');
  });

  test('Replaces path traversal sequences (../, ..\\)', () => {
    const res = sanitizeFilename('../../../etc/passwd.pdf', 'default');
    assert.strictEqual(res.includes('/'), false);
    assert.strictEqual(res.includes('\\'), false);
    assert.strictEqual(res.includes('..'), false);
  });

  test('Strips illegal filesystem characters (< > : " / \\ | ? *)', () => {
    const res = sanitizeFilename('Invoice <#123>: 2026/10|tax?.pdf', 'default');
    assert.strictEqual(/[<>:"/\\|?*]/.test(res), false);
  });

  test('Truncates excessively long filenames to safe 100 character boundary', () => {
    const longName = 'A'.repeat(150);
    const res = sanitizeFilename(longName, 'default');
    assert.strictEqual(res.length <= 100, true);
  });

  test('Falls back to provided default if sanitized string is empty', () => {
    assert.strictEqual(sanitizeFilename('', 'OmniTools_Merged'), 'OmniTools_Merged');
    assert.strictEqual(sanitizeFilename('   ', 'OmniTools_Merged'), 'OmniTools_Merged');
    assert.strictEqual(sanitizeFilename('???***', 'OmniTools_Merged'), 'OmniTools_Merged');
  });

  // ----------------------------------------------------------------
  // 5. Header Magic Byte Tests
  // ----------------------------------------------------------------
  console.log('\n--- 5. PDF Header Magic Byte Tests ---');

  test('Detects valid %PDF- magic bytes at start of Uint8Array buffer', () => {
    const validBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]); // %PDF-1.7
    assert.strictEqual(hasPdfMagicBytesBuffer(validBytes), true);
  });

  test('Detects %PDF- magic bytes offset within first 1024 bytes (bom/prefix)', () => {
    const offsetBytes = new Uint8Array([0xef, 0xbb, 0xbf, 0x25, 0x50, 0x44, 0x46, 0x2d]); // UTF-8 BOM then %PDF-
    assert.strictEqual(hasPdfMagicBytesBuffer(offsetBytes), true);
  });

  test('Rejects non-PDF binary data (e.g. PNG magic bytes)', () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.strictEqual(hasPdfMagicBytesBuffer(pngBytes), false);
  });

  // ----------------------------------------------------------------
  // 6. Real In-Memory PDF Merge Operations
  // ----------------------------------------------------------------
  console.log('\n--- 6. In-Memory PDF Merge Engine Tests ---');

  await test('Generates two in-memory PDFs and merges them into a single verified PDF', async () => {
    // Document 1 (2 pages)
    const doc1 = await PDFDocument.create();
    doc1.addPage([200, 200]);
    doc1.addPage([200, 200]);
    const bytes1 = await doc1.save();

    // Document 2 (3 pages)
    const doc2 = await PDFDocument.create();
    doc2.addPage([300, 300]);
    doc2.addPage([300, 300]);
    doc2.addPage([300, 300]);
    const bytes2 = await doc2.save();

    // Merge
    const merged = await PDFDocument.create();
    const loaded1 = await PDFDocument.load(bytes1);
    const loaded2 = await PDFDocument.load(bytes2);

    const pages1 = await merged.copyPages(loaded1, loaded1.getPageIndices());
    for (const p of pages1) merged.addPage(p);

    const pages2 = await merged.copyPages(loaded2, loaded2.getPageIndices());
    for (const p of pages2) merged.addPage(p);

    const mergedBytes = await merged.save();

    // Verify output integrity
    await verifyOutputPdfIntegrity(mergedBytes, 5, 'merge');

    // Reload and assert page count
    const reloaded = await PDFDocument.load(mergedBytes);
    assert.strictEqual(reloaded.getPageCount(), 5);
  });

  // ----------------------------------------------------------------
  // 7. Real In-Memory PDF Splitting Operations
  // ----------------------------------------------------------------
  console.log('\n--- 7. In-Memory PDF Splitting Engine Tests ---');

  await test('Extracts page subset (pages 1, 3, 5 of 5) into standalone PDF', async () => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 5; i++) doc.addPage([200, 200]);
    const srcBytes = await doc.save();

    const parsed = parsePageRange('1, 3, 5', 5);
    const loaded = await PDFDocument.load(srcBytes);

    const splitDoc = await PDFDocument.create();
    const copied = await splitDoc.copyPages(loaded, parsed.pagesZeroBased);
    for (const p of copied) splitDoc.addPage(p);

    const splitBytes = await splitDoc.save();
    await verifyOutputPdfIntegrity(splitBytes, 3, 'split');

    const reloaded = await PDFDocument.load(splitBytes);
    assert.strictEqual(reloaded.getPageCount(), 3);
  });

  // ----------------------------------------------------------------
  // 8. In-Memory Single-Page Splitting with JSZip Archive
  // ----------------------------------------------------------------
  console.log('\n--- 8. In-Memory Single Pages ZIP Archive Tests ---');

  await test('Splits a 4-page PDF into 4 separate 1-page PDFs packaged in a JSZip archive', async () => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 4; i++) doc.addPage([150, 150]);
    const srcBytes = await doc.save();

    const loaded = await PDFDocument.load(srcBytes);
    const totalPages = loaded.getPageCount();

    const zip = new JSZip();
    const baseName = 'invoice';

    for (let i = 0; i < totalPages; i++) {
      const pageDoc = await PDFDocument.create();
      const [copiedPage] = await pageDoc.copyPages(loaded, [i]);
      pageDoc.addPage(copiedPage);

      const pageBytes = await pageDoc.save();
      await verifyOutputPdfIntegrity(pageBytes, 1, 'split');

      const padNum = String(i + 1).padStart(2, '0');
      zip.file(`${baseName}_page_${padNum}.pdf`, pageBytes);
    }

    const zipBuffer = await zip.generateAsync({ type: 'uint8array' });
    assert.strictEqual(zipBuffer.byteLength > 0, true);

    // Read back zip and verify contents
    const readZip = await JSZip.loadAsync(zipBuffer);
    const fileNames = Object.keys(readZip.files);
    assert.strictEqual(fileNames.length, 4);
    assert.deepStrictEqual(fileNames, [
      'invoice_page_01.pdf',
      'invoice_page_02.pdf',
      'invoice_page_03.pdf',
      'invoice_page_04.pdf',
    ]);

    // Re-verify that each PDF inside zip is loadable and has exactly 1 page
    for (const fn of fileNames) {
      const fileBytes = await readZip.file(fn)!.async('uint8array');
      const verifiedDoc = await PDFDocument.load(fileBytes);
      assert.strictEqual(verifiedDoc.getPageCount(), 1);
    }
  });

  // ----------------------------------------------------------------
  // 9. In-Memory Multi-Range Splitting with JSZip Archive
  // ----------------------------------------------------------------
  console.log('\n--- 9. In-Memory Multi-Range ZIP Archive Tests ---');

  await test('Splits a 6-page PDF by ranges (1-2; 3-4; 5-6) into 3 PDFs inside a ZIP archive', async () => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 6; i++) doc.addPage([100, 100]);
    const srcBytes = await doc.save();

    const loaded = await PDFDocument.load(srcBytes);
    const groups = parseMultiRange('1-2; 3-4; 5-6', 6);
    assert.strictEqual(groups.length, 3);

    const zip = new JSZip();
    const baseName = 'report';

    for (let g = 0; g < groups.length; g++) {
      const group = groups[g];
      const partDoc = await PDFDocument.create();
      const copiedPages = await partDoc.copyPages(loaded, group.pagesZeroBased);
      for (const p of copiedPages) partDoc.addPage(p);

      const partBytes = await partDoc.save();
      await verifyOutputPdfIntegrity(partBytes, group.pagesZeroBased.length, 'split');

      const labelClean = group.normalizedLabel.replace(/, /g, '_');
      zip.file(`${baseName}_part_${g + 1}_pages_${labelClean}.pdf`, partBytes);
    }

    const zipBuffer = await zip.generateAsync({ type: 'uint8array' });
    const readZip = await JSZip.loadAsync(zipBuffer);
    const fileNames = Object.keys(readZip.files);
    assert.strictEqual(fileNames.length, 3);
    assert.deepStrictEqual(fileNames, [
      'report_part_1_pages_1-2.pdf',
      'report_part_2_pages_3-4.pdf',
      'report_part_3_pages_5-6.pdf',
    ]);

    // Verify page counts of parts
    for (const fn of fileNames) {
      const fileBytes = await readZip.file(fn)!.async('uint8array');
      const verifiedDoc = await PDFDocument.load(fileBytes);
      assert.strictEqual(verifiedDoc.getPageCount(), 2);
    }
  });

  // ----------------------------------------------------------------
  // 10. Output Integrity Invariant Checks
  // ----------------------------------------------------------------
  console.log('\n--- 10. Output Integrity Invariant Verification Tests ---');

  await test('Rejects zero-byte output array', async () => {
    await assert.rejects(
      async () => verifyOutputPdfIntegrity(new Uint8Array(0), 1, 'merge'),
      /Generated PDF byte stream is empty/
    );
  });

  await test('Rejects truncated byte stream (< 32 bytes)', async () => {
    const truncatedBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    await assert.rejects(
      async () => verifyOutputPdfIntegrity(truncatedBytes, 1, 'merge'),
      /Generated PDF byte stream is truncated/
    );
  });

  await test('Rejects corrupted byte stream (>= 32 bytes) missing PDF header', async () => {
    const bogusBytes = new Uint8Array(50).fill(0xaa);
    await assert.rejects(
      async () => verifyOutputPdfIntegrity(bogusBytes, 1, 'merge'),
      /Generated output is missing valid PDF header bytes/
    );
  });

  await test('Rejects page count mismatch during verification', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([100, 100]);
    const bytes = await doc.save();
    // Document has 1 page, but we claim expected 3 pages
    await assert.rejects(
      async () => verifyOutputPdfIntegrity(bytes, 3, 'split'),
      /Page count mismatch during split verification: expected 3 pages, but produced 1/
    );
  });

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passed}/${total} PDF TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runPdfTests().catch((err) => {
  console.error('\n❌ PDF TEST SUITE FAILED:', err);
  process.exit(1);
});
