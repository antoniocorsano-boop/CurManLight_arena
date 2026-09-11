# Arena — Team Meeting Workspace

## Principio di prodotto
**I documenti sono il fascicolo. Arena è il luogo del lavoro.**

Dopo la preparazione individuale introdotta da PR #197, Arena deve togliere alla riunione la rilettura dei punti già condivisi e concentrare il tempo sui soli elementi che richiedono confronto.

## Separazioni di autorità
Il nuovo incremento mantiene esplicitamente:

`contributo individuale != esito del team != decisione istituzionale != curricolo vigente`

- il contributo individuale è autenticato e modificabile dal suo autore;
- l'esito del team è una ricevuta di lavoro condiviso, registrabile da membership `dipartimento` o `referente`;
- l'esito del team non produce approvazione istituzionale;
- l'adozione canonica resta sul percorso istituzionale già esistente.

## Sintesi automatica
Per ogni scheda, i contributi correnti vengono classificati in:

1. `shared` — orientamenti correnti concordi, senza modifica testuale e con copertura completa dei contributori attivi attesi nel workspace;
2. `change-proposed` — stessa modifica testuale proposta dai contributori correnti;
3. `divergent` — orientamenti diversi o formulazioni alternative incompatibili;
4. `needs-clarification` — nessun contributo corrente, contributi riferiti a una versione superata oppure copertura incompleta per una conferma/mantenimento che altrimenti apparirebbe condiviso.

La sintesi non deduce consenso da un solo stato locale. Un singolo contributo o una copertura parziale non possono diventare `shared`: il server espone soltanto il numero dei contributori attivi attesi, senza rivelarne le identità.

## Persistenza condivisa
Nuove entità Supabase:

- `team_review_contributions` — un contributo corrente per utente/scheda/workspace;
- `team_review_outcomes` — ricevute append-only degli esiti del team.

Le scritture client dirette restano chiuse. I contributi e gli esiti sono registrati tramite RPC autenticata con verifica server della membership attiva.

## Validità del test reale e persistenza browser
Il test umano non è valido se Arena sta usando il fallback in memoria volatile.

La diagnostica distingue tre condizioni:

- `indexeddb-persistent` — IndexedDB supera una vera prova di scrittura/lettura/cancellazione e il browser concede anche la protezione anti-eviction;
- `indexeddb-best-effort` — IndexedDB supera la stessa prova ma il browser non concede la protezione anti-eviction: è storage locale operativo e non equivale a memoria temporanea;
- `volatile-memory` — IndexedDB non supera la prova oppure una successiva operazione Dexie fallisce e lo store passa alla RAM.

Qualunque fallback Dexie successivo all'avvio emette `arena:storage-volatile`, marca la sessione come volatile e rende visibile un avviso bloccante: finché l'avviso è presente non si deve considerare valido il test reale.

## Superficie utente
`TeamReviewWorkspace` mostra:

- punti già condivisi — compressi, senza rilettura obbligatoria;
- modifiche proposte;
- opinioni diverse;
- punti da chiarire;
- una coda `Da discutere` che esclude gli elementi già risolti dal team;
- azioni del team: `Accogli proposta`, `Mantieni testo precedente`, `Definisci testo condiviso`, `Rinvia`.

La preparazione locale non viene sincronizzata automaticamente: il docente usa esplicitamente `Condividi il mio lavoro con il team`.

## Base e ramo

- base: `feature/team-review-workspace@239f7f7e3d3d513ffe7eedf88aeb7b4c627e4742` (PR #197)
- incremento: `feature/team-meeting-workspace`

## Gate di accettazione
La slice è accettabile solo se:

- i punti concordi non vengono confusi con approvazioni;
- una copertura parziale non viene confusa con consenso del team;
- formulazioni diverse non vengono classificate come consenso;
- contributi su versioni superate non vengono usati come consenso corrente;
- solo membership autenticate possono condividere contributi;
- solo `dipartimento`/`referente` possono registrare l'esito del team;
- nessun esito del team produce adozione canonica automatica;
- IndexedDB supera la verifica reale di scrittura/lettura oppure Arena blocca esplicitamente la validità del test dichiarando il fallback volatile;
- build, test di dominio e percorsi browser esistenti restano verdi.
