import { copyFile, mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(process.argv[2] ?? process.cwd());
const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, 'hcm.config.example.json');
const target = resolve(root, '.human', 'hcm.config.json');

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

await mkdir(resolve(root, '.human'), { recursive: true });

if (await exists(target)) {
  console.log(`HCM_INIT_SKIP ${target}`);
  process.exit(0);
}

await copyFile(source, target);
console.log(`HCM_INIT_CREATED ${target}`);
console.log('Edit product.id, locale, roles and terminology policy, then run:');
console.log('node tools/human-communication-model/validate.mjs .');
