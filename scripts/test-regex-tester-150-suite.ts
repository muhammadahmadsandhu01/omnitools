/**
 * KivaroTools Regex Tester — 150+ Comprehensive Scenario Test Suite
 *
 * Covers:
 * 1. Character classes & escapes (1-20)
 * 2. Quantifiers: greedy, lazy, bounded (21-40)
 * 3. Anchors, boundaries, and multiline mechanics (41-55)
 * 4. Alternations and compound patterns (56-65)
 * 5. Capturing groups, nested groups, optional groups (66-85)
 * 6. Named groups, backreferences, named backreferences (86-100)
 * 7. Lookahead and lookbehind assertions (101-115)
 * 8. Flags & flag combinations (116-125)
 * 9. Replacement tokens: $1, $&, $`, $', $$, $<name> (126-135)
 * 10. Split evaluation and splicing mechanics (136-145)
 * 11. Zero-width matches and infinite loop guards (146-155)
 * 12. Syntax errors and diagnostic pointer extraction (156-165)
 * 13. ReDoS heuristics and compatibility analyzer (166-175)
 * 14. Unicode astral planes, emojis, and CSV sanitization (176-185)
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
  MatchData,
} from '../components/tools/RegexTester';

export interface TestResult {
  id: number;
  name: string;
  category: string;
  passed: boolean;
  error?: string;
}

export const suiteResults: TestResult[] = [];
let passCount = 0;

function runScenario(id: number, name: string, category: string, fn: () => void) {
  try {
    fn();
    passCount++;
    suiteResults.push({ id, name, category, passed: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    suiteResults.push({ id, name, category, passed: false, error: errorMsg });
    console.error(`  ✗ Test #${id} [${category}] ${name}: ${errorMsg}`);
  }
}

function execRegex(pattern: string, flags: string, text: string, replacement = '') {
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
    return { success: false, matches: [], replacedText: text, splitResult: [text], matchLimitReached: false, error: err instanceof Error ? err.message : String(err) };
  }
}

console.log('\n======================================================');
console.log('=== Running 150+ Comprehensive RegexTester Suite ===');
console.log('======================================================\n');

// 1. Character classes & escapes (1-20)
runScenario(1, 'Digit class \\d matches 0-9', 'Classes', () => {
  const r = execRegex('\\d+', 'g', 'Order 45, item 980');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '45');
  assert.equal(r.matches[1].match, '980');
});

runScenario(2, 'Non-digit class \\D matches everything except numbers', 'Classes', () => {
  const r = execRegex('\\D+', 'g', '123abc456def');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'abc');
  assert.equal(r.matches[1].match, 'def');
});

runScenario(3, 'Word character \\w matches alphanumeric and underscore', 'Classes', () => {
  const r = execRegex('\\w+', 'g', 'user_123 !@# profile');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'user_123');
  assert.equal(r.matches[1].match, 'profile');
});

runScenario(4, 'Non-word character \\W matches symbols and punctuation', 'Classes', () => {
  const r = execRegex('\\W+', 'g', 'user_123 !@# profile');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, ' !@# ');
});

runScenario(5, 'Whitespace \\s matches space, tab, newline', 'Classes', () => {
  const r = execRegex('\\s+', 'g', 'a b\tc\nd\re');
  assert.equal(r.matches.length, 4);
});

runScenario(6, 'Non-whitespace \\S matches non-blank tokens', 'Classes', () => {
  const r = execRegex('\\S+', 'g', '  alpha   beta\tgamma  ');
  assert.equal(r.matches.length, 3);
  assert.equal(r.matches[0].match, 'alpha');
  assert.equal(r.matches[1].match, 'beta');
  assert.equal(r.matches[2].match, 'gamma');
});

runScenario(7, 'Dot wildcard matches any char except newline without s flag', 'Classes', () => {
  const r = execRegex('a.b', 'g', 'axb a\nb a-b');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'axb');
  assert.equal(r.matches[1].match, 'a-b');
});

runScenario(8, 'Dot wildcard matches newline with dotAll s flag', 'Classes', () => {
  const r = execRegex('a.b', 'gs', 'axb a\nb a-b');
  assert.equal(r.matches.length, 3);
  assert.equal(r.matches[1].match, 'a\nb');
});

runScenario(9, 'Character class [aeiou] matches vowels', 'Classes', () => {
  const r = execRegex('[aeiou]', 'g', 'hello world');
  assert.equal(r.matches.length, 3);
  assert.deepEqual(r.matches.map((m) => m.match), ['e', 'o', 'o']);
});

runScenario(10, 'Negated character class [^aeiou] matches consonants and spaces', 'Classes', () => {
  const r = execRegex('[^aeiou]+', 'g', 'hello world');
  assert.equal(r.matches.length, 4);
  assert.equal(r.matches[0].match, 'h');
  assert.equal(r.matches[1].match, 'll');
  assert.equal(r.matches[2].match, ' w');
  assert.equal(r.matches[3].match, 'rld');
});

runScenario(11, 'Character range [a-z] matches lowercase ASCII', 'Classes', () => {
  const r = execRegex('[a-z]+', 'g', 'ABcdeFGhijk');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'cde');
  assert.equal(r.matches[1].match, 'hijk');
});

runScenario(12, 'Multiple ranges [a-f0-9] matches hex digits', 'Classes', () => {
  const r = execRegex('[a-f0-9]+', 'gi', 'Color #3B9AF1');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'C');
  assert.equal(r.matches[1].match, '3B9AF1');
});

runScenario(13, 'Bracket literal inside class [\\[\\]] matches square brackets', 'Classes', () => {
  const r = execRegex('[\\[\\]]', 'g', 'array[0]');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '[');
  assert.equal(r.matches[1].match, ']');
});

runScenario(14, 'Hyphen at start of character class [-a-z] treated literally', 'Classes', () => {
  const r = execRegex('[-a-z]+', 'g', 'foo-bar_baz');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'foo-bar');
  assert.equal(r.matches[1].match, 'baz');
});

runScenario(15, 'Hex escape \\x41 matches literal A', 'Classes', () => {
  const r = execRegex('\\x41\\x42\\x43', 'g', 'ABC 123');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'ABC');
});

runScenario(16, 'Unicode escape \\u0041 matches literal A', 'Classes', () => {
  const r = execRegex('\\u0041\\u0042', 'g', 'AB CD');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'AB');
});

runScenario(17, 'Unicode code point escape \\u{1F600} with u flag', 'Classes', () => {
  const r = execRegex('\\u{1F600}', 'gu', 'Feeling 😀 happy');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, '😀');
});

runScenario(18, 'Unicode property \\p{Letter} matches international letters', 'Classes', () => {
  const r = execRegex('\\p{Letter}+', 'gu', 'Grüße aus München 123');
  assert.equal(r.matches.length, 3);
  assert.equal(r.matches[0].match, 'Grüße');
  assert.equal(r.matches[1].match, 'aus');
  assert.equal(r.matches[2].match, 'München');
});

runScenario(19, 'Unicode property \\p{Number} matches digits and numeric runes', 'Classes', () => {
  const r = execRegex('\\p{Number}+', 'gu', 'Count: 42, roman III');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, '42');
});

runScenario(20, 'Negated Unicode property \\P{Letter} matches non-letters', 'Classes', () => {
  const r = execRegex('\\P{Letter}+', 'gu', 'Alpha123Beta');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, '123');
});

// 2. Quantifiers: greedy, lazy, bounded (21-40)
runScenario(21, 'Greedy asterisk * matches 0 or more times', 'Quantifiers', () => {
  const r = execRegex('ba*', 'g', 'b ba baaa');
  assert.equal(r.matches.length, 3);
  assert.equal(r.matches[0].match, 'b');
  assert.equal(r.matches[1].match, 'ba');
  assert.equal(r.matches[2].match, 'baaa');
});

runScenario(22, 'Greedy plus + matches 1 or more times', 'Quantifiers', () => {
  const r = execRegex('ba+', 'g', 'b ba baaa');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'ba');
  assert.equal(r.matches[1].match, 'baaa');
});

runScenario(23, 'Optional question mark ? matches 0 or 1 time', 'Quantifiers', () => {
  const r = execRegex('https?', 'g', 'http and https and httpx');
  assert.equal(r.matches.length, 3);
  assert.equal(r.matches[0].match, 'http');
  assert.equal(r.matches[1].match, 'https');
  assert.equal(r.matches[2].match, 'http');
});

runScenario(24, 'Exact quantifier {n} matches exact count', 'Quantifiers', () => {
  const r = execRegex('\\d{4}', 'g', 'Years 1999, 2026, 85, 12345');
  assert.equal(r.matches.length, 3);
  assert.equal(r.matches[0].match, '1999');
  assert.equal(r.matches[1].match, '2026');
  assert.equal(r.matches[2].match, '1234');
});

runScenario(25, 'At-least quantifier {n,} matches n or more', 'Quantifiers', () => {
  const r = execRegex('\\d{3,}', 'g', '12 123 1234 1');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '123');
  assert.equal(r.matches[1].match, '1234');
});

runScenario(26, 'Bounded range quantifier {n,m} matches between n and m', 'Quantifiers', () => {
  const r = execRegex('\\d{2,4}', 'g', '1 12 123 1234 12345');
  assert.equal(r.matches.length, 4);
  assert.equal(r.matches[0].match, '12');
  assert.equal(r.matches[1].match, '123');
  assert.equal(r.matches[2].match, '1234');
  assert.equal(r.matches[3].match, '1234');
});

runScenario(27, 'Lazy asterisk *? takes minimal characters', 'Quantifiers', () => {
  const r = execRegex('<.*?>', 'g', '<div><span>text</span></div>');
  assert.equal(r.matches.length, 4);
  assert.equal(r.matches[0].match, '<div>');
  assert.equal(r.matches[1].match, '<span>');
  assert.equal(r.matches[2].match, '</span>');
  assert.equal(r.matches[3].match, '</div>');
});

runScenario(28, 'Lazy plus +? takes minimal characters', 'Quantifiers', () => {
  const r = execRegex('".+?"', 'g', '"first" and "second"');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '"first"');
  assert.equal(r.matches[1].match, '"second"');
});

runScenario(29, 'Lazy optional ?? favors 0 matches over 1', 'Quantifiers', () => {
  const r = execRegex('a??b', 'g', 'ab b');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'ab');
  assert.equal(r.matches[1].match, 'b');
});

runScenario(30, 'Lazy range {n,m}? takes lower bound', 'Quantifiers', () => {
  const r = execRegex('\\d{2,5}?', 'g', '123456');
  assert.equal(r.matches.length, 3);
  assert.equal(r.matches[0].match, '12');
  assert.equal(r.matches[1].match, '34');
  assert.equal(r.matches[2].match, '56');
});

runScenario(31, 'Greedy vs lazy on quoted text', 'Quantifiers', () => {
  const greedy = execRegex('".*"', 'g', '"a" "b"');
  const lazy = execRegex('".*?"', 'g', '"a" "b"');
  assert.equal(greedy.matches.length, 1);
  assert.equal(greedy.matches[0].match, '"a" "b"');
  assert.equal(lazy.matches.length, 2);
  assert.equal(lazy.matches[0].match, '"a"');
  assert.equal(lazy.matches[1].match, '"b"');
});

runScenario(32, 'Quantifier after character class [a-z]+', 'Quantifiers', () => {
  const r = execRegex('[a-z]+', 'g', '123abc456def789');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'abc');
  assert.equal(r.matches[1].match, 'def');
});

runScenario(33, 'Quantifier after group (ab)+', 'Quantifiers', () => {
  const r = execRegex('(ab)+', 'g', 'ab abab ababab a');
  assert.equal(r.matches.length, 3);
  assert.equal(r.matches[0].match, 'ab');
  assert.equal(r.matches[1].match, 'abab');
  assert.equal(r.matches[2].match, 'ababab');
});

runScenario(34, 'Quantifier after non-capturing group (?:ab)+', 'Quantifiers', () => {
  const r = execRegex('(?:ab)+', 'g', 'ababab');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'ababab');
  assert.equal(r.matches[0].groups.length, 0);
});

runScenario(35, 'Quantifier 0 count {0}', 'Quantifiers', () => {
  const r = execRegex('a{0}b', 'g', 'b ab');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'b');
  assert.equal(r.matches[1].match, 'b');
});

runScenario(36, 'Optional quantifier with newline', 'Quantifiers', () => {
  const r = execRegex('a\r?b', 'g', 'ab a\rb');
  assert.equal(r.matches.length, 2);
});

runScenario(37, 'Greedy quantifier backtrack on mismatch', 'Quantifiers', () => {
  const r = execRegex('a+ab', 'g', 'aaaaab');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'aaaaab');
});

runScenario(38, 'Multiple chained quantifiers on separate tokens', 'Quantifiers', () => {
  const r = execRegex('\\d+\\s+[a-z]+', 'g', '12 apples, 3 oranges');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '12 apples');
  assert.equal(r.matches[1].match, '3 oranges');
});

runScenario(39, 'Quantifier with empty alternative (a|)*', 'Quantifiers', () => {
  const r = execRegex('(?:a|b)*', 'g', 'aab ab ba');
  assert.ok(r.matches.length >= 3);
});

runScenario(40, 'Quantifier with large upper bound {1,100}', 'Quantifiers', () => {
  const r = execRegex('x{1,100}', 'g', 'xxxxxx');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'xxxxxx');
});

// 3. Anchors, boundaries, and multiline mechanics (41-55)
runScenario(41, '^ matches start of string without m flag', 'Anchors', () => {
  const r = execRegex('^hello', 'g', 'hello world\nhello universe');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].index, 0);
});

runScenario(42, '^ matches start of each line with m flag', 'Anchors', () => {
  const r = execRegex('^hello', 'gm', 'hello world\nhello universe');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].index, 0);
  assert.equal(r.matches[1].index, 12);
});

runScenario(43, '$ matches end of string without m flag', 'Anchors', () => {
  const r = execRegex('end$', 'g', 'first line end\nsecond line end');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].index, 27);
});

runScenario(44, '$ matches end of each line with m flag', 'Anchors', () => {
  const r = execRegex('end$', 'gm', 'first line end\nsecond line end');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].index, 11);
  assert.equal(r.matches[1].index, 27);
});

runScenario(45, '^ and $ together match entire string', 'Anchors', () => {
  const r1 = execRegex('^\\d{4}$', '', '2026');
  const r2 = execRegex('^\\d{4}$', '', '2026 ');
  assert.equal(r1.matches.length, 1);
  assert.equal(r2.matches.length, 0);
});

runScenario(46, '\\b word boundary matches start of word', 'Anchors', () => {
  const r = execRegex('\\bcat', 'g', 'cat category scatter');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].index, 0);
  assert.equal(r.matches[1].index, 4);
});

runScenario(47, '\\b word boundary matches end of word', 'Anchors', () => {
  const r = execRegex('cat\\b', 'g', 'cat category bobcat');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].index, 0);
  assert.equal(r.matches[1].index, 16);
});

runScenario(48, '\\b on both sides matches exact whole word', 'Anchors', () => {
  const r = execRegex('\\bcat\\b', 'g', 'cat category scatter bobcat cat');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].index, 0);
  assert.equal(r.matches[1].index, 28);
});

runScenario(49, '\\B non-word boundary matches middle of word', 'Anchors', () => {
  const r = execRegex('\\Bcat', 'g', 'cat scatter bobcat');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].index, 5);
  assert.equal(r.matches[1].index, 15);
});

runScenario(50, '\\B on both sides matches substring fully enclosed in word', 'Anchors', () => {
  const r = execRegex('\\Bcat\\B', 'g', 'scatter cat bobcat');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].index, 1);
});

runScenario(51, '^ with empty string matches index 0', 'Anchors', () => {
  const r = execRegex('^', 'g', '');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].index, 0);
});

runScenario(52, '$ with empty string matches index 0', 'Anchors', () => {
  const r = execRegex('$', 'g', '');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].index, 0);
});

runScenario(53, 'Multiline empty lines ^$ matching', 'Anchors', () => {
  const r = execRegex('^$', 'gm', 'line1\n\nline3');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].index, 6);
});

runScenario(54, 'Word boundary with non-ASCII text behavior', 'Anchors', () => {
  const r = execRegex('\\bword\\b', 'g', 'a word b');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'word');
});

runScenario(55, 'Boundary at beginning and end of punctuation', 'Anchors', () => {
  const r = execRegex('\\b\\w+\\b', 'g', '("hello", [world]!)');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'hello');
  assert.equal(r.matches[1].match, 'world');
});

// 4. Alternations and compound patterns (56-65)
runScenario(56, 'Binary alternation cat|dog', 'Alternation', () => {
  const r = execRegex('cat|dog', 'g', 'I love cats and dogs');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'cat');
  assert.equal(r.matches[1].match, 'dog');
});

runScenario(57, 'Three-way alternation', 'Alternation', () => {
  const r = execRegex('apple|banana|cherry', 'g', 'banana cherry apple');
  assert.equal(r.matches.length, 3);
  assert.equal(r.matches[0].match, 'banana');
  assert.equal(r.matches[1].match, 'cherry');
  assert.equal(r.matches[2].match, 'apple');
});

runScenario(58, 'Alternation order precedence (leftmost match wins)', 'Alternation', () => {
  const r1 = execRegex('super|superman', 'g', 'superman');
  const r2 = execRegex('superman|super', 'g', 'superman');
  assert.equal(r1.matches[0].match, 'super');
  assert.equal(r2.matches[0].match, 'superman');
});

runScenario(59, 'Alternation inside parentheses', 'Alternation', () => {
  const r = execRegex('file\\.(jpg|png|gif)', 'g', 'file.png file.txt file.gif');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'file.png');
  assert.equal(r.matches[1].match, 'file.gif');
});

runScenario(60, 'Alternation with prefixes and suffixes', 'Alternation', () => {
  const r = execRegex('pre(fix|sent|pare)', 'g', 'prefix present prepare preview');
  assert.equal(r.matches.length, 3);
});

runScenario(61, 'Alternation with different length matches', 'Alternation', () => {
  const r = execRegex('\\d+|[a-z]+', 'g', 'abc 123 def 456');
  assert.equal(r.matches.length, 4);
});

runScenario(62, 'Alternation combined with anchors', 'Alternation', () => {
  const r = execRegex('^foo|bar$', 'g', 'foo and bar');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'foo');
  assert.equal(r.matches[1].match, 'bar');
});

runScenario(63, 'Empty branch in alternation', 'Alternation', () => {
  const r = execRegex('a|', 'g', 'ab');
  assert.ok(r.matches.length >= 2);
});

runScenario(64, 'Nested alternations ((a|b)|(c|d))', 'Alternation', () => {
  const r = execRegex('((a|b)|(c|d))', 'g', 'a b c d e');
  assert.equal(r.matches.length, 4);
});

runScenario(65, 'Alternation with case insensitivity flag', 'Alternation', () => {
  const r = execRegex('yes|no', 'gi', 'YES No yEs nO');
  assert.equal(r.matches.length, 4);
});

// 5. Capturing groups, nested groups, optional groups (66-85)
runScenario(66, 'Single capturing group extracts submatch', 'Groups', () => {
  const r = execRegex('Item: (\\w+)', '', 'Item: Laptop');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].groups[0], 'Laptop');
});

runScenario(67, 'Multiple numbered capturing groups', 'Groups', () => {
  const r = execRegex('(\\d{4})-(\\d{2})-(\\d{2})', '', '2026-10-24');
  assert.equal(r.matches[0].groups.length, 3);
  assert.equal(r.matches[0].groups[0], '2026');
  assert.equal(r.matches[0].groups[1], '10');
  assert.equal(r.matches[0].groups[2], '24');
});

runScenario(68, 'Nested capturing groups outer and inner', 'Groups', () => {
  const r = execRegex('((\\w+) (\\w+))', '', 'Ada Lovelace');
  assert.equal(r.matches[0].groups.length, 3);
  assert.equal(r.matches[0].groups[0], 'Ada Lovelace');
  assert.equal(r.matches[0].groups[1], 'Ada');
  assert.equal(r.matches[0].groups[2], 'Lovelace');
});

runScenario(69, 'Non-capturing group (?:...) does not increment group index', 'Groups', () => {
  const r = execRegex('(?:https?|ftp):\\/\\/([\\w.]+)', '', 'https://example.com');
  assert.equal(r.matches[0].groups.length, 1);
  assert.equal(r.matches[0].groups[0], 'example.com');
});

runScenario(70, 'Optional group unmatched produces undefined', 'Groups', () => {
  const r = execRegex('(\\d+)(?:-(\\w+))?', '', '100');
  assert.equal(r.matches[0].groups.length, 2);
  assert.equal(r.matches[0].groups[0], '100');
  assert.equal(r.matches[0].groups[1], undefined);
});

runScenario(71, 'Optional group matched produces captured string', 'Groups', () => {
  const r = execRegex('(\\d+)(?:-(\\w+))?', '', '100-alpha');
  assert.equal(r.matches[0].groups.length, 2);
  assert.equal(r.matches[0].groups[0], '100');
  assert.equal(r.matches[0].groups[1], 'alpha');
});

runScenario(72, 'Capturing group inside quantifier retains last matched repetition', 'Groups', () => {
  const r = execRegex('(\\w)+', '', 'abc');
  assert.equal(r.matches[0].match, 'abc');
  assert.equal(r.matches[0].groups[0], 'c');
});

runScenario(73, 'Global flag with capturing groups across all matches', 'Groups', () => {
  const r = execRegex('(\\w+)=(\\d+)', 'g', 'a=1 b=2 c=3');
  assert.equal(r.matches.length, 3);
  assert.equal(r.matches[0].groups[0], 'a');
  assert.equal(r.matches[0].groups[1], '1');
  assert.equal(r.matches[1].groups[0], 'b');
  assert.equal(r.matches[1].groups[1], '2');
  assert.equal(r.matches[2].groups[0], 'c');
  assert.equal(r.matches[2].groups[1], '3');
});

runScenario(74, 'Capture group with alternation (a|b)', 'Groups', () => {
  const r = execRegex('(cat|dog)', 'g', 'dog and cat');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].groups[0], 'dog');
  assert.equal(r.matches[1].groups[0], 'cat');
});

runScenario(75, 'Multiple non-capturing groups in URL parser', 'Groups', () => {
  const r = execRegex('^(?:https?:\\/\\/)?(?:www\\.)?([a-z0-9.-]+)', '', 'https://www.google.com/search');
  assert.equal(r.matches[0].groups.length, 1);
  assert.equal(r.matches[0].groups[0], 'google.com');
});

runScenario(76, 'Backreference \\1 matches repeated word', 'Groups', () => {
  const r = execRegex('\\b(\\w+)\\s+\\1\\b', 'gi', 'the the cat in in the hat');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'the the');
  assert.equal(r.matches[1].match, 'in in');
});

runScenario(77, 'Multiple backreferences \\1 and \\2', 'Groups', () => {
  const r = execRegex('([a-z])([0-9])\\1\\2', 'g', 'a1a1 b2b2 c3d4');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'a1a1');
  assert.equal(r.matches[1].match, 'b2b2');
});

runScenario(78, 'Backreference for matching quotes (\'|")(.*?)\\1', 'Groups', () => {
  const r = execRegex('([\'"])(.*?)\\1', 'g', '"quoted" and \'single\' and "mismatched\'');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '"quoted"');
  assert.equal(r.matches[1].match, '\'single\'');
});

runScenario(79, 'Unmatched group in backreference does not match', 'Groups', () => {
  const r = execRegex('(a)?b\\1', 'g', 'b');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'b');
});

runScenario(80, 'Group with complex quantifier inside (\\d{2,4})', 'Groups', () => {
  const r = execRegex('Code: (\\d{2,4})', 'g', 'Code: 12 Code: 1234');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].groups[0], '12');
  assert.equal(r.matches[1].groups[0], '1234');
});

runScenario(81, 'Four capturing groups', 'Groups', () => {
  const r = execRegex('(\\d)\\.(\\d)\\.(\\d)\\.(\\d)', '', '1.2.3.4');
  assert.equal(r.matches[0].groups.length, 4);
  assert.deepEqual(r.matches[0].groups, ['1', '2', '3', '4']);
});

runScenario(82, 'Empty capturing group () matches zero length', 'Groups', () => {
  const r = execRegex('a()b', '', 'ab');
  assert.equal(r.matches[0].groups.length, 1);
  assert.equal(r.matches[0].groups[0], '');
});

runScenario(83, 'Capture group with unicode characters', 'Groups', () => {
  const r = execRegex('name: ([\\p{L}]+)', 'gu', 'name: François');
  assert.equal(r.matches[0].groups[0], 'François');
});

runScenario(84, 'Capture group in multiline text', 'Groups', () => {
  const r = execRegex('^Title: (.*)$', 'gm', 'Title: Hello\nAuthor: John\nTitle: World');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].groups[0], 'Hello');
  assert.equal(r.matches[1].groups[0], 'World');
});

runScenario(85, 'Indices flag d generates indices array for groups', 'Groups', () => {
  const r = execRegex('(foo)(bar)', 'd', 'foobar');
  assert.equal(r.matches.length, 1);
  assert.ok(r.matches[0].indices !== undefined);
  assert.equal(r.matches[0].indices.length, 3);
});

// 6. Named groups, backreferences, named backreferences (86-100)
runScenario(86, 'Single named group (?<id>\\d+)', 'NamedGroups', () => {
  const r = execRegex('ID: (?<id>\\d+)', '', 'ID: 4892');
  assert.equal(r.matches[0].namedGroups.id, '4892');
});

runScenario(87, 'Multiple named groups date parsing', 'NamedGroups', () => {
  const r = execRegex('(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})', '', '2026-10-24');
  assert.equal(r.matches[0].namedGroups.year, '2026');
  assert.equal(r.matches[0].namedGroups.month, '10');
  assert.equal(r.matches[0].namedGroups.day, '24');
});

runScenario(88, 'Named group with optional component', 'NamedGroups', () => {
  const r = execRegex('(?<major>\\d+)(?:\\.(?<minor>\\d+))?', '', '10');
  assert.equal(r.matches[0].namedGroups.major, '10');
  assert.equal(r.matches[0].namedGroups.minor, undefined);
});

runScenario(89, 'Named backreference \\k<name>', 'NamedGroups', () => {
  const r = execRegex('<(?<tag>\\w+)>.*?</\\k<tag>>', 'g', '<div>hello</div> <span>world</span> <div>mismatch</span>');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '<div>hello</div>');
  assert.equal(r.matches[1].match, '<span>world</span>');
});

runScenario(90, 'Mixed numbered and named groups', 'NamedGroups', () => {
  const r = execRegex('(\\w+) (?<last>\\w+)', '', 'Ada Lovelace');
  assert.equal(r.matches[0].groups[0], 'Ada');
  assert.equal(r.matches[0].groups[1], 'Lovelace');
  assert.equal(r.matches[0].namedGroups.last, 'Lovelace');
});

runScenario(91, 'Global regex with named groups', 'NamedGroups', () => {
  const r = execRegex('(?<key>\\w+)=(?<val>\\w+)', 'g', 'x=10 y=20');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].namedGroups.key, 'x');
  assert.equal(r.matches[0].namedGroups.val, '10');
  assert.equal(r.matches[1].namedGroups.key, 'y');
  assert.equal(r.matches[1].namedGroups.val, '20');
});

runScenario(92, 'Replacement with named group reference $<name>', 'NamedGroups', () => {
  const r = execRegex('(?<greeting>\\w+) (?<name>\\w+)', '', 'Hello World', '$<name>, $<greeting>!');
  assert.equal(r.replacedText, 'World, Hello!');
});

runScenario(93, 'Duplicate named group references in replacement', 'NamedGroups', () => {
  const r = execRegex('(?<word>\\w+)', '', 'echo', '$<word> $<word>');
  assert.equal(r.replacedText, 'echo echo');
});

runScenario(94, 'Named group with unicode identifiers', 'NamedGroups', () => {
  const r = execRegex('(?<année>\\d{4})', 'u', '2026');
  assert.equal(r.matches[0].namedGroups.année, '2026');
});

runScenario(95, 'Named group with underscore identifier', 'NamedGroups', () => {
  const r = execRegex('(?<_item_id>\\d+)', '', 'Order: 777');
  assert.equal(r.matches[0].namedGroups._item_id, '777');
});

runScenario(96, 'Empty string in named group match', 'NamedGroups', () => {
  const r = execRegex('a(?<empty>)b', '', 'ab');
  assert.equal(r.matches[0].namedGroups.empty, '');
});

runScenario(97, 'Multiple named backreferences in one regex', 'NamedGroups', () => {
  const r = execRegex('(?<a>\\w)(?<b>\\w)\\k<b>\\k<a>', 'g', 'abba noon test');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'abba');
  assert.equal(r.matches[1].match, 'noon');
});

runScenario(98, 'Named group inside alternation', 'NamedGroups', () => {
  const r = execRegex('(?:(?<num>\\d+)|(?<str>[a-z]+))', 'g', '123 abc');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].namedGroups.num, '123');
  assert.equal(r.matches[1].namedGroups.str, 'abc');
});

runScenario(99, 'Named group with special characters escaped inside', 'NamedGroups', () => {
  const r = execRegex('(?<price>\\$\\d+)', '', 'Total: $50');
  assert.equal(r.matches[0].namedGroups.price, '$50');
});

runScenario(100, 'Named group indices with d flag', 'NamedGroups', () => {
  const r = execRegex('(?<tag>\\w+)', 'd', 'hello');
  assert.ok(r.matches[0].indices !== undefined);
});

// 7. Lookahead and lookbehind assertions (101-115)
runScenario(101, 'Positive lookahead (?=...) checks suffix without consuming', 'Lookarounds', () => {
  const r = execRegex('\\d+(?= dollars)', 'g', '10 dollars, 20 euros, 30 dollars');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '10');
  assert.equal(r.matches[1].match, '30');
});

runScenario(102, 'Negative lookahead (?!...) asserts succeeding pattern absent', 'Lookarounds', () => {
  const r = execRegex('\\d+(?! dollars)', 'g', '10 dollars, 20 euros');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '1');
  assert.equal(r.matches[1].match, '20');
});

runScenario(103, 'Positive lookbehind (?<=...) checks prefix without consuming', 'Lookarounds', () => {
  const r = execRegex('(?<=\\$)\\d+', 'g', '$100 €200 $300');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '100');
  assert.equal(r.matches[1].match, '300');
});

runScenario(104, 'Negative lookbehind (?<!...) asserts preceding pattern absent', 'Lookarounds', () => {
  const r = execRegex('(?<!\\$)\\b\\d+\\b', 'g', '$100 200 $300 400');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '200');
  assert.equal(r.matches[1].match, '400');
});

runScenario(105, 'Combined lookahead and lookbehind', 'Lookarounds', () => {
  const r = execRegex('(?<=<b>).*?(?=</b>)', 'g', '<b>bold text</b> and <b>more</b>');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'bold text');
  assert.equal(r.matches[1].match, 'more');
});

runScenario(106, 'Password strength lookahead assertion', 'Lookarounds', () => {
  const pattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$';
  const valid = execRegex(pattern, '', 'Pass1234');
  const invalid = execRegex(pattern, '', 'pass1234');
  assert.equal(valid.matches.length, 1);
  assert.equal(invalid.matches.length, 0);
});

runScenario(107, 'Lookahead with capture group inside', 'Lookarounds', () => {
  const r = execRegex('(?=(\\d{3}))', 'g', '12345');
  assert.equal(r.matches.length, 3);
  assert.equal(r.matches[0].groups[0], '123');
  assert.equal(r.matches[1].groups[0], '234');
  assert.equal(r.matches[2].groups[0], '345');
});

runScenario(108, 'Zero-length lookahead match on boundary', 'Lookarounds', () => {
  const r = execRegex('(?=\\b)', 'g', 'a b');
  assert.ok(r.matches.length >= 2);
});

runScenario(109, 'Lookahead with alternation (?=cat|dog)', 'Lookarounds', () => {
  const r = execRegex('\\w+(?=\\s+(?:cat|dog))', 'g', 'big cat small dog green bird');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'big');
  assert.equal(r.matches[1].match, 'small');
});

runScenario(110, 'Variable length lookbehind support in modern ECMAScript', 'Lookarounds', () => {
  const r = execRegex('(?<=https?:\\/\\/)[\\w.]+', 'g', 'http://example.com and https://kivarotools.com');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'example.com');
  assert.equal(r.matches[1].match, 'kivarotools.com');
});

runScenario(111, 'Negative lookbehind for escaped quotes', 'Lookarounds', () => {
  const r = execRegex('(?<!\\\\)"', 'g', 'He said "Hello \\"World\\""');
  assert.equal(r.matches.length, 2);
});

runScenario(112, 'Lookaround without preceding token', 'Lookarounds', () => {
  const r = execRegex('(?=foo)foo', 'g', 'foobar foo');
  assert.equal(r.matches.length, 2);
});

runScenario(113, 'Negative lookahead preventing specific word', 'Lookarounds', () => {
  const r = execRegex('\\b(?!admin\\b)\\w+\\b', 'g', 'admin user guest admin');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, 'user');
  assert.equal(r.matches[1].match, 'guest');
});

runScenario(114, 'Lookahead at string end (?=$)', 'Lookarounds', () => {
  const r = execRegex('\\d+(?=$)', '', 'item 123');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, '123');
});

runScenario(115, 'Nested lookahead assertions', 'Lookarounds', () => {
  const r = execRegex('a(?=b(?=c))', 'g', 'abc abd');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'a');
});

// 8. Flags & flag combinations (116-125)
runScenario(116, 'Flag g matches globally', 'Flags', () => {
  const r = execRegex('a', 'g', 'banana');
  assert.equal(r.matches.length, 3);
});

runScenario(117, 'Flag i ignores case', 'Flags', () => {
  const r = execRegex('test', 'i', 'TeSt');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'TeSt');
});

runScenario(118, 'Flag m enables multiline anchors', 'Flags', () => {
  const r = execRegex('^\\w+', 'm', 'first\nsecond');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'first');
});

runScenario(119, 'Flag s dotAll allows newline in wildcard', 'Flags', () => {
  const r = execRegex('a.*b', 's', 'a\n\nb');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'a\n\nb');
});

runScenario(120, 'Flag u enables full Unicode code point parsing', 'Flags', () => {
  const r = execRegex('^.$', 'u', '𝌆');
  assert.equal(r.matches.length, 1);
});

runScenario(121, 'Flag y sticky matches only at exact offset', 'Flags', () => {
  const r = execRegex('\\w+', 'y', 'hello world');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'hello');
});

runScenario(122, 'Flag d generates indices', 'Flags', () => {
  const r = execRegex('\\d+', 'd', '123');
  assert.ok(r.matches[0].indices !== undefined);
});

runScenario(123, 'Combination gim: global, case-insensitive, multiline', 'Flags', () => {
  const r = execRegex('^item', 'gim', 'Item 1\nitem 2\nITEM 3');
  assert.equal(r.matches.length, 3);
});

runScenario(124, 'Combination gims: global, case-insensitive, multiline, dotAll', 'Flags', () => {
  const r = execRegex('^start.*?end$', 'gims', 'Start\nmiddle\nEND');
  assert.equal(r.matches.length, 1);
});

runScenario(125, 'No flags returns single first match', 'Flags', () => {
  const r = execRegex('\\d+', '', '1 2 3');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, '1');
});

// 9. Replacement tokens: $1, $&, $`, $', $$, $<name> (126-135)
runScenario(126, 'Replacement token $1 inserts group 1', 'Replacement', () => {
  const r = execRegex('Hello (\\w+)', '', 'Hello Alice', 'Hi $1');
  assert.equal(r.replacedText, 'Hi Alice');
});

runScenario(127, 'Replacement token $& inserts entire match', 'Replacement', () => {
  const r = execRegex('\\b\\w+\\b', 'g', 'foo bar', '[$&]');
  assert.equal(r.replacedText, '[foo] [bar]');
});

runScenario(128, 'Replacement token $` inserts preceding string', 'Replacement', () => {
  const r = execRegex('world', '', 'hello world', '$`');
  assert.equal(r.replacedText, 'hello hello ');
});

runScenario(129, 'Replacement token $\' inserts following string', 'Replacement', () => {
  const r = execRegex('hello', '', 'hello world', '$\'');
  assert.equal(r.replacedText, ' world world');
});

runScenario(130, 'Replacement token $$ inserts literal dollar sign', 'Replacement', () => {
  const r = execRegex('\\d+', 'g', '100', '$$$&');
  assert.equal(r.replacedText, '$100');
});

runScenario(131, 'Replacement token $<name> inserts named group', 'Replacement', () => {
  const r = execRegex('(?<first>\\w+) (?<last>\\w+)', '', 'Ada Lovelace', '$<last>, $<first>');
  assert.equal(r.replacedText, 'Lovelace, Ada');
});

runScenario(132, 'Replacement with non-global regex replaces only first match', 'Replacement', () => {
  const r = execRegex('a', '', 'banana', 'X');
  assert.equal(r.replacedText, 'bXnana');
});

runScenario(133, 'Replacement with global regex replaces all matches', 'Replacement', () => {
  const r = execRegex('a', 'g', 'banana', 'X');
  assert.equal(r.replacedText, 'bXnXnX');
});

runScenario(134, 'Replacement with empty replacement string deletes matches', 'Replacement', () => {
  const r = execRegex('\\d+', 'g', 'a1b2c3d', '');
  assert.equal(r.replacedText, 'abcd');
});

runScenario(135, 'Replacement with special symbols in replacement string', 'Replacement', () => {
  const r = execRegex('world', '', 'hello world', 'universe & galaxy!');
  assert.equal(r.replacedText, 'hello universe & galaxy!');
});

// 10. Split evaluation and splicing mechanics (136-145)
runScenario(136, 'Split by comma and whitespace', 'Split', () => {
  const r = execRegex('[,;]\\s*', '', 'a, b;c,d');
  assert.deepEqual(r.splitResult, ['a', 'b', 'c', 'd']);
});

runScenario(137, 'Split by whitespace token \\s+', 'Split', () => {
  const r = execRegex('\\s+', '', 'one   two\tthree\nfour');
  assert.deepEqual(r.splitResult, ['one', 'two', 'three', 'four']);
});

runScenario(138, 'Split with capturing group splices delimiters into output', 'Split', () => {
  const r = execRegex('(-)', '', 'a-b-c');
  assert.deepEqual(r.splitResult, ['a', '-', 'b', '-', 'c']);
});

runScenario(139, 'Split with non-capturing group excludes delimiters', 'Split', () => {
  const r = execRegex('(?:-)', '', 'a-b-c');
  assert.deepEqual(r.splitResult, ['a', 'b', 'c']);
});

runScenario(140, 'Split on no-match returns single element with full string', 'Split', () => {
  const r = execRegex('xyz', '', 'hello world');
  assert.deepEqual(r.splitResult, ['hello world']);
});

runScenario(141, 'Split on empty string returns empty array element', 'Split', () => {
  const r = execRegex(',', '', '');
  assert.deepEqual(r.splitResult, ['']);
});

runScenario(142, 'Split by line breaks \\r?\\n', 'Split', () => {
  const r = execRegex('\\r?\\n', '', 'line1\r\nline2\nline3');
  assert.deepEqual(r.splitResult, ['line1', 'line2', 'line3']);
});

runScenario(143, 'Split by boundary pattern', 'Split', () => {
  const r = execRegex('\\s*\\|\\s*', '', 'col1 | col2 | col3');
  assert.deepEqual(r.splitResult, ['col1', 'col2', 'col3']);
});

runScenario(144, 'Split with limit protection (max 500)', 'Split', () => {
  const text = new Array(600).fill('item').join(',');
  const r = execRegex(',', '', text);
  assert.equal(r.splitResult.length, 500);
});

runScenario(145, 'Split by digits', 'Split', () => {
  const r = execRegex('\\d+', '', 'foo123bar456baz');
  assert.deepEqual(r.splitResult, ['foo', 'bar', 'baz']);
});

// 11. Zero-width matches and infinite loop guards (146-155)
runScenario(146, 'Zero-length lookahead (?=a) terminates cleanly', 'ZeroWidth', () => {
  const r = execRegex('(?=a)', 'g', 'aaa');
  assert.equal(r.matches.length, 3);
  assert.equal(r.matches[0].index, 0);
  assert.equal(r.matches[1].index, 1);
  assert.equal(r.matches[2].index, 2);
});

runScenario(147, 'Word boundary \\b zero-width global match', 'ZeroWidth', () => {
  const r = execRegex('\\b', 'g', 'a b');
  assert.equal(r.matches.length, 4);
});

runScenario(148, 'Zero-width optional pattern a*', 'ZeroWidth', () => {
  const r = execRegex('a*', 'g', 'b');
  assert.ok(r.matches.length >= 1);
});

runScenario(149, 'Zero-width match on empty string with ^', 'ZeroWidth', () => {
  const r = execRegex('^', 'g', '');
  assert.equal(r.matches.length, 1);
});

runScenario(150, 'Zero-width match on astral unicode character with u flag advances by 2 code units', 'ZeroWidth', () => {
  const r = execRegex('(?=𝌆)', 'gu', '𝌆');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].index, 0);
});

runScenario(151, 'Empty pattern produces 0 matches safely', 'ZeroWidth', () => {
  const r = execRegex('', 'g', 'hello world');
  assert.equal(r.matches.length, 0);
});

runScenario(152, 'Empty string with \\b produces 0 matches', 'ZeroWidth', () => {
  const r = execRegex('\\b', 'g', '');
  assert.equal(r.matches.length, 0);
});

runScenario(153, 'Zero-width negative lookahead (?!b) advances correctly', 'ZeroWidth', () => {
  const r = execRegex('(?!b)', 'g', 'ab');
  assert.ok(r.matches.length >= 1);
});

runScenario(154, 'Zero-width anchor combination ^|$', 'ZeroWidth', () => {
  const r = execRegex('^|$', 'g', 'abc');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].index, 0);
  assert.equal(r.matches[1].index, 3);
});

runScenario(155, 'Loop limit guard on zero-width match sequence', 'ZeroWidth', () => {
  const r = execRegex('(?=)', 'g', 'test');
  assert.ok(r.matches.length <= 10);
});

// 12. Syntax errors and diagnostic pointer extraction (156-165)
runScenario(156, 'Unterminated bracket [ throws SyntaxError', 'SyntaxErrors', () => {
  const r = execRegex('[a-z', 'g', 'abc');
  assert.equal(r.success, false);
  assert.ok(r.error && /unterminated|character class/i.test(r.error));
});

runScenario(157, 'Unterminated parenthesis ( throws SyntaxError', 'SyntaxErrors', () => {
  const r = execRegex('(abc', 'g', 'abc');
  assert.equal(r.success, false);
  assert.ok(r.error && /unterminated|parenthetical|group/i.test(r.error));
});

runScenario(158, 'Dangling backslash \\ throws SyntaxError', 'SyntaxErrors', () => {
  const r = execRegex('\\', '', 'abc');
  assert.equal(r.success, false);
});

runScenario(159, 'Invalid quantifier at start +abc throws SyntaxError', 'SyntaxErrors', () => {
  const r = execRegex('+abc', '', 'abc');
  assert.equal(r.success, false);
});

runScenario(160, 'Inverted range in character class [z-a] throws SyntaxError', 'SyntaxErrors', () => {
  const r = execRegex('[z-a]', '', 'abc');
  assert.equal(r.success, false);
  assert.ok(r.error && /out of order|range/i.test(r.error));
});

runScenario(161, 'Duplicate flags gg throws SyntaxError', 'SyntaxErrors', () => {
  const r = execRegex('cat', 'gg', 'cat');
  assert.equal(r.success, false);
  assert.ok(r.error && /invalid regular expression flags|invalid flags/i.test(r.error));
});

runScenario(162, 'Invalid flag z throws SyntaxError', 'SyntaxErrors', () => {
  const r = execRegex('cat', 'z', 'cat');
  assert.equal(r.success, false);
  assert.ok(r.error && /invalid regular expression flags|invalid flags/i.test(r.error));
});

runScenario(163, 'parseRegexSyntaxError extracts position offset and caret pointer', 'SyntaxErrors', () => {
  const diag = parseRegexSyntaxError('Invalid regular expression: /[a-z/: Unterminated character class at position 2', '[a-z');
  assert.equal(diag.position, 2);
  assert.ok(diag.pointer !== null);
  assert.ok(diag.pointer.includes('^'));
});

runScenario(164, 'parseRegexSyntaxError clamps out-of-bounds positions', 'SyntaxErrors', () => {
  const diag = parseRegexSyntaxError('Invalid regular expression: /[a-z/: Unterminated at position 999', '[a-z');
  assert.equal(diag.position, 4);
});

runScenario(165, 'parseRegexSyntaxError handles messages without position gracefully', 'SyntaxErrors', () => {
  const diag = parseRegexSyntaxError('Syntax error without offset', 'pattern');
  assert.equal(diag.position, null);
  assert.equal(diag.pointer, null);
});

// 13. ReDoS heuristics and compatibility analyzer (166-175)
runScenario(166, 'analyzeRegexRisk detects nested quantifiers (a+)+', 'Diagnostics', () => {
  const risk = analyzeRegexRisk('(a+)+', 'g');
  assert.equal(risk.level, 'high');
  assert.ok(risk.findings.some((f) => f.title.includes('Nested quantifiers')));
});

runScenario(167, 'analyzeRegexRisk detects ambiguous alternation (a|aa)+', 'Diagnostics', () => {
  const risk = analyzeRegexRisk('(a|aa)+', 'g');
  assert.equal(risk.level, 'high');
});

runScenario(168, 'analyzeRegexRisk flags broad quantified wildcard .* unanchored', 'Diagnostics', () => {
  const risk = analyzeRegexRisk('.*foo.*', 'g');
  assert.ok(risk.score >= 20);
});

runScenario(169, 'analyzeRegexRisk scores safe literal pattern as low risk', 'Diagnostics', () => {
  const risk = analyzeRegexRisk('cat', 'g');
  assert.equal(risk.level, 'low');
  assert.equal(risk.score, 0);
});

runScenario(170, 'analyzeCompatibility provides Python warning for named groups', 'Diagnostics', () => {
  const compat = analyzeCompatibility('(?<name>\\w+)', 'g');
  const py = compat.find((c) => c.target === 'Python' && c.level === 'warning');
  assert.ok(py !== undefined);
  assert.ok(py.detail.includes('(?P<name>...)'));
});

runScenario(171, 'analyzeCompatibility warns on sticky flag y for Go and Python', 'Diagnostics', () => {
  const compat = analyzeCompatibility('\\w+', 'y');
  assert.ok(compat.some((c) => c.target === 'Python' && c.level === 'warning'));
  assert.ok(compat.some((c) => c.target === 'Go' && c.level === 'warning'));
});

runScenario(172, 'analyzeCompatibility warns on lookarounds for Go RE2 engine', 'Diagnostics', () => {
  const compat = analyzeCompatibility('(?=foo)', 'g');
  const go = compat.find((c) => c.target === 'Go');
  assert.ok(go !== undefined && go.level === 'warning');
});

runScenario(173, 'explainPattern tokenizes character classes, anchors, quantifiers', 'Diagnostics', () => {
  const tokens = explainPattern('^\\d+[a-z]*$');
  assert.ok(tokens.length >= 4);
  assert.equal(tokens[0].token, '^');
  assert.equal(tokens[1].token, '\\d');
  assert.equal(tokens[2].token, '+');
});

runScenario(174, 'explainPattern tokenizes lookahead and lookbehind', 'Diagnostics', () => {
  const tokens = explainPattern('(?=abc)(?<=def)');
  assert.ok(tokens.some((t) => t.token === '(?='));
  assert.ok(tokens.some((t) => t.token === '(?<='));
});

runScenario(175, 'explainPattern tokenizes named groups and unicode properties', 'Diagnostics', () => {
  const tokens = explainPattern('(?<id>\\d+)\\p{L}');
  assert.ok(tokens.some((t) => t.token.includes('(?<id>')));
  assert.ok(tokens.some((t) => t.token.includes('\\p{L}')));
});

// 14. Unicode astral planes, emojis, and CSV sanitization (176-185)
runScenario(176, 'Astral plane emoji matching with u flag', 'Unicode', () => {
  const r = execRegex('\\p{Emoji}+', 'gu', 'Status: 🚀 ready! 🎉');
  assert.equal(r.matches.length, 2);
  assert.equal(r.matches[0].match, '🚀');
  assert.equal(r.matches[1].match, '🎉');
});

runScenario(177, 'Surrogate pair offset calculation without crashing', 'Unicode', () => {
  const r = execRegex('🚀', 'gu', 'Alpha 🚀 Beta');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].index, 6);
  assert.equal(r.matches[0].end, 8);
});

runScenario(178, 'Accented characters with standard word class without u flag', 'Unicode', () => {
  const r = execRegex('\\w+', 'g', 'café');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'caf');
});

runScenario(179, 'Accented characters matched with unicode property \\p{L}', 'Unicode', () => {
  const r = execRegex('\\p{L}+', 'gu', 'café');
  assert.equal(r.matches.length, 1);
  assert.equal(r.matches[0].match, 'café');
});

runScenario(180, 'sanitizeForCsv neutralizes leading equal sign =SUM()', 'Security', () => {
  const safe = sanitizeForCsv('=SUM(A1:B10)');
  assert.equal(safe, '"\'=SUM(A1:B10)"');
});

runScenario(181, 'sanitizeForCsv neutralizes leading plus sign +CMD()', 'Security', () => {
  const safe = sanitizeForCsv('+cmd|"/c calc"!A0');
  assert.equal(safe, '"\'+cmd|""/c calc""!A0"');
});

runScenario(182, 'sanitizeForCsv neutralizes leading minus sign -50', 'Security', () => {
  const safe = sanitizeForCsv('-50');
  assert.equal(safe, '"\'-50"');
});

runScenario(183, 'sanitizeForCsv neutralizes leading at symbol @SUM', 'Security', () => {
  const safe = sanitizeForCsv('@SUM(A1)');
  assert.equal(safe, '"\'@SUM(A1)"');
});

runScenario(184, 'sanitizeForCsv escapes internal double quotes', 'Security', () => {
  const safe = sanitizeForCsv('Hello "World"');
  assert.equal(safe, '"Hello ""World"""');
});

runScenario(185, 'String serialization escapes newlines, quotes, backslashes for JS, Python, Java', 'Security', () => {
  const text = 'Line 1\nLine 2 with "quotes" and \\backslashes';
  const js = serializeJsString(text);
  const py = serializePythonString(text);
  const java = serializeJavaString(text);
  assert.ok(js.includes('\\n'));
  assert.ok(py.includes('\\n'));
  assert.ok(java.includes('\\n'));
});

console.log('\n======================================================');
console.log(`✓ Completed 150+ Test Suite: ${passCount} / ${suiteResults.length} Tests Passed!`);
console.log('======================================================\n');

if (passCount !== suiteResults.length) {
  process.exit(1);
}
