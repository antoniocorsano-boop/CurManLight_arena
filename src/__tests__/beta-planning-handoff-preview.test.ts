import { describe, expect, it } from 'vitest';
import type { A07InstitutionalDocumentRead } from '../domain/institution';
import { createEmptyRevisionArchive } from '../domain/revision';
import type { CurriculumMap } from '../features/session/types/appViewContracts';
import { buildPlanningHandoffPreview } from '../features/beta/planningHandoffPreview';

const emptyLevel = () => ({
  traguardi: [],
  obiettivi: [],
  proposte: undefined,
  proposals: [],
  evidenze: [],
  nucleiFondanti: [],
});

function curriculumMap(): CurriculumMap {
  return {
    tecnologia: {
      infanzia: emptyLevel(),
      primaria: emptyLevel(),
      secondaria: {
        traguardi: ['Progettare soluzioni tecnologiche in modo consapevole.'],
        obiettivi: ['Analizzare materiali, processi e sistemi tecnologici.'],
        evidenze: ['Documentare il processo di progettazione.'],
        nucleiFondanti: ['Materiali e trasformazioni'],
        proposals: [],
      },
    },
  };
}

const configuredProfile: A07InstitutionalDocumentRead = {
  configured: true,
  instituteName: 'Istituto Beta',
  organizationId: 'institute-beta',
  academicYearLabel: '2026/2027',
};

function baseInput() {
  return {
    institutionalProfile: configuredProfile,
    schoolYear: '2026-2027',
    schoolOrder: 'secondaria' as const,
    classLevel: 1,
    sectionRef: 'A',
    disciplineRef: 'tecnologia',
    curriculumMap: curriculumMap(),
    revisionArchive: createEmptyRevisionArchive('2026-08-27T12:00:00.000Z'),
    emittedAt: '2026-08-27T12:30:00.000Z',
  };
}

function requireReady(preview: ReturnType<typeof buildPlanningHandoffPreview>) {
  if (preview.status === 'blocked') {
    throw new Error(`Expected ready B3 planning handoff preview: ${preview.reason}`);
  }
  return preview;
}

describe('B3 planning handoff preview', () => {
  it('builds a valid preview-only handoff from the current Arena baseline', () => {
    const preview = requireReady(buildPlanningHandoffPreview(baseInput()));

    expect(preview.valid).toBe(true);
    expect(preview.validationErrors).toEqual([]);
    expect(preview.handoff.format).toBe('CML_LOCAL_HANDOFF_V2');
    expect(preview.handoff.targetProduct).toBe('DOCENTE_OS');
    expect(preview.handoff.importMode).toBe('PREVIEW_ONLY');
    expect(preview.handoff.acceptanceRequired).toBe(true);
    expect(preview.handoff.curricularContext.completeForPlanning).toBe(true);
    expect(preview.mandatoryRequirements).toBeGreaterThan(0);
  });

  it('keeps the resulting curriculum baseline provisional and does not invent institutional approval', () => {
    const preview = requireReady(buildPlanningHandoffPreview(baseInput()));

    expect(preview.handoff.curricularContext.curriculumState).toBe('PROVISIONAL_COMPLETE');
    expect(preview.handoff.curricularContext.approvalDecisionRef).toBeUndefined();
    expect(preview.handoff.annualPlanningFramework.provenance.humanConfirmed).toBe(false);
    expect(preview.handoff.annualPlanningFramework.payload.constraints.some(
      constraint => constraint.id === 'provisional-baseline-revalidation',
    )).toBe(true);
  });

  it('blocks the preview when Arena has no configured institutional identity', () => {
    const preview = buildPlanningHandoffPreview({
      ...baseInput(),
      institutionalProfile: {
        configured: false,
        instituteName: 'Istituto non configurato',
        organizationId: 'curmanlight-local',
      },
    });

    expect(preview.status).toBe('blocked');
    if (preview.status !== 'blocked') return;
    expect(preview.reason).toContain('Configura prima l’istituto');
  });

  it('blocks malformed class context rather than silently creating a generic handoff', () => {
    const invalidClass = buildPlanningHandoffPreview({ ...baseInput(), classLevel: Number.NaN });
    const invalidSection = buildPlanningHandoffPreview({ ...baseInput(), sectionRef: '   ' });

    expect(invalidClass.status).toBe('blocked');
    expect(invalidSection.status).toBe('blocked');
  });
});
