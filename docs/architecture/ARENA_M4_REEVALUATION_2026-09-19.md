# CurManLight Arena — M4 Re-evaluation after S3 G5/G6 closure

Status: **CANONICAL RE-EVALUATION CANDIDATE / NON-FEATURE EXPANSION**  
Date: **2026-09-19**  
Canonical main after S3 promotion: `main@5c748401337e8476d4b06a555b0d40867cac6923`  
Human-accepted / accessibility-accepted Beta release: `cd30a46f1526cd8ba83d20d74909ef9c12b1dd1d`  
Parent maturity audit: `SYSTEM_MATURITY_AUDIT_2026-08-30_CANONICAL.md`  
Tracker: **#121**

## 1. Governing result

Arena S3 is closed:

- `ARENA_S3_HUMAN_VALIDATION_PASS`;
- `BETA_HIA_PASS`;
- `BETA_ACCESSIBILITY_PASS`;
- PR #251 merged to `main`;
- exact candidate checks: 11/11 PASS before promotion;
- immutable Beta deploy, public smoke and release identity verified.

Arena is therefore a **validated controlled Beta / M4 candidate**.

The formal maturity label remains **M3.3 — ADVANCED CONTROLLED BETA** until the remaining M4 blockers are resolved or explicitly accepted as governed limitations. No weighted score may override a failed blocker.

## 2. A1–A10 re-evaluation

| Item | State | Evidence / finding | M4 disposition |
| --- | --- | --- | --- |
| **A1 — Canonical Surface Freeze** | **SATISFIED** | `ARENA_A1_CANONICAL_SURFACE_FREEZE_2026-08-30.md` classifies all AppTab states, primary navigation, seven target surfaces and Human Task → Surface → Route → Authority. G5 validated the evolved catalog-first IA. | Mark complete. Refresh route examples during A2, but do not reopen the surface model. |
| **A2 — Routing Consolidation** | **OPEN / BLOCKER** | Current `AppTab` still contains `progetta-evidenze`, `processo`, `certificazione-pa`. `processo → /planning`; `certificazione-pa → /documents`. Support PR #258 contains an accepted routing decision and a real `/verifiche` surface, but is divergent from current main and not promoted. | Reconcile SUP-01 on current main, preserve backward-readable links only where deliberate, remove ambiguous emitted aliases. |
| **A3 — Sources Registry** | **PARTIAL / BLOCKER** | `FontiTab` is now a real local source registry with version, authority class, lifecycle and explicit local verification. Fascicolo/provenance UX is substantially stronger. However curricular/institutional source identity, applicability and linked curriculum content are still split across support/curriculum/knowledge surfaces. | Consolidate the curricular source/provenance view during SUP-01 without duplicating authority state. |
| **A4 — Revision Single Source of Truth** | **OPEN / BLOCKER** | The current review UI still directly reads and writes legacy `decisions/customTexts` with `approved/rejected/custom`, while the structured revision domain exists separately. | Make the structured revision archive the sole user-facing revision source of truth; retain legacy shape only as adapter/migration compatibility. |
| **A5 — Automation/User UI Parity** | **OPEN / BLOCKER** | Product runtime still branches on `navigator.webdriver` in `CurriculumTab`, `ProgettazioneTab` and `useLocalAgentSetup`. | Remove automation-specific product behavior and rerun critical browser evidence against human-identical UI. |
| **A6 — Arena / Docente OS Surface Boundary** | **OPEN / BLOCKER** | Planning handoff is correctly explicit/fail-closed, but Arena still exposes broad operational UDA authoring: UDA wizard, archive, cloning, generation and teacher-planning controls in `ProgettazioneTab`. | Retain institutional framework/requirements/handoff only; move operational UDA authoring responsibility to Docente OS. |
| **A7 — Persistence Activation** | **OPEN / BLOCKER OR GOVERNED LIMITATION** | `CURRICULUM_PERSISTENCE_MODE = 'legacy-only'` remains current and tested. | Either execute a separately governed migration with rollback evidence or explicitly accept legacy-only as a bounded M4 pilot limitation. |
| **A8 — Full G5 HVA** | **COMPLETE** | Final human mobile/desktop evidence bound to the immutable S3 release; #264 closed. | `BETA_HIA_PASS`. Do not reopen without reproducible regression. |
| **A9 — G6 Accessibility** | **COMPLETE** | Exact-release automated audit + human keyboard/focus/manual-AA evidence; final reacceptance on `cd30a46f...`. | `BETA_ACCESSIBILITY_PASS`. Design-system debt #271 remains separate. |
| **A10 — Operations / Governance Closure** | **OPEN / BLOCKER** | Exact-SHA CI/deploy discipline is strong. Repository-hosting enforcement remains open in #105. Stale/divergent evidence branches and PRs still require classification/cleanup. | Close GOV-01, recovery/operations evidence and stale PR/evidence hygiene before formal M4. |

## 3. Remaining blocker set

The evolved product has reduced the original M4 backlog to six real closure areas:

1. **A2 + SUP-01 routing/support consolidation** — reconcile #258 on current main; do not merge the divergent branch directly.
2. **A3 source-registry convergence** — complete institutional/curricular provenance/applicability linkage without creating a second authority model.
3. **A5 browser-human parity** — remove all product `navigator.webdriver` branches.
4. **A4 revision presentation convergence** — retire direct legacy `decisions/customTexts` as user-facing state.
5. **A6 product-boundary cleanup** — remove broad teacher UDA authoring from Arena primary runtime.
6. **A7 + A10 production constraints** — persistence decision and repository/operations governance.

A8 and A9 are no longer blockers.

## 4. Recommended execution order

The order below minimizes rework and preserves human evidence:

### M4-S1 — Support + routing reconciliation
Rebuild the useful parts of #258 from current `main`, not by merging its divergent branch.

Scope:
- `/fascicolo` provenance/source support;
- real `/verifiche` task surface;
- task-first Guida;
- canonical emitted routes;
- backward-readable adapters only where documented.

Exit candidates:
- `ARENA_ROUTING_CANONICAL`;
- `ARENA_SUPPORT_SURFACES_CANONICAL`;
- material progress toward `ARENA_SOURCE_REGISTRY_CANONICAL`.

### M4-S2 — Browser-human parity
Remove `navigator.webdriver` product branching and certify the same UI humans receive.

Exit:
- `ARENA_BROWSER_HUMAN_PARITY_PASS`.

### M4-S3 — Revision presentation convergence
Bind the review experience to the structured revision archive and demote legacy choices to adapter-only compatibility.

Exit:
- `ARENA_REVISION_PRESENTATION_CANONICAL`.

### M4-S4 — Arena / Docente OS boundary cleanup
Retain curricular framework and controlled handoff; remove operational teacher UDA workspace from Arena primary product surfaces.

Exit:
- `ARENA_DOS_UI_BOUNDARY_PASS`.

### M4-S5 — Persistence decision
Choose one:
- governed migration toward canonical persistence; or
- explicit, bounded `legacy-only` M4 pilot limitation with rollback/exit plan.

Exit:
- `ARENA_CANONICAL_PERSISTENCE_ACTIVE`, or a formally accepted limitation recorded in the M4 decision.

### M4-S6 — Operations / governance closure
Close #105 and repository/evidence hygiene. Re-run current recovery/security/privacy/operations gates.

Exit:
- `ARENA_M4_PRECONDITIONS_PASS`.

## 5. Non-goals

Do not open a broad feature train.

Do not:
- add a shared Arena/Docente OS database;
- add autonomous institutional decisions;
- add broad teacher lesson/UDA execution to Arena;
- reopen G5/G6 without a reproducible regression;
- redesign curriculum identity/applicability/provenance foundations speculatively;
- merge stale branches merely because their historical checks passed.

## 6. Formal maturity statement

Current formal classification:

**M3.3 — ADVANCED CONTROLLED BETA**

Operational interpretation:

**validated controlled Beta / M4 candidate**

Formal M4 promotion becomes eligible only when A2, A3, A4, A5, A6 and A10 are closed and A7 is either closed or explicitly accepted as a bounded pilot limitation.

## 7. Immediate next action

Start **M4-S1** by reconciling SUP-01 / PR #258 onto current `main@5c748401337e8476d4b06a555b0d40867cac6923`.

The existing #258 branch is **divergent** from current main and must be treated as a source of reviewed changes, not as a merge candidate.


---

## 8. Closure addendum — 2026-09-20

The re-evaluation recorded above is preserved as historical decision input. Its open/blocker states have now been resolved by the governed M4 closure sequence.

Final closure chain:

- M4-S1 / PR #276 — routing/support consolidation;
- M4-S2 / PR #278 — browser-human parity;
- M4-S3 / PR #282 — revision presentation convergence;
- M4-S4 / PR #285 — Arena / Curriculum Atlas / Docente OS boundary;
- M4-S5 / PR #287 — bounded hybrid persistence decision;
- M4-S6 / PR #289 — operations/governance closure;
- M4-S7 / PR #290 — A3 source applicability closure.

A3 issue #280 is closed. The final M4-S7 candidate `a315aa72ce68a52da7d4d960996b6470774104b0` passed the full exact-head gate set, was published immutably to Beta, passed public smoke identity verification and passed final mobile human review.

The canonical M4 decision is now:

**M4 — CONTROLLED PRODUCTION PILOT**

Decision token:

`ARENA_M4_CONTROLLED_PRODUCTION_PILOT`

See `ARENA_M4_CONTROLLED_PRODUCTION_PILOT_DECISION_2026-09-20.md` for the authoritative final promotion statement and accepted M4 limitation.
