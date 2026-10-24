import {
  bytesToBase64,
  textToBase64,
  parseDataUri,
  normalizeBase64,
  base64ToBytes,
  base64ToText,
  inferMime,
  isTextMime,
  wrap,
  sameBytes,
} from '../lib/base64Engine';
import { tools } from '../config/toolsData';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: Array<{ test: string; expected: unknown; actual: unknown }> = [];

function assert(condition: boolean, testName: string, expected?: unknown, actual?: unknown) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}`);
    if (expected !== undefined && actual !== undefined) {
      console.error(`         Expected: ${JSON.stringify(expected)}`);
      console.error(`         Actual:   ${JSON.stringify(actual)}`);
    }
    failures.push({ test: testName, expected, actual });
  }
}

function assertEqual<T>(actual: T, expected: T, testName: string) {
  const match = JSON.stringify(actual) === JSON.stringify(expected);
  assert(match, testName, expected, actual);
}

function assertThrows(fn: () => void, testName: string, expectedErrorSubstr?: string) {
  totalTests++;
  try {
    fn();
    failedTests++;
    console.error(`  [FAIL] ${testName} (expected function to throw, but it succeeded)`);
    failures.push({ test: testName, expected: 'Error thrown', actual: 'Success' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!expectedErrorSubstr || msg.includes(expectedErrorSubstr)) {
      passedTests++;
      console.log(`  [PASS] ${testName}`);
    } else {
      failedTests++;
      console.error(`  [FAIL] ${testName} (threw error without expected substring)`);
      console.error(`         Expected substring: "${expectedErrorSubstr}"`);
      console.error(`         Actual error:      "${msg}"`);
      failures.push({ test: testName, expected: expectedErrorSubstr, actual: msg });
    }
  }
}

console.log('================================================================');
console.log('        KIVAROTOOLS BASE64 ENGINE — AUTOMATED TEST SUITE        ');
console.log('================================================================\n');

// -------------------------------------------------------------
// TEST GROUP 1: Standard Base64 Decoding & Regression Checks
// -------------------------------------------------------------
console.log('Test Group 1: Standard Base64 Decoding & Regression Checks');

// Case: SGVsbG8= decodes to Hello
assertEqual(base64ToText('SGVsbG8='), 'Hello', 'SGVsbG8= decodes to "Hello" in tolerant mode');
assertEqual(base64ToText('SGVsbG8=', true), 'Hello', 'SGVsbG8= decodes to "Hello" in strict mode');

// Case: SGVsbG8* MUST be rejected with a validation error; must NOT produce "Hello"
assertThrows(
  () => base64ToText('SGVsbG8*'),
  'SGVsbG8* is rejected and throws validation error (contains invalid character *)',
  'invalid characters'
);
assertThrows(
  () => base64ToText('SGVsbG8*', true),
  'SGVsbG8* is rejected in strict mode as well',
  'invalid characters'
);

// Verify SGVsbG8* does not silently decode to Hello through normalizeBase64
assertThrows(
  () => normalizeBase64('SGVsbG8*'),
  'normalizeBase64("SGVsbG8*") throws instead of stripping *',
  'invalid characters'
);

// Other arbitrary invalid characters must also be rejected
assertThrows(() => base64ToText('*SGVsbG8='), 'Leading * rejected', 'invalid characters');
assertThrows(() => base64ToText('SGVsb!G8='), 'Internal ! rejected', 'invalid characters');
assertThrows(() => base64ToText('SGVsbG8#'), 'Trailing # rejected', 'invalid characters');
assertThrows(() => base64ToText('SGVsbG8@'), 'Trailing @ rejected', 'invalid characters');
assertThrows(() => base64ToText('Hello World!'), 'Arbitrary plain text rejected in decode mode', 'invalid characters');

// -------------------------------------------------------------
// TEST GROUP 2: Whitespace & Line-Wrapped Base64
// -------------------------------------------------------------
console.log('\nTest Group 2: Whitespace & Line-Wrapped Base64');

assertEqual(base64ToText('SGVs\nbG8='), 'Hello', 'Base64 with LF line-break decodes cleanly');
assertEqual(base64ToText('SGVs\r\nbG8='), 'Hello', 'Base64 with CRLF line-break decodes cleanly');
assertEqual(base64ToText('  SGVsbG8=  '), 'Hello', 'Base64 with leading and trailing spaces decodes cleanly');
assertEqual(base64ToText('S G V s b G 8 ='), 'Hello', 'Base64 with internal spaces decodes cleanly');
assertEqual(base64ToText('\tSGVs\t\nbG8=\n'), 'Hello', 'Base64 with tabs and newlines decodes cleanly');

// Whitespace handling must NOT make invalid characters acceptable
assertThrows(() => base64ToText('SGVs\n bG8*'), 'Whitespace mixed with * is still rejected', 'invalid characters');
assertThrows(() => base64ToText('  *  '), 'Whitespace around invalid character is rejected', 'invalid characters');

// -------------------------------------------------------------
// TEST GROUP 3: Omitted / Missing Padding Restoration
// -------------------------------------------------------------
console.log('\nTest Group 3: Omitted / Missing Padding Policy');

// Unpadded length 7 (mod 4 = 3) -> restores 1 pad '=' -> Hello
assertEqual(base64ToText('SGVsbG8'), 'Hello', 'Omitted single padding "SGVsbG8" decodes to "Hello"');

// Unpadded length 2 (mod 4 = 2) -> restores 2 pads '==' -> H
assertEqual(base64ToText('SA'), 'H', 'Omitted double padding "SA" decodes to "H"');

// Unpadded length 4 (mod 4 = 0) -> no padding needed -> Hes
assertEqual(base64ToText('SGVz'), 'Hes', 'Base64 multiple of 4 without padding "SGVz" decodes to "Hes"');

// -------------------------------------------------------------
// TEST GROUP 4: URL-Safe Base64 (Base64URL)
// -------------------------------------------------------------
console.log('\nTest Group 4: URL-Safe Base64 (Base64URL)');

// JWT Header: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
const jwtHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
assertEqual(
  base64ToText(jwtHeader),
  '{"alg":"HS256","typ":"JWT"}',
  'JWT header URL-safe Base64 decodes cleanly'
);

// Bytes with - and _ (62 -> '-', 63 -> '_')
const testBytes = new Uint8Array([251, 255]); // 0xFB, 0xFF
const urlSafeEncoded = bytesToBase64(testBytes, true, true);
assertEqual(urlSafeEncoded, '-_8', 'bytesToBase64 creates URL-safe "-_8"');
const decodedBytes = base64ToBytes(urlSafeEncoded);
assert(sameBytes(testBytes, decodedBytes), 'URL-safe "-_8" decodes back to original bytes');

// -------------------------------------------------------------
// TEST GROUP 5: Data URI Decoding
// -------------------------------------------------------------
console.log('\nTest Group 5: Data URI Decoding');

assertEqual(
  base64ToText('data:text/plain;base64,SGVsbG8='),
  'Hello',
  'Data URI with standard Base64 payload decodes to "Hello"'
);

assertEqual(
  base64ToText('data:text/plain;charset=utf-8;base64,SGVsbG8='),
  'Hello',
  'Data URI with parameters decodes to "Hello"'
);

const parsedUri = parseDataUri('data:text/plain;charset=utf-8;base64,SGVsbG8=');
assert(parsedUri?.isBase64 === true, 'parseDataUri identifies Base64 parameter');
assertEqual(parsedUri?.mime, 'text/plain', 'parseDataUri extracts MIME');

// Data URI containing invalid characters must be rejected
assertThrows(
  () => base64ToText('data:text/plain;base64,SGVsbG8*'),
  'Data URI containing * is rejected',
  'invalid characters'
);

// Malformed Data URI
assertThrows(
  () => base64ToText('data:text/plainSGVsbG8='),
  'Data URI missing comma separator is rejected',
  'missing comma'
);
assertThrows(
  () => base64ToText('data:text/plain;charset=utf-8,Hello'),
  'Non-base64 Data URI is rejected',
  'not Base64-encoded'
);

// -------------------------------------------------------------
// TEST GROUP 6: Empty Input & Edge Cases
// -------------------------------------------------------------
console.log('\nTest Group 6: Empty Input & Edge Cases');

assertEqual(base64ToText(''), '', 'Empty string returns empty string without throwing');
assertEqual(base64ToText('   '), '', 'Whitespace-only input returns empty string without throwing');
assertEqual(base64ToText('\r\n\t  '), '', 'Tabs and newlines return empty string without throwing');
assertEqual(base64ToBytes('').length, 0, 'base64ToBytes("") returns empty Uint8Array');

// -------------------------------------------------------------
// TEST GROUP 7: Malformed Padding & Length Rejection
// -------------------------------------------------------------
console.log('\nTest Group 7: Malformed Padding & Length Rejection');

// 1. Padding character in the middle
assertThrows(
  () => base64ToText('SG=VsbG8='),
  'Padding in middle "SG=VsbG8=" is rejected',
  'only allowed at the end'
);
assertThrows(
  () => base64ToText('=SGVsbG8='),
  'Leading padding "=SGVsbG8=" is rejected',
  'only allowed at the end'
);
assertThrows(
  () => base64ToText('SGVsbG8=A'),
  'Padding followed by data "SGVsbG8=A" is rejected',
  'only allowed at the end'
);

// 2. More than 2 padding characters
assertThrows(
  () => base64ToText('SGVsbG8==='),
  'Three pad characters "SGVsbG8===" rejected',
  'cannot have more than 2'
);
assertThrows(
  () => base64ToText('===='),
  'Four pad characters "====" rejected',
  'cannot have more than 2'
);

// 3. Only padding (no data)
assertThrows(
  () => base64ToText('=='),
  'Only padding "==" is rejected',
  'contains only padding'
);
assertThrows(
  () => base64ToText('='),
  'Only padding "=" is rejected',
  'contains only padding'
);

// 4. Modulo 4 === 1 length (impossible Base64 chunk)
assertThrows(
  () => base64ToText('S'),
  'Single character "S" rejected (length % 4 === 1)',
  'length modulo 4'
);
assertThrows(
  () => base64ToText('AAAAA'),
  'Five characters "AAAAA" rejected (length % 4 === 1)',
  'length modulo 4'
);

// 5. Incorrect pad count for unpadded length
assertThrows(
  () => base64ToText('SGVsbG8=='),
  'Length 7 with double padding "SGVsbG8==" rejected (needs 1 pad, got 2)',
  'incorrect padding length'
);
assertThrows(
  () => base64ToText('AAAA='),
  'Multiple of 4 with padding "AAAA=" rejected (needs 0 pad, got 1)',
  'incorrect padding length'
);
assertThrows(
  () => base64ToText('SA='),
  'Length 2 with single padding "SA=" rejected (needs 2 pad, got 1)',
  'incorrect padding length'
);

// -------------------------------------------------------------
// TEST GROUP 8: Strict Mode Canonical Pad Bits (RFC 4648 §3.5)
// -------------------------------------------------------------
console.log('\nTest Group 8: Strict Mode Canonical Pad Bits');

// Canonical: 'Hello' -> 'SGVsbG8='
assertEqual(base64ToText('SGVsbG8=', true), 'Hello', 'Canonical pad bits accepted in strict mode');

// Non-canonical pad bits: change the last data char so unused bits are non-zero
// 'SGVsbG8=': '8' is index 60 (111100). Lower 2 bits are 00 (canonical).
// 'SGVsbG9=': '9' is index 61 (111101). Lower 2 bits are 01 (non-canonical).
assertThrows(
  () => base64ToText('SGVsbG9=', true),
  'Non-canonical pad bits rejected in strict mode',
  'Non-canonical'
);
// In tolerant mode, non-canonical pad bits decode without throwing
assertEqual(base64ToText('SGVsbG9='), 'Hello', 'Non-canonical pad bits tolerated in tolerant mode');

// -------------------------------------------------------------
// TEST GROUP 9: Encoding Unicode, Multilingual & Binary Data
// -------------------------------------------------------------
console.log('\nTest Group 9: Encoding Unicode, Multilingual & Binary Data');

const unicodeSamples = [
  'Hello, World!',
  '🚀 KivaroTools: Café, 日本語, العربية, & Zürich ✨',
  'Urdu: خوش آمدید! اردو زبان کا امتحان',
  'Special Symbols: <>&"\'~`!@#$%^&*()_+=-{}[]|\\:;"<>,.?/',
  'Empty: ',
];

for (const sample of unicodeSamples) {
  const encoded = textToBase64(sample);
  const decoded = base64ToText(encoded);
  assertEqual(decoded, sample, `Unicode round-trip for: "${sample.slice(0, 25)}..."`);
}

// Line wrapping utility
const longStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
assertEqual(wrap(longStr, 16), 'ABCDEFGHIJKLMNOP\nQRSTUVWXYZabcdef\nghijklmnopqrstuv\nwxyz0123456789+/', 'wrap(s, 16) wraps at 16 characters');
assertEqual(wrap(longStr, 0), longStr, 'wrap(s, 0) leaves string unchanged');

// MIME detection
const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
assertEqual(inferMime(pngBytes).mime, 'image/png', 'inferMime detects PNG');
const pdfBytes = new TextEncoder().encode('%PDF-1.4 header');
assertEqual(inferMime(pdfBytes).mime, 'application/pdf', 'inferMime detects PDF');
assert(isTextMime('text/plain'), 'isTextMime returns true for text/plain');
assert(!isTextMime('image/png'), 'isTextMime returns false for image/png');

// -------------------------------------------------------------
// TEST GROUP 10: SEO Registry Verification
// -------------------------------------------------------------
console.log('\nTest Group 10: SEO Registry Verification');

const base64Tool = tools.find(t => t.slug === 'base64-encoder');
assert(Boolean(base64Tool), 'toolsData contains "base64-encoder"');
assertEqual(base64Tool?.status, 'published', 'base64-encoder status is "published"');
assertEqual(base64Tool?.categoryId, 'developer', 'base64-encoder category is "developer"');

console.log('\n================================================================');
console.log(`TEST RESULTS: ${passedTests} passed, ${failedTests} failed (${totalTests} total)`);
console.log('================================================================\n');

if (failedTests > 0) {
  console.error(`FAILURE: ${failedTests} test(s) failed.`);
  process.exit(1);
} else {
  console.log('SUCCESS: All Base64 Engine & Decoder regression tests passed cleanly.');
}
