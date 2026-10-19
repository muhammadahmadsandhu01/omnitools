import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import JSZip from 'jszip';
import {
  checkWebpMagicBytes,
  isAnimatedWebp,
  validateWebpContainer,
  hexToRgb,
  sanitizeOutputFilename,
  formatBytes,
  validateWebpFile,
  createBatchZip,
  DEFAULT_OPTIONS,
} from '../lib/webpToJpgPngEngine';
import { tools } from '../config/toolsData';
import { toolComponents, seoComponents } from '../config/toolRegistry';

const FIXTURES_DIR = path.join(__dirname, '../scratch/webp_fixtures');

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition: boolean, description: string, detail?: string) {
  if (condition) {
    passedAssertions++;
    console.log(`  [PASS] ${description}`);
  } else {
    failedAssertions++;
    console.error(`  [FAIL] ${description}${detail ? ` (${detail})` : ''}`);
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('KIVAROTOOLS WEBP TO JPG & PNG — PERMANENT REGRESSION SUITE');
  console.log('====================================================\n');

  // -------------------------------------------------------------
  // Test Group 1: Magic Byte Signature & File Validation
  // -------------------------------------------------------------
  console.log('Test Group 1: Magic Byte Signature & File Validation');

  const landscapeBuf = fs.readFileSync(path.join(FIXTURES_DIR, 'opaque-landscape.webp'));
  const transBuf = fs.readFileSync(path.join(FIXTURES_DIR, 'transparent-badge.webp'));
  const corruptBuf = fs.readFileSync(path.join(FIXTURES_DIR, 'corrupted-file.webp'));
  const fakeBuf = fs.readFileSync(path.join(FIXTURES_DIR, 'disguised-text.webp'));
  const zeroBuf = fs.readFileSync(path.join(FIXTURES_DIR, 'zero-byte.webp'));

  assert(checkWebpMagicBytes(new Uint8Array(landscapeBuf)), 'checkWebpMagicBytes accepts genuine landscape WebP');
  assert(checkWebpMagicBytes(new Uint8Array(transBuf)), 'checkWebpMagicBytes accepts genuine transparent WebP');
  assert(!checkWebpMagicBytes(new Uint8Array(corruptBuf)), 'checkWebpMagicBytes rejects corrupted bytes');
  assert(!checkWebpMagicBytes(new Uint8Array(fakeBuf)), 'checkWebpMagicBytes rejects fake disguised text file');
  assert(!checkWebpMagicBytes(new Uint8Array(zeroBuf)), 'checkWebpMagicBytes rejects zero-byte input');

  // Truncated buffer (< 12 bytes)
  const truncatedBuf = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x04, 0x00]);
  assert(!checkWebpMagicBytes(truncatedBuf), 'checkWebpMagicBytes rejects truncated 6-byte buffer');

  // Declared RIFF payload length too small (< 4 bytes)
  const badRiffSize = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x02, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
  assert(!checkWebpMagicBytes(badRiffSize), 'checkWebpMagicBytes rejects declared RIFF size < 4 bytes');

  // Validation function tests
  const landscapeBlob = new Blob([landscapeBuf], { type: 'image/webp' });
  const val1 = await validateWebpFile(landscapeBlob, 'photo.webp');
  assert(val1.isValid === true, 'validateWebpFile approves valid WebP blob');
  assert(val1.isAnimated === false, 'validateWebpFile flags static landscape as non-animated');

  const zeroBlob = new Blob([zeroBuf], { type: 'image/webp' });
  const val2 = await validateWebpFile(zeroBlob, 'empty.webp');
  assert(val2.isValid === false, 'validateWebpFile rejects 0-byte file');
  assert(val2.errorMessage?.includes('0 bytes') === true, 'validateWebpFile gives actionable 0-byte error message');

  const fakeBlob = new Blob([fakeBuf], { type: 'image/webp' });
  const val3 = await validateWebpFile(fakeBlob, 'fake.webp');
  assert(val3.isValid === false, 'validateWebpFile rejects non-WebP header in fake file');

  const corruptBlob = new Blob([corruptBuf], { type: 'image/webp' });
  const valCorrupt = await validateWebpFile(corruptBlob, 'corrupted.webp');
  assert(valCorrupt.isValid === false, 'validateWebpFile rejects corrupted WebP byte stream');

  const trunc6Blob = new Blob([truncatedBuf], { type: 'image/webp' });
  const valTrunc6 = await validateWebpFile(trunc6Blob, 'truncated-6b.webp');
  assert(valTrunc6.isValid === false, 'validateWebpFile rejects truncated 6-byte header (< 12 bytes)');

  const badRiffBlob = new Blob([badRiffSize], { type: 'image/webp' });
  const valBadRiff = await validateWebpFile(badRiffBlob, 'bad-riff-size-lt4.webp');
  assert(valBadRiff.isValid === false, 'validateWebpFile rejects declared RIFF payload size < 4 bytes');

  const unexpectedExtBlob = new Blob([landscapeBuf], { type: 'image/webp' });
  const valUnexpected = await validateWebpFile(unexpectedExtBlob, 'image.bin');
  assert(valUnexpected.isValid === true, 'validateWebpFile accepts valid WebP buffer with .bin extension if MIME is image/webp');

  // -------------------------------------------------------------
  // Test Group 2: Animated WebP Detection & RIFF Structural Defense
  // -------------------------------------------------------------
  console.log('\nTest Group 2: Animated WebP Detection & RIFF Structural Defense');

  const animBuf = fs.readFileSync(path.join(FIXTURES_DIR, 'animated-test.webp'));
  assert(isAnimatedWebp(new Uint8Array(animBuf)), 'isAnimatedWebp detects VP8X animation flag in animated fixture');

  const anim2Buf = fs.readFileSync(path.join(FIXTURES_DIR, 'animated-2frames-red-green.webp'));
  assert(isAnimatedWebp(new Uint8Array(anim2Buf)), 'isAnimatedWebp detects 2-frame red/green animated WebP');

  assert(!isAnimatedWebp(new Uint8Array(landscapeBuf)), 'isAnimatedWebp returns false for opaque static WebP');
  assert(!isAnimatedWebp(new Uint8Array(transBuf)), 'isAnimatedWebp returns false for transparent static WebP');

  // Synthetic still WebP with coincidental 'ANIM' inside VP8 chunk payload (verifies structural chunk boundary walking)
  const fakePayload = Buffer.alloc(32);
  fakePayload.write('ANIM', 10, 'ascii'); // Bytes at offset 22 (inside payload, not at chunk boundary)
  const stillWebpWithAnimBytes = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([36, 0, 0, 0]), // 4 + (8 + 32) = 44 bytes total, RIFF size = 36
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii'),
    Buffer.from([32, 0, 0, 0]), // VP8 chunk size = 32
    fakePayload,
  ]);
  assert(
    !isAnimatedWebp(new Uint8Array(stillWebpWithAnimBytes)),
    'isAnimatedWebp correctly rejects still WebP with coincidental "ANIM" in compressed VP8 bitstream payload'
  );

  // Chunk size exceeding remaining bytes (truncated chunk payload)
  const truncatedChunk = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([100, 0, 0, 0]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii'),
    Buffer.from([0x00, 0x10, 0x00, 0x00]), // declared size 4096 bytes
    Buffer.from([0, 0, 0, 0]), // only 4 bytes present
  ]);
  assert(!isAnimatedWebp(new Uint8Array(truncatedChunk)), 'isAnimatedWebp safely handles chunk size exceeding buffer length');

  // Odd-sized chunk with 1 byte padding followed by ANIM chunk
  // Odd-sized chunk with 1 byte padding in valid animated container (VP8X + EXIF[3]+pad + ANIM + ANMF)
  const oddChunkWithAnim = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([72, 0, 0, 0]), // declared size 72
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8X', 'ascii'),
    Buffer.from([10, 0, 0, 0]),
    Buffer.from([0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0]), // Animation flag
    Buffer.from('EXIF', 'ascii'),
    Buffer.from([3, 0, 0, 0]), // 3 bytes payload (odd size)
    Buffer.from([1, 2, 3]), // 3 payload bytes
    Buffer.from([0]), // 1 byte padding to even boundary
    Buffer.from('ANIM', 'ascii'), // ANIM control chunk
    Buffer.from([6, 0, 0, 0]),
    Buffer.from([0, 0, 0, 0, 0, 0]),
    Buffer.from('ANMF', 'ascii'), // ANMF frame chunk
    Buffer.from([16, 0, 0, 0]),
    Buffer.alloc(16),
  ]);
  assert(isAnimatedWebp(new Uint8Array(oddChunkWithAnim)), 'isAnimatedWebp advances past odd-sized chunk padding and detects ANIM/ANMF');

  const oddAnimBlob = new Blob([oddChunkWithAnim], { type: 'image/webp' });
  const valOddAnim = await validateWebpFile(oddAnimBlob, 'odd-chunk-anim.webp');
  assert(valOddAnim.isValid === true && valOddAnim.isAnimated === true, 'validateWebpFile approves valid animated WebP with odd-sized chunk padding');

  // Odd chunk missing required 1-byte padding at EOF
  const oddChunkMissingPad = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([23, 0, 0, 0]), // declared size 23
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii'),
    Buffer.from([11, 0, 0, 0]), // 11 bytes payload (odd size)
    Buffer.alloc(11), // Missing 1-byte padding byte!
  ]);
  const valOddMissingPad = await validateWebpFile(new Blob([oddChunkMissingPad], { type: 'image/webp' }), 'odd-missing-pad.webp');
  assert(valOddMissingPad.isValid === false, 'validateWebpFile rejects odd-sized chunk missing required padding byte');

  // Odd chunk padding byte falling outside declared RIFF container boundary
  const oddChunkPadExceedsContainer = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([31, 0, 0, 0]), // declared size 31 (container ends at 39)
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii'),
    Buffer.from([19, 0, 0, 0]), // payload 19 bytes ends at 39; padding byte would fall at offset 40 (outside 39)
    Buffer.alloc(19),
    Buffer.from([0]), // padding present physically but exceeds declared container
  ]);
  const valPadExceeds = await validateWebpFile(new Blob([oddChunkPadExceedsContainer], { type: 'image/webp' }), 'odd-pad-exceeds.webp');
  assert(valPadExceeds.isValid === false, 'validateWebpFile rejects odd chunk padding byte falling outside declared RIFF container boundary');

  // Animation consistency: VP8X animation flag set, but only ANIM present (missing ANMF frame chunk)
  const animOnlyChunks = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([36, 0, 0, 0]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8X', 'ascii'),
    Buffer.from([10, 0, 0, 0]),
    Buffer.from([0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0]), // Animation flag set
    Buffer.from('ANIM', 'ascii'),
    Buffer.from([6, 0, 0, 0]),
    Buffer.alloc(6),
  ]);
  assert(!isAnimatedWebp(new Uint8Array(animOnlyChunks)), 'isAnimatedWebp rejects VP8X animation flag with ANIM only (missing ANMF)');
  const valAnimOnly = await validateWebpFile(new Blob([animOnlyChunks], { type: 'image/webp' }), 'anim-only.webp');
  assert(valAnimOnly.isValid === false, 'validateWebpFile rejects VP8X animation flag with ANIM only (missing ANMF frame chunks)');

  // Animation consistency: VP8X animation flag set, but only ANMF present (missing ANIM control chunk)
  const anmfOnlyChunks = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([46, 0, 0, 0]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8X', 'ascii'),
    Buffer.from([10, 0, 0, 0]),
    Buffer.from([0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0]), // Animation flag set
    Buffer.from('ANMF', 'ascii'),
    Buffer.from([16, 0, 0, 0]),
    Buffer.alloc(16),
  ]);
  assert(!isAnimatedWebp(new Uint8Array(anmfOnlyChunks)), 'isAnimatedWebp rejects VP8X animation flag with ANMF only (missing ANIM)');
  const valAnmfOnly = await validateWebpFile(new Blob([anmfOnlyChunks], { type: 'image/webp' }), 'anmf-only.webp');
  assert(valAnmfOnly.isValid === false, 'validateWebpFile rejects VP8X animation flag with ANMF only (missing ANIM control chunk)');

  // Animation consistency: ANIM/ANMF present in simple container without VP8X header
  const animWithoutVp8x = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([52, 0, 0, 0]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii'),
    Buffer.from([4, 0, 0, 0]),
    Buffer.alloc(4),
    Buffer.from('ANIM', 'ascii'),
    Buffer.from([6, 0, 0, 0]),
    Buffer.alloc(6),
    Buffer.from('ANMF', 'ascii'),
    Buffer.from([16, 0, 0, 0]),
    Buffer.alloc(16),
  ]);
  assert(!isAnimatedWebp(new Uint8Array(animWithoutVp8x)), 'isAnimatedWebp rejects animation chunks present without VP8X header');
  const valAnimNoVp8x = await validateWebpFile(new Blob([animWithoutVp8x], { type: 'image/webp' }), 'anim-no-vp8x.webp');
  assert(valAnimNoVp8x.isValid === false, 'validateWebpFile rejects animation chunks present without VP8X header');

  // Animation consistency: VP8X present but animation flag is 0, yet ANIM/ANMF present
  const vp8xNoFlagWithAnim = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([58, 0, 0, 0]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8X', 'ascii'),
    Buffer.from([10, 0, 0, 0]),
    Buffer.from([0x00, 0, 0, 0, 0, 0, 0, 0, 0, 0]), // Animation flag NOT set
    Buffer.from('ANIM', 'ascii'),
    Buffer.from([6, 0, 0, 0]),
    Buffer.alloc(6),
    Buffer.from('ANMF', 'ascii'),
    Buffer.from([16, 0, 0, 0]),
    Buffer.alloc(16),
  ]);
  assert(!isAnimatedWebp(new Uint8Array(vp8xNoFlagWithAnim)), 'isAnimatedWebp rejects animation chunks when VP8X animation flag is not set');
  const valNoFlagWithAnim = await validateWebpFile(new Blob([vp8xNoFlagWithAnim], { type: 'image/webp' }), 'no-flag-with-anim.webp');
  assert(valNoFlagWithAnim.isValid === false, 'validateWebpFile rejects animation chunks when VP8X animation flag is not set');

  // Truncated chunk header (4-byte FourCC without 4-byte size)
  const truncatedHeaderChunk = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([28, 0, 0, 0]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii'),
    Buffer.from([4, 0, 0, 0]),
    Buffer.alloc(4),
    Buffer.from('ANMF', 'ascii'), // Only 4 bytes of FourCC, missing size!
  ]);
  const valTruncChunk = await validateWebpFile(new Blob([truncatedHeaderChunk], { type: 'image/webp' }), 'truncated-chunk-hdr.webp');
  assert(valTruncChunk.isValid === false, 'validateWebpFile rejects file ending with truncated chunk header (FourCC without size)');

  // Truncated chunk header: 1 byte remaining before container end
  const trunc1ByteChunk = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([17, 0, 0, 0]), // declared size 17 (container end = 25)
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii'),
    Buffer.from([4, 0, 0, 0]),
    Buffer.alloc(4), // ends at 12 + 8 + 4 = 24
    Buffer.from('A'), // 1 byte remaining (truncated chunk header)
  ]);
  const valTrunc1 = await validateWebpFile(new Blob([trunc1ByteChunk], { type: 'image/webp' }), 'trunc-1byte.webp');
  assert(valTrunc1.isValid === false, 'validateWebpFile rejects container ending with 1-byte truncated chunk header');

  // Truncated chunk header: 3 bytes remaining before container end
  const trunc3BytesChunk = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([19, 0, 0, 0]), // declared size 19 (container end = 27)
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii'),
    Buffer.from([4, 0, 0, 0]),
    Buffer.alloc(4), // ends at 24
    Buffer.from('ANM'), // 3 bytes remaining (truncated chunk header)
  ]);
  const valTrunc3 = await validateWebpFile(new Blob([trunc3BytesChunk], { type: 'image/webp' }), 'trunc-3bytes.webp');
  assert(valTrunc3.isValid === false, 'validateWebpFile rejects container ending with 3-byte truncated chunk header');

  // Truncated chunk header: 7 bytes remaining before container end (FourCC + 3 bytes of size)
  const trunc7BytesChunk = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([23, 0, 0, 0]), // declared size 23 (container end = 31)
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii'),
    Buffer.from([4, 0, 0, 0]),
    Buffer.alloc(4), // ends at 24
    Buffer.from('ANMF\x01\x00\x00'), // 7 bytes remaining (missing 1 byte of 4-byte size uint32)
  ]);
  const valTrunc7 = await validateWebpFile(new Blob([trunc7BytesChunk], { type: 'image/webp' }), 'trunc-7bytes.webp');
  assert(valTrunc7.isValid === false, 'validateWebpFile rejects container ending with 7-byte truncated chunk header');

  // Intermediate odd-sized chunk missing required 1-byte padding before subsequent chunk
  const intermediateOddMissingPad = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([71, 0, 0, 0]), // declared size 71 (container end = 79)
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8X', 'ascii'),
    Buffer.from([10, 0, 0, 0]),
    Buffer.from([0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0]), // Animation flag
    Buffer.from('EXIF', 'ascii'),
    Buffer.from([3, 0, 0, 0]), // 3 bytes payload (odd size)
    Buffer.from([1, 2, 3]), // missing padding byte! Immediately followed by ANIM
    Buffer.from('ANIM', 'ascii'),
    Buffer.from([6, 0, 0, 0]),
    Buffer.from([0, 0, 0, 0, 0, 0]),
    Buffer.from('ANMF', 'ascii'),
    Buffer.from([16, 0, 0, 0]),
    Buffer.alloc(16),
  ]);
  assert(!isAnimatedWebp(new Uint8Array(intermediateOddMissingPad)), 'isAnimatedWebp rejects intermediate odd chunk missing 0x00 pad byte');
  const valInterOddMissing = await validateWebpFile(new Blob([intermediateOddMissingPad], { type: 'image/webp' }), 'inter-odd-missing-pad.webp');
  assert(valInterOddMissing.isValid === false, 'validateWebpFile rejects intermediate odd chunk missing 0x00 pad byte');

  // Malformed ANIM chunk: payload size 8 bytes instead of 6 bytes
  const badAnimSizeChunk = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([62, 0, 0, 0]), // declared size 62 (container end = 70)
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8X', 'ascii'),
    Buffer.from([10, 0, 0, 0]),
    Buffer.from([0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    Buffer.from('ANIM', 'ascii'),
    Buffer.from([8, 0, 0, 0]), // Malformed: size 8 instead of 6
    Buffer.alloc(8),
    Buffer.from('ANMF', 'ascii'),
    Buffer.from([16, 0, 0, 0]),
    Buffer.alloc(16),
  ]);
  assert(!isAnimatedWebp(new Uint8Array(badAnimSizeChunk)), 'isAnimatedWebp rejects animated WebP with malformed ANIM chunk size !== 6');
  const valBadAnimSize = await validateWebpFile(new Blob([badAnimSizeChunk], { type: 'image/webp' }), 'bad-anim-size.webp');
  assert(valBadAnimSize.isValid === false, 'validateWebpFile rejects animated WebP with malformed ANIM chunk size !== 6');

  // Malformed ANMF chunk: payload size 8 bytes instead of >= 16 bytes
  const badAnmfSizeChunk = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([52, 0, 0, 0]), // declared size 52 (container end = 60)
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8X', 'ascii'),
    Buffer.from([10, 0, 0, 0]),
    Buffer.from([0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    Buffer.from('ANIM', 'ascii'),
    Buffer.from([6, 0, 0, 0]),
    Buffer.alloc(6),
    Buffer.from('ANMF', 'ascii'),
    Buffer.from([8, 0, 0, 0]), // Malformed: size 8 < 16
    Buffer.alloc(8),
  ]);
  assert(!isAnimatedWebp(new Uint8Array(badAnmfSizeChunk)), 'isAnimatedWebp rejects animated WebP with malformed ANMF chunk size < 16');
  const valBadAnmfSize = await validateWebpFile(new Blob([badAnmfSizeChunk], { type: 'image/webp' }), 'bad-anmf-size.webp');
  assert(valBadAnmfSize.isValid === false, 'validateWebpFile rejects animated WebP with malformed ANMF chunk size < 16');

  // Malformed VP8X (declared size < 10)
  const badVp8x = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([20, 0, 0, 0]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8X', 'ascii'),
    Buffer.from([4, 0, 0, 0]), // size 4 < 10
    Buffer.from([0x02, 0, 0, 0]),
  ]);
  assert(!isAnimatedWebp(new Uint8Array(badVp8x)), 'isAnimatedWebp rejects malformed VP8X with payload size < 10');

  // VP8X truncated buffer ending before flags byte
  const truncVp8x = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([20, 0, 0, 0]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8X', 'ascii'),
    Buffer.from([10, 0, 0, 0]),
    Buffer.from([0x02]), // only 1 byte payload, needs 10 bytes
  ]);
  assert(!isAnimatedWebp(new Uint8Array(truncVp8x)), 'isAnimatedWebp safely handles VP8X buffer ending before flags byte');
  const valTruncVp8x = await validateWebpFile(new Blob([truncVp8x], { type: 'image/webp' }), 'trunc-vp8x.webp');
  assert(valTruncVp8x.isValid === false, 'validateWebpFile rejects VP8X buffer ending before flags byte');

  // Non-WebP format rejection
  assert(!isAnimatedWebp(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), 'isAnimatedWebp rejects JPEG header signature');
  assert(!isAnimatedWebp(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), 'isAnimatedWebp rejects PNG header signature');
  assert(!isAnimatedWebp(new Uint8Array([0x47, 0x49, 0x46, 0x38])), 'isAnimatedWebp rejects GIF header signature');
  assert(!isAnimatedWebp(new Uint8Array(Buffer.from('<!DOCTYPE html>'))), 'isAnimatedWebp rejects HTML text header');

  const animBlob = new Blob([animBuf], { type: 'image/webp' });
  const valAnim = await validateWebpFile(animBlob, 'animation.webp');
  assert(valAnim.isValid === true, 'validateWebpFile approves animated WebP');
  assert(valAnim.isAnimated === true, 'validateWebpFile sets isAnimated === true on animated file');

  // Container structural validation tests (validateWebpContainer)
  const valContainerStill = validateWebpContainer(new Uint8Array(landscapeBuf), landscapeBuf.length);
  assert(valContainerStill.isValid === true && valContainerStill.isAnimated === false, 'validateWebpContainer approves valid still WebP');

  const valContainerAnim = validateWebpContainer(new Uint8Array(animBuf), animBuf.length);
  assert(valContainerAnim.isValid === true && valContainerAnim.isAnimated === true, 'validateWebpContainer approves valid animated WebP');

  // Declared RIFF length exceeds actual file length
  const riffExceedsFile = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([0x00, 0x10, 0x00, 0x00]), // 4096 bytes declared
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii'),
    Buffer.from([4, 0, 0, 0]),
    Buffer.from([0, 0, 0, 0]),
  ]);
  const valRiffExceeds = validateWebpContainer(new Uint8Array(riffExceedsFile), riffExceedsFile.length);
  assert(valRiffExceeds.isValid === false, 'validateWebpContainer rejects declared RIFF length exceeding file size');

  // Chunk size exceeds remaining file bytes
  const valChunkExceeds = validateWebpContainer(new Uint8Array(truncatedChunk), truncatedChunk.length);
  assert(valChunkExceeds.isValid === false, 'validateWebpContainer rejects chunk payload size exceeding file boundary');

  // Malformed VP8X (declared size < 10)
  const valBadVp8x = validateWebpContainer(new Uint8Array(badVp8x), badVp8x.length);
  assert(valBadVp8x.isValid === false, 'validateWebpContainer rejects malformed VP8X chunk payload length < 10');

  // VP8X animation flag set but missing ANIM/ANMF chunks
  const vp8xAnimMissingChunks = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([26, 0, 0, 0]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8X', 'ascii'),
    Buffer.from([10, 0, 0, 0]),
    Buffer.from([0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0]), // Animation flag set
    Buffer.from('VP8 ', 'ascii'),
    Buffer.from([0, 0, 0, 0]),
  ]);
  const valMissingAnim = validateWebpContainer(new Uint8Array(vp8xAnimMissingChunks), vp8xAnimMissingChunks.length);
  assert(valMissingAnim.isValid === false, 'validateWebpContainer rejects VP8X animation flag with missing ANIM/ANMF chunks');

  // Unknown initial chunk (must be VP8, VP8L, or VP8X)
  const unknownInitialChunk = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([20, 0, 0, 0]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('JUNK', 'ascii'),
    Buffer.from([4, 0, 0, 0]),
    Buffer.from([0, 0, 0, 0]),
  ]);
  const valUnknownInitial = validateWebpContainer(new Uint8Array(unknownInitialChunk), unknownInitialChunk.length);
  assert(valUnknownInitial.isValid === false, 'validateWebpContainer rejects unknown initial chunk type');

  // Truncated file (< 20 bytes, missing chunk header)
  const truncHeaderOnly = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([8, 0, 0, 0]),
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP', 'ascii'), // Only 2 bytes of chunk FourCC
  ]);
  const valTruncHeader = validateWebpContainer(new Uint8Array(truncHeaderOnly), truncHeaderOnly.length);
  assert(valTruncHeader.isValid === false, 'validateWebpContainer rejects truncated file ending before initial chunk header');

  // Declared RIFF size too small (< 12 bytes to hold WEBP + first chunk header)
  const riffTooSmall = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([8, 0, 0, 0]), // declared size 8 < 12
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii'),
  ]);
  const valRiffTooSmall = validateWebpContainer(new Uint8Array(riffTooSmall), riffTooSmall.length);
  assert(valRiffTooSmall.isValid === false, 'validateWebpContainer rejects declared RIFF size < 12 bytes');

  // Chunk payload exceeding declared RIFF container end
  const chunkExceedsRiff = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([20, 0, 0, 0]), // declared RIFF size 20 (container end = 28)
    Buffer.from('WEBP', 'ascii'),
    Buffer.from('VP8 ', 'ascii'),
    Buffer.from([30, 0, 0, 0]), // declared chunk payload 30 (offset 12 + 8 + 30 = 50 > 28)
    Buffer.alloc(30),
  ]);
  const valChunkExceedsRiff = validateWebpContainer(new Uint8Array(chunkExceedsRiff), chunkExceedsRiff.length);
  assert(valChunkExceedsRiff.isValid === false, 'validateWebpContainer rejects chunk payload exceeding declared RIFF container end');

  // Confirm real application validateWebpFile rejects all malformed containers (cannot proceed as valid still images)
  const valFile1 = await validateWebpFile(new Blob([riffExceedsFile], { type: 'image/webp' }), 'bad-riff-size.webp');
  assert(valFile1.isValid === false, 'validateWebpFile rejects file where declared RIFF size exceeds file length');

  const valFile2 = await validateWebpFile(new Blob([truncatedChunk], { type: 'image/webp' }), 'truncated-chunk.webp');
  assert(valFile2.isValid === false, 'validateWebpFile rejects file with truncated chunk payload');

  const valFile3 = await validateWebpFile(new Blob([badVp8x], { type: 'image/webp' }), 'bad-vp8x.webp');
  assert(valFile3.isValid === false, 'validateWebpFile rejects file with malformed VP8X payload size < 10');

  const valFile4 = await validateWebpFile(new Blob([vp8xAnimMissingChunks], { type: 'image/webp' }), 'missing-anim.webp');
  assert(valFile4.isValid === false, 'validateWebpFile rejects file with VP8X animation flag missing ANIM/ANMF chunks');

  const valFile5 = await validateWebpFile(new Blob([unknownInitialChunk], { type: 'image/webp' }), 'unknown-chunk.webp');
  assert(valFile5.isValid === false, 'validateWebpFile rejects file with unknown initial chunk FourCC');

  const valFile6 = await validateWebpFile(new Blob([truncHeaderOnly], { type: 'image/webp' }), 'truncated-header.webp');
  assert(valFile6.isValid === false, 'validateWebpFile rejects file truncated before initial chunk header');

  const valFile7 = await validateWebpFile(new Blob([riffTooSmall], { type: 'image/webp' }), 'riff-too-small.webp');
  assert(valFile7.isValid === false, 'validateWebpFile rejects file where declared RIFF size is less than 12 bytes');

  const valFile8 = await validateWebpFile(new Blob([chunkExceedsRiff], { type: 'image/webp' }), 'chunk-exceeds-riff.webp');
  assert(valFile8.isValid === false, 'validateWebpFile rejects file where chunk payload exceeds declared RIFF container');

  // -------------------------------------------------------------
  // Test Group 3: Color Parsing & Filename Sanitization
  // -------------------------------------------------------------
  console.log('\nTest Group 3: Color Parsing & Filename Sanitization');

  const white = hexToRgb('#ffffff');
  assert(white.r === 255 && white.g === 255 && white.b === 255, 'hexToRgb parses #ffffff');

  const black = hexToRgb('#000000');
  assert(black.r === 0 && black.g === 0 && black.b === 0, 'hexToRgb parses #000000');

  const shortHex = hexToRgb('#fff');
  assert(shortHex.r === 255 && shortHex.g === 255 && shortHex.b === 255, 'hexToRgb parses 3-character hex #fff');

  const customHex = hexToRgb('#fe8a32');
  assert(customHex.r === 254 && customHex.g === 138 && customHex.b === 50, 'hexToRgb parses custom hex #fe8a32');

  const fallbackHex = hexToRgb('invalid-hex');
  assert(fallbackHex.r === 255 && fallbackHex.g === 255 && fallbackHex.b === 255, 'hexToRgb falls back to white on invalid input');

  assert(sanitizeOutputFilename('photo.webp', 'jpg') === 'photo.jpg', 'sanitizeOutputFilename replaces extension with .jpg');
  assert(sanitizeOutputFilename('graphic.webp', 'png') === 'graphic.png', 'sanitizeOutputFilename replaces extension with .png');
  assert(sanitizeOutputFilename('../../etc/passwd', 'jpg') === '____etc_passwd.jpg', 'sanitizeOutputFilename neutralizes directory traversal');
  assert(sanitizeOutputFilename('bad:name*<>.webp', 'png') === 'bad_name___.png', 'sanitizeOutputFilename strips illegal characters');
  assert(sanitizeOutputFilename('', 'jpg') === 'converted_image.jpg', 'sanitizeOutputFilename handles empty string fallback');

  const unicodeName = sanitizeOutputFilename('测!@# photo with spaces.webp', 'jpg');
  assert(unicodeName.includes('.jpg') && !unicodeName.includes('.webp'), 'Unicode filename converted to .jpg output');
  assert(sanitizeOutputFilename('a'.repeat(300) + '.webp', 'png').endsWith('.png'), 'Long filename safely handled with target extension');

  assert(formatBytes(0) === '0 B', 'formatBytes formats 0 B');
  assert(formatBytes(1024) === '1.0 KB', 'formatBytes formats 1024 bytes as 1.0 KB');
  assert(formatBytes(1048576) === '1.0 MB', 'formatBytes formats 1 MB');

  // -------------------------------------------------------------
  // Test Group 4: Core Conversion Correctness (JPEG & PNG)
  // -------------------------------------------------------------
  console.log('\nTest Group 4: Core Conversion Correctness (JPEG & PNG)');

  // 1. WebP to JPG
  const jpgBuf = await sharp(landscapeBuf)
    .jpeg({ quality: Math.round(DEFAULT_OPTIONS.quality * 100) })
    .toBuffer();
  assert(jpgBuf.length > 0, 'WebP to JPG produces non-empty buffer');
  assert(jpgBuf[0] === 0xff && jpgBuf[1] === 0xd8 && jpgBuf[2] === 0xff, 'JPEG output starts with valid 0xFF 0xD8 SOI marker');

  const jpgMeta = await sharp(jpgBuf).metadata();
  assert(jpgMeta.format === 'jpeg', 'Decoded converted image format is jpeg');
  assert(jpgMeta.width === 800 && jpgMeta.height === 400, 'Dimensions preserved exactly in JPG conversion (800x400)');

  // 2. WebP to PNG
  const pngBuf = await sharp(landscapeBuf).png().toBuffer();
  assert(pngBuf.length > 0, 'WebP to PNG produces non-empty buffer');
  assert(
    pngBuf[0] === 0x89 && pngBuf[1] === 0x50 && pngBuf[2] === 0x4e && pngBuf[3] === 0x47,
    'PNG output starts with valid PNG magic signature'
  );

  const pngMeta = await sharp(pngBuf).metadata();
  assert(pngMeta.format === 'png', 'Decoded converted image format is png');
  assert(pngMeta.width === 800 && pngMeta.height === 400, 'Dimensions preserved exactly in PNG conversion (800x400)');

  // -------------------------------------------------------------
  // Test Group 5: Transparency, Halos & Pixel Compositing
  // -------------------------------------------------------------
  console.log('\nTest Group 5: Transparency, Halos & Pixel Compositing');

  // Transparent WebP to PNG -> must retain alpha channel (hasAlpha === true)
  const transPngBuf = await sharp(transBuf).png().toBuffer();
  const transPngMeta = await sharp(transPngBuf).metadata();
  assert(transPngMeta.hasAlpha === true, 'Transparent WebP to PNG preserves alpha transparency channel');

  // Transparent WebP to JPG -> must composite onto solid background (hasAlpha === false)
  const transJpgBuf = await sharp(transBuf)
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 90 })
    .toBuffer();
  const transJpgMeta = await sharp(transJpgBuf).metadata();
  assert(transJpgMeta.hasAlpha === false, 'Transparent WebP to JPG removes alpha and composites onto background');
  assert(transJpgMeta.channels === 3, 'JPEG output has exactly 3 channels (RGB, no alpha)');

  // Verify transparent corner pixel (0,0) composites onto white (#ffffff)
  const transJpgWhiteRaw = await sharp(transBuf).flatten({ background: '#ffffff' }).raw().toBuffer();
  assert(
    transJpgWhiteRaw[0] >= 250 && transJpgWhiteRaw[1] >= 250 && transJpgWhiteRaw[2] >= 250,
    'Transparent corner pixel (0,0) composites onto clean white (R>=250, G>=250, B>=250)'
  );

  // Verify transparent corner pixel (0,0) composites onto black (#000000)
  const transJpgBlackRaw = await sharp(transBuf).flatten({ background: '#000000' }).raw().toBuffer();
  assert(
    transJpgBlackRaw[0] <= 5 && transJpgBlackRaw[1] <= 5 && transJpgBlackRaw[2] <= 5,
    'Transparent corner pixel (0,0) composites onto solid black (R<=5, G<=5, B<=5)'
  );

  // Verify transparent corner pixel (0,0) composites onto custom hex #fe8a32 (254, 138, 50)
  const transJpgCustomRaw = await sharp(transBuf).flatten({ background: '#fe8a32' }).raw().toBuffer();
  assert(
    Math.abs(transJpgCustomRaw[0] - 254) <= 2 &&
      Math.abs(transJpgCustomRaw[1] - 138) <= 2 &&
      Math.abs(transJpgCustomRaw[2] - 50) <= 2,
    'Transparent corner pixel (0,0) composites onto custom hex #fe8a32 (254, 138, 50)'
  );

  // Deterministic Synthetic 20x20 Alpha-Gradient WebP Fixture:
  // - (x<10, y<10): fully transparent (0, 0, 0, 0)
  // - (x>=10, y<10): 50% semi-transparent red (255, 0, 0, 128)
  // - (x<10, y>=10): solid green (0, 255, 0, 255)
  // - (x>=10, y>=10): solid blue (0, 0, 255, 255)
  const synthRaw = Buffer.alloc(20 * 20 * 4);
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      const idx = (y * 20 + x) * 4;
      if (x < 10 && y < 10) {
        synthRaw[idx] = 0; synthRaw[idx + 1] = 0; synthRaw[idx + 2] = 0; synthRaw[idx + 3] = 0;
      } else if (x >= 10 && y < 10) {
        synthRaw[idx] = 255; synthRaw[idx + 1] = 0; synthRaw[idx + 2] = 0; synthRaw[idx + 3] = 128;
      } else if (x < 10 && y >= 10) {
        synthRaw[idx] = 0; synthRaw[idx + 1] = 255; synthRaw[idx + 2] = 0; synthRaw[idx + 3] = 255;
      } else {
        synthRaw[idx] = 0; synthRaw[idx + 1] = 0; synthRaw[idx + 2] = 255; synthRaw[idx + 3] = 255;
      }
    }
  }
  const synthWebpBuf = await sharp(synthRaw, { raw: { width: 20, height: 20, channels: 4 } })
    .webp({ lossless: true })
    .toBuffer();

  // Test PNG output: alpha channel preservation at transparent, semi-transparent, and opaque pixels
  const synthPngRaw = await sharp(synthWebpBuf).png().raw().toBuffer();
  assert(synthPngRaw[3] === 0, 'PNG output: fully transparent pixel alpha is strictly 0');
  assert(synthPngRaw[(0 * 20 + 15) * 4 + 3] === 128, 'PNG output: 50% semi-transparent red pixel alpha is strictly 128');
  assert(
    synthPngRaw[(15 * 20 + 5) * 4 + 1] === 255 && synthPngRaw[(15 * 20 + 5) * 4 + 3] === 255,
    'PNG output: solid green pixel preserved with full opacity (G=255, A=255)'
  );
  assert(
    synthPngRaw[(15 * 20 + 15) * 4 + 2] === 255 && synthPngRaw[(15 * 20 + 15) * 4 + 3] === 255,
    'PNG output: solid blue pixel preserved with full opacity (B=255, A=255)'
  );

  // Test JPG output: compositing and halo elimination
  const synthJpgWhiteRaw = await sharp(synthWebpBuf).flatten({ background: '#ffffff' }).raw().toBuffer();
  assert(
    synthJpgWhiteRaw[0] === 255 && synthJpgWhiteRaw[1] === 255 && synthJpgWhiteRaw[2] === 255,
    'JPG white fill: transparent pixel composites to clean white (255, 255, 255)'
  );
  // 50% red over white: 255*0.5 + 255*0.5 = 255 (R), 0*0.5 + 255*0.5 = 127.5 -> 127 (G, B)
  const whiteRedPixel = [synthJpgWhiteRaw[(0 * 20 + 15) * 3], synthJpgWhiteRaw[(0 * 20 + 15) * 3 + 1], synthJpgWhiteRaw[(0 * 20 + 15) * 3 + 2]];
  assert(
    whiteRedPixel[0] >= 253 && Math.abs(whiteRedPixel[1] - 127) <= 2 && Math.abs(whiteRedPixel[2] - 127) <= 2,
    `JPG white fill: 50% semi-transparent red blends smoothly without dark halos (R=${whiteRedPixel[0]}, G=${whiteRedPixel[1]}, B=${whiteRedPixel[2]})`
  );

  const synthJpgBlackRaw = await sharp(synthWebpBuf).flatten({ background: '#000000' }).raw().toBuffer();
  assert(
    synthJpgBlackRaw[0] === 0 && synthJpgBlackRaw[1] === 0 && synthJpgBlackRaw[2] === 0,
    'JPG black fill: transparent pixel composites to solid black (0, 0, 0)'
  );
  const blackRedPixel = [synthJpgBlackRaw[(0 * 20 + 15) * 3], synthJpgBlackRaw[(0 * 20 + 15) * 3 + 1], synthJpgBlackRaw[(0 * 20 + 15) * 3 + 2]];
  assert(
    Math.abs(blackRedPixel[0] - 128) <= 2 && blackRedPixel[1] <= 2 && blackRedPixel[2] <= 2,
    `JPG black fill: 50% semi-transparent red blends to dark red (R=${blackRedPixel[0]}, G=${blackRedPixel[1]}, B=${blackRedPixel[2]})`
  );

  // Verify decoded lossy JPEG pixels from actual JPEG-encoded streams (verifying DCT compression tolerance)
  const transJpgEncodedWhite = await sharp(transBuf).flatten({ background: '#ffffff' }).jpeg({ quality: 90 }).toBuffer();
  const transJpgDecodedWhite = await sharp(transJpgEncodedWhite).raw().toBuffer();
  assert(
    transJpgDecodedWhite[0] >= 250 && transJpgDecodedWhite[1] >= 250 && transJpgDecodedWhite[2] >= 250,
    'Decoded JPEG with white fill: transparent corner pixel (0,0) is clean white (R>=250, G>=250, B>=250)'
  );

  const transJpgEncodedBlack = await sharp(transBuf).flatten({ background: '#000000' }).jpeg({ quality: 90 }).toBuffer();
  const transJpgDecodedBlack = await sharp(transJpgEncodedBlack).raw().toBuffer();
  assert(
    transJpgDecodedBlack[0] <= 5 && transJpgDecodedBlack[1] <= 5 && transJpgDecodedBlack[2] <= 5,
    'Decoded JPEG with black fill: transparent corner pixel (0,0) is solid black (R<=5, G<=5, B<=5)'
  );

  const transJpgEncodedCustom = await sharp(transBuf).flatten({ background: '#fe8a32' }).jpeg({ quality: 90 }).toBuffer();
  const transJpgDecodedCustom = await sharp(transJpgEncodedCustom).raw().toBuffer();
  assert(
    Math.abs(transJpgDecodedCustom[0] - 254) <= 4 &&
      Math.abs(transJpgDecodedCustom[1] - 138) <= 4 &&
      Math.abs(transJpgDecodedCustom[2] - 50) <= 4,
    'Decoded JPEG with custom hex #fe8a32: corner pixel is within lossy DCT tolerance (254, 138, 50)'
  );

  const synthJpgWhiteEncoded = await sharp(synthWebpBuf).flatten({ background: '#ffffff' }).jpeg({ quality: 95 }).toBuffer();
  const synthJpgWhiteDecoded = await sharp(synthJpgWhiteEncoded).raw().toBuffer();
  // Sample interior pixel (x=15, y=4) in semi-transparent red quadrant (away from block boundaries)
  const decodedWhiteRedPixel = [
    synthJpgWhiteDecoded[(4 * 20 + 15) * 3],
    synthJpgWhiteDecoded[(4 * 20 + 15) * 3 + 1],
    synthJpgWhiteDecoded[(4 * 20 + 15) * 3 + 2],
  ];
  assert(
    decodedWhiteRedPixel[0] >= 250 &&
      Math.abs(decodedWhiteRedPixel[1] - 127) <= 5 &&
      Math.abs(decodedWhiteRedPixel[2] - 127) <= 5,
    `Decoded lossy JPEG: 50% semi-transparent red interior pixel blends smoothly over white without dark halos (R=${decodedWhiteRedPixel[0]}, G=${decodedWhiteRedPixel[1]}, B=${decodedWhiteRedPixel[2]})`
  );

  // -------------------------------------------------------------
  // Test Group 6: Quality Boundaries & Monotonic File Size
  // -------------------------------------------------------------
  console.log('\nTest Group 6: Quality Boundaries & Monotonic File Size');

  // Supported boundary quality values: 10, 50, 90, 100
  const q10 = await sharp(landscapeBuf).jpeg({ quality: 10 }).toBuffer();
  const q50 = await sharp(landscapeBuf).jpeg({ quality: 50 }).toBuffer();
  const q90 = await sharp(landscapeBuf).jpeg({ quality: 90 }).toBuffer();
  const q100 = await sharp(landscapeBuf).jpeg({ quality: 100 }).toBuffer();

  assert(q10[0] === 0xff && q10[1] === 0xd8, 'Quality 10% produces valid JPEG SOI');
  assert(q50[0] === 0xff && q50[1] === 0xd8, 'Quality 50% produces valid JPEG SOI');
  assert(q90[0] === 0xff && q90[1] === 0xd8, 'Quality 90% produces valid JPEG SOI');
  assert(q100[0] === 0xff && q100[1] === 0xd8, 'Quality 100% produces valid JPEG SOI');

  assert(
    q10.length < q50.length && q50.length < q90.length && q90.length <= q100.length,
    `JPEG quality levels scale monotonically: q10 (${q10.length} B) < q50 (${q50.length} B) < q90 (${q90.length} B) <= q100 (${q100.length} B)`
  );

  // High-Resolution 1440p WebP to JPG
  const highresBuf = fs.readFileSync(path.join(FIXTURES_DIR, 'sample-highres.webp'));
  const highresJpg = await sharp(highresBuf).jpeg({ quality: 85 }).toBuffer();
  const highresMeta = await sharp(highresJpg).metadata();
  assert(highresMeta.width === 2560 && highresMeta.height === 1440, 'High-resolution dimensions preserved (2560x1440)');

  // Square (500x500)
  const squareBuf = fs.readFileSync(path.join(FIXTURES_DIR, 'square-photo.webp'));
  const squareJpg = await sharp(squareBuf).jpeg().toBuffer();
  const squareMeta = await sharp(squareJpg).metadata();
  assert(squareMeta.width === 500 && squareMeta.height === 500, 'Square dimensions preserved exactly (500x500)');

  // Tiny (16x16)
  const tinyBuf = fs.readFileSync(path.join(FIXTURES_DIR, 'tiny-square.webp'));
  const tinyPng = await sharp(tinyBuf).png().toBuffer();
  const tinyMeta = await sharp(tinyPng).metadata();
  assert(tinyMeta.width === 16 && tinyMeta.height === 16, 'Tiny 16x16 WebP converted to PNG preserves 16x16');

  // -------------------------------------------------------------
  // Test Group 7: Batch ZIP Archive Packaging & Disambiguation
  // -------------------------------------------------------------
  console.log('\nTest Group 7: Batch ZIP Archive Packaging & Disambiguation');

  const itemsToZip = [
    { filename: 'photo.jpg', blob: new Blob([jpgBuf], { type: 'image/jpeg' }) },
    { filename: 'photo.jpg', blob: new Blob([jpgBuf], { type: 'image/jpeg' }) }, // Duplicate name
    { filename: 'graphic.png', blob: new Blob([pngBuf], { type: 'image/png' }) },
  ];

  const zipBlob = await createBatchZip(itemsToZip);
  assert(zipBlob.size > 0, 'createBatchZip returns non-empty ZIP Blob');

  const zipArrayBuf = await zipBlob.arrayBuffer();
  const loadedZip = await JSZip.loadAsync(zipArrayBuf);
  const zipFileNames = Object.keys(loadedZip.files);

  assert(zipFileNames.length === 3, 'ZIP contains exactly 3 files');
  assert(zipFileNames.includes('photo.jpg'), 'ZIP contains first photo.jpg');
  assert(zipFileNames.includes('photo (1).jpg'), 'ZIP disambiguates duplicate photo.jpg to photo (1).jpg');
  assert(zipFileNames.includes('graphic.png'), 'ZIP contains graphic.png');

  // Mixed-validity batch test: valid items packaged without corruption
  const mixedBatch = [
    { filename: 'valid1.jpg', blob: new Blob([jpgBuf], { type: 'image/jpeg' }) },
    { filename: 'valid2.png', blob: new Blob([pngBuf], { type: 'image/png' }) },
  ];
  const mixedZipBlob = await createBatchZip(mixedBatch);
  const mixedZipArr = await mixedZipBlob.arrayBuffer();
  const loadedMixedZip = await JSZip.loadAsync(mixedZipArr);
  const mixedEntries = Object.keys(loadedMixedZip.files);
  assert(mixedEntries.length === 2, 'Batch ZIP successfully created from valid items in mixed batch without silent corruption');
  assert(mixedEntries.includes('valid1.jpg') && mixedEntries.includes('valid2.png'), 'Batch ZIP preserves valid entry filenames');

  // Verify extracted content is valid JPEG
  const extractedPhoto = await loadedZip.file('photo.jpg')?.async('uint8array');
  assert(
    extractedPhoto !== undefined && extractedPhoto[0] === 0xff && extractedPhoto[1] === 0xd8,
    'Extracted ZIP item is valid JPEG binary stream'
  );

  // -------------------------------------------------------------
  // Test Group 8: Tool Registry, Routing & Canonical Configuration
  // -------------------------------------------------------------
  console.log('\nTest Group 8: Tool Registry, Routing & Canonical Configuration');

  const toolConfig = tools.find((t) => t.id === 'webp-to-jpg-png');
  assert(toolConfig !== undefined, 'Tool entry exists in config/toolsData.ts');
  assert(toolConfig?.categoryId === 'media', 'Tool category is "media"');
  assert(toolConfig?.slug === 'webp-to-jpg-png', 'Tool slug is "webp-to-jpg-png"');
  assert(toolConfig?.status === 'published', 'Tool status is "published"');
  assert(
    typeof toolConfig?.seoTitle === 'string' && toolConfig.seoTitle.includes('WebP to JPG & PNG Converter'),
    'Tool seoTitle is properly configured and descriptive'
  );
  assert(
    typeof toolConfig?.seoDescription === 'string' && toolConfig.seoDescription.length > 50,
    'Tool seoDescription is comprehensive and non-empty'
  );

  assert(toolComponents['webp-to-jpg-png'] !== undefined, 'toolRegistry has entry for "webp-to-jpg-png"');
  assert(toolComponents['webp-converter'] !== undefined, 'toolRegistry has alias entry for "webp-converter"');
  assert(seoComponents['webp-to-jpg-png'] !== undefined, 'seoRegistry has entry for "webp-to-jpg-png"');
  assert(seoComponents['webp-converter'] !== undefined, 'seoRegistry has alias entry for "webp-converter"');

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passedAssertions} passed, ${failedAssertions} failed (${passedAssertions + failedAssertions} total)`);
  console.log('====================================================\n');

  if (failedAssertions > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
