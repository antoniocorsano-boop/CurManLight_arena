import type { CurriculumMap } from '../../session';
import {
  adaptCurriculumKB,
  createCurriculumConsultationReadModel,
  getDisciplineDefinition,
  resolveDisciplineCode,
  type CurriculumConsultationItem,
  type CurriculumConsultationReadModel,
} from '../../../domain/curriculum';
import type { CanonicalCurriculumVersion, DisciplineCode } from '../../../domain/curriculum';
import type { SchoolOrder } from '../../../types/curriculum';

const LEGACY_PROJECTION_DATE = '2026-01-01T00:00:00.000Z';

export interface CurriculumDisciplineOption {
  legacyKey: string;
  code: DisciplineCode;
  label: string;
}

export interface CurriculumConsultationViewModel {
  model: CurriculumConsultationReadModel;
  version: CanonicalCurriculumVersion;
  schoolOrder: SchoolOrder;
  disciplineCode: DisciplineCode | undefined;
  items: CurriculumConsultationItem[];
  listItems: CurriculumConsultationItem[];
  treeItems: CurriculumConsultationItem[];
  evidenceItems: CurriculumConsultationItem[];
  selectedNode: CurriculumConsultationItem | undefined;
  disciplineOptions: CurriculumDisciplineOption[];
}

export function createCurriculumConsultationViewModel(
  localCurriculum: CurriculumMap,
  order: SchoolOrder,
  discipline: string,
  selectedNodeId?: string,
): CurriculumConsultationViewModel {
  const domain = adaptCurriculumKB(localCurriculum, LEGACY_PROJECTION_DATE);
  const model = createCurriculumConsultationReadModel(domain);
  const disciplineCode = resolveDisciplineCode(discipline);
  const items = model.query({ order, discipline: disciplineCode });
  const evidenceItems = model.query({ order, discipline: disciplineCode, nodeType: 'evidenza' });
  const selectedNode = selectedNodeId
    ? items.find(item => item.nodeId === selectedNodeId)
    : items[0];

  const disciplineOptions = Object.keys(localCurriculum)
    .map(legacyKey => {
      const code = resolveDisciplineCode(legacyKey);
      if (!code || !model.query({ order, discipline: code }).length) return undefined;
      return {
        legacyKey,
        code,
        label: getDisciplineDefinition(code)?.label ?? legacyKey,
      };
    })
    .filter((option): option is CurriculumDisciplineOption => Boolean(option));

  return {
    model,
    version: items[0]?.version ?? domain.versions.find(version => version.scope.schoolOrder === order) ?? domain.version,
    schoolOrder: order,
    disciplineCode,
    items,
    listItems: items,
    treeItems: items,
    evidenceItems,
    selectedNode,
    disciplineOptions,
  };
}
