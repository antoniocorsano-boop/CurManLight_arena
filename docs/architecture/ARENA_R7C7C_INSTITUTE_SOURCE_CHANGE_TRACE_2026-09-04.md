# Arena R7C7C — traccia leggibile delle modifiche alla fonte d’istituto

Data: 2026-09-04  
Base logica: R7C7B `9d0201ae3d015a9fa5ba401e667466c1f529b0ab`  
Stato: **CHANGE TRACE AVAILABLE — NO AUTHORITY PROMOTION**

## Scopo

R7C7C rende leggibile il percorso già governato da R7C7B senza creare un nuovo processo, una seconda persistenza o una nuova autorità. La vista deriva esclusivamente dalle receipt umane legate alla fonte d’istituto auditata.

Per ciascuno dei sette finding, Arena espone:

`problema → decisione umana → eventuale nuova fonte → stato → effetto di autorità`

## Stati della traccia

- `OPEN`: nessuna receipt umana valida per il task;
- `ACKNOWLEDGED`: esiste una presa in carico valida ma non risolutiva;
- `RESOLVED`: esiste una receipt valida che soddisfa la policy di risoluzione del task;
- `CONFLICT`: esistono receipt valide ma incompatibili per lo stesso task; il finding resta non risolto.

Il conflitto non può essere nascosto scegliendo semplicemente la receipt più recente.

## Fonte e provenienza

La traccia conserva il riferimento alla fonte auditata R7C7B. Quando una correzione documentale è verificata, espone lo SHA-256 della nuova versione candidata e la nota umana associata.

La traccia non conserva i byte del DOCX e non modifica il documento.

## Confine di autorità

Ogni entry espone semanticamente `authorityEffect: NONE`.

R7C7C non autorizza:

- adozione o approvazione istituzionale;
- promozione automatica del curricolo;
- chiusura della revisione semantica;
- modifica dell’autorità nazionale o locale;
- mutazione automatica di P3/P7;
- trasformazione di una receipt in deliberazione collegiale.

## Interazione

La vista `Fonti` presenta la traccia come divulgazione progressiva. Rilegge le receipt locali:

- all’apertura del componente;
- al ritorno del focus della finestra;
- quando un’altra scheda modifica la stessa chiave `storage`;
- tramite il gesto esplicito `Aggiorna traccia`.

Non viene introdotto polling.

## Criterio di valore

Arena deve poter rispondere, senza ricostruzione manuale della conversazione o dei documenti, alla domanda:

> Che cosa era problematico, quale decisione umana è stata registrata, quale fonte la documenta e quale stato ha oggi?

La risposta resta documentale e tracciabile, non autoritativa.