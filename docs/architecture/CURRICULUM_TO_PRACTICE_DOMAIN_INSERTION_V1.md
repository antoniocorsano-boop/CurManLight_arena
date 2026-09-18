# Curriculum-to-Practice Domain Insertion v1

Status: C2P-01 PURE DOMAIN DESIGN CANDIDATE  
Design ID: `CML-DOS-C2P-DOMAIN-INSERTION-V1`  
Date: 2026-09-09  
Scope: Docente OS insertion model, with Arena authority boundaries preserved

## 1. Purpose

This document mirrors the C2P-01 pure-domain insertion design used by Docente OS so that both repositories share the same cross-product semantics before C2P-02 begins.

It defines only the four semantic surfaces justified by the C2P-01 audit:

1. `PlanBlockCurriculumBinding`;
2. `UdaCurriculumBinding`;
3. evidence/feedback/revision/assessment lineage rooted in classroom execution;
4. `CurriculumMigrationImpactManifest`.

It introduces no runtime type, persistence schema, migration, API, UI, deployment or authority transition.

## 2. Canonical tranche naming

The frozen execution order is unchanged:

- `C2P-02` — Arena Curriculum Release Boundary (C1);
- `C2P-03` — Docente OS Curriculum Intake/Revalidation;
- `C2P-04` — Annual Plan Binding;
- `C2P-05` — UDA Binding and Authoring;
- `C2P-06` — Execution, Evidence and Feedback Cycle;
- `C2P-07`/`C2P-08` — professional observation producer/intake;
- `C2P-09` — Curriculum Version Transition;
- `C2P-10` — Golden Path acceptance.

This file remains part of C2P-01. It does not authorize C2P-02.

## 3. Product ownership

### Arena

Arena remains the institutional curriculum authority and owns versioned curriculum release semantics, provenance, applicability, authority state and the governed institutional review chain.

### Docente OS

Docente OS owns teacher professional planning, annual plan, UDA authoring/adaptation, section execution, classroom evidence, feedback, revision, assessment observations and teacher acceptance/revalidation.

### Human authority

Teacher adaptation and assessment judgment remain human professional acts. A binding or automated comparison may support a decision but may not issue it.

## 4. Reuse-first insertion map

| Contract | Existing root | Required semantic delta | Future tranche |
|---|---|---|---|
| C2 | existing Annual Plan engine + accepted curriculum context | thin `PlanBlockCurriculumBinding` | `C2P-04` |
| C3 | existing UDA / Progetta / authored-document history | stable `UdaCurriculumBinding` | `C2P-05` |
| C4 | existing TeachingSession / canonical block allocation | evidence → feedback → response → revision → assessment lineage | `C2P-06` |
| C6 | existing curriculum revalidation / structural-footprint comparison | `CurriculumMigrationImpactManifest` | `C2P-09` |

C1 and C5 are existing channels to evolve, not new surfaces to duplicate.

## 5. `PlanBlockCurriculumBinding`

Docente OS owns the binding; Arena owns the referenced curriculum semantics.

The binding must identify the canonical plan/block, the accepted curriculum context/release, stable outcome/node references, criterion references where applicable and the accepted handoff footprint/provenance.

A later curriculum release must not rewrite historical bindings in place. Future work may be preserved, revalidated, rebound or sent to manual review through the governed transition process.

Forbidden: a second Annual Plan engine, editable copied curriculum master per block, section execution mutating the common sequence, silent rebinding.

## 6. `UdaCurriculumBinding`

The binding is attached to existing UDA/Progetta/authored-document identity and version history. It carries UDA identity/version, related Annual Plan binding/block references, accepted curriculum context/release, stable outcome/node refs, criterion refs and optional section-adaptation delta.

Problem situation, phases, duration, resources, methods, section adaptations, evidence design and teacher revisions remain Docente OS professional content.

Forbidden: parallel C2P UDA archive, automatic UDA clone per section, independently editable curriculum authority inside the UDA, retrospective rewriting after a new release.

## 7. Evidence / Feedback / Revision / Assessment lineage

The local lineage is:

`TeachingSession / SectionExecution -> Evidence -> Feedback -> NextAction -> StudentResponse -> RevisedEvidence -> AssessmentObservation`.

It is owned by Docente OS and rooted in the existing classroom execution record. It must not create a second lesson registry.

All pupil-level data remain in Docente OS. Arena must not receive pupil identity, raw pupil work, pupil feedback history, grades, attendance, private classroom notes or raw classroom events.

Only a later teacher-confirmed professional, non-personal curriculum observation may cross the existing C5 boundary.

## 8. `CurriculumMigrationImpactManifest`

Docente OS owns the impact manifest because it classifies effects on teacher professional work; Arena owns the incoming release semantics that trigger revalidation.

The manifest extends the existing accepted-context/footprint comparison and must classify affected targets with exactly these dispositions:

- `UNCHANGED_COMPATIBLE`;
- `FUTURE_REVALIDATION_REQUIRED`;
- `FUTURE_REBIND_REQUIRED`;
- `HISTORICAL_PRESERVE`;
- `MANUAL_REVIEW_REQUIRED`.

Completed historical sessions, UDA, evidence, feedback and assessment observations remain bound to the context under which they were created.

Forbidden: second migration engine, historical rewrite, silent future rebinding, any manifest state that confers institutional approval.

## 9. Unique cross-product channels

### C1

`CML_LOCAL_HANDOFF_V2` plus Docente OS acceptance/revalidation remains the unique curriculum release/intake boundary. C2P-02/C2P-03 may profile or extend it, never replace it with a competing channel.

### C5

`CurriculumFeedbackDraft/EnvelopeV1` remains the unique professional curriculum-feedback boundary. C2P-07/C2P-08 may extend its professional signal vocabulary without creating a second transport.

## 10. Global invariants

1. Stable references and provenance are preferred over copied authority.
2. Historical work is append/supersede, never silently rewritten.
3. Common plan/UDA nucleus remains distinct from section execution/adaptation.
4. Teacher professional judgment remains human.
5. Pupil-level data remain local to Docente OS.
6. C1 and C5 each remain unique.
7. C6 does not create institutional authority.
8. Every materially relevant binding identifies the accepted curriculum context/footprint that justified it.
9. No shared Arena/Docente OS canonical database is introduced.
10. The canonical C2P tranche numbering remains unchanged.

## 11. Deferred implementation decisions

This design deliberately does not choose table names, migrations, API endpoints, UI, storage technology or deployment sequence. Those belong to the later authorized tranche after exact-head inspection.

## 12. Acceptance

C2P-01 pure-domain design is acceptable only if every justified surface has an explicit owner and reuse root, no duplicate Annual Plan/UDA/C1/C5/migration subsystem is introduced, pupil data remain local, historical work is preserved and no runtime/persistence/UI/deployment mutation occurs in this tranche.