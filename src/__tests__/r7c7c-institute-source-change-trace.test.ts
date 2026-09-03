import { describe, expect, it } from 'vitest';
import { INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3 } from '../domain/curriculum/institute/sourceReconstructionReadiness';
import { buildInstituteSourceChangeTrace } from '../domain/curriculum/institute/sourceChangeTrace';
import type { InstituteSourceReviewReceipt } from '../domain/curriculum/institute/sourceReviewQueue';

const SOURCE_SHA256 = INSTITUTE_CURRICULUM_SOURCE_RECONSTRUCTION_V3.sourceSha256;

function receipt(overrides: Partial<InstituteSourceReviewReceipt>): InstituteSourceReviewReceipt {
  return {
    schemaVersion: 'arena-institute-source-review-receipt-v1',
    sourceSha256: SOURCE_SHA256,
    taskId: 'CV-AUD-004-LATINO-SCOPE',
    findingId: 'CV-AUD-004',
    decision: 'SCOPE_SECOND_YEAR_AND_LATER',
    reviewerAttestation: true,
    reviewedAt: '2026-09-03T18:00:00.000Z',
    ...overrides,
  };
}

describe('R7C7C institute source change trace', () => {
  it('mantiene aperti i finding privi di decisione umana', () => {
    const trace = buildInstituteSourceChangeTrace([]);
    const latino = trace.find((entry) => entry.taskId === 'CV-AUD-004-LATINO-SCOPE');

    expect(trace).toHaveLength(7);
    expect(latino?.status).toBe('OPEN');
    expect(latino?.decision).toBe('Decisione umana non ancora registrata');
    expect(latino?.authorityEffect).toBe('NONE');
  });

  it('rende leggibile la decisione umana senza attribuirle autorità automatica', () => {
    const trace = buildInstituteSourceChangeTrace([receipt({})]);
    const latino = trace.find((entry) => entry.taskId === 'CV-AUD-004-LATINO-SCOPE');

    expect(latino?.status).toBe('RESOLVED');
    expect(latino?.decision).toBe('Latino/LEL dal secondo anno e successivi');
    expect(latino?.replacementSourceSha256).toBeNull();
    expect(latino?.authorityEffect).toBe('NONE');
  });

  it('espone nuova fonte e nota solo dopo una correzione verificata', () => {
    const correctedSha = 'a'.repeat(64);
    const trace = buildInstituteSourceChangeTrace([
      receipt({
        taskId: 'CV-AUD-002-MUSICA-RATIONALE',
        findingId: 'CV-AUD-002',
        decision: 'CORRECTED_SOURCE_VERSION_LINKED',
        replacementSourceSha256: correctedSha,
        notes: 'Sostituito il razionale duplicato con il testo specifico di Musica.',
      }),
    ]);
    const musica = trace.find((entry) => entry.taskId === 'CV-AUD-002-MUSICA-RATIONALE');

    expect(musica?.status).toBe('RESOLVED');
    expect(musica?.replacementSourceSha256).toBe(correctedSha);
    expect(musica?.correctionNote).toContain('Musica');
  });

  it('non trasforma una semplice presa in carico in una correzione', () => {
    const trace = buildInstituteSourceChangeTrace([
      receipt({
        taskId: 'CV-AUD-003-MOTORIA-RATIONALE',
        findingId: 'CV-AUD-003',
        decision: 'ACKNOWLEDGED_REQUIRES_CORRECTED_SOURCE',
      }),
    ]);
    const motoria = trace.find((entry) => entry.taskId === 'CV-AUD-003-MOTORIA-RATIONALE');

    expect(motoria?.status).toBe('ACKNOWLEDGED');
    expect(motoria?.replacementSourceSha256).toBeNull();
  });

  it('espone come conflitto due decisioni umane incompatibili sullo stesso task', () => {
    const trace = buildInstituteSourceChangeTrace([
      receipt({ reviewedAt: '2026-09-03T18:00:00.000Z' }),
      receipt({ decision: 'SCOPE_CLASS_ONE', reviewedAt: '2026-09-03T18:05:00.000Z' }),
    ]);
    const latino = trace.find((entry) => entry.taskId === 'CV-AUD-004-LATINO-SCOPE');

    expect(latino?.status).toBe('CONFLICT');
    expect(latino?.decision).toContain('conflitto');
    expect(latino?.replacementSourceSha256).toBeNull();
    expect(latino?.authorityEffect).toBe('NONE');
  });
});
