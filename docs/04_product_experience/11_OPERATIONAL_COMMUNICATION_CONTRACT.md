# CCO — Contratto di comunicazione operativa di Arena

**Versione:** 1.4.1  
**Stato:** normativo per le nuove superfici e per le superfici migrate  
**Integrazione:** Human Interaction Model (HIM) e `CURRICULUM_LIFECYCLE@1.1.1`  
**Registro superfici:** 1.5.1

## 1. Scopo

Arena deve permettere all'utente di agire con fiducia senza obbligarlo a studiare ogni schermata prima di usarla. La formazione resta necessaria, ma non deve essere la condizione per comprendere l'azione quotidiana.

Il CCO separa strutturalmente:

1. **uso operativo**;
2. **rassicurazione contestuale**;
3. **formazione e approfondimento**.

Principi guida:

> I concetti fondamentali di Arena devono essere rappresentati prima dalla struttura, poi dalle parole.

> **Riconoscimento prima dell'interpretazione:** nella vista di lavoro l'utente deve riconoscere l'oggetto, il suo stato e le azioni possibili prima di dover interpretare una spiegazione.

La gerarchia comunicativa canonica resta:

**contesto → stato → prossima azione → conseguenza immediata → approfondimento**.

## 2. Modalità lavoro e modalità capire

La **modalità lavoro** è la condizione ordinaria e predefinita. Deve privilegiare:

- un solo oggetto dominante per il compito corrente;
- stato espresso soprattutto mediante posizione, forma, trasformazione e prossimità;
- azioni collocate vicino all'oggetto su cui agiscono;
- testo breve soltanto quando aggiunge informazione non già visibile;
- strumenti secondari e metadati dietro divulgazione progressiva.

La **modalità capire** non è una seconda applicazione: è l'insieme degli approfondimenti raggiungibili su richiesta tramite elementi come **Personale**, **Contesto e fonti**, **Come funziona questa area** o equivalenti. Qui possono vivere spiegazioni di processo, provenienza, criteri, governance e glossario.

La modalità capire non deve occupare stabilmente lo spazio percettivo della modalità lavoro.

## 3. Livello operativo

Ogni contesto di lavoro deve rendere riconoscibili entro pochi secondi:

- **dove sono**;
- **qual è l'oggetto su cui sto lavorando**;
- **qual è lo stato corrente**;
- **quali azioni posso compiere adesso**;
- **che cosa cambia dopo l'azione**.

Una frase non deve ripetere ciò che posizione, etichetta, stato o trasformazione rendono già evidente. Se una frase può essere sostituita senza perdita di significato da una proprietà dell'interfaccia, nella vista ordinaria la proprietà dell'interfaccia è preferibile.

## 4. Rassicurazione contestuale

La rassicurazione persistente è obbligatoria quando l'azione produce un effetto condiviso, esercita un'autorità istituzionale o ha una conseguenza esterna/irreversibile.

Per confini di sfondo — per esempio il fatto che la revisione personale non costituisca approvazione — è ammessa una rassicurazione **su richiesta**, purché la struttura della vista non suggerisca l'equivalenza errata.

Nella condivisione con il team, invece, il confine resta visibile perché l'azione produce un effetto condiviso: il contributo condiviso resta personale e non costituisce esito del gruppo.

## 5. Gerarchia visiva obbligatoria

Una superficie operativa conforme deve avere **una sola cosa dominante alla volta**.

Per la singola scheda di revisione la gerarchia è:

**titolo della scheda → confronto → azioni**.

Per la sessione complessiva di validazione professionale la gerarchia è:

**stadio corrente → oggetto di lavoro → azione che consente il passaggio successivo**.

Contatori multipli, spiegazioni del processo, filtri, criteri e provenienza non devono competere con questa gerarchia. Possono essere disponibili, ma secondari.

Una superficie non è conforme se:

- mostra più gerarchie di avanzamento concorrenti;
- usa tab paralleli per rappresentare passaggi che appartengono allo stesso processo professionale;
- usa più card, badge o riquadri con lo stesso peso percettivo senza necessità;
- ripete lo stesso stato sia come numero, sia come frase, sia come badge senza aggiungere significato;
- richiede una lettura preliminare per capire l'azione immediata.

## 6. Progressione nei flussi verticali

Lo scorrimento verticale è ammesso, ma non costituisce di per sé una progressione di processo.

Per un flusso composto da più passaggi valgono questi vincoli:

- il **compito corrente domina** la superficie;
- i controlli del passaggio futuro sono nascosti finché non diventano pertinenti;
- il completamento produce una conseguenza visibile e una prossima azione;
- quando l'utente sceglie di continuare deve avvenire **una vera transizione di stato**: cambia il compito attivo e cambia ciò che viene renderizzato;
- uno scroll verso un blocco già presente non è una transizione di stato;
- quando il passaggio successivo diventa attivo, quello precedente si riduce a una sintesi compatta e riapribile quando utile;
- filtri e navigazione retrospettiva vivono dietro divulgazione progressiva;
- il sistema non duplica la stessa conseguenza o lo stesso invito all'azione su più livelli;
- un passaggio con effetto condiviso è completato soltanto quando l'effetto è realmente persistito e verificabile nello stato corrente.

Per `CurriculumWorkSession` la progressione canonica è:

**ESAMINA → CONDIVIDI → CONFRONTA → REGISTRA L'ESITO**.

Il coordinatore non salta `ESAMINA` o `CONDIVIDI`: quando lavora sul proprio contributo è un contributore come gli altri. Il ruolo di coordinamento diventa pertinente soltanto dopo il contributo personale e quando i prerequisiti del gruppo consentono il confronto.

`CONDIVIDI` si considera completato soltanto quando Arena ritrova nel team un `ProfessionalContribution` persistito dello stesso utente che corrisponde alla scheda/versione corrente, all'orientamento personale corrente e, quando presente, al testo di modifica corrente. Una dichiarazione locale non può simulare l'avvenuta condivisione. Se il docente modifica successivamente l'orientamento o il testo, il precedente contributo condiviso diventa non corrente e `CONFRONTA` torna indisponibile fino a una nuova registrazione coerente.

Per il docente senza ulteriori responsabilità il compito personale termina dopo la condivisione verificata; Arena deve mostrare uno stato di attesa comprensibile senza proiettare come azione personale il lavoro futuro del coordinatore.

## 7. Grammatica delle azioni

Arena usa una grammatica stabile, ma ammette etichette brevi quando la relazione tra azione e oggetto è già evidente dalla posizione.

| Azione | Significato canonico |
|---|---|
| **Esamina** | Leggi e valuta una scheda. |
| **Conferma** | Esprimi accordo con la proposta visibile. |
| **Modifica** | Apri la formulazione di un'alternativa; non registra ancora il lavoro. |
| **Registra modifica** | Salva la formulazione alternativa come orientamento personale completo. |
| **Mantieni** | Mantieni il testo precedente nel contesto corrente. |
| **Condividi** | Registra e rende visibile al team un contributo personale corrente. |
| **Confronta** | Esamina con il gruppo i punti che richiedono realmente discussione dopo una condivisione verificata. |
| **Registra l'esito** | Documenta un esito già maturato nel gruppo autorizzato. |

La distinzione **Modifica → Registra modifica** è obbligatoria: aprire o compilare una bozza non equivale a completarla.

**Approva** e **Adotta** restano verbi riservati ai contesti in cui l'autorità corrispondente è realmente verificata.

## 8. Confini di autorità

La struttura e le parole non devono mai suggerire equivalenze false:

- profilo personale ≠ ruolo verificato;
- appartenenza al gruppo ≠ autorità;
- contributo individuale ≠ esito del team;
- esito del team ≠ decisione istituzionale;
- decisione istituzionale ≠ curricolo adottato finché il relativo passaggio non è registrato.

## 9. Criterio di fiducia

La fiducia deriva dalla prevedibilità del sistema:

- lo stesso verbo produce lo stesso tipo di effetto;
- l'oggetto su cui si agisce è evidente;
- l'azione è vicina all'oggetto;
- il completamento si vede perché la superficie cambia;
- una bozza non viene dichiarata completata;
- una condivisione non viene dichiarata completata finché non è persistita e coerente con il lavoro corrente;
- il passaggio successivo non compete con quello corrente;
- gli effetti condivisi dichiarano il proprio confine;
- gli errori sono recuperabili;
- provenienza e spiegazioni restano raggiungibili senza occupare il flusso ordinario.

## 10. Test di accettazione per ogni vista

Una vista conforme deve superare queste domande:

1. L'utente capisce entro circa **5 secondi** dove si trova e su che cosa sta lavorando?
2. Esiste un solo oggetto dominante per il compito corrente?
3. Lo stato è riconoscibile senza leggere una spiegazione?
4. Le azioni sono vicine all'oggetto e comprensibili nel loro contesto?
5. Una frase persistente aggiunge davvero informazione oppure ripete ciò che la vista mostra già?
6. Rimuovendo il testo formativo, il flusso resta comprensibile e utilizzabile?
7. Approfondimenti, criteri, fonti e navigazione retrospettiva restano raggiungibili su richiesta?
8. Esiste una sola gerarchia di avanzamento?
9. Il passaggio successivo viene realmente renderizzato solo dopo la transizione di stato?
10. Una bozza che richiede conferma non viene conteggiata come lavoro completato?
11. Una rassicurazione persistente corrisponde a un rischio presente nell'azione corrente?
12. Un coordinatore attraversa prima gli stessi passaggi personali richiesti agli altri contributori?
13. `CONFRONTA` resta bloccato se il contributo condiviso non è persistito o non corrisponde più all'orientamento personale corrente?

I controlli 2, 3, 5, 6, 8, 9, 12 e 13 sono discriminanti.

## 11. Integrazione con HIM

Il CCO non sostituisce il Human Interaction Model. Ne costituisce il contratto di comunicazione.

HIM governa task umani, stato visibile, recupero, accessibilità e azioni conseguenziali. CCO aggiunge i vincoli di comunicazione operativa, progressione reale e riconoscimento percettivo.

Il file macchina canonico è:

`.human/operational-communication.contract.json`

Il **Registro delle superfici** è:

`.human/operational-communication.surfaces.json`

Il validatore HIM controlla gli invarianti del contratto, le superfici pilota e lo stato di migrazione delle superfici registrate.

## 12. Stato delle superfici

| Superficie | Stato CCO | Obiettivo |
|---|---|---|
| Home docente | **conformant** | Orientamento e accesso al lavoro pertinente. |
| CurriculumWorkSession | **conformant** | Un'unica progressione Esamina → Condividi → Confronta → Esito, senza tab concorrenti. |
| Revisione della singola scheda | **conformant** | Riconoscimento immediato: una scheda, un confronto, tre azioni. |
| Pubblicazione del contributo personale | **conformant** | Condivisione persistita, verificata sulla versione e sull'orientamento correnti. |
| Lavoro del team legacy | **migration** | Restare solo compatibilità temporanea, non superficie primaria concorrente. |
| Coordinamento del team | **migration** | Integrare completamente confronto ed esito nella sessione unica. |
| Profilo di lavoro personale | **guided-setup** | Configurazione iniziale senza confondere preferenze, incarichi e autorità. |

## 13. CCO-R1 — comunicazione operativa

CCO-R1 ha stabilito che stato e prossima azione precedono la formazione e che i conteggi devono riferirsi al contesto personale reale.

## 14. CCO-R2 — progressione reale

CCO-R2 ha stabilito che la condivisione non può essere semplicemente un blocco già presente più in basso: **Passa alla condivisione** deve produrre una vera transizione di stato.

## 15. CCO-R3 — interazione per riconoscimento

CCO-R3 introduce il principio **riconoscimento prima dell'interpretazione**.

Nella Revisione personale questo significa che la vista ordinaria non apre con spiegazioni o contatori concorrenti, la scheda mostra direttamente **Precedente** e **Proposta**, le azioni sono adiacenti all'oggetto e **Contesto e fonti** resta disponibile ma chiuso.

## 16. CCO-R4 — sessione professionale unica

CCO-R4 applica il lifecycle di prodotto alla validazione professionale.

Le precedenti superfici **Il mio contributo**, **Condivisione**, **Lavoro del team** e **Coordinamento del team** non sono più considerate processi paralleli. Convergono nella `CurriculumWorkSession`.

Il primo incremento implementato ha stabilito che:

- all'ingresso domina sempre **Esamina**, anche per il coordinatore;
- il completamento personale abilita **Condividi** mediante una vera transizione di stato;
- il docente senza responsabilità successive vede chiaramente che, dopo la condivisione, il lavoro passa al gruppo;
- il coordinatore non può saltare il proprio contributo personale;
- il confronto e la registrazione dell'esito continuano a rispettare i controlli di ruolo, competenza e copertura già presenti.

## 17. CCO-R5 — condivisione persistita prima del confronto

CCO-R5 chiude il secondo incremento della `CurriculumWorkSession`.

Il passaggio `CONDIVIDI → CONFRONTA` non dipende più da una dichiarazione dell'utente. Arena verifica il `ProfessionalContribution` persistito sulla versione/fingerprint corrente e lo confronta con l'orientamento personale e l'eventuale testo personalizzato correnti. Se uno di questi elementi cambia, la precedente condivisione non è più sufficiente e la sessione torna a **Condividi**.

Questo vincolo riguarda la correttezza del processo professionale nel prodotto. Non costituisce esito del gruppo, decisione istituzionale, approvazione o adozione del curricolo.
