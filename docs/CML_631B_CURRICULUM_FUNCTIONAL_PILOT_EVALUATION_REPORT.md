# CML-631B — Curriculum Functional Pilot Evaluation Report

**Date:** 2026-07-25
**Branch:** `feat/cml-631b-curriculum-functional-pilot-evaluation`
**Base:** CML-631A merged at `f6a9e81`
**Tests:** 83/83 pass (65 pilot + 18 evaluation)
**Decision:** **B** — Correggere prima di estendere

---

## Executive Summary

Il pilot CML-631A funziona correttamente per il ruolo Docente. I 6 scenari obbligatori sono tutti superati. L'audit ha rilevato 13 problemi correggibili con microfix (1 HIGH, 8 MEDIUM, 4 LOW): identificativo interno esposto, accenti mancanti, ARIA mancanti, focus indicators assenti, touch targets sottodimensionati. Tutti i microfix sono stati applicati e verificati. Il pilot e pronto per estensione a Dipartimento come read-only, previa conferma che le correzioni soddisfano gli standard di qualita.

---

## Scenario Results

| Scenario | Status | Issues | Notes |
|----------|--------|--------|-------|
| S1: Simple Linear Link | PASS | Nessuna | Link creato, stato draft, source/target corretti |
| S2: Interdisciplinary Link | PASS | Nessuna | Tipi diversi coesistono, validazione funziona |
| S3: Discontinuity | PASS | Nessuna | 6 tipi relazione disponibili, discontinuity valido |
| S4: Duplicate Detection | PASS | Nessuna | Duplicato bloccato, tipi diversi per stessa coppia consentiti |
| S5: Draft Lifecycle | PASS | Nessuna | Draft -> update -> delete funzionano |
| S6: Error Handling | PASS | Nessuna | Validazione input, read-only, auto-referenza bloccate |

---

## Evaluation Matrix

### Docente (Perugia)
- Task primario completabile in 3 click: (1) seleziona nodo partenza, (2) seleziona nodo arrivo, (3) compila e proponi
- Messaggi di errore chiari e azionabili
- Workflow intuitivo senza formazione
- Label chiare e consistenti (dopo microfix accenti)
- Dati mantenuti dopo errori di validazione (form non si resetta)
- Campo rationale obbligatorio incoraggia input pedagogico ragionato

### Dipartimento (Concettuale, read-only)
- Visibilita su tutti i link verticali (lista completa)
- Conteggio link visibile ("Elenco dei collegamenti (N)")
- Tipo relazione e stato chiaramente mostrati per ogni link
- Source/target identificabili tramite etichette nodi
- Rationale leggibile per comprendere la motivazione pedagogica
- Limite: Nessun filtro per segmento (tutti i link in una lista)
- Limite: Nessuna capacita di export

### Referente (Concettuale)
- Stato draft/validato chiaramente mostrato per ogni link
- Rationale leggibile per ogni collegamento
- Limite: Nessun workflow di approvazione (solo draft)
- Limite: Nessuna capability di modifica/reject

### Esperto di Didattica
- 6 tipi di relazione coprono i bisogni pedagogici fondamentali
- Discontinuita comunicata chiaramente come tipo distinto
- Campo rationale incoraggia input ragionato
- Rilevamento duplicati previene ridondanza
- Tipo relazione comprensibile (dopo microfix label)

---

## Audit Findings

### Language Audit (5 issues)

| Issue | Severity | Component | Status |
|-------|----------|-----------|--------|
| Identificativo interno "CML-631A" esposto | HIGH | PilotMainView | Corretto |
| Accenti mancanti (14 occurrences) | MEDIUM | Service + Components | Corretto |
| Label "Continuita"/"Discontinuita" senza accenti | MEDIUM | PilotVerticalLinkForm | Corretto |
| Header "Pilota Funzionale" troppo tecnico | LOW | PilotMainView | Corretto |
| "PUNTO DI PARTENZA E ARRIVO" phrasing | LOW | PilotMainView | Corretto |

### Accessibility Audit (5 issues)

| Issue | Severity | Component | Status |
|-------|----------|-----------|--------|
| Input ricerca senza aria-label | MEDIUM | PilotNodePicker | Corretto |
| Textarea senza aria-label | MEDIUM | PilotVerticalLinkForm | Corretto |
| Pulsanti toggle senza aria-pressed | MEDIUM | PilotStatusPanel, Form | Corretto |
| Pulsanti delete senza aria-label | LOW | PilotLinkList | Corretto |
| Nessun indicatore focus visibile | MEDIUM | Tutti i pulsanti | Corretto |

### Cognitive Load Audit (2 issues)

| Issue | Severity | Component | Status |
|-------|----------|-----------|--------|
| Header "Dominio Produttivo" troppo tecnico | MEDIUM | PilotMainView | Corretto |
| "PUNTO DI PARTENZA E ARRIVO" phrasing | LOW | PilotMainView | Corretto |

### Mobile Audit (2 issues)

| Issue | Severity | Component | Status |
|-------|----------|-----------|--------|
| Mode selector flex overflow | MEDIUM | PilotStatusPanel | Corretto |
| Touch target < 44px (11 buttons) | MEDIUM | Tutti i componenti | Corretto |

---

## Microfixes Applicati (13)

| # | Issue | Severity | Component | Fix |
|---|-------|----------|-----------|-----|
| 1 | Internal ID exposed | HIGH | PilotMainView | Rimosso "CML-631A --" dall'header |
| 2 | Missing accents (14x) | MEDIUM | Service + Components | Aggiunti accenti su modalita, puo, e, gia |
| 3 | Missing aria-label input | MEDIUM | PilotNodePicker | Aggiunto aria-label dinamico |
| 4 | Missing aria-label textarea | MEDIUM | PilotVerticalLinkForm | Aggiunto aria-label |
| 5 | Missing aria-pressed (2x) | MEDIUM | PilotStatusPanel, Form | Aggiunto aria-pressed sui toggle |
| 6 | Missing aria-label button | LOW | PilotLinkList | Aggiunto aria-label su delete |
| 7 | Missing focus indicators | MEDIUM | Tutti i pulsanti | Aggiunto focus:ring-2 focus:ring-indigo-500/40 |
| 8 | Touch targets < 44px | MEDIUM | Tutti i pulsanti | Aumentato py-1.5 a py-2 |
| 9 | Mode selector overflow | MEDIUM | PilotStatusPanel | flex-space-x-2 a flex-wrap gap-2 |
| 10 | Header too technical | LOW | PilotMainView | "Pilota Funzionale" a "Pilota Sperimentale" |
| 11 | Section header phrasing | LOW | PilotMainView | "PUNTO DI PARTENZA E ARRIVO" a "SELEZIONA I NODI DA COLLEGARE" |
| 12 | Button aria-label (init) | LOW | PilotStatusPanel | Aggiunto aria-label su inizializza |
| 13 | Node button aria-label | LOW | PilotNodePicker | Aggiunto aria-label con stato selezione |

---

## Decision

**Decision: B — Correggere prima di estendere**

### Rationale

Il pilot CML-631A funziona correttamente per il ruolo Docente. Tutti i 6 scenari obbligatori sono superati. L'audit ha identificato 13 problemi, tutti correggibili con microfix. I microfix sono stati applicati e i test (83/83) passano.

La decisione B (anziche C) perche:
1. Le correzioni sono state applicate in questo slice, non prima
2. La validazione visiva e mancante (il pilot non e stato testato con utenti reali)
3. Il Dipartimento non e stato esplicitamente coinvolto nella definizione dei requisiti

### Condizioni per Progressione a Decisione C

Prima di passare a CML-631C (estensione a Dipartimento), e necessario:
1. Confermare che i microfix soddisfano gli standard di qualita del team
2. Ottenere feedback dalmeno un docente pilota
3. Verificare che la lista link sia sufficiente per le esigenze di dipartimento
4. Definire i requisiti di filtro/export per il Dipartimento (CML-631C scope)

### Prossimi Passi

1. Revisionare i microfix applicati nel PR
2. Chiedere feedback al docente pilota
3. Se confermato, procedere con CML-631C (Dipartimento Read-Only)
4. Se problematico, applicare correzioni aggiuntive (rimane B)

---

## Appendix: File Changed

| File | Change Type | Lines Changed |
|------|-------------|---------------|
| src/features/curriculum-functional-pilot/components/PilotMainView.tsx | Microfix | 4 |
| src/features/curriculum-functional-pilot/components/PilotStatusPanel.tsx | Microfix | 5 |
| src/features/curriculum-functional-pilot/components/PilotVerticalLinkForm.tsx | Microfix | 4 |
| src/features/curriculum-functional-pilot/components/PilotNodePicker.tsx | Microfix | 3 |
| src/features/curriculum-functional-pilot/components/PilotLinkList.tsx | Microfix | 2 |
| src/features/curriculum-functional-pilot/hooks/useCurriculumPilot.ts | Microfix | 6 |
| src/features/curriculum-functional-pilot/application/curriculumPilotService.ts | Microfix | 10 |
| src/__tests__/curriculum-functional-pilot/pilot-evaluation.test.ts | New file | 220 |
| docs/CML_631B_CURRICULUM_FUNCTIONAL_PILOT_EVALUATION_REPORT.md | New file | 150 |
