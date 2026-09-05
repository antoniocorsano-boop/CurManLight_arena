# REG-CURR-00 — Registro maestro del fascicolo curricolare e dell’allineamento Arena

**Versione:** 1.1 — 5 settembre 2026  
**Ambito:** Curricolo verticale d’Istituto — A.S. 2026/2027

## Funzione

Questo documento è il mirror repository del registro Drive `REG-CURR-00_Registro_maestro_fascicolo_curricolare_e_allineamento_Arena_2026-2027` (`1IMKwWWukefIDIOsbHQByiXLN7YuU7He0V5b01tjitG4`).

Serve a impedire che quattro livelli divergano:

1. **fascicolo Drive**;
2. **fonte curricolare corrente**;
3. **logiche e contratti di Arena**;
4. **documentazione operativa e formativa**.

Il registro macchina associato è `docs/curriculum/REG-CURR-00.registry.json`.

## Fonte curricolare corrente

La base istruttoria corrente è:

- `CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx`;
- Drive file ID `1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf`;
- SHA-256 `c89fbbbe43432db8410913675381b7dc3654d2448f9f91a8c72b115b9ec6fc55`;
- stato: **proposta d’Istituto da validare**.

La precedente `source reconstruction v3` resta storico tecnico e non è la base corrente per attestare lo stato del curricolo.

La stessa identità è ora registrata nel dominio Arena in `src/domain/curriculum/institute/currentSource.ts`. La superficie canonica `Fonti` mostra la fonte corretta come corrente e non riapre il vecchio workbench R7C7 come se i sette difetti della fonte originaria fossero ancora blocker attivi.

La distinzione corrente è:

**correzioni documentali recepite nella fonte corretta ≠ validazione professionale dei contenuti completata**.

## Stato del processo

| Ambito | Stato corrente |
|---|---|
| Copertura istruttoria 3–14 | `PASS_ISTRUTTORIO` |
| Correzioni della fonte originaria | recepite nella fonte corrente |
| Validazione professionale | `OPEN` |
| Revisione verticale finale | `OPEN` |
| Pronto per il Collegio | `NOT_YET` |
| Approvazione collegiale | `NOT_YET` |
| Promozione canonica | `NOT_AUTHORIZED` |

La prossima fase autorizzata è la **validazione professionale reale dei contenuti**. Non è autorizzata una nuova ricostruzione documentale generalizzata come sostituto dei gate umani.

## Baseline Arena

Per il lavoro corrente si assume come baseline operativa di prodotto:

- PR **#198**;
- branch `feature/team-meeting-workspace`;
- product head `d5be9b4469844237380f17173820d373ba9fe61c`;
- CCO `1.3.0`;
- registro superfici CCO `1.4.0`.

Il product head include il riallineamento della superficie `Fonti` alla fonte corretta. I commit successivi che modificano test, registri, documentazione e gate di allineamento non cambiano da soli questa baseline funzionale.

## Regola di interazione corrente

Il principio operativo è **riconoscimento prima dell’interpretazione**.

La modalità ordinaria deve privilegiare:

- un solo oggetto dominante per contesto;
- azioni vicine all’oggetto su cui agiscono;
- stato comunicato tramite trasformazione della superficie quando possibile;
- spiegazioni secondarie su richiesta;
- vera transizione di stato nei flussi multistadio;
- atto esplicito di registrazione prima di considerare completa una modifica.

Lo scorrimento verso un contenuto già renderizzato **non** costituisce una transizione di processo.

## Catena di autorità

La separazione da preservare è:

`fonte normativa ≠ elaborazione d’Istituto ≠ proposta professionale ≠ contributo individuale ≠ esito professionale del gruppo ≠ decisione istituzionale ≠ curricolo vigente`

Né la presenza nel sistema, né la partecipazione a un gruppo, né il coordinamento operativo, né un commit o un test superato attribuiscono autorità curricolare.

## PR successive

Le PR **#199–#201** e **#202–#207** restano sviluppi Draft e non fanno parte della baseline canonica corrente finché non vengono riallineate sul current head della #198 e nuovamente validate.

In particolare la catena #202–#207 parte da `cc8bcab2971587fbda0205f0b343e5f8f0fb782c` e risulta divergente rispetto alla baseline CCO e fonte-corrente attuale.

Una funzione Draft non deve essere descritta in un documento istituzionale come funzione corrente di Arena.

## Documenti Drive collegati

- `CAN-CURR-00_Quadro_istituzionale_e_normativo_Curricolo_Verticale_2026-2027`;
- `CAN-CURR-01_Identita_pedagogica_e_architettura_Curricolo_Verticale_3-14`;
- `CAN-GOV-CURR-00_Regole_canoniche_governo_revisione_validazione_CurManLight_Arena`;
- `ALL-CURR-A_Repertorio_fonti_normative_e_istituzionali_2026-2027`;
- `ALL-CURR-B_Matrice_applicabilita_e_regime_transitorio_2026-2027`;
- `ALL-CURR-F_Stato_fonte_corretta_e_prerequisiti_validazione_2026-2027`;
- `ALL-CURR-G_Piano_di_lavoro_dalla_fonte_corretta_alla_validazione_2026-2027`;
- `CAN-AUDIT-CURR-03_Audit_integrato_pre-validazione_2026-2027`;
- `VAL-CURR-00_Indice_unico_gate_validazione_2026-2027`;
- `ARENA-UX-01_Dal_documento_al_lavoro_dei_team_2026-2027`.

`ARENA-UX-01` contiene l’addendum **25. ALLINEAMENTO CANONICO — 5 SETTEMBRE 2026**, che prevale sugli stati storici delle sezioni precedenti.

## Materiali formativi

La presentazione docenti del 4 settembre 2026 resta utile come documento storico/formativo, ma è **da aggiornare prima dell’uso operativo** perché precede CCO 1.3 e rappresenta il processo in modo più testuale rispetto alla modalità lavoro corrente.

Il documento stakeholder sul modello di governo resta valido nei principi generali, ma deve essere verificato contro REG-CURR-00 prima di ogni pubblicazione o uso istituzionale.

## Regola di aggiornamento

REG-CURR-00 deve essere aggiornato quando cambia uno dei seguenti elementi:

- fonte curricolare corrente;
- stato dei gate professionali o collegiali;
- baseline Arena;
- versione CCO o registro superfici;
- modello di autorità o provenienza;
- promozione di una funzione Draft a funzione corrente;
- documento formativo che descrive il funzionamento operativo di Arena.

## Criterio di allineamento

Drive, repository, logiche e documenti sono allineati soltanto se indicano la stessa fonte corrente, lo stesso stato del curricolo, la stessa baseline di prodotto, gli stessi confini di autorità e distinguono esplicitamente funzioni correnti da sperimentazioni Draft.
