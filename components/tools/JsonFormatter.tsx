'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type DragEvent,
  type KeyboardEvent,
} from 'react';
import {
  Copy,
  Trash2,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileJson,
  Maximize2,
  Shrink,
  Download,
  Upload,
  Search,
  Check,
  Info,
  Wand2,
  ArrowDownAZ,
  Eraser,
  SearchCode,
  GitCompareArrows,
  Code2,
  Braces,
  AlertTriangle,
  Eye,
  FileCode2,
} from 'lucide-react';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type DuplicateKeyDiagnostic = {
  key: string;
  line: number;
  col: number;
  prevLine: number;
  prevCol: number;
};

type UnsafeNumberDiagnostic = {
  raw: string;
  line: number;
  col: number;
};

interface VisibleTreeRow {
  id: string;
  path: string;
  keyName: string | null;
  value: JsonValue;
  isContainer: boolean;
  isArray: boolean;
  itemCount: number;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  isLast: boolean;
  isClosing: boolean;
}

// Enterprise safety budgets
const MAX_INPUT_BYTES = 25 * 1024 * 1024; // 25 MB
const WORKER_THRESHOLD = 256 * 1024; // 256 KB triggers Web Worker
const MAX_TREE_NODES_FOR_EXPAND_ALL = 20_000;
const MAX_VISIBLE_ROWS = 60_000;
const ROW_HEIGHT = 28; // 28px per virtual row
const OVERSCAN = 12; // Over-render buffer rows above and below viewport

type JsonContainer = JsonValue[] | { [key: string]: JsonValue };

const isContainer = (value: JsonValue): value is JsonContainer =>
  value !== null && typeof value === 'object';

const countNodes = (value: JsonValue): number => {
  let count = 0;
  const stack: JsonValue[] = [value];

  while (stack.length) {
    const current = stack.pop()!;
    count += 1;

    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i -= 1) stack.push(current[i]);
    } else if (isContainer(current)) {
      const children = Object.values(current);
      for (let i = children.length - 1; i >= 0; i -= 1) stack.push(children[i]);
    }
  }

  return count;
};

const countKeys = (value: JsonValue): number => {
  let count = 0;
  const stack: JsonValue[] = [value];

  while (stack.length) {
    const current = stack.pop()!;
    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i -= 1) stack.push(current[i]);
    } else if (current !== null && typeof current === 'object') {
      const objectValue = current as { [key: string]: JsonValue };
      const entries = Object.entries(objectValue);
      count += entries.length;
      for (let i = entries.length - 1; i >= 0; i -= 1) stack.push(entries[i][1]);
    }
  }

  return count;
};

const getDepth = (value: JsonValue): number => {
  if (!isContainer(value)) return 0;

  let maxDepth = 1;
  const stack: Array<{ value: JsonValue; depth: number }> = [{ value, depth: 1 }];

  while (stack.length) {
    const { value: current, depth } = stack.pop()!;
    if (depth > maxDepth) maxDepth = depth;

    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i -= 1) {
        if (isContainer(current[i])) stack.push({ value: current[i], depth: depth + 1 });
      }
    } else if (current !== null && typeof current === 'object') {
      const objectValue = current as { [key: string]: JsonValue };
      const children = Object.values(objectValue);
      for (let i = children.length - 1; i >= 0; i -= 1) {
        if (isContainer(children[i])) stack.push({ value: children[i], depth: depth + 1 });
      }
    }
  }

  return maxDepth;
};

const sortJsonKeys = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) return value.map(sortJsonKeys);
  if (value === null || typeof value !== 'object') return value;

  const objectValue = value as { [key: string]: JsonValue };
  const sorted: { [key: string]: JsonValue } = {};
  for (const key of Object.keys(objectValue).sort((a, b) => a.localeCompare(b))) {
    sorted[key] = sortJsonKeys(objectValue[key]);
  }
  return sorted;
};

const removeNullValues = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) return value.map(removeNullValues).filter((item) => item !== null);
  if (value === null || typeof value !== 'object') return value;

  const objectValue = value as { [key: string]: JsonValue };
  const cleaned: { [key: string]: JsonValue } = {};
  for (const [key, child] of Object.entries(objectValue)) {
    if (child !== null) cleaned[key] = removeNullValues(child);
  }
  return cleaned;
};

/**
 * Scan raw source for duplicate keys and unsafe integers.
 */
const scanJsonDiagnostics = (source: string) => {
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
            // Non-fatal if BigInt fails on unexpected format
          }
        }
        col += p - i - 1;
        i = p - 1;
      }
    }
  }

  return { duplicateKeys, unsafeNumbers };
};

const stripJsonComments = (source: string) => {
  let output = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (inString) {
      output += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
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

const convertSingleQuotedStrings = (source: string) => {
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

const replaceBareIdentifiers = (source: string) => {
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

const repairJson = (source: string) => {
  let repaired = stripJsonComments(source);
  repaired = convertSingleQuotedStrings(repaired);
  repaired = repaired.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$-]*)(\s*:)/g, '$1"$2"$3');
  repaired = replaceBareIdentifiers(repaired);
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  JSON.parse(repaired);
  return repaired;
};

type JsonPathMatch = { path: string; value: JsonValue };

const childPath = (path: string, key: string | number, array = false) => {
  if (array || typeof key === 'number') return `${path}[${key}]`;
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(String(key))
    ? `${path}.${key}`
    : `${path}[${JSON.stringify(String(key))}]`;
};

const parseJsonPath = (expression: string): Array<{ type: 'property' | 'index' | 'wildcard' | 'recursive'; key?: string; index?: number }> => {
  const expr = expression.trim();
  if (!expr.startsWith('$')) throw new Error('JSONPath must start with $.');

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

const evaluateJsonPath = (root: JsonValue, expression: string): JsonPathMatch[] => {
  const tokens = parseJsonPath(expression);
  let current: JsonPathMatch[] = [{ path: '$', value: root }];

  for (const token of tokens) {
    const next: JsonPathMatch[] = [];

    for (const item of current) {
      if (token.type === 'recursive') {
        const stack: JsonPathMatch[] = [{ path: item.path, value: item.value }];
        while (stack.length) {
          const node = stack.pop()!;
          if (isContainer(node.value)) {
            if (Array.isArray(node.value)) {
              for (let i = node.value.length - 1; i >= 0; i -= 1) {
                stack.push({ path: childPath(node.path, i, true), value: node.value[i] });
              }
            } else {
              const objectValue = node.value as { [key: string]: JsonValue };
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

      if (!isContainer(item.value)) continue;

      if (token.type === 'property' && !Array.isArray(item.value) && token.key! in item.value) {
        next.push({ path: childPath(item.path, token.key!), value: item.value[token.key!] });
      } else if (token.type === 'index' && Array.isArray(item.value) && token.index! < item.value.length) {
        next.push({ path: childPath(item.path, token.index!, true), value: item.value[token.index!] });
      } else if (token.type === 'wildcard') {
        if (Array.isArray(item.value)) {
          item.value.forEach((value, index) => next.push({ path: childPath(item.path, index, true), value }));
        } else {
          const objectValue = item.value as { [key: string]: JsonValue };
          Object.entries(objectValue).forEach(([key, value]) => next.push({ path: childPath(item.path, key), value }));
        }
      }
    }

    current = next;
  }

  return current;
};

type DiffKind = 'added' | 'removed' | 'changed';
type JsonDiff = { path: string; kind: DiffKind; before?: JsonValue; after?: JsonValue };

const jsonEqual = (a: JsonValue, b: JsonValue): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) if (!jsonEqual(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ao = a as { [key: string]: JsonValue };
    const bo = b as { [key: string]: JsonValue };
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

const diffJson = (before: JsonValue, after: JsonValue, path = '$'): JsonDiff[] => {
  if (jsonEqual(before, after)) return [];

  if (Array.isArray(before) && Array.isArray(after)) {
    const diffs: JsonDiff[] = [];
    const max = Math.max(before.length, after.length);
    for (let i = 0; i < max; i += 1) {
      const child = childPath(path, i, true);
      if (i >= before.length) diffs.push({ path: child, kind: 'added', after: after[i] });
      else if (i >= after.length) diffs.push({ path: child, kind: 'removed', before: before[i] });
      else diffs.push(...diffJson(before[i], after[i], child));
    }
    return diffs;
  }

  if (isContainer(before) && !Array.isArray(before) && isContainer(after) && !Array.isArray(after)) {
    const bo = before as { [key: string]: JsonValue };
    const ao = after as { [key: string]: JsonValue };
    const keys = new Set([...Object.keys(bo), ...Object.keys(ao)]);
    const diffs: JsonDiff[] = [];
    for (const key of keys) {
      const child = childPath(path, key);
      const hasBefore = Object.prototype.hasOwnProperty.call(bo, key);
      const hasAfter = Object.prototype.hasOwnProperty.call(ao, key);
      if (!hasBefore) diffs.push({ path: child, kind: 'added', after: ao[key] });
      else if (!hasAfter) diffs.push({ path: child, kind: 'removed', before: bo[key] });
      else diffs.push(...diffJson(bo[key], ao[key], child));
    }
    return diffs;
  }

  return [{ path, kind: 'changed', before, after }];
};

const toTypeScriptName = (name: string) => {
  const clean = name.replace(/[^A-Za-z0-9_$]/g, ' ').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  const result = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return result || 'Root';
};

const generateTypeScript = (value: JsonValue, rootName = 'Root'): string => {
  const definitions = new Map<string, { fields: Map<string, { type: string; optional: boolean }> }>();
  const usedNames = new Map<string, string>();
  const signatureToName = new Map<string, string>();

  const uniqueName = (base: string, signature: string) => {
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

  const primitiveType = (current: JsonValue): string => {
    if (current === null) return 'null';
    if (typeof current === 'string') return 'string';
    if (typeof current === 'number') return 'number';
    return 'boolean';
  };

  const mergeTypes = (types: string[]) => [...new Set(types)].sort().join(' | ');

  const buildObject = (objects: Array<{ [key: string]: JsonValue }>, name: string): string => {
    const allKeys = new Set<string>();
    objects.forEach((obj) => Object.keys(obj).forEach((key) => allKeys.add(key)));

    const signature = [...allKeys].sort().map((key) => {
      const types = objects.filter((obj) => Object.prototype.hasOwnProperty.call(obj, key)).map((obj) => inferType(obj[key], `${name}${toTypeScriptName(key)}`));
      return `${key}:${mergeTypes(types)}:${objects.every((obj) => Object.prototype.hasOwnProperty.call(obj, key))}`;
    }).join('|');

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

  const inferType = (current: JsonValue, name: string): string => {
    if (current === null || typeof current !== 'object') return primitiveType(current);
    if (Array.isArray(current)) {
      if (!current.length) return 'unknown[]';
      if (current.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item))) {
        return `${buildObject(current as Array<{ [key: string]: JsonValue }>, `${name}Item`)}[]`;
      }
      return `${mergeTypes(current.map((item) => inferType(item, `${name}Item`)))}[]`;
    }
    return buildObject([current as { [key: string]: JsonValue }], name);
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

const schemaUnion = (schemas: JsonValue[]): JsonValue => {
  const unique = [...new Map(schemas.map((schema) => [JSON.stringify(schema), schema])).values()];
  return unique.length === 1 ? unique[0] : { oneOf: unique };
};

const generateJsonSchema = (value: JsonValue): JsonValue => {
  if (value === null) return { type: 'null' };
  if (typeof value === 'string') return { type: 'string' };
  if (typeof value === 'number') return { type: Number.isInteger(value) ? 'integer' : 'number' };
  if (typeof value === 'boolean') return { type: 'boolean' };
  if (Array.isArray(value)) {
    if (!value.length) return { type: 'array', items: {} };
    return { type: 'array', items: schemaUnion(value.map(generateJsonSchema)) };
  }

  const objectValue = value as { [key: string]: JsonValue };
  const properties: { [key: string]: JsonValue } = {};
  for (const [key, child] of Object.entries(objectValue)) properties[key] = generateJsonSchema(child);
  return { type: 'object', properties, required: Object.keys(objectValue) };
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const normalizeSearchTerm = (term: string) => term.trim().toLowerCase();

const containsMatch = (keyName: string | null, value: JsonValue, term: string) => {
  const normalized = normalizeSearchTerm(term);
  if (!normalized) return false;

  const valueText =
    value === null
      ? 'null'
      : typeof value === 'object'
        ? ''
        : String(value);

  return `${keyName ?? ''} ${valueText}`.toLowerCase().includes(normalized);
};

const countSearchMatches = (value: JsonValue, term: string): number => {
  const normalized = normalizeSearchTerm(term);
  if (!normalized) return 0;

  let matches = 0;
  const stack: Array<{ keyName: string | null; value: JsonValue }> = [
    { keyName: null, value },
  ];

  while (stack.length) {
    const current = stack.pop()!;
    if (containsMatch(current.keyName, current.value, normalized)) matches += 1;

    if (Array.isArray(current.value)) {
      for (let i = current.value.length - 1; i >= 0; i -= 1) {
        stack.push({ keyName: null, value: current.value[i] });
      }
    } else if (isContainer(current.value)) {
      const objectValue = current.value as { [key: string]: JsonValue };
      const entries = Object.entries(objectValue);
      for (let i = entries.length - 1; i >= 0; i -= 1) {
        const [key, child] = entries[i];
        stack.push({ keyName: key, value: child });
      }
    }
  }

  return matches;
};

const buildSearchIndex = (value: JsonValue, term: string) => {
  const normalized = normalizeSearchTerm(term);
  const matches = new Set<string>();
  const expanded = new Set<string>();
  if (!normalized) return { matches, expanded };

  const stack: Array<{ keyName: string | null; value: JsonValue; path: string }> = [
    { keyName: null, value, path: '$' },
  ];

  while (stack.length) {
    const current = stack.pop()!;
    if (containsMatch(current.keyName, current.value, normalized)) {
      matches.add(current.path);
      let ancestor = current.path;
      while (ancestor !== '$') {
        const lastDot = ancestor.lastIndexOf('.');
        const lastBracket = ancestor.lastIndexOf('[');
        const cut = Math.max(lastDot, lastBracket);
        ancestor = cut > 0 ? ancestor.slice(0, cut) : '$';
        expanded.add(ancestor);
      }
    }

    if (Array.isArray(current.value)) {
      for (let i = current.value.length - 1; i >= 0; i -= 1) {
        stack.push({ path: childPath(current.path, i, true), keyName: null, value: current.value[i] });
      }
    } else if (isContainer(current.value)) {
      const objectValue = current.value as { [key: string]: JsonValue };
      const entries = Object.entries(objectValue);
      for (let i = entries.length - 1; i >= 0; i -= 1) {
        const [key, child] = entries[i];
        stack.push({ path: childPath(current.path, key), keyName: key, value: child });
      }
    }
  }

  return { matches, expanded };
};

/**
 * Enterprise line/column/caret syntax error formatter.
 */
const parseJsonError = (error: unknown, source: string): string => {
  if (!(error instanceof Error)) return 'Invalid JSON structure.';

  const message = error.message;
  let line = 1;
  let column = 1;
  let position = -1;

  const posMatch = message.match(/position\s+(\d+)/i);
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

  const snippet = snippetLines.join('\n');
  const location = position >= 0
    ? `line ${line}, column ${column} (char ${position.toLocaleString()})`
    : `line ${line}, column ${column}`;

  return `JSON Syntax Error at ${location}:\n${message}\n\n${snippet}`;
};

/**
 * Virtual tree flattener: flattens only currently expanded visible rows.
 */
const flattenVisibleTree = (
  root: JsonValue,
  expandedPaths: Set<string>,
  maxRows = MAX_VISIBLE_ROWS,
): VisibleTreeRow[] => {
  const rows: VisibleTreeRow[] = [];

  const walk = (val: JsonValue, path: string, keyName: string | null, depth: number, isLast: boolean) => {
    if (rows.length >= maxRows) return;

    const isObject = val !== null && typeof val === 'object' && !Array.isArray(val);
    const isArray = Array.isArray(val);
    const isCont = isObject || isArray;

    if (!isCont) {
      rows.push({
        id: path,
        path,
        keyName,
        value: val,
        isContainer: false,
        isArray: false,
        itemCount: 0,
        depth,
        isExpanded: false,
        hasChildren: false,
        isLast,
        isClosing: false,
      });
      return;
    }

    const keys: string[] = isArray ? (val as JsonValue[]).map((_, i) => String(i)) : Object.keys(val as { [key: string]: JsonValue });
    const itemCount = keys.length;
    const isExpanded = expandedPaths.has(path);

    rows.push({
      id: path,
      path,
      keyName,
      value: val,
      isContainer: true,
      isArray,
      itemCount,
      depth,
      isExpanded,
      hasChildren: itemCount > 0,
      isLast,
      isClosing: false,
    });

    if (isExpanded && itemCount > 0) {
      for (let i = 0; i < keys.length; i += 1) {
        if (rows.length >= maxRows) break;
        const k = keys[i];
        const childVal = isArray ? (val as JsonValue[])[Number(k)] : (val as { [key: string]: JsonValue })[k];
        const cPath = childPath(path, isArray ? Number(k) : k, isArray);
        const childIsLast = i === keys.length - 1;
        walk(childVal, cPath, isArray ? null : k, depth + 1, childIsLast);
      }

      if (rows.length < maxRows) {
        rows.push({
          id: `${path}_close`,
          path,
          keyName: null,
          value: val,
          isContainer: true,
          isArray,
          itemCount,
          depth,
          isExpanded: true,
          hasChildren: itemCount > 0,
          isLast,
          isClosing: true,
        });
      }
    }
  };

  walk(root, '$', null, 0, true);
  return rows;
};

const parseJsonWorker = (source: string) => {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;

  const workerSource = String.raw`
    self.onmessage = (event) => {
      try {
        const value = JSON.parse(event.data.source);
        self.postMessage({ ok: true, value, requestId: event.data.requestId });
      } catch (error) {
        self.postMessage({
          ok: false,
          requestId: event.data.requestId,
          error: error instanceof Error ? error.message : 'Invalid JSON.'
        });
      }
    };
  `;

  const blob = new Blob([workerSource], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);

  let worker: Worker;
  try {
    worker = new Worker(url);
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }

  let settled = false;
  let disposed = false;
  let rejectPending: ((reason?: unknown) => void) | null = null;

  const dispose = (reason = 'JSON parsing cancelled.') => {
    if (disposed) return;
    disposed = true;
    worker.onmessage = null;
    worker.onerror = null;
    worker.onmessageerror = null;
    worker.terminate();
    URL.revokeObjectURL(url);

    if (!settled && rejectPending) {
      settled = true;
      rejectPending(new Error(reason));
      rejectPending = null;
    }
  };

  const start = (requestId: number) =>
    new Promise<JsonValue>((resolve, reject) => {
      if (disposed) {
        reject(new Error('JSON parsing cancelled.'));
        return;
      }

      rejectPending = reject;

      worker.onmessage = (event) => {
        if (event.data?.requestId !== requestId) return;
        if (settled || disposed) return;
        settled = true;
        rejectPending = null;

        if (event.data?.ok) resolve(event.data.value as JsonValue);
        else reject(new Error(event.data?.error || 'Invalid JSON.'));
      };

      worker.onerror = () => {
        if (settled || disposed) return;
        settled = true;
        rejectPending = null;
        reject(new Error('Background JSON parser stopped unexpectedly.'));
      };

      worker.onmessageerror = () => {
        if (settled || disposed) return;
        settled = true;
        rejectPending = null;
        reject(new Error('Background JSON parser could not transfer the result.'));
      };

      worker.postMessage({ source, requestId });
    });

  return { worker, start, dispose };
};

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [parsedJson, setParsedJson] = useState<JsonValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<{
    duplicateKeys: DuplicateKeyDiagnostic[];
    unsafeNumbers: UnsafeNumberDiagnostic[];
  }>({ duplicateKeys: [], unsafeNumbers: [] });

  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [filename, setFilename] = useState('formatted-json.json');
  const [isProcessing, setIsProcessing] = useState(false);
  const [indentStyle, setIndentStyle] = useState<'2' | '4' | 'tab'>('2');
  const [sortKeysEnabled, setSortKeysEnabled] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');
  const [jsonPath, setJsonPath] = useState('$');
  const [queryResult, setQueryResult] = useState<JsonPathMatch[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryCopied, setQueryCopied] = useState(false);
  const [advancedMode, setAdvancedMode] = useState<'none' | 'compare' | 'typescript' | 'schema'>('none');
  const [compareInput, setCompareInput] = useState('');
  const [compareJson, setCompareJson] = useState<JsonValue | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [diffs, setDiffs] = useState<JsonDiff[]>([]);

  // Virtual Tree state
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['$']));
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState(0);

  const parserTaskRef = useRef<{ dispose: () => void } | null>(null);
  const requestRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const virtualContainerRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    if (parsedJson === null) return { nodes: 0, keys: 0, depth: 0 };
    return {
      nodes: countNodes(parsedJson),
      keys: countKeys(parsedJson),
      depth: getDepth(parsedJson),
    };
  }, [parsedJson]);

  const searchIndex = useMemo(() => {
    if (parsedJson === null || !searchTerm.trim()) return { matches: new Set<string>(), expanded: new Set<string>() };
    return buildSearchIndex(parsedJson, searchTerm);
  }, [parsedJson, searchTerm]);

  // Combine user-expanded paths with search-matched ancestor paths
  const effectiveExpandedPaths = useMemo(() => {
    if (searchIndex.expanded.size === 0) return expandedPaths;
    const combined = new Set(expandedPaths);
    searchIndex.expanded.forEach((p) => combined.add(p));
    return combined;
  }, [expandedPaths, searchIndex.expanded]);

  // Flatten currently visible rows
  const visibleRows = useMemo(() => {
    if (parsedJson === null) return [];
    return flattenVisibleTree(parsedJson, effectiveExpandedPaths);
  }, [parsedJson, effectiveExpandedPaths]);

  // Virtual windowing calculations
  const totalRows = visibleRows.length;
  const viewportHeight = 560;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(totalRows, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN);
  const virtualSlice = useMemo(
    () => visibleRows.slice(startIndex, endIndex),
    [visibleRows, startIndex, endIndex],
  );

  const formattedOutput = useMemo(() => {
    if (parsedJson === null) return '';
    const value = sortKeysEnabled ? sortJsonKeys(parsedJson) : parsedJson;
    const indent = indentStyle === 'tab' ? '\t' : Number(indentStyle);
    return JSON.stringify(value, null, indent);
  }, [parsedJson, indentStyle, sortKeysEnabled]);

  const minifiedOutput = useMemo(() => {
    if (parsedJson === null) return '';
    return JSON.stringify(sortKeysEnabled ? sortJsonKeys(parsedJson) : parsedJson);
  }, [parsedJson, sortKeysEnabled]);

  // Parse handling effect with React 19 safety
  useEffect(() => {
    const requestId = ++requestRef.current;

    parserTaskRef.current?.dispose();
    parserTaskRef.current = null;

    if (!input.trim()) {
      queueMicrotask(() => {
        if (requestId !== requestRef.current) return;
        setParsedJson(null);
        setError(null);
        setDiagnostics({ duplicateKeys: [], unsafeNumbers: [] });
        setIsProcessing(false);
      });
      return;
    }

    if (new Blob([input]).size > MAX_INPUT_BYTES) {
      queueMicrotask(() => {
        if (requestId !== requestRef.current) return;
        setParsedJson(null);
        setError(`Input exceeds the ${formatBytes(MAX_INPUT_BYTES)} safe browser limit.`);
        setIsProcessing(false);
      });
      return;
    }

    const run = async () => {
      setIsProcessing(true);

      // Lexical check for duplicate keys and unsafe integers
      const diag = scanJsonDiagnostics(input);
      if (requestId === requestRef.current) {
        setDiagnostics(diag);
      }

      // Small JSON: parse directly on main thread
      if (input.length < WORKER_THRESHOLD) {
        try {
          const parsed = JSON.parse(input) as JsonValue;
          if (requestId !== requestRef.current) return;
          setParsedJson(parsed);
          setExpandedPaths(new Set(['$']));
          setError(null);
        } catch (e) {
          if (requestId !== requestRef.current) return;
          setParsedJson(null);
          setError(parseJsonError(e, input));
        } finally {
          if (requestId === requestRef.current) setIsProcessing(false);
        }
        return;
      }

      // Large JSON: offload to Web Worker
      let task: ReturnType<typeof parseJsonWorker> = null;

      try {
        task = parseJsonWorker(input);

        if (!task) {
          const parsed = JSON.parse(input) as JsonValue;
          if (requestId !== requestRef.current) return;
          setParsedJson(parsed);
          setExpandedPaths(new Set(['$']));
          setError(null);
          return;
        }

        parserTaskRef.current = task;
        const parsed = await task.start(requestId);

        if (requestId !== requestRef.current) return;
        setParsedJson(parsed);
        setExpandedPaths(new Set(['$']));
        setError(null);
      } catch (e) {
        if (requestId !== requestRef.current) return;
        setParsedJson(null);
        setError(parseJsonError(e, input));
      } finally {
        task?.dispose();
        if (parserTaskRef.current === task) parserTaskRef.current = null;
        if (requestId === requestRef.current) setIsProcessing(false);
      }
    };

    void run();

    return () => {
      parserTaskRef.current?.dispose();
      parserTaskRef.current = null;
    };
  }, [input]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      parserTaskRef.current?.dispose();
      parserTaskRef.current = null;
    };
  }, []);

  const handleCopyPath = useCallback(async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setError('Clipboard access was blocked by the browser.');
    }
  }, []);

  const toggleNodeExpansion = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    if (parsedJson === null) return;
    if (stats.nodes > MAX_TREE_NODES_FOR_EXPAND_ALL) {
      // Safe partial expansion for large documents
      const safePaths = new Set<string>(['$']);
      const stack: Array<{ val: JsonValue; path: string; depth: number }> = [{ val: parsedJson, path: '$', depth: 0 }];
      while (stack.length && safePaths.size < 5000) {
        const item = stack.pop()!;
        if (item.depth < 3 && isContainer(item.val)) {
          safePaths.add(item.path);
          if (Array.isArray(item.val)) {
            item.val.forEach((child, idx) => stack.push({ val: child, path: childPath(item.path, idx, true), depth: item.depth + 1 }));
          } else {
            Object.entries(item.val as { [k: string]: JsonValue }).forEach(([k, child]) => stack.push({ val: child, path: childPath(item.path, k), depth: item.depth + 1 }));
          }
        }
      }
      setExpandedPaths(safePaths);
      return;
    }

    // Standard expand all for documents within budget
    const allPaths = new Set<string>();
    const stack: Array<{ val: JsonValue; path: string }> = [{ val: parsedJson, path: '$' }];
    while (stack.length) {
      const item = stack.pop()!;
      if (isContainer(item.val)) {
        allPaths.add(item.path);
        if (Array.isArray(item.val)) {
          item.val.forEach((child, idx) => stack.push({ val: child, path: childPath(item.path, idx, true) }));
        } else {
          Object.entries(item.val as { [k: string]: JsonValue }).forEach(([k, child]) => stack.push({ val: child, path: childPath(item.path, k) }));
        }
      }
    }
    setExpandedPaths(allPaths);
  }, [parsedJson, stats.nodes]);

  const handleCollapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const handleTreeKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!visibleRows.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedRowIndex((prev) => Math.min(visibleRows.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedRowIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const current = visibleRows[focusedRowIndex];
      if (current && current.isContainer && !current.isExpanded) {
        toggleNodeExpansion(current.path);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const current = visibleRows[focusedRowIndex];
      if (current && current.isContainer && current.isExpanded) {
        toggleNodeExpansion(current.path);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = visibleRows[focusedRowIndex];
      if (current) handleCopyPath(current.path);
    }
  };

  const handleRepair = () => {
    if (!input.trim()) return;
    try {
      const repaired = repairJson(input);
      setInput(JSON.stringify(JSON.parse(repaired), null, indentStyle === 'tab' ? '\t' : Number(indentStyle)));
      setError(null);
    } catch (e) {
      setError(`Repair could not produce valid JSON: ${e instanceof Error ? e.message : 'Unknown error.'}`);
    }
  };

  const handleRemoveNulls = () => {
    if (parsedJson === null) return;
    const cleaned = removeNullValues(parsedJson);
    setInput(JSON.stringify(cleaned, null, indentStyle === 'tab' ? '\t' : Number(indentStyle)));
  };

  const handleQuery = () => {
    if (parsedJson === null) return;
    try {
      const results = evaluateJsonPath(parsedJson, jsonPath);
      setQueryResult(results);
      setQueryError(results.length ? null : 'No matches found.');
      setQueryCopied(false);
    } catch (e) {
      setQueryResult([]);
      setQueryError(e instanceof Error ? e.message : 'Invalid JSONPath expression.');
    }
  };

  const handleCopyQueryResult = async () => {
    if (!queryResult.length) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(queryResult.length === 1 ? queryResult[0].value : queryResult.map((item) => item.value), null, 2));
      setQueryCopied(true);
      window.setTimeout(() => setQueryCopied(false), 1500);
    } catch {
      setQueryError('Clipboard access was blocked by the browser.');
    }
  };

  const handleCompare = () => {
    if (parsedJson === null) return;
    try {
      const other = JSON.parse(compareInput) as JsonValue;
      setCompareJson(other);
      setDiffs(diffJson(parsedJson, other));
      setCompareError(null);
    } catch (e) {
      setCompareJson(null);
      setDiffs([]);
      setCompareError(parseJsonError(e, compareInput));
    }
  };

  const handleAdvancedCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Clipboard access was blocked by the browser.');
    }
  };

  const handleMinify = () => {
    if (parsedJson !== null) setInput(minifiedOutput);
  };

  const handleFormat = () => {
    if (parsedJson !== null) setInput(formattedOutput);
  };

  const handleCopy = async () => {
    if (parsedJson === null) return;
    try {
      await navigator.clipboard.writeText(formattedOutput);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Clipboard access was blocked by the browser.');
    }
  };

  const handleCopyMinified = async () => {
    if (parsedJson === null) return;
    try {
      await navigator.clipboard.writeText(minifiedOutput);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Clipboard access was blocked by the browser.');
    }
  };

  const handleDownload = () => {
    if (parsedJson === null) return;
    const blob = new Blob([formattedOutput], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanFilename = filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim() || 'formatted-json';
    link.download = cleanFilename.endsWith('.json') ? cleanFilename : `${cleanFilename}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleClear = () => {
    requestRef.current += 1;
    parserTaskRef.current?.dispose();
    parserTaskRef.current = null;
    setInput('');
    setParsedJson(null);
    setError(null);
    setDiagnostics({ duplicateKeys: [], unsafeNumbers: [] });
    setSearchTerm('');
    setCopied(false);
    setQueryResult([]);
    setQueryError(null);
    setJsonPath('$');
    setAdvancedMode('none');
    setCompareInput('');
    setCompareJson(null);
    setCompareError(null);
    setDiffs([]);
    setExpandedPaths(new Set(['$']));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json' && file.type !== '') {
      setError('Please select a valid .json file.');
      return;
    }

    if (file.size > MAX_INPUT_BYTES) {
      setError(`File is larger than the ${formatBytes(MAX_INPUT_BYTES)} browser limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFilename(file.name);
      setInput(String(event.target?.result ?? ''));
    };
    reader.onerror = () => setError('Failed to read the JSON file.');
    reader.readAsText(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const renderPrimitiveValue = (val: JsonPrimitive, selfMatches: boolean) => {
    if (val === null) return <span className="text-amber-600 dark:text-amber-400 font-medium">null</span>;
    if (typeof val === 'boolean') {
      return <span className="text-amber-600 dark:text-amber-400 font-medium">{val ? 'true' : 'false'}</span>;
    }
    if (typeof val === 'number') {
      return <span className="text-emerald-600 dark:text-emerald-400 font-medium">{String(val)}</span>;
    }
    return (
      <span className={`text-blue-600 dark:text-blue-400 break-all ${selfMatches ? 'bg-blue-500/20 rounded px-0.5' : ''}`}>
        &quot;{val}&quot;
      </span>
    );
  };

  const isLargeDocument = stats.nodes > 25_000 || input.length > 1.5 * 1024 * 1024;

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-gray-50 dark:bg-[#0B1120] transition-colors -m-6 md:-m-8 p-6 md:p-8 rounded-3xl min-h-screen">
      {/* LEFT PANE: Raw JSON Editor & Source Controls */}
      <div className="flex flex-col gap-4 lg:w-1/2">
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-200 dark:border-slate-800">
          <h3 className="flex min-w-0 items-center gap-2 pl-1 text-sm font-bold text-slate-900 dark:text-slate-200">
            <FileJson className="w-4 h-4 shrink-0 text-blue-500" />
            <span className="whitespace-nowrap">Raw JSON Input</span>
          </h3>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Open file"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 border border-gray-300 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs font-semibold"
            >
              <Upload className="w-3.5 h-3.5" /> Open
            </button>

            <button
              onClick={handleFormat}
              disabled={parsedJson === null}
              aria-label="Format JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 border border-gray-300 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs font-semibold disabled:opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5" /> Format
            </button>

            <button
              onClick={handleMinify}
              disabled={parsedJson === null}
              aria-label="Minify JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 border border-gray-300 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs font-semibold disabled:opacity-50"
            >
              <Minimize2 className="w-3.5 h-3.5" /> Minify
            </button>

            <button
              onClick={handleClear}
              disabled={!input && parsedJson === null && !error}
              aria-label="Clear input"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-xs font-semibold disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) processFile(file);
          }}
        />

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative flex-grow min-h-[420px] lg:h-[620px] bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-inner ${
            isDragging ? 'border-blue-500 ring-1 ring-blue-500/40' : 'border-gray-200 dark:border-slate-800'
          }`}
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={'Paste your raw JSON payload here...\n{\n  "status": "success",\n  "data": [1, 2, 3]\n}'}
            className="w-full h-full min-h-[420px] lg:min-h-[620px] p-4 bg-transparent focus:outline-none text-slate-700 dark:text-slate-300 font-mono text-sm resize-none [scrollbar-width:thin]"
            spellCheck="false"
            aria-label="Raw JSON textarea"
          />

          {isDragging && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-blue-50/80 dark:bg-blue-950/50 backdrop-blur-sm">
              <div className="text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5" /> Drop JSON file to load
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: Virtualized Inspector & Advanced Tools */}
      <div className="flex flex-col gap-4 lg:w-1/2">
        <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switch */}
            <div className="flex items-center rounded-lg border border-gray-300 dark:border-slate-700 p-0.5 bg-gray-50 dark:bg-[#0B1120]">
              <button
                type="button"
                onClick={() => setViewMode('tree')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Virtual Tree
              </button>
              <button
                type="button"
                onClick={() => setViewMode('raw')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === 'raw'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" /> Raw Code
              </button>
            </div>

            {viewMode === 'tree' && (
              <>
                <button
                  onClick={handleExpandAll}
                  disabled={parsedJson === null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0B1120] px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                  title="Expand Visible Nodes"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Expand
                </button>

                <button
                  onClick={handleCollapseAll}
                  disabled={parsedJson === null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0B1120] px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                  title="Collapse All Nodes"
                >
                  <Shrink className="w-3.5 h-3.5" /> Collapse
                </button>
              </>
            )}

            <div className="ml-auto text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {parsedJson === null
                ? 'Inspector'
                : `${stats.nodes.toLocaleString()} nodes • ${totalRows.toLocaleString()} visible rows`}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search keys and values..."
              className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0B1120] py-2 pl-9 pr-24 text-xs text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              disabled={parsedJson === null}
              aria-label="Search JSON keys and values"
            />
            {searchTerm && parsedJson !== null && (
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {countSearchMatches(parsedJson, searchTerm).toLocaleString()} matches
              </div>
            )}
          </div>

          {/* Formatting & Utilities Toolbar */}
          <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 dark:border-slate-800 pt-2">
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Indent
              <select
                value={indentStyle}
                onChange={(event) => setIndentStyle(event.target.value as '2' | '4' | 'tab')}
                className="rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0B1120] px-2 py-1 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
                aria-label="JSON indentation"
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="tab">Tabs</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => setSortKeysEnabled((value) => !value)}
              disabled={parsedJson === null}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                sortKeysEnabled
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  : 'border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 hover:border-blue-500'
              }`}
              title="Sort object keys recursively"
            >
              <ArrowDownAZ className="w-3.5 h-3.5" /> Sort keys
            </button>

            <button
              type="button"
              onClick={handleRepair}
              disabled={!input.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0B1120] px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors disabled:opacity-50"
              title="Repair common JSON mistakes (comments, single quotes, Python True/False/None)"
            >
              <Wand2 className="w-3.5 h-3.5" /> Repair
            </button>

            <button
              type="button"
              onClick={handleRemoveNulls}
              disabled={parsedJson === null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0B1120] px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors disabled:opacity-50"
              title="Remove null values recursively"
            >
              <Eraser className="w-3.5 h-3.5" /> Clean nulls
            </button>

            <button
              type="button"
              onClick={() => setAdvancedMode(advancedMode === 'compare' ? 'none' : 'compare')}
              disabled={parsedJson === null}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                advancedMode === 'compare'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  : 'border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 hover:border-blue-500'
              }`}
            >
              <GitCompareArrows className="w-3.5 h-3.5" /> Compare
            </button>

            <button
              type="button"
              onClick={() => setAdvancedMode(advancedMode === 'typescript' ? 'none' : 'typescript')}
              disabled={parsedJson === null}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                advancedMode === 'typescript'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  : 'border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 hover:border-blue-500'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> TypeScript
            </button>

            <button
              type="button"
              onClick={() => setAdvancedMode(advancedMode === 'schema' ? 'none' : 'schema')}
              disabled={parsedJson === null}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                advancedMode === 'schema'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  : 'border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 hover:border-blue-500'
              }`}
            >
              <Braces className="w-3.5 h-3.5" /> Schema
            </button>
          </div>

          {/* JSONPath bar */}
          <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 dark:border-slate-800 pt-2">
            <SearchCode className="w-4 h-4 text-blue-500 shrink-0" />
            <input
              value={jsonPath}
              onChange={(event) => setJsonPath(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleQuery();
              }}
              placeholder="JSONPath: $.user.profile.city"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0B1120] px-3 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
              disabled={parsedJson === null}
              aria-label="JSONPath expression"
            />
            <button
              type="button"
              onClick={handleQuery}
              disabled={parsedJson === null}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              Query
            </button>
          </div>

          {/* Export Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 dark:border-slate-800 pt-2">
            <button
              onClick={handleCopyMinified}
              disabled={parsedJson === null}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
            >
              Copy Minified
            </button>

            <button
              onClick={handleDownload}
              disabled={parsedJson === null}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 border border-gray-300 dark:border-slate-700 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs font-semibold disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>

            <button
              onClick={handleCopy}
              disabled={parsedJson === null}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                copied
                  ? 'bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-800/50'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]'
              }`}
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Formatted'}
            </button>
          </div>
        </div>

        {/* Diagnostics Banners: Duplicate Keys & Unsafe Numbers */}
        {diagnostics.duplicateKeys.length > 0 && (
          <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 p-3 rounded-xl text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">
                Duplicate key detected ({diagnostics.duplicateKeys.length} instance{diagnostics.duplicateKeys.length === 1 ? '' : 's'}):
              </span>
              <p>
                Key &quot;{diagnostics.duplicateKeys[0].key}&quot; at line {diagnostics.duplicateKeys[0].line}, column {diagnostics.duplicateKeys[0].col} was previously defined at line {diagnostics.duplicateKeys[0].prevLine}. In accordance with JavaScript Object specification, earlier values are overwritten.
              </p>
            </div>
          </div>
        )}

        {diagnostics.unsafeNumbers.length > 0 && (
          <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 p-3 rounded-xl text-xs">
            <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">
                Potential 64-bit integer precision loss ({diagnostics.unsafeNumbers.length} instance{diagnostics.unsafeNumbers.length === 1 ? '' : 's'}):
              </span>
              <p>
                Integer <code>{diagnostics.unsafeNumbers[0].raw}</code> (line {diagnostics.unsafeNumbers[0].line}) exceeds JavaScript safe integer limit (<code>{Number.MAX_SAFE_INTEGER}</code>) and may be truncated by standard IEEE-754 representation.
              </p>
            </div>
          </div>
        )}

        {/* Large Document Mode Info Banner */}
        {isLargeDocument && (
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="flex items-center gap-1.5 font-medium">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              Large Document Mode active ({stats.nodes.toLocaleString()} nodes). High-performance virtualized rendering enabled.
            </span>
          </div>
        )}

        {/* Advanced Modes Panel: Compare / TypeScript / Schema */}
        {advancedMode !== 'none' && parsedJson !== null && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4">
            {advancedMode === 'compare' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-200">JSON Diff / Compare</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Compare current JSON against another document to inspect differences.</div>
                  </div>
                  <button type="button" onClick={handleCompare} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500">Compare</button>
                </div>
                <textarea value={compareInput} onChange={(e) => setCompareInput(e.target.value)} placeholder="Paste second JSON here..." className="min-h-32 w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-[#0B1120] p-3 font-mono text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500" />
                {compareError && <div className="text-xs text-amber-600 dark:text-amber-400">{compareError}</div>}
                {compareJson !== null && !compareError && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{diffs.length ? `${diffs.length} change${diffs.length === 1 ? '' : 's'} detected` : 'JSON documents are identical'}</div>
                    {diffs.length > 0 && (
                      <div className="max-h-56 overflow-auto rounded-xl border border-gray-200 dark:border-slate-800 divide-y divide-gray-200 dark:divide-slate-800 [scrollbar-width:thin]">
                        {diffs.map((diff) => (
                          <div key={`${diff.kind}-${diff.path}`} className="flex gap-3 p-2.5 text-xs font-mono">
                            <span className={diff.kind === 'added' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : diff.kind === 'removed' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>{diff.kind}</span>
                            <span className="text-slate-600 dark:text-slate-300 break-all">{diff.path}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {advancedMode === 'typescript' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-200">TypeScript Type Generator</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Generate interfaces and types from current JSON structure.</div>
                  </div>
                  <button type="button" onClick={() => handleAdvancedCopy(generateTypeScript(parsedJson))} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500">Copy Types</button>
                </div>
                <pre className="max-h-64 overflow-auto rounded-xl bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-slate-800 p-3 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap [scrollbar-width:thin]">{generateTypeScript(parsedJson)}</pre>
              </div>
            )}
            {advancedMode === 'schema' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-200">JSON Schema Generator</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Generate draft JSON Schema from current sample.</div>
                  </div>
                  <button type="button" onClick={() => handleAdvancedCopy(JSON.stringify(generateJsonSchema(parsedJson), null, 2))} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500">Copy Schema</button>
                </div>
                <pre className="max-h-64 overflow-auto rounded-xl bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-slate-800 p-3 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap [scrollbar-width:thin]">{JSON.stringify(generateJsonSchema(parsedJson), null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* JSONPath Query Results */}
        {(queryError || queryResult.length > 0) && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                JSONPath Result {queryResult.length ? `• ${queryResult.length} match${queryResult.length === 1 ? '' : 'es'}` : ''}
              </div>
              {queryResult.length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyQueryResult}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500"
                >
                  {queryCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {queryCopied ? 'Copied' : 'Copy result'}
                </button>
              )}
            </div>
            {queryError ? (
              <div className="text-xs text-amber-600 dark:text-amber-400">{queryError}</div>
            ) : (
              <pre className="max-h-36 overflow-auto rounded-xl bg-gray-50 dark:bg-[#0B1120] border border-gray-200 dark:border-slate-800 p-3 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all [scrollbar-width:thin]">
                {JSON.stringify(queryResult.length === 1 ? queryResult[0].value : queryResult.map((item) => item.value), null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Node & Depth Stats Card */}
        {parsedJson !== null && !error && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Nodes</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-200">{stats.nodes.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Keys</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-200">{stats.keys.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Depth</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-200">{stats.depth}</div>
            </div>
          </div>
        )}

        {/* MAIN DISPLAY: High-Performance Virtual Tree / Raw Formatted Code */}
        <div className="relative flex-grow min-h-[420px] lg:h-[620px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-inner">
          {/* Syntax Error Box */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="absolute top-0 left-0 right-0 z-20 flex items-start gap-3 bg-red-50 dark:bg-red-950/90 backdrop-blur-sm border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 shadow-lg animate-in fade-in"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <pre className="font-mono text-xs whitespace-pre-wrap break-all overflow-x-auto max-h-56 leading-relaxed [scrollbar-width:thin]">
                {error}
              </pre>
            </div>
          )}

          {isProcessing && !error && (
            <div
              role="status"
              aria-live="polite"
              className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2 bg-blue-50/95 dark:bg-blue-950/90 backdrop-blur-sm border-b border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 p-3"
            >
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-xs font-semibold">Parsing large JSON payload in background...</p>
            </div>
          )}

          {!input.trim() ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 font-mono text-sm p-6 text-center">
              <FileJson className="w-12 h-12 mb-3 opacity-30 text-blue-500" />
              <span>Awaiting JSON payload... Paste or upload above.</span>
            </div>
          ) : parsedJson !== null && !error ? (
            viewMode === 'raw' ? (
              <textarea
                readOnly
                value={formattedOutput}
                className="w-full h-full p-4 bg-transparent font-mono text-xs text-slate-700 dark:text-slate-300 resize-none focus:outline-none [scrollbar-width:thin]"
                aria-label="Raw formatted JSON output"
              />
            ) : (
              /* Virtualized Tree Container */
              <div
                ref={virtualContainerRef}
                tabIndex={0}
                role="tree"
                aria-label="Interactive Virtual JSON Tree"
                onKeyDown={handleTreeKeyDown}
                onScroll={(e) => setScrollTop((e.target as HTMLElement).scrollTop)}
                className="flex-grow overflow-auto p-3 outline-none focus:ring-1 focus:ring-blue-500/20 [scrollbar-width:thin]"
              >
                <div
                  style={{ height: `${totalRows * ROW_HEIGHT}px`, position: 'relative' }}
                  className="w-full font-mono text-xs leading-6"
                >
                  {virtualSlice.map((row, relativeIdx) => {
                    const absoluteIdx = startIndex + relativeIdx;
                    const isFocused = focusedRowIndex === absoluteIdx;
                    const selfMatches = searchIndex.matches.has(row.path);

                    if (row.isClosing) {
                      return (
                        <div
                          key={row.id}
                          role="treeitem"
                          aria-selected={false}
                          aria-level={row.depth + 1}
                          style={{
                            position: 'absolute',
                            top: `${absoluteIdx * ROW_HEIGHT}px`,
                            left: 0,
                            right: 0,
                            height: `${ROW_HEIGHT}px`,
                            paddingLeft: `${row.depth * 18 + 24}px`,
                          }}
                          className="flex items-center text-slate-500 dark:text-slate-400"
                        >
                          <span>{row.isArray ? ']' : '}'}{!row.isLast && ','}</span>
                        </div>
                      );
                    }

                    if (!row.isContainer) {
                      return (
                        <div
                          key={row.id}
                          role="treeitem"
                          aria-selected={isFocused}
                          aria-level={row.depth + 1}
                          onClick={() => setFocusedRowIndex(absoluteIdx)}
                          style={{
                            position: 'absolute',
                            top: `${absoluteIdx * ROW_HEIGHT}px`,
                            left: 0,
                            right: 0,
                            height: `${ROW_HEIGHT}px`,
                            paddingLeft: `${row.depth * 18}px`,
                          }}
                          className={`flex items-center gap-1.5 px-2 rounded cursor-pointer transition-colors ${
                            isFocused
                              ? 'bg-blue-100/60 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="w-5 shrink-0" />
                          <div className="flex items-center gap-1 min-w-0 truncate">
                            {row.keyName !== null && (
                              <span className={`inline-flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold ${selfMatches ? 'bg-blue-500/20 rounded px-0.5' : ''}`}>
                                &quot;{row.keyName}&quot;:
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleCopyPath(row.path);
                                  }}
                                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  title={`Copy JSONPath ${row.path}`}
                                  aria-label={`Copy JSONPath ${row.path}`}
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </span>
                            )}
                            {renderPrimitiveValue(row.value as JsonPrimitive, selfMatches)}
                            {!row.isLast && <span className="text-slate-400 dark:text-slate-500">,</span>}
                          </div>
                        </div>
                      );
                    }

                    const openBracket = row.isArray ? '[' : '{';
                    const closeBracket = row.isArray ? ']' : '}';

                    return (
                      <div
                        key={row.id}
                        role="treeitem"
                        aria-selected={isFocused}
                        aria-expanded={row.isExpanded}
                        aria-level={row.depth + 1}
                        onClick={() => {
                          setFocusedRowIndex(absoluteIdx);
                          if (row.hasChildren) toggleNodeExpansion(row.path);
                        }}
                        style={{
                          position: 'absolute',
                          top: `${absoluteIdx * ROW_HEIGHT}px`,
                          left: 0,
                          right: 0,
                          height: `${ROW_HEIGHT}px`,
                          paddingLeft: `${row.depth * 18}px`,
                        }}
                        className={`flex items-center gap-1 px-2 rounded cursor-pointer select-none transition-colors ${
                          isFocused
                            ? 'bg-blue-100/60 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {row.hasChildren ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNodeExpansion(row.path);
                            }}
                            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                            aria-label={row.isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {row.isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        ) : (
                          <span className="w-5 shrink-0" />
                        )}

                        <div className="flex items-center gap-1 min-w-0 truncate">
                          {row.keyName !== null && (
                            <span className={`inline-flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold ${selfMatches ? 'bg-blue-500/20 rounded px-0.5' : ''}`}>
                              &quot;{row.keyName}&quot;:
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleCopyPath(row.path);
                                }}
                                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                title={`Copy JSONPath ${row.path}`}
                                aria-label={`Copy JSONPath ${row.path}`}
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </span>
                          )}

                          <span className="text-slate-500 dark:text-slate-400">{openBracket}</span>

                          {!row.isExpanded && row.hasChildren && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 mx-1 italic bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {row.isArray ? `${row.itemCount} items` : `${row.itemCount} keys`} …
                            </span>
                          )}

                          {(!row.isExpanded || !row.hasChildren) && (
                            <span className="text-slate-500 dark:text-slate-400">
                              {closeBracket}
                              {!row.isLast && ','}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% In-Browser • Zero data exfiltration</span>
          </div>
          <div>Virtual Viewport Active</div>
        </div>
      </div>
    </div>
  );
}
