# G5-UX-CURRICULUM-001 — Superficie Curricolo sovraccarica

**Data:** 2026-09-10  
**Release osservata:** `5ca205d3b6df323be59492c02a8dd70b7edb57e1`  
**Canale:** dispositivo mobile reale  
**Stato:** OPEN — remediation required

## Evidenza umana

Durante il riesame mobile della Beta pubblica, la superficie **Riesame** è stata giudicata migliorata, mentre la superficie **Curricolo** è risultata eccessivamente lunga, tecnica e cognitivamente onerosa.

La pagina primaria combina nello stesso flusso:

- orientamento sul curricolo 3–14;
- scelta dell'annualità di Tecnologia;
- stato istituzionale del curricolo;
- accesso alla fonte curricolare;
- verifica dell'identità del PDF e SHA-256;
- esportazione/importazione delle impronte e dei pacchetti;
- verifica puntuale di 868 elementi della pubblicazione finale MIM;
- archivio locale precedente.

## Diagnosi

La criticità è di **architettura dell'informazione**, non di mera veste grafica. La consultazione curricolare ordinaria e gli strumenti di assurance documentale sono presentati come parti dello stesso compito docente.

Questo viola il principio CCO di divulgazione progressiva: le operazioni tecniche devono essere disponibili senza diventare prerequisito cognitivo per consultare il curricolo.

## Regola di remediation

La superficie primaria `Curricolo` deve rispondere soltanto a quattro domande:

1. Quale curricolo sto consultando?
2. Qual è il suo stato in parole comuni?
3. Qual è il mio ambito/classe di lavoro?
4. Qual è la prossima azione utile?

Le verifiche di fonte devono essere secondarie. SHA-256, import/export, registro completo e dettagli tecnici devono essere caricati solo dopo una scelta intenzionale ulteriore.

## Invarianti

La remediation non modifica:

- contenuti del curricolo;
- fonte MIM o master d'Istituto;
- stato di validazione o vigenza;
- registri di verifica;
- confini H2/H3/H4;
- autorità istituzionale;
- persistenza o contratti di import/export.

## Acceptance target

Su mobile, entrando in `Curricolo`, l'utente deve poter comprendere contesto, stato e azione primaria senza incontrare lessico tecnico come `H2`, `master canonico`, `SHA-256`, `slot strutturali` o controlli di import/export. Gli strumenti avanzati restano raggiungibili tramite almeno due gesti intenzionali di divulgazione progressiva.
