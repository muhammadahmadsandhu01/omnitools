import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const ROOT_DIR = process.cwd();
const OUTPUT_ZIP_IN_REPO = path.join(ROOT_DIR, 'kivarotools-clean.zip');
const OUTPUT_ZIP_OUTSIDE = path.join(path.dirname(ROOT_DIR), 'kivarotools-clean.zip');

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'scratch',
  '.cloudflare',
  '.vinext',
  '.vercel',
  '.kilo',
  'test-results',
]);

const EXCLUDED_EXTENSIONS = new Set(['.zip', '.tar', '.gz', '.tgz']);

function shouldIncludePath(relPath) {
  const parts = relPath.split(path.sep);
  for (const part of parts) {
    if (EXCLUDED_DIRS.has(part)) {
      return false;
    }
  }
  const ext = path.extname(relPath).toLowerCase();
  if (EXCLUDED_EXTENSIONS.has(ext)) {
    return false;
  }
  return true;
}

function collectFiles(dir, baseDir) {
  let fileList = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name) && shouldIncludePath(relPath)) {
        fileList = fileList.concat(collectFiles(fullPath, baseDir));
      }
    } else if (entry.isFile()) {
      if (shouldIncludePath(relPath)) {
        fileList.push({ fullPath, relPath });
      }
    }
  }

  return fileList;
}

async function main() {
  console.log('====================================================');
  console.log('KIVAROTOOLS — CLEAN PROJECT ZIP ARCHIVER');
  console.log('====================================================');
  console.log(`Scanning project root: ${ROOT_DIR}`);

  const files = collectFiles(ROOT_DIR, ROOT_DIR);
  console.log(`Found ${files.length} clean source files to bundle.`);

  const zip = new JSZip();
  let totalRawBytes = 0;

  for (const file of files) {
    const content = fs.readFileSync(file.fullPath);
    totalRawBytes += content.length;
    // Normalize path separators to forward slashes for cross-platform ZIP standard
    const zipPath = file.relPath.split(path.sep).join('/');
    zip.file(zipPath, content);
  }

  console.log(`Uncompressed payload size: ${(totalRawBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log('Compressing with DEFLATE level 9...');

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const zipSizeMB = (zipBuffer.length / (1024 * 1024)).toFixed(2);
  const zipSizeKB = (zipBuffer.length / 1024).toFixed(1);
  console.log(`Compressed archive size: ${zipSizeMB} MB (${zipSizeKB} KB)`);

  // Write inside repo root
  fs.writeFileSync(OUTPUT_ZIP_IN_REPO, zipBuffer);
  console.log(`[SUCCESS] Saved inside repo: ${OUTPUT_ZIP_IN_REPO}`);

  // Write outside repo (D:\kivarotools-clean.zip) for extra convenience
  try {
    fs.writeFileSync(OUTPUT_ZIP_OUTSIDE, zipBuffer);
    console.log(`[SUCCESS] Saved in parent drive: ${OUTPUT_ZIP_OUTSIDE}`);
  } catch (err) {
    console.warn(`Note: Could not write to ${OUTPUT_ZIP_OUTSIDE}: ${err.message}`);
  }

  // Integrity Verification
  console.log('\n--- Verifying ZIP Integrity ---');
  const verifyZip = await JSZip.loadAsync(zipBuffer);
  const entryCount = Object.keys(verifyZip.files).length;
  console.log(`Verified ${entryCount} entries in generated ZIP archive.`);

  // Check that NO excluded folders exist in archive
  const forbidden = Object.keys(verifyZip.files).filter((name) =>
    ['node_modules/', '.next/', '.git/', 'dist/', 'build/', 'scratch/'].some((f) =>
      name.startsWith(f)
    )
  );

  if (forbidden.length === 0) {
    console.log('[VERIFIED] 0 forbidden folders found. Clean archive verified 100%!');
  } else {
    console.error(`[ERROR] Found ${forbidden.length} forbidden entries:`, forbidden.slice(0, 5));
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('ZIP CREATION COMPLETED SUCCESSFULLY!');
  console.log(`File: ${OUTPUT_ZIP_IN_REPO}`);
  console.log(`Size: ${zipSizeMB} MB`);
  console.log(`Total Files: ${files.length}`);
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Fatal error creating zip:', err);
  process.exit(1);
});
