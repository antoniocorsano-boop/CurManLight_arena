# 09 — User Flows Critici

**CurManLight — Product Experience**
**Ultimo aggiornamento:** 2026-07-19

---

Questo documento descrive i 10 percorsi utente più critici dell'applicazione. Ogni flow include: trigger, passi operativi, punti decisionali, endpoint, gestione errori e un diagramma ASCII.

---

## 1. Primo Accesso & Onboarding

**Trigger:** L'utente apre CurManLight per la prima volta (nessuno stato `curmanlight-react-db-state-v1.4.0` rilevato in IndexedDB).

**Passi:**

1. L'app verifica l'assenza di uno stato salvato (`isNew = !safeLocalStorageGetItem(...)`) dopo 1 secondo di delay.
2. Si apre il modale di onboarding con 4 passi guidati:
   - **Passo 1 — Ruolo:** Selezione tra `insegnante | dipartimento | referente | dirigente | collegio | amministratore`.
   - **Passo 2 — Ordine scolastico:** Selezione tra `infanzia | primaria | secondaria`. In base alla scelta cambiano le classi e sezioni disponibili (Infanzia: Rossa/Verde/Blu; Primaria/Secondaria: A/B/C).
   - **Passo 3 — Disciplina e classe:** Selezione della disciplina (14 disponibili) e delle classi assegnate. Toggle per il tipo di docente (`comune | specialista`) e flag sostegno.
   - **Passo 4 — Sezioni e combinazioni:** Gestione delle sezioni disponibili e delle combinazioni classe-sezione.
3. L'utente preme "Salva Profilo": `saveOnboardingProfile()` salva lo stato in Zustand + localStorage.
4. L'app conferma con un toast e mostra la dashboard.

**Punti decisionali:**
- Se il tipo è `insegnante` + `infanzia` + `comune`: la disciplina è forzata a `italiano`.
- Se il flag `sostegno` è attivo: la disciplina è forzata a `italiano`.

**Endpoint:** Dashboard (`activeTab === 'dashboard'`)

**Errori:** Nessuno bloccante. L'utente può chiudere il modale e procedere con i valori di default.

```
+-----------------------+
|  Apertura App         |
+-----------+-----------+
            |
            v
+-----------+-----------+
| Verifica stato saved  |
| in IndexedDB          |
+-----------+-----------+
            |
     +------+------+
     | Stato assente? |
     +------+------+
       Sì  |   No
      /    |     \
     v     v      v
 [Modale]   [Dashboard diretta]
     |
     v
+----+----+    +-----------+    +-----------+    +-----------+
| Passo 1 | -> | Passo 2   | -> | Passo 3   | -> | Passo 4   |
| Ruolo   |    | Ordine    |    | Disciplina|    | Sezioni   |
+---------+    +-----------+    +-----------+    +-----------+
                                                |
                                                v
                                      +---------+---------+
                                      | saveOnboarding()  |
                                      +---------+---------+
                                                |
                                                v
                                        +-------+-------+
                                        |   Dashboard   |
                                        +---------------+
```

---

## 2. Consultazione Curricolo

**Trigger:** L'utente seleziona il tab "Curricolo" dalla sidebar (`activeTab === 'curricolo'`).

**Passi:**

1. La vista predefinita è `albero` (accordion con traguardi e obiettivi per disciplina). L'utente vede la lista delle 14 discipline con le icone.
2. L'utente espande un'accordion (es. "Italiano") per visualizzare traguardi e obiettivi ai 3 livelli (infanzia/primaria/secondaria).
3. L'utente può passare alla vista `mappa` (grafia didattica interattiva con nodi SVG) o alla vista `popolamento` (CSV import + generazione IA).
4. Dall'accordion, l'utente può premere "Consulta" per impostare il profilo di consultazione (`setProfileFromConsultation`) su una disciplina/ordine specifico.

**Punti decisionali:**
- Vista `albero` vs `mappa` vs `popolamento` (toggle in alto).
- Espansione di un'accordion specifica per disciplina.

**Endpoint:** La vista curricolo rimane attiva. Nessun salvataggio automatico.

**Errori:** Se `curriculumKB` non contiene dati per una disciplina, viene mostrato "Nessun traguardo programmato."

```
+------------------+
| Tab "Curricolo"  |
+--------+---------+
         |
    +----+----+
    | Vista?  |
    +----+----+
   /     |     \
  v      v      v
[albero] [mappa] [popolamento]
  |        |         |
  v        v         v
[Accordion]  [Nodi SVG]  [Import CSV/
 per Disc.   interattivi  Genera IA]
  |
  v
[Consulta] -> setDiscipline() + setOrder()
```

---

## 3. Revisione Proposte Riforma

**Trigger:** L'utente seleziona il tab "Revisione" (`activeTab === 'revisione'`).

**Passi:**

1. L'app mostra le proposte di raccordo per la disciplina corrente: ogni proposta ha un testo vecchio (2012), un testo nuovo (2025), e uno stato di decisione.
2. L'utente applica un filtro tramite `activeRevisionFilter`: `all | pending | approved | rejected`.
3. Per ogni proposta, l'utente sceglie tra:
   - **Approva** (`setDecision(id, 'approved')`) — adotta il testo 2025.
   - **Rifiuta** (`setDecision(id, 'rejected')`) — mantiene il testo 2012.
   - **Personalizza** (`setDecision(id, 'custom')`) — apre un campo per il testo custom.
4. L'avanzamento è visualizzato nella barra delle statistiche: `progressPercent` calcolato su `totalDecisions`.

**Punti decisionali:**
- Approva / Rifiuta / Personalizza per ogni proposta.
- Filtro per stato.

**Endpoint:** Le decisioni sono salvate in Zustand + IndexedDB in tempo reale.

**Errori:** Nessuno. Le decisioni possono essere revocate con `resetDecision(id)`.

```
+--------------------+
| Tab "Revisione"    |
+--------+-----------+
         |
         v
+--------+-----------+
| Filtro: all /      |
| pending / approved |
| / rejected         |
+--------+-----------+
         |
         v
+--------+-----------+
| Lista Proposte     |
| (per disciplina)   |
+----+----+----+-----+
     |    |    |
     v    v    v
 [Approva] [Rifiuta] [Personalizza]
     |    |    |
     v    v    v
 +---+----+----+---+
 | setDecision()    |
 | -> Zustand       |
 | -> IndexedDB     |
 +---+----+----+----+
               |
               v
        [Barra Statistiche]
        approved/rejected/total
```

---

## 4. Creazione UDA da Zero

**Trigger:** L'utente seleziona il tab "Progettazione" e si trova nella sottoscheda "UDA", poi sceglie "Wizard" (`progettazioneMode === 'wizard'`).

**Passi (5 step):**

1. **Step 1 — Anagrafica:** Compilazione titolo (`progTitle`), periodo, ore, stato bozza, note, co-autori. L'IA può suggerire il titolo con `handleTriggerGemSuggestion('uda-title')`.
2. **Step 2 — Traguardi:** Selezione multipla dei traguardi dal curricolo verticale con ricerca semantica (`traguardiSearchQuery`). I traguardi più usati storicamente sono evidenziati come "raccomandati".
3. **Step 3 — Obiettivi:** Selezione multipla degli obiettivi di apprendimento. Logica identica ai traguardi.
4. **Step 4 — Evidenze e Compito:** Selezione delle evidenze comportamentali osservabili (`selectedEvidenze`). Compilazione del compito di realtà (`realTaskInput`). L'IA può suggerire il compito e le misure d'inclusione.
5. **Step 5 — Salva:** Conferma e generazione dell'UDA con `handleGenerateUda()`. L'UDA viene aggiunta all'archivio con `addUda()`.

**Punti decisionali:**
- Validazione al Passo 1: il titolo non può essere vuoto (`handleNext` ritorna errore).
- Scelta tra Wizard e griglia (il banner TEP suggerisce il passaggio al Wizard dopo 3 miss-click).
- Design anticipatorio: campi pre-compilati dallo storico UDA (`applyAnticipatoryPrefill`), confermati o rifiutati.

**Endpoint:** `activeProgTab === 'uda'`, archivio UDA aggiornato.

**Errori:**
- Titolo vuoto: toast "Inserire un titolo per l'UDA d'Istituto prima di procedere!"
- Nessun altro blocco: i campi opzionali restano vuoti.

```
+-------------------+
| Tab Progettazione |
| Sub-tab "UDA"     |
| Mode: Wizard      |
+--------+----------+
         |
         v
+--------+----------+
| Step 1: Anagrafica|
| Titolo, Periodo,  |
| Ore, Note         |
+--------+----------+
         | (Valida titolo)
         v
+--------+----------+
| Step 2: Traguardi |
| Ricerca semantica |
| Selezione multipla|
+--------+----------+
         |
         v
+--------+----------+
| Step 3: Obiettivi |
| Selezione multipla|
+--------+----------+
         |
         v
+--------+----------+
| Step 4: Evidenze  |
| + Compito Realtà  |
| + Misure inclus.  |
+--------+----------+
         |
         v
+--------+----------+
| Step 5: Conferma  |
| addUda()          |
+--------+----------+
         |
         v
+--------+----------+
| Archivio UDA      |
| (sub-tab "uda")   |
+-------------------+
```

---

## 5. Importazione CSV Curricolo

**Trigger:** Nella vista "Popolamento" del Curricolo (`activeCurricoloView === 'popolamento'`), l'utente seleziona il sot-tab "CSV" e carica un file.

**Passi:**

1. L'utente seleziona un file CSV tramite il campo `input type="file"`.
2. Il parser RFC 4180 legge il file: ogni riga deve avere 4 colonne (disciplina, ordine, tipo, contenuto).
3. Per ogni riga, il sistema valida:
   - La disciplina esiste in `localCurriculum`.
   - L'ordine è uno tra `infanzia | primaria | secondaria`.
   - Il tipo è uno tra `traguardo | obiettivo | evidenza`.
   - Il contenuto non è vuoto.
4. Viene eseguita una deduplicazione sintattica (normalizzazione lowercase + rimozione punteggiatura) prima dell'inserimento.
5. Il risultato viene mostrato nel feedback: elementi importati + eventuali errori riga per riga.

**Punti decisionali:**
- Se il numero di colonne è < 4, la riga viene scartata.
- Se il contenuto è un duplicato, viene saltato con messaggio.

**Endpoint:** `localCurriculum` aggiornato + salvato in localStorage.

**Errori:**
- Riga con meno di 4 colonne: "Riga X: Formato non valido."
- Disciplina sconosciuta: "Riga X: Disciplina 'Y' non riconosciuta."
- File vuoto: "Caricamento fallito."

```
+-------------------+
| Caricamento File  |
| CSV               |
+--------+----------+
         |
         v
+--------+----------+
| Parsing RFC 4180  |
| (gestione quote)  |
+--------+----------+
         |
    +----+----+
    | Per riga|
    +----+----+
         |
    v---------v---------v
[Valida] [Deduplica] [Inserisci]
    |
    v
+---+-----------+
| Feedback:     |
| N importati   |
| + Errori      |
+---------------+
```

---

## 6. Esportazione Documento Ufficiale

**Trigger:** L'utente seleziona il tab "Esportazioni" (`activeTab === 'esportazioni'`).

**Passi:**

1. L'utente sceglie il formato tra le card disponibili:
   - Word (.doc) — `handleDownloadWordDefinitivo`
   - Word (.docx) — `handleDownloadWordDocx`
   - PDF — `handleDownloadCurricoloPDF` (apre finestra di stampa)
   - ODF/ODT — `handleDownloadODF`
   - Markdown — `handleDownloadRichMarkdown`
   - SCORM (.zip) — `handleDownloadScormManifest`
   - File di lavoro (.cml) — `handleDownloadCml`
   - Backup JSON — `handleDownloadBackup`
2. L'app genera il file lato client: HTML strutturato con intestazione ministeriale, tabelle dei traguardi/obiettivi, e blocco firme.
3. Il browser scarica automaticamente il file.

**Punti decisionali:**
- Il PDF apre una finestra di stampa del browser (popup blocker potrebbe bloccarlo).
- Il formato Word usa `application/msword` come MIME type (compatibile con Word 97-2003).

**Endpoint:** File scaricato nella cartella Download del browser.

**Errori:**
- Popup bloccato (PDF): "Blocco popup attivo! Consenti l'apertura dei popup per salvare in PDF."
- Nessun errore per Word/Markdown/SCORM.

```
+-------------------+
| Tab "Esportazioni"|
+--------+----------+
         |
    +----+----+----+----+----+----+
    |    |    |    |    |    |    |
    v    v    v    v    v    v    v
 [Word] [docx] [PDF] [ODT] [MD] [SCORM] [CML] [JSON]
    |
    v
+---+-----------+
| Generazione   |
| lato client   |
| (HTML/Blob)   |
+---+-----------+
    |
    v
+---+-----------+
| download      |
| automatico    |
+---------------+
```

---

## 7. Backup e Ripristino

**Trigger:** L'utente apre il modale di salvataggio (`showSaveModal`) o usa il backup d'emergenza.

**Passi:**

1. **Download backup:** `handleDownloadBackup` serializza `useCurriculumStore.getState()` in JSON e lo scarica come `curmanlight_copia_sicurezza_completa_{schoolYear}.json`.
2. **Upload ripristino:** L'utente seleziona un file JSON precedentemente esportato.
3. Il sistema valida la struttura:
   - `savedUda` deve essere un array.
   - `decisions` e `customTexts` devono essere oggetti.
   - Ogni UDA deve avere `id`, `title`, `discipline`, `traguardi[]`, `obiettivi[]`.
4. Se valido: `restoreBackupState(restoredState)` aggiorna Zustand.
5. **Backup d'emergenza:** `handleRestoreFromLocalEmergencyStorage` recupera lo stato da `curman_emergency_backup` in localStorage (scritto ogni 60s con `throttledSetLarge`).

**Punti decisionali:**
- Conferma utente prima del ripristino.
- Il backup d'emergenza è un'opzione separata.

**Endpoint:** Stato completo ripristinato, reload della pagina (opzionale).

**Errori:**
- Struttura non valida: "Struttura del file di sicurezza non valida o corrotta."
- UDA non conformi: "Struttura dei dati didattici non conforme."
- Nessun backup d'emergenza: "Nessuna copia d'emergenza trovata nella cache locale!"

```
+------------------+
| Modale Backup    |
+----+----+--------+
     |    |
     v    v
 [Download] [Ripristina]
     |    |
     v    v
 [JSON]  [Seleziona File]
 Blob     |
          v
   +------+------+
   | Validazione |
   | struttura   |
   +------+------+
     Valido?  No
      |  \      |
      v   v     v
 [restore] [Errore toast]
 [Backup]
 [State]
```

---

## 8. Feedback Alunno in Classe

**Trigger:** L'utente è nella sottoscheda "Classe" (`activeProgTab === 'classe'`), tab "Registro".

**Passi:**

1. L'utente visualizza la lista degli alunni con i pseudonimi a tema (Scientists/Classico/Miti).
2. L'utente seleziona un alunno e apre il form di feedback.
3. Compila: livello (`avanzato | intermedio | base | iniziale`), stelle (1-5), osservazioni testuali.
4. L'IA può generare un'osservazione con `handleTriggerGemSuggestion('student-observation')`.
5. Al salvataggio, il sistema ricalcola automaticamente gli esiti della classe:
   - Percentuali per livello di competenza.
   - Media ponderata (60% compito di realtà, 40% valutazione intermedia).
   - Sincronizzazione con la UDA attiva (`activeTaughtUdaId`).

**Punti decisionali:**
- Il tema degli pseudonimi (Scientists/Classico/Miti) influenza i nomi visualizzati.
- I pseudonimi possono essere rimescolati (`handleShufflePseudonyms`).

**Endpoint:** `classroomStudentFeedback` aggiornato in localStorage + osservatorio esiti sincronizzato.

**Errori:** Nessuno bloccante. I dati vengono salvati al cambio di selezione.

```
+-------------------+
| Scheda "Classe"   |
| Sub-tab "Registro"|
+--------+----------+
         |
         v
+--------+----------+
| Lista Alunni      |
| (pseudonimi)      |
+--------+----------+
         |
         v
+--------+----------+
| Seleziona Alunno  |
+--------+----------+
         |
         v
+--------+----------+
| Form Feedback:    |
| Livello, Stelle,  |
| Osservazioni      |
| [Gem IA sugger.]  |
+--------+----------+
         |
         v
+--------+----------+
| Salva + Ricalcolo |
| Esiti Classe      |
| (% per livello)   |
+-------------------+
```

---

## 9. Ricerca nel Second Brain

**Trigger:** L'utente seleziona il tab "Second Brain" (`activeTab === 'second-brain'`) e interagisce con il motore WikiLLM.

**Passi:**

1. L'utente seleziona un volume dalla lista (Vol 1–10 o documenti personalizzati) per consultazione diretta.
2. Nella sottoscheda "Chat", l'utente inserisce una domanda nel campo `wikiQuery`.
3. Il WikiLLM (`generateWikiResponse`) cerca nei volumi Markdown la risposta più pertinente:
   - Analisi lessicale dei volumi con punteggio di rilevanza.
   - Rilevamento automatico della disciplina dalla query.
   - Se la query è relativa alla disciplina corrente, priorità al volume corrispondente.
4. La risposta viene visualizzata con il volume di riferimento.
5. La risposta è disponibile in formato testo e può essere letta ad alta voce con TTS (`handleToggleSpeech`).

**Punti decisionali:**
- Se la query non ha corrispondenze: "Spiacente, non ho trovato informazioni specifiche."
- L'utente può aggiungere documenti personalizzati alla KB (`handleAddCustomKbDoc`).

**Endpoint:** Risposta WikiLLM visualizzata nella chat.

**Errori:**
- Errore interno: "Si è verificato un errore durante l'elaborazione della richiesta."
- Nessuna connessione: il WikiLLM funziona interamente offline.

```
+-------------------+
| Second Brain      |
+--------+----------+
         |
    +----+----+
    v         v
 [Brain]   [Graph]
 [Leggi]   [Mappa]
    |         |
    v         v
 [Volume]   [Nodi SVG]
 [Markdown] interattivi
              |
              v
         [Glossary]
              |
    +---------+---------+
    | Chat (WikiLLM)    |
    | Inserisci query   |
    +---------+---------+
              |
              v
    +---------+---------+
    | generateWiki      |
    | Response()        |
    | (ricerca nei .md) |
    +---------+---------+
              |
              v
    +---------+---------+
    | Risposta + fonte  |
    | + TTS opzionale   |
    +-------------------+
```

---

## 10. Connessione Google Drive

**Trigger:** L'utente seleziona "Connetti Drive" nella sezione Esportazioni o nel modale cloud.

**Passi:**

1. L'utente sceglie il tipo di account: `scolastica` (dominio `.edu.it`) o `personale`.
2. `handleWorkspaceLogin` reindirizza a Google OAuth2 con:
   - Client ID registrato per l'Istituto.
   - Scope: `drive.file` + `userinfo.email`.
   - State parameter CSRF generato con `crypto.randomUUID()`.
3. Google redireziona al redirect URI con `access_token` nell'hash.
4. L'app estrae il token, verifica lo state CSRF, e chiama `userinfo.email` per determinare il tipo di account.
5. Il token viene salvato con scadenza (`workspaceTokenExpiry`).
6. `handleWorkspaceAutoPull` cerca un file `CurManLight_CopiaSicurezza_Milani_{schoolYear}.json` su Drive:
   - Se esiste: propone il ripristino con confronto side-by-side (UDA cloud vs UDA locali).
   - Se l'utente accetta: `restoreBackupState(remoteState)`.
   - Se rifiuta: blocca la sincronizzazione per quella sessione.

**Punti decisionali:**
- Account scolastico vs personale (determina il dominio e il tipo di storage).
- Ripristino dal cloud vs mantenimento locale.
- Conflitti: se la versione cloud è più recente, chiede conferma prima della sovrascrittura.

**Endpoint:** Google Drive connesso, stato sincronizzato.

**Errori:**
- Token scaduto: "Connessione scaduta. Clicca su Connetti per rinfrescare il Token."
- OAuth fallito: "Account Workspace d'Istituto scollegato."
- CSRF mismatch: token scartato silenziosamente.

```
+--------------------+
| "Connetti Drive"   |
+--------+-----------+
         |
         v
+--------+-----------+
| Tipo Account:     |
| [Scolastica]      |
| [Personale]       |
+--------+-----------+
         |
         v
+--------+-----------+
| Redirect Google    |
| OAuth2             |
| (Implicit Grant)   |
+--------+-----------+
         |
         v
+--------+-----------+
| Callback con       |
| access_token       |
| + CSRF verify      |
+--------+-----------+
         |
    +----+----+
    | Email   |
    | .edu.it?|
    +----+----+
   /          \
  v            v
[Scolastica] [Personale]
         |
         v
+--------+-----------+
| Auto-Pull da Drive |
| Cerca file .json   |
+--------+-----------+
         |
    +----+----+
    | File    |
    | trovato?|
    +----+----+
   /          \
  v            v
[Confronto]  [Nessun file]
[side-by-side] [Primo upload]
         |
    +----+----+
    | Accetta? |
    +----+----+
   /          \
  v            v
[Restore]   [Blocca sync]
[stato]
```

---

## Note di Implementazione

- Tutti i flussi usano `showToast(messaggio, successo)` per il feedback utente.
- Lo stato è persistito tramite Zustand + IndexedDB (`Dexie`) con fallback a memoria temporanea.
- Il backup d'emergenza opera ogni 60 secondi con throttling (`throttledSetLarge`).
- Il filtro GDPR blocca automaticamente riferimenti sensibili (104, DSA, BES, PEI, PDP) in chat, annotazioni e clonazione UDA.
