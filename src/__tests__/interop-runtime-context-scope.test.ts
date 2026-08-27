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
