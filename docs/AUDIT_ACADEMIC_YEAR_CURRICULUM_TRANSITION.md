# ACADEMIC YEAR & CURRICULUM TRANSITION AUDIT

> **Modalità:** READ-ONLY  
> **Commit baseline:** `259f7ae` (CML-629)  
> **Data:** 2026-07-24  
> **Autore:** opencode (Fase 2)  
> **Riallineato:** CML-630F, 24 luglio 2026

---

## 1. EXECUTIVE SUMMARY

L'audit rivela che la transizione IN2012 → IN2025 è **strutturalmente presente** nel tipo `Proposal` (oldText/newText) e nel meccanismo di voto per-proposta (`decisions`), ma **non era governata da un modello dati authoritative** al momento dell'audit. La logica di transizione dipendeva da:

- **Una stringa hard-coded** (`'2026-2027'`) in 4 punti di 2 file
- **Una formula booleana** (`schoolYear === '2026-2027' && targetClass !== '1' && order !== 'infanzia'`) che determina il regime normativo
- **Nessun campo `schoolYear`** sul modello UDA — le UDA perdono la provenienza dell'anno
- **Nessun campo `frameworkVersion`** — il regime non è mai persistito

> *L'insegnante che crea UDA in classe 2^ primaria nel 2026-2027 non ha modo di sapere se la sua classe segue IN2012 o IN2025 senza guardare il banner colorato. Quando cambia l'anno scolastico, le UDA vecchie restano senza contesto normativo.*

---

## 2. FINDING STORICI

### 2.1 Stringa year-pegged

La formula `schoolYear === '2026-2027'` compariva in 4 punti di 2 file (`useUdaProgrammingHandlers.ts:77`, `ProgettazioneTab.tsx:605-619`). Il rischio era l'obsolescenza annuale: al cambio di anno scolastico, la formula non avrebbe più funzionato senza modifiche al codice.

### 2.2 Nessun anno scolastico sulle UDA

Il tipo `UdaModel` non conteneva `schoolYear` né `frameworkVersion`. Una UDA salvata perdeva la provenienza normativa.

### 2.3 Assenza di modello istituzionale

Non esisteva un modello del curricolo verticale d'istituto. La logica era distribuita e duplicata.

### 2.4 Vista multi-classe assente

L'insegnante che copre più classi non poteva vedere contemporaneamente i regimi di ciascuna.

### 2.5 Raccomandazione iniziale superata

L'audit iniziale proponeva **Class Regime Config** (configurazione per-classe). Questa direzione è stata successivamente **superata** dalla consapevolezza che il centro del dominio non è la classe ma il **curricolo verticale d'istituto**:

```text
quadro nazionale
  → curricolo verticale d'istituto
    → segmenti applicabili alle coorti
      → progettazione annuale
        → UDA
```

---

## 3. MAPPA DELLE ZONE (stato all'epoca dell'audit)

### 3.1 Anno scolastico
- Default `'2025-2026'` in Zustand store
- Setter `setSchoolYear` in Zustand store
- UdaModel: nessun campo `schoolYear`

### 3.2 IN2012 / IN2025
- Per-proposta: `decisions[proposal.id] = 'approved'|'rejected'` (solo visualizzazione testo)
- Per-classe: formula booleana in 2 file
- Export: header sempre `D.M. 221/2025`

### 3.3 Ordine / Classe
- `SchoolOrder`: 3 valori stringa, nessuna costante condivisa
- Classe: `string` libero, nessun tipo `ClassNumber`

### 3.4 Duplicazioni
- Store: `src/store/` (Dexie, attivo) vs `src/stores/` (localStorage, legacy)
- Formula: 2 file
- Iterazione ordini: 8+ file con literal `['infanzia', 'primaria', 'secondaria']`

### 3.5 Salvataggio
- UDA: Zustand → IndexedDB
- Programmazione: localStorage (consolidated blob)
- Gap: UdaModel senza `schoolYear`

### 3.6 Archivio / Clonazione
- Stato transitions: inesistenti (solo `bozza` usato)
- Clonazione: `handleCloneUdaAdaptive` (traguardi re-allineati, obiettivi no)
- Year rollover: assente

### 3.7 Fonti normative
- D.M. 254/2012, D.M. 221/2025, D.M. 14/2024, D.M. 183/2024, D.M. 182/2020: tutti registrati
- GDPR: testo in wikiLLM, nessun filtro runtime

### 3.8 Casi transitori non coperti
- Studente ripetente: non coperto
- Trasferimento inter-scuola: non coperto
- Curricolo misto: formula only, nessun tag per-classe

---

## 4. RACCOMANDAZIONE INIZIALE (SUPERATA)

L'audit iniziale raccomandava **Alternativa B: Class Regime Config** (~400 LOC, ~10 file).

**Questa raccomandazione è stata superata** dalla proposta di dominio successiva che ha identificato nel curricolo verticale d'istituto il vero oggetto di dominio. La direzione corrente è:

```text
CML-630A–E: Institute Curriculum Transition Management
```

---

## 5. ESITO SUCCESSIVO ALL'AUDIT

### CML-630A — National Framework Applicability Foundation

**Status:** COMPLETE_REMOTE  
**Commit:** `6c8c93c`

CML-630A ha introdotto una fondazione normativa pura e testabile. Il problema della formula year-pegged è risolto a livello di dominio, ma non ancora integrato nel runtime.

Perimetro effettivo:
- `AcademicYear` (tipo strutturato)
- `NationalFramework` (tipo)
- `TransitionPolicy` (politica stabile)
- `FrameworkResolution` (risoluzione con motivazione)
- Helper: `createAcademicYear`, `formatAcademicYear`, `isValidAcademicYear`
- Resolver puro: `resolveNationalFramework()`
- Matrice pluriennale testata (2025/2026 → 2030/2031 + stabilità futura)
- Validazione contesti invalidi

Evidenze:
- 122 nuovi test
- 472/472 test complessivi
- TypeScript 0 errori
- Build Vite verde
- Storybook verde

### Stato del runtime

La formula runtime preesistente (`schoolYear === '2026-2027' && targetClass !== '1' && order !== 'infanzia'`) **non è stata ancora sostituita**. Il resolver CML-630A esiste nel dominio puro ma non è integrato nei componenti esistenti.

---

## 6. STATO FINALE

```text
ACADEMIC_YEAR_AND_CURRICULUM_TRANSITION_AUDIT_COMPLETE
FOUNDATION: CML-630A COMPLETE_REMOTE (6c8c93c)
RUNTIME_INTEGRATION: NOT_STARTED
```

---

*Audit completato in modalità READ-ONLY. Riallineato con CML-630F il 24 luglio 2026.*
