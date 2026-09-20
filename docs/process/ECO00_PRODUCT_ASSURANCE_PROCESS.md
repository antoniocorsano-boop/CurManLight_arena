# ECO-00 — Arena product assurance process

Status: PROPOSED_CANONICAL  
Date: 2026-09-20

## Purpose

Map the cross-product ECO-00 process onto Arena's existing exact-SHA, Beta, Human Task and governance discipline.

## Rule

Arena local release gates remain mandatory. A cross-product PASS cannot override an Arena blocker.

## Change classification

An Arena change affecting the ecosystem must be marked:
- LOCAL_PRODUCT;
- CROSS_PRODUCT_COMPATIBLE;
- CROSS_PRODUCT_BREAKING;
- NORMATIVE_IMPACT;
- SECURITY_PRIVACY_IMPACT;
- ACCESSIBILITY_IMPACT;
- AI_POLICY_IMPACT.

## Required evidence for cross-product changes

- owner/responsible role;
- source-of-truth statement;
- contract name + major/minor version;
- fixture;
- producer validation;
- consumer compatibility evidence;
- privacy boundary;
- authority boundary;
- exact SHA;
- compatibility matrix producer/consumer;
- release/rollback/recovery note;
- known limitations;
- closure receipt structure;
- pinned Drive masterplan/process revisions;
- human review where required.

## Contract lifecycle

Compatible:
schema minor → fixture → validator → consumer test → ECO-G2.

Breaking:
new major → migration note → parallel support where required → consumer readiness → ECO-G2.

## Assurance claims

Arena may publish only specific evidence-backed claims.

Examples:
- `FONTE VERIFICATA`;
- `REVISIONE UMANA`;
- `BUILD VERIFICATA`;
- `NESSUN DATO PERSONALE` for a verified public/export boundary.

Each claim must identify subject, version/SHA and evidence.

## CML-A1 acceptance

`CurriculumSnapshot v1` passes when:
- stable ids are deterministic;
- proposal/decision state is preserved;
- no proposed relation is represented as approved;
- provenance is retained;
- no personal data is exported;
- Atlas validates the fixture;
- incompatible versions fail closed;
- a deterministic structural/authority fingerprint is present and validated;
- a fingerprint change triggers downstream revalidation even if the nominal version is unchanged;
- export can be reproduced from a named Arena release.

## Human authority

Arena is the authoritative curriculum system; the competent human/institutional role holds decision authority.

System administrator is never curriculum authority by implication.

The authority boundary is resolved in Arena, not trusted from an inbound deep link.

## Process relationship

Arena Beta security/privacy/accessibility/HIA gates continue unchanged.

ECO-00 adds:
- compatibility;
- shared assurance semantics;
- common handoff identity;
- integrated user-journey validation.


## ECO-00 v0.2 state and contract rules

Canonical boundaries:
- Arena → Atlas: `CurriculumSnapshot v1`;
- Atlas → Docente OS: `LearningObjectManifest v1`;
- `MaterialAssetManifest v1` is the asset sub-contract of the LO manifest;
- Docente OS → Atlas: `TeachingUseReceipt v1`;
- `AtlasLearningObjectRef` is a Docente OS local projection, not a cross-product contract.

State dimensions remain separate:
- LO lifecycle: DRAFT | GENERATED | REVIEWED | CANONICAL | RETIRED;
- assurance: UNVERIFIED | AUTOMATED_PASS | HUMAN_REVIEWED;
- curriculum decision: PROPOSED | APPROVED | REJECTED | SUPERSEDED;
- badges are derived and cannot promote a state.

Drive pin used for this review:
- ECO-00 Masterplan v0.2 — revision 6;
- ECO-00 Product & Assurance Process v0.2 — revision 5;
- verified 2026-09-20.

For ownership, authority, cross-system handoff and execution order, `CML-DOS-INTEGRATED-GOVERNANCE-V1` remains authoritative. Semantic divergence is a blocker pending an explicit mirrored governance amendment.


## Governed-memory precedence

For product ownership, institutional authority, direct Arena → Docente OS curriculum intake/revalidation and execution order, `CML-DOS-INTEGRATED-GOVERNANCE-V1` remains authoritative.

The Arena → Atlas → Docente OS ecosystem path documents publication/navigation/LO flow only. It does not replace the direct governed curriculum handoff into Docente OS.

If ECO-00 Drive text and governed memory diverge on those matters, the change is blocked until an explicit governed-memory amendment is approved and mirrored.

Drive baseline used by this review:
- ECO-00 Masterplan v0.2 — revision 6;
- ECO-00 Product & Assurance Process v0.2 — revision 5;
- verified 2026-09-20.
