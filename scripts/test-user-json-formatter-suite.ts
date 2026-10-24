/**
 * Automated Verification Script for User-Specified Test Cases
 * Validates Core tests 1-8, Invalid JSON tests, Tree/Search/Query tests 9-11, and Release Checklist.
 */

import {
  parseJsonStrict,
  formatJson,
  minifyJson,
  sortJsonKeys,
  repairJson,
  evaluateJsonPath,
  flattenVisibleTree,
  buildSearchIndex,
  countSearchMatches,
  jsonEqual,
} from '../lib/jsonFormatterEngine';

interface TestCaseResult {
  id: string;
  category: string;
  title: string;
  input: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestCaseResult[] = [];

function record(res: TestCaseResult) {
  results.push(res);
  const mark = res.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
  console.log(`${mark} | ${res.id}. ${res.title}`);
}

async function runUserTests() {
  console.log('================================================================');
  console.log('USER-SPECIFIED JSON FORMATTER & VALIDATOR VERIFICATION TESTS');
  console.log('================================================================\n');

  // -------------------------------------------------------------------------
  // CORE TESTS 1 - 8
  // -------------------------------------------------------------------------

  // 1. Basic formatting
  const input1 = '{"name":"Ali","active":true,"score":12}';
  const expected1 = '{\n  "name": "Ali",\n  "active": true,\n  "score": 12\n}';
  const actual1 = formatJson(JSON.parse(input1), { indent: 2 });
  record({
    id: 'Core-1',
    category: 'Core Tests',
    title: 'Basic formatting (2 spaces indentation)',
    input: input1,
    expected: expected1,
    actual: actual1,
    status: actual1 === expected1 ? 'PASS' : 'FAIL',
  });

  // 2. Nested object aur array
  const input2 = '{"user":{"name":"Sara","address":{"city":"Lahore","zip":"54000"}},"roles":["admin","editor"]}';
  const expected2 = '{\n  "user": {\n    "name": "Sara",\n    "address": {\n      "city": "Lahore",\n      "zip": "54000"\n    }\n  },\n  "roles": [\n    "admin",\n    "editor"\n  ]\n}';
  const actual2 = formatJson(JSON.parse(input2), { indent: 2 });
  record({
    id: 'Core-2',
    category: 'Core Tests',
    title: 'Nested object and array',
    input: input2,
    expected: expected2,
    actual: actual2,
    status: actual2 === expected2 ? 'PASS' : 'FAIL',
  });

  // 3. Empty object aur array
  const input3 = '{"items":[],"metadata":{}}';
  const expected3 = '{\n  "items": [],\n  "metadata": {}\n}';
  const actual3 = formatJson(JSON.parse(input3), { indent: 2 });
  record({
    id: 'Core-3',
    category: 'Core Tests',
    title: 'Empty object and array',
    input: input3,
    expected: expected3,
    actual: actual3,
    status: actual3 === expected3 ? 'PASS' : 'FAIL',
  });

  // 4. null, boolean aur numbers
  const input4 = '{"nothing":null,"yes":true,"no":false,"integer":0,"decimal":-12.5,"exponent":1e3}';
  const parsed4 = JSON.parse(input4);
  const actual4 = formatJson(parsed4, { indent: 2 });
  const isNumeric1000 = parsed4.exponent === 1000 && typeof parsed4.exponent === 'number';
  const notConvertedToString = typeof parsed4.integer === 'number' && typeof parsed4.decimal === 'number' && typeof parsed4.yes === 'boolean' && parsed4.nothing === null;
  record({
    id: 'Core-4',
    category: 'Core Tests',
    title: 'null, boolean and numbers (preserve types & 1e3 numeric value 1000)',
    input: input4,
    expected: 'exponent is numeric 1000, numbers/booleans/null NOT converted to strings',
    actual: `exponent=${parsed4.exponent} (type ${typeof parsed4.exponent}), integer=${typeof parsed4.integer}`,
    status: isNumeric1000 && notConvertedToString ? 'PASS' : 'FAIL',
  });

  // 5. Unicode text
  const input5 = '{"city":"کراچی","emoji":"🌟","text":"café"}';
  const parsed5 = JSON.parse(input5);
  const actual5 = formatJson(parsed5, { indent: 2 });
  const hasUrdu = actual5.includes('کراچی');
  const hasEmoji = actual5.includes('🌟');
  const hasAccented = actual5.includes('café');
  record({
    id: 'Core-5',
    category: 'Core Tests',
    title: 'Unicode text (Urdu کراچی, emoji 🌟, accented café)',
    input: input5,
    expected: 'Urdu, emoji, accented characters preserved without corruption',
    actual: actual5.replace(/\s+/g, ' '),
    status: hasUrdu && hasEmoji && hasAccented ? 'PASS' : 'FAIL',
  });

  // 6. Escaped characters
  const input6 = '{"quote":"She said \\"hello\\"","path":"C:\\\\Users\\\\Ali","line":"first\\nsecond"}';
  const parsed6 = JSON.parse(input6);
  const actual6 = formatJson(parsed6, { indent: 2 });
  const preservesQuoteEscape = actual6.includes('\\"hello\\"');
  const preservesBackslash = actual6.includes('C:\\\\Users\\\\Ali');
  const preservesNewlineEscape = actual6.includes('first\\nsecond') && !actual6.includes('first\nsecond');
  record({
    id: 'Core-6',
    category: 'Core Tests',
    title: 'Escaped characters (quotes \\", backslash \\\\, newline \\n preserved)',
    input: input6,
    expected: 'Quotes, backslash, \\n escape preserved as JSON escape',
    actual: actual6.replace(/\s+/g, ' '),
    status: preservesQuoteEscape && preservesBackslash && preservesNewlineEscape ? 'PASS' : 'FAIL',
  });

  // 7. Minify
  const input7 = '{\n  "a": 1,\n  "b": [true, false]\n}';
  const expected7 = '{"a":1,"b":[true,false]}';
  const actual7 = minifyJson(JSON.parse(input7));
  record({
    id: 'Core-7',
    category: 'Core Tests',
    title: 'Minify whitespace reduction without data alteration',
    input: input7.replace(/\n/g, ' '),
    expected: expected7,
    actual: actual7,
    status: actual7 === expected7 ? 'PASS' : 'FAIL',
  });

  // 8. Sort keys
  const input8 = '{"z":1,"a":2,"m":3}';
  const expected8 = '{\n  "a": 2,\n  "m": 3,\n  "z": 1\n}';
  const actual8 = formatJson(sortJsonKeys(JSON.parse(input8)), { indent: 2 });
  const arrPreserved = JSON.stringify(sortJsonKeys([9, 2, 5])) === '[9,2,5]';
  record({
    id: 'Core-8',
    category: 'Core Tests',
    title: 'Sort keys (object keys sorted alphabetically, array order untouched)',
    input: input8,
    expected: expected8,
    actual: actual8,
    status: actual8 === expected8 && arrPreserved ? 'PASS' : 'FAIL',
  });

  // 8b. Sort keys in Tree flattening
  const treeSorted = flattenVisibleTree(JSON.parse(input8), new Set(['$']), 100, true);
  const treeKeys = treeSorted.filter(r => r.keyName !== null).map(r => r.keyName);
  const treeKeysSorted = JSON.stringify(treeKeys) === JSON.stringify(['a', 'm', 'z']);
  record({
    id: 'Core-8b',
    category: 'Core Tests',
    title: 'Sort keys in Virtual Tree view (rows displayed alphabetically)',
    input: input8,
    expected: '["a", "m", "z"]',
    actual: JSON.stringify(treeKeys),
    status: treeKeysSorted ? 'PASS' : 'FAIL',
  });

  // -------------------------------------------------------------------------
  // INVALID JSON TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- INVALID JSON TESTS ---');

  // Trailing comma
  const inv1 = parseJsonStrict('{"a":1,}');
  record({
    id: 'Inv-1',
    category: 'Invalid JSON Tests',
    title: 'Trailing comma rejected',
    input: '{"a":1,}',
    expected: 'Reject: extra/trailing comma',
    actual: inv1.error ?? 'Valid (unexpected)',
    status: !inv1.isValid ? 'PASS' : 'FAIL',
  });

  // Single quotes
  const inv2 = parseJsonStrict("{'a':1}");
  record({
    id: 'Inv-2',
    category: 'Invalid JSON Tests',
    title: 'Single quotes rejected',
    input: "{'a':1}",
    expected: 'Reject: JSON strings require double quotes',
    actual: inv2.error ?? 'Valid (unexpected)',
    status: !inv2.isValid ? 'PASS' : 'FAIL',
  });

  // Missing value
  const inv3 = parseJsonStrict('{"a":}');
  record({
    id: 'Inv-3',
    category: 'Invalid JSON Tests',
    title: 'Missing value rejected',
    input: '{"a":}',
    expected: 'Reject: value missing',
    actual: inv3.error ?? 'Valid (unexpected)',
    status: !inv3.isValid ? 'PASS' : 'FAIL',
  });

  // Missing comma
  const inv4 = parseJsonStrict('{"a":1 "b":2}');
  record({
    id: 'Inv-4',
    category: 'Invalid JSON Tests',
    title: 'Missing comma separator rejected',
    input: '{"a":1 "b":2}',
    expected: 'Reject: separator/comma missing',
    actual: inv4.error ?? 'Valid (unexpected)',
    status: !inv4.isValid ? 'PASS' : 'FAIL',
  });

  // Unquoted key
  const inv5 = parseJsonStrict('{a:1}');
  record({
    id: 'Inv-5',
    category: 'Invalid JSON Tests',
    title: 'Unquoted key rejected',
    input: '{a:1}',
    expected: 'Reject: key must be in double quotes',
    actual: inv5.error ?? 'Valid (unexpected)',
    status: !inv5.isValid ? 'PASS' : 'FAIL',
  });

  // Comment in strict mode
  const inv6 = parseJsonStrict('{"a":1 // note\n}');
  record({
    id: 'Inv-6',
    category: 'Invalid JSON Tests',
    title: 'Comment rejected in strict JSON mode',
    input: '{"a":1 // note}',
    expected: 'Reject: comments disallowed in strict RFC 8259',
    actual: inv6.error ?? 'Valid (unexpected)',
    status: !inv6.isValid ? 'PASS' : 'FAIL',
  });

  // Empty input
  const inv7 = parseJsonStrict('');
  record({
    id: 'Inv-7',
    category: 'Invalid JSON Tests',
    title: 'Empty input rejected with clear error',
    input: '(empty)',
    expected: 'Reject: cannot be empty or whitespace-only',
    actual: inv7.error ?? 'Valid (unexpected)',
    status: !inv7.isValid && Boolean(inv7.error?.includes('Empty input')) ? 'PASS' : 'FAIL',
  });

  // -------------------------------------------------------------------------
  // TREE, SEARCH AUR QUERY TESTS (9 - 11)
  // -------------------------------------------------------------------------
  console.log('\n--- TREE, SEARCH AUR QUERY TESTS ---');

  // 9. Tree view / Expand-Collapse
  const input9 = '{"user":{"name":"Ali","tags":["qa","dev"]}}';
  const parsed9 = JSON.parse(input9);
  const rowsExpanded = flattenVisibleTree(parsed9, new Set(['$', '$.user', '$.user.tags']));
  const rowsCollapsed = flattenVisibleTree(parsed9, new Set(['$']));
  const hasUserAndTags = rowsExpanded.some((r) => r.keyName === 'name') && rowsExpanded.some((r) => r.path === '$.user.tags');
  const collapsePreservesData = jsonEqual(parsed9, JSON.parse(input9)) && rowsCollapsed.length < rowsExpanded.length;
  record({
    id: 'Tree-9',
    category: 'Tree & Search',
    title: 'Tree view / Expand-Collapse (view toggles without mutating data)',
    input: input9,
    expected: 'tree shows user, name, tags (qa, dev); collapse/expand preserves data',
    actual: `expandedRows=${rowsExpanded.length}, collapsedRows=${rowsCollapsed.length}, dataEqual=${collapsePreservesData}`,
    status: hasUserAndTags && collapsePreservesData ? 'PASS' : 'FAIL',
  });

  // 10. Search
  const searchMatches = countSearchMatches(parsed9, 'dev');
  const searchIdx = buildSearchIndex(parsed9, 'dev');
  const matchLocated = searchIdx.matches.has('$.user.tags[1]');
  const ancestorAutoExpanded = searchIdx.expanded.has('$.user.tags') && searchIdx.expanded.has('$.user');
  const searchDoesNotMutate = jsonEqual(parsed9, JSON.parse(input9));
  record({
    id: 'Search-10',
    category: 'Tree & Search',
    title: 'Search "dev" highlights match location without modifying data',
    input: 'search "dev" on {"user":{"name":"Ali","tags":["qa","dev"]}}',
    expected: 'match location highlighted, ancestor paths expanded, zero mutation',
    actual: `matches=${searchMatches}, matchPath=${[...searchIdx.matches].join(',')}, dataPreserved=${searchDoesNotMutate}`,
    status: matchLocated && ancestorAutoExpanded && searchDoesNotMutate ? 'PASS' : 'FAIL',
  });

  // 11. JSONPath / query
  const input11 = '{"users":[{"name":"Ali"},{"name":"Sara"}]}';
  const query11 = '$.users[1].name';
  const jpResults11 = evaluateJsonPath(JSON.parse(input11), query11);
  const actualJpResult = jpResults11.length === 1 ? jpResults11[0].value : null;
  const serializedActualJp = JSON.stringify(actualJpResult);
  record({
    id: 'Query-11',
    category: 'Tree & Search',
    title: 'JSONPath query: $.users[1].name',
    input: input11,
    expected: '"Sara"',
    actual: serializedActualJp,
    status: actualJpResult === 'Sara' && serializedActualJp === '"Sara"' ? 'PASS' : 'FAIL',
  });

  // -------------------------------------------------------------------------
  // RELEASE CHECKLIST
  // -------------------------------------------------------------------------
  console.log('\n--- RELEASE CHECKLIST ---');

  // Checklist 1: Format -> Minify -> Format data preservation
  const chkSample = { complex: { list: [1, 2, { inner: 'val' }], ok: true, nothing: null } };
  const chkFmt1 = formatJson(chkSample, { indent: 2 });
  const chkMin = minifyJson(JSON.parse(chkFmt1));
  const chkFmt2 = formatJson(JSON.parse(chkMin), { indent: 2 });
  const chkEqual = jsonEqual(chkSample, JSON.parse(chkFmt2));
  record({
    id: 'Checklist-1',
    category: 'Release Checklist',
    title: 'Format -> Minify -> Format preserves 100% data integrity',
    input: 'complex nested object with mixed primitives',
    expected: 'chkFmt1 === chkFmt2 and deep equality preserved',
    actual: `chkFmt1 === chkFmt2: ${chkFmt1 === chkFmt2}`,
    status: chkFmt1 === chkFmt2 && chkEqual ? 'PASS' : 'FAIL',
  });

  // Checklist 2: Non-destructive Repair mode inspection
  const malformedInput = '{\n  // User note\n  name: \'Ali\',\n  active: True,\n  tags: [1, 2,],\n}';
  const repairedOutput = repairJson(malformedInput);
  const parsedRepaired = JSON.parse(repairedOutput);
  const originalNotOverwritten = malformedInput.includes('// User note'); // original string is never mutated in memory
  record({
    id: 'Checklist-2',
    category: 'Release Checklist',
    title: 'Repair option: Fixes comments, single quotes, Python keywords, trailing commas; preserves original input',
    input: malformedInput.replace(/\n/g, ' '),
    expected: 'Repaired successfully, produces valid JSON without mutating original source',
    actual: `name=${parsedRepaired.name}, active=${parsedRepaired.active}, tagsCount=${parsedRepaired.tags.length}, originalPreserved=${originalNotOverwritten}`,
    status: parsedRepaired.name === 'Ali' && parsedRepaired.active === true && parsedRepaired.tags.length === 2 && originalNotOverwritten ? 'PASS' : 'FAIL',
  });

  // Checklist 3: Invalid input does not falsely mark valid or crash
  const allInvalid = ['{"a":1,}', "{'a':1}", '{"a":}', '{"a":1 "b":2}', '{a:1}', ''];
  const allProperlyRejected = allInvalid.every((inv) => !parseJsonStrict(inv).isValid);
  record({
    id: 'Checklist-3',
    category: 'Release Checklist',
    title: 'Invalid inputs never crash or falsely report valid status',
    input: 'All 6 invalid syntax patterns',
    expected: '100% rejected with isValid: false and descriptive error',
    actual: `All 6 rejected: ${allProperlyRejected}`,
    status: allProperlyRejected ? 'PASS' : 'FAIL',
  });

  console.log('\n================================================================');
  console.log(`TOTAL USER TESTS: ${results.length}`);
  console.log(`PASSED:          ${results.filter((r) => r.status === 'PASS').length}`);
  console.log(`FAILED:          ${results.filter((r) => r.status === 'FAIL').length}`);
  console.log('================================================================\n');

  if (results.some((r) => r.status === 'FAIL')) {
    process.exit(1);
  }
}

void runUserTests();
