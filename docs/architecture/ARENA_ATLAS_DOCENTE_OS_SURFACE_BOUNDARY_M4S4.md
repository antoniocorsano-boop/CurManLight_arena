# M4-S4 — Arena / Curriculum Atlas / Docente OS Surface Boundary

Status: IMPLEMENTATION CONTRACT
Date: 2026-09-19
Tracker: #284

## Canonical product rule

**CurManLight Arena governs → Curriculum Atlas makes the governed curriculum intelligible and navigable → Docente OS makes it operational.**

This boundary is a product-authority contract, not a deployment shortcut. The three products remain independently deployable and must not share a database or silently mutate each other's state.

## Responsibility classes

- **GOVERN** — institutional/curricular authority, provenance, applicability, human review, validation, approved baseline, versioned handoff.
- **NAVIGATE** — read-only semantic projection, graph traversal, discovery and provenance-aware drill-down.
- **OPERATE** — teacher-owned annual planning, UDA authoring, lesson preparation/execution, materials, evidence and replanning.
- **HANDOFF** — explicit, versioned transfer between authority boundaries; never synchronization by implication.

## Canonical ownership

### CurManLight Arena — GOVERN

Arena owns:
- canonical curriculum sources and provenance;
- institutional applicability and cohort context;
- curriculum review, validation and adoption state;
- approved/provisional curriculum baseline;
- curriculum requirements and constraints;
- institutional process and human authority;
- versioned snapshots and handoffs;
- intake of operational feedback as non-authoritative evidence pending human review.

Arena does **not** own:
- teacher annual-plan execution;
- versioned teacher UDA authoring;
- lesson sequencing, timetable or daily execution;
- teacher-owned materials or evidence archive.

### Curriculum Atlas — NAVIGATE

Atlas owns:
- read-only semantic projection of governed curriculum;
- Verticale, Mappa, Timeline, Matrice, Galaxy/Spatial and Focus views;
- provenance-aware links between curriculum nodes, paths/UDA references, Learning Objects and material references;
- public/professional discovery and comprehension.

Atlas does **not**:
- approve or mutate curriculum;
- author operational UDA;
- become a second curriculum source of truth;
- write into Docente OS;
- infer authority from visualization.

Current published endpoint:
`https://antoniocorsano-boop.github.io/Curriculum-Atlas/`

The current endpoint is an S1 read-only preview. Arena must label it as an exploration preview until ATLAS-P1 publishes the canonical public hub.

### Docente OS — OPERATE

Docente OS owns:
- annual planning;
- teacher UDA authoring/versioning;
- lesson preparation and classroom execution;
- Learning Objects as operational teaching objects;
- material preparation and delivery;
- teaching evidence, progress and replanning;
- teacher-owned operational history.

Docente OS consumes governed curriculum context only through explicit acceptance/revalidation. It never writes directly into Arena canonical state.

## Surface inventory

| Arena surface / capability | Class | M4-S4 disposition |
| --- | --- | --- |
| Curricolo / Esplora / Trama | GOVERN + NAVIGATE | KEEP in Arena for governed reading; Atlas becomes the richer cross-view navigation layer |
| Riesame | GOVERN | KEEP |
| Processo | GOVERN | KEEP |
| Fonti / provenance | GOVERN | KEEP |
| Verifiche | GOVERN | KEEP |
| Institutional documents | GOVERN | KEEP, bounded to curriculum/governance |
| Curriculum graph/eTwin | GOVERN analysis | KEEP where used for governance; public/exploratory navigation converges toward Atlas |
| Progettazione — context entry | HANDOFF | REFRAME as boundary hub |
| Compilatore UDA (wizard) | OPERATE | REMOVE from primary Arena runtime |
| Archivio UDA locale | OPERATE | REMOVE from primary Arena runtime |
| Programmazione annuale locale | OPERATE | REMOVE from primary Arena runtime |
| Suggested UDA import/clone | OPERATE | REMOVE from primary Arena runtime |
| Matrice competenze | GOVERN/NAVIGATE | retain only as read-only curricular support; no operational authoring |
| Planning handoff preview | HANDOFF | KEEP and make primary operational exit toward Docente OS |
| Curriculum Atlas link | NAVIGATE | ADD as explicit read-only exploration path |
| Copilot | GOVERN | retain only as curriculum/process specialist |
| Classroom / daily teaching operations | OPERATE | must not expand in Arena |
| Teacher calendar/timetable/TeachingSession | OPERATE | Docente OS only |
| Curriculum feedback from practice | HANDOFF → GOVERN | receive as evidence only, pending human review |

## M4-S4 primary runtime rule

The primary Arena planning route must not render or expose:
- broad UDA authoring;
- local UDA archive management;
- annual operational planning;
- lesson execution;
- generic teaching-material authoring.

The route instead exposes exactly three user-understandable actions:

1. **Verify governed context in Arena**
2. **Explore relationships in Curriculum Atlas (read-only)**
3. **Prepare an explicit planning handoff to Docente OS**

## Handoff invariants

Every cross-product handoff must preserve:
- source product;
- source version / exact curriculum identity;
- provenance;
- applicability state;
- validation/adoption state;
- target role;
- explicit human acceptance where state can become operational.

No automatic downstream write is permitted.

## Migration policy

The legacy Arena UDA implementation is not deleted in this slice. It is quarantined from the primary runtime so that:
- existing data/export compatibility is not silently broken;
- removal can happen under a dedicated migration with evidence;
- no new product work is built on the legacy authoring surface.

Legacy code remaining in the repository does not imply product ownership.

## Human-facing language

Avoid:
- “Inizia la progettazione” when it means operational UDA authoring inside Arena;
- wording that implies Atlas is authoritative;
- wording that implies Docente OS receives an automatic synchronization.

Prefer:
- “Verifica il contesto curricolare”;
- “Esplora in Curriculum Atlas”;
- “Prepara il passaggio a Docente OS”;
- “anteprima read-only” for the current Atlas S1 publication;
- “trasferimento esplicito e versionato”.

## Exit criteria

M4-S4 is complete only when:
- the primary Arena planning route no longer exposes broad UDA authoring;
- the boundary hub clearly distinguishes Arena, Atlas and Docente OS;
- Atlas is explicitly read-only/non-authoritative;
- the existing Docente OS handoff remains explicit and versioned;
- support/guide language matches the three-layer model;
- source/contract guards prevent reintroduction of primary operational authoring;
- Product CI, Human Interaction Model and browser evidence pass on the exact head;
- the exact Beta is human-reviewed before merge.
