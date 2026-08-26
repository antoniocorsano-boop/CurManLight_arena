import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDir = resolve('dist');
const indexPath = resolve(distDir, 'index.html');
const fallbackPath = resolve(distDir, '404.html');
const manifestPath = resolve(distDir, 'beta-release.json');

await readFile(indexPath, 'utf8');
await copyFile(indexPath, fallbackPath);

const releaseSha = process.env.CML_RELEASE_SHA ?? 'LOCAL_UNSET';
const sourceRef = process.env.CML_RELEASE_REF ?? 'local';
const builtAt = new Date().toISOString();

const manifest = {
  schema: 'CML_BETA_RELEASE_V1',
  product: 'CurManLight Arena',
  channel: 'beta',
  releaseSha,
  sourceRef,
  builtAt,
  repository: 'antoniocorsano-boop/CurManLight_arena',
  basePath: '/CurManLight_arena/',
  rollback: {
    strategy: 'redeploy-known-good-ref',
    supported: true
  }
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`BETA_RELEASE_PREPARED ${releaseSha}`);
