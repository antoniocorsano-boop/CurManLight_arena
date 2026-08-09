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
| Workflow B3B di revisione delle proposte protetto da capability | `feat/cml-635b3b-proposal-review-transition-boundary` | **ADOPT** | Il docente invia o reinvia una proposta; il revisore la prende in carico, chiede correzioni, accetta per la decisione o rifiuta. Ogni transizione passa da un comando autorizzato. L'archiviazione resta separata. |
| Validazione curricolare B3C | `feat/cml-635b3c-curriculum-validation-semantics` | **ADOPT_WITH_SEMANTIC_BOUNDARY** | Si adotta la validazione tecnica, con rapporto e fingerprint riproducibili. “Valido” non significa approvato istituzionalmente né professionalmente corretto: il risultato deve restare distinto dalla decisione umana. |
| Retroazione e consolidamento B3D | `feat/cml-635b3d-*` | **REVIEW** | Non si adotta il blocco come un unico workflow. Prima vanno chiariti destinatari, passaggi di retroazione, effetti sul curricolo vigente e responsabilità del soggetto che consolida. |
| Decisione collegiale B3E | `feat/cml-635b3e-*` | **ADOPT_WITH_PROCESS_BOUNDARY** | Si adotta se il processo scolastico canonico prevede una decisione collegiale esplicita. Deve rappresentare un record della decisione locale, con ruoli, input, esito e provenienza; non deve simulare una certificazione istituzionale esterna. |
| Archivio di consolidamento B3F | `feat/cml-635b3f-consolidation-archive-persistence` | **REVIEW** | Potrà essere adottato solo dopo aver definito il significato di consolidamento, la relazione con il curricolo vigente, la provenienza, l'idempotenza e il recupero. Non è autorizzato importarlo automaticamente. |
| Vecchio consolidamento `.cml` | servizio legacy `executeDepartmentConsolidation` | **LEGACY / COMPATIBILITY_ONLY** | Rimane un percorso di trasferimento e compatibilità. Non definisce il modello umano futuro e non va presentato come archivio canonico di consolidamento. |

## Modello di processo da portare alla correzione di H1

La direzione approvabile è la seguente, mantenendo distinti i risultati tecnici
da quelli umani:

```text
curricolo vigente
  → proposta di modifica
  → revisione autorizzata
  → validazione tecnica (B3C)
  → eventuale decisione locale/collegiale (B3E)
  → consolidamento (B3D/B3F, solo dopo definizione)
```

La consultazione del curricolo vigente resta un percorso di lettura. La proposta,
la revisione, la validazione, la decisione e il consolidamento sono percorsi di
mutazione o registrazione distinti, con attore, autorizzazione e risultato
espliciti.

## Condizioni minime per l'integrazione futura

Nessuna capacità marcata `ADOPT` o `REVIEW` entra nel runtime canonico finché non
sono definiti:

1. caso d'uso, attore e passo successivo naturale;
2. nome e significato comprensibili al docente;
3. stati, transizioni e mutazioni ammesse;
4. capability e confine del comando che modifica i dati;
5. persistenza, provenienza, versionamento e recuperabilità;
6. read model e continuità del percorso umano;
7. compatibilità con la baseline `9f2ac12` e test di integrazione dedicati.

## Questioni da chiudere prima di correggere H1

- B3B è il workflow canonico per la revisione delle proposte, oppure copre anche
  una revisione istituzionale più ampia?
- La validazione B3C produce soltanto un esito tecnico oppure anche un giudizio
  professionale separato? Per default, questa decisione considera validi solo il
  rapporto tecnico e il fingerprint.
- Quale processo scolastico concreto rappresenta B3E e chi è autorizzato a
  registrarlo?
- B3D/B3F registrano un consolidamento documentale oppure cambiano davvero il
  curricolo vigente? Qual è il meccanismo di provenienza e recupero?
- Quali capacità devono essere visibili al docente e quali restano supporto
  interno del processo?

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
| Decisione collegiale e `CollegeDecisionArchive` B3E | Non presenti |
| `ConsolidationArchive` B3D/B3F | Non presente |
| Percorso umano completo fino al consolidamento | Non presente |

## Verdetto

```text
CML_TARGET_H0_1_CANONICAL_CAPABILITY_ADOPTION_DECISION_READY_FOR_APPROVAL
CML_TARGET_H0_1_B3B_ADOPT
CML_TARGET_H0_1_B3C_ADOPT_WITH_SEMANTIC_BOUNDARY
CML_TARGET_H0_1_B3D_REVIEW
CML_TARGET_H0_1_B3E_ADOPT_WITH_PROCESS_BOUNDARY
CML_TARGET_H0_1_B3F_REVIEW
CML_TARGET_H0_1_LEGACY_CML_COMPATIBILITY_ONLY
CML_TARGET_H1_REMAINS_PENDING_CORRECTION
NO_RUNTIME_CHANGE_AUTHORIZED
```

