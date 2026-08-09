# CML-TARGET-H0.1 — Canonical Capability Adoption Decision

**Stato:** decisione proposta per approvazione  
**Baseline di riferimento:** `9f2ac12`  
**Linee esaminate:** B3B–B3F  
**Ambito:** adozione funzionale di capacità già sviluppate; nessuna modifica al runtime

## Scopo

H0 ha ricostruito le capacità realmente presenti nella baseline e quelle sviluppate
nelle linee locali B3B–B3F. Queste linee non sono antenati di `9f2ac12`: la loro
esistenza costituisce quindi evidenza storica e tecnica, non disponibilità nel
prodotto canonico.

Questa decisione stabilisce quali capacità appartengono al prodotto che vogliamo
portare avanti. **Adottare** una capacità significa approvarne il significato e
chiederne una successiva integrazione verificata; non significa fare merge,
cherry-pick o importare automaticamente il branch da cui proviene.

## Decisione di adozione

| Capacità | Evidenza | Decisione canonica | Significato umano e condizioni |
|---|---|---|---|
| Workflow B3B di revisione delle proposte protetto da capability | `feat/cml-635b3b-proposal-review-transition-boundary` | **ADOPT** | È il workflow canonico della proposta di modifica al curricolo, dalla bozza fino al confine della decisione: invio, presa in carico, richieste di modifica, nuove versioni, reinvio, ammissione, rifiuto o ritiro. Non modifica il vigente, non decide e non consolida. |
| Validazione curricolare B3C | `feat/cml-635b3c-curriculum-validation-semantics` | **ADOPT_WITH_SEMANTIC_BOUNDARY** | Si adotta come **verifica tecnica**, con rapporto e fingerprint riproducibili. Verifica struttura, coerenza, anomalie e corrispondenza del contenuto; non esprime correttezza pedagogica né approvazione. |
| Retroazione e consolidamento B3D | `feat/cml-635b3d-*` | **REVIEW** | Non si adotta il blocco come un unico workflow. Prima vanno chiariti destinatari, passaggi di retroazione, effetti sul curricolo vigente e responsabilità del soggetto che consolida. |
| Decisione curricolare B3E, con supporto al contesto collegiale | `feat/cml-635b3e-*` | **ADOPT_WITH_PROCESS_BOUNDARY** | Si adotta come decisione curricolare autorizzata. Registra chi decide, su quale proposta/versione, quale esito, quando, con quale motivazione e provenienza. Il contesto può essere dipartimento, referente, collegio o altro organo configurato. |
| Applicazione della decisione e archivio di consolidamento B3D/B3F | `feat/cml-635b3d-*`, `feat/cml-635b3f-consolidation-archive-persistence` | **REVIEW** | Vanno riesaminati contro la catena: decisione registrata → nuova versione curricolare prodotta → nuova versione resa vigente. Non sono un blocco già adottabile e non è autorizzato importarli automaticamente. |
| Vecchio consolidamento `.cml` | servizio legacy `executeDepartmentConsolidation` | **LEGACY / COMPATIBILITY_ONLY** | Rimane un percorso di trasferimento e compatibilità. Non definisce il modello umano futuro e non va presentato come archivio canonico di consolidamento. |

## Modello di processo da portare alla correzione di H1

La direzione approvata è la seguente, mantenendo distinti i risultati tecnici
da quelli umani e rendendo esplicito l'effetto sul curricolo vigente:

```text
CURRICOLO VIGENTE
  → esigenza di modifica
  → PROPOSTA: bozza → versioni → invio
  → REVISIONE: presa in carico → modifiche/versione/reinvio*
  → VERIFICA TECNICA: rapporto + fingerprint
  → DECISIONE CURRICOLARE: esito umano autorizzato
  → APPLICAZIONE DELLA DECISIONE
  → NUOVA VERSIONE DEL CURRICOLO
  → ENTRATA IN VIGORE
  → CURRICOLO VIGENTE
```

La consultazione del curricolo vigente resta un percorso di lettura. La proposta,
la revisione, la verifica tecnica, la decisione, l'applicazione, la produzione
della nuova versione e l'entrata in vigore sono passaggi distinti, con attore,
autorizzazione, risultato e provenienza espliciti.

La verifica tecnica è un requisito per la decisione, non necessariamente un
passaggio unico e lineare. Dopo una richiesta di modifica e una nuova versione
può essere rieseguita. La versione ammessa alla decisione deve possedere una
verifica tecnica pertinente e non obsoleta, quando tale verifica è richiesta.

## Condizioni minime per l'integrazione futura

Nessuna capacità marcata `ADOPT`, `ADOPT_WITH_*` o `REVIEW` entra nel runtime canonico finché non
sono definiti:

1. caso d'uso, attore e passo successivo naturale;
2. nome e significato comprensibili al docente;
3. stati, transizioni e mutazioni ammesse;
4. capability e confine del comando che modifica i dati;
5. persistenza, provenienza, versionamento e recuperabilità;
6. read model e continuità del percorso umano;
7. compatibilità con la baseline `9f2ac12` e test di integrazione dedicati.

## Decisioni che chiudono H0.1

- B3B è il workflow canonico della proposta di revisione fino alla decisione.
- B3C produce solo una verifica tecnica riproducibile, non un giudizio
  professionale.
- B3E rappresenta una decisione curricolare autorizzata; il carattere collegiale
  dipende dal processo configurato.
- B3D/B3F devono essere riesaminati come applicazione della decisione, produzione
  della nuova versione ed entrata in vigore.
- Il docente vede azioni e stati pertinenti al proprio ruolo e al lavoro corrente;
  l'infrastruttura tecnica resta nascosta.

## Fuori ambito e non autorizzato da H0.1

Questa decisione non autorizza:

- merge o cherry-pick delle linee B3B–B3F;
- modifiche a H1 prima della chiusura delle questioni sopra elencate;
- implementazione di P1.3;
- modifiche al runtime, all'interfaccia o ai test;
- promozione automatica di una capacità solo perché presente in un branch locale.

## Tracciabilità

| Oggetto | Stato nella baseline `9f2ac12` |
|---|---|
| Consultazione e struttura verticale del curricolo | Presente |
| Proposte immutabili e `revisionArchive` | Presente |
| Stati e transizioni di dominio | Presente, con protezione B3B incompleta nel percorso UI |
| Workflow B3B completamente protetto | Non presente |
| `validateCurriculumData` B3C | Non presente |
| Decisione curricolare e `CollegeDecisionArchive` B3E | Non presenti |
| `ConsolidationArchive` B3D/B3F | Non presente |
| Percorso umano completo fino al consolidamento | Non presente |

## Verdetto

```text
CML_TARGET_H0_1_CANONICAL_CAPABILITY_ADOPTION_DECISION_APPROVED
CML_TARGET_H0_1_B3B_ADOPT_AS_PROPOSAL_REVIEW_WORKFLOW
CML_TARGET_H0_1_B3C_ADOPT_AS_TECHNICAL_VALIDATION_ONLY
CML_TARGET_H0_1_B3E_ADOPT_AS_AUTHORIZED_CURRICULUM_DECISION
CML_TARGET_H0_1_B3D_B3F_REVIEW_FOR_DECISION_APPLICATION_AND_EFFECTIVE_VERSION
CML_TARGET_H0_1_LEGACY_CML_COMPATIBILITY_ONLY
CML_TARGET_H1_READY_FOR_PROCESS_CORRECTION
NO_RUNTIME_CHANGE_AUTHORIZED
```
