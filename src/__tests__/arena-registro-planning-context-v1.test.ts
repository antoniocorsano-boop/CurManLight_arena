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

const negativeCorpusSource = firstSource(import.meta.glob('../../docs/contracts/fixtures/arena-registro-planning-context-v1-negative-corpus.json', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const handoffSource = firstSource(import.meta.glob('../../docs/architecture/ARENA_REGISTRO_PLANNING_HANDOFF_V1.md', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

const validatorSource = firstSource(import.meta.glob('../../scripts/validate-registro-planning-context.mjs', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>);

type Mutation = {
  op: 'set' | 'delete';
  path: string[];
  value?: unknown;
};

type NegativeCorpus = {
  contract: string;
  corpusVersion: number;
  base: Record<string, unknown>;
  cases: Array<{ id: string; mutations: Mutation[] }>;
};

type ContractValidator = (value: Record<string, unknown>) => string[];

function materializeCase(base: Record<string, unknown>, mutations: Mutation[]): Record<string, unknown> {
  const candidate = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
  for (const mutation of mutations) {
    let cursor: Record<string, unknown> | unknown[] = candidate;
    for (let index = 0; index < mutation.path.length - 1; index += 1) {
      const key = mutation.path[index];
      const next = Array.isArray(cursor) ? cursor[Number(key)] : cursor[key];
      if (!next || typeof next !== 'object') throw new Error(`Invalid corpus mutation path: ${mutation.path.join('.')}`);
      cursor = next as Record<string, unknown> | unknown[];
    }
    const key = mutation.path[mutation.path.length - 1];
    if (Array.isArray(cursor)) {
      const index = Number(key);
      if (mutation.op === 'set') cursor[index] = mutation.value;
      else delete cursor[index];
    } else if (mutation.op === 'set') {
      cursor[key] = mutation.value;
    } else {
      delete cursor[key];
    }
  }
  return candidate;
}

function executableValidator(source: string): ContractValidator {
  const start = source.indexOf("export const CONTRACT = 'ARENA_REGISTRO_PLANNING_CONTEXT_V1';");
  const end = source.indexOf('\nasync function main');
  if (start < 0 || end <= start) throw new Error('Unable to isolate Arena planning-context validator');

  const executable = source
    .slice(start, end)
    .replace('export const CONTRACT', 'const CONTRACT')
    .replace('export function validateRegistroPlanningContext', 'function validateRegistroPlanningContext');

  const factory = new Function(`${executable}\nreturn validateRegistroPlanningContext;`) as () => ContractValidator;
  return factory();
}

describe('EDU-PLAN-01B Arena → Registro planning context v1', () => {
  test('materializes a dedicated Registro Docente contract without repurposing the existing v1 downstream snapshot', () => {
    expect(schemaSource).not.toBe('');
    const schema = JSON.parse(schemaSource) as Record<string, any>;
    expect(schema.$id).toContain('ARENA_REGISTRO_PLANNING_CONTEXT_V1');
    expect(schema.additionalProperties).toBe(false);
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

  test('keeps schema authority semantics and the executable validator aligned on the shared negative corpus', () => {
    expect(negativeCorpusSource).not.toBe('');
    const schema = JSON.parse(schemaSource) as Record<string, any>;
    const corpus = JSON.parse(negativeCorpusSource) as NegativeCorpus;
    const validate = executableValidator(validatorSource);

    expect(corpus.contract).toBe('ARENA_REGISTRO_PLANNING_CONTEXT_V1');
    expect(corpus.corpusVersion).toBe(1);
    expect(validate(corpus.base)).toEqual([]);

    expect(schema.properties.structuralFingerprint.additionalProperties).toBe(false);
    expect(schema.properties.structuralFingerprint.properties.algorithm.const).toBe('fnv1a');
    expect(schema.properties.structuralFingerprint.properties.version.const).toBe(1);
    expect(schema.properties.structuralFingerprint.properties.hash.pattern).toBe('^[0-9a-f]{8}$');
    expect(schema.properties.provenance.additionalProperties).toBe(false);
    expect(schema.properties.provenance.properties.repository.const).toBe('antoniocorsano-boop/CurManLight_arena');
    expect(schema.properties.provenance.properties.sourceCommit.pattern).toBe('^[0-9a-f]{40}$');
    expect(schema.properties.curricoloItems.items.additionalProperties).toBe(false);
    expect(schema.properties.curricoloItems.items.properties.kind.const).toBe('ANNUALITA_DISCIPLINARE');

    const vigenteRule = (schema.allOf as Array<Record<string, any>>).find(rule => rule?.if?.properties?.vigencyStatus?.const === 'VIGENTE');
    expect(vigenteRule?.then?.properties?.authorityState?.const).toBe('APPROVED');
    expect(vigenteRule?.then?.properties?.authorityReceiptRef).toEqual({ type: 'string', minLength: 1 });
    expect(vigenteRule?.then?.required).toContain('authorityReceiptRef');

    const acceptedNegativeCases = corpus.cases
      .filter(testCase => validate(materializeCase(corpus.base, testCase.mutations)).length === 0)
      .map(testCase => testCase.id);
    expect(acceptedNegativeCases).toEqual([]);
  });
});
