# ERDD Extraction Scorecard

## Regola fondamentale

Un punto è assegnato solo quando esiste evidenza nel codice, nei consumer, nei test o nella cronologia Git. L’assenza di evidenza vale zero; non viene compensata con inferenze.

## Criteri

| Criterio | Peso | Evidenza richiesta per il massimo |
|---|---:|---|
| Indipendenza dal dominio | 30 | Nessun tipo, regola, copy o tassonomia del prodotto sorgente |
| Portabilità tecnica | 20 | Dipendenze standard, isolate e compatibili con il runtime target |
| Configurabilità | 10 | Path, I/O, limiti e provider iniettati |
| Test trasferibili | 15 | Test isolati, deterministici e riferiti al componente |
| API pubblica | 15 | Contratto esportato con almeno un consumer reale |
| Costo di separazione | 10 | Boundary già netto; nessuna riscrittura della responsabilità |

## Classificazione automatica

- 90–100: **Extract**
- 60–89: **Adapt**
- 30–59: **Reference**
- 0–29: **Not reusable**
- **Missing**: capacità richiesta senza implementazione verificata.

## Gates

| Gate | Condizione | Effetto |
|---|---|---|
| G1 | I/O distruttivo hardcoded | massimo Adapt |
| G2 | Singleton globale mutabile | massimo Adapt |
| G3 | API senza consumer | massimo Reference |
| G4 | Licenza incompatibile | Not reusable |
| G5 | Boundary non verificabile indipendentemente | massimo Adapt |

Il gate si applica dopo il punteggio. `SemanticCache`, per esempio, ottiene 94 punti tecnici ma rimane **Reference** per G3: nel codice ispezionato ha test, ma nessun consumer di produzione.

## Confidence

- **Alta:** codice letto, import/consumer verificati e stato dei test verificato.
- **Media:** codice letto ma consumer o test soltanto indiretti.
- **Bassa:** evidenze indirette. Nessun componente della matrice è stato classificato usando soltanto evidenze indirette.

## Stability Evidence

La stabilità non modifica automaticamente lo score di estraibilità. È una dimensione di rischio separata:

- cronologia completa, non shallow;
- prima e ultima modifica del file;
- numero di commit sul file;
- modifiche negli ultimi 90 giorni;
- test dedicati;
- numero di consumer osservati.

Inattività non equivale a stabilità. La combinazione più forte è: basso churn, test dedicati e più consumer.

## Licenze osservate

- `opencode`: file `LICENSE`, MIT.
- `company-os`: `package.json` dichiara MIT; non è presente un file LICENSE alla root ispezionata.
- `DocenteDocAi`: nessun file LICENSE alla root ispezionata.

Non è stata rilevata una licenza incompatibile, quindi G4 non è stato applicato. L’assenza di un file LICENSE rimane un fatto da verificare prima di qualsiasi distribuzione, senza trasformarlo arbitrariamente in incompatibilità.
