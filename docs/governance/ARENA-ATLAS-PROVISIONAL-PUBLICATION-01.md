# ARENA-ATLAS-PROVISIONAL-PUBLICATION-01

**Stato:** vincolante  
**Ambito:** esportazione del curricolo Arena verso Atlas

## Regola

Arena può propagare ad Atlas una versione completa del curricolo anche quando lo stato di autorità è `PROVISIONAL_COMPLETE`.

In tale stato:

- Atlas può renderla visibile pubblicamente;
- la versione deve essere etichettata come **«Curriculum provvisorio — non vigente»**;
- deve essere esplicitato che **l’approvazione del Collegio dei docenti è in attesa**;
- `authorityReceiptRef` deve restare assente;
- la visibilità non attribuisce vigenza né approvazione;
- Arena resta l’unica autorità dello stato editoriale.

Quando il Collegio dei docenti approva il curricolo, Arena può emettere `authorityState = APPROVED` solo insieme a una prova di autorità valida e a un digest SHA-256 del payload. Solo allora Atlas può qualificare la stessa versione come approvata/vigente.

## Vincoli di propagazione

- Lo stato di autorità deve viaggiare sempre insieme al contenuto.
- Un aggiornamento di contenuto senza stato di autorità coerente è invalido.
- Atlas non può promuovere autonomamente una versione provvisoria.
- La perdita dell’indicazione di provvisorietà è un errore bloccante.
- Il passaggio da provvisorio ad approvato deve avvenire tramite la normale sincronizzazione Arena → Atlas, senza ricopia manuale.
