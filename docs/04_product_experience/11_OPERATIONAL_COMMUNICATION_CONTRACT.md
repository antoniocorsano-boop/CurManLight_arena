# CCO — Contratto di comunicazione operativa di Arena

**Versione:** 1.2.0  
**Stato:** normativo per le nuove superfici e per le superfici migrate  
**Integrazione:** Human Interaction Model (HIM)  
**Registro superfici:** 1.3.0

## 1. Scopo

Arena deve permettere all'utente di agire con fiducia senza obbligarlo a studiare ogni schermata prima di usarla. La formazione resta necessaria, ma non deve essere la condizione per comprendere l'azione quotidiana.

Il CCO separa strutturalmente:

1. **uso operativo**;
2. **rassicurazione contestuale**;
3. **formazione e approfondimento**.

Principio guida:

> I concetti fondamentali di Arena devono essere rappresentati prima dalla struttura, poi dalle parole.

Regola operativa:

> Nella fase d'uso l'utente non deve leggere una spiegazione per capire che cosa fare. Deve poterlo comprendere da contesto, stato, azione e conseguenza immediata. La spiegazione serve a capire perché Arena funziona in quel modo.

## 2. I tre livelli

### 2.1 Livello operativo

È il livello dominante nell'uso quotidiano. Ogni contesto di lavoro deve rendere immediatamente riconoscibili:

- **dove sono**;
- **qual è lo stato corrente**;
- **qual è la prossima azione utile**;
- **che effetto immediato produce l'azione**.

Il nome dell'azione deve descrivere ciò che accadrà. Un paragrafo esplicativo non può compensare un'etichetta ambigua.

### 2.2 Rassicurazione contestuale

Serve soltanto quando esiste un rischio concreto di fraintendimento, in particolare per effetti condivisi, confini di autorità e azioni conseguenziali.

Deve essere breve, vicina all'azione e riferita al rischio effettivo. Esempi:

- `Il tuo contributo resta personale.`
- `Non costituisce un esito del team.`
- `L'esito del team non è una decisione istituzionale.`

La rassicurazione non sostituisce mai un nome d'azione preciso.

### 2.3 Livello formativo

Contiene spiegazioni del modello, esempi, glossario, percorso, provenienza e ragioni delle separazioni di governo.

Deve essere disponibile tramite divulgazione progressiva, per esempio **Come funziona questa area**, senza interrompere il flusso principale e senza essere necessario per completare il compito ordinario.

## 3. Gerarchia obbligatoria della vista

Per una superficie operativa la priorità comunicativa è:

**contesto → stato → prossima azione → conseguenza immediata → approfondimento**.

La spiegazione generale del processo non deve precedere lo stato del lavoro se non nella prima esperienza guidata o in un contesto esplicitamente formativo.

Una superficie non è conforme se mostra più gerarchie di avanzamento concorrenti per lo stesso compito. In un contesto operativo deve esistere **una sola gerarchia di processo visibile**.

## 4. Progressione nei flussi verticali

Lo scorrimento verticale è ammesso, ma non costituisce di per sé una progressione di processo.

Per un flusso composto da più passaggi valgono questi vincoli:

- il **compito corrente domina** la superficie;
- i controlli del passaggio futuro sono nascosti finché non diventano pertinenti;
- il completamento produce una conseguenza visibile e una prossima azione;
- quando l'utente sceglie di continuare deve avvenire **una vera transizione di stato**: cambia il compito attivo e cambia ciò che viene renderizzato;
- uno `scroll` verso un blocco già presente non è una transizione di stato;
- quando il passaggio successivo diventa attivo, quello precedente deve ridursi a una **sintesi compatta e riapribile** quando utile;
- filtri, navigazione dell'insieme e strumenti di revisione retrospettiva non devono interrompere il percorso principale: vivono dietro divulgazione progressiva;
- il sistema non deve duplicare la stessa conseguenza o lo stesso invito all'azione su più livelli della stessa vista.

Questa regola permette alla pagina di crescere in verticale senza diventare un documento da studiare: ciò che appare deve corrispondere allo stato raggiunto dall'utente.

## 5. Grammatica delle azioni

Arena usa una grammatica stabile. I verbi non sono sinonimi intercambiabili.

| Azione | Significato canonico |
|---|---|
| **Esamina** | Leggi e valuta una scheda. |
| **Conferma** | Esprimi accordo con una proposta nel tuo contesto. |
| **Proponi una modifica** | Avvia la formulazione di un'alternativa; non registra ancora un orientamento completo. |
| **Registra la modifica** | Conferma e salva la formulazione alternativa come orientamento personale completo. |
| **Condividi** | Rende visibile al team un contributo personale. |
| **Registra l'esito** | Documenta un esito già maturato nel gruppo autorizzato. |

La distinzione tra **Proponi una modifica** e **Registra la modifica** è obbligatoria: l'apertura di un campo di bozza non può essere presentata come lavoro già completato.

**Approva** e **Adotta** sono verbi riservati a contesti in cui l'autorità corrispondente è realmente verificata. Non devono essere usati come sinonimi di conferma, condivisione o registrazione.

## 6. Confini di autorità

La struttura e le parole non devono mai suggerire equivalenze false:

- profilo personale ≠ ruolo verificato;
- appartenenza al gruppo ≠ autorità;
- contributo individuale ≠ esito del team;
- esito del team ≠ decisione istituzionale;
- decisione istituzionale ≠ curricolo adottato finché il relativo passaggio non è registrato.

## 7. Criterio di fiducia

La fiducia deriva dalla prevedibilità del sistema:

- lo stesso verbo produce lo stesso tipo di effetto;
- lo stato è visibile prima dell'azione;
- un'azione incompleta non viene dichiarata completata;
- il passaggio successivo non compete con quello corrente;
- gli effetti condivisi sono dichiarati;
- gli errori sono recuperabili;
- la provenienza è consultabile;
- l'autorità non è suggerita dall'aspetto grafico se non è verificata.

## 8. Test di accettazione per ogni vista

Una vista conforme deve superare queste domande:

1. L'utente capisce entro circa **5 secondi** dove si trova?
2. Vede immediatamente lo stato del proprio lavoro?
3. È chiaro qual è il compito attivo?
4. L'etichetta dell'azione descrive davvero ciò che farà?
5. La conseguenza o il confine più importante è espresso in modo breve e contestuale?
6. Rimuovendo il testo formativo, il flusso resta comprensibile e utilizzabile?
7. La spiegazione completa resta facilmente raggiungibile?
8. Esiste una sola gerarchia di avanzamento per il compito corrente?
9. Il passaggio successivo viene realmente renderizzato solo dopo la transizione di stato?
10. Filtri e strumenti retrospettivi sono secondari rispetto al lavoro corrente?
11. Una bozza che richiede un'ulteriore conferma non viene conteggiata come lavoro completato?

I controlli 6, 8 e 9 sono discriminanti: una superficie che li viola non può essere dichiarata conforme anche se il percorso tecnico è eseguibile.

## 9. Formazione come esperienza separata

La formazione può essere proposta alla prima visita di un'area, su richiesta tramite **Come funziona questa area**, nella guida generale di Arena o in percorsi specifici per incarico.

Dopo la prima comprensione, la superficie ordinaria deve tornare prevalentemente operativa.

## 10. Integrazione con HIM

Il CCO non sostituisce il Human Interaction Model. Ne costituisce il contratto di comunicazione.

HIM governa task umani, stato visibile, recupero, accessibilità e azioni conseguenziali. CCO aggiunge il vincolo che tali proprietà siano comunicate in modo operativo e che i flussi multistadio siano rappresentati da vere transizioni di stato.

Il file macchina canonico è:

`.human/operational-communication.contract.json`

Il registro macchina delle superfici è:

`.human/operational-communication.surfaces.json`

Il validatore HIM controlla gli invarianti del contratto, le superfici pilota e lo stato di migrazione delle superfici registrate.

## 11. Registro delle superfici

Il CCO è strutturale solo se la sua applicazione è esplicita superficie per superficie. Il **Registro delle superfici** usa quattro stati:

- **conformant** — la superficie è conforme e il validatore trova le prove minime nel codice;
- **migration** — la superficie è nota ma deve ancora essere riallineata;
- **guided-setup** — configurazione iniziale intenzionalmente guidata;
- **excluded** — superficie non operativa esclusa con motivazione.

Stato corrente:

| Superficie | Stato CCO | Obiettivo |
|---|---|---|
| Home docente | **conformant** | Orientamento e accesso al lavoro pertinente. |
| Revisione personale — transizione | **conformant** | Revisione e condivisione sono due stadi realmente alternativi. |
| Revisione della singola scheda | **conformant** | Una scheda, un orientamento, una conseguenza; strumenti retrospettivi secondari. |
| Pubblicazione del contributo personale | **migration** | Stato di preparazione/condivisione e conseguenza leggibili immediatamente. |
| Lavoro del team | **migration** | Motivo, provenienza, stato del team e prossima azione leggibili senza studio preventivo. |
| Coordinamento del team | **migration** | Separare coda e azioni di coordinamento dalla formazione sul modello di governo. |
| Profilo di lavoro personale | **guided-setup** | Configurazione iniziale senza confondere preferenze, incarichi e autorità. |

Una superficie può passare da **migration** a **conformant** solo quando il registro viene aggiornato con prove verificabili e il gate HIM/CCO resta verde.

## 12. CCO-R1 — comunicazione operativa della revisione

CCO-R1 ha stabilito che stato e prossima azione precedono la formazione, i conteggi sono riferiti al contesto personale e il confine di autorità resta breve e contestuale.

Questi principi restano validi.

## 13. CCO-R2 — progressione reale della revisione

CCO-R2 corregge la prima interpretazione della progressione verticale. La revisione personale deve rispettare questi invarianti:

- non esistono più barre di avanzamento duplicate dentro la stessa vista;
- la singola scheda mostra direttamente confronto e scelta, senza un ulteriore percorso numerato interno;
- dopo la registrazione dell'orientamento la scheda diventa una sintesi compatta;
- se esistono altre schede aperte compare **Esamina la prossima scheda**;
- solo quando tutte le schede sono complete compare **Passa alla condivisione**;
- premendo **Passa alla condivisione** Arena cambia lo stadio attivo: la revisione viene sostituita dalla sintesi e dalla superficie di condivisione;
- la condivisione non è renderizzata sotto la revisione in attesa di uno scroll;
- **Rivedi le schede** contiene la navigazione retrospettiva e non interrompe il compito principale;
- **Proponi una modifica** apre una bozza; solo **Registra la modifica** rende completo quell'orientamento.

La conformità della Revisione personale dipende da questi invarianti e dal gate HIM/CCO.
