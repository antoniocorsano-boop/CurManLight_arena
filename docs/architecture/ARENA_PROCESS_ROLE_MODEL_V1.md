# Arena Process & Role Model v1

**Status:** FROZEN_FOR_IMPLEMENTATION  
**Purpose:** turn Arena from a feature-oriented beta into a process-aware, role-aware curriculum governance system without granting authority through presentation alone.

## 1. Product invariant

Arena is organized around institutional work, not pages.

Canonical chain:

`SOURCE → EVIDENCE → CURRICULUM CONTEXT → ANALYSIS → PROPOSAL → REVIEW → HUMAN DECISION → CANONICAL ADOPTION → PLANNING HANDOFF`

A screen, route, role label, assistant suggestion, automated test or generated artifact MUST NOT skip a transition that requires evidence or human authority.

## 2. Separation of concepts

The following concepts remain distinct:

- **Identity**: who the user is in a shared authenticated workspace, when available.
- **Membership**: verified association with a workspace.
- **Role**: institutional function attached to a membership or locally self-declared for presentation.
- **Capability**: what that role may do under the current assurance level.
- **Human Task**: the concrete work the person is trying to complete.
- **Decision Authority**: the authority required for a consequential institutional transition.

A self-declared role may shape local presentation but MUST NOT become authenticated membership or institutional decision authority.

## 3. Canonical process pipeline

### P1 — Source acquisition and qualification

**Intent:** make material consultable while preserving provenance and authority boundaries.

Input:
- bundled material;
- user upload;
- institutional/normative source candidate.

Required states:
- source identity/version;
- extraction state;
- verification state;
- authority class;
- retrieval eligibility.

Output:
- consult-only material; or
- eligible evidence.

No upload or local verification can autonomously confer institutional or normative authority.

### P2 — Curriculum context

**Intent:** determine which curriculum framework applies to the current school-year/order/cohort/discipline context and show its provenance.

Primary Human Task: `HT-BETA-CURRICULUM-CONTEXT`.

Output:
- applicable curriculum baseline;
- provenance;
- provisional/adopted state;
- missing-context blockers.

### P3 — Curriculum analysis

**Intent:** identify coverage, gaps, discontinuities, overlaps and review candidates without turning findings into decisions.

Output:
- observations;
- evidence-linked issues;
- proposal candidates.

Automation may surface findings; it may not approve them.

### P4 — Revision preparation and review

**Intent:** turn a finding into an inspectable proposal with rationale, evidence, version and stakeholder responsibility.

Primary Human Task: `HT-BETA-REVISION-PREPARE`.

Output:
- revision proposal/version ready for institutional review;
- explicit blockers if evidence/rationale/version is incomplete.

### P5 — Institutional decision

**Intent:** allow an authorized human reviewer to decide on a proposal after inspecting a stable preview and evidence.

Primary Human Task: `HT-REVISION-DECISION`.

Output:
- append-only institutional decision receipt;
- approve / approve-with-changes / reject / defer / return-for-revision.

Decision authority MUST be backed by authenticated workspace membership. A local role selection is never sufficient.

### P6 — Canonical adoption

**Intent:** promote an institutionally decided proposal into the canonical curriculum only through an explicit governed transition.

This process is **NOT IMPLEMENTED YET** and is a maturity blocker.

Required future contract:
- decision receipt binding;
- source proposal version binding;
- canonical target/version;
- effective date;
- supersedes/superseded-by relation;
- human promotion confirmation;
- immutable receipt;
- downgrade/revocation path.

A decision receipt MUST NOT mutate the canonical curriculum automatically.

### P7 — Planning handoff

**Intent:** transfer a curriculum baseline downstream without turning curriculum governance into teacher execution automatically.

Primary Human Task: `HT-BETA-PLANNING-HANDOFF`.

Output:
- validated handoff package;
- provenance and approval state;
- explicit downstream acceptance requirement.

## 4. Canonical role responsibilities

### Docente

Primary questions:
- Which curriculum applies to me?
- What changed for my discipline/class context?
- What evidence supports it?
- What may I propose?
- What may I transfer to planning?

Primary capabilities:
- `CURRICULUM_READ`
- `CURRICULUM_PROPOSE`
- `DOCUMENT_PREPARE`
- `DOCUMENT_EXPORT`

Must not receive institutional decision controls from a self-declared role.

### Dipartimento

Primary object: disciplinary vertical coherence.

Primary work:
- inspect discipline gaps and continuity;
- review proposals and evidence;
- coordinate disciplinary revision;
- prepare material for the curriculum lead.

Primary capabilities:
- `CURRICULUM_READ`
- `CURRICULUM_PROPOSE`
- `REVISION_REVIEW`
- `DOCUMENT_PREPARE`
- `DOCUMENT_EXPORT`

### Referente curricolo

Primary object: whole-school curriculum coherence and process readiness.

Primary work:
- monitor cross-discipline coverage and gaps;
- triage proposals;
- inspect unresolved evidence/source blockers;
- coordinate readiness for institutional review;
- verify handoff/version coherence.

Primary capabilities remain review/preparation capabilities unless a future governed policy explicitly grants additional authority.

### Collegio

Primary object: consequential institutional decision.

Primary work:
- inspect what changes;
- inspect rationale/evidence/review history;
- decide, defer, reject or return for revision;
- receive an institutional decision receipt.

`REVISION_DECIDE` requires authenticated workspace assurance.

### Dirigente

Primary object: process governance and readiness, not curriculum editing.

Primary work:
- inspect institutional readiness;
- inspect blockers, evidence, version history and decision status;
- review/export governance documentation.

The current capability model does not grant `REVISION_DECIDE` to the Dirigente.

### Amministratore

Primary object: technical workspace integrity.

Primary work:
- membership/workspace administration;
- storage/backup/restore/release integrity;
- technical diagnostics.

Must not become curriculum decision authority merely because it administers the system.

### Observer / institutional read-only view

Target capability profile for future implementation. It is not an authority role.

Use cases:
- NIV;
- PTOF commission participant;
- invited reviewer;
- auditor/trainer;
- other read-only institutional stakeholder.

The observer may inspect curriculum/evidence/state but cannot mutate proposals or decisions.

## 5. Role experience rule

A mature role experience is not a permission matrix rendered as UI. Each role surface must answer:

1. **What needs my attention?**
2. **Why is it here?**
3. **What evidence/state should I inspect?**
4. **What may I do now?**
5. **What happens after my action?**
6. **Who acts next?**

The future Home should therefore be a role-aware work queue, not a generic dashboard.

Canonical work-queue states:

`DA LEGGERE → DA VERIFICARE → DA ESAMINARE → DA DECIDERE → COMPLETATO`

Only states relevant to the effective capabilities of the actor are shown.

## 6. Implementation plan

### R0 — Process/Role Contract

Deliverables:
- this frozen document;
- machine-readable process/role model;
- invariant tests.

Exit gate:
- pipeline and role responsibility are represented in code without changing user authority or runtime navigation.

### R1 — Role Experience Inventory

Deliverables:
- inventory of every current canonical surface by role;
- what each role currently sees;
- what each role should see;
- inappropriate or missing actions;
- duplicate/legacy role semantics.

Exit gate:
- no canonical surface has an undefined actor/task.

### R2 — Work Queue Contract

Deliverables:
- deterministic work-item model;
- state, blocker, evidence, next actor, capability requirement;
- zero authority inference from self-declared roles.

Exit gate:
- representative work items can be derived for all canonical processes without changing institutional state.

### R3 — Role-aware Home

Deliverables:
- `Il mio lavoro` as the primary entry surface;
- progressive disclosure by capability/task;
- no irrelevant institutional controls.

Exit gate:
- Docente, Dipartimento, Referente, Collegio, Dirigente and Amministratore each recognize their next work within one screen.

### R4 — Whole-school Referente View

Deliverables:
- coverage/gap/proposal/source/readiness overview;
- drill-down into evidence and process state;
- no automatic decisions.

Exit gate:
- Referente can identify institutional blockers without opening individual documents one by one.

### R5 — Canonical Adoption Contract

Deliverables:
- governed transition from valid institutional decision receipt to canonical curriculum version;
- preview/confirm/receipt;
- supersession and rollback semantics.

Exit gate:
- decision and adoption are distinct, auditable and human-confirmed.

### R6 — Observer / Read-only Institutional Experience

Deliverables:
- explicit read-only capability profile;
- curriculum/evidence/process visibility without mutations.

Exit gate:
- observer cannot reach proposal/decision mutation paths.

### R7 — End-to-end Adoption Validation

Scenario:
`source → context → analysis → proposal → review → decision → adoption → planning handoff`

Evidence:
- automated invariant tests;
- browser critical journey;
- same-SHA release identity;
- real human acceptance by representative roles.

Exit gate:
- process is understandable, recoverable, auditable and usable without requiring knowledge of Arena internals.

## 7. Priority order

`R0 → R1 → R2 → R3 → R4 → R5 → R6 → R7`

Exceptions:
- S0/S1 safety, data-integrity or authority defects interrupt the sequence;
- non-blocking visual/copy defects are batched and do not trigger individual releases.

## 8. Maturity decision

Until R5 and R7 are closed, Arena must not be described as having a complete institutional curriculum adoption workflow.

Current target remains: move from an advanced controlled beta toward an adoptable and validated institutional process, not merely add more features.
