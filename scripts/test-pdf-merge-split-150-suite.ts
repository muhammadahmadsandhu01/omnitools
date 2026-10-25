/**
 * KivaroTools PDF Merge & Split — 175-Point Automated Enterprise Verification Suite
 *
 * Exhaustively tests:
 * 1. Page Range Parsing Invariants & Edge Cases (35 tests)
 * 2. Page Range Syntax & Boundary Rejection (30 tests)
 * 3. Multi-Range Parser for ZIP Splitting (20 tests)
 * 4. Preset Range Generator Tests (20 tests)
 * 5. Filename Sanitization & Filesystem Security (30 tests)
 * 6. Header Magic Byte & Binary Inspection (15 tests)
 * 7. In-Memory PDF Merge, Split, ZIP & Invariant Integration (25 tests)
 */

import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import assert from 'assert';

import {
  parsePageRange,
  parseMultiRange,
  generatePresetRange,
  sanitizeFilename,
  verifyOutputPdfIntegrity,
  hasPdfMagicBytesBuffer,
  formatSize,
  makeId,
  MAX_SINGLE_FILE_BYTES,
  MAX_TOTAL_MERGE_BYTES,
  MAX_MERGE_FILES,
  MIN_PDF_FILE_BYTES,
  WINDOWS_RESERVED_NAMES,
} from '../components/tools/PdfMergeSplit';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runSyncTest(id: string, name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS ${passedTests}] ${id}: ${name}`);
  } catch (err: unknown) {
    failedTests++;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ [FAIL] ${id}: ${name} -> ${msg}`);
  }
}

async function runAsyncTest(id: string, name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  [PASS ${passedTests}] ${id}: ${name}`);
  } catch (err: unknown) {
    failedTests++;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ [FAIL] ${id}: ${name} -> ${msg}`);
  }
}

async function main() {
  console.log('======================================================================');
  console.log('🚀 RUNNING 175-POINT KIVAROTOOLS PDF MERGE & SPLIT VERIFICATION SUITE');
  console.log('======================================================================\n');

  // ==================================================================
  // SECTION 1: PAGE RANGE PARSING INVARIANTS & NORMALIZATION (35 TESTS)
  // ==================================================================
  console.log('--- SECTION 1: Page Range Parsing Invariants (35 Tests) ---');

  runSyncTest('TC-001', 'Parses single page "1" on 1-page document', () => {
    const res = parsePageRange('1', 1);
    assert.deepStrictEqual(res.pagesZeroBased, [0]);
    assert.strictEqual(res.count, 1);
    assert.strictEqual(res.normalizedLabel, '1');
  });

  runSyncTest('TC-002', 'Parses single page "5" on 10-page document', () => {
    const res = parsePageRange('5', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [4]);
    assert.strictEqual(res.count, 1);
    assert.strictEqual(res.normalizedLabel, '5');
  });

  runSyncTest('TC-003', 'Parses last page of document "10" on 10-page document', () => {
    const res = parsePageRange('10', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [9]);
    assert.strictEqual(res.count, 1);
  });

  runSyncTest('TC-004', 'Tolerates surrounding whitespace on single page "  7  "', () => {
    const res = parsePageRange('  7  ', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [6]);
    assert.strictEqual(res.count, 1);
  });

  runSyncTest('TC-005', 'Parses multiple comma-separated single pages "1, 3, 5, 7"', () => {
    const res = parsePageRange('1, 3, 5, 7', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 2, 4, 6]);
    assert.strictEqual(res.count, 4);
    assert.strictEqual(res.normalizedLabel, '1, 3, 5, 7');
  });

  runSyncTest('TC-006', 'Parses contiguous range "1-5" on 10-page document', () => {
    const res = parsePageRange('1-5', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1, 2, 3, 4]);
    assert.strictEqual(res.count, 5);
    assert.strictEqual(res.normalizedLabel, '1, 2, 3, 4, 5');
  });

  runSyncTest('TC-007', 'Parses range with internal spaces " 2 - 4 "', () => {
    const res = parsePageRange(' 2 - 4 ', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [1, 2, 3]);
    assert.strictEqual(res.count, 3);
  });

  runSyncTest('TC-008', 'Parses single-page range "3-3"', () => {
    const res = parsePageRange('3-3', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [2]);
    assert.strictEqual(res.count, 1);
  });

  runSyncTest('TC-009', 'Parses multiple contiguous ranges "1-3, 5-7, 9-10"', () => {
    const res = parsePageRange('1-3, 5-7, 9-10', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1, 2, 4, 5, 6, 8, 9]);
    assert.strictEqual(res.count, 8);
  });

  runSyncTest('TC-010', 'Parses mixed singles and ranges "1, 3-5, 8, 10"', () => {
    const res = parsePageRange('1, 3-5, 8, 10', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 2, 3, 4, 7, 9]);
    assert.strictEqual(res.count, 6);
  });

  runSyncTest('TC-011', 'Automatically deduplicates repeated single pages "2, 2, 2, 4, 4"', () => {
    const res = parsePageRange('2, 2, 2, 4, 4', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [1, 3]);
    assert.strictEqual(res.count, 2);
  });

  runSyncTest('TC-012', 'Deduplicates overlapping intervals "1-4, 3-6"', () => {
    const res = parsePageRange('1-4, 3-6', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1, 2, 3, 4, 5]);
    assert.strictEqual(res.count, 6);
  });

  runSyncTest('TC-013', 'Deduplicates subset intervals "1-10, 3-5, 7"', () => {
    const res = parsePageRange('1-10, 3-5, 7', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.strictEqual(res.count, 10);
  });

  runSyncTest('TC-014', 'Sorts unsorted inputs in ascending order "9, 3, 7, 1"', () => {
    const res = parsePageRange('9, 3, 7, 1', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 2, 6, 8]);
    assert.strictEqual(res.normalizedLabel, '1, 3, 7, 9');
  });

  runSyncTest('TC-015', 'Sorts mixed unsorted ranges and singles "8-10, 2, 5-6, 1"', () => {
    const res = parsePageRange('8-10, 2, 5-6, 1', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1, 4, 5, 7, 8, 9]);
  });

  runSyncTest('TC-016', 'Handles entire document range "1-50" on 50-page document', () => {
    const res = parsePageRange('1-50', 50);
    assert.strictEqual(res.count, 50);
    assert.strictEqual(res.pagesZeroBased[0], 0);
    assert.strictEqual(res.pagesZeroBased[49], 49);
  });

  runSyncTest('TC-017', 'Handles 100-page document single selection "73" on 100 pages', () => {
    const res = parsePageRange('73', 100);
    assert.deepStrictEqual(res.pagesZeroBased, [72]);
  });

  runSyncTest('TC-018', 'Handles large safe integer page numbers within max bounds', () => {
    const res = parsePageRange('5000-5002', 10000);
    assert.deepStrictEqual(res.pagesZeroBased, [4999, 5000, 5001]);
    assert.strictEqual(res.count, 3);
  });

  runSyncTest('TC-019', 'Normalized label preserves exact ascending sorted representation', () => {
    const res = parsePageRange('10, 2, 4-6', 20);
    assert.strictEqual(res.normalizedLabel, '2, 4, 5, 6, 10');
  });

  runSyncTest('TC-020', 'Handles duplicate bounds in mixed list "1-2, 2-3, 3-4"', () => {
    const res = parsePageRange('1-2, 2-3, 3-4', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1, 2, 3]);
    assert.strictEqual(res.count, 4);
  });

  runSyncTest('TC-021', 'Parses all odd pages subset "1, 3, 5, 7, 9" on 10 pages', () => {
    const res = parsePageRange('1, 3, 5, 7, 9', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 2, 4, 6, 8]);
  });

  runSyncTest('TC-022', 'Parses all even pages subset "2, 4, 6, 8, 10" on 10 pages', () => {
    const res = parsePageRange('2, 4, 6, 8, 10', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [1, 3, 5, 7, 9]);
  });

  runSyncTest('TC-023', 'Handles extreme end boundary "9-10" on 10 pages', () => {
    const res = parsePageRange('9-10', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [8, 9]);
  });

  runSyncTest('TC-024', 'Handles extreme start boundary "1-2" on 10 pages', () => {
    const res = parsePageRange('1-2', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1]);
  });

  runSyncTest('TC-025', 'Handles single middle page "5" on 9 pages', () => {
    const res = parsePageRange('5', 9);
    assert.deepStrictEqual(res.pagesZeroBased, [4]);
  });

  runSyncTest('TC-026', 'Handles spaced commas "1 , 2 , 3"', () => {
    const res = parsePageRange('1 , 2 , 3', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1, 2]);
  });

  runSyncTest('TC-027', 'Handles tab indentation in input "\t1-3\t, \t5\t"', () => {
    const res = parsePageRange('\t1-3\t, \t5\t', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1, 2, 4]);
  });

  runSyncTest('TC-028', 'Returns count equal to length of pagesZeroBased', () => {
    const res = parsePageRange('1-4, 7-9', 10);
    assert.strictEqual(res.count, res.pagesZeroBased.length);
  });

  runSyncTest('TC-029', 'Returns pagesZeroBased strictly sorted without duplicates', () => {
    const res = parsePageRange('8, 4, 2, 6, 4, 2, 8', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [1, 3, 5, 7]);
  });

  runSyncTest('TC-030', 'Preserves 0-based indexing invariant: min element is >= 0', () => {
    const res = parsePageRange('1', 5);
    assert.strictEqual(res.pagesZeroBased[0], 0);
  });

  runSyncTest('TC-031', 'Preserves 0-based indexing invariant: max element is < maxPages', () => {
    const res = parsePageRange('5', 5);
    assert.strictEqual(res.pagesZeroBased[0], 4);
  });

  runSyncTest('TC-032', 'Handles adjacent overlapping ranges "1-3, 2-5, 4-7"', () => {
    const res = parsePageRange('1-3, 2-5, 4-7', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1, 2, 3, 4, 5, 6]);
  });

  runSyncTest('TC-033', 'Handles reversed order entry of ranges "5-7, 1-3"', () => {
    const res = parsePageRange('5-7, 1-3', 10);
    assert.deepStrictEqual(res.pagesZeroBased, [0, 1, 2, 4, 5, 6]);
  });

  runSyncTest('TC-034', 'Handles single-item document boundary (page 1 of 1)', () => {
    const res = parsePageRange('1', 1);
    assert.strictEqual(res.pagesZeroBased.length, 1);
    assert.strictEqual(res.pagesZeroBased[0], 0);
  });

  runSyncTest('TC-035', 'Handles single-item document range boundary ("1-1" of 1)', () => {
    const res = parsePageRange('1-1', 1);
    assert.deepStrictEqual(res.pagesZeroBased, [0]);
  });

  // ==================================================================
  // SECTION 2: PAGE RANGE SYNTAX & BOUNDARY REJECTION (30 TESTS)
  // ==================================================================
  console.log('\n--- SECTION 2: Page Range Syntax & Boundary Rejection (30 Tests) ---');

  runSyncTest('TC-036', 'Rejects empty string ""', () => {
    assert.throws(() => parsePageRange('', 10), /Please specify the pages to extract/);
  });

  runSyncTest('TC-037', 'Rejects whitespace-only string "   "', () => {
    assert.throws(() => parsePageRange('   ', 10), /Please specify the pages to extract/);
  });

  runSyncTest('TC-038', 'Rejects reversed range "5-2"', () => {
    assert.throws(() => parsePageRange('5-2', 10), /start page \(5\) cannot be greater than end page \(2\)/);
  });

  runSyncTest('TC-039', 'Rejects reversed range "10-1"', () => {
    assert.throws(() => parsePageRange('10-1', 10), /start page \(10\) cannot be greater than end page \(1\)/);
  });

  runSyncTest('TC-040', 'Rejects reversed range with close bounds "4-3"', () => {
    assert.throws(() => parsePageRange('4-3', 10), /start page \(4\) cannot be greater than end page \(3\)/);
  });

  runSyncTest('TC-041', 'Rejects page 0 as single page', () => {
    assert.throws(() => parsePageRange('0', 10), /Page numbers must start at 1 or higher/);
  });

  runSyncTest('TC-042', 'Rejects page 0 in range "0-5"', () => {
    assert.throws(() => parsePageRange('0-5', 10), /Page numbers must start at 1 or higher/);
  });

  runSyncTest('TC-043', 'Rejects page 0 in comma list "1, 0, 3"', () => {
    assert.throws(() => parsePageRange('1, 0, 3', 10), /Page numbers must start at 1 or higher/);
  });

  runSyncTest('TC-044', 'Rejects negative page "-1"', () => {
    assert.throws(() => parsePageRange('-1', 10), /Invalid (range format|page entry) "-1"/);
  });

  runSyncTest('TC-045', 'Rejects negative range "-1-5"', () => {
    assert.throws(() => parsePageRange('-1-5', 10), /Invalid range format/);
  });

  runSyncTest('TC-046', 'Rejects out-of-bounds single page "11" on 10 pages', () => {
    assert.throws(() => parsePageRange('11', 10), /Page 11 exceeds the document total of 10 pages/);
  });

  runSyncTest('TC-047', 'Rejects out-of-bounds range end "5-15" on 10 pages', () => {
    assert.throws(() => parsePageRange('5-15', 10), /Page 15 in range "5-15" exceeds the document total of 10 pages/);
  });

  runSyncTest('TC-048', 'Rejects out-of-bounds start and end "12-15" on 10 pages', () => {
    assert.throws(() => parsePageRange('12-15', 10), /Page 15 in range "12-15" exceeds the document total of 10 pages/);
  });

  runSyncTest('TC-049', 'Rejects page "2" on 1-page document', () => {
    assert.throws(() => parsePageRange('2', 1), /Page 2 exceeds the document total of 1 page\./);
  });

  runSyncTest('TC-050', 'Rejects leading comma ",1, 2"', () => {
    assert.throws(() => parsePageRange(',1, 2', 10), /remove duplicate, leading, or trailing commas/);
  });

  runSyncTest('TC-051', 'Rejects trailing comma "1, 2,"', () => {
    assert.throws(() => parsePageRange('1, 2,', 10), /remove duplicate, leading, or trailing commas/);
  });

  runSyncTest('TC-052', 'Rejects consecutive commas "1,, 3"', () => {
    assert.throws(() => parsePageRange('1,, 3', 10), /remove duplicate, leading, or trailing commas/);
  });

  runSyncTest('TC-053', 'Rejects consecutive commas with spaces "1, , 3"', () => {
    assert.throws(() => parsePageRange('1, , 3', 10), /remove duplicate, leading, or trailing commas/);
  });

  runSyncTest('TC-054', 'Rejects alphabetic characters "abc"', () => {
    assert.throws(() => parsePageRange('abc', 10), /Invalid page entry "abc"/);
  });

  runSyncTest('TC-055', 'Rejects mixed alphabetic range "1-a"', () => {
    assert.throws(() => parsePageRange('1-a', 10), /Invalid range format "1-a"/);
  });

  runSyncTest('TC-056', 'Rejects decimal floats "1.5"', () => {
    assert.throws(() => parsePageRange('1.5', 10), /Invalid page entry "1\.5"/);
  });

  runSyncTest('TC-057', 'Rejects decimal range "1-3.5"', () => {
    assert.throws(() => parsePageRange('1-3.5', 10), /Invalid range format "1-3\.5"/);
  });

  runSyncTest('TC-058', 'Rejects dangling hyphen "1-"', () => {
    assert.throws(() => parsePageRange('1-', 10), /Invalid range format "1-"/);
  });

  runSyncTest('TC-059', 'Rejects multiple hyphens "1--3"', () => {
    assert.throws(() => parsePageRange('1--3', 10), /Invalid range format "1--3"/);
  });

  runSyncTest('TC-060', 'Rejects triple range format "1-3-5"', () => {
    assert.throws(() => parsePageRange('1-3-5', 10), /Invalid range format "1-3-5"/);
  });

  runSyncTest('TC-061', 'Rejects special symbols "@#$"', () => {
    assert.throws(() => parsePageRange('@#$', 10), /Invalid page entry "@#\$"/);
  });

  runSyncTest('TC-062', 'Rejects non-safe integer string "99999999999999999999"', () => {
    assert.throws(() => parsePageRange('99999999999999999999', 10), /exceeds? safe integer bounds/);
  });

  runSyncTest('TC-063', 'Rejects non-safe integer in range "1-99999999999999999999"', () => {
    assert.throws(() => parsePageRange('1-99999999999999999999', 10), /exceeds? safe integer bounds/);
  });

  runSyncTest('TC-064', 'Rejects maxPages = 0', () => {
    assert.throws(() => parsePageRange('1', 0), /Unable to determine a valid document page count/);
  });

  runSyncTest('TC-065', 'Rejects negative maxPages', () => {
    assert.throws(() => parsePageRange('1', -5), /Unable to determine a valid document page count/);
  });

  // ==================================================================
  // SECTION 3: MULTI-RANGE PARSER FOR ZIP SPLITTING (20 TESTS)
  // ==================================================================
  console.log('\n--- SECTION 3: Multi-Range Parser Tests (20 Tests) ---');

  runSyncTest('TC-066', 'Parses simple semicolon-separated groups "1-3; 4-6"', () => {
    const res = parseMultiRange('1-3; 4-6', 10);
    assert.strictEqual(res.length, 2);
    assert.deepStrictEqual(res[0].pagesZeroBased, [0, 1, 2]);
    assert.deepStrictEqual(res[1].pagesZeroBased, [3, 4, 5]);
    assert.strictEqual(res[0].normalizedLabel, '1-3');
    assert.strictEqual(res[1].normalizedLabel, '4-6');
  });

  runSyncTest('TC-067', 'Parses three groups "1-2; 3-4; 5-6"', () => {
    const res = parseMultiRange('1-2; 3-4; 5-6', 10);
    assert.strictEqual(res.length, 3);
  });

  runSyncTest('TC-068', 'Parses groups with single pages "1; 2-3; 4"', () => {
    const res = parseMultiRange('1; 2-3; 4', 10);
    assert.strictEqual(res.length, 3);
    assert.strictEqual(res[0].normalizedLabel, '1');
    assert.strictEqual(res[1].normalizedLabel, '2-3');
    assert.strictEqual(res[2].normalizedLabel, '4');
  });

  runSyncTest('TC-069', 'Parses mixed comma items inside a group "1, 3; 4-6"', () => {
    const res = parseMultiRange('1, 3; 4-6', 10);
    assert.strictEqual(res.length, 2);
    assert.deepStrictEqual(res[0].pagesZeroBased, [0, 2]);
    assert.deepStrictEqual(res[1].pagesZeroBased, [3, 4, 5]);
  });

  runSyncTest('TC-070', 'Parses comma-separated hyphenated intervals if no semicolons "1-3, 4-6"', () => {
    const res = parseMultiRange('1-3, 4-6', 10);
    assert.strictEqual(res.length, 2);
    assert.strictEqual(res[0].normalizedLabel, '1-3');
    assert.strictEqual(res[1].normalizedLabel, '4-6');
  });

  runSyncTest('TC-071', 'Parses 3 comma-separated hyphenated intervals "1-2, 3-4, 5-6"', () => {
    const res = parseMultiRange('1-2, 3-4, 5-6', 10);
    assert.strictEqual(res.length, 3);
  });

  runSyncTest('TC-072', 'Treats non-interval comma string as single group "1, 3, 5"', () => {
    const res = parseMultiRange('1, 3, 5', 10);
    assert.strictEqual(res.length, 1);
    assert.deepStrictEqual(res[0].pagesZeroBased, [0, 2, 4]);
  });

  runSyncTest('TC-073', 'Tolerates surrounding spaces around semicolons " 1-3 ; 4-6 "', () => {
    const res = parseMultiRange(' 1-3 ; 4-6 ', 10);
    assert.strictEqual(res.length, 2);
  });

  runSyncTest('TC-074', 'Tolerates trailing semicolon "1-5; 6-10;"', () => {
    const res = parseMultiRange('1-5; 6-10;', 10);
    assert.strictEqual(res.length, 2);
  });

  runSyncTest('TC-075', 'Tolerates leading semicolon "; 1-5; 6-10"', () => {
    const res = parseMultiRange('; 1-5; 6-10', 10);
    assert.strictEqual(res.length, 2);
  });

  runSyncTest('TC-076', 'Tolerates consecutive semicolons "1-5;; 6-10"', () => {
    const res = parseMultiRange('1-5;; 6-10', 10);
    assert.strictEqual(res.length, 2);
  });

  runSyncTest('TC-077', 'Correctly calculates count per part', () => {
    const res = parseMultiRange('1-4; 5-10', 10);
    assert.strictEqual(res[0].count, 4);
    assert.strictEqual(res[1].count, 6);
  });

  runSyncTest('TC-078', 'Normalizes contiguous label with hyphen "1-4"', () => {
    const res = parseMultiRange('1-4', 10);
    assert.strictEqual(res[0].normalizedLabel, '1-4');
  });

  runSyncTest('TC-079', 'Normalizes non-contiguous label with hyphens "1-3-5"', () => {
    const res = parseMultiRange('1, 3, 5', 10);
    assert.strictEqual(res[0].normalizedLabel, '1-3-5');
  });

  runSyncTest('TC-080', 'Handles single-part multi-range "1-10"', () => {
    const res = parseMultiRange('1-10', 10);
    assert.strictEqual(res.length, 1);
  });

  runSyncTest('TC-081', 'Rejects empty multi-range string ""', () => {
    assert.throws(() => parseMultiRange('', 10), /Please specify at least one page range/);
  });

  runSyncTest('TC-082', 'Rejects whitespace-only multi-range "   "', () => {
    assert.throws(() => parseMultiRange('   ', 10), /Please specify at least one page range/);
  });

  runSyncTest('TC-083', 'Rejects multi-range if any group is invalid (e.g. reversed "1-3; 5-2")', () => {
    assert.throws(() => parseMultiRange('1-3; 5-2', 10), /start page \(5\) cannot be greater than end page \(2\)/);
  });

  runSyncTest('TC-084', 'Rejects multi-range if any group exceeds maxPages "1-3; 5-15" on 10', () => {
    assert.throws(() => parseMultiRange('1-3; 5-15', 10), /exceeds the document total of 10 pages/);
  });

  runSyncTest('TC-085', 'Rejects string containing only semicolons ";;;"', () => {
    assert.throws(() => parseMultiRange(';;;', 10), /No valid page range parts detected/);
  });

  // ==================================================================
  // SECTION 4: PRESET RANGE GENERATOR TESTS (20 TESTS)
  // ==================================================================
  console.log('\n--- SECTION 4: Preset Range Generator Tests (20 Tests) ---');

  runSyncTest('TC-086', 'Generates "all" preset for 1 page -> "1"', () => {
    assert.strictEqual(generatePresetRange(1, 'all'), '1');
  });

  runSyncTest('TC-087', 'Generates "all" preset for 2 pages -> "1-2"', () => {
    assert.strictEqual(generatePresetRange(2, 'all'), '1-2');
  });

  runSyncTest('TC-088', 'Generates "all" preset for 5 pages -> "1-5"', () => {
    assert.strictEqual(generatePresetRange(5, 'all'), '1-5');
  });

  runSyncTest('TC-089', 'Generates "all" preset for 100 pages -> "1-100"', () => {
    assert.strictEqual(generatePresetRange(100, 'all'), '1-100');
  });

  runSyncTest('TC-090', 'Generates "odd" preset for 1 page -> "1"', () => {
    assert.strictEqual(generatePresetRange(1, 'odd'), '1');
  });

  runSyncTest('TC-091', 'Generates "odd" preset for 2 pages -> "1"', () => {
    assert.strictEqual(generatePresetRange(2, 'odd'), '1');
  });

  runSyncTest('TC-092', 'Generates "odd" preset for 5 pages -> "1, 3, 5"', () => {
    assert.strictEqual(generatePresetRange(5, 'odd'), '1, 3, 5');
  });

  runSyncTest('TC-093', 'Generates "odd" preset for 6 pages -> "1, 3, 5"', () => {
    assert.strictEqual(generatePresetRange(6, 'odd'), '1, 3, 5');
  });

  runSyncTest('TC-094', 'Generates "odd" preset for 7 pages -> "1, 3, 5, 7"', () => {
    assert.strictEqual(generatePresetRange(7, 'odd'), '1, 3, 5, 7');
  });

  runSyncTest('TC-095', 'Generates "even" preset for 1 page -> "" (empty)', () => {
    assert.strictEqual(generatePresetRange(1, 'even'), '');
  });

  runSyncTest('TC-096', 'Generates "even" preset for 2 pages -> "2"', () => {
    assert.strictEqual(generatePresetRange(2, 'even'), '2');
  });

  runSyncTest('TC-097', 'Generates "even" preset for 5 pages -> "2, 4"', () => {
    assert.strictEqual(generatePresetRange(5, 'even'), '2, 4');
  });

  runSyncTest('TC-098', 'Generates "even" preset for 6 pages -> "2, 4, 6"', () => {
    assert.strictEqual(generatePresetRange(6, 'even'), '2, 4, 6');
  });

  runSyncTest('TC-099', 'Generates "first_last" preset for 1 page -> "1"', () => {
    assert.strictEqual(generatePresetRange(1, 'first_last'), '1');
  });

  runSyncTest('TC-100', 'Generates "first_last" preset for 2 pages -> "1, 2"', () => {
    assert.strictEqual(generatePresetRange(2, 'first_last'), '1, 2');
  });

  runSyncTest('TC-101', 'Generates "first_last" preset for 10 pages -> "1, 10"', () => {
    assert.strictEqual(generatePresetRange(10, 'first_last'), '1, 10');
  });

  runSyncTest('TC-102', 'Generates "first_last" preset for 50 pages -> "1, 50"', () => {
    assert.strictEqual(generatePresetRange(50, 'first_last'), '1, 50');
  });

  runSyncTest('TC-103', 'Returns empty string for pageCount 0', () => {
    assert.strictEqual(generatePresetRange(0, 'all'), '');
  });

  runSyncTest('TC-104', 'Returns empty string for negative pageCount', () => {
    assert.strictEqual(generatePresetRange(-5, 'all'), '');
  });

  runSyncTest('TC-105', 'Returns empty string for non-integer pageCount', () => {
    assert.strictEqual(generatePresetRange(3.5, 'all'), '');
  });

  // ==================================================================
  // SECTION 5: FILENAME SANITIZATION & FILESYSTEM SECURITY (30 TESTS)
  // ==================================================================
  console.log('\n--- SECTION 5: Filename Sanitizer & Security Tests (30 Tests) ---');

  runSyncTest('TC-106', 'Preserves clean alphanumeric filename "Annual_Report_2026"', () => {
    assert.strictEqual(sanitizeFilename('Annual_Report_2026', 'fallback'), 'Annual_Report_2026');
  });

  runSyncTest('TC-107', 'Strips redundant .pdf lowercase extension "MyDocument.pdf"', () => {
    assert.strictEqual(sanitizeFilename('MyDocument.pdf', 'fallback'), 'MyDocument');
  });

  runSyncTest('TC-108', 'Strips redundant .PDF uppercase extension "Statement.PDF"', () => {
    assert.strictEqual(sanitizeFilename('Statement.PDF', 'fallback'), 'Statement');
  });

  runSyncTest('TC-109', 'Strips redundant .zip lowercase extension "Archive.zip"', () => {
    assert.strictEqual(sanitizeFilename('Archive.zip', 'fallback'), 'Archive');
  });

  runSyncTest('TC-110', 'Strips redundant .ZIP uppercase extension "Bundle.ZIP"', () => {
    assert.strictEqual(sanitizeFilename('Bundle.ZIP', 'fallback'), 'Bundle');
  });

  runSyncTest('TC-111', 'Neutralizes Unix directory traversal "../../etc/passwd"', () => {
    const res = sanitizeFilename('../../etc/passwd', 'fallback');
    assert(!res.includes('/'));
    assert(!res.includes('..'));
    assert.strictEqual(res, '_etc_passwd');
  });

  runSyncTest('TC-112', 'Neutralizes Windows directory traversal "..\\..\\Windows\\System32"', () => {
    const res = sanitizeFilename('..\\..\\Windows\\System32', 'fallback');
    assert(!res.includes('\\'));
    assert(!res.includes('..'));
    assert.strictEqual(res, '_Windows_System32');
  });

  runSyncTest('TC-113', 'Neutralizes triple-dot traversal ".../.../doc"', () => {
    const res = sanitizeFilename('.../.../doc', 'fallback');
    assert(!res.includes('/'));
    assert(!res.includes('..'));
  });

  runSyncTest('TC-114', 'Strips Windows reserved name "CON" -> "CON_document"', () => {
    assert.strictEqual(sanitizeFilename('CON', 'fallback'), 'CON_document');
  });

  runSyncTest('TC-115', 'Strips Windows reserved name lowercase "con" -> "con_document"', () => {
    assert.strictEqual(sanitizeFilename('con', 'fallback'), 'con_document');
  });

  runSyncTest('TC-116', 'Strips Windows reserved name "PRN" -> "PRN_document"', () => {
    assert.strictEqual(sanitizeFilename('PRN', 'fallback'), 'PRN_document');
  });

  runSyncTest('TC-117', 'Strips Windows reserved name "AUX" -> "AUX_document"', () => {
    assert.strictEqual(sanitizeFilename('AUX', 'fallback'), 'AUX_document');
  });

  runSyncTest('TC-118', 'Strips Windows reserved name "NUL" -> "NUL_document"', () => {
    assert.strictEqual(sanitizeFilename('NUL', 'fallback'), 'NUL_document');
  });

  runSyncTest('TC-119', 'Strips Windows reserved port "COM1" -> "COM1_document"', () => {
    assert.strictEqual(sanitizeFilename('COM1', 'fallback'), 'COM1_document');
  });

  runSyncTest('TC-120', 'Strips Windows reserved port "COM9" -> "COM9_document"', () => {
    assert.strictEqual(sanitizeFilename('COM9', 'fallback'), 'COM9_document');
  });

  runSyncTest('TC-121', 'Strips Windows reserved printer "LPT1" -> "LPT1_document"', () => {
    assert.strictEqual(sanitizeFilename('LPT1', 'fallback'), 'LPT1_document');
  });

  runSyncTest('TC-122', 'Strips Windows reserved printer "LPT9" -> "LPT9_document"', () => {
    assert.strictEqual(sanitizeFilename('LPT9', 'fallback'), 'LPT9_document');
  });

  runSyncTest('TC-123', 'Strips illegal character "<" and ">"', () => {
    const res = sanitizeFilename('<script>alert()</script>', 'fallback');
    assert(!res.includes('<'));
    assert(!res.includes('>'));
  });

  runSyncTest('TC-124', 'Strips illegal character colon ":" and pipe "|"', () => {
    const res = sanitizeFilename('C:file|name', 'fallback');
    assert(!res.includes(':'));
    assert(!res.includes('|'));
  });

  runSyncTest('TC-125', 'Strips illegal character double quotes \'"\' and question mark "?"', () => {
    const res = sanitizeFilename('what"is"this?.pdf', 'fallback');
    assert(!res.includes('"'));
    assert(!res.includes('?'));
  });

  runSyncTest('TC-126', 'Strips asterisk "*"', () => {
    const res = sanitizeFilename('star*burst', 'fallback');
    assert(!res.includes('*'));
  });

  runSyncTest('TC-127', 'Strips ASCII control characters \\x00 through \\x1F', () => {
    const res = sanitizeFilename('control\x00char\x1Ftest', 'fallback');
    assert(!res.includes('\x00'));
    assert(!res.includes('\x1F'));
    assert.strictEqual(res, 'control_char_test');
  });

  runSyncTest('TC-128', 'Strips ASCII DEL character \\x7F', () => {
    const res = sanitizeFilename('del\x7Fchar', 'fallback');
    assert(!res.includes('\x7F'));
  });

  runSyncTest('TC-129', 'Collapses consecutive underscores and spaces "a___b   c"', () => {
    assert.strictEqual(sanitizeFilename('a___b   c', 'fallback'), 'a_b c');
  });

  runSyncTest('TC-130', 'Strips trailing dots and spaces "my_doc...   "', () => {
    assert.strictEqual(sanitizeFilename('my_doc...   ', 'fallback'), 'my_doc');
  });

  runSyncTest('TC-131', 'Truncates filenames longer than 100 characters', () => {
    const longName = 'A'.repeat(120);
    const res = sanitizeFilename(longName, 'fallback');
    assert.strictEqual(res.length, 100);
  });

  runSyncTest('TC-132', 'Returns fallback when input is empty string ""', () => {
    assert.strictEqual(sanitizeFilename('', 'fallback_name'), 'fallback_name');
  });

  runSyncTest('TC-133', 'Returns fallback when input is only whitespace "   "', () => {
    assert.strictEqual(sanitizeFilename('   ', 'fallback_name'), 'fallback_name');
  });

  runSyncTest('TC-134', 'Returns fallback when input is only illegal characters ":*?<>|"', () => {
    assert.strictEqual(sanitizeFilename(':*?<>|', 'fallback_name'), 'fallback_name');
  });

  runSyncTest('TC-135', 'Normalizes Unicode NFC characters', () => {
    const nfd = 'e\u0301'; // é in NFD
    const res = sanitizeFilename(nfd, 'fallback');
    assert.strictEqual(res, 'é');
  });

  // ==================================================================
  // SECTION 6: HEADER MAGIC BYTE & BINARY INSPECTION (15 TESTS)
  // ==================================================================
  console.log('\n--- SECTION 6: PDF Header Magic Byte & Binary Inspection (15 Tests) ---');

  runSyncTest('TC-136', 'Detects valid %PDF- magic bytes at offset 0', () => {
    const buf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]); // %PDF-1.7
    assert.strictEqual(hasPdfMagicBytesBuffer(buf), true);
  });

  runSyncTest('TC-137', 'Detects valid %PDF- offset by 3 bytes (BOM simulation)', () => {
    const buf = new Uint8Array([0xef, 0xbb, 0xbf, 0x25, 0x50, 0x44, 0x46, 0x2d]);
    assert.strictEqual(hasPdfMagicBytesBuffer(buf), true);
  });

  runSyncTest('TC-138', 'Detects valid %PDF- offset by 50 bytes of comment header', () => {
    const prefix = new Uint8Array(50).fill(0x20); // 50 spaces
    const magic = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    const merged = new Uint8Array(prefix.length + magic.length);
    merged.set(prefix);
    merged.set(magic, prefix.length);
    assert.strictEqual(hasPdfMagicBytesBuffer(merged), true);
  });

  runSyncTest('TC-139', 'Detects valid %PDF- up to limit of 1024 bytes', () => {
    const buf = new Uint8Array(1030).fill(0x20);
    buf.set([0x25, 0x50, 0x44, 0x46, 0x2d], 1020);
    assert.strictEqual(hasPdfMagicBytesBuffer(buf), true);
  });

  runSyncTest('TC-140', 'Rejects %PDF- placed beyond 1024-byte boundary', () => {
    const buf = new Uint8Array(2000).fill(0x20);
    buf.set([0x25, 0x50, 0x44, 0x46, 0x2d], 1100);
    assert.strictEqual(hasPdfMagicBytesBuffer(buf), false);
  });

  runSyncTest('TC-141', 'Rejects empty Uint8Array (0 bytes)', () => {
    assert.strictEqual(hasPdfMagicBytesBuffer(new Uint8Array(0)), false);
  });

  runSyncTest('TC-142', 'Rejects truncated buffer under 5 bytes', () => {
    assert.strictEqual(hasPdfMagicBytesBuffer(new Uint8Array([0x25, 0x50, 0x44])), false);
  });

  runSyncTest('TC-143', 'Rejects PNG magic bytes (\\x89PNG\\r\\n\\x1a\\n)', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.strictEqual(hasPdfMagicBytesBuffer(png), false);
  });

  runSyncTest('TC-144', 'Rejects JPEG magic bytes (\\xFF\\xD8\\xFF)', () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    assert.strictEqual(hasPdfMagicBytesBuffer(jpeg), false);
  });

  runSyncTest('TC-145', 'Rejects GIF magic bytes ("GIF89a")', () => {
    const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    assert.strictEqual(hasPdfMagicBytesBuffer(gif), false);
  });

  runSyncTest('TC-146', 'Rejects ZIP magic bytes ("PK\\x03\\x04")', () => {
    const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    assert.strictEqual(hasPdfMagicBytesBuffer(zip), false);
  });

  runSyncTest('TC-147', 'Rejects plain ASCII text ("Hello World")', () => {
    const text = new TextEncoder().encode('Hello World this is not a PDF');
    assert.strictEqual(hasPdfMagicBytesBuffer(text), false);
  });

  runSyncTest('TC-148', 'Rejects partially matching prefix "%PDX-"', () => {
    const partial = new Uint8Array([0x25, 0x50, 0x44, 0x58, 0x2d]);
    assert.strictEqual(hasPdfMagicBytesBuffer(partial), false);
  });

  runSyncTest('TC-149', 'Rejects null/undefined as safe falsy check', () => {
    // @ts-expect-error testing runtime robustness
    assert.strictEqual(hasPdfMagicBytesBuffer(null), false);
  });

  runSyncTest('TC-150', 'FormatSize accurately formats 0 B to GB', () => {
    assert.strictEqual(formatSize(0), '0 B');
    assert.strictEqual(formatSize(500), '500 B');
    assert.strictEqual(formatSize(1024), '1.0 KB');
    assert.strictEqual(formatSize(1024 * 1024), '1.00 MB');
    assert.strictEqual(formatSize(1024 * 1024 * 1024), '1.00 GB');
    assert.strictEqual(formatSize(-10), '0 B');
  });

  // ==================================================================
  // SECTION 7: IN-MEMORY PDF MERGE, SPLIT, ZIP & INVARIANT (25 TESTS)
  // ==================================================================
  console.log('\n--- SECTION 7: In-Memory PDF Merge, Split, ZIP & Invariant Tests (25 Tests) ---');

  // Helper to create small in-memory PDF with specified number of pages
  async function createTestPdf(pageCount: number): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      const page = doc.addPage([200, 200]);
      page.drawText(`Page ${i + 1}`);
    }
    return doc.save();
  }

  await runAsyncTest('TC-151', 'Generates 2-page in-memory PDF fixture', async () => {
    const bytes = await createTestPdf(2);
    assert(bytes.byteLength > 100);
    const doc = await PDFDocument.load(bytes);
    assert.strictEqual(doc.getPageCount(), 2);
  });

  await runAsyncTest('TC-152', 'Generates 3-page in-memory PDF fixture', async () => {
    const bytes = await createTestPdf(3);
    const doc = await PDFDocument.load(bytes);
    assert.strictEqual(doc.getPageCount(), 3);
  });

  await runAsyncTest('TC-153', 'Generates 4-page in-memory PDF fixture', async () => {
    const bytes = await createTestPdf(4);
    const doc = await PDFDocument.load(bytes);
    assert.strictEqual(doc.getPageCount(), 4);
  });

  await runAsyncTest('TC-154', 'Merges 2 documents (2 + 3 pages = 5 pages)', async () => {
    const docABytes = await createTestPdf(2);
    const docBBytes = await createTestPdf(3);

    const merged = await PDFDocument.create();
    const docA = await PDFDocument.load(docABytes);
    const docB = await PDFDocument.load(docBBytes);

    const pagesA = await merged.copyPages(docA, docA.getPageIndices());
    pagesA.forEach((p) => merged.addPage(p));

    const pagesB = await merged.copyPages(docB, docB.getPageIndices());
    pagesB.forEach((p) => merged.addPage(p));

    const mergedBytes = await merged.save();
    await verifyOutputPdfIntegrity(mergedBytes, 5, 'merge');

    const reloaded = await PDFDocument.load(mergedBytes);
    assert.strictEqual(reloaded.getPageCount(), 5);
  });

  await runAsyncTest('TC-155', 'Merges 3 documents (2 + 3 + 4 pages = 9 pages)', async () => {
    const bytesA = await createTestPdf(2);
    const bytesB = await createTestPdf(3);
    const bytesC = await createTestPdf(4);

    const merged = await PDFDocument.create();
    for (const b of [bytesA, bytesB, bytesC]) {
      const src = await PDFDocument.load(b);
      const copied = await merged.copyPages(src, src.getPageIndices());
      copied.forEach((p) => merged.addPage(p));
    }

    const mergedBytes = await merged.save();
    await verifyOutputPdfIntegrity(mergedBytes, 9, 'merge');
  });

  await runAsyncTest('TC-156', 'Extracts exact page subset (pages 1 and 3 of 4-page document)', async () => {
    const srcBytes = await createTestPdf(4);
    const srcDoc = await PDFDocument.load(srcBytes);

    const parsed = parsePageRange('1, 3', srcDoc.getPageCount());
    assert.deepStrictEqual(parsed.pagesZeroBased, [0, 2]);

    const extracted = await PDFDocument.create();
    const copied = await extracted.copyPages(srcDoc, parsed.pagesZeroBased);
    copied.forEach((p) => extracted.addPage(p));

    const outBytes = await extracted.save();
    await verifyOutputPdfIntegrity(outBytes, 2, 'split');

    const reloaded = await PDFDocument.load(outBytes);
    assert.strictEqual(reloaded.getPageCount(), 2);
  });

  await runAsyncTest('TC-157', 'Extracts contiguous interval (pages 2-4 of 4-page document)', async () => {
    const srcBytes = await createTestPdf(4);
    const srcDoc = await PDFDocument.load(srcBytes);

    const parsed = parsePageRange('2-4', srcDoc.getPageCount());
    assert.deepStrictEqual(parsed.pagesZeroBased, [1, 2, 3]);

    const extracted = await PDFDocument.create();
    const copied = await extracted.copyPages(srcDoc, parsed.pagesZeroBased);
    copied.forEach((p) => extracted.addPage(p));

    const outBytes = await extracted.save();
    await verifyOutputPdfIntegrity(outBytes, 3, 'split');
  });

  await runAsyncTest('TC-158', 'Extracts single page into standalone PDF (page 2 of 3)', async () => {
    const srcBytes = await createTestPdf(3);
    const srcDoc = await PDFDocument.load(srcBytes);

    const extracted = await PDFDocument.create();
    const [page] = await extracted.copyPages(srcDoc, [1]); // page 2
    extracted.addPage(page);

    const outBytes = await extracted.save();
    await verifyOutputPdfIntegrity(outBytes, 1, 'split');
  });

  await runAsyncTest('TC-159', 'Splits 3-page document into single pages inside JSZip archive', async () => {
    const srcBytes = await createTestPdf(3);
    const srcDoc = await PDFDocument.load(srcBytes);
    const zip = new JSZip();

    for (let i = 0; i < srcDoc.getPageCount(); i++) {
      const pageDoc = await PDFDocument.create();
      const [copied] = await pageDoc.copyPages(srcDoc, [i]);
      pageDoc.addPage(copied);
      const pageBytes = await pageDoc.save();
      await verifyOutputPdfIntegrity(pageBytes, 1, 'split');
      zip.file(`test_page_${String(i + 1).padStart(2, '0')}.pdf`, pageBytes);
    }

    const zipBytes = await zip.generateAsync({ type: 'uint8array' });
    assert(zipBytes.byteLength > 200);

    // Verify ZIP contains 3 valid files
    const unzipped = await JSZip.loadAsync(zipBytes);
    const fileNames = Object.keys(unzipped.files);
    assert.strictEqual(fileNames.length, 3);
    assert(fileNames.includes('test_page_01.pdf'));
    assert(fileNames.includes('test_page_02.pdf'));
    assert(fileNames.includes('test_page_03.pdf'));

    // Verify each unzipped file is an uncorrupted 1-page PDF
    for (const name of fileNames) {
      const fileData = await unzipped.files[name].async('uint8array');
      const loaded = await PDFDocument.load(fileData);
      assert.strictEqual(loaded.getPageCount(), 1);
    }
  });

  await runAsyncTest('TC-160', 'Multi-range splitting into JSZip (1-2; 3-4 on 4-page PDF)', async () => {
    const srcBytes = await createTestPdf(4);
    const srcDoc = await PDFDocument.load(srcBytes);
    const groups = parseMultiRange('1-2; 3-4', srcDoc.getPageCount());

    const zip = new JSZip();
    for (let g = 0; g < groups.length; g++) {
      const group = groups[g];
      const partDoc = await PDFDocument.create();
      const copied = await partDoc.copyPages(srcDoc, group.pagesZeroBased);
      copied.forEach((p) => partDoc.addPage(p));
      const partBytes = await partDoc.save();
      await verifyOutputPdfIntegrity(partBytes, group.pagesZeroBased.length, 'split');
      zip.file(`doc_part_${g + 1}.pdf`, partBytes);
    }

    const zipBytes = await zip.generateAsync({ type: 'uint8array' });
    const unzipped = await JSZip.loadAsync(zipBytes);
    assert.strictEqual(Object.keys(unzipped.files).length, 2);

    const part1 = await unzipped.files['doc_part_1.pdf'].async('uint8array');
    const doc1 = await PDFDocument.load(part1);
    assert.strictEqual(doc1.getPageCount(), 2);

    const part2 = await unzipped.files['doc_part_2.pdf'].async('uint8array');
    const doc2 = await PDFDocument.load(part2);
    assert.strictEqual(doc2.getPageCount(), 2);
  });

  await runAsyncTest('TC-161', 'VerifyOutputPdfIntegrity passes on valid single page output', async () => {
    const bytes = await createTestPdf(1);
    await verifyOutputPdfIntegrity(bytes, 1, 'split');
  });

  await runAsyncTest('TC-162', 'VerifyOutputPdfIntegrity passes on valid multi-page output', async () => {
    const bytes = await createTestPdf(5);
    await verifyOutputPdfIntegrity(bytes, 5, 'merge');
  });

  await runAsyncTest('TC-163', 'VerifyOutputPdfIntegrity rejects empty Uint8Array', async () => {
    await assert.rejects(
      () => verifyOutputPdfIntegrity(new Uint8Array(0), 1, 'split'),
      /Generated PDF byte stream is empty/
    );
  });

  await runAsyncTest('TC-164', 'VerifyOutputPdfIntegrity rejects truncated byte stream (< 32 bytes)', async () => {
    const truncated = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]); // 6 bytes
    await assert.rejects(
      () => verifyOutputPdfIntegrity(truncated, 1, 'split'),
      /Generated PDF byte stream is truncated/
    );
  });

  await runAsyncTest('TC-165', 'VerifyOutputPdfIntegrity rejects non-PDF data (>= 32 bytes)', async () => {
    const nonPdf = new Uint8Array(50).fill(0x41); // 'A'
    await assert.rejects(
      () => verifyOutputPdfIntegrity(nonPdf, 1, 'split'),
      /missing valid PDF header bytes/
    );
  });

  await runAsyncTest('TC-166', 'VerifyOutputPdfIntegrity detects page count mismatch (expected 5, got 3)', async () => {
    const bytes = await createTestPdf(3);
    await assert.rejects(
      () => verifyOutputPdfIntegrity(bytes, 5, 'merge'),
      /Page count mismatch during merge verification: expected 5 pages, but produced 3/
    );
  });

  await runAsyncTest('TC-167', 'VerifyOutputPdfIntegrity detects page count mismatch (expected 1, got 2)', async () => {
    const bytes = await createTestPdf(2);
    await assert.rejects(
      () => verifyOutputPdfIntegrity(bytes, 1, 'split'),
      /Page count mismatch during split verification: expected 1 page, but produced 2/
    );
  });

  runSyncTest('TC-168', 'Validates MAX_SINGLE_FILE_BYTES boundary constant is 250 MB', () => {
    assert.strictEqual(MAX_SINGLE_FILE_BYTES, 250 * 1024 * 1024);
  });

  runSyncTest('TC-169', 'Validates MAX_TOTAL_MERGE_BYTES boundary constant is 750 MB', () => {
    assert.strictEqual(MAX_TOTAL_MERGE_BYTES, 750 * 1024 * 1024);
  });

  runSyncTest('TC-170', 'Validates MAX_MERGE_FILES constant is 50 files', () => {
    assert.strictEqual(MAX_MERGE_FILES, 50);
  });

  runSyncTest('TC-171', 'Validates MIN_PDF_FILE_BYTES constant is 32 bytes', () => {
    assert.strictEqual(MIN_PDF_FILE_BYTES, 32);
  });

  runSyncTest('TC-172', 'Validates WINDOWS_RESERVED_NAMES contains CON, PRN, AUX, NUL', () => {
    assert(WINDOWS_RESERVED_NAMES.has('CON'));
    assert(WINDOWS_RESERVED_NAMES.has('PRN'));
    assert(WINDOWS_RESERVED_NAMES.has('AUX'));
    assert(WINDOWS_RESERVED_NAMES.has('NUL'));
  });

  runSyncTest('TC-173', 'Validates WINDOWS_RESERVED_NAMES contains COM1 through COM9', () => {
    for (let i = 1; i <= 9; i++) {
      assert(WINDOWS_RESERVED_NAMES.has(`COM${i}`));
    }
  });

  runSyncTest('TC-174', 'Validates WINDOWS_RESERVED_NAMES contains LPT1 through LPT9', () => {
    for (let i = 1; i <= 9; i++) {
      assert(WINDOWS_RESERVED_NAMES.has(`LPT${i}`));
    }
  });

  runSyncTest('TC-175', 'makeId generates non-empty distinct unique strings', () => {
    const id1 = makeId();
    const id2 = makeId();
    assert(id1.length > 5);
    assert(id2.length > 5);
    assert.notStrictEqual(id1, id2);
  });

  // ==================================================================
  // SUITE REPORT & SUMMARY
  // ==================================================================
  console.log('\n======================================================================');
  console.log(`🏁 175-POINT TEST SUITE FINISHED`);
  console.log(`   Total Tests Executed : ${totalTests}`);
  console.log(`   Tests Passed         : ${passedTests}`);
  console.log(`   Tests Failed         : ${failedTests}`);
  console.log('======================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
