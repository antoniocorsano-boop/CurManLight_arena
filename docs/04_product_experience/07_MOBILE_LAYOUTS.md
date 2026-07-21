# Layout Mobile — CurManLight Product Experience 2.0

> Milestone: CML-600 | Aggiornato: luglio 2026

---

## 1. Principio: Mobile come Esperienza Dedicata

Il mobile NON è un fallback responsive. È un'esperienza progettata per il **docente in movimento**:

- Durante la lezione (feedback rapidi, registrazione voti)
- In consiglio di classe (revisione proposte, votazione)
- In dipartimento (progettazione collaborativa)
- Nel corridoio (verifica stato, comunicazioni)
- In riunione con genitori (certificazione, dati alunno)

### Target Device

- Smartphone: iPhone SE (375px) iPhone 14/15 (390px), Android (360-412px)
- Orientamento: portrait primario, landscape secondario
- Input: touch exclusivo, voice input, no keyboard fisico (tranne rare eccezioni)

---

## 2. Stato Attuale — Problemi Critici

### 2.1 Navigazione

```
Stato attuale: Sidebar completamente nascosta (hidden)
Problema: Nessuna alternativa di navigazione mobile
Risultato: L'utente non può navigare senza desktop
```

### 2.2 Layout

| Problema | Impatto |
|----------|---------|
| Nessuna bottom navigation | Impossibile cambiare schermata |
| Tabelle a 3+ colonne | Scroll orizzontale forzato |
| Font text-[10px] | Illeggibile senza zoom |
| Bottoni 32px | Troppo piccoli per touch |
| Dropdown menu | Non touch-friendly |
| Modal su schermi piccoli | Tagliato o fuori viewport |
| Copilot overlay | Copre il 50% dello schermo |

### 2.3 Utenti colpiti

- Docente in aula con tablet → sidebar nascosta, nessuna navigazione
- Docente in corridoio con smartphone → impossibile usare l'app
- Direttivo durante ispezione → layout rotto su mobile

---

## 3. Architettura Mobile Proposta

### 3.1 Bottom Navigation Bar

```
┌───────────────────────────────────┐
│           HEADER (h-12)          │
│  [≡] CurManLight     [🔍] [👤]  │
├───────────────────────────────────┤
│                                   │
│        CONTENUTO PRINCIPALE       │
│        full width, px-4 py-4     │
│                                   │
│                                   │
│                                   │
│                                   │
│                                   │
├───────────────────────────────────┤
│  [🏠] [📚] [📝] [👥] [⚙️]      │
│  Home Curri Prog Classe Supporto │
└───────────────────────────────────┘
```

### 3.2 Bottom Navigation Items

| Icona | Label | Tab | Badge |
|-------|-------|-----|-------|
| Home | Home | dashboard | - |
| BookOpen | Curricolo | curricolo | pendingCount |
| PenTool | Progett. | progetta-annuale | - |
| Users | Classe | progetta-annuale (classe) | - |
| Settings | Altro | (menu esteso) | - |

### 3.3 Gestione Sub-Tab Mobile

```
┌───────────────────────────────────┐
│  < Consulta Curricolo        [⋯] │
├───────────────────────────────────┤
│  [Albero] [Mappa] [Popolamento]  │  ← Tab scroll orizzontale
├───────────────────────────────────┤
│                                   │
│        Contenuto                  │
│                                   │
└───────────────────────────────────┘
```

---

## 4. Layout Mobile per Schermata

### 4.1 Home Dashboard

```
┌───────────────────────────────────┐
│  CurManLight              [👤]   │
├───────────────────────────────────┤
│                                   │
│  Ciao, Prof.ssa Letizia! 👋     │
│                                   │
│  ┌───────────────────────────┐   │
│  │ Progresso Revisione       │   │
│  │ ████████░░░░ 65%          │   │
│  │ 12/18 proposte decise     │   │
│  └───────────────────────────┘   │
│                                   │
│  ┌──────────┐ ┌──────────┐      │
│  │ UDA      │ │ Approv.  │      │
│  │ Create   │ │          │      │
│  │    8     │ │    5     │      │
│  └──────────┘ └──────────┘      │
│                                   │
│  Azioni Rapide:                  │
│  ┌───────────────────────────┐   │
│  │ ➕ Nuova UDA              │   │
│  ├───────────────────────────┤   │
│  │ 📖 Consulta Curricolo     │   │
│  ├───────────────────────────┤   │
│  │ 📤 Esporta Documento     │   │
│  └───────────────────────────┘   │
│                                   │
├───────────────────────────────────┤
│  [🏠] [📚] [📝] [👥] [⚙️]      │
└───────────────────────────────────┘
```

**Pattern**: Card statistiche in griglia 2×2, Azioni Rapide in lista verticale con full-width tap targets

### 4.2 Consulta Curricolo

```
┌───────────────────────────────────┐
│  < Consulta Curricolo       [🔍] │
├───────────────────────────────────┤
│  [Albero] [Mappa] [Popolamento]  │ ← scroll orizzontale
├───────────────────────────────────┤
│                                   │
│  Disciplina: [Italiano     ▼]    │ ← Select full-width
│  Ordine:     [Secondaria  ▼]    │
│                                   │
│  ┌───────────────────────────┐   │
│  │ 📂 ITALIANO — SECONDARIA  │   │
│  │                           │   │
│  │ ▶ Traguardi (5)           │   │
│  │ ▶ Obiettivi (8)           │   │
│  │ ▶ Proposte (3)            │   │
│  └───────────────────────────┘   │
│                                   │
│  ┌───────────────────────────┐   │
│  │ 📂 MATEMATICA — PRIMARIA │   │
│  │                           │   │
│  │ ▶ Traguardi (4)           │   │
│  │ ▶ Obiettivi (6)           │   │
│  │ ▶ Proposte (2)            │   │
│  └───────────────────────────┘   │
│                                   │
├───────────────────────────────────┤
│  [🏠] [📚] [📝] [👥] [⚙️]      │
└───────────────────────────────────┘
```

**Pattern**: Accordion cards, filtri come dropdown full-width, zero tabelle

### 4.3 Revisione (Gap 2025)

```
┌───────────────────────────────────┐
│  < Revisione               [🔍]  │
├───────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐      │
│  │ In corso │ │ Approv.  │      │
│  │    12    │ │    20    │      │
│  └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐      │
│  │ Rifiut.  │ │ Custom   │      │
│  │    8     │ │    5     │      │
│  └──────────┘ └──────────┘      │
│                                   │
│  Filtri: [Tutti ▼]              │
│                                   │
│  ┌───────────────────────────┐   │
│  │ 📋 Italiano — Secondaria │   │
│  │ "Comprensione del testo" │   │
│  │                          │   │
│  │ Vecchio: Analisi gramm.. │   │
│  │ Nuovo: Comprensione cr.. │   │
│  │                          │   │
│  │ [✓] [✏️] [✗]             │   │
│  └───────────────────────────┘   │
│                                   │
│  ┌───────────────────────────┐   │
│  │ 📋 Matematica — Primaria │   │
│  │ ...                     │   │
│  └───────────────────────────┘   │
│                                   │
├───────────────────────────────────┤
│  [🏠] [📚] [📝] [👥] [⚙️]      │
└───────────────────────────────────┘
```

**Pattern**: Stats in griglia 2×2, Card proposte full-width con azioni inline

### 4.4 Progettazione UDA (Wizard)

```
┌───────────────────────────────────┐
│  < Nuova UDA               [✕]   │
├───────────────────────────────────┤
│  ① Info ── ② Traguardi ── ③ Task│
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░  │
├───────────────────────────────────┤
│                                   │
│  Titolo UDA:                     │
│  ┌───────────────────────────┐   │
│  │ Il bosco e i ritmi...    │   │
│  └───────────────────────────┘   │
│                                   │
│  Disciplina: [Scienze ▼]         │
│  Periodo:    [I Trim.  ▼]       │
│  Ore:        [15]               │
│                                   │
│  Traguardi:                      │
│  ☑ Osserva organismi viventi    │
│  ☐ Descrive fenomeni naturali   │
│  ☑ Associa stagioni ai cambi..  │
│                                   │
│  Compito di Realtà:              │
│  ┌───────────────────────────┐   │
│  │ Realizzazione erbario...  │   │
│  │                           │   │
│  └───────────────────────────┘   │
│                                   │
│  ┌───────────────────────────┐   │
│  │     💾 Salva UDA          │   │
│  └───────────────────────────┘   │
│                                   │
├───────────────────────────────────┤
│  [🏠] [📚] [📝] [👥] [⚙️]      │
└───────────────────────────────────┘
```

**Pattern**: Step indicator con progress bar, form full-width, checkbox con area touch amplia

### 4.5 Classe / Feedback Studenti

```
┌───────────────────────────────────┐
│  < Classe                  [⋯]   │
├───────────────────────────────────┤
│  [Registro] [Strum.] [Pianif.]  │
├───────────────────────────────────┤
│                                   │
│  👤 Marco R. — Avanzato ⭐⭐⭐  │
│  ┌───────────────────────────┐   │
│  │ Osservazione:             │   │
│  │ [________________]       │   │
│  │                           │   │
│  │ Livello: [Avanzato ▼]    │   │
│  │ Stelle:  ★★★☆☆           │   │
│  │                           │   │
│  │ [💾 Salva]               │   │
│  └───────────────────────────┘   │
│                                   │
│  👤 Lucia B. — Intermedio ⭐⭐  │
│  ┌───────────────────────────┐   │
│  │ ...                     │   │
│  └───────────────────────────┘   │
│                                   │
├───────────────────────────────────┤
│  [🏠] [📚] [📝] [👥] [⚙️]      │
└───────────────────────────────────┘
```

**Pattern**: Card per studente con tap per espandere, input con textarea full-width

---

## 5. Context-Aware Mobile Usage

### 5.1 Durante la Lezione

**Scenario**: Docente osserva attività in classe, registra rapidamente

| Azione | Implementazione |
|--------|-----------------|
| Feedback alunno | Card espandibile con slider livello + textarea |
| Registra voto | Input numerico con conferma rapida |
| Note osservazione | Textarea con voice input |
| Quick status | Badge colorati su home dashboard |

**Requisiti**: 
- Massimo 2 tap per completare un'azione
- Voice input per note veloci
- Auto-save dopo ogni modifica
- Modalità offline garantita

### 5.2 In Consiglio di Classe

**Scenario**: Revisione collettiva proposte, votazione

| Azione | Implementazione |
|--------|-----------------|
| Vedi proposta | Card con confronto vecchio/nuovo |
| Approva/Rifiuta | Bottoni grandi con conferma |
| Personalizza | Textarea espandibile |
| Statistiche | Barra progresso in alto |

**Requisiti**:
- navigazione tra proposte con swipe
- statistiche live aggiornate
- export PDF per verbale

### 5.3 In Dipartimento

**Scenario**: Progettazione collaborativa UDA

| Azione | Implementazione |
|--------|-----------------|
| Compila UDA | Wizard mobile con step indicator |
| Seleziona traguardi | Checkbox con testo leggibile |
| Salva bozza | Salvataggio automatico |
| Condividi | Link condivisibile (futuro) |

### 5.4 Nel Corridoio

**Scenario**: Verifica rapida, comunicazione

| Azione | Implementazione |
|--------|-----------------|
| Stato revisione | Home dashboard con badge |
| Notifica | Push notification (futuro) |
| Cerca | Search bar fullscreen |

### 5.5 In Riunione con Genitori

**Scenario**: Consultazione certificazione, dati alunno

| Azione | Implementazione |
|--------|-----------------|
| Cerca alunno | Search con filtro rapido |
| Vedi certificazione | Card con dati essenziali |
| Esporta | PDF singolo alunno |

---

## 6. Gesture Mobile

| Gesture | Azione | Contesto |
|---------|--------|----------|
| Tap | Seleziona, attiva | Ovunque |
| Long press | Menu contestuale (copia, condividi) | Card, testo |
| Swipe left | Prossimo item / elimina | Lista proposte |
| Swipe right | Item precedente | Lista proposte |
| Pull down | Aggiorna | Dashboard |
| Pinch | Zoom (opzionale) | Tabelle grandi |

---

## 7. Specifiche Tecniche Mobile

### 7.1 Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
```

### 7.2 Touch

```css
/* Minimum touch target */
button, a, [role="button"] {
  min-height: 44px;
  min-width: 44px;
}
```

### 7.3 Safe Areas

```css
/* iPhone notch support */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

### 7.4 Bottom Navigation Height

```
Bottom nav: 64px (h-16)
Safe area: +34px on iPhone X+
Total: 98px reserved at bottom
```

### 7.5 Font Scaling

```
Base: 16px (prevents iOS zoom on input focus)
Body: 14px minimum
Labels: 12px minimum
Badges: 10px minimum
```

---

## 8. Pianificazione Implementazione Mobile

### Fase 1 — Navigation Foundation
- [ ] Bottom navigation bar con 5 items
- [ ] Header mobile compatto (h-12)
- [ ] Back navigation per sub-tab
- [ ] Rimozione sidebar su mobile

### Fase 2 — Content Adaptation
- [ ] Tabelle → Card layout
- [ ] Form full-width
- [ ] Accordion per dati gerarchici
- [ ] Font size adjustment

### Fase 3 — Touch Optimization
- [ ] Touch targets 44×44px
- [ ] Swipe gestures per liste
- [ ] Pull to refresh
- [ ] Voice input integration

### Fase 4 — Context Features
- [ ] Quick feedback mode (lezione)
- [ ] Offline-first guarantee
- [ ] Auto-save
- [ ] Push notifications (futuro)
