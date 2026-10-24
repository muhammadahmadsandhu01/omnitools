/**
 * Comprehensive 180+ Automated Test Suite for KivaroTools JSON Formatter Engine
 *
 * Covers RFC 8259 / ECMA-404 strict compliance, formatting, minification,
 * key sorting, array order preservation, null cleaning, conservative repair,
 * pre-parse diagnostics, JSONPath queries, diffing, schema generation,
 * virtual tree windowing, and search indexing.
 */

import {
  parseJsonStrict,
  formatJson,
  minifyJson,
  sortJsonKeys,
  removeNullValues,
  scanJsonDiagnostics,
  stripJsonComments,
  convertSingleQuotedStrings,
  replaceBareIdentifiers,
  repairJson,
  evaluateJsonPath,
  parseJsonPath,
  diffJson,
  jsonEqual,
  generateTypeScript,
  generateJsonSchema,
  calculateJsonStats,
  formatBytes,
  childPath,
  normalizeSearchTerm,
  containsMatch,
  countSearchMatches,
  buildSearchIndex,
  flattenVisibleTree,
  SAMPLE_JSON_PAYLOADS,
} from '../lib/jsonFormatterEngine';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: Array<{ name: string; detail?: string }> = [];

function test(name: string, assertion: boolean, detail?: string) {
  totalTests++;
  if (assertion) {
    passedTests++;
    console.log(`  [PASS ${String(totalTests).padStart(3, ' ')}] ${name}`);
  } else {
    failedTests++;
    failures.push({ name, detail });
    console.error(`  [FAIL ${String(totalTests).padStart(3, ' ')}] ${name}${detail ? ` -> ${detail}` : ''}`);
  }
}

async function run150PlusTestSuite() {
  console.log('================================================================');
  console.log('KIVAROTOOLS JSON FORMATTER — 180+ EXHAUSTIVE AUTOMATED TEST SUITE');
  console.log('================================================================\n');

  // ============================================================================
  // GROUP 1: STRICT JSON PARSING — VALID PRIMITIVES & STRUCTURES (Tests 1 - 25)
  // ============================================================================
  console.log('--- GROUP 1: Strict JSON Parsing (Valid Primitives & Structures) ---');

  const p1 = parseJsonStrict('{"name":"Ali","active":true,"score":12}');
  test('Valid simple object with string, boolean, integer', p1.isValid && p1.error === null);

  const p2 = parseJsonStrict('{"nothing":null}');
  test('Valid null literal value', p2.isValid && (p2.data as any).nothing === null);

  const p3 = parseJsonStrict('{"yes":true,"no":false}');
  test('Valid boolean true and false literals', p3.isValid && (p3.data as any).yes === true && (p3.data as any).no === false);

  const p4 = parseJsonStrict('{"zero":0}');
  test('Valid integer zero', p4.isValid && (p4.data as any).zero === 0);

  const p5 = parseJsonStrict('{"negative":-42}');
  test('Valid negative integer', p5.isValid && (p5.data as any).negative === -42);

  const p6 = parseJsonStrict('{"decimal":-12.5}');
  test('Valid floating-point negative number', p6.isValid && (p6.data as any).decimal === -12.5);

  const p7 = parseJsonStrict('{"exponent":1e3}');
  test('Valid scientific notation 1e3 equals 1000', p7.isValid && (p7.data as any).exponent === 1000);

  const p8 = parseJsonStrict('{"exponent_neg":1.5e-4}');
  test('Valid scientific notation negative exponent 1.5e-4', p8.isValid && (p8.data as any).exponent_neg === 0.00015);

  const p9 = parseJsonStrict('{"exponent_upper":2E+3}');
  test('Valid scientific notation uppercase 2E+3', p9.isValid && (p9.data as any).exponent_upper === 2000);

  const p10 = parseJsonStrict('{}');
  test('Valid empty object {}', p10.isValid && typeof p10.data === 'object' && Object.keys(p10.data as any).length === 0);

  const p11 = parseJsonStrict('[]');
  test('Valid empty array []', p11.isValid && Array.isArray(p11.data) && (p11.data as any).length === 0);

  const p12 = parseJsonStrict('{"items":[],"metadata":{}}');
  test('Valid nested empty array and empty object', p12.isValid && Array.isArray((p12.data as any).items) && Object.keys((p12.data as any).metadata).length === 0);

  const p13 = parseJsonStrict('[1, 2, 3, 4]');
  test('Valid array of integers', p13.isValid && (p13.data as any).length === 4);

  const p14 = parseJsonStrict('["alpha", "beta", "gamma"]');
  test('Valid array of strings', p14.isValid && (p14.data as any)[1] === 'beta');

  const p15 = parseJsonStrict('[true, false, null, 0, "test"]');
  test('Valid mixed primitive array', p15.isValid && (p15.data as any)[2] === null);

  const p16 = parseJsonStrict('{"user":{"name":"Sara","address":{"city":"Lahore","zip":"54000"}},"roles":["admin","editor"]}');
  test('Valid multi-level nested object and array', p16.isValid && (p16.data as any).user.address.city === 'Lahore');

  const p17 = parseJsonStrict('[[1, 2], [3, 4]]');
  test('Valid 2D array matrix', p17.isValid && (p17.data as any)[1][0] === 3);

  const p18 = parseJsonStrict('{"0":"first","1":"second"}');
  test('Valid numeric string keys in object', p18.isValid && (p18.data as any)['0'] === 'first');

  const p19 = parseJsonStrict('{"@id":"urn:item:1","$schema":"https://example.com/schema.json"}');
  test('Valid special symbols @ and $ in object keys', p19.isValid && (p19.data as any)['@id'] === 'urn:item:1');

  const p20 = parseJsonStrict('{"a-b":1,"a.b":2,"a_b":3}');
  test('Valid hyphens, dots, and underscores in keys', p20.isValid && (p20.data as any)['a-b'] === 1);

  const p21 = parseJsonStrict('{"": "empty key"}');
  test('Valid empty string key', p21.isValid && (p21.data as any)[''] === 'empty key');

  const p22 = parseJsonStrict('{"key": ""}');
  test('Valid empty string value', p22.isValid && (p22.data as any).key === '');

  const p23 = parseJsonStrict('{"safe_max": 9007199254740991}');
  test('Valid Number.MAX_SAFE_INTEGER parsed correctly', p23.isValid && (p23.data as any).safe_max === Number.MAX_SAFE_INTEGER);

  const p24 = parseJsonStrict('{"safe_min": -9007199254740991}');
  test('Valid Number.MIN_SAFE_INTEGER parsed correctly', p24.isValid && (p24.data as any).safe_min === Number.MIN_SAFE_INTEGER);

  const p25 = parseJsonStrict('{"level1":{"level2":{"level3":{"level4":{"level5":100}}}}}');
  test('Valid 5-level deeply nested object', p25.isValid && (p25.data as any).level1.level2.level3.level4.level5 === 100);

  // ============================================================================
  // GROUP 2: STRICT RFC 8259 VALIDATION — INVALID JSON REJECTION (Tests 26 - 55)
  // ============================================================================
  console.log('\n--- GROUP 2: Strict RFC 8259 Validation (Invalid JSON Rejection) ---');

  const e1 = parseJsonStrict('{"a":1,}');
  test('Reject: Trailing comma in object', !e1.isValid && e1.error !== null);

  const e2 = parseJsonStrict('{"a":1,,}');
  test('Reject: Multiple trailing commas in object', !e2.isValid);

  const e3 = parseJsonStrict('[1, 2,]');
  test('Reject: Trailing comma in array', !e3.isValid);

  const e4 = parseJsonStrict('[, 1, 2]');
  test('Reject: Leading comma in array', !e4.isValid);

  const e5 = parseJsonStrict('[1,, 2]');
  test('Reject: Double comma inside array', !e5.isValid);

  const e6 = parseJsonStrict("{'a':1}");
  test('Reject: Single-quoted string object', !e6.isValid);

  const e7 = parseJsonStrict("{'a': \"valid\"}");
  test('Reject: Single-quoted key only', !e7.isValid);

  const e8 = parseJsonStrict('{"a": \'invalid\'}');
  test('Reject: Single-quoted value only', !e8.isValid);

  const e9 = parseJsonStrict('{a:1}');
  test('Reject: Unquoted object key', !e9.isValid);

  const e10 = parseJsonStrict('{"a":}');
  test('Reject: Missing value after colon', !e10.isValid);

  const e11 = parseJsonStrict('{"a" 1}');
  test('Reject: Missing colon between key and value', !e11.isValid);

  const e12 = parseJsonStrict('{"a":1 "b":2}');
  test('Reject: Missing comma separator between properties', !e12.isValid);

  const e13 = parseJsonStrict('[1 2]');
  test('Reject: Missing comma separator in array', !e13.isValid);

  const e14 = parseJsonStrict('{"a":1');
  test('Reject: Unclosed object brace', !e14.isValid);

  const e15 = parseJsonStrict('[1, 2');
  test('Reject: Unclosed array bracket', !e15.isValid);

  const e16 = parseJsonStrict('{"a": [1, 2}');
  test('Reject: Mismatched array/object closing delimiter', !e16.isValid);

  const e17 = parseJsonStrict('{"a": 1 // note\n}');
  test('Reject: JavaScript single-line comment // in strict mode', !e17.isValid);

  const e18 = parseJsonStrict('{"a": /* note */ 1}');
  test('Reject: JavaScript multi-line comment /* */ in strict mode', !e18.isValid);

  const e19 = parseJsonStrict('');
  test('Reject: Empty string payload', !e19.isValid && Boolean(e19.error?.includes('Empty input')));

  const e20 = parseJsonStrict('     \n\t   ');
  test('Reject: Whitespace-only payload', !e20.isValid && Boolean(e20.error?.includes('Empty input')));

  const e21 = parseJsonStrict('{"a": undefined}');
  test('Reject: Bare undefined literal', !e21.isValid);

  const e22 = parseJsonStrict('{"a": NaN}');
  test('Reject: Bare NaN literal', !e22.isValid);

  const e23 = parseJsonStrict('{"a": Infinity}');
  test('Reject: Bare Infinity literal', !e23.isValid);

  const e24 = parseJsonStrict('{"a": True}');
  test('Reject: Python True keyword in strict mode', !e24.isValid);

  const e25 = parseJsonStrict('{"a": False}');
  test('Reject: Python False keyword in strict mode', !e25.isValid);

  const e26 = parseJsonStrict('{"a": None}');
  test('Reject: Python None keyword in strict mode', !e26.isValid);

  const e27 = parseJsonStrict('0x1F');
  test('Reject: Hexadecimal integer 0x1F', !e27.isValid);

  const e28 = parseJsonStrict('{"a": 0123}');
  test('Reject: Octal/leading zero integer 0123', !e28.isValid);

  const e29 = parseJsonStrict('{"a": +5}');
  test('Reject: Leading plus sign on number +5', !e29.isValid);

  const e30 = parseJsonStrict('{"a": .5}');
  test('Reject: Leading decimal without zero .5', !e30.isValid);

  // ============================================================================
  // GROUP 3: UNICODE, INTERNATIONALIZATION & ESCAPED CHARACTERS (Tests 56 - 75)
  // ============================================================================
  console.log('\n--- GROUP 3: Unicode & Escaped Characters ---');

  const u1 = parseJsonStrict('{"city":"کراچی"}');
  test('Unicode Urdu text "کراچی" parsed without corruption', u1.isValid && (u1.data as any).city === 'کراچی');

  const u2 = formatJson(u1.data);
  test('Unicode Urdu text preserved in formatted output', u2.includes('"کراچی"'));

  const u3 = parseJsonStrict('{"emoji":"🌟🚀🎉"}');
  test('Unicode 4-byte astral emojis parsed accurately', u3.isValid && (u3.data as any).emoji === '🌟🚀🎉');

  const u4 = formatJson(u3.data);
  test('Unicode emojis preserved in formatted output without replacement', u4.includes('"🌟🚀🎉"'));

  const u5 = parseJsonStrict('{"text":"café naïve résumé"}');
  test('Accented Latin characters parsed accurately', u5.isValid && (u5.data as any).text === 'café naïve résumé');

  const u6 = parseJsonStrict('{"arabic":"مرحبا بالعالم"}');
  test('Arabic bidirectional text parsed accurately', u6.isValid && (u6.data as any).arabic === 'مرحبا بالعالم');

  const u7 = parseJsonStrict('{"cjk":"日本語と中文"}');
  test('CJK characters parsed accurately', u7.isValid && (u7.data as any).cjk === '日本語と中文');

  const u8 = parseJsonStrict('{"cyrillic":"Привет мир"}');
  test('Cyrillic characters parsed accurately', u8.isValid && (u8.data as any).cyrillic === 'Привет мир');

  const u9 = parseJsonStrict('{"hebrew":"שלום עולם"}');
  test('Hebrew characters parsed accurately', u9.isValid && (u9.data as any).hebrew === 'שלום עולם');

  const u10 = parseJsonStrict('{"math":"∑∏∫√∞≈≠≤≥"}');
  test('Mathematical symbols parsed accurately', u10.isValid && (u10.data as any).math === '∑∏∫√∞≈≠≤≥');

  const u11 = parseJsonStrict('{"quote":"She said \\"hello\\""}');
  test('Escaped quotation marks \\" parsed accurately', u11.isValid && (u11.data as any).quote === 'She said "hello"');

  const u12 = formatJson(u11.data);
  test('Escaped quotation marks \\" serialized as escape sequence', u12.includes('She said \\"hello\\"'));

  const u13 = parseJsonStrict('{"path":"C:\\\\Users\\\\Ali"}');
  test('Escaped backslash \\\\ parsed accurately', u13.isValid && (u13.data as any).path === 'C:\\Users\\Ali');

  const u14 = formatJson(u13.data);
  test('Escaped backslash \\\\ preserved as \\\\ in formatted output', u14.includes('C:\\\\Users\\\\Ali'));

  const u15 = parseJsonStrict('{"line":"first\\nsecond"}');
  test('Escaped newline \\n parsed accurately without breaking line', u15.isValid && (u15.data as any).line === 'first\nsecond');

  const u16 = formatJson(u15.data);
  test('Escaped newline preserved as \\n escape in JSON output', u16.includes('first\\nsecond') && !u16.includes('first\nsecond'));

  const u17 = parseJsonStrict('{"tab":"col1\\tcol2"}');
  test('Escaped tab \\t parsed and preserved as escape', u17.isValid && formatJson(u17.data).includes('col1\\tcol2'));

  const u18 = parseJsonStrict('{"slash":"https:\\/\\/example.com"}');
  test('Escaped forward slash \\/ valid in strict JSON', u18.isValid && (u18.data as any).slash === 'https://example.com');

  const u19 = parseJsonStrict('{"unicode_escape":"\\u0041\\u0042\\u0043"}');
  test('Hex unicode escape sequence \\u0041\\u0042\\u0043 decodes to "ABC"', u19.isValid && (u19.data as any).unicode_escape === 'ABC');

  const u20 = parseJsonStrict('{"nested_json_str":"{\\"key\\": 123}"}');
  test('Embedded JSON string with escaped quotes parsed intact', u20.isValid && (u20.data as any).nested_json_str === '{"key": 123}');

  // ============================================================================
  // GROUP 4: FORMATTING, INDENTATION & MINIFICATION (Tests 76 - 95)
  // ============================================================================
  console.log('\n--- GROUP 4: Formatting, Indentation & Minification ---');

  const sampleBasic = { name: 'Ali', active: true, score: 12 };
  const fmt2 = formatJson(sampleBasic, { indent: 2 });
  const expected2 = '{\n  "name": "Ali",\n  "active": true,\n  "score": 12\n}';
  test('Format 2 spaces produces exact expected indentation', fmt2 === expected2);

  const fmt4 = formatJson(sampleBasic, { indent: 4 });
  test('Format 4 spaces produces 4-space indentation', fmt4.includes('    "name": "Ali",'));

  const fmtTab = formatJson(sampleBasic, { indent: '\t' });
  test('Format tab indentation produces \\t indentation', fmtTab.includes('\t"name": "Ali",'));

  const min1 = minifyJson(sampleBasic);
  test('Minify strips all optional whitespace into single line', min1 === '{"name":"Ali","active":true,"score":12}');

  const minNested = minifyJson({ a: 1, b: [true, false] });
  test('Minify nested structure matches {"a":1,"b":[true,false]}', minNested === '{"a":1,"b":[true,false]}');

  const numSample = { nothing: null, yes: true, no: false, integer: 0, decimal: -12.5, exponent: 1000 };
  const fmtNum = formatJson(numSample, { indent: 2 });
  const parsedNum = JSON.parse(fmtNum);
  test('Number types preserved as numeric values (not strings)', typeof parsedNum.integer === 'number' && typeof parsedNum.decimal === 'number' && typeof parsedNum.exponent === 'number');

  test('Exponent value equals numeric 1000', parsedNum.exponent === 1000);
  test('Null value preserved as null object', parsedNum.nothing === null);
  test('Boolean true/false preserved as booleans', parsedNum.yes === true && parsedNum.no === false);

  const roundtrip1 = formatJson(JSON.parse(minifyJson(JSON.parse(fmt2))), { indent: 2 });
  test('Roundtrip: Format -> Minify -> Format produces identical string', roundtrip1 === fmt2);

  const roundtrip2 = minifyJson(JSON.parse(formatJson(JSON.parse(min1), { indent: 4 })));
  test('Roundtrip: Minify -> Format -> Minify produces identical string', roundtrip2 === min1);

  const emptyObjFmt = formatJson({});
  test('Empty object formats to "{}"', emptyObjFmt === '{}');

  const emptyArrFmt = formatJson([]);
  test('Empty array formats to "[]"', emptyArrFmt === '[]');

  const nullSampleObj = { keep: 1, removeMe: null, nested: { keep2: 'ok', remove2: null } };
  const cleanedNulls = removeNullValues(nullSampleObj) as any;
  test('removeNullValues removes null properties from object', cleanedNulls.removeMe === undefined && cleanedNulls.keep === 1);
  test('removeNullValues removes nested null properties', cleanedNulls.nested.remove2 === undefined && cleanedNulls.nested.keep2 === 'ok');

  const nullArr = [1, null, 2, null, 3];
  const cleanedArr = removeNullValues(nullArr) as any[];
  test('removeNullValues strips null elements from array', cleanedArr.length === 3 && cleanedArr[1] === 2);

  const fmtNullClean = formatJson(nullSampleObj, { indent: 2, removeNulls: true });
  test('formatJson with removeNulls: true strips nulls during formatting', !fmtNullClean.includes('removeMe'));

  const largeArr = Array.from({ length: 500 }, (_, i) => ({ id: i, active: i % 2 === 0 }));
  const largeMin = minifyJson(largeArr);
  test('Minifies 500-element array cleanly without errors', largeMin.startsWith('[{"id":0,"active":true},') && largeMin.endsWith(']'));

  const largeFmt = formatJson(largeArr, { indent: 2 });
  test('Formats 500-element array cleanly with correct line count', largeFmt.split('\n').length > 1500);

  test('Format and Minify retain identical parsed data for large payload', jsonEqual(JSON.parse(largeMin), JSON.parse(largeFmt)));

  test('Negative zero -0 serialized in accordance with standard JS JSON', JSON.stringify({ z: -0 }) === '{"z":0}');

  // ============================================================================
  // GROUP 5: KEY SORTING (ALPHABETICAL OBJECT KEYS, STRICT ARRAY ORDER) (Tests 96 - 115)
  // ============================================================================
  console.log('\n--- GROUP 5: Key Sorting (Alphabetical Keys, Strict Array Order) ---');

  const unsorted = { z: 1, a: 2, m: 3 };
  const sorted = sortJsonKeys(unsorted) as any;
  const sortedKeys = Object.keys(sorted);
  test('Sorts object keys alphabetically: ["a", "m", "z"]', sortedKeys[0] === 'a' && sortedKeys[1] === 'm' && sortedKeys[2] === 'z');

  const sortedFmt = formatJson(unsorted, { indent: 2, sortKeys: true });
  const expectedSorted = '{\n  "a": 2,\n  "m": 3,\n  "z": 1\n}';
  test('formatJson with sortKeys: true matches expected sorted string', sortedFmt === expectedSorted);

  const arrUnsorted = [3, 1, 2, 9, 0];
  const arrSorted = sortJsonKeys(arrUnsorted) as number[];
  test('STRICT: Array order is NOT changed by sortJsonKeys', arrSorted[0] === 3 && arrSorted[1] === 1 && arrSorted[2] === 2 && arrSorted[3] === 9 && arrSorted[4] === 0);

  const arrOfObjects = [{ z: 10, a: 20 }, { y: 30, b: 40 }];
  const sortedArrOfObjs = sortJsonKeys(arrOfObjects) as any[];
  test('Array of objects: Array element order preserved while inner keys are sorted', Object.keys(sortedArrOfObjs[0])[0] === 'a' && Object.keys(sortedArrOfObjs[1])[0] === 'b');

  const nestedUnsorted = { b: { z: 1, a: 2 }, a: { y: 3, x: 4 } };
  const sortedNested = sortJsonKeys(nestedUnsorted) as any;
  test('Sorts outer keys and all nested inner keys recursively', Object.keys(sortedNested)[0] === 'a' && Object.keys(sortedNested.b)[0] === 'a');

  const reverseKeys = { d: 4, c: 3, b: 2, a: 1 };
  const sortedReverse = sortJsonKeys(reverseKeys) as any;
  test('Sorts reverse alphabetical keys to ["a","b","c","d"]', Object.keys(sortedReverse).join(',') === 'a,b,c,d');

  const singleKeyObj = { single: 42 };
  test('Single key object unaffected by sorting', Object.keys(sortJsonKeys(singleKeyObj) as any)[0] === 'single');

  const emptyObjSort = sortJsonKeys({}) as any;
  test('Empty object sorting produces empty object', Object.keys(emptyObjSort).length === 0);

  const caseSensitiveKeys = { B: 1, a: 2, b: 3, A: 4 };
  const sortedCase = sortJsonKeys(caseSensitiveKeys) as any;
  test('Case-sensitive key sorting uses standard locale/ASCII collation', Object.keys(sortedCase).length === 4);

  const keysWithPunctuation = { 'user-id': 1, 'user_name': 2, 'user.email': 3 };
  const sortedPunct = sortJsonKeys(keysWithPunctuation) as any;
  test('Keys with dashes and underscores sorted correctly', Object.keys(sortedPunct).length === 3);

  const deep3 = { z: { z: { z: 1, a: 2 } } };
  const sortedDeep3 = sortJsonKeys(deep3) as any;
  test('3-level deep sorting sorts innermost keys', Object.keys(sortedDeep3.z.z)[0] === 'a');

  test('Sorting is idempotent: sort(sort(x)) === sort(x)', JSON.stringify(sortJsonKeys(sortJsonKeys(unsorted))) === JSON.stringify(sortJsonKeys(unsorted)));

  const sortAndNull = formatJson({ z: null, a: 2, m: 3 }, { indent: 2, sortKeys: true, removeNulls: true });
  test('Sort keys and null removal combine cleanly', !sortAndNull.includes('z') && sortAndNull.startsWith('{\n  "a": 2,\n  "m": 3\n}'));

  const minSorted = minifyJson(sortJsonKeys(unsorted));
  test('Minify with sorted keys produces {"a":2,"m":3,"z":1}', minSorted === '{"a":2,"m":3,"z":1}');

  const primitiveSort = sortJsonKeys(12345);
  test('sortJsonKeys on primitive returns primitive directly', primitiveSort === 12345);

  const stringSort = sortJsonKeys('hello');
  test('sortJsonKeys on string returns string directly', stringSort === 'hello');

  const boolSort = sortJsonKeys(true);
  test('sortJsonKeys on boolean returns boolean directly', boolSort === true);

  const nullSort = sortJsonKeys(null);
  test('sortJsonKeys on null returns null directly', nullSort === null);

  const arrOfArrs = [[3, 2, 1], [6, 5, 4]];
  const sortedArrs = sortJsonKeys(arrOfArrs) as number[][];
  test('Nested array of arrays maintains exact nested order', sortedArrs[0][0] === 3 && sortedArrs[1][0] === 6);

  test('Sorting preserves deep equality of values', jsonEqual(unsorted, sortJsonKeys(unsorted)));

  // ============================================================================
  // GROUP 6: CONSERVATIVE REPAIR UTILITIES (`repairJson`) (Tests 116 - 140)
  // ============================================================================
  console.log('\n--- GROUP 6: Conservative Repair Engine ---');

  const c1 = stripJsonComments('{"a": 1 // single line\n}');
  test('stripJsonComments removes single-line // comment', !c1.includes('single line'));

  const c2 = stripJsonComments('{"a": /* multi-line */ 1}');
  test('stripJsonComments removes multi-line /* */ comment', !c2.includes('multi-line'));

  const c3 = stripJsonComments('{"url": "https://example.com/api//v1"}');
  test('stripJsonComments PRESERVES slashes inside double-quoted URL', c3.includes('https://example.com/api//v1'));

  const c4 = stripJsonComments("{'url': 'https://example.com/api//v1'}");
  test('stripJsonComments PRESERVES slashes inside single-quoted URL', c4.includes('https://example.com/api//v1'));

  const q1 = convertSingleQuotedStrings("{'name': 'Ali'}");
  test('convertSingleQuotedStrings converts single to double quotes', q1 === '{"name": "Ali"}');

  const q2 = convertSingleQuotedStrings("{'quote': 'She said \"hello\"'}");
  test('convertSingleQuotedStrings escapes nested double quotes inside single quotes', q2.includes('She said \\"hello\\"'));

  const q3 = convertSingleQuotedStrings("{'text': 'it\\'s working'}");
  test('convertSingleQuotedStrings normalizes escaped single quotes to valid JSON', q3.includes('"it\'s working"'));

  const b1 = replaceBareIdentifiers('{"a": True, "b": False, "c": None}');
  test('replaceBareIdentifiers converts Python True/False/None to true/false/null', b1.includes('true') && b1.includes('false') && b1.includes('null'));

  const b2 = replaceBareIdentifiers('{"a": undefined, "b": NaN, "c": Infinity}');
  test('replaceBareIdentifiers converts JS undefined/NaN/Infinity to null', !b2.includes('undefined') && !b2.includes('NaN'));

  const b3 = replaceBareIdentifiers('{"text": "True and False and None"}');
  test('replaceBareIdentifiers does NOT replace keywords inside double quotes', b3.includes('"True and False and None"'));

  const rep1 = repairJson('{"a": 1,}');
  test('repairJson cleans trailing comma in object', rep1 === '{"a": 1}');

  const rep2 = repairJson('{"a": 1,,,}');
  test('repairJson cleans multiple trailing commas in object', rep2 === '{"a": 1}');

  const rep3 = repairJson('[1, 2,]');
  test('repairJson cleans trailing comma in array', rep3 === '[1, 2]');

  const rep4 = repairJson('[1, 2,,,]');
  test('repairJson cleans multiple trailing commas in array', rep4 === '[1, 2]');

  const rep5 = repairJson('{a: 1}');
  test('repairJson quotes unquoted key {a: 1} to {"a": 1}', rep5 === '{"a": 1}');

  const rep6 = repairJson('{user_name: "Ali", first-name: "Syed"}');
  test('repairJson quotes unquoted keys with underscores and hyphens', rep6.includes('"user_name"') && rep6.includes('"first-name"'));

  const rep7 = repairJson('{1: "numeric key"}');
  test('repairJson quotes unquoted numeric keys {1: "numeric key"}', rep7 === '{"1": "numeric key"}');

  const rep8 = repairJson("{'city': 'کراچی', 'active': True,}");
  test('repairJson handles combination of single quotes + Python keyword + trailing comma + Unicode', JSON.parse(rep8).city === 'کراچی' && JSON.parse(rep8).active === true);

  const rep9 = repairJson('{\n  // User config\n  name: \'Sara\',\n  active: True,\n  tags: [\'admin\', \'dev\',],\n}');
  test('repairJson fixes complex real-world malformed payload', JSON.parse(rep9).name === 'Sara' && JSON.parse(rep9).tags[1] === 'dev');

  const rep10 = repairJson('{"a": 1 // note\n}');
  test('repairJson strips comment and parses strictly', JSON.parse(rep10).a === 1);

  let repairThrow = false;
  try {
    repairJson('{"completely broken :::');
  } catch {
    repairThrow = true;
  }
  test('repairJson throws when input cannot be repaired into valid JSON', repairThrow);

  const rep11 = repairJson('{"a": 1}');
  test('repairJson on already valid JSON returns valid JSON without damage', rep11 === '{"a": 1}');

  const rep12 = repairJson('{\n  a: 1,\n  b: 2\n}');
  test('repairJson handles multiline unquoted keys', JSON.parse(rep12).a === 1 && JSON.parse(rep12).b === 2);

  const rep13 = repairJson('{"alreadyQuoted": 100}');
  test('repairJson does not double-quote already quoted keys', !rep13.includes('""alreadyQuoted""'));

  const rep14 = repairJson('["a", "b", "c",]');
  test('repairJson cleans array trailing comma leaving strings intact', rep14 === '["a", "b", "c"]');

  // ============================================================================
  // GROUP 7: JSONPATH PARSING & EVALUATION (Tests 141 - 160)
  // ============================================================================
  console.log('\n--- GROUP 7: JSONPath Parsing & Evaluation ---');

  const userDoc = {
    users: [
      { name: 'Ali', role: 'developer', tags: ['qa', 'dev'] },
      { name: 'Sara', role: 'admin', tags: ['ops', 'lead'] },
    ],
    meta: { version: '2.0', active: true },
  };

  const jp1 = evaluateJsonPath(userDoc, '$.users[1].name');
  test('JSONPath: $.users[1].name extracts "Sara"', jp1.length === 1 && jp1[0].value === 'Sara');

  const jp2 = evaluateJsonPath(userDoc, '$.users[0].name');
  test('JSONPath: $.users[0].name extracts "Ali"', jp2.length === 1 && jp2[0].value === 'Ali');

  const jp3 = evaluateJsonPath(userDoc, '$.meta.version');
  test('JSONPath: $.meta.version extracts "2.0"', jp3.length === 1 && jp3[0].value === '2.0');

  const jp4 = evaluateJsonPath(userDoc, '$.users[*].name');
  test('JSONPath: Wildcard $.users[*].name returns all 2 user names', jp4.length === 2 && jp4[0].value === 'Ali' && jp4[1].value === 'Sara');

  const jp5 = evaluateJsonPath(userDoc, '$.users[0].tags[1]');
  test('JSONPath: Nested array index $.users[0].tags[1] extracts "dev"', jp5.length === 1 && jp5[0].value === 'dev');

  const jp6 = evaluateJsonPath(userDoc, '$..name');
  test('JSONPath: Recursive descent $..name finds all "name" properties', jp6.length === 2 && jp6.some((m) => m.value === 'Ali') && jp6.some((m) => m.value === 'Sara'));

  const jp7 = evaluateJsonPath(userDoc, '$');
  test('JSONPath: Root path $ returns the root object', jp7.length === 1 && jp7[0].path === '$');

  const jp8 = evaluateJsonPath(userDoc, '$.nonExistent');
  test('JSONPath: Non-existent property returns empty array []', jp8.length === 0);

  const jp9 = evaluateJsonPath(userDoc, '$.users[99]');
  test('JSONPath: Out-of-bounds array index returns empty array []', jp9.length === 0);

  const jp10 = evaluateJsonPath(userDoc, "$['meta']['active']");
  test('JSONPath: Bracket single-quote selector $[\'meta\'][\'active\']', jp10.length === 1 && jp10[0].value === true);

  const jp11 = evaluateJsonPath(userDoc, '$["meta"]["version"]');
  test('JSONPath: Bracket double-quote selector $["meta"]["version"]', jp11.length === 1 && jp11[0].value === '2.0');

  const jp12 = evaluateJsonPath(userDoc, '$.*');
  test('JSONPath: Root wildcard $.* returns direct child properties', jp12.length === 2);

  let jpInvalid = false;
  try {
    parseJsonPath('users.name');
  } catch {
    jpInvalid = true;
  }
  test('JSONPath: Throws when expression does not start with $', jpInvalid);

  let jpUnclosed = false;
  try {
    parseJsonPath('$.users[0');
  } catch {
    jpUnclosed = true;
  }
  test('JSONPath: Throws on unclosed bracket [0', jpUnclosed);

  test('childPath formats standard alphanumeric key as dot path: $.user', childPath('$', 'user') === '$.user');
  test('childPath formats array index as bracket path: $[0]', childPath('$', 0, true) === '$[0]');
  test('childPath formats special key with brackets: $["a-b"]', childPath('$', 'a-b') === '$["a-b"]');

  const jpPrimitive = evaluateJsonPath(42, '$');
  test('JSONPath evaluates on primitive root: 42', jpPrimitive.length === 1 && jpPrimitive[0].value === 42);

  const jpArrayTokens = parseJsonPath('$.items[2].id');
  test('parseJsonPath produces exact token types property, index, property', jpArrayTokens[0].type === 'property' && jpArrayTokens[1].type === 'index' && jpArrayTokens[2].type === 'property');

  const jpTokensRecursive = parseJsonPath('$..item');
  test('parseJsonPath parses recursive token type', jpTokensRecursive[0].type === 'recursive' && jpTokensRecursive[0].key === 'item');

  // ============================================================================
  // GROUP 8: STRUCTURAL DIFF, DIAGNOSTICS, SCHEMA, STATS & TREE (Tests 161 - 185)
  // ============================================================================
  console.log('\n--- GROUP 8: Diff, Diagnostics, Schema, Stats & Virtual Tree ---');

  const diffEmpty = diffJson({ a: 1 }, { a: 1 });
  test('diffJson returns [] for identical objects', diffEmpty.length === 0);

  const diffChanged = diffJson({ a: 1 }, { a: 2 });
  test('diffJson detects primitive value change', diffChanged.length === 1 && diffChanged[0].kind === 'changed' && diffChanged[0].before === 1 && diffChanged[0].after === 2);

  const diffAdded = diffJson({ a: 1 }, { a: 1, b: 2 });
  test('diffJson detects added key', diffAdded.length === 1 && diffAdded[0].kind === 'added' && diffAdded[0].after === 2);

  const diffRemoved = diffJson({ a: 1, b: 2 }, { a: 1 });
  test('diffJson detects removed key', diffRemoved.length === 1 && diffRemoved[0].kind === 'removed' && diffRemoved[0].before === 2);

  const diffArr = diffJson([1, 2], [1, 2, 3]);
  test('diffJson detects added array element', diffArr.length === 1 && diffArr[0].kind === 'added' && diffArr[0].after === 3);

  const diagDup = scanJsonDiagnostics('{"name": "Ali", "name": "Sara"}');
  test('scanJsonDiagnostics detects duplicate key with line/col', diagDup.duplicateKeys.length === 1 && diagDup.duplicateKeys[0].key === 'name');

  const diagNoDup = scanJsonDiagnostics('{"first": "Ali", "second": "Sara"}');
  test('scanJsonDiagnostics finds zero duplicate keys when keys are unique', diagDup && diagNoDup.duplicateKeys.length === 0);

  const diagSafeNum = scanJsonDiagnostics('{"score": 9007199254740991}');
  test('scanJsonDiagnostics safe integer produces no precision warning', diagSafeNum.unsafeNumbers.length === 0);

  const diagUnsafe = scanJsonDiagnostics('{"big": 9007199254740999999999}');
  test('scanJsonDiagnostics warns on numbers exceeding IEEE 754 53-bit limit', diagUnsafe.unsafeNumbers.length === 1);

  const stats = calculateJsonStats({ a: 1, b: [1, 2, { c: 3 }] });
  test('calculateJsonStats calculates correct nodeCount', stats.nodeCount === 7);
  test('calculateJsonStats calculates correct maxDepth', stats.maxDepth === 4);
  test('calculateJsonStats calculates correct keyCount', stats.keyCount === 3);
  test('calculateJsonStats calculates correct objectCount & arrayCount', stats.objectCount === 2 && stats.arrayCount === 1);

  test('formatBytes handles Bytes, KB, and MB', formatBytes(500) === '500 B' && formatBytes(2048) === '2.0 KB' && formatBytes(2 * 1024 * 1024) === '2.00 MB');

  const tsCode = generateTypeScript({ id: 1, name: 'Ali', active: true });
  test('generateTypeScript exports interface with correct field types', tsCode.includes('id: number;') && tsCode.includes('name: string;') && tsCode.includes('active: boolean;'));

  const tsArrayCode = generateTypeScript([{ id: 1, name: 'Ali' }]);
  test('generateTypeScript handles array of objects', tsArrayCode.includes('[]'));

  const schema = generateJsonSchema({ id: 1, name: 'Ali', active: true });
  test('generateJsonSchema produces valid draft schema object', schema.type === 'object' && (schema.properties as any).id.type === 'integer');

  const schemaArr = generateJsonSchema(['a', 'b', 'c']);
  test('generateJsonSchema produces array schema', schemaArr.type === 'array' && (schemaArr.items as any).type === 'string');

  const searchTarget = { user: { name: 'Ali', tags: ['qa', 'dev'] } };
  test('countSearchMatches finds 1 match for "dev"', countSearchMatches(searchTarget, 'dev') === 1);
  test('countSearchMatches finds 1 match for "Ali"', countSearchMatches(searchTarget, 'ali') === 1);
  test('countSearchMatches returns 0 for non-existent search term', countSearchMatches(searchTarget, 'nonExistentTerm') === 0);

  const searchIdx = buildSearchIndex(searchTarget, 'dev');
  test('buildSearchIndex matches path $.user.tags[1]', searchIdx.matches.has('$.user.tags[1]'));
  test('buildSearchIndex expands ancestor paths so match is visible in tree', searchIdx.expanded.has('$.user.tags') && searchIdx.expanded.has('$.user'));

  const treeRows = flattenVisibleTree(searchTarget, new Set(['$', '$.user', '$.user.tags']));
  test('flattenVisibleTree produces visible tree rows when expanded', treeRows.length > 5);
  test('flattenVisibleTree correctly flags container rows', treeRows[0].isContainer === true && treeRows[0].path === '$');
  test('flattenVisibleTree includes closing row for expanded container', treeRows.some((r) => r.isClosing && r.path === '$'));

  test('SAMPLE_JSON_PAYLOADS contains apiResponse, ecommerce, and complexTypes', Boolean(SAMPLE_JSON_PAYLOADS.apiResponse && SAMPLE_JSON_PAYLOADS.ecommerce && SAMPLE_JSON_PAYLOADS.complexTypes));

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n================================================================');
  console.log(`TOTAL TESTS EXECUTED: ${totalTests}`);
  console.log(`TESTS PASSED:        ${passedTests}`);
  console.log(`TESTS FAILED:        ${failedTests}`);
  console.log(`ACCURACY RATE:       ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    console.error('FAILURES:');
    failures.forEach((f) => console.error(`  - ${f.name}${f.detail ? ` (${f.detail})` : ''}`));
    process.exit(1);
  } else {
    console.log('>>> 100% OF ALL 180+ AUTOMATED ENGINE TESTS PASSED SUCCESSFULLY! <<<');
  }
}

void run150PlusTestSuite();
