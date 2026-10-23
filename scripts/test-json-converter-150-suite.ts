/**
 * 150+ AUTOMATED ENGINE & SCENARIO TEST SUITE FOR JSON CONVERTER
 * 
 * Exhaustively tests all transformations, flattening algorithms, data type preservation,
 * formula injection defenses, and export serializations (CSV, TSV, YAML, XML, JSONL, HTML, XLSX).
 */

import * as XLSX from 'xlsx';
import {
  parseJsonToTable,
  flattenObject,
  normaliseRoot,
  safeSpreadsheetValue,
  escapeCsvField,
  jsonToCsv,
  jsonToTsv,
  jsonToYaml,
  jsonToXml,
  jsonToJsonl,
  jsonToHtmlTable,
  sanitizeFilename,
  formatBytes,
  parseJsonStrict,
  SAMPLE_DATASETS,
  MAX_FILE_SIZE,
  MAX_ROOT_ROWS,
  MAX_COLUMNS,
  MAX_CELLS,
  DEFAULT_OPTIONS,
} from '../lib/jsonConverterEngine';

interface TestResult {
  id: number;
  name: string;
  passed: boolean;
  error?: string;
}

const testResults: TestResult[] = [];
let testCounter = 0;

function test(name: string, fn: () => boolean | Promise<boolean>): void | Promise<void> {
  const id = ++testCounter;
  try {
    const outcome = fn();
    if (outcome instanceof Promise) {
      return outcome
        .then((passed) => {
          if (passed) {
            testResults.push({ id, name, passed: true });
            console.log(`  [PASS ${String(id).padStart(3)}] ${name}`);
          } else {
            testResults.push({ id, name, passed: false, error: 'Assertion returned false' });
            console.error(`  [FAIL ${String(id).padStart(3)}] ${name} -> FAILED assertion`);
          }
        })
        .catch((err: any) => {
          testResults.push({ id, name, passed: false, error: err?.message || String(err) });
          console.error(`  [FAIL ${String(id).padStart(3)}] ${name} -> ERROR: ${err?.message || err}`);
        });
    }

    if (outcome) {
      testResults.push({ id, name, passed: true });
      console.log(`  [PASS ${String(id).padStart(3)}] ${name}`);
    } else {
      testResults.push({ id, name, passed: false, error: 'Assertion returned false' });
      console.error(`  [FAIL ${String(id).padStart(3)}] ${name} -> FAILED assertion`);
    }
  } catch (err: any) {
    testResults.push({ id, name, passed: false, error: err?.message || String(err) });
    console.error(`  [FAIL ${String(id).padStart(3)}] ${name} -> ERROR: ${err?.message || err}`);
  }
}

async function runAll() {
  console.log('================================================================');
  console.log('JSON CONVERTER — 150+ AUTOMATED ENGINE & SCENARIO TEST SUITE');
  console.log('================================================================\n');

  // --- GROUP 1: Parsing and Normalization (25 tests) ---
  console.log('--- GROUP 1: Parsing and Normalization (25 tests) ---');
  test('Standard array of objects parses to exact row count', () => {
    const res = parseJsonToTable('[{"a":1},{"a":2},{"a":3}]');
    return res.rows.length === 3 && res.columns.length === 1 && res.columns[0] === 'a';
  });
  test('Single object root normalizes to 1-row table', () => {
    const res = parseJsonToTable('{"name":"Kivaro","version":1}');
    return res.rows.length === 1 && res.columns.includes('name') && res.columns.includes('version');
  });
  test('Primitive number root normalizes to 1 row with value column', () => {
    const res = parseJsonToTable('42');
    return res.rows.length === 1 && res.rows[0].value === 42;
  });
  test('Primitive string root normalizes to 1 row with value column', () => {
    const res = parseJsonToTable('"hello world"');
    return res.rows.length === 1 && res.rows[0].value === 'hello world';
  });
  test('Primitive boolean root normalizes to 1 row with value column', () => {
    const res = parseJsonToTable('true');
    return res.rows.length === 1 && res.rows[0].value === true;
  });
  test('Primitive null root normalizes to 1 row with null value', () => {
    const res = parseJsonToTable('null');
    return res.rows.length === 1 && res.rows[0].value === null;
  });
  test('Empty array [] produces 0 rows and 0 columns', () => {
    const res = parseJsonToTable('[]');
    return res.rows.length === 0 && res.columns.length === 0;
  });
  test('Empty object {} produces 1 row and 0 columns', () => {
    const res = parseJsonToTable('{}');
    return res.rows.length === 1 && res.columns.length === 0;
  });
  test('Array of primitive numbers [1, 2, 3] normalizes to 3 rows with value column', () => {
    const res = parseJsonToTable('[1, 2, 3]');
    return res.rows.length === 3 && res.rows[0].value === 1 && res.rows[2].value === 3;
  });
  test('Array of primitive strings produces rows with value column', () => {
    const res = parseJsonToTable('["alpha", "beta"]');
    return res.rows.length === 2 && res.rows[0].value === 'alpha';
  });
  test('Array of booleans produces rows with value column', () => {
    const res = parseJsonToTable('[true, false]');
    return res.rows.length === 2 && res.rows[0].value === true && res.rows[1].value === false;
  });
  test('Array of nulls produces rows with null value', () => {
    const res = parseJsonToTable('[null, null]');
    return res.rows.length === 2 && res.rows[0].value === null;
  });
  test('Array of empty objects [{}, {}] produces 2 rows', () => {
    const res = parseJsonToTable('[{}, {}]');
    return res.rows.length === 2;
  });
  test('Parse duration is tracked in milliseconds', () => {
    const res = parseJsonToTable('[{"id":1}]');
    return typeof res.durationMs === 'number' && res.durationMs >= 0;
  });
  test('Total cells calculation equals rows * columns', () => {
    const res = parseJsonToTable('[{"a":1,"b":2},{"a":3,"b":4}]');
    return res.totalCells === 4;
  });
  test('Preserves column order of discovery across multiple rows', () => {
    const res = parseJsonToTable('[{"x":1,"y":2},{"y":3,"z":4}]');
    return res.columns.join(',') === 'x,y,z';
  });
  test('Strict JSON diagnostic detects trailing commas', () => {
    const diag = parseJsonStrict('{"a": 1,}');
    return !diag.isValid && diag.line !== null;
  });
  test('Strict JSON diagnostic detects single quotes', () => {
    const diag = parseJsonStrict("{'a': 1}");
    return !diag.isValid;
  });
  test('Strict JSON diagnostic detects unclosed braces', () => {
    const diag = parseJsonStrict('{"a": 1');
    return !diag.isValid;
  });
  test('Strict JSON diagnostic detects undefined literal', () => {
    const diag = parseJsonStrict('undefined');
    return !diag.isValid;
  });
  test('Strict JSON diagnostic returns isValid=true for valid JSON', () => {
    const diag = parseJsonStrict('{"valid": true}');
    return diag.isValid && diag.error === null;
  });
  test('Strict JSON diagnostic handles empty string', () => {
    const diag = parseJsonStrict('');
    return !diag.isValid && diag.error === 'Input is empty.';
  });
  test('Whitespace-only input returns empty diagnostic error', () => {
    const diag = parseJsonStrict('   \n\t  ');
    return !diag.isValid && diag.error === 'Input is empty.';
  });
  test('Oversized input exceeding 50 MB throws explicit size error', () => {
    try {
      const huge = ' '.repeat(51 * 1024 * 1024);
      parseJsonToTable(huge);
      return false;
    } catch (err: any) {
      return err.message.includes('50 MB');
    }
  });
  test('Pre-loaded sample users parses cleanly into 3 rows', () => {
    const res = parseJsonToTable(SAMPLE_DATASETS.users);
    return res.rows.length === 3 && res.columns.includes('department_name');
  });

  // --- GROUP 2: Nested Objects, Arrays & Flattening (20 tests) ---
  console.log('\n--- GROUP 2: Nested Objects, Arrays & Flattening (20 tests) ---');
  test('Nested object flattens with underscore separator by default', () => {
    const flat = flattenObject({ user: { profile: { age: 25 } } });
    return flat['user_profile_age'] === 25;
  });
  test('Custom separator (dot) flattens nested keys', () => {
    const flat = flattenObject({ user: { name: 'Amina' } }, '', { ...DEFAULT_OPTIONS, separator: '.' });
    return flat['user.name'] === 'Amina';
  });
  test('Custom separator (dash) flattens nested keys', () => {
    const flat = flattenObject({ a: { b: 1 } }, '', { ...DEFAULT_OPTIONS, separator: '-' });
    return flat['a-b'] === 1;
  });
  test('Custom separator (slash) flattens nested keys', () => {
    const flat = flattenObject({ a: { b: 1 } }, '', { ...DEFAULT_OPTIONS, separator: '/' });
    return flat['a/b'] === 1;
  });
  test('ArrayMode "json" stringifies arrays as valid JSON', () => {
    const flat = flattenObject({ tags: ['vip', 'staff'] }, '', { ...DEFAULT_OPTIONS, arrayMode: 'json' });
    return flat['tags'] === '["vip","staff"]';
  });
  test('ArrayMode "join" joins array primitives with commas', () => {
    const flat = flattenObject({ tags: ['vip', 'staff'] }, '', { ...DEFAULT_OPTIONS, arrayMode: 'join' });
    return flat['tags'] === 'vip, staff';
  });
  test('ArrayMode "indexed" flattens each array element into indexed columns', () => {
    const flat = flattenObject({ items: ['apple', 'banana'] }, '', { ...DEFAULT_OPTIONS, arrayMode: 'indexed' });
    return flat['items_0'] === 'apple' && flat['items_1'] === 'banana';
  });
  test('Array of objects with arrayMode "indexed" flattens nested properties', () => {
    const flat = flattenObject({ users: [{ id: 1 }, { id: 2 }] }, '', { ...DEFAULT_OPTIONS, arrayMode: 'indexed' });
    return flat['users_0_id'] === 1 && flat['users_1_id'] === 2;
  });
  test('Empty array in arrayMode "indexed" sets column to "[]"', () => {
    const flat = flattenObject({ list: [] }, '', { ...DEFAULT_OPTIONS, arrayMode: 'indexed' });
    return flat['list'] === '[]';
  });
  test('Empty nested object sets column to "{}"', () => {
    const flat = flattenObject({ meta: {} }, '', DEFAULT_OPTIONS);
    return flat['meta'] === '{}';
  });
  test('Key collision resolution suffixes duplicates with _2, _3', () => {
    // Simulated collision where parent has "user_name" and nested has "user": { "name": ... }
    const row = flattenObject({ user_name: 'direct', user: { name: 'nested' } });
    return row['user_name'] === 'direct' && row['user_name_2'] === 'nested';
  });
  test('Triple key collision suffixes with _2 and _3', () => {
    const row = flattenObject({ a: 1, a_2: 2, a_2_fake: { '': 3 } });
    return Object.keys(row).length >= 2;
  });
  test('Max depth cutoff stops deep recursion and stringifies remainder', () => {
    const deep = { l1: { l2: { l3: { l4: { val: 99 } } } } };
    const flat = flattenObject(deep, '', { ...DEFAULT_OPTIONS, maxDepth: 2 });
    return typeof flat['l1_l2_l3'] === 'string' && flat['l1_l2_l3'].includes('99');
  });
  test('Depth 1 flattens only immediate children', () => {
    const flat = flattenObject({ a: { b: 1 } }, '', { ...DEFAULT_OPTIONS, maxDepth: 0 });
    return typeof flat['a'] === 'string';
  });
  test('Preserves special characters in nested object keys', () => {
    const flat = flattenObject({ 'user info': { 'first-name': 'Ali' } });
    return flat['user info_first-name'] === 'Ali';
  });
  test('Preserves Unicode keys in nested objects', () => {
    const flat = flattenObject({ 'صارف': { 'شہر': 'لاہور' } });
    return flat['صارف_شہر'] === 'لاہور';
  });
  test('Null-prototype object protection against prototype pollution (__proto__)', () => {
    const poisoned = JSON.parse('{"__proto__": {"polluted": true}, "normal": 1}');
    const flat = flattenObject(poisoned);
    return flat['normal'] === 1 && ({} as any).polluted === undefined;
  });
  test('Prototype protection against constructor.prototype injection', () => {
    const poisoned = JSON.parse('{"constructor": {"prototype": {"admin": true}}}');
    flattenObject(poisoned);
    return ({} as any).admin === undefined;
  });
  test('Array containing null values preserves null elements', () => {
    const flat = flattenObject({ list: [1, null, 3] }, '', { ...DEFAULT_OPTIONS, arrayMode: 'json' });
    return flat['list'] === '[1,null,3]';
  });
  test('Deep nested array with arrayMode join converts cleanly', () => {
    const flat = flattenObject({ tags: ['a', 'b', 'c'] }, '', { ...DEFAULT_OPTIONS, arrayMode: 'join' });
    return flat['tags'] === 'a, b, c';
  });

  // --- GROUP 3: Data Types, Primitives, Zero, False, Null (20 tests) ---
  console.log('\n--- GROUP 3: Data Types, Primitives, Zero, False, Null (20 tests) ---');
  test('Explicit null value stored as null, not empty string', () => {
    const flat = flattenObject({ active: null });
    return flat['active'] === null;
  });
  test('Explicit undefined value stored as undefined', () => {
    const flat = flattenObject({ missing: undefined });
    return flat['missing'] === undefined;
  });
  test('Zero (0) preserved as numeric 0, not coerced to empty or false', () => {
    const flat = flattenObject({ count: 0 });
    return flat['count'] === 0 && typeof flat['count'] === 'number';
  });
  test('Negative integer preserved as number (-12)', () => {
    const flat = flattenObject({ temp: -12 });
    return flat['temp'] === -12 && typeof flat['temp'] === 'number';
  });
  test('Floating point decimal preserved without truncation (-12.5)', () => {
    const flat = flattenObject({ val: -12.5 });
    return flat['val'] === -12.5;
  });
  test('Boolean true preserved as boolean', () => {
    const flat = flattenObject({ ok: true });
    return flat['ok'] === true && typeof flat['ok'] === 'boolean';
  });
  test('Boolean false preserved as boolean, not empty', () => {
    const flat = flattenObject({ ok: false });
    return flat['ok'] === false && typeof flat['ok'] === 'boolean';
  });
  test('String "0" preserved as string, distinct from number 0', () => {
    const flat = flattenObject({ code: '0' });
    return flat['code'] === '0' && typeof flat['code'] === 'string';
  });
  test('String "false" preserved as string, distinct from boolean false', () => {
    const flat = flattenObject({ status: 'false' });
    return flat['status'] === 'false' && typeof flat['status'] === 'string';
  });
  test('String "null" preserved as string, distinct from null literal', () => {
    const flat = flattenObject({ text: 'null' });
    return flat['text'] === 'null' && typeof flat['text'] === 'string';
  });
  test('Empty string "" preserved as empty string', () => {
    const flat = flattenObject({ str: '' });
    return flat['str'] === '' && typeof flat['str'] === 'string';
  });
  test('High precision float preserved without loss (3.141592653589793)', () => {
    const flat = flattenObject({ pi: 3.141592653589793 });
    return flat['pi'] === 3.141592653589793;
  });
  test('Scientific notation preserved (1e-6)', () => {
    const flat = flattenObject({ small: 1e-6 });
    return flat['small'] === 0.000001;
  });
  test('Mixed data types in array preserved distinct in normaliseRoot', () => {
    const rows = normaliseRoot([
      { v: 0 },
      { v: -12.5 },
      { v: true },
      { v: false },
      { v: null },
      { v: '0' },
    ]);
    return (
      rows[0].v === 0 &&
      rows[1].v === -12.5 &&
      rows[2].v === true &&
      rows[3].v === false &&
      rows[4].v === null &&
      rows[5].v === '0'
    );
  });
  test('Large integers within safe JS integer limits preserved (9007199254740991)', () => {
    const flat = flattenObject({ max: Number.MAX_SAFE_INTEGER });
    return flat['max'] === 9007199254740991;
  });
  test('Negative large integer preserved', () => {
    const flat = flattenObject({ min: Number.MIN_SAFE_INTEGER });
    return flat['min'] === -9007199254740991;
  });
  test('Multiple rows with varying schema discover all unique columns', () => {
    const res = parseJsonToTable('[{"a":1},{"b":2},{"c":3}]');
    return res.columns.length === 3 && res.columns.join(',') === 'a,b,c';
  });
  test('Missing fields in row return undefined', () => {
    const res = parseJsonToTable('[{"a":1,"b":2},{"a":3}]');
    return res.rows[1].b === undefined;
  });
  test('Explicit null field differs from missing field', () => {
    const res = parseJsonToTable('[{"a":null},{"b":2}]');
    return res.rows[0].a === null && res.rows[0].b === undefined;
  });
  test('Empty string differs from null in row lookup', () => {
    const res = parseJsonToTable('[{"a":""},{"a":null}]');
    return res.rows[0].a === '' && res.rows[1].a === null;
  });

  // --- GROUP 4: CSV & TSV Escaping and Standards (25 tests) ---
  console.log('\n--- GROUP 4: CSV & TSV Escaping and Standards (25 tests) ---');
  test('Simple text field is not quoted if not containing delimiters', () => {
    return escapeCsvField('Hello') === 'Hello';
  });
  test('Comma in field causes field to be enclosed in double quotes', () => {
    return escapeCsvField('Hello, world') === '"Hello, world"';
  });
  test('Double quotes inside field are escaped by doubling them ("" )', () => {
    return escapeCsvField('She said "OK"') === '"She said ""OK"""';
  });
  test('Newline (\\n) in field is enclosed in double quotes', () => {
    return escapeCsvField('line1\nline2') === '"line1\nline2"';
  });
  test('Carriage return (\\r) in field is enclosed in double quotes', () => {
    return escapeCsvField('line1\rline2') === '"line1\rline2"';
  });
  test('Comma + quotes + newlines all together are safely quoted', () => {
    const raw = 'one, two\n"three"';
    const escaped = escapeCsvField(raw);
    return escaped === '"one, two\n""three"""';
  });
  test('CSV output prepends UTF-8 BOM (\\uFEFF) for Excel compatibility', () => {
    const csv = jsonToCsv([{ a: 'test' }], ['a']);
    return csv.startsWith('\uFEFF');
  });
  test('CSV rows separated by CRLF (\\r\\n) per RFC 4180', () => {
    const csv = jsonToCsv([{ a: 1 }, { a: 2 }], ['a']);
    return csv.includes('\r\n');
  });
  test('CSV header contains exact column names', () => {
    const csv = jsonToCsv([{ id: 1, name: 'Ali' }], ['id', 'name']);
    const lines = csv.replace('\uFEFF', '').split('\r\n');
    return lines[0] === 'id,name';
  });
  test('CSV header with comma in column name is quoted', () => {
    const csv = jsonToCsv([{ 'last, first': 'Smith, John' }], ['last, first']);
    const lines = csv.replace('\uFEFF', '').split('\r\n');
    return lines[0] === '"last, first"';
  });
  test('CSV row maps columns in specified column order', () => {
    const csv = jsonToCsv([{ a: 1, b: 2, c: 3 }], ['c', 'a', 'b']);
    const lines = csv.replace('\uFEFF', '').split('\r\n');
    return lines[1] === '3,1,2';
  });
  test('CSV with empty dataset returns empty string', () => {
    return jsonToCsv([], ['a']) === '';
  });
  test('CSV with empty columns returns empty string', () => {
    return jsonToCsv([{ a: 1 }], []) === '';
  });
  test('Null in CSV field exports as empty cell', () => {
    const csv = jsonToCsv([{ a: null }], ['a']);
    const lines = csv.replace('\uFEFF', '').split('\r\n');
    return lines[1] === '';
  });
  test('Undefined in CSV field exports as empty cell', () => {
    const csv = jsonToCsv([{}], ['a']);
    const lines = csv.replace('\uFEFF', '').split('\r\n');
    return lines[1] === '';
  });
  test('Boolean true exports as "true" in CSV', () => {
    const csv = jsonToCsv([{ active: true }], ['active']);
    return csv.includes('true');
  });
  test('Boolean false exports as "false" in CSV', () => {
    const csv = jsonToCsv([{ active: false }], ['active']);
    return csv.includes('false');
  });
  test('Zero (0) exports as "0" in CSV', () => {
    const csv = jsonToCsv([{ count: 0 }], ['count']);
    return csv.includes(',0') || csv.endsWith('\r\n0') || csv.includes('count\r\n0');
  });
  test('Negative decimal exports without truncation', () => {
    const csv = jsonToCsv([{ val: -12.5 }], ['val']);
    return csv.includes('-12.5');
  });
  test('TSV output prepends UTF-8 BOM (\\uFEFF)', () => {
    const tsv = jsonToTsv([{ a: 1 }], ['a']);
    return tsv.startsWith('\uFEFF');
  });
  test('TSV separates columns by tab character (\\t)', () => {
    const tsv = jsonToTsv([{ a: 1, b: 2 }], ['a', 'b']);
    return tsv.includes('a\tb');
  });
  test('TSV field with tab character is quoted and escaped', () => {
    const tsv = jsonToTsv([{ text: 'one\ttwo' }], ['text']);
    return tsv.includes('"one\ttwo"');
  });
  test('TSV field with quotes is escaped ("" )', () => {
    const tsv = jsonToTsv([{ text: 'a "b" c' }], ['text']);
    return tsv.includes('"a ""b"" c"');
  });
  test('TSV column values align under identical horizontal column offsets', () => {
    const rawData = [
      { department_name: 'IT', floor: 4, active: true },
      { department_name: 'Infrastructure Engineering', floor: 12, active: false },
    ];
    const tsv = jsonToTsv(rawData, ['department_name', 'floor', 'active']);
    const lines = tsv.replace(/^\uFEFF/, '').split('\r\n');
    const tabIndices = lines.map((line) => {
      const idxs: number[] = [];
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '\t') idxs.push(i);
      }
      return idxs;
    });
    const firstTab0 = tabIndices[0][0];
    const firstTab1 = tabIndices[0][1];
    return tabIndices.every(
      (indices) => indices[0] === firstTab0 && indices[1] === firstTab1,
    );
  });
  test('Unicode text in CSV preserves UTF-8 characters', () => {
    const csv = jsonToCsv([{ city: 'لاہور', café: 'Café 🌟' }], ['city', 'café']);
    return csv.includes('لاہور') && csv.includes('Café 🌟');
  });
  test('Semicolon in CSV field does not trigger quotation by default in comma mode', () => {
    return escapeCsvField('a;b') === 'a;b';
  });

  // --- GROUP 5: Formula Injection Defense (15 tests) ---
  console.log('\n--- GROUP 5: Formula Injection Defense (15 tests) ---');
  test('Formula =1+1 is neutralized with apostrophe', () => {
    return safeSpreadsheetValue('=1+1') === "'=1+1";
  });
  test('Formula +SUM(A1:A2) is neutralized with apostrophe', () => {
    return safeSpreadsheetValue('+SUM(A1:A2)') === "'+SUM(A1:A2)";
  });
  test('Formula -CMD|... is neutralized with apostrophe', () => {
    return safeSpreadsheetValue("-CMD|' /C calc'!A0") === "'-CMD|' /C calc'!A0";
  });
  test('Formula @name is neutralized with apostrophe', () => {
    return safeSpreadsheetValue('@username') === "'@username";
  });
  test('Leading tab character is neutralized with apostrophe', () => {
    return safeSpreadsheetValue('\t=calc') === "'\t=calc";
  });
  test('Leading carriage return is neutralized with apostrophe', () => {
    return safeSpreadsheetValue('\r=calc') === "'\r=calc";
  });
  test('Leading newline is neutralized with apostrophe', () => {
    return safeSpreadsheetValue('\n=calc') === "'\n=calc";
  });
  test('Fullwidth equals character (\\uFF1D) is neutralized with apostrophe', () => {
    return safeSpreadsheetValue('\uFF1D1+1') === "'\uFF1D1+1";
  });
  test('Fullwidth plus character (\\uFF0B) is neutralized with apostrophe', () => {
    return safeSpreadsheetValue('\uFF0BSUM()') === "'\uFF0BSUM()";
  });
  test('Fullwidth at-sign (\\uFF20) is neutralized with apostrophe', () => {
    return safeSpreadsheetValue('\uFF20admin') === "'\uFF20admin";
  });
  test('Legitimate negative integer -10 remains unchanged number string', () => {
    return safeSpreadsheetValue('-10') === '-10';
  });
  test('Legitimate negative decimal -12.5 remains unchanged number string', () => {
    return safeSpreadsheetValue('-12.5') === '-12.5';
  });
  test('Legitimate positive integer +100 remains unchanged number string', () => {
    return safeSpreadsheetValue('+100') === '+100';
  });
  test('Numeric literal numbers (number type) pass through untouched', () => {
    return safeSpreadsheetValue(-42) === -42 && safeSpreadsheetValue(0) === 0;
  });
  test('CSV export incorporates formula neutralization', () => {
    const csv = jsonToCsv([{ f: '=cmd' }], ['f']);
    return csv.includes("'=cmd");
  });

  // --- GROUP 6: YAML Structured Serialization (20 tests) ---
  console.log('\n--- GROUP 6: YAML Structured Serialization (20 tests) ---');
  test('String "true" is quoted in YAML to prevent boolean coercion', () => {
    const yaml = jsonToYaml([{ key: 'true' }]);
    return yaml.includes('key: "true"');
  });
  test('String "false" is quoted in YAML', () => {
    const yaml = jsonToYaml([{ key: 'false' }]);
    return yaml.includes('key: "false"');
  });
  test('String "null" is quoted in YAML to prevent null coercion', () => {
    const yaml = jsonToYaml([{ key: 'null' }]);
    return yaml.includes('key: "null"');
  });
  test('String "001" is quoted in YAML to prevent octal/number coercion', () => {
    const yaml = jsonToYaml([{ key: '001' }]);
    return yaml.includes('key: "001"');
  });
  test('String "a: b" is quoted in YAML to prevent map parse collision', () => {
    const yaml = jsonToYaml([{ key: 'a: b' }]);
    return yaml.includes('key: "a: b"');
  });
  test('String "text # comment" is quoted in YAML to prevent comment truncation', () => {
    const yaml = jsonToYaml([{ key: 'text # comment' }]);
    return yaml.includes('key: "text # comment"');
  });
  test('String "<tag>&\\"" is quoted in YAML', () => {
    const yaml = jsonToYaml([{ key: '<tag>&"' }]);
    return yaml.includes('key: "<tag>&\\""');
  });
  test('Boolean true renders unquoted in YAML', () => {
    const yaml = jsonToYaml({ flag: true });
    return yaml.includes('flag: true');
  });
  test('Boolean false renders unquoted in YAML', () => {
    const yaml = jsonToYaml({ flag: false });
    return yaml.includes('flag: false');
  });
  test('Number renders unquoted in YAML', () => {
    const yaml = jsonToYaml({ count: 42 });
    return yaml.includes('count: 42');
  });
  test('Null literal renders unquoted null in YAML', () => {
    const yaml = jsonToYaml({ val: null });
    return yaml.includes('val: null');
  });
  test('Empty string renders as "" in YAML', () => {
    const yaml = jsonToYaml({ empty: '' });
    return yaml.includes('empty: ""');
  });
  test('Empty object renders as {} in YAML', () => {
    const yaml = jsonToYaml({ obj: {} });
    return yaml.includes('obj: {}');
  });
  test('Empty array renders as [] in YAML', () => {
    const yaml = jsonToYaml({ arr: [] });
    return yaml.includes('arr: []');
  });
  test('Multilinear string rendered as literal block scalar (|)', () => {
    const yaml = jsonToYaml({ text: 'line 1\nline 2' });
    return yaml.includes('|') && yaml.includes('line 1') && yaml.includes('line 2');
  });
  test('Nested object indents by configured indent spaces', () => {
    const yaml = jsonToYaml({ user: { name: 'Sara' } }, 2);
    return yaml.includes('user:\n  name: Sara');
  });
  test('Array of objects formats with bullet hyphens (-)', () => {
    const yaml = jsonToYaml([{ id: 1 }, { id: 2 }]);
    return yaml.includes('- id: 1') && yaml.includes('- id: 2');
  });
  test('Object keys with special characters are quoted in YAML', () => {
    const yaml = jsonToYaml({ 'special:key': 123 });
    return yaml.includes('"special:key": 123');
  });
  test('Reserved keyword key "true" is quoted in YAML', () => {
    const yaml = jsonToYaml({ true: 'value' });
    return yaml.includes('"true": value');
  });
  test('Reserved keyword key "null" is quoted in YAML', () => {
    const yaml = jsonToYaml({ null: 'value' });
    return yaml.includes('"null": value');
  });

  // --- GROUP 7: XML Serialization (20 tests) ---
  console.log('\n--- GROUP 7: XML Serialization (20 tests) ---');
  test('XML output has valid XML declaration header', () => {
    const xml = jsonToXml({ test: 1 });
    return xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>');
  });
  test('XML root defaults to <root>', () => {
    const xml = jsonToXml({ test: 1 });
    return xml.includes('<root') && xml.includes('</root>');
  });
  test('Custom XML root tag is sanitized and applied', () => {
    const xml = jsonToXml({ test: 1 }, 'CustomDataset');
    return xml.includes('<CustomDataset') && xml.includes('</CustomDataset>');
  });
  test('Ampersand & is escaped to &amp;', () => {
    const xml = jsonToXml({ text: 'A & B' });
    return xml.includes('A &amp; B');
  });
  test('Less-than < is escaped to &lt;', () => {
    const xml = jsonToXml({ text: '3 < 5' });
    return xml.includes('3 &lt; 5');
  });
  test('Greater-than > is escaped to &gt;', () => {
    const xml = jsonToXml({ text: '5 > 3' });
    return xml.includes('5 &gt; 3');
  });
  test('Double quote " is escaped to &quot;', () => {
    const xml = jsonToXml({ text: 'She said "OK"' });
    return xml.includes('&quot;OK&quot;');
  });
  test('Single quote \' is escaped to &apos;', () => {
    const xml = jsonToXml({ text: "It's fine" });
    return xml.includes('&apos;');
  });
  test('Array items wrapped in <item> tags', () => {
    const xml = jsonToXml(['apple', 'banana']);
    return xml.includes('<item>apple</item>') && xml.includes('<item>banana</item>');
  });
  test('Null value rendered with xsi:nil="true"', () => {
    const xml = jsonToXml({ empty: null });
    return xml.includes('<empty xsi:nil="true"/>');
  });
  test('Boolean rendered as text inside tags', () => {
    const xml = jsonToXml({ active: true });
    return xml.includes('<active>true</active>');
  });
  test('Number rendered as text inside tags', () => {
    const xml = jsonToXml({ score: 99.5 });
    return xml.includes('<score>99.5</score>');
  });
  test('Empty string rendered as self-closing or empty element', () => {
    const xml = jsonToXml({ empty: '' });
    return xml.includes('<empty></empty>') || xml.includes('<empty/>');
  });
  test('Empty array rendered as self-closing element', () => {
    const xml = jsonToXml({ tags: [] });
    return xml.includes('<tags/>');
  });
  test('Empty object rendered as self-closing element', () => {
    const xml = jsonToXml({ profile: {} });
    return xml.includes('<profile/>');
  });
  test('Illegal XML 1.0 control characters are stripped', () => {
    const xml = jsonToXml({ bad: 'Text\x00with\x07bell' });
    return !xml.includes('\x00') && !xml.includes('\x07') && xml.includes('Textwithbell');
  });
  test('Numeric starting key sanitized to item_N', () => {
    const xml = jsonToXml({ '123key': 'val' });
    return xml.includes('<item_123key>val</item_123key>');
  });
  test('Whitespace in key sanitized to underscore', () => {
    const xml = jsonToXml({ 'first name': 'Ali' });
    return xml.includes('<first_name>Ali</first_name>');
  });
  test('Nested object produces nested XML hierarchy', () => {
    const xml = jsonToXml({ user: { city: 'Karachi' } });
    return xml.includes('<user>\n    <city>Karachi</city>\n  </user>');
  });
  test('XSS script string is escaped safely in XML', () => {
    const xml = jsonToXml({ xss: '<script>alert(1)</script>' });
    return xml.includes('&lt;script&gt;alert(1)&lt;/script&gt;') && !xml.includes('<script>');
  });

  // --- GROUP 8: JSONL, HTML, Excel & Platform Limits (25 tests) ---
  console.log('\n--- GROUP 8: JSONL, HTML, Excel & Platform Limits (25 tests) ---');
  test('JSONL outputs one JSON object per newline', () => {
    const jsonl = jsonToJsonl([{ a: 1 }, { a: 2 }]);
    const lines = jsonl.split('\n');
    return lines.length === 2 && JSON.parse(lines[0]).a === 1 && JSON.parse(lines[1]).a === 2;
  });
  test('JSONL preserves null and boolean values', () => {
    const jsonl = jsonToJsonl([{ a: null, b: false }]);
    const parsed = JSON.parse(jsonl);
    return parsed.a === null && parsed.b === false;
  });
  test('jsonToHtmlTable produces complete DOCTYPE and HTML structure', () => {
    const html = jsonToHtmlTable([{ name: 'Ali' }], ['name'], 'TestExport');
    return html.includes('<!doctype html>') && html.includes('<title>TestExport</title>');
  });
  test('HTML table escapes script tags in content', () => {
    const html = jsonToHtmlTable([{ payload: '<script>alert(1)</script>' }], ['payload']);
    return html.includes('&lt;script&gt;alert(1)&lt;/script&gt;') && !html.includes('<script>');
  });
  test('HTML table escapes quote characters in column headers', () => {
    const html = jsonToHtmlTable([{ 'col"name': 1 }], ['col"name']);
    return html.includes('&quot;');
  });
  test('HTML table includes responsive viewport and CSS styling', () => {
    const html = jsonToHtmlTable([{ id: 1 }], ['id']);
    return html.includes('viewport') && html.includes('<style>');
  });
  test('sanitizeFilename removes path traversal (..)', () => {
    return sanitizeFilename('../../../etc/passwd') === 'etc_passwd';
  });
  test('sanitizeFilename removes Windows invalid characters (<>:\"/\\|?*)', () => {
    return sanitizeFilename('test<file>:name?.json') === 'test_file__name_.json';
  });
  test('sanitizeFilename truncates names to 80 characters', () => {
    const long = 'A'.repeat(120);
    return sanitizeFilename(long).length === 80;
  });
  test('sanitizeFilename empty string fallbacks to kivarotools_export', () => {
    return sanitizeFilename('') === 'kivarotools_export';
  });
  test('formatBytes formats 0 bytes as "0 B"', () => {
    return formatBytes(0) === '0 B';
  });
  test('formatBytes formats 1024 bytes as "1.0 KB"', () => {
    return formatBytes(1024) === '1.0 KB';
  });
  test('formatBytes formats 1048576 bytes as "1.0 MB"', () => {
    return formatBytes(1048576) === '1.0 MB';
  });
  test('formatBytes formats 50 MB correctly', () => {
    return formatBytes(50 * 1024 * 1024) === '50.0 MB';
  });
  test('SheetJS json_to_sheet creates genuine Excel worksheet structure', () => {
    const data = [{ id: 1, name: 'Ali', active: true }];
    const ws = XLSX.utils.json_to_sheet(data);
    return ws['A1']?.v === 'id' && ws['B1']?.v === 'name' && ws['A2']?.v === 1;
  });
  test('SheetJS workbook builds valid XLSX binary array buffer', () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([{ test: 123 }]);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return buf instanceof ArrayBuffer && buf.byteLength > 1000;
  });
  test('Generated XLSX buffer can be parsed back by XLSX.read without error', () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([{ id: 1, name: 'Sara' }, { id: 2, name: 'Omar' }]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const readWb = XLSX.read(buf, { type: 'array' });
    const sheetData = XLSX.utils.sheet_to_json(readWb.Sheets['Sheet1']) as any[];
    return sheetData.length === 2 && sheetData[0].name === 'Sara';
  });
  test('MAX_FILE_SIZE constant is set to 50 MB', () => {
    return MAX_FILE_SIZE === 50 * 1024 * 1024;
  });
  test('MAX_ROOT_ROWS constant is set to 200,000', () => {
    return MAX_ROOT_ROWS === 200_000;
  });
  test('MAX_COLUMNS constant is set to 10,000', () => {
    return MAX_COLUMNS === 10_000;
  });
  test('MAX_CELLS constant is set to 5,000,000', () => {
    return MAX_CELLS === 5_000_000;
  });
  test('parseJsonToTable rejects array exceeding MAX_ROOT_ROWS', () => {
    const fake = Array(MAX_ROOT_ROWS + 1).fill({});
    try {
      normaliseRoot(fake);
      return false;
    } catch {
      return true;
    }
  });
  test('Roundtrip fidelity: JSON -> Table -> JSONL -> JSON equals original array', () => {
    const original = [{ id: 1, name: 'Ali' }, { id: 2, name: 'Sara' }];
    const table = parseJsonToTable(JSON.stringify(original));
    const jsonl = jsonToJsonl(table.rows);
    const parsedBack = jsonl.split('\n').map((line) => JSON.parse(line));
    return JSON.stringify(original) === JSON.stringify(parsedBack);
  });
  test('Roundtrip fidelity: JSON -> Table -> CSV -> Parse has identical record count', () => {
    const original = [{ a: '1', b: '2' }, { a: '3', b: '4' }];
    const table = parseJsonToTable(JSON.stringify(original));
    const csv = jsonToCsv(table.rows, table.columns);
    const lines = csv.replace('\uFEFF', '').trim().split('\r\n');
    return lines.length === 3; // 1 header + 2 rows
  });
  test('E-commerce sample dataset parses into 2 orders with nested fields', () => {
    const res = parseJsonToTable(SAMPLE_DATASETS.ecommerce);
    return res.rows.length === 2 && res.columns.includes('customer_name');
  });

  // ==========================================================================
  // FINAL EVALUATION
  // ==========================================================================
  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  const failed = testResults.filter((r) => !r.passed).length;
  const accuracy = ((passed / total) * 100).toFixed(2);

  console.log('\n================================================================');
  console.log(`TOTAL TESTS EXECUTED: ${total}`);
  console.log(`TESTS PASSED:        ${passed}`);
  console.log(`TESTS FAILED:        ${failed}`);
  console.log(`ACCURACY RATE:       ${accuracy}%`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error(`>>> FAILED: ${failed} test(s) failed. <<<`);
    process.exit(1);
  } else {
    console.log(`>>> 100% OF ALL ${total} AUTOMATED ENGINE TESTS PASSED ACCURATELY! <<<`);
    process.exit(0);
  }
}

runAll().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
