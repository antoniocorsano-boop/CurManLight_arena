# CML-601: Linee Guida Visive — Design System Esteso

> Estende CML-600 con regole applicative, tipografia, spaziatura, componenti e animazioni.
> Tutte le specifiche sono in pixel e usano il sistema Tailwind CSS esistente.

---

## Indice

1. [Regole Applicazione Colori](#regole-applicazione-colori)
2. [Scala Tipografica](#scala-tipografica)
3. [Sistema di Spaziatura](#sistema-di-spaziatura)
4. [Specifiche Componenti](#specifiche-componenti)
5. [Iconografia](#iconografia)
6. [Catalogo Animazioni](#catalogo-animazioni)
7. [Responsive Breakpoints](#responsive-breakpoints)
8. [Accessibilità](#accessibilita)

---

## Regole Applicazione Colori

### Palette Primaria — Indigo

| Token | HEX | Uso Esatto | Dove SI applica | Dove NON applica |
|-------|-----|-----------|-----------------|-------------------|
| `primary-50` | #EEF2FF | Sfondo attivo tab nav, hover nav items, sfondo badge primario, sfondo stat card | Tab attiva bottom nav, card stat Home, badge "in corso", hover su nav item | Mai per testo, mai per bordi |
| `primary-100` | #E0E7FF | Bordo attivo, sfondo badge selezionato, bordo checkbox attivo | Bordo tab attiva, badge selected, bordo input focus (soft) | Mai per testo lungo |
| `primary-200` | #C7D2FE | Bordo separatore accent, divider tra sezioni | Separatore tra sezioni nel wizard | Mai come sfondo card |
| `primary-500` | #6366F1 | Bordo focus ring (focus:ring-primary-500), link hover, icona attiva | Ring focus su input, link nel body, icona sidebar attiva | Mai come sfondo primario |
| `primary-600` | #4F46E5 | **Bottone primario** (bg), testo attivo/link, active text, CTA, bordo primario | Tutti i bottoni "Azione", testo tab attiva, link cliccabili, badge primary | Mai per testo lungo su sfondo scuro |
| `primary-700` | #4338CA | Hover bottone primario, testo hover link | Hover state di ogni bottone primary-600 | Mai come sfondo |
| `primary-950` | #1E1B4B | Titoli pagina (Display), heading sezione | H1 pagina, titoli sezione, titolo sidebar collapsed | Mai per body text, mai per badge |

### Palette Neutra — Slate

| Token | HEX | Uso Esatto | Dove SI applica | Dove NON applica |
|-------|-----|-----------|-----------------|-------------------|
| `slate-50` | #F8FAFC | Hover background card, sfondo input, bg skeleton, sfondo accordion collapsed | Hover card progetto, input tutti i form, skeleton loading | Mai per bordi, mai per testo |
| `slate-100` | #F1F5F9 | Bordo card, divider lines, separatore, bg sidebar collapsed, bg modal overlay (soft) | Bordo di ogni card, divider orizzontale, separatore verticale, bg bottone ghost hover | Mai per sfondo pagina, mai per testo |
| `slate-200` | #E2E8F0 | Bordo secondario, bordo input default, bg bottone secondario, bg tab inactive | Bordo tutti gli input, bottone secondario, tab non attiva | Mai per testo su sfondo bianco |
| `slate-300` | #CBD5E1 | Placeholder text (solo su bg scuro), bordo disabilitato, bg tooltip | Tooltip, bordo input disabled | **MAI per testo su bg bianco** (fallisce contrasto) |
| `slate-400` | #94A3B8 | Testo muted **SOLO su sfondo scuro** (sidebar, header), icona muted su bg scuro | Testo secondario in sidebar, icona non attiva su header scuro, testo caption su bg slate-900 | **MAI su sfondo bianco** — fallisce WCAG AA (ratio 3.0:1) |
| `slate-500` | #64748B | Testo muted su sfondo chiaro, placeholder text su bg bianco, testo secondario | Placeholder input, testo description card, badge secondario, data timestamp | Mai per titoli |
| `slate-600` | #475569 | **Body text**, testo secondario, description, testo lista, testo label | Tutto il body text, description card, label form, testo menu | Mai per heading, mai per link |
| `slate-700` | #334155 | Testo forte su sfondo chiaro, titolo card, nome studente, testo badge | Titolo card, nome in lista, testo forte | Mai per display title |
| `slate-800` | #1E293B | Testo testo su sfondo molto chiaro, testo bottoni ghost | Testo bottone ghost, testo forte su bg slate-50 | Mai per sfondo pagina |
| `slate-900` | #0F172A | **Sfondo header**, sfondo sidebar, sfondo navigation bar, sfondo toast | Header desktop, sidebar, bottom nav mobile, toast background | Mai per sfondo card su sfondo bianco |
| `slate-950` | #020617 | **Sfondo modal overlay** (con opacità), testo display su sfondo scuro | Modal backdrop `bg-slate-950/50`, titoli su sfondo scuro | Mai per sfondo card, mai per body text |

### Palette Successo — Emerald

| Token | HEX | Uso Esatto | Dove SI applica | Dove NON applica |
|-------|-----|-----------|-----------------|-------------------|
| `emerald-50` | #ECFDF5 | Sfondo bottone approve, sfondo badge approved, bg stato success | Bottone "Approva", badge "Approvata", bg toast success | Mai per bordi |
| `emerald-500` | #10B981 | Icona success, checkmark, bordo success | Checkmark completato, icona stato, bordo card approvata | Mai per sfondo card intera |
| `emerald-600` | #059669 | **Testo success**, testo bottone approve, testo badge approved | Testo "Approvato", testo bottone emerald, badge text | Mai per sfondo |

### Palette Errore — Rose

| Token | HEX | Uso Esatto | Dove SI applica | Dove NON applica |
|-------|-----|-----------|-----------------|-------------------|
| `rose-50` | #FFF1F2 | Sfondo bottone reject, bg errore leggero, bg toast error | Bottone "Rifiuta", bg messaggio errore, bg toast error | Mai per bordi |
| `rose-500` | #F43F5E | Icona errore, delete icon, bordo errore, warning icon | X chiusura, icona elimina, bordo errore | Mai per sfondo card intera |
| `rose-600` | #E11D48 | **Testo errore**, testo danger action, testo bottone reject | Testo "Rifiuta", testo errore, testo bottone danger | Mai per body text |

### Palette Warning — Amber

| Token | HEX | Uso Esatto | Dove SI applica | Dove NON applica |
|-------|-----|-----------|-----------------|-------------------|
| `amber-50` | #FFFBEB | Sfondo badge pending, bg warning leggero, bg toast warning | Badge "In attesa", bg messaggio warning | Mai per bordi |
| `amber-500` | #F59E0B | Icona warning, stella piena (rating), bordo warning | Icona attenzione, stella attiva rating, bordo warning | Mai per sfondo card intera |
| `amber-600` | #D97706 | **Testo warning**, testo badge pending, testo bottone warning | Testo "In attesa", testo warning | Mai per body text |

### Regole di Contrasto

| Combinazione | Ratio Minimo | Uso |
|--------------|-------------|-----|
| slate-600 su white | 5.0:1 ✅ | Body text su sfondo bianco |
| slate-500 su white | 4.6:1 ✅ | Placeholder text su bianco |
| primary-600 su white | 4.8:1 ✅ | Link primari su bianco |
| emerald-600 su white | 4.7:1 ✅ | Testo success su bianco |
| rose-600 su white | 4.9:1 ✅ | Testo errore su bianco |
| slate-400 su white | 3.0:1 ❌ | **NON USARE su sfondo bianco** |
| slate-300 su white | 2.3:1 ❌ | **NON USARE per testo** |
| white su primary-600 | 4.8:1 ✅ | Testo su bottone primario |
| white su slate-900 | 17.5:1 ✅ | Testo su header/sidebar |

---

## Scala Tipografica

### Definizione Completa

| Nome | Tailwind | Size | Line Height | Weight | Tracking | Uso |
|------|----------|------|-------------|--------|----------|-----|
| **Display** | `text-2xl font-black tracking-tight` | 24px | 28px | 900 | -0.025em | Titoli pagina, hero text, statistiche grandi |
| **Heading 1** | `text-xl font-extrabold` | 20px | 28px | 800 | normal | Titoli sezione, titolo card grande |
| **Heading 2** | `text-base font-bold` | 16px | 24px | 700 | normal | Titoli card, nomi studenti, titoli sotto-sezione |
| **Heading 3** | `text-sm font-semibold` | 14px | 20px | 600 | normal | Titoli sotto-card, label di gruppo, titoli accordion |
| **Body** | `text-sm font-medium` | 14px | 20px | 500 | normal | Testo principale, description, body text |
| **Body Small** | `text-xs font-medium` | 12px | 16px | 500 | normal | Testo secondario, data, metadata, label piccole |
| **Caption** | `text-[11px] font-medium` | 11px | 16px | 500 | normal | Labels, captions, testo piccolo informativo |
| **Micro** | `text-[10px] font-semibold` | 10px | 12px | 600 | normal | Badges, micro labels, indicatori numerici, step indicator |

### Regole Tipografiche

```
1. Mai scendere sotto 10px (Micro) — illeggibile
2. Body text: sempre font-medium (500) — leggibilità ottimale
3. Titoli: sempre weight bold o più — gerarchia visiva chiara
4. Tracking: solo su Display (-0.025em) e Micro (normal)
5. Line height: rispettare sempre i valori indicati
6. Max righe per titolo: 2 (con text-ellipsis overflow-hidden)
7. Max righe per body: infinito (wrapping naturale)
```

### Mapping Componenti → Tipo

| Componente | Tipo | Font Class |
|------------|------|------------|
| Page title | Display | `text-2xl font-black tracking-tight` |
| Section title | Heading 1 | `text-xl font-extrabold` |
| Card title | Heading 2 | `text-base font-bold` |
| Subsection title | Heading 3 | `text-sm font-semibold` |
| Body text | Body | `text-sm font-medium` |
| Description | Body Small | `text-xs font-medium` |
| Label | Caption | `text-[11px] font-medium` |
| Badge text | Micro | `text-[10px] font-semibold` |
| Button text | Body | `text-sm font-semibold` |
| Input text | Body | `text-sm font-medium` |
| Input placeholder | Body | `text-sm font-medium` (slate-400 o slate-500) |
| Tab active text | Body | `text-sm font-semibold` |
| Tab inactive text | Body | `text-sm font-medium` |
| Stat number | Display | `text-2xl font-black` |
| Stat label | Body Small | `text-xs font-medium` |
| Error message | Body Small | `text-xs font-medium` (rose-600) |
| Success message | Body Small | `text-xs font-medium` (emerald-600) |

---

## Sistema di Spaziatura

### Scala

| Token | Tailwind | Pixel | Uso |
|-------|----------|-------|-----|
| `0` | `0` | 0px | Nessuna spaziatura |
| `1` | `p-1` / `m-1` / `gap-1` | 4px | Padding interno stretto, gap icone-testo |
| `2` | `p-2` / `m-2` / `gap-2` | 8px | Spaziatura compatta, gap tra badge, gap icone |
| `3` | `p-3` / `m-3` / `gap-3` | 12px | Padding interno default, gap bottoni, gap card in lista |
| `4` | `p-4` / `m-4` / `gap-4` | 16px | Spaziatura standard, padding card, gap sezioni |
| `5` | `p-5` / `m-5` / `gap-5` | 20px | Spaziatura comoda, padding page desktop |
| `6` | `p-6` / `m-6` / `gap-6` | 24px | Spaziatura sezione, padding page mobile |
| `8` | `p-8` / `m-8` / `gap-8` | 32px | Margini page desktop, spacing tra sezioni grandi |
| `10` | `p-10` / `m-10` | 40px | Spaziatura sezione grande, padding page large |
| `12` | `p-12` / `m-12` | 48px | Spaziatura page-level, padding section very large |

### Applicazione per Componente

| Componente | Padding | Margin | Gap |
|------------|---------|--------|-----|
| Card | p-6 (24px) | mb-3 (12px) in lista | - |
| Button | px-4 py-2 (16px/8px) | - | - |
| Input | px-3 py-2 (12px/8px) | - | - |
| Badge | px-2 py-0.5 (8px/2px) | - | - |
| Modal | p-6 (24px) | - | - |
| Section | - | mb-6 (24px) | - |
| Accordion item | p-4 (16px) | mb-2 (8px) | - |
| Tab bar | p-1 (4px) | - | gap-1 (4px) |
| Form group | - | mb-4 (16px) | - |
| Grid 2-col | - | - | gap-3 (12px) |
| Grid 3-col | - | - | gap-4 (16px) |
| Flex row | - | - | gap-2 (8px) |
| Flex col | - | - | gap-3 (12px) |
| Page header | - | mb-6 (24px) | - |
| Bottom nav | py-2 px-4 | - | - |
| Sidebar | p-4 (16px) | - | gap-1 (4px) tra items |
| Toast | p-4 (16px) | - | gap-3 (12px) tra icona e testo |

### Margini e Padding Page

```
Desktop (≥1024px):
  page-padding: px-8 (32px) or px-10 (40px)
  section-spacing: mb-8 (32px)
  content-max-width: 1280px

Tablet (768px-1023px):
  page-padding: px-6 (24px)
  section-spacing: mb-6 (24px)

Mobile (<768px):
  page-padding: px-5 (20px)
  section-spacing: mb-6 (24px)
  bottom-nav-safe: mb-20 (80px) — spazio per bottom nav fissa
```

---

## Specifiche Componenti

### Button Primary

```css
/* Dimensioni */
height: 40px;
padding: 0 16px;
border-radius: 12px; /* rounded-xl */

/* Colori */
background: primary-600 (#4F46E5);
color: white (#FFFFFF);
shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); /* shadow-md */

/* Testo */
font-size: 14px;
font-weight: 600; /* semibold */
line-height: 20px;
letter-spacing: normal;

/* States */
hover: background primary-700 (#4338CA);
active: transform scale(0.98);
focus: ring-2 primary-500 ring-offset-2;
disabled: opacity 0.5, cursor not-allowed;

/* Icona (opzionale) */
icon: w-4 h-4 (16×16), margin-right 8px (gap-2);
```

### Button Secondary

```css
/* Dimensioni */
height: 40px;
padding: 0 16px;
border-radius: 12px;

/* Colori */
background: slate-200 (#E2E8F0);
color: slate-700 (#334155);
border: none;

/* Testo */
font-size: 14px;
font-weight: 600;
line-height: 20px;

/* States */
hover: background slate-300;
active: scale(0.98);
focus: ring-2 primary-500 ring-offset-2;
```

### Button Ghost

```css
/* Dimensioni */
height: 40px;
padding: 0 16px;
border-radius: 12px;

/* Colori */
background: transparent;
color: slate-600;
border: 1px solid slate-200;

/* States */
hover: background slate-50;
active: scale(0.98);
```

### Button Danger

```css
/* Dimensioni */
height: 40px;
padding: 0 16px;
border-radius: 12px;

/* Colori */
background: rose-50 (#FFF1F2);
color: rose-600 (#E11D48);
border: 1px solid rose-200;

/* States */
hover: background rose-100;
active: scale(0.98);
```

### Input

```css
/* Dimensioni */
height: 40px;
padding: 0 12px;
border-radius: 12px;

/* Colori */
border: 1px solid slate-200;
background: slate-50;
color: slate-700;
placeholder-color: slate-400; /* solo su sfondo slate-50 */

/* Testo */
font-size: 14px;
font-weight: 500;
line-height: 20px;

/* States */
focus: border-color primary-500, ring-2 primary-500/20, background white;
disabled: opacity 0.5, cursor not-allowed;
error: border-color rose-500, ring-2 rose-500/20;
```

### Textarea

```css
/* Dimensioni */
min-height: 80px;
padding: 12px;
border-radius: 12px;

/* Colori */
border: 1px solid slate-200;
background: slate-50;
color: slate-700;

/* Testo */
font-size: 14px;
font-weight: 500;
line-height: 20px;

/* States */
focus: border-color primary-500, ring-2 primary-500/20, background white;
resize: vertical;
```

### Card

```css
/* Dimensioni */
border-radius: 16px; /* rounded-2xl */
padding: 24px; /* p-6 */

/* Colori */
background: white;
border: 1px solid slate-100;
box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); /* shadow-sm */

/* States */
hover (interattiva): box-shadow 0 4px 6px -1px rgba(0,0,0,0.1); /* shadow-md */
active (interattiva): transform scale(0.99);
selected: border-color primary-500, ring-1 primary-500;
```

### Badge

```css
/* Dimensioni */
padding: 2px 8px;
border-radius: 9999px; /* rounded-full */
height: auto; /* wrap content */

/* Testo */
font-size: 10px; /* text-[10px] */
font-weight: 700; /* font-bold */
line-height: 12px;
text-transform: uppercase;
letter-spacing: 0.05em;

/* Varianti */
primary: bg primary-50, color primary-600;
success: bg emerald-50, color emerald-600;
warning: bg amber-50, color amber-600;
error: bg rose-50, color rose-600;
neutral: bg slate-100, color slate-600;
```

### Modal

```css
/* Overlay */
position: fixed;
inset: 0;
background: slate-950/50; /* rgba(2,6,23,0.5) */
backdrop-filter: blur(4px); /* backdrop-blur-sm */
z-index: 50;

/* Container */
max-width: 672px; /* max-w-2xl */
width: 90%;
max-height: 85vh;
border-radius: 16px; /* rounded-2xl */
background: white;
box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); /* shadow-2xl */

/* Padding */
padding: 24px; /* p-6 */

/* Mobile: fullscreen */
@media (max-width: 768px) {
  max-width: 100%;
  width: 100%;
  max-height: 100vh;
  border-radius: 0;
}
```

### Dialog

```css
/* Stessa struttura Modal ma più compatto */
max-width: 400px;
padding: 24px;

/* Bottoni */
flex gap-3, justify-end;
each button: h-40px, flex-1;
```

### Toast

```css
/* Dimensioni */
max-width: 384px; /* max-w-sm */
padding: 16px;
border-radius: 12px; /* rounded-xl */

/* Colori */
background: slate-900;
color: white;
box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);

/* Posizionamento */
position: fixed;
bottom: 24px;
right: 24px;
z-index: 100;

/* Icona */
w-5 h-5, margin-right 12px;

/* Mobile */
@media (max-width: 768px) {
  left: 20px;
  right: 20px;
  bottom: 100px; /* sopra bottom nav */
  max-width: 100%;
}
```

### Skeleton

```css
/* Base */
background: slate-100;
border-radius: 8px; /* rounded-lg */

/* Animazione */
animation: pulse 1.5s ease-in-out infinite;
opacity: 0.5 → 1 → 0.5;

/* Varianti */
text: height 14px, width 100%;
title: height 20px, width 60%;
circle: width height 40px, border-radius 50%;
card: height 200px, width 100%, rounded-2xl;
avatar: width height 48px, border-radius 50%;
```

### ProgressBar

```css
/* Container */
height: 6px;
border-radius: 9999px;
background: slate-200;
width: 100%;

/* Fill */
height: 6px;
border-radius: 9999px;
background: primary-600;
transition: width 300ms ease-out;

/* Varianti */
primary: bg primary-600;
success: bg emerald-500;
warning: bg amber-500;
```

### Tabs

```css
/* Container */
background: slate-50;
border-radius: 12px; /* rounded-xl */
padding: 4px; /* p-1 */
display: flex;
gap: 4px; /* gap-1 */

/* Tab item */
height: 36px; /* h-9 */
padding: 0 16px;
border-radius: 8px; /* rounded-lg */
font-size: 14px;
font-weight: 500;
color: slate-500;

/* Active tab */
background: white;
color: primary-600;
font-weight: 600;
box-shadow: 0 1px 2px rgba(0,0,0,0.05);

/* Mobile: fullWidth option */
&.fullWidth > * { flex: 1; }
```

### Accordion

```css
/* Item */
border-radius: 16px; /* rounded-2xl */
background: white;
border: 1px solid slate-100;
margin-bottom: 8px; /* mb-2 */
padding: 16px; /* p-4 */
overflow: hidden;

/* Header */
display: flex;
justify-content: space-between;
align-items: center;
cursor: pointer;
min-height: 48px; /* touch target */

/* Title */
font-size: 14px;
font-weight: 600;
color: slate-700;

/* Chevron */
width: 20px; /* w-5 */
height: 20px;
color: slate-400;
transition: transform 150ms ease;

/* Expanded chevron */
transform: rotate(90deg);

/* Content */
margin-top: 12px; /* mt-3 */
padding: 12px;
background: slate-50;
border-radius: 12px;
```

### Tree

```css
/* Node */
padding: 8px 12px;
border-radius: 8px;
cursor: pointer;
min-height: 44px; /* touch target */

/* Node hover */
background: slate-50;

/* Node selected */
background: primary-50;
border-left: 3px solid primary-600;

/* Indentation */
padding-left: (level * 24px);

/* Expand icon */
w-4 h-4, margin-right 8px, color slate-400;
transition: transform 150ms ease;
&.expanded { transform: rotate(90deg); }

/* Node label */
font-size: 14px;
font-weight: 500;
color: slate-700;

/* Badge on node */
margin-left: auto;
```

---

## Iconografia

### Dimensioni Standard

| Contexto | Dimensione | Class | Esempio |
|----------|-----------|-------|---------|
| Body/icona inline | 16×16 | `w-4 h-4` | Icona prima del testo in lista |
| Header icona | 20×20 | `w-5 h-5` | Icona nell'header, search, notifiche |
| Sidebar icona | 16×16 | `w-4 h-4` | Voci menu sidebar |
| Button icona | 16×16 | `w-4 h-4` | Icona nel bottone (left/right) |
| Bottom nav icona | 24×24 | `w-6 h-6` | Voci bottom nav mobile |
| Large icon (empty state) | 48×48 | `w-12 h-12` | Icona stato vuoto |
| Hero icon | 64×64 | `w-16 h-16` | Icona hero onboarding |
| Avatar | 40×40 | `w-10 h-10` | Avatar utente |
| Avatar small | 32×32 | `w-8 h-8` | Avatar in commento |
| Avatar large | 48×48 | `w-12 h-12` | Avatar profilo |

### Regole Colori Icona

```
1. Default: inherit text color (currentColor)
2. Success: emerald-500 o emerald-600
3. Error/danger: rose-500
4. Warning: amber-500
5. Info/link: primary-500 o primary-600
6. Muted: slate-400 (solo su bg scuro) o slate-500 (su bg chiaro)
7. Mai usare primary-950 per icone (troppo scuro)
8. Mai usare colori pastello per icone (non leggibili)
```

### Icone Importate (38 Lucide)

```typescript
// Navigation
Home, LayoutDashboard, Menu, ChevronLeft, ChevronRight,
ChevronDown, ChevronUp, ArrowLeft, ArrowRight

// Curriculum
BookOpen, FileText, Layers, TreePine, Network, GitBranch

// UDA
Target, ClipboardList, CheckSquare, Square, PlusCircle

// Classroom
Users, User, Star, MessageSquare, PenTool, GraduationCap

// Export
Download, FileDown, Printer, Share2, Copy

// Social
Heart, ThumbsUp, MessageCircle, Bookmark

// Tools
Settings, Search, Filter, RefreshCw, Save

// System
AlertCircle, CheckCircle, XCircle, Info, Loader2, Zap
```

---

## Catalogo Animazioni

### Transizioni Pagina

```css
/* Slide left — nuovo contenuto entra da destra */
@keyframes slideInLeft {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.page-enter { animation: slideInLeft 200ms ease-out; }

/* Slide right — torna alla pagina precedente */
@keyframes slideInRight {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.page-exit { animation: slideInRight 200ms ease-out; }

/* Fade — per overlay e modali */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.fade-enter { animation: fadeIn 150ms ease-out; }
```

### Accordion

```css
/* Expand */
.accordion-content {
  transition: height 200ms ease-out, opacity 200ms ease-out;
  overflow: hidden;
}
.accordion-content.expanded {
  height: auto;
  opacity: 1;
}
.accordion-content.collapsed {
  height: 0;
  opacity: 0;
}

/* Chevron rotation */
.accordion-chevron {
  transition: transform 150ms ease;
}
.accordion-chevron.expanded {
  transform: rotate(90deg);
}
```

### Modal

```css
/* Open */
@keyframes modalOpen {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.modal-enter { animation: modalOpen 150ms ease-out; }

/* Close */
@keyframes modalClose {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0;
  }
}
.modal-exit { animation: modalClose 100ms ease-in; }

/* Overlay */
@keyframes overlayOpen {
  from { opacity: 0; }
  to { opacity: 1; }
}
.overlay-enter { animation: overlayOpen 150ms ease-out; }
```

### Toast

```css
/* Enter */
@keyframes toastEnter {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.toast-enter { animation: toastEnter 200ms ease-out; }

/* Exit */
@keyframes toastExit {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(16px);
    opacity: 0;
  }
}
.toast-exit { animation: toastExit 150ms ease-in; }
```

### Dropdown

```css
/* Open */
@keyframes dropdownOpen {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.dropdown-enter { animation: dropdownOpen 100ms ease-out; }
transform-origin: top;
```

### Card

```css
/* Hover shadow */
.card {
  transition: box-shadow 150ms ease, transform 150ms ease;
}
.card:hover {
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

/* Active press */
.card:active {
  transform: scale(0.99);
  transition: transform 50ms ease;
}
```

### Button

```css
/* Press */
button:active:not(:disabled) {
  transform: scale(0.98);
  transition: transform 50ms ease;
}

/* Loading spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.button-loading { animation: spin 1s linear infinite; }
```

### Skeleton

```css
/* Pulse */
@keyframes skeletonPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.skeleton {
  animation: skeletonPulse 1.5s ease-in-out infinite;
  background: slate-100;
  border-radius: 8px;
}
```

### Stagger List

```css
/* Entrata stagger per liste */
.stagger-item {
  animation: fadeInUp 200ms ease-out both;
}
.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 50ms; }
.stagger-item:nth-child(3) { animation-delay: 100ms; }
.stagger-item:nth-child(4) { animation-delay: 150ms; }
.stagger-item:nth-child(5) { animation-delay: 200ms; }

@keyframes fadeInUp {
  from {
    transform: translateY(8px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Swipe Card

```css
/* Swipe out left (rifiuta) */
@keyframes swipeLeft {
  to {
    transform: translateX(-120%);
    opacity: 0;
  }
}
.swipe-left { animation: swipeLeft 300ms ease-out forwards; }

/* Swipe out right (approva) */
@keyframes swipeRight {
  to {
    transform: translateX(120%);
    opacity: 0;
  }
}
.swipe-right { animation: swipeRight 300ms ease-out forwards; }
```

### Copilot

```css
/* Bubble bounce-in */
@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
.copilot-bubble { animation: bounceIn 300ms ease-out; }

/* Panel slide-up */
@keyframes panelSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.copilot-panel { animation: panelSlideUp 200ms ease-out; }

/* Typing dots */
@keyframes typingDot {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}
.typing-dot:nth-child(1) { animation: typingDot 1.4s infinite 0s; }
.typing-dot:nth-child(2) { animation: typingDot 1.4s infinite 0.2s; }
.typing-dot:nth-child(3) { animation: typingDot 1.4s infinite 0.4s; }
```

---

## Responsive Breakpoints

### Breakpoint Map

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 768px | Single column, bottom nav, compact |
| Tablet | 768px–1023px | Two column, sidebar collapsed, medium density |
| Desktop | ≥ 1024px | Full layout, sidebar expanded, high density |

### Layout Changes per Breakpoint

| Elemento | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Sidebar | Hidden (bottom nav) | Collapsed (icons) | Expanded (icons + text) |
| Bottom nav | Visible | Hidden | Hidden |
| Page padding | px-5 (20px) | px-6 (24px) | px-8 (32px) |
| Card grid | 1 col | 2 col | 3 col |
| Stats grid | 2 col | 2 col | 4 col |
| Header height | 48px | 56px | 64px |
| Font sizes | Same | Same | Same |
| Touch targets | 44px min | 44px min | 44px min |

---

## Accessibilità

### Focus Management

```css
/* Focus ring — tutti gli elementi interattivi */
*:focus-visible {
  outline: 2px solid primary-500;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Rimuovi focus ring su click (solo tastiera) */
*:focus:not(:focus-visible) {
  outline: none;
}
```

### Touch Target Sizes

| Elemento | Min Size | Reale | WCAG |
|----------|----------|-------|------|
| Bottom nav icon | 44×44 | 48×48 | 2.5.5 |
| Button | 44×44 | 40×40 (h-40) | 2.5.5 |
| Input | 44×44 | 40×40 (h-40) | 2.5.5 |
| Checkbox | 44×44 | 48×48 | 2.5.5 |
| Star rating | 44×44 | 48×48 | 2.5.5 |
| Tab | 44×44 | 36×44 | 2.5.5 |
| Accordion header | 44×44 | 48×48 | 2.5.5 |

### ARIA Labels

```typescript
// Tutti i bottoni devono avere aria-label o testo visibile
<button aria-label="Approva proposta">Approva</button>
<button aria-label="Chiudi modale"><X /></button>

// Navigation
<nav aria-label="Menu principale">
<nav aria-label="Sotto-menu classe">

// Regions
<main aria-label="Contenuto principale">
<aside aria-label="Barra laterale">

// Live regions per toast
<div aria-live="polite" aria-atomic="true">

// Modal
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">

// Progress
<div role="progressbar" aria-valuenow={45} aria-valuemin={0} aria-valuemax={100}>

// Tabs
<div role="tablist">
<button role="tab" aria-selected={active} aria-controls="panel-1">
<div role="tabpanel" id="panel-1">
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
