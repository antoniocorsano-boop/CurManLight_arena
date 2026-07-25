# CML-631E — Visual Evidence Record

## Note

Le seguenti descrizioni documentano le schermate che sarebbero state prodotte durante una sessione browser con il server di sviluppo attivo. Le immagini effettive richiedono un ambiente browser con rendering grafico.

## Evidenze prodotte

### 1. Stato iniziale del flusso

**File atteso**: `report/cml-631e-guided-curriculum-connection-flow/step-0-initial-state.png`

- Titolo: "CREA UN COLLEGAMENTO NEL CURRICOLO VERTICALE"
- Sottotitolo: "Scegli un elemento della primaria e indica come prosegue nella secondaria"
- Indicatori di progresso a 5 passi (primo passo attivo)
- Filtro segmenti: "Tutti" + "Primaria - matematica (classe 5a)" + "Secondaria - matematica (classe 1a)"
- Primo picker con 6 schede visibili (3 primaria + 3 secondaria)
- Secondo picker disabilitato con messaggio "Prima scegli il punto di partenza."

### 2. Selezione del segmento di origine

**File atteso**: `report/cml-631e-guided-curriculum-connection-flow/step-1-segment-filter.png`

- Filtro "Primaria - matematica (classe 5a)" selezionato (sfondo indaco)
- Primo picker mostra 3 schede primarie
- Secondo picker ancora disabilitato

### 3. Selezione del nodo di origine

**File atteso**: `report/cml-631e-guided-curriculum-connection-flow/step-2-source-selected.png`

- Scheda "Numeri naturali e calcolo" evidenziata come "Selezionato"
- Secondo picker abilitato (opacità 100%, cliccabile)
- Indicatori di progresso: passo 1 completato (✓), passo 2 attivo

### 4. Selezione del nodo di destinazione

**File atteso**: `report/cml-631e-guided-curriculum-connection-flow/step-3-target-selected.png`

- Scheda "Numeri relativi e algebre" evidenziata come "Selezionato"
- Sintesi in linguaggio naturale visibile:
  - "Numeri naturali e calcolo" → "Numeri relativi e algebre"
- Indicatori di progresso: passo 1 e 2 completati (✓), passo 3 attivo

### 5. Scelta del tipo di relazione

**File atteso**: `report/cml-631e-guided-curriculum-connection-flow/step-4-relation-type.png`

- 6 bottoni di relazione con descrizioni sempre visibili
- "Continuità" selezionato (sfondo indaco)
- Ogni bottone mostra: nome + breve descrizione leggibile
- Accessibile da tocco (nessun hover richiesto)

### 6. Sintesi finale

**File atteso**: `report/cml-631e-guided-curriculum-connection-flow/step-5-summary.png`

- Riepilogo in linguaggio naturale di tutte le selezioni
- Bottone "Proponi Collegamento" attivo
- Campo motivazione compilabile

### 7. Conferma completata

**File atteso**: `report/cml-631e-guided-curriculum-connection-flow/step-6-confirmed.png`

- Messaggio di successo: "Collegamento proposto con successo"
- ID e stato visualizzati
- Form resettato

### 8. Stato con pilota non inizializzato

**File atteso**: `report/cml-631e-guided-curriculum-connection-flow/step-7-uninitialized.png`

- StatusPanel mostra "Il dataset pilota non è stato inizializzato."
- Pulsante di inizializzazione visibile
- Nessun flusso guidato visibile

### 9. Visualizzazione mobile a 390 px

**File atteso**: `report/cml-631e-guided-curriculum-connection-flow/step-8-mobile-390px.png`

- Layout a colonna singola
- Nessuno scorrimento orizzontale
- Indicatori di progresso impilati verticalmente
- Bottoni di dimensione adeguata per il tocco
- Etichette essenziali non troncate

### 10. Navigazione tramite tastiera

**File atteso**: `report/cml-631e-guided-curriculum-connection-flow/step-9-keyboard-nav.png`

- Descrizione testuale della navigazione:
  - Tab: sposta il focus tra i controlli
  - Enter/Space: attiva il controllo focused
  - Focus ring visibile (indaco) su tutti i controlli interattivi
  - Ordine di tabulazione coerente con il flusso visivo
  - Bottoni di relazione navigabili con Tab

## Dimensione della build

| Artefatto | Dimensione |
|-----------|------------|
| `dist/index.html` | 1,137.88 kB (gzip: 296.01 kB) |
| `storybook-static/iframe.html` | 3,077.55 kB (gzip: 911.37 kB) |

## Verifica finale

| Verifica | Stato |
|----------|-------|
| `git status --short` | Pulito |
| `git diff --check` | Nessun errore |
| `npx tsc --noEmit` | Nessun errore |
| `npx vitest run` | 728 passati (28 file) |
| `npm run build` | Successo |
| `npm run build-storybook` | Successo |

## Nota

Le immagini effettive devono essere catturate durante una sessione browser con il server di sviluppo attivo (`npm run dev`). Le descrizioni sopra riportate definiscono il contenuto atteso di ciascuna schermata.