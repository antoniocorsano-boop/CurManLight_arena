# Docente OS feedback → Revision Proposal authoring bridge v1

## Scopo

Collegare una richiesta `AWAITING_HUMAN_PROPOSAL_AUTHORING` al dominio Revision già canonico di Arena senza consentire la nascita automatica di una proposta.

## Sequenza

`AWAITING_HUMAN_PROPOSAL_AUTHORING` → compilazione umana di testo vigente, testo proposto e motivazione → `AWAITING_HUMAN_CONFIRMATION` → conferma esplicita → `RevisionProposal` in stato `draft`.

## Invarianti

- nessuna proposta viene creata durante la preparazione della preview;
- `automaticCreationAllowed=false`;
- senza `humanConfirmed=true` il bridge fallisce chiuso;
- la proposta creata resta `draft`;
- nessuna decisione istituzionale viene creata;
- evidenze e provenienza del feedback vengono mantenute nella proposta;
- il passaggio successivo a review/submission continua a usare il workflow Revision esistente e i suoi gate.

## Fuori perimetro

- UI finale di authoring;
- trasporto runtime Docente OS → Arena;
- persistenza condivisa;
- auto-submit della proposta;
- ammissione automatica alla decisione;
- modifica automatica della baseline curricolare.
