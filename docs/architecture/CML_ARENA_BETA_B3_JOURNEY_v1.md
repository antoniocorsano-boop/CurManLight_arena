# CurManLight Arena Beta — B3 bounded revision journey v1

Stato: **IN_PROGRESS**  
Base canonica di partenza: `32a59fe3369ca5788fd04dcfd8ac0ca3e01383bd`

## Percorso implementato

La tranche collega senza sovrapporli i tre livelli già presenti nel prodotto:

1. **scelta locale di confronto** — resta personale/non autoritativa;
2. **proposta strutturata** — conserva testo di partenza, testo proposto, motivazione e provenienza locale dichiarata;
3. **decisione istituzionale Beta** — compare soltanto dopo `accepted-for-decision` e usa sessione Supabase + membership server-backed + `REVISION_DECIDE`.

Il percorso applicativo `/revisione` è ora distinto da `/curriculum` tramite un unico mapping tipizzato condiviso fra applicazione e test.

## Confine conseguenziale

Una decisione istituzionale:

- è legata alla versione immutabile della proposta mediante SHA-256;
- richiede anteprima e conferma umana esplicita;
- viene registrata tramite la RPC server-authoritative già introdotta nella tranche precedente;
- non usa il ruolo locale autodichiarato come autorizzazione;
- non crea fallback locale in caso di rifiuto server;
- non modifica automaticamente il curricolo;
- non equivale a firma digitale, protocollazione o deliberazione formalmente attestata.

## Rientro e coerenza

Quando una proposta viene riaperta, il client rilegge dal workspace l'eventuale ricevuta istituzionale relativa alla versione. L'impronta registrata viene confrontata con quella della versione correntemente mostrata: una mancata corrispondenza viene esposta come stato non valido per quel contenuto.

## Evidenza browser prevista nella PR

Il gate `Beta E2E Workflow` esegue su build Beta reale il percorso:

`/revisione → scelta locale → proposta strutturata → prepara → invia → prendi in carico → ammetti alla decisione → blocco per identità assente → refresh/re-entry`

Il browser viene avviato con profilo pulito. Il test deve verificare anche che, nello stato bloccato, il numero di chiamate alla RPC `record_institutional_revision_decision` resti **zero**.

## Non-claim

Questa tranche non dichiara ancora `BETA_E2E_WORKFLOW_PASS` complessivo. Il backend Beta canonico non dispone attualmente di una membership `collegio` attiva da usare come autorità di prova; non ne viene creata o riattivata una artificialmente per far passare il gate. Restano quindi da certificare il percorso autorizzato reale, gli esiti conseguenti e il successivo handoff della baseline.
