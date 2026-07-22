# CurManLight — Contratti dei Componenti UI

## UiButton

### Varianti

| Variante | Aspetto | Uso |
|---|---|---|
| primary | Sfondo pieno `var(--ui-action)`, testo bianco | Azione principale del contesto |
| secondary | Bordo `var(--ui-border)`, sfondo trasparente | Azioni alternative |
| quiet | Nessun bordo, sfondo trasparente | Azioni di bassa priorità |
| danger | Sfondo `var(--ui-danger)`, testo bianco | Conferma operazione distruttiva |

### Dimensioni

| Dimensione | Altezza | Font | Padding |
|---|---|---|---|
| small | 32px | 13px | 0 12px |
| medium | 36px | 14px | 0 16px |

### Stati

- default
- hover (colore più scuro)
- focus (anello 2px var(--ui-focus))
- disabled (opacity 0.5, cursor not-allowed)
- loading (spinner animato)

### Requisiti

- Pulsante HTML reale (`<button>`)
- Area cliccabile minima 32×32px
- Focus visibile
- Nessuna icona obbligatoria
- Ordine coerente: icona a sinistra, testo a destra
- Nessun colore arbitrario passato dal chiamante

---

## UiPanel

### Varianti

| Variante | Sfondo | Bordo |
|---|---|---|
| default | `var(--ui-surface)` | 1px `var(--ui-border)` |
| subtle | `var(--ui-surface-subtle)` | 1px `var(--ui-border)` |
| emphasized | `var(--ui-surface-emphasis)` | 1px `var(--ui-border-strong)` |

### Proprietà

- titolo opzionale
- descrizione opzionale
- azioni opzionali
- contenuto

### Divieti

- Nessuna icona automatica
- Nessun badge automatico
- Nessuna ombra
- Nessun colore decorativo

---

## UiSectionHeader

### Proprietà

- title (obbligatorio)
- description (opzionale)
- actions (opzionale)

### Stile

- Titolo: 16px, semibold
- Descrizione: 13px, secondary

---

## UiStatusMessage

### Tipi

| Tipo | Colore | Icona | Uso |
|---|---|---|---|
| info | Blu | Info | Informazione contestuale |
| success | Verde | Check | Operazione completata |
| warning | Ambra | Alert | Situazione che richiede attenzione |
| error | Rosso | X | Errore o fallimento |
| unverifiable | Grigio | Help | Stato sconosciuto |
| loading | Grigio | Spinner | Operazione in corso |

### Regola

Mai solo colore. Sempre testo + eventuale icona + eventuale colore.

---

## UiEmptyState

### Proprietà

- icon (opzionale, LucideIcon)
- title (obbligatorio)
- description (opzionale)
- action (opzionale, ReactNode)

### Uso

Per stati vuoti con o senza azione.

---

## UiMetadataList

### Orientamento

- vertical: etichetta a sinistra, valore a destra
- horizontal: elementi in riga con wrap

### Stile

- Etichetta: 12px, muted, medium
- Valore: 13px, text

---

## UiConfirmDialog

### Proprietà

- open (obbligatorio)
- title (obbligatorio)
- message (obbligatorio)
- confirmLabel (default: "Conferma")
- cancelLabel (default: "Annulla")
- variant (default: "danger")
- onConfirm (obbligatorio)
- onCancel (obbligatorio)

### Comportamento

- `showModal()` quando open = true
- Focus trap
- Escape chiude
- Focus restituito all'elemento che ha aperto

---

## UiTabs

### Proprietà

- tabs (obbligatorio, array di {id, label, content})
- defaultTab (opzionale)
- onChange (opzionale)

### Stile

- Tab attivo: bordo inferiore `var(--ui-action)`, testo `var(--ui-action)`
- Tab inattivo: bordo trasparente, testo secondary
