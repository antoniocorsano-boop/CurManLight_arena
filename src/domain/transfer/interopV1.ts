export const CML_INTEROP_CONTRACT = 'CML_INTEROP_V1' as const;
export const CML_INTEROP_PAYLOAD_VERSION = 1 as const;
export const CML_INTEROP_PRIVACY_CLASS = 'PROFESSIONAL_NON_PERSONAL' as const;

export type CmlInteropProduct = 'CURMANLIGHT_ARENA' | 'DOCENTE_OS';
export type CmlInteropGeneratedBy = 'HUMAN' | 'SYSTEM_DERIVED' | 'AI_PROPOSED';
export type CmlInteropMessageType =
  | 'CURRICULUM_ADOPTED'
  | 'CURRICULUM_VERSION_AVAILABLE'
  | 'ANNUAL_PLANNING_FRAMEWORK_AVAILABLE'
  | 'UDA_FRAMEWORK_AVAILABLE'
  | 'CURRICULUM_FEEDBACK_SUBMITTED'
  | 'CURRICULUM_ALIGNMENT_EVIDENCE_SUBMITTED';

export interface CmlCanonicalRef {
  readonly namespace: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly versionId?: string;
}

export interface CmlSourceProvenance {
  readonly sourceRefs: readonly CmlCanonicalRef[];
  readonly generatedBy: CmlInteropGeneratedBy;
  readonly humanConfirmed: boolean;
  readonly note?: string;
}

export interface CmlInteropEnvelope<TPayload = unknown> {
  readonly contract: typeof CML_INTEROP_CONTRACT;
  readonly messageId: string;
  readonly messageType: CmlInteropMessageType;
  readonly sourceProduct: CmlInteropProduct;
  readonly sourceVersion: string;
  readonly emittedAt: string;
  readonly payloadVersion: typeof CML_INTEROP_PAYLOAD_VERSION;
  readonly payload: TPayload;
  readonly provenance: CmlSourceProvenance;
  readonly privacyClass: typeof CML_INTEROP_PRIVACY_CLASS;
}

export interface CurriculumAdoptedPayload {
  readonly institutionRef: CmlCanonicalRef;
  readonly schoolYearRef: string;
  readonly curriculumRef: CmlCanonicalRef;
  readonly curriculumVersionRef: CmlCanonicalRef;
  readonly disciplineRef: string;
  readonly gradeRef: string;
  readonly effectiveFrom: string;
  readonly adoptionDecisionRef: CmlCanonicalRef;
  readonly nodeRefs: readonly CmlCanonicalRef[];
}

export interface PlanningConstraint {
  readonly id: string;
  readonly kind: 'REQUIRED' | 'RECOMMENDED' | 'INFORMATIONAL';
  readonly description: string;
  readonly sourceRef?: CmlCanonicalRef;
}

export interface AnnualPlanningFrameworkPayload {
  readonly curriculumVersionRef: CmlCanonicalRef;
  readonly disciplineRef: string;
  readonly gradeRef: string;
  readonly periods: readonly {
    readonly periodId: string;
    readonly label: string;
    readonly suggestedNodeRefs: readonly CmlCanonicalRef[];
  }[];
  readonly constraints: readonly PlanningConstraint[];
}

export interface UdaFrameworkPayload {
  readonly frameworkRef: CmlCanonicalRef;
  readonly curriculumVersionRef: CmlCanonicalRef;
  readonly title: string;
  readonly alignedNodeRefs: readonly CmlCanonicalRef[];
  readonly reusableStructure: Readonly<Record<string, unknown>>;
  readonly institutionalConstraints: readonly PlanningConstraint[];
}

export interface CurriculumFeedbackPayload {
  readonly curriculumVersionRef: CmlCanonicalRef;
  readonly alignedNodeRefs: readonly CmlCanonicalRef[];
  readonly summary: string;
  readonly evidenceRefs: readonly CmlCanonicalRef[];
  readonly teacherConfirmed: boolean;
}

export interface CurriculumAlignmentEvidencePayload {
  readonly curriculumVersionRef: CmlCanonicalRef;
  readonly alignedNodeRefs: readonly CmlCanonicalRef[];
  readonly evidenceRefs: readonly CmlCanonicalRef[];
  readonly observation: string;
  readonly teacherConfirmed: boolean;
}

export interface CmlInteropValidationError {
  readonly field: string;
  readonly code: 'INTEROP_ENVELOPE_INVALID' | 'INTEROP_CONTRACT_UNSUPPORTED' | 'INTEROP_MESSAGE_UNSUPPORTED' | 'INTEROP_DIRECTION_INVALID' | 'INTEROP_PRIVACY_REJECTED' | 'INTEROP_PROVENANCE_INVALID' | 'INTEROP_REFERENCE_INVALID' | 'INTEROP_PAYLOAD_INVALID';
  readonly message: string;
}

export interface CmlInteropValidationResult {
  readonly valid: boolean;
  readonly errors: readonly CmlInteropValidationError[];
}

const MESSAGE_TYPES: readonly CmlInteropMessageType[] = [
  'CURRICULUM_ADOPTED',
  'CURRICULUM_VERSION_AVAILABLE',
  'ANNUAL_PLANNING_FRAMEWORK_AVAILABLE',
  'UDA_FRAMEWORK_AVAILABLE',
  'CURRICULUM_FEEDBACK_SUBMITTED',
  'CURRICULUM_ALIGNMENT_EVIDENCE_SUBMITTED',
];
const ARENA_TO_DOCENTE: readonly CmlInteropMessageType[] = ['CURRICULUM_ADOPTED', 'CURRICULUM_VERSION_AVAILABLE', 'ANNUAL_PLANNING_FRAMEWORK_AVAILABLE', 'UDA_FRAMEWORK_AVAILABLE'];
const DOCENTE_TO_ARENA: readonly CmlInteropMessageType[] = ['CURRICULUM_FEEDBACK_SUBMITTED', 'CURRICULUM_ALIGNMENT_EVIDENCE_SUBMITTED'];
const FORBIDDEN_PERSONAL_KEYS = new Set(['student','studentId','studentName','pupil','pupilId','pupilName','alunno','alunna','alunni','nomeAlunno','cognomeAlunno','assessmentResult','individualAssessment','pdp','pei','family','parent','guardian','email','phone','fiscalCode','codiceFiscale','dateOfBirth']);

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function nonEmpty(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function isoDate(value: unknown): boolean { return nonEmpty(value) && !Number.isNaN(Date.parse(value)); }
function add(errors: CmlInteropValidationError[], field: string, code: CmlInteropValidationError['code'], message: string): void { errors.push({ field, code, message }); }

function validateRef(value: unknown, field: string, errors: CmlInteropValidationError[]): void {
  if (!isRecord(value) || !nonEmpty(value.namespace) || !nonEmpty(value.entityType) || !nonEmpty(value.entityId)) {
    add(errors, field, 'INTEROP_REFERENCE_INVALID', 'Canonical reference requires namespace, entityType and entityId.');
  } else if (value.versionId !== undefined && !nonEmpty(value.versionId)) {
    add(errors, `${field}.versionId`, 'INTEROP_REFERENCE_INVALID', 'versionId must be non-empty when present.');
  }
}

function validateRefArray(value: unknown, field: string, errors: CmlInteropValidationError[]): void {
  if (!Array.isArray(value) || value.length === 0) return add(errors, field, 'INTEROP_PAYLOAD_INVALID', `${field} must contain at least one canonical reference.`);
  value.forEach((entry, index) => validateRef(entry, `${field}[${index}]`, errors));
}

function scanPrivacy(value: unknown, field: string, errors: CmlInteropValidationError[]): void {
  if (Array.isArray(value)) return value.forEach((entry, index) => scanPrivacy(entry, `${field}[${index}]`, errors));
  if (!isRecord(value)) return;
  for (const [key, entry] of Object.entries(value)) {
    if (FORBIDDEN_PERSONAL_KEYS.has(key)) add(errors, `${field}.${key}`, 'INTEROP_PRIVACY_REJECTED', `Field "${key}" is outside PROFESSIONAL_NON_PERSONAL interoperability v1.`);
    scanPrivacy(entry, `${field}.${key}`, errors);
  }
}

function validateProvenance(value: unknown, errors: CmlInteropValidationError[]): void {
  if (!isRecord(value) || !Array.isArray(value.sourceRefs) || value.sourceRefs.length === 0) return add(errors, 'provenance', 'INTEROP_PROVENANCE_INVALID', 'Provenance with at least one sourceRef is required.');
  value.sourceRefs.forEach((ref, index) => validateRef(ref, `provenance.sourceRefs[${index}]`, errors));
  if (!['HUMAN','SYSTEM_DERIVED','AI_PROPOSED'].includes(String(value.generatedBy))) add(errors, 'provenance.generatedBy', 'INTEROP_PROVENANCE_INVALID', 'generatedBy is invalid.');
  if (typeof value.humanConfirmed !== 'boolean') add(errors, 'provenance.humanConfirmed', 'INTEROP_PROVENANCE_INVALID', 'humanConfirmed must be boolean.');
}

function validatePayload(messageType: CmlInteropMessageType, payload: unknown, errors: CmlInteropValidationError[]): void {
  if (!isRecord(payload)) return add(errors, 'payload', 'INTEROP_PAYLOAD_INVALID', 'payload must be an object.');
  if (messageType === 'CURRICULUM_ADOPTED') {
    ['institutionRef','curriculumRef','curriculumVersionRef','adoptionDecisionRef'].forEach(field => validateRef(payload[field], `payload.${field}`, errors));
    validateRefArray(payload.nodeRefs, 'payload.nodeRefs', errors);
    ['schoolYearRef','disciplineRef','gradeRef'].forEach(field => { if (!nonEmpty(payload[field])) add(errors, `payload.${field}`, 'INTEROP_PAYLOAD_INVALID', `${field} is required.`); });
    if (!isoDate(payload.effectiveFrom)) add(errors, 'payload.effectiveFrom', 'INTEROP_PAYLOAD_INVALID', 'effectiveFrom must be an ISO-compatible date.');
  } else if (messageType === 'ANNUAL_PLANNING_FRAMEWORK_AVAILABLE') {
    validateRef(payload.curriculumVersionRef, 'payload.curriculumVersionRef', errors);
    if (!nonEmpty(payload.disciplineRef)) add(errors, 'payload.disciplineRef', 'INTEROP_PAYLOAD_INVALID', 'disciplineRef is required.');
    if (!nonEmpty(payload.gradeRef)) add(errors, 'payload.gradeRef', 'INTEROP_PAYLOAD_INVALID', 'gradeRef is required.');
    if (!Array.isArray(payload.periods) || payload.periods.length === 0) add(errors, 'payload.periods', 'INTEROP_PAYLOAD_INVALID', 'At least one planning period is required.');
    if (!Array.isArray(payload.constraints)) add(errors, 'payload.constraints', 'INTEROP_PAYLOAD_INVALID', 'constraints must be an array.');
  } else if (messageType === 'UDA_FRAMEWORK_AVAILABLE') {
    validateRef(payload.frameworkRef, 'payload.frameworkRef', errors); validateRef(payload.curriculumVersionRef, 'payload.curriculumVersionRef', errors); validateRefArray(payload.alignedNodeRefs, 'payload.alignedNodeRefs', errors);
    if (!nonEmpty(payload.title)) add(errors, 'payload.title', 'INTEROP_PAYLOAD_INVALID', 'title is required.');
    if (!isRecord(payload.reusableStructure)) add(errors, 'payload.reusableStructure', 'INTEROP_PAYLOAD_INVALID', 'reusableStructure must be an object.');
    if (!Array.isArray(payload.institutionalConstraints)) add(errors, 'payload.institutionalConstraints', 'INTEROP_PAYLOAD_INVALID', 'institutionalConstraints must be an array.');
  } else if (messageType === 'CURRICULUM_FEEDBACK_SUBMITTED' || messageType === 'CURRICULUM_ALIGNMENT_EVIDENCE_SUBMITTED') {
    validateRef(payload.curriculumVersionRef, 'payload.curriculumVersionRef', errors); validateRefArray(payload.alignedNodeRefs, 'payload.alignedNodeRefs', errors); validateRefArray(payload.evidenceRefs, 'payload.evidenceRefs', errors);
    if (payload.teacherConfirmed !== true) add(errors, 'payload.teacherConfirmed', 'INTEROP_PAYLOAD_INVALID', 'Operational evidence must be explicitly teacher-confirmed before exchange.');
    const field = messageType === 'CURRICULUM_FEEDBACK_SUBMITTED' ? 'summary' : 'observation'; if (!nonEmpty(payload[field])) add(errors, `payload.${field}`, 'INTEROP_PAYLOAD_INVALID', `${field} is required.`);
  } else if (messageType === 'CURRICULUM_VERSION_AVAILABLE') {
    validateRef(payload.curriculumVersionRef, 'payload.curriculumVersionRef', errors);
  }
}

export function validateCmlInteropEnvelope(input: unknown): CmlInteropValidationResult {
  const errors: CmlInteropValidationError[] = [];
  if (!isRecord(input)) return { valid: false, errors: [{ field: '$', code: 'INTEROP_ENVELOPE_INVALID', message: 'Envelope must be an object.' }] };
  if (input.contract !== CML_INTEROP_CONTRACT || input.payloadVersion !== CML_INTEROP_PAYLOAD_VERSION) add(errors, 'contract/payloadVersion', 'INTEROP_CONTRACT_UNSUPPORTED', 'Only CML_INTEROP_V1 payloadVersion 1 is supported.');
  if (!nonEmpty(input.messageId)) add(errors, 'messageId', 'INTEROP_ENVELOPE_INVALID', 'messageId is required.');
  if (!nonEmpty(input.sourceVersion)) add(errors, 'sourceVersion', 'INTEROP_ENVELOPE_INVALID', 'sourceVersion is required.');
  if (!isoDate(input.emittedAt)) add(errors, 'emittedAt', 'INTEROP_ENVELOPE_INVALID', 'emittedAt must be an ISO-compatible date.');
  if (input.privacyClass !== CML_INTEROP_PRIVACY_CLASS) add(errors, 'privacyClass', 'INTEROP_PRIVACY_REJECTED', 'Interop v1 accepts only PROFESSIONAL_NON_PERSONAL data.');
  const sourceProduct = input.sourceProduct; const messageType = input.messageType as CmlInteropMessageType;
  if (sourceProduct !== 'CURMANLIGHT_ARENA' && sourceProduct !== 'DOCENTE_OS') add(errors, 'sourceProduct', 'INTEROP_ENVELOPE_INVALID', 'sourceProduct is invalid.');
  if (!MESSAGE_TYPES.includes(messageType)) add(errors, 'messageType', 'INTEROP_MESSAGE_UNSUPPORTED', 'messageType is not supported by interoperability v1.');
  validateProvenance(input.provenance, errors); scanPrivacy(input.payload, 'payload', errors);
  if ((sourceProduct === 'CURMANLIGHT_ARENA' || sourceProduct === 'DOCENTE_OS') && MESSAGE_TYPES.includes(messageType)) {
    const allowed = sourceProduct === 'CURMANLIGHT_ARENA' ? ARENA_TO_DOCENTE : DOCENTE_TO_ARENA;
    if (!allowed.includes(messageType)) add(errors, 'messageType', 'INTEROP_DIRECTION_INVALID', `${messageType} is not permitted from ${sourceProduct}.`);
    validatePayload(messageType, input.payload, errors);
    if (messageType === 'CURRICULUM_ADOPTED' && isRecord(input.provenance) && input.provenance.humanConfirmed !== true) add(errors, 'provenance.humanConfirmed', 'INTEROP_PROVENANCE_INVALID', 'Adopted curriculum requires human-confirmed provenance.');
  }
  return { valid: errors.length === 0, errors };
}

export function parseCmlInteropEnvelope(input: unknown): CmlInteropEnvelope {
  const validation = validateCmlInteropEnvelope(input);
  if (!validation.valid) throw new Error(`CML interoperability envelope rejected: ${validation.errors.map(error => `${error.code}:${error.field}`).join(', ')}`);
  return input as CmlInteropEnvelope;
}
