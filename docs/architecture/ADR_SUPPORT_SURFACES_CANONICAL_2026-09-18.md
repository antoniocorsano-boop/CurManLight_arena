# ADR — Supporto canonico di CurManLight Arena

Status: `PROPOSED`  
Date: 2026-09-18  
Issue: #257  
Baseline di partenza: `b262b85964306afa8c58fc12c80017b5688d111f`  
Ramo: `design/support-canonical-v1`

## 1. Decisione da assumere

La sezione secondaria **Supporto** deve contenere soltanto superfici che rispondono a un compito umano distinto, possiedono un’identità stabile e non duplicano autorità o stato.

La struttura target è:

1. **Fascicolo** — provenienza, versioni, fonti, registri e tracciabilità;
2. **Verifiche** — readiness, prerequisiti, blocchi e azioni di recupero;
3. **Guida** — assistenza contestuale per il compito corrente.

Le tre superfici sono di supporto. Nessuna di esse concede autorità deliberativa.

## 2. Motivazione

La candidata corrente espone tre voci nominalmente di supporto, ma solo Fascicolo possiede già una direzione canonica coerente.

### Problema A — Fascicolo
La convergenza è avviata, ma la superficie deve rispondere in modo esplicito alle domande:

- qual è la baseline/master che sto leggendo?
- da quali fonti deriva?
- quale versione è?
- è verificata?
- qual è la catena documentale?
- quali ricevute o registri sono collegati?
- quali materiali sono solo archivio locale/legacy?

### Problema B — Controlli e checklist
La voce corrente `certificazione-pa` non possiede una route o un Human Task autonomi. Oggi ricade su `/documents` e quindi viola il principio `Human Task → Surface → Route`.

### Problema C — Guida
La Guida corrente descrive ancora capability legacy e ampio authoring UDA in Arena. Non è allineata con il confine attuale Arena ↔ Docente OS né con la nuova architettura curricolare.

## 3. Contratti umani

### SUP-H1 — Fascicolo

**Il docente potrà capire da quali fonti, versioni, verifiche e decisioni deriva ciò che sta consultando.**

Domande a cui deve rispondere il livello 1:
- cosa sto consultando?
- da dove viene?
- in che stato è?
- cosa è corrente, provvisorio o storico?
- dove verifico la catena?

Route canonica: `/fascicolo`

Autorità: lettura e verifica; nessuna approvazione implicita.

### SUP-H2 — Verifiche

**Il docente potrà vedere cosa è verificato, cosa manca e cosa impedisce di procedere in sicurezza.**

La superficie deve sintetizzare almeno:
- contesto istituzionale configurato/non configurato;
- fonti richieste disponibili/mancanti;
- stato di validazione professionale;
- coerenza minima della catena documentale;
- prerequisiti per revisione;
- prerequisiti per handoff;
- blocchi e relativa recovery action.

Non deve:
- certificare conformità PA;
- approvare il curricolo;
- sostituire una decisione istituzionale;
- duplicare Documenti;
- esporre gate tecnici come compito ordinario del docente.

Route canonica proposta: `/verifiche`

### SUP-H3 — Guida

**Il docente potrà capire come svolgere il compito corrente, perché un’azione è bloccata e quale passo viene dopo.**

La Guida deve essere organizzata per compiti:
- consultare il curricolo;
- capire fonti e stato;
- esaminare una proposta;
- partecipare al confronto;
- comprendere una decisione istituzionale;
- preparare un passaggio a Docente OS;
- recuperare da un blocco.

Route canonica: `/guida`

Il manuale storico resta eventualmente consultabile come archivio secondario, non come contenuto dominante.

## 4. Eccezione al routing freeze

`docs/WORKING_PROTOCOL.md` congela il routing e richiede una Architecture Decision per ogni eccezione.

Questa ADR, quando accettata, autorizza esclusivamente:

1. nuova route canonica `/verifiche`;
2. la voce **Verifiche** emette `/verifiche`;
3. il vecchio stato interno `certificazione-pa` può sopravvivere temporaneamente come adapter tecnico, ma non deve più definire nomenclatura o routing di prodotto;
4. eventuali deep link storici non devono essere reinterpretati come nuova autorità;
5. `/documents` resta esclusivamente Documenti/Handoff.

Nessun’altra modifica di routing è autorizzata da questa ADR.

## 5. Modello di stato di Verifiche

La superficie non introduce una seconda fonte di verità. Proietta stati già esistenti.

Ogni verifica deve avere:

- `label` — linguaggio docente;
- `state` — `ok | attention | blocked | not_applicable`;
- `explanation` — perché quello stato conta;
- `recoveryAction` — azione esplicita quando serve;
- `evidenceLink` — opzionale, verso Fascicolo o superficie competente.

Esempi:

- **Contesto istituzionale** — bloccato → “Configura o collega l’istituto”;
- **Fonte del fascicolo** — ok → “Fonte identificata e versionata”;
- **Adozione istituzionale** — attenzione → “La fonte non equivale ad adozione”;
- **Passaggio a Docente OS** — bloccato → “Completa il contesto istituzionale”;
- **Riesame** — ok/attenzione in base allo stato reale.

## 6. Relazione tra le tre superfici

`Fascicolo` risponde a **“quali prove e fonti?”**  
`Verifiche` risponde a **“posso procedere e cosa manca?”**  
`Guida` risponde a **“come faccio?”**

Nessuna delle tre deve diventare una seconda Home o una seconda Revisione.

## 7. Nomenclatura

Da rimuovere dal livello 1:
- `Controlli e checklist`;
- `certificazione-pa`;
- terminologia di gate, SHA, fingerprint o pipeline;
- riferimenti a funzioni non più primarie di Arena.

Da usare:
- **Fascicolo**
- **Verifiche**
- **Guida**

## 8. Progressive disclosure

### Fascicolo
Livello 1:
- baseline;
- fonti;
- stato;
- catena;
- archivio.

Livello 2:
- versioni;
- registri;
- ricevute;
- dettagli di tracciabilità.

Livello 3:
- identificativi tecnici, fingerprint e strumenti di verifica avanzata.

### Verifiche
Livello 1:
- “Pronto”, “Da completare”, “Bloccato”;
- massimo 5–7 controlli significativi.

Livello 2:
- perché;
- recovery;
- link all’evidenza.

### Guida
Livello 1:
- task cards;
- ricerca per domanda;
- “Dove sono / cosa posso fare / prossimo passo”.

Livello 2:
- walkthrough;
- glossario;
- FAQ.

## 9. Accessibilità e HCM

Obblighi:
- target touch ≥ 44 px;
- piena navigazione da tastiera;
- stato non affidato al solo colore;
- titoli e landmark semantici;
- nessun overflow orizzontale;
- copy leggibile senza conoscenze tecniche;
- stato bloccato sempre accompagnato da causa e recovery;
- Guida utilizzabile senza scorrimento seriale di un manuale lungo.

## 10. Piano incrementale

### SUP-1 — Contratto e ADR
- ADR;
- issue canonica;
- test/contratto di nomenclatura e route.

### SUP-2 — Verifiche reale
- superficie dedicata;
- route `/verifiche`;
- eliminazione dell’alias nominale verso Documenti;
- proiezione di readiness da stato esistente.

### SUP-3 — Guida task-first
- rimozione contenuti legacy dominanti;
- guide per compito;
- recovery e collegamenti contestuali;
- manuale storico subordinato.

### SUP-4 — Fascicolo consolidato
- rendere espliciti baseline, fonti, stato, catena, registri e archivio;
- evitare duplicazione con Conoscenza;
- mantenere il livello tecnico dietro divulgazione progressiva.

### SUP-5 — Assurance
- Product CI;
- routing contract;
- Human Interaction Model;
- browser mobile/desktop;
- accessibilità;
- human review.

## 11. Vincoli

Questa tranche:
- non modifica autorità;
- non introduce nuove decisioni istituzionali;
- non sposta authoring UDA in Arena;
- non modifica il contratto Arena ↔ Docente OS;
- non modifica la candidata G5 corrente;
- non viene integrata in #251 durante il collaudo della release corrente.

## 12. Criteri di accettazione

La tranche può essere candidata al merge solo quando:

1. ogni voce Supporto possiede un compito umano distinto;
2. `Verifiche` non ricade più su Documenti;
3. `/documents` resta Documenti/Handoff;
4. Fascicolo e Verifiche non duplicano stato o autorità;
5. Guida descrive le capability correnti, non quelle legacy;
6. mobile e desktop sono leggibili;
7. nessun finding severità 1/2 resta aperto;
8. il passaggio dalla candidata G5 corrente alla nuova candidata avviene solo con nuova exact-SHA certification.
