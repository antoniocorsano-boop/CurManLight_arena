# CurManLight Arena — Human Task Contract

Stato: IMPLEMENTATION BASELINE / SLICE H0  
Data: 2026-08-24

## Obiettivo

CurManLight Arena adotta il modello Human Task come **proiezione operativa sopra i domini canonici esistenti**, non come nuovo dominio parallelo e non come nuova fonte di verità.

La prima applicazione riguarda il percorso:

**Curricolo → proposta/revisione → decisione umana → documento**

La proiezione deve rendere immediatamente comprensibili:

- dove si trova il lavoro;
- quale risultato si sta cercando;
- quale azione primaria è disponibile;
- chi ne è responsabile;
- quali evidenze sostengono il compito;
- da quali fonti canoniche derivano le informazioni;
- quale passaggio viene dopo.

## Principio cognitivo

> **Contesto completo, esposizione minima.**

Il sistema conserva provenienza, stato, stakeholder e vincoli completi, ma la superficie primaria mostra soltanto ciò che serve per la decisione corrente. Dettagli tecnici, codici e tracciati restano disponibili in secondo livello.

Nessuno stakeholder deve ricostruire da codici interni, documenti lunghi o inferenze nascoste ciò che il sistema conosce già e che serve al compito.

## Stakeholder

Arena conserva i ruoli istituzionali già esistenti:

- docente;
- dipartimento;
- referente;
- collegio;
- dirigente;
- amministratore.

A questi si aggiunge lo stakeholder funzionale `sistema`, che rappresenta automazione e logica applicativa ma **non possiede autorità istituzionale**.

Il gate non impone che tutti i ruoli partecipino a ogni processo. Ogni proiezione dichiara esplicitamente gli stakeholder richiesti dal proprio contesto.

## Gate cognitivo

Una proiezione è `SATISFIED` soltanto quando, per ogni stakeholder richiesto:

1. esiste una responsabilità comprensibile;
2. esiste almeno un'evidenza verificabile;
3. ogni riferimento di evidenza appartiene realmente alla proiezione;
4. è mantenuta almeno una fonte canonica;
5. una decisione istituzionale non è attribuita al sistema;
6. una decisione istituzionale richiede conferma umana esplicita.

In caso contrario il gate restituisce `BLOCKED` e la proiezione non è promuovibile.

## Capability baseline

La prima slice riconosce queste capacità:

- `CURRICULUM_READ`;
- `CURRICULUM_PROPOSE`;
- `REVISION_REVIEW`;
- `REVISION_DECIDE`;
- `DOCUMENT_PREPARE`;
- `DOCUMENT_EXPORT`.

`REVISION_DECIDE` appartiene al perimetro delle decisioni istituzionali e non può essere eseguita dal sistema.

## Relazione con il Guided Teacher Workflow

Il contratto Human Task viene innestato nel `guided-workflow` esistente.

Non vengono introdotti:

- nuovi store Zustand;
- nuove tabelle Dexie;
- nuove route;
- duplicazioni di curricolo, revisione, decisioni o documenti;
- nuovi framework o gestori di stato.

Il Guided Workflow continua a mantenere riferimenti alle entità canoniche. La Human Task Projection aggiunge esclusivamente la lettura cognitiva necessaria alla persona nel punto corrente del processo.

## Regola di autorità

La proiezione Human Task:

- può leggere stato e fonti;
- può aggregare evidenze verificabili;
- può indicare la prossima azione;
- può evidenziare ciò che manca;
- può preparare una proposta.

Non può:

- sostituire il curricolo canonico;
- trasformare automaticamente una proposta in decisione;
- attribuire autorità istituzionale a un ruolo autodichiarato;
- approvare, adottare o deliberare al posto della persona competente.

## Persistenza e stack

H0 non modifica la persistenza. Arena conserva la baseline corrente:

**React + TypeScript + Vite + React Router + Zustand + Dexie + Tailwind + Vitest + Playwright + Storybook.**

L'introduzione successiva di autenticazione, workspace condiviso e RLS dovrà avvenire dietro adapter/repository senza rimuovere il comportamento local-first.

## Acceptance H0

La slice è accettata quando:

- il contratto è esportabile dal modulo `guided-workflow`;
- una proiezione completa produce `SATISFIED`;
- la mancanza di uno stakeholder richiesto produce `BLOCKED`;
- un riferimento a evidenza inesistente produce `BLOCKED`;
- l'assenza di fonti canoniche produce `BLOCKED`;
- il sistema non può assumere `REVISION_DECIDE`;
- `REVISION_DECIDE` senza conferma umana produce `BLOCKED`;
- nessuna baseline di routing, store o persistenza viene modificata.

## Passo successivo

Dopo H0, applicare il contratto a una sola superficie reale del percorso **Curricolo → Revisione**, mostrando nella UI:

- stato corrente;
- obiettivo umano;
- una sola azione primaria;
- evidenze necessarie;
- provenienza in secondo livello;
- prossimo passaggio.

Solo dopo il collaudo cognitivo della superficie reale si autorizza H1 su ruoli effettivi e repository condiviso.
