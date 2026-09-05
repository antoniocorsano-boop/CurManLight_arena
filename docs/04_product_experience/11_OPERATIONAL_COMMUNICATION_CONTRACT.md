# CCO — Contratto di comunicazione operativa di Arena

**Versione:** 1.0.0  
**Stato:** normativo per le nuove superfici e per le superfici migrate  
**Integrazione:** Human Interaction Model (HIM)

## 1. Scopo

Arena deve permettere all'utente di agire con fiducia senza obbligarlo a studiare ogni schermata prima di usarla. La formazione resta necessaria, ma non deve essere la condizione per comprendere l'azione quotidiana.

Il CCO stabilisce quindi una separazione strutturale tra:

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

Serve soltanto quando esiste un rischio concreto di fraintendimento, in particolare per:

- effetti condivisi;
- confini di autorità;
- azioni conseguenziali.

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

## 4. Grammatica delle azioni

Arena usa una grammatica stabile. I verbi non sono sinonimi intercambiabili.

| Azione | Significato canonico |
|---|---|
| **Esamina** | Leggi e valuta una scheda. |
| **Conferma** | Esprimi accordo con una proposta nel tuo contesto. |
| **Proponi una modifica** | Introduci una formulazione alternativa. |
| **Condividi** | Rendi visibile al team un contributo personale. |
| **Registra l'esito** | Documenti un esito già maturato nel gruppo autorizzato. |

**Approva** e **Adotta** sono verbi riservati a contesti in cui l'autorità corrispondente è realmente verificata. Non devono essere usati come sinonimi di conferma, condivisione o registrazione.

## 5. Confini di autorità che la comunicazione deve preservare

La struttura e le parole non devono mai suggerire equivalenze false:

- profilo personale ≠ ruolo verificato;
- membership ≠ autorità;
- contributo individuale ≠ esito del team;
- esito del team ≠ decisione istituzionale;
- decisione istituzionale ≠ curricolo adottato finché il relativo passaggio non è registrato.

## 6. Criterio di fiducia

La fiducia non deriva dalla quantità di testo, ma dalla prevedibilità del sistema:

- lo stesso verbo produce lo stesso tipo di effetto;
- lo stato è visibile prima dell'azione;
- gli effetti condivisi sono dichiarati;
- gli errori sono recuperabili;
- la provenienza è consultabile;
- le azioni conseguenziali producono una ricevuta quando previsto;
- l'autorità non è suggerita dall'aspetto grafico se non è verificata.

## 7. Test di accettazione per ogni vista

Una vista conforme deve superare queste domande:

1. L'utente capisce entro circa **5 secondi** dove si trova?
2. Vede immediatamente lo stato del proprio lavoro?
3. Esiste una sola azione primaria per il compito corrente, salvo necessità motivate?
4. L'etichetta dell'azione descrive davvero ciò che farà?
5. La conseguenza o il confine più importante è espresso in modo breve e contestuale?
6. Rimuovendo il testo formativo, il flusso resta comunque comprensibile e utilizzabile?
7. La spiegazione completa resta facilmente raggiungibile?

La domanda 6 è il controllo discriminante: se la superficie smette di essere usabile senza i paragrafi formativi, la comunicazione operativa non è ancora matura.

## 8. Formazione come esperienza separata

La formazione può essere proposta:

- alla prima visita di un'area;
- su richiesta tramite **Come funziona questa area**;
- nella guida generale di Arena;
- in percorsi specifici per docente, coordinatore, referente e altri incarichi verificati.

Dopo la prima comprensione, la superficie ordinaria deve tornare prevalentemente operativa.

## 9. Integrazione con HIM

Il CCO non sostituisce il Human Interaction Model. Ne costituisce il contratto di comunicazione.

HIM governa task umani, stato visibile, recupero, accessibilità e azioni conseguenziali. CCO aggiunge il vincolo che tali proprietà siano **comunicate in modo operativo**, senza dipendere da testo formativo persistente.

Il file macchina canonico è:

`.human/operational-communication.contract.json`

Il validatore HIM controlla la presenza e gli invarianti essenziali del contratto e verifica le superfici pilota dichiarate.

## 10. Prima superficie pilota

La Home docente è la prima superficie sottoposta al CCO. Deve conservare almeno:

- contesto riconoscibile: **Il tuo spazio nel curricolo**;
- stato operativo: **Da fare**;
- azioni identificabili come azioni di lavoro;
- approfondimento separato mediante divulgazione progressiva.

Le altre superfici vengono migrate progressivamente; ogni nuova superficie operativa deve essere progettata direttamente secondo il CCO.
