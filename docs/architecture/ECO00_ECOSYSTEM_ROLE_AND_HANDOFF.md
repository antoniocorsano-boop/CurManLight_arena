# ECO-00 — CurManLight Arena ecosystem role and handoff

Status: PROPOSED_CANONICAL  
Date: 2026-09-19  
Scope: CurManLight Arena ↔ Curriculum Atlas ↔ Docente OS

## Product role

CurManLight Arena is the **curriculum governance authority** of the ecosystem.

Arena owns:
- canonical curriculum sources and baselines;
- revisions and proposal state;
- institutional decision boundaries;
- human approval/rejection;
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

## References

Cross-product masterplan:
https://docs.google.com/document/d/1DFiwpEXcZqPp2Aqvo5Q13sd4wkp22CnzhRrrkJMSWiM/edit

Cross-product assurance process:
https://docs.google.com/document/d/199ZL3s8M6YLArcB_4nCv2uRePZJBbqwq0ky78-7zvU0/edit

Assurance & Gate Registry:
https://docs.google.com/spreadsheets/d/1-rZsKRPXxFZQzTrK7DAno6TUiZsXywSkSdnbB4Dwvpw/edit
