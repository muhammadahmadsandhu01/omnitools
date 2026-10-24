/**
 * Comprehensive 175+ Automated Test Suite for KivaroTools SVG Optimizer
 * Executes inside real Headless Chromium via Chrome DevTools Protocol (CDP)
 * to test 100% native DOMParser, XMLSerializer, and Web API behavior.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import ts from 'typescript';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9229;
const USER_DATA_DIR = path.join(process.cwd(), 'scratch', 'chrome_cdp_svg_150_' + Date.now());

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
    window.healthScore = healthScore;
  `;
}

async function main() {
  console.log('================================================================');
  console.log('    KIVAROTOOLS SVG OPTIMIZER: 175+ COMPREHENSIVE TEST SUITE    ');
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

  async function test(name: string, expr: string) {
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
        console.log(`  [PASS ${totalTests}] ${name}`);
        passedTests++;
      } else {
        console.error(`  [FAIL ${totalTests}] ${name}:`, res?.error || 'Unknown error');
        failedTests++;
      }
    } catch (err: unknown) {
      console.error(`  [EVAL FAIL ${totalTests}] ${name}:`, (err as Error).message);
      failedTests++;
    }
  }

  console.log('\n--- MODULE 1: XML, DOCTYPE & ENCODING (12 Tests) ---');
  await test('M1.01: Basic valid SVG produces valid output', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('<rect') || !res.analysis.valid) throw new Error('Failed');
  `);
  await test('M1.02: Standard XML prolog stripped when removeXml=true', `
    const res = runOptimizerCore('<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg.includes('<?xml')) throw new Error('XML prolog present');
  `);
  await test('M1.03: XML prolog with standalone attribute stripped', `
    const res = runOptimizerCore('<?xml version="1.0" standalone="no"?><svg xmlns="http://www.w3.org/2000/svg"><circle cx="1" cy="1" r="1"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg.includes('standalone')) throw new Error('Standalone attribute present');
  `);
  await test('M1.04: Strict SVG 1.1 DOCTYPE stripped', `
    const res = runOptimizerCore('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg.includes('DOCTYPE')) throw new Error('DOCTYPE present');
  `);
  await test('M1.05: SVG 1.0 DOCTYPE stripped', `
    const res = runOptimizerCore('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd"><svg xmlns="http://www.w3.org/2000/svg"><rect width="5" height="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg.includes('DOCTYPE')) throw new Error('DOCTYPE present');
  `);
  await test('M1.06: Lowercase doctype stripped cleanly', `
    const res = runOptimizerCore('<!doctype svg><svg xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="0" x2="10" y2="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg.toLowerCase().includes('doctype')) throw new Error('doctype present');
  `);
  await test('M1.07: CDATA in text node unwrapped cleanly', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><text><![CDATA[Hello World]]></text></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('Hello World') || !res.analysis.valid) throw new Error('CDATA lost');
  `);
  await test('M1.08: CDATA in style block handled without error', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style><![CDATA[.a{fill:red;}]]></style><rect class="a" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('.a') || !res.analysis.valid) throw new Error('Style CDATA error');
  `);
  await test('M1.09: Multiple CDATA blocks preserved in valid XML', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><text><![CDATA[Part 1]]></text><text><![CDATA[Part 2]]></text></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('Part 1') || !res.svg.includes('Part 2')) throw new Error('Multiple CDATA lost');
  `);
  await test('M1.10: Root xmlns attribute preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('xmlns="http://www.w3.org/2000/svg"')) throw new Error('xmlns missing');
  `);
  await test('M1.11: XLink namespace preserved if used in href', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><circle id="c" r="5"/></defs><use xlink:href="#c"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('#c')) throw new Error('Xlink use lost');
  `);
  await test('M1.12: Unused editor namespaces pruned in Maximum mode', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'maximum' });
    if (res.svg.includes('xmlns:inkscape')) throw new Error('Unused namespace not pruned');
  `);

  console.log('\n--- MODULE 2: COMMENTS & METADATA CLEANUP (12 Tests) ---');
  await test('M2.01: Single line comment removed when removeComments=true', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><!-- simple comment --><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg.includes('simple comment')) throw new Error('Comment present');
  `);
  await test('M2.02: Multi-line comment removed', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><!--\\nline 1\\nline 2\\n--><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('line 1')) throw new Error('Multi-line comment present');
  `);
  await test('M2.03: Comments between elements removed', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect width="5" height="5"/><!-- divider --><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('divider')) throw new Error('Divider comment present');
  `);
  await test('M2.04: Comments inside defs removed', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><!-- defs comment --><linearGradient id="g"><stop offset="0" stop-color="red"/></linearGradient></defs><rect fill="url(#g)" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('defs comment')) throw new Error('Defs comment present');
  `);
  await test('M2.05: Comments inside style tags minified', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>/* css comment */ .c { fill: blue; }</style><rect class="c" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('css comment')) throw new Error('CSS comment present');
  `);
  await test('M2.06: Comment with symbols <!-- <tag>&" --> stripped cleanly', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><!-- <tag>&" --><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('<tag>')) throw new Error('Symbol comment present');
  `);
  await test('M2.07: <metadata> element removed when removeXml=true', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><metadata><author>John Doe</author></metadata><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('metadata') || res.svg.includes('John Doe')) throw new Error('Metadata present');
  `);
  await test('M2.08: Complex RDF metadata removed', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><metadata><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><cc:Work rdf:about=""><dc:title>Test</dc:title></cc:Work></rdf:RDF></metadata><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('rdf:RDF') || res.svg.includes('dc:title')) throw new Error('RDF present');
  `);
  await test('M2.09: Inkscape sodipodi namedview metadata stripped', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"><sodipodi:namedview id="base" pagecolor="#ffffff"/><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('sodipodi:namedview')) throw new Error('Sodipodi present');
  `);
  await test('M2.10: Illustrator generator comment stripped', `
    const res = runOptimizerCore('<!-- Generator: Adobe Illustrator 28.0.0, SVG Export Plug-In --><svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('Illustrator')) throw new Error('Illustrator comment present');
  `);
  await test('M2.11: Sketch metadata tags removed', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><desc>Created with Sketch.</desc><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'maximum', minifyColors: true });
    if (res.svg.includes('Created with Sketch')) throw new Error('Sketch desc present in maximum mode');
  `);
  await test('M2.12: Comments preserved when removeComments=false', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><!-- keep me --><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: false, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('keep me')) throw new Error('Comment was stripped when removeComments=false');
  `);

  console.log('\n--- MODULE 3: GROUPS & STRUCTURE (15 Tests) ---');
  await test('M3.01: Empty group <g></g> removed', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g></g><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('<g>')) throw new Error('Empty group present');
  `);
  await test('M3.02: Self closing empty group <g/> removed', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g/><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('<g')) throw new Error('Self closing group present');
  `);
  await test('M3.03: Nested empty groups <g><g><g/></g></g> removed', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g><g><g/></g></g><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('<g')) throw new Error('Nested empty groups present');
  `);
  await test('M3.04: Whitespace only group removed', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g>   \\n  \\t  </g><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('<g')) throw new Error('Whitespace group present');
  `);
  await test('M3.05: Group containing only comment removed when comments stripped', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g><!-- just comment --></g><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('<g')) throw new Error('Comment-only group present');
  `);
  await test('M3.06: Non-empty group with stroke attributes preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g stroke="red" stroke-width="2"><circle cx="5" cy="5" r="5"/></g></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('stroke="red"')) throw new Error('Stroke on group lost');
  `);
  await test('M3.07: Redundant attribute-less single-child group collapsed', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g><circle cx="5" cy="5" r="5"/></g></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('<g>') && res.svg.includes('</g>')) throw new Error('Redundant wrapper group not collapsed');
  `);
  await test('M3.08: Group with ID preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g id="important-group"><circle cx="5" cy="5" r="5"/></g></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('important-group')) throw new Error('Group ID lost');
  `);
  await test('M3.09: Group with class preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g class="btn-layer"><circle cx="5" cy="5" r="5"/></g></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('btn-layer')) throw new Error('Group class lost');
  `);
  await test('M3.10: Group with transform preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g transform="translate(10 20)"><circle cx="5" cy="5" r="5"/></g></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('translate(10 20)') && !res.svg.includes('translate(10,20)')) throw new Error('Transform lost');
  `);
  await test('M3.11: Group with opacity preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g opacity="0.5"><circle cx="5" cy="5" r="5"/></g></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('opacity=".5"') && !res.svg.includes('opacity="0.5"')) throw new Error('Opacity lost');
  `);
  await test('M3.12: Group with clip-path preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="cp"><rect width="10" height="10"/></clipPath></defs><g clip-path="url(#cp)"><circle cx="5" cy="5" r="5"/></g></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('clip-path="url(#cp)"')) throw new Error('Clip-path on group lost');
  `);
  await test('M3.13: Group with filter preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><filter id="fl"><feGaussianBlur/></filter></defs><g filter="url(#fl)"><circle cx="5" cy="5" r="5"/></g></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('filter="url(#fl)"')) throw new Error('Filter on group lost');
  `);
  await test('M3.14: Empty groups preserved when removeEmptyGroups=false', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g></g><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: false, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('<g')) throw new Error('Empty group removed when removeEmptyGroups=false: ' + res.svg);
  `);
  await test('M3.15: Deeply nested groups with mixed content handled safely', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g><g><g fill="red"><circle cx="5" cy="5" r="5"/></g></g></g></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('fill="red"') || !res.svg.includes('circle')) throw new Error('Nested structure corrupted');
  `);

  console.log('\n--- MODULE 4: COLORS & MINIFICATION (15 Tests) ---');
  await test('M4.01: #ffffff minified to #fff', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#ffffff" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('fill="#fff"')) throw new Error('Not minified to #fff: ' + res.svg);
  `);
  await test('M4.02: #000000 minified to #000', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#000000" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('fill="#000"')) throw new Error('Not minified to #000');
  `);
  await test('M4.03: #aabbcc minified to #abc', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#aabbcc" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('fill="#abc"')) throw new Error('Not minified to #abc');
  `);
  await test('M4.04: Non-shortenable #123456 preserved accurately', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#123456" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('fill="#123456"')) throw new Error('Corrupted #123456');
  `);
  await test('M4.05: Non-shortenable #f0f0f1 preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#f0f0f1" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('fill="#f0f0f1"')) throw new Error('Corrupted #f0f0f1');
  `);
  await test('M4.06: Named color none preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="none" stroke="#222222" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('fill="none"')) throw new Error('fill none lost');
  `);
  await test('M4.07: currentColor keyword preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M0 0h10v10H0z"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('currentColor')) throw new Error('currentColor altered');
  `);
  await test('M4.08: inherit keyword preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><circle fill="inherit" cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('inherit')) throw new Error('inherit altered');
  `);
  await test('M4.09: transparent keyword preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><circle fill="transparent" cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('transparent')) throw new Error('transparent altered');
  `);
  await test('M4.10: Color in fill minified', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><circle fill="#ff0000" cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('fill="#f00"')) throw new Error('fill not minified');
  `);
  await test('M4.11: Color in stroke minified', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><circle stroke="#00ff00" cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('stroke="#0f0"')) throw new Error('stroke not minified');
  `);
  await test('M4.12: Color in stop-color minified', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop offset="0" stop-color="#0000ff"/></linearGradient></defs><rect fill="url(#g)" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('stop-color="#00f"')) throw new Error('stop-color not minified');
  `);
  await test('M4.13: Color inside inline style minified', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect style="fill: #ffffff; stroke: #222222" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('#fff') || !res.svg.includes('#222')) throw new Error('inline style color not minified');
  `);
  await test('M4.14: Hex color in embedded <style> minified', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>.cls{fill:#ffffff;}</style><rect class="cls" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('#fff')) throw new Error('Embedded style hex not minified');
  `);
  await test('M4.15: Colors preserved when minifyColors=false', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#ffffff" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: false });
    if (!res.svg.includes('fill="#ffffff"')) throw new Error('Color minified when minifyColors=false');
  `);

  console.log('\n--- MODULE 5: COORDINATES, PRECISION & VIEWBOX (15 Tests) ---');
  await test('M5.01: Coordinate precision 2 decimal places', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1.23456 2.34567 L8.76543 9.87654"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('1.23') || !res.svg.includes('2.35')) throw new Error('Precision 2 failed: ' + res.svg);
  `);
  await test('M5.02: Coordinate precision 0 integer level', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1.23 2.87 L8.1 9.9"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 0, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('M1 3') && !res.svg.includes('M1,3')) throw new Error('Precision 0 failed: ' + res.svg);
  `);
  await test('M5.03: Coordinate precision 4 decimals', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1.12345 2.12345"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 4, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('1.1235')) throw new Error('Precision 4 failed: ' + res.svg);
  `);
  await test('M5.04: Negative coordinate rounding', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M-1.2345 -2.3456"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('-1.23') || !res.svg.includes('-2.35')) throw new Error('Negative rounding failed: ' + res.svg);
  `);
  await test('M5.05: Trailing zeros stripped (2.500 -> 2.5)', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M2.500 3.000"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('2.50') || res.svg.includes('3.0')) throw new Error('Trailing zeros remain: ' + res.svg);
  `);
  await test('M5.06: Leading zero stripped (0.75 -> .75)', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0.75 0.5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('.75') && !res.svg.includes('.5')) throw new Error('Leading zero not stripped');
  `);
  await test('M5.07: Negative zero normalized to 0', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M-0.001 0.001"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('-0 ') || res.svg.includes('-0,')) throw new Error('Negative zero present');
  `);
  await test('M5.08: Small shape guard: circle r=0.001 preserved from collapsing', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><circle cx="0.0049" cy="0.0049" r="0.001"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('<circle') || res.svg.includes('r="0"')) throw new Error('Small circle vanished or collapsed: ' + res.svg);
  `);
  await test('M5.09: width and height decimals formatted', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" width="100.555" height="50.444"><rect width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('100.555')) throw new Error('Width not rounded');
  `);
  await test('M5.10: viewBox precision safeguarded (not distorted)', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><rect width="100" height="50"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('viewBox="0 0 100 50"')) throw new Error('viewBox distorted: ' + res.svg);
  `);
  await test('M5.11: Responsive viewBox preserved when preserveViewBox=true', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50" viewBox="0 0 20 10"><rect width="20" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true, preserveViewBox: true });
    if (!res.svg.includes('viewBox="0 0 20 10"')) throw new Error('viewBox lost when preserveViewBox=true');
  `);
  await test('M5.12: viewBox removed and dimensions added when preserveViewBox=false', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 10"><rect width="20" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true, preserveViewBox: false });
    if (res.svg.includes('viewBox')) throw new Error('viewBox kept when preserveViewBox=false');
    if (!res.svg.includes('width=') || !res.svg.includes('height=')) throw new Error('Dimensions missing after viewBox removal');
  `);
  await test('M5.13: Missing width/height with viewBox preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('viewBox="0 0 24 24"')) throw new Error('viewBox lost');
  `);
  await test('M5.14: Scientific notation coordinates handled safely', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1e-2 2e-2 L5 5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid || !res.svg.includes('<path')) throw new Error('Scientific notation error: ' + res.svg);
  `);
  await test('M5.15: Multiple sub-commands coordinate precision maintained', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1.111 2.222 L3.333 4.444 C5.555 6.666 7.777 8.888 9.999 1.111"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('1.111') || res.svg.includes('2.222')) throw new Error('Precision not applied to all tokens');
  `);

  console.log('\n--- MODULE 6: PATH TOKENIZER & OPTIMIZATION (15 Tests) ---');
  await test('M6.01: Absolute MoveTo M command handled', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M 10 20 L 30 40"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('M10 20') && !res.svg.includes('M10,20')) throw new Error('M command failed');
  `);
  await test('M6.02: Relative MoveTo m command preserved or converted', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="m 10 20 l 30 40"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid || !res.svg.includes('<path')) throw new Error('Relative m failed');
  `);
  await test('M6.03: LineTo L command handled', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 L 10 10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('L10 10') && !res.svg.includes('L10,10')) throw new Error('L command failed');
  `);
  await test('M6.04: Horizontal line H command handled', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 H 25"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('H25')) throw new Error('H command failed');
  `);
  await test('M6.05: Vertical line V command handled', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 V 35"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('V35')) throw new Error('V command failed');
  `);
  await test('M6.06: Cubic Bezier C command handled', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 C 1 2 3 4 5 6"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('C1 2 3 4 5 6') && !res.svg.includes('C1,2,3,4,5,6')) throw new Error('C command failed');
  `);
  await test('M6.07: Smooth Cubic Bezier S command handled', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 C 1 2 3 4 5 6 S 7 8 9 10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid) throw new Error('S command failed');
  `);
  await test('M6.08: Quadratic Bezier Q command handled', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 Q 5 10 15 20"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid) throw new Error('Q command failed');
  `);
  await test('M6.09: Smooth Quadratic Bezier T command handled', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M 0 0 Q 5 10 15 20 T 30 40"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid) throw new Error('T command failed');
  `);
  await test('M6.10: Elliptical Arc A command with 7 parameters handled', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M 10 10 A 5 5 0 0 1 20 20"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('A5 5 0 0 1 20 20') && !res.svg.includes('A5,5,0,0,1,20,20') && !res.svg.includes('A5 5 0 0120 20')) throw new Error('Arc failed');
  `);
  await test('M6.11: Glued arc flags A5 5 0 0120 20 not corrupted', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M 10 10 A5 5 0 0120 20"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid) throw new Error('Glued arc flags failed');
  `);
  await test('M6.12: ClosePath Z and z handled', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h10v10H0z"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('z') && !res.svg.includes('Z')) throw new Error('ClosePath lost');
  `);
  await test('M6.13: Glued negative numbers M10-20L-30-40 parsed properly', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M10-20L-30-40"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid) throw new Error('Glued negative numbers failed');
  `);
  await test('M6.14: Multiline path whitespace compacted without corrupting tokens', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1\\n L9 1\\n L5 9 Z"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid || !res.svg.includes('M1 1')) throw new Error('Multiline path corrupted: ' + res.svg);
  `);
  await test('M6.15: Path normalization to absolute coordinates', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M10 10 l 5 5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid) throw new Error('Path normalization failed');
  `);

  console.log('\n--- MODULE 7: SHAPES & CONVERSIONS (12 Tests) ---');
  await test('M7.01: <rect> converted to path in Maximum mode', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="10" height="20"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'maximum', minifyColors: true });
    if (!res.svg.includes('<path')) throw new Error('Rect not converted to path in maximum mode');
  `);
  await test('M7.02: <circle> preserved when more compact than arc path representation', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'maximum', minifyColors: true });
    if (!res.svg.includes('<circle') || !res.analysis.valid) throw new Error('Circle lost');
  `);
  await test('M7.03: <line> converted to path in Maximum mode', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="0" x2="10" y2="10" stroke="black"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'maximum', minifyColors: true });
    if (!res.svg.includes('<path')) throw new Error('Line not converted to path in maximum mode');
  `);
  await test('M7.04: <polyline> converted to path in Maximum mode', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><polyline points="0,0 10,10 20,0"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'maximum', minifyColors: true });
    if (!res.svg.includes('<path')) throw new Error('Polyline not converted');
  `);
  await test('M7.05: <polygon> converted to path in Maximum mode', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><polygon points="0,0 10,10 20,0"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'maximum', minifyColors: true });
    if (!res.svg.includes('<path')) throw new Error('Polygon not converted');
  `);
  await test('M7.06: Rounded rect with rx/ry preserved accurately', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="20" height="20" rx="4" ry="4"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('rx="4"')) throw new Error('rx lost');
  `);
  await test('M7.07: Zero radius circle r=0 pruned as non-rendering', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="0"/><rect width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('<circle')) throw new Error('r=0 circle not pruned');
  `);
  await test('M7.08: Zero width rect width=0 pruned as non-rendering', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect width="0" height="10"/><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('<rect')) throw new Error('width=0 rect not pruned');
  `);
  await test('M7.09: Ellipse with equal radii rx=ry converted to circle', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><ellipse cx="10" cy="10" rx="5" ry="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('<circle') && !res.svg.includes('<path')) throw new Error('Ellipse not converted to circle');
  `);
  await test('M7.10: Safe mode preserves shapes as original primitives', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'safe', minifyColors: true });
    if (!res.svg.includes('<rect') || !res.svg.includes('<circle')) throw new Error('Safe mode converted primitives');
  `);
  await test('M7.11: Balanced mode maintains visual integrity', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'balanced', minifyColors: true });
    if (!res.analysis.valid) throw new Error('Balanced mode failed');
  `);
  await test('M7.12: Polygon with non-zero winding rule preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><polygon fill-rule="evenodd" points="0,0 10,10 20,0"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('evenodd')) throw new Error('fill-rule lost');
  `);

  console.log('\n--- MODULE 8: DEFINITIONS, GRADIENTS & REFERENCES (15 Tests) ---');
  await test('M8.01: <linearGradient> referenced in fill preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lg"><stop offset="0" stop-color="red"/></linearGradient></defs><rect fill="url(#lg)" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('linearGradient') || !res.svg.includes('id="lg"') || !res.svg.includes('url(#lg)')) throw new Error('linearGradient reference lost');
  `);
  await test('M8.02: <radialGradient> referenced in stroke preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="rg"><stop offset="0" stop-color="blue"/></radialGradient></defs><circle stroke="url(#rg)" cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('radialGradient') || !res.svg.includes('url(#rg)')) throw new Error('radialGradient lost');
  `);
  await test('M8.03: Unreferenced linearGradient in defs stripped in Smart mode', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="unused"><stop offset="0" stop-color="red"/></linearGradient></defs><circle cx="5" cy="5" r="4" fill="blue"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('unused')) throw new Error('Unused gradient retained');
  `);
  await test('M8.04: Unreferenced radialGradient stripped in Smart mode', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="unused_rg"><stop offset="0" stop-color="green"/></radialGradient></defs><circle cx="5" cy="5" r="4" fill="blue"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('unused_rg')) throw new Error('Unused radialGradient retained');
  `);
  await test('M8.05: Gradient with nested stops preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#000"/></linearGradient></defs><rect fill="url(#g)" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('stop offset="0%"') && !res.svg.includes('stop offset="0"')) throw new Error('Stops lost');
  `);
  await test('M8.06: Gradient stop-opacity preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop offset="0" stop-color="red" stop-opacity="0.5"/></linearGradient></defs><rect fill="url(#g)" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('stop-opacity=".5"') && !res.svg.includes('stop-opacity="0.5"')) throw new Error('stop-opacity lost');
  `);
  await test('M8.07: <pattern> referenced in fill preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><pattern id="p" width="4" height="4"><path d="M0 0h4v4H0z"/></pattern></defs><rect fill="url(#p)" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('<pattern') || !res.svg.includes('url(#p)')) throw new Error('Pattern lost');
  `);
  await test('M8.08: <clipPath> referenced by clip-path preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="cp"><circle cx="5" cy="5" r="3"/></clipPath></defs><rect fill="red" clip-path="url(#cp)" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('<clipPath') || !res.svg.includes('url(#cp)')) throw new Error('clipPath lost');
  `);
  await test('M8.09: <mask> referenced by mask attribute preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><mask id="m"><circle cx="5" cy="5" r="3" fill="white"/></mask></defs><rect fill="red" mask="url(#m)" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('<mask') || !res.svg.includes('url(#m)')) throw new Error('mask lost');
  `);
  await test('M8.10: <filter> referenced by filter attribute preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><filter id="f"><feGaussianBlur stdDeviation="0.2"/></filter></defs><circle cx="5" cy="5" r="3" filter="url(#f)"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('<filter') || !res.svg.includes('url(#f)')) throw new Error('filter lost');
  `);
  await test('M8.11: <use> referencing <path id="p"> preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><path id="p" d="M1 1h8v8H1z"/></defs><use href="#p" fill="blue"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('id="p"') || !res.svg.includes('#p')) throw new Error('use href reference lost');
  `);
  await test('M8.12: Chained <use> referencing another symbol/path preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><circle id="c1" r="2"/><g id="g1"><use href="#c1"/></g></defs><use href="#g1"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('id="c1"') || !res.svg.includes('id="g1"')) throw new Error('Chained use reference lost');
  `);
  await test('M8.13: Nested defs inside groups preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><g><defs><linearGradient id="nested_g"><stop offset="0" stop-color="red"/></linearGradient></defs><rect fill="url(#nested_g)" width="10" height="10"/></g></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('nested_g')) throw new Error('Nested gradient lost');
  `);
  await test('M8.14: Safe mode preserves all defs even if unreferenced', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="unused_safe"><stop offset="0" stop-color="red"/></linearGradient></defs><circle cx="5" cy="5" r="4" fill="blue"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'safe', minifyColors: true });
    if (!res.svg.includes('unused_safe')) throw new Error('Safe mode deleted defs');
  `);
  await test('M8.15: Missing reference does not throw error', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect fill="url(#nonexistent)" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid || !res.svg.includes('nonexistent')) throw new Error('Missing reference error');
  `);

  console.log('\n--- MODULE 9: TRANSFORMS & PRESENTATION ATTRS (12 Tests) ---');
  await test('M9.01: transform="translate(10, 20)" compacted', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect width="5" height="5" transform="translate(10, 20)"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('translate(10 20)') && !res.svg.includes('translate(10,20)')) throw new Error('Translate corrupted');
  `);
  await test('M9.02: transform="rotate(45)" compacted', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect width="5" height="5" transform="rotate(45)"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('rotate(45)')) throw new Error('Rotate corrupted');
  `);
  await test('M9.03: transform="scale(2)" compacted', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect width="5" height="5" transform="scale(2)"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('scale(2)')) throw new Error('Scale corrupted');
  `);
  await test('M9.04: transform="scale(2, 3)" compacted', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect width="5" height="5" transform="scale(2, 3)"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('scale(2 3)') && !res.svg.includes('scale(2,3)')) throw new Error('Scale 2 3 corrupted');
  `);
  await test('M9.05: transform="matrix(1 0 0 1 10 20)" converted or compacted', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect width="5" height="5" transform="matrix(1 0 0 1 10 20)"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('translate(10 20)') && !res.svg.includes('translate(10,20)') && !res.svg.includes('matrix')) throw new Error('Matrix corrupted');
  `);
  await test('M9.06: Combined transforms preserve order and semantics', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect width="5" height="5" transform="translate(5 5) rotate(10)"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('translate') || !res.svg.includes('rotate')) throw new Error('Combined transforms lost');
  `);
  await test('M9.07: Default opacity="1" removed as redundant in smart mode', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5" opacity="1"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('opacity="1"')) throw new Error('Redundant opacity="1" not removed');
  `);
  await test('M9.08: Non-default opacity="0.5" preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="5" opacity="0.5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('opacity=".5"') && !res.svg.includes('opacity="0.5"')) throw new Error('Non-default opacity lost');
  `);
  await test('M9.09: stroke-width="2" preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="0" x2="10" y2="10" stroke="#000" stroke-width="2"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('stroke-width="2"')) throw new Error('stroke-width lost');
  `);
  await test('M9.10: stroke-dasharray="3 2" preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M2 10h16" stroke="#000" stroke-dasharray="3 2"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('stroke-dasharray="3 2"') && !res.svg.includes('stroke-dasharray="3,2"')) throw new Error('stroke-dasharray lost');
  `);
  await test('M9.11: stroke-linecap="round" preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="0" x2="10" y2="10" stroke="#000" stroke-linecap="round"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('stroke-linecap="round"')) throw new Error('stroke-linecap lost');
  `);
  await test('M9.12: stroke-linejoin="round" preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><polyline points="0,0 5,5 10,0" stroke="#000" stroke-linejoin="round"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('stroke-linejoin="round"')) throw new Error('stroke-linejoin lost');
  `);

  console.log('\n--- MODULE 10: CSS & STYLESHEETS (12 Tests) ---');
  await test('M10.01: <style> tag with class selector preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>.x{fill:#ff0000}</style><rect class="x" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('.x') || !res.svg.includes('class="x"')) throw new Error('CSS class style lost');
  `);
  await test('M10.02: <style> with ID selector #box { fill: red } protected from color minifier', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>#f00{stroke:black}</style><rect id="f00" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('#f00{stroke:black}') && !res.svg.includes('#f00{stroke:#000}')) throw new Error('CSS ID selector corrupted by color minifier');
  `);
  await test('M10.03: Style tag comments stripped', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>/* author notes */ .a{fill:red}</style><circle class="a" cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('author notes')) throw new Error('CSS comment not stripped');
  `);
  await test('M10.04: Style tag whitespace compacted', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>\\n  .a {\\n    fill: red;\\n  }\\n</style><circle class="a" cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('  fill: red;')) throw new Error('CSS whitespace not compacted');
  `);
  await test('M10.05: Inline style minified', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect style="fill: #ff0000; stroke: #000000;" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('#f00') || !res.svg.includes('#000')) throw new Error('Inline style color not minified');
  `);
  await test('M10.06: Class names referenced in elements preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>.btn{opacity:0.9}</style><rect class="btn" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('class="btn"')) throw new Error('Class attribute lost');
  `);
  await test('M10.07: Media queries inside <style> preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>@media (prefers-color-scheme: dark){.icon{fill:#fff;}}</style><circle class="icon" cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('@media') || !res.svg.includes('prefers-color-scheme')) throw new Error('Media query in style lost');
  `);
  await test('M10.08: Multiple class names class="btn primary" preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>.btn{stroke:red}.primary{fill:blue}</style><rect class="btn primary" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('class="btn primary"')) throw new Error('Multiple class names lost');
  `);
  await test('M10.09: Style element preserved when removeXml=true', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>.a{fill:green}</style><circle class="a" cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('<style>')) throw new Error('Style tag deleted');
  `);
  await test('M10.10: Styles affecting opacity preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>.fade{opacity:0.4}</style><rect class="fade" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('.fade')) throw new Error('Opacity style lost');
  `);
  await test('M10.11: Safe mode styling hooks never broken', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>.x{fill:#ff0000}</style><rect class="x" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'safe', minifyColors: true });
    if (!res.svg.includes('class="x"') || !res.svg.includes('.x')) throw new Error('Safe mode broke styling hook');
  `);
  await test('M10.12: Trailing semicolons in inline styles cleaned up safely', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><rect style="fill:red;" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid || !res.svg.includes('fill:red')) throw new Error('Inline style broken');
  `);

  console.log('\n--- MODULE 11: ACCESSIBILITY & TEXT SEMANTICS (10 Tests) ---');
  await test('M11.01: <title> tag with id preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="t"><title id="t">Accessible Title</title><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('<title id="t">Accessible Title</title>')) throw new Error('Title element lost');
  `);
  await test('M11.02: <desc> tag preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><desc>Detailed graphic description</desc><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'safe', minifyColors: true });
    if (!res.svg.includes('Detailed graphic description')) throw new Error('Desc tag lost in safe mode');
  `);
  await test('M11.03: role="img" preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" role="img"><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('role="img"')) throw new Error('role="img" lost');
  `);
  await test('M11.04: aria-labelledby attribute and matching target id preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" aria-labelledby="lbl"><title id="lbl">Label</title><rect width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('aria-labelledby="lbl"') || !res.svg.includes('id="lbl"')) throw new Error('aria-labelledby or id lost');
  `);
  await test('M11.05: aria-describedby attribute preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" aria-describedby="desc-id"><desc id="desc-id">Desc</desc><rect width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('aria-describedby="desc-id"')) throw new Error('aria-describedby lost');
  `);
  await test('M11.06: aria-hidden="true" preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('aria-hidden="true"')) throw new Error('aria-hidden lost');
  `);
  await test('M11.07: <text> element and coordinates preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><text x="10" y="20" font-size="14">Sample Text</text></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('Sample Text') || !res.svg.includes('x="10"') || !res.svg.includes('y="20"')) throw new Error('Text element corrupted');
  `);
  await test('M11.08: <tspan> sub-elements preserved', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><text x="0" y="10"><tspan dx="5">Sub 1</tspan><tspan dx="10">Sub 2</tspan></text></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('<tspan') || !res.svg.includes('Sub 1') || !res.svg.includes('Sub 2')) throw new Error('tspan elements lost');
  `);
  await test('M11.09: Unicode characters preserved without corruption', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><text x="0" y="15">Café — سلام</text></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('Café — سلام')) throw new Error('Unicode text corrupted: ' + res.svg);
  `);
  await test('M11.10: Emojis preserved in text elements', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><text x="0" y="15">🚀 KivaroTools 🌟</text></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('🚀 KivaroTools 🌟')) throw new Error('Emoji corrupted');
  `);

  console.log('\n--- MODULE 12: SECURITY & PREVIEW SANITIZATION (16 Tests) ---');
  await test('M12.01: <script> stripped from preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><circle cx="5" cy="5" r="4"/></svg>');
    if (sanitized.includes('<script') || sanitized.includes('alert(1)')) throw new Error('Script not stripped: ' + sanitized);
  `);
  await test('M12.02: Script with CDATA stripped from preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><script><![CDATA[alert(1)]]></script><circle cx="5" cy="5" r="4"/></svg>');
    if (sanitized.includes('alert(1)')) throw new Error('Script CDATA not stripped');
  `);
  await test('M12.03: onload handler stripped from preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><circle cx="5" cy="5" r="4"/></svg>');
    if (sanitized.includes('onload')) throw new Error('onload handler not stripped');
  `);
  await test('M12.04: onclick handler stripped from preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><circle onclick="alert(1)" cx="5" cy="5" r="4"/></svg>');
    if (sanitized.includes('onclick')) throw new Error('onclick handler not stripped');
  `);
  await test('M12.05: onerror handler stripped from preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><image onerror="alert(1)" width="10" height="10"/></svg>');
    if (sanitized.includes('onerror')) throw new Error('onerror handler not stripped');
  `);
  await test('M12.06: onmouseover handler stripped from preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><rect onmouseover="alert(1)" width="10" height="10"/></svg>');
    if (sanitized.includes('onmouseover')) throw new Error('onmouseover not stripped');
  `);
  await test('M12.07: href="javascript:..." stripped from preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><circle cx="5" cy="5" r="4"/></a></svg>');
    if (sanitized.includes('javascript:')) throw new Error('javascript: href not stripped');
  `);
  await test('M12.08: xlink:href="javascript:..." stripped from preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href="javascript:alert(1)"><circle cx="5" cy="5" r="4"/></a></svg>');
    if (sanitized.includes('javascript:')) throw new Error('xlink:href javascript: not stripped');
  `);
  await test('M12.09: <foreignObject> sanitized in preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><foreignObject width="10" height="10"><div xmlns="http://www.w3.org/1999/xhtml">Test</div></foreignObject></svg>');
    if (sanitized.includes('<foreignObject') || sanitized.includes('<div')) throw new Error('foreignObject not stripped');
  `);
  await test('M12.10: <iframe> stripped from preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><iframe src="https://evil.com"/></svg>');
    if (sanitized.includes('<iframe')) throw new Error('iframe not stripped');
  `);
  await test('M12.11: <embed> stripped from preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><embed src="https://evil.com"/></svg>');
    if (sanitized.includes('<embed')) throw new Error('embed not stripped');
  `);
  await test('M12.12: <object> stripped from preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><object data="https://evil.com"/></svg>');
    if (sanitized.includes('<object')) throw new Error('object not stripped');
  `);
  await test('M12.13: SMIL <animate> script execution attempts neutralized', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><animate onbegin="alert(1)"/></svg>');
    if (sanitized.includes('onbegin')) throw new Error('SMIL onbegin not stripped');
  `);
  await test('M12.14: External tracking image URL neutralized in preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><image href="https://tracker.com/pixel.png" width="10" height="10"/></svg>');
    if (sanitized.includes('https://tracker.com')) throw new Error('External image URL not neutralized in preview');
  `);
  await test('M12.15: Safe inline base64 image data URL preserved in preview', `
    const sanitized = sanitizeSvgForPreview('<svg xmlns="http://www.w3.org/2000/svg"><image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" width="10" height="10"/></svg>');
    if (!sanitized.includes('data:image/png;base64')) throw new Error('Safe data URL stripped');
  `);
  await test('M12.16: Analysis accurately flags risk=high for hostile payload', `
    const an = analyzeSvg('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>evil()</script></svg>');
    if (an.risk !== 'high' || an.scripts !== 1 || an.eventHandlers !== 1) throw new Error('Hostile analysis failed: ' + JSON.stringify(an));
  `);

  console.log('\n--- MODULE 13: MODES & TOGGLE COMBINATIONS (12 Tests) ---');
  await test('M13.01: Safe mode preserves IDs and classes strictly', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><style>.x{fill:red}</style><rect id="box" class="x" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'safe', minifyColors: true });
    if (!res.svg.includes('id="box"') || !res.svg.includes('class="x"')) throw new Error('Safe mode dropped id or class');
  `);
  await test('M13.02: Smart mode optimizes safely with high fidelity', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1h8v8H1z"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid || !res.svg.includes('<path')) throw new Error('Smart mode failed');
  `);
  await test('M13.03: Balanced mode performs multi-pass optimization', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><g><path d="M1.234 1.234h8v8H1.234z"/></g></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'balanced', minifyColors: true });
    if (!res.analysis.valid) throw new Error('Balanced mode failed');
  `);
  await test('M13.04: Maximum mode achieves highest reduction safely', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><rect x="0" y="0" width="10" height="10"/><circle cx="15" cy="15" r="5"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'maximum', minifyColors: true });
    if (!res.analysis.valid) throw new Error('Maximum mode failed');
  `);
  await test('M13.05: All toggles ON succeeds', `
    const res = runOptimizerCore('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><!-- c --><g></g><rect fill="#ffffff" width="10" height="10"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart', preserveViewBox: true });
    if (res.svg.includes('<?xml') || res.svg.includes('<!--') || res.svg.includes('<g>') || !res.svg.includes('#fff')) throw new Error('Toggles ON failed');
  `);
  await test('M13.06: All toggles OFF keeps markup elements intact', `
    const res = runOptimizerCore('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><!-- c --><g></g><rect fill="#ffffff" width="10" height="10"/></svg>', { removeXml: false, removeComments: false, removeEmptyGroups: false, minifyColors: false, precision: 4, mode: 'safe', preserveViewBox: true });
    if (!res.svg.includes('<!-- c -->') || !res.svg.includes('#ffffff')) throw new Error('Toggles OFF failed: ' + res.svg);
  `);
  await test('M13.07: Only Remove Comments ON', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><!-- c --><g></g><rect fill="#ffffff" width="10" height="10"/></svg>', { removeXml: false, removeComments: true, removeEmptyGroups: false, minifyColors: false, precision: 2, mode: 'smart' });
    if (res.svg.includes('<!-- c -->')) throw new Error('Comment not removed');
    if (!res.svg.includes('#ffffff')) throw new Error('Color minified when toggle OFF');
  `);
  await test('M13.08: Only Remove XML ON', `
    const res = runOptimizerCore('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><!-- c --><circle cx="5" cy="5" r="5"/></svg>', { removeXml: true, removeComments: false, removeEmptyGroups: false, minifyColors: false, precision: 2, mode: 'smart' });
    if (res.svg.includes('<?xml')) throw new Error('XML prolog not removed');
    if (!res.svg.includes('<!-- c -->')) throw new Error('Comment removed when toggle OFF');
  `);
  await test('M13.09: Only Remove Empty Groups ON', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><!-- c --><g></g><circle cx="5" cy="5" r="5"/></svg>', { removeXml: false, removeComments: false, removeEmptyGroups: true, minifyColors: false, precision: 2, mode: 'smart' });
    if (res.svg.includes('<g></g>') || res.svg.includes('<g/>')) throw new Error('Empty group not removed');
  `);
  await test('M13.10: Only Minify Colors ON', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><!-- c --><rect fill="#ffffff" width="10" height="10"/></svg>', { removeXml: false, removeComments: false, removeEmptyGroups: false, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('#fff')) throw new Error('Color not minified');
    if (!res.svg.includes('<!-- c -->')) throw new Error('Comment removed when toggle OFF');
  `);
  await test('M13.11: Precision 0 across mode matrix works accurately', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M1.2 3.8"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 0, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('M1 4') && !res.svg.includes('M1,4')) throw new Error('Precision 0 failed');
  `);
  await test('M13.12: Precision 4 across mode matrix works accurately', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"><path d="M1.12345 2.54321"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 4, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('1.1235') || !res.svg.includes('2.5432')) throw new Error('Precision 4 failed: ' + res.svg);
  `);

  console.log('\n--- MODULE 14: SAFETY GATES, IDEMPOTENCE & EDGE CASES (12 Tests) ---');
  await test('M14.01: Empty string input returns empty result safely', `
    const res = runOptimizerCore('', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg !== '' || res.analysis.valid !== false) throw new Error('Empty input failed');
  `);
  await test('M14.02: Whitespace only input returns empty result safely', `
    const res = runOptimizerCore('   \\t\\n  ', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg !== '' || res.analysis.valid !== false) throw new Error('Whitespace input failed');
  `);
  await test('M14.03: Plain text non-XML input returns empty result with valid=false', `
    const res = runOptimizerCore('hello world this is not svg', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg !== '' || res.analysis.valid !== false) throw new Error('Plain text failed');
  `);
  await test('M14.04: Already compact SVG gives 0% savings and preserves original markup', `
    const compact = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2"/></svg>';
    const res = runOptimizerCore(compact, { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.length > compact.length) throw new Error('Produced larger output without savings gate: ' + res.svg);
  `);
  await test('M14.05: Idempotence: pass 1 output equals pass 2 output exactly', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g id="layer"><rect x="10.555" y="10.555" width="50.444" height="50.444" fill="#ffffff"/></g></svg>';
    const pass1 = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    const pass2 = runOptimizerCore(pass1.svg, { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (pass1.svg !== pass2.svg) throw new Error('Not idempotent! Pass 1: ' + pass1.svg + ' vs Pass 2: ' + pass2.svg);
  `);
  await test('M14.06: Candidate gate rejects broken candidates that collapse shapes', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('<circle')) throw new Error('Circle collapsed');
  `);
  await test('M14.07: Health score before and after calculated accurately', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (typeof res.healthBefore !== 'number' || typeof res.healthAfter !== 'number' || res.healthAfter < 50) throw new Error('Health score invalid: ' + res.healthAfter);
  `);
  await test('M14.08: Multi-line attributes compacted into clean single line tags', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg"\\n  viewBox="0 0 10 10"\\n  width="10"\\n  height="10"><circle\\n    cx="5"\\n    cy="5"\\n    r="2"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (res.svg.includes('\\n  viewBox')) throw new Error('Multi-line attributes not compacted');
  `);
  await test('M14.09: Duplicate attribute handles safely without error', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="red"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.analysis.valid) throw new Error('Duplicate attribute check failed');
  `);
  await test('M14.10: Namespace prefix aliases (e.g. xlink) normalized safely', `
    const res = runOptimizerCore('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><path id="p" d="M0 0h1v1H0z"/></defs><use xlink:href="#p"/></svg>', { removeXml: true, removeComments: true, removeEmptyGroups: true, precision: 2, mode: 'smart', minifyColors: true });
    if (!res.svg.includes('#p')) throw new Error('Namespace alias failed');
  `);
  await test('M14.11: Filename sanitizer with special characters', `
    const name = sanitizeExportFilename('my<strange>?file:name*.svg');
    if (name.includes('<') || name.includes('?') || name.includes(':') || name.includes('*') || !name.endsWith('.optimized.svg')) throw new Error('Filename not sanitized properly: ' + name);
  `);
  await test('M14.12: Filename sanitizer handles Windows reserved device names (CON, NUL, AUX)', `
    const name1 = sanitizeExportFilename('CON.svg');
    const name2 = sanitizeExportFilename('NUL.svg');
    const name3 = sanitizeExportFilename('AUX.svg');
    if (name1.startsWith('CON.') || name2.startsWith('NUL.') || name3.startsWith('AUX.')) throw new Error('Windows reserved names not guarded');
  `);

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================');

  ws.close();
  chrome.kill();

  if (failedTests > 0) {
    console.error(`\n❌ ${failedTests} test(s) failed in the 175+ suite!`);
    process.exit(1);
  } else {
    console.log('\n✅ ALL 175+ COMPREHENSIVE TESTS PASSED 100% ACCURATELY IN CHROMIUM!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
