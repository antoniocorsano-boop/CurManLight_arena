import type {
  DidacticBinding,
  DidacticBindingTarget,
  SchoolOrder,
} from '../../types/curriculum';
import { INSTITUTE_CURRICULUM_CURRENT_SOURCE } from './institute/currentSource';

export interface BuildDidacticBindingInput {
  targetType: DidacticBindingTarget;
  order: SchoolOrder;
  targetClass: string;
  disciplineOrField: string;
  createdAt?: string;
}

const normalizeKeyPart = (value: string): string => value
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'non-specificato';

export function resolveCurriculumClassOrAgeBand(order: SchoolOrder, targetClass: string): string {
  if (order === 'infanzia') return 'fascia-3-5';
  const normalizedClass = normalizeKeyPart(targetClass || 'non-specificata');
  return `classe-${normalizedClass}`;
}

export function buildDidacticBinding({
  targetType,
  order,
  targetClass,
  disciplineOrField,
  createdAt = new Date().toISOString(),
}: BuildDidacticBindingInput): DidacticBinding {
  const master = INSTITUTE_CURRICULUM_CURRENT_SOURCE;
  const classOrAgeBand = resolveCurriculumClassOrAgeBand(order, targetClass);
  const disciplineKey = normalizeKeyPart(disciplineOrField);
  const unitKey = [
    master.sourceFile,
    `v${master.sourceVersion}`,
    order,
    classOrAgeBand,
    disciplineKey,
  ].join(':');

  const curriculumInForce = master.curriculumInForce === true;

  return {
    id: `DB:${targetType}:${unitKey}`,
    kind: 'DIDACTIC_BINDING',
    targetType,
    curriculumUnit: {
      masterId: 'CAN-CURR-MASTER-00',
      masterDriveFileId: master.driveFileId,
      masterVersion: master.sourceVersion,
      unitKey,
      identityKind: 'ARENA_MASTER_CONTEXT_KEY',
      order,
      classOrAgeBand,
      disciplineOrField,
      resolutionState: 'CONTEXT_BOUND',
    },
    authorityState: curriculumInForce ? 'IN_FORCE_CURRICULUM' : 'WORKING_BASELINE_NOT_IN_FORCE',
    useScope: curriculumInForce ? 'IN_FORCE_CURRICULUM_REFERENCE' : 'DRAFT_PLANNING_REFERENCE',
    humanProfessionalValidation: master.humanProfessionalValidation === 'OPEN' ? 'OPEN' : 'COMPLETE',
    curriculumInForce,
    copiedCurriculumTextIsAuthoritative: false,
    createdAt,
  };
}

export function formatDidacticBindingHumanLabel(binding: DidacticBinding): string {
  const context = [
    binding.curriculumUnit.order,
    binding.curriculumUnit.classOrAgeBand.replace(/-/g, ' '),
    binding.curriculumUnit.disciplineOrField,
  ].join(' · ');
  const authority = binding.curriculumInForce
    ? 'curricolo vigente'
    : 'riferimento di lavoro, non vigente';
  return `${binding.curriculumUnit.masterId}@${binding.curriculumUnit.masterVersion} · ${context} · ${authority}`;
}
