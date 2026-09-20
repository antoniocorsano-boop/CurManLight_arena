# ECO-00 — CurManLight Arena ecosystem role and handoff

Status: PROPOSED_CANONICAL  
Date: 2026-09-20  
Scope: CurManLight Arena ↔ Curriculum Atlas ↔ Docente OS

## Product role

CurManLight Arena is the **authoritative system of record and governance for curriculum state** in the ecosystem.

The authority to approve, reject or adopt curriculum belongs to the competent human/institutional role. Arena records, enforces and audits that authority boundary; it does not become the decision-maker.

Arena owns:
- canonical curriculum sources and baselines;
- revisions and proposal state;
- institutional decision boundaries;
- recorded human/institutional approval/rejection evidence;
- curriculum provenance and audit;
- versioned curriculum snapshots for downstream consumers.

Arena does **not** own:
- daily teacher planning;
- lesson execution;
- student personal data;
- Learning Object runtime use;
- public smart-navigation UX.

## Ecosystem principle

**Arena governs → Atlas makes the curriculum intelligible/navigable → Docente OS makes it operational.**

The three products remain independently deployable and do not share a database.

## Canonical contracts and versions

| Boundary | Canonical contract | Rule |
| --- | --- | --- |
| Arena → Atlas | `CurriculumSnapshot v1` | authoritative curriculum snapshot; read-only for Atlas |
| Atlas → Docente OS | `LearningObjectManifest v1` | owned by Atlas; outside Arena runtime |
| Atlas asset references | `MaterialAssetManifest v1` | asset sub-contract referenced by `LearningObjectManifest v1` |
| Docente OS → Atlas | `TeachingUseReceipt v1` | future minimized use-evidence contract; not an Arena authority signal |
| Cross-product | `AssuranceRecord v1`, `HandoffContext v1`, `NormativeReference v1` | specialized transverse contracts |

`AtlasLearningObjectRef` is a Docente OS local DTO/projection of `LearningObjectManifest v1`; it is not a fourth cross-product contract.

## Canonical outbound contract

Target contract: `CurriculumSnapshot v1`.

Minimum fields:
- snapshot id/version;
- exact source/release identity;
- curriculum node stable ids;
- source/provenance references;
- lifecycle/decision state;
- relationships explicitly approved for publication;
- normative references where applicable.

Arena exports; Atlas consumes read-only.

No downstream system may silently promote a proposal or mutate the Arena baseline.

## Inbound handoff

Atlas may open Arena with a `HandoffContext` containing:
- curriculumNodeId;
- snapshotVersion;
- current relation/LO context;
- requested task, e.g. `PROPOSE_REVISION`.

The handoff does not grant authority. Arena resolves identity/role/decision capability independently.

## Privacy boundary

The curriculum-governance workflow remains professional/curricular and should not require student personal data.

Any future expansion that introduces student data is a separate security/privacy program and cannot be inferred from the current Arena role.

## AI boundary

AI may:
- compare sources;
- identify inconsistencies;
- propose links;
- draft revisions;
- summarize impact.

AI may not:
- approve curriculum;
- grant institutional authority;
- convert proposed relations to approved state;
- bypass a human decision.

## Assurance integration

Arena produces or contributes evidence for:
- FONTE VERIFICATA;
- REVISIONE UMANA;
- curriculum approval state;
- normative source state;
- BUILD VERIFICATA.

Badges are rendered only from `AssuranceRecord` evidence and exact version/SHA.

Do not display generic self-declarations such as “GDPR compliant” or “AI Act compliant”.

## Cross-product gates

Arena participates in:
- ECO-G1 Authority;
- ECO-G2 Contract compatibility;
- ECO-G3 Normative coherence;
- ECO-G4 Data integrity & provenance;
- ECO-G5 Privacy;
- ECO-G6 Security;
- ECO-G7 Accessibility;
- ECO-G8 Human interaction;
- ECO-G9 AI governance;
- ECO-G10 Recovery;
- ECO-G11 Release/operations;
- ECO-G12 Real-user validation.

Existing Arena Beta gates remain authoritative for Arena release readiness. ECO gates add cross-product compatibility; they do not weaken product-local gates.

## Target milestone

### CML-A1 — Arena → Atlas canonical snapshot handoff

Deliver:
1. `CurriculumSnapshot v1` schema;
2. deterministic export;
3. exact release/source identity;
4. fixture;
5. contract validation;
6. no personal data;
7. Atlas consumer test;
8. failure closed on incompatible schema/source state.

## State separation

The ecosystem keeps these state dimensions distinct:

- `loLifecycle`: DRAFT | GENERATED | REVIEWED | CANONICAL | RETIRED;
- `assuranceState`: UNVERIFIED | AUTOMATED_PASS | HUMAN_REVIEWED;
- `curriculumDecisionState`: PROPOSED | APPROVED | REJECTED | SUPERSEDED, where applicable;
- display badges are derived projections only.

A lifecycle value such as REVIEWED does not imply HUMAN_REVIEWED assurance or institutional approval.

## ECO-00 slice governance

- Owner: cross-product ECO-00 governance with final human review.
- Source of truth: ECO-00 Drive Masterplan + Product & Assurance Process.
- In scope: role, authority, contract vocabulary, compatibility, privacy and evidence semantics.
- Out of scope: runtime coupling, shared DB, student-data transport, automatic state promotion.
- Compatibility: v1 major contracts; compatible minors require fixture/validator/consumer evidence; breaking changes require a new major.
- Rollback: revert the documentation PR/revision; no runtime mutation is introduced here.
- Known limitation: these documents define contracts; they do not implement the contracts.
- Closure receipt: exact PR head + pinned Drive revisions + cross-product human review.

## Canonical Drive pin

- Masterplan: **ECO-00 v0.2**, Drive revision **5**, verified 2026-09-20.
- Product & Assurance Process: **v0.2**, Drive revision **4**, verified 2026-09-20.
- If repository text diverges semantically, the pinned Drive canonical documents prevail until an explicit coordinated revision updates both sides.

## References

Cross-product masterplan:
https://docs.google.com/document/d/1DFiwpEXcZqPp2Aqvo5Q13sd4wkp22CnzhRrrkJMSWiM/edit

Cross-product assurance process:
https://docs.google.com/document/d/199ZL3s8M6YLArcB_4nCv2uRePZJBbqwq0ky78-7zvU0/edit

Assurance & Gate Registry:
https://docs.google.com/spreadsheets/d/1-rZsKRPXxFZQzTrK7DAno6TUiZsXywSkSdnbB4Dwvpw/edit
