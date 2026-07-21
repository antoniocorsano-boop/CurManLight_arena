# 01 — INFORMATION ARCHITECTURE

**CurManLight — Product Experience 2.0**
**Milestone:** CML-600

---

## Panoramica

CurManLight è un'applicazione a **singolo tab principale** con navigazione laterale (sidebar collassabile su desktop, barra fissa in basso su mobile). Non utilizza React Router: la navigazione è gestita interamente tramite stato `useState` nel componente `App.tsx`.

La struttura è organizzata in **5 Ambiente** nella sidebar, ciascuno contenente schermate e sotto-schermate. L'utente naviga tra gli ambienti dalla sidebar, e tra le sotto-schermate tramite tab bar o sub-tab interni.

---

## Gerarchia Completa di Navigazione

```
CurManLight
├── NAVIGAZIONE GLOBALE
│   └── Home Dashboard
│
├── AMBIENTE CURRICOLO
│   └── Consulta Curricolo
│       ├── Vista Strutturata (Albero)
│       ├── Raccordo Diacronico (Mappa)
│       ├── Integrazione & Popolamento
│       ├── Revisione (Gap 2025)
│       └── Fonti d'Istituto
│
├── AMBIENTE PROGETTAZIONE UDA
│   ├── [Home d'Area — solo se non in WebDriver]
│   ├── Compilatore UDA (Wizard)
│   ├── Archivio UDA d'Istituto
│   ├── Matrice delle Competenze (DM 14/24)
│   ├── Processo & Consenso
│   └── Esportazione File d'Ufficio
│
├── AMBIENTE CLASSE
│   ├── [Home d'Area — solo se non in WebDriver]
│   ├── Ambiente & Esiti Classe
│   │   ├── Registro d'Aula (Roster & Esiti)
│   │   ├── Strumenti d'Aula (Disposizione & Gruppi)
│   │   └── Pianificazione (Gantt & Budget)
│   └── Osservatorio dei Riusi d'UDA (Social)
│
├── SUPPORTO & CERTIFICAZIONI
│   ├── Certificazione PA (AgID)
│   ├── WikiLLM & Brain d'Istituto
│   │   ├── Biblioteca & Copilota
│   │   ├── Mappa Connessioni
│   │   └── Glossario d'Istituto
│   └── Guida Operativa
│
└── COPILOTA (overlay globale, accessibile da qualsiasi schermata)
```

---

## Mappatura Stato → Schermata

Ogni schermata è identificata da una combinazione di stato `activeTab` + stato secondario. Di seguito la mappatura completa.

| `activeTab` | Stato secondario | Schermata visualizzata |
|-------------|------------------|----------------------|
| `dashboard` | — | Home Dashboard |
| `curricolo` | `activeCurricoloView: 'albero'` | Consulta — Vista Strutturata (Albero) |
| `curricolo` | `activeCurricoloView: 'mappa'` | Consulta — Raccordo Diacronico (Mappa) |
| `curricolo` | `activeCurricoloView: 'popolamento'` | Consulta — Integrazione & Popolamento |
| `revisione` | — | Revisione (Gap 2025) |
| `fonti` | `activeGeneralSubtab` | Fonti d'Istituto (4 sotto-viste) |
| `progetta-annuale` | `activeProgTab: 'home'` | Progettazione — Home d'Area |
| `progetta-annuale` | `activeProgTab: 'annuale'` | Progettazione — Compilatore UDA (Wizard) |
| `progetta-annuale` | `activeProgTab: 'uda'` | Progettazione — Archivio UDA |
| `progetta-annuale` | `activeProgTab: 'certificazione'` | Progettazione — Matrice Competenze |
| `progetta-annuale` | `activeProgTab: 'social'` | Classe — Osservatorio Riusi d'UDA |
| `progetta-annuale` | `activeProgTab: 'classe-home'` | Classe — Home d'Area |
| `progetta-annuale` | `activeProgTab: 'classe'` | Classe — Ambiente & Esiti Classe |
| `processo` | `activeProcessoTab: 'flusso'` | Processo — Flusso Collaborativo |
| `processo` | `activeProcessoTab: 'verifica'` | Processo — Delibera & Verifica |
| `esportazioni` | `esportazioniTab: 'standard'` | Esportazioni — Standard (Word, ODF, PDF) |
| `esportazioni` | `esportazioniTab: 'template'` | Esportazioni — Modelli con IA |
| `certificazione-pa` | — | Certificazione PA (AgID) |
| `second-brain` | `secondBrainTab: 'brain'` | WikiLLM — Biblioteca & Copilota |
| `second-brain` | `secondBrainTab: 'graph'` | WikiLLM — Mappa Connessioni |
| `second-brain` | `secondBrainTab: 'glossary'` | WikiLLM — Glossario d'Istituto |
| `guida` | — | Guida Operativa |

---

## 1. NAVIGAZIONE GLOBALE — Home Dashboard

**Tab:** `dashboard`
**Icona sidebar:** `FolderOpen` (Lucide)
**Posizione sidebar:** Prima voce, sotto l'etichetta "Navigazione Globale"

### Scopo
Punto di ingresso dell'applicazione. Mostra widget dinamici in base al ruolo selezionato e accessi rapidi alle tre aree principali (Curricolo, Progettazione, Classe).

### Contenuto

**Widget di Stato (cambia per ruolo):**

| Ruolo | Widget mostrati |
|-------|----------------|
| Insegnante | Stato Lavoro — Numero UDA in archivio / 5 moduli (barra progresso) |
| Dipartimento | Votazione Gap Ordinamentali (46/46), Stato Decisioni d'Area (n. voti registrati), Esportazione Gruppo (.cml) |
| Referente | Consenso d'Istituto (% adesione Linee Guida 2025), Unione Consensi Merger (accesso), Copertura PTOF (8/8 Competenze Europee) |
| Dirigente / Collegio | Certificazioni PA d'Istituto (WCAG, GDPR, Plessi), Delibera Consiliare (accesso a bozza Vol. 10), Dichiarazione Accessibilità AgID (download) |
| Amministratore | Stato Database (IndexedDB/Dexie), Stato PWA & Caching (Service Worker), Copia Sicurezza (gestione backup/reset) |

**Aree d'Azione (card cliccabili):**
- **Curricolo** — Apri Consulta / PTOF Hub (IA)
- **Progettazione** — Apri Wizard / Esporta Word
- **Classe** — Ambiente & Esiti / Osservatorio Riusi

**Altri elementi:**
- Pulsante "Guida Rapida" (apre la Guida Operativa)
- Indicatore di stato "Salvataggio automatico" (badge verde/ambra)
- Pulsante "Nuovo Onboarding" (riavvia il modal di primo avvio)

### Dati visualizzati
- Conteggio UDA salvate (Zustand → `savedUda.length`)
- Conteggio decisioni registrate (Zustand → `decisions`)
- Stato Service Worker (letto da `sw.js`)
- Stato IndexedDB (letto da Dexie)

---

## 2. AMBIENTE CURRICOLO

**Etichetta sidebar:** "Consulta Curricolo"
**Gruppo sidebar:** Sezione espandibile con bordo laterale indaco

### 2.1 Vista Strutturata (Albero)

**Tab:** `curricolo` · **View:** `albero`
**Descrizione sidebar:** "Vista Strutturata (Albero)"

#### Scopo
Visualizzare l'albero verticale dei traguardi e degli obiettivi di apprendimento per ogni disciplina, attraverso i 3 ordini scolastici (infanzia, primaria, secondaria). L'utente seleziona una disciplina e un ordine, e il sistema mostra la mappatura completa classe per classe.

#### Contenuto
- **Selettore disciplina** (dropdown con 14 discipline, tradotte per l'infanzia nei 5 Campi di Esperienza)
- **Selettore ordine** (Infanzia / Primaria / Secondaria)
- **Barra di filtro testo** (ricerca termine in traguardi e obiettivi)
- **Accordion per classe** (es. "Classe Prima", "Classe Seconda"…)
  - Traguardi (elenco puntato, etichetta `T1`, `T2`…)
  - Obiettivi di apprendimento (elenco puntato, etichetta `O1`, `O2`…)
  - Nuclei fondanti (per la secondaria, se presenti)
- **Indicatore raccordi interdisciplinari** (per la secondaria: "ALLINEAMENTO STEM d'Istituto", "ALLINEAMENTO FILOLOGICO d'Istituto", ecc.)
- **Mappatura Competenze Chiave Europee** (8 KC da KC1 a KC8, collegate alla disciplina attiva)

#### Azione primaria
Consultare e filtrare il curricolo verticale. Nessuna modifica diretta in questa vista — la modifica avviene nella Revisione.

#### Dati visualizzati
- `curriculumKB[discipline][order].traguardi` (string[])
- `curriculumKB[discipline][order].obiettivi` (string[])
- `curriculumKB[discipline][order].evidenze` (string[])
- `curriculumKB[discipline][order].nucleiFondanti` (string[], opzionale)
- Mappatura KC da `getDisciplineKeyCompetencies(discipline)`
- Raccordi interdisciplinari da `getInterdisciplinaryRaccordo(discipline, 'secondaria')`

#### Dove sono i dati
- **curriculumKB** — importato da `src/data/curriculumKB.ts` (statico, sovrascrivibile da localStorage con chiave `curmanlight-custom-curriculum-v2`)
- **Selezione ordine/disciplina** — Zustand (`order`, `discipline`)
- **Filtro traguardi/obiettivi selezionati** — Zustand (`selectedTraguardi`, `selectedObiettivi`, `selectedEvidenze`)

---

### 2.2 Raccordo Diacronico (Mappa)

**Tab:** `curricolo` · **View:** `mappa`
**Descrizione sidebar:** "Raccordo Diacronico (Mappa)"

#### Scopo
Mostrare come un concetto disciplinare si sviluppa verticalmente dai 3 ai 14 anni, evidenziando le connessioni tra i livelli scolastici.

#### Contenuto
- **Vista a mappa/connettogramma** con nodi collegati
- Evidenziazione visiva dei percorsi verticali di ciascuna disciplina
- Confronto tra traguardi dello stesso ramo disciplinare attraverso infanzia → primaria → secondaria

#### Azione primaria
Esplorare la diacronia curricolare. Nessuna modifica diretta.

---

### 2.3 Integrazione & Popolamento

**Tab:** `curricolo` · **View:** `popolamento`
**Descrizione sidebar:** "Integrazione & Popolamento"

#### Scopo
Popolare il curricolo con contenuti personalizzati dell'istituto, arricchirlo con fonti IA e importare dati esterni (CSV).

#### Contenuto
La vista è suddivisa in 3 sotto-tab interni:

| Sub-tab | Descrizione |
|---------|-------------|
| **Copilota** | Interfaccia IA per generare/arricchire traguardi e obiettivi. Usa il motore WikiLLM raccordato ai volumi d'Istituto. |
| **CSV** | Importatore di file CSV per popolamento massivo del curricolo |
| **Sicurezza** | Strumenti di gestione dati sensibili e backup del curricolo |

#### Dati
- `popolamentoTab` (stato locale: `'copilot' | 'csv' | 'security'`)
- Contenuti generati salvati in `customTexts` (Zustand, persistito su IndexedDB)

---

### 2.4 Revisione (Gap 2025)

**Tab:** `revisione`
**Descrizione sidebar:** "Revisione (Gap 2025)"
**Badge laterale:** Conteggio raccordi in sospeso (ambra)

#### Scopo
Esaminare i raccordi tra i traguardi del curricolo attuale e le Indicazioni 2025, votare ogni raccordo come approvato/rifiutato/personalizzato, e lasciare commenti testuali.

#### Contenuto
- **Filtri:** Tutti / In Sospeso / Approvati / Rifiutati (`activeRevisionFilter`)
- **Elenco raccordi** (accordion per disciplina/classe)
  - Per ogni raccordo: testo traguardo attuale → proposta di raccordo con le Linee Guida 2025
  - **Azioni:** Approva ✅ / Rifiuta ❌ / Personalizza ✏️ (testo libero)
  - Badge stato: "Approvato", "Rifiutato", "Personalizzato", "In Sospeso"
- **Contatore:** raccordi esaminati vs. totali (46/46)

#### Azione primaria
Completare la revisione di tutti i raccordi per permettere al Referente di procedere all'unione consensi.

#### Dati visualizzati
- `curriculumKB[discipline][order].proposals` (Proposal[])
- `decisions` (Zustand: Record<string, DecisionStatus>)
- `customTexts` (Zustand: Record<string, string>)
- `activeRevisionFilter`

#### Dove sono i dati
- **Stato persistenti:** Zustand → IndexedDB (`curmanlight-react-db-state-v1.4.0`)
- **Stato UI:** `activeRevisionFilter` (Zustand)

---

### 2.5 Fonti d'Istituto

**Tab:** `fonti`
**Descrizione sidebar:** "Fonti d'Istituto"

#### Scopo
Consultare i documenti ufficiali e le fonti normative che fondano il curricolo verticale.

#### Contenuto
4 sotto-viste gestite da `activeGeneralSubtab`:

| Sub-tab | Etichetta | Contenuto |
|---------|-----------|-----------|
| `premessa` | 1. Premessa & Profilo | Presentazione dell'Istituto, identità territoriale, vocazione didattica |
| `riforma` | 2. Riforma IN 2025 | Riepilogo delle Indicazioni Nazionali 2025 e delle modifiche ordinamentali |
| `obiettivi` | 3. Obiettivi Formativi | Elenco strutturato degli obiettivi formativi d'Istituto per ordine e disciplina |
| `livelli` | 4. Livelli di Valutazione | Definizione dei livelli di valutazione (Avanzato, Intermedio, Base, Iniziale) conformi al D.M. 14/2024 |

---

## 3. AMBIENTE PROGETTAZIONE UDA

**Etichetta sidebar:** "Progettazione UDA"
**Gruppo sidebar:** Sezione espandibile con bordo laterale indaco

### 3.1 Home d'Area (Progettazione)

**Tab:** `progetta-annuale` · **ProgTab:** `home`
**Visibile solo** quando non si è in modalità WebDriver (test automatico)

#### Scopo
Schermata di selezione che guida l'utente verso una delle tre sotto-aree.

#### Contenuto
3 card cliccabili:
1. **Compilatore UDA (Wizard)** → `activeProgTab: 'annuale'`
2. **Archivio UDA d'Istituto** → `activeProgTab: 'uda'`
3. **Matrice delle Competenze** → `activeProgTab: 'certificazione'`

Più una sezione "Programmazione Annuale" che mostra le UDA già salvate con il relativo periodo e numero di ore.

---

### 3.2 Compilatore UDA (Wizard)

**Tab:** `progetta-annuale` · **ProgTab:** `annuale`
**Etichetta interna:** "Progettatore"

#### Scopo
Progettare una nuova Unità di Apprendimento (UDA) guidati da un Wizard a 5 passi, raccordando traguardi, obiettivi, evidenze e livelli di competenza.

#### Contenuto
Il Wizard è un wizard orizzontale a 5 passi:

| Passo | Nome | Contenuto |
|-------|------|-----------|
| 1 | Dati Generali | Titolo UDA, disciplina, ordine, classe, periodo, numero ore previste, stato (bozza/in revisione/validata/archiviata) |
| 2 | Traguardi & Obiettivi | Selezione multipla dei traguardi e degli obiettivi di apprendimento raccordati dalla knowledge base |
| 3 | Compito di Realtà | Descrizione del compito autentico / prodotto finale |
| 4 | Evidenze & Valutazione | Selezione delle evidenze osservabili e definizione dei livelli di esito |
| 5 | Salva & Esporta | Riepilogo e salvataggio dell'UDA nell'archivio locale |

#### Azione primaria
Creare e salvare una UDA completa.

#### Dati
- Campi dell'UDA: `UdaModel` (typescript)
- Salvataggio: Zustand → `savedUda` (array di `UdaModel`)
- Traguardi/Obiettivi selezionati: Zustand → `selectedTraguardi`, `selectedObiettivi`, `selectedEvidenze`

---

### 3.3 Archivio UDA d'Istituto

**Tab:** `progetta-annuale` · **ProgTab:** `uda`

#### Scopo
Consultare, modificare, duplicare ed eliminare le UDA già progettate.

#### Contenuto
- **Elenco UDA** con filtri per disciplina, ordine e stato
- Per ogni UDA: titolo, disciplina, periodo, ore, stato, data creazione
- **Azioni per UDA:** Apri faldone, Modifica, Duplica, Elimina
- **Esportazione SCORM** (pulsante per generare pacchetto .zip SCORM 1.2)
- **Esportazione Word/PDF** della singola UDA

#### Dati
- `savedUda` (Zustand → IndexedDB)
- Stato UDA: `'bozza' | 'in revisione' | 'pronta per confronto' | 'validata' | 'archiviata'`

---

### 3.4 Matrice delle Competenze (DM 14/24)

**Tab:** `progetta-annuale` · **ProgTab:** `certificazione`
**Etichetta interna:** "Matrice Competenze (DM 14/24)"

#### Scopo
Visualizzare la mappatura ministeriale delle 8 Competenze Chiave Europee e dei relativi livelli di esito, conformemente al D.M. 14/2024.

#### Contenuto
- **Le 8 Competenze Chiave Europee** (KC1–KC8) con descrizione completa
- **Matrice di collegamento** tra competenze e discipline
- **Livelli di esito** per competenza: Avanzato, Intermedio, Base, Iniziale

#### Dati
- `EuropeanKeyCompetencies` (array statico in App.tsx)
- `getDisciplineKeyCompetencies(discipline)` (mappatura statica)

---

### 3.5 Processo & Consenso

**Tab:** `processo`
**Descrizione sidebar:** "Processo & Consenso"

#### Scopo
Gestire il flusso collaborativo di approvazione del curricolo tra i dipartimenti, fino alla delibera consiliare.

#### Contenuto
2 sotto-viste gestite da `activeProcessoTab`:

| Sub-tab | Etichetta | Contenuto |
|---------|-----------|-----------|
| `flusso` | Flusso Collaborativo | Diagramma del processo di approvazione: Insegnante → Dipartimento → Referente → Collegio → Dirigente. Stato attuale di avanzamento. |
| `verifica` | Delibera & Verifica | Bozza della delibera consiliare d'adozione del curricolo verticale. Checklist di verifica conformità. |

#### Azione primaria
Avanzare il processo di approvazione e preparare la delibera per il Collegio Docenti.

#### Dati
- `decisions` (Zustand)
- Conteggio voti registrati per dipartimento
- Stato complessivo di avanzamento

---

### 3.6 Esportazione File d'Ufficio

**Tab:** `esportazioni`
**Descrizione sidebar:** "Esportazione File d'Ufficio"

#### Scopo
Generare e scaricare i documenti ufficiali nei formati richiesti dalla scuola e dalla Pubblica Amministrazione.

#### Contenuto
2 sotto-viste gestite da `esportazioniTab`:

| Sub-vista | Etichetta | Contenuto |
|-----------|-----------|-----------|
| `standard` | Esportazioni Standard | Pulsanti di export per il curricolo completo e per le singole UDA |
| `template` | Modelli con IA | Selezionatore modello documentale + motore IA per generazione personalizzata |

**Esportazioni Standard (griglia 2 colonne):**

*Colonna sinistra — Formati Word, ODF e Testo:*
- Scarica Word (.doc)
- Scarica Word (.docx)
- Scarica LibreOffice / ODF (.odt)
- Salva Curricolo in PDF
- Copia Tabella (negli appunti)
- Scarica file .txt

*Colonna destra — File di Lavoro .CML:*
- Scarica proposta .cml (file di lavoro dipartimentale)
- Scarica Word confronto (tavola di confronto)
- Scarica Markdown (.md)
- Salva in PDF (diretto)
- Azzera Memoria d'Istituto (reset completo)

**Generazione Documentazione Docente (sotto-area "Didattica"):**
- Programmazione Annuale su due quadrimestri
- Relazione Intermedia & Finale
- Documento Specifico per grado (Scheda Osservazione Infanzia / Livelli Giudizi Primaria / Programma Svolto Secondaria)

**Modelli con IA (template):**
- Selezionatore modello: UDA / Relazione / Plessi specifici (es. Greci bilingue)
- Selezionatore sezioni del modello (toggle on/off per ogni sezione)
- Motore IA per adattamento in tempo reale

#### Azione primaria
Scaricare i documenti necessari per le consegne d'ufficio.

#### Dati
- `esportazioniTab` (stato locale: `'standard' | 'template'`)
- `templateDocType` (stato locale per il modello IA)
- `templateJsonState` (stato locale per le sezioni del modello)
- Contenuto generato on-the-fly dai dati del curricolo e delle UDA

---

## 4. AMBIENTE CLASSE

**Etichetta sidebar:** "Spazio d'Aula e Classe"
**Gruppo sidebar:** Sezione espandibile con bordo laterale indaco

### 4.1 Home d'Area (Classe)

**Tab:** `progetta-annuale` · **ProgTab:** `classe-home`
**Visibile solo** quando non si è in modalità WebDriver

#### Contenuto
2 card cliccabili:
1. **Ambiente & Esiti Classe** → `activeProgTab: 'classe'`
2. **Osservatorio dei Riusi d'UDA** → `activeProgTab: 'social'`

---

### 4.2 Ambiente & Esiti Classe

**Tab:** `progetta-annuale` · **ProgTab:** `classe`
**Etichetta header:** "Ambiente & Esiti Classe — [Sezione]"

#### Scopo
Gestire il registro di classe: anagrafica alunni (cifrata), disposizione dei banchi, gruppi cooperativi, valutazione qualitativa, e generazione di report conformi al D.M. 14/2024.

#### Contenuto
3 sotto-tab interni gestiti da `classeSubTab`:

| Sub-tab | Etichetta | Contenuto |
|---------|-----------|-----------|
| `registro` | Registro d'Aula (Roster & Esiti) | Tabella alunni con cifratura AES-GCM, stato PEI/PDP, livelli d'esito, token anonimi per l'IA |
| `strumenti` | Strumenti d'Aula (Disposizione & Gruppi) | Mappa dell'aula (griglia banchi), definizione gruppi cooperativi, vincoli relazionali, feedback |
| `pianificazione` | Pianificazione (Gantt & Budget) | Timeline delle attività, distribuzione temporale delle UDA, budget ore per disciplina |

**Selettore classe:** Dropdown con le combinazioni assegnate al docente (es. "3^A", "2^B").

#### Azione primaria
Registrare gli esiti degli alunni, gestire i gruppi, pianificare le attività.

#### Dati visualizzati
- `classroomStudents` (array locale, gestito con stato React)
- `selectedClassCombination` (stato locale)
- `assignedCombinations` (calcolato in base al profilo)
- Dati cifrati: AES-GCM 256 bit (locale, mai in chiaro per l'IA)
- `socialUdas` (per la vista Osservatorio)

#### Dove sono i dati
- **Dati alunni:** stato locale React (non persistito in Zustand per ragioni di sicurezza)
- **Cifratura:** Web Crypto API (AES-GCM 256 bit)
- **Dati non cifrati:** solo nel DOM decifrato con chiave locale

---

### 4.3 Osservatorio dei Riusi d'UDA (Social)

**Tab:** `progetta-annuale` · **ProgTab:** `social`
**Etichetta sidebar:** "Osservatorio dei Riusi d'UDA"

#### Scopo
Esplorare e riutilizzare le UDA più condivise e valide dell'Istituto. Piattaforma social interna per lo scambio di moduli didattici tra docenti.

#### Contenuto
- **Elenco UDA condivise** (dall'archivio istituzionale)
- Per ogni UDA: titolo, disciplina, ordine, periodo, ore, esiti studenti (avanzato/intermedio/base/iniziale), autovalutazione docente, conteggio riusi
- **OSI (Open Sharing Index):** indice dinamico che combina esiti, autovalutazione e riusi
  - ≥85: "Eccellenza d'Istituto (Consigliata per il Riuso)"
  - ≥65: "Alto Impatto Didattico"
  - <65: "In Corso di Consolidamento"
- **Azioni:** Clona UDA, Aggiungi annotazione, Condividi
- **Filtro:** per disciplina, ordine, periodo

#### Azione primaria
Trovare e riutilizzare UDA validate da altri docenti dell'Istituto.

#### Dati
- `socialUdas` (array calcolato dall'archivio UDA + simulazione)
- `newAnnotationInputs` (stato locale per le annotazioni)
- Calcolo OSI dinamico (formula basata su `selfEvaluation`, `studentOutcomes`, `reusedCount`)

---

## 5. SUPPORTO & CERTIFICAZIONI

**Etichetta sidebar:** "Supporto & Certificazioni"
**Posizione sidebar:** Ultimo blocco, sotto separatore

### 5.1 Certificazione PA (AgID)

**Tab:** `certificazione-pa`
**Icona sidebar:** `ShieldCheck` (Lucide, verde)

#### Scopo
Monitorare e documentare la conformità dell'applicazione agli standard della Pubblica Amministrazione italiana.

#### Contenuto
**Badge di certificazione (griglia 4 colonne):**
- WCAG 2.1 AA — "AgID Accessibile"
- GDPR Secure — "100% Client-Side"
- ACN SaaS Exempt — "No Remote Cloud"
- CAD Riuso — "EUPL Open Source"

**Cruscotto conformità (griglia 12 colonne):**

*Colonna sinistra (4 colonne) — Indicatori visivi:*
- Sicurezza e GDPR d'Istituto: 100% PASS
- Accessibilità (WCAG 2.1 AA): 98% OTTIMO
- Riuso e Open Source (Art. 69 CAD): 100% EUPL
- Qualifica Cloud ACN SaaS: ESENTE (LOCAL)

*Colonna destra (8 colonne) — Strumenti:*
- Simulatore di Autovalutazione AgID (scan diagnostica locale)
- Servizi di Validazione Esterni (MAUVE++ CNR/AgID, Pa11y CLI)
- Generatore Dichiarazione Accessibilità (download .txt)
- Informativa Legale e Guida alla Certificazione (4 sezioni: Accessibilità, GDPR, CAD, ACN)

#### Azione primaria
Avviare la diagnostica AgID, generare la dichiarazione di accessibilità, verificare la conformità.

#### Dati
- Stati calcolati on-the-fly (nessuna persistenza esterna)
- `handleRunAgidAuditLocal()` — scansione diagnostica
- `handleGenerateDichiarazioneAccessibilita()` — genera file .txt

---

### 5.2 WikiLLM & Brain d'Istituto

**Tab:** `second-brain`
**Icona sidebar:** `Sparkles` (Lucide, indaco)

#### Scopo
Fornire una conoscenza pedagogica e ordinamentale certificata, interrogabile tramite motore IA (WikiLLM), senza allucinazioni, raccordata semanticamente ai volumi d'Istituto.

#### Contenuto
3 sotto-viste gestite da `secondBrainTab`:

| Sub-vista | Etichetta | Contenuto |
|-----------|-----------|-----------|
| `brain` | Biblioteca & Copilota | Pannello sinistro: indice dei 19 volumi d'Istituto + documenti personali aggiunti. Pannello destro: lettore del volume selezionato + interfaccia Copilota per domande IA |
| `graph` | Mappa Connessioni | Grafo interattivo dei nodi architetturali (App.tsx, Zustand, KB, Second Brain, WikiLLM) con archi relazionali |
| `glossary` | Glossario d'Istituto | Dizionario dinamico dei termini pedagogici, alimentato dall'Agente IA |

**Biblioteca d'Istituto (19 volumi nel KB):**

| ID | Titolo | Contenuto |
|----|--------|-----------|
| vol1 | 01_RACCOLTA_DOCUMENTI.md | Progetti Territoriali, Campania e PNRR d'Istituto |
| vol2 | 02_SCUOLA_IN_CHIARO.md | RAV, NIV e Piano di Miglioramento |
| vol3 | 03_QUADRO_NORMATIVO.md | Didattica, Inclusione e Privacy |
| vol4 | 04_DOC_CURRICOLO.md | Curricolo Fondativo |
| vol5 | 05_WIKI_SISTEMA_CML.md | Manuale d'Uso Tecnico |
| vol6 | 06_REPERTORIO_CONCETTI.md | Repertorio Concettuale |
| vol7 | 07_TRANSIZIONE_IN2025.md | Transizione Graduale |
| vol8 | 08_DETTAGLIO_CURRICOLO.md | Dettaglio 14 Discipline |
| vol9 | 09_REPORT_CERTIFICAZIONE.md | Certificazione PA e AgID |
| vol10 | 10_PROPOSTA_DELIBERA.md | Delibera Collegio Docenti |
| vol11 | 11_STATO_SVILUPPO.md | Stato Sviluppo e Percentuali |
| vol12 | 12_PIANO_COMPLETAMENTO.md | Piano di Completamento ed Opera |
| vol13 | Vol aggiuntivo | Contenuti istituzionali estesi |
| vol14 | Vol aggiuntivo | Contenuti istituzionali estesi |
| vol15 | Vol aggiuntivo | Contenuti istituzionali estesi |
| vol18 | Vol aggiuntivo | Contenuti istituzionali estesi |
| vol19 | Vol aggiuntivo | Contenuti istituzionali estesi |
| vol20 | Vol aggiuntivo | Contenuti istituzionali estesi |
| vol22 | Vol aggiuntivo | Contenuti istituzionali estesi |

Più documenti personali aggiunti dall'utente (`customKbDocs`, salvati in localStorage con chiave `curman_customKbDocs`).

**Copilota (nella vista Biblioteca):**
- Pannello di chat con cronologia messaggi
- Input testuale + pulsante vocale (Speech Recognition API, lingua `it-IT`)
- Pulsante TTS (Speech Synthesis, voce italiana premium/neurale)
- Chip di domande rapide (es. "Riassumi il Volume 4", "Cosa dice il RAV sulle INVALSI?")
- Risposte del WikiLLM: testo formattato con citazione del volume sorgente, zero allucinazioni

#### Azione primaria
Consultare la conoscenza istituzionale, fare domande al Copilota, aggiungere documenti personali.

#### Dati
- `selectedBrainDoc` (stato locale: ID del volume selezionato)
- `wikiWorkspaceTab` (stato locale per la sotto-vista interna del lettore)
- `customKbDocs` (stato locale, persistito in localStorage)
- `copilotChatHistory` (stato locale: array di messaggi)
- `copilotChatInput` (stato locale: stringa)
- `isVoiceListening` (stato locale: boolean)
- `ttsPlayingState` / `ttsActiveMsgIndex` (stato locale)

---

### 5.3 Guida Operativa

**Tab:** `guida`
**Icona sidebar:** `HelpCircle` (Lucide, blu)

#### Scopo
Fornire il manuale d'uso operativo completo per supportare i docenti nell'utilizzo della piattaforma.

#### Contenuto
Manuale strutturato in sezioni numerate:

1. **Configurazione Profilo ed Onboarding Docente** — Scelta ruolo, ordine, cattedra, classi, sezioni custom
2. **Consultazione Curricolo Verticale d'Istituto** — Mappe di senso, albero disciplinare, filtro termini, traduzione olistica per l'infanzia
3. **Revisione dei Gap e Votazione dei Raccordi** — Procedura di revisione passo-passo
4. **Progettazione delle UDA con il Wizard** — Guida al Wizard a 5 passi
5. **Esportazione e Gestione File d'Ufficio** — Formati disponibili e procedura di esportazione
6. **Registro d'Aula e Gestione degli Alunni** — Cifratura, inserimento, valutazione qualitativa
7. **Certificazione PA e Conformità AgID** — Guida alla conformità normativa
8. **Second Brain e Copilota IA** — Come interrogare la conoscenza d'Istituto
9. **Backup e Ripristino** — Salvataggio JSON, ripristino, reset

---

## 6. COPILOTA (Overlay Globale)

**Stato:** `isCopilotChatOpen` (booleano globale in App.tsx)

#### Scopo
Interfaccia di chat IA accessibile da qualsiasi schermata, per assistenza in tempo reale.

#### Contenuto
- **Finestra di chat** posizionata in basso a destra (overlay)
- **Cronologia messaggi** con distinguo user/assistant
- **Input testuale** con pulsante vocale (Speech Recognition `it-IT`)
- **Pulsante TTS** per ogni risposta dell'assistente
- **Chip di domande rapide** contestuali alla schermata attiva
- **Motore:** WikiLLM (risposte raccordate ai volumi .nd d'Istituto, zero allucinazioni)

#### Comportamento
- Il Copilota risponde in base alla schermata attiva (`activeTab`, `activeGeneralSubtab`, `activeProgTab`, `activeProcessoTab`, `wikiWorkspaceTab`)
- Le domande vengono indirizzate al volume più rilevante
- Le risposte includono la citazione della fonte

---

## Mappa dei Dati: Dove è salvato cosa

| Dati | Dove | Persistenza |
|------|------|-------------|
| Ruolo, disciplina, ordine, anno scolastico | Zustand → Dexie (IndexedDB) | Permanente |
| Decisioni (approva/rifiuta/personalizza) | Zustand → Dexie (IndexedDB) | Permanente |
| Testi personalizzati (revisione) | Zustand → Dexie (IndexedDB) | Permanente |
| UDA salvate | Zustand → Dexie (IndexedDB) | Permanente |
| Tab/view attivi | Zustand → Dexie (IndexedDB) | Permanente |
| Selezione traguardi/obiettivi/evidenze | Zustand → Dexie (IndexedDB) | Permanente |
| Documenti personali KB | localStorage (`curman_customKbDocs`) | Permanente |
| Curricolo personalizzato | localStorage (`curmanlight-custom-curriculum-v2`) | Permanente |
| Token Google OAuth | URL hash (sessione browser) | Sessione |
| Dati alunni (classe) | Stato locale React (memoria) | Volatile* |
| Chat Copilota | Stato locale React (memoria) | Volatile |
| Stato onboarding completato | localStorage | Permanente |
| Backup completo | File JSON scaricato | Utente esterno |
| Volumi KB | `volumesKB.ts` (statico nel bundle) | Compilazione |
| Curriculum KB | `curriculumKB.ts` (statico, sovrascrivibile) | Compilazione + localStorage |

\* I dati degli alunni sono volatili per design: non vengono persistiti automaticamente per ragioni di sicurezza (GDPR). Il docente deve esportare/backupare manualmente.
