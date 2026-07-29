/**
 * CML-633H — Design Curriculum Selection Constructors
 */

import type { EntityReference, ActorReference } from '../curriculum/identity/types';
import { generateEntityId, createMetadata } from '../curriculum/identity';
import type {
  DesignArchive,
  DesignCurriculumSelection,
  DesignQualification,
} from './types';

export function createEmptyDesignArchive(now = new Date().toISOString()): DesignArchive {
  return {
    schemaVersion: 1,
    updatedAt: now,
    selections: [],
  };
}

export function cloneDesignArchive(archive: DesignArchive): DesignArchive {
  return JSON.parse(JSON.stringify(archive));
}

export interface CreateSelectionInput {
  designRef: EntityReference;
  sourceArea: 'A02' | 'A03';
  sourceEntityRef: EntityReference;
  sourceVersionRef?: EntityReference;
  curriculumNodeRef?: EntityReference;
  curriculumVersionRef?: EntityReference;
  currentTextSnapshot: string;
  selectedTextSnapshot: string;
  qualification: DesignQualification;
  sourceRefs?: EntityReference[];
  evidenceRefs?: EntityReference[];
  institutionalContextRef?: EntityReference;
  transferContractVersion?: string;
  structuralFootprint?: string;
  transferredBy?: ActorReference;
}

export function createDesignCurriculumSelection(
  input: CreateSelectionInput,
  now = new Date().toISOString(),
): DesignCurriculumSelection {
  return {
    id: generateEntityId(),
    metadata: createMetadata('teacher', input.transferredBy, now),
    designRef: { ...input.designRef },
    sourceArea: input.sourceArea,
    sourceEntityRef: { ...input.sourceEntityRef },
    sourceVersionRef: input.sourceVersionRef ? { ...input.sourceVersionRef } : undefined,
    curriculumNodeRef: input.curriculumNodeRef ? { ...input.curriculumNodeRef } : undefined,
    curriculumVersionRef: input.curriculumVersionRef ? { ...input.curriculumVersionRef } : undefined,
    currentTextSnapshot: input.currentTextSnapshot,
    selectedTextSnapshot: input.selectedTextSnapshot,
    qualification: input.qualification,
    sourceRefs: input.sourceRefs ? input.sourceRefs.map(r => ({ ...r })) : [],
    evidenceRefs: input.evidenceRefs ? input.evidenceRefs.map(r => ({ ...r })) : [],
    institutionalContextRef: input.institutionalContextRef ? { ...input.institutionalContextRef } : undefined,
    transferredAt: now,
    transferredBy: input.transferredBy,
    transferContractVersion: input.transferContractVersion ?? '1.0',
    structuralFootprint: input.structuralFootprint ?? '',
    comparisonState: 'source-current',
    warnings: [],
  };
}