# Arena R7C7B — workbench di risanamento della fonte d’istituto

Data: 2026-09-03  
Base logica: R7C7A `422e088eb89adfcb40326a69a822ae4fa05af8ff`  
Stato: **HUMAN WORKBENCH AVAILABLE — SOURCE REMEDIATION STILL BLOCKED**

## Scopo

R7C7B porta nella vista canonica `Fonti` la coda di sette task definita da R7C7A. Il workbench permette di registrare decisioni umane e ricevute sorgente senza modificare il DOCX originario, senza migrazione automatica e senza promozione di autorità.

## Nuova versione corretta

Per i cinque task che richiedono una correzione documentale, l’utente può selezionare localmente un nuovo `.docx`. Arena legge i byte soltanto nel browser e calcola SHA-256 con Web Crypto. Il file non viene inviato a server.

Se lo SHA-256 coincide con la fonte v3 già auditata, la correzione è rifiutata. Se è diverso, il file diventa soltanto una **versione candidata**. Ogni singolo task resta aperto finché l’utente non registra esplicitamente una nota e conferma di avere verificato quella correzione nella nuova versione.

`Segna preso in carico` produce una receipt non risolutiva.

## Decisioni umane

Il task Latino/LEL consente tre esiti: rinvio, applicazione dal secondo anno e successivi, applicazione alla classe prima. Solo le due decisioni esplicite sbloccano il task; il rinvio resta bloccante.

L’incoerenza `IL CORPO IN MOVIMENTO` / `IL CORPO E IL MOVIMENTO` consente di mantenere distinta l’etichetta in attesa di correzione oppure di normalizzare all’identità canonica conservando l’etichetta sorgente. Solo la seconda decisione chiude il task.

## Continuità delle ricevute

Le ricevute sono persistite in `localStorage` con una chiave vincolata allo SHA-256 della fonte v3. Sono esportabili in JSON e reimportabili soltanto se il pacchetto appartiene alla stessa fonte e supera la validazione R7C7A. Pacchetti con receipts incompatibili sullo stesso task sono bloccati.

L’utente può azzerare le ricevute locali; in quel caso i blocker tornano aperti.

## Confine di autorità

Il workbench non modifica:

- il DOCX originario;
- il curricolo adottato;
- l’autorità locale o nazionale;
- P3/P7;
- il modo di persistenza;
- il runtime curricolare;
- lo stato della revisione semantica.

Anche 7/7 task risolti significano soltanto **source remediation complete**. La revisione semantica dei 741 elementi e il confronto con gli elementi nazionali verificati restano passaggi distinti.
