# CML-605 — Document Continuity — Integrazione

## HEAD iniziale
- main = origin/main = 41a16a2

## HEAD finale
- main = origin/main = 011ee84

## Strategia
Fast-forward (`git merge --ff-only`)

## Commit integrati
| Commit | Messaggio |
|---|---|
| 39853f5 | docs(document-continuity): add validated analysis and mock |
| dc7a2dd | feat(document-continuity): track recent local exports |
| e9cade9 | docs: close CML-605 document continuity prototype |
| 011ee84 | docs: clarify CML-605 coherence contract |

## Test
- CML-605: 55/55 PASS
- Totali: 222/222 PASS
- Regressioni: 0

## Build
- 788 KB, verde

## TypeScript
- 0 nuovi errori
- 143 pre-esistenti (invariati)

## Verifica funzionale
- Scenario A (esportazione): ✔ evento registrato con tipo, formato, contesto, data
- Scenario B (persistenza): ✔ sopravvive a refresh
- Scenario C (limite 5): ✔ solo i 5 piu recenti
- Scenario D (coerenza): ✔ current/modified da firma del contenuto
- Scenario E (non verificabile): ✔ unverifiable per sorgente aggregata
- Scenario F (cancella): ✔ solo metadati, UDA/decisioni/file intatti
- Scenario G (mobile): ✔ card impilate, azioni raggiungibili, nessun overflow

## Contratto coerenza
- `current`: firma del contenuto uguale (stessa sorgente, stesso stato)
- `modified`: firma del contenuto diversa (sorgente modificata dopo esportazione)
- `unverifiable`: senza firma iniziale, senza sorgente, o sorgente aggregata
- `exportedAt`: solo informazione visiva, mai usata nel confronto

## Limite 5 eventi
Confermato. `addDocumentExportEvent` inserisce in testa e taglia a 5.

## Soli metadati locali
Confermato. Nessun file binario, nessun Blob, nessun percorso locale, nessuna telemetria.

## Shell / routing / sidebar
Invariati. Nessuna nuova rotta, nessuna voce sidebar, nessuna modifica a Teacher Workspace o Knowledge Companion.

## File estranei
Nessuno incluso nei commit CML-605. Le modifiche pre-esistenti locali (`index.html`, `kilo.jsonc`, `session/`) sono escluse.

## Rischi residui
- Docenti con molteplici esportazioni settimanali potrebbero percepire il limite di 5 come insufficiente
- La coerenza confronta lo stato locale sorgente, non il file esportato sul dispositivo
- I casi di tipo programmazione o relazione sono classificati unverifiable perche la sorgente e aggregata

## Perimetro congelato
- Massimo 5 eventi
- Solo metadati locali
- Firme basate sul contenuto sorgente
- Timestamp usato solo come data informativa
- Stati current / modified / unverifiable
- Nessun controllo fisico del file
- Nessuna riapertura
- Nessun backend
- Nessuna sincronizzazione
- Nessuna nuova rotta
- Nessuna nuova sidebar
- Cronologia cancellabile separatamente
- Teacher Workspace invariato
- Knowledge Companion invariato
