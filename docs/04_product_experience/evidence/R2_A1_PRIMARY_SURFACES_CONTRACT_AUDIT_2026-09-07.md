# R2-A1 — PRIMARY_SURFACES_CONTRACT_AUDIT

**Data:** 2026-09-07  
**Ramo:** `feature/team-organizational-binding`  
**Baseline audit:** `20aa8d29411d6a6d3ce3f2eea3273441af8f0ebe`  
**Contratti:** `ARENA-PRODUCT-VISION@1.0.0`, `CURRICULUM_LIFECYCLE@1.2.0`, `CCO@1.5.0`, `CCO-SURFACES@1.6.1`.

## Esito sintetico

| Superficie primaria | Stato | P0 | P1 | Valutazione |
|---|---:|---:|---:|---|
| Il mio lavoro | CONFORMANT_WITH_REWORK | 0 | 2 | Struttura role-aware già coerente; restano raccordi legacy e assurance comunicativa da rifinire. |
| Curricolo | REWORK | 3 | 3 | La superficie primaria espone ancora una copia locale/legacy e strumenti di popolamento che competono con il curricolo canonico. |
| Progettazione | REWORK | 2 | 4 | Il binding al curricolo esiste nel dominio, ma la superficie è ancora centrata su compilatore/archivio locale e contiene contenuti suggeriti non derivati dal contesto corrente. |
| Riesame | CONFORMANT | 0 | 0 | R1.1 ha già provato gerarchia, workframe, progressione e distinzione dei ruoli. |

**Verdetto R2-A:** `BLOCKED_BY_P0`. Non si apre R2-B finché i P0 di Curricolo e Progettazione non sono chiusi.

---

## 1. Il mio lavoro

### Evidenza runtime

`DashboardView.tsx` usa una coda role-aware, separa `Da fare` e `Da consultare`, espone un solo orientamento principale e colloca spiegazioni di processo in `details` L2.

### Conformità

- L1 dominante: sì.
- Azione prossima vicina all'oggetto: sì.
- Distinzione actionable/read-only: sì.
- Approfondimento progressivo: sì.
- Profilo locale non presentato come autorità istituzionale: sì, con testo esplicito L2.

### P1

**HOME-P1-01 — route di supporto incoerente con il Fascicolo canonico.**  
Il work item di qualificazione fonti usa etichetta `Apri il Fascicolo` ma `routeForWorkItem()` restituisce `fonti`. L'alias può restare tecnicamente compatibile, ma la proiezione utente deve attraversare il Fascicolo canonico.

**HOME-P1-02 — assurance self-declared troppo vicina alla proiezione role-aware.**  
La coda usa `assurance: self-declared`; le azioni conseguenziali sono comunque bloccate dal dominio, ma la UI va auditata per assicurare che nessuna card sembri derivare da autorità verificata quando deriva solo dal profilo personale.

### Azione minima

- instradare il lavoro sulle fonti al Fascicolo canonico;
- mantenere role-aware Home, senza aggiungere nuove card o nuovi stadi.

---

## 2. Curricolo

### Evidenza runtime

`CurriculumTab.tsx` presenta ancora:

- `Area locale di consultazione`;
- `baseline legacy CML-633C non verificata`;
- `Gestione & Popolamento` come vista interna della superficie primaria;
- assistente/CSV per modificare la copia locale;
- viste `albero`, `mappa`, `popolamento`, più un pilota sperimentale;
- terminologia e logica di copia locale non allineate al `CurriculumUnit` canonico e a `CAN-CURR-MASTER-00@1.3`.

### P0

**CURR-P0-01 — fonte di verità percepita errata.**  
La superficie primaria presenta una baseline locale legacy come oggetto ordinario di consultazione. La Visione richiede una sola baseline canonica e `CurriculumUnit` come oggetto centrale.

**CURR-P0-02 — mutazione/popolamento compete con la consultazione canonica.**  
`Gestione & Popolamento`, caricamento CSV e assistenza non verificata sono strumenti di servizio/compatibilità, non devono essere una modalità primaria concorrente dentro `Curricolo`.

**CURR-P0-03 — gerarchia centrata sul software, non sul lavoro curricolare.**  
`Vista ad Albero / Mappa Verticale / Gestione & Popolamento` descrive il renderer. L1 deve dire all'utente che cosa si applica e quale unità sta consultando, non quale rappresentazione tecnica sta usando.

### P1

- **CURR-P1-01:** etichette storiche/legacy e abbreviazioni non coerenti con la nomenclatura istituzionale consolidata.
- **CURR-P1-02:** informazioni di autorità/versione non sono il contesto L1 della consultazione.
- **CURR-P1-03:** il pilota sperimentale deve essere segregato dal percorso utente ordinario.

### Azione minima

1. introdurre un `CanonicalCurriculumSurface` come renderer primario di `Curricolo` basato sul contesto corrente e sul master 1.3;
2. rendere `albero/mappa` rappresentazioni subordinate dello stesso oggetto, non processi concorrenti;
3. spostare `popolamento`, CSV, assistente e pilota dietro una superficie tecnica/compatibilità non primaria;
4. mostrare chiaramente `Riferimento di lavoro — master 1.3 non vigente` finché l'adozione non esiste.

---

## 3. Progettazione

### Evidenza runtime

`ProgettazioneTab.tsx` presenta:

- intestazione `Compilatore Unità di Apprendimento` per la modalità `annuale`;
- home d'area con tre azioni concorrenti;
- archivio UDA locale;
- matrice locale non validata;
- suggerimenti preconfezionati (`Smart Home con Blender 3D`, `Etica e algoritmi`, `La Scrittura di Barbiana`) quando l'archivio è vuoto;
- terminologia da strumento/archivio più che da processo didattico guidato.

Il dominio `DidacticBinding` è implementato nel prodotto, ma non domina ancora la superficie.

### P0

**PLAN-P0-01 — il contesto curricolare non è l'ancora dominante della progettazione.**  
La Visione richiede `Curricolo → DidacticBinding → progettazione`; la vista apre invece sul tipo di strumento (`Compilatore`, `Archivio`, `Matrice`).

**PLAN-P0-02 — contenuti suggeriti non contestuali nella superficie primaria.**  
Quando non ci sono UDA, la superficie propone esempi predefiniti. Questo introduce contenuti che non derivano necessariamente dal curricolo, classe o disciplina corrente e indebolisce la tracciabilità del lavoro.

### P1

- **PLAN-P1-01:** `annuale` e `Compilatore UDA` sono semanticamente incoerenti.
- **PLAN-P1-02:** tre sotto-aree con pari peso competono con il compito corrente.
- **PLAN-P1-03:** autorità del binding (`DRAFT_PLANNING_REFERENCE` finché master non vigente) deve essere visibile vicino al contesto, non solo nei dettagli successivi.
- **PLAN-P1-04:** Archivio e certificazione devono essere strumenti subordinati, non ingresso equivalente alla costruzione della progettazione corrente.

### Azione minima

1. aprire Progettazione sul contesto di classe/discipline e sul riferimento curricolare corrente;
2. rendere dominante una sola prossima azione: continuare/iniziare la progettazione;
3. collocare Archivio UDA, matrice e strumenti di riuso in L2/supporto;
4. rimuovere i suggerimenti preconfezionati dalla superficie primaria;
5. mostrare lo stato di autorità del binding con linguaggio semplice (`Riferimento di lavoro`, non `DRAFT_PLANNING_REFERENCE` in L1).

---

## 4. Riesame

### Evidenza runtime

`CaseAwareRevisionSurface.tsx` rende:

- contesto `GENERAL` con `RevisionWorkspace` dominante e `SharedReviewCaseInbox` subordinato;
- contesto `CASE_SCOPED` esclusivo con `CaseScopedExperienceShell` e `CaseScopedCurriculumWorkSession`;
- ritorno esplicito al Riesame generale con reset percettivo all'inizio;
- nessun trasferimento automatico della sessione personale tra casi.

### Esito

`CONFORMANT`, coerente con `HUMAN_VISUAL_RETEST_R1_1 = PASS` e `CCO-SURFACES@1.6.1`.

Nessun lavoro strutturale R2-A richiesto; soltanto regression guard durante gli incrementi successivi.

---

## 5. Ordine di remediation R2-A

1. **R2-A2 — CURRICULUM_CANONICAL_SURFACE** — chiude CURR-P0-01/02/03.
2. **R2-A3 — PLANNING_CONTEXT_FIRST_SURFACE** — chiude PLAN-P0-01/02.
3. **R2-A4 — HOME_FASCICOLO_ROUTE_ALIGNMENT** — chiude HOME-P1-01 e verifica assurance.
4. **R2-A5 — PRIMARY_SURFACES_HVA + accessibility spot-check**.

### Gate di uscita R2-A

- Curricolo non espone più il popolamento legacy come modalità primaria;
- Curricolo apre sul master/versione e sul contesto curricolare corrente;
- Progettazione apre sul contesto e sul binding, non sul catalogo degli strumenti;
- nessun contenuto suggerito non contestuale viene proiettato automaticamente;
- Home usa Fascicolo come destinazione canonica per le fonti;
- Riesame resta invariato e conformant;
- 0 P0 aperti;
- smoke macchina + HVA mobile reale su quattro superfici.
