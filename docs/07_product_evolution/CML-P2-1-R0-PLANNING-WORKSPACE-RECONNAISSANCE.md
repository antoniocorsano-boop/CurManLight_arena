# CML-TARGET-P2.1 — R0 Planning Workspace Reconnaissance

Date: 2026-08-10  
Baseline observed: `0c15db5` (P1.3-R1 closure)  
Mode: read-only reconnaissance; no runtime change authorized or made.

## Central question

Can the current PLAN be turned into the canonical planning workspace, or do competing models need reconciliation first?

**R0 answer:** competing models exist and must be reconciled before the next implementation slice.

## Current runtime map

| Candidate target | Current runtime surface | Actual role today |
|---|---|---|
| PLAN-01 — Le mie progettazioni | `ProgettazioneTab` home and `ArchivioUdaView` (`activeProgTab = 'uda'`) | Entry cards, timeline, filters, search and saved-UDA list; not a single coherent “my work” view |
| PLAN-02 — Workspace | `ProgettazioneAnnualeView` (`activeProgTab = 'annuale'`) | Grid or five-step wizard; form state is local to the session and draft fields are persisted as separate local-storage keys |
| PLAN-03 — UDA/result | `UdaModel`, `ArchivioUdaView`, `UdaDetailModal`, clipboard/SCORM actions | Generated artifact and detail/export surface; the model stores plain text arrays rather than structured curriculum references |

The visible planning area therefore combines an entry surface, a form editor, an archive and a result modal without a single canonical work identity or lifecycle.

## Models and persistence found

### 1. Legacy planning artifact: `UdaModel`

`src/types/curriculum.ts` defines `UdaModel` with:

- title, discipline, order, period and hours;
- status values (`bozza`, `in revisione`, `pronta per confronto`, `validata`, `archiviata`);
- `traguardi`, `obiettivi` and `evidenze` as `string[]`;
- task, notes and timestamps.

`handleGenerateUda` creates a new record in `savedUda`. The selected curriculum content is copied as text; node identity, curriculum version and provenance are not part of the UDA record.

### 2. Canonical transfer record: `DesignCurriculumSelection`

P1.3-E writes a structured A02→A04 selection to `designArchive`. It preserves:

- source curriculum node and version references;
- snapshot text;
- qualification (`current-curriculum`);
- source/evidence references;
- transfer timestamp and structural footprint.

`DesignSelezioniPanel` now displays this record in PLAN-02. It is visible in the workspace, but it is not yet attached to the generated `UdaModel` or to a specific draft identity.

### 3. Draft state

`useUdaProgrammingHandlers` persists title, period, status, hours, notes, task and co-authors as separate local-storage keys. `saveProgDraft` confirms saving but does not create a structured draft record, draft identifier, version or explicit recovery item.

### 4. Guided workflow model

`GuidedTeacherWorkflowState` and `useGuidedWorkflow` define a separate state machine with context, curriculum references, teaching-design reference, document reference and warnings. The components are exported and tested, but no mounted PLAN runtime component currently composes them into `ProgettazioneTab`.

### 5. Saved-UDA persistence

`savedUda`, `designArchive` and `guidedWorkflowState` are persisted through the Zustand/Dexie-backed store, while the active planning form is persisted through local-storage keys. These persistence paths do not share one work identity or one lifecycle.

## Existing capabilities

| Capability | Evidence | R0 assessment |
|---|---|---|
| Start a new UDA | Grid and wizard in `ProgettazioneAnnualeView` | Exists, but entry intent is mixed with annual planning language |
| Continue a partially filled form | Local-storage field persistence and wizard step persistence | Partial; no structured draft/recovery object |
| Save an artifact | `addUda` → `savedUda` | Exists, but generated artifact is always created as `bozza` |
| Find prior artifacts | Archive filters, search and sorting | Exists and is the strongest current PLAN capability |
| Inspect an artifact | `UdaDetailModal` | Exists; result is primarily a text-oriented view |
| Clone/adapt an artifact | `handleCloneUdaAdaptive` | Exists; may realign text by keywords and does not preserve canonical source identity |
| Transfer curriculum reference | A02→A04 `DesignCurriculumSelection` | Exists after P1.3; currently separate from `UdaModel` |
| Produce a document | Clipboard text, SCORM and document area integrations | Partial; output and source semantics are not one coherent result lifecycle |
| Recover deleted work | `deleteUda` / `clearUdaLibrary` | Not available; deletion is permanent after confirmation |
| Manage lifecycle/version | Status vocabulary exists | Partial; most states are not operationally driven and no version history exists |

## Competing workflows and duplication

1. **Grid vs wizard:** two editing grammars operate on the same form state. Grid exposes the whole form; wizard presents five steps. The wizard sequence does not fully represent the same data emphasis as the grid.
2. **Planning form vs guided workflow:** a second guided workflow domain models context → curriculum → design → document, but is not the mounted PLAN editor.
3. **Draft vs saved UDA:** draft fields live in local storage; the saved artifact lives in `savedUda`; neither has a common work identifier.
4. **Transfer selection vs UDA content:** the structured P1.3 reference lives in `designArchive`, while the generated UDA stores copied strings.
5. **Archive vs recent activity:** the archive is the operational list; Dashboard recent activity is a separate projection of saved UDAs and exports.
6. **Workspace sub-tabs:** `annuale`, `uda`, `certificazione`, `classe-home`, `classe` and `social` are exposed as one planning area, although several represent distinct products or downstream activities.

## Main gaps against PLAN-01/02/03

### PLAN-01 — Le mie progettazioni

- No explicit canonical list of drafts, active designs and completed UDAs together.
- The home timeline can show synthetic suggested content when no real UDA exists.
- The archive is useful, but it is artifact-centric rather than work-centric.
- “Riprendi” is not tied to a structured draft identity.

### PLAN-02 — Workspace

- The teacher does not see one clear work status, next action and completion path.
- The transferred curriculum reference is visible, but not yet consumed structurally by the editor or the generated UDA.
- Grid and wizard are parallel presentations rather than projections of a clearly defined canonical work model.
- Empty/incomplete work can still reach generation with limited validation.
- Context is distributed across global discipline/order/class state and form fields.

### PLAN-03 — UDA/result

- `UdaModel` loses node/version/provenance semantics after generation.
- Status values do not represent a demonstrated lifecycle.
- Detail and export are available, but the final professional result is still largely plain text.
- Cloning can change alignment without an explicit source-version decision.
- The relationship between UDA, class use and later document/output steps is not a single traceable chain.

## Highest-value reconciliation decision

Before implementation, P2.1 must decide what the canonical planning object is and how these records relate:

```text
planning work / draft
    ├── selected curriculum references (structured, versioned)
    ├── editable design content
    ├── lifecycle/status
    ├── target class and context
    └── resulting UDA/document views
```

The current evidence does not justify choosing `UdaModel`, `DesignCurriculumSelection` or `GuidedTeacherWorkflowState` alone as the final object. They have different responsibilities and currently overlap at the PLAN boundary.

## Recommended P2.1-R1 decision inputs

The next design step should define, before coding:

1. whether PLAN-01 lists workspaces/drafts, UDA artifacts, or both;
2. whether PLAN-02 edits a draft that later produces PLAN-03, rather than directly creating a detached UDA;
3. how P1.3 curriculum selections remain attached to that draft and its resulting UDA;
4. which of grid, wizard and guided-workflow grammar is canonical, and which are views or legacy paths;
5. the minimum lifecycle: new → in progress → ready → used/exported, including resume behavior;
6. how class, school order, discipline, academic year and curriculum version are shown and preserved;
7. what validation prevents an apparently complete but pedagogically empty UDA;
8. whether archive, dashboard recent activity and document output are projections of the same work identity.

## R0 verdict

```text
CML_TARGET_P2_1_R0_PLANNING_RUNTIME_RECONSTRUCTION_COMPLETE
CML_TARGET_P2_1_COMPETING_PLANNING_MODELS_CONFIRMED
CML_TARGET_P2_1_CURRICULUM_REFERENCE_ENTRY_CONFIRMED
CML_TARGET_P2_1_CANONICAL_WORK_OBJECT_DECISION_REQUIRED
CML_TARGET_P2_1_RECONCILIATION_REQUIRED_BEFORE_RUNTIME
NO_RUNTIME_CHANGE_AUTHORIZED
```
