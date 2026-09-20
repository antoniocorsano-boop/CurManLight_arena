# CurManLight Arena — Normative, Technology & Assurance Baseline

Status: **CANONICAL REPOSITORY HOME BASELINE**  
Date: **2026-09-20**  
Purpose: distinguish regulatory references, runtime implementation, technical validation and legal/institutional responsibility.

## 1. Interpretation rule

This document deliberately avoids generic claims such as "100% compliant".

A reference may be:

- **RUNTIME_TESTED** — represented in product logic and protected by automated tests;
- **CONTRACT_GOVERNED** — enforced as a domain/architecture invariant;
- **DOCUMENTARY_REFERENCE** — present in the source/curriculum corpus but not itself a runtime compliance gate;
- **ASSURANCE_TESTED** — supported by technical/browser/human evidence;
- **INSTITUTIONAL_RESPONSIBILITY** — final legal/administrative declaration remains outside the software;
- **NOT_CERTIFIED** — no external legal certification is claimed.

Technical evidence is not a substitute for an institutional act, legal opinion, accessibility declaration or data-protection assessment.

---

## 2. Curricular and educational normative baseline

### 2.1 D.M. 9 dicembre 2025, n. 221 — Indicazioni Nazionali 2025

**Product use**

Arena models the transition to the 2025 framework by cohort and academic year.

Current verified behavior includes:

- A.S. 2026/2027;
- lower-secondary Classe I → Indicazioni 2025;
- source repertory reference N4;
- missing class/year fails closed rather than guessing applicability.

**Engineering status:** `RUNTIME_TESTED`.

**Evidence classes**

- national framework resolver;
- source applicability context;
- M4-S7 A3 tests;
- same-candidate mobile human evidence.

### 2.2 D.M. 16 novembre 2012, n. 254 — Indicazioni Nazionali 2012

**Product use**

Arena keeps continuing cohorts on the prior framework while transition progresses.

Verified M4-S7 evidence includes:

- lower-secondary continuing cohort → Indicazioni 2012 in prosecuzione;
- source repertory reference N5;
- cohort state separate from institutional master lifecycle.

**Engineering status:** `RUNTIME_TESTED`.

### 2.3 D.M. 183/2024 — Educazione civica

Used in the curriculum/reference corpus and source documentation.

**Status:** `DOCUMENTARY_REFERENCE`.

This README baseline does not claim that every Educazione civica obligation is independently executed or certified by Arena runtime.

### 2.4 D.M. 14/2024 — certificazione delle competenze

Used as a curriculum/documentary reference for national competence-level raccords.

**Status:** `DOCUMENTARY_REFERENCE`.

Operational student assessment/certification belongs outside Arena's curriculum-governance boundary.

### 2.5 Other educational references

The repository contains historical/reference material for additional legislation, inclusion and institutional planning. Their presence in `second-brain/` or legacy root documents must not be interpreted as current runtime implementation.

The canonical source registry and governed curriculum model decide what is active in product behavior.

---

## 3. Privacy and data-protection baseline

### Reference

**Regulation (EU) 2016/679 — GDPR**.

Official source: https://eur-lex.europa.eu/eli/reg/2016/679/oj

### Product principles applied

- data minimization;
- purpose/ownership separation;
- pupil-level operational data excluded from Arena cross-product contracts;
- personal/local state does not become institutional authority;
- OAuth access/refresh credentials are not durable domain state;
- shared institutional operations use authenticated server repositories and RLS where required;
- no shared database between Arena, Curriculum Atlas and Docente OS;
- no automatic transfer of teacher/classroom state into Arena authority.

### Engineering status

`CONTRACT_GOVERNED` + product/security tests where applicable.

### Claim boundary

**NOT_CERTIFIED.**

The repository does not claim an external GDPR certification. Controller obligations, DPIA where applicable, records of processing, information notices, retention policy and institutional legal assessment remain organizational responsibilities.

---

## 4. Accessibility baseline

### References

- Italian Law 4/2004;
- AgID accessibility guidelines for ICT;
- WCAG-aligned engineering checks.

AgID reference: https://www.agid.gov.it/it/design-servizi/accessibilita/linee-guida-accessibilita-pa

### Product assurance dimensions

The Arena release process includes checks/evidence covering, as applicable:

- accessible names for controls;
- keyboard/Tab navigation;
- visible focus;
- interactive target sizing;
- dialog semantics;
- desktop/mobile overflow;
- 320px reflow;
- contrast remediation;
- mobile usability;
- Human Interaction acceptance.

### Engineering status

`ASSURANCE_TESTED`.

### Claim boundary

The product gate is not the institution's formal accessibility declaration.

Legal publication/declaration duties remain `INSTITUTIONAL_RESPONSIBILITY`.

---

## 5. AI governance baseline

### Reference

**Regulation (EU) 2024/1689 — AI Act** as governance reference.

Official source: https://eur-lex.europa.eu/eli/reg/2024/1689/oj

### Arena AI boundary

AI may:

- compare curriculum/source text;
- identify inconsistencies;
- summarize;
- propose links;
- draft revision text;
- explain likely impact.

AI may not:

- approve/reject curriculum;
- grant a role or capability;
- create institutional authority;
- activate an adoption;
- silently mutate canonical state;
- turn evidence into a decision;
- write automatically into Docente OS or Atlas authority.

### Engineering status

`CONTRACT_GOVERNED`.

### Claim boundary

No blanket legal conformity certification is asserted.

---

## 6. Product-authority baseline

The repository enforces these invariants:

```text
Person != Role != Capability != Authority

Proposal != Review
Proposal != Institutional Decision
Review != Institutional Decision
Approval != Adoption
Applicability != Adoption
Evidence != Decision
Docente OS observation != Arena canonical write
```

Missing authority must fail closed.

**Status:** `CONTRACT_GOVERNED` with domain and Human Interaction tests.

---

## 7. Technology baseline

Source of truth: current `package.json`, code and workflows.

| Layer | Technology | Current purpose |
|---|---|---|
| Web UI | React 18.3 | application shell and surfaces |
| Language | TypeScript 5.2 | typed contracts/domain/UI |
| Bundler | Vite 6 | dev/build/Beta packaging |
| Routing | React Router 7 | URL-based application navigation |
| Styling | Tailwind CSS 3.4 | UI layout and design tokens |
| State | Zustand 4.5 | bounded client application state |
| Local persistence | Dexie 4 / IndexedDB | personal local continuity |
| Shared persistence | Supabase JS 2.112 / PostgreSQL | authenticated institutional records where governed |
| Server authorization | PostgreSQL RLS | workspace/membership bounded access |
| PDF | PDF.js 6 | PDF document handling |
| Icons | Lucide React | accessible icon primitives |
| Unit/contract test | Vitest 4.1 | fast regression and domain contracts |
| Browser/E2E | Playwright 1.61 | browser evidence and critical journeys |
| UI component QA | Storybook 10 | isolated component validation |
| UI test | Testing Library | interaction-oriented component tests |
| Accessibility dev QA | Storybook a11y + product/browser gates | engineering accessibility checks |
| CI/CD | GitHub Actions | exact-head gates and release contracts |
| Hosting | GitHub Pages | public Beta |
| Release identity | generated Beta release metadata + smoke | immutable SHA verification |

---

## 8. Persistence architecture

### 8.1 Personal/local plane

Use:

- IndexedDB/Dexie for personal continuity;
- memory fallback when persistent local storage is unavailable;
- localStorage only for bounded non-authoritative preferences/session convenience.

Rules:

- local state is not institutional authority;
- volatile fallback must not support authority claims;
- a backup/copy is portability, not adoption.

### 8.2 Shared institutional plane

Use:

- authenticated repositories;
- Supabase/PostgreSQL;
- RLS;
- workspace membership and server-derived authority.

Rules:

- self-declared local role never grants server authority;
- consequential writes remain bounded by capability and human confirmation.

### 8.3 Cross-product plane

Arena, Atlas and Docente OS:

- do not share a canonical mutable database;
- do not silently synchronize authority;
- communicate through explicit versioned contracts.

---

## 9. Verification and release baseline

### Universal protected checks

Current main-governance contract requires:

- `product-gate`;
- `beta-release-contract`.

Additional workflows run when relevant:

- Curriculum Alignment;
- Beta Identity Authority;
- Human Interaction Model;
- H3/H4 Authority Boundary;
- S3 Critical Journey Browser Evidence;
- Beta E2E Workflow;
- dependency/security audit;
- live Beta support/assistant audit;
- shared-review smoke.

### Release rule

A release is only current evidence when all mutable claims are bound to the relevant exact identity.

```text
exact PR head
-> exact-head automation
-> immutable SHA deploy
-> public smoke identity
-> human evidence on that release (when required)
-> governed promotion
```

If the candidate changes, prior exact-head/human evidence becomes stale for promotion.

---

## 10. Human validation baseline

Arena's critical human validation chain is:

```text
Human Task
-> Human Interaction Model
-> browser evidence
-> immutable deployed release
-> actual human acceptance
```

Automation may prepare and verify states but does not issue the human verdict.

Human evidence must remain distinguishable from automated PASS status.

---

## 11. Security baseline

Validated architecture/operations controls include, where applicable:

- protected main;
- PR-only promotion;
- no normal bypass;
- force-push blocked;
- branch deletion blocked;
- conversation resolution required;
- exact candidate SHA;
- bounded credentials;
- RLS for shared institutional state;
- no manual edit of published release artifacts;
- incident severity and rollback runbook;
- dependency security workflow.

This is a software assurance baseline, not a third-party security certification.

---

## 12. Source precedence

For current product truth use, in order:

1. explicit current governance decision;
2. `INTEGRATED_PROJECT_GOVERNED_MEMORY_V1.md`;
3. live maturity tracker/release evidence;
4. current architecture contracts under `docs/architecture/`;
5. source/domain implementation and exact-head tests;
6. current evidence receipts;
7. historical audit material.

Files in `second-brain/` and historical root reports can be valuable evidence or design history but do not override current governed contracts.

---

## 13. Validation labels for repository documentation

New repository documentation should use these labels rather than vague language:

- **implemented**
- **runtime-tested**
- **contract-governed**
- **browser-evidenced**
- **human-reviewed**
- **institutionally approved**
- **documentary reference**
- **historical evidence**
- **not certified**
- **pending**

Avoid unqualified statements such as:

- "fully compliant";
- "100% GDPR";
- "certified AgID";
- "AI Act compliant";
- "production ready";

unless an evidence source with the relevant authority actually supports that exact claim.

---

## 14. Current key limitation

The M4 persistence contract deliberately keeps canonical curriculum content persistence in `legacy-only` mode while bounded local/shared planes are governed separately.

This is an explicit limitation, not a hidden defect and not authorization to migrate automatically.

---

## 15. Maintenance rule

Whenever a regulation, framework, core dependency, persistence contract or release-assurance mechanism changes:

1. update the relevant canonical contract;
2. identify affected tests;
3. re-run exact-head gates;
4. mark previous evidence stale when required;
5. update this baseline only after the change is governed and evidenced.
