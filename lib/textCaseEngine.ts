/**
 * KivaroTools — Text Case Engine
 * High-performance, pure TypeScript conversion engine for standard writing cases,
 * developer identifiers, text cleanup, and linguistic statistics.
 *
 * 100% Browser-Safe & Client-Side. Zero external dependencies.
 */

export type StandardCaseMode =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'capitalized'
  | 'alternating'
  | 'inverse';

export type DeveloperCaseMode =
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'
  | 'dot'
  | 'path'
  | 'cobol';

export type CaseMode = StandardCaseMode | DeveloperCaseMode;

export type CleanupAction =
  | 'trim'
  | 'normalize-spaces'
  | 'remove-blank-lines'
  | 'trim-lines'
  | 'normalize-line-endings';

export interface ConversionOptions {
  locale?: string;
  preserveLines?: boolean;
}

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
}

export interface CaseModeMetadata {
  id: CaseMode;
  name: string;
  group: 'standard' | 'developer';
  example: string;
  description: string;
}

export const CASE_MODES: CaseModeMetadata[] = [
  // Standard Writing Cases
  {
    id: 'sentence',
    name: 'Sentence case',
    group: 'standard',
    example: 'The quick brown fox.',
    description: 'Capitalizes the initial letter of each sentence.',
  },
  {
    id: 'title',
    name: 'Title Case',
    group: 'standard',
    example: 'The Quick Brown Fox',
    description: 'Capitalizes principal words while keeping minor grammatical articles lowercase.',
  },
  {
    id: 'capitalized',
    name: 'Capitalized Case',
    group: 'standard',
    example: 'The Quick Brown Fox',
    description: 'Capitalizes the initial letter of every single word without exception.',
  },
  {
    id: 'upper',
    name: 'UPPERCASE',
    group: 'standard',
    example: 'HELLO WORLD',
    description: 'Converts all alphabetical characters to capital letters.',
  },
  {
    id: 'lower',
    name: 'lowercase',
    group: 'standard',
    example: 'hello world',
    description: 'Converts all alphabetical characters to small letters.',
  },
  {
    id: 'alternating',
    name: 'aLtErNaTiNg cAsE',
    group: 'standard',
    example: 'tHe qUiCk bRoWn',
    description: 'Alternates between lowercase and uppercase characters sequentially.',
  },
  {
    id: 'inverse',
    name: 'InVeRsE cAsE',
    group: 'standard',
    example: 'iNVERSE cASE',
    description: 'Inverts each character: uppercase becomes lowercase and vice versa.',
  },

  // Developer Naming Formats
  {
    id: 'camel',
    name: 'camelCase',
    group: 'developer',
    example: 'myVariableName',
    description: 'Standard JavaScript / TypeScript variable and property identifier format.',
  },
  {
    id: 'pascal',
    name: 'PascalCase',
    group: 'developer',
    example: 'MyClassName',
    description: 'Standard React component, class, and interface identifier format.',
  },
  {
    id: 'snake',
    name: 'snake_case',
    group: 'developer',
    example: 'database_column_name',
    description: 'Standard Python, Ruby, and SQL column identifier format.',
  },
  {
    id: 'kebab',
    name: 'kebab-case',
    group: 'developer',
    example: 'slug-url-path-name',
    description: 'Standard CSS class name, HTML attribute, and URL slug format.',
  },
  {
    id: 'constant',
    name: 'CONSTANT_CASE',
    group: 'developer',
    example: 'MAX_RETRY_COUNT',
    description: 'Standard global constant, enum, and environment variable identifier format.',
  },
  {
    id: 'dot',
    name: 'dot.case',
    group: 'developer',
    example: 'config.network.timeout',
    description: 'Standard configuration key, object path, and package naming format.',
  },
  {
    id: 'path',
    name: 'path/case',
    group: 'developer',
    example: 'src/components/button',
    description: 'POSIX file system path and REST API route segment format.',
  },
  {
    id: 'cobol',
    name: 'COBOL-CASE',
    group: 'developer',
    example: 'MAX-RETRY-COUNT',
    description: 'Standard uppercase hyphenated identifier format used in COBOL and HTTP headers.',
  },
];

/**
 * Standard grammatical English minor words that remain lowercase in Title Case,
 * unless appearing as the very first or very last word.
 */
const TITLE_CASE_MINOR_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'en', 'for', 'if', 'in',
  'nor', 'of', 'on', 'or', 'per', 'the', 'to', 'v', 'vs', 'via', 'yet',
  'de', 'la', 'del', 'el', 'du', 'des', 'von', 'van',
  'het', 'een', 've', 'ile', 'veya', 'und', 'der', 'die', 'das', 'et', 'ou',
]);

/**
 * Common abbreviations that end with a dot but should NOT terminate a sentence.
 */
const SENTENCE_ABBREVIATIONS = new Set([
  'dr', 'mr', 'mrs', 'ms', 'prof', 'sr', 'jr', 'rev', 'gen', 'gov', 'sen', 'rep', 'st',
  'e.g', 'i.e', 'vs', 'etc', 'cf', 'viz', 'u.s', 'u.k', 'u.s.a',
]);

/**
 * Terminal sentence punctuation across world scripts:
 * Standard (. ! ?), Greek question mark (; \u037E), Arabic question mark (؟ \u061F),
 * CJK full stop/exclamation/question (。 \u3002, ！ \uFF01, ？ \uFF1F),
 * Hindi danda/double danda (। \u0964, ॥ \u0965), and Armenian full stop (։ \u0589).
 */
const TERMINAL_PUNCTUATION_REGEX = /[.!?\u037E\u061F\u3002\uFF01\uFF1F\u0964\u0965\u0589]/;

/**
 * Cached Intl.Segmenter instances to eliminate massive overhead on large inputs.
 */
const graphemeSegmenterCache = new Map<string, Intl.Segmenter>();
function getGraphemeSegmenter(locale?: string): Intl.Segmenter | null {
  if (typeof Intl === 'undefined' || !('Segmenter' in Intl)) return null;
  const key = locale || '__default__';
  let segmenter = graphemeSegmenterCache.get(key);
  if (!segmenter) {
    try {
      segmenter = new Intl.Segmenter(locale || undefined, { granularity: 'grapheme' });
      graphemeSegmenterCache.set(key, segmenter);
    } catch {
      return null;
    }
  }
  return segmenter;
}

const wordSegmenterCache = new Map<string, Intl.Segmenter>();
function getWordSegmenter(locale?: string): Intl.Segmenter | null {
  if (typeof Intl === 'undefined' || !('Segmenter' in Intl)) return null;
  const key = locale || '__default__';
  let segmenter = wordSegmenterCache.get(key);
  if (!segmenter) {
    try {
      segmenter = new Intl.Segmenter(locale || undefined, { granularity: 'word' });
      wordSegmenterCache.set(key, segmenter);
    } catch {
      return null;
    }
  }
  return segmenter;
}

/**
 * Robust tokenization utility for developer identifiers.
 * Intelligently decomposes camelCase, PascalCase, snake_case, kebab-case,
 * acronym clusters (XMLHttpRequest, parseJSONResponse, userID), version numbers, and punctuation.
 */
export function tokenizeIdentifier(input: string): string[] {
  if (!input || typeof input !== 'string') return [];

  const raw = input.trim();
  if (raw.length === 0) return [];

  // Step 1: Split along obvious word boundaries (whitespace, dashes, underscores, dots, slashes, backslashes, colons)
  const segments = raw.split(/[\s\-_\./\\:;,+*~|]+/);
  const tokens: string[] = [];

  for (const seg of segments) {
    if (!seg) continue;

    // Step 2: Handle mixed-case boundaries inside a segment:
    // e.g. "XMLHttpRequest" -> "XML", "Http", "Request"
    // e.g. "parseJSONResponse" -> "parse", "JSON", "Response"
    // e.g. "version2Update" -> "version", "2", "Update"
    // e.g. "userID" -> "user", "ID"
    // e.g. "IPv6Address" -> "IPv6", "Address"
    // e.g. "OAuth2Client" -> "OAuth", "2", "Client"
    const subTokens = seg.match(
      /W3C|IPv[46]|OAuth|\p{Lu}+(?=\p{Lu}\p{Ll})|\p{Lu}?\p{Ll}+|\p{N}+|\p{Lu}+/gu
    );

    if (subTokens && subTokens.length > 0) {
      for (const t of subTokens) {
        if (t.trim().length > 0) {
          tokens.push(t.trim());
        }
      }
    } else {
      tokens.push(seg);
    }
  }

  return tokens;
}

/**
 * Convert string to UPPERCASE with optional locale support and safe error fallback.
 */
export function toUpperCase(input: string, locale?: string): string {
  if (!input) return '';
  if (locale) {
    try {
      return input.toLocaleUpperCase(locale);
    } catch {
      return input.toUpperCase();
    }
  }
  return input.toUpperCase();
}

/**
 * Convert string to lowercase with optional locale support and safe error fallback.
 */
export function toLowerCase(input: string, locale?: string): string {
  if (!input) return '';
  if (locale) {
    try {
      return input.toLocaleLowerCase(locale);
    } catch {
      return input.toLowerCase();
    }
  }
  return input.toLowerCase();
}

/**
 * Capitalize the first letter of a word, keeping the rest unchanged or lowercased.
 */
export function capitalizeWord(word: string, locale?: string): string {
  if (!word) return '';

  // Dutch IJ digraph check: In Dutch, 'ij' at word start is capitalized as 'IJ' (e.g., IJsselmeer, IJsberg)
  const isDutch = locale ? (locale.toLowerCase() === 'nl' || locale.toLowerCase().startsWith('nl-')) : false;
  if (isDutch && /^ij/i.test(word)) {
    return 'IJ' + toLowerCase(word.slice(2), locale);
  }

  const segmenter = getGraphemeSegmenter(locale);
  if (segmenter) {
    try {
      const iterator = segmenter.segment(word)[Symbol.iterator]();
      const firstSegment = iterator.next().value;
      if (firstSegment) {
        const first = toUpperCase(firstSegment.segment, locale);
        const rest = toLowerCase(word.slice(firstSegment.segment.length), locale);
        return first + rest;
      }
    } catch {
      // Fallback below
    }
  }

  // Safe code point fallback (surrogate-pair safe)
  const codePoints = Array.from(word);
  if (codePoints.length === 0) return '';
  const firstChar = codePoints[0];
  const first = toUpperCase(firstChar, locale);
  const rest = toLowerCase(word.slice(firstChar.length), locale);
  return first + rest;
}

/**
 * Convert string to Capitalized Case (Start Case):
 * Capitalizes the first letter of every word without exception.
 */
export function toCapitalizedCase(input: string, locale?: string): string {
  if (!input) return '';

  return input.replace(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu, (match) => {
    return capitalizeWord(match, locale);
  });
}

/**
 * Convert string to Title Case:
 * Capitalizes major words while preserving minor articles/prepositions in lowercase,
 * ensuring the first and last words of the phrase are always capitalized.
 * Preserves all-caps acronyms (NASA, HTML) and mixed-case brands (iPhone, eBay) in mixed-case context.
 */
export function toTitleCase(input: string, locale?: string): string {
  if (!input) return '';

  const isOverallAllUpper = input.trim().length > 1 && input === input.toUpperCase();
  const isCrlf = input.includes('\r\n') && !input.replace(/\r\n/g, '').includes('\n');
  const lines = input.split(/\r\n|\r|\n/);

  const convertedLines = lines.map((line) => {
    if (!line.trim()) return line;

    // Match words while keeping contractions together and quotes/delimiters separate
    const wordRegex = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
    const matches = Array.from(line.matchAll(wordRegex));
    if (matches.length === 0) return line;

    const firstWordIndex = matches[0].index;
    const lastWordIndex = matches[matches.length - 1].index;

    let result = '';
    let lastIndex = 0;

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const word = match[0];
      const matchIndex = match.index;

      // Append separator preceding this word
      const separator = line.slice(lastIndex, matchIndex);
      result += separator;
      lastIndex = matchIndex + word.length;

      const lower = toLowerCase(word, locale);
      const isFirst = matchIndex === firstWordIndex;
      const isLast = matchIndex === lastWordIndex;
      const followsMajorBreak = /[:;—–\.\?!]/.test(separator);

      // Minor words remain lowercase unless first, last, or following major break
      if (!isFirst && !isLast && !followsMajorBreak && TITLE_CASE_MINOR_WORDS.has(lower)) {
        result += lower;
        continue;
      }

      // Preserve all-caps acronyms (e.g. NASA, HTML) and mixed-case brands (e.g. iPhone, eBay)
      const isAllUpperWord = word.length >= 2 && word === word.toUpperCase() && /[\p{L}]/u.test(word);
      const isMixedCaseBrand = /^[\p{Ll}]+[\p{Lu}]/u.test(word);

      if (!isOverallAllUpper && (isAllUpperWord || isMixedCaseBrand)) {
        result += word;
        continue;
      }

      result += capitalizeWord(word, locale);
    }

    // Append any trailing separator
    result += line.slice(lastIndex);
    return result;
  });

  return convertedLines.join(isCrlf ? '\r\n' : '\n');
}

/**
 * Unicode-compliant detection for Greek Final_Sigma context (Unicode Standard Section 3.13):
 * Capital sigma (Σ) is lowercased to final sigma (ς) if and only if:
 * 1. It is preceded by a cased character (\p{Cased}), ignoring case-ignorable characters (\p{Case_Ignorable}, combining marks, and apostrophes).
 * 2. It is NOT followed by a cased character (\p{Cased}), ignoring case-ignorable characters.
 * Unicameral scripts (Hebrew, Arabic, CJK) are not cased characters and do not trigger final sigma.
 * Otherwise, it is lowercased to medial sigma (σ).
 */
export function isGreekFinalSigma(graphemes: string[], i: number): boolean {
  // Check 1: Must be preceded by a cased character, skipping case-ignorable characters
  let precededByCased = false;
  for (let j = i - 1; j >= 0; j--) {
    const prev = graphemes[j];
    if (/^[\p{Case_Ignorable}\p{M}\p{Cf}'’]+$/u.test(prev)) continue;
    if (/\p{Cased}/u.test(prev)) {
      precededByCased = true;
    }
    break;
  }
  if (!precededByCased) return false;

  // Check 2: Must NOT be followed by a cased character, skipping case-ignorable characters
  let followedByCased = false;
  for (let j = i + 1; j < graphemes.length; j++) {
    const next = graphemes[j];
    if (/^[\p{Case_Ignorable}\p{M}\p{Cf}'’]+$/u.test(next)) continue;
    if (/\p{Cased}/u.test(next)) {
      followedByCased = true;
    }
    break;
  }

  return !followedByCased;
}

/**
 * Convert string to Sentence case:
 * Capitalizes the first cased character of each sentence, following terminal punctuation
 * or start of lines, while respecting decimal numbers, abbreviations, domain names, and quotes.
 */
export function toSentenceCase(input: string, locale?: string): string {
  if (!input) return '';

  const isCrlf = input.includes('\r\n') && !input.replace(/\r\n/g, '').includes('\n');
  const lines = input.split(/\r\n|\r|\n/);

  const processedLines = lines.map((line) => {
    if (!line.trim()) return line;

    let graphemes: string[];
    const segmenter = getGraphemeSegmenter(locale);
    if (segmenter) {
      try {
        graphemes = Array.from(segmenter.segment(line), (s) => s.segment);
      } catch {
        graphemes = Array.from(line);
      }
    } else {
      graphemes = Array.from(line);
    }

    let capitalizeNext = true;
    let result = '';

    for (let i = 0; i < graphemes.length; i++) {
      const char = graphemes[i];

      if (capitalizeNext && /[\p{L}]/u.test(char)) {
        // Dutch IJ digraph capitalization at sentence start
        const isDutch = locale ? (locale.toLowerCase() === 'nl' || locale.toLowerCase().startsWith('nl-')) : false;
        if (isDutch && (char === 'i' || char === 'I') && i + 1 < graphemes.length && (graphemes[i + 1] === 'j' || graphemes[i + 1] === 'J')) {
          result += 'IJ';
          i++; // consume 'j'
          capitalizeNext = false;
        } else {
          result += toUpperCase(char, locale);
          capitalizeNext = false;
        }
      } else if (capitalizeNext && /[\p{N}]/u.test(char)) {
        // Numbers at start of sentence consume initial capitalization
        result += char;
        capitalizeNext = false;
      } else if (!capitalizeNext && /[\p{Lu}]/u.test(char)) {
        // Lowercase subsequent letters within the same sentence
        if (locale?.startsWith('el') && (char.startsWith('Σ') || char.startsWith('\u03A3'))) {
          const base = isGreekFinalSigma(graphemes, i) ? 'ς' : 'σ';
          result += base + char.slice(1);
        } else {
          result += toLowerCase(char, locale);
        }
      } else if (!capitalizeNext && locale?.startsWith('el') && (char.startsWith('σ') || char.startsWith('ς'))) {
        const base = isGreekFinalSigma(graphemes, i) ? 'ς' : 'σ';
        result += base + char.slice(1);
      } else {
        result += char;
      }

      // Detect sentence boundaries
      if (TERMINAL_PUNCTUATION_REGEX.test(char)) {
        const prev = i > 0 ? graphemes[i - 1] : '';
        const next = i + 1 < graphemes.length ? graphemes[i + 1] : '';

        // Decimal numbers: e.g. "3.14"
        const isDecimal = char === '.' && /\d/.test(prev) && /\d/.test(next);

        // Domains / file extensions / emails without spaces: e.g. "example.com", "report.pdf"
        const isDomainOrExt = char === '.' && /\w/.test(prev) && /[\p{L}]/u.test(next);

        // Abbreviations: e.g. "Dr.", "e.g.", "U.S." (bounded O(1) lookback window)
        let isAbbrev = false;
        if (char === '.') {
          const lookbackStart = Math.max(0, i - 16);
          const sub = graphemes.slice(lookbackStart, i).join('');
          const match = sub.match(/[\p{L}][\p{L}.]*$/u);
          if (match) {
            const word = match[0].toLowerCase();
            if (SENTENCE_ABBREVIATIONS.has(word) || /(?:^|\s)(?:[a-z]\.){1,}[a-z]?$/i.test(match[0])) {
              isAbbrev = true;
            }
          }
        }

        if (!isDecimal && !isDomainOrExt && !isAbbrev) {
          capitalizeNext = true;
        }
      }
    }

    return result;
  });

  return processedLines.join(isCrlf ? '\r\n' : '\n');
}

/**
 * Convert string to aLtErNaTiNg CaSe (alternating characters).
 */
export function toAlternatingCase(input: string, locale?: string): string {
  if (!input) return '';

  let toLower = true;
  let result = '';

  for (const char of input) {
    if (/[\p{L}]/u.test(char)) {
      result += toLower ? toLowerCase(char, locale) : toUpperCase(char, locale);
      toLower = !toLower;
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Convert string to InVeRsE CaSe (inverting each letter's case).
 */
export function toInverseCase(input: string, locale?: string): string {
  if (!input) return '';

  let result = '';
  for (const char of input) {
    const upper = toUpperCase(char, locale);
    const lower = toLowerCase(char, locale);
    if (char === upper && char !== lower) {
      result += lower;
    } else if (char === lower && char !== upper) {
      result += upper;
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Convert developer identifier line by line or as single block.
 */
function convertDeveloperFormat(
  input: string,
  formatter: (tokens: string[]) => string,
  preserveLines: boolean = true
): string {
  if (!input || !input.trim()) return '';

  const isCrlf = input.includes('\r\n') && !input.replace(/\r\n/g, '').includes('\n');

  if (preserveLines) {
    const lines = input.split(/\r\n|\r|\n/);
    return lines
      .map((line) => {
        if (!line.trim()) return line;
        const tokens = tokenizeIdentifier(line);
        if (tokens.length === 0) return line;
        return formatter(tokens);
      })
      .join(isCrlf ? '\r\n' : '\n');
  }

  const tokens = tokenizeIdentifier(input);
  if (tokens.length === 0) return input;
  return formatter(tokens);
}

/**
 * Convert string to camelCase (e.g. "myVariableName").
 */
export function toCamelCase(input: string, preserveLines: boolean = true, locale?: string): string {
  return convertDeveloperFormat(
    input,
    (tokens) => {
      return tokens
        .map((token, index) => {
          if (index === 0) return toLowerCase(token, locale);
          return capitalizeWord(token, locale);
        })
        .join('');
    },
    preserveLines
  );
}

/**
 * Convert string to PascalCase (e.g. "MyClassName").
 */
export function toPascalCase(input: string, preserveLines: boolean = true, locale?: string): string {
  return convertDeveloperFormat(
    input,
    (tokens) => {
      return tokens.map((token) => capitalizeWord(token, locale)).join('');
    },
    preserveLines
  );
}

/**
 * Convert string to snake_case (e.g. "database_column_name").
 */
export function toSnakeCase(input: string, preserveLines: boolean = true, locale?: string): string {
  return convertDeveloperFormat(
    input,
    (tokens) => {
      return tokens.map((token) => toLowerCase(token, locale)).join('_');
    },
    preserveLines
  );
}

/**
 * Convert string to kebab-case (e.g. "slug-url-path-name").
 */
export function toKebabCase(input: string, preserveLines: boolean = true, locale?: string): string {
  return convertDeveloperFormat(
    input,
    (tokens) => {
      return tokens.map((token) => toLowerCase(token, locale)).join('-');
    },
    preserveLines
  );
}

/**
 * Convert string to CONSTANT_CASE (e.g. "MAX_RETRY_COUNT").
 */
export function toConstantCase(input: string, preserveLines: boolean = true, locale?: string): string {
  return convertDeveloperFormat(
    input,
    (tokens) => {
      return tokens.map((token) => toUpperCase(token, locale)).join('_');
    },
    preserveLines
  );
}

/**
 * Convert string to dot.case (e.g. "config.network.timeout").
 */
export function toDotCase(input: string, preserveLines: boolean = true, locale?: string): string {
  return convertDeveloperFormat(
    input,
    (tokens) => {
      return tokens.map((token) => toLowerCase(token, locale)).join('.');
    },
    preserveLines
  );
}

/**
 * Convert string to path/case (e.g. "src/components/button").
 */
export function toPathCase(input: string, preserveLines: boolean = true, locale?: string): string {
  return convertDeveloperFormat(
    input,
    (tokens) => {
      return tokens.map((token) => toLowerCase(token, locale)).join('/');
    },
    preserveLines
  );
}

/**
 * Convert string to COBOL-CASE (e.g. "MAX-RETRY-COUNT").
 */
export function toCobolCase(input: string, preserveLines: boolean = true, locale?: string): string {
  return convertDeveloperFormat(
    input,
    (tokens) => {
      return tokens.map((token) => toUpperCase(token, locale)).join('-');
    },
    preserveLines
  );
}

/**
 * Master conversion dispatcher.
 */
export function convertText(
  input: string,
  mode: CaseMode,
  options: ConversionOptions = {}
): string {
  if (!input) return '';

  const { locale, preserveLines = true } = options;

  switch (mode) {
    case 'upper':
      return toUpperCase(input, locale);
    case 'lower':
      return toLowerCase(input, locale);
    case 'title':
      return toTitleCase(input, locale);
    case 'sentence':
      return toSentenceCase(input, locale);
    case 'capitalized':
      return toCapitalizedCase(input, locale);
    case 'alternating':
      return toAlternatingCase(input, locale);
    case 'inverse':
      return toInverseCase(input, locale);
    case 'camel':
      return toCamelCase(input, preserveLines, locale);
    case 'pascal':
      return toPascalCase(input, preserveLines, locale);
    case 'snake':
      return toSnakeCase(input, preserveLines, locale);
    case 'kebab':
      return toKebabCase(input, preserveLines, locale);
    case 'constant':
    // @ts-expect-error support screaming_snake aliases
    case 'screaming_snake':
    // @ts-expect-error support screaming-snake aliases
    case 'screaming-snake':
      return toConstantCase(input, preserveLines, locale);
    case 'dot':
      return toDotCase(input, preserveLines, locale);
    case 'path':
      return toPathCase(input, preserveLines, locale);
    case 'cobol':
      return toCobolCase(input, preserveLines, locale);
    default:
      return input;
  }
}

/**
 * Text cleanup operations.
 */
export function cleanupText(input: string, action: CleanupAction): string {
  if (!input) return '';

  const isCrlf = input.includes('\r\n') && !input.replace(/\r\n/g, '').includes('\n');
  const newline = isCrlf ? '\r\n' : '\n';

  switch (action) {
    case 'trim':
      return input.trim();

    case 'normalize-spaces':
      // Replaces multiple horizontal spaces/tabs with single space, preserving line breaks
      return input.replace(/[^\S\r\n]+/g, ' ');

    case 'remove-blank-lines':
      return input
        .split(/\r\n|\r|\n/)
        .filter((line) => line.trim().length > 0)
        .join(newline);

    case 'trim-lines':
      return input
        .split(/\r\n|\r|\n/)
        .map((line) => line.trim())
        .join(newline);

    case 'normalize-line-endings':
      return input.replace(/\r\n|\r/g, '\n');

    default:
      return input;
  }
}

/**
 * Calculate linguistic text statistics accurately.
 */
export function calculateTextStats(input: string): TextStats {
  if (!input || input.length === 0) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      sentences: 0,
      paragraphs: 0,
    };
  }

  // Baseline Unicode code points count (surrogate-pair safe)
  let characters = [...input].length;
  let charactersNoSpaces = [...input.replace(/\s/g, '')].length;

  // Unicode grapheme cluster counting for accurate user-perceived characters (e.g. emoji and accented glyphs)
  const graphemeSegmenter = getGraphemeSegmenter();
  if (graphemeSegmenter) {
    try {
      const graphemes = Array.from(graphemeSegmenter.segment(input));
      characters = graphemes.length;
      charactersNoSpaces = graphemes.filter((g) => !/^\s+$/.test(g.segment)).length;
    } catch {
      characters = [...input].length;
      charactersNoSpaces = [...input.replace(/\s/g, '')].length;
    }
  }

  // Words count: use Intl.Segmenter if available, fallback to Unicode-aware word regex
  let words = 0;
  const wordSegmenter = getWordSegmenter();
  if (wordSegmenter) {
    try {
      for (const segment of wordSegmenter.segment(input)) {
        if (segment.isWordLike) words++;
      }
    } catch {
      const matches = input.match(/[\p{L}\p{N}]+/gu);
      words = matches ? matches.length : 0;
    }
  } else {
    const matches = input.match(/[\p{L}\p{N}]+/gu);
    words = matches ? matches.length : 0;
  }

  // Lines count
  const lines = input.split(/\r\n|\r|\n/).length;

  // Sentences count (heuristic approximation accounting for abbreviations, decimals, domains, and extensions)
  const trimmed = input.trim();
  let sentences = 0;
  if (trimmed.length > 0) {
    let inSentence = false;
    const chars = Array.from(trimmed);
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (/\S/.test(char)) {
        inSentence = true;
      }

      if (TERMINAL_PUNCTUATION_REGEX.test(char)) {
        const prev = i > 0 ? chars[i - 1] : '';
        const next = i + 1 < chars.length ? chars[i + 1] : '';
        const isDecimal = char === '.' && /\d/.test(prev) && /\d/.test(next);
        const isDomainOrExt = char === '.' && /\w/.test(prev) && /[\p{L}]/u.test(next);

        let isAbbrev = false;
        if (char === '.') {
          const lookbackStart = Math.max(0, i - 16);
          const sub = chars.slice(lookbackStart, i).join('');
          const match = sub.match(/[\p{L}][\p{L}.]*$/u);
          if (match) {
            const word = match[0].toLowerCase();
            if (SENTENCE_ABBREVIATIONS.has(word) || /(?:^|\s)(?:[a-z]\.){1,}[a-z]?$/i.test(match[0])) {
              isAbbrev = true;
            }
          }
        }

        if (!isDecimal && !isDomainOrExt && !isAbbrev) {
          // Skip consecutive repeated punctuation marks (e.g. "...", "?!", "!!")
          let j = i + 1;
          while (j < chars.length && TERMINAL_PUNCTUATION_REGEX.test(chars[j])) {
            j++;
          }
          i = j - 1;
          sentences++;
          inSentence = false;
        }
      }
    }
    if (inSentence) {
      sentences++;
    }
  }

  // Paragraphs count: blocks separated by double line breaks
  let paragraphs = 0;
  if (trimmed.length > 0) {
    const paragraphBlocks = trimmed.split(/\n\s*\n+/);
    paragraphs = paragraphBlocks.filter((p) => p.trim().length > 0).length;
  }

  return {
    characters,
    charactersNoSpaces,
    words,
    lines,
    sentences,
    paragraphs,
  };
}
