# REG-CURR-00 — Registro maestro del fascicolo curricolare e dell’allineamento Arena

**Versione:** 1.4 — 6 settembre 2026  
**Ambito:** Curricolo verticale d’Istituto — A.S. 2026/2027

## Funzione

Questo documento è il mirror repository del registro Drive `REG-CURR-00_Registro_maestro_fascicolo_curricolare_e_allineamento_Arena_2026-2027` (`1IMKwWWukefIDIOsbHQByiXLN7YuU7He0V5b01tjitG4`). Mantiene allineati fascicolo Drive, fonte curricolare corrente, logiche e contratti di Arena e documentazione operativa.

Il registro macchina associato è `docs/curriculum/REG-CURR-00.registry.json`.

## Fonte curricolare corrente

La base istruttoria corrente è:

- `CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx`;
- Drive file ID `1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf`;
- SHA-256 `c89fbbbe43432db8410913675381b7dc3654d2448f9f91a8c72b115b9ec6fc55`;
- stato: **proposta d’Istituto da validare**.

La precedente `source reconstruction v3` resta storico tecnico. La distinzione corrente resta:

**correzioni documentali recepite ≠ validazione professionale completata ≠ approvazione collegiale ≠ curricolo vigente**.

## Stato del processo

| Ambito | Stato corrente |
|---|---|
| Copertura istruttoria 3–14 | `PASS_ISTRUTTORIO` |
| Audit istruttorio Tecnologia | correzioni recepite nella R2 |
| Validazione professionale | `OPEN` |
| Revisione verticale finale | `OPEN` |
| Pronto per il Collegio | `NOT_YET` |
| Approvazione collegiale | `NOT_YET` |
| Promozione canonica | `NOT_AUTHORIZED` |

La prossima fase autorizzata è la **nuova validazione professionale dei contenuti R2**.

## Baseline Arena

Per il lavoro corrente si assume:

- PR **#198**;
- branch `feature/team-meeting-workspace`;
- product head funzionale R2 `2317b57fef35695f0c8373208d5b5f4898671478`;
- CCO `1.3.0`;
- registro superfici CCO `1.4.1`.

Il product head R2 modifica il contenuto operativo di Tecnologia senza cambiare il confine di autorità della Revisione.

## Pilota attivo — Tecnologia classe prima — Revisione R2

**Pilot ID:** `TEC-SEC1-2026-01`  
**Revisione attiva:** `R2`  
**Stato:** `READY_FOR_HUMAN_DISCIPLINE_REVIEW`  
**Esito umano:** `OPEN`  
**Carry-forward delle decisioni R1:** `NOT_AUTHORIZED`  
**Promozione canonica:** `NOT_AUTHORIZED`

La R2 espone cinque nuove identità di proposta:

1. `tec-sec1-2026-r2-n1` — osservare, misurare e rappresentare;
2. `tec-sec1-2026-r2-n2` — progettare con problema e vincoli;
3. `tec-sec1-2026-r2-n3` — realizzare, verificare e considerare il ciclo di vita;
4. `tec-sec1-2026-r2-n4` — Informatica integrata: sistemi, dati e processi;
5. `tec-sec1-2026-r2-verticalita` — raccordo classe I → classi II–III.

Le identità R1 `tec-sec1-2026-n1`, `tec-sec1-2026-n2`, `tec-sec1-2026-n3`, `tec-sec1-2026-n4`, `tec-sec1-2026-verticalita` restano conservate nel dominio applicativo come **storico semantico**. Le decisioni R1 già registrate non vengono cancellate, ma **non sono trasferite automaticamente alla R2**. La modifica del testo richiede una nuova identità di proposta e una nuova scelta professionale esplicita.

## Correzioni recepite nella R2

L’audit `AUD-CURR-TEC-SEC1-01` (`1SZ_lmaYXNF2Fx8ro1C-hTh5iUH-riECcqyZtRx9JRPM`) è stato applicato senza chiudere alcun gate umano:

- la struttura è rappresentata come **tre nuclei fondanti di Tecnologia integrati con un asse d’Istituto di Informatica e sistemi digitali**, non come quattro nuclei nazionali;
- le formulazioni della classe prima sono qualificate come **obiettivi annuali d’Istituto**;
- N1 resta centrato su osservazione, misura e rappresentazione;
- N3 distingue il raccordo d’Istituto relativo a economia circolare e sostenibilità;
- N4 passa dalla semplice alfabetizzazione applicativa alla comprensione di **sistemi informatici, componenti fisiche e software, dati, processi, organizzazione dei file, Internet, Web e servizi, algoritmi, protezione dei dati e attendibilità delle informazioni**;
- il raccordo digitale I→II→III è reso progressivo e mantiene esplicito il regime transitorio delle classi seconda e terza.

## Catena documentale esatta

- fonte: `CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx` — `1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf`;
- proposta R2, revisione documentale 1.1 nello stesso file Drive: `PROP-CURR-SEC1-TEC-1_Tecnologia_classe_prima_revisione_curricolare_da_validare_2026-2027.docx` — `19nPCsAj_ItBscUwwcHwrVhxDbBy-MXIJ`;
- matrice transitoria R2, revisione documentale 1.1 nello stesso file Drive: `MATR-CURR-TEC-T01_Raccordo_transitorio_Tecnologia_2026-2027.docx` — `1CMSESN73HCi_2jM_tZYhN9hd6oWzyHgK`;
- gate: `VAL-CURR-SEC1-01_Scheda_validazione_Dipartimenti_Secondaria_Classe_Prima_2026-2027` — `1rxKy2IDD5V7l4Nc1LfJeLr407ltfa_vbt_EFK54s7mU`;
- registro decisioni: `DEC-CURR-SEC1-00_Registro_decisioni_validazione_Secondaria_Classe_Prima_2026-2027` — `1KmnrgWrNxVDUjOvdPo0oibqTvr1lQ72QepBE8KNsdZA`;
- manifesto operativo, revisione 1.1: `WORK-CURR-TEC-01_Pacchetto_operativo_Arena_Tecnologia_classe_prima_2026-2027` — `1s2qZf53O6BqjgyrtzcXuL5lSdafoAmtAUEFv-4mwcog`;
- audit: `AUD-CURR-TEC-SEC1-01_Audit_cinque_schede_Tecnologia_classe_prima_2026-2027` — `1SZ_lmaYXNF2Fx8ro1C-hTh5iUH-riECcqyZtRx9JRPM`.

Il contratto applicativo è `src/domain/curriculum/validation/technologyClass1Review.ts`.

## Regola di identità e decisione

`testo proposta R1 ≠ testo proposta R2`

Di conseguenza:

`decisione R1 ≠ decisione R2`

anche quando una formulazione sia rimasta sostanzialmente invariata. Questo evita che una scelta precedente venga reinterpretata come approvazione di un testo successivamente corretto.

## Regola di interazione corrente

Il principio operativo resta **riconoscimento prima dell’interpretazione**. La modalità lavoro privilegia un solo oggetto dominante, confronto visivo, azioni adiacenti e provenienza sotto disclosure. Una modifica è completa soltanto dopo `Registra modifica`.

## Catena di autorità

`fonte normativa ≠ elaborazione d’Istituto ≠ proposta professionale ≠ contributo individuale ≠ esito professionale del gruppo ≠ decisione istituzionale ≠ curricolo vigente`

La compilazione della R2 produce soltanto un nuovo contributo personale. Il gate professionale resta aperto finché non esiste un esito umano reale del gruppo competente.

## PR successive

Le PR **#199–#201** e **#202–#207** restano Draft e non canoniche finché non vengono riallineate sulla baseline corrente e nuovamente validate.

## Criterio di allineamento

Drive, repository, logiche e documenti sono allineati soltanto se indicano la stessa fonte, la stessa revisione attiva del pilot, gli stessi ID delle proposte attive e storiche, lo stesso stato dei gate, la stessa baseline e gli stessi confini di autorità. In particolare, nessuna decisione R1 può diventare una decisione R2 senza un nuovo atto professionale esplicito.
