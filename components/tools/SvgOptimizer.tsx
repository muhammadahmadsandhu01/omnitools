'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { DragEvent, ChangeEvent, KeyboardEvent } from 'react';
import {
  UploadCloud,
  Copy,
  Download,
  Trash2,
  FileCode2,
  Image as ImageIcon,
  SlidersHorizontal,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Zap,
  AlertTriangle,
  X,
  RefreshCw
} from 'lucide-react';

export type OptimizationMode = 'smart' | 'safe' | 'balanced' | 'maximum' | 'custom';
export type PreviewMode = 'optimized' | 'original';
export type PreviewBg = 'checkerboard' | 'dark' | 'light';

export type SvgAnalysis = {
  valid: boolean;
  type: 'icon' | 'logo' | 'illustration' | 'animated' | 'complex' | 'svg';
  elements: number;
  paths: number;
  groups: number;
  defs: number;
  gradients: number;
  filters: number;
  masks: number;
  styles: number;
  ids: number;
  externalRefs: number;
  scripts: number;
  eventHandlers: number;
  embeddedImages: number;
  animations: number;
  unusedIds: number;
  brokenReferences: number;
  duplicateIds: number;
  javascriptUrls: number;
  foreignObjects: number;
  risk: 'low' | 'medium' | 'high';
  issues: string[];
};

export type OptimizationOptions = {
  removeXml: boolean;
  removeComments: boolean;
  removeEmptyGroups: boolean;
  minifyColors: boolean;
  precision: number;
  mode: OptimizationMode;
  preserveViewBox?: boolean;
};

export type OptimizationResult = {
  svg: string;
  analysis: SvgAnalysis;
  applied: string[];
  skipped: string[];
  warnings: string[];
  healthBefore: number;
  healthAfter: number;
  candidates: number;
  passes: number;
};

// --- RESOURCE LIMITS & BUDGETS ---
const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10 MB budget
const WORKER_TIMEOUT_MS = 15000; // 15 second safety guard
const SVG_NS = 'http://www.w3.org/2000/svg';
const PATH_PARAM_COUNTS: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
const NUMBER_PATTERN = /-?(?:\d+\.\d+|\.\d+|\d+)(?:[eE][+-]?\d+)?/g;

// Helper to count occurrences
const countMatches = (value: string, regex: RegExp) => (value.match(regex) || []).length;

// Number rounding
const roundNumber = (value: string | number, precision: number): string => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return '0';
  const r = Number(n.toFixed(Math.max(0, precision)));
  if (Object.is(r, -0)) return '0';
  return String(r).replace(/^(-?)0\./, '$1.');
};

const roundNumericTokens = (value: string, precision: number): string =>
  value.replace(NUMBER_PATTERN, (m) => roundNumber(m, precision));

// Format path coordinate number
const fmtPathNumber = (n: number, precision: number): string => {
  if (!Number.isFinite(n)) return '0';
  return roundNumber(n, precision)
    .replace(/^(-?)0\./, '$1.')
    .replace(/^(-?)0+\./, '$1.')
    .replace(/\.0+$/, '') || '0';
};

// Compact whitespace without breaking token boundaries
const compactWhitespace = (svg: string): string =>
  svg.replace(/>\s+</g, '><').replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

// --- PATH TOKENIZER & PARSER (Hardened for compact syntax, glued arc flags, signs) ---
export type PathSegment = { cmd: string; values: number[] };

const parsePathData = (d: string): PathSegment[] | null => {
  const segments: PathSegment[] = [];
  let i = 0;
  const len = d.length;

  const skipSpaceAndComma = () => {
    while (i < len) {
      const c = d.charCodeAt(i);
      if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d || c === 0x2c) {
        i++;
      } else {
        break;
      }
    }
  };

  const readFlag = (): number | null => {
    skipSpaceAndComma();
    if (i >= len) return null;
    const c = d[i];
    if (c === '0' || c === '1') {
      i++;
      return c === '1' ? 1 : 0;
    }
    return null;
  };

  const readNumber = (): number | null => {
    skipSpaceAndComma();
    if (i >= len) return null;
    const start = i;
    const ch = d[i];
    if (ch === '+' || ch === '-') {
      i++;
    }
    let hasDigits = false;
    while (i < len && d[i] >= '0' && d[i] <= '9') {
      hasDigits = true;
      i++;
    }
    if (i < len && d[i] === '.') {
      i++;
      while (i < len && d[i] >= '0' && d[i] <= '9') {
        hasDigits = true;
        i++;
      }
    }
    if (!hasDigits) {
      i = start;
      return null;
    }
    if (i < len && (d[i] === 'e' || d[i] === 'E')) {
      const eIdx = i;
      i++;
      if (i < len && (d[i] === '+' || d[i] === '-')) {
        i++;
      }
      let hasExpDigits = false;
      while (i < len && d[i] >= '0' && d[i] <= '9') {
        hasExpDigits = true;
        i++;
      }
      if (!hasExpDigits) {
        i = eIdx; // roll back exponent if malformed
      }
    }
    const val = Number(d.slice(start, i));
    return Number.isFinite(val) ? val : null;
  };

  let currentCmd = '';
  while (i < len) {
    skipSpaceAndComma();
    if (i >= len) break;

    const ch = d[i];
    if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) {
      currentCmd = ch;
      i++;
    } else if (!currentCmd) {
      i++;
      continue;
    }

    const upper = currentCmd.toUpperCase();
    const count = PATH_PARAM_COUNTS[upper];
    if (count === undefined) break;

    if (upper === 'Z') {
      segments.push({ cmd: currentCmd, values: [] });
      currentCmd = '';
      continue;
    }

    let first = true;
    while (i < len) {
      skipSpaceAndComma();
      if (i >= len) break;
      const nextChar = d[i];
      if ((nextChar >= 'A' && nextChar <= 'Z') || (nextChar >= 'a' && nextChar <= 'z')) {
        break; // New command found
      }

      const vals: number[] = [];
      let ok = true;

      for (let p = 0; p < count; p++) {
        let n: number | null;
        if (upper === 'A' && (p === 3 || p === 4)) {
          n = readFlag();
        } else {
          n = readNumber();
        }
        if (n === null) {
          ok = false;
          break;
        }
        vals.push(n);
      }

      if (!ok) break;

      let cmdToEmit = currentCmd;
      if (first) {
        first = false;
      } else if (upper === 'M') {
        cmdToEmit = currentCmd === 'm' ? 'l' : 'L';
      }

      segments.push({ cmd: cmdToEmit, values: vals });
    }
  }

  return segments.length > 0 ? segments : null;
};

// Normalize path segments to absolute coordinates
const normalizePathToAbsolute = (d: string): PathSegment[] | null => {
  const parsed = parsePathData(d);
  if (!parsed || !parsed.length) return null;

  const out: PathSegment[] = [];
  let cx = 0, cy = 0, sx = 0, sy = 0;

  for (let idx = 0; idx < parsed.length; idx++) {
    const { cmd, values } = parsed[idx];
    const isRel = cmd === cmd.toLowerCase() && cmd !== 'z';
    const upper = cmd.toUpperCase();

    if (upper === 'Z') {
      out.push({ cmd: 'Z', values: [] });
      cx = sx;
      cy = sy;
      continue;
    }

    let absCmd = upper;
    let absVals: number[] = [];

    if (upper === 'M') {
      const x = isRel ? cx + values[0] : values[0];
      const y = isRel ? cy + values[1] : values[1];
      absCmd = 'M';
      absVals = [x, y];
      cx = x; cy = y; sx = x; sy = y;
    } else if (upper === 'L') {
      const x = isRel ? cx + values[0] : values[0];
      const y = isRel ? cy + values[1] : values[1];
      absCmd = 'L';
      absVals = [x, y];
      cx = x; cy = y;
    } else if (upper === 'H') {
      const x = isRel ? cx + values[0] : values[0];
      absCmd = 'H';
      absVals = [x];
      cx = x;
    } else if (upper === 'V') {
      const y = isRel ? cy + values[0] : values[0];
      absCmd = 'V';
      absVals = [y];
      cy = y;
    } else if (upper === 'C') {
      const x1 = isRel ? cx + values[0] : values[0];
      const y1 = isRel ? cy + values[1] : values[1];
      const x2 = isRel ? cx + values[2] : values[2];
      const y2 = isRel ? cy + values[3] : values[3];
      const x = isRel ? cx + values[4] : values[4];
      const y = isRel ? cy + values[5] : values[5];
      absCmd = 'C';
      absVals = [x1, y1, x2, y2, x, y];
      cx = x; cy = y;
    } else if (upper === 'S') {
      const x2 = isRel ? cx + values[0] : values[0];
      const y2 = isRel ? cy + values[1] : values[1];
      const x = isRel ? cx + values[2] : values[2];
      const y = isRel ? cy + values[3] : values[3];
      absCmd = 'S';
      absVals = [x2, y2, x, y];
      cx = x; cy = y;
    } else if (upper === 'Q') {
      const x1 = isRel ? cx + values[0] : values[0];
      const y1 = isRel ? cy + values[1] : values[1];
      const x = isRel ? cx + values[2] : values[2];
      const y = isRel ? cy + values[3] : values[3];
      absCmd = 'Q';
      absVals = [x1, y1, x, y];
      cx = x; cy = y;
    } else if (upper === 'T') {
      const x = isRel ? cx + values[0] : values[0];
      const y = isRel ? cy + values[1] : values[1];
      absCmd = 'T';
      absVals = [x, y];
      cx = x; cy = y;
    } else if (upper === 'A') {
      const rx = values[0];
      const ry = values[1];
      const rot = values[2];
      const largeArc = values[3] ? 1 : 0;
      const sweep = values[4] ? 1 : 0;
      const x = isRel ? cx + values[5] : values[5];
      const y = isRel ? cy + values[6] : values[6];
      absCmd = 'A';
      absVals = [rx, ry, rot, largeArc, sweep, x, y];
      cx = x; cy = y;
    }

    out.push({ cmd: absCmd, values: absVals });
  }

  return out;
};

// Serialize path segments with relative / compact / H/V options
const serializePathSegments = (segments: PathSegment[], precision: number, relative: boolean, hv: boolean): string => {
  let cx = 0, cy = 0, sx = 0, sy = 0;
  const out: string[] = [];
  let prevCmd = '';

  for (const seg of segments) {
    const cmd = seg.cmd;
    const v = seg.values;

    if (cmd === 'Z') {
      out.push('Z');
      prevCmd = 'Z';
      cx = sx; cy = sy;
      continue;
    }

    let letter = relative ? cmd.toLowerCase() : cmd;
    let vals: number[] = [];

    if (cmd === 'M') {
      const x = v[0], y = v[1];
      vals = relative && out.length > 0 ? [x - cx, y - cy] : [x, y];
      letter = relative && out.length > 0 ? 'm' : 'M';
      cx = x; cy = y; sx = x; sy = y;
    } else if (cmd === 'L' || cmd === 'H' || cmd === 'V') {
      const x = cmd === 'V' ? cx : v[0];
      const y = cmd === 'H' ? cy : (cmd === 'V' ? v[0] : v[1]);
      if (hv) {
        if (Math.abs(x - cx) < 1e-7) {
          letter = relative ? 'v' : 'V';
          vals = [relative ? y - cy : y];
        } else if (Math.abs(y - cy) < 1e-7) {
          letter = relative ? 'h' : 'H';
          vals = [relative ? x - cx : x];
        } else {
          letter = relative ? 'l' : 'L';
          vals = relative ? [x - cx, y - cy] : [x, y];
        }
      } else {
        letter = relative ? 'l' : 'L';
        vals = relative ? [x - cx, y - cy] : [x, y];
      }
      cx = x; cy = y;
    } else if (cmd === 'C') {
      vals = relative
        ? [v[0] - cx, v[1] - cy, v[2] - cx, v[3] - cy, v[4] - cx, v[5] - cy]
        : v;
      cx = v[4]; cy = v[5];
    } else if (cmd === 'S') {
      vals = relative
        ? [v[0] - cx, v[1] - cy, v[2] - cx, v[3] - cy]
        : v;
      cx = v[2]; cy = v[3];
    } else if (cmd === 'Q') {
      vals = relative
        ? [v[0] - cx, v[1] - cy, v[2] - cx, v[3] - cy]
        : v;
      cx = v[2]; cy = v[3];
    } else if (cmd === 'T') {
      vals = relative
        ? [v[0] - cx, v[1] - cy]
        : v;
      cx = v[0]; cy = v[1];
    } else if (cmd === 'A') {
      vals = relative
        ? [v[0], v[1], v[2], v[3] ? 1 : 0, v[4] ? 1 : 0, v[5] - cx, v[6] - cy]
        : [v[0], v[1], v[2], v[3] ? 1 : 0, v[4] ? 1 : 0, v[5], v[6]];
      cx = v[5]; cy = v[6];
    }

    const fmtVals = (letter.toUpperCase() === 'A')
      ? [
          fmtPathNumber(vals[0], precision),
          fmtPathNumber(vals[1], precision),
          fmtPathNumber(vals[2], precision),
          vals[3] ? '1' : '0',
          vals[4] ? '1' : '0',
          fmtPathNumber(vals[5], precision),
          fmtPathNumber(vals[6], precision)
        ]
      : vals.map((n) => fmtPathNumber(n, precision));

    if (letter !== 'Z' && letter === prevCmd && letter !== 'M' && letter !== 'm') {
      out.push(...fmtVals);
    } else {
      out.push(letter + (fmtVals.length ? ' ' + fmtVals.join(' ') : ''));
    }
    prevCmd = letter;
  }

  return out.join(' ')
    .replace(/([A-Za-z])\s+/g, '$1')
    .replace(/\s+([A-Za-z])/g, '$1')
    .replace(/\s+-/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
};

const compactPathFallback = (value: string, precision: number): string => {
  let d = roundNumericTokens(value, precision).replace(/,/g, ' ');
  d = d.replace(/\s+/g, ' ').trim();
  d = d.replace(/\s*([A-Za-z])\s*/g, '$1');
  d = d.replace(/\s+-/g, '-');
  return d;
};

const optimizePathData = (value: string, precision: number): string => {
  const parsed = normalizePathToAbsolute(value);
  if (!parsed || !parsed.length) return compactPathFallback(value, precision);
  const candidates = [
    serializePathSegments(parsed, precision, false, false),
    serializePathSegments(parsed, precision, true, false),
    serializePathSegments(parsed, precision, false, true),
    serializePathSegments(parsed, precision, true, true),
  ].filter((c) => {
    if (!c) return false;
    const reParsed = normalizePathToAbsolute(c);
    return reParsed !== null && reParsed.length > 0;
  });

  const best = candidates.reduce((a, b) => b.length < a.length ? b : a, candidates[0] || '');
  return best && best.length <= value.length ? best : compactPathFallback(value, precision);
};

// --- SAFE COLOR MINIFICATION (SVG 1.1 COMPATIBLE, NO #RGBA/#RRGGBBAA) ---
const minifyColorDirect = (val: string): string => {
  const trimmed = val.trim();
  if (/^(?:currentColor|inherit|none|transparent)$/i.test(trimmed)) return val;
  if (/^(?:url|var)\(/i.test(trimmed)) return val;

  const lower = trimmed.toLowerCase();
  if (lower === 'white') return '#fff';
  if (lower === 'black') return '#000';
  if (lower === 'fuchsia') return '#f0f';
  if (lower === 'yellow') return '#ff0';

  let out = trimmed.replace(/#([0-9a-fA-F]{6})\b/g, (_m, hex) => {
    const h = hex.toLowerCase();
    return h[0] === h[1] && h[2] === h[3] && h[4] === h[5] ? `#${h[0]}${h[2]}${h[4]}` : `#${h}`;
  });

  // Preserve rgba format if alpha < 1, or convert to hex if alpha >= 1
  out = out.replace(/rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)(?:\s*[,/]\s*([\d.]+%?)\s*)?\s*\)/gi, (m, r, g, b, alpha) => {
    const rr = Number(r), gg = Number(g), bb = Number(b);
    if ([rr, gg, bb].some((n) => !Number.isFinite(n) || n < 0 || n > 255)) return m;
    if (alpha === undefined) {
      const hex = [rr, gg, bb].map((n) => n.toString(16).padStart(2, '0')).join('');
      return hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5] ? `#${hex[0]}${hex[2]}${hex[4]}` : `#${hex}`;
    }
    const raw = String(alpha);
    const a = raw.endsWith('%') ? Number(raw.slice(0, -1)) / 100 : Number(raw);
    if (!Number.isFinite(a)) return m;
    if (a >= 1) {
      const hex = [rr, gg, bb].map((n) => n.toString(16).padStart(2, '0')).join('');
      return hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5] ? `#${hex[0]}${hex[2]}${hex[4]}` : `#${hex}`;
    }
    if (a <= 0) return 'transparent';
    return `rgba(${rr},${gg},${bb},${a})`; // Strictly SVG 1.1 safe
  });

  return out;
};

// --- CONTEXT-AWARE CSS MINIFIER (PROTECTS ID SELECTORS, URLS, STRINGS) ---
const minifyCssSafely = (css: string, precision: number): string => {
  // Strip comments
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (!clean) return '';

  // If there are no braces, treat as inline style declarations
  if (!clean.includes('{')) {
    const decls = clean.split(';').map((d) => d.trim()).filter(Boolean);
    const minDecls = decls.map((decl) => {
      const colon = decl.indexOf(':');
      if (colon === -1) return decl;
      const prop = decl.slice(0, colon).trim().toLowerCase();
      let val = decl.slice(colon + 1).trim();

      if (/^(?:fill|stroke|color|background(?:-color)?|stop-color|flood-color|lighting-color|border-color|outline-color)$/i.test(prop)) {
        val = minifyColorDirect(val);
      } else {
        val = roundNumericTokens(val, precision);
      }
      return `${prop}:${val}`;
    });
    return minDecls.join(';');
  }

  let result = '';
  let i = 0;
  const len = clean.length;

  while (i < len) {
    const openBrace = clean.indexOf('{', i);
    if (openBrace === -1) {
      result += clean.slice(i).trim();
      break;
    }

    const selector = clean.slice(i, openBrace).trim();
    let closeBrace = -1;
    let depth = 1;
    let j = openBrace + 1;
    while (j < len && depth > 0) {
      if (clean[j] === '{') depth++;
      else if (clean[j] === '}') depth--;
      j++;
    }
    closeBrace = j - 1;

    const body = clean.slice(openBrace + 1, closeBrace).trim();
    i = closeBrace + 1;

    // Selector: compact spaces, never replace #id as color!
    const cleanSelector = selector
      .replace(/\s*([,>+~])\s*/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    // Declarations: only minify colors in color-bearing properties
    const decls = body.split(';').map((d) => d.trim()).filter(Boolean);
    const minDecls = decls.map((decl) => {
      const colon = decl.indexOf(':');
      if (colon === -1) return decl;
      const prop = decl.slice(0, colon).trim().toLowerCase();
      let val = decl.slice(colon + 1).trim();

      if (/^(?:fill|stroke|color|background(?:-color)?|stop-color|flood-color|lighting-color|border-color|outline-color)$/i.test(prop)) {
        val = minifyColorDirect(val);
      } else {
        val = roundNumericTokens(val, precision);
      }
      return `${prop}:${val}`;
    });

    result += `${cleanSelector}{${minDecls.join(';')}}`;
  }

  return result.replace(/\s+/g, ' ').trim();
};

// --- TRANSFORM OPTIMIZER ---
const compactTransform = (value: string, precision: number): string => {
  let out = roundNumericTokens(value, precision).replace(/\s*,\s*/g, ' ').replace(/\s+/g, ' ').trim();
  out = out.replace(/(?:translate|scale|rotate|skewX|skewY|matrix)\(\s*([^)]*)\)/gi, (full, args) => `${full.split('(')[0]}(${String(args).trim()})`);
  out = out.replace(/(?:translate\(0(?:\s+0)?\)|scale\(1(?:\s+1)?\)|rotate\(0(?:\s+0(?:\s+0)?)?\)|skewX\(0\)|skewY\(0\)|matrix\(1\s+0\s+0\s+1\s+0\s+0\))/gi, '');
  return out.replace(/\s{2,}/g, ' ').trim();
};

const optimizeTransforms = (value: string, precision: number): string => {
  const compact = compactTransform(value, precision);
  const re = /(matrix|translate|scale|rotate|skewX|skewY)\(([^)]*)\)/gi;
  const items = [...compact.matchAll(re)];
  if (items.length <= 1) return compact;

  let m = [1, 0, 0, 1, 0, 0];
  const mul = (a: number[], b: number[]) => [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5]
  ];

  for (const item of items) {
    const name = item[1].toLowerCase();
    const a = item[2].trim().split(/[ ,]+/).map(Number);
    if (a.some((n) => !Number.isFinite(n))) return compact;
    let x: number[] | null = null;
    if (name === 'matrix' && a.length === 6) x = a;
    else if (name === 'translate') x = [1, 0, 0, 1, a[0] || 0, a[1] || 0];
    else if (name === 'scale') x = [a[0] ?? 1, 0, 0, a[1] ?? a[0] ?? 1, 0, 0];
    else if (name === 'rotate') {
      const rad = ((a[0] || 0) * Math.PI) / 180;
      const c = Math.cos(rad);
      const s = Math.sin(rad);
      const r = [c, s, -s, c, 0, 0];
      if (a.length >= 3) {
        const [ox, oy] = [a[1], a[2]];
        x = mul(mul([1, 0, 0, 1, ox, oy], r), [1, 0, 0, 1, -ox, -oy]);
      } else x = r;
    } else if (name === 'skewx') x = [1, 0, Math.tan(((a[0] || 0) * Math.PI) / 180), 1, 0, 0];
    else if (name === 'skewy') x = [1, Math.tan(((a[0] || 0) * Math.PI) / 180), 0, 1, 0, 0];
    if (!x || x.some((n) => !Number.isFinite(n))) return compact;
    m = mul(m, x);
  }

  const matrix = `matrix(${m.map((v) => fmtPathNumber(v, precision)).join(' ')})`;
  return matrix.length < compact.length ? matrix : compact;
};

// --- ALPHA / COMPOSITING SENSITIVITY DETECTION ---
const isAlphaOrCompositingSensitive = (el: Element): boolean => {
  // Check element attributes
  const opacityAttr = el.getAttribute('opacity');
  if (opacityAttr !== null && Number(opacityAttr) < 1) return true;

  const fillOpacity = el.getAttribute('fill-opacity');
  if (fillOpacity !== null && Number(fillOpacity) < 1) return true;

  const strokeOpacity = el.getAttribute('stroke-opacity');
  if (strokeOpacity !== null && Number(strokeOpacity) < 1) return true;

  // Check inline styles
  const style = el.getAttribute('style') || '';
  if (style) {
    if (/opacity\s*:\s*(?!1(?:\.0+)?(?:;|$|\s))/i.test(style)) return true;
    if (/fill-opacity\s*:\s*(?!1(?:\.0+)?(?:;|$|\s))/i.test(style)) return true;
    if (/stroke-opacity\s*:\s*(?!1(?:\.0+)?(?:;|$|\s))/i.test(style)) return true;
    if (/rgba\(|hsla\(/i.test(style)) return true;
    if (/mix-blend-mode|isolation/i.test(style)) return true;
  }

  // Check fill / stroke color alpha
  const fill = el.getAttribute('fill') || '';
  if (/rgba\(|hsla\(/i.test(fill)) return true;
  if (/^#(?:[0-9a-fA-F]{4}|[0-9a-fA-F]{8})$/.test(fill)) return true;

  const stroke = el.getAttribute('stroke') || '';
  if (/rgba\(|hsla\(/i.test(stroke)) return true;
  if (/^#(?:[0-9a-fA-F]{4}|[0-9a-fA-F]{8})$/.test(stroke)) return true;

  // Check compositing effects
  if (el.hasAttribute('filter') || el.hasAttribute('mask') || el.hasAttribute('clip-path')) return true;

  // Check ancestor opacity / compositing
  let parent = el.parentElement;
  while (parent && parent.localName !== 'svg') {
    const pOp = parent.getAttribute('opacity');
    if (pOp !== null && Number(pOp) < 1) return true;
    if (parent.hasAttribute('filter') || parent.hasAttribute('mask') || parent.hasAttribute('clip-path')) return true;
    parent = parent.parentElement;
  }

  return false;
};

// --- REFERENCE GRAPH COLLECTION ---
const collectReferences = (root: Element) => {
  const ids = new Set<string>();
  const idCounts = new Map<string, number>();
  const refs = new Set<string>();
  const externalRefs = new Set<string>();
  let javascriptUrls = 0;
  let foreignObjects = 0;

  // Collect IDs from root and all descendants
  const allElements = [root, ...Array.from(root.querySelectorAll('*'))];
  for (const el of allElements) {
    const id = el.getAttribute('id');
    if (id) {
      ids.add(id);
      idCounts.set(id, (idCounts.get(id) || 0) + 1);
    }
  }

  foreignObjects = root.querySelectorAll('foreignObject').length;

  for (const el of allElements) {
    for (const attr of Array.from(el.attributes)) {
      const val = attr.value;
      const valLower = val.trim().toLowerCase();

      for (const match of val.matchAll(/url\(\s*#([^\s)]+)\s*\)/g)) {
        refs.add(match[1]);
      }

      if (attr.name === 'href' || attr.name === 'xlink:href') {
        if (val.startsWith('#')) {
          refs.add(val.slice(1));
        } else if (valLower.startsWith('javascript:')) {
          javascriptUrls++;
        } else if (/^(?:https?:|data:|\/\/)/i.test(val)) {
          externalRefs.add(val);
        }
      }

      if (attr.name === 'aria-labelledby' || attr.name === 'aria-describedby') {
        val.trim().split(/\s+/).forEach((idToken) => {
          if (idToken) refs.add(idToken);
        });
      }

      if (/url\(\s*(?:https?:|data:|\/\/)/i.test(val)) {
        externalRefs.add(val);
      }
    }
  }

  root.querySelectorAll('style').forEach((style) => {
    const text = style.textContent || '';
    for (const m of text.matchAll(/url\(\s*#([^\s)]+)\s*\)/g)) {
      refs.add(m[1]);
    }
    for (const m of text.matchAll(/#([a-zA-Z0-9_-]+)/g)) {
      refs.add(m[1]);
    }
  });

  let duplicateIds = 0;
  idCounts.forEach((count) => {
    if (count > 1) duplicateIds += (count - 1);
  });

  return { ids, refs, externalRefs, duplicateIds, javascriptUrls, foreignObjects };
};

// --- PREVIEW SANITIZER (INSPECTS ROOT AND DESCENDANTS) ---
export const sanitizeSvgForPreview = (rawSvg: string): string => {
  if (!rawSvg || !rawSvg.trim()) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
    if (doc.querySelector('parsererror') || doc.documentElement?.localName?.toLowerCase() !== 'svg') {
      return '';
    }
    const root = doc.documentElement;

    const dangerousTagSet = new Set(['script', 'foreignobject', 'iframe', 'object', 'embed', 'applet', 'meta', 'link', 'audio', 'video', 'set', 'handler', 'listener']);
    Array.from(root.querySelectorAll('*')).forEach((el) => {
      if (dangerousTagSet.has(el.localName.toLowerCase())) {
        el.remove();
      }
    });

    // INSPECT ROOT <svg> AND ALL DESCENDANTS
    const all = [root, ...Array.from(root.querySelectorAll('*'))];
    all.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const val = attr.value.trim().toLowerCase();

        // Strip ALL on* event handlers (onload, onerror, onclick, etc.) on root and children
        if (name.startsWith('on') || name.includes(':on')) {
          el.removeAttribute(attr.name);
          return;
        }

        // Neutralize target attributes that could attempt parent navigation
        if (name === 'target') {
          el.removeAttribute(attr.name);
          return;
        }

        // Neutralize SMIL attribute injection targeting event handlers or links
        if (name === 'attributename' && (val.startsWith('on') || val.includes('href'))) {
          el.removeAttribute(attr.name);
          return;
        }

        if (name === 'href' || name === 'xlink:href' || name === 'src' || name === 'action') {
          if (
            val.startsWith('javascript:') ||
            val.startsWith('vbscript:') ||
            val.startsWith('data:text/html') ||
            val.startsWith('data:text/javascript') ||
            val.startsWith('http://') ||
            val.startsWith('https://')
          ) {
            el.removeAttribute(attr.name);
            return;
          }
        }

        if (name === 'style') {
          if (/expression\s*\(|javascript\s*:|vbscript\s*:|behavior\s*:/i.test(attr.value)) {
            el.removeAttribute(attr.name);
            return;
          }
        }
      });
    });

    root.querySelectorAll('style').forEach((st) => {
      const text = st.textContent || '';
      if (/expression\s*\(|javascript\s*:|behavior\s*:/i.test(text)) {
        st.textContent = text
          .replace(/expression\s*\([^)]*\)/gi, 'none')
          .replace(/javascript\s*:[^;}]*/gi, 'none')
          .replace(/behavior\s*:[^;}]*/gi, 'none');
      }
    });

    if (!root.getAttribute('xmlns')) {
      root.setAttribute('xmlns', SVG_NS);
    }

    return new XMLSerializer().serializeToString(doc);
  } catch {
    return '';
  }
};

// --- OPTIMIZATION PASSES ---

// Convert simple shapes to paths safely
const convertSimpleShapesToPaths = (root: Element, applied: string[]) => {
  let converted = 0;
  root.querySelectorAll('line,polyline,polygon,rect,circle,ellipse').forEach((el) => {
    if (
      el.hasAttribute('id') ||
      el.hasAttribute('class') ||
      el.hasAttribute('style') ||
      el.hasAttribute('transform') ||
      el.hasAttribute('vector-effect') ||
      el.hasAttribute('clip-path') ||
      el.hasAttribute('mask') ||
      el.hasAttribute('filter') ||
      el.hasAttribute('marker-start') ||
      el.hasAttribute('marker-mid') ||
      el.hasAttribute('marker-end')
    ) return;

    const tag = el.localName.toLowerCase();
    const numeric = (name: string) => {
      const raw = el.getAttribute(name);
      return raw !== null && /^[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?$/.test(raw.trim());
    };
    const n = (name: string, fallback = 0) => Number(el.getAttribute(name) ?? fallback);
    let d = '';

    if (tag === 'line') {
      if (!['x1', 'y1', 'x2', 'y2'].every(numeric)) return;
      d = `M${n('x1')} ${n('y1')}L${n('x2')} ${n('y2')}`;
    } else if (tag === 'polygon' || tag === 'polyline') {
      const points = (el.getAttribute('points') || '').trim().replace(/,/g, ' ').replace(/\s+/g, ' ');
      const nums = points.match(NUMBER_PATTERN) || [];
      if (nums.length < 4 || nums.length % 2) return;
      d = `M${nums[0]} ${nums[1]}${nums.slice(2).map((v, i, a) => i % 2 === 0 ? `L${v} ${a[i + 1]}` : '').join('')}${tag === 'polygon' ? 'Z' : ''}`;
    } else if (tag === 'rect') {
      if (el.hasAttribute('rx') || el.hasAttribute('ry') || !['x', 'y', 'width', 'height'].every(numeric)) return;
      const x = n('x'), y = n('y'), w = n('width'), h = n('height');
      if (w <= 0 || h <= 0) return;
      d = `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
    } else if (tag === 'circle' || tag === 'ellipse') {
      if (!(tag === 'circle' ? ['cx', 'cy', 'r'].every(numeric) : ['cx', 'cy', 'rx', 'ry'].every(numeric))) return;
      const cx = n('cx'), cy = n('cy');
      const rx = tag === 'circle' ? n('r') : n('rx');
      const ry = tag === 'circle' ? rx : n('ry');
      if (rx <= 0 || ry <= 0) return;
      d = `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
    }

    if (!d) return;
    const pathEl = el.ownerDocument!.createElementNS(SVG_NS, 'path');
    Array.from(el.attributes).forEach((a) => pathEl.setAttribute(a.name, a.value));
    pathEl.setAttribute('d', d);
    pathEl.removeAttribute('points'); pathEl.removeAttribute('x'); pathEl.removeAttribute('y');
    pathEl.removeAttribute('x1'); pathEl.removeAttribute('x2'); pathEl.removeAttribute('y1'); pathEl.removeAttribute('y2');
    pathEl.removeAttribute('width'); pathEl.removeAttribute('height'); pathEl.removeAttribute('rx'); pathEl.removeAttribute('ry');
    pathEl.removeAttribute('cx'); pathEl.removeAttribute('cy'); pathEl.removeAttribute('r');
    el.parentNode?.replaceChild(pathEl, el);
    converted++;
  });
  if (converted) applied.push(`Converted ${converted} unstyled simple shape(s) to candidate paths`);
};

// Remove hidden elements
const removeHiddenElements = (root: Element, applied: string[]) => {
  let removed = 0;
  const { refs } = collectReferences(root);
  root.querySelectorAll('*').forEach((el) => {
    const display = (el.getAttribute('display') || '').trim().toLowerCase();
    const visibility = (el.getAttribute('visibility') || '').trim().toLowerCase();
    if (display !== 'none' && visibility !== 'hidden') return;
    if (el.closest('defs')) return;
    const ids = [el.getAttribute('id'), ...Array.from(el.querySelectorAll('[id]')).map((x) => x.getAttribute('id'))].filter(Boolean) as string[];
    if (ids.some((id) => refs.has(id))) return;
    if (el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') || el.hasAttribute('role')) return;
    el.remove();
    removed++;
  });
  if (removed) applied.push(`Removed ${removed} explicitly hidden unreferenced element(s)`);
};

// P0 FIX: mergeSafeStrokePaths (No infinite loop, normalized geometry)
const mergeSafeStrokePaths = (root: Element, applied: string[]) => {
  let merged = 0;
  const parents = [root, ...Array.from(root.querySelectorAll('g'))];

  for (const parent of parents) {
    const children = Array.from(parent.children);
    let i = 0;
    let iterationGuard = 0;
    const maxIterations = children.length * 2 + 10;

    while (i < children.length - 1 && iterationGuard++ < maxIterations) {
      const a = children[i];
      const b = children[i + 1];
      if (!a || !b || a.localName !== 'path' || b.localName !== 'path') {
        i++;
        continue;
      }
      if (
        a.hasAttribute('id') || b.hasAttribute('id') ||
        a.hasAttribute('class') || b.hasAttribute('class') ||
        a.hasAttribute('style') || b.hasAttribute('style') ||
        a.hasAttribute('clip-path') || b.hasAttribute('clip-path') ||
        a.hasAttribute('mask') || b.hasAttribute('mask') ||
        a.hasAttribute('filter') || b.hasAttribute('filter') ||
        a.hasAttribute('marker-start') || b.hasAttribute('marker-start') ||
        a.hasAttribute('marker-mid') || b.hasAttribute('marker-mid') ||
        a.hasAttribute('marker-end') || b.hasAttribute('marker-end')
      ) {
        i++;
        continue;
      }

      const fillA = (a.getAttribute('fill') || '').trim().toLowerCase();
      const fillB = (b.getAttribute('fill') || '').trim().toLowerCase();
      if (fillA !== 'none' || fillB !== 'none') {
        i++;
        continue;
      }

      const ad = a.getAttribute('d') || '';
      const bd = b.getAttribute('d') || '';
      if (!ad || !bd) {
        i++;
        continue;
      }

      const comparableA = Array.from(a.attributes).filter((x) => x.name !== 'd').map((x) => `${x.name}=${x.value}`).sort().join(';');
      const comparableB = Array.from(b.attributes).filter((x) => x.name !== 'd').map((x) => `${x.name}=${x.value}`).sort().join(';');
      if (comparableA !== comparableB) {
        i++;
        continue;
      }

      // NORMALIZE BOTH PATHS TO ABSOLUTE TO PREVENT RELATIVE MOVETO CORRUPTION
      const segA = normalizePathToAbsolute(ad);
      const segB = normalizePathToAbsolute(bd);
      if (!segA || !segB) {
        i++;
        continue; // Fallback: preserve original if parsing is not proven safe
      }

      const combinedSegments = [...segA, ...segB];
      const mergedD = serializePathSegments(combinedSegments, 3, false, false);
      if (!mergedD) {
        i++;
        continue;
      }

      a.setAttribute('d', mergedD);
      b.remove();
      children.splice(i + 1, 1); // UPDATE ITERATION STATE PROPERLY
      merged++;
      // Do not increment i; test if a can merge with the next sibling that slid into i + 1
    }
  }

  if (merged) applied.push(`Merged ${merged} compatible stroke-only path pair(s)`);
};

// P0 FIX: mergeDuplicatePaths (Refuses merge if alpha/compositing sensitive)
const mergeDuplicatePaths = (root: Element, applied: string[]) => {
  let count = 0;
  const parents = [root, ...Array.from(root.querySelectorAll('g'))];

  for (const parent of parents) {
    const children = Array.from(parent.children);
    let i = 0;
    while (i < children.length - 1) {
      const a = children[i];
      const b = children[i + 1];
      if (!a || !b || a.localName !== 'path' || b.localName !== 'path') {
        i++;
        continue;
      }
      if (
        a.hasAttribute('id') || b.hasAttribute('id') ||
        a.hasAttribute('class') || b.hasAttribute('class') ||
        a.hasAttribute('style') || b.hasAttribute('style') ||
        a.hasAttribute('clip-path') || b.hasAttribute('clip-path') ||
        a.hasAttribute('mask') || b.hasAttribute('mask') ||
        a.hasAttribute('filter') || b.hasAttribute('filter')
      ) {
        i++;
        continue;
      }

      // CRITICAL P0: Cumulative alpha / compositing check!
      if (isAlphaOrCompositingSensitive(a) || isAlphaOrCompositingSensitive(b)) {
        i++;
        continue; // DO NOT collapse duplicate paths if opacity < 1 !
      }

      const ad = a.getAttribute('d') || '';
      const bd = b.getAttribute('d') || '';
      if (!ad || ad !== bd) {
        i++;
        continue;
      }

      const aAttrs = Array.from(a.attributes).filter((x) => x.name !== 'd').map((x) => `${x.name}=${x.value}`).sort().join(';');
      const bAttrs = Array.from(b.attributes).filter((x) => x.name !== 'd').map((x) => `${x.name}=${x.value}`).sort().join(';');
      if (aAttrs !== bAttrs) {
        i++;
        continue;
      }

      b.remove();
      children.splice(i + 1, 1);
      count++;
    }
  }

  if (count) applied.push(`Removed ${count} identical consecutive opaque sibling path(s)`);
};

// Remove comments
const stripCommentsPass = (doc: Document, applied: string[]) => {
  const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_COMMENT);
  const nodes: Comment[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Comment);
  nodes.forEach((n) => n.parentNode?.removeChild(n));
  if (nodes.length) applied.push(`Removed ${nodes.length} comment(s)`);
};

// Remove metadata
const removeMetadata = (root: Element, applied: string[]) => {
  if (root.ownerDocument?.doctype) {
    root.ownerDocument.doctype.remove();
  }
  const wanted = new Set(['metadata', 'namedview', 'perspective', 'sfw', 'slices', 'pgf']);
  const nodes = Array.from(root.querySelectorAll('*')).filter((node) => {
    const name = node.localName.toLowerCase();
    if (wanted.has(name)) return true;
    if (name === 'desc' && /created with|sketch|illustrator|inkscape|coreldraw|figma/i.test(node.textContent || '')) {
      return true;
    }
    return false;
  });
  nodes.forEach((n) => n.parentNode?.removeChild(n));
  if (nodes.length) applied.push(`Removed ${nodes.length} metadata/authoring node(s)`);
};

// Remove empty groups
const stripEmptyGroupsPass = (root: Element, applied: string[]) => {
  let count = 0;
  let changed = true;
  let loops = 0;
  while (changed && loops++ < 10) {
    changed = false;
    root.querySelectorAll('g').forEach((g) => {
      if (!g.attributes.length && !g.childNodes.length) {
        g.remove();
        count++;
        changed = true;
      }
    });
  }
  if (count) applied.push(`Removed ${count} empty group(s)`);
};

// Collapse empty wrapper groups
const collapseEmptyWrapperGroups = (root: Element, applied: string[]) => {
  let count = 0;
  root.querySelectorAll('g').forEach((g) => {
    if (!g.attributes.length && g.childNodes.length) {
      const parent = g.parentNode;
      if (parent) {
        while (g.firstChild) parent.insertBefore(g.firstChild, g);
        g.remove();
        count++;
      }
    }
  });
  if (count) applied.push(`Collapsed ${count} attribute-free group wrapper(s)`);
};

// Clean redundant attributes
const cleanAttributes = (root: Element, applied: string[], aggressive: boolean) => {
  let changes = 0;
  const allEls = [root, ...Array.from(root.querySelectorAll('*'))];
  allEls.forEach((el) => Array.from(el.attributes).forEach((attr) => {
    const value = attr.value.trim();
    if (!value && attr.name !== 'id') {
      el.removeAttribute(attr.name);
      changes++;
      return;
    }
    if (attr.name === 'class' && !value) {
      el.removeAttribute(attr.name);
      changes++;
      return;
    }
    if (/^(?:opacity|fill-opacity|stroke-opacity)$/i.test(attr.name) && (value === '1' || value === '1.0' || value === '1.00')) {
      el.removeAttribute(attr.name);
      changes++;
      return;
    }
    if (aggressive && /^(?:data-name|data-export-id|data-testid)$/i.test(attr.name)) {
      el.removeAttribute(attr.name);
      changes++;
      return;
    }
  }));
  if (changes) applied.push(`Cleaned ${changes} empty/redundant attribute(s)`);
};

// Minify attributes
const minifyAttributes = (root: Element, precision: number, minifyColors: boolean, applied: string[]) => {
  let numeric = 0;
  let colors = 0;
  let transforms = 0;

  const coordAttributes = /^(?:d|x|y|x1|y1|x2|y2|cx|cy|r|rx|ry|width|height|dx|dy|stroke-width|stroke-dasharray|stroke-dashoffset|stroke-miterlimit|font-size)$/i;
  const filterAttributes = /^(?:baseFrequency|tableValues|kernelMatrix|stdDeviation|scale|elevation|azimuth|surfaceScale|specularConstant|specularExponent|slope|intercept|amplitude|exponent|offset|diffuseConstant)$/i;
  const colorAttribute = /^(?:fill|stroke|color|stop-color|flood-color|lighting-color)$/i;

  const allElements = [root, ...Array.from(root.querySelectorAll('*'))];
  allElements.forEach((el) => Array.from(el.attributes).forEach((attr) => {
    const name = attr.name;
    let next = attr.value;

    if (name === 'd') {
      next = optimizePathData(next, precision);
    } else if (name === 'transform') {
      next = optimizeTransforms(next, precision);
      if (next !== attr.value) transforms++;
    } else if (name === 'points') {
      next = roundNumericTokens(next, precision).replace(/\s*,\s*/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (name === 'viewBox') {
      // Safeguard: Never reduce viewBox precision below 2 decimals to prevent aspect ratio distortion
      const safeVbPrecision = Math.max(2, precision);
      next = roundNumericTokens(next, safeVbPrecision).replace(/\s*,\s*/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (coordAttributes.test(name)) {
      if (/^(?:r|rx|ry|width|height)$/i.test(name)) {
        const origNum = Number(attr.value);
        let rounded = roundNumericTokens(next, precision);
        if (origNum > 0 && Number(rounded) <= 0) {
          // Safeguard: do not round positive dimensions down to 0; retain precision or original
          rounded = roundNumericTokens(next, Math.max(precision, 4));
          if (Number(rounded) <= 0) rounded = attr.value;
        }
        next = rounded;
      } else {
        next = roundNumericTokens(next, precision);
      }
    } else if (filterAttributes.test(name)) {
      next = roundNumericTokens(next, Math.max(4, precision));
    }

    if (next !== attr.value) {
      attr.value = next;
      numeric++;
    }

    if (minifyColors) {
      if (colorAttribute.test(name)) {
        const c = minifyColorDirect(attr.value);
        if (c !== attr.value) {
          attr.value = c;
          colors++;
        }
      } else if (name === 'style') {
        const c = minifyCssSafely(attr.value, precision);
        if (c !== attr.value) {
          attr.value = c;
          colors++;
        }
      }
    }
  }));

  if (numeric) applied.push(`Optimized ${numeric} numeric/geometry value(s)`);
  if (colors) applied.push(`Minified ${colors} color value(s)`);
  if (transforms) applied.push(`Compacted ${transforms} transform attribute(s)`);
};

// Minify embedded stylesheets
const minifyStyles = (root: Element, precision: number, applied: string[]) => {
  let count = 0;
  root.querySelectorAll('style').forEach((style) => {
    const before = style.textContent || '';
    const after = minifyCssSafely(before, precision);
    if (after !== before) {
      style.textContent = after;
      count++;
    }
  });
  if (count) applied.push(`Minified ${count} embedded CSS block(s)`);
};

// Dependency-aware reachability defs cleanup
const removeUnusedDefsWithGraph = (root: Element, applied: string[]) => {
  const defsElements = Array.from(root.querySelectorAll('defs'));
  if (!defsElements.length) return;

  // Build reference map: which IDs reference which other IDs
  const graph = new Map<string, Set<string>>();
  const defItemMap = new Map<string, Element>();

  defsElements.forEach((defs) => {
    Array.from(defs.children).forEach((child) => {
      const childId = child.getAttribute('id');
      if (childId) {
        defItemMap.set(childId, child);
        if (!graph.has(childId)) graph.set(childId, new Set());
      }
      child.querySelectorAll('[id]').forEach((desc) => {
        const dId = desc.getAttribute('id');
        if (dId) {
          defItemMap.set(dId, child);
          if (!graph.has(dId)) graph.set(dId, new Set());
        }
      });
    });
  });

  // Extract internal references between defs
  defItemMap.forEach((childEl, id) => {
    const targets = graph.get(id)!;
    Array.from(childEl.attributes).forEach((a) => {
      for (const m of a.value.matchAll(/url\(\s*#([^\s)]+)\s*\)/g)) targets.add(m[1]);
      if ((a.name === 'href' || a.name === 'xlink:href') && a.value.startsWith('#')) targets.add(a.value.slice(1));
    });
    childEl.querySelectorAll('*').forEach((sub) => {
      Array.from(sub.attributes).forEach((a) => {
        for (const m of a.value.matchAll(/url\(\s*#([^\s)]+)\s*\)/g)) targets.add(m[1]);
        if ((a.name === 'href' || a.name === 'xlink:href') && a.value.startsWith('#')) targets.add(a.value.slice(1));
      });
    });
  });

  // Collect external references from all non-defs elements
  const externalRefs = new Set<string>();
  const collectFromEl = (el: Element) => {
    Array.from(el.attributes).forEach((a) => {
      for (const m of a.value.matchAll(/url\(\s*#([^\s)]+)\s*\)/g)) externalRefs.add(m[1]);
      if ((a.name === 'href' || a.name === 'xlink:href') && a.value.startsWith('#')) externalRefs.add(a.value.slice(1));
      if (a.name === 'aria-labelledby' || a.name === 'aria-describedby') {
        a.value.trim().split(/\s+/).forEach((t) => t && externalRefs.add(t));
      }
    });
  };

  root.querySelectorAll('*').forEach((el) => {
    if (!el.closest('defs')) collectFromEl(el);
  });
  root.querySelectorAll('style').forEach((s) => {
    const txt = s.textContent || '';
    for (const m of txt.matchAll(/url\(\s*#([^\s)]+)\s*\)/g)) externalRefs.add(m[1]);
    for (const m of txt.matchAll(/#([a-zA-Z0-9_-]+)/g)) externalRefs.add(m[1]);
  });

  // BFS Reachability from external references
  const reachable = new Set<string>();
  const queue = [...externalRefs].filter((id) => defItemMap.has(id));
  queue.forEach((id) => reachable.add(id));

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const deps = graph.get(curr);
    if (deps) {
      deps.forEach((dep) => {
        if (defItemMap.has(dep) && !reachable.has(dep)) {
          reachable.add(dep);
          queue.push(dep);
        }
      });
    }
  }

  // Remove unreachable top-level def children
  let removed = 0;
  defsElements.forEach((defs) => {
    Array.from(defs.children).forEach((child) => {
      const childId = child.getAttribute('id');
      const descIds = Array.from(child.querySelectorAll('[id]')).map((d) => d.getAttribute('id')).filter(Boolean) as string[];
      const allIds = childId ? [childId, ...descIds] : descIds;

      if (allIds.length > 0 && allIds.every((id) => !reachable.has(id))) {
        child.remove();
        removed++;
      }
    });

    if (!defs.children.length && !(defs.textContent || '').trim()) {
      defs.remove();
    }
  });

  if (removed) applied.push(`Removed ${removed} unused reachability-verified definition node(s)`);
};

// Shorten IDs safely
const shortenIdsSafely = (root: Element, applied: string[]) => {
  const allIds = new Set<string>();
  root.querySelectorAll('[id]').forEach((el) => {
    const id = el.getAttribute('id');
    if (id) allIds.add(id);
  });

  const idsToRename = Array.from(root.querySelectorAll('[id]'));
  const map = new Map<string, string>();
  let index = 0;

  for (const el of idsToRename) {
    const old = el.getAttribute('id');
    if (!old || old.length <= 2) continue;
    let next = '';
    do {
      next = `a${(index++).toString(36)}`;
    } while (allIds.has(next));
    allIds.add(next);
    if (next.length < old.length) {
      map.set(old, next);
      el.setAttribute('id', next);
    }
  }

  if (!map.size) return;

  root.querySelectorAll('*').forEach((el) => Array.from(el.attributes).forEach((attr) => {
    let v = attr.value;
    map.forEach((next, old) => {
      const esc = old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      v = v.replace(new RegExp(`url\\(\\s*#${esc}\\s*\\)`, 'g'), `url(#${next})`);
      if ((attr.name === 'href' || attr.name === 'xlink:href') && v === `#${old}`) {
        v = `#${next}`;
      }
    });
    attr.value = v;
  }));

  // Update styles with rewritten IDs
  root.querySelectorAll('style').forEach((st) => {
    let text = st.textContent || '';
    map.forEach((next, old) => {
      const esc = old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text = text.replace(new RegExp(`url\\(\\s*#${esc}\\s*\\)`, 'g'), `url(#${next})`);
      text = text.replace(new RegExp(`#${esc}\\b`, 'g'), `#${next}`);
    });
    st.textContent = text;
  });

  applied.push(`Shortened ${map.size} referenced ID(s)`);
};

// Remove empty presentation attributes
const removeEmptyPresentationAttrs = (root: Element, applied: string[]) => {
  let count = 0;
  root.querySelectorAll('*').forEach((el) => Array.from(el.attributes).forEach((attr) => {
    if (!attr.value.trim() && /^(?:fill|stroke|color|opacity|fill-opacity|stroke-opacity|stroke-width|display|visibility|clip-path|mask|filter)$/i.test(attr.name)) {
      el.removeAttribute(attr.name);
      count++;
    }
  }));
  if (count) applied.push(`Removed ${count} empty presentation attribute(s)`);
};

// Remove empty/default rendering elements
const removeEmptyAndDefaultElements = (root: Element, applied: string[]) => {
  let removed = 0;
  root.querySelectorAll('text,tspan,title,desc').forEach((el) => {
    if (!(el.textContent || '').trim() && !el.querySelector('*')) {
      el.remove();
      removed++;
    }
  });
  root.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon').forEach((el) => {
    const tag = el.localName.toLowerCase();
    if (
      (tag === 'path' && !(el.getAttribute('d') || '').trim()) ||
      (tag === 'rect' && (Number(el.getAttribute('width')) <= 0 || Number(el.getAttribute('height')) <= 0)) ||
      (tag === 'circle' && Number(el.getAttribute('r')) <= 0) ||
      (tag === 'ellipse' && (Number(el.getAttribute('rx')) <= 0 || Number(el.getAttribute('ry')) <= 0))
    ) {
      if (!el.getAttribute('id')) {
        el.remove();
        removed++;
      }
    }
  });
  if (removed) applied.push(`Removed ${removed} empty/non-rendering element(s)`);
};

// Convert circular ellipses to circles
const convertEllipsesToCircles = (root: Element, applied: string[]) => {
  let count = 0;
  root.querySelectorAll('ellipse').forEach((el) => {
    const rx = el.getAttribute('rx');
    const ry = el.getAttribute('ry');
    if (rx && ry && Number(rx) === Number(ry) && Number(rx) > 0) {
      const c = el.ownerDocument!.createElementNS(SVG_NS, 'circle');
      Array.from(el.attributes).forEach((a) => c.setAttribute(a.name, a.value));
      c.setAttribute('r', rx);
      c.removeAttribute('rx');
      c.removeAttribute('ry');
      el.parentNode?.replaceChild(c, el);
      count++;
    }
  });
  if (count) applied.push(`Converted ${count} circular ellipse(s) to circle(s)`);
};

// Remove unused namespace declarations
const removeUnusedNamespaces = (root: Element, applied: string[]) => {
  const attrs = Array.from(root.attributes);
  let count = 0;
  attrs.forEach((a) => {
    if (!a.name.startsWith('xmlns:')) return;
    const prefix = a.name.slice(6);
    const used = Array.from(root.querySelectorAll('*')).some((el) =>
      Array.from(el.attributes).some((x) => x.name.startsWith(prefix + ':'))
    );
    if (!used) {
      root.removeAttribute(a.name);
      count++;
    }
  });
  if (count) applied.push(`Removed ${count} unused namespace declaration(s)`);
};

// --- SVG ANALYSIS & METRICS ---
export const analyzeSvg = (svg: string): SvgAnalysis => {
  const empty = (valid: boolean, issues: string[] = []): SvgAnalysis => ({
    valid, type: 'svg', elements: 0, paths: 0, groups: 0, defs: 0,
    gradients: 0, filters: 0, masks: 0, styles: 0, ids: 0, externalRefs: 0,
    scripts: countMatches(svg, /<script\b/gi),
    eventHandlers: countMatches(svg, /\bon[a-z]+\s*=\s*/gi),
    embeddedImages: 0, animations: 0, unusedIds: 0, brokenReferences: 0,
    duplicateIds: 0, javascriptUrls: countMatches(svg, /javascript\s*:/gi),
    foreignObjects: countMatches(svg, /<foreignObject\b/gi),
    risk: valid ? 'low' : 'high', issues
  });

  if (!svg.trim()) return empty(false, ['No SVG content provided.']);

  try {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const root = doc.documentElement;
    if (doc.querySelector('parsererror') || root?.localName?.toLowerCase() !== 'svg') {
      return empty(false, ['The SVG could not be parsed safely.']);
    }

    const all = Array.from(root.querySelectorAll('*'));
    const { ids, refs, externalRefs: ext, duplicateIds, javascriptUrls, foreignObjects } = collectReferences(root);
    const brokenReferences = [...refs].filter((r) => !ids.has(r)).length;
    const unusedIds = [...ids].filter((id) => !refs.has(id)).length;
    const scripts = root.querySelectorAll('script').length;
    const eventHandlers = [root, ...all].reduce((n, el) => n + Array.from(el.attributes).filter((a) => /^on[a-z]+$/i.test(a.name)).length, 0);
    const embeddedImages = root.querySelectorAll('image').length;
    const animations = root.querySelectorAll('animate,animateMotion,animateTransform,set,mpath').length;
    const filters = root.querySelectorAll('filter').length;
    const masks = root.querySelectorAll('mask').length;
    const gradients = root.querySelectorAll('linearGradient,radialGradient').length;
    const defs = root.querySelectorAll('defs').length;
    const paths = root.querySelectorAll('path').length;
    const groups = root.querySelectorAll('g').length;
    const styles = root.querySelectorAll('style').length;

    const issues: string[] = [];
    if (scripts) issues.push('Embedded script detected.');
    if (eventHandlers) issues.push('Inline event handlers detected.');
    if (javascriptUrls) issues.push('javascript: URL references detected.');
    if (foreignObjects) issues.push('foreignObject elements detected.');
    if (duplicateIds) issues.push(`${duplicateIds} duplicate ID(s) detected.`);
    if (ext.size) issues.push('External or data references detected.');
    if (brokenReferences) issues.push(`${brokenReferences} broken SVG reference(s) detected.`);
    if (animations) issues.push('Animation elements detected.');
    if (filters || masks) issues.push('Filters/masks detected; reachability dependency graph active.');
    if (embeddedImages) issues.push('Embedded raster image payloads are preserved.');

    const risk: SvgAnalysis['risk'] = (scripts || eventHandlers || brokenReferences || javascriptUrls || foreignObjects)
      ? 'high'
      : (animations || filters || masks || ext.size || duplicateIds)
        ? 'medium'
        : 'low';

    const type = animations ? 'animated' : paths <= 40 && groups <= 10 ? 'icon' : paths <= 200 && gradients ? 'illustration' : ids.size && paths <= 120 ? 'logo' : 'complex';

    return {
      valid: true, type, elements: all.length + 1, paths, groups, defs, gradients, filters, masks, styles,
      ids: ids.size, externalRefs: ext.size, scripts, eventHandlers, embeddedImages, animations,
      unusedIds, brokenReferences, duplicateIds, javascriptUrls, foreignObjects, risk, issues
    };
  } catch {
    return empty(false, ['The browser could not parse this SVG.']);
  }
};

const healthScore = (a: SvgAnalysis) => {
  if (!a.valid) return 0;
  let s = 100;
  s -= Math.min(35, a.brokenReferences * 12);
  s -= Math.min(35, a.scripts * 35);
  s -= Math.min(25, a.eventHandlers * 12);
  s -= Math.min(20, a.javascriptUrls * 15);
  s -= Math.min(15, a.foreignObjects * 10);
  s -= Math.min(10, a.externalRefs * 3);
  s -= Math.min(8, a.duplicateIds * 4);
  s -= Math.min(8, a.unusedIds * 0.5);
  return Math.max(0, Math.round(s));
};

const serializeDocument = (doc: Document) =>
  new XMLSerializer().serializeToString(doc)
    .replace(/^<\?xml[^>]*>\s*/i, '')
    .replace(/^<!DOCTYPE[^>]*>\s*/i, '');

// Candidate validation gate
const isCandidateAcceptable = (original: SvgAnalysis, candidate: SvgAnalysis, candidateSvg: string, originalCompact: string, preserveViewBox = true): boolean => {
  if (!candidate.valid || !candidateSvg) return false;
  if (original.elements > 1 && candidate.elements <= 1) return false;
  if (candidate.brokenReferences > original.brokenReferences) return false;
  if (candidate.duplicateIds > original.duplicateIds) return false;
  if (candidate.scripts > original.scripts) return false;
  if (candidate.eventHandlers > original.eventHandlers) return false;
  if (candidate.javascriptUrls > original.javascriptUrls) return false;
  if (candidate.foreignObjects > original.foreignObjects) return false;
  if (candidate.embeddedImages !== original.embeddedImages) return false;
  if (original.filters > 0 && candidate.filters !== original.filters) return false;
  if (original.masks > 0 && candidate.masks !== original.masks) return false;
  if (candidate.animations !== original.animations) return false;
  if (preserveViewBox && candidateSvg.length > originalCompact.length) return false;
  return true;
};

// --- CORE OPTIMIZER ENGINE (SYNCHRONOUS EXECUTION) ---
export const runOptimizerCore = (input: string, options: OptimizationOptions): OptimizationResult => {
  if (!input || !input.trim()) {
    return {
      svg: '',
      analysis: analyzeSvg(''),
      applied: [],
      skipped: [],
      warnings: [],
      healthBefore: 0,
      healthAfter: 0,
      candidates: 0,
      passes: 0
    };
  }

  if (new Blob([input]).size > MAX_INPUT_BYTES) {
    const before = analyzeSvg('');
    return {
      svg: '',
      analysis: before,
      applied: [],
      skipped: ['Optimization rejected: input exceeds 10MB budget limit.'],
      warnings: ['File size exceeds safety limit of 10MB.'],
      healthBefore: 0,
      healthAfter: 0,
      candidates: 0,
      passes: 0
    };
  }

  const before = analyzeSvg(input);
  if (!before.valid) {
    return {
      svg: '',
      analysis: before,
      applied: [],
      skipped: ['Optimization blocked because the SVG is invalid.'],
      warnings: before.issues,
      healthBefore: 0,
      healthAfter: 0,
      candidates: 0,
      passes: 0
    };
  }

  const optimizePass = (rawInput: string, passOpts: OptimizationOptions): OptimizationResult => {
    const doc = new DOMParser().parseFromString(rawInput, 'image/svg+xml');
    const root = doc.documentElement;
    const applied: string[] = [];
    const skipped: string[] = [];
    const warnings = [...before.issues];
    const aggressive = passOpts.mode === 'maximum';
    const structuralRisk = before.risk !== 'low';
    const precision = passOpts.mode === 'safe'
      ? Math.max(3, passOpts.precision)
      : structuralRisk
        ? Math.max(3, passOpts.precision)
        : passOpts.precision;

    if (passOpts.removeComments) stripCommentsPass(doc, applied);
    if (passOpts.removeXml) removeMetadata(root, applied);

    if (passOpts.removeEmptyGroups && !before.animations) {
      stripEmptyGroupsPass(root, applied);
    } else if (before.animations) {
      skipped.push('Empty-group cleanup restricted because animation is present.');
    }

    minifyAttributes(root, precision, passOpts.minifyColors, applied);
    minifyStyles(root, precision, applied);
    cleanAttributes(root, applied, aggressive);

    if (passOpts.preserveViewBox === false) {
      const vb = root.getAttribute('viewBox');
      if (vb) {
        if (!root.getAttribute('width') || !root.getAttribute('height')) {
          const parts = vb.trim().split(/[\s,]+/);
          if (parts.length === 4) {
            if (!root.getAttribute('width')) root.setAttribute('width', parts[2]);
            if (!root.getAttribute('height')) root.setAttribute('height', parts[3]);
          }
        }
        root.removeAttribute('viewBox');
        applied.push('Removed viewBox attribute (non-responsive mode)');
      }
    }

    if (!structuralRisk && !before.animations && !before.filters && !before.masks) {
      removeHiddenElements(root, applied);
      removeEmptyPresentationAttrs(root, applied);
      removeEmptyAndDefaultElements(root, applied);
      if (passOpts.mode === 'smart' || passOpts.mode === 'balanced' || aggressive) {
        convertEllipsesToCircles(root, applied);
      }
      if (passOpts.mode === 'balanced' || aggressive) {
        mergeSafeStrokePaths(root, applied);
      }
      if (aggressive) {
        convertSimpleShapesToPaths(root, applied);
        mergeDuplicatePaths(root, applied);
      }
      removeUnusedNamespaces(root, applied);
    } else {
      skipped.push('Geometry/structural rewrites restricted because advanced SVG behavior was detected.');
    }

    if (passOpts.removeEmptyGroups && !structuralRisk && !before.animations) {
      collapseEmptyWrapperGroups(root, applied);
    }

    if (!structuralRisk && (passOpts.mode === 'smart' || passOpts.mode === 'balanced' || aggressive)) {
      removeUnusedDefsWithGraph(root, applied);
    } else if (before.defs) {
      skipped.push('Unused-def cleanup restricted by SVG risk level.');
    }

    if (aggressive && !structuralRisk && before.styles === 0 && before.animations === 0 && before.filters === 0 && before.masks === 0) {
      shortenIdsSafely(root, applied);
    } else if (aggressive) {
      skipped.push('ID shortening restricted because advanced references/styles may affect compatibility.');
    }

    if (before.risk !== 'low') skipped.push('High-risk structural rewrites were withheld to protect rendering behavior.');
    if (before.embeddedImages) skipped.push('Embedded raster image payloads were preserved.');
    if (before.animations) skipped.push('Animation structure was preserved.');

    const output = compactWhitespace(serializeDocument(doc));
    const after = analyzeSvg(output);
    const originalCompact = compactWhitespace(rawInput);

    if (!isCandidateAcceptable(before, after, output, originalCompact, passOpts.preserveViewBox !== false)) {
      return {
        svg: originalCompact,
        analysis: before,
        applied: [],
        skipped: [...skipped, 'Candidate rolled back because structural validation failed.'],
        warnings: [...warnings, 'Structural validation failed; original SVG retained.'],
        healthBefore: healthScore(before),
        healthAfter: healthScore(before),
        candidates: 1,
        passes: 1
      };
    }

    return {
      svg: output,
      analysis: after,
      applied,
      skipped,
      warnings,
      healthBefore: healthScore(before),
      healthAfter: healthScore(after),
      candidates: 1,
      passes: 1
    };
  };

  const candidates: OptimizationResult[] = [];
  const precisions = options.mode === 'safe'
    ? [Math.max(3, options.precision)]
    : options.mode === 'maximum'
      ? [Math.max(0, options.precision - 1), options.precision, Math.max(0, options.precision - 2)]
      : [options.precision];

  const uniquePrecisions = [...new Set(precisions)];
  for (const p of uniquePrecisions) {
    candidates.push(optimizePass(input, { ...options, precision: p }));
  }

  const originalCompact = compactWhitespace(input);
  const validCandidates = candidates.filter((c) => isCandidateAcceptable(before, c.analysis, c.svg, originalCompact, options.preserveViewBox !== false));

  let best = validCandidates.reduce((a, b) => b.svg.length < a.svg.length ? b : a, validCandidates[0]);
  if (!best) return optimizePass(input, options);

  if (options.mode === 'maximum' || options.mode === 'balanced') {
    const second = optimizePass(best.svg, { ...options, precision: Math.max(0, Math.min(options.precision, 4)) });
    if (isCandidateAcceptable(before, second.analysis, second.svg, originalCompact, options.preserveViewBox !== false) && second.svg.length < best.svg.length) {
      best = second;
    }
  }

  if (options.preserveViewBox !== false && best.svg.length > originalCompact.length) {
    best = {
      ...best,
      svg: originalCompact,
      analysis: analyzeSvg(originalCompact),
      applied: [],
      skipped: [...best.skipped, 'No larger output was accepted; compact original retained.']
    };
  }

  return { ...best, candidates: candidates.length + 1, passes: 2 };
};

// Filename sanitizer for export
const sanitizeExportFilename = (originalName?: string): string => {
  if (!originalName || !originalName.trim()) return 'optimized_kivarotools.svg';
  let name = originalName.trim().replace(/^.*[\\/]/, ''); // Strip directory path
  name = name.replace(/[\x00-\x1f<>:"/\\|?*]/g, '_'); // Strip invalid chars
  name = name.replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/i, 'file_$1'); // Windows reserved
  if (!name.toLowerCase().endsWith('.svg')) name += '.svg';
  if (!name.includes('.optimized')) {
    name = name.replace(/\.svg$/i, '.optimized.svg');
  }
  return name;
};

// --- PRESET SVG SAMPLES FOR INSTANT EVALUATION ---
export const SVG_SAMPLES = {
  star: {
    name: 'Star Icon',
    description: 'Clean vector geometry with stroke attributes',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Star icon -->
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
</svg>`,
  },
  badge: {
    name: 'Gradient Badge',
    description: 'Linear gradients, multiple groups, and path coordinates',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <linearGradient id="unused-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#b91c1c" />
    </linearGradient>
  </defs>
  <!-- Main Badge Container -->
  <g id="badge-group">
    <circle cx="50" cy="50" r="45" fill="url(#badge-grad)" stroke="#1e40af" stroke-width="2" />
    <path d="M30 50 L45 65 L70 35" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`,
  },
  bloated: {
    name: 'Bloated Export',
    description: 'Simulated Illustrator/Figma export with XML header, editor metadata, 8 decimals, and empty groups',
    svg: `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 28.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   x="0px" y="0px" width="128px" height="128px" viewBox="0 0 128 128" enable-background="new 0 0 128 128" xml:space="preserve">
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <cc:Work rdf:about="" xmlns:cc="http://creativecommons.org/ns#">
        <dc:format xmlns:dc="http://purl.org/dc/elements/1.1/">image/svg+xml</dc:format>
        <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" xmlns:dc="http://purl.org/dc/elements/1.1/"/>
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <!-- Empty nested groups from editor layers -->
  <g id="Background_Guides"><g></g></g>
  <g id="Artwork_Group">
    <g>
      <rect x="14.00000000" y="14.00000000" width="100.00000000" height="100.00000000" rx="16.00000000" fill="#2563EB" stroke="#1E40AF" stroke-width="4.00000000"/>
      <path fill="#FFFFFF" d="M64.00000000,34.12345678 L72.98765432,52.34567890 L92.87654321,55.23456789 L78.43210987,69.34567890 L81.87654321,89.23456789 L64.00000000,79.87654321 L46.12345678,89.23456789 L49.56789012,69.34567890 L35.12345678,55.23456789 L55.01234567,52.34567890 Z"/>
    </g>
  </g>
</svg>`,
  },
};

// --- REACT COMPONENT ---
export default function SvgOptimizer() {
  const [inputSvg, setInputSvg] = useState('');
  const [preserveViewBox, setPreserveViewBox] = useState(true);
  const [removeXml, setRemoveXml] = useState(true);
  const [removeComments, setRemoveComments] = useState(true);
  const [removeEmptyGroups, setRemoveEmptyGroups] = useState(true);
  const [minifyColors, setMinifyColors] = useState(true);
  const [precision, setPrecision] = useState(2);
  const [mode, setMode] = useState<OptimizationMode>('smart');
  const [previewBg, setPreviewBg] = useState<PreviewBg>('checkerboard');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('optimized');
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [originalFilename, setOriginalFilename] = useState('image.svg');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [result, setResult] = useState<OptimizationResult>(() => runOptimizerCore('', {
    removeXml: true,
    removeComments: true,
    removeEmptyGroups: true,
    minifyColors: true,
    precision: 2,
    mode: 'smart',
    preserveViewBox: true
  }));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRequestsRef = useRef<Map<number, { input: string; opts: OptimizationOptions }>>(new Map());

  const latestParamsRef = useRef({
    inputSvg,
    preserveViewBox,
    removeXml,
    removeComments,
    removeEmptyGroups,
    minifyColors,
    precision,
    mode
  });

  useEffect(() => {
    latestParamsRef.current = {
      inputSvg,
      preserveViewBox,
      removeXml,
      removeComments,
      removeEmptyGroups,
      minifyColors,
      precision,
      mode
    };
  });

  // Initialize Worker Lifecycle
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
        const workerScript = `
          const SVG_NS = '${SVG_NS}';
          const MAX_INPUT_BYTES = ${MAX_INPUT_BYTES};
          const PATH_PARAM_COUNTS = ${JSON.stringify(PATH_PARAM_COUNTS)};
          const NUMBER_PATTERN = ${NUMBER_PATTERN.toString()};
          const countMatches = ${countMatches.toString()};
          const roundNumber = ${roundNumber.toString()};
          const roundNumericTokens = ${roundNumericTokens.toString()};
          const fmtPathNumber = ${fmtPathNumber.toString()};
          const compactWhitespace = ${compactWhitespace.toString()};
          const parsePathData = ${parsePathData.toString()};
          const normalizePathToAbsolute = ${normalizePathToAbsolute.toString()};
          const serializePathSegments = ${serializePathSegments.toString()};
          const compactPathFallback = ${compactPathFallback.toString()};
          const optimizePathData = ${optimizePathData.toString()};
          const minifyColorDirect = ${minifyColorDirect.toString()};
          const minifyCssSafely = ${minifyCssSafely.toString()};
          const compactTransform = ${compactTransform.toString()};
          const optimizeTransforms = ${optimizeTransforms.toString()};
          const isAlphaOrCompositingSensitive = ${isAlphaOrCompositingSensitive.toString()};
          const collectReferences = ${collectReferences.toString()};
          const convertSimpleShapesToPaths = ${convertSimpleShapesToPaths.toString()};
          const removeHiddenElements = ${removeHiddenElements.toString()};
          const mergeSafeStrokePaths = ${mergeSafeStrokePaths.toString()};
          const mergeDuplicatePaths = ${mergeDuplicatePaths.toString()};
          const stripCommentsPass = ${stripCommentsPass.toString()};
          const removeMetadata = ${removeMetadata.toString()};
          const stripEmptyGroupsPass = ${stripEmptyGroupsPass.toString()};
          const collapseEmptyWrapperGroups = ${collapseEmptyWrapperGroups.toString()};
          const cleanAttributes = ${cleanAttributes.toString()};
          const minifyAttributes = ${minifyAttributes.toString()};
          const minifyStyles = ${minifyStyles.toString()};
          const removeUnusedDefsWithGraph = ${removeUnusedDefsWithGraph.toString()};
          const shortenIdsSafely = ${shortenIdsSafely.toString()};
          const removeEmptyPresentationAttrs = ${removeEmptyPresentationAttrs.toString()};
          const removeEmptyAndDefaultElements = ${removeEmptyAndDefaultElements.toString()};
          const convertEllipsesToCircles = ${convertEllipsesToCircles.toString()};
          const removeUnusedNamespaces = ${removeUnusedNamespaces.toString()};
          const analyzeSvg = ${analyzeSvg.toString()};
          const healthScore = ${healthScore.toString()};
          const serializeDocument = ${serializeDocument.toString()};
          const isCandidateAcceptable = ${isCandidateAcceptable.toString()};
          const runOptimizerCore = ${runOptimizerCore.toString()};

          self.onmessage = function(e) {
            const { requestId, inputSvg, options } = e.data;
            try {
              if (typeof DOMParser === 'undefined') {
                self.postMessage({ requestId, success: false, error: 'DOMParser unavailable in worker environment' });
                return;
              }
              const res = runOptimizerCore(inputSvg, options);
              self.postMessage({ requestId, success: true, result: res });
            } catch (err) {
              self.postMessage({ requestId, success: false, error: (err && err.message) || String(err) });
            }
          };
        `;

        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        workerUrlRef.current = url;
        const worker = new Worker(url);

        worker.onmessage = (e) => {
          const { requestId, success, result: res, error } = e.data;
          const req = pendingRequestsRef.current.get(requestId);
          pendingRequestsRef.current.delete(requestId);

          if (requestId !== requestIdRef.current) return; // Stale message guard

          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
          }

          setIsOptimizing(false);
          if (success && res) {
            setResult(res);
            setErrorMessage(null);
          } else {
            // Safe fallback using the exact request payload
            try {
              const inputToUse = req ? req.input : latestParamsRef.current.inputSvg;
              const optsToUse = req ? req.opts : {
                removeXml: latestParamsRef.current.removeXml,
                removeComments: latestParamsRef.current.removeComments,
                removeEmptyGroups: latestParamsRef.current.removeEmptyGroups,
                minifyColors: latestParamsRef.current.minifyColors,
                precision: latestParamsRef.current.precision,
                mode: latestParamsRef.current.mode,
                preserveViewBox: latestParamsRef.current.preserveViewBox
              };
              const fallbackRes = runOptimizerCore(inputToUse, optsToUse);
              setResult(fallbackRes);
              setErrorMessage(null);
            } catch {
              setErrorMessage(error || 'Worker optimization failed');
            }
          }
        };

        worker.onerror = () => {
          const req = pendingRequestsRef.current.get(requestIdRef.current);
          pendingRequestsRef.current.clear();
          if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
          }
          setIsOptimizing(false);
          try {
            const inputToUse = req ? req.input : latestParamsRef.current.inputSvg;
            const optsToUse = req ? req.opts : {
              removeXml: latestParamsRef.current.removeXml,
              removeComments: latestParamsRef.current.removeComments,
              removeEmptyGroups: latestParamsRef.current.removeEmptyGroups,
              minifyColors: latestParamsRef.current.minifyColors,
              precision: latestParamsRef.current.precision,
              mode: latestParamsRef.current.mode,
              preserveViewBox: latestParamsRef.current.preserveViewBox
            };
            const fallbackRes = runOptimizerCore(inputToUse, optsToUse);
            setResult(fallbackRes);
            setErrorMessage(null);
          } catch {
            setErrorMessage('Optimization worker encountered an error.');
          }
        };

        workerRef.current = worker;
      }
    } catch {
      workerRef.current = null;
    }

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (workerUrlRef.current) {
        URL.revokeObjectURL(workerUrlRef.current);
        workerUrlRef.current = null;
      }
    };
  }, []);

  // Dispatch optimization whenever options or input change
  const triggerOptimization = useCallback((input: string, opts: OptimizationOptions) => {
    if (!input || !input.trim()) {
      setResult(runOptimizerCore('', opts));
      setIsOptimizing(false);
      return;
    }

    if (new Blob([input]).size > MAX_INPUT_BYTES) {
      setErrorMessage('Input file size exceeds safety budget of 10MB.');
      setIsOptimizing(false);
      return;
    }

    setErrorMessage(null);
    const reqId = ++requestIdRef.current;
    pendingRequestsRef.current.set(reqId, { input, opts });
    setIsOptimizing(true);

    if (workerRef.current) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = setTimeout(() => {
        if (reqId === requestIdRef.current) {
          setIsOptimizing(false);
          setErrorMessage('Optimization took too long and was aborted.');
        }
      }, WORKER_TIMEOUT_MS);

      workerRef.current.postMessage({
        requestId: reqId,
        inputSvg: input,
        options: opts
      });
    } else {
      // Synchronous fallback
      try {
        const res = runOptimizerCore(input, opts);
        setResult(res);
      } catch (err) {
        setErrorMessage((err as Error)?.message || 'Optimization failed');
      } finally {
        setIsOptimizing(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerOptimization(inputSvg, {
        removeXml,
        removeComments,
        removeEmptyGroups,
        minifyColors,
        precision,
        mode,
        preserveViewBox
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [inputSvg, removeXml, removeComments, removeEmptyGroups, minifyColors, precision, mode, preserveViewBox, triggerOptimization]);

  const optimizedSvg = result.svg;
  const analysis = result.analysis;
  const originalBytes = inputSvg ? new Blob([inputSvg]).size : 0;
  const optimizedBytes = optimizedSvg ? new Blob([optimizedSvg]).size : 0;
  const savedBytes = Math.max(0, originalBytes - optimizedBytes);
  const savedPercent = originalBytes > 0 ? Math.max(0, Math.round((savedBytes / originalBytes) * 100)) : 0;
  const shownSvg = previewMode === 'original' ? inputSvg : optimizedSvg;
  const sanitizedPreviewSvg = sanitizeSvgForPreview(shownSvg);

  const securityClean = analysis.valid &&
    analysis.scripts === 0 &&
    analysis.eventHandlers === 0 &&
    analysis.brokenReferences === 0 &&
    analysis.javascriptUrls === 0 &&
    analysis.foreignObjects === 0;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleFileUpload = (file: File) => {
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    if (!isSvg) {
      setErrorMessage('Please select a valid SVG file (.svg).');
      return;
    }
    if (file.size === 0) {
      setErrorMessage('The uploaded SVG file is empty.');
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setErrorMessage('The uploaded SVG file exceeds the 10MB budget limit.');
      return;
    }
    setOriginalFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setInputSvg(e.target.result);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleCopy = () => {
    if (!optimizedSvg) return;
    navigator.clipboard.writeText(optimizedSvg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setErrorMessage('Clipboard copy failed. Please select and copy manually.');
    });
  };

  const handleDownload = () => {
    if (!optimizedSvg || !optimizedSvg.trim()) return;
    try {
      const blob = new Blob([optimizedSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = sanitizeExportFilename(originalFilename);
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMessage('Download failed. Please copy the code directly.');
    }
  };

  const handleCancel = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    requestIdRef.current++;
    pendingRequestsRef.current.clear();
    setIsOptimizing(false);
    setErrorMessage('Optimization was cancelled.');
  }, []);

  const handleClear = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    requestIdRef.current++;
    pendingRequestsRef.current.clear();
    setInputSvg('');
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setResult(runOptimizerCore('', { removeXml, removeComments, removeEmptyGroups, minifyColors, precision, mode, preserveViewBox }));
  };

  const handleResetAll = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    requestIdRef.current++;
    pendingRequestsRef.current.clear();
    setInputSvg('');
    setPreserveViewBox(true);
    setRemoveXml(true);
    setRemoveComments(true);
    setRemoveEmptyGroups(true);
    setMinifyColors(true);
    setPrecision(2);
    setMode('smart');
    setPreviewMode('optimized');
    setPreviewBg('checkerboard');
    setErrorMessage(null);
    setOriginalFilename('image.svg');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setResult(runOptimizerCore('', {
      removeXml: true,
      removeComments: true,
      removeEmptyGroups: true,
      minifyColors: true,
      precision: 2,
      mode: 'smart',
      preserveViewBox: true
    }));
  }, []);

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-[#0a0f1a] transition-colors">
      {/* Accessible in-page Alert Notification */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-800 dark:text-red-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            aria-label="Dismiss alert message"
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Column: Input and Upload */}
        <div className="flex flex-col gap-4 xl:w-1/3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-blue-600" /> Raw Input
            </h3>
            {isOptimizing && (
              <span role="status" aria-live="polite" className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Optimizing...
              </span>
            )}
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Upload SVG file: drag and drop here or click to browse"
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isDragging ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-slate-700 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-[#111827]'
            }`}
          >
            <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Drag & Drop SVG file</p>
            <p className="text-[11px] text-slate-400 mt-1">Private client-side processing • Max 10MB</p>
            <input
              type="file"
              accept=".svg,image/svg+xml"
              ref={fileInputRef}
              aria-label="Choose SVG file to upload"
              onChange={(e: ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
              className="hidden"
            />
          </div>

          {/* Quick-Load Samples */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sample:</span>
            <button
              type="button"
              onClick={() => {
                setInputSvg(SVG_SAMPLES.star.svg);
                setOriginalFilename('star-icon.svg');
                setErrorMessage(null);
              }}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              title={SVG_SAMPLES.star.description}
            >
              ⭐ Star Icon
            </button>
            <button
              type="button"
              onClick={() => {
                setInputSvg(SVG_SAMPLES.badge.svg);
                setOriginalFilename('gradient-badge.svg');
                setErrorMessage(null);
              }}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              title={SVG_SAMPLES.badge.description}
            >
              🛡️ Badge
            </button>
            <button
              type="button"
              onClick={() => {
                setInputSvg(SVG_SAMPLES.bloated.svg);
                setOriginalFilename('illustrator-export.svg');
                setErrorMessage(null);
              }}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              title={SVG_SAMPLES.bloated.description}
            >
              📦 Bloated Export
            </button>
            {inputSvg && (
              <button
                type="button"
                onClick={handleResetAll}
                className="ml-auto text-xs font-semibold text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Reset All
              </button>
            )}
          </div>

          <div className="relative flex-grow">
            <textarea
              id="raw-svg-input"
              aria-label="Raw SVG code input"
              value={inputSvg}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length > MAX_INPUT_BYTES) {
                  setErrorMessage('Input file size exceeds safety budget of 10MB.');
                  return;
                }
                setInputSvg(val);
              }}
              placeholder="<svg>...</svg> Paste your SVG code here..."
              className="w-full h-64 xl:h-[400px] p-4 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none dark:text-slate-300 text-slate-800 font-mono text-xs resize-none transition-all shadow-inner"
              spellCheck={false}
            />
            {isOptimizing && (
              <button
                onClick={handleCancel}
                aria-label="Cancel optimization"
                className="absolute top-4 right-14 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                title="Cancel optimization"
              >
                Cancel
              </button>
            )}
            {inputSvg && (
              <button
                onClick={handleClear}
                aria-label="Clear SVG code"
                className="absolute top-4 right-4 p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                title="Clear SVG"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Center Column: Optimization Controls */}
        <div className="flex flex-col gap-6 xl:w-1/3">
          <div className="bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-6 rounded-3xl h-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-5 h-5 text-blue-600" /> Optimization Engine
            </h3>

            {/* Preserve viewBox Toggle */}
            <label className="flex items-center justify-between cursor-pointer p-3 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 mb-4 transition-colors hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                  Preserve viewBox (Recommended for Responsive SVG)
                </span>
              </div>
              <input
                type="checkbox"
                checked={preserveViewBox}
                onChange={(e) => setPreserveViewBox(e.target.checked)}
                aria-label="Preserve viewBox attribute for responsive scaling"
                className="w-4 h-4 accent-emerald-600"
              />
            </label>

            <div role="radiogroup" aria-label="Optimization mode" className="grid grid-cols-2 gap-2 mb-4">
              {([['smart', '✨ Smart'], ['safe', '🛡 Safe'], ['balanced', '⚖ Balanced'], ['maximum', '🔥 Maximum']] as [OptimizationMode, string][]).map(([key, label]) => (
                <button
                  key={key}
                  role="radio"
                  aria-checked={mode === key}
                  aria-label={`Optimization mode: ${label}`}
                  onClick={() => setMode(key)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    mode === key
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                      : 'border-gray-200 bg-white text-slate-600 dark:bg-[#0a0f1a] dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-4 flex-grow">
              <label className="flex items-center justify-between cursor-pointer p-3 bg-white dark:bg-[#0a0f1a] rounded-xl border border-gray-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Remove XML & Metadata</span>
                <input
                  type="checkbox"
                  checked={removeXml}
                  onChange={(e) => setRemoveXml(e.target.checked)}
                  aria-label="Remove XML declaration and authoring metadata"
                  className="w-4 h-4 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 bg-white dark:bg-[#0a0f1a] rounded-xl border border-gray-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Remove Comments</span>
                <input
                  type="checkbox"
                  checked={removeComments}
                  onChange={(e) => setRemoveComments(e.target.checked)}
                  aria-label="Remove comments from SVG"
                  className="w-4 h-4 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 bg-white dark:bg-[#0a0f1a] rounded-xl border border-gray-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Remove Empty Groups {'<g>'}</span>
                <input
                  type="checkbox"
                  checked={removeEmptyGroups}
                  onChange={(e) => setRemoveEmptyGroups(e.target.checked)}
                  aria-label="Remove empty and wrapper groups"
                  className="w-4 h-4 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-3 bg-white dark:bg-[#0a0f1a] rounded-xl border border-gray-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Minify Colors (#ffffff ➔ #fff)</span>
                <input
                  type="checkbox"
                  checked={minifyColors}
                  onChange={(e) => setMinifyColors(e.target.checked)}
                  aria-label="Minify colors safely without altering selectors"
                  className="w-4 h-4 accent-blue-600"
                />
              </label>

              <div className="p-4 bg-white dark:bg-[#0a0f1a] rounded-xl border border-gray-200 dark:border-slate-700 mt-4">
                <label htmlFor="precision-slider" className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Coordinate Precision</span>
                  <span className="text-blue-600 dark:text-blue-400">{precision} decimals</span>
                </label>
                <input
                  id="precision-slider"
                  type="range"
                  min="0"
                  max="4"
                  value={precision}
                  aria-label="Coordinate precision decimals"
                  aria-valuemin={0}
                  aria-valuemax={4}
                  aria-valuenow={precision}
                  onChange={(e) => setPrecision(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>

              {inputSvg && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700">
                    <span className="text-slate-400">SVG health</span>
                    <div className="font-bold mt-1 text-slate-900 dark:text-slate-100">{result.healthAfter}/100</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#0a0f1a] border border-gray-200 dark:border-slate-700">
                    <span className="text-slate-400">Risk</span>
                    <div className={`font-bold mt-1 ${analysis.risk === 'low' ? 'text-emerald-600 dark:text-emerald-400' : analysis.risk === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                      {analysis.risk.toUpperCase()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-5 bg-blue-600 dark:bg-blue-600/10 rounded-2xl border border-transparent dark:border-blue-500/30 text-white dark:text-slate-200">
              <h4 className="text-sm font-bold text-blue-100 dark:text-blue-400 mb-4">Optimization Results</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium">Size Reduction</span>
                <span className="text-sm font-bold">
                  {inputSvg && originalBytes > 0
                    ? savedBytes > 0
                      ? `${savedPercent}%`
                      : '0% (Already Optimal)'
                    : '—'}
                </span>
              </div>
              <div className="w-full h-2 bg-blue-800 dark:bg-slate-800 rounded-full overflow-hidden mb-5">
                <div className="h-full bg-white dark:bg-blue-500 transition-all duration-500" style={{ width: `${savedPercent}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-blue-400/30 pt-4">
                <div>
                  <span className="block text-blue-200 dark:text-slate-400 text-xs">Original</span>
                  <span className="font-semibold">{formatSize(originalBytes)}</span>
                </div>
                <div>
                  <span className="block text-blue-200 dark:text-slate-400 text-xs">Optimized</span>
                  <span className="font-bold text-green-300 dark:text-emerald-400">{formatSize(optimizedBytes)}</span>
                </div>
              </div>
              {inputSvg && originalBytes > 0 && (
                <div className="mt-3 text-xs text-blue-100/90 dark:text-slate-300">
                  {savedBytes > 0 ? (
                    <span className="text-emerald-200 dark:text-emerald-300 font-medium">
                      ✓ Saved {formatSize(savedBytes)} ({savedPercent}% reduction)
                    </span>
                  ) : (
                    <span className="text-blue-200 dark:text-slate-400">
                      ℹ Original retained — already optimal, no quality-degrading changes applied.
                    </span>
                  )}
                </div>
              )}
              {inputSvg && (
                <div className="mt-4 pt-4 border-t border-blue-400/30 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>{securityClean ? 'Security checks passed for detected SVG hazards' : 'Security warnings detected: review before production use'}</span>
                </div>
              )}
              {inputSvg && (
                <div className="mt-2 text-[10px] text-blue-100/80 dark:text-slate-400">
                  {result.applied.length} safe transformation(s) • {result.candidates} candidate(s)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Preview and Output */}
        <div className="flex flex-col gap-4 xl:w-1/3">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" /> Visual Preview
              </h3>
              <div className="flex items-center gap-1">
                <div role="radiogroup" aria-label="Preview display mode" className="flex items-center gap-1">
                  <button
                    role="radio"
                    aria-checked={previewMode === 'optimized'}
                    aria-label="Preview optimized SVG"
                    onClick={() => setPreviewMode('optimized')}
                    className={`px-2 py-1 text-[10px] rounded-md transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${previewMode === 'optimized' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-[#111827] text-slate-500'}`}
                  >
                    Optimized
                  </button>
                  <button
                    role="radio"
                    aria-checked={previewMode === 'original'}
                    aria-label="Preview original SVG"
                    onClick={() => setPreviewMode('original')}
                    className={`px-2 py-1 text-[10px] rounded-md transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${previewMode === 'original' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-[#111827] text-slate-500'}`}
                  >
                    Original
                  </button>
                </div>
                <div role="radiogroup" aria-label="Preview background switcher" className="flex items-center gap-1 ml-1">
                  <button
                    role="radio"
                    aria-checked={previewBg === 'dark'}
                    aria-label="Preview background: Dark"
                    onClick={() => setPreviewBg('dark')}
                    className={`w-6 h-6 rounded bg-slate-900 border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${previewBg === 'dark' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent'}`}
                    title="Dark BG"
                  />
                  <button
                    role="radio"
                    aria-checked={previewBg === 'light'}
                    aria-label="Preview background: Light"
                    onClick={() => setPreviewBg('light')}
                    className={`w-6 h-6 rounded bg-white border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${previewBg === 'light' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'}`}
                    title="Light BG"
                  />
                  <button
                    role="radio"
                    aria-checked={previewBg === 'checkerboard'}
                    aria-label="Preview background: Transparent checkerboard"
                    onClick={() => setPreviewBg('checkerboard')}
                    className={`w-6 h-6 rounded border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${previewBg === 'checkerboard' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'}`}
                    style={{ backgroundImage: 'repeating-conic-gradient(#80808033 0% 25%, transparent 0% 50%)', backgroundSize: '10px 10px' }}
                    title="Transparent BG"
                  />
                </div>
              </div>
            </div>

            <div
              className="h-48 w-full rounded-2xl border border-gray-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-colors"
              style={{
                backgroundColor: previewBg === 'dark' ? '#0f172a' : previewBg === 'light' ? '#ffffff' : 'transparent',
                backgroundImage: previewBg === 'checkerboard' ? 'repeating-conic-gradient(#80808033 0% 25%, transparent 0% 50%)' : 'none',
                backgroundSize: '20px 20px',
              }}
            >
              {sanitizedPreviewSvg ? (
                <iframe
                  title="Safe SVG Preview"
                  sandbox=""
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:;"><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:transparent;color:${previewBg === 'dark' ? '#f8fafc' : '#0f172a'};}svg{max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;}</style></head><body>${sanitizedPreviewSvg}</body></html>`}
                  className="w-full h-full border-0 pointer-events-none"
                />
              ) : shownSvg && !analysis.valid ? (
                <span className="text-amber-500 text-xs font-medium px-4 text-center">Unable to render preview (invalid SVG syntax)</span>
              ) : (
                <span className="text-gray-400 text-sm">Preview will appear here</span>
              )}
            </div>
          </div>

          <div className="flex-grow flex flex-col relative mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                {analysis.valid ? `${analysis.elements} elements • ${analysis.paths} paths` : 'Waiting for SVG'}
              </span>
              {analysis.valid && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Client-side off-thread
                </span>
              )}
            </div>

            <textarea
              id="optimized-svg-output"
              aria-label="Optimized SVG code output"
              value={optimizedSvg}
              readOnly
              placeholder="Optimized code will appear here..."
              className="w-full h-40 xl:h-auto flex-grow p-4 bg-blue-50/50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-2xl focus:outline-none dark:text-blue-300 text-blue-800 font-mono text-xs resize-none transition-all"
            />

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCopy}
                disabled={!optimizedSvg}
                aria-label="Copy optimized SVG code to clipboard"
                className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  copied
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-white border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>

              <button
                onClick={handleDownload}
                disabled={!optimizedSvg}
                aria-label="Download optimized SVG file"
                className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
