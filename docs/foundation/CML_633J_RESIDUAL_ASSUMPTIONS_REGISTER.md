# CML-633J — Residual Assumptions Register

## Overview

This document records assumptions, hardcoded values, static references, and potential residual issues found in the codebase at baseline `4952b9b`. Each entry is classified by risk and paired with a recommended action.

## Format

For each finding:
- **File**: source file path
- **Line**: approximate line number
- **Category**: `institution-name`, `static-year`, `hardcoded-role`, `implicit-approval`, etc.
- **Risk**: high / medium / low / informational
- **Status**: noted / accepted / to-review
- **Action**: keep, remove, parameterize, document

## Findings

### Institutional References in Curriculum Content

| File | Line | Category | Risk | Status | Action |
|------|------|----------|------|--------|--------|
| `src/data/volumesKB.ts` | 221 | institution-name | low | accepted | Static reference to a specific institute (don Lorenzo Milani). This is curricular content, not system governance. |
| `src/data/volumesKB.ts` | 318 | institution-name | low | accepted | Static reference to CurManLight as exclusive institute tool. Content-level, not governance-level. |
| `src/data/volumesKB.ts` | 326 | institution-name | low | accepted | "Adozione di CurManLight come strumento ufficiale ed esclusivo d'Istituto" is curricular content, not system behavior. |
| `src/data/volumesKB.ts` | 294 | institution-name | low | accepted | CNR/AgID reference for MAUVE++ monitoring service. External reference, not system governance. |

### Legacy Approval Terminology in Domain Data

| File | Line | Category | Risk | Status | Action |
|------|------|----------|------|--------|--------|
| `src/domain/curriculum/identity/types.ts` | 87 | implicit-approval | low | accepted | `"Contenuto approvato dall'istituto"` is a qualification label used in legacy content tracking, not a system approval action. |
| `src/domain/curriculum/identity/legacyAdapters.ts` | 168 | implicit-approval | low | accepted | Comment about UDA approval. Advisory-only, does not trigger any action. |

### Document Export Disclaimer Language

| File | Line | Category | Risk | Status | Action |
|------|------|----------|------|--------|--------|
| `src/domain/revision/documentIntegration.ts` | 164 | implicit-approval | low | accepted | Disclaimer explicitly denies officiality. Correct behavior. |
| `src/domain/revision/documentIntegration.ts` | 226 | implicit-approval | low | accepted | "Registro locale delle attività, non protocollo ufficiale" — correct disclaimer. |
| `src/domain/revision/eventLog.ts` | 2 | implicit-approval | low | accepted | "Registro locale delle attività, non protocollo ufficiale" — correct disclaimer. |
| `src/domain/design/traceabilityA07.ts` | 18 | implicit-approval | low | accepted | "Non costituisce adozione ufficiale" — correct disclaimer. |

### UI Disclaimer Text (non-guided-workflow)

| File | Line | Category | Risk | Status | Action |
|------|------|----------|------|--------|--------|
| `src/features/curriculum/components/RevisioneTab.tsx` | 63,79 | implicit-approval | low | accepted | "Registro locale, non protocollo ufficiale" — correct disclaimer. |
| `src/features/documents/components/SecondBrainTab.tsx` | 599 | implicit-approval | low | accepted | "non ufficiale e non verificata" — correct disclaimer. |
| `src/features/progettazione/hooks/useKnowledgeCompanion.ts` | 61 | implicit-approval | low | accepted | Advises user to consult official text. Advisory only. |

### Institution Hardcoded Codes in Tests

| File | Line | Category | Risk | Status | Action |
|------|------|----------|------|--------|--------|
| `src/__tests__/institution-hardcodes.test.ts` | 48,176 | hardcoded-code | low | accepted | Test code using AVIC849003 and institutional authority terms. Tests verify that system does not claim institutional authority. |
| `src/__tests__/institution-integration.test.tsx` | 50,1169,1592 | hardcoded-code | low | accepted | Integration tests verifying no official claims. |

### Static School Year Reference

| File | Line | Category | Risk | Status | Action |
|------|------|----------|------|--------|--------|
| `src/store/curmanlight_v2_core_simulator.ts` | 49 | static-year | low | accepted | `[APPROVATO 2025]` prefix in simulator text generation. Simulator-only, not production behavior. |

### Legacy Adapter References

| File | Line | Category | Risk | Status | Action |
|------|------|----------|------|--------|--------|
| `src/domain/institution/legacyAdapters.ts` | — | legacy-reference | low | accepted | Adapter that handles legacy institutional data. Read-only, no writing. |
| `src/domain/transfer/legacyAdapters.ts` | — | legacy-reference | low | accepted | Adapter that handles legacy transfer contracts. Read-only, no writing. |
| `src/domain/documents/legacyAdapters.ts` | — | legacy-reference | low | accepted | Adapter that handles legacy document structures. Read-only, no writing. |
| `src/domain/curriculum/persistence/legacyAdapters.ts` | — | legacy-reference | low | accepted | Adapter for legacy curriculum data. Read-only, no writing. |

## Summary

- **Total findings**: 18 residual items across 12 files
- **High risk**: 0
- **Medium risk**: 0
- **Low risk**: 18 (all informational/educational content or correct disclaimers)
- **Informational** : 0 (all items are low-risk)
- **No CML-633J introduced regressions**
- **No new assumptions introduced by CML-633I or CML-633J**