# CML-633H — Curriculum-to-Design Transfer: Implementation Plan

> **Branch:** `feat/cml-633h-curriculum-to-design-transfer` (from `f93da3d`)
> **Baseline commit:** `f93da3d` (CML-633G_COMPLETE)

## Ricognizione A04 — Quadro sintetico

| Area | Stato attuale | Gap |
|------|---------------|-----|
| `UdaModel` | Contiene `traguardi`, `obiettivi`, `evidenze` come string array. Nessun riferimento canonico. | Manca provenienza, nodo curricolare, versione, qualificazione |
| `ProgettazioneTab.tsx` | 1096 LOC, home + annuale + archivio + certificazione. Wizard con 4 passi. | Nessuna distinzione tra curricolo vigente/proposto/pianificato |
| Knowledge Companion | Integrato nei passi 2-4 del wizard. | Non collegato al dominio revisione |
| Store | `savedUda: UdaModel[]`, `addUda`, `deleteUda`, `clearUdaLibrary` | Manca archivio selezioni curricolari |
| A02→A04 contract | `A02ToA04Payload` definito in `areaContracts.ts` con validazione | Manca esecuzione del trasferimento |
| A03→A04 contract | `A03ToA04Payload` definito con `proposalRefs` e `decisionRefs` opzionali | Manca integrazione con `RevisionArchive` |
| `DesignCurriculumSelection` | Non esiste | Da creare |

## Task

### Task 1 — Domain Types (`src/domain/design/types.ts`)
`DesignCurriculumSelection` con `id`, `metadata`, `designRef`, `sourceArea`, `sourceEntityRef`, `curriculumNodeRef`, `curriculumVersionRef`, `currentTextSnapshot`, `selectedTextSnapshot`, `qualification`, `sourceRefs`, `evidenceRefs`, `institutionalContextRef`, `transferredAt`, `transferredBy`, `transferContractVersion`, `structuralFootprint`, `warnings`.

Qualification: `current-curriculum` | `proposed-content` | `planned-institute-content` | `legacy-content` | `experimental-content`.

### Task 2 — Qualification Model (`src/domain/design/qualifications.ts`)
Regole per ogni qualificazione, label, mappatura A02/A03 → qualificazione.

### Task 3 — A02→A04 Transfer (`src/domain/design/transferA02.ts`)
Usa `A02ToA04Payload` di `areaContracts.ts`. Crea `DesignCurriculumSelection` con qualifica `current-curriculum`. Snapshot immutabile.

### Task 4 — A03→A04 Transfer (`src/domain/design/transferA03.ts`)
Matrice di trasferibilità CML-633G. Usa `RevisionArchive`. Qualificazione `proposed-content` / `planned-institute-content` / `legacy-content`.

### Task 5 — Design Archive (`src/domain/design/archive.ts`)
`DesignArchive` con `selections: DesignCurriculumSelection[]`. Repository: `addSelection`, `getSelection`, `listSelectionsForDesign`, `replaceSnapshot`, `removeSelection`, `compareWithSource`, `verifyIntegrity`.

### Task 6 — Store Integration
Aggiungere `designArchive: DesignArchive` allo Zustand state con `replaceDesignArchive`. Validazione in reidratazione. Nessuna nuova tabella Dexie.

### Task 7 — UDA Integration
Adattatore: `enrichUdaWithSelections(uda, archive)` → arricchisce UDA leggendo selezioni. `extractSelectionsFromUda(uda)` → estrae per retrocompatibilità. Nessuna modifica distruttiva al modello UDA.

### Task 8 — Conflitti (`src/domain/design/conflicts.ts`)
Stessa sorgente, versione diversa, proposta sostituita, decisione revocata, fonte non risolvibile, entità eliminata.

### Task 9 — A04 Surface
Sezione "Selezioni curricolari" nel wizard di progettazione. Mostra origine, qualificazione, testo, fonti, stato sorgente. Azioni: usa nella progettazione, aggiorna snapshot, rimuovi.

### Task 10 — A07 Traceability
Verifica che `A04→A07` preservi riferimenti e qualificazione.

### Task 11 — Tests (7 file)
`design-transfer-domain.test.ts`, `design-transfer-a02.test.ts`, `design-transfer-a03.test.ts`, `design-transfer-repository.test.ts`, `design-transfer-legacy.test.ts`, `design-transfer-integration.test.tsx`, `design-transfer-export.test.ts`.

### Task 12 — Documentation (6 file)
`CML_633H_CURRICULUM_TO_DESIGN_TRANSFER_IMPLEMENTATION.md`, schema, contracts, snapshot policy, legacy migration, A04→A07 traceability.

### Task 13 — Final Verification
`tsc --noEmit`, `npm test`, `npm run build`, `npm run build-storybook`, `git diff --check`.

## Constraints
- No new dependencies
- No Dexie schema changes
- No curriculum content modification
- No governance changes
- No retroactive modification
- No double-write
- UDA model preserved with optional enrichment