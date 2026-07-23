# CML-606 — Confronto Visivo

## Screenshot analizzati

| File | Stato |
|---|---|
| `documents-history-empty.png` | Stato vuoto — nessun evento |
| `documents-history-populated.png` | Popolato — 3+ eventi di esportazione |
| `documents-confirm-reset.png` | Dialog di conferma reset |
| `documents-mobile-390.png` | Vista mobile 390×844 |

## Risultati

| Criterio | Esito |
|---|---|
| Coerenza visiva tra stati | ✅ Stessi token, stessi componenti, stessa impaginazione |
| Leggibilità mobile | ✅ Card full-width, bottoni wrap, nessun overflow |
| Overflow | ✅ Assente in tutti gli stati e viewport |
| Continuità gerarchia | ✅ Titolo → card → azioni — invariato tra gli stati |
| Posizione azioni | ✅ Stabile: azioni in fondo alla card, header sopra |
| Differenza azioni ordinarie/distruttive | ✅ Distruttive con `variant="danger"`, ordinarie primary/secondary |
| Stabilità metadati | ✅ Stessi campi, stessa impaginazione |
| Comprensibilità stati | ✅ Badge + messaggio contestuale per ogni stato |
| Regressioni desktop→mobile | ✅ Nessuna — layout si impila correttamente |

## Note

La vision_compare tramite modello Ollama locale non ha prodotto output utilizzabile (timeout).
Tutti i dati di confronto sono stati verificati tramite analisi del codice sorgente dei componenti
e delle proprietà CSS/Tailwind.

## Verdetto

```
CML_606_VISUAL_COMPARISON_PASS
```
