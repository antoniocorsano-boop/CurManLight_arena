# REG-CURR-00 — Registro maestro del fascicolo curricolare e dell’allineamento Arena

**Versione:** 1.9 — 6 settembre 2026  
**Ambito:** Curricolo verticale d’Istituto — A.S. 2026/2027

## Funzione

Questo documento è il mirror repository del registro Drive `REG-CURR-00_Registro_maestro_fascicolo_curricolare_e_allineamento_Arena_2026-2027` (`1IMKwWWukefIDIOsbHQByiXLN7YuU7He0V5b01tjitG4`). Il registro macchina associato è `docs/curriculum/REG-CURR-00.registry.json`.

Dal presente aggiornamento il registro non usa più la semplice esistenza di documenti distribuiti come prova di completezza del curricolo. La completezza richiede la materializzazione del contenuto nella baseline curricolare unica.

## Baseline curricolare corrente

L’unica baseline curricolare canonica di lavoro è:

- `CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027`;
- Drive file ID `12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4`;
- versione `1.0` — 6 settembre 2026;
- stato: **MATERIALIZZAZIONE COMPLETA — DA VALIDARE PROFESSIONALMENTE — NON VIGENTE**.

Il master contiene materialmente il percorso ordinario 3–14 e gli assi integrati: Infanzia 3/4/5, Primaria I–V, Secondaria di primo grado I–III, Insegnamento della religione cattolica, Latino per l’Educazione Linguistica II–III, Educazione civica e alfabetizzazione all’intelligenza artificiale.

La denominazione canonica del campo dell’Infanzia è **IL CORPO E IL MOVIMENTO**. La precedente forma «IL CORPO IN MOVIMENTO» resta soltanto nella provenienza storica/editoriale.

## Fonte primaria di provenienza

`CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx` — Drive `1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf` — SHA-256 `c89fbbbe43432db8410913675381b7dc3654d2448f9f91a8c72b115b9ec6fc55` resta immutata come **fonte primaria di provenienza**.

Non è più la rappresentazione corrente del curricolo. La precedente `source reconstruction v3` resta storico tecnico.

**fonte normativa ≠ fonte di provenienza ≠ elaborazione d’Istituto ≠ proposta professionale ≠ contributo individuale ≠ esito professionale del gruppo ≠ decisione istituzionale ≠ curricolo vigente**.

## Stato del processo

| Ambito | Stato corrente |
|---|---|
| Materializzazione del curricolo ordinario 3–14 | `COMPLETE` |
| Infanzia 3/4/5 | `MATERIALIZED` |
| Primaria I–V | `MATERIALIZED` |
| Secondaria I–III | `MATERIALIZED` |
| IRC | `MATERIALIZED` |
| Latino per l’Educazione Linguistica II–III | `MATERIALIZED` |
| Educazione civica 3–14 | `MATERIALIZED` |
| Alfabetizzazione all’intelligenza artificiale 3–14 | `MATERIALIZED` |
| Validazione professionale complessiva | `OPEN` |
| Revisione verticale finale | `OPEN` |
| Pronto per il Collegio | `NOT_YET` |
| Approvazione collegiale | `NOT_YET` |
| Curricolo vigente | `NO` |
| Promozione canonica | `NOT_AUTHORIZED` |

La precedente metrica `PASS_ISTRUTTORIO` basata sulla copertura documentale è **deprecata ai fini della completezza**.

## Regola di non frammentazione

Da questa versione in avanti una correzione, una proposta, una matrice, un audit o un verbale non genera un nuovo curricolo parallelo. Il ciclo autorizzato è:

`CAN-CURR-MASTER-00 corrente → proposta/modifica tracciata → validazione professionale → incorporazione dell’esito nello stesso master → revisione verticale finale → eventuale iter istituzionale`.

La validazione professionale può modificare lo stato o il contenuto del master, ma **non genera un nuovo curricolo parallelo**. Ogni nuova versione conserva l’identità del master e la provenienza delle modifiche.

## Decisioni ancora aperte

La materializzazione completa non anticipa le decisioni che spettano ai professionisti o agli organi competenti. Restano aperti, ove previsto: sostenibilità delle progressioni dell’Infanzia; validazione delle annualizzazioni Primaria e Secondaria; distribuzioni analitiche di alcuni contenuti di coorte; validazione IRC; Latino per l’Educazione Linguistica; Educazione civica; asse di alfabetizzazione all’intelligenza artificiale; revisione verticale finale.

Questi sono **stati di validazione o scelte professionali**, non lacune strutturali del master.

## Pilota Tecnologia classe prima — R2

Il pilota `TEC-SEC1-2026-01` resta un processo di validazione delimitato. La proposta R2 mantiene cinque identità e la sua provenienza documentale resta collegata alla fonte corretta del 3 settembre, alla proposta disciplinare, alla matrice verticale e ai gate dedicati.

La registrazione di un contributo individuale o di un esito del team non modifica automaticamente il master. L’eventuale esito professionale valido deve essere incorporato nello stesso `CAN-CURR-MASTER-00` mediante una revisione tracciata.

## Baseline Arena e PR Draft

La baseline di prodotto istituzionalmente registrata resta PR #198 / `feature/team-meeting-workspace`, con CCO `1.3.0` e registro superfici `1.4.1`.

Le PR #199–#201 costituiscono la candidata Beta evolutiva e restano Draft: possono essere validate tecnicamente, ma non modificano da sole il fascicolo istituzionale o la vigenza del curricolo. Le PR #202–#207 restano fuori baseline fino a riallineamento e nuova validazione.

## Regola applicativa Arena

Arena deve distinguere:

- **baseline curricolare corrente:** `CAN-CURR-MASTER-00@1.0`;
- **fonte corretta di provenienza:** proposta del 3 settembre 2026;
- **fonti normative:** livello di autorità superiore;
- **proposte, audit, matrici e verbali:** evidenze e strumenti del processo;
- **stato di validazione:** separato dal contenuto;
- **vigenza:** mai inferita da file, commit, test, contributi o esiti tecnici.

La superficie `Fonti` deve quindi mostrare il master come baseline corrente e mantenere la fonte del 3 settembre raggiungibile nella tracciabilità, senza presentarla come curricolo corrente.

## Prossima fase autorizzata

`PROFESSIONAL_VALIDATION_ON_CANONICAL_MASTER`

Si prosegue validando i contenuti già materializzati e incorporando gli esiti nello stesso master. Non è autorizzata una nuova ricostruzione generalizzata del curricolo.
