# CurManLight Arena ↔ Docente OS — Product Boundary v1

Status: PROPOSED / ARCHITECTURE-ONLY  
Date: 2026-08-26

## 1. Purpose

This document freezes the product boundary between **CurManLight Arena** and **Docente OS** before any runtime integration or feature removal.

The two products MUST remain independently deployable and MUST NOT share a database as a shortcut for interoperability.

- **CurManLight Arena** is the institutional system for curriculum governance, revision, adoption, curricular design and multi-stakeholder decision workflows.
- **Docente OS** is the personal professional operating environment used by a teacher to turn an adopted curriculum into annual planning, UDA, lessons, calendar activity and day-to-day execution.

Interoperability MUST happen through explicit versioned contracts and canonical references.

## 2. Architectural invariants

1. Arena remains authoritative for institutional curriculum state, revision and adoption decisions.
2. Docente OS remains authoritative for the teacher's operational state: planner, timetable, calendar, teaching sessions, personal professional knowledge and classroom execution.
3. A projection, synchronization view or Human Task MUST NOT become a second source of truth.
4. Institutional decisions MUST remain explicitly human-confirmed.
5. No direct cross-product table access is permitted.
6. No automatic write from Docente OS may alter Arena canonical curriculum state.
7. No automatic write from Arena may overwrite teacher-authored operational state in Docente OS.
8. Interoperability v1 is designed to operate without school personal data.
9. Each exchanged object MUST carry provenance, version identity and source-product identity.
10. Both products MUST remain usable when the other product is unavailable.

## 3. Repository evidence

Arena already contains explicit domains for `curriculum`, `revision`, `institution`, `documents`, `ai` and `transfer`, plus feature areas for `curriculum`, `curriculum-etwin`, `progettazione`, `processo`, `guided-workflow`, `workspace`, `documents`, `classroom`, `copilot`, `social` and `ai`.

The existing `transfer` domain already provides contracts, validators, structural signatures, event logs, errors and legacy adapters. Cross-product interoperability therefore extends this architectural boundary rather than introducing a parallel integration mechanism.

Docente OS current product scope includes Oggi/Planner, Conoscenza, Piano annuale, Progettazione, Classi, Orario, Calendario, TeachingSession, settings, versioned UDA and professional export. It is the operational owner of those capabilities.

## 4. Feature classification

Classification vocabulary:

- `KEEP`: remains a first-class Arena capability.
- `REFRAME`: remains in Arena but with a narrower institutional/curricular meaning.
- `MOVE-TO-DOCENTE-OS`: capability ownership belongs to Docente OS; Arena must not develop a competing operational implementation.
- `RETIRE`: no justified product role after boundary consolidation.
- `SHARED-CONTRACT`: concept exists across products only through a versioned interoperability contract; neither product may infer the other's internal storage model.

| Arena area | Classification | Canonical responsibility |
| --- | --- | --- |
| `curriculum` | KEEP | institutional curriculum model, versions, nodes, relationships, adoption context |
| `curriculum-etwin` | KEEP | intelligent/graph projections of canonical curriculum knowledge |
| `curriculum-functional-pilot` | KEEP, then consolidate | experimental curriculum behaviour that must converge into canonical curriculum capabilities rather than become a second product surface |
| `progettazione` | KEEP | curricular design at institutional/disciplinary level and reusable design framework |
| `processo` | KEEP | institutional process, revision lifecycle and decision workflow |
| `guided-workflow` | KEEP | stakeholder-aware Human Task projection and explicit next actions |
| `workspace` | KEEP | institutional collaborative workspace bounded by roles/capabilities |
| `documents` | REFRAME | institutional/curricular documents and provenance; not the teacher's general personal archive |
| `classroom` | REFRAME | curricular class/grade context only; no timetable, daily execution or personal classroom operations |
| `copilot` | REFRAME | specialist assistant for curriculum/governance/process; not a generic daily teacher assistant |
| `ai` | REFRAME | specialist services under institutional and Human Task boundaries; not a standalone product area |
| `session` | REFRAME | Arena application/session context only; not TeachingSession as teacher operational record |
| `social` | REFRAME / REVIEW | retain only collaboration that is demonstrably tied to institutional curriculum processes; otherwise candidate for RETIRE from primary navigation |
| `navigation` | KEEP | navigation of Arena institutional surfaces only |
| curriculum knowledge | KEEP | canonical institutional/curricular knowledge and provenance |
| personal professional knowledge | MOVE-TO-DOCENTE-OS | teacher-owned materials, resources, lesson learning and operational archive |
| annual plan execution | MOVE-TO-DOCENTE-OS | class-specific annual operational plan derived from adopted curriculum |
| UDA authoring/execution | SHARED-CONTRACT | Arena may expose frameworks/templates/alignment; Docente OS owns teacher versioning, adaptation and execution |
| timetable | MOVE-TO-DOCENTE-OS | teacher operational timetable |
| personal/professional calendar | MOVE-TO-DOCENTE-OS | teacher calendar, events and deadlines |
| planner/today | MOVE-TO-DOCENTE-OS | day-to-day teacher activity |
| TeachingSession | MOVE-TO-DOCENTE-OS | controlled record of real teaching activity |
| teacher settings | MOVE-TO-DOCENTE-OS | personal operating preferences |
| institution settings | KEEP | institutional curriculum/process configuration |
| curriculum feedback | SHARED-CONTRACT | evidence contribution from operational practice; never an automatic canonical modification |

## 5. Product responsibility model

### 5.1 CurManLight Arena owns

- national/institutional curriculum representation;
- curriculum versions and provenance;
- revision roadmap and comparison;
- institutional roles and capabilities;
- human-confirmed institutional decisions;
- adoption state;
- vertical/horizontal curriculum coherence;
- institutional curricular design frameworks;
- curriculum graph/eTwin projections;
- stakeholder workflow and evidence;
- institutional curriculum knowledge;
- institutional curricular documents;
- structured contributions to curriculum review.

### 5.2 Docente OS owns

- teacher identity and personal professional workspace;
- Oggi/Planner;
- timetable;
- personal/professional calendar;
- teacher class spaces;
- annual operational planning;
- versioned UDA authored/adapted by the teacher;
- TeachingSession and temporal projection;
- teacher professional knowledge base;
- personal documents and materials;
- daily contextual assistant;
- professional export and teacher-owned authoring history.

## 6. Shared concepts are contracts, not shared persistence

The following concepts cross the boundary and therefore require stable identifiers and versioned payloads:

- `InstitutionRef`
- `SchoolYearRef`
- `CurriculumRef`
- `CurriculumVersionRef`
- `CurriculumNodeRef`
- `DisciplineRef`
- `GradeRef`
- `CurriculumAdoption`
- `AnnualPlanningFramework`
- `PlanningConstraint`
- `UdaFramework`
- `CurriculumAlignment`
- `CurriculumFeedback`
- `InstitutionalDocumentRef`
- `SourceProvenance`

Internal database primary keys MUST NOT be treated as cross-product semantic identity unless explicitly wrapped by a contract identifier.

## 7. Directional flows

### 7.1 Arena → Docente OS

Primary flow:

`ADOPTED_CURRICULUM -> ANNUAL_PLANNING_FRAMEWORK -> TEACHER_ANNUAL_PLAN -> UDA -> ACTIVITY -> TEACHING_SESSION`

Arena may provide:

- adopted curriculum/version;
- applicable discipline and grade scope;
- curriculum nodes and relationships;
- institutional planning constraints;
- reusable UDA frameworks/templates;
- provenance and adoption evidence.

Docente OS decides how these are projected into the teacher's real annual plan. Existing teacher-authored state MUST NOT be overwritten silently.

### 7.2 Docente OS → Arena

Primary flow:

`TEACHER_OPERATIONAL_EVIDENCE -> CURRICULUM_FEEDBACK -> HUMAN_REVIEW -> REVISION_PROPOSAL -> INSTITUTIONAL_DECISION`

Docente OS may submit:

- curriculum feedback;
- teacher-confirmed observations;
- evidence summaries stripped of school personal data;
- reusable UDA outcomes or alignment observations.

Arena receives these as **contributions/evidence**, never as approved curriculum changes.

## 8. Privacy boundary v1

Interoperability v1 MUST be usable entirely within professional non-personal data.

Allowed examples:

- curriculum content;
- objectives and competencies;
- institutional planning rules;
- UDA structures without pupil data;
- aggregate teacher feedback;
- source/document references that contain no admitted personal data.

Excluded from v1:

- pupil identities;
- individual assessment results;
- PDP/PEI personal data;
- family data;
- colleague personal data;
- sensitive/special-category information.

## 9. AI responsibility split

Arena AI is specialist and institutional:

- curriculum comparison;
- coherence analysis;
- revision support;
- provenance-aware synthesis;
- stakeholder/process support;
- proposal generation that remains human-confirmed.

Docente OS AI is operational and personal:

- today/planner assistance;
- annual-plan adaptation;
- lesson/UDA assistance;
- contextual use of teacher knowledge;
- operational suggestions bound to the teacher's real schedule and progress.

A generic cross-product chatbot is explicitly out of scope.

## 10. Consequences for current Arena UI

The following changes are expected in later slices, but are NOT performed by this document:

1. `Classroom` must be renamed/reframed around curricular class/grade context.
2. `Knowledge` must visibly indicate institutional/curricular scope.
3. `Copilot` must become a curriculum/process specialist.
4. `Documents` must be bounded to institutional/curricular content.
5. `Social` must be justified by real institutional collaboration or removed from primary navigation.
6. Arena must not add Planner, timetable, personal calendar or TeachingSession surfaces.
7. Annual planning entry points should project an existing curriculum framework rather than force the user directly into an empty UDA.

## 11. Migration rule

No existing feature is deleted solely because of this classification.

Each later migration MUST:

- identify the current user-visible responsibility;
- identify canonical data dependencies;
- provide a replacement/projection if needed;
- preserve export/provenance where relevant;
- pass Product CI and Human Interaction Model gates;
- avoid hidden state migration between Arena and Docente OS.

## 12. Acceptance criteria for this boundary

This architectural boundary is satisfied when:

- every current Arena product area has an explicit classification;
- ownership of daily teacher operations is unambiguous;
- ownership of institutional curriculum decisions is unambiguous;
- shared concepts are defined as contracts rather than shared tables;
- bidirectional information flow preserves human authority;
- interoperability does not require school personal data;
- no runtime coupling has been introduced by the boundary definition itself.
