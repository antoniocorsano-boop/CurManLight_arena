# CML Interoperability Contract v1

Status: PROPOSED / CONTRACT-FOUNDATION  
Scope: CurManLight Arena ↔ Docente OS  
Runtime coupling: NONE

## 1. Contract objective

Define the minimum semantic envelope required for CurManLight Arena and Docente OS to exchange curriculum-related information while preserving independent runtimes, independent persistence and human authority.

This document defines semantic payloads only. It does not authorize network synchronization, shared authentication, shared storage or automatic cross-product writes.

## 2. Common envelope

Every cross-product message MUST contain:

```ts
interface CmlInteropEnvelope<TPayload> {
  contract: 'CML_INTEROP_V1';
  messageId: string;
  messageType: CmlInteropMessageType;
  sourceProduct: 'CURMANLIGHT_ARENA' | 'DOCENTE_OS';
  sourceVersion: string;
  emittedAt: string;
  payloadVersion: 1;
  payload: TPayload;
  provenance: SourceProvenance;
  privacyClass: 'PROFESSIONAL_NON_PERSONAL';
}
```

`messageId` identifies the exchanged message, not the underlying curriculum entity.

## 3. Canonical references

```ts
interface CanonicalRef {
  namespace: string;
  entityType: string;
  entityId: string;
  versionId?: string;
}

type InstitutionRef = CanonicalRef;
type CurriculumRef = CanonicalRef;
type CurriculumVersionRef = CanonicalRef;
type CurriculumNodeRef = CanonicalRef;
type InstitutionalDocumentRef = CanonicalRef;
```

Rules:

1. `namespace` MUST make identity ownership explicit.
2. `entityId` MUST remain stable across exchange attempts.
3. `versionId`, when present, MUST identify an immutable or semantically frozen version.
4. Consumer products MUST NOT reinterpret an internal database primary key as global identity.

## 4. Provenance

```ts
interface SourceProvenance {
  sourceRefs: CanonicalRef[];
  generatedBy: 'HUMAN' | 'SYSTEM_DERIVED' | 'AI_PROPOSED';
  humanConfirmed: boolean;
  note?: string;
}
```

Institutional decisions and adopted curriculum states MUST have `humanConfirmed = true`.

AI-generated or system-derived content may be exchanged only as proposal/evidence unless a separate human-confirmed canonical decision exists.

## 5. Message types

```ts
type CmlInteropMessageType =
  | 'CURRICULUM_ADOPTED'
  | 'CURRICULUM_VERSION_AVAILABLE'
  | 'ANNUAL_PLANNING_FRAMEWORK_AVAILABLE'
  | 'UDA_FRAMEWORK_AVAILABLE'
  | 'CURRICULUM_FEEDBACK_SUBMITTED'
  | 'CURRICULUM_ALIGNMENT_EVIDENCE_SUBMITTED';
```

No `CURRICULUM_UPDATE` or equivalent automatic mutation message exists in v1.

## 6. Arena → Docente OS payloads

### 6.1 CurriculumAdopted

```ts
interface CurriculumAdoptedPayload {
  institutionRef: InstitutionRef;
  schoolYearRef: string;
  curriculumRef: CurriculumRef;
  curriculumVersionRef: CurriculumVersionRef;
  disciplineRef: string;
  gradeRef: string;
  effectiveFrom: string;
  adoptionDecisionRef: CanonicalRef;
  nodeRefs: CurriculumNodeRef[];
}
```

Semantics:

- Arena is authoritative for the adoption state.
- Docente OS imports this as a reference/framework for teacher planning.
- Import MUST NOT silently overwrite a teacher annual plan already in progress.

### 6.2 AnnualPlanningFramework

```ts
interface AnnualPlanningFrameworkPayload {
  curriculumVersionRef: CurriculumVersionRef;
  disciplineRef: string;
  gradeRef: string;
  periods: Array<{
    periodId: string;
    label: string;
    suggestedNodeRefs: CurriculumNodeRef[];
  }>;
  constraints: PlanningConstraint[];
}

interface PlanningConstraint {
  id: string;
  kind: 'REQUIRED' | 'RECOMMENDED' | 'INFORMATIONAL';
  description: string;
  sourceRef?: CanonicalRef;
}
```

This payload gives Docente OS a meaningful annual-plan starting structure. It is not a finished teacher plan.

### 6.3 UdaFramework

```ts
interface UdaFrameworkPayload {
  frameworkRef: CanonicalRef;
  curriculumVersionRef: CurriculumVersionRef;
  title: string;
  alignedNodeRefs: CurriculumNodeRef[];
  reusableStructure: Record<string, unknown>;
  institutionalConstraints: PlanningConstraint[];
}
```

Docente OS may create its own teacher-authored/versioned UDA from the framework. The resulting UDA remains Docente OS operational state.

## 7. Docente OS → Arena payloads

### 7.1 CurriculumFeedback

```ts
interface CurriculumFeedbackPayload {
  curriculumVersionRef: CurriculumVersionRef;
  disciplineRef: string;
  gradeRef: string;
  schoolYearRef: string;
  observation: string;
  evidenceSummary?: string;
  relatedNodeRefs: CurriculumNodeRef[];
  teacherConfirmed: true;
  containsSchoolPersonalData: false;
}
```

Arena MUST ingest this as review evidence/contribution, not as a canonical curriculum update.

### 7.2 CurriculumAlignmentEvidence

```ts
interface CurriculumAlignmentEvidencePayload {
  curriculumVersionRef: CurriculumVersionRef;
  relatedNodeRefs: CurriculumNodeRef[];
  sourceArtifactRef: CanonicalRef;
  alignmentState: 'ALIGNED' | 'PARTIAL' | 'MISALIGNED' | 'UNDETERMINED';
  rationale: string;
  teacherConfirmed: boolean;
  containsSchoolPersonalData: false;
}
```

Possible source artifacts include a non-personal UDA version or aggregate planning evidence.

## 8. Import behaviour

Consumers MUST distinguish three states:

- `NEW`: no corresponding semantic object exists locally;
- `UPDATE_AVAILABLE`: the incoming version differs from the locally referenced external version;
- `ALREADY_KNOWN`: the same immutable/versioned external object is already registered.

No v1 import may use blind last-write-wins behaviour.

When teacher-authored local state derives from an earlier curriculum version, Docente OS SHOULD preserve both:

- the original source version used to create the plan/UDA;
- the newly available curriculum version.

The user can then consciously re-align or retain the existing work.

## 9. Conflict policy

Cross-product conflicts are semantic, not database merge conflicts.

Examples:

- Arena publishes curriculum v3.1 while a teacher plan still references v3.0: Docente OS marks `UPDATE_AVAILABLE`; it does not rewrite the plan.
- Docente OS sends feedback on v3.0 after Arena adopts v3.1: Arena preserves the feedback against v3.0 and may surface it during later review; it does not silently rebind it to v3.1.
- A UDA derived from an Arena framework has been heavily modified by the teacher: Arena framework updates do not overwrite the teacher version.

## 10. Human authority

The following transitions MUST NOT be automated by interoperability:

- proposal -> approved curriculum;
- feedback -> revision decision;
- revision proposal -> adoption;
- framework -> teacher operational plan replacement;
- AI proposal -> institutional decision.

Human confirmation remains required at the owning product boundary.

## 11. Privacy rule

All v1 messages MUST declare:

```text
privacyClass = PROFESSIONAL_NON_PERSONAL
```

A v1 producer MUST reject export when the payload contains school personal data.

A v1 consumer MUST reject import if a future/unknown privacy classification exceeds its admitted scope.

## 12. Transport independence

The contract is transport-neutral.

Potential future transports include:

- explicit JSON export/import;
- signed package exchange;
- authenticated API;
- institution-managed broker.

None is selected by v1.

The semantic contract MUST remain valid regardless of transport.

## 13. Relationship with Arena `transfer` domain

When runtime implementation is authorized, this contract SHOULD be represented as an external transfer boundary using Arena's existing transfer infrastructure:

- validators;
- structural signatures;
- transfer event log;
- explicit source/target refs;
- fail-closed validation.

Cross-product transfer MUST NOT bypass the existing domain by directly invoking persistence adapters.

## 14. Minimum implementation sequence

1. Freeze product boundary.
2. Add machine-readable v1 types/schema without transport.
3. Add deterministic validation and privacy guard.
4. Add export/import fixtures only.
5. Validate Arena → Docente OS curriculum adoption projection.
6. Validate Docente OS → Arena feedback ingestion as non-canonical evidence.
7. Only after both directions are proven, evaluate a transport mechanism.

## 15. Non-goals v1

- shared login;
- shared database;
- real-time synchronization;
- school personal data;
- student records;
- gradebook interoperability;
- automatic curriculum mutation;
- generic AI conversation state synchronization;
- replication of Docente OS planner/calendar/timetable into Arena.
