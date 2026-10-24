'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode, UIEvent } from 'react';
import {
  AlertCircle,
  BookOpen,
  Braces,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  Library,
  Play,
  RotateCcw,
  Rows,
  Scissors,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Trash2,
  Wand2,
} from 'lucide-react';

export type RegexFlag = 'g' | 'i' | 'm' | 's' | 'u' | 'y' | 'd';
export type ActiveTab = 'breakdown' | 'replace' | 'split' | 'cheatsheet' | 'explain' | 'analyze' | 'code';

export interface MatchData {
  match: string;
  index: number;
  end: number;
  groups: (string | undefined)[];
  namedGroups: Record<string, string | undefined>;
  indices?: [number, number][];
}

export type WorkerResponse =
  | {
      type: 'result';
      requestId: number;
      matches: MatchData[];
      replacedText: string;
      splitResult: string[];
      matchLimitReached: boolean;
      durationMs: number;
    }
  | { type: 'error'; requestId: number; error: string }
  | { type: 'ready' };

const MAX_TEST_CHARS = 150_000;
const MAX_PATTERN_CHARS = 4_000;
const MAX_MATCHES = 10_000;
const EXECUTION_TIMEOUT_MS = 1_200;
const PAGE_SIZE = 50;
const MAX_HIGHLIGHT_MATCHES = 300;

export const COMMON_PATTERNS = [
  { name: 'Email Address', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', flags: 'gm', desc: 'Standard email format heuristic' },
  { name: 'Strong Password', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{12,}$', flags: 'gm', desc: '12+ chars with upper, lower, digit, and symbol' },
  { name: 'URL / Website', pattern: 'https?:\\/\\/(?:www\\.)?[^\\s<]+', flags: 'gi', desc: 'HTTP/HTTPS web address' },
  { name: 'IPv4 Address', pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\b', flags: 'g', desc: 'Valid 0.0.0.0 to 255.255.255.255 octets' },
  { name: 'HTML Tags', pattern: '<\\/?[a-z][a-z0-9-]*\\b[^>]*>', flags: 'gi', desc: 'HTML opening, closing, and self-closing tags' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\b\\d{4}-\\d{2}-\\d{2}\\b', flags: 'g', desc: 'ISO 8601 calendar date' },
  { name: 'UUID / GUID', pattern: '\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\b', flags: 'gi', desc: 'Standard 8-4-4-4-12 hexadecimal GUID' },
  { name: 'Hex Color', pattern: '#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b', flags: 'gi', desc: '3 or 6 hex digit color code' },
  { name: 'Currency Amount', pattern: '(?:\\$|€|£|¥)\\s*\\d+(?:,\\d{3})*(?:\\.\\d{2})?', flags: 'g', desc: 'Currency symbol with comma-separated numbers' },
  { name: 'SemVer', pattern: '\\bv?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-[0-9a-zA-Z.-]+)?(?:\\+[0-9a-zA-Z.-]+)?\\b', flags: 'g', desc: 'Semantic version number' },
  { name: 'Phone Number', pattern: '\\+?[1-9]\\d[\\d ()-]{6,}\\d', flags: 'g', desc: 'International and national phone heuristic' },
  { name: 'Quoted String', pattern: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'', flags: 'g', desc: 'Single or double quoted literals with escapes' },
];

export const FLAG_INFO: { id: RegexFlag; label: string; title: string; desc: string }[] = [
  { id: 'g', label: 'g', title: 'Global', desc: 'Find all matches rather than stopping after first' },
  { id: 'i', label: 'i', title: 'Ignore Case', desc: 'Case-insensitive matching' },
  { id: 'm', label: 'm', title: 'Multiline', desc: '^ and $ match start and end of each line' },
  { id: 's', label: 's', title: 'DotAll', desc: '. matches all characters including newlines' },
  { id: 'u', label: 'u', title: 'Unicode', desc: 'Treat pattern as a sequence of Unicode code points' },
  { id: 'y', label: 'y', title: 'Sticky', desc: 'Match only from the index indicated by lastIndex' },
  { id: 'd', label: 'd', title: 'Indices', desc: 'Generate indices for substring matches' },
];

export interface CheatSheetEntry {
  token: string;
  name: string;
  desc: string;
  example: string;
  category: 'Classes' | 'Quantifiers' | 'Anchors' | 'Groups' | 'Flags' | 'Replacements';
}

export const CHEAT_SHEET_DATA: CheatSheetEntry[] = [
  // Character Classes
  { token: '\\d', name: 'Digit', desc: 'Matches any Arabic numeral character [0-9]', example: '\\d+', category: 'Classes' },
  { token: '\\D', name: 'Non-Digit', desc: 'Matches any character that is not a digit [^0-9]', example: '\\D+', category: 'Classes' },
  { token: '\\w', name: 'Word Character', desc: 'Matches ASCII letter, digit, or underscore [A-Za-z0-9_]', example: '\\w+', category: 'Classes' },
  { token: '\\W', name: 'Non-Word Character', desc: 'Matches any non-word character [^A-Za-z0-9_]', example: '\\W+', category: 'Classes' },
  { token: '\\s', name: 'Whitespace', desc: 'Matches space, tab, newline, carriage return, form feed', example: '\\s+', category: 'Classes' },
  { token: '\\S', name: 'Non-Whitespace', desc: 'Matches any character that is not whitespace', example: '\\S+', category: 'Classes' },
  { token: '.', name: 'Wildcard (Dot)', desc: 'Matches any character except line breaks (or all with s flag)', example: 'a.c', category: 'Classes' },
  { token: '[abc]', name: 'Character Set', desc: 'Matches any one character enclosed in the brackets', example: '[aeiou]', category: 'Classes' },
  { token: '[^abc]', name: 'Negated Set', desc: 'Matches any one character NOT enclosed in the brackets', example: '[^0-9]', category: 'Classes' },
  { token: '[a-z]', name: 'Character Range', desc: 'Matches any single character within the ASCII range', example: '[0-9a-fA-F]', category: 'Classes' },
  { token: '\\p{L}', name: 'Unicode Category', desc: 'Matches any letter in any writing system (requires u flag)', example: '\\p{Letter}+', category: 'Classes' },

  // Quantifiers
  { token: '*', name: 'Zero or More', desc: 'Matches 0 or more times (greedy)', example: 'ba*', category: 'Quantifiers' },
  { token: '+', name: 'One or More', desc: 'Matches 1 or more times (greedy)', example: 'ba+', category: 'Quantifiers' },
  { token: '?', name: 'Optional / Lazy', desc: 'Matches 0 or 1 time, or turns preceding quantifier lazy', example: 'colou?r', category: 'Quantifiers' },
  { token: '{n}', name: 'Exact Count', desc: 'Matches exactly n consecutive times', example: '\\d{4}', category: 'Quantifiers' },
  { token: '{n,}', name: 'Minimum Count', desc: 'Matches n or more consecutive times', example: '\\d{2,}', category: 'Quantifiers' },
  { token: '{n,m}', name: 'Bounded Range', desc: 'Matches between n and m consecutive times', example: '\\d{2,4}', category: 'Quantifiers' },
  { token: '*?', name: 'Lazy Zero or More', desc: 'Matches 0 or more times, taking as few chars as possible', example: '<.*?>', category: 'Quantifiers' },
  { token: '+?', name: 'Lazy One or More', desc: 'Matches 1 or more times, taking as few chars as possible', example: '<.+?>', category: 'Quantifiers' },

  // Anchors & Boundaries
  { token: '^', name: 'Start Anchor', desc: 'Matches beginning of string (or line with m flag)', example: '^http', category: 'Anchors' },
  { token: '$', name: 'End Anchor', desc: 'Matches end of string (or line with m flag)', example: '\\.html$', category: 'Anchors' },
  { token: '\\b', name: 'Word Boundary', desc: 'Matches zero-width position between word and non-word char', example: '\\bcat\\b', category: 'Anchors' },
  { token: '\\B', name: 'Non-Word Boundary', desc: 'Matches zero-width position inside or outside words', example: '\\Bcat', category: 'Anchors' },

  // Groups & Lookarounds
  { token: '(...)', name: 'Capturing Group', desc: 'Groups tokens and creates a numbered capture ($1, $2)', example: '(\\w+)@(\\w+)', category: 'Groups' },
  { token: '(?:...)', name: 'Non-Capturing Group', desc: 'Groups tokens without creating a numbered capture', example: '(?:https?|ftp)', category: 'Groups' },
  { token: '(?<name>...)', name: 'Named Group', desc: 'Captures match into a named dictionary key', example: '(?<id>\\d+)', category: 'Groups' },
  { token: '(?=...)', name: 'Positive Lookahead', desc: 'Asserts succeeding text matches without consuming chars', example: 'q(?=u)', category: 'Groups' },
  { token: '(?!...)', name: 'Negative Lookahead', desc: 'Asserts succeeding text does NOT match', example: 'q(?!u)', category: 'Groups' },
  { token: '(?<=...)', name: 'Positive Lookbehind', desc: 'Asserts preceding text matches without consuming chars', example: '(?<=\\$)\\d+', category: 'Groups' },
  { token: '(?<!...)', name: 'Negative Lookbehind', desc: 'Asserts preceding text does NOT match', example: '(?<!\\\\)"', category: 'Groups' },
  { token: '\\1', name: 'Backreference', desc: 'Matches the exact same text matched by group number 1', example: '([\'"])(.*?)\\1', category: 'Groups' },

  // Flags
  { token: 'g', name: 'Global Flag', desc: 'Matches all occurrences rather than returning on first match', example: '/pattern/g', category: 'Flags' },
  { token: 'i', name: 'Ignore Case Flag', desc: 'Case-insensitive matching across uppercase and lowercase', example: '/test/i', category: 'Flags' },
  { token: 'm', name: 'Multiline Flag', desc: '^ and $ anchors match start and end of every line (\\n)', example: '/^line/m', category: 'Flags' },
  { token: 's', name: 'DotAll Flag', desc: 'Allows the dot wildcard (.) to match newline characters (\\n)', example: '/a.*b/s', category: 'Flags' },
  { token: 'u', name: 'Unicode Flag', desc: 'Full Unicode code point support and surrogate pair handling', example: '/\\p{L}/u', category: 'Flags' },
  { token: 'y', name: 'Sticky Flag', desc: 'Matches only at the exact index specified by lastIndex', example: '/\\w+/y', category: 'Flags' },
  { token: 'd', name: 'Indices Flag', desc: 'Generates start and end indices for all capture groups', example: '/(\\d+)/d', category: 'Flags' },

  // Replacements
  { token: '$1, $2', name: 'Group Reference', desc: 'Inserts the nth parenthesized capture group', example: '[$1]', category: 'Replacements' },
  { token: '$&', name: 'Full Match', desc: 'Inserts the entire matched substring', example: '**$&**', category: 'Replacements' },
  { token: '$`', name: 'Preceding Text', desc: 'Inserts the portion of string preceding the match', example: '$`', category: 'Replacements' },
  { token: '$\'', name: 'Following Text', desc: 'Inserts the portion of string following the match', example: '$\'', category: 'Replacements' },
  { token: '$$', name: 'Escaped Dollar Sign', desc: 'Inserts a literal dollar sign ($)', example: '$$100', category: 'Replacements' },
  { token: '$<name>', name: 'Named Group Reference', desc: 'Inserts the text of the named capture group', example: '$<id>', category: 'Replacements' },
];

export function serializeJsString(str: string): string {
  return JSON.stringify(str);
}

export function serializePythonString(str: string): string {
  let out = '"';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const code = str.charCodeAt(i);
    if (ch === '\\') out += '\\\\';
    else if (ch === '"') out += '\\"';
    else if (ch === '\n') out += '\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    else if (ch === '\b') out += '\\b';
    else if (ch === '\f') out += '\\f';
    else if (code < 32 || (code >= 127 && code <= 159)) {
      out += '\\x' + code.toString(16).padStart(2, '0');
    } else {
      out += ch;
    }
  }
  out += '"';
  return out;
}

export function serializeJavaString(str: string): string {
  let out = '"';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const code = str.charCodeAt(i);
    if (ch === '\\') out += '\\\\';
    else if (ch === '"') out += '\\"';
    else if (ch === '\n') out += '\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    else if (ch === '\b') out += '\\b';
    else if (ch === '\f') out += '\\f';
    else if (code < 32 || (code >= 127 && code <= 159)) {
      out += '\\u' + code.toString(16).padStart(4, '0');
    } else {
      out += ch;
    }
  }
  out += '"';
  return out;
}

export function sanitizeForCsv(value: string): string {
  let sanitized = value;
  // Formula injection defense: neutralize spreadsheet formula prefixes
  if (/^[=+\-@\t\r]/.test(sanitized)) {
    sanitized = "'" + sanitized;
  }
  return `"${sanitized.replace(/"/g, '""')}"`;
}

export function parseRegexSyntaxError(errorMsg: string, pattern: string): { message: string; position: number | null; pointer: string | null } {
  let position: number | null = null;
  const posMatch = errorMsg.match(/at (?:position|offset|index) (\d+)/i);
  if (posMatch) {
    const parsed = parseInt(posMatch[1], 10);
    if (!isNaN(parsed) && parsed >= 0) {
      position = Math.min(parsed, pattern.length);
    }
  }
  let pointer: string | null = null;
  if (position !== null && pattern.length > 0) {
    const start = Math.max(0, position - 20);
    const end = Math.min(pattern.length, position + 20);
    const excerpt = pattern.slice(start, end);
    const offsetInExcerpt = Math.min(position - start, excerpt.length);
    pointer = `${excerpt}\n${' '.repeat(offsetInExcerpt)}^`;
  }
  return { message: errorMsg, position, pointer };
}

export function explainPattern(pattern: string) {
  if (!pattern) return [];
  const tokens: { token: string; meaning: string }[] = [];
  let i = 0;
  let unrecognizedCount = 0;

  while (i < pattern.length && tokens.length < 80) {
    const start = i;
    const ch = pattern[i];

    if (ch === '\\') {
      const next = pattern[i + 1] ?? '';
      if (next === 'p' || next === 'P') {
        const open = pattern.indexOf('{', i + 2);
        const close = pattern.indexOf('}', i + 2);
        if (open === i + 2 && close > open) {
          const propName = pattern.slice(open + 1, close);
          tokens.push({
            token: pattern.slice(i, close + 1),
            meaning: next === 'p' ? `Unicode property escape: matches character with property '${propName}'` : `Negated Unicode property escape: matches character without property '${propName}'`,
          });
          i = close + 1;
          continue;
        }
      }
      if (next === 'k' && pattern[i + 2] === '<') {
        const close = pattern.indexOf('>', i + 3);
        if (close > i + 3) {
          const groupName = pattern.slice(i + 3, close);
          tokens.push({ token: pattern.slice(i, close + 1), meaning: `Named backreference to capture group '${groupName}'` });
          i = close + 1;
          continue;
        }
      }
      const map: Record<string, string> = {
        d: 'Digit: matches any Arabic numeral [0-9]',
        D: 'Non-digit: matches any character except digits [^0-9]',
        w: 'Word character: matches ASCII letter, digit, or underscore [A-Za-z0-9_]',
        W: 'Non-word character: matches any character not in [A-Za-z0-9_]',
        s: 'Whitespace: matches space, tab, newline, form feed',
        S: 'Non-whitespace: matches any non-space character',
        b: 'Word boundary: matches zero-width transition between word and non-word',
        B: 'Non-word boundary: matches zero-width point between two word characters or two non-words',
        n: 'Line feed newline (\\n)',
        r: 'Carriage return (\\r)',
        t: 'Horizontal tab (\\t)',
        0: 'Null character (\\0)',
        '.': 'Literal dot character (.)',
        '\\': 'Literal backslash (\\)',
        '/': 'Literal forward slash (/)',
      };
      tokens.push({ token: pattern.slice(i, i + 2), meaning: map[next] || `Escaped character literal: '${next}'` });
      i += 2;
      continue;
    }

    if (ch === '^') {
      tokens.push({ token: '^', meaning: 'Beginning anchor: asserts start of string (or line with multiline flag m)' });
    } else if (ch === '$') {
      tokens.push({ token: '$', meaning: 'End anchor: asserts end of string (or line with multiline flag m)' });
    } else if (ch === '.') {
      tokens.push({ token: '.', meaning: 'Wildcard: matches any character except newline (unless dotAll flag s is active)' });
    } else if (ch === '*') {
      const isLazy = pattern[i + 1] === '?';
      tokens.push({ token: isLazy ? '*?' : '*', meaning: isLazy ? 'Lazy quantifier: matches 0 or more times, taking as few as possible' : 'Greedy quantifier: matches 0 or more times, taking as many as possible' });
      if (isLazy) i += 1;
    } else if (ch === '+') {
      const isLazy = pattern[i + 1] === '?';
      tokens.push({ token: isLazy ? '+?' : '+', meaning: isLazy ? 'Lazy quantifier: matches 1 or more times, taking as few as possible' : 'Greedy quantifier: matches 1 or more times, taking as many as possible' });
      if (isLazy) i += 1;
    } else if (ch === '?') {
      tokens.push({ token: '?', meaning: 'Optional quantifier: matches 0 or 1 time (or makes preceding quantifier lazy)' });
    } else if (ch === '|') {
      tokens.push({ token: '|', meaning: 'Alternation: logical OR between preceding and succeeding subpatterns' });
    } else if (ch === '(') {
      if (pattern.slice(i, i + 3) === '(?:') {
        tokens.push({ token: '(?:', meaning: 'Non-capturing group: groups tokens without creating a numbered match capture' });
        i += 2;
      } else if (pattern.slice(i, i + 3) === '(?=') {
        tokens.push({ token: '(?=', meaning: 'Positive lookahead: asserts succeeding text matches without consuming characters' });
        i += 2;
      } else if (pattern.slice(i, i + 3) === '(?!') {
        tokens.push({ token: '(?!', meaning: 'Negative lookahead: asserts succeeding text does NOT match without consuming characters' });
        i += 2;
      } else if (pattern.slice(i, i + 4) === '(?<=') {
        tokens.push({ token: '(?<=', meaning: 'Positive lookbehind: asserts preceding text matches without consuming characters' });
        i += 3;
      } else if (pattern.slice(i, i + 4) === '(?<!') {
        tokens.push({ token: '(?<!', meaning: 'Negative lookbehind: asserts preceding text does NOT match without consuming characters' });
        i += 3;
      } else if (pattern.slice(i, i + 3) === '(?<') {
        const close = pattern.indexOf('>', i + 3);
        if (close > i) {
          const groupName = pattern.slice(i + 3, close);
          tokens.push({ token: pattern.slice(i, close + 1), meaning: `Named capturing group: captures matching text into group '${groupName}'` });
          i = close;
        } else {
          tokens.push({ token: ch, meaning: 'Capturing group start' });
        }
      } else {
        tokens.push({ token: ch, meaning: 'Capturing group start: captures matched text into a numbered index' });
      }
    } else if (ch === ')') {
      tokens.push({ token: ')', meaning: 'Group end: closes open capturing or non-capturing group' });
    } else if (ch === '[') {
      const isNegated = pattern[i + 1] === '^';
      const close = pattern.indexOf(']', isNegated ? i + 2 : i + 1);
      if (close >= 0) {
        const content = pattern.slice(i, close + 1);
        tokens.push({
          token: content,
          meaning: isNegated ? `Negated character class: matches any character NOT in set ${content}` : `Character class: matches any single character in set ${content}`,
        });
        i = close;
      } else {
        tokens.push({ token: ch, meaning: 'Character class start' });
      }
    } else if (ch === '{') {
      const close = pattern.indexOf('}', i + 1);
      if (close >= 0) {
        const range = pattern.slice(i, close + 1);
        const isLazy = pattern[close + 1] === '?';
        tokens.push({ token: isLazy ? range + '?' : range, meaning: `Bounded quantifier: repetitions specified by ${range}` });
        i = isLazy ? close + 1 : close;
      } else {
        tokens.push({ token: ch, meaning: 'Repetition range start' });
      }
    } else {
      tokens.push({ token: ch, meaning: `Literal character: '${ch}'` });
    }

    i += 1;
    if (i === start) {
      unrecognizedCount++;
      i += 1;
    }
  }

  if (unrecognizedCount > 0 || i < pattern.length) {
    tokens.push({
      token: '...',
      meaning: 'Some syntax could not be confidently explained (heuristic token parser reached length limit or encountered ambiguous tokens).',
    });
  }

  return tokens;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'unknown';
export interface RiskFinding {
  level: RiskLevel;
  title: string;
  detail: string;
}

export interface CompatibilityFinding {
  target: 'JavaScript' | 'Python' | 'Java' | 'Go';
  level: 'ok' | 'warning' | 'note';
  detail: string;
}

export function analyzeRegexRisk(pattern: string, flags: string): { score: number; level: RiskLevel; findings: RiskFinding[] } {
  if (!pattern) return { score: 0, level: 'low', findings: [] };
  const findings: RiskFinding[] = [];
  const add = (level: RiskLevel, title: string, detail: string) => findings.push({ level, title, detail });

  const nestedQuantifier = /\((?:\?:|\?=|\?!|\?<=|\?<!|\?<[^>]+>)?[^()]*[+*](?:\?|\+|\*)?[^()]*\)[+*](?:\?|\+|\*)?/.test(pattern);
  const ambiguousAlternation = /\((?:[^()|]+\|){1,3}[^()|]+\)[+*]/.test(pattern);
  const quantifiedWildcard = /(?:\.\*|\.\+|\[[^\]]+\][+*])(?:\?|\+|\*)?/.test(pattern);
  const backreference = /\\(?:\d+|k<[^>]+>)/.test(pattern);
  const broadUnanchored = /(^|\()\??:?[.][*+]/.test(pattern) && !pattern.startsWith('^');
  const hugeRepeat = /\{\s*(?:\d{4,}\s*,?|\d+\s*,\s*\d{4,})\s*\}/.test(pattern);
  const lookaround = /\(\?[=!<]/.test(pattern);
  const manyAlternations = (pattern.match(/\|/g) || []).length >= 8;

  if (nestedQuantifier) {
    add('high', 'Nested quantifiers detected', 'A repeated group contains inner repetition (e.g. (a+)+). Partial or near-miss matching on adversarial inputs can trigger exponential backtracking.');
  }
  if (ambiguousAlternation) {
    add('high', 'Ambiguous alternation under repetition', 'Alternatives inside a repeated group overlap (e.g. (a|ab)+), multiplying potential backtracking paths exponentially.');
  }
  if (quantifiedWildcard) {
    add('moderate', 'Broad quantified wildcard or range', 'A wildcard or broad character class with unbounded repetition (.+ or .*). When unanchored or followed by a loose match, this can lead to heavy polynomial scanning.');
  }
  if (backreference) {
    add('moderate', 'Backreference construct present', 'Backreferences (\\1, \\k<name>) cannot be compiled to deterministic finite automata (DFA) and require runtime backtracking.');
  }
  if (broadUnanchored) {
    add('moderate', 'Unanchored broad scan', 'A leading broad wildcard forces the regex engine to attempt matches at every single offset across long text.');
  }
  if (hugeRepeat) {
    add('moderate', 'High repetition bound', 'Large explicit repetition counts ({1000,}) increase memory and state explosion during match evaluation.');
  }
  if (lookaround) {
    add('low', 'Lookaround assertion detected', 'Lookarounds are non-consuming assertions. While valid, deeply nested or complex lookarounds increase local evaluation work.');
  }
  if (manyAlternations) {
    add('low', 'High alternation count', '8 or more alternations detected. Consider character classes or anchored prefixes to reduce branch exploration.');
  }
  if (flags.includes('s') && /[.][*+]/.test(pattern)) {
    add('moderate', 'DotAll (s) mode with wildcard repetition', 'The dotAll flag enables wildcards (.+ or .*) to span newlines, broadening the backtracking scope across multiline text.');
  }

  const score = Math.min(
    100,
    findings.reduce((sum, f) => sum + (f.level === 'high' ? 40 : f.level === 'moderate' ? 20 : 6), 0)
  );

  let level: RiskLevel = 'low';
  if (score >= 40) level = 'high';
  else if (score >= 20) level = 'moderate';

  if (findings.length === 0) {
    add(
      'low',
      'No high-risk pattern structure detected by this heuristic',
      'This heuristic checks for known catastrophic backtracking shapes. It is an early-warning diagnostic, NOT a mathematical proof that the regex is completely ReDoS-safe under arbitrary inputs.'
    );
  }

  return { score, level, findings };
}

export function analyzeCompatibility(pattern: string, flags: string): CompatibilityFinding[] {
  const findings: CompatibilityFinding[] = [];
  const add = (target: CompatibilityFinding['target'], level: CompatibilityFinding['level'], detail: string) => findings.push({ target, level, detail });

  add('JavaScript', 'ok', 'Native browser JavaScript RegExp engine. Full ECMAScript 2024 regex specification conformance.');

  if (flags.includes('y')) add('Python', 'warning', 'Sticky flag (y) has no direct equivalent in Python re. Use pos argument in re.search() or anchor pattern with \\G/\\A.');
  if (flags.includes('d')) add('Python', 'warning', 'Indices flag (d) is not a Python flag. Use Match.span() or Match.start()/Match.end() to query match boundaries.');
  if (flags.includes('u')) add('Python', 'note', 'Python 3 strings are Unicode by default; JavaScript u flag enables full code point and surrogate pair handling.');
  if (flags.includes('g')) add('Python', 'note', 'JavaScript global flag (g) is replaced in Python by re.finditer() or re.findall().');
  if (/\(\?<([A-Za-z_$][\w$]*)>/.test(pattern)) add('Python', 'warning', 'Named group syntax (?<name>...) in JavaScript must be written as (?P<name>...) in Python re.');
  if (/\\k<[^>]+>/.test(pattern)) add('Python', 'warning', 'Named backreference \\k<name> in JavaScript must be written as (?P=name) in Python pattern or \\g<name> in re.sub().');
  if (/\\p\{/.test(pattern)) add('Python', 'warning', 'Unicode property escapes (\\p{...}) are not supported in standard Python re. The third-party "regex" package is required.');
  if (/\(\?<=[^)]|\(\?<!/.test(pattern)) add('Python', 'note', 'Python standard re requires fixed-width lookbehind patterns; variable-length lookbehinds will raise re.error.');

  if (flags.includes('y')) add('Java', 'warning', 'Sticky flag (y) is not a Java Pattern flag. Configure java.util.regex.Matcher region boundaries or anchors.');
  if (flags.includes('d')) add('Java', 'warning', 'Indices flag (d) is not a Java Pattern flag. Use matcher.start() and matcher.end() to obtain match offsets.');
  if (flags.includes('u')) add('Java', 'note', 'Java Pattern uses Pattern.UNICODE_CHARACTER_CLASS for Unicode character categories.');
  if (flags.includes('g')) add('Java', 'note', 'Java has no global flag. Use a while (matcher.find()) loop.');
  if (/\(\?<([A-Za-z_$][\w$]*)>/.test(pattern)) add('Java', 'ok', 'Java 7+ Pattern supports (?<name>...) named capture groups natively.');
  if (/\\p\{/.test(pattern)) add('Java', 'note', 'Java Pattern supports Unicode properties (\\p{L}, \\p{IsLatin}), but some property names differ from ECMAScript.');

  // Go RE2 engine compatibility
  if (flags.includes('y') || flags.includes('d')) add('Go', 'warning', 'Sticky (y) and Indices (d) flags are not supported in Go regexp package.');
  if (/\(\?[=!<]/.test(pattern)) add('Go', 'warning', 'Lookahead and lookbehind assertions are NOT supported by Go RE2 engine to guarantee linear-time execution.');
  if (/\\(?:\d+|k<[^>]+>)/.test(pattern)) add('Go', 'warning', 'Backreferences are NOT supported in Go regexp (RE2 engine avoids exponential backtracking).');
  if (!/\(\?[=!<]/.test(pattern) && !/\\(?:\d+|k<[^>]+>)/.test(pattern)) add('Go', 'ok', 'Pattern syntax is fully compatible with Go standard library regexp package.');

  return findings;
}

function riskClass(level: RiskLevel) {
  if (level === 'high') return 'text-red-600 dark:text-red-400';
  if (level === 'moderate') return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}

function createWorker(): { worker: Worker | null; url: string | null } {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return { worker: null, url: null };
  }
  try {
    const source = `
      self.onmessage = function(event) {
        var data = event.data;
        var requestId = data.requestId;
        var pattern = data.pattern;
        var flags = data.flags;
        var text = data.text;
        var replacement = data.replacement !== undefined ? String(data.replacement) : '';
        var maxMatches = data.maxMatches;

        try {
          var regex = new RegExp(pattern, flags);
          var started = performance.now();
          var matches = [];
          var matchLimitReached = false;

          if (regex.global || regex.sticky) {
            var match;
            while ((match = regex.exec(text)) !== null) {
              var groups = Array.prototype.slice.call(match, 1);
              var namedGroups = match.groups ? Object.assign({}, match.groups) : {};
              var indices = match.indices ? Array.prototype.slice.call(match.indices) : undefined;

              matches.push({
                match: match[0],
                index: match.index,
                end: match.index + match[0].length,
                groups: groups,
                namedGroups: namedGroups,
                indices: indices
              });

              if (matches.length >= maxMatches) {
                matchLimitReached = true;
                break;
              }

              // Guard against infinite loop on zero-width/empty matches
              if (match[0] === '') {
                var step = 1;
                if (regex.unicode) {
                  var cp = text.codePointAt(regex.lastIndex);
                  if (cp !== undefined && cp > 0xffff) {
                    step = 2;
                  }
                }
                regex.lastIndex += step;
                if (regex.lastIndex > text.length) {
                  break;
                }
              }
            }
          } else {
            var singleMatch = regex.exec(text);
            if (singleMatch) {
              matches.push({
                match: singleMatch[0],
                index: singleMatch.index,
                end: singleMatch.index + singleMatch[0].length,
                groups: Array.prototype.slice.call(singleMatch, 1),
                namedGroups: singleMatch.groups ? Object.assign({}, singleMatch.groups) : {},
                indices: singleMatch.indices ? Array.prototype.slice.call(singleMatch.indices) : undefined
              });
            }
          }

          // Evaluate replacement safely inside background worker thread
          var replacedText = text;
          try {
            var replaceRegex = new RegExp(pattern, flags);
            replacedText = text.replace(replaceRegex, replacement);
          } catch (rErr) {
            replacedText = text;
          }

          // Evaluate split safely inside background worker thread (capped to 500 items)
          var splitResult = [text];
          try {
            var splitRegex = new RegExp(pattern, flags);
            var rawSplit = text.split(splitRegex);
            splitResult = rawSplit.length > 500 ? rawSplit.slice(0, 500) : rawSplit;
          } catch (sErr) {
            splitResult = [text];
          }

          self.postMessage({
            type: 'result',
            requestId: requestId,
            matches: matches,
            replacedText: replacedText,
            splitResult: splitResult,
            matchLimitReached: matchLimitReached,
            durationMs: performance.now() - started
          });
        } catch (err) {
          self.postMessage({
            type: 'error',
            requestId: requestId,
            error: err && err.message ? err.message : String(err)
          });
        }
      };
      self.postMessage({ type: 'ready' });
    `;
    const blob = new Blob([source], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    return { worker, url };
  } catch {
    return { worker: null, url: null };
  }
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('([A-Z][a-z]+)\\s([A-Z][a-z]+)');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('Hello World\nThis is KivaroTools!\nJohn Doe and Jane Smith.');
  const [activeTab, setActiveTab] = useState<ActiveTab>('breakdown');
  const [replacement, setReplacement] = useState('[$1] [$2]');
  const [copied, setCopied] = useState('');
  const [workerResult, setWorkerResult] = useState<{
    matches: MatchData[];
    replacedText: string;
    splitResult: string[];
    matchLimitReached: boolean;
    durationMs: number;
  } | null>(null);
  const [workerError, setWorkerError] = useState<string | null>(null);
  const [executionTimedOut, setExecutionTimedOut] = useState(false);
  const [running, setRunning] = useState(false);
  const [search, setSearch] = useState('');
  const [cheatSearch, setCheatSearch] = useState('');
  const [cheatCategory, setCheatCategory] = useState<string>('All');
  const [extractTarget, setExtractTarget] = useState<'match' | 'allGroups' | 'group1' | 'group2' | 'group3' | 'named'>('match');
  const [currentPage, setCurrentPage] = useState(1);
  const [executionVersion, setExecutionVersion] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const backdropRef = useRef<HTMLDivElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerUrlRef = useRef<string | null>(null);
  const requestRef = useRef(0);
  const runningRef = useRef(false);
  const executionTimeoutRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Restore state from URL hash via event listener / subscription
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHash = () => {
      try {
        const hash = window.location.hash;
        if (hash && hash.includes('state=')) {
          const match = hash.match(/state=([^&]+)/);
          if (match) {
            const decoded = JSON.parse(decodeURIComponent(match[1]));
            if (typeof decoded.p === 'string') setPattern(decoded.p);
            if (typeof decoded.f === 'string') setFlags(decoded.f);
            if (typeof decoded.t === 'string') setTestString(decoded.t);
            if (typeof decoded.r === 'string') setReplacement(decoded.r);
            if (typeof decoded.tab === 'string') setActiveTab(decoded.tab as ActiveTab);
          }
        }
      } catch {
        // Ignore malformed state
      }
    };

    window.addEventListener('hashchange', handleHash);
    const timer = window.setTimeout(handleHash, 0);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.clearTimeout(timer);
    };
  }, []);

  // Terminate current worker and clean up Object URL
  const killCurrentWorker = useCallback(() => {
    if (executionTimeoutRef.current !== null) {
      window.clearTimeout(executionTimeoutRef.current);
      executionTimeoutRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (workerUrlRef.current) {
      URL.revokeObjectURL(workerUrlRef.current);
      workerUrlRef.current = null;
    }
    runningRef.current = false;
  }, []);

  // Synchronous main-thread execution fallback
  const runSynchronousFallback = useCallback(
    (currentRequestId: number, p: string, f: string, t: string, r: string) => {
      try {
        const risk = analyzeRegexRisk(p, f);
        if (risk.level === 'high') {
          if (requestRef.current === currentRequestId) {
            setWorkerResult(null);
            setWorkerError(
              'Web Worker thread is unavailable in this environment and a high-risk ReDoS pattern structure was detected. Execution was paused on the main thread to prevent the browser tab from freezing. (Notice: A watchdog timer cannot interrupt synchronous operations running on the main UI thread).'
            );
            setExecutionTimedOut(false);
            setRunning(false);
          }
          return;
        }

        // Cap text length strictly on main-thread fallback
        const safeText = t.length > 25_000 ? t.slice(0, 25_000) : t;
        const regex = new RegExp(p, f);
        const start = performance.now();
        const matchesList: MatchData[] = [];
        let limitReached = false;

        if (regex.global || regex.sticky) {
          let match: RegExpExecArray | null;
          let iterations = 0;
          while ((match = regex.exec(safeText)) !== null) {
            matchesList.push({
              match: match[0],
              index: match.index,
              end: match.index + match[0].length,
              groups: Array.prototype.slice.call(match, 1),
              namedGroups: match.groups ? { ...match.groups } : {},
              indices: match.indices ? Array.prototype.slice.call(match.indices) : undefined,
            });

            if (matchesList.length >= MAX_MATCHES) {
              limitReached = true;
              break;
            }

            if (match[0] === '') {
              let step = 1;
              if (regex.unicode) {
                const cp = safeText.codePointAt(regex.lastIndex);
                if (cp !== undefined && cp > 0xffff) step = 2;
              }
              regex.lastIndex += step;
              if (regex.lastIndex > safeText.length) break;
            }

            if (++iterations > 50_000) break;
          }
        } else {
          const single = regex.exec(safeText);
          if (single) {
            matchesList.push({
              match: single[0],
              index: single.index,
              end: single.index + single[0].length,
              groups: Array.prototype.slice.call(single, 1),
              namedGroups: single.groups ? { ...single.groups } : {},
              indices: single.indices ? Array.prototype.slice.call(single.indices) : undefined,
            });
          }
        }

        let replacedText = safeText;
        try {
          const replaceRegex = new RegExp(p, f);
          replacedText = safeText.replace(replaceRegex, r);
        } catch {
          replacedText = safeText;
        }

        let splitResult = [safeText];
        try {
          const splitRegex = new RegExp(p, f);
          const raw = safeText.split(splitRegex);
          splitResult = raw.length > 500 ? raw.slice(0, 500) : raw;
        } catch {
          splitResult = [safeText];
        }

        if (requestRef.current === currentRequestId) {
          setWorkerResult({
            matches: matchesList,
            replacedText,
            splitResult,
            matchLimitReached: limitReached,
            durationMs: performance.now() - start,
          });
          setWorkerError(null);
          setExecutionTimedOut(false);
          setRunning(false);
        }
      } catch (err) {
        if (requestRef.current === currentRequestId) {
          setWorkerResult(null);
          setWorkerError(err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err));
          setExecutionTimedOut(false);
          setRunning(false);
        }
      }
    },
    []
  );

  // Initialize and bind worker
  const initFreshWorker = useCallback(() => {
    killCurrentWorker();
    const created = createWorker();
    workerRef.current = created.worker;
    workerUrlRef.current = created.url;

    if (!created.worker) {
      return; // Will use fallback
    }

    created.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data;
      if (data.type === 'ready') return;

      if (data.requestId !== requestRef.current) return;

      if (executionTimeoutRef.current !== null) {
        window.clearTimeout(executionTimeoutRef.current);
        executionTimeoutRef.current = null;
      }
      runningRef.current = false;
      setRunning(false);

      if (data.type === 'result') {
        setWorkerResult({
          matches: data.matches,
          replacedText: data.replacedText,
          splitResult: data.splitResult,
          matchLimitReached: data.matchLimitReached,
          durationMs: data.durationMs,
        });
        setWorkerError(null);
        setExecutionTimedOut(false);
      } else if (data.type === 'error') {
        setWorkerResult(null);
        setWorkerError(data.error);
        setExecutionTimedOut(false);
      }
    };
  }, [killCurrentWorker]);

  useEffect(() => {
    initFreshWorker();
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      killCurrentWorker();
    };
  }, [initFreshWorker, killCurrentWorker]);

  // Execute regex with debounce and timeout protection
  useEffect(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null;
      const currentRequestId = ++requestRef.current;

      if (!pattern) {
        if (executionTimeoutRef.current !== null) {
          window.clearTimeout(executionTimeoutRef.current);
          executionTimeoutRef.current = null;
        }
        runningRef.current = false;
        setRunning(false);
        setWorkerResult({ matches: [], replacedText: testString, splitResult: [testString], matchLimitReached: false, durationMs: 0 });
        setWorkerError(null);
        setExecutionTimedOut(false);
        return;
      }

      if (pattern.length > MAX_PATTERN_CHARS || testString.length > MAX_TEST_CHARS) {
        setRunning(false);
        return;
      }

      if (runningRef.current) {
        initFreshWorker();
      }

      const activeWorker = workerRef.current;
      if (!activeWorker) {
        // Fallback to synchronous execution
        runSynchronousFallback(currentRequestId, pattern, flags, testString, replacement);
        return;
      }

      runningRef.current = true;
      setRunning(true);
      setExecutionTimedOut(false);

      activeWorker.postMessage({
        requestId: currentRequestId,
        pattern,
        flags,
        text: testString,
        replacement,
        maxMatches: MAX_MATCHES,
      });

      if (executionTimeoutRef.current !== null) {
        window.clearTimeout(executionTimeoutRef.current);
      }

      executionTimeoutRef.current = window.setTimeout(() => {
        executionTimeoutRef.current = null;
        if (requestRef.current !== currentRequestId) return;

        initFreshWorker();
        setRunning(false);
        setWorkerResult(null);
        setWorkerError(`Execution timed out after ${EXECUTION_TIMEOUT_MS} ms. The background evaluation thread was terminated to prevent CPU lockup. This runtime guard protects the browser, but is not a static proof of ReDoS safety.`);
        setExecutionTimedOut(true);
      }, EXECUTION_TIMEOUT_MS);
    }, 60);

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [pattern, flags, testString, replacement, executionVersion, initFreshWorker, runSynchronousFallback]);

  const matches = useMemo(() => workerResult?.matches ?? [], [workerResult]);
  const matchLimitReached = workerResult?.matchLimitReached ?? false;

  const errorDiagnostics = useMemo(() => {
    if (!workerError || executionTimedOut) return null;
    return parseRegexSyntaxError(workerError, pattern);
  }, [workerError, executionTimedOut, pattern]);

  // Synchronized backdrop highlight generator
  const matchNodes = useMemo(() => {
    if (!pattern || workerError || testString.length > MAX_TEST_CHARS || pattern.length > MAX_PATTERN_CHARS) {
      return [testString];
    }
    const nodes: ReactNode[] = [];
    let cursor = 0;
    const boundedMatches = matches.slice(0, MAX_HIGHLIGHT_MATCHES);

    boundedMatches.forEach((m, index) => {
      if (m.index < cursor) return;

      if (m.index > cursor) {
        nodes.push(<span key={`t-${cursor}-${index}`}>{testString.slice(cursor, m.index)}</span>);
      }

      if (m.match === '') {
        nodes.push(
          <span key={`zw-${m.index}-${index}`} className="inline-block w-0 relative overflow-visible select-none" aria-hidden="true">
            <span className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-amber-500 rounded-sm" title="Zero-width match" />
          </span>
        );
        cursor = m.index;
        return;
      }

      const bgClass =
        index % 2 === 0
          ? 'bg-blue-300/60 dark:bg-blue-500/40 text-blue-900 dark:text-blue-100 rounded-sm outline outline-1 outline-blue-400 dark:outline-blue-500/50'
          : 'bg-emerald-300/60 dark:bg-emerald-500/40 text-emerald-900 dark:text-emerald-100 rounded-sm outline outline-1 outline-emerald-400 dark:outline-emerald-500/50';

      nodes.push(
        <span key={`m-${m.index}-${index}`} className={bgClass}>
          {testString.slice(m.index, m.end)}
        </span>
      );
      cursor = Math.max(cursor, m.end);
    });

    if (cursor < testString.length) {
      nodes.push(<span key="tail">{testString.slice(cursor)}</span>);
    }
    if (testString.endsWith('\n')) {
      nodes.push(<br key="trailing-br" />);
    }
    return nodes;
  }, [pattern, workerError, testString, matches]);

  // Code generator: JavaScript
  const jsCode = useMemo(() => {
    const patternLit = serializeJsString(pattern);
    const flagsLit = serializeJsString(flags);
    const textLit = serializeJsString(testString);
    const replLit = serializeJsString(replacement);
    const header = `// JavaScript RegExp (ECMAScript)\nconst regex = new RegExp(${patternLit}, ${flagsLit});\nconst text = ${textLit};\n`;
    const replSnippet = `\n// 2. Replacement example\nconst replaced = text.replace(regex, ${replLit});\nconsole.log("Replaced text:\\n", replaced);`;

    if (flags.includes('g') || flags.includes('y')) {
      return `${header}\n// 1. Find all matches\nconst matches = [];\nlet match;\nwhile ((match = regex.exec(text)) !== null) {\n  matches.push({\n    match: match[0],\n    index: match.index,\n    groups: match.slice(1),\n    namedGroups: match.groups ? { ...match.groups } : {}\n  });\n  // Guard against zero-width loop\n  if (match[0] === '') {\n    regex.lastIndex += (regex.unicode ? ((text.codePointAt(regex.lastIndex) || 0) > 0xffff ? 2 : 1) : 1);\n  }\n}\nconsole.log(matches);${replSnippet}`;
    }
    return `${header}\n// 1. Find single match\nconst match = regex.exec(text);\nconsole.log(match);${replSnippet}`;
  }, [pattern, flags, testString, replacement]);

  // Code generator: Python
  const pyCode = useMemo(() => {
    const pyFlags: string[] = [];
    if (flags.includes('i')) pyFlags.push('re.IGNORECASE');
    if (flags.includes('m')) pyFlags.push('re.MULTILINE');
    if (flags.includes('s')) pyFlags.push('re.DOTALL');

    const flagStr = pyFlags.length ? `, flags=${pyFlags.join(' | ')}` : '';
    const warnings: string[] = [];
    if (flags.includes('y')) warnings.push('# Warning: JavaScript sticky (y) flag has no direct Python re equivalent.');
    if (flags.includes('d')) warnings.push('# Warning: JavaScript indices (d) flag is not supported in Python re.');
    if (/\(\?<[a-zA-Z]/.test(pattern)) warnings.push('# Warning: JavaScript (?<name>...) must be converted to Python (?P<name>...).');
    if (/\\k<[a-zA-Z]/.test(pattern)) warnings.push('# Warning: JavaScript \\k<name> must be converted to Python (?P=name) or \\g<name>.');
    if (/\\p\{/.test(pattern)) warnings.push('# Warning: \\p{...} Unicode properties require the third-party "regex" package in Python.');

    const warnBlock = warnings.length ? `${warnings.join('\n')}\n\n` : '';
    const patternLit = serializePythonString(pattern);
    const textLit = serializePythonString(testString);
    const replLit = serializePythonString(replacement);

    return `${warnBlock}import re\n\nregex = re.compile(${patternLit}${flagStr})\ntext = ${textLit}\n\n# 1. Find all matches\nmatches = []\nfor match in regex.finditer(text):\n    matches.append({\n        "match": match.group(0),\n        "start": match.start(),\n        "end": match.end(),\n        "groups": match.groups(),\n        "named": match.groupdict()\n    })\n\nprint(f"Found {len(matches)} matches")\n\n# 2. Replacement example\nreplaced = regex.sub(${replLit}, text)\nprint(f"Replaced text:\\n{replaced}")`;
  }, [pattern, flags, testString, replacement]);

  // Code generator: Java
  const javaCode = useMemo(() => {
    const javaFlags: string[] = [];
    if (flags.includes('i')) javaFlags.push('Pattern.CASE_INSENSITIVE');
    if (flags.includes('m')) javaFlags.push('Pattern.MULTILINE');
    if (flags.includes('s')) javaFlags.push('Pattern.DOTALL');
    if (flags.includes('u')) javaFlags.push('Pattern.UNICODE_CHARACTER_CLASS');

    const modifier = javaFlags.length ? `, ${javaFlags.join(' | ')}` : '';
    const patternLit = serializeJavaString(pattern);
    const textLit = serializeJavaString(testString);
    const replLit = serializeJavaString(replacement);

    return `import java.util.regex.*;\nimport java.util.ArrayList;\nimport java.util.List;\n\npublic class RegexRunner {\n    public static void main(String[] args) {\n        Pattern regex = Pattern.compile(${patternLit}${modifier});\n        String text = ${textLit};\n\n        // 1. Find all matches\n        Matcher matcher = regex.matcher(text);\n        List<String> matches = new ArrayList<>();\n        while (matcher.find()) {\n            matches.add(matcher.group());\n            System.out.println("Match: " + matcher.group() + " [" + matcher.start() + ".." + matcher.end() + "]");\n        }\n        System.out.println("Total matches: " + matches.size());\n\n        // 2. Replacement example\n        String replaced = matcher.replaceAll(${replLit});\n        System.out.println("\\nReplaced text:\\n" + replaced);\n    }\n}`;
  }, [pattern, flags, testString, replacement]);

  // Code generator: Go
  const goCode = useMemo(() => {
    const warnings: string[] = [];
    if (/\(\?[=!<]/.test(pattern)) warnings.push('// Warning: Go standard regexp uses RE2; lookaheads and lookbehinds are not supported.');
    if (/\\(?:\d+|k<[^>]+>)/.test(pattern)) warnings.push('// Warning: Go RE2 does not support backreferences to prevent exponential backtracking.');
    if (flags.includes('y') || flags.includes('d')) warnings.push('// Warning: Sticky (y) and Indices (d) flags are not supported in Go regexp.');

    // Build Go inline flag prefix for RE2 (?ims)
    let goInline = '';
    if (flags.includes('i')) goInline += 'i';
    if (flags.includes('m')) goInline += 'm';
    if (flags.includes('s')) goInline += 's';
    const effectivePattern = goInline ? `(?${goInline})${pattern}` : pattern;

    const warnBlock = warnings.length ? `${warnings.join('\n')}\n\n` : '';
    const patternLit = '`' + effectivePattern.replace(/`/g, '` + "`" + `') + '`';
    const textLit = '`' + testString.replace(/`/g, '` + "`" + `') + '`';
    const replLit = '`' + replacement.replace(/`/g, '` + "`" + `') + '`';

    return `${warnBlock}package main\n\nimport (\n\t"fmt"\n\t"regexp"\n)\n\nfunc main() {\n\t// Go regexp uses RE2 syntax with inline flags: (?i) ignore case, (?m) multiline, (?s) dotAll\n\tre := regexp.MustCompile(${patternLit})\n\ttext := ${textLit}\n\n\t// 1. Find all matches and submatches\n\tmatches := re.FindAllStringSubmatch(text, -1)\n\tfmt.Printf("Total matches: %d\\n", len(matches))\n\tfor i, m := range matches {\n\t\tfmt.Printf("Match #%d: %s\\n", i+1, m[0])\n\t\tfor gi, g := range m[1:] {\n\t\t\tfmt.Printf("  Group %d: %s\\n", gi+1, g)\n\t\t}\n\t}\n\n\t// 2. Replacement example\n\treplaced := re.ReplaceAllString(text, ${replLit})\n\tfmt.Println("\\nReplacement output:\\n" + replaced)\n}`;
  }, [pattern, flags, testString, replacement]);

  // Replacement preview - reads from background worker result with zero main-thread RegExp execution
  const replacementPreview = useMemo(() => {
    if (!pattern || !testString) return testString;
    if (workerResult?.replacedText !== undefined) {
      return workerResult.replacedText;
    }
    return testString;
  }, [pattern, testString, workerResult]);

  // Split preview - reads from background worker result with zero main-thread RegExp execution
  const splitResult = useMemo(() => {
    if (!pattern || !testString) return [testString];
    if (workerResult?.splitResult !== undefined) {
      return workerResult.splitResult;
    }
    return [testString];
  }, [pattern, testString, workerResult]);

  // Extracted list preview
  const extractedList = useMemo(() => {
    if (matches.length === 0) return [];
    if (extractTarget === 'match') {
      return matches.map((m) => m.match);
    }
    if (extractTarget === 'allGroups') {
      return matches.map((m) => m.groups.filter((g) => g !== undefined).join(' | '));
    }
    if (extractTarget === 'group1') {
      return matches.map((m) => m.groups[0] ?? '');
    }
    if (extractTarget === 'group2') {
      return matches.map((m) => m.groups[1] ?? '');
    }
    if (extractTarget === 'group3') {
      return matches.map((m) => m.groups[2] ?? '');
    }
    if (extractTarget === 'named') {
      return matches.map((m) => {
        const entries = Object.entries(m.namedGroups);
        return entries.map(([k, v]) => `${k}=${v ?? ''}`).join('; ');
      });
    }
    return matches.map((m) => m.match);
  }, [matches, extractTarget]);

  const riskAnalysis = useMemo(() => analyzeRegexRisk(pattern, flags), [pattern, flags]);
  const compatibility = useMemo(() => analyzeCompatibility(pattern, flags), [pattern, flags]);

  const stats = useMemo(() => {
    const groups = matches.reduce((sum, m) => sum + m.groups.filter((g) => g !== undefined).length, 0);
    const lines = testString ? testString.split('\n').length : 0;
    return {
      matches: matches.length,
      groups,
      chars: testString.length,
      lines,
      duration: workerResult?.durationMs ?? 0,
    };
  }, [matches, testString, workerResult]);

  const toggleFlag = (flag: RegexFlag) => {
    setFlags((current) => (current.includes(flag) ? current.replace(flag, '') : current + flag));
    setCurrentPage(1);
  };

  const handleScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const copyCode = async (code: string, label: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('copy-error');
    }
  };

  const handleGenerateShareUrl = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const state = {
      p: pattern,
      f: flags,
      t: testString.slice(0, 5000),
      r: replacement,
      tab: activeTab,
    };
    const encoded = encodeURIComponent(JSON.stringify(state));
    url.hash = `state=${encoded}`;
    const generated = url.toString();
    setShareUrl(generated);
    setShowShareModal(true);
    copyCode(generated, 'share-modal');
  };

  const downloadText = (filename: string, content: string, type = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportMatches = (format: 'json' | 'csv' | 'txt') => {
    if (format === 'json') {
      downloadText(
        'regex-matches.json',
        JSON.stringify({ pattern, flags, totalMatches: matches.length, matches }, null, 2),
        'application/json;charset=utf-8'
      );
      return;
    }
    if (format === 'csv') {
      const rows = [
        ['Match Number', 'Match Text', 'Start Index', 'End Index', 'Groups', 'Named Groups'].map(sanitizeForCsv).join(','),
        ...matches.map((m, i) =>
          [
            String(i + 1),
            m.match,
            String(m.index),
            String(m.end),
            m.groups.filter((g) => g !== undefined).join(' | '),
            Object.entries(m.namedGroups)
              .map(([k, v]) => `${k}=${v ?? ''}`)
              .join('; '),
          ]
            .map(sanitizeForCsv)
            .join(',')
        ),
      ];
      downloadText('regex-matches.csv', `\ufeff${rows.join('\n')}`, 'text/csv;charset=utf-8');
      return;
    }
    downloadText('regex-matches.txt', matches.map((m, i) => `[#${i + 1}] (${m.index}..${m.end}): ${m.match}`).join('\n'));
  };

  const clearAll = () => {
    setPattern('');
    setTestString('');
    setReplacement('');
    setWorkerError(null);
    setExecutionTimedOut(false);
    setWorkerResult({ matches: [], replacedText: '', splitResult: [''], matchLimitReached: false, durationMs: 0 });
    setCurrentPage(1);
    setSearch('');
  };

  const reset = () => {
    setPattern('([A-Z][a-z]+)\\s([A-Z][a-z]+)');
    setFlags('g');
    setTestString('Hello World\nThis is KivaroTools!\nJohn Doe and Jane Smith.');
    setReplacement('[$1] [$2]');
    setActiveTab('breakdown');
    setSearch('');
    setCurrentPage(1);
    setWorkerError(null);
    setExecutionTimedOut(false);
    setExecutionVersion((v) => v + 1);
  };

  // Filtered and paginated matches
  const filteredMatches = useMemo(() => {
    if (!search.trim()) return matches;
    const q = search.toLowerCase();
    return matches.filter(
      (m) =>
        m.match.toLowerCase().includes(q) ||
        String(m.index).includes(q) ||
        m.groups.some((g) => (g ?? '').toLowerCase().includes(q)) ||
        Object.entries(m.namedGroups).some(([k, v]) => k.toLowerCase().includes(q) || (v ?? '').toLowerCase().includes(q))
    );
  }, [matches, search]);

  const totalPages = Math.max(1, Math.ceil(filteredMatches.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedMatches = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredMatches.slice(start, start + PAGE_SIZE);
  }, [filteredMatches, safeCurrentPage]);

  const explanation = useMemo(() => explainPattern(pattern), [pattern]);

  // Filtered cheat sheet entries
  const filteredCheatSheet = useMemo(() => {
    return CHEAT_SHEET_DATA.filter((entry) => {
      const matchCat = cheatCategory === 'All' || entry.category === cheatCategory;
      if (!matchCat) return false;
      if (!cheatSearch.trim()) return true;
      const q = cheatSearch.toLowerCase();
      return entry.token.toLowerCase().includes(q) || entry.name.toLowerCase().includes(q) || entry.desc.toLowerCase().includes(q);
    });
  }, [cheatCategory, cheatSearch]);

  const tabListRef = useRef<HTMLDivElement>(null);

  const handleTabWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && !e.deltaX) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  const handleTabClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    const tabEl = document.getElementById(`tab-${tabId}`);
    if (tabEl) {
      tabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  };

  const handleTabKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const tabs: ActiveTab[] = ['breakdown', 'replace', 'split', 'cheatsheet', 'explain', 'analyze', 'code'];
    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
      e.preventDefault();
      const el = document.getElementById(`tab-${tabs[nextIndex]}`);
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[nextIndex]);
      e.preventDefault();
      const el = document.getElementById(`tab-${tabs[nextIndex]}`);
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-gray-50 dark:bg-[#0B1120] transition-colors -m-4 sm:-m-6 md:-m-8 p-4 sm:p-6 md:p-8 rounded-3xl min-h-screen">
      {/* Pattern Header & Flags Control */}
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
            <Library className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Preset Patterns</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => copyCode(pattern, 'pattern')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
              title="Copy pattern string only"
              aria-label="Copy pattern string"
            >
              {copied === 'pattern' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'pattern' ? 'Copied' : 'Copy Pattern'}</span>
            </button>
            <button
              onClick={() => copyCode(`/${pattern}/${flags}`, 'literal')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
              title="Copy full /pattern/flags literal"
              aria-label="Copy full regex literal"
            >
              {copied === 'literal' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied === 'literal' ? 'Copied' : 'Copy /p/flags'}</span>
            </button>
            <button
              onClick={handleGenerateShareUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
              title="Create a shareable link with serialized state"
              aria-label="Share regex pattern"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
              aria-label="Reset to default pattern and test string"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-red-500 outline-none"
              aria-label="Clear pattern, test string, and matches"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Pattern presets chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]" role="region" aria-label="Preset regex pattern library">
          {COMMON_PATTERNS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setPattern(p.pattern);
                setFlags(p.flags);
                setCurrentPage(1);
              }}
              title={`${p.desc} (/${p.flags})`}
              className="text-xs font-semibold px-3 py-1.5 bg-gray-100 dark:bg-[#0a0f1a] hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Regular Expression Pattern Input & Flags Selector */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-grow w-full relative flex items-center bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <span className="px-3 sm:px-4 text-xl font-light text-slate-400 select-none" aria-hidden="true">/</span>
            <label htmlFor="regex-pattern-input" className="sr-only">Regular Expression Pattern</label>
            <input
              id="regex-pattern-input"
              type="text"
              value={pattern}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPattern(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Enter regular expression pattern..."
              maxLength={MAX_PATTERN_CHARS}
              className="w-full py-3.5 bg-transparent font-mono text-sm text-slate-900 dark:text-blue-300 focus:outline-none placeholder-slate-400"
              spellCheck={false}
              autoComplete="off"
            />
            <span className="px-1.5 sm:px-2 text-xl font-light text-slate-400 select-none" aria-hidden="true">/</span>
            <label htmlFor="regex-flags-input" className="sr-only">Regular Expression Flags</label>
            <input
              id="regex-flags-input"
              type="text"
              value={flags}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFlags(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="flags"
              maxLength={15}
              className="w-16 sm:w-20 py-3.5 pr-3 bg-transparent font-mono text-sm text-slate-700 dark:text-blue-400 focus:outline-none placeholder-slate-400 shrink-0"
              spellCheck={false}
              autoComplete="off"
              aria-label="Regular expression flags (e.g. g, i, m, s, u, y, d)"
            />
          </div>

          <div
            className="flex bg-gray-50 dark:bg-[#0a0f1a] p-1.5 rounded-xl border border-gray-200 dark:border-slate-700 shrink-0 justify-center gap-1 overflow-x-auto"
            role="toolbar"
            aria-label="Regular expression flags"
          >
            {FLAG_INFO.map((flag) => {
              const isActive = flags.includes(flag.id);
              return (
                <button
                  key={flag.id}
                  onClick={() => toggleFlag(flag.id)}
                  title={`${flag.title} (${flag.id}) — ${flag.desc}`}
                  aria-label={`Toggle flag ${flag.id}: ${flag.title}`}
                  aria-pressed={isActive}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-mono font-bold text-sm rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {flag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pattern Meta & Diagnostic Status */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 font-semibold border border-gray-200 dark:border-slate-700">
            /{flags || 'no-flags'}
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {pattern.length.toLocaleString()} / {MAX_PATTERN_CHARS.toLocaleString()} pattern chars
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {testString.length.toLocaleString()} / {MAX_TEST_CHARS.toLocaleString()} test chars
          </span>
          {running && (
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center gap-1 font-semibold" aria-live="polite">
              <Play className="w-3 h-3 animate-spin text-blue-600" /> Evaluating…
            </span>
          )}
          {matchLimitReached && (
            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-800">
              Capped at {MAX_MATCHES.toLocaleString()} matches
            </span>
          )}
        </div>

        {/* Syntax Error & Diagnostics Alert */}
        {workerError && (
          <div
            role="alert"
            aria-live="assertive"
            className={`flex flex-col gap-2 text-xs p-4 rounded-xl border ${
              executionTimedOut
                ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60'
            }`}
          >
            <div className="flex items-start gap-2 font-bold">
              {executionTimedOut ? <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{executionTimedOut ? 'Execution Timeout Guard' : 'Invalid Regular Expression'}</span>
            </div>
            <p className="leading-relaxed font-mono">{workerError}</p>
            {errorDiagnostics?.pointer && (
              <div className="mt-1 p-2.5 bg-black/10 dark:bg-black/40 rounded-lg font-mono text-[11px] whitespace-pre overflow-x-auto">
                {errorDiagnostics.pointer}
              </div>
            )}
            {errorDiagnostics && errorDiagnostics.position === null && !executionTimedOut && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Position offset unavailable from current JavaScript runtime engine.</span>
            )}
          </div>
        )}
      </div>

      {/* Main Workspace: Left Editor Backdrop & Right Inspection Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto min-h-[640px]">
        {/* Test String Box with Synchronized Highlighter */}
        <div className="lg:col-span-7 flex flex-col bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm relative min-h-[460px] lg:min-h-0">
          <div className="flex justify-between items-center bg-gray-50 dark:bg-[#0a0f1a] p-4 border-b border-gray-200 dark:border-slate-800 z-20 flex-wrap gap-2">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span>Test String</span>
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {matches.length > MAX_HIGHLIGHT_MATCHES && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-slate-700" title="Backdrop highlighting is bounded to the first 300 matches for smooth scrolling">
                  Highlights: first {MAX_HIGHLIGHT_MATCHES}
                </span>
              )}
              <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/50">
                {stats.matches.toLocaleString()}{matchLimitReached ? '+' : ''} {stats.matches === 1 ? 'Match' : 'Matches'}
              </span>
            </div>
          </div>

          <div className="relative flex-grow bg-transparent font-mono text-[14px] leading-relaxed min-h-[300px]">
            {/* Backdrop highlight overlay */}
            <div
              ref={backdropRef}
              className="absolute inset-0 p-5 overflow-hidden text-slate-400 dark:text-slate-500 whitespace-pre-wrap break-words z-0 pointer-events-none select-none font-mono"
              aria-hidden="true"
            >
              {matchNodes}
            </div>
            {/* Transparent foreground textarea */}
            <label htmlFor="regex-test-string" className="sr-only">Test String to evaluate regular expression against</label>
            <textarea
              id="regex-test-string"
              value={testString}
              maxLength={MAX_TEST_CHARS}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTestString(e.target.value)}
              onScroll={handleScroll}
              placeholder="Paste or type test string here..."
              className="absolute inset-0 w-full h-full p-5 bg-transparent text-transparent caret-slate-900 dark:caret-white resize-none outline-none z-10 whitespace-pre-wrap break-words font-mono focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-[#0a0f1a] border-t border-gray-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span>{stats.chars.toLocaleString()} characters · {stats.lines.toLocaleString()} lines</span>
            <span>{stats.duration.toFixed(2)} ms execution time</span>
          </div>
        </div>

        {/* Right Inspection & Operations Panel */}
        <div className="lg:col-span-5 flex flex-col bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm min-h-[500px]">
          {/* Tab Navigation conforming to WCAG tablist pattern */}
          <div
            ref={tabListRef}
            onWheel={handleTabWheel}
            className="flex items-center gap-2 px-3 pt-3 pb-3 border-b border-gray-200 dark:border-slate-800 bg-gray-50/90 dark:bg-[#0a0f1a] overflow-x-auto whitespace-nowrap min-w-0 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full"
            role="tablist"
            aria-label="Regex tool inspection panels"
          >
            {[
              { id: 'breakdown', label: 'Matches', icon: Rows },
              { id: 'replace', label: 'Replace', icon: Wand2 },
              { id: 'split', label: 'Split & Extract', icon: Scissors },
              { id: 'cheatsheet', label: 'Cheat Sheet', icon: BookOpen },
              { id: 'explain', label: 'Explain', icon: Braces },
              { id: 'analyze', label: 'Safety & Engine', icon: ShieldCheck },
              { id: 'code', label: 'Code', icon: Code2 },
            ].map((tab, idx) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => handleTabClick(tab.id as ActiveTab)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  className={`shrink-0 min-w-max flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 select-none ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs border border-blue-500 dark:border-blue-500 ring-1 ring-blue-500/30'
                      : 'bg-gray-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-200/80 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Panels */}
          <div className="flex-grow overflow-auto p-4 md:p-6 [scrollbar-width:thin]">
            {/* Panel: Match Breakdown */}
            {activeTab === 'breakdown' && (
              <div id="panel-breakdown" role="tabpanel" aria-labelledby="tab-breakdown" className="space-y-4">
                {/* Search Filter & Export Actions */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative flex-1 min-w-[140px]">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <label htmlFor="regex-search-matches" className="sr-only">Search matches</label>
                    <input
                      id="regex-search-matches"
                      value={search}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Filter matches or groups..."
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => exportMatches('json')}
                      className="px-2.5 py-2 text-xs font-semibold border border-gray-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-label="Export matches to JSON"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => exportMatches('csv')}
                      className="px-2.5 py-2 text-xs font-semibold border border-gray-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-label="Export matches to CSV with formula injection defense"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => exportMatches('txt')}
                      className="px-2.5 py-2 text-xs font-semibold border border-gray-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-label="Export matches to TXT"
                    >
                      TXT
                    </button>
                  </div>
                </div>

                {/* Match Counter & Pagination Summary */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Showing {filteredMatches.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1}–{Math.min(safeCurrentPage * PAGE_SIZE, filteredMatches.length)} of {filteredMatches.length.toLocaleString()} {search ? 'filtered' : ''} matches
                  </span>
                  {totalPages > 1 && (
                    <span>Page {safeCurrentPage} of {totalPages}</span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  * Note: Match start and end offsets are zero-indexed UTF-16 code units (ECMAScript specification).
                </div>

                {/* Windowed Match Cards */}
                {filteredMatches.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-slate-500 font-medium">
                    <Braces className="w-10 h-10 mb-2 opacity-25" />
                    <p className="text-sm">
                      {!pattern ? 'Enter a regular expression pattern to test.' : 'No matches found in test string.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedMatches.map((m, i) => {
                      const matchGlobalIndex = (safeCurrentPage - 1) * PAGE_SIZE + i + 1;
                      return (
                        <div
                          key={`${m.index}-${matchGlobalIndex}`}
                          className="bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                        >
                          <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                              Match #{matchGlobalIndex}
                            </span>
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700">
                              UTF-16 Offset: {m.index}–{m.end}
                            </span>
                          </div>
                          <div className="p-3">
                            <div className="font-mono text-sm text-slate-900 dark:text-slate-100 break-all mb-2">
                              {m.match === '' ? (
                                <span className="text-amber-600 dark:text-amber-400 font-semibold italic">∅ zero-width match</span>
                              ) : (
                                `"${m.match}"`
                              )}
                            </div>

                            {/* Captured numbered groups */}
                            {m.groups.length > 0 && m.groups.some((g) => g !== undefined) && (
                              <div className="mt-2.5 pl-3 border-l-2 border-blue-500/60 space-y-1.5">
                                {m.groups.map(
                                  (g, gi) =>
                                    g !== undefined && (
                                      <div key={gi} className="flex flex-col gap-0.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Group {gi + 1}</span>
                                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded">
                                          {g}
                                        </span>
                                      </div>
                                    )
                                )}
                              </div>
                            )}

                            {/* Captured named groups */}
                            {Object.keys(m.namedGroups).length > 0 && (
                              <div className="mt-2.5 pl-3 border-l-2 border-emerald-500/60 space-y-1.5">
                                {Object.entries(m.namedGroups).map(([name, value]) => (
                                  <div key={name} className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Named: &lt;{name}&gt;</span>
                                    <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 break-all bg-emerald-50 dark:bg-emerald-900/20 p-1.5 rounded">
                                      {value ?? 'undefined'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-800 gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={safeCurrentPage === 1}
                      className="px-2 py-1 text-xs font-semibold rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
                      aria-label="Jump to first page of matches"
                    >
                      First
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safeCurrentPage === 1}
                        className="p-1 text-xs rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs px-2 font-mono text-slate-600 dark:text-slate-300">
                        {safeCurrentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage === totalPages}
                        className="p-1 text-xs rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
                        aria-label="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={safeCurrentPage === totalPages}
                      className="px-2 py-1 text-xs font-semibold rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
                      aria-label="Jump to last page of matches"
                    >
                      Last
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Panel: Replacement Engine */}
            {activeTab === 'replace' && (
              <div id="panel-replace" role="tabpanel" aria-labelledby="tab-replace" className="space-y-5">
                <div>
                  <label htmlFor="regex-replacement-input" className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Replacement Pattern
                  </label>
                  <input
                    id="regex-replacement-input"
                    value={replacement}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setReplacement(e.target.value)}
                    placeholder="Use $1, $2, $&, $<name>, etc."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl font-mono text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Replacement Result Preview</span>
                    <button
                      onClick={() => copyCode(replacementPreview, 'replacement')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      aria-label="Copy replacement preview text"
                    >
                      {copied === 'replacement' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied === 'replacement' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="min-h-40 max-h-72 overflow-auto whitespace-pre-wrap break-words p-4 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed [scrollbar-width:thin]">
                    {replacementPreview || '—'}
                  </pre>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Supported ECMAScript Replacement Tokens:</p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    <li><code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">$1, $2</code>: Insert the nth parenthesized capture group.</li>
                    <li><code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">$&amp;</code>: Insert the matched substring.</li>
                    <li><code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">$`</code>: Insert the portion of string preceding the match.</li>
                    <li><code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">$&apos;</code>: Insert the portion of string following the match.</li>
                    <li><code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">$$</code>: Insert a literal dollar sign.</li>
                    <li><code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">$&lt;name&gt;</code>: Insert named capture group.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Panel: Split & Extract */}
            {activeTab === 'split' && (
              <div id="panel-split" role="tabpanel" aria-labelledby="tab-split" className="space-y-6">
                {/* Mode 1: String.prototype.split() */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Text Split (`text.split(regex)`)
                      </h3>
                      <p className="text-xs text-slate-500">
                        {splitResult.length} segment{splitResult.length === 1 ? '' : 's'} produced
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyCode(JSON.stringify(splitResult, null, 2), 'split-json')}
                        className="px-2.5 py-1 text-xs font-semibold border border-gray-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                        aria-label="Copy split items as JSON array"
                      >
                        {copied === 'split-json' ? 'Copied JSON' : 'Copy JSON'}
                      </button>
                      <button
                        onClick={() => copyCode(splitResult.join('\n'), 'split-lines')}
                        className="px-2.5 py-1 text-xs font-semibold border border-gray-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                        aria-label="Copy split items as lines"
                      >
                        {copied === 'split-lines' ? 'Copied Lines' : 'Copy Lines'}
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/50">
                    <strong>ECMAScript Split Behavior:</strong> If your pattern contains capturing parentheses <code>(...)</code>, the captured tokens are spliced into the output array. To split without retaining delimiters, use non-capturing groups <code>(?:...)</code>.
                  </div>

                  <div className="max-h-56 overflow-auto border border-gray-200 dark:border-slate-800 rounded-xl divide-y divide-gray-200 dark:divide-slate-800 font-mono text-xs [scrollbar-width:thin]">
                    {splitResult.map((part, idx) => (
                      <div key={idx} className="p-2.5 flex items-start gap-3 bg-gray-50/50 dark:bg-[#0a0f1a]/50">
                        <span className="text-[10px] font-bold text-slate-400 shrink-0 w-8">#{idx}</span>
                        <span className="text-slate-800 dark:text-slate-200 break-all select-all">
                          {part === '' ? <span className="text-amber-500 italic">∅ empty string</span> : part}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mode 2: Targeted Extraction */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Matched Extraction
                      </h3>
                      <p className="text-xs text-slate-500">
                        {extractedList.length} item{extractedList.length === 1 ? '' : 's'} extracted
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={extractTarget}
                        onChange={(e) => setExtractTarget(e.target.value as 'match' | 'allGroups' | 'group1' | 'group2' | 'group3' | 'named')}
                        className="px-2.5 py-1 text-xs font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 outline-none"
                        aria-label="Select extraction target"
                      >
                        <option value="match">Full Match ($0)</option>
                        <option value="allGroups">All Groups (Group 1 | Group 2 ...)</option>
                        <option value="group1">Group 1 ($1)</option>
                        <option value="group2">Group 2 ($2)</option>
                        <option value="group3">Group 3 ($3)</option>
                        <option value="named">All Named Groups</option>
                      </select>
                      <button
                        onClick={() => copyCode(extractedList.join('\n'), 'extract-lines')}
                        className="px-2.5 py-1 text-xs font-semibold border border-gray-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                        aria-label="Copy extracted matches as lines"
                      >
                        {copied === 'extract-lines' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <pre className="min-h-28 max-h-48 overflow-auto whitespace-pre-wrap break-words p-3 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed [scrollbar-width:thin]">
                    {extractedList.length === 0 ? 'No items to extract.' : extractedList.join('\n')}
                  </pre>
                </div>
              </div>
            )}

            {/* Panel: Searchable Cheat Sheet */}
            {activeTab === 'cheatsheet' && (
              <div id="panel-cheatsheet" role="tabpanel" aria-labelledby="tab-cheatsheet" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <label htmlFor="regex-search-cheatsheet" className="sr-only">Search regex syntax tokens</label>
                    <input
                      id="regex-search-cheatsheet"
                      value={cheatSearch}
                      onChange={(e) => setCheatSearch(e.target.value)}
                      placeholder="Search tokens (e.g., lookaround, digit, boundary)..."
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={cheatCategory}
                    onChange={(e) => setCheatCategory(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none"
                    aria-label="Filter cheatsheet category"
                  >
                    <option value="All">All Categories</option>
                    <option value="Classes">Character Classes</option>
                    <option value="Quantifiers">Quantifiers</option>
                    <option value="Anchors">Anchors & Boundaries</option>
                    <option value="Groups">Groups & Lookarounds</option>
                    <option value="Flags">Flags</option>
                    <option value="Replacements">Replacement Tokens</option>
                  </select>
                </div>

                <div className="space-y-2 max-h-[460px] overflow-auto [scrollbar-width:thin]">
                  {filteredCheatSheet.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">No matching syntax tokens found.</div>
                  ) : (
                    filteredCheatSheet.map((item) => (
                      <div
                        key={`${item.token}-${item.name}`}
                        className="p-3 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-xl flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                              {item.token}
                            </code>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                            <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5 rounded bg-gray-200/60 dark:bg-slate-800">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                          <div className="text-[11px] font-mono text-slate-400">Ex: {item.example}</div>
                        </div>
                        <button
                          onClick={() => {
                            setPattern((p) => p + item.token);
                            copyCode(item.token, `token-${item.token}`);
                          }}
                          className="shrink-0 px-2 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded border border-blue-200 dark:border-blue-800 transition-colors"
                          title="Append this token into your regex pattern"
                          aria-label={`Insert ${item.token} into pattern`}
                        >
                          + Insert
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Panel: Heuristic Explanation */}
            {activeTab === 'explain' && (
              <div id="panel-explain" role="tabpanel" aria-labelledby="tab-explain" className="space-y-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-gray-50 dark:bg-[#0a0f1a] p-3 rounded-xl border border-gray-200 dark:border-slate-800 leading-relaxed">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Pattern Explanation (Token Analysis):</span> This breakdown provides token-level interpretation of common JavaScript regular expression constructs. It is an explanatory aid, not a compiler AST parser.
                </div>

                {explanation.length === 0 ? (
                  <div className="text-sm text-slate-500 p-4 text-center">Enter a pattern to see a token breakdown.</div>
                ) : (
                  <div className="space-y-2">
                    {explanation.map((item, i) => (
                      <div
                        key={`${item.token}-${i}`}
                        className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800"
                      >
                        <code className="min-w-[55px] max-w-[40%] break-all text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {item.token}
                        </code>
                        <ChevronRight className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item.meaning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Panel: ReDoS Safety & Engine Compatibility */}
            {activeTab === 'analyze' && (
              <div id="panel-analyze" role="tabpanel" aria-labelledby="tab-analyze" className="space-y-5">
                {/* Risk Guard Overview */}
                <div className="bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">ReDoS / Complexity Guard</div>
                      <div className={`text-sm font-bold ${riskClass(riskAnalysis.level)}`}>
                        {riskAnalysis.level === 'high' ? 'High static risk detected' : riskAnalysis.level === 'moderate' ? 'Moderate static risk' : 'Low static risk'} · score {riskAnalysis.score}/100
                      </div>
                    </div>
                    <ShieldCheck className={`w-6 h-6 ${riskClass(riskAnalysis.level)}`} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Static heuristic check evaluates structure for common backtracking hotspots (nested quantifiers, overlapping repetitions). It does NOT mathematically prove a regex is ReDoS-safe under untrusted input.
                  </p>
                </div>

                {/* Risk Findings */}
                <div className="space-y-2">
                  {riskAnalysis.findings.map((finding, index) => (
                    <div
                      key={`${finding.title}-${index}`}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800"
                    >
                      <div className={`text-xs font-bold ${riskClass(finding.level)}`}>
                        {finding.level.toUpperCase()} · {finding.title}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {finding.detail}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cross-Language Engine Compatibility */}
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cross-Engine Compatibility</div>
                  {compatibility.map((item, index) => (
                    <div
                      key={`${item.target}-${index}`}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.target}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            item.level === 'warning'
                              ? 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-950/40'
                              : item.level === 'ok'
                              ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/40'
                              : 'text-slate-600 bg-gray-100 dark:text-slate-400 dark:bg-slate-800'
                          }`}
                        >
                          {item.level}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{item.detail}</div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2">
                  Execution Safety: Runtime evaluations are aborted after {EXECUTION_TIMEOUT_MS} ms in an isolated Web Worker to safeguard the browser main thread against catastrophic backtracking.
                </div>
              </div>
            )}

            {/* Panel: Generated Source Code */}
            {activeTab === 'code' && (
              <div id="panel-code" role="tabpanel" aria-labelledby="tab-code" className="space-y-5">
                {[
                  { name: 'JavaScript (ECMAScript)', code: jsCode, key: 'js', color: 'text-yellow-400', icon: Code2 },
                  { name: 'Python (re module)', code: pyCode, key: 'py', color: 'text-blue-400', icon: Terminal },
                  { name: 'Java (java.util.regex)', code: javaCode, key: 'java', color: 'text-orange-400', icon: Code2 },
                  { name: 'Go (regexp / RE2)', code: goCode, key: 'go', color: 'text-cyan-400', icon: Terminal },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={item.key} className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-slate-800 shadow-sm">
                      <div className="flex justify-between items-center bg-[#2d2d2d] px-4 py-2.5 border-b border-black/50">
                        <span className={`text-xs font-bold ${item.color} flex items-center gap-2`}>
                          <ItemIcon className="w-3.5 h-3.5" />
                          <span>{item.name}</span>
                        </span>
                        <button
                          onClick={() => copyCode(item.code, item.key)}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 outline-none"
                          aria-label={`Copy ${item.name} snippet`}
                        >
                          {copied === item.key ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied === item.key ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-[12px] font-mono text-slate-300 leading-relaxed [scrollbar-width:thin] whitespace-pre">
                        {item.code}
                      </pre>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Status & Security Guarantee Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Client-Side Engine</span>
          </span>
          <span>•</span>
          <span>{stats.matches.toLocaleString()}{matchLimitReached ? '+' : ''} matches</span>
          <span>•</span>
          <span>{stats.groups.toLocaleString()} captured groups</span>
          <span>•</span>
          <span>{stats.duration.toFixed(2)} ms</span>
        </div>
        <span>Zero Network Exfiltration · Private Sandbox</span>
      </div>

      {/* Shareable Link Modal */}
      {showShareModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 id="share-modal-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Shareable Regex Link</span>
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1"
                aria-label="Close share dialog"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your pattern, flags, test text, and active view have been encoded directly into the URL fragment hash below. This URL runs entirely on the client—no data is uploaded or stored on any server.
            </p>
            <div className="relative">
              <input
                readOnly
                value={shareUrl}
                className="w-full pr-20 pl-3 py-2.5 bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700 rounded-xl font-mono text-xs dark:text-blue-300 focus:outline-none"
              />
              <button
                onClick={() => copyCode(shareUrl, 'modal-copy')}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                {copied === 'modal-copy' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'modal-copy' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50">
              <strong>Privacy Notice:</strong> Because this link serializes your text into the URL hash, do not share links containing sensitive passwords, private keys, or personal identifying information.
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
