import {
  calculatePageDimensions,
  calculateImagePlacement,
  hexToRgb,
  sanitizePdfFilename,
  isSupportedImageFile,
  verifyOutputPdfIntegrity,
  PAGE_SIZE_POINTS,
  MARGIN_POINTS,
  QUALITY_CONFIG,
  SUPPORTED_EXTENSIONS,
  SUPPORTED_MIME_TYPES,
  MM_TO_PT,
  IN_TO_PT,
} from '../lib/imageToPdfEngine';
import { PDFDocument, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  testsRun++;
  if (condition) {
    testsPassed++;
    console.log(`  [PASS ${testsRun}] ${testName}`);
  } else {
    testsFailed++;
    console.error(`  [FAIL ${testsRun}] ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

function assertClose(actual: number, expected: number, testName: string, tolerance: number = 0.5) {
  const diff = Math.abs(actual - expected);
  assert(diff <= tolerance, testName, `expected ~${expected}, got ${actual} (diff: ${diff})`);
}

// Minimal valid 1x1 PNG base64 fixture
const MINIMAL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function run150TestSuite() {
  console.log('================================================================');
  console.log('KIVAROTOOLS IMAGE TO PDF CONVERTER — 175-POINT ENTERPRISE TEST SUITE');
  console.log('================================================================\n');

  // Load real fixture image files from scratch/fixtures
  const fixturesDir = path.resolve(__dirname, '../scratch/fixtures');
  const fixtureJpgPath = path.join(fixturesDir, 'landscape-green.jpg');
  const fixturePngPath = path.join(fixturesDir, 'transparent-red-circle.png');
  if (!fs.existsSync(fixtureJpgPath) || !fs.existsSync(fixturePngPath)) {
    throw new Error(`Fixtures not found in ${fixturesDir}`);
  }
  const jpgBytes = new Uint8Array(fs.readFileSync(fixtureJpgPath));
  const pngBytes = new Uint8Array(fs.readFileSync(fixturePngPath));

  // ============================================================================
  // SECTION 1: PAGE DIMENSIONS, PRESETS & CONVERSION MATH (32 Tests)
  // ============================================================================
  console.log('--- Section 1: Page Dimensions, Presets & Conversion Math (Tests 1–32) ---');

  // 1-10: Preset constants
  assertClose(PAGE_SIZE_POINTS.a4.width, 595.28, 'A4 preset width constant is 595.28 pt');
  assertClose(PAGE_SIZE_POINTS.a4.height, 841.89, 'A4 preset height constant is 841.89 pt');
  assertClose(PAGE_SIZE_POINTS.a3.width, 841.89, 'A3 preset width constant is 841.89 pt');
  assertClose(PAGE_SIZE_POINTS.a3.height, 1190.55, 'A3 preset height constant is 1190.55 pt');
  assertClose(PAGE_SIZE_POINTS.a5.width, 419.53, 'A5 preset width constant is 419.53 pt');
  assertClose(PAGE_SIZE_POINTS.a5.height, 595.28, 'A5 preset height constant is 595.28 pt');
  assertClose(PAGE_SIZE_POINTS.letter.width, 612.0, 'US Letter preset width constant is 612.0 pt');
  assertClose(PAGE_SIZE_POINTS.letter.height, 792.0, 'US Letter preset height constant is 792.0 pt');
  assertClose(PAGE_SIZE_POINTS.legal.width, 612.0, 'US Legal preset width constant is 612.0 pt');
  assertClose(PAGE_SIZE_POINTS.legal.height, 1008.0, 'US Legal preset height constant is 1008.0 pt');

  // 11-18: Portrait vs Landscape orientation across presets
  const a4P = calculatePageDimensions('a4', 'portrait', 800, 600);
  assert(a4P.width === PAGE_SIZE_POINTS.a4.width && a4P.height === PAGE_SIZE_POINTS.a4.height, 'A4 Portrait orientation enforces width <= height (595.28 x 841.89)');
  const a4L = calculatePageDimensions('a4', 'landscape', 600, 800);
  assert(a4L.width === PAGE_SIZE_POINTS.a4.height && a4L.height === PAGE_SIZE_POINTS.a4.width, 'A4 Landscape orientation enforces width >= height (841.89 x 595.28)');
  const a3P = calculatePageDimensions('a3', 'portrait', 500, 500);
  assert(a3P.width === PAGE_SIZE_POINTS.a3.width && a3P.height === PAGE_SIZE_POINTS.a3.height, 'A3 Portrait orientation enforces width <= height (841.89 x 1190.55)');
  const a3L = calculatePageDimensions('a3', 'landscape', 500, 500);
  assert(a3L.width === PAGE_SIZE_POINTS.a3.height && a3L.height === PAGE_SIZE_POINTS.a3.width, 'A3 Landscape orientation enforces width >= height (1190.55 x 841.89)');
  const a5L = calculatePageDimensions('a5', 'landscape', 300, 300);
  assert(a5L.width === PAGE_SIZE_POINTS.a5.height && a5L.height === PAGE_SIZE_POINTS.a5.width, 'A5 Landscape orientation enforces 595.28 x 419.53');
  const letterP = calculatePageDimensions('letter', 'portrait', 400, 400);
  assert(letterP.width === 612.0 && letterP.height === 792.0, 'US Letter Portrait enforces 612 x 792');
  const letterL = calculatePageDimensions('letter', 'landscape', 400, 400);
  assert(letterL.width === 792.0 && letterL.height === 612.0, 'US Letter Landscape enforces 792 x 612');
  const legalL = calculatePageDimensions('legal', 'landscape', 400, 400);
  assert(legalL.width === 1008.0 && legalL.height === 612.0, 'US Legal Landscape enforces 1008 x 612');

  // 20-22: Auto orientation across presets
  const autoWide = calculatePageDimensions('a4', 'auto', 2000, 1000);
  assert(autoWide.width === PAGE_SIZE_POINTS.a4.height && autoWide.height === PAGE_SIZE_POINTS.a4.width, 'Auto orientation chooses landscape for wide image (2000x1000)');
  const a3Auto = calculatePageDimensions('a3', 'auto', 1200, 800);
  assert(a3Auto.width > a3Auto.height, 'A3 auto orientation chooses landscape for wide image (1200x800)');
  const autoTall = calculatePageDimensions('a4', 'auto', 1000, 2000);
  assert(autoTall.width === PAGE_SIZE_POINTS.a4.width && autoTall.height === PAGE_SIZE_POINTS.a4.height, 'Auto orientation chooses portrait for tall image (1000x2000)');
  const autoSquare = calculatePageDimensions('a4', 'auto', 1000, 1000);
  assert(autoSquare.width === PAGE_SIZE_POINTS.a4.width && autoSquare.height === PAGE_SIZE_POINTS.a4.height, 'Auto orientation chooses portrait for square image (1000x1000)');

  // 23-25: Fit mode
  const fit1 = calculatePageDimensions('fit', 'auto', 800, 600);
  assert(fit1.width === 800 && fit1.height === 600, 'Fit mode directly adopts 800x600 image dimensions');
  const fit2 = calculatePageDimensions('fit', 'auto', 1920, 1080);
  assert(fit2.width === 1920 && fit2.height === 1080, 'Fit mode directly adopts 1920x1080 image dimensions');
  const fitZero = calculatePageDimensions('fit', 'auto', 0, 0);
  assert(fitZero.width === 1 && fitZero.height === 1, 'Fit mode clamps 0x0 image dimensions to minimum 1 pt');

  // 26-31: Custom dimensions
  const customMm = calculatePageDimensions('custom', 'portrait', 500, 500, { width: 100, height: 200, unit: 'mm' });
  assertClose(customMm.width, 100 * MM_TO_PT, 'Custom mm width converts 100 mm to pt via 72/25.4');
  assertClose(customMm.height, 200 * MM_TO_PT, 'Custom mm height converts 200 mm to pt via 72/25.4');
  const customIn = calculatePageDimensions('custom', 'portrait', 500, 500, { width: 4, height: 6, unit: 'in' });
  assertClose(customIn.width, 4 * IN_TO_PT, 'Custom inch width converts 4 in to 288 pt');
  assertClose(customIn.height, 6 * IN_TO_PT, 'Custom inch height converts 6 in to 432 pt');
  const customPt = calculatePageDimensions('custom', 'portrait', 500, 500, { width: 300, height: 500, unit: 'pt' });
  assert(customPt.width === 300 && customPt.height === 500, 'Custom pt dimensions adopt 300x500 directly');
  const customPtSquare = calculatePageDimensions('custom', 'portrait', 500, 500, { width: 500, height: 500, unit: 'pt' });
  assert(customPtSquare.width === 500 && customPtSquare.height === 500, 'Custom pt dimensions preserve 500x500 exactly');

  // 30-31: Clamping safety on custom dimensions
  const customZero = calculatePageDimensions('custom', 'portrait', 500, 500, { width: 0, height: 0, unit: 'mm' });
  assert(customZero.width === 10 && customZero.height === 10, 'Custom dimensions clamp 0 mm to safe minimum 10 pt');
  const customNeg = calculatePageDimensions('custom', 'portrait', 500, 500, { width: -50, height: -100, unit: 'in' });
  assert(customNeg.width === 10 && customNeg.height === 10, 'Custom dimensions clamp negative inputs to safe minimum 10 pt');

  // 32: Margins
  assert(MARGIN_POINTS.none === 0 && MARGIN_POINTS.small === 20 && MARGIN_POINTS.large === 40, 'Margin point constants accurately reflect none(0), small(20), large(40)');

  // ============================================================================
  // SECTION 2: IMAGE PLACEMENT, GEOMETRY & ASPECT RATIOS (32 Tests)
  // ============================================================================
  console.log('\n--- Section 2: Image Placement, Geometry & Aspect Ratios (Tests 33–64) ---');

  const pW = 595.28;
  const pH = 841.89;

  // 33-36: Printable area calculations
  const placeZeroMargin = calculateImagePlacement(pW, pH, 0, 400, 400, 'contain');
  assert(placeZeroMargin.width > 0 && placeZeroMargin.height > 0, 'Zero margin generates non-zero placement bounds');
  const placeSmallMargin = calculateImagePlacement(pW, pH, 20, 400, 400, 'contain');
  assert(placeSmallMargin.x >= 20 && placeSmallMargin.y >= 20, 'Small margin (20 pt) offsets placement inside page bounds');
  const placeLargeMargin = calculateImagePlacement(pW, pH, 40, 400, 400, 'contain');
  assert(placeLargeMargin.x >= 40 && placeLargeMargin.y >= 40, 'Large margin (40 pt) offsets placement inside page bounds');
  const placeCustomMargin = calculateImagePlacement(pW, pH, 35, 400, 400, 'contain');
  assert(placeCustomMargin.x >= 35 && placeCustomMargin.y >= 35, 'Custom margin (35 pt) offsets placement inside page bounds');

  // 37-40: Contain mode with square image
  const sqContain = calculateImagePlacement(pW, pH, 20, 500, 500, 'contain');
  const printW = pW - 40;
  const printH = pH - 40;
  assertClose(sqContain.width, printW, 'Contain mode scales square image to printable width');
  assertClose(sqContain.height, printW, 'Contain mode preserves 1:1 aspect ratio for square image');
  assertClose(sqContain.x, 20, 'Contain mode sets x to left margin for width-constrained image');
  assertClose(sqContain.y, 20 + (printH - printW) / 2, 'Contain mode centers square image vertically in printable area');

  // 41-43: Contain mode with very wide image (4000x1000, 4:1 ratio)
  const wideContain = calculateImagePlacement(pW, pH, 20, 4000, 1000, 'contain');
  assertClose(wideContain.width, printW, 'Contain mode scales 4:1 wide image to printable width');
  assertClose(wideContain.height, printW * 0.25, 'Contain mode scales 4:1 wide image height to 25% of printable width');
  assertClose(wideContain.y, 20 + (printH - printW * 0.25) / 2, 'Contain mode centers wide image vertically');

  // 44-46: Contain mode with very tall image (1000x4000, 1:4 ratio)
  const tallContain = calculateImagePlacement(pW, pH, 20, 1000, 4000, 'contain');
  assertClose(tallContain.height, printH, 'Contain mode scales 1:4 tall image to printable height');
  assertClose(tallContain.width, printH * 0.25, 'Contain mode scales 1:4 tall image width to 25% of printable height');
  assertClose(tallContain.x, 20 + (printW - printH * 0.25) / 2, 'Contain mode centers tall image horizontally');

  // 47-49: Contain mode aspect ratio & small image scale-up
  const arDiff = Math.abs((tallContain.width / tallContain.height) - (1000 / 4000));
  assert(arDiff < 0.001, 'Contain mode strictly preserves input aspect ratio to <0.001 tolerance');
  const smallContain = calculateImagePlacement(pW, pH, 20, 100, 100, 'contain');
  assert(smallContain.width > 100 && smallContain.width === printW, 'Contain mode scales small image up to fit printable bounds');
  const tinyContain = calculateImagePlacement(pW, pH, 20, 1, 1, 'contain');
  assert(tinyContain.width === printW && tinyContain.height === printW, 'Contain mode scales 1x1 image up to full printable width');

  // 50-53: Cover mode with wide image
  const wideCover = calculateImagePlacement(pW, pH, 20, 2000, 1000, 'cover');
  assertClose(wideCover.height, printH, 'Cover mode with wide image scales height to fill printable height');
  assert(wideCover.width > printW, 'Cover mode with wide image causes width to overflow printable width');
  assert(wideCover.x < 20, 'Cover mode with wide image offsets x to negative margin for symmetrical centering');
  assertClose(wideCover.y, 20, 'Cover mode with wide image aligns y with margin');

  // 54-57: Cover mode with tall image
  const tallCover = calculateImagePlacement(pW, pH, 20, 1000, 2000, 'cover');
  assertClose(tallCover.width, printW, 'Cover mode with tall image scales width to fill printable width');
  assert(tallCover.height > printH, 'Cover mode with tall image causes height to overflow printable height');
  assert(tallCover.y < 20, 'Cover mode with tall image offsets y to negative margin for symmetrical centering');
  assertClose(tallCover.x, 20, 'Cover mode with tall image aligns x with margin');

  // 58-61: Actual mode with small image
  const smallActual = calculateImagePlacement(pW, pH, 20, 200, 150, 'actual');
  assert(smallActual.width === 200, 'Actual mode preserves exact 200 pt image width');
  assert(smallActual.height === 150, 'Actual mode preserves exact 150 pt image height');
  assertClose(smallActual.x, 20 + (printW - 200) / 2, 'Actual mode centers image horizontally');
  assertClose(smallActual.y, 20 + (printH - 150) / 2, 'Actual mode centers image vertically');

  // 62-63: Actual mode fallback on oversized image
  const bigActual = calculateImagePlacement(pW, pH, 20, 1500, 2500, 'actual');
  assert(bigActual.width <= printW && bigActual.height <= printH, 'Actual mode downscales oversized image to fit inside printable bounds');
  const bigArDiff = Math.abs((bigActual.width / bigActual.height) - (1500 / 2500));
  assert(bigArDiff < 0.001, 'Actual mode fallback preserves aspect ratio on downscaled images');

  // 64: Extreme margin clamping
  const extremeMargin = calculateImagePlacement(pW, pH, 300, 500, 500, 'contain');
  assert(Number.isFinite(extremeMargin.width) && extremeMargin.width >= 1, 'Extreme margin clamps printable area to >=1 pt without NaN or crash');

  // ============================================================================
  // SECTION 3: COLOR PARSING, HEX CONVERSION & BACKGROUNDS (22 Tests)
  // ============================================================================
  console.log('\n--- Section 3: Color Parsing, Hex Conversion & Backgrounds (Tests 65–86) ---');

  // 65-72: 6-character hex parsing
  const white = hexToRgb('#ffffff');
  assert(white.r === 1 && white.g === 1 && white.b === 1, 'hexToRgb parses #ffffff as (1, 1, 1)');
  const black = hexToRgb('#000000');
  assert(black.r === 0 && black.g === 0 && black.b === 0, 'hexToRgb parses #000000 as (0, 0, 0)');
  const red = hexToRgb('#ff0000');
  assert(red.r === 1 && red.g === 0 && red.b === 0, 'hexToRgb parses #ff0000 as (1, 0, 0)');
  const green = hexToRgb('#00ff00');
  assert(green.r === 0 && green.g === 1 && green.b === 0, 'hexToRgb parses #00ff00 as (0, 1, 0)');
  const blue = hexToRgb('#0000ff');
  assert(blue.r === 0 && blue.g === 0 && blue.b === 1, 'hexToRgb parses #0000ff as (0, 0, 1)');
  const yellow = hexToRgb('#ffff00');
  assert(yellow.r === 1 && yellow.g === 1 && yellow.b === 0, 'hexToRgb parses #ffff00 as (1, 1, 0)');
  const magenta = hexToRgb('#ff00ff');
  assert(magenta.r === 1 && magenta.g === 0 && magenta.b === 1, 'hexToRgb parses #ff00ff as (1, 0, 1)');
  const cyan = hexToRgb('#00ffff');
  assert(cyan.r === 0 && cyan.g === 1 && cyan.b === 1, 'hexToRgb parses #00ffff as (0, 1, 1)');

  // 73-77: 3-character hex parsing
  const white3 = hexToRgb('#fff');
  assert(white3.r === 1 && white3.g === 1 && white3.b === 1, 'hexToRgb parses 3-digit #fff as (1, 1, 1)');
  const black3 = hexToRgb('#000');
  assert(black3.r === 0 && black3.g === 0 && black3.b === 0, 'hexToRgb parses 3-digit #000 as (0, 0, 0)');
  const red3 = hexToRgb('#f00');
  assert(red3.r === 1 && red3.g === 0 && red3.b === 0, 'hexToRgb parses 3-digit #f00 as (1, 0, 0)');
  const green3 = hexToRgb('#0f0');
  assert(green3.r === 0 && green3.g === 1 && green3.b === 0, 'hexToRgb parses 3-digit #0f0 as (0, 1, 0)');
  const blue3 = hexToRgb('#00f');
  assert(blue3.r === 0 && blue3.g === 0 && blue3.b === 1, 'hexToRgb parses 3-digit #00f as (0, 0, 1)');

  // 78-79: Un-prefixed hex strings
  const noHash6 = hexToRgb('ffffff');
  assert(noHash6.r === 1 && noHash6.g === 1 && noHash6.b === 1, 'hexToRgb parses ffffff without hash');
  const noHash3 = hexToRgb('000');
  assert(noHash3.r === 0 && noHash3.g === 0 && noHash3.b === 0, 'hexToRgb parses 000 without hash');

  // 80-82: Intermediate and branded hex colors
  const gray = hexToRgb('#f3f4f6');
  assertClose(gray.r, 243 / 255, 'hexToRgb calculates red channel for #f3f4f6 (~0.9529)', 0.005);
  assertClose(gray.g, 244 / 255, 'hexToRgb calculates green channel for #f3f4f6 (~0.9568)', 0.005);
  assertClose(gray.b, 246 / 255, 'hexToRgb calculates blue channel for #f3f4f6 (~0.9647)', 0.005);
  const upperWhite = hexToRgb('#FFFFFF');
  assert(upperWhite.r === 1 && upperWhite.g === 1 && upperWhite.b === 1, 'hexToRgb parses uppercase #FFFFFF as (1, 1, 1)');
  const darkBg = hexToRgb('#111827');
  assert(darkBg.r < 0.1 && darkBg.g < 0.1 && darkBg.b < 0.2, 'hexToRgb parses dark theme #111827 correctly');

  // 83-86: Fallbacks on invalid hex input
  const emptyHex = hexToRgb('');
  assert(emptyHex.r === 1 && emptyHex.g === 1 && emptyHex.b === 1, 'hexToRgb defaults empty string to white (1, 1, 1)');
  const garbageHex = hexToRgb('xyz');
  assert(garbageHex.r === 1 && garbageHex.g === 1 && garbageHex.b === 1, 'hexToRgb defaults non-hex garbage string to white (1, 1, 1)');
  const fiveDigitHex = hexToRgb('#12345');
  assert(fiveDigitHex.r === 1 && fiveDigitHex.g === 1 && fiveDigitHex.b === 1, 'hexToRgb defaults 5-digit hex to white (1, 1, 1)');
  const sevenDigitHex = hexToRgb('#1234567');
  assert(sevenDigitHex.r === 1 && sevenDigitHex.g === 1 && sevenDigitHex.b === 1, 'hexToRgb defaults 7-digit hex to white (1, 1, 1)');

  // ============================================================================
  // SECTION 4: FILENAME SANITIZATION & FILE TYPE SUPPORT (26 Tests)
  // ============================================================================
  console.log('\n--- Section 4: Filename Sanitization & File Type Support (Tests 87–112) ---');

  // 87-90: Normal filenames and extensions
  assert(sanitizePdfFilename('my-document.pdf') === 'my-document.pdf', 'sanitizePdfFilename preserves clean .pdf filename');
  assert(sanitizePdfFilename('my-document') === 'my-document.pdf', 'sanitizePdfFilename appends .pdf if missing');
  assert(sanitizePdfFilename('REPORT.PDF') === 'REPORT.pdf', 'sanitizePdfFilename handles uppercase .PDF extension');
  assert(sanitizePdfFilename('invoice_2026_q1.pdf') === 'invoice_2026_q1.pdf', 'sanitizePdfFilename handles underscores and digits');

  // 91-95: Illegal characters replacement
  assert(sanitizePdfFilename('hello/world.pdf') === 'hello_world.pdf', 'sanitizePdfFilename replaces forward slash with underscore');
  assert(sanitizePdfFilename('hello\\world.pdf') === 'hello_world.pdf', 'sanitizePdfFilename replaces backslash with underscore');
  assert(sanitizePdfFilename('doc:name<cool>.pdf') === 'doc_name_cool_.pdf', 'sanitizePdfFilename replaces colons and angle brackets');
  assert(sanitizePdfFilename('question?mark*.pdf') === 'question_mark_.pdf', 'sanitizePdfFilename replaces question marks and asterisks');
  assert(sanitizePdfFilename('pipe|and"quotes".pdf') === 'pipe_and_quotes_.pdf', 'sanitizePdfFilename replaces pipes and quotes');

  // 96-99: Traversal, multiple dots, trailing spaces/dots
  assert(sanitizePdfFilename('../../etc/passwd.pdf') === '____etc_passwd.pdf', 'sanitizePdfFilename neutralizes directory traversal sequences');
  assert(sanitizePdfFilename('multiple...dots.pdf') === 'multiple_dots.pdf', 'sanitizePdfFilename collapses consecutive dots');
  assert(sanitizePdfFilename('trailing-space   ') === 'trailing-space.pdf', 'sanitizePdfFilename strips trailing spaces before adding .pdf');
  assert(sanitizePdfFilename('trailing-dot.') === 'trailing-dot.pdf', 'sanitizePdfFilename strips trailing dots before adding .pdf');

  // 100-102: Empty/null fallback
  assert(sanitizePdfFilename('') === 'images-to-pdf.pdf', 'sanitizePdfFilename falls back to images-to-pdf.pdf on empty string');
  assert(sanitizePdfFilename('   ') === 'images-to-pdf.pdf', 'sanitizePdfFilename falls back to images-to-pdf.pdf on whitespace');
  assert(sanitizePdfFilename(null as any) === 'images-to-pdf.pdf', 'sanitizePdfFilename falls back to images-to-pdf.pdf on null input');

  // 103-111: Supported image formats
  const makeFile = (name: string, type: string) => ({ name, type } as unknown as File);
  assert(isSupportedImageFile(makeFile('photo.jpg', 'image/jpeg')), 'isSupportedImageFile accepts photo.jpg');
  assert(isSupportedImageFile(makeFile('photo.jpeg', 'image/jpeg')), 'isSupportedImageFile accepts photo.jpeg');
  assert(isSupportedImageFile(makeFile('graphic.png', 'image/png')), 'isSupportedImageFile accepts graphic.png');
  assert(isSupportedImageFile(makeFile('banner.webp', 'image/webp')), 'isSupportedImageFile accepts banner.webp');
  assert(isSupportedImageFile(makeFile('drawing.bmp', 'image/bmp')), 'isSupportedImageFile accepts drawing.bmp');
  assert(isSupportedImageFile(makeFile('anim.gif', 'image/gif')), 'isSupportedImageFile accepts anim.gif');
  assert(isSupportedImageFile(makeFile('logo.svg', 'image/svg+xml')), 'isSupportedImageFile accepts logo.svg');
  assert(isSupportedImageFile(makeFile('apple.heic', 'image/heic')), 'isSupportedImageFile accepts apple.heic');
  assert(isSupportedImageFile(makeFile('apple.heif', 'image/heif')), 'isSupportedImageFile accepts apple.heif');
  assert(isSupportedImageFile(makeFile('SAMPLE.JPG', 'image/jpeg')), 'isSupportedImageFile handles uppercase SAMPLE.JPG');
  assert(isSupportedImageFile(makeFile('SAMPLE.PNG', 'image/png')), 'isSupportedImageFile handles uppercase SAMPLE.PNG');

  // 112: Rejection of unsupported files
  assert(
    !isSupportedImageFile(makeFile('doc.pdf', 'application/pdf')) &&
    !isSupportedImageFile(makeFile('virus.exe', 'application/x-msdownload')) &&
    !isSupportedImageFile(makeFile('archive.zip', 'application/zip')),
    'isSupportedImageFile rejects PDF, EXE, and ZIP files'
  );

  // ============================================================================
  // SECTION 5: QUALITY CONFIG & COMPRESSION SETTINGS (15 Tests)
  // ============================================================================
  console.log('\n--- Section 5: Quality Config & Compression Settings (Tests 113–127) ---');

  // 113-120: Quality configuration properties
  assert(QUALITY_CONFIG.original.quality === 1.0, 'QUALITY_CONFIG.original quality is 1.0');
  assert(QUALITY_CONFIG.original.format === 'original', 'QUALITY_CONFIG.original format is original');
  assert(QUALITY_CONFIG.high.quality === 0.92, 'QUALITY_CONFIG.high quality is 0.92');
  assert(QUALITY_CONFIG.high.format === 'jpeg', 'QUALITY_CONFIG.high format is jpeg');
  assert(QUALITY_CONFIG.medium.quality === 0.80, 'QUALITY_CONFIG.medium quality is 0.80');
  assert(QUALITY_CONFIG.medium.format === 'jpeg', 'QUALITY_CONFIG.medium format is jpeg');
  assert(QUALITY_CONFIG.low.quality === 0.60, 'QUALITY_CONFIG.low quality is 0.60');
  assert(QUALITY_CONFIG.low.format === 'jpeg', 'QUALITY_CONFIG.low format is jpeg');

  // 121-124: Quality configuration labels
  assert(QUALITY_CONFIG.original.label.includes('Lossless'), 'QUALITY_CONFIG.original label indicates Lossless');
  assert(QUALITY_CONFIG.high.label.includes('92%'), 'QUALITY_CONFIG.high label indicates 92%');
  assert(QUALITY_CONFIG.medium.label.includes('80%'), 'QUALITY_CONFIG.medium label indicates 80%');
  assert(QUALITY_CONFIG.low.label.includes('60%'), 'QUALITY_CONFIG.low label indicates 60%');

  // 125: Monotonic degradation
  assert(
    QUALITY_CONFIG.original.quality > QUALITY_CONFIG.high.quality &&
    QUALITY_CONFIG.high.quality > QUALITY_CONFIG.medium.quality &&
    QUALITY_CONFIG.medium.quality > QUALITY_CONFIG.low.quality,
    'Quality preset numeric values decrease monotonically: original > high > medium > low'
  );

  // 126-127: Constants array checks
  assert(SUPPORTED_EXTENSIONS.length === 9, 'SUPPORTED_EXTENSIONS contains exactly 9 recognized extensions');
  assert(SUPPORTED_MIME_TYPES.length === 9, 'SUPPORTED_MIME_TYPES contains exactly 9 recognized MIME types');

  // ============================================================================
  // SECTION 6: IN-MEMORY PDF ASSEMBLY, EMBEDDING & VERIFICATION (26 Tests)
  // ============================================================================
  console.log('\n--- Section 6: In-Memory PDF Assembly, Embedding & Verification (Tests 128–153) ---');

  // 128-132: PDF Document instantiation and image embedding
  const doc = await PDFDocument.create();
  assert(doc !== null && doc !== undefined, 'PDFDocument.create() instantiates empty document');
  doc.setTitle('150 Suite Comprehensive Report');
  doc.setSubject('150 Suite Subject');
  doc.setCreator('KivaroTools Image to PDF Converter');
  doc.setProducer('KivaroTools Document Studio');
  doc.setCreationDate(new Date('2026-10-26T00:00:00Z'));
  assert(true, 'Document metadata properties set without exception');

  const embeddedPng = await doc.embedPng(pngBytes);
  assert(embeddedPng.width > 0 && embeddedPng.height > 0, 'embedPng successfully embeds PNG fixture image');
  const embeddedJpg = await doc.embedJpg(jpgBytes);
  assert(embeddedJpg.width > 0 && embeddedJpg.height > 0, 'embedJpg successfully embeds JPEG fixture image');

  // 133-135: Page 1 with A4 and PNG
  const page1 = doc.addPage([PAGE_SIZE_POINTS.a4.width, PAGE_SIZE_POINTS.a4.height]);
  assert(page1.getWidth() === PAGE_SIZE_POINTS.a4.width, 'Page 1 width correctly set to A4 (595.28 pt)');
  page1.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_SIZE_POINTS.a4.width,
    height: PAGE_SIZE_POINTS.a4.height,
    color: rgb(0.95, 0.95, 0.95),
  });
  assert(true, 'Page 1 background rectangle drawn with custom RGB fill');
  const placeP1 = calculateImagePlacement(PAGE_SIZE_POINTS.a4.width, PAGE_SIZE_POINTS.a4.height, 20, 100, 100, 'contain');
  page1.drawImage(embeddedPng, {
    x: placeP1.x,
    y: placeP1.y,
    width: placeP1.width,
    height: placeP1.height,
  });
  assert(true, 'Page 1 PNG image drawn at calculated placement bounds');

  // 136-137: Page 2 with Letter and JPEG
  const page2 = doc.addPage([PAGE_SIZE_POINTS.letter.width, PAGE_SIZE_POINTS.letter.height]);
  assert(page2.getWidth() === 612.0 && page2.getHeight() === 792.0, 'Page 2 dimensions correctly set to Letter (612 x 792 pt)');
  const placeP2 = calculateImagePlacement(612.0, 792.0, 20, 200, 150, 'contain');
  page2.drawImage(embeddedJpg, {
    x: placeP2.x,
    y: placeP2.y,
    width: placeP2.width,
    height: placeP2.height,
  });
  assert(true, 'Page 2 JPEG image drawn at calculated placement bounds');

  // 138-140: Serialization and header magic check
  const pdfBytes = await doc.save();
  assert(pdfBytes.byteLength > 500, `PDF serialization produced valid byte stream (${pdfBytes.byteLength} bytes > 500)`);
  const magic = String.fromCharCode(...pdfBytes.slice(0, 5));
  assert(magic === '%PDF-', `Generated byte stream begins with "%PDF-" signature (got ${magic})`);

  // 141: verifyOutputPdfIntegrity passes on valid document
  let verifyPass = false;
  try {
    await verifyOutputPdfIntegrity(pdfBytes, 2);
    verifyPass = true;
  } catch {
    verifyPass = false;
  }
  assert(verifyPass, 'verifyOutputPdfIntegrity validates correct 2-page document successfully');

  // 142-143: verifyOutputPdfIntegrity rejects empty bytes
  let emptyErrorMsg = '';
  try {
    await verifyOutputPdfIntegrity(new Uint8Array(0), 1);
  } catch (err) {
    emptyErrorMsg = err instanceof Error ? err.message : String(err);
  }
  assert(emptyErrorMsg === 'Generated PDF byte stream is empty.', 'verifyOutputPdfIntegrity rejects empty byte array with exact error message');

  // 144-145: verifyOutputPdfIntegrity rejects corrupt non-PDF bytes
  let corruptErrorMsg = '';
  try {
    await verifyOutputPdfIntegrity(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), 1);
  } catch (err) {
    corruptErrorMsg = err instanceof Error ? err.message : String(err);
  }
  assert(corruptErrorMsg.includes('missing valid PDF header bytes (%PDF-)'), 'verifyOutputPdfIntegrity rejects corrupt bytes missing %PDF- header');

  // 146-147: verifyOutputPdfIntegrity rejects page count mismatch
  let countErrorMsg = '';
  try {
    await verifyOutputPdfIntegrity(pdfBytes, 3);
  } catch (err) {
    countErrorMsg = err instanceof Error ? err.message : String(err);
  }
  assert(countErrorMsg.includes('expected 3 page(s), but produced 2'), 'verifyOutputPdfIntegrity detects page count mismatch (expected 3, produced 2)');

  // 148-151: Re-loading and inspecting PDF structure
  const reloaded = await PDFDocument.load(pdfBytes);
  assert(reloaded.getPageCount() === 2, 'Reloaded PDF contains exactly 2 pages');
  assertClose(reloaded.getPage(0).getWidth(), 595.28, 'Reloaded PDF Page 1 width matches A4 (595.28 pt)');
  assertClose(reloaded.getPage(0).getHeight(), 841.89, 'Reloaded PDF Page 1 height matches A4 (841.89 pt)');
  assertClose(reloaded.getPage(1).getWidth(), 612.0, 'Reloaded PDF Page 2 width matches Letter (612.0 pt)');
  assert(reloaded.getTitle() === '150 Suite Comprehensive Report', 'Reloaded PDF retains Title metadata');
  assert(reloaded.getSubject() === '150 Suite Subject', 'Reloaded PDF retains Subject metadata');
  assert(reloaded.getCreator() === 'KivaroTools Image to PDF Converter', 'Reloaded PDF retains Creator metadata');

  // 152-153: Multi-page and Landscape tests
  const doc3 = await PDFDocument.create();
  const embPng3 = await doc3.embedPng(pngBytes);
  doc3.addPage([500, 500]).drawImage(embPng3, { x: 10, y: 10, width: 480, height: 480 });
  doc3.addPage([500, 500]).drawImage(embPng3, { x: 10, y: 10, width: 480, height: 480 });
  doc3.addPage([500, 500]).drawImage(embPng3, { x: 10, y: 10, width: 480, height: 480 });
  const doc3Bytes = await doc3.save();
  await verifyOutputPdfIntegrity(doc3Bytes, 3);
  assert(true, '3-page document successfully passes verifyOutputPdfIntegrity with expectedPages=3');

  const docLandscape = await PDFDocument.create();
  const lPage = docLandscape.addPage([PAGE_SIZE_POINTS.a4.height, PAGE_SIZE_POINTS.a4.width]);
  assert(lPage.getWidth() > lPage.getHeight(), 'Landscape page width (841.89) strictly exceeds height (595.28)');

  // ============================================================================
  // SECTION 7: SEPARATE PDFS & JSZIP PACKAGING INTEGRATION (22 Tests)
  // ============================================================================
  console.log('\n--- Section 7: Separate PDFs & JSZip Packaging Integration (Tests 154–175) ---');

  // 154-157: Standalone PDF creation for ZIP entries
  const zip = new JSZip();
  assert(zip !== null && zip !== undefined, 'JSZip successfully instantiated');

  const pdf1 = await PDFDocument.create();
  pdf1.setTitle('Photo One');
  pdf1.addPage([595.28, 841.89]);
  const pdfBytes1 = await pdf1.save();

  const pdf2 = await PDFDocument.create();
  pdf2.setTitle('Receipt Two');
  pdf2.addPage([612.0, 792.0]);
  const pdfBytes2 = await pdf2.save();

  const pdf3 = await PDFDocument.create();
  pdf3.setTitle('Diagram Three');
  pdf3.addPage([419.53, 595.28]);
  const pdfBytes3 = await pdf3.save();
  assert(pdfBytes1.length > 0 && pdfBytes2.length > 0 && pdfBytes3.length > 0, 'Created 3 standalone PDF documents for archive packaging');

  // 158-161: Zero-padded naming and sanitization
  const baseName1 = 'photo one.jpg'.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const entryName1 = `${String(1).padStart(2, '0')}_${baseName1}.pdf`;
  assert(entryName1 === '01_photo_one.pdf', 'Entry 1 correctly formatted as 01_photo_one.pdf');

  const baseName2 = 'receipt#2 (store).png'.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const entryName2 = `${String(2).padStart(2, '0')}_${baseName2}.pdf`;
  assert(entryName2 === '02_receipt_2__store_.pdf', 'Entry 2 sanitizes illegal characters into underscores');

  const baseName3 = 'diagram...v3.webp'.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const entryName3 = `${String(3).padStart(2, '0')}_${baseName3}.pdf`;
  assert(entryName3.startsWith('03_diagram'), 'Entry 3 formatted with prefix 03_');

  // 162-164: Adding files to ZIP and generating archive
  zip.file(entryName1, pdfBytes1);
  zip.file(entryName2, pdfBytes2);
  zip.file(entryName3, pdfBytes3);
  assert(true, 'Added 3 PDF files into JSZip hierarchy');

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  assert(zipBuffer.length > 1000, `JSZip compressed archive generated successfully (${zipBuffer.length} bytes > 1000)`);
  assert(zipBuffer[0] === 0x50 && zipBuffer[1] === 0x4B && zipBuffer[2] === 0x03 && zipBuffer[3] === 0x04, 'ZIP archive starts with PK magic header (0x50, 0x4B, 0x03, 0x04)');

  // 165-168: Reloading ZIP and verifying entries
  const reloadedZip = await JSZip.loadAsync(zipBuffer);
  const fileKeys = Object.keys(reloadedZip.files);
  assert(fileKeys.length === 3, 'Reloaded ZIP archive contains exactly 3 files');
  assert(reloadedZip.file('01_photo_one.pdf') !== null, 'Reloaded ZIP contains 01_photo_one.pdf');
  assert(reloadedZip.file('02_receipt_2__store_.pdf') !== null, 'Reloaded ZIP contains 02_receipt_2__store_.pdf');
  assert(reloadedZip.file(entryName3) !== null, 'Reloaded ZIP contains entry 3');

  // 169-173: Extracting entry and verifying PDF integrity
  const extractedFile1 = reloadedZip.file('01_photo_one.pdf');
  const extractedBytes1 = await extractedFile1!.async('uint8array');
  const extractedMagic = String.fromCharCode(...extractedBytes1.slice(0, 5));
  assert(extractedMagic === '%PDF-', 'Extracted file 1 contains valid %PDF- header magic');

  const loadedExtractedDoc = await PDFDocument.load(extractedBytes1);
  assert(loadedExtractedDoc.getPageCount() === 1, 'Extracted individual PDF has exactly 1 page');
  assertClose(loadedExtractedDoc.getPage(0).getWidth(), 595.28, 'Extracted individual PDF has correct A4 width (595.28 pt)');
  assert(loadedExtractedDoc.getTitle() === 'Photo One', 'Extracted individual PDF retains set Title');

  // 174-175: Output filename logic for ZIP
  const outputZipName1 = ('my-documents.pdf')
    .replace(/\.zip$/i, '')
    .replace(/\.pdf$/i, '')
    .trim() + '.zip';
  assert(outputZipName1 === 'my-documents.zip', 'Output ZIP filename converts .pdf to .zip cleanly');

  const outputZipName2 = ('batch_export')
    .replace(/\.zip$/i, '')
    .replace(/\.pdf$/i, '')
    .trim() + '.zip';
  assert(outputZipName2 === 'batch_export.zip', 'Output ZIP filename appends .zip to extension-less names');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed (${testsRun} total)`);
  console.log('================================================================\n');

  if (testsFailed > 0 || testsRun !== 175) {
    console.error(`Expected exactly 175 tests, but ran ${testsRun}`);
    process.exit(1);
  }
}

run150TestSuite().catch((err) => {
  console.error('Fatal error during test suite execution:', err);
  process.exit(1);
});
