# Arena R7C7A — coda di risanamento della fonte d’istituto

Data: 2026-09-03  
Base logica: R7C6C `60225147d2a0c34ae05f005cde24fe6ac67f6a83`  
Fonte: `CURRICOLO VERTICALE .docx`  
SHA-256 fonte: `187bc12a771a29331c0d6638abe9e74788a2554af2735e3b9f43321d8f2ae57b`  
Stato: **BLOCKED — HUMAN REMEDIATION REQUIRED**

## Scopo

R7C7A trasforma i difetti sorgente già ricertificati dall’audit cell-aware v3 in una coda macchina di lavoro umano. Non corregge automaticamente il documento, non riscrive i 741 elementi ricostruiti e non promuove alcun contenuto.

La ricostruzione v3 aveva contato cinque blocker nelle 32 presentazioni curricolari. A questi vanno aggiunti i due difetti di razionale già ricertificati a livello di pagina. La coda operativa contiene pertanto **7 task**.

## Sette task

1. `CV-AUD-001-ITALIANO` — `I DISCORSI E LE PAROLE`, raccordo Italiano, pp. 22/41: mismatch fra competenze linguistiche e progressione obiettivi/conoscenze.
2. `CV-AUD-001-INGLESE` — stessa anomalia nella presentazione collegata a Lingua inglese, pp. 32/41.
3. `CV-AUD-002-MUSICA-RATIONALE` — il razionale di Musica riproduce Tecnologia, pp. 66/72.
4. `CV-AUD-003-MOTORIA-RATIONALE` — il razionale di Educazione motoria e fisica riproduce Arte e immagine, pp. 77/83.
5. `CV-AUD-004-LATINO-SCOPE` — conflitto fra avvio dal secondo anno/classi seconde-terze e tabella `CLASSE PRIMA`, pp. 4/27/28.
6. `CV-AUD-005-EDUCAZIONE-FISICA-HEADER` — intestazione strutturalmente incoerente della tabella secondaria, pp. 88/89.
7. `CV-AUD-006-CORPO-IDENTITY` — `IL CORPO IN MOVIMENTO` vs `IL CORPO E IL MOVIMENTO`, pp. 19/84.

## Politiche di risoluzione

Cinque task richiedono una **nuova versione corretta della fonte**: le due presentazioni di `I DISCORSI E LE PAROLE`, i due razionali duplicati e l’intestazione di Educazione fisica. La semplice presa visione non li risolve.

Il conflitto Latino/LEL può essere sbloccato soltanto da una decisione umana esplicita sull’ambito (`secondo anno e successivi` oppure `classe prima`) o da una nuova fonte corretta. `SCOPE_DEFERRED` mantiene il blocker.

L’incoerenza del campo motorio può essere sbloccata da una decisione umana esplicita di normalizzare all’identità canonica preservando comunque l’etichetta sorgente, oppure da una nuova fonte corretta. Mantenere l’etichetta distinta in attesa di riparazione non chiude il blocker.

## Ricevute

Ogni receipt è vincolata allo SHA-256 della fonte v3, al `taskId` e al `findingId`, richiede attestazione umana e data valida. Una correzione documentale richiede inoltre uno SHA-256 diverso della nuova versione e una nota di correzione.

Receipts diverse e incompatibili sullo stesso task producono conflitto e il task resta bloccato. I pacchetti di receipt sono esportabili e validabili, ma non contengono autorità implicita.

## Effetto sulla readiness

R7C7A corregge il conteggio operativo di `countInstituteSourceReviewBlockers()` da 5 a **7**, includendo i due difetti di razionale già presenti nell’audit. Questo non cambia il verdetto R7C6A, che resta `PREP_BLOCKED`; rende soltanto il blocker più completo e aderente all’evidenza.

Anche con 7/7 task risolti:

- `semanticReviewComplete = false`;
- nessuna autorità locale/nazionale viene promossa;
- nessuna adozione viene dichiarata;
- nessun modo di persistenza viene cambiato;
- la revisione semantica dei 741 elementi resta una fase separata.

## Confine di autorità

R7C7A non modifica runtime produttivo, P3, P7, curricolo adottato, dati legacy, UDA, fonte nazionale o stato `NATIONAL_PRESCRIPTIVE`.
