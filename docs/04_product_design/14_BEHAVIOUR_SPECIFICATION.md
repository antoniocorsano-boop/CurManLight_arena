# CML-601 — Specifica del Comportamento

> Contesto: CurManLight — gestione curricolo per scuole italiane
> Stack: React 18, TypeScript, Zustand, Dexie, Tailwind CSS
> Flussi: Transizioni schermate, interazioni utente, catene di causa-effetto

---

## Indice

1. [Dashboard](#dashboard)
2. [Curricolo](#curricolo)
3. [Revisione](#revisione)
4. [Progettazione UDA](#progettazione-uda)
5. [Classe](#classe)
6. [Export](#export)
7. [Comportamenti Globali](#comportamenti-globali)

---

## Dashboard

### Flusso 1 — Click "Consulta Curricolo"

```
Trigger:        click su Quick Action "Consulta Curricolo"
Animazione:     slideLeft 300ms ease-out sul contenuto
                Quick Action card: scale(0.98) 100ms (feedback tattile)
Aggiornamento:  Zustand: activeTab = 'curricolo'
                Nessun sub-tab modificato (mantiene lo stato precedente)
Focus:          focus() su <h1> della schermata Curricolo
                screen reader: announca "Sezione Curricolo"
Persistenza:    Zustand state → localStorage (debounced 500ms)
                Dexie: nessuna modifica
Transizione:    Contenuto Dashboard → slideLeft → Contenuto Curricolo
                La Dashboard è rimossa dal DOM (non nascosta)
```

### Flusso 2 — Click "Nuova UDA"

```
Trigger:        click su Quick Action "Nuova UDA"
Animazione:     slideLeft 300ms ease-out sul contenuto
                Quick Action card: scale(0.98) 100ms (feedback tattile)
Aggiornamento:  Zustand: activeTab = 'progetta-annuale'
                Zustand: activeProgTab = 'annuale'
                Zustand: wizardStep = 0 (reset a primo passaggio)
Focus:          focus() sul primo input del Wizard (titolo UDA)
                screen reader: announca "Creazione UDA - Passaggio 1 di 4"
Persistenza:    Zustand state → localStorage (debounced 500ms)
                Dexie: crea bozza UDA con UUID
Transizione:    Contenuto Dashboard → slideLeft → Wizard UDA
                Il Wizard apre a step 1 (Informazioni generali)
```

### Flusso 3 — Click avatar menu

```
Trigger:        click sull'avatar nell'Header
Animazione:     scale 95→100 + opacity 0→1, 150ms ease-out
                backdropFadeIn (se applicabile)
Aggiornamento:  Nessun cambio di navigazione
                Zustand: dropdownOpen = true (solo stato locale)
Focus:          focus() sul primo item del dropdown ("Profilo")
                Tab trap dentro il dropdown
Persistenza:    Nessuna modifica allo stato persistente
Transizione:    Nessuna navigazione — solo apertura menu dropdown
                Chiusura: click esterno o Escape → scale 100→95, opacity 1→0, 100ms
```

### Flusso 4 — Click "Connetti Cloud"

```
Trigger:        click su Quick Action "Connetti Cloud" o pulsante dedicato
Animazione:     Modal apertura: backdropFadeIn + scale 95→100, 250ms ease-out
                Quick Action: scale(0.98) 100ms (feedback tattile)
Aggiornamento:  Zustand: modalOpen = 'cloud-connect'
                Focus trap attivato sul modal
Focus:          focus() sul pulsante principale del modal ("Accedi con Google"/"Accedi con Microsoft")
                aria-hidden="true" sul contenuto principale
Persistenza:    Dexie: salta (l'autenticazione è esterna)
                Zustand: mantiene la tab corrente
Transizione:    Dashboard (o sezione corrente) → Modal overlay
                Dopo autenticazione: Modal → redirect OAuth → callback → Modal aggiornato → success toast → Modal close
```

---

## Curricolo

### Flusso 5 — Click disciplina dropdown

```
Trigger:        selezione di una disciplina nel dropdown
Animazione:     accordion rebuild: height auto → 0 → height auto
                fadeOut vecchio contenuto 200ms, fadeIn nuovo contenuto 250ms
                Dropdown: scale 100→95 + fadeOut 100ms (chiusura)
Aggiornamento:  Zustand: selectedDisciplina = [id disciplina]
                Dexie: query discipline filtrata per disciplina selezionata
Focus:          focus() sul primo accordion espanso del nuovo contenuto
                screen reader: annunciare "[Nome Disciplina] selezionata, N risultati"
Persistenza:    Zustand state → localStorage
                Dexie: nessuna modifica (solo lettura)
Transizione:    Contenuto curricolo corrente → rebuild con nuova disciplina
                Gli accordion si ricostruiscono con i dati della nuova disciplina
```

### Flusso 6 — Click accordion expand

```
Trigger:        click sul trigger dell'accordion (titolo o chevron)
Animazione:     chevron rotate 0→90°, 200ms ease-out
                Contenuto: height 0→auto, 250ms ease-out
                fadeIn contenuto, 200ms ease-out
Aggiornamento:  Nessuna modifica Zustand (solo stato locale accordion)
                Nessuna modifica Dexie
Focus:          focus() sul primo elemento figlio dell'accordion
                screen reader: annunciare "Sezione espansa, N elementi"
Persistenza:    Nessuna modifica persistente (solo UI state)
Transizione:    Contenuto collassato → expand con animazione height
                Se l'accordion ha figli lazy-loaded, mostra Skeleton durante caricamento
```

### Flusso 7 — Click "Mappa" sub-tab

```
Trigger:        click sul sub-tab "Mappa"
Animazione:     contentCrossfade: fadeOut contenuto corrente 200ms
                fadeIn contenuto Mappa 250ms
                Sub-tab indicator: slideRight al tab selezionato 200ms
Aggiornamento:  Zustand: activeCurricoloTab = 'mappa'
                Dexie: query per generare dati SVG della mappa
Focus:          focus() sul SVG della mappa o sul primo elemento interattivo
                screen reader: annunciare "Mappa del curricolo"
Persistenza:    Zustand state → localStorage
                Dexie: nessuna modifica
Transizione:    Vista Elenco/Accordion → crossfade → Vista Mappa SVG
                Il contenuto precedente è rimosso dal DOM
```

### Flusso 8 — Click "Popolamento" sub-tab

```
Trigger:        click sul sub-tab "Popolamento"
Animazione:     contentCrossfade: fadeOut contenuto corrente 200ms
                fadeIn contenuto Popolamento 250ms
                Sub-tab indicator: slideRight al tab selezionato 200ms
Aggiornamento:  Zustand: activeCurricoloTab = 'popolamento'
                Zustand: popolamentoView = 'csv' (default)
                Dexie: query popolamento per disciplina corrente
Focus:          focus() sul tab "CSV" o "AI" (primi tab interni)
                screen reader: annunciare "Popolamento curricolo"
Persistenza:    Zustand state → localStorage
                Dexie: nessuna modifica
Transizione:    Vista precedente → crossfade → Vista Popolamento
                Contenuto: due tab interni (CSV e AI)
```

---

## Revisione

### Flusso 9 — Click "Approva"

```
Trigger:        click sul pulsante "Approva" nella revisione
Animazione:     buttonPulse: scale 100→105→100, 500ms ease-in-out
                badge update: color transition amber→emerald, 300ms
                stats recalculate: fadeNumber transition, 300ms
Aggiornamento:  Zustand: revisionStatus = 'approvato'
                Dexie: aggiorna curricolo.status = 'approvato'
                Dexie: aggiorna curricolo.approvedAt = new Date()
                Dexie: aggiorna curricolo.approvedBy = userId
Focus:          focus() rimane sul pulsante (aggiornato a "Approvato" o disabilitato)
                screen reader: annunciare "Curricolo approvato"
Persistenza:    Dexie: modifica persistente (aggiornamento curricolo)
                Zustand: revisionStatus aggiornato
                Statistiche dashboard ricalcolate
Transizione:    Nessuna navigazione — aggiornamento inline
                Il pulsante "Approva" diventa badge "Approvato" o si disabilita
```

### Flusso 10 — Click "Personalizza"

```
Trigger:        click sul pulsante "Personalizza" accanto alla nota di revisione
Animazione:     textarea expand: height 0→auto, 200ms ease-out
                borderColor transition: border-slate-200→border-primary-500, 150ms
Aggiornamento:  Nessuna modifica Zustand (solo stato locale textarea)
                Focus: focus() sulla textarea
Focus:          focus() sulla textarea per scrivere la nota
                screen reader: annunciare "Nota di revisione, campo di testo"
Persistenza:    Salvataggio automatico su blur (onBlur event)
                Dexie: aggiorna curricolo.revisionNote = testo
Transizione:    Testo statico → textarea espandibile
                On blur: textarea si collassa, testo salvato diventa visibile
```

### Flusso 11 — Click filter tab (Revisione)

```
Trigger:        click su un tab filtro (es. "In revisione", "Approvati", "Tutti")
Animazione:     listFilterAnimation:
                - Elementi rimossi: fadeOut 200ms + height auto→0
                - Elementi aggiunti: fadeIn 200ms + height 0→auto
                - Staggered per ogni elemento: 50ms delay
                Tab indicator: slideRight 200ms
Aggiornamento:  Zustand: revisionFilter = [filtro selezionato]
                Dexie: query filtrata per stato
Focus:          focus() sul tab selezionato
                screen reader: annunciare "[Filtro], N risultati"
Persistenza:    Zustand state → localStorage
                Dexie: nessuna modifica (solo lettura)
Transizione:    Lista corrente → filter animation → Lista filtrata
                Gli elementi non corrispondenti al filtro scompaiono con animazione
```

---

## Progettazione UDA

### Flusso 12 — Wizard step 1→2

```
Trigger:        click sul pulsante "Avanti" nello step 1
Animazione:     Validazione: se campi obbligatori mancanti → shake orizzontale 300ms + border-red-500
                Se validazione OK:
                - Contenuto step 1: slideLeft 300ms + fadeOut
                - Contenuto step 2: slideRight da destra 300ms + fadeIn
                - Progress bar: width transition 25%→50%, 300ms ease-out
                - Step indicator: step 1 diventa emerald (completato), step 2 diventa primary (attivo)
Aggiornamento:  Zustand: wizardStep = 2
                Dexie: salva bozza UDA con dati step 1 (autosave)
Focus:          focus() sul primo checkbox/elemento interattivo dello step 2
                screen reader: annunciare "Passaggio 2 di 4: Traguardi"
Persistenza:    Dexie: bozza UDA aggiornata con dati step 1
                Zustand: wizardStep aggiornato
Transizione:    Step 1 (Info) → slideLeft → Step 2 (Traguardi)
                Il contenuto precedente è rimosso dal DOM
```

### Flusso 13 — Click "Salva UDA"

```
Trigger:        click sul pulsante "Salva" nello step finale del wizard
Animazione:     Validazione: se errori → shake + messaggi errore con fade-in
                Se OK:
                - Button: loading state (spinner inline)
                - Contenuto: scale 100→105 + fadeOut 400ms
                - Checkmark animation: scale 0→1 + fadeIn 300ms
                - Toast: slideUp from bottom 60px→0, 300ms ease-out
Aggiornamento:  Dexie: salva UDA completa ( tutti gli step)
                Dexie: aggiorna bozza.status = 'completata'
                Zustand: reset wizard state
                Zustand: activeTab = 'progetta-annuale' + activeProgTab = 'archivio'
Focus:          focus() sul toast per screen reader
                screen reader: annunciare "UDA salvata con successo"
Persistenza:    Dexie: UDA persistita con tutti i campi
                Zustand: navigazione all'archivio
Transizione:    Wizard → checkmark animation → Toast → Archivio UDA
                Il wizard è chiuso, l'utente vede l'archivio con la nuova UDA
```

### Flusso 14 — Archive filter change

```
Trigger:        selezione di un filtro nell'archivio (es. "Bozze", "Completate", "Tutte")
Animazione:     listRe-render:
                - Elementi esistenti: fadeOut 150ms
                - Nuovi elementi: fadeIn staggered 200ms, delay 50ms per item
                - Stagger: ogni card appare 50ms dopo la precedente
                Filter tab: slideRight 200ms
Aggiornamento:  Zustand: archiveFilter = [filtro selezionato]
                Dexie: query filtrata per stato UDA
Focus:          focus() sul tab filtro selezionato
                screen reader: annunciare "Filtro [nome], N risultati"
Persistenza:    Zustand state → localStorage
                Dexie: nessuna modifica (solo lettura)
Transizione:    Lista corrente → fade out → Lista filtrata con stagger fade in
```

---

## Classe

### Flusso 15 — Click student card

```
Trigger:        click su una card studente nella vista Classe
Animazione:     expand animation:
                - Card height: auto con transizione, 250ms ease-out
                - Contenuto nascosto: height 0→auto + fadeIn 200ms
                - Icona: rotate 0→180° (freccia), 200ms
                - Feedback form: slideDown 250ms
Aggiornamento:  Zustand: expandedStudent = [studentId] (solo uno alla volta)
                Dexie: query feedback esistenti per lo studente
Focus:          focus() sulla prima opzione di feedback o sul primo campo del form
                screen reader: annunciare "Dettaglio studente [Nome], form di feedback"
Persistenza:    Nessuna modifica persistente (apertura espansione)
                Dexie: solo lettura feedback esistenti
Transizione:    Card compatta → expand con feedback form inline
                Le altre card si riducono automaticamente
```

### Flusso 16 — Click stella (valutazione)

```
Trigger:        click su una stella nella valutazione dello studente
Animazione:     fill animation:
                - Stella selezionata: scale 0→1.2→1, 300ms ease-out
                - Color transition: text-slate-300→text-amber-400, 150ms
                - Stelle precedenti: fill sequential 50ms delay ciascuna
                - Stelle successive: unfill sequential 50ms delay ciascuna
Aggiornamento:  Dexie: salva valutazione immediatamente (debounced 300ms)
                Dexie: aggiorna studente.valutazione = [valore]
                Zustand: aggiorna statistiche classe
Focus:          focus() rimane sulla stella cliccata
                screen reader: annunciare "Valutazione: 3 su 5 stelle"
Persistenza:    Dexie: salvataggio immediato (non richiede conferma)
                Zustand: statistiche classe aggiornate
Transizione:    Nessuna navigazione — aggiornamento inline della stella
                La valutazione è persistita senza ulteriori azioni
```

### Flusso 17 — Click "Genera Gruppi"

```
Trigger:        click sul pulsante "Genera Gruppi"
Animazione:     Button: loading state (spinner inline + testo "Generazione...")
                Area risultati: skeleton placeholder durante elaborazione
                Risultati: staggered fadeIn 200ms each, delay 50ms per gruppo
                Fallback: se errore → shake + toast errore
Aggiornamento:  Zustand: generatingGroups = true
                Dexie: query studenti per livello
                AI (opzionale): invia dati a modello per suggerimento gruppi
Focus:          focus() rimane sul pulsante (disabilitato durante generazione)
                screen reader: annunciare "Generazione gruppi in corso..."
                Al completamento: annunciare "N gruppi generati"
Persistenza:    Dexie: salva gruppi generati (se confermati dall'utente)
                Zustand: groupsGenerated = true
Transizione:    Nessuna navigazione — risultati appaiono nella stessa schermata
                Skeleton → risultati reali con stagger fade in
```

---

## Export

### Flusso 18 — Click format card

```
Trigger:        click su una card formato (PDF, Word, Excel)
Animazione:     Card: scale(0.98) 100ms (feedback tattile)
                Button: loading state (spinner inline)
                Progress indicator: barra di progresso con transition width
                Success: toast slideUp 300ms + checkmark animation
Aggiornamento:  Zustand: exporting = true, exportFormat = [formato]
                Dexie: query dati UDA/curricolo per esportazione
                Generazione file: blob creation + download trigger
Focus:          focus() rimane sulla card (aggiornata con stato)
                screen reader: annunciare "Esportazione [formato] in corso..."
                Al completamento: annunciare "Esportazione completata"
Persistenza:    Dexie: nessuna modifica (solo lettura per export)
                Zustand: exporting = false dopo completamento
Transizione:    Card stato idle → exporting (spinner) → success (checkmark) → download
                Il file viene scaricato automaticamente dal browser
```

### Flusso 19 — Click "Sincronizza Drive"

```
Trigger:        click sul pulsante "Sincronizza Drive"
Animazione:     Auth check: se non autenticato → Modal apertura (scale 95→100, 250ms)
                Se autenticato: loading state + progress bar
                Success: toast + badge sync aggiornato
Aggiornamento:  Zustand: syncStatus = 'connecting'
                Dexie: verifica credenziali cloud
                OAuth: redirect se necessario
Focus:          focus() sul modal (se aperto) o rimane sul pulsante
                screen reader: annunciare "Connessione a Google Drive in corso..."
Persistenza:    Dexie: salva token di accesso (se ottenuto)
                Zustand: syncStatus aggiornato
Transizione:    Idle → Modal auth (se necessario) → Loading → Success
                Se auth fallita: Modal con errore + retry
```

---

## Comportamenti Globali

### Flusso 20 — Escape key (chiusura modali)

```
Trigger:        pressione tasto Escape
Animazione:     Modal: scale 100→95 + opacity 1→0, 150ms ease-in
                Backdrop: fadeOut 150ms
                Drawer: slideOutLeft + backdropFadeOut, 250ms
                Dropdown: scale 100→95 + opacity 1→0, 100ms
Aggiornamento:  Zustand: modalOpen = null / drawerOpen = false / dropdownOpen = false
                Nessuna modifica Dexie
Focus:          focus() torna sull'elemento che ha aperto il componente
                Se non disponibile: focus() sul primo elemento focusabile della schermata
Persistenza:    Nessuna modifica persistente (solo stato UI)
Transizione:    Componente aperto → Escape → Componente chiuso + focus restore
```

### Flusso 21 — Browser back (navigazione)

```
Trigger:        pressione pulsante "Indietro" del browser
Animazione:     slideRight (inverso della transizione di apertura), 300ms ease-out
                Contenuto corrente: slideRight + fadeOut 200ms
                Contenuto precedente: slideLeft da sinistra + fadeIn 250ms
Aggiornamento:  Zustand: activeTab = [tab precedente]
                Zustand: activeProgTab, activeCurricoloTab, etc. (stato precedente)
                Zustand: popState gestito da history API (se router implementato)
Focus:          focus() sul contenuto principale della schermata precedente
                screen reader: annunciare la sezione precedente
Persistienza:    Zustand state → localStorage (stato aggiornato)
                Nessuna modifica Dexie
Transizione:    Schermata corrente → slideRight → Schermata precedente
                Lo stato viene ripristinato dal Zustand persistito
```

### Flusso 22 — Toast appear/dismiss

```
Trigger:        evento che genera un toast (successo/errore)
Animazione:     Comparsa: slideUp from 60px to 0, opacity 0→1, 300ms ease-out
                Auto-dismiss: countdown 3500ms → slideDown 0→60px, opacity 1→0, 250ms ease-in
                Sostituzione: push animato del toast precedente, 200ms
                Chiusura manuale: slideDown + fadeOut, 250ms
Aggiornamento:  Zustand: toastQueue = [toast] (max 1)
                Dexie: nessuna modifica
Focus:          focus() NON spostato sul toast (il toast è informativo, non modale)
                screen reader: aria-live="polite" announce il messaggio
Persistienza:    Zustand: toastQueue resettato dopo dismiss
                Nessuna modifica Dexie
Transizione:    Nessuna navigazione — il toast appare e scompare overlay
                Il contenuto sottostante non è modificato
```

---

## Matrice delle Transizioni

| # | Trigger | Origine | Destinazione | Direzione | Durata |
|---|---------|---------|-------------|-----------|--------|
| 1 | Consulta Curricolo | Dashboard | Curricolo | slideLeft | 300ms |
| 2 | Nuova UDA | Dashboard | Progettazione | slideLeft | 300ms |
| 3 | Avatar click | Header | Dropdown | scale+fade | 150ms |
| 4 | Connetti Cloud | Qualsiasi | Modal | scale+fade | 250ms |
| 5 | Disciplina select | Curricolo | Curricolo (rebuild) | crossfade | 250ms |
| 6 | Accordion expand | Curricolo | Curricolo (detail) | height | 250ms |
| 7 | Mappa sub-tab | Curricolo | Mappa | crossfade | 250ms |
| 8 | Popolamento sub-tab | Curricolo | Popolamento | crossfade | 250ms |
| 9 | Approva | Revisione | Revisione (stato) | inline | 300ms |
| 10 | Personalizza | Revisione | Revisione (form) | height | 200ms |
| 11 | Filter tab | Revisione | Revisione (filtered) | listFilter | 200ms |
| 12 | Wizard 1→2 | Progettazione | Progettazione | slideLeft | 300ms |
| 13 | Salva UDA | Progettazione | Archivio | scale+fade | 400ms |
| 14 | Archive filter | Progettazione | Progettazione (filtered) | staggerFade | 200ms |
| 15 | Student card | Classe | Classe (detail) | height | 250ms |
| 16 | Star click | Classe | Classe (valutazione) | fill | 300ms |
| 17 | Genera Gruppi | Classe | Classe (gruppi) | skeleton→stagger | 200ms |
| 18 | Format card | Export | Export (download) | progress | — |
| 19 | Sincronizza Drive | Export | Modal/Loading | scale+fade | 250ms |
| 20 | Escape | Qualsiasi | Chiusura | scale+fade | 150-250ms |
| 21 | Browser back | Qualsiasi | Precedente | slideRight | 300ms |
| 22 | Toast | Sistema | Toast | slideUp | 300ms |

---

## Preferenze di Riduzione del Movimento

Tutte le animazioni documentate rispettano la preferenza `prefers-reduced-motion: reduce`:

- **Senza riduzione**: tutte le animazioni come documentato
- **Con riduzione**: tutte le animazioni sono sostituite da `transition: opacity 150ms` (fade semplice) senza movimento

Implementazione:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 150ms !important;
  }
}
```

---

## Riferimenti

- **CML-600**: Design System, libreria componenti, specifiche schermate
- **CML-601/13**: Modello di Interazione UI (20 pattern)
- **WCAG 2.1**: Web Content Accessibility Guidelines (livello AA)
- **Zustand**: Documentazione state management
- **Dexie**: Documentazione IndexedDB wrapper
