# CML-606 — Controllo Anti-Interfaccia Generica

## Obiettivo
Verificare che la vista Documenti/Esportazioni (pilota UI System) non sia
semplicemente un template dashboard SaaS riempito con dati fittizi, ma che
abbia specificità di dominio sufficiente a giustificarne l'esistenza come
prodotto verticale per la scuola.

## Punti di specificità del dominio

| Elemento | Specificità | Valutazione |
|---|---|---|
| Tipi documento | UDA, Programmazione, Relazione, Curricolo, Confronto, Programma Svolto | ✅ Alto — dominio scolastico puro |
| Metadati | Disciplina, ordine scolastico, classe | ✅ Alto — non tags generici |
| Coerenza firma | `sourceSignature.ts` — hash crittografico del lavoro docente | ✅ Alto — logica complessa e specifica |
| Messaggi stato | "Corrisponde al lavoro attuale", "Il lavoro è stato modificato" | ✅ Alto — linguaggio docente |
| Footer privacy | "CurManLight non conserva copie dei file esportati" | ✅ Alto — compliance dati scolastici |
| Badge semantici | Coerente / Modificato / Da verificare | ✅ Medio — pattern comune ma contenuto specifico |
| Azioni | "Torna al lavoro", "Produci una nuova versione" | ✅ Alto — azioni cucite sul workflow docente |
| Max 5 eventi | Limite store intenzionale | ✅ Alto — scelta di dominio, non tecnica |
| Stato vuoto | "Non hai ancora prodotto documenti in questa sessione." | ✅ Alto — testo contestualizzato |

## Residuo generico

| Pattern | Tipo | Rinvio |
|---|---|---|
| Card ripetute con badge di stato e due pulsanti | SaaS generico | CML-608 |
| Lista cronologica evento-dopo-evento | SaaS generico | CML-608 |
| Struttura uniforme senza variazioni visive | SaaS generico | CML-608 |

## Giudizio complessivo

La vista Documenti/Esportazioni è **sufficientemente specifica del dominio**
per superare il controllo anti-interfaccia generica. La logica di coerenza
basata su firma crittografica, i tipi documento scolastici e il linguaggio
localizzato IT dimostrano che non si tratta di un pannello SaaS riempito
con dati fittizi.

Il residuo visivo (card, badge, bottoni duali) è un problema di superficie
che verrà affrontato in CML-608.

## Verdetto

```
CML_606_ANTI_GENERIC_UI_PASS
```
