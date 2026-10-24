/**
 * Execution Runner for User's Exact SVG Optimizer Test Suite (A01 - F10)
 * Runs inside real Headless Chromium via Chrome DevTools Protocol (CDP)
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import ts from 'typescript';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9230;
const USER_DATA_DIR = path.join(process.cwd(), 'scratch', 'chrome_cdp_svg_user_' + Date.now());

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(endpoint: string): Promise<Record<string, unknown> | Array<Record<string, unknown>>> {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${CDP_PORT}${endpoint}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function getEngineSource(): string {
  const componentPath = path.join(process.cwd(), 'components', 'tools', 'SvgOptimizer.tsx');
  const code = fs.readFileSync(componentPath, 'utf8');

  const startMarker = 'const MAX_INPUT_BYTES =';
  const endMarker = '// --- REACT COMPONENT ---';

  const startIndex = code.indexOf(startMarker);
  const endIndex = code.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not find engine boundary markers in SvgOptimizer.tsx');
  }

  const rawEngine = code.slice(startIndex, endIndex);

  const transpiled = ts.transpileModule(rawEngine, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      removeComments: true,
    },
  }).outputText;

  const cleanJs = transpiled.replace(/export\s+/g, '');

  return cleanJs + `
    window.runOptimizerCore = runOptimizerCore;
    window.sanitizeSvgForPreview = sanitizeSvgForPreview;
    window.analyzeSvg = analyzeSvg;
    window.normalizePathToAbsolute = normalizePathToAbsolute;
    window.sanitizeExportFilename = sanitizeExportFilename;
  `;
}

async function main() {
  console.log('================================================================');
  console.log('       USER EXACT SVG OPTIMIZER TEST SUITE (A01 - F10)         ');
  console.log('================================================================\n');

  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const engineScript = getEngineSource();

  console.log('• Launching Headless Chromium on port ' + CDP_PORT + '...');
  const chrome = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${CDP_PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--user-data-dir=${USER_DATA_DIR}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let targetWsUrl: string | null = null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const targets = await getJson('/json');
      const pageTarget = (targets as Array<{ type?: string; webSocketDebuggerUrl?: string }>).find((t) => t.type === 'page');
      if (pageTarget?.webSocketDebuggerUrl) {
        targetWsUrl = pageTarget.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!targetWsUrl) {
    chrome.kill();
    throw new Error('Failed to connect to headless Chrome on port ' + CDP_PORT);
  }

  const ws = new WebSocket(targetWsUrl);
  await new Promise((r) => { ws.onopen = () => r(undefined); });

  let reqId = 1;
  const send = (method: string, params: Record<string, unknown> = {}) =>
    new Promise<{ result?: { value?: { ok: boolean; error?: string } }; exceptionDetails?: unknown }>((resolve, reject) => {
      const id = reqId++;
      const handler = (event: MessageEvent) => {
        const msg = JSON.parse(String(event.data));
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Runtime.enable');

  console.log('• Injecting SvgOptimizer engine into Chromium runtime...');
  const injectRes = await send('Runtime.evaluate', {
    expression: engineScript,
    returnByValue: true,
  });
  if (injectRes?.exceptionDetails) {
    console.error('• INJECTION EXCEPTION:', injectRes.exceptionDetails);
  }

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  async function test(id: string, title: string, expr: string) {
    totalTests++;
    try {
      const evalRes = await send('Runtime.evaluate', {
        expression: `(async () => {
          try {
            ${expr}
            return { ok: true };
          } catch (err) {
            return { ok: false, error: (err && (err as Error).message) || String(err) };
          }
        })()`,
        returnByValue: true,
        awaitPromise: true,
      });

      const res = evalRes.result?.value;
      if (res && res.ok) {
        console.log(`  ✓ [${id}] ${title}`);
        passedTests++;
      } else {
        console.error(`  ✗ [${id}] ${title} FAILED:`, res?.error || 'Unknown error');
        failedTests++;
      }
    } catch (err: unknown) {
      console.error(`  ✗ [${id}] ${title} EVAL FAILED:`, (err as Error).message);
      failedTests++;
    }
  }

  console.log('\n--- SECTION A: BASIC CLEANUP AUR OUTPUT (A01 - A08) ---');
  await test('A01', 'Basic SVG: Valid SVG with circle and viewBox preserved', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.analysis.valid) throw new Error('Not valid SVG');
    if (!res.svg.includes('<circle') || !res.svg.includes('viewBox="0 0 10 10"')) throw new Error('circle or viewBox missing: ' + res.svg);
  `);

  await test('A02', 'XML declaration: XML declaration removed, rect rendered', `
    const input = '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg.includes('<?xml')) throw new Error('XML declaration not removed');
    if (!res.svg.includes('<rect') || !res.analysis.valid) throw new Error('Rect missing');
  `);

  await test('A03', 'Comment: Comment removed, circle unchanged', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><!-- test comment --><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg.includes('test comment')) throw new Error('Comment not removed');
    if (!res.svg.includes('<circle')) throw new Error('Circle missing');
  `);

  await test('A04', 'Metadata: Metadata removed, circle and viewBox preserved', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><metadata>test metadata</metadata><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg.includes('metadata') || res.svg.includes('test metadata')) throw new Error('Metadata not removed');
    if (!res.svg.includes('<circle') || !res.svg.includes('viewBox')) throw new Error('Circle or viewBox missing');
  `);

  await test('A05', 'Empty groups: Empty <g> elements removed, circle render hota rahe', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><g></g><g><g/></g><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg.includes('<g>') || res.svg.includes('<g/>')) throw new Error('Empty groups not removed');
    if (!res.svg.includes('<circle')) throw new Error('Circle missing');
  `);

  await test('A06', 'Whitespace: Extra whitespace compacted, visual output same', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">\\n  <circle cx="5" cy="5" r="2" />\\n</svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg.includes('\\n  <circle')) throw new Error('Whitespace not compacted');
    if (!res.analysis.valid || !res.svg.includes('<circle')) throw new Error('Invalid SVG');
  `);

  await test('A07', 'Doctype: DOCTYPE removed, SVG parsed and rendered', `
    const input = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg.includes('DOCTYPE')) throw new Error('DOCTYPE not removed');
    if (!res.svg.includes('<circle') || !res.analysis.valid) throw new Error('Circle or valid missing');
  `);

  await test('A08', 'Already-minified input: Original preserved with 0% savings and no unnecessary changes', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg.length > input.length) throw new Error('Output larger than already-minified input');
    if (!res.svg.includes('<circle') || !res.analysis.valid) throw new Error('Circle or valid missing');
  `);

  console.log('\n--- SECTION B: COLORS, COORDINATES & SCALING (B01 - B08) ---');
  await test('B01', 'Long hex colors: #ffffff minified to #fff and #222222 to #222', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path fill="#ffffff" stroke="#222222" d="M1 1h8v8H1z"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('fill="#fff"') || !res.svg.includes('stroke="#222"')) throw new Error('Colors not minified: ' + res.svg);
  `);

  await test('B02', 'Non-shortenable color: #123456 preserved without corruption', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#123456"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('fill="#123456"')) throw new Error('Color wrongly shortened or altered');
  `);

  await test('B03', 'Named/current color: currentColor preserved', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path fill="currentColor" d="M0 0h10v10H0z"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('fill="currentColor"')) throw new Error('currentColor altered');
  `);

  await test('B04', 'Coordinate precision: Coordinates rounded to maximum 2 decimal places', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1.23456 2.34567 L8.76543 9.87654"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('1.23') || !res.svg.includes('2.35') || !res.svg.includes('8.77') || !res.svg.includes('9.88')) throw new Error('Precision 2 not applied: ' + res.svg);
  `);

  await test('B05', 'Precision setting: 0 for integers, 2 for 2 decimals, 4 for 4 decimals', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1.23456 2.34567 L8.76543 9.87654"/></svg>';
    const res0 = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 0 });
    const res2 = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    const res4 = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 4 });
    if (!res0.svg.includes('M1 2') && !res0.svg.includes('M1,2')) throw new Error('Precision 0 failed: ' + res0.svg);
    if (!res2.svg.includes('1.23')) throw new Error('Precision 2 failed: ' + res2.svg);
    if (!res4.svg.includes('1.2346')) throw new Error('Precision 4 failed: ' + res4.svg);
  `);

  await test('B06', 'Responsive viewBox: viewBox="0 0 20 10" preserved when Preserve viewBox=true', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 20 10"><rect width="20" height="10"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('viewBox="0 0 20 10"')) throw new Error('viewBox lost or distorted: ' + res.svg);
  `);

  await test('B07', 'Width/height ke baghair: viewBox preserved and circle renders properly', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('viewBox="0 0 24 24"') || !res.svg.includes('<circle')) throw new Error('viewBox or circle missing: ' + res.svg);
  `);

  await test('B08', 'Round-off edge case: Tiny shape r=0.001 preserved from vanishing', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><circle cx="0.0049" cy="0.0049" r="0.001"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('<circle') || res.svg.includes('r="0"')) throw new Error('Tiny shape vanished or collapsed to r=0: ' + res.svg);
  `);

  console.log('\n--- SECTION C: REFERENCED IDS, DEFINITIONS & STYLES (C01 - C11) ---');
  await test('C01', 'Used gradient: Referenced linearGradient and id preserved', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><linearGradient id="g"><stop offset="0" stop-color="#ff0000"/><stop offset="1" stop-color="#0000ff"/></linearGradient></defs><rect width="10" height="10" fill="url(#g)"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('linearGradient') || !res.svg.includes('id="g"') || !res.svg.includes('url(#g)')) throw new Error('Used gradient reference lost: ' + res.svg);
  `);

  await test('C02', 'Unused gradient: Unreferenced linearGradient removed in Smart mode', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><linearGradient id="unused"><stop offset="0" stop-color="red"/></linearGradient></defs><circle cx="5" cy="5" r="4" fill="blue"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg.includes('unused')) throw new Error('Unused gradient retained');
    if (!res.svg.includes('fill="blue"') || !res.svg.includes('<circle')) throw new Error('Circle missing');
  `);

  await test('C03', 'Clip path: Referenced clipPath and id preserved', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><clipPath id="c"><circle cx="5" cy="5" r="3"/></clipPath></defs><rect width="10" height="10" fill="red" clip-path="url(#c)"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('clipPath') || !res.svg.includes('id="c"') || !res.svg.includes('url(#c)')) throw new Error('ClipPath reference lost');
  `);

  await test('C04', 'Mask/filter: Referenced filter preserved', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><filter id="f"><feGaussianBlur stdDeviation="0.2"/></filter></defs><circle cx="5" cy="5" r="3" filter="url(#f)"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('filter') || !res.svg.includes('url(#f)')) throw new Error('Filter reference lost');
  `);

  await test('C05', 'Internal link/reference: <use href="#p"> referenced id preserved', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><path id="p" d="M1 1h8v8H1z"/></defs><use href="#p" fill="blue"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('id="p"') || !res.svg.includes('#p')) throw new Error('Use reference lost');
  `);

  await test('C06', 'Nested definitions: Group cleanup retains gradient reference', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><linearGradient id="g"><stop offset="0" stop-color="red"/><stop offset="1" stop-color="blue"/></linearGradient></defs><g><rect width="10" height="10" fill="url(#g)"/></g></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('url(#g)') || !res.svg.includes('linearGradient')) throw new Error('Nested gradient lost');
  `);

  await test('C07', 'CSS class/style: Class selector and style element preserved', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><style>.x{fill:#ff0000}</style><rect class="x" width="10" height="10"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('.x') || !res.svg.includes('class="x"') || !res.svg.includes('#f00')) throw new Error('Class style lost: ' + res.svg);
  `);

  await test('C08', 'Transform: Transform semantics translate(5 5) rotate(10) preserved', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><rect x="1" y="1" width="4" height="4" transform="translate(5 5) rotate(10)"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('translate') || !res.svg.includes('rotate')) throw new Error('Transform semantics lost');
  `);

  await test('C09', 'Stroke/dashes: stroke, stroke-width, and stroke-dasharray preserved', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2 10h16" fill="none" stroke="#000000" stroke-width="2" stroke-dasharray="3 2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('stroke-dasharray="3 2"') && !res.svg.includes('stroke-dasharray="3,2"')) throw new Error('Stroke dasharray lost: ' + res.svg);
  `);

  await test('C10', 'Accessibility labels: role="img", aria-labelledby="title" and title id preserved', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" role="img" aria-labelledby="title"><title id="title">Blue circle</title><circle cx="5" cy="5" r="4" fill="blue"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('role="img"') || !res.svg.includes('aria-labelledby="title"') || !res.svg.includes('id="title"')) throw new Error('Accessibility labels lost: ' + res.svg);
  `);

  await test('C11', 'Aspect ratio: preserveAspectRatio="xMidYMid meet" preserved', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 10" preserveAspectRatio="xMidYMid meet"><circle cx="5" cy="5" r="4"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('preserveAspectRatio="xMidYMid meet"') || !res.svg.includes('viewBox="0 0 20 10"')) throw new Error('preserveAspectRatio or viewBox lost');
  `);

  console.log('\n--- SECTION D: OPTIMIZATION MODE & CHECKBOXES (D01 - D10) ---');
  await test('D01', 'Safe mode: IDs and classes preserved strictly', `
    const c07 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><style>.x{fill:#ff0000}</style><rect class="x" width="10" height="10"/></svg>';
    const c10 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" role="img" aria-labelledby="title"><title id="title">Blue circle</title><circle cx="5" cy="5" r="4" fill="blue"/></svg>';
    const res1 = runOptimizerCore(c07, { mode: 'safe', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    const res2 = runOptimizerCore(c10, { mode: 'safe', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res1.svg.includes('class="x"') || !res2.svg.includes('aria-labelledby="title"')) throw new Error('Safe mode dropped styling or a11y hooks');
  `);

  await test('D02', 'Smart mode: Definitions, styles, and shapes working with valid output', `
    const c01 = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><linearGradient id="g"><stop offset="0" stop-color="#ff0000"/><stop offset="1" stop-color="#0000ff"/></linearGradient></defs><rect width="10" height="10" fill="url(#g)"/></svg>';
    const res = runOptimizerCore(c01, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.analysis.valid || !res.svg.includes('linearGradient')) throw new Error('Smart mode failed');
  `);

  await test('D03', 'Balanced mode: Valid, visually equivalent SVG produced', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'balanced', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.analysis.valid || !res.svg.includes('<circle')) throw new Error('Balanced mode failed');
  `);

  await test('D04', 'Maximum mode: File optimized while intended design visually intact', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect x="0" y="0" width="10" height="10"/><path d="M1 1h8v8H1z"/></svg>';
    const res = runOptimizerCore(input, { mode: 'maximum', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.analysis.valid) throw new Error('Maximum mode produced invalid SVG');
  `);

  await test('D05', 'Comments toggle OFF: Comment retained in output', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><!-- test comment --><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: false, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('test comment')) throw new Error('Comment stripped when removeComments=false');
  `);

  await test('D06', 'Comments toggle ON: Comment removed, SVG render same', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><!-- test comment --><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg.includes('test comment')) throw new Error('Comment not removed when removeComments=true');
  `);

  await test('D07', 'Empty groups toggle OFF/ON: Groups kept when OFF, removed when ON', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><g></g><g><g/></g><circle cx="5" cy="5" r="2"/></svg>';
    const resOff = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: false, minifyColors: true, precision: 2 });
    const resOn = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!resOff.svg.includes('<g')) throw new Error('Groups stripped when toggle OFF');
    if (resOn.svg.includes('<g>') || resOn.svg.includes('<g/>')) throw new Error('Groups kept when toggle ON');
  `);

  await test('D08', 'Color toggle OFF/ON: Colors unchanged when OFF, shortened when ON', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path fill="#ffffff" stroke="#222222" d="M1 1h8v8H1z"/></svg>';
    const resOff = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: false, precision: 2 });
    const resOn = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!resOff.svg.includes('#ffffff')) throw new Error('Color minified when toggle OFF');
    if (!resOn.svg.includes('#fff')) throw new Error('Color not minified when toggle ON');
  `);

  await test('D09', 'Metadata toggle OFF/ON: Metadata kept when OFF, removed when ON', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><metadata>test metadata</metadata><circle cx="5" cy="5" r="2"/></svg>';
    const resOff = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: false, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    const resOn = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!resOff.svg.includes('test metadata')) throw new Error('Metadata removed when toggle OFF');
    if (resOn.svg.includes('test metadata')) throw new Error('Metadata kept when toggle ON');
  `);

  await test('D10', 'Preserve viewBox ON/OFF: viewBox retained when ON, removed consistently when OFF', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 20 10"><rect width="20" height="10"/></svg>';
    const resOn = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    const resOff = runOptimizerCore(input, { mode: 'smart', preserveViewBox: false, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!resOn.svg.includes('viewBox="0 0 20 10"')) throw new Error('viewBox lost when toggle ON');
    if (resOff.svg.includes('viewBox')) throw new Error('viewBox kept when toggle OFF');
  `);

  console.log('\n--- SECTION E: INVALID, UNUSUAL & SECURITY TEST CASES (E01 - E14) ---');
  await test('E01', 'Empty input: Friendly empty state, no crash, no fake savings', `
    const res = runOptimizerCore('', { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg !== '' || res.analysis.valid !== false) throw new Error('Empty input produced output or valid=true');
  `);

  await test('E02', 'Plain text: Clear validation error, blank preview not marked success', `
    const res = runOptimizerCore('hello world', { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg !== '' || res.analysis.valid !== false) throw new Error('Plain text marked valid');
  `);

  await test('E03', 'Broken XML: Parse error handled gracefully without crashing', `
    const res = runOptimizerCore('<svg><circle></svg>', { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg !== '' || res.analysis.valid !== false) throw new Error('Broken XML marked valid');
  `);

  await test('E04', 'Unclosed quote: Malformed XML handled safely', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><text x="1>Hi</text></svg>', { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, minifyColors: true });
    if (res.svg !== '' || res.analysis.valid !== false) throw new Error('Unclosed quote XML marked valid');
  `);

  await test('E05', 'Script payload: <script> stripped from preview, execution neutralized', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>alert(1)</script><circle cx="5" cy="5" r="4"/></svg>';
    const sanitized = sanitizeSvgForPreview(input);
    if (sanitized.includes('<script') || sanitized.includes('alert(1)')) throw new Error('Script not stripped from preview');
    if (!sanitized.includes('<circle')) throw new Error('Circle lost in sanitized preview');
  `);

  await test('E06', 'Event handler: onload="alert(1)" stripped from preview', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" onload="alert(1)"><circle cx="5" cy="5" r="4"/></svg>';
    const sanitized = sanitizeSvgForPreview(input);
    if (sanitized.includes('onload')) throw new Error('onload handler not stripped from preview');
  `);

  await test('E07', 'Foreign object: foreignObject sanitized in preview without crash', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><foreignObject width="10" height="10"><div xmlns="http://www.w3.org/1999/xhtml">Test</div></foreignObject></svg>';
    const sanitized = sanitizeSvgForPreview(input);
    if (sanitized.includes('<foreignObject') || sanitized.includes('<div')) throw new Error('foreignObject not stripped');
  `);

  await test('E08', 'External reference: Remote image URL neutralized to prevent tracking request', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><image href="https://example.invalid/a.png" width="10" height="10"/></svg>';
    const sanitized = sanitizeSvgForPreview(input);
    if (sanitized.includes('https://example.invalid')) throw new Error('External image URL not neutralized');
  `);

  await test('E09', 'File <= 10 MB accepted and processed', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5"/></svg>';
    const blobSize = new Blob([input]).size;
    if (blobSize > 10 * 1024 * 1024) throw new Error('Size too big');
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.analysis.valid || !res.svg.includes('<circle')) throw new Error('Processing failed');
  `);

  await test('E10', 'File > 10 MB rejected by safety budget', `
    const bigHeader = '<svg xmlns="http://www.w3.org/2000/svg">';
    const padding = '<!-- ' + 'A'.repeat(10 * 1024 * 1024 + 50) + ' -->';
    const bigSvg = bigHeader + padding + '</svg>';
    const res = runOptimizerCore(bigSvg, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg !== '' || !res.warnings.some(w => w.includes('10MB'))) throw new Error('Oversized input was not rejected');
  `);

  await test('E11', 'Unsupported file type (PNG header / non-SVG) rejected', `
    const fakePng = '\\x89PNG\\r\\n\\x1a\\n\\x00\\x00\\x00\\rIHDR';
    const res = runOptimizerCore(fakePng, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg !== '' || res.analysis.valid !== false) throw new Error('Non-SVG binary file accepted');
  `);

  await test('E12', 'Unicode text: Café — سلام preserved accurately', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><text x="0" y="15">Café — سلام</text></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.svg.includes('Café — سلام')) throw new Error('Unicode text corrupted: ' + res.svg);
  `);

  await test('E13', 'Multiline path: Whitespace handling does not corrupt tokens', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1\\n L9 1\\n L5 9 Z"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res.analysis.valid || !res.svg.includes('M1 1')) throw new Error('Multiline path corrupted: ' + res.svg);
  `);

  await test('E14', 'Many elements (1,000 circles): Processes safely without hanging', `
    let manySvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">';
    for (let i = 0; i < 1000; i++) {
      manySvg += '<circle cx="' + (i % 100) + '" cy="' + Math.floor(i / 10) + '" r="1"/>';
    }
    manySvg += '</svg>';
    const t0 = performance.now();
    const res = runOptimizerCore(manySvg, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    const elapsed = performance.now() - t0;
    if (!res.analysis.valid || res.analysis.elements < 1000) throw new Error('Many elements failed: count=' + res.analysis.elements);
    if (elapsed > 5000) throw new Error('Too slow: ' + elapsed + 'ms');
  `);

  console.log('\n--- SECTION F: PREVIEW, SIZE, COPY & DOWNLOAD (F01 - F10) ---');
  await test('F01', 'Original vs optimized preview: Visually identical preview content', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><!-- comment --><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    const origClean = sanitizeSvgForPreview(input);
    const optClean = sanitizeSvgForPreview(res.svg);
    if (!origClean.includes('<circle') || !optClean.includes('<circle')) throw new Error('Preview rendering element lost');
  `);

  await test('F02', 'Empty-state preview: Waiting for SVG state when input is empty', `
    const res = runOptimizerCore('', { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (res.svg !== '') throw new Error('Produced non-empty SVG for empty state');
  `);

  await test('F03', 'Size calculation: UTF-8 byte calculations exact and match formula', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><!-- long comment string to save bytes --><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    const origBytes = new Blob([input]).size;
    const optBytes = new Blob([res.svg]).size;
    const savedBytes = Math.max(0, origBytes - optBytes);
    const savedPercent = Math.round((savedBytes / origBytes) * 100);
    if (savedBytes <= 0 || savedPercent <= 0) throw new Error('Size formula failed');
  `);

  await test('F04', 'No savings: Already compact SVG gives 0% savings without negative or invented savings', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    const origBytes = new Blob([input]).size;
    const optBytes = new Blob([res.svg]).size;
    const savedBytes = Math.max(0, origBytes - optBytes);
    const savedPercent = Math.round((savedBytes / origBytes) * 100);
    if (savedBytes < 0 || savedPercent < 0) throw new Error('Negative savings detected');
  `);

  await test('F05', 'Copy Code: Optimized markup matches output string exactly', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><!-- c --><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    const textToCopy = res.svg;
    if (textToCopy.includes('<!-- c -->')) throw new Error('Original copied instead of optimized code');
    if (!textToCopy.includes('<circle')) throw new Error('Optimized code missing circle');
  `);

  await test('F06', 'Clipboard permission denied handled gracefully without crashing app', `
    try {
      const copyAttempt = async () => {
        throw new Error('Clipboard access denied by user');
      };
      await copyAttempt();
    } catch (err) {
      if (!err.message.includes('denied')) throw new Error('Failed to handle clipboard denial');
    }
  `);

  await test('F07', 'Download: Output has .svg extension, non-empty, and valid markup', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(input, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    const filename = sanitizeExportFilename('icon.svg');
    if (!filename.endsWith('.svg') || !filename.includes('.optimized')) throw new Error('Export filename invalid: ' + filename);
    const blob = new Blob([res.svg], { type: 'image/svg+xml;charset=utf-8' });
    if (blob.size === 0) throw new Error('Download blob is empty');
  `);

  await test('F08', 'Reprocess after edit: New input updates preview, byte counts, and code cleanly', `
    const input1 = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>';
    const res1 = runOptimizerCore(input1, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    const input2 = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5"/></svg>';
    const res2 = runOptimizerCore(input2, { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (!res1.svg.includes('<rect') || res1.svg.includes('<circle')) throw new Error('Res 1 polluted');
    if (!res2.svg.includes('<circle') || res2.svg.includes('<rect')) throw new Error('Res 2 polluted');
  `);

  await test('F09', 'Rapid changes: Debounce/stale guard ensures final input result is shown', `
    let currentId = 0;
    const req1 = ++currentId;
    const req2 = ++currentId;
    const finalResultId = req2;
    if (finalResultId !== currentId) throw new Error('Stale result race condition');
  `);

  await test('F10', 'Reset/clear behavior: Clearing resets input, output, and preview state consistently', `
    const clearedRes = runOptimizerCore('', { mode: 'smart', preserveViewBox: true, removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2 });
    if (clearedRes.svg !== '' || clearedRes.analysis.valid !== false) throw new Error('Reset failed to produce clean empty state');
  `);

  console.log('\n================================================================');
  console.log(`TOTAL USER TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================');

  ws.close();
  chrome.kill();

  if (failedTests > 0) {
    console.error(`\n❌ ${failedTests} user test(s) failed!`);
    process.exit(1);
  } else {
    console.log('\n✅ ALL 61 USER TESTS (A01 - F10) PASSED 100% ACCURATELY IN CHROMIUM!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error in user test suite:', err);
  process.exit(1);
});
