# AILit Framework Integration Contract v1

Status: PROPOSED / ARCHITECTURE-ONLY
Date: 2026-08-29
Scope: CurManLight Arena ↔ Docente OS
Source basis: OECD / European Union, *Preparare gli studenti all'era dell'IA — AILit Framework* (2026), Italian edition supplied for analysis.

## 1. Purpose

Define how the AILit Framework may be used across CurManLight Arena and Docente OS without creating a second curriculum authority, bypassing national applicability rules, or allowing AI-generated mappings to become authoritative state.

The governing rule is:

> AILit is an authoritative external reference for AI literacy, not an automatically prescriptive curriculum source. Docente OS preserves and operationalizes the source as professional knowledge; CurManLight Arena governs any institutional curriculum alignment; human authority decides whether an alignment becomes locally required.

## 2. Product boundary

This contract extends, and does not replace, `CML_ARENA_DOCENTE_OS_BOUNDARY_v1.md`.

### CurManLight Arena owns

- institutional curriculum authority and applicability;
- curriculum/version provenance;
- institutional alignment decisions;
- review and approval of mappings between curriculum requirements and external reference frameworks;
- institution-level coverage/coherence analysis;
- reusable institutional design frameworks.

### Docente OS owns

- ingestion and preservation of the original AILit source;
- teacher professional knowledge derived from the source;
- teacher-level search, planning and UDA use;
- operational evidence of how AILit-aligned activities were implemented;
- teacher validation of AI-assisted planning proposals.

No shared database is introduced.

## 3. Authority model

AILit MUST NOT be represented as `NATIONAL_PRESCRIPTIVE` or `INSTITUTIONAL_REQUIRED` by default.

Introduce the semantic authority class:

`EXTERNAL_REFERENCE`

An AILit-derived alignment may become `INSTITUTIONAL_REQUIRED` only through an explicit Arena institutional decision. Until then it remains advisory/reference material.

Required distinctions:

- national applicability authority: determined by Arena runtime rules (e.g. IN2012 / IN2025 by cohort);
- institutional authority: determined by explicit human governance in Arena;
- external reference authority: AILit and similar frameworks;
- operational authority: teacher decisions and execution state in Docente OS.

## 4. Canonical reference concepts

AILit must be represented through existing provenance and contract mechanisms rather than through a parallel knowledge subsystem.

Recommended contract concepts:

```ts
type ReferenceFrameworkAuthority = 'EXTERNAL_REFERENCE'

type ReferenceFrameworkKind = 'AI_LITERACY' | string

interface ReferenceFrameworkRef {
  namespace: string
  frameworkId: string
  versionId: string
  authority: ReferenceFrameworkAuthority
  kind: ReferenceFrameworkKind
  title: string
  publisherRefs: string[]
  sourceRef: CmlCanonicalRef
}

interface ReferenceFrameworkAlignment {
  alignmentId: string
  frameworkRef: ReferenceFrameworkRef
  curriculumNodeRef: CmlCanonicalRef
  referenceElementRef: CmlCanonicalRef
  alignmentType: 'DIRECT' | 'PARTIAL' | 'SUPPORTING' | 'NOT_APPLICABLE'
  rationale: string
  evidenceRefs: CmlCanonicalRef[]
  validationState: 'PROPOSED' | 'HUMAN_REVIEWED' | 'INSTITUTIONALLY_ADOPTED' | 'REJECTED'
}
```

Internal database IDs must not become cross-product semantic identity.

## 5. AILit semantic structure

The integration must preserve, at minimum, the distinctions present in the framework:

- four processes: Interacting with AI, Creating with AI, Managing AI, Shaping AI;
- knowledge;
- skills;
- attitudes;
- competencies;
- learner expectations/progression;
- classroom scenarios;
- transversal ethical principles.

The integration MUST NOT flatten these into one undifferentiated list of "AI competences".

Progression levels must not be treated as rigid age/class equivalence. Teacher and institutional interpretation remains required.

## 6. Arena alignment semantics

Arena may relate AILit elements to existing curriculum nodes and requirements, but the mapping is a proposal until reviewed.

Allowed flow:

`NATIONAL/INSTITUTIONAL CURRICULUM NODE -> AILIT ALIGNMENT PROPOSAL -> HUMAN REVIEW -> OPTIONAL INSTITUTIONAL ADOPTION`

Forbidden flow:

`AILIT ELEMENT -> AUTOMATIC CURRICULUM REQUIREMENT`

An adopted alignment must retain:

- source framework/version;
- exact AILit element identity;
- mapped curriculum node/reference;
- rationale;
- evidence;
- reviewer/decision provenance;
- adoption state.

## 7. Interoperability with Docente OS

AILit alignment should extend the existing Arena → Docente OS planning handoff without modifying the meaning of mandatory curriculum requirements.

Recommended additive payload:

```ts
interface ExternalFrameworkAlignmentPayload {
  frameworkRef: ReferenceFrameworkRef
  alignments: ReferenceFrameworkAlignment[]
  coveragePolicy: 'ADVISORY' | 'INSTITUTIONALLY_REQUIRED'
}
```

Default is `ADVISORY`.

Docente OS may use advisory alignments to suggest activities, UDA, evidence opportunities and reflection prompts, but must not count them as mandatory curriculum coverage unless Arena exports `INSTITUTIONALLY_REQUIRED` with explicit decision provenance.

## 8. Reverse evidence flow

Docente OS may return teacher-confirmed operational evidence such as:

- an activity addressed a specific AILit element;
- students verified AI output against sources;
- students modified/rejected an AI output and justified the decision;
- privacy, bias, sustainability or attribution were explicitly addressed;
- a planned alignment was not pedagogically appropriate in practice.

This flows as:

`TEACHER_OPERATIONAL_EVIDENCE -> EXTERNAL_FRAMEWORK_ALIGNMENT_EVIDENCE -> HUMAN_REVIEW`

It must never mutate Arena curriculum or institutional alignment automatically.

## 9. AI collaboration constraints

Across both products, AI may:

- identify candidate AILit alignments;
- explain relationships;
- find uncovered areas;
- propose classroom activities;
- compare source evidence;
- generate a rationale for review.

AI may not:

- declare an alignment authoritative;
- promote an advisory reference to a mandatory requirement;
- mark institutional coverage as satisfied without evidence;
- overwrite teacher-authored planning;
- infer student competence from tool use alone.

Every proposed alignment must be classified as machine-proposed until human review.

## 10. Product behaviour derived from AILit principles

The framework is also a design reference for product behaviour. Both products should preserve:

- human agency: accept/modify/reject AI output;
- provenance: distinguish source, extraction, inference and generation;
- transparency: expose why a proposal exists;
- privacy and minimization;
- fairness and non-discrimination;
- critical verification of AI outputs;
- explicit responsibility for decisions;
- professional autonomy of the teacher.

These principles reinforce existing Human Task/HIM and AI collaboration rules; they do not create a second governance layer.

## 11. Recommended implementation slices

### AILIT-0 — Source freeze and contract

- store authoritative source metadata and immutable version identity;
- add `EXTERNAL_REFERENCE` authority classification;
- define reference framework and alignment contracts;
- no UI change and no curriculum mutation.

### AILIT-1 — Docente OS ingestion

- ingest the original PDF through the existing Knowledge Base pipeline;
- preserve original asset and processing generation;
- extract typed AILit units with page provenance and human validation state;
- add professional category `REFERENCE_FRAMEWORK` rather than creating a new storage system.

### AILIT-2 — Arena mapping model

- add typed external-framework alignment objects;
- allow mapping to curriculum nodes without changing requirement authority;
- add human review states and provenance;
- reject automatic promotion.

### AILIT-3 — Planning handoff extension

- export advisory AILit alignments alongside the existing curriculum context;
- Docente OS displays them separately from mandatory coverage;
- teacher can use them in UDA/annual-plan authoring.

### AILIT-4 — Operational evidence return

- Docente OS emits teacher-confirmed alignment evidence;
- Arena receives it as review evidence only;
- no automatic canonical write.

### AILIT-5 — Product UI and coverage analysis

Arena:
- institutional AILit coverage/coherence view;
- proposed/reviewed/adopted distinctions;
- no generic AI-literacy chatbot.

Docente OS:
- AILit filters in Conoscenza;
- optional AILit dimension in Progetta/Piano annuale;
- evidence-oriented activity support;
- visible advisory vs mandatory status.

## 12. Acceptance criteria

This integration is acceptable only when:

1. AILit cannot become national or institutional authority by ingestion alone.
2. The original source and its version remain traceable.
3. Derived AILit elements retain provenance and human-validation state.
4. Arena mappings remain proposals until reviewed.
5. Mandatory curriculum coverage is unchanged by advisory AILit mappings.
6. Docente OS preserves teacher operational authority.
7. AI output can always be accepted, modified or rejected.
8. Reverse evidence does not mutate canonical curriculum automatically.
9. Existing Arena ↔ Docente OS interoperability remains versioned and independently deployable.
10. The integration works without student personal data.

## 13. Decision

Do not create an `AILit module`, `AILit database` or second curriculum engine.

Extend the existing architecture with a general `External Reference Framework` capability, using AILit as the first concrete implementation. This keeps the design reusable for future frameworks while preserving the strict authority boundaries already established by Arena and Docente OS.
