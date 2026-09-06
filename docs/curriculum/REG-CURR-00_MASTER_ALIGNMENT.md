# REG-CURR-00 — Registro maestro del fascicolo curricolare e dell’allineamento Arena

**Versione:** 1.11 — 6 settembre 2026  
**Ambito:** Curricolo verticale d’Istituto — A.S. 2026/2027

## Funzione

Questo documento è il mirror repository del registro Drive `REG-CURR-00_Registro_maestro_fascicolo_curricolare_e_allineamento_Arena_2026-2027` (`1IMKwWWukefIDIOsbHQByiXLN7YuU7He0V5b01tjitG4`). Il registro macchina associato è `docs/curriculum/REG-CURR-00.registry.json`.

La completezza non è attestata dalla semplice esistenza di documenti distribuiti. Richiede una baseline curricolare unica, un repertorio delle fonti identificato, una catena di provenienza esplicita e la separazione fra autorità normativa, documentazione istruttoria, provenienza e stato di validazione.

## Baseline curricolare corrente

L’unica baseline curricolare canonica di lavoro è:

- `CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027`;
- Drive file ID `12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4`;
- versione `1.1` — 6 settembre 2026;
- stato: **MATERIALIZZAZIONE COMPLETA — DA VALIDARE PROFESSIONALMENTE — NON VIGENTE**.

Il master contiene materialmente il percorso ordinario 3–14 e gli assi integrati: Infanzia 3/4/5, Primaria I–V, Secondaria di primo grado I–III, Insegnamento della religione cattolica, Latino per l’Educazione Linguistica II–III, Educazione civica e alfabetizzazione all’intelligenza artificiale.

La versione 1.1 incorpora direttamente nello stesso master le integrazioni emerse dall’audit IN2025/Nota MIM 1312: scrittura manuale e riassunto nella progressione di Italiano; ponte transitorio di Storia per la coorte 2026/27; traiettoria Informatica nella Primaria; ponte triennale Informatica per la coorte in ingresso nella Secondaria 2026/27; profilo di sviluppo dell’Informatica nella Secondaria; raccordo STEM integrato.

La denominazione canonica del campo dell’Infanzia è **IL CORPO E IL MOVIMENTO**. La precedente forma «IL CORPO IN MOVIMENTO» resta soltanto nella provenienza storica/editoriale.

## Matrice di conformità normativa

`MATR-CURR-MASTER-01_Matrice_conformita_normativa_IN2025_e_atti_collegati_2026-2027` — Drive `1Wiw8Wsifls1-wr_GPYuqIAoB8GnwXMChO8Mz_kwiLKY` — è un **allegato di controllo, non una baseline curricolare**.

Esito istruttorio: `NORMATIVE_GAPS_IDENTIFIED = 6`; `NORMATIVE_GAPS_MATERIALIZED_IN_MASTER_1_1 = 6`. La materializzazione chiude la lacuna documentale, **non la validazione professionale**.

## Repertorio delle fonti corrente

`ALL-CURR-A_Repertorio_fonti_normative_e_istituzionali_2026-2027` — Drive `1MBZKbis6i6xg50z6fKgbh9yUianJXdhZ5jsK4r852PQ` — versione `1.1` è il repertorio istruttorio corrente collegato al master 1.1.

Il repertorio completo conserva le fonti normative, ministeriali, istituzionali interne e comparative. Arena espone come **fonti applicate al master corrente** il sottoinsieme effettivamente usato per costruire o controllare il master 1.1. Il contratto macchina è `src/domain/curriculum/institute/sourceRegister.ts`.

Per ogni fonte applicata Arena registra: codice ALL-CURR-A, titolo, ente emanante, data dell’atto, funzione nel master, applicabilità, localizzatore, tipo di localizzatore, stato della verifica e data dell’ultima verifica.

La presenza di una fonte nell’app **non ne aumenta l’autorità**. Un localizzatore è qualificato come `OFFICIAL` soltanto quando conduce a una fonte ufficiale verificata; una copia pubblicata da un’altra istituzione è qualificata separatamente come `INSTITUTIONAL_MIRROR`.

In particolare la Nota MIM prot. n. 1312 del 12 marzo 2026 è registrata come atto ministeriale verificato mediante **copia istituzionale di trasmissione** finché non è disponibile e verificato un localizzatore MIM diretto stabile. Arena non presenta quella copia come URL ufficiale del Ministero.

La catena documentale resa esplicita in Arena è:

`CAN-CURR-MASTER-00@1.1 → MATR-CURR-MASTER-01 → ALL-CURR-A@1.1 → fonti normative/ministeriali applicate → PRIMARY_CORRECTED_PROVENANCE`.

La superficie canonica è `src/features/documents/components/InstituteCurriculumSourceRegisterPanel.tsx`. Nella sezione Fonti l’ordine di lettura è: **master corrente → fonti istituzionali/normative e catena documentale → archivio locale e documenti aggiunti dall’utente**.

## Fonte primaria di provenienza

`CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx` — Drive `1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf` — SHA-256 `c89fbbbe43432db8410913675381b7dc3654d2448f9f91a8c72b115b9ec6fc55` resta immutata come **fonte primaria di provenienza**.

Non è più la rappresentazione corrente del curricolo. La precedente `source reconstruction v3` resta storico tecnico.

**fonte normativa ≠ repertorio delle fonti ≠ fonte di provenienza ≠ elaborazione d’Istituto ≠ proposta professionale ≠ contributo individuale ≠ esito professionale del gruppo ≠ decisione istituzionale ≠ curricolo vigente**.

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
| Lacune normative curricolari individuate/materializzate | `6 / 6` |
| Repertorio fonti | `ALL-CURR-A@1.1 — ALIGNED_TO_MASTER_1_1` |
| Fonti applicate registrate in Arena | `11` |
| Catena documentale esplicita | `4 livelli documentali + fonti applicate` |
| Validazione professionale complessiva | `OPEN` |
| Revisione verticale finale | `OPEN` |
| Pronto per il Collegio | `NOT_YET` |
| Approvazione collegiale | `NOT_YET` |
| Curricolo vigente | `NO` |
| Promozione canonica | `NOT_AUTHORIZED` |

## Regola di non frammentazione

Una correzione, una proposta, una matrice, un audit, un repertorio o un verbale non genera un nuovo curricolo parallelo. Il ciclo autorizzato è:

`CAN-CURR-MASTER-00 corrente → proposta/modifica tracciata → validazione professionale → incorporazione dell’esito nello stesso master → revisione verticale finale → eventuale iter istituzionale`.

La matrice normativa resta una prova di controllo. `ALL-CURR-A` resta repertorio istruttorio. Nessuno dei due è una baseline curricolare concorrente.

## Decisioni ancora aperte

La materializzazione completa, la chiusura documentale delle sei lacune normative e la verifica delle fonti non anticipano le decisioni che spettano ai professionisti o agli organi competenti. Restano aperti, ove previsto: sostenibilità delle progressioni dell’Infanzia; validazione delle annualizzazioni Primaria e Secondaria; distribuzioni analitiche di alcuni contenuti di coorte; validazione IRC; Latino per l’Educazione Linguistica; Educazione civica; asse di alfabetizzazione all’intelligenza artificiale; ponti di Storia e Informatica; raccordo STEM; revisione verticale finale.

## Pilota Tecnologia classe prima — R2

Il pilota `TEC-SEC1-2026-01` resta un processo di validazione delimitato. La registrazione di un contributo individuale o di un esito del team non modifica automaticamente il master. L’eventuale esito professionale valido deve essere incorporato nello stesso `CAN-CURR-MASTER-00` mediante una revisione tracciata.

## Baseline Arena e PR Draft

La baseline di prodotto istituzionalmente registrata resta PR #198 / `feature/team-meeting-workspace`, con CCO `1.3.0` e registro superfici `1.4.1`.

Le PR #199–#201 costituiscono la candidata Beta evolutiva e restano Draft: possono essere validate tecnicamente, ma non modificano da sole il fascicolo istituzionale o la vigenza del curricolo. Le PR #202–#207 restano fuori baseline fino a riallineamento e nuova validazione.

## Regola applicativa Arena

Arena deve distinguere:

- **baseline curricolare corrente:** `CAN-CURR-MASTER-00@1.1`;
- **matrice normativa:** `MATR-CURR-MASTER-01`, allegato di controllo;
- **repertorio delle fonti:** `ALL-CURR-A@1.1`, documento istruttorio;
- **fonti normative/ministeriali applicate:** con localizzatore e stato di verifica espliciti;
- **fonte corretta di provenienza:** proposta del 3 settembre 2026;
- **archivio locale:** materiale incorporato o aggiunto, separato dall’autorità istituzionale;
- **stato di validazione:** separato dal contenuto;
- **vigenza:** mai inferita da file, fonte verificata, commit, test, contributi o esiti tecnici.

## Prossima fase autorizzata

`PROFESSIONAL_VALIDATION_ON_CANONICAL_MASTER_1_1`

Si prosegue validando i contenuti già materializzati e incorporando gli esiti nello stesso master. Non è autorizzata una nuova ricostruzione generalizzata del curricolo.
