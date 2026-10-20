import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { validateCurricoloVerticaleArtifactV1 } from '../domain/transfer/curricoloVerticaleArtifactV1';
import { buildMasterFixture } from './fixtures/curricoloVerticaleMasterFixture';

const SCRIPT = path.resolve('scripts/materialize-canonical-curricolo-v1.mjs');
const temporaryDirectories = [];

function workspace() {
  const directory = mkdtempSync(path.join(tmpdir(), 'arena-curricolo-artifact-'));
  temporaryDirectories.push(directory);
  const input = path.join(directory, 'master.txt');
  writeFileSync(input, buildMasterFixture(), 'utf8');
  return { directory, input };
}

function runGenerator(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('canonical curricolo artifact generator v1', () => {
  it('requires an explicit revision id', () => {
    const { directory, input } = workspace();
    const output = path.join(directory, 'artifact.json');
    const result = runGenerator(['--input', input, '--output', output]);

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(/revision-id/i);
  });

  it('generates byte-identical output twice from the same input', () => {
    const { directory, input } = workspace();
    const first = path.join(directory, 'artifact-a.json');
    const second = path.join(directory, 'artifact-b.json');

    const firstRun = runGenerator(['--input', input, '--revision-id', '27', '--output', first]);
    const secondRun = runGenerator(['--input', input, '--revision-id', '27', '--output', second]);

    expect(firstRun.status, firstRun.stderr).toBe(0);
    expect(secondRun.status, secondRun.stderr).toBe(0);
    expect(readFileSync(first, 'utf8')).toBe(readFileSync(second, 'utf8'));
  });

  it('writes a valid 113-scope artifact without computedAt', () => {
    const { directory, input } = workspace();
    const output = path.join(directory, 'artifact.json');
    const result = runGenerator(['--input', input, '--revision-id', '27', '--output', output]);

    expect(result.status, result.stderr).toBe(0);
    const serialized = readFileSync(output, 'utf8');
    const artifact = JSON.parse(serialized);
    const validation = validateCurricoloVerticaleArtifactV1(artifact);

    expect(validation).toEqual({ valid: true, errors: [] });
    expect(serialized).not.toContain('computedAt');
    expect(artifact.source.revisionId).toBe('27');
    expect(artifact.materialization.segments).toHaveLength(113);
    expect(artifact.materialization.perimeter.expected).toHaveLength(113);
  });
});
