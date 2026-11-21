/**
 * KivaroTools — YAML ↔ JSON Converter, CST Validator & DevOps Linter Engine
 * File: lib/yamlJsonEngine.ts
 *
 * 100% Client-Side, Zero-Dependency TypeScript Engine (v2.7.0-enterprise):
 * 1. Bidirectional Conversion (YAML → JSON, JSON/JSONC/NDJSON → YAML, Auto-Detect).
 * 2. YAML 1.2 Core Schema vs. YAML 1.1 Compatibility Mode ("Norway Problem" Detector & 1-Click Auto-Quote Fixer for mappings & sequences).
 * 3. Multi-Document YAML Stream Support (`---` and `...`) ↔ JSON Array, NDJSON (JSON Lines), or Per-Doc Inspection.
 * 4. YAML Anchors (`&anchor`), Aliases (`*alias` in blocks & flow collections), Merge Key (`<<`) Resolution, & Alias Bomb DoS Guard.
 * 5. 64-Bit BigInt Precision Guard (Prevents silent IEEE-754 truncation on Snowflake/AWS/Discord 64-bit IDs).
 * 6. Duplicate Key Detection (in both YAML and JSON/JSONC), Tab Indentation Guard & Exact 1-Indexed Line/Column Error Pinpointing.
 * 7. Bidirectional Comment Round-Tripping (YAML `#` comments ↔ JSONC `//` comments) & Explicit Block Scalar Indentation (`|2`, `|-`, `|+`, `>-`, `>+`).
 * 8. DevOps Manifest Linter (Kubernetes, Docker Compose, GitHub Actions, OpenAPI 3.x).
 * 9. CWE-1236-Safe 3-Sheet OpenXML Excel (.xlsx) & CSV Diagnostic Audit Export.
 */

export const YAML_JSON_ENGINE_VERSION = '2.7.0-enterprise';
export const MAX_SAFE_YAML_JSON_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_ALIAS_EXPANSIONS = 1000;

export type ConversionDirection = 'yaml_to_json' | 'json_to_yaml' | 'auto_detect';
export type YamlSpecVersion = '1.2' | '1.1';
export type MultiDocOutputMode = 'json_array' | 'ndjson' | 'first_document';
export type BigIntHandlingMode = 'exact_number' | 'string_preserve' | 'float_coerce';
export type YamlQuoteStyle = 'minimal' | 'single' | 'double';
export type DevOpsSchemaType =
  | 'auto'
  | 'none'
  | 'kubernetes'
  | 'docker_compose'
  | 'github_actions'
  | 'openapi';

export interface YamlJsonConversionOptions {
  direction: ConversionDirection;
  yamlSpec: YamlSpecVersion;
  indentSpaces: 2 | 4 | 0; // 0 = minified JSON
  multiDocMode: MultiDocOutputMode;
  resolveMergeKeys: boolean;
  bigintMode: BigIntHandlingMode;
  preserveCommentsAsJsonc: boolean;
  sortKeys: boolean;
  yamlQuoteStyle: YamlQuoteStyle;
  detectDuplicateKeys: boolean;
  devOpsSchema: DevOpsSchemaType;
}

export interface SyntaxDiagnostic {
  id: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  line: number;
  column: number;
  keyPath: string;
  snippet: string;
  suggestion: string;
}

export interface NorwayTrapFinding {
  id: string;
  line: number;
  column: number;
  keyPath: string;
  rawToken: string;
  yaml12Type: string;
  yaml12Value: string;
  yaml11Type: string;
  yaml11Value: string;
  reason: string;
}

export interface BigIntFinding {
  line: number;
  keyPath: string;
  exactDigits: string;
  truncatedFloat: string;
}

export interface CommentMapping {
  line: number;
  keyPath: string;
  text: string;
}

export interface ConversionMetrics {
  inputBytes: number;
  outputBytes: number;
  inputLines: number;
  outputLines: number;
  documentCount: number;
  totalKeysCount: number;
  maxNestingDepth: number;
  anchorsDefinedCount: number;
  aliasesResolvedCount: number;
  mergeKeysResolvedCount: number;
  norwayTrapsCount: number;
  bigIntCount: number;
  duplicateKeysCount: number;
  commentsCount: number;
  errorsCount: number;
  warningsCount: number;
  detectedSchema: DevOpsSchemaType;
  executionTimeMs: number;
}

export interface YamlJsonConversionResult {
  engineVersion: string;
  resolvedDirection: 'yaml_to_json' | 'json_to_yaml';
  isValid: boolean;
  outputText: string;
  documents: unknown[];
  diagnostics: SyntaxDiagnostic[];
  norwayTraps: NorwayTrapFinding[];
  bigIntFindings: BigIntFinding[];
  comments: CommentMapping[];
  metrics: ConversionMetrics;
}

// ============================================================================
// 1. DEFAULT OPTIONS & YAML 1.1 VS 1.2 NORWAY TRAP REGISTRIES
// ============================================================================

export function getDefaultYamlJsonOptions(): YamlJsonConversionOptions {
  return {
    direction: 'yaml_to_json',
    yamlSpec: '1.2',
    indentSpaces: 2,
    multiDocMode: 'json_array',
    resolveMergeKeys: true,
    bigintMode: 'exact_number',
    preserveCommentsAsJsonc: false,
    sortKeys: false,
    yamlQuoteStyle: 'minimal',
    detectDuplicateKeys: true,
    devOpsSchema: 'auto',
  };
}

const YAML_11_TRUE_LITERALS = new Set([
  'y',
  'Y',
  'yes',
  'Yes',
  'YES',
  'on',
  'On',
  'ON',
]);

const YAML_11_FALSE_LITERALS = new Set([
  'n',
  'N',
  'no',
  'No',
  'NO',
  'off',
  'Off',
  'OFF',
]);

const YAML_12_TRUE_LITERALS = new Set(['true', 'True', 'TRUE']);
const YAML_12_FALSE_LITERALS = new Set(['false', 'False', 'FALSE']);
const YAML_NULL_LITERALS = new Set(['null', 'Null', 'NULL', '~']);

// Sentinel wrapper for lossless 64-bit BigInt serialization in JSON
export const BIGINT_RAW_PREFIX = '__KIVARO_BIGINT_RAW__:';

// ============================================================================
// 2. AUTO-DETECT INPUT FORMAT (YAML VS JSON / JSONC / NDJSON)
// ============================================================================

export function detectInputFormat(rawInput: string): 'yaml_to_json' | 'json_to_yaml' {
  const trimmed = rawInput.trim();
  if (!trimmed) return 'yaml_to_json';

  const withoutJsoncComments = trimmed
    .replace(/^\s*(?:\/\/[^\r\n]*\r?\n|\/\*[\s\S]*?\*\/\s*)+/, '')
    .replace(/(?:\r?\n\s*\/\/[^\r\n]*|\s*\/\*[\s\S]*?\*\/)+\s*$/, '')
    .trim();

  if (
    (withoutJsoncComments.startsWith('{') && withoutJsoncComments.endsWith('}')) ||
    (withoutJsoncComments.startsWith('[') && withoutJsoncComments.endsWith(']'))
  ) {
    try {
      parseJsonOrJsonc(trimmed, 'exact_number');
      return 'json_to_yaml';
    } catch {
      if (/^\{\s*"/.test(withoutJsoncComments) || /^\[\s*\{/.test(withoutJsoncComments)) {
        return 'json_to_yaml';
      }
    }
  }

  return 'yaml_to_json';
}

// ============================================================================
// 3. JSON / JSONC / NDJSON PARSER WITH DUPLICATE KEY & 64-BIT BIGINT DETECTION
// ============================================================================

function scanJsonDuplicateKeys(
  sanitizedJson: string,
  rawLines: string[],
  diagnosticsOut: SyntaxDiagnostic[]
): number {
  let duplicateCount = 0;
  const scopeStack: Array<{ type: 'object' | 'array'; keys: Map<string, number>; expectingKey: boolean }> = [];
  let inString = false;
  let escapeNext = false;
  let currentString = '';
  let stringStartLine = 1;
  let lineNum = 1;

  for (let i = 0; i < sanitizedJson.length; i++) {
    const ch = sanitizedJson[i];
    if (ch === '\n') {
      lineNum++;
      continue;
    }

    if (inString) {
      if (escapeNext) {
        currentString += ch;
        escapeNext = false;
      } else if (ch === '\\') {
        escapeNext = true;
      } else if (ch === '"') {
        inString = false;
        // Look ahead for ':' if inside an object expecting a key
        const top = scopeStack[scopeStack.length - 1];
        if (top && top.type === 'object' && top.expectingKey) {
          let j = i + 1;
          while (j < sanitizedJson.length && /\s/.test(sanitizedJson[j])) j++;
          if (sanitizedJson[j] === ':') {
            const prevLine = top.keys.get(currentString);
            if (prevLine !== undefined) {
              duplicateCount++;
              diagnosticsOut.push({
                id: `json-dup-key-${stringStartLine}-${currentString}`,
                severity: 'warning',
                code: 'JSON_DUPLICATE_KEY',
                message: `Duplicate JSON key '${currentString}' at line ${stringStartLine} overwrites earlier definition on line ${prevLine}.`,
                line: stringStartLine,
                column: 1,
                keyPath: `$.${currentString}`,
                snippet: rawLines[stringStartLine - 1] || '',
                suggestion: `Remove or rename the duplicate '${currentString}' property.`,
              });
            }
            top.keys.set(currentString, stringStartLine);
            top.expectingKey = false;
          }
        }
      } else {
        currentString += ch;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      currentString = '';
      stringStartLine = lineNum;
    } else if (ch === '{') {
      scopeStack.push({ type: 'object', keys: new Map(), expectingKey: true });
    } else if (ch === '[') {
      scopeStack.push({ type: 'array', keys: new Map(), expectingKey: false });
    } else if (ch === '}' || ch === ']') {
      scopeStack.pop();
    } else if (ch === ',') {
      const top = scopeStack[scopeStack.length - 1];
      if (top && top.type === 'object') {
        top.expectingKey = true;
      }
    }
  }

  return duplicateCount;
}

export function parseJsonOrJsonc(
  rawInput: string,
  bigintMode: BigIntHandlingMode,
  commentsOut: CommentMapping[] = [],
  bigIntOut: BigIntFinding[] = [],
  diagnosticsOut: SyntaxDiagnostic[] = [],
  detectDuplicates = true,
  statsOut?: { duplicateKeys: number }
): unknown {
  const lines = rawInput.split(/\r?\n/);

  // 1. Extract // and /* */ comments while preserving exact line & character offsets
  let sanitized = '';
  let inString = false;
  let escapeNext = false;
  let currentLine = 1;

  for (let i = 0; i < rawInput.length; i++) {
    const ch = rawInput[i];
    const next = rawInput[i + 1];

    if (ch === '\n') {
      currentLine++;
      sanitized += ch;
      continue;
    }

    if (inString) {
      sanitized += ch;
      if (escapeNext) {
        escapeNext = false;
      } else if (ch === '\\') {
        escapeNext = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      sanitized += ch;
      continue;
    }

    if (ch === '/' && next === '/') {
      let commentText = '';
      i += 2;
      while (i < rawInput.length && rawInput[i] !== '\n') {
        if (rawInput[i] !== '\r') commentText += rawInput[i];
        i++;
      }
      commentsOut.push({
        line: currentLine,
        keyPath: `line_${currentLine}`,
        text: commentText.trim(),
      });
      if (i < rawInput.length && rawInput[i] === '\n') {
        currentLine++;
        sanitized += '\n';
      }
      continue;
    }

    if (ch === '/' && next === '*') {
      const startCommentLine = currentLine;
      let commentText = '';
      i += 2;
      while (i < rawInput.length && !(rawInput[i] === '*' && rawInput[i + 1] === '/')) {
        if (rawInput[i] === '\n') {
          currentLine++;
          sanitized += '\n';
        }
        commentText += rawInput[i];
        i++;
      }
      i++;
      commentsOut.push({
        line: startCommentLine,
        keyPath: `line_${startCommentLine}`,
        text: commentText.replace(/\s+/g, ' ').trim(),
      });
      continue;
    }

    sanitized += ch;
  }

  // 2. Strip trailing commas before } or ] (JSONC tolerance with warning)
  sanitized = sanitized.replace(/,(\s*[}\]])/g, (_match, closing: string, offset: number) => {
    const lineNum = sanitized.slice(0, offset).split(/\r?\n/).length;
    diagnosticsOut.push({
      id: `jsonc-trailing-comma-${lineNum}`,
      severity: 'warning',
      code: 'JSONC_TRAILING_COMMA',
      message: `Trailing comma before '${closing.trim()}' is valid in JSONC but invalid in strict RFC 8259 JSON.`,
      line: lineNum,
      column: 1,
      keyPath: '$',
      snippet: lines[lineNum - 1] || '',
      suggestion: 'Remove the trailing comma for strict JSON parsers.',
    });
    return closing;
  });

  if (detectDuplicates) {
    const dupes = scanJsonDuplicateKeys(sanitized, lines, diagnosticsOut);
    if (statsOut) statsOut.duplicateKeys += dupes;
  }

  // 3. Protect 64-bit integers (> Number.MAX_SAFE_INTEGER) before JSON.parse
  let tokenProtected = '';
  inString = false;
  escapeNext = false;
  let idx = 0;

  while (idx < sanitized.length) {
    const ch = sanitized[idx];
    if (inString) {
      tokenProtected += ch;
      if (escapeNext) {
        escapeNext = false;
      } else if (ch === '\\') {
        escapeNext = true;
      } else if (ch === '"') {
        inString = false;
      }
      idx++;
      continue;
    }

    if (ch === '"') {
      inString = true;
      tokenProtected += ch;
      idx++;
      continue;
    }

    if (ch === '-' || (ch >= '0' && ch <= '9')) {
      const numMatch = sanitized.slice(idx).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);
      if (numMatch) {
        const rawNum = numMatch[0];
        const isPureInt = /^-?\d+$/.test(rawNum);
        if (isPureInt && rawNum.replace(/^-/, '').length >= 16) {
          try {
            const big = BigInt(rawNum);
            if (
              big > BigInt(Number.MAX_SAFE_INTEGER) ||
              big < BigInt(Number.MIN_SAFE_INTEGER)
            ) {
              const lineNum = sanitized.slice(0, idx).split(/\r?\n/).length;
              bigIntOut.push({
                line: lineNum,
                keyPath: `line_${lineNum}`,
                exactDigits: rawNum,
                truncatedFloat: String(Number(rawNum)),
              });
              if (bigintMode === 'string_preserve') {
                tokenProtected += `"${rawNum}"`;
              } else if (bigintMode === 'exact_number') {
                tokenProtected += `"${BIGINT_RAW_PREFIX}${rawNum}"`;
              } else {
                tokenProtected += rawNum;
              }
              idx += rawNum.length;
              continue;
            }
          } catch {
            // Fall through
          }
        }
        tokenProtected += rawNum;
        idx += rawNum.length;
        continue;
      }
    }

    tokenProtected += ch;
    idx++;
  }

  // Check if input is multi-line NDJSON (JSON Lines) where each non-empty line is a JSON object
  const nonEmptyLines = tokenProtected
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (
    nonEmptyLines.length > 1 &&
    nonEmptyLines.every((l) => l.startsWith('{') && l.endsWith('}'))
  ) {
    try {
      return nonEmptyLines.map((l) => JSON.parse(l));
    } catch {
      // Fall through to standard JSON.parse for exact error reporting
    }
  }

  try {
    return JSON.parse(tokenProtected);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const posMatch = msg.match(/position\s+(\d+)/i);
    let line = 1;
    let col = 1;
    if (posMatch) {
      const pos = Number(posMatch[1]);
      const upTo = tokenProtected.slice(0, pos);
      const splitLines = upTo.split(/\r?\n/);
      line = splitLines.length;
      col = (splitLines[splitLines.length - 1] || '').length + 1;
    }
    diagnosticsOut.push({
      id: `json-syntax-err-${line}`,
      severity: 'error',
      code: 'JSON_SYNTAX_ERROR',
      message: `JSON Syntax Error: ${msg}`,
      line,
      column: col,
      keyPath: '$',
      snippet: lines[line - 1] || '',
      suggestion: 'Check for missing quotes around keys, missing commas, or unclosed brackets.',
    });
    throw err;
  }
}

// ============================================================================
// 4. YAML 1.2 & 1.1 SCALAR PARSER WITH NORWAY-TRAP & 64-BIT BIGINT DETECTION
// ============================================================================

function unescapeDoubleQuotedYaml(inner: string): string {
  return inner.replace(
    /\\(?:([nrtbfv0\\"/' ])|x([0-9a-fA-F]{2})|u([0-9a-fA-F]{4})|U([0-9a-fA-F]{8}))/g,
    (full, single?: string, hex2?: string, hex4?: string, hex8?: string) => {
      if (single !== undefined) {
        switch (single) {
          case 'n':
            return '\n';
          case 'r':
            return '\r';
          case 't':
            return '\t';
          case 'b':
            return '\b';
          case 'f':
            return '\f';
          case 'v':
            return '\v';
          case '0':
            return '\0';
          case '\\':
            return '\\';
          case '"':
            return '"';
          case '/':
            return '/';
          case "'":
            return "'";
          case ' ':
            return ' ';
        }
      }
      if (hex2) return String.fromCharCode(parseInt(hex2, 16));
      if (hex4) return String.fromCharCode(parseInt(hex4, 16));
      if (hex8) return String.fromCodePoint(parseInt(hex8, 16));
      return full;
    }
  );
}

export function parseYamlScalar(
  rawScalar: string,
  lineNum: number,
  colNum: number,
  keyPath: string,
  options: YamlJsonConversionOptions,
  norwayTrapsOut: NorwayTrapFinding[],
  bigIntOut: BigIntFinding[],
  aliasResolver?: (aliasName: string, lineNum: number, colNum: number, keyPath: string) => unknown
): unknown {
  let token = rawScalar.trim();

  // Check for alias reference (`*aliasName`) inside scalar or flow collection
  if (token.startsWith('*') && token.length > 1 && aliasResolver) {
    return aliasResolver(token.slice(1).trim(), lineNum, colNum, keyPath);
  }

  let explicitTag = '';
  const tagMatch = token.match(/^!!(str|int|float|bool|null)\s+(.*)$/i);
  if (tagMatch) {
    explicitTag = tagMatch[1].toLowerCase();
    token = tagMatch[2].trim();
  }

  if (explicitTag === 'null') {
    return null;
  }

  // 1. Double-quoted string
  if (token.startsWith('"') && token.endsWith('"') && token.length >= 2) {
    const unescaped = unescapeDoubleQuotedYaml(token.slice(1, -1));
    if (explicitTag === 'int') return parseInt(unescaped, 10);
    if (explicitTag === 'float') return parseFloat(unescaped);
    if (explicitTag === 'bool') return unescaped.toLowerCase() === 'true';
    return unescaped;
  }

  // 2. Single-quoted string ('' escapes to ')
  if (token.startsWith("'") && token.endsWith("'") && token.length >= 2) {
    const unescaped = token.slice(1, -1).replace(/''/g, "'");
    if (explicitTag === 'int') return parseInt(unescaped, 10);
    if (explicitTag === 'float') return parseFloat(unescaped);
    if (explicitTag === 'bool') return unescaped.toLowerCase() === 'true';
    return unescaped;
  }

  if (explicitTag === 'str') {
    return token;
  }

  // 3. Empty or Null literals
  if (token === '' || YAML_NULL_LITERALS.has(token)) {
    return null;
  }

  // 4. YAML 1.2 Standard Booleans
  if (YAML_12_TRUE_LITERALS.has(token)) {
    return true;
  }
  if (YAML_12_FALSE_LITERALS.has(token)) {
    return false;
  }

  // 5. YAML 1.1 Norway Trap Booleans (yes, no, NO, on, off, y, n)
  if (YAML_11_TRUE_LITERALS.has(token) || YAML_11_FALSE_LITERALS.has(token)) {
    const boolVal = YAML_11_TRUE_LITERALS.has(token);
    norwayTrapsOut.push({
      id: `norway-bool-${lineNum}-${keyPath}`,
      line: lineNum,
      column: colNum,
      keyPath,
      rawToken: token,
      yaml12Type: 'string',
      yaml12Value: `"${token}"`,
      yaml11Type: 'boolean',
      yaml11Value: String(boolVal),
      reason: `Unquoted '${token}' is a string in YAML 1.2 but coerces to boolean ${boolVal} in YAML 1.1 ("The Norway Problem").`,
    });
    return options.yamlSpec === '1.1' ? boolVal : token;
  }

  // 6. YAML 1.1 Legacy Octal (0755) vs YAML 1.2 Explicit Octal (0o755)
  if (/^0o[0-7]+$/i.test(token)) {
    return parseInt(token.slice(2), 8);
  }
  if (/^0[0-7]{2,6}$/.test(token)) {
    const octalVal = parseInt(token.slice(1), 8);
    const decVal = parseInt(token, 10);
    norwayTrapsOut.push({
      id: `norway-octal-${lineNum}-${keyPath}`,
      line: lineNum,
      column: colNum,
      keyPath,
      rawToken: token,
      yaml12Type: 'number (decimal)',
      yaml12Value: String(decVal),
      yaml11Type: 'number (octal)',
      yaml11Value: String(octalVal),
      reason: `Leading-zero number '${token}' is decimal ${decVal} in YAML 1.2 (use 0o${token.slice(1)} for octal) but octal ${octalVal} in YAML 1.1.`,
    });
    return options.yamlSpec === '1.1' ? octalVal : decVal;
  }

  // 7. YAML 1.1 Sexagesimal Base-60 Numbers (e.g., 22:22 or 1:30:00 port/time trap)
  if (/^[0-9]{1,5}(?::[0-9]{1,5})+$/.test(token)) {
    const parts = token.split(':').map(Number);
    let base60 = 0;
    for (const p of parts) {
      base60 = base60 * 60 + p;
    }
    norwayTrapsOut.push({
      id: `norway-sexagesimal-${lineNum}-${keyPath}`,
      line: lineNum,
      column: colNum,
      keyPath,
      rawToken: token,
      yaml12Type: 'string',
      yaml12Value: `"${token}"`,
      yaml11Type: 'number (base-60)',
      yaml11Value: String(base60),
      reason: `Unquoted colon value '${token}' (e.g. Docker port or time) is string "${token}" in YAML 1.2 but base-60 integer ${base60} in YAML 1.1.`,
    });
    return options.yamlSpec === '1.1' ? base60 : token;
  }

  // 8. Hexadecimal Integers (0x1A)
  if (/^0x[0-9a-fA-F]+$/.test(token)) {
    return parseInt(token.slice(2), 16);
  }

  // 9. Special IEEE-754 Floats (.inf, -.inf, .nan)
  if (/^[+-]?\.inf$/i.test(token)) {
    return null;
  }
  if (/^\.nan$/i.test(token)) {
    return null;
  }

  // 10. Standard Integers (with 64-bit BigInt protection)
  if (/^-?(?:0|[1-9]\d*)$/.test(token)) {
    if (token.replace(/^-/, '').length >= 16) {
      try {
        const big = BigInt(token);
        if (
          big > BigInt(Number.MAX_SAFE_INTEGER) ||
          big < BigInt(Number.MIN_SAFE_INTEGER)
        ) {
          bigIntOut.push({
            line: lineNum,
            keyPath,
            exactDigits: token,
            truncatedFloat: String(Number(token)),
          });
          if (options.bigintMode === 'string_preserve') {
            return token;
          }
          if (options.bigintMode === 'exact_number') {
            return `${BIGINT_RAW_PREFIX}${token}`;
          }
          return Number(token);
        }
      } catch {
        // Fall through
      }
    }
    return parseInt(token, 10);
  }

  // 11. Floating-Point Numbers
  if (
    /^-?(?:0|[1-9]\d*)\.\d+(?:[eE][+-]?\d+)?$/.test(token) ||
    /^-?\d+[eE][+-]?\d+$/.test(token)
  ) {
    return parseFloat(token);
  }

  // 12. Inline Flow Array `[a, b, c]` or Flow Object `{ k: v }`
  if (
    (token.startsWith('[') && token.endsWith(']')) ||
    (token.startsWith('{') && token.endsWith('}'))
  ) {
    return parseYamlFlowCollection(
      token,
      lineNum,
      colNum,
      keyPath,
      options,
      norwayTrapsOut,
      bigIntOut,
      aliasResolver
    );
  }

  return token;
}

// ============================================================================
// 5. FLOW COLLECTION PARSER (`[1, 2, { a: b }]` & `{ x: 1, y: [2, 3] }`)
// ============================================================================

function splitTopLevelFlowItems(inner: string): string[] {
  const items: string[] = [];
  let current = '';
  let depthBracket = 0;
  let depthBrace = 0;
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (inSingle) {
      current += ch;
      if (ch === "'" && inner[i + 1] === "'") {
        current += "'";
        i++;
      } else if (ch === "'") {
        inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      current += ch;
      if (ch === '\\' && i + 1 < inner.length) {
        current += inner[++i];
      } else if (ch === '"') {
        inDouble = false;
      }
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      current += ch;
    } else if (ch === '"') {
      inDouble = true;
      current += ch;
    } else if (ch === '[') {
      depthBracket++;
      current += ch;
    } else if (ch === ']') {
      depthBracket--;
      current += ch;
    } else if (ch === '{') {
      depthBrace++;
      current += ch;
    } else if (ch === '}') {
      depthBrace--;
      current += ch;
    } else if (ch === ',' && depthBracket === 0 && depthBrace === 0) {
      items.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) {
    items.push(current.trim());
  }
  return items;
}

function parseYamlFlowCollection(
  flowStr: string,
  lineNum: number,
  colNum: number,
  keyPath: string,
  options: YamlJsonConversionOptions,
  norwayTrapsOut: NorwayTrapFinding[],
  bigIntOut: BigIntFinding[],
  aliasResolver?: (aliasName: string, lineNum: number, colNum: number, keyPath: string) => unknown
): unknown {
  const trimmed = flowStr.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    const parts = splitTopLevelFlowItems(inner);
    return parts.map((part, idx) =>
      parseYamlScalar(
        part,
        lineNum,
        colNum,
        `${keyPath}[${idx}]`,
        options,
        norwayTrapsOut,
        bigIntOut,
        aliasResolver
      )
    );
  }

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return {};
    const parts = splitTopLevelFlowItems(inner);
    const obj: Record<string, unknown> = {};
    for (const part of parts) {
      const colonIdx = findUnquotedColonIndex(part);
      if (colonIdx === -1) {
        obj[part] = null;
      } else {
        const rawK = part.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, '');
        const rawV = part.slice(colonIdx + 1).trim();
        obj[rawK] = parseYamlScalar(
          rawV,
          lineNum,
          colNum,
          `${keyPath}.${rawK}`,
          options,
          norwayTrapsOut,
          bigIntOut,
          aliasResolver
        );
      }
    }
    return obj;
  }

  return trimmed;
}

// ============================================================================
// 6. LINE-BY-LINE YAML TOKENIZER, COMMENT STRIPPER & COLON SPLITTER
// ============================================================================

export function stripInlineYamlComment(line: string): {
  codePart: string;
  commentText: string | null;
} {
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inSingle) {
      if (ch === "'" && line[i + 1] === "'") {
        i++;
      } else if (ch === "'") {
        inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      if (ch === '\\') {
        i++;
      } else if (ch === '"') {
        inDouble = false;
      }
      continue;
    }

    if (ch === "'") {
      inSingle = true;
    } else if (ch === '"') {
      inDouble = true;
    } else if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))) {
      return {
        codePart: line.slice(0, i).replace(/\s+$/, ''),
        commentText: line.slice(i + 1).trim(),
      };
    }
  }

  return { codePart: line.replace(/\s+$/, ''), commentText: null };
}

export function findUnquotedColonIndex(str: string): number {
  let inSingle = false;
  let inDouble = false;
  let depthBracket = 0;
  let depthBrace = 0;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (inSingle) {
      if (ch === "'" && str[i + 1] === "'") {
        i++;
      } else if (ch === "'") {
        inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      if (ch === '\\') {
        i++;
      } else if (ch === '"') {
        inDouble = false;
      }
      continue;
    }

    if (ch === "'") inSingle = true;
    else if (ch === '"') inDouble = true;
    else if (ch === '[') depthBracket++;
    else if (ch === ']') depthBracket = Math.max(0, depthBracket - 1);
    else if (ch === '{') depthBrace++;
    else if (ch === '}') depthBrace = Math.max(0, depthBrace - 1);
    else if (
      ch === ':' &&
      depthBracket === 0 &&
      depthBrace === 0 &&
      (i === str.length - 1 ||
        /\s/.test(str[i + 1]) ||
        (i > 0 && (str[i - 1] === '"' || str[i - 1] === "'")))
    ) {
      return i;
    }
  }

  return -1;
}

interface ParsedYamlLine {
  lineNumber: number; // 1-indexed
  rawLine: string;
  indent: number;
  trimmed: string;
}

function cloneYamlNode(val: unknown): unknown {
  if (val === null || typeof val !== 'object') return val;
  if (Array.isArray(val)) return val.map(cloneYamlNode);
  const copy: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    copy[k] = cloneYamlNode(v);
  }
  return copy;
}

// ============================================================================
// 7. FULL RECURSIVE BLOCK & STREAM YAML PARSER (ANCHORS, MERGE KEYS, BLOCK SCALARS)
// ============================================================================

export function parseYamlStream(
  rawYaml: string,
  options: YamlJsonConversionOptions,
  diagnosticsOut: SyntaxDiagnostic[],
  norwayTrapsOut: NorwayTrapFinding[],
  bigIntOut: BigIntFinding[],
  commentsOut: CommentMapping[],
  statsOut: {
    anchorsDefined: number;
    aliasesResolved: number;
    mergeKeysResolved: number;
    duplicateKeys: number;
  }
): unknown[] {
  const allRawLines = rawYaml.split(/\r?\n/);

  // 1. Check for illegal tab indentation and split into multi-document streams (`---` / `...`)
  const docLineGroups: ParsedYamlLine[][] = [[]];
  let inBlockScalar = false;
  let blockScalarBaseIndent = -1;

  for (let idx = 0; idx < allRawLines.length; idx++) {
    const rawLine = allRawLines[idx];
    const lineNum = idx + 1;

    const leadingWhitespace = rawLine.match(/^[ \t]+/)?.[0] || '';
    if (leadingWhitespace.includes('\t')) {
      const firstTabCol = leadingWhitespace.indexOf('\t') + 1;
      if (!inBlockScalar) {
        diagnosticsOut.push({
          id: `yaml-tab-indent-${lineNum}`,
          severity: 'error',
          code: 'YAML_TAB_INDENTATION',
          message: `YAML forbids Tab characters (\\t) for indentation (found at line ${lineNum}, column ${firstTabCol}).`,
          line: lineNum,
          column: firstTabCol,
          keyPath: '$',
          snippet: rawLine.replace(/\t/g, '→   '),
          suggestion: 'Replace leading Tab characters with spaces (2 or 4 spaces).',
        });
      }
    }

    const spaceNormalized = rawLine.replace(/^\t+/, (m) => '  '.repeat(m.length));
    const indent = spaceNormalized.match(/^ */)?.[0].length ?? 0;
    const trimmedRaw = spaceNormalized.trim();

    if (inBlockScalar) {
      if (trimmedRaw !== '' && indent <= blockScalarBaseIndent) {
        inBlockScalar = false;
        blockScalarBaseIndent = -1;
      } else {
        docLineGroups[docLineGroups.length - 1].push({
          lineNumber: lineNum,
          rawLine: spaceNormalized,
          indent,
          trimmed: trimmedRaw,
        });
        continue;
      }
    }

    // Document separator `---` or document end `...` at indent 0
    if (indent === 0 && /^---(?:\s+#.*|\s*)$/.test(trimmedRaw)) {
      if (docLineGroups[docLineGroups.length - 1].length > 0) {
        docLineGroups.push([]);
      }
      continue;
    }
    if (indent === 0 && /^\.\.\.(?:\s+#.*|\s*)$/.test(trimmedRaw)) {
      continue;
    }

    const { codePart, commentText } = stripInlineYamlComment(spaceNormalized);
    if (commentText) {
      commentsOut.push({
        line: lineNum,
        keyPath: `line_${lineNum}`,
        text: commentText,
      });
    }

    const cleanTrimmed = codePart.trim();
    if (!cleanTrimmed) continue;

    // Detect if line starts a block scalar (`|` or `>` with optional chomping/indent modifiers like `|-2` or `|2-`)
    if (
      /:\s*[|>](?:[-+]?\d+|\d+[-+]?|[-+])?\s*$/.test(cleanTrimmed) ||
      /^-\s*[|>](?:[-+]?\d+|\d+[-+]?|[-+])?\s*$/.test(cleanTrimmed)
    ) {
      inBlockScalar = true;
      blockScalarBaseIndent = indent;
    }

    // Validate balanced quotes on single-line tokens
    const colonPos = findUnquotedColonIndex(cleanTrimmed);
    const valPart = colonPos >= 0 ? cleanTrimmed.slice(colonPos + 1).trim() : cleanTrimmed;
    if (
      (valPart.startsWith('"') && !valPart.slice(1).includes('"')) ||
      (valPart.startsWith("'") && !valPart.slice(1).includes("'"))
    ) {
      diagnosticsOut.push({
        id: `yaml-unclosed-quote-${lineNum}`,
        severity: 'error',
        code: 'YAML_UNCLOSED_QUOTE',
        message: `Unclosed quoted string literal on line ${lineNum}.`,
        line: lineNum,
        column: indent + 1,
        keyPath: '$',
        snippet: rawLine,
        suggestion: 'Close the string with a matching quote character.',
      });
    }

    if (
      (valPart.startsWith('[') && !valPart.endsWith(']')) ||
      (valPart.startsWith('{') && !valPart.endsWith('}'))
    ) {
      diagnosticsOut.push({
        id: `yaml-unclosed-flow-${lineNum}`,
        severity: 'error',
        code: 'YAML_UNCLOSED_FLOW_COLLECTION',
        message: `Unclosed flow collection ('${valPart[0]}') on line ${lineNum}.`,
        line: lineNum,
        column: indent + 1,
        keyPath: '$',
        snippet: rawLine,
        suggestion: `Add the closing '${valPart[0] === '[' ? ']' : '}'}' bracket.`,
      });
    }

    docLineGroups[docLineGroups.length - 1].push({
      lineNumber: lineNum,
      rawLine: codePart,
      indent,
      trimmed: cleanTrimmed,
    });
  }

  const documents: unknown[] = [];
  const anchors = new Map<string, unknown>();

  for (const group of docLineGroups) {
    // Strip any empty blank lines outside block scalars
    if (group.length === 0) continue;
    let cursor = 0;

    function resolveAlias(
      aliasName: string,
      lineNum: number,
      colNum: number,
      keyPath: string
    ): unknown {
      statsOut.aliasesResolved++;
      if (statsOut.aliasesResolved > MAX_ALIAS_EXPANSIONS) {
        diagnosticsOut.push({
          id: `yaml-alias-bomb-${lineNum}`,
          severity: 'error',
          code: 'YAML_ALIAS_EXPANSION_LIMIT',
          message: `Alias expansion limit (${MAX_ALIAS_EXPANSIONS}) exceeded ("Billion Laughs" DoS protection).`,
          line: lineNum,
          column: colNum,
          keyPath,
          snippet: `*${aliasName}`,
          suggestion: 'Reduce recursive alias expansions.',
        });
        return null;
      }
      if (!anchors.has(aliasName)) {
        diagnosticsOut.push({
          id: `yaml-unknown-alias-${lineNum}-${aliasName}`,
          severity: 'error',
          code: 'YAML_UNKNOWN_ALIAS',
          message: `Undefined YAML alias '*${aliasName}' referenced at line ${lineNum}.`,
          line: lineNum,
          column: colNum,
          keyPath,
          snippet: `*${aliasName}`,
          suggestion: `Define '&${aliasName}' before referencing '*${aliasName}'.`,
        });
        return null;
      }
      return cloneYamlNode(anchors.get(aliasName));
    }

    function consumeBlockScalar(indicator: string, parentIndent: number): string {
      const isFolded = indicator.startsWith('>');
      const isStrip = indicator.includes('-');
      const isKeep = indicator.includes('+');
      const explicitIndentMatch = indicator.match(/[1-9]/);
      const explicitIndent = explicitIndentMatch
        ? parentIndent + Number(explicitIndentMatch[0])
        : -1;

      const scalarLines: string[] = [];
      let contentIndent = explicitIndent;

      while (cursor < group.length) {
        const nextLine = group[cursor];
        if (nextLine.trimmed === '') {
          scalarLines.push('');
          cursor++;
          continue;
        }
        if (nextLine.indent <= parentIndent) {
          break;
        }
        if (contentIndent === -1) {
          contentIndent = nextLine.indent;
        }
        scalarLines.push(nextLine.rawLine.slice(Math.min(contentIndent, nextLine.indent)));
        cursor++;
      }

      // If trailing blank lines were accumulated before a sibling key and chomping is not keep (+), trim trailing empty entries
      if (!isKeep) {
        while (scalarLines.length > 0 && scalarLines[scalarLines.length - 1] === '') {
          scalarLines.pop();
        }
      }

      let joined = isFolded
        ? scalarLines
          .reduce((acc: string[], curr) => {
            if (curr === '') {
              acc.push('\n');
            } else if (acc.length > 0 && acc[acc.length - 1] !== '\n') {
              acc[acc.length - 1] = `${acc[acc.length - 1]} ${curr}`;
            } else {
              acc.push(curr);
            }
            return acc;
          }, [])
          .join('')
        : scalarLines.join('\n');

      if (isStrip) {
        joined = joined.replace(/\n+$/, '');
      } else if (!isKeep) {
        joined = `${joined.replace(/\n+$/, '')}\n`;
      }
      return joined;
    }

    function parseBlock(minIndent: number, keyPath: string): unknown {
      while (cursor < group.length && group[cursor].trimmed === '') {
        cursor++;
      }
      if (cursor >= group.length) return null;
      const firstLine = group[cursor];
      if (firstLine.indent < minIndent) return null;

      // Single-line flow root (`{...}` or `[...]`)
      if (
        cursor === 0 &&
        group.length === 1 &&
        ((firstLine.trimmed.startsWith('{') && firstLine.trimmed.endsWith('}')) ||
          (firstLine.trimmed.startsWith('[') && firstLine.trimmed.endsWith(']')))
      ) {
        cursor++;
        return parseYamlFlowCollection(
          firstLine.trimmed,
          firstLine.lineNumber,
          firstLine.indent + 1,
          keyPath,
          options,
          norwayTrapsOut,
          bigIntOut,
          resolveAlias
        );
      }

      // Case A: Block Sequence (`- ...`)
      if (
        firstLine.trimmed === '-' ||
        firstLine.trimmed.startsWith('- ')
      ) {
        const seqIndent = firstLine.indent;
        const arr: unknown[] = [];

        while (cursor < group.length) {
          while (cursor < group.length && group[cursor].trimmed === '') {
            cursor++;
          }
          if (cursor >= group.length) break;
          const line = group[cursor];
          if (line.indent < seqIndent) break;
          if (
            line.indent !== seqIndent ||
            !(line.trimmed === '-' || line.trimmed.startsWith('- '))
          ) {
            break;
          }

          const itemIndex = arr.length;
          const itemPath = `${keyPath}[${itemIndex}]`;
          const afterDash = line.trimmed.slice(1).trim();
          cursor++;

          let itemAnchor = '';
          let restAfterAnchor = afterDash;
          const anchorMatch = restAfterAnchor.match(/^&([A-Za-z0-9_-]+)\s*(.*)$/);
          if (anchorMatch) {
            itemAnchor = anchorMatch[1];
            restAfterAnchor = anchorMatch[2].trim();
            statsOut.anchorsDefined++;
          }

          // 1. Empty after `-`: nested block on following lines
          if (!restAfterAnchor) {
            const nestedVal =
              cursor < group.length && group[cursor].indent > seqIndent
                ? parseBlock(group[cursor].indent, itemPath)
                : null;
            if (itemAnchor) anchors.set(itemAnchor, cloneYamlNode(nestedVal));
            arr.push(nestedVal);
            continue;
          }

          // 2. Block scalar on sequence item (`- |` or `- >`)
          if (/^[|>](?:[-+]?\d+|\d+[-+]?|[-+])?$/.test(restAfterAnchor)) {
            const scalarText = consumeBlockScalar(restAfterAnchor, seqIndent);
            if (itemAnchor) anchors.set(itemAnchor, scalarText);
            arr.push(scalarText);
            continue;
          }

          // 3. Alias reference (`- *aliasName`)
          if (restAfterAnchor.startsWith('*')) {
            const aliasName = restAfterAnchor.slice(1).trim();
            const resolved = resolveAlias(aliasName, line.lineNumber, line.indent + 1, itemPath);
            arr.push(resolved);
            continue;
          }

          // 4. Compact in-line mapping inside sequence (`- name: web` followed by indented keys)
          const colonIdx = findUnquotedColonIndex(restAfterAnchor);
          if (colonIdx !== -1) {
            const kRaw = restAfterAnchor.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, '');
            const vRaw = restAfterAnchor.slice(colonIdx + 1).trim();
            const itemObj: Record<string, unknown> = {};

            let propAnchor = '';
            let cleanVRaw = vRaw;
            const propAnchorMatch = cleanVRaw.match(/^&([A-Za-z0-9_-]+)\s*(.*)$/);
            if (propAnchorMatch) {
              propAnchor = propAnchorMatch[1];
              cleanVRaw = propAnchorMatch[2].trim();
              statsOut.anchorsDefined++;
            }

            if (!cleanVRaw) {
              if (
                cursor < group.length &&
                (group[cursor].indent > seqIndent + 2 ||
                  (group[cursor].indent >= seqIndent + 2 &&
                    (group[cursor].trimmed === '-' || group[cursor].trimmed.startsWith('- '))))
              ) {
                itemObj[kRaw] = parseBlock(group[cursor].indent, `${itemPath}.${kRaw}`);
              } else {
                itemObj[kRaw] = null;
              }
            } else if (/^[|>](?:[-+]?\d+|\d+[-+]?|[-+])?$/.test(cleanVRaw)) {
              itemObj[kRaw] = consumeBlockScalar(cleanVRaw, seqIndent + 2);
            } else if (cleanVRaw.startsWith('*')) {
              itemObj[kRaw] = resolveAlias(
                cleanVRaw.slice(1).trim(),
                line.lineNumber,
                line.indent + 1,
                `${itemPath}.${kRaw}`
              );
            } else {
              itemObj[kRaw] = parseYamlScalar(
                cleanVRaw,
                line.lineNumber,
                line.indent + 3,
                `${itemPath}.${kRaw}`,
                options,
                norwayTrapsOut,
                bigIntOut,
                resolveAlias
              );
            }
            if (propAnchor) {
              anchors.set(propAnchor, cloneYamlNode(itemObj[kRaw]));
            }

            if (cursor < group.length && group[cursor].indent > seqIndent) {
              const extraProps = parseBlock(group[cursor].indent, itemPath);
              if (extraProps && typeof extraProps === 'object' && !Array.isArray(extraProps)) {
                Object.assign(itemObj, extraProps);
              }
            }

            if (itemAnchor) anchors.set(itemAnchor, cloneYamlNode(itemObj));
            arr.push(itemObj);
            continue;
          }

          // 5. Plain scalar item (`- value`)
          const val = parseYamlScalar(
            restAfterAnchor,
            line.lineNumber,
            line.indent + 3,
            itemPath,
            options,
            norwayTrapsOut,
            bigIntOut,
            resolveAlias
          );
          if (itemAnchor) anchors.set(itemAnchor, cloneYamlNode(val));
          arr.push(val);
        }

        return arr;
      }

      // Case B: Block Mapping (`key: value`)
      const mapIndent = firstLine.indent;
      const obj: Record<string, unknown> = {};
      const seenKeysInMap = new Map<string, number>();

      while (cursor < group.length) {
        while (cursor < group.length && group[cursor].trimmed === '') {
          cursor++;
        }
        if (cursor >= group.length) break;
        const line = group[cursor];
        if (line.indent < mapIndent) break;
        if (line.indent > mapIndent) {
          diagnosticsOut.push({
            id: `yaml-bad-indent-${line.lineNumber}`,
            severity: 'error',
            code: 'YAML_UNEXPECTED_INDENTATION',
            message: `Unexpected indentation level (${line.indent} spaces, expected ${mapIndent}) at line ${line.lineNumber}.`,
            line: line.lineNumber,
            column: line.indent + 1,
            keyPath,
            snippet: line.rawLine,
            suggestion: `Align this line with its sibling keys at ${mapIndent} spaces.`,
          });
          cursor++;
          continue;
        }
        if (line.trimmed === '-' || line.trimmed.startsWith('- ')) {
          break;
        }

        const colonIdx = findUnquotedColonIndex(line.trimmed);
        if (colonIdx === -1) {
          diagnosticsOut.push({
            id: `yaml-missing-colon-${line.lineNumber}`,
            severity: 'error',
            code: 'YAML_MISSING_COLON',
            message: `Expected 'key: value' mapping entry at line ${line.lineNumber}, but no colon separator was found.`,
            line: line.lineNumber,
            column: line.indent + 1,
            keyPath,
            snippet: line.rawLine,
            suggestion: 'Add a colon and space (": ") after the key name.',
          });
          cursor++;
          continue;
        }

        const rawKey = line.trimmed.slice(0, colonIdx).trim();
        const isQuotedKey =
          (rawKey.startsWith('"') && rawKey.endsWith('"')) ||
          (rawKey.startsWith("'") && rawKey.endsWith("'"));
        const cleanKey = rawKey.replace(/^['"]|['"]$/g, '');
        let effectiveKey = cleanKey;
        let rawVal = line.trimmed.slice(colonIdx + 1).trim();
        const propPath = keyPath === '$' ? `$.${cleanKey}` : `${keyPath}.${cleanKey}`;

        // Detect Norway Trap on unquoted mapping keys (e.g. GitHub Actions `on:`)
        if (
          !isQuotedKey &&
          (YAML_11_TRUE_LITERALS.has(cleanKey) || YAML_11_FALSE_LITERALS.has(cleanKey))
        ) {
          const boolKey = String(YAML_11_TRUE_LITERALS.has(cleanKey));
          norwayTrapsOut.push({
            id: `norway-key-${line.lineNumber}-${cleanKey}`,
            line: line.lineNumber,
            column: line.indent + 1,
            keyPath: propPath,
            rawToken: `${cleanKey}:`,
            yaml12Type: 'string key',
            yaml12Value: `"${cleanKey}"`,
            yaml11Type: 'boolean key',
            yaml11Value: boolKey,
            reason: `Unquoted mapping key '${cleanKey}:' is string key "${cleanKey}" in YAML 1.2 but coerces to boolean key "${boolKey}" in YAML 1.1.`,
          });
          if (options.yamlSpec === '1.1') {
            effectiveKey = boolKey;
          }
        }

        // Duplicate key check within same mapping
        if (options.detectDuplicateKeys && cleanKey !== '<<') {
          const prevLine = seenKeysInMap.get(cleanKey);
          if (prevLine !== undefined) {
            statsOut.duplicateKeys++;
            diagnosticsOut.push({
              id: `yaml-dup-key-${line.lineNumber}-${cleanKey}`,
              severity: 'warning',
              code: 'YAML_DUPLICATE_KEY',
              message: `Duplicate key '${cleanKey}' at line ${line.lineNumber} overwrites earlier definition on line ${prevLine}.`,
              line: line.lineNumber,
              column: line.indent + 1,
              keyPath: propPath,
              snippet: line.rawLine,
              suggestion: `Rename or merge the duplicate '${cleanKey}' key.`,
            });
          }
          seenKeysInMap.set(cleanKey, line.lineNumber);
        }

        cursor++;

        let anchorName = '';
        const anchorMatch = rawVal.match(/^&([A-Za-z0-9_-]+)\s*(.*)$/);
        if (anchorMatch) {
          anchorName = anchorMatch[1];
          rawVal = anchorMatch[2].trim();
          statsOut.anchorsDefined++;
        }

        let resolvedValue: unknown;

        if (!rawVal) {
          while (cursor < group.length && group[cursor].trimmed === '') {
            cursor++;
          }
          if (
            cursor < group.length &&
            (group[cursor].indent > mapIndent ||
              (group[cursor].indent === mapIndent &&
                (group[cursor].trimmed === '-' || group[cursor].trimmed.startsWith('- '))))
          ) {
            resolvedValue = parseBlock(group[cursor].indent, propPath);
          } else {
            resolvedValue = null;
          }
        } else if (/^[|>](?:[-+]?\d+|\d+[-+]?|[-+])?$/.test(rawVal)) {
          resolvedValue = consumeBlockScalar(rawVal, mapIndent);
        } else if (rawVal.startsWith('*')) {
          const aliasName = rawVal.slice(1).trim();
          resolvedValue = resolveAlias(aliasName, line.lineNumber, line.indent + 1, propPath);
        } else {
          resolvedValue = parseYamlScalar(
            rawVal,
            line.lineNumber,
            line.indent + colonIdx + 2,
            propPath,
            options,
            norwayTrapsOut,
            bigIntOut,
            resolveAlias
          );
        }

        if (anchorName) {
          anchors.set(anchorName, cloneYamlNode(resolvedValue));
        }

        // Handle YAML `<<` Merge Key
        if (cleanKey === '<<' && options.resolveMergeKeys) {
          statsOut.mergeKeysResolved++;
          if (Array.isArray(resolvedValue)) {
            for (const item of resolvedValue) {
              let sourceObj = item;
              if (typeof item === 'string' && item.startsWith('*')) {
                sourceObj = resolveAlias(
                  item.slice(1),
                  line.lineNumber,
                  line.indent + 1,
                  propPath
                );
              }
              if (sourceObj && typeof sourceObj === 'object' && !Array.isArray(sourceObj)) {
                for (const [mk, mv] of Object.entries(sourceObj as Record<string, unknown>)) {
                  if (!(mk in obj)) {
                    obj[mk] = cloneYamlNode(mv);
                  }
                }
              }
            }
          } else if (
            resolvedValue &&
            typeof resolvedValue === 'object' &&
            !Array.isArray(resolvedValue)
          ) {
            for (const [mk, mv] of Object.entries(resolvedValue as Record<string, unknown>)) {
              if (!(mk in obj)) {
                obj[mk] = cloneYamlNode(mv);
              }
            }
          }
        } else {
          obj[effectiveKey] = resolvedValue;
        }
      }

      return obj;
    }

    const docResult = parseBlock(group[0].indent, '$');
    if (docResult !== null) {
      documents.push(docResult);
    }
  }

  return documents;
}

// ============================================================================
// 8. JSON TO YAML SERIALIZER & JSON FORMATTER (WITH BIGINT & COMMENT SUPPORT)
// ============================================================================

function sortObjectKeysDeep(val: unknown): unknown {
  if (val === null || typeof val !== 'object') return val;
  if (Array.isArray(val)) return val.map(sortObjectKeysDeep);
  const sorted: Record<string, unknown> = {};
  for (const k of Object.keys(val as Record<string, unknown>).sort((a, b) =>
    a.localeCompare(b)
  )) {
    sorted[k] = sortObjectKeysDeep((val as Record<string, unknown>)[k]);
  }
  return sorted;
}

export function formatJsonOutput(
  documents: unknown[],
  options: YamlJsonConversionOptions,
  comments: CommentMapping[]
): string {
  const processedDocs = options.sortKeys
    ? documents.map(sortObjectKeysDeep)
    : documents;

  const serializeDoc = (doc: unknown, indent: number): string => {
    const rawJson =
      indent === 0
        ? JSON.stringify(doc)
        : JSON.stringify(doc, null, indent);
    if (!rawJson) return 'null';
    return rawJson.replace(
      new RegExp(`"${BIGINT_RAW_PREFIX}(-?\\d+)"`, 'g'),
      '$1'
    );
  };

  let output = '';
  if (processedDocs.length === 0) {
    output = '{}';
  } else if (processedDocs.length === 1 || options.multiDocMode === 'first_document') {
    output = serializeDoc(processedDocs[0], options.indentSpaces);
  } else if (options.multiDocMode === 'ndjson') {
    output = processedDocs.map((d) => serializeDoc(d, 0)).join('\n');
  } else {
    output = serializeDoc(processedDocs, options.indentSpaces);
  }

  if (options.preserveCommentsAsJsonc && comments.length > 0) {
    const headerComments = comments
      .slice(0, 12)
      .map((c) => `// [Line ${c.line}] ${c.text}`)
      .join('\n');
    output = `${headerComments}\n${output}`;
  }

  return output;
}

function needsYamlQuotes(str: string, quoteStyle: YamlQuoteStyle): boolean {
  if (quoteStyle === 'single' || quoteStyle === 'double') return true;
  if (str === '') return true;
  if (
    YAML_12_TRUE_LITERALS.has(str) ||
    YAML_12_FALSE_LITERALS.has(str) ||
    YAML_11_TRUE_LITERALS.has(str) ||
    YAML_11_FALSE_LITERALS.has(str) ||
    YAML_NULL_LITERALS.has(str)
  ) {
    return true;
  }
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(str) || /^0[xXoO0-7]/.test(str)) {
    return true;
  }
  if (/^[0-9]{1,5}(?::[0-9]{1,5})+$/.test(str)) {
    return true;
  }
  if (/[:#{}[\],&*!|>'"%@`\r\n\t]/.test(str) || /^\s|\s$/.test(str) || str.startsWith('-')) {
    return true;
  }
  return false;
}

function formatYamlStringScalar(str: string, quoteStyle: YamlQuoteStyle, indentStr: string): string {
  if (str.includes('\n')) {
    const lines = str.replace(/\n$/, '').split('\n');
    return `|\n${lines.map((l) => `${indentStr}  ${l}`).join('\n')}`;
  }
  if (!needsYamlQuotes(str, quoteStyle)) {
    return str;
  }
  if (quoteStyle === 'single') {
    return `'${str.replace(/'/g, "''")}'`;
  }
  return JSON.stringify(str);
}

export function serializeToYaml(
  value: unknown,
  options: YamlJsonConversionOptions,
  comments: CommentMapping[] = []
): string {
  const step = options.indentSpaces === 4 ? 4 : 2;
  const target = options.sortKeys ? sortObjectKeysDeep(value) : value;

  function renderNode(node: unknown, depth: number): string {
    const pad = ' '.repeat(depth * step);

    if (node === null || node === undefined) return 'null';
    if (typeof node === 'boolean' || typeof node === 'number') return String(node);
    if (typeof node === 'string') {
      if (node.startsWith(BIGINT_RAW_PREFIX)) {
        return node.slice(BIGINT_RAW_PREFIX.length);
      }
      return formatYamlStringScalar(node, options.yamlQuoteStyle, pad);
    }

    if (Array.isArray(node)) {
      if (node.length === 0) return '[]';
      return node
        .map((item) => {
          if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
            const entries = Object.entries(item as Record<string, unknown>);
            if (entries.length === 0) return `${pad}- {}`;
            const [firstK, firstV] = entries[0];
            const firstKeyFormatted = needsYamlQuotes(firstK, 'minimal')
              ? JSON.stringify(firstK)
              : firstK;
            const firstLine =
              firstV !== null && typeof firstV === 'object'
                ? `${pad}- ${firstKeyFormatted}:\n${renderNode(firstV, depth + 2)}`
                : `${pad}- ${firstKeyFormatted}: ${renderNode(firstV, depth + 1)}`;

            const restLines = entries.slice(1).map(([k, v]) => {
              const kFmt = needsYamlQuotes(k, 'minimal') ? JSON.stringify(k) : k;
              const itemPad = ' '.repeat((depth + 1) * step);
              if (v !== null && typeof v === 'object') {
                const isEmptyArr = Array.isArray(v) && v.length === 0;
                const isEmptyObj =
                  !Array.isArray(v) && Object.keys(v as Record<string, unknown>).length === 0;
                if (isEmptyArr) return `${itemPad}${kFmt}: []`;
                if (isEmptyObj) return `${itemPad}${kFmt}: {}`;
                return `${itemPad}${kFmt}:\n${renderNode(v, depth + 2)}`;
              }
              return `${itemPad}${kFmt}: ${renderNode(v, depth + 1)}`;
            });

            return [firstLine, ...restLines].join('\n');
          }
          if (Array.isArray(item)) {
            return `${pad}-\n${renderNode(item, depth + 1)}`;
          }
          return `${pad}- ${renderNode(item, depth + 1)}`;
        })
        .join('\n');
    }

    const entries = Object.entries(node as Record<string, unknown>);
    if (entries.length === 0) return '{}';

    return entries
      .map(([k, v]) => {
        const kFmt = needsYamlQuotes(k, 'minimal') ? JSON.stringify(k) : k;
        if (v !== null && typeof v === 'object') {
          if (Array.isArray(v) && v.length === 0) return `${pad}${kFmt}: []`;
          if (!Array.isArray(v) && Object.keys(v as Record<string, unknown>).length === 0) {
            return `${pad}${kFmt}: {}`;
          }
          return `${pad}${kFmt}:\n${renderNode(v, depth + 1)}`;
        }
        return `${pad}${kFmt}: ${renderNode(v, depth)}`;
      })
      .join('\n');
  }

  const body = renderNode(target, 0);
  if (comments.length > 0) {
    const header = comments
      .slice(0, 12)
      .map((c) => `# ${c.text}`)
      .join('\n');
    return `${header}\n${body}`;
  }
  return body;
}

// ============================================================================
// 9. DEVOPS MANIFEST AUTO-DETECTOR & STRUCTURAL LINTER (K8S, DOCKER, GHA, OPENAPI)
// ============================================================================

export function detectAndLintDevOpsSchema(
  documents: unknown[],
  requestedSchema: DevOpsSchemaType,
  diagnosticsOut: SyntaxDiagnostic[]
): DevOpsSchemaType {
  const firstObj =
    documents[0] && typeof documents[0] === 'object' && !Array.isArray(documents[0])
      ? (documents[0] as Record<string, unknown>)
      : null;

  if (!firstObj || requestedSchema === 'none') return 'none';

  let detected: DevOpsSchemaType = requestedSchema;
  if (detected === 'auto') {
    if ('apiVersion' in firstObj && 'kind' in firstObj) {
      detected = 'kubernetes';
    } else if ('services' in firstObj && typeof firstObj.services === 'object') {
      detected = 'docker_compose';
    } else if (('on' in firstObj || 'true' in firstObj) && 'jobs' in firstObj) {
      detected = 'github_actions';
    } else if ('openapi' in firstObj || 'swagger' in firstObj) {
      detected = 'openapi';
    } else {
      detected = 'none';
    }
  }

  // 1. Kubernetes Manifest Linter
  if (detected === 'kubernetes') {
    documents.forEach((doc, idx) => {
      if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return;
      const d = doc as Record<string, unknown>;
      const docLabel = documents.length > 1 ? `Document #${idx + 1}` : 'Root';

      if (!d.apiVersion) {
        diagnosticsOut.push({
          id: `k8s-missing-apiversion-${idx}`,
          severity: 'warning',
          code: 'K8S_MISSING_APIVERSION',
          message: `${docLabel}: Kubernetes manifest is missing required 'apiVersion' field.`,
          line: 1,
          column: 1,
          keyPath: '$.apiVersion',
          snippet: 'apiVersion: apps/v1',
          suggestion: "Add 'apiVersion' (e.g., 'apps/v1' or 'v1').",
        });
      }
      if (!d.kind) {
        diagnosticsOut.push({
          id: `k8s-missing-kind-${idx}`,
          severity: 'warning',
          code: 'K8S_MISSING_KIND',
          message: `${docLabel}: Kubernetes manifest is missing required 'kind' field.`,
          line: 1,
          column: 1,
          keyPath: '$.kind',
          snippet: 'kind: Deployment',
          suggestion: "Add 'kind' (e.g., 'Deployment', 'Service', 'ConfigMap').",
        });
      }
      const meta = d.metadata as Record<string, unknown> | undefined;
      if (!meta || !meta.name) {
        diagnosticsOut.push({
          id: `k8s-missing-metadata-name-${idx}`,
          severity: 'warning',
          code: 'K8S_MISSING_METADATA_NAME',
          message: `${docLabel}: Kubernetes manifest requires 'metadata.name'.`,
          line: 1,
          column: 1,
          keyPath: '$.metadata.name',
          snippet: 'metadata:\n  name: my-service',
          suggestion: "Add 'metadata.name' to identify the Kubernetes resource.",
        });
      }

      const spec = d.spec as Record<string, unknown> | undefined;
      const podSpec =
        ((spec?.template as Record<string, unknown> | undefined)?.spec as
          | Record<string, unknown>
          | undefined) || spec;
      const containers = Array.isArray(podSpec?.containers)
        ? (podSpec.containers as Array<Record<string, unknown>>)
        : [];
      containers.forEach((c, cIdx) => {
        const img = String(c.image || '');
        if (img.endsWith(':latest') || (img && !img.includes(':'))) {
          diagnosticsOut.push({
            id: `k8s-latest-tag-${idx}-${cIdx}`,
            severity: 'warning',
            code: 'K8S_MUTABLE_IMAGE_TAG',
            message: `${docLabel}: Container '${c.name || cIdx}' uses mutable tag '${img || ':latest'}'.`,
            line: 1,
            column: 1,
            keyPath: `$.spec.containers[${cIdx}].image`,
            snippet: `image: ${img}`,
            suggestion: 'Pin container images to an immutable semantic version or SHA256 digest.',
          });
        }
        const secCtx = c.securityContext as Record<string, unknown> | undefined;
        if (secCtx && secCtx.privileged === true) {
          diagnosticsOut.push({
            id: `k8s-privileged-container-${idx}-${cIdx}`,
            severity: 'warning',
            code: 'K8S_PRIVILEGED_CONTAINER',
            message: `${docLabel}: Container '${c.name || cIdx}' runs with 'securityContext.privileged: true'.`,
            line: 1,
            column: 1,
            keyPath: `$.spec.containers[${cIdx}].securityContext.privileged`,
            snippet: 'securityContext:\n  privileged: true',
            suggestion: 'Avoid privileged containers in production; drop capabilities and runAsNonRoot instead.',
          });
        }
        if (!c.resources) {
          diagnosticsOut.push({
            id: `k8s-missing-resources-${idx}-${cIdx}`,
            severity: 'info',
            code: 'K8S_MISSING_RESOURCE_LIMITS',
            message: `${docLabel}: Container '${c.name || cIdx}' has no CPU/Memory 'resources.limits' defined.`,
            line: 1,
            column: 1,
            keyPath: `$.spec.containers[${cIdx}].resources`,
            snippet: 'resources:\n  limits:\n    memory: "256Mi"\n    cpu: "500m"',
            suggestion: 'Define CPU and memory requests/limits to prevent node OOM eviction.',
          });
        }
      });
    });
  }

  // 2. Docker Compose Linter
  if (detected === 'docker_compose') {
    if ('version' in firstObj) {
      diagnosticsOut.push({
        id: 'compose-deprecated-version',
        severity: 'info',
        code: 'COMPOSE_VERSION_OBSOLETE',
        message: "Top-level 'version' key is obsolete in Docker Compose Specification v2+.",
        line: 1,
        column: 1,
        keyPath: '$.version',
        snippet: `version: "${firstObj.version}"`,
        suggestion: "You can safely remove the top-level 'version' field in modern Docker Compose.",
      });
    }
    const services = firstObj.services as Record<string, Record<string, unknown>> | undefined;
    if (services && typeof services === 'object') {
      for (const [svcName, svcDef] of Object.entries(services)) {
        if (!svcDef || typeof svcDef !== 'object') continue;
        if (!svcDef.image && !svcDef.build) {
          diagnosticsOut.push({
            id: `compose-missing-image-${svcName}`,
            severity: 'warning',
            code: 'COMPOSE_MISSING_IMAGE_OR_BUILD',
            message: `Docker Compose service '${svcName}' must specify either 'image' or 'build'.`,
            line: 1,
            column: 1,
            keyPath: `$.services.${svcName}`,
            snippet: `${svcName}:\n  image: nginx:alpine`,
            suggestion: `Add an 'image' or 'build' property to service '${svcName}'.`,
          });
        }
      }
    }
  }

  // 3. GitHub Actions Workflow Linter
  if (detected === 'github_actions') {
    if ('true' in firstObj && !('on' in firstObj)) {
      diagnosticsOut.push({
        id: 'gha-on-boolean-trap',
        severity: 'warning',
        code: 'GHA_ON_COERCED_TO_BOOLEAN',
        message: "GitHub Actions trigger key 'on:' was coerced to boolean 'true' under YAML 1.1 rules.",
        line: 1,
        column: 1,
        keyPath: '$.on',
        snippet: 'on: [push, pull_request]',
        suggestion: "Switch to YAML 1.2 mode or quote the key as '\"on\":' to keep the key name intact.",
      });
    }
    const jobs = firstObj.jobs as Record<string, Record<string, unknown>> | undefined;
    if (jobs && typeof jobs === 'object') {
      for (const [jobId, jobDef] of Object.entries(jobs)) {
        if (!jobDef || typeof jobDef !== 'object') continue;
        if (!jobDef['runs-on']) {
          diagnosticsOut.push({
            id: `gha-missing-runs-on-${jobId}`,
            severity: 'warning',
            code: 'GHA_MISSING_RUNS_ON',
            message: `GitHub Actions job '${jobId}' is missing required 'runs-on' runner specification.`,
            line: 1,
            column: 1,
            keyPath: `$.jobs.${jobId}.runs-on`,
            snippet: 'runs-on: ubuntu-latest',
            suggestion: "Add 'runs-on: ubuntu-latest' to the job definition.",
          });
        }
      }
    }
  }

  // 4. OpenAPI 3.x Linter
  if (detected === 'openapi') {
    const info = firstObj.info as Record<string, unknown> | undefined;
    if (!info || !info.title || !info.version) {
      diagnosticsOut.push({
        id: 'openapi-missing-info',
        severity: 'warning',
        code: 'OPENAPI_MISSING_INFO',
        message: "OpenAPI specification requires 'info.title' and 'info.version'.",
        line: 1,
        column: 1,
        keyPath: '$.info',
        snippet: 'info:\n  title: API\n  version: 1.0.0',
        suggestion: "Populate both 'info.title' and 'info.version'.",
      });
    }
    if (!firstObj.paths && !firstObj.webhooks) {
      diagnosticsOut.push({
        id: 'openapi-missing-paths',
        severity: 'warning',
        code: 'OPENAPI_MISSING_PATHS',
        message: "OpenAPI document does not define a 'paths' or 'webhooks' object.",
        line: 1,
        column: 1,
        keyPath: '$.paths',
        snippet: 'paths: {}',
        suggestion: "Add a 'paths' object describing your API endpoints.",
      });
    }
  }

  return detected;
}

// ============================================================================
// 10. TREE STATS & 1-CLICK NORWAY TRAP AUTO-QUOTE FIXER (MAPPINGS & SEQUENCES)
// ============================================================================

function computeTreeStats(node: unknown, depth = 0): { keys: number; maxDepth: number } {
  if (node === null || typeof node !== 'object') {
    return { keys: 0, maxDepth: depth };
  }
  if (Array.isArray(node)) {
    let totalKeys = 0;
    let deepest = depth;
    for (const item of node) {
      const sub = computeTreeStats(item, depth + 1);
      totalKeys += sub.keys;
      if (sub.maxDepth > deepest) deepest = sub.maxDepth;
    }
    return { keys: totalKeys, maxDepth: deepest };
  }
  const entries = Object.entries(node as Record<string, unknown>);
  let totalKeys = entries.length;
  let deepest = depth + 1;
  for (const [, v] of entries) {
    const sub = computeTreeStats(v, depth + 1);
    totalKeys += sub.keys;
    if (sub.maxDepth > deepest) deepest = sub.maxDepth;
  }
  return { keys: totalKeys, maxDepth: deepest };
}

function isNorwayTrapScalar(val: string): boolean {
  return (
    YAML_11_TRUE_LITERALS.has(val) ||
    YAML_11_FALSE_LITERALS.has(val) ||
    /^0[0-7]{2,6}$/.test(val) ||
    /^[0-9]{1,5}(?::[0-9]{1,5})+$/.test(val)
  );
}

export function quoteAmbiguousScalarsInYaml(rawYaml: string): string {
  const lines = rawYaml.split(/\r?\n/);
  return lines
    .map((line) => {
      const { codePart, commentText } = stripInlineYamlComment(line);
      const commentSuffix = commentText ? ` # ${commentText}` : '';

      // Case 1: Sequence item (`  - 5432:5432` or `  - NO`)
      const seqMatch = codePart.match(/^(\s*-\s+)(.+)$/);
      if (seqMatch && findUnquotedColonIndex(seqMatch[2]) === -1) {
        const prefix = seqMatch[1];
        const itemVal = seqMatch[2].trim();
        if (isNorwayTrapScalar(itemVal)) {
          return `${prefix}"${itemVal}"${commentSuffix}`;
        }
        return line;
      }

      // Case 2: Mapping entry (`key: value` or `on:`)
      const colonIdx = findUnquotedColonIndex(codePart);
      if (colonIdx === -1) return line;

      const keyPart = codePart.slice(0, colonIdx + 1);
      const valPart = codePart.slice(colonIdx + 1).trim();

      const rawKeyTrimmed = codePart.slice(0, colonIdx).trim();
      const indentPrefix = codePart.match(/^ */)?.[0] || '';
      const fixedKeyPart =
        YAML_11_TRUE_LITERALS.has(rawKeyTrimmed) || YAML_11_FALSE_LITERALS.has(rawKeyTrimmed)
          ? `${indentPrefix}"${rawKeyTrimmed}":`
          : keyPart;

      if (!valPart) {
        return `${fixedKeyPart}${commentSuffix}`;
      }

      if (isNorwayTrapScalar(valPart)) {
        return `${fixedKeyPart} "${valPart}"${commentSuffix}`;
      }

      if (valPart.startsWith('[') && valPart.endsWith(']')) {
        const inner = valPart.slice(1, -1);
        const items = splitTopLevelFlowItems(inner).map((it) =>
          isNorwayTrapScalar(it) ? `"${it}"` : it
        );
        return `${fixedKeyPart} [${items.join(', ')}]${commentSuffix}`;
      }

      return `${fixedKeyPart} ${valPart}${commentSuffix}`;
    })
    .join('\n');
}

// ============================================================================
// 11. MAIN CONVERSION & VALIDATION PIPELINE ENTRYPOINT
// ============================================================================

export function convertAndValidateYamlJson(
  rawInput: string,
  userOptions?: Partial<YamlJsonConversionOptions>
): YamlJsonConversionResult {
  const startTime = performance.now();
  const options: YamlJsonConversionOptions = {
    ...getDefaultYamlJsonOptions(),
    ...userOptions,
  };

  const resolvedDirection =
    options.direction === 'auto_detect'
      ? detectInputFormat(rawInput)
      : options.direction;

  const diagnostics: SyntaxDiagnostic[] = [];
  const norwayTraps: NorwayTrapFinding[] = [];
  const bigIntFindings: BigIntFinding[] = [];
  const comments: CommentMapping[] = [];
  const stats = {
    anchorsDefined: 0,
    aliasesResolved: 0,
    mergeKeysResolved: 0,
    duplicateKeys: 0,
  };

  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(rawInput || '').length;
  const inputLines = rawInput ? rawInput.split(/\r?\n/).length : 0;

  if (!rawInput || !rawInput.trim()) {
    return {
      engineVersion: YAML_JSON_ENGINE_VERSION,
      resolvedDirection,
      isValid: true,
      outputText: '',
      documents: [],
      diagnostics: [],
      norwayTraps: [],
      bigIntFindings: [],
      comments: [],
      metrics: {
        inputBytes: 0,
        outputBytes: 0,
        inputLines: 0,
        outputLines: 0,
        documentCount: 0,
        totalKeysCount: 0,
        maxNestingDepth: 0,
        anchorsDefinedCount: 0,
        aliasesResolvedCount: 0,
        mergeKeysResolvedCount: 0,
        norwayTrapsCount: 0,
        bigIntCount: 0,
        duplicateKeysCount: 0,
        commentsCount: 0,
        errorsCount: 0,
        warningsCount: 0,
        detectedSchema: 'none',
        executionTimeMs: 0.1,
      },
    };
  }

  let documents: unknown[] = [];
  let outputText = '';

  if (resolvedDirection === 'yaml_to_json') {
    documents = parseYamlStream(
      rawInput,
      options,
      diagnostics,
      norwayTraps,
      bigIntFindings,
      comments,
      stats
    );

    const hasFatalError = diagnostics.some((d) => d.severity === 'error');
    if (!hasFatalError) {
      outputText = formatJsonOutput(documents, options, comments);
    }
  } else {
    try {
      const parsed = parseJsonOrJsonc(
        rawInput,
        options.bigintMode,
        comments,
        bigIntFindings,
        diagnostics,
        options.detectDuplicateKeys,
        stats
      );
      // Check if rawInput was multi-line NDJSON (2+ non-empty lines each starting with { and ending with })
      const nonEmptyJsonLines = rawInput
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('/*'));
      const isMultiLineNdjson =
        nonEmptyJsonLines.length >= 2 &&
        nonEmptyJsonLines.every((l) => l.startsWith('{') && l.endsWith('}'));

      if (isMultiLineNdjson && Array.isArray(parsed)) {
        documents = parsed;
        outputText = parsed
          .map(
            (doc, idx) =>
              `---\n${serializeToYaml(
                doc,
                options,
                idx === 0 && options.preserveCommentsAsJsonc ? comments : []
              )}`
          )
          .join('\n');
      } else {
        documents = [parsed];
        outputText = serializeToYaml(
          parsed,
          options,
          options.preserveCommentsAsJsonc ? comments : []
        );
      }
    } catch {
      outputText = '';
    }
  }

  const detectedSchema =
    documents.length > 0
      ? detectAndLintDevOpsSchema(documents, options.devOpsSchema, diagnostics)
      : 'none';

  let totalKeysCount = 0;
  let maxNestingDepth = 0;
  for (const doc of documents) {
    const tStats = computeTreeStats(doc, 0);
    totalKeysCount += tStats.keys;
    if (tStats.maxDepth > maxNestingDepth) maxNestingDepth = tStats.maxDepth;
  }

  const errorsCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningsCount = diagnostics.filter((d) => d.severity === 'warning').length;
  const outputBytes = encoder.encode(outputText).length;
  const outputLines = outputText ? outputText.split(/\r?\n/).length : 0;

  return {
    engineVersion: YAML_JSON_ENGINE_VERSION,
    resolvedDirection,
    isValid: errorsCount === 0,
    outputText,
    documents,
    diagnostics,
    norwayTraps,
    bigIntFindings,
    comments,
    metrics: {
      inputBytes,
      outputBytes,
      inputLines,
      outputLines,
      documentCount: documents.length,
      totalKeysCount,
      maxNestingDepth,
      anchorsDefinedCount: stats.anchorsDefined,
      aliasesResolvedCount: stats.aliasesResolved,
      mergeKeysResolvedCount: stats.mergeKeysResolved,
      norwayTrapsCount: norwayTraps.length,
      bigIntCount: bigIntFindings.length,
      duplicateKeysCount: stats.duplicateKeys,
      commentsCount: comments.length,
      errorsCount,
      warningsCount,
      detectedSchema,
      executionTimeMs: Math.max(
        0.1,
        Math.round((performance.now() - startTime) * 100) / 100
      ),
    },
  };
}

// ============================================================================
// 12. CWE-1236 SAFE CSV & 3-SHEET OPENXML EXCEL (.XLSX) AUDIT EXPORTERS
// ============================================================================

export function sanitizeAuditSpreadsheetCell(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return '';
  const str = String(value).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

function escapeCsvCell(val: string | number | null | undefined): string {
  const safe = sanitizeAuditSpreadsheetCell(val);
  if (/[",\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function exportYamlJsonAuditCsv(result: YamlJsonConversionResult): string {
  const headers = [
    'Finding Category',
    'Severity',
    'Rule / Code',
    'Line',
    'Column',
    'Key Path',
    'Message / Description',
    'YAML 1.2 Value',
    'YAML 1.1 Value',
    'Recommendation',
  ];

  const rows: Array<Array<string | number>> = [];

  for (const d of result.diagnostics) {
    rows.push([
      'DIAGNOSTIC',
      d.severity.toUpperCase(),
      d.code,
      d.line,
      d.column,
      d.keyPath,
      d.message,
      '',
      '',
      d.suggestion,
    ]);
  }

  for (const n of result.norwayTraps) {
    rows.push([
      'NORWAY_TRAP',
      'WARNING',
      'YAML_11_VS_12_COERCION',
      n.line,
      n.column,
      n.keyPath,
      n.reason,
      `${n.yaml12Value} (${n.yaml12Type})`,
      `${n.yaml11Value} (${n.yaml11Type})`,
      `Quote "${n.rawToken}" to prevent YAML 1.1 boolean/octal/base-60 coercion.`,
    ]);
  }

  for (const b of result.bigIntFindings) {
    rows.push([
      'BIGINT_PRECISION',
      'INFO',
      'IEEE754_UNSAFE_INTEGER',
      b.line,
      1,
      b.keyPath,
      `64-bit integer ${b.exactDigits} exceeds Number.MAX_SAFE_INTEGER and would truncate to ${b.truncatedFloat}.`,
      b.exactDigits,
      b.truncatedFloat,
      'Use Exact Number or String Preserve mode to prevent precision loss.',
    ]);
  }

  return [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((r) => r.map(escapeCsvCell).join(',')),
  ].join('\r\n');
}

function escapeXmlStr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colToLetter(colIdx: number): string {
  let temp = colIdx + 1;
  let letter = '';
  while (temp > 0) {
    const rem = (temp - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
}

function buildSheetXml(rows: Array<Array<string | number>>): string {
  const rowXml = rows
    .map((row, rIdx) => {
      const cells = row
        .map((val, cIdx) => {
          const ref = `${colToLetter(cIdx)}${rIdx + 1}`;
          if (typeof val === 'number' && Number.isFinite(val)) {
            return `<c r="${ref}"><v>${val}</v></c>`;
          }
          const safe = escapeXmlStr(sanitizeAuditSpreadsheetCell(val));
          return `<c r="${ref}" t="inlineStr"><is><t>${safe}</t></is></c>`;
        })
        .join('');
      return `<row r="${rIdx + 1}">${cells}</row>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowXml}</sheetData>
</worksheet>`;
}

const CRC32_LOOKUP = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function calcCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_LOOKUP[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function exportYamlJsonAuditXlsx(result: YamlJsonConversionResult): Uint8Array {
  const summaryRows: Array<Array<string | number>> = [
    ['KivaroTools YAML ↔ JSON Validation & DevOps Audit Workbook'],
    ['Engine Version', result.engineVersion],
    ['Generated At (UTC)', new Date().toISOString()],
    ['Conversion Direction', result.resolvedDirection],
    ['Validation Status', result.isValid ? 'VALID (0 Syntax Errors)' : 'INVALID'],
    ['Detected DevOps Schema', result.metrics.detectedSchema],
    ['Document Stream Count', result.metrics.documentCount],
    ['Total Parsed Keys', result.metrics.totalKeysCount],
    ['Max Nesting Depth', result.metrics.maxNestingDepth],
    ['Anchors Defined (&)', result.metrics.anchorsDefinedCount],
    ['Aliases Resolved (*)', result.metrics.aliasesResolvedCount],
    ['Merge Keys Resolved (<<)', result.metrics.mergeKeysResolvedCount],
    ['YAML 1.1 vs 1.2 Norway Traps', result.metrics.norwayTrapsCount],
    ['64-Bit BigInt Values Protected', result.metrics.bigIntCount],
    ['Duplicate Keys Detected', result.metrics.duplicateKeysCount],
    ['Syntax & Lint Errors', result.metrics.errorsCount],
    ['Warnings', result.metrics.warningsCount],
  ];

  const diagRows: Array<Array<string | number>> = [
    ['Severity', 'Code', 'Line', 'Column', 'Key Path', 'Message', 'Suggestion'],
    ...result.diagnostics.map((d) => [
      d.severity.toUpperCase(),
      d.code,
      d.line,
      d.column,
      d.keyPath,
      d.message,
      d.suggestion,
    ]),
  ];

  const trapRows: Array<Array<string | number>> = [
    [
      'Trap Type',
      'Line',
      'Key Path',
      'Raw Token',
      'YAML 1.2 Value',
      'YAML 1.1 Value / Truncated',
      'Explanation',
    ],
    ...result.norwayTraps.map((n) => [
      'NORWAY_TRAP',
      n.line,
      n.keyPath,
      n.rawToken,
      `${n.yaml12Value} (${n.yaml12Type})`,
      `${n.yaml11Value} (${n.yaml11Type})`,
      n.reason,
    ]),
    ...result.bigIntFindings.map((b) => [
      '64BIT_BIGINT',
      b.line,
      b.keyPath,
      b.exactDigits,
      b.exactDigits,
      b.truncatedFloat,
      'Exceeds IEEE-754 Number.MAX_SAFE_INTEGER (2^53 - 1).',
    ]),
  ];

  const encoder = new TextEncoder();
  const files: Array<{ name: string; data: Uint8Array }> = [
    {
      name: '[Content_Types].xml',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`),
    },
    {
      name: '_rels/.rels',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`),
    },
    {
      name: 'xl/workbook.xml',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Audit Summary" sheetId="1" r:id="rId1"/>
    <sheet name="Syntax and DevOps Lint" sheetId="2" r:id="rId2"/>
    <sheet name="Norway Traps and BigInt" sheetId="3" r:id="rId3"/>
  </sheets>
</workbook>`),
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: encoder.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
</Relationships>`),
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      data: encoder.encode(buildSheetXml(summaryRows)),
    },
    {
      name: 'xl/worksheets/sheet2.xml',
      data: encoder.encode(buildSheetXml(diagRows)),
    },
    {
      name: 'xl/worksheets/sheet3.xml',
      data: encoder.encode(buildSheetXml(trapRows)),
    },
  ];

  let totalLocal = 0;
  let totalCentral = 0;
  const nameBytesList = files.map((f) => encoder.encode(f.name));
  files.forEach((f, idx) => {
    totalLocal += 30 + nameBytesList[idx].length + f.data.length;
    totalCentral += 46 + nameBytesList[idx].length;
  });

  const out = new Uint8Array(totalLocal + totalCentral + 22);
  const view = new DataView(out.buffer);
  let offset = 0;
  const localOffsets: number[] = [];

  files.forEach((f, idx) => {
    localOffsets.push(offset);
    const nb = nameBytesList[idx];
    const crc = calcCrc32(f.data);
    view.setUint32(offset, 0x04034b50, true);
    view.setUint16(offset + 4, 20, true);
    view.setUint16(offset + 6, 0, true);
    view.setUint16(offset + 8, 0, true);
    view.setUint16(offset + 10, 0, true);
    view.setUint16(offset + 12, 0, true);
    view.setUint32(offset + 14, crc, true);
    view.setUint32(offset + 18, f.data.length, true);
    view.setUint32(offset + 22, f.data.length, true);
    view.setUint16(offset + 26, nb.length, true);
    view.setUint16(offset + 28, 0, true);
    out.set(nb, offset + 30);
    out.set(f.data, offset + 30 + nb.length);
    offset += 30 + nb.length + f.data.length;
  });

  const centralStart = offset;
  files.forEach((f, idx) => {
    const nb = nameBytesList[idx];
    const crc = calcCrc32(f.data);
    view.setUint32(offset, 0x02014b50, true);
    view.setUint16(offset + 4, 20, true);
    view.setUint16(offset + 6, 20, true);
    view.setUint16(offset + 8, 0, true);
    view.setUint16(offset + 10, 0, true);
    view.setUint16(offset + 12, 0, true);
    view.setUint16(offset + 14, 0, true);
    view.setUint32(offset + 16, crc, true);
    view.setUint32(offset + 20, f.data.length, true);
    view.setUint32(offset + 24, f.data.length, true);
    view.setUint16(offset + 28, nb.length, true);
    view.setUint16(offset + 30, 0, true);
    view.setUint16(offset + 32, 0, true);
    view.setUint16(offset + 34, 0, true);
    view.setUint16(offset + 36, 0, true);
    view.setUint32(offset + 38, 0, true);
    view.setUint32(offset + 42, localOffsets[idx], true);
    out.set(nb, offset + 46);
    offset += 46 + nb.length;
  });

  const centralSize = offset - centralStart;
  view.setUint32(offset, 0x06054b50, true);
  view.setUint16(offset + 4, 0, true);
  view.setUint16(offset + 6, 0, true);
  view.setUint16(offset + 8, files.length, true);
  view.setUint16(offset + 10, files.length, true);
  view.setUint32(offset + 32 - 20, centralSize, true);
  view.setUint32(offset + 16, centralStart, true);
  view.setUint16(offset + 20, 0, true);

  return out;
}

// ============================================================================
// 13. BUILT-IN REALISTIC DEVOPS SAMPLE PRESETS (K8S, DOCKER, GHA, JSON)
// ============================================================================

export interface YamlJsonSamplePreset {
  id: string;
  label: string;
  badge: string;
  direction: 'yaml_to_json' | 'json_to_yaml';
  description: string;
  content: string;
}

export const YAML_JSON_SAMPLE_PRESETS: YamlJsonSamplePreset[] = [
  {
    id: 'k8s_norway_anchors_multidoc',
    label: 'Kubernetes Multi-Doc + Norway Trap + Anchors & BigInt',
    badge: 'K8s Multi-Doc + Norway Trap',
    direction: 'yaml_to_json',
    description:
      'Demonstrates multi-document (---) Kubernetes Deployment + Service, YAML Anchors (&) and Merge Keys (<<), Norway Problem scalars (NO, on, 0755), and 64-bit Snowflake IDs.',
    content: `# Production Kubernetes Edge Gateway Manifest
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kivaro-edge-gateway
  labels: &defaultLabels
    app: kivaro-edge
    tier: gateway
    region_country: NO
    feature_toggle: on
    file_mode: 0755
    snowflake_deployment_id: 9007199254740993
spec:
  replicas: 3
  template:
    metadata:
      labels:
        <<: *defaultLabels
        environment: production
    spec:
      containers:
        - name: envoy-proxy
          image: envoyproxy/envoy:v1.31.0
          ports:
            - containerPort: 8080
          resources:
            limits:
              cpu: "500m"
              memory: "256Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: kivaro-edge-service
spec:
  selector:
    <<: *defaultLabels
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080`,
  },
  {
    id: 'docker_compose_prod',
    label: 'Docker Compose Stack (Anchors, Ports & Healthcheck)',
    badge: 'Docker Compose',
    direction: 'yaml_to_json',
    description:
      'Docker Compose configuration with shared YAML anchors, port mappings, and multiline startup script.',
    content: `# Docker Compose Microservices Stack
services:
  postgres-primary:
    image: postgres:16-alpine
    restart: always
    ports:
      - 5432:5432
    environment:
      POSTGRES_DB: kivarodb
      POSTGRES_USER: postgres
      SSL_ENABLED: yes
  redis-cache:
    image: redis:7.2-alpine
    command: |
      redis-server --appendonly yes
      --maxmemory 256mb`,
  },
  {
    id: 'github_actions_ci',
    label: 'GitHub Actions CI/CD Workflow (on: push Trap)',
    badge: 'GitHub Actions',
    direction: 'yaml_to_json',
    description:
      'GitHub Actions workflow showcasing the classic `on:` trigger YAML 1.1 boolean coercion trap and matrix build steps.',
    content: `# GitHub Actions Production CI Pipeline
name: Cloudflare Workers CI/CD
on:
  push:
    branches: [main, cloudflare-migration]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      - name: Run TypeScript & Sitemap Verification
        run: |
          npm ci
          npm run test:registry
          npm run build`,
  },
  {
    id: 'json_to_yaml_package',
    label: 'JSON / JSONC Config → Clean Idiomatic YAML',
    badge: 'JSON → YAML',
    direction: 'json_to_yaml',
    description:
      'Converts a JSONC configuration with comments and 64-bit account IDs into clean, minimal-quote YAML 1.2.',
    content: `// Cloud Infrastructure Routing Configuration (JSONC)
{
  "serviceName": "kivarotools-worker-router",
  "accountSnowflakeId": 9007199254740995,
  "norwayRegionCode": "NO",
  "regions": ["eu-west-1", "me-central-1", "ap-south-1"],
  "rateLimits": {
    "burstPerSecond": 250,
    "retryBackoff": true
  }
}`,
  },
];