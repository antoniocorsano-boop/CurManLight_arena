import { describe, expect, it } from 'vitest';
import { createEmptyRevisionArchive } from '../domain/revision';
import { projectArenaRuntimeCurriculumV2 } from '../domain/transfer/interopRuntimeBindingV2';
import type { CurriculumMap } from '../features/session/types/appViewContracts';

const emptyLevel = () => ({
  traguardi: [],
  obiettivi: [],
  proposals: [],
  evidenze: [],
  nucleiFondanti: [],
});

const curriculumMap: CurriculumMap = {
  tecnologia: {
    infanzia: emptyLevel(),
    primaria: emptyLevel(),
    secondaria: {
      traguardi: ['Progettare soluzioni tecnologiche in modo consapevole.'],
      obiettivi: ['Analizzare materiali, processi e sistemi tecnologici.'],
      proposals: [],
      evidenze: ['Documentare il processo di progettazione.'],
      nucleiFondanti: ['Materiali e trasformazioni'],
    },
  },
};

const common = {
  institutionId: 'school-context-regression',
  schoolYearRef: '2026-2027',
  schoolOrder: 'secondaria' as const,
  classLevel: 1,
  disciplineRef: 'tecnologia',
  curriculumMap,
  revisionArchive: createEmptyRevisionArchive('2026-08-27T12:00:00.000Z'),
  emittedAt: '2026-08-27T12:30:00.000Z',
};

describe('Arena runtime context identity material', () => {
  it('supports a section-only planning context without canonicalizing undefined cohortRef', () => {
    const projection = projectArenaRuntimeCurriculumV2({
      ...common,
      sectionRef: 'A',
    });

    expect(projection.curricularContext.sectionRef).toBe('A');
    expect(projection.curricularContext.cohortRef).toBeUndefined();
    expect(projection.curricularContext.contextId).toMatch(/^ctx-[0-9a-f]{8}$/);
  });

  it('supports a cohort-only planning context without canonicalizing undefined sectionRef', () => {
    const projection = projectArenaRuntimeCurriculumV2({
      ...common,
      cohortRef: 'cohort-2026-A',
    });

    expect(projection.curricularContext.sectionRef).toBeUndefined();
    expect(projection.curricularContext.cohortRef).toBe('cohort-2026-A');
    expect(projection.curricularContext.contextId).toMatch(/^ctx-[0-9a-f]{8}$/);
  });

  it('produces distinct context identities for section and cohort scopes', () => {
    const section = projectArenaRuntimeCurriculumV2({ ...common, sectionRef: 'A' });
    const cohort = projectArenaRuntimeCurriculumV2({ ...common, cohortRef: 'cohort-2026-A' });

    expect(section.curricularContext.contextId).not.toBe(cohort.curricularContext.contextId);
  });
});

describe('Arena complete curriculum approval authority', () => {
  it('remains provisional when no explicit complete-curriculum approval evidence is supplied', () => {
    const projection = projectArenaRuntimeCurriculumV2({ ...common, sectionRef: 'A' });

    expect(projection.curricularContext.curriculumState).toBe('PROVISIONAL_COMPLETE');
    expect(projection.curricularContext.approvalDecisionRef).toBeUndefined();
    expect(projection.annualPlanningFramework.payload.constraints.map(item => item.id))
      .toContain('provisional-baseline-revalidation');
    expect(projection.annualPlanningFramework.provenance.humanConfirmed).toBe(false);
  });

  it('promotes only the same complete projected curriculum version when explicit approval evidence matches', () => {
    const provisional = projectArenaRuntimeCurriculumV2({ ...common, sectionRef: 'A' });
    const approvalDecisionRef = {
      namespace: 'curmanlight.arena',
      entityType: 'CompleteCurriculumApprovalDecision',
      entityId: 'decision-complete-2026-01',
      versionId: '1',
    } as const;

    const approved = projectArenaRuntimeCurriculumV2({
      ...common,
      sectionRef: 'A',
      completeCurriculumApproval: {
        approvalDecisionRef,
        curriculumRef: provisional.curricularContext.curriculumRef,
        curriculumVersionRef: provisional.curricularContext.curriculumVersionRef,
        approvedAt: '2026-08-28T10:00:00.000Z',
      },
    });

    expect(approved.curricularContext.curriculumState).toBe('APPROVED');
    expect(approved.curricularContext.approvalDecisionRef).toEqual(approvalDecisionRef);
    expect(approved.curricularContext.curriculumVersionRef)
      .toEqual(provisional.curricularContext.curriculumVersionRef);
    expect(approved.curricularContext.contextId).not.toBe(provisional.curricularContext.contextId);
    expect(approved.annualPlanningFramework.payload.constraints.map(item => item.id))
      .not.toContain('provisional-baseline-revalidation');
    expect(approved.annualPlanningFramework.provenance.humanConfirmed).toBe(true);
    expect(approved.curricularContext.sourceRefs).toContainEqual(approvalDecisionRef);
  });

  it('fails closed when approval evidence targets another curriculum version', () => {
    const provisional = projectArenaRuntimeCurriculumV2({ ...common, sectionRef: 'A' });

    expect(() => projectArenaRuntimeCurriculumV2({
      ...common,
      sectionRef: 'A',
      completeCurriculumApproval: {
        approvalDecisionRef: {
          namespace: 'curmanlight.arena',
          entityType: 'CompleteCurriculumApprovalDecision',
          entityId: 'decision-wrong-version',
        },
        curriculumRef: provisional.curricularContext.curriculumRef,
        curriculumVersionRef: {
          ...provisional.curricularContext.curriculumVersionRef,
          versionId: 'different-version',
        },
        approvedAt: '2026-08-28T10:00:00.000Z',
      },
    })).toThrow('does not match the projected curriculumVersionRef');
  });

  it('fails closed when approval evidence targets another curriculum identity', () => {
    const provisional = projectArenaRuntimeCurriculumV2({ ...common, sectionRef: 'A' });

    expect(() => projectArenaRuntimeCurriculumV2({
      ...common,
      sectionRef: 'A',
      completeCurriculumApproval: {
        approvalDecisionRef: {
          namespace: 'curmanlight.arena',
          entityType: 'CompleteCurriculumApprovalDecision',
          entityId: 'decision-wrong-curriculum',
        },
        curriculumRef: {
          ...provisional.curricularContext.curriculumRef,
          entityId: 'another-institute-curriculum',
        },
        curriculumVersionRef: provisional.curricularContext.curriculumVersionRef,
        approvedAt: '2026-08-28T10:00:00.000Z',
      },
    })).toThrow('does not match the projected curriculumRef');
  });
});
