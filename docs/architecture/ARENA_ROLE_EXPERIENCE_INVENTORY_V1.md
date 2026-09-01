# Arena Role Experience Inventory v1

**Status:** CURRENT-STATE AUDIT / NON-MUTATING  
**Base:** `main@9240d63ec4e8b1c03af0d39aa0e649f0af2d4d3a`  
**Parent contract:** `ARENA_PROCESS_ROLE_MODEL_V1.md`

## 1. Purpose

This inventory records what roles actually see and can do in the current Arena runtime. It does not describe an aspirational UI and does not grant new capabilities.

Audit rule:

`CURRENT RUNTIME ≠ TARGET ROLE EXPERIENCE`

The target is derived from the canonical process/role contract only after the current state is made explicit.

## 2. Cross-cutting finding

Arena already separates **self-declared local role** from **authenticated workspace membership** correctly at the institutional decision boundary. However, most first-class product surfaces are still common surfaces rather than capability/task-shaped role experiences.

Current pattern:

`same navigation + same surface → role label/context → occasional role-specific copy`

Target pattern:

`effective capability + Human Task → relevant work queue → evidence/state → allowed action → next actor`

## 3. Surface inventory

### Home

**Current state:** PARTIALLY ROLE-AWARE

Observed:
- `DashboardView` selects role-specific orientation copy and one primary action.
- All roles still receive the same four-step institutional journey: context → sources → proposal → decision.
- All roles receive the same final document/handoff card.

Mismatch:
- role orientation exists, but the body is not a role-specific work queue;
- Amministratore still sees the curriculum journey despite its primary object being workspace integrity;
- Collegio/Dirigente see generic preparation language instead of only the institutional items requiring their attention.

Target:
- Home becomes `Il mio lavoro` derived from effective capability and current process state.

### Curricolo

**Current state:** COMMON SURFACE

Observed:
- `CurriculumTab` does not receive a role/capability input;
- consultation, temporal comparison and local update/population controls are presented from the curriculum state, not from actor responsibility;
- AppViewsLayer adds the same teacher-oriented guidance around the surface for every role.

Mismatch:
- Docente, Dipartimento, Referente, Collegio, Dirigente and Amministratore can enter the same curriculum experience even though their questions differ;
- role/capability is not used to prioritize inspect vs analyse vs update actions.

Target:
- same canonical curriculum data, different task framing and actions;
- read access remains broad, mutation/proposal actions become capability-aware.

### Fonti

**Current state:** COMMON LOCAL SOURCE REGISTRY

Observed:
- `FontiTab` does not receive a role/capability input;
- all users can see bundled sources, add local sources and perform local source verification;
- authority and retrieval eligibility are correctly kept separate.

Mismatch:
- no role-specific source work queue exists;
- Referente cannot immediately see source blockers across the curriculum;
- Collegio/Dirigente see operational local upload/verification actions even when their primary task is review/governance.

Target:
- preserve one source registry;
- vary default focus/actions by task and capability, never by cosmetic hiding alone.

### Revisione

**Current state:** MIXED — COMMON LOCAL WORKFLOW + AUTHENTICATED DECISION BOUNDARY

Observed:
- structured proposal transitions such as prepare, submit, take in charge, request changes and admit to decision are rendered without a role/capability input;
- legacy local proposal choices remain present;
- `InstitutionalDecisionPanel` separately requires authenticated workspace state and only permits the current `collegio` decision capability.

Strength:
- institutional decision authority fails closed and is not unlocked by the locally selected role.

Mismatch:
- local workflow responsibility is not reflected in the UI;
- Docente can see review-stage transitions that conceptually belong to Dipartimento/Referente;
- Collegio can see preparation mechanics that should normally arrive already review-ready;
- role boundaries are therefore cognitively weak even where formal authority remains technically protected.

Target:
- proposal preparation, review and decision become distinct role work queues over the same canonical proposal archive.

### Conoscenza

**Current state:** COMMON SUPPORT SURFACE

Observed:
- shared supporting surface for source reading/search/relations;
- not currently a first-class primary navigation item;
- retrieval authority is governed separately from the actor role.

Mismatch:
- contextual entry is not yet shaped around the current Human Task;
- whole-school reviewer needs differ from teacher consultation but share the same entry model.

Target:
- remain supporting, not become another authority surface;
- open from a work item/evidence need whenever possible.

### Documenti / Handoff

**Current state:** COMMON OUTPUT SURFACE

Observed:
- Planning handoff preview and document/export UI are rendered for the common surface;
- no role-specific entry framing is applied at AppViewsLayer level.

Mismatch:
- Docente, Referente, Collegio, Dirigente and Amministratore do not have the same reason to export/handoff;
- the current Home also promotes document creation to every role.

Target:
- output choices derive from capability and process state;
- planning handoff remains explicit and human-confirmed;
- governance/report exports remain separate from teacher handoff intent.

### Guida / Supporto

**Current state:** COMMON INFORMATIONAL SURFACE

Observed:
- same support navigation for all roles;
- no authority consequence.

Mismatch:
- low severity; role-specific recovery/help can be added only after canonical role surfaces stabilize.

Target:
- keep common core help, add contextual recovery links from work items.

## 4. Navigation inventory

`AppSidebar` exposes the same primary navigation to every actor and receives no role/capability input.

Current primary items:
- Home;
- Consulta il curricolo;
- Rivedi le proposte;
- Controlla le fonti;
- Crea un documento;
- Controlli e checklist;
- Guida.

Finding:

**Navigation currently expresses product areas, not actor work.**

This is not itself an authority vulnerability, but it produces cognitive load and allows users to enter tasks that are not theirs before later controls stop consequential actions.

## 5. Role-by-role current/target gap

| Role | Current dominant experience | Target dominant experience | Gap |
| --- | --- | --- | --- |
| Docente | role-oriented Home, then common surfaces | applicable curriculum + own proposals + handoff | MEDIUM |
| Dipartimento | Home points to Revisione, then common workflow | discipline gap/review queue | HIGH |
| Referente | Home points to Revisione, no whole-school queue | cross-discipline readiness/control tower | CRITICAL |
| Collegio | common revision mechanics + protected decision panel | decision-ready items only | HIGH |
| Dirigente | common revision mechanics, no readiness cockpit | governance/readiness/blockers | HIGH |
| Amministratore | curriculum-oriented Home/navigation | workspace integrity/admin queue | CRITICAL |

## 6. Existing correct boundaries to preserve

Do not regress:
- self-declared role does not authenticate the user;
- local role does not grant `REVISION_DECIDE`;
- institutional decision requires authenticated workspace membership;
- source verification does not confer normative/institutional authority;
- export/handoff does not imply adoption;
- proposal does not imply decision.

## 7. R1 exit findings

Every canonical surface now has a defined current actor/task assessment.

Primary product gaps handed to R2:

1. no canonical work-item model;
2. no role-aware work queues;
3. navigation is area-based and role-agnostic;
4. local revision transitions are cognitively role-agnostic;
5. Referente whole-school readiness view is absent;
6. Amministratore role experience is substantially mismatched;
7. canonical adoption P6 remains absent and must not be simulated by role UX.

## 8. Next action

Proceed to **R2 — Work Queue Contract** without changing routes or hiding current surfaces yet.

R2 must define a deterministic, read-only projection:

`process state + evidence/blockers + effective capability → work item`

A work item must state:
- why it needs attention;
- evidence/state;
- required capability;
- allowed next action;
- next actor;
- whether the action is consequential;
- whether authenticated authority is required.

Only after that contract passes should R3 mutate Home into a role-aware work queue.
