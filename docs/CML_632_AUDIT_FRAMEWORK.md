# CML-632 — Audit Framework

> Uniform audit framework for evaluating each CurManLight functional area.
> Applicable to all areas defined in `CML_632A_SYSTEM_AREA_INVENTORY.md`.

---

## 1. Purpose

Provide a **standardized, comparable** method for evaluating every functional area of CurManLight along consistent dimensions. Each audit produces a decision that determines the next action for that area.

---

## 2. Audit Dimensions

Each area is evaluated across **9 dimensions** (A–I). Every dimension has specific questions, a 0–4 scale, and severity flags.

### Dimension A — User Value

| # | Question |
|---|----------|
| A1 | What school problem does this area solve? |
| A2 | Which user role benefits most? |
| A3 | How frequently is this area used in real teaching? |
| A4 | What concrete result does the teacher obtain? |
| A5 | What external alternatives exist? |
| A6 | Is the value immediately perceivable on first use? |

**Scale:**
- 0 — No identifiable problem solved
- 1 — Problem identified but value unclear
- 2 — Value exists but not immediately perceivable
- 3 — Clear value, perceivable on first use
- 4 — Essential value, no viable external alternative

### Dimension B — Functional Coherence

| # | Question |
|---|----------|
| B1 | Is the flow complete from entry to result? |
| B2 | Are all required decisions explicit? |
| B3 | Can the user go back and correct? |
| B4 | Are intermediate states clear? |
| B5 | Is error recovery supported? |
| B6 | Are there dead ends or orphan states? |

**Scale:**
- 0 — No coherent flow
- 1 — Fragmented, multiple dead ends
- 2 — Partial flow, some gaps
- 3 — Complete flow with minor gaps
- 4 — Full flow, reversible, error-safe

### Dimension C — Content & Data

| # | Question |
|---|----------|
| C1 | Are data sources identified and real? |
| C2 | Is data quality acceptable? |
| C3 | Is data coverage sufficient for the use case? |
| C4 | Is persistence reliable? |
| C5 | Is data update/correction possible? |
| C6 | Is export supported? |

**Scale:**
- 0 — No real data
- 1 — Placeholder or synthetic data only
- 2 — Partial real data, gaps significant
- 3 — Real data, minor gaps
- 4 — Complete, validated, persistent data

### Dimension D — Teacher Experience

| # | Question |
|---|----------|
| D1 | Is the purpose immediately understandable? |
| D2 | Can the teacher navigate without help? |
| D3 | Is terminology appropriate for school context? |
| D4 | Is cognitive load reasonable? |
| D5 | Are feedback and confirmation clear? |
| D6 | Does the teacher feel in control? |

**Scale:**
- 0 — Unintelligible
- 1 — Requires external explanation
- 2 — Understandable with hesitation
- 3 — Clear, minor confusion possible
- 4 — Immediately intuitive

### Dimension E — Interface

| # | Question |
|---|----------|
| E1 | Is visual hierarchy clear? |
| E2 | Is text readable (size, contrast, spacing)? |
| E3 | Is information density appropriate? |
| E4 | Are empty states handled? |
| E5 | Is responsiveness adequate (mobile/tablet/desktop)? |
| E6 | Is visual style coherent with the rest of the system? |

**Scale:**
- 0 — Broken or absent interface
- 1 — Major visual/layout issues
- 2 — Functional but inconsistent
- 3 — Coherent, minor issues
- 4 — Polished, responsive, consistent

### Dimension F — Accessibility

| # | Question |
|---|----------|
| F1 | Is keyboard navigation complete? |
| F2 | Are semantic HTML elements used? |
| F3 | Is color contrast sufficient? |
| F4 | Are touch targets adequate? |
| F5 | Are labels and messages accessible? |
| F6 | Do screen readers receive meaningful information? |

**Scale:**
- 0 — No accessibility consideration
- 1 — Major barriers present
- 2 — Partial accessibility, some barriers
- 3 — Mostly accessible, minor issues
- 4 — Fully accessible

### Dimension G — Reliability

| # | Question |
|---|----------|
| G1 | Are edge cases handled? |
| G2 | Are errors caught and displayed? |
| G3 | Is data loss prevented? |
| G4 | Is loading state managed? |
| G5 | Does the area survive page reload? |
| G6 | Are there console errors? |

**Scale:**
- 0 — Frequent crashes or data loss
- 1 — Multiple unhandled error paths
- 2 — Basic error handling, some gaps
- 3 — Robust, minor edge cases open
- 4 — Fully reliable

### Dimension H — Technical Coverage

| # | Question |
|---|----------|
| H1 | Are unit tests present? |
| H2 | Do tests cover critical paths? |
| H3 | Is TypeScript strict and clean? |
| H4 | Does the build succeed? |
| H5 | Is Storybook coverage adequate? |
| H6 | Is browser verification performed? |

**Scale:**
- 0 — No tests, no type safety
- 1 — Minimal tests, type issues
- 2 — Partial coverage, some type gaps
- 3 — Good coverage, clean types
- 4 — Comprehensive tests, full type safety

### Dimension I — Decision

| Verdict | Meaning |
|---------|---------|
| **MANTENERE** | Area is solid, keep as-is or with minor polish |
| **SEMPLIFICARE** | Area works but is overcomplex, reduce scope |
| **CORREGGERE** | Area has specific issues that can be fixed |
| **RIPROGETTARE** | Area has structural problems, needs redesign |
| **SOSPENDERE** | Area is not ready, defer to later |
| **ELIMINARE** | Area has no value, remove |

---

## 3. Severity Flags

Beyond the 0–4 scale, each audit must flag:

| Flag | Meaning |
|------|---------|
| **BLOCCO** | Prevents the area from being used at all |
| **RISCHIO** | May cause problems under real usage |
| **DEBITO** | Technical debt that should be addressed |
| **OPPORTUNITA** | Potential improvement identified |
| **PUNTO DI FORZA** | Something done well, worth preserving |

---

## 4. Audit Card Template

Each area audit produces a card with this structure:

```markdown
# Audit: [Area Name]

## Metadata
- Area ID: [A01–A13]
- Audit date: YYYY-MM-DD
- Auditor: [identity]
- Baseline: [commit hash]

## A. User Value
- Score: [0–4]
- Key finding: [one sentence]
- Flags: [list]

## B. Functional Coherence
- Score: [0–4]
- Key finding:
- Flags:

## C. Content & Data
- Score: [0–4]
- Key finding:
- Flags:

## D. Teacher Experience
- Score: [0–4]
- Key finding:
- Flags:

## E. Interface
- Score: [0–4]
- Key finding:
- Flags:

## F. Accessibility
- Score: [0–4]
- Key finding:
- Flags:

## G. Reliability
- Score: [0–4]
- Key finding:
- Flags:

## H. Technical Coverage
- Score: [0–4]
- Key finding:
- Flags:

## I. Decision
- Verdict: [MANTENERE / SEMPLIFICARE / CORREGGERE / RIPROGETTARE / SOSPENDERE / ELIMINARE]
- Rationale: [why]
- Next action: [specific step]
- Dependencies: [what must happen first]
```

---

## 5. Scoring Rules

- **No single-score summary.** Each dimension is reported independently.
- A score of **0 in any dimension** is a potential **BLOCCO** regardless of other scores.
- Scores of **1** in dimensions A, B, or D are potential **RISCHIO** flags.
- The decision (I) is **not derived from a formula**. It is a judgment based on the pattern of scores and flags.
- A **BLOCCO** in any dimension **overrides** a high overall score.

### Score Distribution Interpretation

| Pattern | Likely Decision |
|---------|----------------|
| All 3–4 | MANTENERE |
| Mostly 3–4, one 2 | CORREGGERE |
| Mixed 2–3 | SEMPLIFICARE or CORREGGERE |
| Several 1–2 | RIPROGETTARE |
| Any 0 | SOSPENDERE or ELIMINARE |
| A=0 | ELIMINARE (no value) |

---

## 6. Audit Execution Rules

1. **Read-only.** No code, test, text, or configuration changes during audit.
2. **Source-first.** Base findings on source code, not assumptions.
3. **Runtime verification.** Open the area in the browser and verify actual behavior.
4. **No extrapolation.** Report what is observed, not what is assumed.
5. **No mixing.** Each area audit is independent. Findings in one area do not automatically apply to another.
6. **Evidence-based.** Every finding must reference specific files, lines, or observed behavior.
7. **Single commit.** Each audit produces a single documentation commit.

---

## 7. Audit Output Files

| File | Content |
|------|---------|
| `docs/CML_632_AUDIT_{AREA_ID}.md` | Completed audit card |
| `docs/CML_632_AUDIT_FRAMEWORK.md` | This file (reference) |
| `docs/CML_632_SYSTEM_AREA_INVENTORY.md` | Area inventory (reference) |
| `docs/CML_632_AUDIT_ROADMAP.md` | Priority order and progress |

---

## 8. Verdicts

| Verdict | Tag | Meaning |
|---------|-----|---------|
| Audit complete | `CML_632_AUDIT_{AREA_ID}_COMPLETE_LOCAL` | Audit executed, decision recorded |
| Audit blocked | `CML_632_AUDIT_{AREA_ID}_BLOCKED` | Audit cannot proceed (missing data, runtime error) |
| Framework ready | `CML_632_AUDIT_FRAMEWORK_READY_LOCAL` | This framework document is approved |
| Inventory complete | `CML_632A_SYSTEM_AREA_INVENTORY_COMPLETE_LOCAL` | Area inventory is approved |
