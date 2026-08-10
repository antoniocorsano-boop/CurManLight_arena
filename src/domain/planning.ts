import { createEntityReference } from './curriculum/identity';
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

export interface DidacticPlanningRepository {
  save(planning: DidacticPlanning): void;
  get(id: EntityId): DidacticPlanning | undefined;
  list(): DidacticPlanning[];
}

export interface PlanningCatalogueEntry {
  id: EntityId;
  title: string;
  context: PlanningContext;
  status: 'in_progress' | 'ready';
  statusLabel: 'Da continuare' | 'Pronta';
  updatedAt: string;
  curriculumReferenceCount: number;
  reconstruction?: PlanningReconstruction;
  derivedArtifact?: { id: string; title: string };
}

export interface PlanningCatalogueInput {
  plannings?: DidacticPlanning[];
  compatibilityResults?: PlanningCompatibilityResult[];
  udaArtifacts?: UdaModel[];
}

export interface CanonicalPlanningWorkspaceInput {
  id: EntityId;
  draft: LegacyPlanningDraft;
  curriculumSelections?: readonly DesignCurriculumSelection[];
  status?: PlanningStatus;
  now?: string;
}

export interface MaterializationIssue {
  code: string;
  message: string;
  field?: string;
}

export type MaterializationResult =
  | { status: 'success'; uda: UdaModel }
  | { status: 'already-materialized'; uda: UdaModel }
  | { status: 'not-ready'; issues: MaterializationIssue[] }
  | { status: 'validation-error'; issues: MaterializationIssue[] };

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

export function createCanonicalPlanningWorkspace(input: CanonicalPlanningWorkspaceInput): DidacticPlanning {
  const mapped = mapLegacyDraftToPlanning(input.draft, input.now).planning;
  if (!mapped) throw new Error('Unable to create canonical Planning from compatible draft');
  return {
    ...mapped,
    id: input.id,
    status: input.status ?? 'in_progress',
    curriculumReferences: (input.curriculumSelections ?? []).map(curriculumReferenceFromSelection),
  };
}

function clonePlanning(planning: DidacticPlanning): DidacticPlanning {
  return JSON.parse(JSON.stringify(planning)) as DidacticPlanning;
}

export function updatePlanningContent(
  planning: DidacticPlanning,
  patch: Partial<PlanningContent>,
  updatedAt = new Date().toISOString(),
): DidacticPlanning {
  const next = clonePlanning(planning);
  next.content = { ...next.content, ...patch };
  next.updatedAt = updatedAt;
  return next;
}

function materializationIssues(planning: DidacticPlanning): MaterializationIssue[] {
  const issues: MaterializationIssue[] = [];
  if (!planning.content.title?.trim()) issues.push({ code: 'TITLE_REQUIRED', field: 'title', message: 'A Planning title is required.' });
  if (!planning.context.discipline?.trim()) issues.push({ code: 'DISCIPLINE_REQUIRED', field: 'discipline', message: 'A Planning discipline is required.' });
  if (!planning.content.period?.trim()) issues.push({ code: 'PERIOD_REQUIRED', field: 'period', message: 'A Planning period is required.' });
  if (!Number.isFinite(planning.content.hours) || (planning.content.hours ?? 0) <= 0) issues.push({ code: 'HOURS_REQUIRED', field: 'hours', message: 'Planning hours must be greater than zero.' });
  if (!planning.content.objectives.some(value => value.trim())) issues.push({ code: 'OBJECTIVE_REQUIRED', field: 'objectives', message: 'At least one objective is required.' });
  if (!planning.content.activities.some(value => value.trim())) issues.push({ code: 'ACTIVITY_REQUIRED', field: 'activities', message: 'At least one activity is required.' });
  return issues;
}

export function materializeUdaFromPlanning(
  planning: DidacticPlanning,
  existingArtifacts: readonly UdaModel[] = [],
): MaterializationResult {
  const existing = existingArtifacts.find(artifact => String(artifact.sourcePlanningRef?.id) === String(planning.id));
  if (existing) return { status: 'already-materialized', uda: existing };
  if (planning.status !== 'ready') return {
    status: 'not-ready',
    issues: [{ code: 'PLANNING_NOT_READY', message: 'The Planning must be marked ready before explicit materialization.' }],
  };
  const issues = materializationIssues(planning);
  if (issues.length > 0) return { status: 'validation-error', issues };

  const udaId = `uda-${String(planning.id)}`;
  const sourcePlanningRef = createEntityReference(planning.id, 'teaching-design', planning.content.title);
  const uda: UdaModel = {
    id: udaId,
    title: planning.content.title!.trim(),
    discipline: planning.context.discipline,
    order: planning.context.schoolOrder,
    period: planning.content.period!.trim(),
    hours: planning.content.hours!,
    status: 'bozza',
    traguardi: [],
    obiettivi: [...planning.content.objectives],
    evidenze: [],
    realTask: planning.content.activities.find(value => value.trim())!,
    notes: planning.content.notes ?? planning.content.intentions ?? '',
    createdAt: planning.updatedAt,
    updatedAt: planning.updatedAt,
    sourcePlanningRef,
    curriculumReferences: planning.curriculumReferences.map(reference => ({
      ...reference,
      curriculumVersionRef: { ...reference.curriculumVersionRef },
      provenance: { ...reference.provenance },
      sourceRefs: reference.sourceRefs.map(ref => ({ ...ref })),
      evidenceRefs: reference.evidenceRefs.map(ref => ({ ...ref })),
    })),
    activities: [...planning.content.activities],
    assessment: [...planning.content.assessment],
    materials: [...planning.content.materials],
  };
  return { status: 'success', uda };
}

export function updatePlanningContext(
  planning: DidacticPlanning,
  patch: Partial<PlanningContext>,
  updatedAt = new Date().toISOString(),
): DidacticPlanning {
  const next = clonePlanning(planning);
  next.context = { ...next.context, ...patch };
  next.updatedAt = updatedAt;
  return next;
}

export function updatePlanningReferences(
  planning: DidacticPlanning,
  references: readonly CurriculumReference[],
  updatedAt = new Date().toISOString(),
): DidacticPlanning {
  const next = clonePlanning(planning);
  next.curriculumReferences = references.map(reference => ({
    ...reference,
    curriculumVersionRef: { ...reference.curriculumVersionRef },
    provenance: { ...reference.provenance },
    sourceRefs: reference.sourceRefs.map(ref => ({ ...ref })),
    evidenceRefs: reference.evidenceRefs.map(ref => ({ ...ref })),
  }));
  next.updatedAt = updatedAt;
  return next;
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

function catalogueEntryFromPlanning(planning: DidacticPlanning, udaArtifacts: UdaModel[]): PlanningCatalogueEntry {
  const status = planning.status === 'ready' ? 'ready' : 'in_progress';
  const derivedArtifactId = planning.derivedArtifactRef ? String(planning.derivedArtifactRef.id) : undefined;
  const derivedArtifact = derivedArtifactId
    ? udaArtifacts.find(artifact => artifact.id === derivedArtifactId)
    : undefined;
  return {
    id: planning.id,
    title: planning.content.title?.trim() || 'Progettazione senza titolo',
    context: { ...planning.context },
    status,
    statusLabel: status === 'ready' ? 'Pronta' : 'Da continuare',
    updatedAt: planning.updatedAt,
    curriculumReferenceCount: planning.curriculumReferences.length,
    reconstruction: planning.reconstruction,
    derivedArtifact: derivedArtifact ? { id: derivedArtifact.id, title: derivedArtifact.title } : undefined,
  };
}

export function buildPlanningCatalogue(input: PlanningCatalogueInput): PlanningCatalogueEntry[] {
  const udaArtifacts = input.udaArtifacts ?? [];
  const planningById = new Map<string, DidacticPlanning>();

  for (const planning of input.plannings ?? []) planningById.set(String(planning.id), planning);
  for (const result of input.compatibilityResults ?? []) {
    if (!result.planning) continue;
    const key = String(result.planning.id);
    if (planningById.has(key)) continue;
    planningById.set(key, result.sourceKind === 'legacy-draft' && !result.planning.reconstruction
      ? { ...result.planning, reconstruction: 'partial' }
      : result.planning);
  }

  return [...planningById.values()]
    .map(planning => catalogueEntryFromPlanning(planning, udaArtifacts))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt) || left.title.localeCompare(right.title));
}

export function resolveCanonicalPlanningSources(
  canonicalPlannings: readonly DidacticPlanning[],
  compatibilityResults: readonly PlanningCompatibilityResult[],
): DidacticPlanning[] {
  const canonicalIds = new Set<string>();
  const result: DidacticPlanning[] = [];
  for (const planning of canonicalPlannings) {
    const id = String(planning.id);
    if (canonicalIds.has(id)) continue;
    canonicalIds.add(id);
    result.push(planning);
  }
  for (const compatibility of compatibilityResults) {
    if (!compatibility.planning || canonicalIds.has(String(compatibility.planning.id))) continue;
    result.push(compatibility.planning);
  }
  return result;
}
