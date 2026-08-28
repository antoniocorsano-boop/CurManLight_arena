import {
  DM221_CANONICAL_STRUCTURE_VERSION,
  DM221_FIRST_CYCLE_DISCIPLINES,
  DM221_INFANZIA_FIELDS,
  DM221_SPECIAL_SEGMENTS,
  type NationalCurriculumSegmentKind,
} from './canonicalStructure';
import { DM221_2025_SOURCE_ID, type NationalSourceLocator } from './dm2212025';

export type NationalRequirementApplicability = 'UNIVERSAL' | 'CONDITIONAL' | 'EXTERNAL_AUTHORITY';

export interface NationalCurriculumRequirement {
  requirementId: string;
  segmentId: string;
  kind: NationalCurriculumSegmentKind;
  label: string;
  schoolOrder: 'infanzia' | 'primaria' | 'secondaria';
  applicability: NationalRequirementApplicability;
  sourceLocator: NationalSourceLocator;
}

function applicabilityForKind(kind: NationalCurriculumSegmentKind, universal: boolean): NationalRequirementApplicability {
  if (kind === 'EXTERNAL_AUTHORITY_SUBJECT') return 'EXTERNAL_AUTHORITY';
  return universal ? 'UNIVERSAL' : 'CONDITIONAL';
}

export const DM221_REQUIREMENT_PROFILE = {
  id: 'dm221-requirements-2026-v1',
  structureVersion: DM221_CANONICAL_STRUCTURE_VERSION,
  sourceId: DM221_2025_SOURCE_ID,
  academicStart: '2026/2027',
  requirements: [
    ...Object.values(DM221_INFANZIA_FIELDS),
    ...Object.values(DM221_FIRST_CYCLE_DISCIPLINES),
    ...DM221_SPECIAL_SEGMENTS,
  ].flatMap((segment): NationalCurriculumRequirement[] =>
    segment.schoolOrders.map((schoolOrder) => ({
      requirementId: `${segment.id}::${schoolOrder}`,
      segmentId: segment.id,
      kind: segment.kind,
      label: segment.label,
      schoolOrder,
      applicability: applicabilityForKind(segment.kind, segment.universalRequirement),
      sourceLocator: segment.sourceLocator,
    })),
  ),
} as const;

export function getUniversalNationalRequirements(): readonly NationalCurriculumRequirement[] {
  return DM221_REQUIREMENT_PROFILE.requirements.filter(
    (requirement) => requirement.applicability === 'UNIVERSAL',
  );
}

export function getConditionalNationalRequirements(): readonly NationalCurriculumRequirement[] {
  return DM221_REQUIREMENT_PROFILE.requirements.filter(
    (requirement) => requirement.applicability === 'CONDITIONAL',
  );
}

export function getExternalAuthorityRequirements(): readonly NationalCurriculumRequirement[] {
  return DM221_REQUIREMENT_PROFILE.requirements.filter(
    (requirement) => requirement.applicability === 'EXTERNAL_AUTHORITY',
  );
}
