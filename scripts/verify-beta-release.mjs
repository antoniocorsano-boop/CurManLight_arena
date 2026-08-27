import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDir = resolve('dist');
const indexHtml = await readFile(resolve(distDir, 'index.html'), 'utf8');
const fallbackHtml = await readFile(resolve(distDir, '404.html'), 'utf8');
const manifest = JSON.parse(await readFile(resolve(distDir, 'beta-release.json'), 'utf8'));

const errors = [];

if (indexHtml !== fallbackHtml) {
  errors.push('404.html must be byte-identical to index.html for BrowserRouter deep-link recovery');
}
if (manifest.schema !== 'CML_BETA_RELEASE_V1') errors.push('invalid release schema');
if (manifest.channel !== 'beta') errors.push('release channel must be beta');
if (manifest.basePath !== '/CurManLight_arena/') errors.push('unexpected Beta base path');
if (manifest.rollback?.strategy !== 'redeploy-known-good-ref' || manifest.rollback?.supported !== true) {
  errors.push('rollback contract missing');
}
if (!/^[0-9a-f]{40}$/i.test(manifest.releaseSha)) {
  errors.push('releaseSha must be an immutable 40-character Git SHA');
}

if (errors.length > 0) {
  for (const error of errors) console.error(`FAIL ${error}`);
  console.error(`BETA_RELEASE_CONTRACT_FAIL (${errors.length})`);
  process.exit(1);
}

console.log(`BETA_RELEASE_CONTRACT_PASS ${manifest.releaseSha}`);
