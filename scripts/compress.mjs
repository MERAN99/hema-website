// Writes .br and .gz copies of the built JS/CSS/SVG next to the originals. The server's own on-the-fly
// compression isn't available, so public/.htaccess serves these pre-compressed files when the browser accepts them.
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
let before = 0;
let after = 0;
for (const file of walk('dist').filter((f) => /\.(js|css|svg)$/.test(f))) {
  const data = readFileSync(file);
  const br = brotliCompressSync(data, { params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: data.length } });
  writeFileSync(`${file}.br`, br);
  writeFileSync(`${file}.gz`, gzipSync(data, { level: 9 }));
  before += data.length;
  after += br.length;
}
console.log(`compressed JS/CSS: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB (brotli)`);
