# ECO-00 — Arena product assurance process

Status: PROPOSED_CANONICAL  
Date: 2026-09-19

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

- source-of-truth statement;
- contract version;
- fixture;
- producer validation;
- consumer compatibility evidence;
- privacy boundary;
- authority boundary;
- exact SHA;
- release/rollback note;
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
- export can be reproduced from a named Arena release.

## Human authority

System administrator is never curriculum authority by implication.

The authority boundary is resolved in Arena, not trusted from an inbound deep link.

## Process relationship

Arena Beta security/privacy/accessibility/HIA gates continue unchanged.

ECO-00 adds:
- compatibility;
- shared assurance semantics;
- common handoff identity;
- integrated user-journey validation.
