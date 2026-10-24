import { describe, expect, test } from 'vitest';

function firstSource(modules: Record<string, string>): string {
  return Object.values(modules)[0] ?? '';
}

const schemaSource = firstSource(import.meta.glob('../../docs/contracts/ARENA_REGISTRO_PLANNING_CONTEXT_V1.schema.json', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const fixtureSource = firstSource(import.meta.glob('../../docs/contracts/fixtures/arena-registro-planning-context-tech-grade1.json', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const handoffSource = firstSource(import.meta.glob('../../docs/architecture/ARENA_REGISTRO_PLANNING_HANDOFF_V1.md', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const validatorSource = firstSource(import.meta.glob('../../scripts/validate-registro-planning-context.mjs', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

describe('EDU-PLAN-01B Arena → Registro planning context v1', () => {
  test('materializes a dedicated Registro Docente contract without repurposing the existing v1 downstream snapshot', () => {
    expect(schemaSource).not.toBe('');
    const schema = JSON.parse(schemaSource) as Record<string, any>;
    expect(schema.$id).toContain('ARENA_REGISTRO_PLANNING_CONTEXT_V1');
    expect(schema.properties.targetProduct.const).toBe('REGISTRO_DOCENTE');
    expect(schema.properties.importMode.const).toBe('PREVIEW_ONLY');
    expect(schema.properties.acceptanceRequired.const).toBe(true);
    expect(schema.properties.automaticWriteAllowed.const).toBe(false);
  });

  test('publishes a grade-I Technology fixture with visible authority and cohort applicability', () => {
    expect(fixtureSource).not.toBe('');
    const fixture = JSON.parse(fixtureSource) as Record<string, any>;
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
    expect(handoffSource).not.toBe('');
    expect(handoffSource).toContain('Arena');
    expect(handoffSource).toContain('autorità curricolare');
    expect(handoffSource).toContain('NON_VIGENTE');
    expect(handoffSource).toContain('PREVIEW_ONLY');
    expect(handoffSource).toContain('acceptanceRequired');
    expect(handoffSource).toContain('automaticWriteAllowed');
    expect(handoffSource).toContain('fail-closed');
  });

  test('ships a dedicated validator with fail-closed authority checks', () => {
    expect(validatorSource).not.toBe('');
    expect(validatorSource).toContain('ARENA_REGISTRO_PLANNING_CONTEXT_V1');
    expect(validatorSource).toContain('REGISTRO_DOCENTE');
    expect(validatorSource).toContain('PROVISIONAL_COMPLETE');
    expect(validatorSource).toContain('NON_VIGENTE');
    expect(validatorSource).toContain('PASS');
  });
});
