# CML-606 — Verbale di Validazione Visiva

## 1. Oggetto della validazione

Validazione visiva del pilota UI System CurManLight applicato alla vista Documenti/Esportazioni.

## 2. Branch e baseline

- **Branch:** feat/cml-606-ui-system-documents-pilot
- **HEAD:** fbfdc01 — fix(csp): allow Vite dev module scripts in Content-Security-Policy
- **Baseline test:** 243/243 (pre-validazione)
- **Baseline build:** 790 KB, verde

## 3. Natura della verifica

Analisi manuale tramite screenshot e revisione del codice sorgente dei componenti:
- `DocumentExportHistory.tsx`
- `EsportazioniTab.tsx`
- `UiConfirmDialog.tsx`
- `SessionModals.tsx` (modale reset)

Strumenti: vision_analyze (locale), vision_compare, revisione codice.

## 4. Screenshot analizzati

| File | Stato |
|---|---|
| `documents-history-empty.png` | Stato vuoto cronologia |
| `documents-history-populated.png` | Cronologia con eventi |
| `documents-confirm-reset.png` | Dialog di conferma reset |
| `documents-mobile-390.png` | Vista mobile 390×844 |
| `desktop-1440-02-documents.png` | Desktop 1440×900 |
| `laptop-1366-02-documents.png` | Laptop 1366×768 |
| `tablet-1024-02-documents.png` | Tablet 1024×768 |

## 5. Gerarchia visiva

La gerarchia è strutturata su tre livelli:

1. **Header di sezione** — "Documenti prodotti di recente" con descrizione e azione "Cancella cronologia"
2. **Card evento** — Ogni card contiene: tipo documento (colore azione) → formato (muted) → titolo (14px semibold) → badge stato → metadati → messaggio fonte → azioni
3. **Footer** — Nota sulla privacy dei file

La lettura procede naturalmente dall'alto verso il basso. Le card sono differenziate per importanza: il badge di coerenza cattura l'attenzione subito dopo il titolo.

## 6. Tipografia

| Elemento | Dimensione | Peso | Colore |
|---|---|---|---|
| Titolo sezione | 16px | semibold | text-ui-text |
| Descrizione sezione | 13px | medium | text-ui-text-secondary |
| Tipo documento | 13px | semibold | text-ui-action |
| Formato | 12px | medium | text-ui-text-muted |
| Titolo documento | 14px | semibold | text-ui-text |
| Metadati | 12px | medium | text-ui-text-secondary |
| Badge stato | 12px | semibold | semantico |
| Messaggio fonte | 13px | medium | variabile |
| Footer | 12px | medium | text-ui-text-muted |

Gerarchia tipografica efficace: 13px/14px per contenuti primari, 12px per secondari, 16px per titoli.

## 7. Leggibilità

- **Contrasto:** WCAG AA garantito dai token CSS semantici
- **Spaziatura:** `space-y-4` tra sezioni, `space-y-3` tra card, padding `p-4` interno card
- **Densità:** Bilanciata. Le card hanno altezza sufficiente per separare gli eventi senza spreco
- **Ariosità:** Buona grazie ai gap consistenti e all'assenza di bordi spessi o ombre intrusive
- **Truncation:** I titoli lunghi sono troncati (`truncate`) per evitare rotture del layout

## 8. Palette

Token CSS semantici utilizzati:

| Ruolo | Token | Uso |
|---|---|---|
| Superficie | `bg-ui-surface` | Sfondo pannelli e card |
| Bordo | `border-ui-border` | Bordi card |
| Testo primario | `text-ui-text` | Titoli e contenuti |
| Testo secondario | `text-ui-text-secondary` | Descrizioni, metadati |
| Testo muted | `text-ui-text-muted` | Formati, footer |
| Azione | `text-ui-action` | Tipo documento |
| Stato successo | `--ui-success` | Badge "Coerente" |
| Stato warning | `--ui-warning` | Badge "Modificato" |
| Stato unverifiable | — | Badge "Da verificare" (neutro) |

Nessun colore arbitrario. Nessuna ombra colorata. Coerenza cromatica completa.

## 9. Pannelli e card

- **1 pannello esterno** (`UiPanel`) che contiene la cronologia completa
- **Header di sezione** con azione "Cancella cronologia" di tipo `quiet`
- **Card evento** con bordo `border-ui-border`, angoli `rounded-ui-panel`, padding `p-4`
- **Max 5 card** (limite imposto dallo store)
- **Stato vuoto** gestito con `UiEmptyState` che mostra icona `FileText` e messaggio descrittivo

Ogni card contiene:
1. Riga superiore: tipo + formato (sinistra), badge stato (destra)
2. Titolo documento (truncato)
3. Metadati orizzontali (disciplina, ordine, classe, data con icona clock)
4. Messaggio contestuale di coerenza (condizionale, se sourceTitle presente)
5. Azioni: "Torna al lavoro" (primary) + "Produci una nuova versione" (secondary)

## 10. Azione primaria

**"Torna al lavoro"** — bottone `variant="primary"` che naviga alla fonte del documento.
- Visibile solo se `event.sourceId && onNavigateToSource`
- Colore semantico azione, prima posizione nel gruppo
- Invito chiaro: "tornare al lavoro" è l'azione più naturale dopo aver visto un export

## 11. Azioni secondarie

| Bottone | Variante | Visibilità |
|---|---|---|
| Produci una nuova versione | `secondary` | Sempre se `onProduceNewVersion` presente |
| Cancella cronologia | `quiet` | Sempre, nell'header |
| Annulla (dialog) | `secondary` | Nel dialog di conferma |
| Azzera memoria (dialog) | `danger` | Nel dialog di conferma |

Le azioni sono gerarchizzate: primary > secondary > quiet > danger. Distinzione chiara.

## 12. Stati di coerenza

| Stato | Badge | Colore | Messaggio contestuale |
|---|---|---|---|
| `current` | "Coerente" | success (verde) | "Corrisponde al lavoro attuale. Fonte: ..." |
| `modified` | "Modificato" | warning (giallo) | "Il lavoro è stato modificato dopo questa esportazione. Fonte: ..." |
| `unverifiable` | "Da verificare" | neutro (grigio) | "Non è possibile confrontare questa esportazione con il lavoro attuale. Fonte: ..." |

Implementato con `UiStatusMessage` che accetta type `success|warning|unverifiable`.
La logica di determinazione è basata su firma crittografica (`sourceSignature.ts`), non su euristica.

## 13. Mobile

A 390×844:
- Card impilate verticalmente, larghezza piena
- Metadati in formato orizzontale (wrap su schermi stretti)
- Bottoni azione affiancati ma sufficientemente larghi
- Nessun overflow orizzontale
- Header "Cancella cronologia" raggiungibile
- Dialog di conferma centrato con padding adeguato

Verifica eseguita tramite `documents-mobile-390.png` e codice responsive (`flex-col md:flex-row`).

## 14. Dialog

Il `UiConfirmDialog` utilizza `<dialog>` nativo con:
- `showModal()` per apertura modale
- `onCancel` per chiusura con Escape
- `confirmButtonRef.current?.focus()` per focus iniziale sul bottone distruttivo
- Focus trap nativa del dialogo HTML
- Variante `danger` per l'azione distruttiva ("Azzera"), `secondary` per "Annulla"
- Titolo "Azzera la memoria" — chiaro
- Messaggio esplicito: descrive cosa viene cancellato e cosa no
- Padding `p-6`, larghezza massima `max-w-[480px]`
- Leggibile a 390×844 (overflow gestito)

Nell'uso concreto (`EsportazioniTab.tsx:456-467`):
- `confirmLabel="Azzera"`, `variant="danger"`
- Collegato a `handleClearLocalStorageWithReset`

## 15. Controllo anti-interfaccia generica

**Punti di specificità del dominio:**
- Logica di coerenza basata su signature hash del lavoro docente — non è un badge fittizio
- Messaggi localizzati in italiano con linguaggio scolastico (UDA, programmazione, disciplina, ordine, classe)
- Tipi documento: UDA, Programmazione, Relazione, Curricolo, Confronto, Programma Svolto
- Metadati: disciplina, ordine scolastico, classe — non generici "tags"
- Footer informativo sulla privacy dei file ("CurManLight non conserva copie")

**Residuo generico:**
- Pattern "card ripetute con badge di stato e due pulsanti per riga" è comune in dashboard SaaS
- La struttura evento-dopo-evento è ordinata ma non distintiva
- Il miglioramento con separatori lineari anziché card complete è rinviato

## 16. Rischio residuo

> La vista soddisfa i criteri di leggibilità, gerarchia, accessibilità e coerenza.
> Permane un residuo di linguaggio visivo riconducibile a pattern SaaS nelle card
> della cronologia, mitigato dalla specificità del dominio e non bloccante per
> l'integrazione del pilota.

## 17. Miglioramenti rinviati

| Miglioramento | Target | Assegnato a |
|---|---|---|
| Separatori lineari tra eventi invece di card complete | CML-608 — Surface and Action Consistency | Futuro |
| Riservare bordo completo solo all'evento selezionato/modificato | CML-608 | Futuro |
| Mantenere pannello esterno unico | CML-608 | Futuro |

Nessuna correzione applicata ora per evitare sovraprogettazione e ritardo del pilota.

## 18. Verdetto

```
CML_606_VISUAL_PASS
```
