import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PRODUCT_ROOT = path.resolve(process.cwd(), 'src');
const FORBIDDEN_AUTOMATION_SIGNAL = 'navigator' + '.webdriver';

const collectProductFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') return [];
      return collectProductFiles(absolute);
    }
    if (!entry.isFile()) return [];
    if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) return [];
    if (/\.(test|spec)\./.test(entry.name)) return [];
    return [absolute];
  });
};

describe('M4-S2 browser-human parity', () => {
  it('keeps automation detection out of product runtime', () => {
    const offenders = collectProductFiles(PRODUCT_ROOT)
      .filter((file) => fs.readFileSync(file, 'utf8').includes(FORBIDDEN_AUTOMATION_SIGNAL))
      .map((file) => path.relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });
});
