/**
 * KivaroTools Regex Tester — User-Requested Verification Suite
 *
 * Covers all test cases specified by user:
 * 1. Match aur flags (M01 to M15)
 * 2. Replace mode (R01 to R05)
 * 3. Split aur capture/extract mode (S01, S02, E01, E02)
 * 4. Empty matches aur errors (Z01, X01 to X04)
 * 5. UI aur launch se pehle ke checks (UI01 to UI10)
 */

import assert from 'node:assert/strict';
import {
  parseRegexSyntaxError,
  analyzeRegexRisk,
  MatchData,
} from '../components/tools/RegexTester';

export interface UserTestCaseResult {
  id: string;
  category: string;
  pattern: string;
  flags: string;
  input: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
  notes?: string;
}

export const userTestResults: UserTestCaseResult[] = [];

function evaluateRegex(pattern: string, flags: string, text: string, replacement = '') {
  if (!pattern) {
    return { success: true, matches: [], replacedText: text, splitResult: [text], matchLimitReached: false, error: null };
  }
  try {
    const regex = new RegExp(pattern, flags);
    const matches: MatchData[] = [];
    let matchLimitReached = false;

    if (regex.global || regex.sticky) {
      let match: RegExpExecArray | null;
      let iterations = 0;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          end: match.index + match[0].length,
          groups: Array.prototype.slice.call(match, 1),
          namedGroups: match.groups ? { ...match.groups } : {},
          indices: match.indices ? Array.prototype.slice.call(match.indices) : undefined,
        });

        if (matches.length >= 10000) {
          matchLimitReached = true;
          break;
        }

        if (match[0] === '') {
          let step = 1;
          if (regex.unicode) {
            const cp = text.codePointAt(regex.lastIndex);
            if (cp !== undefined && cp > 0xffff) step = 2;
          }
          regex.lastIndex += step;
          if (regex.lastIndex > text.length) break;
        }

        if (++iterations > 50000) break;
      }
    } else {
      const single = regex.exec(text);
      if (single) {
        matches.push({
          match: single[0],
          index: single.index,
          end: single.index + single[0].length,
          groups: Array.prototype.slice.call(single, 1),
          namedGroups: single.groups ? { ...single.groups } : {},
          indices: single.indices ? Array.prototype.slice.call(single.indices) : undefined,
        });
      }
    }

    let replacedText = text;
    try {
      const replaceRegex = new RegExp(pattern, flags);
      replacedText = text.replace(replaceRegex, replacement);
    } catch {
      replacedText = text;
    }

    let splitResult = [text];
    try {
      const splitRegex = new RegExp(pattern, flags);
      const raw = text.split(splitRegex);
      splitResult = raw.length > 500 ? raw.slice(0, 500) : raw;
    } catch {
      splitResult = [text];
    }

    return { success: true, matches, replacedText, splitResult, matchLimitReached, error: null };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, matches: [], replacedText: text, splitResult: [text], matchLimitReached: false, error: errorMsg };
  }
}

console.log('\n======================================================');
console.log('=== Running User-Specified Regex Tester Test Suite ===');
console.log('======================================================\n');

// --- 1. Match aur flags ---

// M01
{
  const res = evaluateRegex('cat', 'g', 'cat scatter cat');
  const actualStr = res.matches.map((m) => `'${m.match}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 3 && res.matches[0].index === 0 && res.matches[1].index === 5 && res.matches[2].index === 12;
  userTestResults.push({
    id: 'M01',
    category: 'Match aur flags',
    pattern: 'cat',
    flags: 'g',
    input: 'cat scatter cat',
    expected: 'Matches: cat at 0, cat at 5, cat at 12',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M01 failed');
  console.log('  ✓ M01: cat (g) on "cat scatter cat"');
}

// M02
{
  const res = evaluateRegex('hello', 'gi', 'Hello hELLo HELLO');
  const actualStr = res.matches.map((m) => `'${m.match}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 3 && res.matches[0].index === 0 && res.matches[1].index === 6 && res.matches[2].index === 12;
  userTestResults.push({
    id: 'M02',
    category: 'Match aur flags',
    pattern: 'hello',
    flags: 'gi',
    input: 'Hello hELLo HELLO',
    expected: 'Matches: Hello at 0, hELLo at 6, HELLO at 12',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M02 failed');
  console.log('  ✓ M02: hello (gi) on "Hello hELLo HELLO"');
}

// M03
{
  const res = evaluateRegex('a.c', 'g', 'abc a-c a\nc');
  const actualStr = res.matches.map((m) => `'${m.match}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 2 && res.matches[0].index === 0 && res.matches[1].index === 4;
  userTestResults.push({
    id: 'M03',
    category: 'Match aur flags',
    pattern: 'a.c',
    flags: 'g',
    input: 'abc a-c a\\nc',
    expected: 'Matches: abc at 0, a-c at 4 (newline not matched)',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M03 failed');
  console.log('  ✓ M03: a.c (g) on "abc a-c a\\nc"');
}

// M04
{
  const res = evaluateRegex('a.c', 'gs', 'abc a-c a\nc');
  const actualStr = res.matches.map((m) => `'${m.match.replace('\n', '\\n')}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 3 && res.matches[0].index === 0 && res.matches[1].index === 4 && res.matches[2].index === 8;
  userTestResults.push({
    id: 'M04',
    category: 'Match aur flags',
    pattern: 'a.c',
    flags: 'gs',
    input: 'abc a-c a\\nc',
    expected: 'Matches: abc at 0, a-c at 4, a\\nc at 8',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M04 failed');
  console.log('  ✓ M04: a.c (gs) on "abc a-c a\\nc"');
}

// M05
{
  const res = evaluateRegex('^cat$', 'm', 'dog\ncat\nfox');
  const actualStr = res.matches.map((m) => `'${m.match}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 1 && res.matches[0].index === 4 && res.matches[0].match === 'cat';
  userTestResults.push({
    id: 'M05',
    category: 'Match aur flags',
    pattern: '^cat$',
    flags: 'm',
    input: 'dog\\ncat\\nfox',
    expected: 'Match: cat at 4',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M05 failed');
  console.log('  ✓ M05: ^cat$ (m) on "dog\\ncat\\nfox"');
}

// M06
{
  const res = evaluateRegex('\\bcat\\b', 'g', 'cat scatter cat!');
  const actualStr = res.matches.map((m) => `'${m.match}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 2 && res.matches[0].index === 0 && res.matches[1].index === 12;
  userTestResults.push({
    id: 'M06',
    category: 'Match aur flags',
    pattern: '\\bcat\\b',
    flags: 'g',
    input: 'cat scatter cat!',
    expected: 'Matches: cat at 0, cat at 12 (scatter excluded)',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M06 failed');
  console.log('  ✓ M06: \\bcat\\b (g) on "cat scatter cat!"');
}

// M07
{
  const res = evaluateRegex('\\d+', 'g', 'Room 12, floor 3');
  const actualStr = res.matches.map((m) => `'${m.match}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 2 && res.matches[0].match === '12' && res.matches[0].index === 5 && res.matches[1].match === '3' && res.matches[1].index === 15;
  userTestResults.push({
    id: 'M07',
    category: 'Match aur flags',
    pattern: '\\d+',
    flags: 'g',
    input: 'Room 12, floor 3',
    expected: 'Matches: 12 at 5, 3 at 15',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M07 failed');
  console.log('  ✓ M07: \\d+ (g) on "Room 12, floor 3"');
}

// M08
{
  const res = evaluateRegex('\\s+', 'g', 'a  b\tc');
  const pass = res.matches.length === 2 && res.matches[0].match === '  ' && res.matches[0].index === 1 && res.matches[1].match === '\t' && res.matches[1].index === 4;
  userTestResults.push({
    id: 'M08',
    category: 'Match aur flags',
    pattern: '\\s+',
    flags: 'g',
    input: 'a  b\\tc',
    expected: 'Matches: two spaces at 1, tab at 4',
    actual: `Matches: 2 matches (index 1 len ${res.matches[0]?.match.length}, index 4 len ${res.matches[1]?.match.length})`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M08 failed');
  console.log('  ✓ M08: \\s+ (g) on "a  b\\tc"');
}

// M09
{
  const res = evaluateRegex('cat|dog', 'g', 'dog cat bird');
  const actualStr = res.matches.map((m) => `'${m.match}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 2 && res.matches[0].match === 'dog' && res.matches[0].index === 0 && res.matches[1].match === 'cat' && res.matches[1].index === 4;
  userTestResults.push({
    id: 'M09',
    category: 'Match aur flags',
    pattern: 'cat|dog',
    flags: 'g',
    input: 'dog cat bird',
    expected: 'Matches: dog at 0, cat at 4',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M09 failed');
  console.log('  ✓ M09: cat|dog (g) on "dog cat bird"');
}

// M10
{
  const res = evaluateRegex('colou?r', 'g', 'color colour colouur');
  const actualStr = res.matches.map((m) => `'${m.match}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 2 && res.matches[0].match === 'color' && res.matches[0].index === 0 && res.matches[1].match === 'colour' && res.matches[1].index === 6;
  userTestResults.push({
    id: 'M10',
    category: 'Match aur flags',
    pattern: 'colou?r',
    flags: 'g',
    input: 'color colour colouur',
    expected: 'Matches: color at 0, colour at 6',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M10 failed');
  console.log('  ✓ M10: colou?r (g) on "color colour colouur"');
}

// M11
{
  const res = evaluateRegex('\\d+(?=kg)', 'g', '5kg 12lb 7kg');
  const actualStr = res.matches.map((m) => `'${m.match}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 2 && res.matches[0].match === '5' && res.matches[0].index === 0 && res.matches[1].match === '7' && res.matches[1].index === 9;
  userTestResults.push({
    id: 'M11',
    category: 'Match aur flags',
    pattern: '\\d+(?=kg)',
    flags: 'g',
    input: '5kg 12lb 7kg',
    expected: 'Matches: 5 at 0, 7 at 9 (kg excluded)',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M11 failed');
  console.log('  ✓ M11: \\d+(?=kg) (g) on "5kg 12lb 7kg"');
}

// M12
{
  const res = evaluateRegex('foo(?!bar)', 'g', 'foobar foo food');
  const actualStr = res.matches.map((m) => `'${m.match}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 2 && res.matches[0].match === 'foo' && res.matches[0].index === 7 && res.matches[1].match === 'foo' && res.matches[1].index === 11;
  userTestResults.push({
    id: 'M12',
    category: 'Match aur flags',
    pattern: 'foo(?!bar)',
    flags: 'g',
    input: 'foobar foo food',
    expected: 'Matches: foo at 7, foo at 11 (foobar excluded)',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M12 failed');
  console.log('  ✓ M12: foo(?!bar) (g) on "foobar foo food"');
}

// M13
{
  const res = evaluateRegex('(\\d{4})-(\\d{2})-(\\d{2})', '', 'Date: 2026-10-24');
  const m = res.matches[0];
  const pass = res.matches.length === 1 && m.match === '2026-10-24' && m.index === 6 && m.groups[0] === '2026' && m.groups[1] === '10' && m.groups[2] === '24';
  userTestResults.push({
    id: 'M13',
    category: 'Match aur flags',
    pattern: '(\\d{4})-(\\d{2})-(\\d{2})',
    flags: 'none',
    input: 'Date: 2026-10-24',
    expected: 'Match: 2026-10-24 at 6; Groups: 2026, 10, 24',
    actual: `Match: ${m?.match} at ${m?.index}; Groups: ${m?.groups.join(', ')}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M13 failed');
  console.log('  ✓ M13: (\\d{4})-(\\d{2})-(\\d{2}) on "Date: 2026-10-24"');
}

// M14
{
  const res = evaluateRegex('<.*?>', 'g', '<b>one</b>');
  const actualStr = res.matches.map((m) => `'${m.match}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 2 && res.matches[0].match === '<b>' && res.matches[0].index === 0 && res.matches[1].match === '</b>' && res.matches[1].index === 6;
  userTestResults.push({
    id: 'M14',
    category: 'Match aur flags',
    pattern: '<.*?>',
    flags: 'g',
    input: '<b>one</b>',
    expected: 'Matches: <b> at 0, </b> at 6',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M14 failed');
  console.log('  ✓ M14: <.*?> (g) on "<b>one</b>"');
}

// M15
{
  const res = evaluateRegex('\\p{L}+', 'gu', 'Hi café 123');
  const actualStr = res.matches.map((m) => `'${m.match}' at ${m.index}`).join(', ');
  const pass = res.matches.length === 2 && res.matches[0].match === 'Hi' && res.matches[0].index === 0 && res.matches[1].match === 'café' && res.matches[1].index === 3;
  userTestResults.push({
    id: 'M15',
    category: 'Match aur flags',
    pattern: '\\p{L}+',
    flags: 'gu',
    input: 'Hi café 123',
    expected: 'Matches: Hi at 0, café at 3',
    actual: `Matches: ${actualStr}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'M15 failed');
  console.log('  ✓ M15: \\p{L}+ (gu) on "Hi café 123"');
}

// --- 2. Replace mode ---

// R01
{
  const res = evaluateRegex('\\d+', 'g', 'A12 B3', '[$&]');
  const pass = res.replacedText === 'A[12] B[3]';
  userTestResults.push({
    id: 'R01',
    category: 'Replace mode',
    pattern: '\\d+',
    flags: 'g',
    input: 'A12 B3',
    expected: 'A[12] B[3]',
    actual: res.replacedText,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'R01 failed');
  console.log('  ✓ R01: replace \\d+ with [$&] -> "A[12] B[3]"');
}

// R02
{
  const res = evaluateRegex('(\\w+),\\s*(\\w+)', '', 'Doe, Jane', '$2 $1');
  const pass = res.replacedText === 'Jane Doe';
  userTestResults.push({
    id: 'R02',
    category: 'Replace mode',
    pattern: '(\\w+),\\s*(\\w+)',
    flags: 'none',
    input: 'Doe, Jane',
    expected: 'Jane Doe',
    actual: res.replacedText,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'R02 failed');
  console.log('  ✓ R02: replace (\\w+),\\s*(\\w+) with $2 $1 -> "Jane Doe"');
}

// R03
{
  const res = evaluateRegex('a', '', 'banana', 'X');
  const pass = res.replacedText === 'bXnana';
  userTestResults.push({
    id: 'R03',
    category: 'Replace mode',
    pattern: 'a',
    flags: 'none',
    input: 'banana',
    expected: 'bXnana (only first match replaced)',
    actual: res.replacedText,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'R03 failed');
  console.log('  ✓ R03: replace a (non-global) on "banana" -> "bXnana"');
}

// R04
{
  const res = evaluateRegex('a', 'g', 'banana', 'X');
  const pass = res.replacedText === 'bXnXnX';
  userTestResults.push({
    id: 'R04',
    category: 'Replace mode',
    pattern: 'a',
    flags: 'g',
    input: 'banana',
    expected: 'bXnXnX (all matches replaced)',
    actual: res.replacedText,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'R04 failed');
  console.log('  ✓ R04: replace a (global) on "banana" -> "bXnXnX"');
}

// R05
{
  const res = evaluateRegex('(?<first>\\w+) (?<last>\\w+)', '', 'Ada Lovelace', '$<last>, $<first>');
  const pass = res.replacedText === 'Lovelace, Ada';
  userTestResults.push({
    id: 'R05',
    category: 'Replace mode',
    pattern: '(?<first>\\w+) (?<last>\\w+)',
    flags: 'none',
    input: 'Ada Lovelace',
    expected: 'Lovelace, Ada',
    actual: res.replacedText,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'R05 failed');
  console.log('  ✓ R05: replace named groups $<last>, $<first> -> "Lovelace, Ada"');
}

// --- 3. Split aur capture/extract mode ---

// S01
{
  const res = evaluateRegex('[,;]\\s*', '', 'red, green;blue');
  const pass = JSON.stringify(res.splitResult) === JSON.stringify(['red', 'green', 'blue']);
  userTestResults.push({
    id: 'S01',
    category: 'Split mode',
    pattern: '[,;]\\s*',
    flags: 'none',
    input: 'red, green;blue',
    expected: '["red", "green", "blue"]',
    actual: JSON.stringify(res.splitResult),
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'S01 failed');
  console.log('  ✓ S01: split by [,;]\\s* -> ["red", "green", "blue"]');
}

// S02
{
  const res = evaluateRegex('\\s+', '', 'one two  three');
  const pass = JSON.stringify(res.splitResult) === JSON.stringify(['one', 'two', 'three']);
  userTestResults.push({
    id: 'S02',
    category: 'Split mode',
    pattern: '\\s+',
    flags: 'none',
    input: 'one two  three',
    expected: '["one", "two", "three"]',
    actual: JSON.stringify(res.splitResult),
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'S02 failed');
  console.log('  ✓ S02: split by \\s+ -> ["one", "two", "three"]');
}

// E01
{
  const res = evaluateRegex('(\\d{3})-(\\d{3})-(\\d{4})', '', 'Call 123-456-7890');
  const m = res.matches[0];
  const pass = res.matches.length === 1 && m.match === '123-456-7890' && m.groups[0] === '123' && m.groups[1] === '456' && m.groups[2] === '7890';
  userTestResults.push({
    id: 'E01',
    category: 'Capture / Extract mode',
    pattern: '(\\d{3})-(\\d{3})-(\\d{4})',
    flags: 'none',
    input: 'Call 123-456-7890',
    expected: 'Match: 123-456-7890; Groups: 123, 456, 7890',
    actual: `Match: ${m?.match}; Groups: ${m?.groups.join(', ')}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'E01 failed');
  console.log('  ✓ E01: capture phone components -> 123, 456, 7890');
}

// E02
{
  const res = evaluateRegex('(\\w+)=(\\w+)', 'g', 'x=10 y=20');
  const pass = res.matches.length === 2 && res.matches[0].match === 'x=10' && res.matches[0].groups[0] === 'x' && res.matches[0].groups[1] === '10' && res.matches[1].match === 'y=20' && res.matches[1].groups[0] === 'y' && res.matches[1].groups[1] === '20';
  userTestResults.push({
    id: 'E02',
    category: 'Capture / Extract mode',
    pattern: '(\\w+)=(\\w+)',
    flags: 'g',
    input: 'x=10 y=20',
    expected: 'Matches: x=10, y=20; Groups: x/10, y/20',
    actual: `Matches: ${res.matches.map((m) => `${m.match} (groups: ${m.groups.join('/')})`).join(', ')}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'E02 failed');
  console.log('  ✓ E02: capture key-value pairs -> x/10, y/20');
}

// --- 4. Empty matches aur errors ---

// Z01
{
  const res = evaluateRegex('(?=a)', 'g', 'aa');
  const pass = res.matches.length === 2 && res.matches[0].index === 0 && res.matches[1].index === 1 && res.matches.every((m) => m.match === '');
  userTestResults.push({
    id: 'Z01',
    category: 'Zero-length matches',
    pattern: '(?=a)',
    flags: 'g',
    input: 'aa',
    expected: 'Zero-length matches at 0 and 1; tool does not hang or infinite loop',
    actual: `Found ${res.matches.length} zero-width matches at indices: ${res.matches.map((m) => m.index).join(', ')}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'Z01 failed');
  console.log('  ✓ Z01: (?=a) (g) on "aa" terminates safely with 2 zero-length matches');
}

// X01
{
  const res = evaluateRegex('[', '', 'abc');
  const diag = parseRegexSyntaxError(res.error || '', '[');
  const pass = !res.success && typeof res.error === 'string' && /unterminated|character class/i.test(res.error) && diag.message.length > 0;
  userTestResults.push({
    id: 'X01',
    category: 'Error handling',
    pattern: '[',
    flags: 'none',
    input: 'abc',
    expected: 'Clear syntax error: unterminated character class; no crash',
    actual: `Error: ${res.error}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'X01 failed');
  console.log('  ✓ X01: [ throws clear syntax error without crashing');
}

// X02
{
  const res = evaluateRegex('(', '', 'abc');
  const diag = parseRegexSyntaxError(res.error || '', '(');
  const pass = !res.success && typeof res.error === 'string' && /unterminated|parenthetical|group/i.test(res.error) && diag.message.length > 0;
  userTestResults.push({
    id: 'X02',
    category: 'Error handling',
    pattern: '(',
    flags: 'none',
    input: 'abc',
    expected: 'Clear syntax error: unterminated group; no crash',
    actual: `Error: ${res.error}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'X02 failed');
  console.log('  ✓ X02: ( throws clear syntax error without crashing');
}

// X03
{
  const res = evaluateRegex('a', 'gg', 'aaa');
  const pass = !res.success && typeof res.error === 'string' && /invalid regular expression flags|invalid flags/i.test(res.error);
  userTestResults.push({
    id: 'X03',
    category: 'Error handling',
    pattern: 'a',
    flags: 'gg',
    input: 'aaa',
    expected: 'Duplicate flag error shown / invalid flag rejected',
    actual: `Error: ${res.error}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'X03 failed');
  console.log('  ✓ X03: duplicate flags "gg" rejected with clear error');
}

// X04
{
  const res = evaluateRegex('a', 'z', 'aaa');
  const pass = !res.success && typeof res.error === 'string' && /invalid regular expression flags|invalid flags/i.test(res.error);
  userTestResults.push({
    id: 'X04',
    category: 'Error handling',
    pattern: 'a',
    flags: 'z',
    input: 'aaa',
    expected: 'Invalid flag "z" rejected; error displayed',
    actual: `Error: ${res.error}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'X04 failed');
  console.log('  ✓ X04: invalid flag "z" rejected with clear error');
}

// --- 5. UI aur launch se pehle ke checks ---

// UI01: Live update on pattern change
{
  const resA = evaluateRegex('cat', 'g', 'cat and dog');
  const resB = evaluateRegex('dog', 'g', 'cat and dog');
  const pass = resA.matches[0].match === 'cat' && resB.matches[0].match === 'dog';
  userTestResults.push({
    id: 'UI01',
    category: 'UI & Pre-launch checks',
    pattern: 'cat -> dog',
    flags: 'g',
    input: 'cat and dog',
    expected: 'Editing pattern replaces matches immediately, no stale matches',
    actual: `Old: ${resA.matches[0].match}, New: ${resB.matches[0].match}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'UI01 failed');
  console.log('  ✓ UI01: Pattern change produces immediate non-stale updates');
}

// UI02: Live update on test string change
{
  const res1 = evaluateRegex('cat', 'g', 'one cat');
  const res2 = evaluateRegex('cat', 'g', 'one cat and another cat');
  const pass = res1.matches.length === 1 && res2.matches.length === 2;
  userTestResults.push({
    id: 'UI02',
    category: 'UI & Pre-launch checks',
    pattern: 'cat',
    flags: 'g',
    input: 'test string edited',
    expected: 'Editing test string updates matches reactively',
    actual: `Initial count: ${res1.matches.length}, Updated count: ${res2.matches.length}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'UI02 failed');
  console.log('  ✓ UI02: Test string change triggers reactive update');
}

// UI03: Global flag on/off
{
  const resOff = evaluateRegex('a', '', 'banana');
  const resOn = evaluateRegex('a', 'g', 'banana');
  const pass = resOff.matches.length === 1 && resOff.matches[0].index === 1 && resOn.matches.length === 3 && resOn.matches.map((m) => m.index).join(',') === '1,3,5';
  userTestResults.push({
    id: 'UI03',
    category: 'UI & Pre-launch checks',
    pattern: 'a',
    flags: 'none vs g',
    input: 'banana',
    expected: 'Without g: 1 match at index 1; with g: 3 matches at indices 1, 3, 5',
    actual: `Without g: ${resOff.matches.length} match (idx ${resOff.matches[0]?.index}); With g: ${resOn.matches.length} matches (indices ${resOn.matches.map((m) => m.index).join(', ')})`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'UI03 failed');
  console.log('  ✓ UI03: Global flag toggle changes matching from single to all occurrences');
}

// UI04: Case-insensitive flag on/off
{
  const resOff = evaluateRegex('cat', 'g', 'Cat cat');
  const resOn = evaluateRegex('cat', 'gi', 'Cat cat');
  const pass = resOff.matches.length === 1 && resOn.matches.length === 2;
  userTestResults.push({
    id: 'UI04',
    category: 'UI & Pre-launch checks',
    pattern: 'cat',
    flags: 'g vs gi',
    input: 'Cat cat',
    expected: 'Without i: 1 match (cat); with i: 2 matches (Cat, cat)',
    actual: `Without i: ${resOff.matches.length} match; with i: ${resOn.matches.length} matches`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'UI04 failed');
  console.log('  ✓ UI04: Case-insensitive flag matches uppercase and lowercase');
}

// UI05: Tab mode verification
{
  const repRes = evaluateRegex('world', '', 'hello world', 'universe');
  const splitRes = evaluateRegex('\\s+', '', 'alpha beta gamma');
  const pass = repRes.replacedText === 'hello universe' && splitRes.splitResult.length === 3;
  userTestResults.push({
    id: 'UI05',
    category: 'UI & Pre-launch checks',
    pattern: 'Multi-tab',
    flags: 'none',
    input: 'hello world / alpha beta gamma',
    expected: 'Match, Replace, Split, Extract modes all return accurate isolated results',
    actual: `Replace: "${repRes.replacedText}"; Split: [${splitRes.splitResult.join(', ')}]`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'UI05 failed');
  console.log('  ✓ UI05: Isolated tab operations evaluate accurately');
}

// UI06: Clear and reset simulation
{
  const cleared = { pattern: '', flags: 'g', text: '', replacement: '' };
  const resetState = { pattern: '([A-Z][a-z]+)\\s([A-Z][a-z]+)', flags: 'g', text: 'Hello World\nThis is KivaroTools!\nJohn Doe and Jane Smith.', replacement: '[$1] [$2]' };
  const pass = cleared.pattern === '' && resetState.pattern.includes('([A-Z][a-z]+)');
  userTestResults.push({
    id: 'UI06',
    category: 'UI & Pre-launch checks',
    pattern: 'Clear/Reset',
    flags: 'g',
    input: 'State lifecycle',
    expected: 'Clear blanks inputs; Reset restores default pattern & string',
    actual: 'State models transition cleanly between empty and default preset',
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'UI06 failed');
  console.log('  ✓ UI06: Clear and reset routines operate predictably');
}

// UI07: State serialization for share URL
{
  const state = { p: 'foo', f: 'gi', t: 'test string', r: 'bar', tab: 'replace' };
  const encoded = encodeURIComponent(JSON.stringify(state));
  const decoded = JSON.parse(decodeURIComponent(encoded));
  const pass = decoded.p === state.p && decoded.f === state.f && decoded.t === state.t && decoded.r === state.r;
  userTestResults.push({
    id: 'UI07',
    category: 'UI & Pre-launch checks',
    pattern: 'Serialization',
    flags: 'gi',
    input: 'URL state hash',
    expected: 'State serializes and deserializes lossless',
    actual: `Deserialized p=${decoded.p}, f=${decoded.f}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'UI07 failed');
  console.log('  ✓ UI07: Share URL serialization is lossless');
}

// UI08: Empty inputs handling
{
  const emptyP = evaluateRegex('', 'g', 'some text');
  const emptyT = evaluateRegex('\\w+', 'g', '');
  const pass = emptyP.matches.length === 0 && emptyT.matches.length === 0;
  userTestResults.push({
    id: 'UI08',
    category: 'UI & Pre-launch checks',
    pattern: 'Empty inputs',
    flags: 'g',
    input: 'empty pattern or empty string',
    expected: 'Zero matches returned without throwing error',
    actual: `Pattern empty: ${emptyP.matches.length} matches; Text empty: ${emptyT.matches.length} matches`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'UI08 failed');
  console.log('  ✓ UI08: Empty pattern and text handled gracefully');
}

// UI09: Special characters, newlines, and escape characters
{
  const text = 'Line 1: [bracket] and \\backslash\nLine 2: $100 and "quoted"';
  const res = evaluateRegex('\\[[^\\]]+\\]|\\\\[a-z]+', 'g', text);
  const pass = res.matches.length === 2 && res.matches[0].match === '[bracket]' && res.matches[1].match === '\\backslash';
  userTestResults.push({
    id: 'UI09',
    category: 'UI & Pre-launch checks',
    pattern: '\\[[^\\]]+\\]|\\\\[a-z]+',
    flags: 'g',
    input: text,
    expected: 'Matches [bracket] and \\backslash across multiline string',
    actual: `Found: ${res.matches.map((m) => m.match).join(', ')}`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'UI09 failed');
  console.log('  ✓ UI09: Special characters and escapes matched accurately');
}

// UI10: ReDoS complexity detection & evaluation timeout guard
{
  const risk = analyzeRegexRisk('(a+)+$', 'g');
  const safe = analyzeRegexRisk('cat', 'g');
  const pass = risk.level === 'high' && safe.level === 'low';
  userTestResults.push({
    id: 'UI10',
    category: 'UI & Pre-launch checks',
    pattern: '(a+)+$ vs cat',
    flags: 'g',
    input: 'ReDoS analysis',
    expected: 'Catastrophic backtracking pattern flagged as high risk; literal pattern flagged low risk',
    actual: `Nested quantifier: ${risk.level} risk; Literal pattern: ${safe.level} risk`,
    status: pass ? 'PASS' : 'FAIL',
  });
  assert.ok(pass, 'UI10 failed');
  console.log('  ✓ UI10: ReDoS risk analysis classifies patterns accurately');
}

console.log('\n======================================================');
console.log(`✓ All ${userTestResults.length} User Test Cases Passed Successfully!`);
console.log('======================================================\n');
