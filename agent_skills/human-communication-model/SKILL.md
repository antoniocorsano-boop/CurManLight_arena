---
name: human-communication-model
description: >-
  Governs role-aware, task-aware and authority-safe human communication through
  reusable terminology, tone, progressive disclosure and memory rules.
license: Apache-2.0
metadata:
  version: "1.0.0"
  scope: "repository-installable"
  compatible_with: "human-interaction-model >=1.0.0"
---

# Human Communication Model — Agent Skill

## Purpose
Apply HCM whenever a product exposes canonical state to a human.

Core rule:
> Preserve the canonical truth; adapt only its human projection.

HCM complements HIM:
- **HIM** models the human task, journey, consequence and recovery boundary.
- **HCM** governs how that state is expressed for a role, task phase and detail level.

HCM must never become an authority engine, policy engine or source of canonical facts.

## Read first
When installed, inspect:
1. `.human/hcm.config.json`
2. `.human/him.config.json`
3. the relevant `.human/tasks/*.json`
4. domain authority/capability contracts
5. current UI copy and recovery states
6. any persisted adaptive-memory implementation

## Required projection sequence
Before writing user-visible copy determine, in order:
1. canonical domain state;
2. current Human Task and phase;
3. human role/context relevant to vocabulary;
4. consequence level;
5. authority state supplied by the domain;
6. presentation detail level: PRIMARY, SECONDARY or TECHNICAL;
7. recovery state, if any;
8. whether any local memory may personalize the projection.

Do not infer canonical truth, capability or Decision Authority from wording, role labels or remembered UI state.

## Role rule
Roles may change:
- vocabulary;
- examples;
- emphasis;
- tone within the permitted task-phase envelope.

Roles must never change:
- membership;
- capability;
- Decision Authority;
- institutional outcome;
- canonical receipt state.

A remembered or locally declared role is communication context only until independently verified by the owning domain.

## Tone by task phase
Task phase dominates cosmetic role preference:
- ORIENT → plain and concise;
- EXPLORE → descriptive;
- ACT → operational and verb-led;
- REVIEW → precise;
- DECIDE → formal, consequence-explicit, non-persuasive;
- RECOVER → factual: what happened, what remains safe, what to do next;
- COMPLETE → confirmatory with receipt/state when applicable.

Do not use celebratory, alarming or persuasive language for institutional decisions.

## Terminology layers
### PRIMARY
Use human/domain language required for the immediate task. Do not expose UUIDs, internal enum values, RPC/RLS terminology, database concepts, implementation identifiers or hashes unless the task itself is explicitly technical.

### SECONDARY
May expose provenance, verification state, policy rationale and domain precision needed for informed work.

### TECHNICAL
May expose identifiers, fingerprints, schemas and implementation diagnostics. Technical detail must be reached intentionally through progressive disclosure or a technical surface.

Never hide a material consequence merely because it is technical. Translate the consequence first; expose the implementation detail second.

## Memory model
Adaptive memory may remember only context that improves continuity without becoming truth:
- working context;
- display preferences;
- resume point;
- role context as a non-authoritative preference.

Adaptive memory must not be treated as canonical evidence for:
- membership;
- Decision Authority;
- institutional decisions;
- receipts.

Canonical records can of course be persisted by their owning domain; they are not HCM "memory".

## Error and recovery language
A recoverable failure should normally communicate four things in this order:
1. what could not be completed;
2. whether anything was changed;
3. what remains available/safe;
4. the next recovery action.

Prefer `Connessione non disponibile. Nessuna decisione è stata registrata. Riprova quando torni online.` over transport or stack terminology in the primary layer.

## Consequential actions
For consequential actions HCM must preserve HIM/domain boundaries:
- no preselected outcome when human choice is required;
- consequence visible before commit;
- authority state described from domain evidence only;
- neutral language among valid outcomes;
- receipt described after commit;
- technical fingerprint/details secondary unless explicitly needed for verification.

## Reuse contract
A repository installation consists of:
- `agent_skills/human-communication-model/SKILL.md`;
- `tools/human-communication-model/`;
- `.human/hcm.config.json`;
- an optional pure runtime adapter using the same concepts.

Initialize configuration with:
`node tools/human-communication-model/init.mjs .`

Validate with:
`node tools/human-communication-model/validate.mjs .`

Product-specific React/components are explicitly outside the reusable contract.

## Fail-closed conditions
Return the surface to review when:
- role wording implicitly grants authority;
- remembered state is used as membership/authority evidence;
- primary copy leaks avoidable technical identifiers;
- a consequential decision uses persuasive or ambiguous language;
- failure copy omits whether a mutation occurred;
- the technical label and human label disagree about canonical state;
- copy invents a state not supplied by the domain.

## Completion report
Report:
- HCM profile/version;
- Human Task IDs affected;
- role projections introduced;
- task-phase tone used;
- terminology layers;
- memory categories read/written;
- authority source;
- technical leakage result;
- unresolved human-language decisions.
