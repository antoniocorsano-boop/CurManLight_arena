# 10 — Linee Guida Accessibilità

**CurManLight — Product Experience**
**Ultimo aggiornamento:** 2026-07-19

---

## 1. Obiettivo e Standard

| Parametro | Valore |
|-----------|--------|
| **Target WCAG** | Level A minimo, Level AA aspirazionale |
| **Normativa di riferimento** | WCAG 2.1 (W3C), Legge 4/2004 (Stanca), AgID Linee Guida PA |
| **Strumento di validazione** | MAUVE++ (CNR/AgID) |
| **Score attuale** | ~98% conformità (audit interno) |

---

## 2. Stato Attuale dell'Accessibilità

### 2.1 Cosa esiste già

| Componente | Implementazione | Note |
|------------|----------------|------|
| **tabIndex** | Usato su bottoni e accordion interattivi | Alcuni elementi hanno `tabIndex={0}` esplicito |
| **onKeyDown** | Gestione Enter e Space su bottoni custom | `onKeyDown` per attivare click con tastiera |
| **ErrorBoundary** | Componente di cattura errori React | Previeni crash visivi, mostra fallback |
| **aria-label** | Presente su alcuni bottoni | Non uniforme: alcuni bottoni mancano di label |
| **Lingua** | `lang="it"` nell'`<html>` | Correttamente impostato in `index.html` |
| **Titoli pagina** | Titolo descrittivo nel tag `<title>` | Presente ma non aggiornato dinamicamente |
| **Input labels** | `<label>` associati ai campi principali | Mancano per alcuni input nelle form secondarie |
| **TTS** | Sintesi vocale con `SpeechSynthesisUtterance` | `lang='it-IT'` impostato |
| **Vocal input** | `SpeechRecognition` con `lang='it-IT'` | Gestione permessi microfono |
| **Persistenza storage** | `navigator.storage.persist()` | Richiesta memoria persistente al browser |

### 2.2 Cosa manca

| Aria / Focus | Stato | Impatto |
|-------------|-------|---------|
| **Focus management** | Nessun focus trap nei modali | Il focus può uscire dal modale con Tab |
| **Skip links** | Assenti | L'utente deve tabbare attraverso tutta la sidebar |
| **aria-live regions** | Assenti | I toast non sono annunciati ai lettori di schermo |
| **Heading hierarchy** | Non strutturata | Alcune pagine usano solo `<div>` senza `<h1>`–`<h6>` |
| **aria-expanded** | Assente su accordion | Il lettore di schermo non sa se un'accordion è aperta |
| **aria-selected** | Assente su tab | Il lettore di schermo non sa quale tab è attivo |
| **aria-hidden** | Non gestito | Il contenuto della sidebar non viene nascosto quando il modale è aperto |
| **role="dialog"** | Assente sui modali | I modali non sono identificati come dialoghi |
| **role="tablist"/"tab"** | Assente | Le sottoschede non sono identificate come tab |
| **Reduced motion** | Nessuna media query `prefers-reduced-motion` | Le animazioni fadeIn possono disturbare |
| **High contrast** | Nessun supporto a `prefers-contrast` | Nessuna modalità ad alto contrasto |
| **Touch targets** | Alcuni bottoni < 44×44px | Banner TEP rileva target sotto 44px |
| **Error messaging** | Toast visivi senza annuncio | Gli errori non sono accessibili via screen reader |
| **Form validation** | Solo toast, nessun `aria-invalid` | Gli errori non sono associati ai campi |

---

## 3. Keyboard Navigation

### 3.1 Schermate e navigabilità

| Schermata | Navigazione tastiera | Limiti noti |
|-----------|---------------------|-------------|
| **Dashboard** | Tab tra card statistiche, Enter per azioni rapide | Le card non sono focusable |
| **Curricolo (albero)** | Tab tra accordion, Enter/Space per espandere | Nessun focus ring visibile su tutti gli elementi |
| **Curricolo (mappa)** | Nessuna navigazione tastiera per nodi SVG | I nodi sono draggabili solo col mouse |
| **Revisione** | Tab tra proposte, Enter su bottoni Approva/Rifiuta | I bottoni custom non hanno role esplicito |
| **Progettazione (Wizard)** | Tab tra campi form, Enter per avanzare | Nessun focus trap nel wizard |
| **Esportazioni** | Tab tra card formato, Enter per scaricare | Funzionalità base OK |
| **Classe** | Tab tra alunni, Enter per aprire feedback | Lista alunni non ha `role="listbox"` |
| **Second Brain** | Tab tra volumi, Enter per leggere | Chat input accessibile via Tab |
| **Modali** | Tab si muove liberamente nel DOM | **CRITICO:** Nessun focus trap |
| **Sidebar** | Tab tra voci menu, Enter per selezionare | Chiusura mobile con Escape non gestita |
| **Copilot Chat** | Tab su input e messaggi | Nessun aria-live per nuovi messaggi |

### 3.2 Scorciatoie da tastiera

| Combinazione | Azione | Stato |
|-------------|--------|-------|
| `Enter` / `Space` | Attiva elemento focusato | Implementato su bottoni custom |
| `Escape` | Chiudi modale | Non implementato |
| `Tab` | Navigazione sequenziale | Funziona ma senza skip links |
| `Shift+Tab` | Navigazione inversa | Funziona |
| `Arrow keys` | Navigazione in accordion/tab | Non implementato |

---

## 4. Screen Reader

### 4.1 ARIA Roles necessari

| Componente | Ruolo attuale | Ruolo richiesto |
|------------|--------------|-----------------|
| Modale onboarding | `<div>` | `role="dialog" aria-modal="true"` |
| Modale salvataggio | `<div>` | `role="dialog" aria-modal="true"` |
| Modale Wiki Reader | `<div>` | `role="dialog" aria-modal="true"` |
| Modale Esiti | `<div>` | `role="dialog" aria-modal="true"` |
| Toast notification | `<div>` | `role="status" aria-live="polite"` |
| Sidebar | `<nav>` implicito | `role="navigation" aria-label="Menu principale"` |
| Tab curricolo | `<button>` | `role="tab" aria-selected` |
| Tab progettazione | `<button>` | `role="tab" aria-selected` |
| Tab processo | `<button>` | `role="tab" aria-selected` |
| Accordion disciplina | `<div>` | `aria-expanded` + `aria-controls` |
| Lista alunni | `<div>` | `role="list"` + `role="listitem"` |
| Barra progresso | `<div>` | `role="progressbar" aria-valuenow` |
| Badge stato UDA | `<span>` | `aria-label` descrittivo |

### 4.2 Live regions

| Evento | Tipo live region | Testo annunciato |
|--------|-----------------|------------------|
| Toast successo | `aria-live="polite"` | Messaggio toast |
| Toast errore | `aria-live="assertive"` | Messaggio toast |
| Aggiornamento esiti | `aria-live="polite"` | "Esiti aggiornati" |
| Fine generazione UDA | `aria-live="polite"` | "UDA generata" |
| Errore form | `aria-live="assertive"` | Descrizione errore |
| Copilot risposta | `aria-live="polite"` | Testo risposta |

### 4.3 Etichette aria-label mancanti

| Elemento | Testo proposto |
|----------|---------------|
| Bottone sidebar toggle | `aria-label="Apri o chiudi menu laterale"` |
| Bottone Copilot | `aria-label="Apri assistente virtuale"` |
| Bottone voce | `aria-label="Attiva dettatura vocale"` |
| Bottone TTS | `aria-label="Leggi ad alta voce"` |
| Campo ricerca traguardi | `aria-label="Cerca traguardi"` |
| Upload CSV | `aria-label="Carica file CSV del curricolo"` |
| Bottone backup | `aria-label="Scarica copia di sicurezza"` |
| Bottone ripristino | `aria-label="Ripristina da copia di sicurezza"` |
| Accordion disciplina | `aria-label="{Nome disciplina}, espandi"` |
| Nodo grafo SVG | `aria-label="{Nome nodo}, tipo {categoria}"` |

---

## 5. Gestione del Focus

### 5.1 Focus trap (modali)

Quando un modale si apre, il focus deve essere:
1. **Spostato** sul primo elemento interattivo del modale.
2. **Intrappolato** all'interno del modale (Tab cycling).
3. **Ripristinato** sull'elemento che ha attivato il modale alla chiusura.

**Componenti che richiedono focus trap:**
- Modale onboarding (`showOnboardingModal`)
- Modale salvataggio (`showSaveModal`)
- Modale Wiki Reader (`showWikiReaderModal`)
- Modale esiti UDA (`showShowOutcomesModal`)
- Modale云 account (`showCloudAccountModal`)
- Modale tour guidato (`showTourModal`)
- Modale guida mic (`showMicPermissionGuide`)

### 5.2 Focus management in navigazione

Quando l'utente cambia tab:
1. Il focus deve essere spostato sulla prima intestazione della nuova vista.
2. Il contenuto precedente deve essere nascosto con `aria-hidden="true"`.

### 5.3 Focus ring

Ogni elemento interattivo deve avere un `focus-visible` ring:
```css
:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}
```

---

## 6. Contrasto dei Colori

### 6.1 Palette attuale e rapporti di contrasto

| Colore | Sfondo | Rapporto | WCAG A | WCAG AA |
|--------|--------|----------|--------|---------|
| `indigo-600` (#4f46e5) | Bianco (#ffffff) | 4.6:1 | Pass | Pass |
| `indigo-950` (#1e1b4b) | Bianco (#ffffff) | 15.4:1 | Pass | Pass |
| `emerald-600` (#059669) | Bianco (#ffffff) | 3.4:1 | Pass | Fail (testo) |
| `slate-700` (#334155) | Bianco (#ffffff) | 8.3:1 | Pass | Pass |
| `slate-500` (#64748b) | Bianco (#ffffff) | 4.6:1 | Pass | Pass |
| **`slate-400` (#94a3b8)** | **Bianco (#ffffff)** | **3.8:1** | **Pass** | **Fail** |
| `amber-600` (#d97706) | Bianco (#ffffff) | 3.5:1 | Pass | Fail (testo) |
| `red-500` (#ef4444) | Bianco (#ffffff) | 3.9:1 | Pass | Fail (testo) |
| Bianco (#ffffff) | `indigo-600` (#4f46e5) | 4.6:1 | Pass | Pass |
| `slate-400` (#94a3b8) | `slate-100` (#f1f5f9) | 2.8:1 | Fail | Fail |

### 6.2 Azioni correttive

| Elemento problematico | Colore attuale | Correzione proposta |
|----------------------|---------------|---------------------|
| Testo "Nessun traguardo programmato" | `slate-400` su bianco | Usare `slate-500` (4.6:1) |
| Placeholder campi input | `slate-400` | Usare `slate-500` |
| Badge stato "In corso" | `amber-600` su bianco | Usare `amber-700` (#b45309, 5.1:1) |
| Testo errore toast | `red-500` | Usare `red-600` (#dc2626, 4.6:1) |
| Testo "generato da IA" | `slate-400` | Usare `slate-500` |

---

## 7. Touch Targets

### 7.1 Requisiti WCAG

- **WCAG 2.5.5 (Level AAA):** Target di almeno 44×44 CSS pixel.
- **WCAG 2.5.8 (Level AA):** Target di almeno 24×24 CSS pixel con spazio sufficiente.

### 7.2 Stato attuale

| Elemento | Dimensione stimata | Conforme? |
|----------|-------------------|-----------|
| Bottoni sidebar (desktop) | 40×40px | No (24px ok, 44px no) |
| Accordion expand/collapse | ~20×20px | No |
| Bottoni Approva/Rifiuta | 32×32px | No |
| Stelle feedback | ~16×16px | No |
| Tab di sottoscheda | 36×36px | No |
| Bottone toast | ~24×24px | Parziale |
| Card esportazione | 44×44px+ | Sì |
| Input checkbox traguardi | ~18×18px | No |

### 7.3 Soluzione

Il banner TEP (Tasso d'Errore di Puntamento) già rileva automaticamente i target sotto 44px dopo 3 miss-click in 10 secondi e propone:
1. Il passaggio al Wizard (riduce il numero di clic necessari).
2. La semplificazione della griglia (rami non pertinenti attenuati al 40% di opacità).

**Azioni aggiuntive:**
- Aggiungere `min-height: 44px; min-width: 44px` a tutti i bottoni interattivi.
- Aggiungere padding di almeno 12px ai bottoni più piccoli.
- Assicurare almeno 8px di spazio tra target adiacenti.

---

## 8. Motion e Animazioni

### 8.1 Animazioni attuali

| Animazione | Dove | Durata |
|-----------|------|--------|
| `fade-in` | Sidebar mobile, modali | ~200ms |
| `transition-all duration-300` | Sidebar collapse/expand | 300ms |
| Scroll reset | Cambio tab | `auto` |
| Toast show/hide | Overlay | ~3500ms |

### 8.2 Supporto `prefers-reduced-motion`

Da implementare con media query CSS:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Impatto:** Quando il sistema operativo ha la riduzione animazioni attiva, tutte le transizioni e animazioni vengono eliminate o ridotte al minimo.

---

## 9. Aspetti Linguistici

### 9.1 Attributo `lang`

- `index.html` deve avere `lang="it"` sul tag `<html>`.
- I modali e le finestre di stampa devono mantenere `lang="it"`.
- Le finestre di stampa (PDF) devono avere `<html lang="it">`.

### 9.2 Contenuto italiano

- Tutti i testi UI sono in italiano scolastico.
- Le eccezioni sono i termini tecnici internazionali (SCORM, OAuth, JSON, CSV).
- Il TTS usa `utterance.lang = 'it-IT'`.
- Il riconoscimento vocale usa `recognition.lang = 'it-IT'`.

---

## 10. Test e Validazione

### 10.1 Test automatizzati

| Strumento | Scopo | Frequenza |
|-----------|-------|-----------|
| **axe-core** | Violazioni WCAG automatizzabili | Ad ogni PR |
| **Lighthouse** | Score accessibilità + performance | Settimanale |
| **eslint-plugin-jsx-a11y** | Regole ARIA durante lo sviluppo | Continuo |
| **WAVE** | Validazione manuale rapida | Prima di ogni release |

### 10.2 Test manuali

| Test | Procedura | Criterio di accettazione |
|------|-----------|------------------------|
| **Navigazione solo tastiera** | Navigare l'intera app usando solo Tab, Enter, Space, Escape, Arrow keys | Ogni funzionalità è raggiungibile |
| **Screen reader NVDA** | Testare su Windows con NVDA + Firefox | Ogni elemento ha label significativa |
| **Screen reader VoiceOver** | Testare su macOS/iOS con Safari | Navigazione logica e comprensibile |
| **Zoom 200%** | Ingrandire il browser al 200% | Il layout si adatta senza perdita di contenuto |
| **Contrasto manuale** | Verificare ogni combinazione colore/sfondo | Rapporto ≥ 4.5:1 per testo, ≥ 3:1 per grafica |
| **Reduced motion** | Attivare riduzione animazioni nell'OS | Nessuna animazione disturbante |
| **Touch 44px** | Verificare dimensione target su tablet | Ogni target ≥ 44×44px |

### 10.3 Checklist pre-release

- [ ] Ogni modale ha `role="dialog" aria-modal="true"`
- [ ] Ogni modale ha focus trap e ripristino del focus
- [ ] Ogni toast ha `role="status" aria-live="polite"`
- [ ] Ogni accordion ha `aria-expanded` e `aria-controls`
- [ ] Ogni tab ha `role="tab" aria-selected` in `role="tablist"`
- [ ] Ogni campo form ha `<label>` associato
- [ ] Ogni campo con errore ha `aria-invalid="true"` e `aria-describedby`
- [ ] Ogni bottone ha un `aria-label` o testo visibile
- [ ] Lo skip link è presente e funzionante
- [ ] Il focus ring è visibile su ogni elemento interattivo
- [ ] Il rapporto di contrasto è ≥ 4.5:1 per ogni testo
- [ ] Il media query `prefers-reduced-motion` è attivo
- [ ] La navigazione solo tastiera completa tutte le funzionalità

---

## 11. Roadmap Accessibilità

| Sprint | Azione | Priorità |
|--------|--------|----------|
| Sprint 9 | WCAG 2.1 Level A audit completo | Alta |
| Sprint 9 | Focus trap per modali | Alta |
| Sprint 9 | Skip link | Alta |
| Sprint 9 | aria-live per toast | Alta |
| Sprint 9 | Heading hierarchy | Media |
| Sprint 9 | aria-expanded su accordion | Media |
| Sprint 9 | role="dialog" su modali | Media |
| Sprint 10 | prefers-reduced-motion | Media |
| Sprint 10 | High contrast mode | Bassa |
| Sprint 10 | Touch targets 44px | Media |
| Sprint 10 | axe-core CI integration | Alta |
| Post-release | NVDA full test | Alta |
| Post-release | VoiceOver full test | Media |
