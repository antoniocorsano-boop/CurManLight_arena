import { spawnSync } from 'node:child_process';
import { hash } from 'node:crypto';
import { mkdtempSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  validateCurricoloVerticaleCompleteReleaseV1,
} from '../domain/transfer/curricoloVerticaleCompleteReleaseV1';
import { buildMasterFixture } from './fixtures/curricoloVerticaleMasterFixture';

const SCRIPT = path.resolve('scripts/emit-canonical-vertical-release-v1.mjs');
const directories = [];

function workspace() {
  const directory = mkdtempSync(path.join(tmpdir(), 'arena-canonical-vertical-release-'));
  directories.push(directory);
  const input = path.join(directory, 'master.txt');
  const output = path.join(directory, 'release.json');
  const archiveDir = path.join(directory, 'independent-primary-archive');
  writeFileSync(input, buildMasterFixture(), 'utf8');
  return { directory, input, output, archiveDir };
}

function run({ input, output, archiveDir }, extras = []) {
  return spawnSync(process.execPath, [
    SCRIPT,
    '--input', input,
    '--output', output,
    '--archive-dir', archiveDir,
    '--revision-id', '27',
    '--institution-id', 'ics-lorenzo-milani',
    ...extras,
  ], { encoding: 'utf8' });
}

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('canonical release CLI without publishing master text', () => {
  it('requires explicit target identity before writing any release', () => {
    const ws = workspace();
    const res = run(ws);
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/target-institution-id/i);
    expect(existsSync(ws.output)).toBe(false);
  });

  it('refuses a source input file placed inside the GitHub repository', () => {
    const ws = workspace();
    const res = run({
      input: path.resolve('src/__tests__/fixtures/curricoloVerticaleMasterFixture.ts'),
      output: ws.output,
      archiveDir: ws.archiveDir,
    }, ['--target-institution-id', 'ics-lorenzo-milani']);
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/canonical source input.*outside the repository/i);
    expect(existsSync(ws.output)).toBe(false);
  });

  it('rejects identity alias mismatch before creating an output file', () => {
    const ws = workspace();
    const res = run(ws, ['--target-institution-id', 'ic-calvario-covotta-don-milani']);
    expect(res.status).not.toBe(0);
    expect(res.stderr).toMatch(/institution|identity|target/i);
    expect(existsSync(ws.output)).toBe(false);
  });

  it('emits a validated 113-scope provisional release when identity matches', () => {
    const ws = workspace();
    const res = run(ws, ['--target-institution-id', 'ics-lorenzo-milani']);
    expect(res.status, res.stderr).toBe(0);
    expect(existsSync(ws.output)).toBe(true);

    const release = JSON.parse(readFileSync(ws.output, 'utf8'));
    const receipt = JSON.parse(res.stdout.trim());
    expect(validateCurricoloVerticaleCompleteReleaseV1(release)).toEqual({ valid: true, errors: [] });
    expect(receipt.status).toBe('PROVISIONAL_RELEASE_EMITTED');
    expect(receipt.archiveStatus).toBe('IMMUTABLE_PRIMARY_VERIFIED');
    expect(receipt.driveBackupStatus).toBe('OPTIONAL_NOT_CONFIRMED');
    const releaseBytes = readFileSync(ws.output);
    const digest = hash('sha256', releaseBytes, 'hex');
    expect(receipt.sha256).toBe(digest);
    expect(receipt.bytes).toBe(releaseBytes.byteLength);
    const stored = readFileSync(path.join(ws.archiveDir, digest, 'release.json'));
    expect(stored.equals(releaseBytes)).toBe(true);
    const archiveReceipt = JSON.parse(readFileSync(path.join(ws.archiveDir, digest, 'receipt.json'), 'utf8'));
    expect(archiveReceipt.sha256).toBe(digest);
    expect(archiveReceipt.scopeCount).toBe(113);
    expect(receipt.sourceRevisionId).toBe('27');
    expect(receipt.authorityState).toBe('PROVISIONAL_COMPLETE');
    expect(receipt.expectedScopes).toBe(113);
    expect(receipt.sourceContentFootprint).toBe(release.sourceSnapshot.contentFootprint.hash);
    expect(receipt.structuralFootprint).toBe(release.structuralFootprint.hash);
    expect(release.sourceSnapshot.content).toBe(buildMasterFixture());
    expect(release.sourceMaster.curricoloVigente).toBe(false);
    expect(res.stdout).not.toContain('CAN-CURR-MASTER-00 —');
  });

  it('fails closed rather than overwriting an existing output', () => {
    const ws = workspace();
    writeFileSync(ws.output, 'preexisting', 'utf8');
    const res = run(ws, ['--target-institution-id', 'ics-lorenzo-milani']);
    expect(res.status).not.toBe(0);
    expect(readFileSync(ws.output, 'utf8')).toBe('preexisting');
  });
});
