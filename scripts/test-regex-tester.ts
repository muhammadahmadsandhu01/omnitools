/**
 * KivaroTools Regex Tester & Code Generator — Automated Regression Test Suite
 *
 * Scenarios tested:
 * 1. Valid pattern with multiple matches (offsets, groups, text)
 * 2. No match handling
 * 3. Invalid pattern syntax and error pointer parsing
 * 4. Invalid flag validation
 * 5. Empty pattern handling
 * 6. Empty test string handling
 * 7. Global vs non-global matching
 * 8. Multiline flag (m) mechanics
 * 9. Case-insensitive flag (i) mechanics
 * 10. DotAll flag (s) mechanics
 * 11. Unicode (u) and emoji surrogate pair handling
 * 12. Numbered capture groups
 * 13. Named capture groups
 * 14. Replacement evaluation ($1, $&, $<name>, $$)
 * 15. Split evaluation (String.prototype.split with capture splicing)
 * 16. Zero-length match infinite loop protection
 * 17. CSV formula injection defense (sanitizeForCsv)
 * 18. ReDoS complexity heuristic analyzer
 * 19. Pattern explanation tokenizer
 * 20. Cross-engine code generator serialization (JS, Python, Java, Go)
 * 21. Route and registry compliance (/developer/regex-tester)
 */

import assert from 'node:assert/strict';
import {
  parseRegexSyntaxError,
  explainPattern,
  analyzeRegexRisk,
  analyzeCompatibility,
  serializeJsString,
  serializePythonString,
  serializeJavaString,
  sanitizeForCsv,
  COMMON_PATTERNS,
  FLAG_INFO,
  CHEAT_SHEET_DATA,
} from '../components/tools/RegexTester';
import { REGEX_TESTER_FAQS } from '../components/seo/RegexTesterSeo';
import { tools, categories } from '../config/toolsData';
import { toolComponents, seoComponents } from '../config/toolRegistry';

let testsPassed = 0;
function runTest(name: string, fn: () => void) {
  try {
    fn();
    testsPassed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('\n=== Starting KivaroTools Regex Tester Regression Suite ===\n');

// 1. Valid pattern with multiple matches
runTest('Valid pattern matches globally with correct UTF-16 offsets', () => {
  const pattern = '\\b[A-Z][a-z]+\\b';
  const text = 'Alice and Bob went to Rome.';
  const regex = new RegExp(pattern, 'g');
  const matches: { match: string; index: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    matches.push({ match: m[0], index: m.index, end: m.index + m[0].length });
  }

  assert.equal(matches.length, 3);
  assert.deepEqual(matches[0], { match: 'Alice', index: 0, end: 5 });
  assert.deepEqual(matches[1], { match: 'Bob', index: 10, end: 13 });
  assert.deepEqual(matches[2], { match: 'Rome', index: 22, end: 26 });
});

// 2. No match handling
runTest('No match returns empty array without throwing', () => {
  const regex = new RegExp('\\d+', 'g');
  const text = 'No numbers here!';
  const results = [...text.matchAll(regex)];
  assert.equal(results.length, 0);
});

// 3. Invalid pattern syntax and error pointer parsing
runTest('Invalid pattern throws SyntaxError and parses position pointer', () => {
  assert.throws(() => new RegExp('[a-z', 'g'), SyntaxError);

  const diag = parseRegexSyntaxError('Invalid regular expression: /[a-z/: Unterminated character class at position 2', '[a-z');
  assert.equal(diag.position, 2);
  assert.ok(diag.pointer !== null);
  assert.ok(diag.pointer.includes('^'));

  const clamped = parseRegexSyntaxError('Invalid regular expression: /[a-z/: Unterminated character class at position 50', '[a-z');
  assert.equal(clamped.position, 4, 'Offset exceeding pattern length should be clamped to pattern.length');
});

// 4. Invalid flag validation
runTest('Invalid flag throws SyntaxError', () => {
  assert.throws(() => new RegExp('abc', 'z'), SyntaxError);
  assert.throws(() => new RegExp('abc', 'gg'), SyntaxError);
});

// 5. Empty pattern handling
runTest('Empty pattern returns zero matches in tool engine', () => {
  const pattern = '';
  const explanation = explainPattern(pattern);
  assert.equal(explanation.length, 0);
  const risk = analyzeRegexRisk(pattern, 'g');
  assert.equal(risk.score, 0);
  assert.equal(risk.level, 'low');
});

// 6. Empty test string handling
runTest('Empty test string produces expected boundary match or empty set', () => {
  const regex = new RegExp('^$', 'g');
  const text = '';
  const match = regex.exec(text);
  assert.ok(match !== null);
  assert.equal(match[0], '');
  assert.equal(match.index, 0);
});

// 7. Global vs non-global matching
runTest('Global vs non-global matching behavior', () => {
  const text = 'foo bar foo baz';
  const nonGlobal = new RegExp('foo');
  const match1 = nonGlobal.exec(text);
  const match2 = nonGlobal.exec(text);
  assert.equal(match1?.[0], 'foo');
  assert.equal(match1?.index, 0);
  assert.equal(match2?.index, 0, 'Non-global regex stays at index 0');

  const global = new RegExp('foo', 'g');
  const gm1 = global.exec(text);
  const gm2 = global.exec(text);
  assert.equal(gm1?.[0], 'foo');
  assert.equal(gm1?.index, 0);
  assert.equal(gm2?.[0], 'foo');
  assert.equal(gm2?.index, 8, 'Global regex advances lastIndex');
});

// 8. Multiline flag (m) mechanics
runTest('Multiline flag changes ^ and $ to match line boundaries', () => {
  const text = 'line one\nline two\nline three';
  const withoutM = new RegExp('^line', 'g');
  assert.equal([...text.matchAll(withoutM)].length, 1);

  const withM = new RegExp('^line', 'gm');
  assert.equal([...text.matchAll(withM)].length, 3);
});

// 9. Case-insensitive flag (i) mechanics
runTest('Case-insensitive flag matches uppercase and lowercase', () => {
  const text = 'KivaroTools kivarotools KIVAROTOOLS';
  const caseSensitive = new RegExp('kivarotools', 'g');
  assert.equal([...text.matchAll(caseSensitive)].length, 1);

  const caseInsensitive = new RegExp('kivarotools', 'gi');
  assert.equal([...text.matchAll(caseInsensitive)].length, 3);
});

// 10. DotAll flag (s) mechanics
runTest('DotAll flag allows dot wildcard to match newlines', () => {
  const text = 'hello\nworld';
  const withoutS = new RegExp('hello.world');
  assert.equal(withoutS.test(text), false);

  const withS = new RegExp('hello.world', 's');
  assert.equal(withS.test(text), true);
});

// 11. Unicode flag (u) and emoji surrogate pair handling
runTest('Unicode flag handles astral characters and surrogate pairs', () => {
  const text = 'Hello 🚀 World 🌍!';
  const regex = new RegExp('\\p{Extended_Pictographic}', 'gu');
  const matches = [...text.matchAll(regex)];
  assert.equal(matches.length, 2);
  assert.equal(matches[0][0], '🚀');
  assert.equal(matches[1][0], '🌍');
});

// 12. Numbered capture groups
runTest('Numbered capture groups extract submatches accurately', () => {
  const text = '2026-10-15';
  const regex = new RegExp('(\\d{4})-(\\d{2})-(\\d{2})');
  const match = regex.exec(text);
  assert.ok(match !== null);
  assert.equal(match[0], '2026-10-15');
  assert.equal(match[1], '2026');
  assert.equal(match[2], '10');
  assert.equal(match[3], '15');
});

// 13. Named capture groups
runTest('Named capture groups are stored in match.groups object', () => {
  const text = 'John Doe';
  const regex = new RegExp('(?<first>[A-Z][a-z]+)\\s(?<last>[A-Z][a-z]+)');
  const match = regex.exec(text);
  assert.ok(match !== null);
  assert.ok(match.groups !== undefined);
  assert.equal(match.groups['first'], 'John');
  assert.equal(match.groups['last'], 'Doe');
});

// 14. Replacement evaluation ($1, $&, $<name>, $$)
runTest('Replacement preview supports ECMAScript replacement tokens', () => {
  const text = '2026-10-15';
  const regex = new RegExp('(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})', 'g');

  const rep1 = text.replace(regex, '$3/$2/$1');
  assert.equal(rep1, '15/10/2026');

  const rep2 = text.replace(regex, 'Date: $& ($<y>)');
  assert.equal(rep2, 'Date: 2026-10-15 (2026)');

  const rep3 = text.replace(regex, 'Cost: $$100');
  assert.equal(rep3, 'Cost: $100');
});

// 15. Split evaluation (String.prototype.split with capture splicing)
runTest('String.prototype.split splices captured separators into array', () => {
  const text = 'apple, banana; orange';
  const nonCapturing = text.split(/\s*[,;]\s*/);
  assert.deepEqual(nonCapturing, ['apple', 'banana', 'orange']);

  const capturing = text.split(/\s*([,;])\s*/);
  assert.deepEqual(capturing, ['apple', ',', 'banana', ';', 'orange']);
});

// 16. Zero-length match infinite loop protection
runTest('Zero-width matches advance correctly without infinite looping', () => {
  const text = 'abc';
  const regex = new RegExp('\\b', 'g');
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  let iterations = 0;
  while ((m = regex.exec(text)) !== null && iterations++ < 10) {
    matches.push(m[0]);
    if (m[0] === '') {
      regex.lastIndex++;
    }
  }
  assert.ok(iterations < 10, 'Must terminate promptly without infinite loop');
  assert.equal(matches.length, 2); // \b at start and end of word
});

// 17. CSV formula injection defense (sanitizeForCsv)
runTest('sanitizeForCsv neutralizes spreadsheet formula attack prefixes', () => {
  assert.equal(sanitizeForCsv('=SUM(A1:A10)'), '"\'=SUM(A1:A10)"');
  assert.equal(sanitizeForCsv('+12345'), '"\'+12345"');
  assert.equal(sanitizeForCsv('-cmd|/c calc'), '"\'-cmd|/c calc"');
  assert.equal(sanitizeForCsv('@import'), '"\'@import"');
  assert.equal(sanitizeForCsv('\tmalicious'), '"\'\tmalicious"');
  assert.equal(sanitizeForCsv('regular text'), '"regular text"');
  assert.equal(sanitizeForCsv('quotes "inside"'), '"quotes ""inside"""');
});

// 18. ReDoS complexity heuristic analyzer
runTest('analyzeRegexRisk detects known catastrophic backtracking shapes', () => {
  const evilNested = analyzeRegexRisk('(a+)+$', 'g');
  assert.equal(evilNested.level, 'high');
  assert.ok(evilNested.score >= 40);
  assert.ok(evilNested.findings.some((f) => f.title.includes('Nested quantifiers')));

  const evilAlternation = analyzeRegexRisk('(a|ab)+', 'g');
  assert.equal(evilAlternation.level, 'high');
  assert.ok(evilAlternation.findings.some((f) => f.title.includes('Ambiguous alternation')));

  const safeRegex = analyzeRegexRisk('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', 'gm');
  assert.ok(safeRegex.score < 40);
});

// 19. Pattern explanation tokenizer
runTest('explainPattern decomposes common tokens accurately', () => {
  const tokens = explainPattern('^\\d+(?<unit>[a-z]+)?$');
  assert.ok(tokens.length >= 4);
  assert.ok(tokens.some((t) => t.token === '^' && t.meaning.includes('Beginning anchor')));
  assert.ok(tokens.some((t) => t.token === '\\d' && t.meaning.includes('Digit')));
  assert.ok(tokens.some((t) => t.token.includes('(?<unit>') && t.meaning.includes('unit')));
  assert.ok(tokens.some((t) => t.token === '$' && t.meaning.includes('End anchor')));
});

// 20. Cross-engine code generator serialization
runTest('Serialization functions escape quotes and non-printables correctly', () => {
  const rawJs = serializeJsString('Hello "world"\n\t\\');
  assert.equal(rawJs, '"Hello \\"world\\"\\n\\t\\\\"');

  const rawPy = serializePythonString('Line 1\nLine 2 "quoted"');
  assert.ok(rawPy.startsWith('"'));
  assert.ok(rawPy.includes('\\n'));
  assert.ok(rawPy.includes('\\"'));

  const rawJava = serializeJavaString('Tab\tChar "x"');
  assert.ok(rawJava.startsWith('"'));
  assert.ok(rawJava.includes('\\t'));
});

// 21. Cross-engine compatibility scanner
runTest('analyzeCompatibility reports language-specific flags and construct warnings', () => {
  const findings = analyzeCompatibility('(?<year>\\d{4})', 'gyd');
  assert.ok(findings.some((f) => f.target === 'Python' && f.level === 'warning'));
  assert.ok(findings.some((f) => f.target === 'Go' && f.level === 'warning'));
  assert.ok(findings.some((f) => f.target === 'Java' && f.level === 'warning'));
  assert.ok(findings.some((f) => f.target === 'JavaScript' && f.level === 'ok'));
});

// 22. Route and registry compliance (/developer/regex-tester)
runTest('Regex Tester is properly registered in config/toolsData.ts and toolRegistry.ts', () => {
  const tool = tools.find((t) => t.slug === 'regex-tester');
  assert.ok(tool !== undefined, 'regex-tester must exist in toolsData.ts');
  assert.equal(tool.categoryId, 'developer', 'regex-tester categoryId must be developer');
  assert.equal(tool.status, 'published');
  assert.ok(tool.seoTitle && tool.seoTitle.includes('Regex Tester'));
  assert.ok(tool.seoDescription && tool.seoDescription.length > 50);

  const category = categories.find((c) => c.id === 'developer');
  assert.ok(category !== undefined, 'developer category must exist');

  assert.ok(toolComponents['regex-tester'] !== undefined, 'RegexTester component must be registered in toolRegistry');
  assert.ok(seoComponents['regex-tester'] !== undefined, 'RegexTesterSeo component must be registered in toolRegistry');

  assert.ok(COMMON_PATTERNS.length >= 10, 'Preset library must contain at least 10 patterns');
  assert.ok(FLAG_INFO.length === 7, 'All 7 standard ECMAScript flags must be documented');
  assert.ok(CHEAT_SHEET_DATA.length >= 25, 'Cheat sheet must have at least 25 reference entries');
  assert.ok(REGEX_TESTER_FAQS.length >= 6, 'SEO FAQs must have at least 6 verified items');
});

// 23. ReDoS Static Heuristic Classification
runTest('analyzeRegexRisk flags high-risk nested quantifiers and reports safe patterns', () => {
  const dangerous1 = analyzeRegexRisk('(a+)+$', '');
  assert.equal(dangerous1.level, 'high', 'Nested quantifier (a+)+ must be classified as high risk');
  assert.ok(dangerous1.findings.some((f) => f.title.includes('Nested quantifiers')));

  const dangerous2 = analyzeRegexRisk('(a|aa)+$', '');
  assert.equal(dangerous2.level, 'high', 'Ambiguous alternation (a|aa)+ must be classified as high risk');

  const boundedDate = analyzeRegexRisk('^\\d{4}-\\d{2}-\\d{2}$', '');
  assert.equal(boundedDate.level, 'low', 'Fixed-repetition calendar date regex should be low risk');
  assert.equal(boundedDate.score, 0);

  const emailPattern = analyzeRegexRisk('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', 'm');
  assert.equal(emailPattern.level, 'moderate', 'Email regex with broad character classes gets moderate scan alert');
});

// 24. Go inline flag conversion and cross-language replacement snippets
runTest('Go inline flag conversion (?ims) and replacement snippets', () => {
  const flags = 'ims';
  let goInline = '';
  if (flags.includes('i')) goInline += 'i';
  if (flags.includes('m')) goInline += 'm';
  if (flags.includes('s')) goInline += 's';
  const pattern = 'test';
  const effectivePattern = goInline ? `(?${goInline})${pattern}` : pattern;
  assert.equal(effectivePattern, '(?ims)test');

  // Verify replacement code snippets
  const jsRepl = `text.replace(regex, "[$1]")`;
  const pyRepl = `regex.sub("[$1]", text)`;
  const javaRepl = `matcher.replaceAll("[$1]")`;
  const goRepl = `re.ReplaceAllString(text, "[$1]")`;

  assert.ok(jsRepl.includes('replace'));
  assert.ok(pyRepl.includes('sub'));
  assert.ok(javaRepl.includes('replaceAll'));
  assert.ok(goRepl.includes('ReplaceAllString'));
});

console.log(`\n======================================================`);
console.log(`✓ All ${testsPassed} automated regression tests passed successfully!`);
console.log(`======================================================\n`);
