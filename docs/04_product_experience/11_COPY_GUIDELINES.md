# 11 — Linee Guida Copy e Terminologia

**CurManLight — Product Experience**
**Ultimo aggiornamento:** 2026-07-19

---

Questo documento definisce il tono, il linguaggio e le convenzioni per tutto il copy dell'interfaccia di CurManLight.

---

## 1. Tono e Personalità

CurManLight parla come **un collega esperto e disponibile** — qualcuno che conosce bene la burocrazia scolastica ma non la rende pesante. Non è un assistente virtuale freddo, né un tutor entusiasta. È un professionista che aiuta a fare le cose in modo efficiente.

| Tratto | Esempio | Contro-esempio |
|--------|---------|----------------|
| Professionale | "Esportazione completata" | "Bravissimo! Ce l'hai fatta!" |
| Diretto | "Inserisci un titolo per procedere" | "Ti invitiamo a voler cortesemente inserire..." |
| Rassicurante | "Copia d'emergenza salvata" | "Attenzione! I dati potrebbero andare persi!" |
| Italiano scolastico | "Disciplina" | "Materia" o "Modulo" |
| Non tecnico | "Salva" | "Persisti" o "Serializza" |

---

## 2. Lessico Obbligatorio

### 2.1 Termini da usare

| Termine | Quando usarlo | Esempio |
|---------|--------------|---------|
| Curricolo | Sempre, per il documento e per la vista | "Consulta Curricolo" |
| Progettazione | Per la sezione UDA e programmazione | "Progettazione Annuale" |
| Consiglio | Per le riunioni del Collegio | "Delibera del Consiglio" |
| Alunno | Per riferirsi agli studenti | "Feedback Alunno" |
| Disciplina | Per le materie | "14 Discipline" |
| Esporta | Per il download di documenti | "Esporta in Word" |
| Salva | Per salvare dati | "Salva UDA" |
| Classe | Per i gruppi studenti | "Registro di Classe" |
| Anno scolastico | Per il riferimento temporale | "Anno Scolastico 2025-2026" |
| Traguardo | Per gli obiettivi verticale | "Traguardi di Competenza" |
| Obiettivo | Per gli apprendimenti | "Obiettivi di Apprendimento" |
| Evidenza | Per i comportamenti osservabili | "Evidenze Comportamentali" |
| Compito di Realtà | Per il prodotto autentico | "Compito di Realtà" |
| Sezione | Per le classi (Infanzia usa colori) | "Sezione Rossa" |
| Quadrimestre | Per i periodi didattici | "Primo Quadrimestre" |

### 2.2 Termini da evitare

| Termine | Perché | Usare invece |
|---------|--------|-------------|
| Database | Troppo tecnico | Curricolo |
| Workflow | Anglicismo tecnico | Progettazione |
| Team meeting | Anglismo | Consiglio / Riunione |
| User / Utente | Troppo generico | Alunno / Docente |
| Modulo | Ambiguo | Disciplina / UDA |
| Download | Anglismo | Esporta / Scarica |
| Persist / Persisti | Gergo sviluppatore | Salva |
| Group | Anglismo | Classe |
| Fiscal year | Anglismo | Anno scolastico |
| Target | Anglismo | Obiettivo |
| Feature | Anglismo | Funzionalità |
| Dashboard | Anglismo | Cruscotto / Panoramica |
| Sync / Sincro | Anglismo | Sincronizzazione |
| Upload | Anglismo | Carica / Importa |
| Delete | Anglismo | Elimina / Rimuovi |
| Chat | Troppo generico | Assistente / Copilota |
| API | Termine tecnico | (non mostrare all'utente) |
| JSON | Termine tecnico | File di configurazione |
| Token | Termine tecnico | Autorizzazione |

---

## 3. Convenzioni di Naming

### 3.1 Schermate

Il pattern è: **[Azione] + [Oggetto]**

| Schermata | Pattern corretto |
|-----------|-----------------|
| Consulta curricolo | "Consulta Curricolo" |
| Crea UDA | "Crea UDA" |
| Revisiona proposte | "Revisiona Proposte" |
| Progetta annualmente | "Progettazione Annuale" |
| Esporta documento | "Esporta Documento" |
| Gestisci classe | "Registro di Classe" |
| Consulta fonti | "Consulta Fonti" |
| Cerca nel Second Brain | "Cerca nel Second Brain" |

### 3.2 Tab e Sottoschede

Massimo **2 parole** per etichetta di tab.

| Tab | Etichetta |
|-----|-----------|
| Dashboard | Panoramica |
| Curricolo | Curricolo |
| Revisione | Revisione |
| Progettazione | Progettazione |
| Processo | Processo |
| Esportazioni | Esportazioni |
| Certificazione PA | Certificazione |
| Fonti | Fonti |
| Guida | Guida |
| Second Brain | Second Brain |

Sottoschede:

| Sub-tab | Etichetta |
|---------|-----------|
| Registro | Registro |
| Strumenti | Strumenti |
| Pianificazione | Pianificazione |
| Annuale | Annuale |
| UDA | UDA |
| Certificazione | Certificazione |
| Social | Bacheca |
| Classe | Classe |
| Albero | Albero |
| Mappa | Mappa |
| Popolamento | Popolamento |
| Flusso | Flusso |
| Verifica | Verifica |

### 3.3 Badge

Massimo **2 parole**.

| Badge | Valori possibili |
|-------|-----------------|
| Stato UDA | Bozza, In corso, Approvato, Archiviata |
| Stato proposta | In attesa, Approvato, Rifiutato, Personalizzato |
| Tipo account | Scolastico, Personale |
| Livello alunno | Avanzato, Intermedio, Base, Iniziale |

---

## 4. Pattern di Copy

### 4.1 Toast Messages

I toast devono essere:
- **Brevi:** max 80 caratteri.
- **Informativi:** dire cosa è successo.
- **Azione-specifici:** collegarsi all'azione appena compiuta.
- **Con contesto:** specificare cosa è stato salvato/esportato.

| Tipo | Pattern | Esempi dal codice |
|------|---------|-------------------|
| Successo | "{Azione} completata con successo" | "Bozza della programmazione annuale salvata con successo!" |
| Successo con dettaglio | "{Azione}: {dettaglio}" | "Importazione completata: +5 elementi." |
| Errore | "{Cosa è successo}. {Cosa fare}" | "Blocco popup attivo! Consenti l'apertura dei popup per salvare in PDF." |
| Errore tecnico | "Errore durante {azione}" | "Errore durante la copia dell'UDA negli appunti." |
| Info | "{Stato attuale}" | "Lettura audio avviata!" |
| Warning | "Attenzione: {dettaglio}" | "Spazio di archiviazione esaurito: salvataggio locale non riuscito." |

### 4.2 Error Messages

Ogni messaggio di errore deve:
1. Spiegare **cosa è successo**.
2. Indicare **cosa fare** per risolvere.

| Pattern | Esempio |
|---------|---------|
| "Spiacente, {problema}. {Soluzione}." | "Spiacente, non ho trovato sezioni corrispondenti. Puoi inserire il titolo esatto della sezione." |
| "{Errore}. {Azione correttiva}." | "Token scaduto. Clicca su Connetti per rinfrescare il Token." |
| "Inserisci {campo mancante}!" | "Inserisci almeno un titolo e il contenuto del documento!" |

**Evitare:**
- Messaggi vaghi: "Si è verificato un errore."
- Messaggi tecnici: "DOMException: QuotaExceededError".
- Messaggi colpevolizzanti: "Hai sbagliato qualcosa."

### 4.3 Empty States

Quando una lista è vuota, il messaggio deve:
1. **Spiegare** perché è vuota.
2. **Invitare all'azione**.
3. **Mostrare il valore** dell'azione.

| Pattern | Esempio |
|---------|---------|
| "Nessun {elemento} presente. {Azione suggerita}." | "Nessuna UDA salvata. Crea la tua prima UDA con il Wizard!" |
| "Nessun traguardo programmato." | (Già presente nel codice, Linea 29) |
| "Nessuna copia d'emergenza trovata nella cache locale!" | (Già presente nel codice, Linea 879) |

### 4.4 Button Labels

Il pattern è: **Verbo + Nome**

| Bottone | Azione |
|---------|--------|
| "Scarica PDF" | Download PDF |
| "Salva UDA" | Salva l'UDA corrente |
| "Connetti Drive" | Connessione Google Drive |
| "Cerca" | Ricerca |
| "Esporta in Word" | Download Word |
| "Carica CSV" | Upload file CSV |
| "Genera con IA" | Generazione tramite Copilota |
| "Approva" | Vota a favore della proposta |
| "Rifiuta" | Vota contro la proposta |
| "Personalizza" | Modifica il testo della proposta |
| "Ripristina" | Carica backup |
| "Inietta UDA" | Aggiungi UDA proposta all'archivio |
| "Rimescola" | Mescola gli pseudonimi |

### 4.5 Confirmation Dialogs

Pattern: **"{Azione}? {Conseguenza}."**

| Dialogo | Esempio |
|---------|---------|
| Conferma reset | "Attenzione! Questo azzererà tutte le modifiche d'istituto, le proposte, l'archivio delle UDA e tutti i dati personali d'aula. Vuoi procedere?" |
| Conferma logout | "Sei sicuro di voler scollegare l'account Workspace? Le prossime modifiche saranno salvate solo localmente." |
| Conferma override cloud | "La copia di sicurezza presente sul Cloud risulta più recente di quella locale. Desideri forzare la sovrascrittura?" |

---

## 5. Audit Copy Esistente

### 5.1 Stringhe principali dell'interfaccia

Di seguito le stringhe UI più rilevanti estratte dal codice sorgente, con la loro posizione in `App.tsx`:

| Stringa | Riga | Valutazione |
|---------|------|-------------|
| `"Benvenuto nello spazio di assistenza. Sono il Co-pilota IA d'Istituto."` | ~622 | OK — tono appropriato |
| `"Inserire un titolo per l'UDA d'Istituto prima di procedere!"` | ~1058 | OK — diretto e chiaro |
| `"Attenzione! Questo azzererà tutte le modifiche d'istituto..."` | ~1342 | OK — avviso completo |
| `"Bozza della programmazione annuale salvata con successo!"` | ~1373 | OK — toast informativo |
| `"Copiato con successo formato compatibile Word"` | ~4154 | Anglismo "Word" accettabile (nome proprio) |
| `"Download del documento Word (.docx) avviato!"` | ~3707 | OK — specifico |
| `"Nessuna copia d'emergenza trovata nella cache locale!"` | ~879 | OK — ma usa "cache" (tecnico) |
| `"Spazio di archiviazione esaurito: salvataggio locale non riuscito."` | ~1989 | OK — chiaro |
| `"Sincronizzazione annullata per proteggere la copia di sicurezza sul Cloud."` | ~3051 | OK — rassicurante |
| `"ATTENZIONE (Regolamento GDPR d'Istituto): Per proteggere l'anonimato del minore..."` | ~2360 | Tono eccessivamente formale |
| `"Il Co-pilota consiglia di consultare i faldoni d'indagine d'Istituto."` | ~2383 | OK — ma "faldoni" è colloquiale |
| `"Genera con IA"` | ~2307 | OK — ma "IA" potrebbe essere "Copilota" |

### 5.2 Problemi identificati

| ID | Problema | Riga | Raccomandazione |
|----|----------|------|-----------------|
| C-01 | "Cache locale" è un termine tecnico | ~879 | Usare "memoria locale" |
| C-02 | Messaggio GDPR troppo lungo | ~2360 | Accorciare e usare tono più didattico |
| C-03 | "Faldoni d'indagine" non è standard | ~2383 | Usare "documenti" o "volumi" |
| C-04 | Mancanza di `aria-live` sui toast | Tutti | Aggiungere `role="status"` |
| C-05 | Inconsistenza: "Classe" vs "gruppo" | Vari | Usare sempre "Classe" |

---

## 6. Convenzioni per l'AI (Copilota e WikiLLM)

### 6.1 Copilota Chat

- Il saluto iniziale deve essere: `"Benvenuto nello spazio di assistenza. Sono il Co-pilota IA d'Istituto."`
- Le risposte devono citare la fonte normativa quando possibile (es. "D.M. 221/2025").
- Il Copilota non deve usare gergo tecnico (API, endpoint, JSON, token).
- Il Copilota deve rispondere in italiano scolastico.

### 6.2 WikiLLM

- Le risposte devono essere basate esclusivamente sui volumi Markdown del Second Brain.
- Ogni risposta deve citare il volume di riferimento.
- In caso di assenza di informazioni: "Spiacente, non ho trovato informazioni specifiche nei volumi d'Istituto su questo argomento."

### 6.3 Filtro GDPR

Il sistema blocca automaticamente:
- Sigle sensibili: 104, DSA, BES, PEI, PDP
- Termini clinici: disabilità, clinica, sindrome, certificazione

**Messaggio di blocco:** "ATTENZIONE: Per proteggere l'anonimato del minore, è vietato inserire riferimenti clinici o di diagnosi nella chat. Formula il quesito in chiave metodologica."

---

## 7. Convenzioni per i Documenti Esportati

### 7.1 Intestazione ministeriale

Ogni documento Word/PDF deve includere:
1. "MINISTERO DELL'ISTRUZIONE E DEL MERITO"
2. "UFFICIO SCOLASTICO REGIONALE PER LA CAMPANIA"
3. Nome istituto completo
4. Indirizzo + Codice Meccanografico

### 7.2 Blocco firme

Ogni documento formale deve terminare con:
- "Il Referente del Curricolo" (sinistra)
- "Il Dirigente Scolastico" (destra)
- Nota: "(Firma autografa omessa ai sensi del CAD)"

### 7.3 Terminologia documenti

| Documento | Titolo esatto |
|-----------|--------------|
| Curricolo verticale | "LIBRO DEL CURRICOLO VERTICALE D'ISTITUTO" |
| Tavola di confronto | "TAVOLA SINOTTICA DI CONFRONTO E ADOZIONE" |
| Programmazione annuale | "PROGRAMMAZIONE ANNUALE DIDATTICA PER QUADRIMESTRI" |
| Relazione | "RELAZIONE SCOLASTICA (INTERMEDIA/FINALE)" |
| Scheda osservazione | "SCHEDA DI OSSERVAZIONE PEDAGOGICA QUALITATIVA" |
| Documento esame | "DOCUMENTO DEL PROGRAMMA DIDATTICO SVOLTO (D.Lgs. 62/2017)" |

---

## 8. Checklists per Chi Scrive Copy

- [ ] Il testo è in italiano scolastico (non tecnico, non anglicizzato)?
- [ ] Il tono è professionale ma accessibile?
- [ ] Il messaggio è breve (max 80 caratteri per toast)?
- [ ] L'errore spiega cosa è successo E cosa fare?
- [ ] L'empty state invita all'azione?
- [ ] Il bottone usa il pattern Verbo + Nome?
- [ ] Il badge ha massimo 2 parole?
- [ ] Il tab ha massimo 2 parole?
- [ ] Non ci sono anglicismi non necessari?
- [ ] Il termine "utente" non è usato (usa "alunno" o "docente")?
- [ ] Il copy è consistente con le altre schermate?
