# CML-632 — Audit Roadmap

> Priority order for auditing CurManLight functional areas.
> Generated from system analysis on commit `c853b36`.

---

## 1. Ordering Criteria

Areas are ordered by:

1. **Centrality** — how fundamental the area is to the product
2. **Frequency** — how often a teacher uses it
3. **Dependency** — whether other areas depend on it
4. **Risk** — whether working on wrong assumptions would be costly
5. **Fix cost** — how expensive corrections would be if deferred

---

## 2. Audit Sequence

| Order | ID | Area | Priority | Rationale |
|-------|----|------|----------|-----------|
| 1 | A01 | Home & Orientation | P1 | Entry point for all users; determines first impression; onboarding drives adoption |
| 2 | A02 | Curriculum Consultation | P0 | Core product purpose; most-used area; foundation for all other curriculum-related areas |
| 3 | A11 | Institute Sources | P1 | Foundational data for curriculum; must be correct before curriculum audit is meaningful |
| 4 | A03 | Curriculum Revision | P1 | Decision workflow; depends on curriculum data quality |
| 5 | A04 | Teaching Design (UDA) | P1 | Largest feature area; highest complexity; depends on curriculum decisions |
| 6 | A07 | Documents & Export | P1 | Concrete output for teachers; depends on UDA and curriculum data |
| 7 | A08 | Teacher Workspace | P2 | Cross-cutting concern; persistence and sync; affects all areas |
| 8 | A06 | Classroom & Social | P2 | Important for classroom teachers; depends on UDA data |
| 9 | A05 | Process & Consent | P2 | Administrative workflow; depends on UDA data |
| 10 | A09 | Copilot & AI | P3 | Experimental value; depends on curriculum context |
| 11 | A10 | Second Brain & Knowledge | P3 | Knowledge management; depends on AI and curriculum |
| 12 | A13 | PA Certification | P3 | Niche use case; shares view with esportazioni |
| 13 | A12 | User Guide | P4 | Static content; low risk; can be audited anytime |

---

## 3. Experimental / Frozen Modules

| Module | Status | Action |
|--------|--------|--------|
| Curriculum eTwin (CML-630C) | Complete local, not promoted | Audit as part of A02 (Curriculum Consultation) |
| Curriculum Functional Pilot (CML-631) | **FROZEN** | Do not audit. Record as frozen dependency in A02 audit |
| Assisted Pedagogical Suggestions (CML-631I) | Complete local, not adopted | Record as unadopted in A02 audit |

---

## 4. Dependencies Between Audits

```
A01 (Home) — no dependencies
A11 (Sources) — no dependencies
    ↓
A02 (Curriculum) — depends on A11 (data sources)
    ↓
A03 (Revision) — depends on A02 (curriculum data)
A04 (Teaching Design) — depends on A02 (curriculum decisions)
    ↓
A07 (Documents) — depends on A04 (UDA data) + A02 (curriculum)
A06 (Classroom) — depends on A04 (UDA data)
A05 (Process) — depends on A04 (UDA data)
    ↓
A08 (Workspace) — cross-cutting, audit after core areas
A09 (Copilot) — depends on A02, A04 (context)
A10 (Second Brain) — depends on A09 (AI), A02 (curriculum)
A13 (PA Cert) — depends on A07 (documents)
A12 (Guide) — independent
```

---

## 5. Recommended Audit Execution Order

### Phase 1 — Foundation (no dependencies)

| Audit | Area | Estimated scope |
|-------|------|-----------------|
| CML-632-A01 | Home & Orientation | DashboardView, OnboardingModal, TourModal |
| CML-632-A11 | Institute Sources | InfoViews (fonti), store configuration |

### Phase 2 — Core Curriculum

| Audit | Area | Estimated scope |
|-------|------|-----------------|
| CML-632-A02 | Curriculum Consultation | CurriculumTab, RevisioneTab, tree/map/population views, frozen pilot modules |

### Phase 3 — Decision & Design

| Audit | Area | Estimated scope |
|-------|------|-----------------|
| CML-632-A03 | Curriculum Revision | RevisioneTab (revision workflow) |
| CML-632-A04 | Teaching Design | ProgettazioneTab, CertificazioneTab, UDA wizard/archive |

### Phase 4 — Output & Support

| Audit | Area | Estimated scope |
|-------|------|-----------------|
| CML-632-A07 | Documents & Export | EsportazioniTab, export handlers, SCORM, templates |
| CML-632-A06 | Classroom & Social | ClasseTab, SocialTab, outcomes |
| CML-632-A05 | Process & Consent | ProcessoTab |

### Phase 5 — Cross-Cutting

| Audit | Area | Estimated scope |
|-------|------|-----------------|
| CML-632-A08 | Teacher Workspace | Sync, backup, persistence |
| CML-632-A09 | Copilot & AI | Chat, voice, Ollama |
| CML-632-A10 | Second Brain | WikiLLM, KB, glossary |
| CML-632-A13 | PA Certification | AgID documents |
| CML-632-A12 | User Guide | Static help content |

---

## 6. Progress Tracker

| ID | Area | Status | Verdict | Commit |
|----|------|--------|---------|--------|
| A01 | Home & Orientation | AUDIT_COMPLETE | REDESIGN | `4e02417` |
| A02 | Curriculum Consultation | AUDIT_COMPLETE | REDESIGN | `a6f3325` |
| A03 | Curriculum Revision | AUDIT_COMPLETE | REDESIGN | `c70f1d8` |
| A04 | Teaching Design (UDA) | AUDIT_COMPLETE | REDESIGN | `b39a1b7` |
| A05 | Process & Consent | PENDING | — | — |
| A06 | Classroom & Social | PENDING | — | — |
| A07 | Documents & Export | AUDIT_COMPLETE | REDESIGN | `64840dd` |
| A08 | Teacher Workspace | PENDING | — | — |
| A09 | Copilot & AI | PENDING | — | — |
| A10 | Second Brain & Knowledge | PENDING | — | — |
| A11 | Institute Sources | AUDIT_COMPLETE | REDESIGN | `eddbf6b` |
| A12 | User Guide | PENDING | — | — |
| A13 | PA Certification | PENDING | — | — |

---

## 7. First Area to Audit

**A01 — Home & Orientation**

Rationale:
- Entry point for all users
- No dependencies on other areas
- Quick to audit (small surface)
- Sets the tone for the entire product
- Onboarding flow determines adoption

After A01, proceed immediately to **A11 (Institute Sources)** then **A02 (Curriculum Consultation)** — these three form the foundation for all subsequent audits.

---

## 8. Rules

1. One area at a time. Do not start the next audit before the current one has a verdict.
2. No implementation during audit. Audit is read-only.
3. Each audit produces a single documentation commit.
4. Frozen modules are recorded but not audited independently.
5. If an audit reveals a dependency issue, record it and continue — do not jump to the dependency.
6. The roadmap may be reordered if early audits reveal unexpected priorities.
