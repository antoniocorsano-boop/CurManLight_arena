# REG-CURR-00 — Registro maestro del fascicolo curricolare e dell’allineamento Arena

**Versione:** 1.3 — 6 settembre 2026  
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
| Correzioni della fonte originaria | recepite nella fonte corrente |
| Audit istruttorio pilota Tecnologia | completato con correzioni mirate |
| Validazione professionale | `OPEN` |
| Revisione verticale finale | `OPEN` |
| Pronto per il Collegio | `NOT_YET` |
| Approvazione collegiale | `NOT_YET` |
| Promozione canonica | `NOT_AUTHORIZED` |

La prossima fase autorizzata è la **validazione professionale reale dei contenuti**.

## Baseline Arena

Per il lavoro corrente si assume:

- PR **#198**;
- branch `feature/team-meeting-workspace`;
- product head funzionale `77a464e0619907bcd6aabac948eb299a3c8d8f0a`;
- CCO `1.3.0`;
- registro superfici CCO `1.4.1`.

Il product head include la fonte corretta in `Fonti` e il primo pacchetto reale di revisione professionale in `Revisione`.

## Pilota attivo — Tecnologia classe prima

**Pilot ID:** `TEC-SEC1-2026-01`  
**Stato:** `READY_FOR_HUMAN_DISCIPLINE_REVIEW`  
**Esito umano:** `OPEN`  
**Promozione canonica:** `NOT_AUTHORIZED`

Il pilota sostituisce, esclusivamente nel contesto **Tecnologia / scuola secondaria di primo grado**, le vecchie proposte dimostrative con cinque decisioni provenienti dal fascicolo reale:

1. osservare, misurare e rappresentare;
2. progettare con problema e vincoli;
3. realizzare, verificare e considerare il ciclo di vita;
4. dati, procedure e sistemi digitali;
5. raccordo classe I → classi II–III nel regime transitorio.

Catena documentale esatta:

- fonte: `CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx` — `1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf`;
- proposta: `PROP-CURR-SEC1-TEC-1_Tecnologia_classe_prima_revisione_curricolare_da_validare_2026-2027.docx` — `19nPCsAj_ItBscUwwcHwrVhxDbBy-MXIJ`;
- matrice verticale: `MATR-CURR-TEC-T01_Raccordo_transitorio_Tecnologia_2026-2027.docx` — `1CMSESN73HCi_2jM_tZYhN9hd6oWzyHgK`;
- gate: `VAL-CURR-SEC1-01_Scheda_validazione_Dipartimenti_Secondaria_Classe_Prima_2026-2027` — `1rxKy2IDD5V7l4Nc1LfJeLr407ltfa_vbt_EFK54s7mU`;
- registro decisioni: `DEC-CURR-SEC1-00_Registro_decisioni_validazione_Secondaria_Classe_Prima_2026-2027` — `1KmnrgWrNxVDUjOvdPo0oibqTvr1lQ72QepBE8KNsdZA`;
- manifesto operativo: `WORK-CURR-TEC-01_Pacchetto_operativo_Arena_Tecnologia_classe_prima_2026-2027` — `1s2qZf53O6BqjgyrtzcXuL5lSdafoAmtAUEFv-4mwcog`.

Il contratto applicativo è `src/domain/curriculum/validation/technologyClass1Review.ts`.

## Audit istruttorio del pilota Tecnologia

**Audit ID:** `AUD-CURR-TEC-SEC1-01`  
**Documento Drive:** `AUD-CURR-TEC-SEC1-01_Audit_cinque_schede_Tecnologia_classe_prima_2026-2027`  
**Drive file ID:** `1SZ_lmaYXNF2Fx8ro1C-hTh5iUH-riECcqyZtRx9JRPM`  
**Stato audit:** completato  
**Esito istruttorio:** pronto al riesame professionale con correzioni mirate  
**Esito umano:** `OPEN`  
**Promozione canonica:** `NOT_AUTHORIZED`

Esito per scheda:

- N1 — confermabile con micro-correzione istruttoria;
- N2 — confermabile;
- N3 — confermabile con qualificazione di provenienza;
- N4 — da modificare prima della conferma professionale;
- raccordo I → II–III — impianto confermabile, gate ancora aperto.

Le correzioni istruttorie trasversali sono quattro:

1. rappresentare la struttura nazionale come **tre nuclei fondanti di Tecnologia integrati con Informatica**, senza presentare N4 come quarto nucleo nazionale autonomo;
2. qualificare le formulazioni della classe prima come **obiettivi annuali/progressione annuale d’Istituto**, distinguendole dagli Obiettivi specifici di apprendimento nazionali;
3. riscalare N4 verso comprensione funzionale di sistemi informatici, dati, processi, Internet e attendibilità delle informazioni;
4. mantenere provenienza granulare degli elementi d’Istituto, trasversali e transitori.

L’audit è un controllo istruttorio: **non registra né simula una decisione professionale umana**.

## Regola di interazione corrente

Il principio operativo è **riconoscimento prima dell’interpretazione**. La modalità lavoro privilegia un solo oggetto dominante, confronto visivo, azioni adiacenti e provenienza sotto disclosure. Una modifica è completa soltanto dopo `Registra modifica`.

Nel pilota Tecnologia le etichette sono contestuali: `Fonte corrente` / `Proposta da validare`; il raccordo usa `Stato corrente` / `Raccordo da validare`. L’azione di mantenimento dichiara esattamente cosa viene conservato.

## Catena di autorità

`fonte normativa ≠ elaborazione d’Istituto ≠ proposta professionale ≠ contributo individuale ≠ esito professionale del gruppo ≠ decisione istituzionale ≠ curricolo vigente`

La compilazione del pilota produce soltanto un contributo personale. Il gate professionale resta aperto finché non esiste un esito umano reale del gruppo competente.

## PR successive

Le PR **#199–#201** e **#202–#207** restano Draft e non canoniche finché non vengono riallineate sulla baseline corrente e nuovamente validate.

## Documenti Drive collegati

- `CAN-CURR-00_Quadro_istituzionale_e_normativo_Curricolo_Verticale_2026-2027`;
- `CAN-CURR-01_Identita_pedagogica_e_architettura_Curricolo_Verticale_3-14`;
- `CAN-GOV-CURR-00_Regole_canoniche_governo_revisione_validazione_CurManLight_Arena`;
- `VAL-CURR-00_Indice_unico_gate_validazione_2026-2027`;
- `CAN-AUDIT-CURR-03_Audit_integrato_pre-validazione_2026-2027`;
- `ARENA-UX-01_Dal_documento_al_lavoro_dei_team_2026-2027`;
- `WORK-CURR-TEC-01_Pacchetto_operativo_Arena_Tecnologia_classe_prima_2026-2027`;
- `AUD-CURR-TEC-SEC1-01_Audit_cinque_schede_Tecnologia_classe_prima_2026-2027`.

## Materiali formativi

La presentazione docenti del 4 settembre resta da aggiornare prima dell’uso operativo perché precede CCO 1.3. Il documento stakeholder resta valido nei principi generali ma va verificato contro REG-CURR-00 prima di ogni uso istituzionale.

## Criterio di allineamento

Drive, repository, logiche e documenti sono allineati soltanto se indicano la stessa fonte, lo stesso stato dei gate, la stessa baseline, gli stessi confini di autorità e — quando un pilota è attivo — le stesse identità Drive di fonte, proposta, matrice, gate, registro decisioni e audit istruttorio.
