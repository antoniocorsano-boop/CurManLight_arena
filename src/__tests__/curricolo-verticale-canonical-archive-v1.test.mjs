import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  archiveCanonicalReleaseBytes,
  archiveCanonicalReleaseFile,
  inspectReleaseBytes,
  releaseSha256,
} from '../../scripts/archive-canonical-vertical-release-v1.mjs';

const temporary = [];

function tempFiles() {
  const dir = mkdtempSync(path.join(tmpdir(), 'arena-immutable-release-'));
  temporary.push(dir);
  return {
    input: path.join(dir, 'existing-qualified-release.json'),
    archiveDir: path.join(dir, 'primary-archive'),
  };
}

function releaseBytes() {
  return Buffer.from(JSON.stringify({
    contract: 'TRAMA_CURRICOLO_VERTICALE_RELEASE_V1',
    institutionId: 'ics-lorenzo-milani',
    schoolYearRef: '2026/2027',
    authority: { state: 'PROVISIONAL_COMPLETE' },
    sourceMaster: {
      masterId: 'CAN-CURR-MASTER-00',
      masterVersion: '1.3',
      revisionId: '27',
      curricoloVigente: false,
    },
    sourceSnapshot: { contentFootprint: { hash: 'original-source' } },
    structuralFootprint: { hash: 'original-structure' },
    manifest: { coverageStatus: 'SATISFIED', expected: Array.from({ length: 113 }, (_, i) => i) },
  }, null, 2) + '\n', 'utf8');
}

afterEach(() => {
  for (const dir of temporary.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('canonical release independent archive', () => {
  it('archives exact existing bytes without regenerating or overwriting them', async () => {
    const { input, archiveDir } = tempFiles();
    const bytes = releaseBytes();
    writeFileSync(input, bytes);
    const expectedSha256 = releaseSha256(bytes);
    const result = await archiveCanonicalReleaseFile({ inputPath: input, archiveDir, expectedSha256 });
    expect(readFileSync(result.releasePath).equals(bytes)).toBe(true);
    expect(readFileSync(input).equals(bytes)).toBe(true);
    expect(JSON.parse(readFileSync(result.receiptPath, 'utf8'))).toEqual(result.receipt);
    expect(result.receipt.sha256).toBe(expectedSha256);
    expect(result.receipt.scopeCount).toBe(113);
    expect(result.receipt.curricoloVigente).toBe(false);

    // Repeat safely: an identical release is reused, never replaced.
    const second = await archiveCanonicalReleaseFile({ inputPath: input, archiveDir, expectedSha256 });
    expect(second.releasePath).toBe(result.releasePath);
    expect(readFileSync(second.releasePath).equals(bytes)).toBe(true);
  });

  it('rejects altered source bytes against the original receipt', async () => {
    const { input, archiveDir } = tempFiles();
    const original = releaseBytes();
    const digest = releaseSha256(original);
    const changed = Buffer.from(original);
    changed[30] = changed[30] === 65 ? 66 : 65;
    writeFileSync(input, changed);
    await expect(archiveCanonicalReleaseFile({
      inputPath: input, archiveDir, expectedSha256: digest,
    })).rejects.toThrow(/SHA-256/);
  });

  it('fails closed on existing archive collision instead of silently repairing bytes', async () => {
    const { archiveDir } = tempFiles();
    const bytes = releaseBytes();
    const digest = releaseSha256(bytes);
    const entry = path.join(archiveDir, digest);
    mkdirSync(entry, { recursive: true });
    writeFileSync(path.join(entry, 'release.json'), 'tampered bytes');
    await expect(archiveCanonicalReleaseBytes({
      bytes, archiveDir, expectedSha256: digest,
    })).rejects.toThrow(/collision|tampered/);
    expect(readFileSync(path.join(entry, 'release.json'), 'utf8')).toBe('tampered bytes');
  });

  it('rejects a non-canonical or incorrectly approved release', () => {
    const bytes = releaseBytes();
    const changed = Buffer.from(bytes.toString().replace('"curricoloVigente": false', '"curricoloVigente": true'));
    expect(() => inspectReleaseBytes(changed, releaseSha256(changed))).toThrow(/non-canonical/);
  });

  it('never accepts an archive destination within the repository', async () => {
    const bytes = releaseBytes();
    await expect(archiveCanonicalReleaseBytes({
      bytes,
      archiveDir: path.resolve('scripts', 'should-never-create-archive'),
      expectedSha256: releaseSha256(bytes),
    })).rejects.toThrow(/outside the repository/);
  });
});
