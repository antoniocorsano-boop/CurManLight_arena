# CML-631I — Assisted Pedagogical Relation Suggestions

**Status**: COMPLETE_LOCAL
**Branch**: `feat/cml-631i-assisted-pedagogical-relation-suggestions`
**Date**: 2026-07-26

## Objective

Add an intelligent suggestion system for pedagogical relation types in the curriculum vertical link form. After the doctor selects two nodes, the system proposes 1–3 motivated relation alternatives. The doctor retains full control: suggestions are proposals, not impositions.

## Core Principle

> Il sistema propone e argomenta; il docente decide, modifica e conferma.

## What Was Implemented

### 1. Pedagogical Suggestion Engine (`pedagogicalSuggestionEngine.ts`)

Local, deterministic, testable engine that analyzes source and target `CurriculumNode` to generate 1–3 suggestions.

**Rules implemented:**
- Same type + keyword overlap → continuity (high confidence)
- Same type + no overlap → development (high confidence)
- objective → competence → integration (medium)
- competence → objective → development (medium)
- milestone → milestone with overlap → prerequisite (medium)
- Different type + overlap → integration (medium)
- Statistics keywords → deepening (high)
- Geometry piana → spazio → prerequisite (high)
- Cross-level with overlap → development (medium)
- Cross-level with no overlap → discontinuity (low)
- Fallback rules for edge cases

**Properties:**
- No external services, no randomness, no network calls
- Pure function: same input → same output
- Returns max 3 suggestions, ordered by confidence
- Deduplicates by relationType

### 2. Suggestion UI (`PilotVerticalLinkForm.tsx`)

New "Possibili relazioni suggerite" section above the manual relation type selector:
- Shows only after both nodes are selected
- Displays 1–3 suggestions with confidence badges (high/medium/low)
- Each suggestion shows: relation type label, confidence badge, motivation text, "Usa questa proposta" button
- "Ignora" button dismisses all suggestions
- Selecting a suggestion populates both relation type AND motivation
- Doctor can always override by selecting a different type manually
- Manual selection is never blocked

### 3. Data Flow

```
Source Node + Target Node
    ↓
generatePedagogicalSuggestions(source, target)
    ↓
1–3 PedagogicalSuggestion[]
    ↓
UI renders suggestions with "Usa questa proposta"
    ↓
Doctor clicks "Usa questa proposta"
    ↓
relationType + rationale auto-populated
    ↓
Doctor can edit, override, or submit
```

## Files Changed

| File | Change |
|------|--------|
| `src/features/curriculum-functional-pilot/pedagogicalSuggestionEngine.ts` | **NEW** — Suggestion engine |
| `src/features/curriculum-functional-pilot/components/PilotVerticalLinkForm.tsx` | Modified — Added suggestion UI |
| `src/features/curriculum-functional-pilot/components/PilotMainView.tsx` | Modified — Pass node objects to form |
| `src/__tests__/curriculum-functional-pilot/cml631i-pedagogical-suggestion-engine.test.ts` | **NEW** — 18 tests |

## Tests

18 tests pass (15 required):

| # | Test | Status |
|---|------|--------|
| T1 | No suggestions without source node | ✅ |
| T2 | No suggestions without target node | ✅ |
| T3 | Maximum 3 suggestions | ✅ |
| T4 | Suggestions ordered by confidence | ✅ |
| T5 | Continuity for same-type with overlap | ✅ |
| T6 | Development for same-type without overlap | ✅ |
| T7 | Prerequisite for geometry nodes | ✅ |
| T8 | Integration for objective→competence | ✅ |
| T9 | Deepening for statistics nodes | ✅ |
| T10 | Non-empty motivation for every suggestion | ✅ |
| T11 | No duplicate relation types | ✅ |
| T12 | Only valid relation types | ✅ |
| T13 | Deterministic output | ✅ |
| T14 | No external calls | ✅ |
| T15 | Cross-level discontinuity fallback | ✅ |
| T16 | Integration for different type with overlap | ✅ |
| T17 | Continuity for competence→competence | ✅ |
| T18 | Valid confidence values | ✅ |

## Validation

- **TypeScript**: Clean (`tsc --noEmit`)
- **Build**: Passes (`npm run build`)
- **Tests**: 137/137 curriculum pilot tests pass
- **Browser**: 0 console errors, page loads correctly

## Forbidden (Respected)

- ❌ No remote models
- ❌ No auto-selection
- ❌ No auto-save
- ❌ No external data
- ❌ No telemetry
- ❌ No modification of canonical curriculum data
- ❌ No persistence format changes
