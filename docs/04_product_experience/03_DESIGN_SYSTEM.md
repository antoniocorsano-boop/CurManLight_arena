# Design System — CurManLight

> Documento consolidato dei token, pattern e regole visive dell'interfaccia.
> Derivato dall'analisi di `App.tsx`, `tailwind.config.js` e classi CSS inline.
> Ultimo aggiornamento: 2026-07-19

---

## 1. Palette Colori

### 1.1 Primaria (Indigo Scale)

Definita in `tailwind.config.js` come estensione `colors.primary`:

| Token | Valore | Uso tipico |
|-------|--------|------------|
| `primary-50` | `#eef2ff` | Sfondo hover, bg active tabs |
| `primary-100` | `#e0e7ff` | Bordo active, bg pill |
| `primary-200` | `#c7d2fe` | Bordo light |
| `primary-300` | `#a5b4fc` | — |
| `primary-400` | `#818cf8` | — |
| `primary-500` | `#6366f1` | Bordo focus ring |
| `primary-600` | `#4f46e5` | Bg pulsanti primari, testo active |
| `primary-700` | `#4338ca` | Hover pulsanti primari |
| `primary-800` | `#3730a3` | — |
| `primary-900` | `#312e81` | — |
| `primary-950` | `#312e81` | Testo titoli dark |

**Mapping Tailwind nativo**: `indigo` scale (stessi valori).

### 1.2 Success (Emerald Scale)

Definita in `tailwind.config.js` come estensione `colors.success`:

| Token | Valore | Uso tipico |
|-------|--------|------------|
| `success-50` | `#ecfdf5` | Bg conferme, toast successo |
| `success-100` | `#d1fae5` | Bg badge approvato |
| `success-500` | `#10b981` | Testo stato connesso |
| `success-600` | `#059669` | Bg pulsanti successo |
| `success-700` | `#047857` | Hover pulsanti successo |

**Mapping Tailwind nativo**: `emerald` scale.

### 1.3 Neutro (Slate Scale)

Utilizzata per testi, bordi, sfondi e separazioni. Scala completa Tailwind:

| Token | Uso principale |
|-------|---------------|
| `slate-50` | Bg hover, bg card secondarie |
| `slate-100` | Bordo card, separatore (`border-slate-100`) |
| `slate-200` | Bordo input, bordo card |
| `slate-300` | Testo disabilitato, bordo separatori |
| `slate-400` | Testo secondario, icone inattive |
| `slate-500` | Testo placeholder, label |
| `slate-600` | Testo primario inattivo |
| `slate-700` | Bg dropdown, testo dark |
| `slate-800` | Bg header utente, bg dark surfaces |
| `slate-900` | Bg header principale |
| `slate-950` | Bg toast, testo darkest |

### 1.4 Semantica

| Colore | Scala | Uso |
|--------|-------|-----|
| **Rose** (errore) | `rose-50` → `rose-950` | Bg warning volatile, testo errore, bordi errore |
| **Amber** (avviso) | `amber-50` → `amber-950` | Bg warning file protocol, badge pending, avvisi sessione |
| **Blue** (info) | `blue-500` | Icona guida, link |

### 1.5 Superfici Scure

| Token | Uso |
|-------|-----|
| `slate-800` | Bg dropdown menu utente, bg pulsanti header |
| `slate-900` | Bg header principale, bg modal header |
| `slate-950` | Bg toast notification |

### 1.6 Gradienti

| Gradiente | Uso |
|-----------|-----|
| `from-indigo-500 to-purple-600` | Avatar utente (cerchio) |
| `from-primary-600 to-indigo-700` | Header onboarding modal |
| `from-white to-slate-300` | Testo titolo "CurManLight" (via `bg-clip-text`) |
| `from-primary-50 to-indigo-50` | Bg compito autentico |

---

## 2. Tipografia

### 2.1 Font Family

```css
font-family: 'Inter', sans-serif;
```

Definita in `tailwind.config.js` come `fontFamily.sans`.

### 2.2 Dimensioni

| Classe | Dimensione | Uso |
|--------|-----------|-----|
| `text-[8px]` | 8px | Badge micro, label icone bottom nav |
| `text-[9px]` | 9px | Label header, status IA, badge pending |
| `text-[10px]` | 10px | Label sezione, caption, etichette field |
| `text-[11px]` | 11px | Testo body compatto, warning text |
| `text-xs` | 12px | Testo body standard, pulsanti |
| `text-sm` | 14px | Titoli card, titoli sezione |
| `text-base` | 16px | — |
| `text-lg` | 18px | — |
| `text-xl` | 20px | Titolo app "CurManLight" |

### 2.3 Pesi

| Classe | Peso | Uso |
|--------|------|-----|
| `font-medium` | 500 | Testo body |
| `font-semibold` | 600 | Testo body enfatizzato, pulsanti |
| `font-bold` | 700 | Titoli, label, pulsanti |
| `font-extrabold` | 800 | Titoli primari, tab attivo |
| `font-black` | 900 | Titoli sezione sidebar, uppercase labels |

### 2.4 Trasformazioni e Spaziatura

| Classe | Uso |
|--------|-----|
| `uppercase` | Labels sezione, status badge |
| `tracking-wider` | Labels uppercase |
| `tracking-widest` | Header ministeriali |
| `tracking-tight` | Titolo app |
| `leading-relaxed` | Testo body, warning text |
| `leading-tight` | Titoli compact |
| `leading-snug` | Titoli card |
| `truncate` | Testo ellipsis |

---

## 3. Spaziatura

Sistema a griglia di 4px (Tailwind default):

| Token | Pixel | Uso |
|-------|-------|-----|
| `p-1` / `m-1` | 4px | Padding micro |
| `p-1.5` | 6px | Padding icone |
| `p-2` | 8px | Padding input, padding card piccola |
| `p-2.5` | 10px | Padding card compatte |
| `p-3` | 12px | Padding sezioni, badge |
| `p-4` | 16px | Padding card standard |
| `p-5` | 20px | Padding modali |
| `p-6` | 24px | Padding main content, card grandi |
| `p-8` | 32px | Padding report ufficiali |
| `px-3.5` | 14px | Padding laterale sidebar items |
| `px-4` | 16px | Padding laterale header |
| `px-6` | 24px | Padding laterale modali |

### Margini e Gap

| Token | Pixel | Uso |
|-------|-------|-----|
| `gap-1` | 4px | Gap badges, gap icone |
| `gap-1.5` | 6px | Gap items griglia |
| `gap-2` | 8px | Gap griglie card |
| `gap-3` | 12px | Gap spaziatura media |
| `gap-4` | 16px | Gap griglie 2-4 colonne |
| `gap-6` | 24px | Gap container principale |
| `space-y-1` | 4px | Spaziatura verticale items |
| `space-y-1.5` | 6px | Spaziatura verticale items piccoli |
| `space-y-2` | 8px | Spaziatura verticale standard |
| `space-y-3` | 12px | Spaziatura verticale sezioni |
| `space-y-4` | 16px | Spaziatura verticale modali |
| `space-y-6` | 24px | Spaziatura verticale block |
| `space-x-1.5` | 6px | Spaziatura laterale icone+testo |
| `space-x-2` | 8px | Spaziatura laterale items |
| `space-x-3` | 12px | Spaziatura header actions |

---

## 4. Bordi e Angoli

### 4.1 Border Radius

| Classe | Pixel | Uso |
|--------|-------|-----|
| `rounded-lg` | 8px | Badge pill, micro card |
| `rounded-xl` | 12px | Pulsanti, input, sidebar items, card secondarie |
| `rounded-2xl` | 16px | Card principali, modali, toast |
| `rounded-full` | ∞ | Avatar, badge pill, pallino stato IA |

### 4.2 Bordi

| Classe | Uso |
|--------|-----|
| `border` | Bordo standard card, input (1px slate-200) |
| `border-2` | Bordo warning banner (2px rose/amber) |
| `border-t` | Separatore sezioni sidebar |
| `border-b` | Separatore header modali |
| `border-l-2` | Indicatore sub-menu sidebar (2px indigo-100) |

### 4.3 Colori Bordo

| Token | Uso |
|-------|-----|
| `border-slate-100` | Separatore sidebar, bordo card |
| `border-slate-200` | Bordo input, bordo card standard |
| `border-primary-100` | Bordo tab attivo |
| `border-primary-500/30` | Bordo stato IA connesso |
| `border-emerald-500/30` | Bordo stato IA Ollama connesso |
| `border-rose-200` | Bordo warning volatile |
| `border-amber-200` | Bordo warning file protocol |

---

## 5. Ombre

| Classe | Uso |
|--------|-----|
| `shadow-sm` | Card, sidebar, tab attivo |
| `shadow-md` | Header, pulsanti primari |
| `shadow-xl` | Report ufficiali, overlay interni |
| `shadow-2xl` | Modal dialog, toast, sidebar mobile, dropdown |

---

## 6. Icone

Libreria: `lucide-react`

### 6.1 Dimensioni Standard

| Dimensione | Classe | Uso |
|-----------|--------|-----|
| 14×14px | `w-3.5 h-3.5` | Icone dropdown menu, icone micro |
| 16×16px | `w-4 h-4` | Icone sidebar, icone pulsanti, icone standard |
| 20×20px | `w-5 h-5` | Icone header, icona menu ☰, icone bottom nav |

### 6.2 Colori Icone

| Colore | Classe | Uso |
|--------|--------|-----|
| `text-slate-500` | Icone sidebar inattive |
| `text-slate-400` | Icone header inattive, chiudi modale |
| `text-indigo-400` | Icone copilot, stato IA |
| `text-indigo-600` | Icone copilot attivo |
| `text-emerald-600` | Icona certificazione PA |
| `text-blue-500` | Icona guida |
| `text-rose-400` | Icona azzera memoria |
| `text-amber-400` | Icona stato IA pendente |

### 6.3 Icone Importate

```typescript
import {
  GraduationCap, Menu, UserCog, User, Users, ShieldCheck, Save, HelpCircle,
  Sliders, Award, Calendar, GitBranch, DownloadCloud, Library,
  Zap, Copy, Milestone, Info, Check, Eye, X, Printer,
  FileText, Code, ShieldAlert, Sparkles, Layers, BookOpenCheck,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, FolderOpen,
  RotateCcw, Smartphone, Building, LibraryBig, ServerCog, Search, RefreshCw
} from 'lucide-react';
```

Totale: 38 icone importate. Nessuna icona custom SVG (tranne che per speaker/pause/play nel copilot).

---

## 7. Animazioni e Transizioni

### 7.1 Animazione Fade-In

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.25s ease-out;
}
```

**Applicata a**: contenuto tab, sidebar mobile, modali, warning banner.

### 7.2 Transizioni Hover

| Classe | Durata | Uso |
|--------|--------|-----|
| `transition` | 150ms (default) | Pulsanti, sidebar items, icone |
| `transition-all duration-300` | 300ms | Sidebar collapse/expand |
| `transition-all duration-300` | 300ms | Toast appaio/scompare |

### 7.3 Pulse

| Classe | Uso |
|--------|-----|
| `animate-pulse` | Indicatore stato IA (pallino verde), copilot che elabora |

---

## 8. Pattern UI

### 8.1 Badges

**Forma**: pill-shaped (`rounded-full`)

| Tipo | Sfondo | Testo | Uso |
|------|--------|-------|-----|
| Pending | `bg-amber-100` | `text-amber-800` | Badge revisione "in attesa" |
| Approved | `bg-emerald-100` / `bg-success-100` | `text-emerald-800` | Stato approvato |
| Active | `bg-indigo-600` | `text-white` | Badge disciplina in modale |
| Micro | `bg-amber-500` | `text-white` | Conteggio pending nella bottom nav |
| Status dot | `bg-emerald-400 animate-pulse` | — | Pallino stato IA connesso |

### 8.2 Stati Interattivi

| Stato | Classi | Uso |
|-------|--------|-----|
| **Hover** | `hover:bg-slate-50` | Sidebar items, card |
| **Hover pulsante** | `hover:bg-indigo-500` / `hover:bg-indigo-700` | Pulsanti primari |
| **Active/Selected** | `bg-primary-50 text-primary-600 border border-primary-100 shadow-sm` | Tab attivo sidebar |
| **Active sub-item** | `bg-indigo-50 text-indigo-700 font-bold` | Sub-item attivo |
| **Disabled** | `text-slate-400` (nessuna interazione) | Icone inattive |
| **Focus ring** | `focus:ring-1 focus:ring-indigo-500` | Input, textarea |
| **Focus outline** | `focus:outline-none` | Pulsanti, badge |
| **Loading** | `animate-pulse italic` | Copilot che risponde |

### 8.3 Separatori

| Classe | Uso |
|--------|-----|
| `border-t border-slate-100` | Separatore sezioni sidebar |
| `border-t` | Separatore footer modali |
| `border-b` | Separatore header modali |
| `hr className="border-slate-200"` | Separatore contenuto modale |
| `divide-y divide-slate-700` | Separatore items dropdown |

### 8.4 Card Pattern

**Card standard** (usata ovunque):
```
bg-white rounded-2xl shadow-sm border border-slate-100 p-6
```

**Card interna** (sotto-card):
```
bg-slate-50 p-3 border rounded-xl
```

**Card hover**:
```
bg-slate-50 hover:bg-slate-100 transition shadow-sm
```

### 8.5 Pulsanti

| Variante | Classi | Uso |
|----------|--------|-----|
| **Primario** | `bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10` | Azioni principali |
| **Secondario** | `bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition` | Annulla, chiudi |
| **Header** | `bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl border border-slate-700 transition` | Azioni header |
| **Danger** | `hover:bg-slate-700 text-rose-400` (nel dropdown) | Azioni pericolose |
| **Success** | `bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md` | Copia, conferma |
| **Warning** | `bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-md` | Rinnova sessione, SCORM |

---

## 9. Input e Form

### 9.1 Text Input

```
w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50
focus:bg-white text-xs font-semibold
focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed
```

### 9.2 Select

```
w-full border border-slate-200 rounded-xl p-3 bg-white text-slate-700 font-semibold
focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none
```

### 9.3 Textarea

```
w-full border border-slate-200 rounded-xl p-2.5 bg-slate-50
focus:bg-white text-xs font-semibold
focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed
```

### 9.4 Gruppo Input

```
space-y-1.5 border border-slate-200 p-3 bg-slate-50 rounded-xl
```

---

## 10. Layout Responsive

### 10.1 Breakpoints

| Breakpoint | Valore | Comportamento |
|-----------|--------|---------------|
| Mobile | `<768px` | Bottom nav, sidebar overlay, layout single-column |
| Desktop | `≥768px` | Sidebar fisso, layout two-column |

### 10.2 Container

```
px-4 sm:px-6 lg:px-8 py-6
```

| Breakpoint | Padding laterale |
|-----------|-----------------|
| Base (mobile) | 16px |
| sm (640px) | 24px |
| lg (1024px) | 32px |

### 10.3 Griglie

| Pattern | Classi | Uso |
|---------|--------|-----|
| 2 colonne | `grid grid-cols-2 gap-4` | Info card (codice, ore, periodo, data) |
| 4 colonne | `grid grid-cols-4 gap-2` | Statistiche percentuali |
| 3 colonne | `grid grid-cols-3 gap-2` | Selezione ordine scuola |
| 2 colonne mobile | `grid grid-cols-1 sm:grid-cols-2 gap-1.5` | Lista ruoli |

---

## 11. Overlay e Z-Index

| Layer | Z-Index | Uso |
|-------|---------|-----|
| Header | `z-50` | Sticky header |
| Bottom nav | `z-50` | Fixed bottom nav mobile |
| Sidebar mobile | `z-40` | Overlay sidebar |
| Dropdown menu | `z-[180]` | Menu utente dropdown |
| Modal dialog | `z-[150]` | Modali UDA, report, outcomes |
| Onboarding | `z-[160]` | Modal onboarding (più alto degli altri modali) |
| Toast | `z-[200]` | Notifiche (sempre in cima) |
| Copilot chat | `z-[150]` | Pannello laterale copilot |

**Backdrop modali**: `bg-slate-900/60 backdrop-blur-sm`

---

## 12. Scrollbar Personalizzate

Definite globalmente (probabilmente in CSS non Tailwind):

- Larghezza: 8px
- Colori: scala slate (thumb su track trasparente)
- Applicate a: main content, modali con overflow, sidebar

---

## 13. Pattern Responsive Bottom Nav

```
md:hidden fixed bottom-0 left-0 right-0
bg-white border-t border-slate-200 shadow-2xl z-50
h-16 flex justify-around items-center px-2 pb-safe
```

Ogni voce:
```
flex flex-col items-center justify-center transition flex-1
```

- Attivo: `text-primary-600 font-extrabold`
- Inattivo: `text-slate-400 font-medium`
- Icona: `w-5 h-5`
- Label: `text-[9px] mt-1`

---

## 14. Token Non Standard

### 14.1 Classi Custom Tailwind

| Classe | Definizione |
|--------|-------------|
| `primary-50` → `primary-900` | Estesa in `tailwind.config.js` |
| `success-50` → `success-700` | Estesa in `tailwind.config.js` |
| `font-sans` | `'Inter', sans-serif` |

### 14.2 Classi Inline Non Tailwind

| Classe | Valore |
|--------|--------|
| `pb-safe` | Padding bottom per safe area (iPhone notch) |
| `fade-in` | Animazione keyframe fadeIn |
| `sr-only` | Screen reader only (per test Playwright) |
