# CML-601: Prototipi Mobile — iPhone (390×844)

> Dispositivo di riferimento: iPhone 14 Pro (390×844pt, 3x)
> Tutti i mockup sono a scala reale. Touch targets minimi: 44×44px.
> Font body minimo: 14px. Layout single-hand: elementi critici nella zona bassa 60%.

---

## Indice

1. [Home](#1-home)
2. [Curricolo](#2-curricolo)
3. [Revisione](#3-revisione)
4. [UDA Wizard](#4-uda-wizard)
5. [Classe — Registro](#5-classe--registro)
6. [Social UDA](#6-social-uda)
7. [Esportazioni](#7-esportazioni)
8. [Second Brain](#8-second-brain)
9. [Copilot Overlay](#9-copilot-overlay)
10. [Gestures Mobile](#10-gestures-mobile)

---

## 1. Home

```
┌──────────────────────────────────────────┐ 0
│ ┌──────────────────────────────────────┐ │
│ │ 🏠 Home              🔔    👤 Letizia│ │ h-48 header
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤ 48
│                                          │
│  Ciao, Prof.ssa Letizia! 👋             │ Display 24px
│  Oggi hai 3 classi attive                │ Body 14px slate-500
│                                          │
├──────────────────────────────────────────┤ ~120
│ ┌───────────────────┬──────────────────┐ │
│ │   📘 12           │   📝 47          │ │ Stats 2×2
│ │   Curricula       │   Studenti       │ │ Card bg-primary-50
│ │   attivi          │   totali         │ │ rounded-2xl p-4
│ ├───────────────────┼──────────────────┤ │
│ │   🎯 8            │   📊 94%         │ │
│ │   UDA attivi      │   Copertura      │ │
│ │   in corso        │   competenze     │ │
│ └───────────────────┴──────────────────┘ │
│                                          │
├──────────────────────────────────────────┤ ~380
│  Azioni rapide                           │ H2 16px font-bold
│ ┌──────────────────────────────────────┐ │
│ │ ➕ Nuovo UDA                    ──▶  │ │ Full-width button
│ │    bg-white border-slate-100        │ │ h-56px rounded-xl
│ │    text-primary-600 font-semibold   │ │ 48px touch target
│ ├──────────────────────────────────────┤ │
│ │ 📋 Popola Curriculum            ──▶  │ │
│ │    same style                       │ │
│ ├──────────────────────────────────────┤ │
│ │ 📤 Esporta Tutto               ──▶  │ │
│ │    same style                       │ │
│ └──────────────────────────────────────┘ │
│                                          │
├──────────────────────────────────────────┤ ~620
│  Attività recente                        │ H2 16px
│ ┌──────────────────────────────────────┐ │
│ │ ● 10:42 — UDA "Trasversalità" salv. │ │ Timeline dots
│ │    emerald-500 ●                     │ │ Body 14px
│ ├──────────────────────────────────────┤ │
│ │ ● 09:15 — Feedback classe 3°A       │ │
│ │    primary-500 ●                     │ │
│ ├──────────────────────────────────────┤ │
│ │ ● Ieri — Esportazione PDF completata │ │
│ │    slate-400 ●                       │ │
│ └──────────────────────────────────────┘ │
│                                          │
├──────────────────────────────────────────┤ 800
│ ┌────┬────┬────┬────┬────┐              │ Bottom Nav
│ │ 🏠 │ 📘 │ 📋 │ 🎯 │ 📤 │              │ h-80px
│ │Home│Curr│Rev │Prog│Espr│              │ bg-white
│ │ ●  │    │    │    │    │              │ border-t slate-100
│ └────┴────┴────┴────┴────┘              │ active: primary-600
└──────────────────────────────────────────┘ 844
```

### Specifiche Home

| Elemento | Specifica |
|----------|-----------|
| Header | h-48px, bg-slate-900, flex justify-between, px-5 |
| Greeting | text-2xl font-black text-primary-950, mt-6 |
| Stats grid | grid-cols-2 gap-3, each card bg-primary-50 rounded-2xl p-4 |
| Stat number | text-2xl font-black text-primary-950 |
| Stat label | text-sm font-medium text-slate-500 |
| Quick actions | flex flex-col gap-2, each button h-56px, px-4, rounded-xl |
| Activity | flex flex-col, dot w-2 h-2 rounded-full, ml-2 |
| Bottom nav | fixed bottom-0, safe-area-inset, h-80px |

---

## 2. Curricolo

```
┌──────────────────────────────────────────┐ 0
│ ┌──────────────────────────────────────┐ │
│ │ ← Curricolo                   🔍 ⚙️  │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤ 48
│ ┌─────────┬─────────┬─────────────────┐  │ Sub-tab bar
│ │ Albero  │  Mappa  │   Popolamento   │  │ h-44px
│ │  ●      │         │                 │  │ active: primary-600
│ └─────────┴─────────┴─────────────────┘  │ bg-slate-50
├──────────────────────────────────────────┤ 92
│                                          │
│ ┌──────────────────────────────────────┐ │ Discipline dropdown
│ │  📚 Filosofia e Storia        ▼     │ │ Full-width select
│ │     Ordine: Secondaria I°     ▼     │ │ h-48px rounded-xl
│ └──────────────────────────────────────┘ │ border-slate-200
│                                          │
├──────────────────────────────────────────┤ ~180
│                                          │
│ ┌──────────────────────────────────────┐ │ Accordion card
│ │ 📂 Competenza CH-1             ▼    │ │ rounded-2xl
│ │    Trasversale all'area             │ │ bg-white border
│ │ ┌──────────────────────────────────┐ │ │ p-4
│ │ │ ● Indicatori: 12/15 assegnati   │ │ │
│ │ │ ● Livello: Intermedio           │ │ │ Inner section
│ │ │ ● Ultimo aggiornamento: 2gg fa  │ │ │ bg-slate-50
│ │ └──────────────────────────────────┘ │ │ rounded-xl p-3
│ ├──────────────────────────────────────┤ │
│ │ 📂 Competenza CH-2              ▶   │ │ Collapsed
│ │    Analisi del testo                │ │ Chevron right
│ ├──────────────────────────────────────┤ │
│ │ 📂 Competenza CH-3              ▶   │ │
│ │    Argomentazione filosofica        │ │
│ ├──────────────────────────────────────┤ │
│ │ 📂 Competenza CH-4              ▶   │ │
│ │    Ricerca storica                  │ │
│ ├──────────────────────────────────────┤ │
│ │ 📂 Competenza CH-5              ▶   │ │
│ │    Apprendimento cooperativo        │ │
│ └──────────────────────────────────────┘ │
│                                          │
│  [Tocca per espandere e popolare]        │ Caption 12px
│                                          │
├──────────────────────────────────────────┤ 800
│ ┌────┬────┬────┬────┬────┐              │ Bottom Nav
│ │ 🏠 │ 📘 │ 📋 │ 🎯 │ 📤 │              │
│ │Home│Curr│Rev │Prog│Espr│              │
│ │    │ ●  │    │    │    │              │ active: Curricolo
│ └────┴────┴────┴────┴────┘              │
└──────────────────────────────────────────┘ 844
```

### Specifiche Curricolo

| Elemento | Specifica |
|----------|-----------|
| Sub-tab bar | bg-slate-50 rounded-xl p-1, each tab h-36px, rounded-lg |
| Active tab | bg-white shadow-sm, text-primary-600, font-semibold |
| Dropdown | w-full, h-48px, bg-white, border-slate-200, rounded-xl, px-4 |
| Accordion card | rounded-2xl, bg-white, border border-slate-100, p-4 |
| Accordion header | flex justify-between items-center, font-semibold text-sm |
| Expanded body | mt-3, bg-slate-50 rounded-xl p-3, text-sm |
| Chevron | w-5 h-5, transition-transform 150ms |

---

## 3. Revisione

```
┌──────────────────────────────────────────┐ 0
│ ┌──────────────────────────────────────┐ │
│ │ ← Revisione                  🔔     │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤ 48
│                                          │
│  Statistiche revisione                   │ H1 16px
│ ┌───────────────────┬──────────────────┐ │
│ │   📥 14           │   ✅ 8           │ │ Stats 2×2
│ │   In attesa       │   Approvate      │ │
│ ├───────────────────┼──────────────────┤ │
│ │   ❌ 3            │   ⏳ 3           │ │
│ │   Rifiutate       │   In revisione   │ │
│ └───────────────────┴──────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │ Filter
│ │  📋 Tutte le proposte          ▼     │ │ Full-width select
│ └──────────────────────────────────────┘ │
│                                          │
├──────────────────────────────────────────┤ ~340
│  Proposta #47                            │ H2 16px
│ ┌──────────────────────────────────────┐ │ Proposal card
│ │ ┌─ UDA: Trasversalità Medioevo ──┐  │ │ rounded-2xl
│ │ │  Autore: Prof. Rossi            │  │ │ bg-white
│ │ │  Classe: 2°B                    │  │ │ border-slate-100
│ │ │  Data: 15/07/2026               │  │ │ p-4
│ │ │  Badge: ⏳ In attesa            │  │ │ badge amber
│ │ └─────────────────────────────────┘  │ │
│ │                                      │ │
│ │  ┌───────────┐  ┌────────────────┐   │ │ Action buttons
│ │  │ ✅ Approva│  │  ❌ Rifiuta    │   │ │ h-48px (touch)
│ │  │  bg-emerald│  │  bg-rose-50    │   │ │ rounded-xl
│ │  └───────────┘  └────────────────┘   │ │ flex-1 each
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ ┌─ UDA: Analisi Testo GB ────────┐  │ │ Second card
│ │ │  Autore: Prof.ssa Bianchi       │  │ │
│ │ │  Classe: 3°A                    │  │ │
│ │ │  Badge: ⏳ In attesa            │  │ │
│ │ └─────────────────────────────────┘  │ │
│ │  ┌───────────┐  ┌────────────────┐   │ │
│ │  │ ✅ Approva│  │  ❌ Rifiuta    │   │ │
│ │  └───────────┘  └────────────────┘   │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ ┌─ UDA: Geometria Euclidea ──────┐  │ │ Third card
│ │ │  Badge: ✅ Approvata            │  │ │ emerald badge
│ │ └─────────────────────────────────┘  │ │ buttons hidden
│ └──────────────────────────────────────┘ │
│                                          │
├──────────────────────────────────────────┤ 800
│ ┌────┬────┬────┬────┬────┐              │ Bottom Nav
│ │Home│Curr│ ●  │Prog│Espr│              │ active: Revisione
│ └────┴────┴────┴────┴────┘              │
└──────────────────────────────────────────┘ 844
```

### Specifiche Revisione

| Elemento | Specifica |
|----------|-----------|
| Stats grid | grid-cols-2 gap-3, same as Home |
| Proposal card | rounded-2xl bg-white border p-4, mb-3 |
| Action buttons | flex gap-3, each button flex-1 h-48px rounded-xl |
| Approve btn | bg-emerald-50 text-emerald-700 border border-emerald-200 |
| Reject btn | bg-rose-50 text-rose-700 border border-rose-200 |
| Swipe hint | opacity-0 → opacity-1 on touch start |
| Approved card | opacity-60, emerald-500 left border-l-4 |

---

## 4. UDA Wizard

```
┌──────────────────────────────────────────┐ 0
│ ┌──────────────────────────────────────┐ │
│ │ ✕  Nuovo UDA — Passo 2 di 5        │ │ Modal header
│ └──────────────────────────────────────┘ │ bg-white
├──────────────────────────────────────────┤ 48
│                                          │
│  ┌────────────────────────────────────┐  │ Progress bar
│  │████████████░░░░░░░░░░░░░░░░░░░░░░░│  │ h-6px rounded-full
│  └────────────────────────────────────┘  │ bg-slate-200
│  ① Info  ② Obiettivi  ③ Attività      │ filled: primary-600
│       ④ Verifica  ⑤ Riepilogo          │ Step labels 10px
│                                          │
├──────────────────────────────────────────┤ ~120
│                                          │
│  Obiettivi di apprendimento             │ H1 16px
│                                          │
│  ┌──────────────────────────────────────┐│
│  │ Inserisci gli obiettivi格式         ││ Input field
│  │                                      ││ h-48px
│  └──────────────────────────────────────┘│ rounded-xl
│                                          │
│  Competenza di riferimento               │ Label 12px
│  ┌──────────────────────────────────────┐│ Select
│  │ CH-1: Trasversale all'area    ▼     ││ h-48px
│  └──────────────────────────────────────┘│
│                                          │
│  Livello di profondità                   │ Label 12px
│  ┌──────────────────────────────────────┐│
│  │ ☑  Esplicito          (48px touch)  ││ Checkbox 48px
│  ├──────────────────────────────────────┤│
│  │ ☐  Implicito          (48px touch)  ││ bg-slate-50
│  ├──────────────────────────────────────┤│ rounded-xl
│  │ ☐  Trasversale        (48px touch)  ││
│  └──────────────────────────────────────┘│
│                                          │
│  Trasversalità                           │ Label 12px
│  ┌──────────────────────────────────────┐│
│  │ ☑  Competenze di base   (48px)      ││ Large checkboxes
│  ├──────────────────────────────────────┤│
│  │ ☑  Consapevolezza       (48px)      ││
│  ├──────────────────────────────────────┤│
│  │ ☐  Lettura             (48px)       ││
│  ├──────────────────────────────────────┤│
│  │ ☐  Scrittura           (48px)       ││
│  └──────────────────────────────────────┘│
│                                          │
├──────────────────────────────────────────┤ 800 (bottom)
│ ┌──────────────────────────────────────┐ │
│ │  ◀ Indietro         Avanti ▶        │ │ Nav buttons
│ │  bg-slate-200         bg-primary-600 │ │ h-48px rounded-xl
│ └──────────────────────────────────────┘ │ fixed bottom
│ ┌────┬────┬────┬────┬────┐              │ + Bottom Nav
│ │Home│Curr│Rev │ ●  │Espr│              │
│ └────┴────┴────┴────┴────┘              │
└──────────────────────────────────────────┘ 844
```

### Specifiche UDA Wizard

| Elemento | Specifica |
|----------|-----------|
| Progress bar | h-6px, bg-slate-200, filled bg-primary-600, rounded-full |
| Step indicator | text-[10px], active: text-primary-600 font-bold |
| Section title | text-lg font-bold text-primary-950 |
| Input | h-48px, px-4, rounded-xl, border-slate-200, bg-slate-50 |
| Checkbox | w-full h-48px, bg-white rounded-xl, border-slate-200 |
| Checkbox label | text-sm font-medium text-slate-700, ml-3 |
| Nav buttons | flex gap-3, each h-48px, rounded-xl |
| Close button | w-8 h-8 rounded-full, bg-slate-100, absolute top-4 right-4 |

---

## 5. Classe — Registro

```
┌──────────────────────────────────────────┐ 0
│ ┌──────────────────────────────────────┐ │
│ │ ← Classe 3°A               🔍  ⋮   │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤ 48
│ ┌────────┬──────────┬────────────────┐   │ Sub-tabs
│ │Registro│ Strumenti│ Pianificazione │   │ h-44px
│ │  ●     │          │                │   │ bg-slate-50
│ └────────┴──────────┴────────────────┘   │
├──────────────────────────────────────────┤ 92
│                                          │
│  Studenti (28)                    ➕     │ H2 16px
│                                          │
│ ┌──────────────────────────────────────┐ │ Student card
│ │  👤  Rossi, Marco            ⭐⭐⭐⭐⭐│ │ rounded-2xl
│ │     Media: 8.2                      │ │ bg-white border
│ │     ──────────────────────────       │ │ p-4 mb-3
│ │  Feedback rapido:                   │ │
│ │  [⭐][⭐][⭐][⭐][⭐]  (48px each)   │ │ Star rating
│ │                                      │ │ 5 stars
│ │  ┌────────────────────────────────┐  │ │ expanded form
│ │  │ Note: Ottima partecipazione    │  │ │ textarea
│ │  │ alla discussione filosofica    │  │ │ h-80px
│ │  │                                │  │ │ rounded-xl
│ │  └────────────────────────────────┘  │ │
│ │  [💾 Salva]              [▶ Avanti]  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │ Second card
│ │  👤  Bianchi, Sofia            ⭐⭐⭐ │ │ collapsed
│ │     Media: 7.1                      │ │ tap to expand
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │  👤  Verdi, Luca               ⭐⭐⭐⭐│ │
│ │     Media: 8.8                      │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │  👤  Neri, Giulia              ⭐⭐⭐⭐⭐│ │
│ │     Media: 9.5                      │ │
│ └──────────────────────────────────────┘ │
│                                          │
├──────────────────────────────────────────┤ 800
│ ┌────┬────┬────┬────┬────┐              │ Bottom Nav
│ │Home│Curr│Rev │ ●  │Espr│              │
│ └────┴────┴────┴────┴────┘              │
└──────────────────────────────────────────┘ 844
```

### Specifiche Classe

| Elemento | Specifica |
|----------|-----------|
| Sub-tab bar | Same as Curricolo sub-tabs |
| Student card | rounded-2xl bg-white border p-4 mb-3 |
| Student name | text-sm font-bold text-slate-900 |
| Student avg | text-xs text-slate-500 |
| Star rating | flex gap-1, each star w-48px h-48px, rounded-full |
| Star active | text-amber-400 fill-amber-400 |
| Star inactive | text-slate-200 |
| Expanded form | mt-3, bg-slate-50 rounded-xl p-3 |
| Textarea | min-h-80px, bg-white rounded-xl border-slate-200 |
| Save button | h-40px bg-primary-600 text-white rounded-xl |

---

## 6. Social UDA

```
┌──────────────────────────────────────────┐ 0
│ ┌──────────────────────────────────────┐ │
│ │ ← Social UDA                  🔍    │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤ 48
│                                          │
│ ┌──────────────────────────────────────┐ │ Filter tabs
│ │  🔥 Popolari  │  🕐 Recenti  │ 👤 Miei│ │ h-40px
│ └──────────────────────────────────────┘ │
│                                          │
├──────────────────────────────────────────┤ ~160
│                                          │
│ ┌──────────────────────────────────────┐ │ UDA card
│ │ 📚 UDA: Ecosistema Mediterraneo     │ │
│ │    di Prof. Maria Rossi              │ │
│ │    Classe 2°A • 14 pagine            │ │
│ │                                      │ │
│ │  Tags: [scienze] [mediterraneo]      │ │ Badge tags
│ │         [CLIL]                       │ │ rounded-full
│ │                                      │ │ bg-primary-50
│ │  ⭐ 24  💬 8  📋 156 clone          │ │ Engagement
│ │                                      │ │ text-xs
│ │  ┌──────────┐  ┌─────────────────┐   │ │
│ │  │ 👍 Mi    │  │  📋 Clona UDA   │   │ │ Action btns
│ │  │  piace   │  │  bg-primary-600 │   │ │ h-44px
│ │  └──────────┘  └─────────────────┘   │ │ rounded-xl
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │ Second card
│ │ 📚 UDA: Filosofia del Rinascimento  │ │
│ │    di Prof. Luca Bianchi             │ │
│ │    Classe 3°A • 12 pagine            │ │
│ │                                      │ │
│ │  Tags: [filosofia] [rinascimento]    │ │
│ │                                      │ │
│ │  ⭐ 18  💬 5  📋 89 clone           │ │
│ │                                      │ │
│ │  ┌──────────┐  ┌─────────────────┐   │ │
│ │  │ 👍 Mi    │  │  📋 Clona UDA   │   │ │
│ │  │  piace   │  │                 │   │ │
│ │  └──────────┘  └─────────────────┘   │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │ Third card
│ │ 📚 UDA: Analisi Dati Statistici     │ │
│ │    di Prof.ssa Anna Verdi            │ │
│ │    Tags: [matematica] [dati]         │ │
│ │  ⭐ 12  💬 3  📋 45 clone           │ │
│ └──────────────────────────────────────┘ │
│                                          │
├──────────────────────────────────────────┤ 800
│ ┌────┬────┬────┬────┬────┐              │
│ │Home│Curr│Rev │ ●  │Espr│              │ active: Progetta
│ └────┴────┴────┴────┴────┘              │
└──────────────────────────────────────────┘ 844
```

### Specifiche Social

| Elemento | Specifica |
|----------|-----------|
| Filter tabs | Same sub-tab pattern as Curricolo |
| UDA card | rounded-2xl bg-white border p-4 mb-3 |
| Tags | flex flex-wrap gap-2, badge rounded-full bg-primary-50 text-primary-700 text-[10px] px-2 py-0.5 |
| Engagement | flex gap-4 text-xs text-slate-500 |
| Like button | bg-slate-50 text-slate-600 border-slate-200 |
| Clone button | bg-primary-600 text-white font-semibold |

---

## 7. Esportazioni

```
┌──────────────────────────────────────────┐ 0
│ ┌──────────────────────────────────────┐ │
│ │ ← Esportazioni                 🔔   │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤ 48
│                                          │
│  Scegli il formato di esportazione       │ H1 16px
│                                          │
├──────────────────────────────────────────┤ ~140
│                                          │
│ ┌──────────────────────────────────────┐ │ Export card
│ │  📄  PDF Completo                    │ │ h-auto min-80px
│ │      Documento formattato per        │ │ bg-white rounded-2xl
│ │      la stampa con tabelle e         │ │ border-slate-100
│ │      diagrammi                       │ │ p-4 mb-3
│ │                                      │ │
│ │  ┌──────────────────────────────┐    │ │ Download btn
│ │  │  📥 Scarica PDF      2.4 MB  │    │ │ h-48px
│ │  │  bg-primary-600 text-white   │    │ │ rounded-xl
│ │  └──────────────────────────────┘    │ │ full-width
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │  📊  Excel — Competenze              │ │
│ │      Foglio Excel con matrice        │ │
│ │      competenze-valutazioni          │ │
│ │                                      │ │
│ │  ┌──────────────────────────────┐    │ │
│ │  │  📥 Scarica Excel    1.1 MB  │    │ │
│ │  └──────────────────────────────┘    │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │  📋  Word — Registro Classe          │ │
│ │      Formato editabile per           │ │
│ │      personalizzazione               │ │
│ │                                      │ │
│ │  ┌──────────────────────────────┐    │ │
│ │  │  📥 Scarica Word     1.8 MB  │    │ │
│ │  └──────────────────────────────┘    │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │  🔗  JSON — Backup Completo          │ │
│ │      Backup dei dati per             │ │
│ │      ripristino                      │ │
│ │                                      │ │
│ │  ┌──────────────────────────────┐    │ │
│ │  │  📥 Scarica JSON   340 KB    │    │ │
│ │  └──────────────────────────────┘    │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │  🌐  HTML — Report Interattivo       │ │
│ │      Pagina web navigabile           │ │
│ │                                      │ │
│ │  ┌──────────────────────────────┐    │ │
│ │  │  📥 Scarica HTML    890 KB   │    │ │
│ │  └──────────────────────────────┘    │ │
│ └──────────────────────────────────────┘ │
│                                          │
├──────────────────────────────────────────┤ 800
│ ┌────┬────┬────┬────┬────┐              │
│ │Home│Curr│Rev │Prog│ ●  │              │ active: Esporta
│ └────┴────┴────┴────┴────┘              │
└──────────────────────────────────────────┘ 844
```

### Specifiche Esportazioni

| Elemento | Specifica |
|----------|-----------|
| Export card | rounded-2xl bg-white border p-4 mb-3, min-h-80px |
| Card icon | w-12 h-12, bg-primary-50 rounded-xl, centered icon |
| Card title | text-sm font-bold text-slate-900 |
| Card description | text-xs text-slate-500 mt-1 |
| Download btn | w-full h-48px bg-primary-600 text-white rounded-xl mt-3 |
| File size | text-xs text-slate-400 in button |

---

## 8. Second Brain

```
┌──────────────────────────────────────────┐ 0
│ ┌──────────────────────────────────────┐ │
│ │ ← Second Brain               🤖 💡  │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤ 48
│                                          │
│ ┌──────────────────────────────────────┐ │ Search bar
│ │  🔍 Cerca nel knowledge base...     │ │ h-48px
│ │     bg-slate-50 rounded-xl           │ │ border-slate-200
│ └──────────────────────────────────────┘ │
│                                          │
├──────────────────────────────────────────┤ ~130
│  Volumi                                  │ H2 16px
│                                          │
│ ┌─────────┬─────────┬─────────────────┐  │ Volume pills
│ │Volume 1 │Volume 2 │ Volume 3 ... ▶  │  │ scroll-h
│ │ ●       │         │                  │  │ h-36px
│ │selected │         │                  │  │ rounded-full
│ └─────────┴─────────┴─────────────────┘  │ bg-primary-50
│                                          │ active: bg-primary-600
├──────────────────────────────────────────┤ ~260
│                                          │
│  Chat con WikiLLM                        │ H2 16px
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ ┌────────────────────────────────┐   │ │
│ │ │ 🤖 Ciao! Sono WikiLLM.        │   │ │ Bot message
│ │ │ Come posso aiutarti con        │   │ │ bg-slate-100
│ │ │ il curriculum di Filosofia?     │   │ │ rounded-2xl
│ │ └────────────────────────────────┘   │ │ rounded-br-sm
│ │                                      │ │
│ │     ┌────────────────────────────┐   │ │
│ │     │ Mi spieghi il              │   │ │ User message
│ │     │ competenza CH-2?           │   │ │ bg-primary-600
│ │     └────────────────────────────┘   │ │ text-white
│ │                                      │ │ rounded-2xl
│ │ ┌────────────────────────────────┐   │ │ rounded-bl-sm
│ │ │ 🤖 La competenza CH-2         │   │ │
│ │ │ riguarda l'analisi del         │   │ │ Bot reply
│ │ │ testo argomentativo...         │   │ │
│ │ └────────────────────────────────┘   │ │
│ └──────────────────────────────────────┘ │ Chat area
│                                          │ max-h 400px
│                                          │ overflow-y scroll
├──────────────────────────────────────────┤ ~760
│ ┌──────────────────────────────────────┐ │ Input bar
│ │  Scrivi un messaggio...    🎤  ➤    │ │ h-56px fixed
│ │  bg-white border-slate-200           │ │ rounded-2xl
│ └──────────────────────────────────────┘ │ voice btn + send
├──────────────────────────────────────────┤ 800
│ ┌────┬────┬────┬────┬────┐              │ Bottom Nav
│ │Home│Curr│Rev │Prog│Espr│              │ hidden during chat
│ └────┴────┴────┴────┴────┘              │
└──────────────────────────────────────────┘ 844
```

### Specifiche Second Brain

| Elemento | Specifica |
|----------|-----------|
| Search bar | h-48px, bg-slate-50, rounded-xl, px-4, icon ml-3 |
| Volume pills | horizontal scroll, gap-2, h-36px, px-4 py-1 |
| Volume active | bg-primary-600 text-white |
| Volume inactive | bg-primary-50 text-primary-700 |
| Chat area | flex-1, overflow-y-auto, p-4, bg-white |
| Bot message | bg-slate-100 text-slate-800, rounded-2xl rounded-br-sm |
| User message | bg-primary-600 text-white, rounded-2xl rounded-bl-sm |
| Message max-w | 80% screen width |
| Input bar | h-56px, fixed bottom, bg-white, border-t, px-4 |
| Voice btn | w-44px h-44px rounded-full bg-rose-500 text-white |
| Send btn | w-44px h-44px rounded-full bg-primary-600 text-white |

---

## 9. Copilot Overlay

```
┌──────────────────────────────────────────┐ 0
│                                          │
│         (existing screen dimmed)         │ bg-slate-950/50
│                                          │ backdrop-blur-sm
│  ┌──────────────────────────────────────┐│
│  │  ←  Copilot            ✕           ││
│  │     bg-white rounded-t-2xl          ││
│  ├──────────────────────────────────────┤│
│  │                                      ││
│  │  ┌────────────────────────────────┐  ││
│  │  │ 👋 Ciao! Sono il tuo Copilot. │  ││ Bot message
│  │  │ Come posso aiutarti oggi?      │  ││
│  │  │                                │  ││
│  │  │ Suggerimenti:                  │  ││
│  │  │ [Crea un UDA] [Esporta PDF]   │  ││ Quick actions
│  │  │ [Controlla curriculum]         │  ││ h-36px pills
│  │  └────────────────────────────────┘  ││ bg-primary-50
│  │                                      ││ rounded-full
│  │     ┌────────────────────────────┐   ││
│  │     │ Crea un UDA per la classe  │   ││ User msg
│  │     │ 2°A su Trasversalità       │   ││ bg-primary-600
│  │     └────────────────────────────┘   ││ text-white
│  │                                      ││
│  │  ┌────────────────────────────────┐  ││
│  │  │ 🤖 Perfetto! Sto creando...   │  ││ Typing indicator
│  │  │    •••                         │  ││ animated dots
│  │  └────────────────────────────────┘  ││
│  │                                      ││
│  │  ┌────────────────────────────────┐  ││
│  │  │ 🤖 Ecco il piano dell'UDA:    │  ││
│  │  │                                │  ││
│  │  │ 1. Obiettivi: CH-1, CH-3      │  ││ Response
│  │  │ 2. Durata: 16 ore             │  ││
│  │  │ 3. Verifica: griglia          │  ││
│  │  │                                │  ││
│  │  │ [✅ Conferma] [✏️ Modifica]   │  ││ Action buttons
│  │  └────────────────────────────────┘  ││
│  │                                      ││
│  ├──────────────────────────────────────┤│
│  │  ┌─────────────────────────────┬───┐ ││ Input area
│  │  │ Chiedi al copilot...       │🎤│➤│ ││ h-56px
│  │  └─────────────────────────────┴───┘ ││ bg-white
│  └──────────────────────────────────────┘│ rounded-b-2xl
│                                          │
└──────────────────────────────────────────┘ 844
```

### Specifiche Copilot

| Elemento | Specifica |
|----------|-----------|
| Overlay bg | fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 |
| Panel | absolute bottom-0, h-85vh, bg-white rounded-t-2xl |
| Handle bar | w-10 h-1 rounded-full bg-slate-300, mx-auto mt-2 mb-1 |
| Header | h-48px, flex justify-between, px-4, border-b |
| Close button | w-8 h-8 rounded-full bg-slate-100 |
| Messages | overflow-y-auto, p-4, max-h calc(85vh - 120px) |
| Quick action pills | flex flex-wrap gap-2, h-36px, bg-primary-50 rounded-full px-4 |
| Input bar | h-56px, border-t, px-4, flex gap-2 |
| Voice button | w-44px h-44px rounded-full bg-rose-500 |
| Send button | w-44px h-44px rounded-full bg-primary-600 |

---

## 10. Gestures Mobile

### Swipe Left/Right

```
Proposta cards nella lista Revisione:
  ← swipe left  → Rifiuta (sfondo rosso)
  → swipe right → Approva (sfondo verde)

    ┌──────────────────────────────┐
    │ 📋 UDA: Trasversalità       │ ← swipe start
    │    Autore: Prof. Rossi       │
    │    Badge: ⏳ In attesa       │
    └──────────────────────────────┘
                    ↓
    ┌──────────────────────────────┐
    │ 📋 UDA: Trasversalità       │ ← swipe 30%
    │    Autore: Prof. Rossi       │
    └──────────────────────────────┘  ← bg emerald-50
                                       visible icon ✅
                    ↓
    ┌──────────────────────────────┐
    │    ✅ APPROVATA              │ ← swipe complete
    │    (card snaps back to       │
    │     original position)       │
    └──────────────────────────────┘
```

**Regole swipe:**
- Trigger: movimento orizzontale > 80px
- Feedback visivo: sfondo colorato appare dietro la card
- Snap back: 200ms ease-out se non completato
- Completamento: card si dissolve in 300ms
- Non attivo su card già approvate/rifiutate

### Pull Down to Refresh

```
    ┌────────────────────────────────┐
    │  ┌────────────────────────┐    │ ← pull start
    │  │  ↓ Trascina per aggiorn│    │
    │  └────────────────────────┘    │
    │  ┌────────────────────────────┐│
    │  │ UDA card 1                 ││
    │  └────────────────────────────┘│
    └────────────────────────────────┘

    ┌────────────────────────────────┐
    │     ↻ Aggiornamento...         │ ← pull > 60px
    │  ┌────────────────────────────┐│
    │  │ UDA card 1                 ││
    │  └────────────────────────────┘│
    └────────────────────────────────┘
```

**Regole pull:**
- Trigger: trascinamento verticale > 60px da top
- Visual: spinner rotante con testo "Aggiornamento..."
- Release: animazione 400ms, poi snap back
- Throttle: max 1 richiesta ogni 2 secondi
- Disabilitato se già in caricamento

### Long Press per Context Menu

```
    ┌────────────────────────────────┐
    │  ┌────────────────────────┐    │
    │  │ Long press student card │    │ ← hold 500ms
    │  └────────────────────────┘    │
    └────────────────────────────────┘
                    ↓
    ┌────────────────────────────────┐
    │  ┌────────────────────────┐    │
    │  │  📋 Copia feedback     │    │ ← context menu
    │  │  ✏️  Modifica voto      │    │   appears above
    │  │  📤 Esporta valutazione│    │   finger position
    │  │  🗑️  Rimuovi studente  │    │
    │  └────────────────────────┘    │   h-44px per item
    │  ┌────────────────────────────┐│   bg-white rounded-xl
    │  │ UDA card 1                 ││   shadow-lg
    │  └────────────────────────────┘│
    └────────────────────────────────┘
```

**Regole long press:**
- Trigger: hold 500ms senza movimento > 10px
- Feedback: scale(1.02) + shadow-md durante hold
- Menu: appare 16px sopra il punto di tocco
- Close: tap fuori dal menu
- Disabilitato su elementi non interattivi

### Tap per Espandere

```
    ┌────────────────────────────────┐
    │  📂 Competenza CH-1      ▶    │ ← collapsed
    └────────────────────────────────┘
                    ↓ tap
    ┌────────────────────────────────┐
    │  📂 Competenza CH-1      ▼    │ ← expanded
    │ ┌────────────────────────────┐ │
    │ │ Indicatori: 12/15          │ │
    │ │ Livello: Intermedio        │ │ animate height
    │ │ Aggiornamento: 2gg fa      │ │ 200ms ease-out
    │ └────────────────────────────┘ │
    └────────────────────────────────┘
```

### Double-Tap per Favorito

```
    ┌────────────────────────────────┐
    │  ⭐ UDA: Trasversalità        │ ← double-tap
    └────────────────────────────────┘
                    ↓
    ┌────────────────────────────────┐
    │  ⭐ UDA: Trasversalità        │ ← heart animation
    │     💛 +1 flying heart         │   scale 1→1.3→1
    └────────────────────────────────┘   300ms
```

**Regole double-tap:**
- Trigger: 2 tap in 300ms, distanza < 30px
- Feedback: animazione cuore che vola verso l'alto
- Toggle: rimuovi/aggiungi dai preferiti
- Disabilitato in modalità modifica

---

## Layout Mobile — Regole Generali

### Safe Areas

```
┌────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓ STATUS BAR ▓▓▓▓▓▓▓▓▓▓│ ~47px (notch)
├────────────────────────────────────┤
│                                    │
│         CONTENT AREA               │
│                                    │
│   - scroll-y auto                 │
│   - padding-x: 20px (px-5)       │
│   - padding-top: 16px (safe)     │
│                                    │
├────────────────────────────────────┤
│                                    │
│         BOTTOM NAV (80px)          │ fixed
│                                    │
├────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓ HOME INDICATOR ▓▓▓▓▓▓▓│ ~34px
└────────────────────────────────────┘
```

### Touch Target Matrix

| Elemento | Min Size | Reale |
|----------|----------|-------|
| Bottom nav icon | 44×44 | 48×48 |
| Star rating | 44×44 | 48×48 |
| Checkbox | 44×44 | 48×48 |
| Buttons | 44×44 | 48×48 (h-48px) |
| Nav arrows | 44×44 | 44×44 |
| Swipe action | 80px | 80px threshold |
| Pull refresh | 60px | 60px threshold |

### Typography Mobile

| Elemento | Size | Weight | Color |
|----------|------|--------|-------|
| Display | 24px | font-black | slate-950 |
| Heading 1 | 16px | font-bold | slate-900 |
| Heading 2 | 14px | font-semibold | slate-800 |
| Body | 14px | font-medium | slate-700 |
| Body small | 12px | font-medium | slate-500 |
| Caption | 11px | font-medium | slate-400 |
| Badge | 10px | font-bold | varies |
