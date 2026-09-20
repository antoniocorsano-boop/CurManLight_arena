# ECO-01/S1 — CurriculumSnapshot v1 contract profile

Status: **ARCHITECTURE_ONLY / MATURITY_REQUIRED / RUNTIME_DEFERRED**  
Date: 2026-09-20  
Program: ECO-01  
Governed memory: `CML-DOS-INTEGRATED-GOVERNANCE-V1`

## Purpose

Freeze the Arena-side producer contract needed to demonstrate lesson preparation in Docente OS without adding transport or runtime coupling.

ECO-01 uses the external name **`CurriculumSnapshot v1`** for the already-governed Arena release projection implemented by `CML_CURRICULUM_RELEASE_CONTRACT_V1`.

This is a semantic profile, **not a second transfer domain**.

Canonical producer implementation remains:

- `src/domain/transfer/interopCurriculumContextV2.ts`
- `src/domain/transfer/curriculumReleaseContractV1.ts`
- `CML_LOCAL_HANDOFF_V2`
- `CML_CURRICULUM_RELEASE_CONTRACT_V1`

## Authority boundary

The direct Arena → Docente OS intake/revalidation boundary remains canonical.

Atlas is not part of this authority handoff. Atlas may later supply subordinate public LO/material references, but it cannot replace, reinterpret or promote the Arena curriculum state.

## CurriculumSnapshot v1 required semantics

The snapshot must expose:

- immutable curriculum identity;
- curriculum version reference;
- explicit authority state;
- authority receipt only when actually approved;
- applicability context;
- source/provenance references;
- curriculum node and requirement references useful for planning;
- issuance/acquisition identity;
- privacy class `PROFESSIONAL_NON_PERSONAL`;
- downstream policy `PREVIEW_ONLY`, acceptance required, automatic writes forbidden;
- deterministic **structural/authority fingerprint**.

The machine-readable schema for the ECO-01 profile is:

`docs/contracts/CURRICULUM_SNAPSHOT_V1.schema.json`

## Structural/authority fingerprint

The fingerprint is inherited from the existing `CML_LOCAL_HANDOFF_V2.structuralFootprint` and covers the meaningful curricular context plus the annual-planning framework.

It is intentionally independent of issuance time.

Required behavior:

1. same semantic structure + different issuance time → same fingerprint;
2. meaningful curriculum or authority change → different fingerprint;
3. nominal `curriculumVersionRef` may remain unchanged;
4. mismatch/tampering → fail closed;
5. downstream consumer must require revalidation when the fingerprint changes.

ECO-01 fixture pair:

- baseline: `eco01-curriculum-snapshot-technology-grade1.json`;
- same nominal version, changed structural footprint: `eco01-curriculum-snapshot-technology-grade1-same-version-changed.json`.

The fixture pair intentionally retains the same `curriculumVersionRef` while using different fingerprints.

## Planning semantics

For ECO-01/S1 the producer does not author the teacher's lesson.

Arena provides only the authoritative curricular frame:

- discipline;
- grade/applicability;
- requirement/node references;
- authority/provenance;
- fingerprint.

Docente OS owns the mapping into its operational lesson model.

## Failure policy

Reject/hold closed when:

- contract major is unsupported;
- authority state is not recognized;
- approved state has no decision receipt;
- provisional state claims an approval receipt;
- provenance is empty;
- applicability is unresolved;
- fingerprint is absent or invalid;
- downstream policy permits an automatic write.

## Non-goals

- API or background sync;
- new database;
- new shared persistence;
- Atlas as curriculum authority;
- automatic mutation of Docente OS;
- student personal data;
- activation of DOS-A1.

## S1 evidence

S1 Arena evidence is complete only when:

- the schema and fixtures are versioned;
- the existing validator remains the implementation authority;
- same-version structural change is proven detectable;
- exact-head gates pass;
- Docente OS consumer mapping references the same semantic profile.
