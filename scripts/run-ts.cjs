const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let target = process.argv[2];
if (target && !fs.existsSync(target)) {
    const alt = target.replace(/test-parquet-viewer-1000-plus-suite\.ts$/, 'test_parquet_viewer_1000_plus_suite.ts');
    if (fs.existsSync(alt)) {
        target = alt;
    }
}

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = ['tsx', target, ...process.argv.slice(3)];
const res = spawnSync(npxCmd, args, {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '..'),
});

process.exit(res.status ?? 0);

