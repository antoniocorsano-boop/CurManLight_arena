import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const schemaPath = resolve(root, 'docs/contracts/ARENA_REGISTRO_PLANNING_CONTEXT_V1.schema.json');
const fixturePath = resolve(root, 'docs/contracts/fixtures/arena-registro-planning-context-tech-grade1.json');
const handoffPath = resolve(root, 'docs/architecture/ARENA_REGISTRO_PLANNING_HANDOFF_V1.md');
const validatorPath = resolve(root, 'scripts/validate-registro-planning-context.mjs');

const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8')) as Record<string, any>;

describe('EDU-PLAN-01B Arena → Registro planning context v1', () => {
  test('materializes a dedicated Registro Docente contract without repurposing the existing v1 downstream snapshot', () => {
    expect(existsSync(schemaPath)).toBe(true);
    const schema = readJson(schemaPath);
    expect(schema.$id).toContain('ARENA_REGISTRO_PLANNING_CONTEXT_V1');
    expect(schema.properties.targetProduct.const).toBe('REGISTRO_DOCENTE');
    expect(schema.properties.importMode.const).toBe('PREVIEW_ONLY');
    expect(schema.properties.acceptanceRequired.const).toBe(true);
    expect(schema.properties.automaticWriteAllowed.const).toBe(false);
  });

  test('publishes a grade-I Technology fixture with visible authority and cohort applicability', () => {
    expect(existsSync(fixturePath)).toBe(true);
    const fixture = readJson(fixturePath);
    expect(fixture.targetProduct).toBe('REGISTRO_DOCENTE');
    expect(fixture.subjectCode).toBe('tecnologia');
    expect(fixture.gradeLevel).toBe(1);
    expect(fixture.schoolYear).toBe('2026/27');
    expect(fixture.authorityState).toMatch(/^(APPROVED|PROVISIONAL_COMPLETE)$/);
    expect(fixture.vigencyStatus).toMatch(/^(VIGENTE|NON_VIGENTE)$/);
    expect(fixture.cohortRef).toBeTruthy();
    expect(fixture.normativeRegime).toBeTruthy();
    expect(fixture.curricoloItems.length).toBeGreaterThan(0);
  });

  test('documents Arena authority and fail-closed downstream semantics', () => {
    expect(existsSync(handoffPath)).toBe(true);
    const doc = readFileSync(handoffPath, 'utf8');
    expect(doc).toContain('Arena');
    expect(doc).toContain('autorità curricolare');
    expect(doc).toContain('NON_VIGENTE');
    expect(doc).toContain('PREVIEW_ONLY');
    expect(doc).toContain('acceptanceRequired');
    expect(doc).toContain('automaticWriteAllowed');
    expect(doc).toContain('fail-closed');
  });

  test('validates the canonical fixture with the dedicated validator', () => {
    expect(existsSync(validatorPath)).toBe(true);
    const output = execFileSync(process.execPath, [validatorPath, fixturePath], { encoding: 'utf8' });
    expect(output).toContain('PASS');
  });
});
