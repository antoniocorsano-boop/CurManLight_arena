---
name: knowledge-experience
description: >-
  Governs task-first, evidence-first knowledge, assistant, semantic relations,
  intelligent visualizations and historical archive UX with independent refutation.
license: Apache-2.0
metadata:
  version: "1.0.0"
  scope: "repository-installable"
---

# Knowledge Experience — Agent Skill

## Purpose
Use this skill when changing CurManLight Arena surfaces involving knowledge, sources, assistant, wiki, archive, glossary, graphs, relations or intelligent visualizations.

Core rule:
> Start from the user's question and evidence chain; never expose the implementation graph as the product model.

## Read first
1. `AGENTS.md`
2. `docs/WORKING_PROTOCOL.md`
3. `agent_skills/human-interaction-model/SKILL.md`
4. `docs/KNOWLEDGE_EXPERIENCE_SPEC_V1.md`
5. `docs/KNOWLEDGE_EXPERIENCE_IMPLEMENTATION_PLAN.md`
6. `docs/KNOWLEDGE_EXPERIENCE_AGENT_ORCHESTRATION.md`
7. current Beta/browser evidence relevant to the change

## Required execution sequence

### Phase A — Product/UX owner
Determine:
- user task;
- question being answered;
- evidence required;
- plain-language labels;
- progressive disclosure;
- mobile baseline;
- acceptance criteria.

Emit `SPEC_READY` only when the task can be stated without reference to internal modules or frameworks.

### Phase B — Implementation owner
Implement one KX tranche at a time.
Do not:
- redesign unrelated architecture;
- add a new graph engine before the semantic read model is accepted;
- change institutional authority;
- remove provenance warnings;
- expose code/module nodes in the ordinary user journey.

Emit `IMPLEMENTATION_READY` with changed files and targeted checks.

### Phase C — Evidence/authority verification
Verify:
- source vs inference remains distinguishable;
- proposal vs decision remains distinguishable;
- generated output is not represented as official evidence;
- no automatic promotion path is introduced.

Emit `AUTHORITY_PASS` or `AUTHORITY_BLOCK`.

### Phase D — Human factors verification
Verify:
- task-first entry;
- plain language;
- mobile 390×844;
- no required nested scrolling for the primary task;
- accessible target/focus hierarchy;
- technical implementation terms are progressively disclosed or absent.

Emit `HUMAN_FACTORS_PASS` or `HUMAN_FACTORS_BLOCK`.

### Phase E — Independent third-party refutation
A reviewer different from the implementation owner must try to disprove readiness.
The refuter must inspect spec, diff and direct evidence rather than relying on the implementer's summary.

Required attacks:
- user need mismatch;
- technical leakage;
- evidence ambiguity;
- authority inflation;
- mobile friction;
- graph without a meaningful user question;
- visualization that cannot be understood without technical knowledge.

Verdict:
- `NO_BLOCKING_OBJECTION`
- `NON_BLOCKING_OBJECTION`
- `BLOCKING_OBJECTION`

A blocking objection stops promotion.

## Canonical user model
Primary knowledge tasks:
1. Cerca e chiedi
2. Relazioni
3. Termini chiave
4. Archivio storico

Canonical semantic nodes:
`Fonte → Documento → Passaggio → Concetto → Traguardo → Obiettivo → Disciplina → Classe/Ordine → Proposta → Decisione`

Do not substitute internal nodes such as `App.tsx`, Zustand stores, bundles or `.ts/.tsx` modules in the user-facing semantic map.

## Intelligent visualization rule
Every intelligent visualization must answer a named user question and expose its evidence basis.
Supported target families:
- Mappa delle evidenze;
- Confronto 2012/2025;
- Percorso verticale;
- Rete interdisciplinare;
- Vista di impatto.

The graph is never the only usable representation: provide list/path fallbacks.

## Completion report
Report:
- KX tranche;
- Human Task affected;
- spec sections implemented;
- changed files;
- automated checks;
- browser evidence;
- `AUTHORITY_*` verdict;
- `HUMAN_FACTORS_*` verdict;
- refutation verdict and objections;
- remaining human gate status.
