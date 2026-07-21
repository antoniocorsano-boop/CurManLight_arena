# Layout Tablet — CurManLight Product Experience 2.0

> Milestone: CML-600 | Aggiornato: luglio 2026

---

## 1. Stato Attuale

CurManLight NON ha un layout tablet dedicato. Il design attuale si basa su breakpoint Tailwind standard:

- **sm** (640px+): breakpoint mobile/tablet
- **md** (768px+): breakpoint tablet/desktop

### Comportamento attuale su tablet

| Elemento | Comportamento | Problema |
|----------|---------------|----------|
| Sidebar | `hidden md:block` — visibile solo da 768px+ | Su tablet in portrait (768-1024px) occupa 256px, lasciando poco spazio al contenuto |
| Header | Full width, h-16 | OK, ma icone troppo piccole per touch |
| Contenuto | `px-4 sm:px-6 lg:px-8` | Padding ridotto, testo spesso tagliato |
| Tabelle | Layout fisso a colonne | Scroll orizzontale necessario |
| Modali | `max-w-2xl mx-auto mt-20` | Ok in landscape, troppo piccolo in portrait |
| Bottoni | `text-xs` con padding ridotto | Target troppo piccoli per touch (minimo 44×44px) |

### Problemi specifici tablet

1. **Target touch**: Molti bottoni usano `text-xs` e padding ridotto, sotto il minimo di 44×44px
2. **Sidebar fisso**: In portrait, la sidebar consuma 256px su 768px = 33% dello schermo
3. **Tabelle**: Le tabelle a 3 colonne del curricolo necessitano di scroll orizzontale
4. **Testo**: `text-[10px]` e `text-[11px]` sono illeggibili su tablet senza zoom
5. **Dropdown**: I menu a tendina non hanno touch gesture

---

## 2. Layout Tablet Proposto

### 2.1 Portrait (768px - 1023px)

```
┌─────────────────────────────────────────┐
│           HEADER (h-14)                 │
│  [≡] [Logo] CurManLight    [Copilot][Avatar] │
├─────────────────────────────────────────┤
│                                         │
│         CONTENUTO PRINCIPALE            │
│         full width                      │
│         px-6 py-4                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │    Contenuto adattato           │   │
│  │    colonne ridotte              │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Regole**:
- Sidebar nascosta di default, aperta come overlay laterale su tap del hamburger
- Contenuto full-width con padding `px-6`
- Font size minimo: 14px per body text
- Touch targets: minimo 48×48px

### 2.2 Landscape (1024px - 1365px)

```
┌─────────────────────────────────────────────────────────────┐
│           HEADER (h-14)                                     │
│  [≡] [Logo] CurManLight              [Copilot] [Avatar]    │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                           │
│   SIDEBAR        │        CONTENUTO PRINCIPALE              │
│   w-56 (224px)   │        flex-1                            │
│                  │        px-6 py-4                          │
│   Compresso      │                                           │
│                  │                                           │
└──────────────────┴──────────────────────────────────────────┘
```

**Regole**:
- Sidebar visibile ma più stretta (224px vs 256px)
- Contenuto con spazio sufficiente per tabelle a 2 colonne
- Touch targets: minimo 44×44px

---

## 3. Adattamenti per Schermata

### 3.1 Dashboard

| Elemento | Portrait | Landscape |
|----------|----------|-----------|
| Statistiche | Stack verticali (1 colonna) | Griglia 2×2 |
| Quick Actions | Stack verticali | Griglia 2 colonne |
| Attività recenti | Full width sotto le stats | Colonna destra |
| Grafico architettura | Nascosto o minimizzato | Full width |

### 3.2 Curricolo

| Elemento | Portrait | Landscape |
|----------|----------|-----------|
| Filtri | Stack verticali | Inline, stessa riga |
| Tabella | Scroll orizzontale o card | 2 colonne |
| Accordion | Full width | Full width, più spazio |
| Proposte | Card stack | Card in griglia |

### 3.3 Revisione

| Elemento | Portrait | Landscape |
|----------|----------|-----------|
| Statistiche | 2 colonne | 4 colonne inline |
| Filtri | Dropdown a tendina | Tabs orizzontali |
| Card proposta | Full width | 2 colonne se landscape |

### 3.4 Progettazione UDA

| Elemento | Portrait | Landscape |
|----------|----------|-----------|
| Form | Full width, campi stack | 2 colonne |
| Step indicator | Scroll orizzontale | Inline |
| Checkbox groups | Full width | 2 colonne |

### 3.5 Esportazioni

| Elemento | Portrait | Landscape |
|----------|----------|-----------|
| Opzioni export | Stack verticali | Griglia 2 colonne |
| Preview | Full width | Colonna destra |

---

## 4. Touch Optimization

### 4.1 Target Size

| Elemento | Minimo attuale | Minimo tablet | Proposto |
|----------|----------------|---------------|----------|
| Bottoni | 32×32px | 44×44px | 48×48px |
| Link | auto | 44×44px | 48×48px |
| Checkbox | 16×16px | 44×44px | 48×48px (area touch) |
| Input | 32px h | 44px h | 48px h |
| Select | 32px h | 44px h | 48px h |

### 4.2 Gesture Support

| Gesture | Azione |
|---------|--------|
| Tap | Seleziona, attiva |
| Long press | Menu contestuale (opzionale) |
| Swipe left/right | Cambia sub-tab (progettazione) |
| Pull down | Aggiorna contenuto (opzionale) |
| Pinch to zoom | Zoom su tabelle grandi (opzionale) |

### 4.3 Typography

| Elemento | Desktop | Tablet |
|----------|---------|--------|
| Body | text-xs (12px) | text-sm (14px) |
| Labels | text-[10px] | text-xs (12px) |
| Headings | text-lg/xl | text-xl/2xl |
| Badges | text-[8px-10px] | text-[10px-12px] |

---

## 5. Breakpoints

| Nome | Range | Layout |
|------|-------|--------|
| sm | 640px - 767px | Mobile (no sidebar) |
| md | 768px - 1023px | Tablet portrait (sidebar overlay) |
| lg | 1024px - 1365px | Tablet landscape (sidebar compressed) |
| xl | 1366px+ | Desktop (sidebar completo) |

---

## 6. Raccomandazioni per Implementazione

### Priorità alta

1. **Touch targets**: Aumentare tutti i bottoni e link interattivi a minimo 44×44px
2. **Sidebar overlay**: Su tablet portrait, la sidebar dovrebbe essere un overlay laterale con backdrop
3. **Font size**: Eliminare tutti i testi sotto 12px su tablet
4. **Tabelle**: Implementare scroll orizzontale con indicatori o layout card alternativo

### Priorità media

5. **Gesture**: Aggiungere swipe tra sub-tab nella progettazione UDA
6. **Orientation change**: Gestire il cambio portrait→landscape senza perdita di stato
7. **Stylus support**: Ottimizzare per stylus su iPad con Apple Pencil

### Priorità bassa

8. **Split view**: Supportare iPadOS split view multitasking
9. **Keyboard shortcuts**: Aggiungere per iPadOS con tastiera esterna
