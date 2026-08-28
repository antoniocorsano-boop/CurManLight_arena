# CurManLight Arena — BETA-G5 Human Interaction Acceptance Pack

Status: `PREPARED_FOR_HUMAN_EXECUTION`  
Release under review: `5ffba536c5863bd7b461bcd3d130cc900a46a55f`  
Published Beta: `https://antoniocorsano-boop.github.io/CurManLight_arena/`  
Gate: `BETA-G5 — Human Interaction Acceptance`  
Exit label: `BETA_HIA_PASS`

## Purpose

This pack is the human-execution contract for G5. It does not promote the gate automatically and it does not substitute browser automation, CI, or a simulated review for human judgement.

G5 is satisfied only when a human reviewer has exercised the Beta-critical Human Tasks on desktop and mobile, recorded the relevant interaction states, and produced a signed-off receipt with no unresolved blocking human-interaction finding.

G6 accessibility acceptance is explicitly out of scope here.

## Frozen Beta-critical Human Tasks

1. `HT-BETA-CURRICULUM-CONTEXT`
2. `HT-BETA-REVISION-PREPARE`
3. `HT-REVISION-DECISION`
4. `HT-BETA-PLANNING-HANDOFF`

The canonical journey remains:

`curriculum context → revision inspection/preparation → institutional decision boundary → resulting curriculum baseline → planning handoff`

Knowledge/KX may be inspected as a supporting surface, but it is not a substitute for the four critical Human Tasks above.

## Human reviewer rule

For every observation use exactly one result:

- `PASS` — understandable and usable without developer explanation;
- `BLOCK` — interaction defect prevents safe/clear completion or recovery;
- `NOT_OBSERVABLE` — state cannot be produced safely in the current published Beta.

`NOT_OBSERVABLE` is not PASS. A consequential state must never be fabricated merely to complete the checklist.

The current Beta intentionally has no active collegio membership after the B3 rehearsal. Therefore an authorized institutional decision may be marked `NOT_OBSERVABLE` unless a real bounded authorized test workspace is intentionally re-established. The blocked/no-authority path must remain observable and fail closed.

## Devices

### Mobile

Use the published Beta in a normal mobile browser. Baseline viewport class: approximately `390 × 844`.

### Desktop

Use the same published release in a normal desktop browser, without developer tools being required for normal task completion.

Do not rely on prior familiarity with implementation names while judging whether the UI explains itself.

## Observation dimensions

For each task and state assess:

- **orientation** — can the reviewer tell where they are and what the task is;
- **primary action** — is the next meaningful action evident;
- **language** — labels describe the user task rather than implementation details;
- **status** — provisional/approved/blocked/error state is understandable;
- **evidence/provenance** — the basis of a claim/action can be inspected where required;
- **authority** — proposal, recommendation and institutional decision are not conflated;
- **consequence** — consequential actions explain what will and will not happen;
- **recovery** — after a blocked/error state the next safe action is clear;
- **continuity** — refresh/re-entry or task switching does not create a misleading state;
- **mobile comfort** — no essential action is hidden by layout, nested scrolling, or modal collision.

A task is not accepted merely because it can technically be completed.

---

## G5-1 — Curriculum context

Human Task: `HT-BETA-CURRICULUM-CONTEXT`

Human goal: understand which curriculum framework applies and why.

### Required observations

| Observation | Desktop | Mobile | Expected human outcome |
| --- | --- | --- | --- |
| valid curriculum context | PENDING | PENDING | framework/applicability/state are understandable |
| provenance inspection | PENDING | PENDING | reviewer can understand where the applicable context derives from |
| invalid/incomplete context | PENDING | PENDING | product does not invent applicability |
| recovery from invalid context | PENDING | PENDING | missing context and next action are clear |

### Blocking findings

- user must manually infer/select the governing norm without explanation;
- provisional and approved state are visually or semantically confused;
- missing context silently produces an apparently valid result;
- provenance exists technically but cannot be understood by a normal reviewer.

---

## G5-2 — Revision preparation / inspection

Human Task: `HT-BETA-REVISION-PREPARE`

Human goal: understand a proposal, its rationale/evidence/state/responsibility, and prepare or inspect it without confusing proposal with decision.

### Required observations

| Observation | Desktop | Mobile | Expected human outcome |
| --- | --- | --- | --- |
| draft/proposal inspection | PENDING | PENDING | proposal purpose and status are immediately understandable |
| evidence disclosure | PENDING | PENDING | evidence can be inspected without losing task context |
| missing rationale/evidence blocked state | PENDING | PENDING | missing requirement is explicit |
| read-only/unauthorized path | PENDING | PENDING | lack of edit authority is understandable and safe |
| stale/re-entry recovery when observable | PENDING | PENDING | user is directed to current state without silent overwrite |

### Blocking findings

- proposal appears to be an institutional decision;
- evidence is hidden behind technical jargon or unexplained identifiers;
- blocked state has no clear reason or recovery action;
- a draft can be lost or silently replaced during recovery.

---

## G5-3 — Institutional decision boundary

Human Task: `HT-REVISION-DECISION`

Human goal: understand that an institutional decision is consequential, human, evidence-based and authority-bound.

### Required observations

| Observation | Desktop | Mobile | Expected human outcome |
| --- | --- | --- | --- |
| no-authority / blocked path | PENDING | PENDING | product clearly refuses institutional action |
| evidence and consequence before decision | PENDING or NOT_OBSERVABLE | PENDING or NOT_OBSERVABLE | reviewer understands evidence, responsibility and consequence |
| explicit outcome choice | PENDING or NOT_OBSERVABLE | PENDING or NOT_OBSERVABLE | no outcome is preselected or implied |
| explicit human confirmation | PENDING or NOT_OBSERVABLE | PENDING or NOT_OBSERVABLE | consequential action requires deliberate confirmation |
| receipt / refresh-re-entry | PENDING or NOT_OBSERVABLE | PENDING or NOT_OBSERVABLE | recorded outcome remains legible and distinct from curriculum mutation |

### Authority constraint

Do not reactivate a revoked membership or invent an authorized user to obtain a PASS. If authorized execution is not intentionally available for this G5 session, record those observations as `NOT_OBSERVABLE` and keep G5 open for that portion.

### Blocking findings

- displayed/self-declared role appears sufficient to decide;
- approval/rejection is preselected;
- proposal wording is presented as the system's decision;
- user cannot tell whether a click records an institutional decision or changes the curriculum automatically;
- no safe return path exists when authority/evidence is incomplete.

---

## G5-4 — Planning handoff / Export

Human Task: `HT-BETA-PLANNING-HANDOFF`

Human goal: preview what is handed downstream, understand provenance and approval state, and understand that downstream teacher work is not mutated automatically.

### Required observations

| Observation | Desktop | Mobile | Expected human outcome |
| --- | --- | --- | --- |
| valid preview | PENDING | PENDING | reviewer understands what will be handed off |
| provisional-state warning | PENDING | PENDING | provisional content cannot be mistaken for approved baseline |
| validation-failed / incomplete state | PENDING | PENDING | invalid bundle is not exported silently |
| consequence explanation | PENDING | PENDING | downstream acceptance requirement is explicit |
| explicit export/handoff action | PENDING | PENDING | user deliberately initiates the handoff |
| recovery after blocked export | PENDING | PENDING | missing requirement and next action are understandable |

### Blocking findings

- wording suggests automatic synchronization into Docente OS;
- export state/provenance is unclear;
- a provisional/invalid baseline looks final;
- error state strands the reviewer or loses the preview context.

---

## Cross-state coverage

G5 requires human evidence across these interaction classes where safely observable:

| State class | Required evidence |
| --- | --- |
| empty | task remains understandable before data/result exists |
| loading | user can tell the system is working and should wait |
| success | result, status and next action are clear |
| blocked | reason, authority/requirement boundary and next safe action are clear |
| error | failure is understandable without implementation jargon |
| recovery | user can return to a valid state without destructive ambiguity |

Automation may help produce a state, but the acceptance judgement must be human.

## Supplemental KX check

Because KX-0/KX-1 are part of the current published Beta, the reviewer should also record whether the supporting `Conoscenza e fonti` surface causes confusion during the journey:

- `Cerca e chiedi` is task-first and clearly marks generated output as something to verify;
- `Relazioni` is visibly fail-closed and does not expose the legacy technical graph;
- `Termini chiave` uses understandable text and local-source/provenance cues;
- `Archivio storico` does not surface WikiLLM/technical controls.

A KX defect is G5-blocking only if it materially obstructs or misleads the Beta-critical journey.

## Acceptance rule

`BETA_HIA_PASS` may be recorded only when:

1. mobile and desktop human review are both complete;
2. every required safely-observable item is `PASS`;
3. no item is `BLOCK`;
4. any `NOT_OBSERVABLE` consequential item has an explicit reason and does not conceal a required available path;
5. the reviewer confirms that proposal, authority, decision, curriculum state and planning handoff remain semantically distinct;
6. the completed receipt refers to the exact published `releaseSha`;
7. there is no unresolved severity-1 or severity-2 human-interaction finding.

If consequential authorized-decision observations remain legitimately `NOT_OBSERVABLE`, the gate remains `PARTIAL_HUMAN_EVIDENCE` unless existing current human evidence on the same relevant interaction contract is explicitly adopted by the reviewer. Automated B3 rehearsal evidence alone cannot make that judgement.

## Completion artifact

Complete `docs/evidence/BETA_G5_HUMAN_ACCEPTANCE_RECEIPT_TEMPLATE.json` after the actual human session. Do not edit the template into PASS before observations have occurred.
