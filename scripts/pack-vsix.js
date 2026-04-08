const fs = require('fs');
const cp = require('child_process');

fs.mkdirSync('out', { recursive: true });
const name = process.env.npm_package_name || 'extension';
const ver = process.env.npm_package_version || '0.0.0';
const outPath = `out/${name}-${ver}.vsix`;

console.log(`Packaging VSIX to ${outPath}`);
cp.execSync(`vsce package -o ${outPath}`, { stdio: 'inherit' });
