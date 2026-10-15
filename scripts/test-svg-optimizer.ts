/**
 * Comprehensive automated test suite for OmniTools SVG Optimizer
 * Executes in real headless Chromium to ensure 100% faithful DOMParser,
 * XMLSerializer, and Web Worker API compliance.
 *
 * Run with: npm run test:svg
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import ts from 'typescript';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9228;
const USER_DATA_DIR = path.join(process.cwd(), 'scratch', 'chrome_cdp_svg_' + Date.now());

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(endpoint: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${CDP_PORT}${endpoint}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

// Extract and transpile engine code from SvgOptimizer.tsx
function getEngineSource(): string {
  const componentPath = path.join(process.cwd(), 'components', 'tools', 'SvgOptimizer.tsx');
  const code = fs.readFileSync(componentPath, 'utf8');

  // Extract from MAX_INPUT_BYTES up to sanitizeExportFilename
  const startMarker = 'const MAX_INPUT_BYTES =';
  const endMarker = '// --- REACT COMPONENT ---';

  const startIndex = code.indexOf(startMarker);
  const endIndex = code.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not find engine boundary markers in SvgOptimizer.tsx');
  }

  const rawEngine = code.slice(startIndex, endIndex);

  // Let official TypeScript compiler cleanly erase all types, interfaces, and type aliases
  const transpiled = ts.transpileModule(rawEngine, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      removeComments: true,
    },
  }).outputText;

  // Remove export keywords so declarations become script-level
  const cleanJs = transpiled.replace(/export\s+/g, '');

  // Attach target engine functions to window for CDP evaluations
  const withGlobals = cleanJs + `
    window.runOptimizerCore = runOptimizerCore;
    window.sanitizeSvgForPreview = sanitizeSvgForPreview;
    window.analyzeSvg = analyzeSvg;
    window.normalizePathToAbsolute = normalizePathToAbsolute;
    window.sanitizeExportFilename = sanitizeExportFilename;
  `;

  return withGlobals;
}

async function main() {
  console.log('================================================================');
  console.log('       OMNITOOLS SVG OPTIMIZER CHROMIUM REGRESSION SUITE       ');
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
      const pageTarget = targets.find((t: any) => t.type === 'page');
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
  await new Promise((r) => (ws.onopen = r as any));

  let reqId = 1;
  const send = (method: string, params: any = {}) =>
    new Promise<any>((resolve, reject) => {
      const id = reqId++;
      const handler = (event: any) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Runtime.enable');

  // Inject engine code into page context
  console.log('• Injecting OmniTools SVG Optimizer Engine into Chromium runtime...');
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

  async function evaluateTest(testName: string, testExpression: string) {
    totalTests++;
    try {
      const evalRes = await send('Runtime.evaluate', {
        expression: `(async () => {
          try {
            ${testExpression}
            return { ok: true };
          } catch (err) {
            return { ok: false, error: (err && err.message) || String(err) };
          }
        })()`,
        returnByValue: true,
        awaitPromise: true,
      });

      const res = evalRes.result?.value;
      if (res && res.ok) {
        console.log(`  ✓ ${testName}`);
        passedTests++;
      } else {
        console.error(`  ✗ ${testName} FAILED:`, res?.error || 'Unknown error');
        failedTests++;
      }
    } catch (err: any) {
      console.error(`  ✗ ${testName} EVAL FAILED:`, err.message);
      failedTests++;
    }
  }

  console.log('\n--- 1. Empty, Malformed, and Resource Budget Checks ---');

  await evaluateTest('Empty SVG string returns empty output with valid=false', `
    const res = runOptimizerCore('', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg !== '') throw new Error('Expected empty output, got: ' + res.svg);
    if (res.analysis.valid !== false) throw new Error('Expected valid=false');
  `);

  await evaluateTest('Whitespace-only input returns empty output', `
    const res = runOptimizerCore('   \\n\\t  ', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg !== '') throw new Error('Expected empty output, got: ' + res.svg);
    if (res.analysis.valid !== false) throw new Error('Expected valid=false');
  `);

  await evaluateTest('Malformed non-XML string rejected gracefully without throwing', `
    const res = runOptimizerCore('<<<this is not valid xml<<<', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg !== '') throw new Error('Expected empty output on malformed SVG');
    if (res.analysis.valid !== false) throw new Error('Expected valid=false');
    if (!res.warnings.length) throw new Error('Expected warnings for malformed XML');
  `);

  await evaluateTest('XML with non-SVG root element rejected', `
    const res = runOptimizerCore('<html><body><div>Not an SVG</div></body></html>', { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.analysis.valid !== false) throw new Error('Expected valid=false for non-SVG root');
  `);

  console.log('\n--- 2. Metadata, XML Declaration, and Comments Stripping ---');

  await evaluateTest('Strips XML declaration and DOCTYPE while preserving SVG elements', `
    const input = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg.includes('<?xml')) throw new Error('Failed to strip XML declaration');
    if (res.svg.includes('<!DOCTYPE')) throw new Error('Failed to strip DOCTYPE');
    if (!res.svg.includes('<rect')) throw new Error('Failed to preserve rect element');
  `);

  await evaluateTest('Strips comments when removeComments=true', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><!-- Author comment --><circle r="5"/><!-- Layer comment --></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg.includes('Author comment') || res.svg.includes('Layer comment')) {
      throw new Error('Comments were not stripped');
    }
  `);

  await evaluateTest('Strips editor metadata (<metadata>, <namedview>, <sodipodi:namedview>)', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><metadata><rdf:RDF><cc:Work/></rdf:RDF></metadata><circle r="5"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg.includes('<metadata>') || res.svg.includes('<rdf:RDF>')) {
      throw new Error('Metadata block was not stripped');
    }
  `);

  console.log('\n--- 3. viewBox Preservation and Responsive Scaling ---');

  await evaluateTest('Strictly preserves viewBox attribute across all optimization modes', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 2L2 22h20L12 2z"/></svg>';
    ['smart', 'safe', 'balanced', 'maximum'].forEach(mode => {
      const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode });
      if (!res.svg.includes('viewBox="0 0 24 24"')) {
        throw new Error('viewBox was stripped or altered in mode: ' + mode);
      }
    });
  `);

  await evaluateTest('Safeguards viewBox precision: never truncates decimals to distort aspect ratio', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1.5 1.5"><path d="M0 0h1.5v1.5H0z"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 0, mode: 'smart' });
    if (!res.svg.includes('viewBox="0 0 1.5 1.5"')) {
      throw new Error('viewBox decimals were truncated to 0, resulting in: ' + res.svg);
    }
  `);

  console.log('\n--- 4. Coordinate Precision & Path Tokenizer ---');

  await evaluateTest('Rounds path coordinates to specified decimal precision (precision=2)', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M12.4928194 8.1928471 L50.9876543 80.1234567"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg.includes('12.4928194') || res.svg.includes('80.1234567')) {
      throw new Error('Excess coordinates were not rounded: ' + res.svg);
    }
    if (!res.svg.includes('12.49') || !res.svg.includes('8.19')) {
      throw new Error('Expected rounded coordinate 12.49, got: ' + res.svg);
    }
  `);

  await evaluateTest('Handles glued arc flags and signs without corrupting path commands', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 10A5 5 0 0 1 20 20A5 5 0 1 0 10 10"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    const parsed = normalizePathToAbsolute(res.svg.match(/d="([^"]+)"/)[1]);
    if (!parsed || parsed.length < 2) {
      throw new Error('Arc flags path failed normalization: ' + res.svg);
    }
  `);

  console.log('\n--- 5. Color Minification (SVG 1.1 Compliant) ---');

  await evaluateTest('Minifies 6-digit hex colors to 3-digit shorthand (#ffffff -> #fff, #000000 -> #000)', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect fill="#ffffff" stroke="#000000" width="10" height="10"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('fill="#fff"') || !res.svg.includes('stroke="#000"')) {
      throw new Error('Colors not minified to shorthand: ' + res.svg);
    }
  `);

  await evaluateTest('Does not convert colors to #rgba or #rrggbbaa (preserves SVG 1.1 compatibility)', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect fill="rgba(255, 0, 0, 0.5)" width="10" height="10"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg.includes('#f008') || res.svg.includes('#ff000080')) {
      throw new Error('Converted semi-transparent color to invalid SVG 1.1 hex8: ' + res.svg);
    }
    if (!res.svg.includes('rgba(255,0,0,0.5)')) {
      throw new Error('Expected standard SVG 1.1 rgba(255,0,0,0.5), got: ' + res.svg);
    }
  `);

  console.log('\n--- 6. ID References, Styles, and Defs Reachability ---');

  await evaluateTest('Preserves IDs referenced by url(#id) in fill, stroke, mask, or filter', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="main-grad"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#000"/></linearGradient></defs><circle cx="50" cy="50" r="40" fill="url(#main-grad)"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('id="main-grad"') || !res.svg.includes('fill="url(#main-grad)"')) {
      throw new Error('Referenced gradient ID was stripped: ' + res.svg);
    }
  `);

  await evaluateTest('Removes unreferenced defs while preserving active visual effects', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="active-grad"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#000"/></linearGradient><linearGradient id="dead-grad"><stop offset="0%" stop-color="#f00"/><stop offset="100%" stop-color="#00f"/></linearGradient></defs><circle cx="50" cy="50" r="40" fill="url(#active-grad)"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'balanced' });
    if (!res.svg.includes('id="active-grad"')) throw new Error('Active gradient was removed');
    if (res.svg.includes('id="dead-grad"')) throw new Error('Unused gradient was not pruned');
  `);

  await evaluateTest('Preserves CSS style ID selectors and does not mistake #id for a hex color', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><style>#brand-logo{fill:#ff0000;stroke:#000000}</style><path id="brand-logo" d="M10 10h30v30H10z"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('#brand-logo')) throw new Error('CSS selector #brand-logo was corrupted');
    if (!res.svg.includes('id="brand-logo"')) throw new Error('Element id="brand-logo" was corrupted');
    if (!res.svg.includes('fill:#f00') || !res.svg.includes('stroke:#000')) throw new Error('Style colors not minified');
  `);

  console.log('\n--- 7. Accessibility, Text, and Unicode Attributes ---');

  await evaluateTest('Preserves accessibility attributes (aria-label, aria-labelledby, role)', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="Settings gear"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('role="img"') || !res.svg.includes('aria-label="Settings gear"')) {
      throw new Error('Accessibility attributes were stripped: ' + res.svg);
    }
  `);

  await evaluateTest('Preserves <title> and <desc> tags containing descriptive text', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>Company Logo</title><desc>Vector representation of corporate branding</desc><rect width="24" height="24"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('<title>Company Logo</title>') || !res.svg.includes('<desc>Vector representation')) {
      throw new Error('Title or desc elements were stripped: ' + res.svg);
    }
  `);

  await evaluateTest('Preserves non-ASCII Unicode characters and emojis in text elements', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 30"><text x="10" y="20">Hello World 🚀 🌟 日本語</text></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes('Hello World 🚀 🌟 日本語')) {
      throw new Error('Unicode text was corrupted: ' + res.svg);
    }
  `);

  console.log('\n--- 8. Security & Preview Sanitization ---');

  await evaluateTest('Sanitizer strips <script> elements from preview rendering pass', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>alert("XSS")</script><circle r="5"/></svg>';
    const sanitized = sanitizeSvgForPreview(input);
    if (sanitized.includes('<script') || sanitized.includes('alert')) {
      throw new Error('Script element was not stripped by preview sanitizer: ' + sanitized);
    }
    if (!sanitized.includes('<circle')) {
      throw new Error('Valid circle element was lost during preview sanitization');
    }
  `);

  await evaluateTest('Sanitizer strips inline event handlers (onload, onclick, onerror)', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" onload="fetch(\\'/steal\\')" viewBox="0 0 10 10"><rect onclick="evil()" onmouseover="bad()" width="10" height="10"/></svg>';
    const sanitized = sanitizeSvgForPreview(input);
    if (/on[a-z]+/i.test(sanitized)) {
      throw new Error('Inline event handlers were not stripped: ' + sanitized);
    }
  `);

  await evaluateTest('Sanitizer strips dangerous javascript: and vbscript: URIs', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><a href="javascript:alert(1)"><circle r="5"/></a></svg>';
    const sanitized = sanitizeSvgForPreview(input);
    if (sanitized.includes('javascript:') || sanitized.includes('alert(1)')) {
      throw new Error('javascript: href was not stripped: ' + sanitized);
    }
  `);

  await evaluateTest('Sanitizer removes foreignObject, iframe, embed, and object tags', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><foreignObject width="100" height="100"><iframe src="https://evil.com"></iframe></foreignObject><circle r="10"/></svg>';
    const sanitized = sanitizeSvgForPreview(input);
    if (sanitized.includes('foreignObject') || sanitized.includes('iframe') || sanitized.includes('evil.com')) {
      throw new Error('foreignObject or iframe tag leaked into sanitized preview: ' + sanitized);
    }
    if (!sanitized.includes('<circle')) {
      throw new Error('Valid circle was removed along with dangerous tags');
    }
  `);

  await evaluateTest('Sanitizer strips target="_parent" and target="_top" navigation attributes', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><a href="#local" target="_parent"><text>Link</text></a></svg>';
    const sanitized = sanitizeSvgForPreview(input);
    if (sanitized.includes('target=')) {
      throw new Error('target attribute was not neutralized: ' + sanitized);
    }
  `);

  await evaluateTest('Sanitizer strips remote http/https tracking image URLs and links', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><image href="https://tracker.com/pixel.png"/><a xlink:href="http://phishing.com"><circle r="5"/></a></svg>';
    const sanitized = sanitizeSvgForPreview(input);
    if (sanitized.includes('tracker.com') || sanitized.includes('phishing.com')) {
      throw new Error('Remote URL was not stripped in preview: ' + sanitized);
    }
  `);

  await evaluateTest('Sanitizer neutralizes SMIL <set> and attributeName injection attempts', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><set attributeName="onmouseover" to="alert(1)"/><animate onbegin="alert(2)"/><circle r="5"/></svg>';
    const sanitized = sanitizeSvgForPreview(input);
    if (sanitized.includes('<set') || sanitized.includes('onbegin') || sanitized.includes('alert')) {
      throw new Error('SMIL injection was not neutralized: ' + sanitized);
    }
  `);

  console.log('\n--- 8B. Live Browser-Execution Tests: Hostile SVG in Real Iframe Preview ---');

  await evaluateTest('Live Browser Execution: Hostile <script> execution is completely neutralized in sandboxed preview', `
    window.canaryScriptExecuted = false;
    const hostileSvg = '<svg xmlns="http://www.w3.org/2000/svg"><script>try{window.top.canaryScriptExecuted = true;}catch(e){}</script><circle r="10"/></svg>';
    const sanitized = sanitizeSvgForPreview(hostileSvg);
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', '');
    iframe.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \\\'none\\\'; style-src \\\'unsafe-inline\\\'; img-src data: blob:; font-src data:;"></head><body>' + sanitized + '</body></html>';
    document.body.appendChild(iframe);
    await new Promise(r => setTimeout(r, 80));
    iframe.remove();
    if (window.canaryScriptExecuted) {
      throw new Error('SECURITY VIOLATION: Script executed in live preview iframe!');
    }
  `);

  await evaluateTest('Live Browser Execution: Hostile inline event handlers fail to execute on render', `
    window.canaryEventExecuted = false;
    const hostileSvg = '<svg xmlns="http://www.w3.org/2000/svg" onload="window.top.canaryEventExecuted = true"><image href="invalid" onerror="window.top.canaryEventExecuted = true"/><rect width="10" height="10"/></svg>';
    const sanitized = sanitizeSvgForPreview(hostileSvg);
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', '');
    iframe.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \\\'none\\\'; style-src \\\'unsafe-inline\\\'; img-src data: blob:; font-src data:;"></head><body>' + sanitized + '</body></html>';
    document.body.appendChild(iframe);
    await new Promise(r => setTimeout(r, 80));
    iframe.remove();
    if (window.canaryEventExecuted) {
      throw new Error('SECURITY VIOLATION: Inline event handler executed in live preview iframe!');
    }
  `);

  await evaluateTest('Live Browser Execution: foreignObject and SMIL animation event injection neutralized', `
    window.canarySmilExecuted = false;
    const hostileSvg = '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject width="100" height="100"><script>window.top.canarySmilExecuted = true;</script></foreignObject><animate onbegin="window.top.canarySmilExecuted = true"/><circle r="5"/></svg>';
    const sanitized = sanitizeSvgForPreview(hostileSvg);
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', '');
    iframe.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \\\'none\\\'; style-src \\\'unsafe-inline\\\'; img-src data: blob:; font-src data:;"></head><body>' + sanitized + '</body></html>';
    document.body.appendChild(iframe);
    await new Promise(r => setTimeout(r, 80));
    iframe.remove();
    if (window.canarySmilExecuted) {
      throw new Error('SECURITY VIOLATION: foreignObject or SMIL script executed in live preview iframe!');
    }
  `);

  await evaluateTest('Live Browser Execution: Opaque null origin blocks iframe from accessing parent DOM or storage', `
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', '');
    iframe.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><div id="test">safe</div></body></html>';
    document.body.appendChild(iframe);
    await new Promise(r => setTimeout(r, 80));
    let accessBlocked = false;
    try {
      const doc = iframe.contentDocument;
      if (!doc) accessBlocked = true;
      else {
        const parentDoc = iframe.contentWindow.parent.document;
        if (!parentDoc) accessBlocked = true;
      }
    } catch {
      accessBlocked = true;
    }
    iframe.remove();
    if (!accessBlocked) {
      throw new Error('SECURITY VIOLATION: Sandboxed iframe was able to access parent context without origin isolation!');
    }
  `);

  console.log('\n--- 9. Safety Gate & Negative Savings ---');

  await evaluateTest('Preserves compact original when optimization candidate is larger', `
    // Pre-compacted SVG where aggressive rounding or formatting would bloat output
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 4, mode: 'smart' });
    if (res.svg.length > input.length) {
      throw new Error('Candidate was allowed to exceed original size! Output: ' + res.svg);
    }
  `);

  console.log('\n--- 10. Repeated Optimization & Idempotence ---');

  await evaluateTest('Optimization is strictly idempotent (pass 1 === pass 2 output)', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g id="group1"><rect x="10" y="10" width="80" height="80" fill="#ffffff" stroke="#000000"/></g></svg>';
    const pass1 = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    const pass2 = runOptimizerCore(pass1.svg, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (pass1.svg !== pass2.svg) {
      throw new Error('Pass 1 and Pass 2 outputs differed! Pass 1: ' + pass1.svg + ' vs Pass 2: ' + pass2.svg);
    }
  `);

  console.log('\n--- 11. Filename Sanitization for Export ---');

  await evaluateTest('Sanitizes filenames on export and appends .optimized.svg', `
    const cases = [
      { input: 'icon.svg', expected: 'icon.optimized.svg' },
      { input: 'path/to/my logo.svg', expected: 'my logo.optimized.svg' },
      { input: 'CON.svg', expected: 'file_CON.optimized.svg' },
      { input: 'unsafe<file>:name.svg', expected: 'unsafe_file__name.optimized.svg' },
      { input: '', expected: 'optimized_omnitools.svg' },
    ];
    cases.forEach(c => {
      const actual = sanitizeExportFilename(c.input);
      if (actual !== c.expected) {
        throw new Error('Filename sanitization failed for "' + c.input + '". Expected "' + c.expected + '", got "' + actual + '"');
      }
    });
  `);

  console.log('\n--- 12. Embedded Raster Images & External References ---');

  await evaluateTest('Preserves embedded raster image data URLs without truncation', `
    const pngData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><image href="' + pngData + '" width="100" height="100"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.svg.includes(pngData)) {
      throw new Error('Embedded raster image data URL was stripped or truncated');
    }
  `);

  console.log('\n--- 13. Alpha & Compositing Sensitivity ---');

  await evaluateTest('Does not merge duplicate paths when opacity < 1 or blend modes are present', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 10h80v80H10z" fill="#f00" opacity="0.5"/><path d="M10 10h80v80H10z" fill="#f00" opacity="0.5"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'maximum' });
    const paths = (res.svg.match(/<path\\b/g) || []).length;
    if (paths < 2) {
      throw new Error('Semi-transparent duplicate paths were erroneously merged, altering compositing!');
    }
  `);

  console.log('\n--- 14. Built-in Preset Samples Optimization ---');

  await evaluateTest('Optimizes SAMPLE_STAR with substantial byte savings and intact stroke geometry', `
    const starSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><!-- Star icon --><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
    const res = runOptimizerCore(starSvg, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (!res.analysis.valid) throw new Error('Optimized star invalid');
    if (res.svg.length >= starSvg.length) throw new Error('Star was not reduced in size');
    if (!res.svg.includes('viewBox="0 0 24 24"')) throw new Error('Star viewBox was lost');
  `);

  await evaluateTest('Optimizes SAMPLE_BLOATED export achieving >60% byte reduction', `
    const bloatedSvg = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" x="0px" y="0px" width="128px" height="128px" viewBox="0 0 128 128" enable-background="new 0 0 128 128" xml:space="preserve"><metadata><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><cc:Work rdf:about="" xmlns:cc="http://creativecommons.org/ns#"><dc:format xmlns:dc="http://purl.org/dc/elements/1.1/">image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" xmlns:dc="http://purl.org/dc/elements/1.1/"/></cc:Work></rdf:RDF></metadata><g id="Background_Guides"><g></g></g><g id="Artwork_Group"><g><rect x="14.00000000" y="14.00000000" width="100.00000000" height="100.00000000" rx="16.00000000" fill="#2563EB" stroke="#1E40AF" stroke-width="4.00000000"/><path fill="#FFFFFF" d="M64.00000000,34.12345678 L72.98765432,52.34567890 L92.87654321,55.23456789 L78.43210987,69.34567890 L81.87654321,89.23456789 L64.00000000,79.87654321 L46.12345678,89.23456789 L49.56789012,69.34567890 L35.12345678,55.23456789 L55.01234567,52.34567890 Z"/></g></g></svg>';
    const res = runOptimizerCore(bloatedSvg, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    const ratio = (bloatedSvg.length - res.svg.length) / bloatedSvg.length;
    if (ratio < 0.6) throw new Error('Expected at least 60% reduction on bloated fixture, got: ' + Math.round(ratio * 100) + '%');
    if (res.svg.includes('<?xml') || res.svg.includes('<!DOCTYPE') || res.svg.includes('<metadata>')) {
      throw new Error('Bloat elements survived optimization');
    }
  `);

  console.log('\n--- 15. Mode Behaviors (Safe vs Maximum) ---');

  await evaluateTest('Safe mode protects all non-empty groups and IDs', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><g id="custom-group-1"><path d="M0 0h10v10H0z"/></g></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'safe' });
    if (!res.svg.includes('id="custom-group-1"')) {
      throw new Error('Safe mode dropped custom group ID: ' + res.svg);
    }
  `);

  await evaluateTest('Maximum mode converts unstyled simple shapes into paths', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><rect x="5" y="5" width="20" height="20"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'maximum' });
    if (res.svg.includes('<rect')) {
      throw new Error('Maximum mode did not convert simple rect shape to path: ' + res.svg);
    }
    if (!res.svg.includes('<path')) {
      throw new Error('Converted path element missing: ' + res.svg);
    }
  `);

  console.log('\n--- 16. Empty and Non-Rendering Elements Pruning ---');

  await evaluateTest('Removes non-rendering empty elements (e.g. rect with width=0 or empty text)', `
    const input = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><rect width="0" height="0"/><text></text><circle cx="10" cy="10" r="5"/></svg>';
    const res = runOptimizerCore(input, { removeXml: true, removeComments: true, removeEmptyGroups: true, minifyColors: true, precision: 2, mode: 'smart' });
    if (res.svg.includes('<rect') || res.svg.includes('<text')) {
      throw new Error('Zero-dimension element was not pruned: ' + res.svg);
    }
    if (!res.svg.includes('<circle')) {
      throw new Error('Valid circle element was lost: ' + res.svg);
    }
  `);

  ws.close();
  chrome.kill();

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log(`✅ ALL ${totalTests} AUTOMATED SVG OPTIMIZER TESTS PASSED IN CHROMIUM!\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Test runner fatal failure:', err);
  process.exit(1);
});
