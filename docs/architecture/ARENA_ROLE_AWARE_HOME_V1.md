# Arena Role-aware Home v1

**Stage:** R3 — Runtime candidate  
**Parent contracts:** `ARENA_PROCESS_ROLE_MODEL_V1.md`, `ARENA_WORK_QUEUE_CONTRACT_V1.md`  
**Purpose:** turn Home into a role-aware operational entry point without inventing work or authority.

## Canonical question

> What needs my attention now, what may I actually do, and what may I only inspect?

## Runtime signals used in R3

R3 deliberately uses only state that already exists in the current runtime:

1. user-local knowledge sources that have not yet reached `LOCAL_VERIFIED`;
2. current-discipline revision proposals that do not yet have a local outcome recorded;
3. existing document export history, shown only as completed work.

R3 does **not** fabricate work items for empty pipeline stages and does not infer urgency, institutional responsibility or readiness from AI output.

## Projection

Each runtime signal is converted to an `ArenaWorkItemSeed` and passed through the canonical R2 projector.

The Home consumes only the projected result:

- `ACTIONABLE` → **Da fare** with the allowed next action;
- `READ_ONLY` → **Da seguire** with inspection/navigation only;
- `COMPLETED` → collapsed **Completato** history;
- `HIDDEN` → not rendered.

The Home does not duplicate capability logic.

## Role assurance

R3 uses the locally selected role only as `self-declared` assurance.

`insegnante` maps to the institutional domain role `docente`; the other role labels map directly. Selecting `collegio` locally therefore never creates authenticated decision authority.

A later authenticated-workspace Home may project the same queue with stronger assurance, but it must derive that assurance from real membership rather than from the role selector.

## Role outcomes

- **Docente:** may act on source verification/inspection work supported by its canonical capabilities; review work owned by other roles remains read-only.
- **Dipartimento / Referente:** revision-review work becomes actionable when the canonical capability allows it.
- **Dirigente:** governance/review work follows the canonical capability model; decision authority is not added.
- **Collegio:** locally selected role remains self-declared and cannot become an institutional decision surface.
- **Amministratore:** technical role does not acquire curricular decision capability.

## UX contract

The visual hierarchy is:

`Il mio lavoro → Da fare → Da seguire → Completato → Come funziona → Documenti/handoff`

The former generic journey is retained only under progressive disclosure. The Home must not show invented institutional metrics or pretend that missing runtime state is complete.

Mobile baseline remains 390×844; primary work actions keep a minimum 44px touch target and cards use a one-column flow until wider layouts are available.

## Non-goals

R3 does not:

- implement the Referente whole-school control tower (R4);
- implement P6 canonical adoption (R5);
- add Observer (R6);
- change primary routing;
- create new authority mechanisms;
- use AI to generate work queues;
- automatically advance proposals, decisions or curriculum state.

## Exit gate

R3 is complete when:

- Home derives real runtime signals into R2 work items;
- empty state explicitly avoids fabricated activity;
- `ACTIONABLE`, `READ_ONLY` and `COMPLETED` have distinct UX behavior;
- self-declared Collegio cannot receive implied institutional authority;
- role-specific projection is regression-tested;
- mobile and Human Interaction gates pass on one candidate SHA;
- the batch is merged but not deployed until the planned UX release checkpoint.
