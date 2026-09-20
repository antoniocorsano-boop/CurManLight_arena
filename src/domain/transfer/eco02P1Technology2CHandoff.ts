import { curriculumKB } from '../../data/curriculumKB';
import { createEmptyRevisionArchive } from '../revision';
import type { CurriculumMap } from '../../features/session/types/appViewContracts';
import { createCmlLocalHandoffV2FromArenaRuntime } from './interopRuntimeBindingV2';
import { validateCmlLocalHandoffV2 } from './interopCurriculumContextV2';

export const ECO02_P1_TECHNOLOGY_2C_HANDOFF_GENERATED_AT = '2026-09-20T19:20:00.000Z';

export const ECO02_P1_TECHNOLOGY_2C_HANDOFF = createCmlLocalHandoffV2FromArenaRuntime({
  institutionId: 'curmanlight-local',
  schoolYearRef: '2026-2027',
  schoolOrder: 'secondaria',
  classLevel: 2,
  sectionRef: '2C',
  disciplineRef: 'tecnologia',
  curriculumMap: curriculumKB as unknown as CurriculumMap,
  revisionArchive: createEmptyRevisionArchive('1970-01-01T00:00:00.000Z'),
  sourceVersion: 'arena-eco02-p1-2c-provisional',
  emittedAt: ECO02_P1_TECHNOLOGY_2C_HANDOFF_GENERATED_AT,
});

const validation = validateCmlLocalHandoffV2(ECO02_P1_TECHNOLOGY_2C_HANDOFF);
if (!validation.valid) {
  throw new Error(`ECO-02/P1 Technology 2C handoff is invalid: ${validation.errors.join('; ')}`);
}
