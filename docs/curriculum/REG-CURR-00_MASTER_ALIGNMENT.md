# REG-CURR-00 — Registro maestro del fascicolo curricolare e dell’allineamento Arena

**Versione:** 1.13 — 6 settembre 2026  
**Ambito:** Curricolo verticale d’Istituto — A.S. 2026/2027

## Funzione

Questo documento è il mirror repository del registro Drive `REG-CURR-00_Registro_maestro_fascicolo_curricolare_e_allineamento_Arena_2026-2027` (`1IMKwWWukefIDIOsbHQByiXLN7YuU7He0V5b01tjitG4`). Il registro macchina associato è `docs/curriculum/REG-CURR-00.registry.json`.

La completezza non è attestata dalla semplice esistenza di documenti distribuiti. Richiede una baseline curricolare unica, un repertorio delle fonti identificato, una catena di provenienza esplicita e la separazione fra autorità normativa, documentazione istruttoria, provenienza e stato di validazione.

## Baseline curricolare corrente

L’unica baseline curricolare canonica di lavoro è:

- `CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027`;
- Drive file ID `12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4`;
- versione `1.3` — 6 settembre 2026;
- stato: **MATERIALIZZAZIONE COMPLETA — COPERTURA DOCUMENTALE OSA COMPLETA — DA VALIDARE PROFESSIONALMENTE — NON VIGENTE**.

Il master contiene materialmente il percorso ordinario 3–14 e gli assi integrati: Infanzia 3/4/5, Primaria I–V, Secondaria di primo grado I–III, Insegnamento della religione cattolica, Latino per l’Educazione Linguistica II–III, Educazione civica e alfabetizzazione all’intelligenza artificiale.

La versione 1.3 mantiene lo stesso Drive ID e incorpora cumulativamente i GAP/PARTIAL emersi dal gate requisito-per-requisito. Le integrazioni sono espresse come requisiti, traiettorie di benchmark e regole di autorità; non trasformano le annualizzazioni d’Istituto in OSA ministeriali annuali e non riscrivono retroattivamente le coorti ancora in regime 2012.

La denominazione canonica del campo dell’Infanzia è **IL CORPO E IL MOVIMENTO**. La precedente forma «IL CORPO IN MOVIMENTO» resta soltanto nella provenienza storica/editoriale.

## Gate OSA uno-a-uno

`MATR-CURR-MASTER-01_Matrice_conformita_normativa_IN2025_e_atti_collegati_2026-2027` — Drive `1Wiw8Wsifls1-wr_GPYuqIAoB8GnwXMChO8Mz_kwiLKY` — resta un **allegato di controllo, non una baseline curricolare**.

Il gate usa identificativi interni `OSA-AUD-*`; non inventa codici ministeriali. La regola semantica resta vincolante:

- Primaria: i benchmark nazionali sono letti ai termini previsti delle classi III e V; le annualizzazioni delle singole classi sono elaborazioni d’Istituto;
- Secondaria di primo grado: il benchmark nazionale è letto al termine della classe III; le annualizzazioni I–III sono elaborazioni d’Istituto;
- le classi ancora in regime 2012 non vengono riscritte retroattivamente per simulare l’applicazione delle IN2025.

Stato corrente: `OSA_ONE_TO_ONE_GATE = COMPLETE_FOR_DOCUMENTARY_COVERAGE`. Tutti i GAP/PARTIAL rilevati sono stati deduplicati e materializzati nel master 1.3 oppure classificati come requisiti di governance separati, controlli di applicabilità o riferimenti normativi specifici.

La chiusura è **documentale soltanto**: `OSA_COMPLETION_CLAIM_SCOPE = DOCUMENTARY_ONLY`. Non equivale a validazione professionale delle annualizzazioni, revisione verticale finale, approvazione collegiale o vigenza.

## Repertorio delle fonti corrente

`ALL-CURR-A_Repertorio_fonti_normative_e_istituzionali_2026-2027` — Drive `1MBZKbis6i6xg50z6fKgbh9yUianJXdhZ5jsK4r852PQ` — versione `1.1` è il repertorio istruttorio corrente collegato al master 1.3.

Arena espone come fonti applicate il sottoinsieme effettivamente usato per costruire o controllare il master. Il contratto macchina è `src/domain/curriculum/institute/sourceRegister.ts`. Per ogni fonte applicata registra codice, titolo, ente, data, funzione nel master, applicabilità, localizzatore, tipo di localizzatore, stato e data della verifica.

La presenza di una fonte nell’app **non ne aumenta l’autorità**. Un localizzatore è `OFFICIAL` soltanto quando conduce a una fonte ufficiale verificata; una copia pubblicata da un’altra istituzione è `INSTITUTIONAL_MIRROR`.

La Nota MIM prot. n. 1312 del 12 marzo 2026 resta registrata come atto ministeriale verificato mediante **copia istituzionale di trasmissione** finché non viene acquisito e verificato un localizzatore MIM diretto stabile.

La catena documentale corrente è:

`CAN-CURR-MASTER-00@1.3 → MATR-CURR-MASTER-01 → ALL-CURR-A@1.1 → fonti normative/ministeriali applicate → PRIMARY_CORRECTED_PROVENANCE`.

## Fonte primaria di provenienza

`CURRICOLO_VERTICALE_CORRETTO_PROPOSTA_2026-09-03.docx` — Drive `1DPdK_EIZsE3lI-LIzTJG776cU1PcAcnf` — SHA-256 `c89fbbbe43432db8410913675381b7dc3654d2448f9f91a8c72b115b9ec6fc55` resta immutata come **fonte primaria di provenienza** e non è la rappresentazione corrente del curricolo.

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
| Primo audit normativo — lacune individuate/materializzate | `6 / 6` |
| Gate OSA uno-a-uno | `COMPLETE_FOR_DOCUMENTARY_COVERAGE` |
| Integrazioni OSA deduplicate incorporate nel master 1.3 | `TRUE` |
| Ambito del claim OSA | `DOCUMENTARY_ONLY` |
| Repertorio fonti | `ALL-CURR-A@1.1 — ALIGNED_TO_MASTER_1_3` |
| Fonti applicate registrate in Arena | `11` |
| Validazione professionale complessiva | `OPEN` |
| Revisione verticale finale | `OPEN` |
| Pronto per il Collegio | `NOT_YET` |
| Approvazione collegiale | `NOT_YET` |
| Curricolo vigente | `NO` |
| Promozione canonica | `NOT_AUTHORIZED` |

## Regola di non frammentazione

Una correzione, una proposta, una matrice, un audit, un repertorio o un verbale non genera un nuovo curricolo parallelo. Il ciclo autorizzato resta:

`CAN-CURR-MASTER-00 corrente → controllo/mappatura → integrazione tracciata nello stesso master → validazione professionale → revisione verticale finale → eventuale iter istituzionale`.

La matrice normativa resta una prova di controllo. `ALL-CURR-A` resta repertorio istruttorio. Nessuno dei due è una baseline curricolare concorrente.

## Baseline Arena e PR Draft

La baseline di prodotto istituzionalmente registrata resta PR #198 / `feature/team-meeting-workspace`, con CCO `1.3.0` e registro superfici `1.4.1`. Le PR #199–#201 restano candidata Beta evolutiva Draft; non modificano da sole il fascicolo istituzionale o la vigenza del curricolo. Le PR #202–#207 restano fuori baseline fino a riallineamento e nuova validazione.

## Regola applicativa Arena

Arena deve distinguere:

- **baseline curricolare corrente:** `CAN-CURR-MASTER-00@1.3`;
- **matrice normativa/OSA:** `MATR-CURR-MASTER-01`, allegato di controllo con copertura documentale completa;
- **repertorio delle fonti:** `ALL-CURR-A@1.1`, documento istruttorio;
- **fonte corretta di provenienza:** proposta del 3 settembre 2026;
- **archivio locale:** materiale incorporato o aggiunto, separato dall’autorità istituzionale;
- **stato di validazione:** `OPEN`, distinto dalla copertura documentale;
- **vigenza:** mai inferita da file, fonte verificata, commit, test, mapping OSA, contributi o esiti tecnici.

## Prossima fase autorizzata

`HUMAN_PROFESSIONAL_VALIDATION_ON_CANONICAL_MASTER_1_3`

Il lavoro successivo riguarda la validazione professionale reale delle annualizzazioni, sequenze, profondità, evidenze e raccordi del master 1.3. Gli OSA nazionali applicabili non possono essere resi facoltativi da una decisione dipartimentale. Gli esiti validati confluiscono nello stesso master e precedono la revisione verticale finale.
