# CurManLight Arena — System Maturity Audit

Data: 2026-08-28  
Baseline auditata: `main` @ `e8958406c6fb8e3a191ed705de7f3229e13439b6`

## Classificazione

Maturità corrente: **M3.3 — ADVANCED CONTROLLED BETA**.

Arena dispone già di un dominio curricolare e di revisione maturo, identity/membership server-backed, decision authority conseguenziale verificata lato server, ricevute append-only e rehearsal reale BETA-G4. Non è ancora promuovibile a pilot generale perché Human Interaction Acceptance e Accessibility Acceptance non sono formalmente chiuse.

## Scala

- M0 — concept/research
- M1 — working prototype
- M2 — engineered alpha
- M3 — controlled beta
- M4 — controlled production pilot
- M5 — generally distributable mature product

## Scorecard

| Dimensione | Score / 5 | Evidenza sintetica |
|---|---:|---|
| Curriculum domain | 4.5 | curriculum/version/transition contracts e baseline governata |
| Revision domain | 4.5 | proposal/version/decision separation, lifecycle e validation |
| Identity / membership | 4.3 | Supabase Auth, server-backed membership, lifecycle rehearsal |
| Institutional authority | 4.7 | `REVISION_DECIDE`, RPC server-authoritative, no local fallback |
| Provenance / auditability | 4.6 | append-only receipts, SHA-256 binding, re-entry verification |
| CI / release contracts | 4.4 | Product CI, Beta E2E, Identity Authority, Release Contract |
| Beta runtime | 3.8 | published Beta and authorized rehearsal evidence |
| Human interaction | 3.2 | G5 evidence prepared but human acceptance still pending |
| Accessibility | 2.5 | G6 pending: automated + keyboard/focus/touch + manual AA |
| Operational production | 3.0 | Beta, not general production |

## B3 state

- `BETA-G4`: **PASS** — institutional decision journey proven with real authorized rehearsal, refresh/re-entry and fail-closed network/authority behavior.
- `BETA-G5`: **PENDING_HUMAN** — desktop/mobile Human Interaction Acceptance remains to be decided by a human reviewer on the real Beta.
- `BETA-G6`: **PENDING_HUMAN** — accessibility acceptance remains separate and incomplete.

## Feedback loop maturity

After the B3 acceptance baseline, `main` now also contains the reverse professional feedback path:

`Docente OS feedback` → `NON_AUTHORITATIVE_PROFESSIONAL_EVIDENCE` → `READY_FOR_HUMAN_TRIAGE` → human triage → `AWAITING_HUMAN_PROPOSAL_AUTHORING` → human-authored preview → explicit confirmation → `RevisionProposal` **draft**.

Invariants remain:

- no automatic proposal from evidence;
- no automatic decision;
- no automatic submit;
- no baseline mutation;
- no new membership/capability or Decision Authority derived from teacher feedback.

## Finding A — Human/Accessibility gates dominate readiness

Arena is now more mature in institutional authority than in end-user acceptance. This is not a domain defect, but it prevents promotion beyond controlled Beta.

The next maturity gain must come from G5 and G6, not from adding new curriculum features.

## Finding B — Canonical acceptance baseline drift

`CML_ARENA_BETA_B3_ACCEPTANCE_v1.json` correctly keeps B3 `IN_PROGRESS`, but its recorded canonical base predates the feedback-loop merges #51–#53. The new capabilities do not close G5/G6, yet the canonical maturity narrative should record that the interoperability feedback boundary has advanced without changing the Beta readiness claim.

## Finding C — Runtime interoperability gap

Arena ↔ Docente OS contracts are semantically mature, but runtime transport is intentionally absent. Contract maturity is approximately M4; operational interoperability remains around M3 until a real end-to-end transport/recovery journey is exercised.

## Residui verso M4

Arena should not be classified M4 before:

1. G5 Human Interaction Acceptance PASS on real Beta, desktop and mobile;
2. G6 Accessibility Acceptance PASS;
3. core journeys demonstrate error/recovery without technical intervention;
4. Beta release has sustained operational evidence rather than isolated rehearsal only;
5. if runtime interoperability is a pilot requirement, Arena↔Docente OS transport is proven fail-closed end-to-end.

## Decisione audit

**M3.3 confermato.**

Priority order: **G5 → G6 → sustained Beta evidence → controlled interop E2E**, while preserving the current authority boundaries.