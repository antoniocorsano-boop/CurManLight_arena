import type { EntityId, EntityReference } from './curriculum/identity/types';
import type { SchoolOrder, UdaModel } from '../types/curriculum';
import type { DesignCurriculumSelection, DesignQualification } from './design/types';
import type { GuidedTeacherWorkflowState } from '../features/guided-workflow/types';

export type PlanningStatus = 'draft' | 'in_progress' | 'ready';
export type PlanningReconstruction = 'native' | 'partial';

export interface PlanningContext {
  schoolOrder: SchoolOrder;
  discipline: string;
  classLabel?: string;
  schoolYear?: string;
}

export interface CurriculumReferenceProvenance {
  sourceArea: 'A02' | 'A03';
  qualification: DesignQualification;
  sourceEntityRef: EntityReference;
  sourceVersionRef?: EntityReference;
}

export interface CurriculumReference {
  nodeId: string;
  curriculumVersionRef: EntityReference;
  snapshot: string;
  provenance: CurriculumReferenceProvenance;
  sourceRefs: EntityReference[];
  evidenceRefs: EntityReference[];
}

export interface PlanningContent {
  title?: string;
  period?: string;
  hours?: number;
  intentions?: string;
  objectives: string[];
  activities: string[];
  assessment: string[];
  materials: string[];
  notes?: string;
}

export interface DidacticPlanning {
  id: EntityId;
  context: PlanningContext;
  curriculumReferences: CurriculumReference[];
  content: PlanningContent;
  status: PlanningStatus;
  createdAt: string;
  updatedAt: string;
  derivedArtifactRef?: EntityReference;
  reconstruction?: PlanningReconstruction;
}

export interface LegacyPlanningDraft {
  id?: string;
  title?: string;
  discipline?: string;
  schoolOrder?: SchoolOrder;
  classLabel?: string;
  schoolYear?: string;
  period?: string;
  hours?: number;
  intentions?: string;
  objectives?: string[];
  activities?: string[];
  assessment?: string[];
  materials?: string[];
  notes?: string;
  [key: string]: unknown;
}

export type PlanningCompatibilitySource = 'legacy-draft' | 'legacy-uda' | 'design-curriculum-selection' | 'guided-workflow';

export interface PlanningCompatibilityWarning {
  code: string;
  message: string;
  field?: string;
}

export interface PlanningCompatibilityResult {
  planning?: DidacticPlanning;
  artifact?: UdaModel;
  sourceKind: PlanningCompatibilitySource;
  mappedFields: string[];
  unmappedFields: string[];
  warnings: PlanningCompatibilityWarning[];
}

const emptyContent = (): PlanningContent => ({ objectives: [], activities: [], assessment: [], materials: [] });

export function createDidacticPlanning(input: {
  id: EntityId;
  context: PlanningContext;
  curriculumReferences?: CurriculumReference[];
  content?: Partial<PlanningContent>;
  status?: PlanningStatus;
  createdAt?: string;
  updatedAt?: string;
}): DidacticPlanning {
  const now = input.updatedAt ?? input.createdAt ?? new Date().toISOString();
  return {
    id: input.id,
    context: { ...input.context },
    curriculumReferences: input.curriculumReferences?.map(reference => ({
      ...reference,
      curriculumVersionRef: { ...reference.curriculumVersionRef },
      provenance: { ...reference.provenance },
      sourceRefs: reference.sourceRefs.map(ref => ({ ...ref })),
      evidenceRefs: reference.evidenceRefs.map(ref => ({ ...ref })),
    })) ?? [],
    content: { ...emptyContent(), ...input.content },
    status: input.status ?? 'draft',
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
}

function clonePlanning(planning: DidacticPlanning): DidacticPlanning {
  return JSON.parse(JSON.stringify(planning)) as DidacticPlanning;
}

export function curriculumReferenceFromSelection(selection: DesignCurriculumSelection): CurriculumReference {
  const nodeRef = selection.curriculumNodeRef ?? selection.sourceEntityRef;
  const versionRef = selection.curriculumVersionRef ?? selection.sourceVersionRef;
  if (!versionRef) throw new Error('Curriculum selection has no curriculum version reference');
  return {
    nodeId: String(nodeRef.id),
    curriculumVersionRef: { ...versionRef },
    snapshot: selection.selectedTextSnapshot || selection.currentTextSnapshot,
    provenance: {
      sourceArea: selection.sourceArea,
      qualification: selection.qualification,
      sourceEntityRef: { ...selection.sourceEntityRef },
      sourceVersionRef: selection.sourceVersionRef ? { ...selection.sourceVersionRef } : undefined,
    },
    sourceRefs: selection.sourceRefs.map(ref => ({ ...ref })),
    evidenceRefs: selection.evidenceRefs.map(ref => ({ ...ref })),
  };
}

function referenceKey(reference: CurriculumReference): string {
  return `${reference.nodeId}:${String(reference.curriculumVersionRef.id)}`;
}

export function addCurriculumReference(planning: DidacticPlanning, reference: CurriculumReference): DidacticPlanning {
  const next = clonePlanning(planning);
  if (next.curriculumReferences.some(existing => referenceKey(existing) === referenceKey(reference))) return next;
  next.curriculumReferences.push({
    ...reference,
    curriculumVersionRef: { ...reference.curriculumVersionRef },
    provenance: { ...reference.provenance },
    sourceRefs: reference.sourceRefs.map(ref => ({ ...ref })),
    evidenceRefs: reference.evidenceRefs.map(ref => ({ ...ref })),
  });
  next.updatedAt = new Date().toISOString();
  return next;
}

const DRAFT_FIELDS = new Set(['id', 'title', 'discipline', 'schoolOrder', 'classLabel', 'schoolYear', 'period', 'hours', 'intentions', 'objectives', 'activities', 'assessment', 'materials', 'notes']);

function legacyDraftIdentity(draft: LegacyPlanningDraft): EntityId {
  const source = [draft.id, draft.title, draft.discipline, draft.schoolOrder, draft.classLabel, draft.period].map(value => value ?? '').join('|');
  let hash = 0;
  for (const character of source) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return `planning-legacy-${Math.abs(hash).toString(36)}` as EntityId;
}

export function mapLegacyDraftToPlanning(draft: LegacyPlanningDraft, now = new Date().toISOString()): PlanningCompatibilityResult {
  const mappedFields = Object.keys(draft).filter(field => DRAFT_FIELDS.has(field));
  const unmappedFields = Object.keys(draft).filter(field => !DRAFT_FIELDS.has(field));
  return {
    planning: createDidacticPlanning({
      id: legacyDraftIdentity(draft),
      context: { schoolOrder: draft.schoolOrder ?? 'secondaria', discipline: draft.discipline ?? '', classLabel: draft.classLabel, schoolYear: draft.schoolYear },
      content: {
        title: draft.title, period: draft.period, hours: draft.hours, intentions: draft.intentions,
        objectives: draft.objectives ?? [], activities: draft.activities ?? [], assessment: draft.assessment ?? [], materials: draft.materials ?? [], notes: draft.notes,
      },
      status: 'in_progress',
      createdAt: now,
      updatedAt: now,
    }),
    sourceKind: 'legacy-draft',
    mappedFields,
    unmappedFields,
    warnings: unmappedFields.map(field => ({ code: 'UNMAPPED_LEGACY_FIELD', field, message: `Legacy draft field "${field}" has no canonical Planning mapping.` })),
  };
}

export function mapLegacyUdaToPlanning(artifact: UdaModel): PlanningCompatibilityResult {
  return {
    artifact,
    sourceKind: 'legacy-uda',
    mappedFields: ['artifact'],
    unmappedFields: ['planningId', 'curriculumReferences', 'planningHistory'],
    warnings: [{ code: 'PLANNING_HISTORY_UNAVAILABLE', message: `UDA "${artifact.id}" remains a valid artifact; its originating Planning is not reconstructed without evidence.` }],
  };
}

export function mapGuidedWorkflowStateToPlanning(_state: GuidedTeacherWorkflowState): PlanningCompatibilityResult {
  return {
    sourceKind: 'guided-workflow',
    mappedFields: [],
    unmappedFields: ['currentStep', 'completedSteps', 'selectedCurriculumRefs', 'selectedDesignRef', 'generatedDocumentRef'],
    warnings: [{ code: 'PRESENTATION_STATE_NOT_DOMAIN_SOURCE', message: 'Guided workflow state is presentation state and cannot establish a canonical Planning.' }],
  };
}
