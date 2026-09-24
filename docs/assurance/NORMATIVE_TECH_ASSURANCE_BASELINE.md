# CurManLight Arena — Normative, Technology & Assurance Baseline

**Status:** CURRENT ASSURANCE REFERENCE / NOT A LEGAL CERTIFICATION  
**Reconciled:** 2026-09-24  
**Owner:** Arena  
**Review rule:** re-check when a normative source, core dependency, assurance workflow or governed product boundary changes

## 1. Purpose

This document separates four different things that must not be collapsed:

1. **external normative/reference source**;
2. **product/domain rule**;
3. **technical evidence**;
4. **institutional/legal responsibility**.

A source being cited does not prove runtime implementation.  
A test passing does not create a legal certification.  
A product contract does not replace an institutional decision.

## 2. Evidence vocabulary

Use these labels:

- `SOURCE_REFERENCE` — external normative/technical source;
- `DOMAIN_GOVERNED` — enforced by current product/domain contracts;
- `RUNTIME_TESTED` — represented in executable code and protected by current tests;
- `ASSURANCE_TESTED` — supported by CI/browser/accessibility/security evidence;
- `HUMAN_REVIEWED` — explicit human review exists for the relevant exact head/release;
- `INSTITUTIONAL_RESPONSIBILITY` — final institutional/legal act remains outside the software;
- `NOT_CERTIFIED` — no external certification is claimed.

No single label implies all the others.

## 3. Curriculum normative references

### D.M. 9 dicembre 2025, n. 221

Official reference:
- Gazzetta Ufficiale, Serie Generale n. 21 del 27 gennaio 2026;
- regulation on national curriculum indications for scuola dell'infanzia and primo ciclo;
- effective from 11 February 2026.

Arena may model applicability/transition rules derived from this source only through governed domain contracts and tests.

**Source status:** `SOURCE_REFERENCE`.

Any claim such as “this cohort uses Indicazioni 2025” must be supported by the current Arena applicability implementation and exact-head evidence, not merely by this paragraph.

### D.M. 16 novembre 2012, n. 254

Official reference:
- Gazzetta Ufficiale, Serie Generale n. 30 del 5 February 2013;
- prior national curriculum indications for scuola dell'infanzia and primo ciclo.

**Source status:** `SOURCE_REFERENCE`.

Transition/cohort behavior must be demonstrated by current Arena domain rules and tests.

### D.M. 7 settembre 2024, n. 183 — Educazione civica

Official MIM guidance states that the 2024 guidelines apply from school year 2024/2025.

**Source status:** `SOURCE_REFERENCE`.

Within the TRAMA ecosystem, the current governance contract for Educazione civica remains separate from this assurance file. This document does not authorize runtime implementation.

### Other educational references

Other decrees, guidelines and curriculum materials may be present in Arena source registries or historical documentation.

Their presence means only `SOURCE_REFERENCE` unless a current governed contract and evidence establish a stronger status.

## 4. Privacy and data protection

Reference:
- Regulation (EU) 2016/679 (GDPR).

Current Arena architectural invariants include:
- data minimization;
- pupil-level operational data excluded from Arena cross-product flows by default;
- personal/local state does not become institutional authority;
- no shared canonical mutable database across Arena, Atlas and Docente OS;
- credentials/secrets are not durable domain state;
- consequential shared writes require governed server-side authority where applicable.

These are **product architecture controls**, not a legal compliance certificate.

Status:
- architectural rules: `DOMAIN_GOVERNED`;
- applicable code/tests: may be `RUNTIME_TESTED` / `ASSURANCE_TESTED`;
- legal/controller obligations: `INSTITUTIONAL_RESPONSIBILITY`;
- certification claim: `NOT_CERTIFIED`.

## 5. Accessibility

Technical reference:
- WCAG 2.2, W3C Recommendation.

Arena assurance should test, where applicable:
- keyboard reachability;
- visible focus;
- accessible names/roles;
- dialog semantics;
- reflow/mobile behavior;
- target size;
- contrast;
- understandable state/feedback/recovery;
- human interaction on critical journeys.

A green automated accessibility check is not equivalent to complete human accessibility validation or an institutional accessibility declaration.

Status:
- WCAG 2.2: `SOURCE_REFERENCE`;
- automated/browser checks: `ASSURANCE_TESTED` when current exact-head evidence exists;
- formal declaration: `INSTITUTIONAL_RESPONSIBILITY`.

## 6. AI governance

Reference:
- Regulation (EU) 2024/1689 (AI Act), using the current official/consolidated text when legal interpretation matters.

Arena product boundary:

AI may:
- compare sources;
- summarize;
- identify inconsistencies;
- draft/propose;
- explain likely impacts;
- assist evidence classification.

AI may not:
- create institutional authority;
- approve/adopt curriculum;
- silently mutate canonical state;
- transform professional evidence into a decision;
- bypass a required human confirmation.

Status:
- external regulation: `SOURCE_REFERENCE`;
- human-authority boundary: `DOMAIN_GOVERNED`;
- external legal conformity: `NOT_CERTIFIED`.

## 7. Current technology baseline

The authoritative technology source is the current `package.json`, lockfile and workflows.

At this reconciliation, the main application includes:

| Layer | Current repository evidence |
|---|---|
| UI | React 18.3 |
| Language | TypeScript 5.2 |
| Bundler | Vite 6 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 3.4 |
| Client state | Zustand 4.5 |
| Local persistence | Dexie / IndexedDB |
| Shared persistence client | Supabase JS 2.112 |
| PDF | PDF.js 6.2 |
| Icons | Lucide React |
| Tests | Vitest 4.1 |
| Browser/E2E | Playwright 1.61 |
| Component QA | Storybook 10.5 |
| CI | GitHub Actions |

This table is descriptive only. `package.json` and lockfile override it if they diverge.

## 8. Current primary automated gates

The current main workflows include at least:

### CurManLight Product CI

Current pipeline includes:
- dependency installation;
- fast regression tests;
- human-governance tests;
- KX knowledge-experience guards;
- TypeScript check;
- Deno check for EC-01 Edge Function;
- production build.

### Beta Release Contract

Current pipeline includes:
- Beta build;
- release metadata bound to exact head/ref;
- verification of the Beta release contract.

Other workflows may apply based on changed surfaces. Their presence does not mean every workflow is required for every PR.

## 9. Exact-head evidence rule

A claim about a PR/release is valid only for the relevant identity.

```text
exact head
  -> applicable automated gates
  -> immutable deployment identity when required
  -> human review when required
  -> governed promotion
```

If the head changes, evidence must be re-evaluated according to the governing protocol.

## 10. Human review boundary

Automation may:
- prepare evidence;
- detect invariant violations;
- validate deterministic contracts.

Automation may not fabricate:
- human acceptance;
- institutional approval;
- adoption;
- legal certification.

Human review must remain an explicit artifact tied to the relevant candidate when required.

## 11. Security assurance

Repository controls should be interpreted as engineering evidence.

Relevant control families include:
- protected PR workflow;
- exact-head validation;
- dependency/security checks;
- secret minimization;
- server-side authorization/RLS where governed;
- immutable release identity where required;
- rollback/recovery procedures.

These controls do not imply third-party security certification.

## 12. Cross-product assurance boundary

Arena, Atlas and Docente OS remain independently governed products.

Assurance must reject:
- shared canonical mutable database by convenience;
- silent cross-product writes;
- authority inferred from transport;
- pupil-level operational data crossing into Arena by default;
- Atlas or Docente OS state being treated as Arena institutional authority without a governed contract.

## 13. Claims that require explicit evidence

Do not write unqualified statements such as:

- “100% compliant”;
- “GDPR compliant”;
- “AI Act compliant”;
- “certified accessible”;
- “production ready”;
- “fully secure”;
- “all legal requirements satisfied”.

Use precise statements instead, e.g.:
- “Product CI PASS on exact head …”;
- “WCAG-oriented automated checks PASS”;
- “human review recorded for …”;
- “architecture excludes pupil-level data from this contract”;
- “external legal certification not claimed”.

## 14. Maintenance rule

Update this file when one of these changes materially:

- normative source used by current Arena behavior;
- core technology baseline;
- assurance workflow;
- privacy/security boundary;
- AI authority boundary;
- accessibility target;
- release-evidence model.

Do not use this file as a live maturity tracker.  
Do not record transient PR status here.  
Do not treat it as a legal opinion.
