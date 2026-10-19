/**
 * KivaroTools JSON Formatter Engine
 *
 * Core pure-function engine for JSON formatting, validation, minification,
 * structural diagnostics, key sorting, JSONPath evaluation, diffing,
 * schema generation, and repair.
 *
 * Standards Compliance: RFC 8259 & ECMA-404
 */

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface DuplicateKeyDiagnostic {
  key: string;
  line: number;
  col: number;
  prevLine: number;
  prevCol: number;
}

export interface UnsafeNumberDiagnostic {
  raw: string;
  line: number;
  col: number;
}

export interface JsonDiagnosticsResult {
  duplicateKeys: DuplicateKeyDiagnostic[];
  unsafeNumbers: UnsafeNumberDiagnostic[];
}

export interface JsonParseDiagnostic {
  isValid: boolean;
  data: JsonValue | null;
  error: string | null;
  line: number | null;
  column: number | null;
  position: number | null;
  snippet: string | null;
}

export interface JsonStats {
  byteSize: number;
  charCount: number;
  lineCount: number;
  nodeCount: number;
  keyCount: number;
  maxDepth: number;
  arrayCount: number;
  objectCount: number;
}

export type DiffKind = 'added' | 'removed' | 'changed';
export interface JsonDiff {
  path: string;
  kind: DiffKind;
  before?: JsonValue;
  after?: JsonValue;
}

export interface JsonPathMatch {
  path: string;
  value: JsonValue;
}

// ============================================================================
// 1. STRICT JSON PARSING & ERROR LOCATION EXTRACTION
// ============================================================================

/**
 * Parses raw JSON text using the native strict parser, extracting exact line,
 * column, and character position from parser errors across V8, SpiderMonkey, and JSC.
 */
export const parseJsonStrict = (source: string): JsonParseDiagnostic => {
  if (!source || source.trim() === '') {
    return {
      isValid: false,
      data: null,
      error: 'Empty input: JSON payload cannot be empty or whitespace-only.',
      line: 1,
      column: 1,
      position: 0,
      snippet: null,
    };
  }

  try {
    const data = JSON.parse(source) as JsonValue;
    return {
      isValid: true,
      data,
      error: null,
      line: null,
      column: null,
      position: null,
      snippet: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON format.';
    let line = 1;
    let column = 1;
    let position: number | null = null;

    // Pattern 1: V8 / Chrome "at position X"
    const posMatch = message.match(/position\s+(\d+)/i);
    // Pattern 2: SpiderMonkey / Firefox "line X column Y"
    const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);

    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10);
      column = parseInt(lineColMatch[2], 10);
    } else if (posMatch) {
      position = parseInt(posMatch[1], 10);
      const clampedPos = Math.min(position, source.length);
      const lines = source.slice(0, clampedPos).split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }

    const allLines = source.split('\n');
    const errorLineIdx = Math.max(0, line - 1);
    const startIdx = Math.max(0, errorLineIdx - 1);
    const endIdx = Math.min(allLines.length - 1, errorLineIdx + 1);

    const snippetLines: string[] = [];
    for (let i = startIdx; i <= endIdx; i += 1) {
      const lineNum = String(i + 1).padStart(4, ' ');
      const isErrorLine = i === errorLineIdx;
      const prefix = isErrorLine ? '>' : ' ';
      snippetLines.push(`${prefix} ${lineNum} | ${allLines[i]}`);

      if (isErrorLine) {
        const caretIndent = ' '.repeat(7 + Math.max(0, column - 1));
        snippetLines.push(`${caretIndent}^`);
      }
    }

    return {
      isValid: false,
      data: null,
      error: message,
      line,
      column,
      position,
      snippet: snippetLines.join('\n'),
    };
  }
};

// ============================================================================
// 2. FORMATTING, MINIFICATION & INDENTATION
// ============================================================================

/**
 * Recursively sorts keys of an object alphabetically.
 * Array order is strictly preserved.
 */
export const sortJsonKeys = (value: unknown): JsonValue => {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }
  if (value !== null && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    const sorted: Record<string, JsonValue> = {};
    const keys = Object.keys(objectValue).sort((a, b) => a.localeCompare(b));
    for (const key of keys) {
      sorted[key] = sortJsonKeys(objectValue[key]);
    }
    return sorted as JsonValue;
  }
  return value as JsonValue;
};

/**
 * Recursively removes null values from objects and arrays.
 */
export const removeNullValues = (value: unknown): JsonValue => {
  if (Array.isArray(value)) {
    return value.map(removeNullValues).filter((item) => item !== null) as JsonValue;
  }
  if (value !== null && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    const cleaned: Record<string, JsonValue> = {};
    for (const [key, child] of Object.entries(objectValue)) {
      if (child !== null) {
        cleaned[key] = removeNullValues(child);
      }
    }
    return cleaned as JsonValue;
  }
  return value as JsonValue;
};

export interface FormatOptions {
  indent?: number | string;
  sortKeys?: boolean;
  removeNulls?: boolean;
}

/**
 * Formats JSON with customizable indentation, optional key sorting, and null removal.
 */
export const formatJson = (
  value: unknown,
  options: FormatOptions = { indent: 2, sortKeys: false, removeNulls: false },
): string => {
  let target = value;
  if (options.sortKeys) {
    target = sortJsonKeys(target);
  }
  if (options.removeNulls) {
    target = removeNullValues(target);
  }

  const space = options.indent ?? 2;
  return JSON.stringify(target, null, space);
};

/**
 * Minifies JSON into a single contiguous line, stripping all non-essential whitespace.
 */
export const minifyJson = (value: unknown): string => {
  return JSON.stringify(value);
};

// ============================================================================
// 3. STRUCTURAL DIAGNOSTICS (DUPLICATE KEYS & IEEE 754 PRECISION)
// ============================================================================

/**
 * Scans raw JSON source text to detect duplicate object keys and integers exceeding
 * JavaScript's IEEE 754 53-bit safe limit (Number.MAX_SAFE_INTEGER).
 */
export const scanJsonDiagnostics = (source: string): JsonDiagnosticsResult => {
  const duplicateKeys: DuplicateKeyDiagnostic[] = [];
  const unsafeNumbers: UnsafeNumberDiagnostic[] = [];

  let inString = false;
  let isEscaped = false;
  let currentString = '';
  let line = 1;
  let col = 1;

  const scopeStack: Array<{ isArray: boolean; keys: Map<string, { line: number; col: number }> }> = [];
  let lastKeyLine = 1;
  let lastKeyCol = 1;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];

    if (ch === '\n') {
      line += 1;
      col = 1;
    } else {
      col += 1;
    }

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        currentString += ch;
      } else if (ch === '\\') {
        isEscaped = true;
        currentString += ch;
      } else if (ch === '"') {
        inString = false;
        let peek = i + 1;
        while (peek < source.length && /\s/.test(source[peek])) peek += 1;
        if (peek < source.length && source[peek] === ':') {
          const currentScope = scopeStack[scopeStack.length - 1];
          if (currentScope && !currentScope.isArray) {
            if (currentScope.keys.has(currentString)) {
              const prev = currentScope.keys.get(currentString)!;
              duplicateKeys.push({
                key: currentString,
                line: lastKeyLine,
                col: lastKeyCol,
                prevLine: prev.line,
                prevCol: prev.col,
              });
            } else {
              currentScope.keys.set(currentString, { line: lastKeyLine, col: lastKeyCol });
            }
          }
        }
      } else {
        currentString += ch;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      isEscaped = false;
      currentString = '';
      lastKeyLine = line;
      lastKeyCol = col - 1;
      continue;
    }

    if (ch === '{') {
      scopeStack.push({ isArray: false, keys: new Map() });
      continue;
    }

    if (ch === '}') {
      if (scopeStack.length) scopeStack.pop();
      continue;
    }

    if (ch === '[') {
      scopeStack.push({ isArray: true, keys: new Map() });
      continue;
    }

    if (ch === ']') {
      if (scopeStack.length) scopeStack.pop();
      continue;
    }

    if (/[0-9-]/.test(ch)) {
      const prevCh = i > 0 ? source[i - 1] : '';
      if (!/[0-9a-zA-Z_$]/.test(prevCh)) {
        let numStr = ch;
        let p = i + 1;
        while (p < source.length && /[0-9.eE+-]/.test(source[p])) {
          numStr += source[p];
          p += 1;
        }
        if (/^-?\d+$/.test(numStr) && numStr.length >= 16) {
          try {
            const bigVal = BigInt(numStr);
            const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);
            if (bigVal > MAX_SAFE || bigVal < -MAX_SAFE) {
              unsafeNumbers.push({
                raw: numStr,
                line,
                col: col - 1,
              });
            }
          } catch {
            // Non-fatal if BigInt conversion fails
          }
        }
        col += p - i - 1;
        i = p - 1;
      }
    }
  }

  return { duplicateKeys, unsafeNumbers };
};

// ============================================================================
// 4. CONSERVATIVE REPAIR UTILITIES
// ============================================================================

/**
 * Strips JavaScript-style comments (// and /* *\/) outside string literals.
 * Accurately tracks both double and single quote strings to protect URLs and escaped slashes.
 */
export const stripJsonComments = (source: string): string => {
  let output = '';
  let inQuote: null | '"' | "'" = null;
  let escaped = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (inQuote !== null) {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === inQuote) {
        inQuote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inQuote = char;
      output += char;
    } else if (char === '/' && next === '/') {
      i += 1;
      while (i + 1 < source.length && source[i + 1] !== '\n' && source[i + 1] !== '\r') i += 1;
    } else if (char === '/' && next === '*') {
      i += 1;
      while (i + 1 < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
      i += 1;
    } else {
      output += char;
    }
  }

  return output;
};

/**
 * Converts single-quoted strings to valid JSON double-quoted strings.
 */
export const convertSingleQuotedStrings = (source: string): string => {
  let output = '';
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];

    if (inDouble) {
      output += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inDouble = false;
      continue;
    }

    if (inSingle) {
      if (escaped) {
        if (char === "'" || char === '\\') output += char;
        else output += `\\${char}`;
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === "'") {
        output += '"';
        inSingle = false;
      } else if (char === '"') {
        output += '\\"';
      } else {
        output += char;
      }
      continue;
    }

    if (char === '"') {
      inDouble = true;
      output += char;
    } else if (char === "'") {
      inSingle = true;
      output += '"';
    } else {
      output += char;
    }
  }

  return output;
};

/**
 * Replaces unquoted Python / JavaScript bare literals with standard JSON values.
 */
export const replaceBareIdentifiers = (source: string): string => {
  let output = '';
  let inString = false;
  let escaped = false;
  let token = '';

  const flushToken = () => {
    if (!token) return;
    const replacements: Record<string, string> = {
      undefined: 'null',
      NaN: 'null',
      Infinity: 'null',
      True: 'true',
      False: 'false',
      None: 'null',
    };
    output += replacements[token] ?? token;
    token = '';
  };

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (inString) {
      output += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      flushToken();
      inString = true;
      output += char;
      continue;
    }
    if (/[A-Za-z_$]/.test(char) || (token && /[0-9-]/.test(char))) {
      token += char;
      continue;
    }
    flushToken();
    output += char;
  }
  flushToken();
  return output;
};

/**
 * Opt-in conservative repair of common JSON syntax flaws:
 * 1. Strips comments
 * 2. Converts single quotes to double quotes
 * 3. Encloses unquoted object keys in quotes
 * 4. Replaces bare identifiers (undefined, NaN, True, False, None)
 * 5. Removes trailing commas in objects and arrays
 */
export const repairJson = (source: string): string => {
  let repaired = stripJsonComments(source);
  repaired = convertSingleQuotedStrings(repaired);
  repaired = repaired.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$-]*)(\s*:)/g, '$1"$2"$3');
  repaired = replaceBareIdentifiers(repaired);
  repaired = repaired.replace(/(?:,\s*)+([}\]])/g, '$1');

  // Verify repaired result parses strictly
  JSON.parse(repaired);
  return repaired;
};

// ============================================================================
// 5. JSONPATH EVALUATION
// ============================================================================

const childPath = (path: string, key: string | number, array = false): string => {
  if (array || typeof key === 'number') return `${path}[${key}]`;
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(String(key))
    ? `${path}.${key}`
    : `${path}[${JSON.stringify(String(key))}]`;
};

export const parseJsonPath = (
  expression: string,
): Array<{ type: 'property' | 'index' | 'wildcard' | 'recursive'; key?: string; index?: number }> => {
  const expr = expression.trim();
  if (!expr.startsWith('$')) throw new Error('JSONPath expression must start with $.');

  const tokens: Array<{ type: 'property' | 'index' | 'wildcard' | 'recursive'; key?: string; index?: number }> = [];
  let i = 1;

  while (i < expr.length) {
    if (expr.startsWith('..', i)) {
      i += 2;
      const match = expr.slice(i).match(/^([A-Za-z_$][A-Za-z0-9_$-]*)/);
      if (!match) throw new Error('Expected a property after ..');
      tokens.push({ type: 'recursive', key: match[1] });
      i += match[1].length;
      continue;
    }

    if (expr[i] === '.') {
      i += 1;
      if (expr[i] === '*') {
        tokens.push({ type: 'wildcard' });
        i += 1;
        continue;
      }
      const match = expr.slice(i).match(/^([A-Za-z_$][A-Za-z0-9_$-]*)/);
      if (!match) throw new Error('Expected a property after .');
      tokens.push({ type: 'property', key: match[1] });
      i += match[1].length;
      continue;
    }

    if (expr[i] === '[') {
      const close = expr.indexOf(']', i + 1);
      if (close === -1) throw new Error('Missing ] in JSONPath.');
      const inside = expr.slice(i + 1, close).trim();
      if (inside === '*') tokens.push({ type: 'wildcard' });
      else if (/^\d+$/.test(inside)) tokens.push({ type: 'index', index: Number(inside) });
      else if ((inside.startsWith("'") && inside.endsWith("'")) || (inside.startsWith('"') && inside.endsWith('"'))) {
        tokens.push({ type: 'property', key: inside.slice(1, -1) });
      } else {
        throw new Error(`Unsupported JSONPath selector: [${inside}]`);
      }
      i = close + 1;
      continue;
    }

    throw new Error(`Unexpected JSONPath token near: ${expr.slice(i)}`);
  }

  return tokens;
};

export const evaluateJsonPath = (root: unknown, expression: string): JsonPathMatch[] => {
  const tokens = parseJsonPath(expression);
  let current: JsonPathMatch[] = [{ path: '$', value: root as JsonValue }];

  for (const token of tokens) {
    const next: JsonPathMatch[] = [];

    for (const item of current) {
      if (token.type === 'recursive') {
        const stack: JsonPathMatch[] = [{ path: item.path, value: item.value }];
        while (stack.length) {
          const node = stack.pop()!;
          if (node.value !== null && typeof node.value === 'object') {
            if (Array.isArray(node.value)) {
              for (let i = node.value.length - 1; i >= 0; i -= 1) {
                stack.push({ path: childPath(node.path, i, true), value: node.value[i] });
              }
            } else {
              const objectValue = node.value as Record<string, JsonValue>;
              const entries = Object.entries(objectValue);
              for (let i = entries.length - 1; i >= 0; i -= 1) {
                const [key, value] = entries[i];
                const nextPath = childPath(node.path, key);
                if (key === token.key) next.push({ path: nextPath, value });
                stack.push({ path: nextPath, value });
              }
            }
          }
        }
        continue;
      }

      if (item.value === null || typeof item.value !== 'object') continue;

      if (token.type === 'property' && !Array.isArray(item.value) && token.key! in (item.value as Record<string, JsonValue>)) {
        const obj = item.value as Record<string, JsonValue>;
        next.push({ path: childPath(item.path, token.key!), value: obj[token.key!] });
      } else if (token.type === 'index' && Array.isArray(item.value) && token.index! < item.value.length) {
        next.push({ path: childPath(item.path, token.index!, true), value: item.value[token.index!] });
      } else if (token.type === 'wildcard') {
        if (Array.isArray(item.value)) {
          item.value.forEach((value, index) => next.push({ path: childPath(item.path, index, true), value }));
        } else {
          const objectValue = item.value as Record<string, JsonValue>;
          Object.entries(objectValue).forEach(([key, value]) => next.push({ path: childPath(item.path, key), value }));
        }
      }
    }

    current = next;
  }

  return current;
};

// ============================================================================
// 6. JSON STRUCTURAL DIFF ENGINE
// ============================================================================

export const jsonEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!jsonEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    const ak = Object.keys(ao);
    const bk = Object.keys(bo);
    if (ak.length !== bk.length) return false;
    for (const key of ak) {
      if (!Object.prototype.hasOwnProperty.call(bo, key) || !jsonEqual(ao[key], bo[key])) return false;
    }
    return true;
  }

  return false;
};

export const diffJson = (before: unknown, after: unknown, path = '$'): JsonDiff[] => {
  if (jsonEqual(before, after)) return [];

  if (Array.isArray(before) && Array.isArray(after)) {
    const diffs: JsonDiff[] = [];
    const max = Math.max(before.length, after.length);
    for (let i = 0; i < max; i += 1) {
      const child = childPath(path, i, true);
      if (i >= before.length) diffs.push({ path: child, kind: 'added', after: after[i] as JsonValue });
      else if (i >= after.length) diffs.push({ path: child, kind: 'removed', before: before[i] as JsonValue });
      else diffs.push(...diffJson(before[i], after[i], child));
    }
    return diffs;
  }

  if (
    before !== null &&
    typeof before === 'object' &&
    !Array.isArray(before) &&
    after !== null &&
    typeof after === 'object' &&
    !Array.isArray(after)
  ) {
    const bo = before as Record<string, unknown>;
    const ao = after as Record<string, unknown>;
    const keys = new Set([...Object.keys(bo), ...Object.keys(ao)]);
    const diffs: JsonDiff[] = [];
    for (const key of keys) {
      const child = childPath(path, key);
      const hasBefore = Object.prototype.hasOwnProperty.call(bo, key);
      const hasAfter = Object.prototype.hasOwnProperty.call(ao, key);
      if (!hasBefore) diffs.push({ path: child, kind: 'added', after: ao[key] as JsonValue });
      else if (!hasAfter) diffs.push({ path: child, kind: 'removed', before: bo[key] as JsonValue });
      else diffs.push(...diffJson(bo[key], ao[key], child));
    }
    return diffs;
  }

  return [{ path, kind: 'changed', before: before as JsonValue, after: after as JsonValue }];
};

// ============================================================================
// 7. TYPESCRIPT & JSON SCHEMA GENERATION
// ============================================================================

const toTypeScriptName = (name: string): string => {
  const clean = name.replace(/[^A-Za-z0-9_$]/g, ' ').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  const result = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return result || 'Root';
};

export const generateTypeScript = (value: unknown, rootName = 'Root'): string => {
  const definitions = new Map<string, { fields: Map<string, { type: string; optional: boolean }> }>();
  const usedNames = new Map<string, string>();
  const signatureToName = new Map<string, string>();

  const uniqueName = (base: string, signature: string): string => {
    const cleanBase = toTypeScriptName(base);
    const existing = signatureToName.get(signature);
    if (existing) return existing;
    const existingName = usedNames.get(cleanBase);
    if (!existingName) {
      usedNames.set(cleanBase, cleanBase);
      signatureToName.set(signature, cleanBase);
      return cleanBase;
    }
    if (existingName === cleanBase) {
      let n = 2;
      while (usedNames.has(`${cleanBase}${n}`)) n += 1;
      const name = `${cleanBase}${n}`;
      usedNames.set(name, name);
      signatureToName.set(signature, name);
      return name;
    }
    return existingName;
  };

  const primitiveType = (current: unknown): string => {
    if (current === null) return 'null';
    if (typeof current === 'string') return 'string';
    if (typeof current === 'number') return 'number';
    return 'boolean';
  };

  const mergeTypes = (types: string[]): string => [...new Set(types)].sort().join(' | ');

  const buildObject = (objects: Array<Record<string, unknown>>, name: string): string => {
    const allKeys = new Set<string>();
    objects.forEach((obj) => Object.keys(obj).forEach((key) => allKeys.add(key)));

    const signature = [...allKeys]
      .sort()
      .map((key) => {
        const types = objects
          .filter((obj) => Object.prototype.hasOwnProperty.call(obj, key))
          .map((obj) => inferType(obj[key], `${name}${toTypeScriptName(key)}`));
        return `${key}:${mergeTypes(types)}:${objects.every((obj) => Object.prototype.hasOwnProperty.call(obj, key))}`;
      })
      .join('|');

    const interfaceName = uniqueName(name, signature);
    if (definitions.has(interfaceName)) return interfaceName;

    const fields = new Map<string, { type: string; optional: boolean }>();
    definitions.set(interfaceName, { fields });

    for (const key of [...allKeys].sort()) {
      const present = objects.filter((obj) => Object.prototype.hasOwnProperty.call(obj, key)).map((obj) => obj[key]);
      const types = present.map((item) => inferType(item, `${interfaceName}${toTypeScriptName(key)}`));
      fields.set(key, { type: mergeTypes(types), optional: present.length !== objects.length });
    }
    return interfaceName;
  };

  const inferType = (current: unknown, name: string): string => {
    if (current === null || typeof current !== 'object') return primitiveType(current);
    if (Array.isArray(current)) {
      if (!current.length) return 'unknown[]';
      if (current.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item))) {
        return `${buildObject(current as Array<Record<string, unknown>>, `${name}Item`)}[]`;
      }
      return `${mergeTypes(current.map((item) => inferType(item, `${name}Item`)))}[]`;
    }
    return buildObject([current as Record<string, unknown>], name);
  };

  const rootType = inferType(value, rootName);
  const interfaces = [...definitions.entries()].map(([name, def]) => {
    const lines = [...def.fields.entries()].map(([key, field]) => {
      const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
      return `  ${safeKey}${field.optional ? '?' : ''}: ${field.type};`;
    });
    return `export interface ${name} {\n${lines.join('\n')}\n}`;
  });

  return `${interfaces.join('\n\n')}\n\nexport type ${toTypeScriptName(rootName)}Data = ${rootType};`;
};

export const generateJsonSchema = (value: unknown): Record<string, unknown> => {
  if (value === null) return { type: 'null' };
  if (typeof value === 'string') return { type: 'string' };
  if (typeof value === 'number') return { type: Number.isInteger(value) ? 'integer' : 'number' };
  if (typeof value === 'boolean') return { type: 'boolean' };
  if (Array.isArray(value)) {
    if (!value.length) return { type: 'array', items: {} };
    const items = [...new Map(value.map((v) => [JSON.stringify(generateJsonSchema(v)), generateJsonSchema(v)])).values()];
    return { type: 'array', items: items.length === 1 ? items[0] : { oneOf: items } };
  }

  const objectValue = value as Record<string, unknown>;
  const properties: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(objectValue)) {
    properties[key] = generateJsonSchema(child);
  }
  return { type: 'object', properties, required: Object.keys(objectValue) };
};

// ============================================================================
// 8. METRICS & STATISTICS
// ============================================================================

export const calculateJsonStats = (value: unknown, rawText = ''): JsonStats => {
  let nodeCount = 0;
  let keyCount = 0;
  let maxDepth = 0;
  let arrayCount = 0;
  let objectCount = 0;

  const stack: Array<{ val: unknown; depth: number }> = [{ val: value, depth: 1 }];

  while (stack.length) {
    const { val: current, depth } = stack.pop()!;
    nodeCount += 1;
    if (depth > maxDepth) maxDepth = depth;

    if (Array.isArray(current)) {
      arrayCount += 1;
      for (let i = current.length - 1; i >= 0; i -= 1) {
        stack.push({ val: current[i], depth: depth + 1 });
      }
    } else if (current !== null && typeof current === 'object') {
      objectCount += 1;
      const entries = Object.entries(current as Record<string, unknown>);
      keyCount += entries.length;
      for (let i = entries.length - 1; i >= 0; i -= 1) {
        stack.push({ val: entries[i][1], depth: depth + 1 });
      }
    }
  }

  const text = rawText || JSON.stringify(value);
  const byteSize = new TextEncoder().encode(text).length;
  const charCount = text.length;
  const lineCount = text.split('\n').length;

  return {
    byteSize,
    charCount,
    lineCount,
    nodeCount,
    keyCount,
    maxDepth,
    arrayCount,
    objectCount,
  };
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// ============================================================================
// 9. CURATED SAMPLE DATASETS
// ============================================================================

export const SAMPLE_JSON_PAYLOADS = {
  apiResponse: JSON.stringify(
    {
      status: 'success',
      code: 200,
      timestamp: '2026-10-13T16:50:00Z',
      data: {
        user: {
          id: 1042,
          username: 'sarah_dev',
          fullName: 'Sarah Connor',
          email: 'sarah.connor@example.com',
          isVerified: true,
          roles: ['administrator', 'auditor'],
          preferences: {
            theme: 'dark',
            notifications: {
              email: true,
              sms: false,
              push: true,
            },
            editor: {
              fontSize: 14,
              tabSize: 2,
              wordWrap: true,
            },
          },
          lastLogin: {
            ip: '192.0.2.14',
            geo: {
              city: 'San Francisco',
              region: 'California',
              country: 'US',
              coordinates: [37.7749, -122.4194],
            },
          },
        },
      },
    },
    null,
    2,
  ),

  ecommerce: JSON.stringify(
    {
      orderId: 'ORD-98741-2026',
      customer: {
        id: 501,
        name: 'Alex Morgan',
        membership: 'Prime',
      },
      lineItems: [
        {
          sku: 'LAP-16-PRO',
          description: '16" Pro Laptop (32GB, 1TB SSD)',
          quantity: 1,
          unitPrice: 2499.0,
          inStock: true,
          tags: ['hardware', 'workstation'],
        },
        {
          sku: 'ACC-USBC-HUB',
          description: 'Multi-port USB-C Hub 8-in-1',
          quantity: 2,
          unitPrice: 59.5,
          inStock: true,
          tags: ['accessories'],
        },
      ],
      payment: {
        method: 'credit_card',
        last4: '4242',
        currency: 'USD',
        subtotal: 2618.0,
        tax: 209.44,
        shipping: 0.0,
        total: 2827.44,
      },
      fulfilled: true,
    },
    null,
    2,
  ),

  complexTypes: JSON.stringify(
    {
      scalars: {
        stringText: 'Unicode: 🚀 Ça va? 日本語 100€ \n Newline & "Quotes"',
        integerValue: 42,
        negativeFloat: -123.456,
        exponentNum: 6.022e23,
        booleanTrue: true,
        booleanFalse: false,
        nullValue: null,
      },
      arrays: {
        emptyArray: [],
        numbers: [1, 2, 3, 5, 8, 13],
        mixedTypes: ['hello', 100, true, null, { nested: 'val' }],
      },
      nestedObjects: {
        level1: {
          level2: {
            level3: {
              deepKey: 'deepValue',
            },
          },
        },
      },
    },
    null,
    2,
  ),
};
