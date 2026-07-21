# CML-601 — Modello di Interazione UI

> Contesto: CurManLight — gestione curricolo per scuole italiane
> Stack: React 18, TypeScript, Zustand, Dexie, Tailwind CSS
> Utenti: docenti, coordinatori di dipartimento, dirigenti scolastici
> Fonte di costruzione: CML-600 (design system, libreria componenti, specifiche schermate)

---

## Indice

1. [Sidebar](#1-sidebar)
2. [Header](#2-header)
3. [Bottom Navigation](#3-bottom-navigation)
4. [Drawer](#4-drawer)
5. [Modal](#5-modal)
6. [Dialog](#6-dialog)
7. [Toast](#7-toast)
8. [Breadcrumb](#8-breadcrumb)
9. [Search](#9-search)
10. [Quick Action](#10-quick-action)
11. [Floating Action Button](#11-floating-action-button)
12. [Inspector](#12-inspector)
13. [Timeline](#13-timeline)
14. [Card](#14-card)
15. [Tree](#15-tree)
16. [Accordion](#16-accordion)
17. [Wizard](#17-wizard)
18. [Loading](#18-loading)
19. [Skeleton](#19-skeleton)
20. [Notification](#20-notification)

---

## 1. Sidebar

### Scopo

Pannello di navigazione principale che consente l'accesso diretto a tutte le sezioni dell'applicazione. Contiene logo, elenco voci di navigazione, toggle del copiloto e informazioni utente.

### Quando compare

- All'avvio dell'applicazione (caricamento iniziale, `fadeIn 0.25s ease-out`)
- Quando l'utente è autenticato e nella vista desktop
- Il toggle copiloto apre/chiude un pannello aggiuntivo a destra della sidebar

### Quando scompare

- Passaggio a vista tablet: si trasforma in pannello overlay (Drawer)
- Passaggio a vista mobile: nascosta completamente, sostituita dalla Bottom Navigation
- Collasso volontario da parte dell'utente: si riduce a 64px (solo icone)
- Logout dell'utente

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Apertura | `fadeIn` | 250ms | ease-out |
| Collasso | `width transition` 256px → 64px | 300ms | ease-in-out |
| Espansione | `width transition` 64px → 256px | 300ms | ease-in-out |
| Hover voce | `bg-slate-100` transition | 150ms | ease-out |
| Voce attiva | `bg-primary-50 text-primary-600` transition | 150ms | ease-out |
| Copilot toggle | `slideRight` pannello | 300ms | ease-out |

### Desktop

- Larghezza fissa `w-64` (256px), posizionamento `fixed left-0 top-0 h-screen`
- Collassabile: icona hamburger in alto, `w-64 → w-16` con transizione 300ms
- In modalità collassata: solo icone visibili, tooltip su hover con nome voce
- `z-40` — sotto il modal (`z-150`) e il toast (`z-200`), sopra il contenuto principale
- Bordo destro `border-r border-slate-200`
- Contiene: logo (h-16), voci di navigazione (scrollabile), toggle copiloto (bottom), avatar utente (bottom)

### Tablet

- Trasformata in Drawer: pannello overlay che scivola da sinistra
- Backdrop blur `backdrop-blur-sm bg-slate-950/50`
- Larghezza massima `max-w-[280px]`
- Apertura: `slideInLeft 300ms ease-out`
- Chiusura: `slideOutLeft 250ms ease-in`
- `z-50` — sopra il contenuto, sotto il modal

### Mobile

- Completamente nascosta
- Il contenuto della sidebar (voci di navigazione) viene replicato nella Bottom Navigation
- Il logo appare nell'Header mobile
- L'avatar appare nell'Header mobile
- Il toggle copiloto è accessibile dall'Header mobile (icona dedicata)

### Accessibilità

- `role="navigation"` con `aria-label="Navigazione principale"`
- Ogni voce: `role="link"` o `role="button"` con `aria-current="page"` per la voce attiva
- Collasso: `aria-expanded` sul pulsante hamburger
- Focus trap quando il Drawer è aperto su tablet
- Tab order: logo → voci → toggle copiloto → avatar
- Contrasto testo/sfondo minimo 4.5:1 (WCAG AA)
- Hover e focus visibile: `ring-2 ring-primary-500 ring-offset-2`

---

## 2. Header

### Scopo

Barra superiore che contiene logo, titolo della sezione corrente, toggle del copiloto AI, menu avatar utente e, su mobile, i controlli di ricerca e navigazione.

### Quando compare

- Sempre visibile quando l'utente è autenticato
- Sticky in posizione `top-0` su tutte le dimensioni dello schermo
- Il titolo cambia in base alla tab/sezione attiva

### Quando scompare

- Durante la visualizzazione a schermo intero di un modal (il modal copre l'header)
- Durante la visualizzazione completa di uno Schermo Esplorativo (modal a schermo intero su mobile)
- Non è mai rimossa dalla vista normalmente

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Cambio titolo | `fadeText` opacity 0→1 | 200ms | ease-out |
| Menu avatar | `scale 95→100, opacity 0→1` | 150ms | ease-out |
| Menu avatar chiusura | `scale 100→95, opacity 1→0` | 100ms | ease-in |
| Copilot toggle | `bg-primary-500` transition | 150ms | ease-out |

### Desktop

- Altezza `h-16` (64px), `sticky top-0`
- `bg-white/80 backdrop-blur-sm` con `border-b border-slate-200`
- Layout orizzontale: `flex items-center justify-between px-6`
- Sinistra: logo (24×24) + titolo sezione (`text-lg font-semibold text-slate-900`)
- Destra: toggle copiloto (`primary-500` quando attivo) + avatar (32×32, `rounded-full`) + dropdown menu
- `z-30` — sotto sidebar (`z-40`) ma sopra il contenuto scrollabile

### Tablet

- Altezza `h-14` (56px)
- Sinistra: icona hamburger (apre Drawer) + titolo sezione
- Destra: toggle copiloto + ricerca + avatar
- Stessi stili di backdrop e bordo del desktop

### Mobile

- Altezza `h-12` (48px)
- Sinistra: logo (20×20) + titolo abbreviato (max 18 caratteri, poi ellipsis)
- Destra: icona ricerca + icona copiloto + avatar (28×28)
- Il menu avatar è un dropdown semplificato con meno opzioni
- No sticky su mobile (il bottom nav occupa lo spazio inferiore)

### Accessibilità

- `role="banner"`
- Titolo: `h1` con `id="page-title"`, aggiornato dinamicamente
- Toggle copiloto: `role="switch"` con `aria-label="Attiva/disattiva copiloto"` e `aria-checked`
- Menu avatar: `role="menu"` con `aria-haspopup="true"` sul pulsante
- Focus management: apertura menu → focus sul primo item, chiusura → focus torna sul pulsante
- Contrasto titolo: `text-slate-900` su `bg-white` = 15.4:1

---

## 3. Bottom Navigation

### Scopo

Barra di navigazione fissa sul fondo dello schermo, disponibile solo su mobile, che permette di accedere alle 5 sezioni principali dell'applicazione.

### Quando compare

- Solo su dispositivi mobile (`max-width: 768px`)
- Sempre visibile quando l'utente è nella vista principale (non in modal o schermi a tutto schermo)
- Posizionata in basso, `fixed bottom-0`

### Quando scompare

- Passaggio a vista tablet/desktop: sostituita dalla Sidebar
- Apertura di un modal: la bottom nav è sotto il modal (`z-10`)
- Apertura di un Drawer: visibile ma coperta dal backdrop
- Durante la navigazione wizard: può essere nascosta (`hidden`)

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Cambio voce attiva | `color transition` slate → indigo | 150ms | ease-out |
| Cambio voce attiva | `font-weight transition` → `font-semibold` | 150ms | ease-out |
| Tap voce | Leggero `scale(0.95)` feedback tattile | 100ms | ease-out |
| Comparsa iniziale | `slideUp 300ms ease-out` | 300ms | ease-out |

### Desktop

- Non presente
- La navigazione è gestita dalla Sidebar a sinistra

### Tablet

- Non presente (Drawer gestisce la navigazione)
- Su tablet orientamento verticale: può essere mostrata come alternativa alla Sidebar

### Mobile

- Altezza: `h-16` (64px) per rispettare le aree di tocco minime (44px)
- 5 voci: Home, Curricolo, Progettazione, Classe, Altro
- Ogni voce: icona (24×24) + label (`text-[10px]`)
- Voce attiva: `text-primary-600 font-semibold` con dot indicator sotto l'icona
- Voce inattiva: `text-slate-400 font-medium`
- `bg-white border-t border-slate-200`
- Safe area: `pb-[env(safe-area-inset-bottom)]` per iPhone
- `z-30` — sopra il contenuto scrollabile

### Accessibilità

- `role="tablist"` con `aria-label="Navigazione principale"`
- Ogni voce: `role="tab"` con `aria-selected="true"` per la voce attiva
- `aria-controls` punta all'ID del pannello di contenuto associato
- Area di tocco minima 44×44px (WCAG 2.5.8)
- Contrasto testo: `text-slate-400` su `bg-white` = 3.9:1 (label); icona 2.8:1 (accettabile per non-testo WCAG AA)
- Feedback tattile: `aria-pressed` per ogni tap

---

## 4. Drawer

### Scopo

Pannello laterale a scorrimento che sostituisce la Sidebar su tablet e mobile. Fornisce accesso alle voci di navigazione e alle azioni secondarie senza occupare spazio permanente.

### Quando compare

- Su tablet: quando l'utente tocca l'icona hamburger nell'Header
- Su mobile: quando l'utente tocca l'icona hamburger nell'Header
- Mai su desktop (la Sidebar gestisce la navigazione)
- Può essere aperto programmaticamente dopo un'azione (es. dopo il primo login)

### Quando scompare

- Tap su una voce di navigazione nel Drawer
- Tap sul backdrop (area scura esterna)
- Pressione del tasto Escape
- Swipe da sinistra a destra (gesture nativa)
- Cambio di breakpoint (resize finestra da mobile/tablet a desktop)

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Apertura | `slideInLeft` + `backdropFadeIn` | 300ms | ease-out |
| Chiusura (tap voce) | `slideOutLeft` + `backdropFadeOut` | 250ms | ease-in |
| Chiusura (backdrop) | `backdropFadeOut` + `slideOutLeft` | 250ms | ease-in |
| Chiusura (Escape) | `backdropFadeOut` + `slideOutLeft` | 250ms | ease-in |

### Desktop

- Non presente — la Sidebar è il pannello di navigazione permanente

### Tablet

- Pannello overlay: `fixed inset-y-0 left-0`
- Larghezza: `w-[280px]` (max-w-[280px])
- `bg-white shadow-xl`
- Backdrop: `fixed inset-0 bg-slate-950/50 backdrop-blur-sm`
- `z-50` — sopra header, sidebar e contenuto
- Contiene: logo, voci di navigazione, toggle copiloto, avatar
- Swipe gesture: `onTouchStart` → `onTouchMove` → `onTouchEnd` per chiusura con swipe

### Mobile

- Stesse proprietà del tablet
- Contenuto semplificato: voci di navigazione (5 voci della bottom nav) + azioni secondarie
- La Bottom Navigation è visibile sotto il backdrop del Drawer
- Il Drawer non copre la Bottom Navigation (può sovrapporsi se aperto dal basso)

### Accessibilità

- `role="dialog"` con `aria-modal="true"` e `aria-label="Menu di navigazione"`
- Focus trap: il focus rimane all'interno del Drawer finché non viene chiuso
- Primo elemento focusabile: prima voce di navigazione o pulsante di chiusura
- Al chiusura: il focus torna sul pulsante che ha aperto il Drawer (hamburger)
- `aria-hidden="true"` sul contenuto principale quando il Drawer è aperto
- Backdrop: `onClick` + `onKeyDown` per catturare Escape
- Dimming del contenuto: `pointer-events-none` sul contenuto principale

---

## 5. Modal

### Scopo

Finestra di sovrapposizione modale che mostra contenuti importanti che richiedono l'attenzione dell'utente prima di continuare. Utilizzato per form, dettagli, conferme e schermi esplorativi.

### Quando compare

- Al click su "Connetti Cloud" (OAuth)
- All'apertura di un form di modifica (modifica UDA, modifica profilo)
- Alla visualizzazione di dettagli di un elemento selezionato (classe, studente, disciplina)
- All'apertura di uno Schermo Esplorativo
- Dopo un'azione che richiede conferma (uso Dialog)
- Durante il wizard di progettazione (passaggi intermedi)

### Quando scompare

- Pressione del tasto Escape
- Tap sul backdrop
- Click sul pulsante "Chiudi" (icona X nell'angolo)
- Click sul pulsante "Annulla" (nei dialog)
- Completamento dell'azione (successo/errore)
- Navigazione a un'altra sezione

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Apertura | `backdropFadeIn` + `scale 95→100, opacity 0→1` | 250ms | ease-out |
| Chiusura | `scale 100→95, opacity 1→0` + `backdropFadeOut` | 150ms | ease-in |
| Focus trap | Nessuna animazione visibile | — | — |
| Resize (mobile → desktop) | `layout transition` adatta dimensioni | 300ms | ease-in-out |

### Desktop

- Centrato orizzontalmente: `mx-auto mt-20`
- Larghezza: `max-w-2xl` (672px)
- Altezza: `max-h-[calc(100vh-10rem)]` con scroll interno
- `bg-white rounded-2xl shadow-xl border border-slate-200`
- Backdrop: `fixed inset-0 bg-slate-950/50 backdrop-blur-sm`
- `z-150` — sopra sidebar (`z-40`) e header (`z-30`)
- Contenuto: header (titolo + chiudi), body (scrollabile), footer (azioni)
- Close button: icona X nell'angolo, `text-slate-400 hover:text-slate-600`

### Tablet

- Stesse dimensioni del desktop
- Il backdrop copre anche il Drawer se aperto
- Focus trap più importante: il Drawer potrebbe ancora essere nel DOM

### Mobile

- A schermo intero: `fixed inset-0 bg-white`
- No rounded corners, no shadow
- Header sticky in alto con chiudi e titolo
- Body scrollabile con `overflow-y-auto`
- Footer sticky in basso con azioni
- Swipe down per chiudere (solo su schermi esplorativi)

### Accessibilità

- `role="dialog"` con `aria-modal="true"` e `aria-labelledby` (titolo) e `aria-describedby` (descrizione)
- Focus trap: `Tab` e `Shift+Tab` ciclano tra gli elementi focusabili del modal
- Primo elemento focusabile: primo input o pulsante nel modal
- Escape: chiude il modal e restituisce il focus al trigger
- `aria-hidden="true"` sul contenuto principale quando il modal è aperto
- Scroll锁定: `overflow-hidden` sul body quando il modal è aperto
- Contrasto backdrop: `bg-slate-950/50` garantisce sufficiente separazione dal contenuto sottostante

---

## 6. Dialog

### Scopo

Modale di conferma specializzato per decisioni critiche. Presenta una domanda di conferma, una descrizione del consequences e due pulsanti (conferma e annulla). Ridotto rispetto al Modal generico.

### Quando compare

- Prima di eliminare un elemento (UDA, studente, nota)
- Prima di approvare un curricolo (conferma con impatto)
- Prima di sincronizzare con cloud (conferma operazione)
- Prima di esportare con opzioni irreversibili
- Prima di disconnettere un servizio cloud

### Quando scompare

- Pressione del tasto Escape
- Tap sul backdrop
- Click su "Annulla"
- Click su "Conferma" (dopo esecuzione dell'azione)

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Apertura | `backdropFadeIn` + `scale 95→100, opacity 0→1` | 250ms | ease-out |
| Chiusura | `scale 100→95, opacity 1→0` + `backdropFadeOut` | 150ms | ease-in |
| Pulsante conferma | Leggero `pulse` durante elaborazione | 500ms | ease-in-out |

### Desktop

- Centrato: `mx-auto mt-[20vh]`
- Larghezza: `max-w-md` (448px)
- `bg-white rounded-2xl shadow-xl border border-slate-200`
- Backdrop: `fixed inset-0 bg-slate-950/50 backdrop-blur-sm`
- Contenuto: icona avviso (alert-triangle o alert-circle), titolo "Sei sicuro?", descrizione, due pulsanti
- Pulsanti: "Conferma" (`bg-primary-600 text-white rounded-xl`) + "Annulla" (`bg-slate-100 text-slate-700 rounded-xl`)
- Focus iniziale: pulsante "Annulla" (prevenire eliminationi accidentali)

### Tablet

- Stesse dimensioni del desktop
- Focus trap attivo

### Mobile

- A schermo intero: `fixed inset-0 bg-white`
- Contenuto centrato verticalmente
- Pulsanti in basso, a tutta larghezza: "Annulla" in alto, "Conferma" in basso
- Pericoloso: "Conferma" è `bg-red-600 text-white` quando l'azione è distruttiva

### Accessibilità

- `role="alertdialog"` con `aria-modal="true"` e `aria-labelledby="dialog-title"` e `aria-describedby="dialog-desc"`
- Focus iniziale: pulsante "Annulla" (`autoFocus` o focus management programmatico)
- Escape: chiude il dialog e restituisce il focus al trigger
- Pulsanti: `aria-label` descrittivi (es. "Conferma eliminazione UDA")
- Contrasto pulsante pericoloso: `bg-red-600 text-white` = 4.6:1 (WCAG AA)

---

## 7. Toast

### Scopo

Notifica temporanea che appare per comunicare il risultato di un'azione (successo, errore) o un messaggio informativo. Si posiziona in basso a destra e scompare automaticamente.

### Quando compare

- Dopo il salvataggio riuscito di un elemento ("UDA salvata con successo")
- Dopo un errore di rete o salvataggio ("Errore nel salvataggio. Riprova.")
- Dopo l'esportazione completata ("Esportazione completata")
- Dopo la sincronizzazione cloud ("Sincronizzazione completata")
- Dopo l'eliminazione ("Elemento eliminato")
- Dopo la generazione AI ("UDA generata con successo")

### Quando scompare

- Auto-dismiss dopo 3500ms
- Tap sul pulsante di chiusura (icona X)
- Nuovo toast sostituisce il precedente (max 1 alla volta)
- Navigazione a un'altra sezione (il toast persiste)

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Comparsa | `slideUp 60px→0, opacity 0→1` | 300ms | ease-out |
| Scomparsa | `slideDown 0→60px, opacity 1→0` | 250ms | ease-in |
| Auto-dismiss countdown | Nessuna animazione visibile | — | — |
| Sostituzione | Il nuovo toast pusha il vecchio (se visibile) | 200ms | ease-out |

### Desktop

- Posizione: `fixed bottom-6 right-6`
- Larghezza: `max-w-sm` (384px)
- `bg-white rounded-2xl shadow-lg border border-slate-200 p-4`
- `z-200` — il più alto nel layer system
- Layout: icona stato (checkmark/X) + messaggio + pulsante chiudi
- Icona successo: `text-emerald-500` (check-circle-2)
- Icona errore: `text-red-500` (x-circle)
- Messaggio: `text-sm font-medium text-slate-900`
- Pulsante chiudi: `text-slate-400 hover:text-slate-600`

### Tablet

- Stesse posizioni e dimensioni del desktop
- Posizionamento leggermente più a sinistra per evitare overlap con sidebar

### Mobile

- Posizione: `fixed bottom-20 right-4 left-4` (sopra la bottom nav)
- Larghezza: `w-auto` (a tutta larghezza con padding)
- Stessi stili di ombra e bordo
- Il messaggio può essere più lungo (più spazio orizzontale)

### Accessibilità

- `role="status"` con `aria-live="polite"` per annunciare il messaggio agli screen reader
- Pulsante chiudi: `aria-label="Chiudi notifica"`
- Contrasto: `text-slate-900` su `bg-white` = 15.4:1
- Icona stato: non è l'unico indicatore (testo + colore)
- Non interferisce con il focus corrente (il toast è `inert` rispetto al focus trap)

---

## 8. Breadcrumb

### Scopo

Mostra il percorso di navigazione corrente, consentendo all'utente di tornare rapidamente a sezioni precedenti. Fornisce contesto sulla posizione attuale nella gerarchia dell'applicazione.

### Quando compare

- Sempre visibile sotto l'Header nella vista desktop
- Su mobile: solo quando il percorso ha più di 2 livelli
- Nelle voci di navigazione secondaria (es. Curricolo > Disciplina > Ambito)

### Quando scompare

- Nella Dashboard (nessun percorso da mostrare)
- Quando il percorso è al primo livello (Home)
- Su mobile: può essere nascosta con scroll orizzontale

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Cambio percorso | `fadeText` opacity 0→1 | 200ms | ease-out |
| Aggiunta livello | `slideInRight` + fade | 200ms | ease-out |
| Rimozione livello | `slideOutLeft` + fade | 150ms | ease-in |

### Desktop

- Posizione: `px-6 py-2` sotto l'Header
- `bg-white/80 backdrop-blur-sm`
- Layout orizzontale: `flex items-center gap-1.5 text-sm`
- Elementi: Home (icona) > Sezione (testo link) > Sotto-sezione (testo corrente)
- Separatore: `text-slate-300` (icona chevron-right, 16×16)
- Link: `text-primary-600 hover:text-primary-700 hover:underline`
- Testo corrente: `text-slate-900 font-medium`
- Max 4 livelli visibili, poi ellipsis con dropdown

### Tablet

- Stesse proprietà del desktop
- Può occupare più righe se il percorso è lungo

### Mobile

- Scrollabile orizzontalmente: `overflow-x-auto flex whitespace-nowrap`
- No separatore visibile (spaziatura sufficiente)
- Solo testo, no icone (tranne Home)
- `text-xs` per risparmiare spazio
- Nascondibile: toggle per espandere/comprimere il percorso

### Accessibilità

- `nav` con `aria-label="Breadcrumb"`
- `ol` con `aria-label` per la lista
- Ogni link: `aria-current="page"` solo sull'ultimo elemento
- Separatore: `aria-hidden="true"` (decorativo)
- Link: testo descrittivo, non solo "Home >"

---

## 9. Search

### Scopo

Ricerca full-text che consente all'utente di trovare rapidamente UDA, discipline, studenti, documenti e altri contenuti nell'applicazione. Include opzioni di ricerca vocale.

### Quando compare

- Su desktop: icona search nell'Header o nella Sidebar, espandibile con click
- Su mobile: icona search nell'Header, apre overlay a tutto schermo
- Su tablet: icona search nell'Header, apre pannello laterale
- Shortcut: `Ctrl+K` o `Cmd+K` per aprire la ricerca ovunque

### Quando scompare

- Pressione del tasto Escape
- Tap sul backdrop (mobile/tablet)
- Click sul pulsante chiudi
- Navigazione a un risultato
- Nessun risultato + timeout 300ms dopo l'ultimo keystroke

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Apertura desktop | `width 0→240px, opacity 0→1` | 200ms | ease-out |
| Apertura mobile | `backdropFadeIn` + `scale 95→100, opacity 0→1` | 250ms | ease-out |
| Risultati | `fadeIn` risultati singoli | 150ms | ease-out |
| Risultati | Staggered `fadeIn` per ogni item | 50ms each | ease-out |
| Chiusura | `width 240→0px, opacity 1→0` | 150ms | ease-in |

### Desktop

- **Inline**: input nell'Header, `w-64`, icona search a sinistra
- **Espanso**: click sull'icona → input si espande con transizione
- **Risultati**: dropdown sotto l'input, `max-h-96 overflow-y-auto`
- **Risultato**: icona tipo + titolo + percorso + evidenziazione match
- **Shortcut hint**: `⌘K` nel placeholder
- `bg-white rounded-xl border border-slate-200 shadow-sm`

### Tablet

- **Pannello laterale**: apre a destra, `w-96`
- Contiene: input + filtri + risultati
- Backdrop blur sul contenuto sottostante
- Swipe right per chiudere

### Mobile

- **Overlay a tutto schermo**: `fixed inset-0 bg-white z-150`
- Input in alto, sticky
- Risultati scrollabili sotto
- Filtri: tipo di contenuto (UDA, studente, disciplina)
- Voce input: icona microfono nell'input
- Chiudi: icona X nell'angolo

### Accessibilità

- `role="search"` con `aria-label="Ricerca"`
- Input: `type="search"` con `aria-label="Cerca nell'applicazione"`
- Risultati: `role="listbox"` con `aria-activedescendant` per navigazione tastiera
- Shortcut: `aria-keyshortcuts="Meta+k Ctrl+k"`
- Risultato selezionato: `aria-selected="true"`
- Nessun risultato: `role="status"` con messaggio descrittivo
- Voce input: `aria-label="Ricerca vocale"`

---

## 10. Quick Action

### Scopo

Carte di azione rapida sulla Dashboard che forniscono accesso diretto alle operazioni più comuni. Ogni carta mostra un'icona, un titolo e una breve descrizione.

### Quando compare

- Solo sulla Dashboard
- Caricamento iniziale con staggered `fadeIn` (50ms delay per ogni carta)
- Aggiornamento dopo il primo login (personalizzate in base al ruolo)

### Quando scompare

- Non scompare (è parte permanente della Dashboard)
- Può essere nascosta con un toggle "Personalizza Dashboard"

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Caricamento iniziale | `fadeIn` staggered (50ms each) | 300ms total | ease-out |
| Hover | `shadow-md` transition + `translateY(-2px)` | 200ms | ease-out |
| Click | `scale(0.98)` feedback tattile | 100ms | ease-out |
| Navigazione | `slideLeft` al tab di destinazione | 300ms | ease-out |

### Desktop

- Griglia 2 colonne: `grid grid-cols-2 gap-4`
- Ogni carta: `bg-white rounded-2xl shadow-sm border border-slate-200 p-6`
- Contenuto: icona (`text-primary-500`, 32×32) + titolo (`text-base font-semibold text-slate-900`) + descrizione (`text-sm text-slate-500`)
- Hover: `shadow-md` + `border-primary-200`
- Click: naviga alla sezione corrispondente

### Tablet

- Griglia 2 colonne (stessa del desktop)
- Possibile griglia 3 colonne su tablet orizzontale

### Mobile

- Stack verticale: `flex flex-col gap-3`
- Ogni carta: `p-4` (ridotto rispetto al desktop)
- Icona: `text-primary-500`, 24×24 (ridotto)
- Titolo: `text-sm font-semibold`
- Descrizione: `text-xs`
- Touch target: `min-h-[60px]`

### Accessibilità

- `role="list"` con `aria-label="Azioni rapide"`
- Ogni carta: `role="link"` o `role="button"` con `aria-label` descrittivo (es. "Consulta Curricolo")
- Focus: `ring-2 ring-primary-500 ring-offset-2`
- Tab order: orizzontale (desktop) o verticale (mobile)
- Contrasto testo: `text-slate-900` su `bg-white` = 15.4:1
- Icona: `aria-hidden="true"` (decorativa)

---

## 11. Floating Action Button (FAB)

### Scopo

Pulsante di azione principale disponibile solo su mobile, posizionato in basso a destra. Fornisce accesso rapido all'azione più rilevante per la schermata corrente.

### Quando compare

- Su mobile: sempre visibile nella schermata corrente se esiste un'azione primaria
- Dashboard: "Nuova UDA"
- Curricolo: "Aggiungi Disciplina"
- Progettazione: "Nuova UDA"
- Classe: "Aggiungi Studente"
- Non compare su Wizard (le azioni sono nel footer)

### Quando scompare

- Su tablet e desktop: non presente (le azioni sono nelle sidebar o header)
- Durante l'apertura di un modal
- Durante il caricamento di una schermata
- Quando non ci sono azioni disponibili per la schermata

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Comparsa iniziale | `scale 0→1, opacity 0→1` | 250ms | ease-out |
| Scomparsa | `scale 1→0, opacity 1→0` | 150ms | ease-in |
| Click | `scale(0.9)` feedback tattile | 100ms | ease-out |
| Scroll | `slideUp 60px→0` (appare durante scroll down) | 200ms | ease-out |

### Desktop

- Non presente

### Tablet

- Non presente

### Mobile

- Posizione: `fixed bottom-24 right-5` (sopra la bottom nav)
- Dimensioni: `w-14 h-14` (56×56px)
- `bg-primary-600 text-white rounded-full shadow-lg`
- Icona: `text-white`, 24×24 (plus o icona contestuale)
- `z-40` — sopra il contenuto, sotto il modal
- Safe area: rispetta `right-[env(safe-area-inset-right)]`

### Accessibilità

- `role="button"` con `aria-label` descrittivo (es. "Nuova UDA")
- Focus: `ring-2 ring-primary-500 ring-offset-2 ring-offset-white`
- Contrasto: `text-white` su `bg-primary-600` = 4.6:1 (WCAG AA)
- Area di tocco: 56×56px (supera 44×44px minimo)
- Annuncio: `aria-live="polite"` quando cambia l'azione contestuale

---

## 12. Inspector

### Scopo

Pannello di dettaglio che mostra informazioni complete su un elemento selezionato. Utilizzato per visualizzare e modificare i dettagli di UDA, studenti, discipline e altri oggetti senza lasciare la vista corrente.

### Quando compare

- Desktop: click su un elemento nella lista → pannello a destra
- Tablet: click su un elemento → overlay a destra
- Mobile: click su un elemento → push a tutta schermata
- Utilizzato in: Curricolo (dettaglio disciplina), Classe (dettaglio studente), Progettazione (dettaglio UDA)

### Quando scompare

- Click sul pulsante chiudi (icona X)
- Click su un altro elemento (sostituisce il contenuto)
- Pressione del tasto Escape
- Navigazione a un'altra sezione
- Swipe right (mobile)

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Apertura desktop | `slideInRight` + `backdropFadeIn` | 300ms | ease-out |
| Chiusura desktop | `slideOutRight` + `backdropFadeOut` | 250ms | ease-in |
| Apertura mobile | `slideInRight` a tutto schermo | 300ms | ease-out |
| Cambio contenuto | `fadeContent` opacity 0→1 | 200ms | ease-out |

### Desktop

- Pannello a destra: `fixed right-0 top-0 h-screen w-96`
- `bg-white border-l border-slate-200 shadow-xl`
- `z-40` — stesso livello della sidebar
- Contenuto: header (titolo + chiudi) + body (scrollabile) + footer (azioni)
- Sovrappone il contenuto principale (il contenuto si riduce con `mr-96`)
- Close: icona X nell'angolo + Escape

### Tablet

- Overlay: `fixed inset-y-0 right-0 w-[400px] max-w-full`
- Backdrop: `fixed inset-0 bg-slate-950/30 backdrop-blur-sm`
- `z-50` — sopra il Drawer e il contenuto
- Stessi stili del desktop

### Mobile

- Push a tutto schermo: `fixed inset-0 bg-white z-100`
- `overflow-y-auto`
- Header sticky con chiudi e titolo
- Il contenuto precedente è nascosto (non rimosso dal DOM)

### Accessibilità

- `role="complementary"` con `aria-label="Dettaglio elemento"`
- Focus trap: quando aperto, il focus rimane nel pannello
- Primo elemento focusabile: pulsante chiudi o primo input
- Escape: chiude il pannello e restituisce il focus all'elemento selezionato
- `aria-hidden="true"` sul contenuto principale (desktop/tablet)
- Scroll锁定: `overflow-hidden` sul body (mobile)

---

## 13. Timeline

### Scopo

Vista cronologica di eventi, utilizzata per visualizzare lo storico delle modifiche, le revisioni del curricolo, i passaggi del processo di consenso e le attività recenti.

### Quando compare

- Processo & Consenso: timeline dei passaggi di approvazione
- Revisione: storico delle modifiche a un curricolo
- Dashboard: attività recenti
- Dettaglio UDA: storico delle versioni

### Quando scompare

- Non è un overlay; fa parte del contenuto della schermata
- Scompare quando l'utente naviga a un'altra sezione
- Può essere collassata su mobile (solo ultimi 3 eventi visibili)

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Caricamento | Staggered `fadeIn` per ogni evento | 50ms each | ease-out |
| Espansione evento | `height 0→auto` + `fadeIn` | 250ms | ease-out |
| Aggiunta evento | `slideInTop` + `fadeIn` | 300ms | ease-out |
| Nuovo stato | `color transition` sul badge | 300ms | ease-out |

### Desktop

- Layout verticale: `flex flex-col` con linea temporale a sinistra
- Linea: `w-px bg-slate-200` (1px)
- Evento: `relative pl-8 pb-6`
- Dot: `absolute left-[-4px] w-2 h-2 rounded-full bg-primary-500`
- Dot stato: `bg-emerald-500` (completato), `bg-amber-500` (in corso), `bg-slate-300` (futuro)
- Contenuto evento: card con titolo, data, descrizione, stato
- Primo evento: `border-l-2 border-primary-500` (evidenziato)

### Tablet

- Stesse proprietà del desktop
- Spaziatura ridotta: `pb-4` invece di `pb-6`

### Mobile

- Layout verticale semplificato
- Linea temporale: `w-0.5` (più sottile)
- Evento: `pl-6 pb-4`
- Contenuto evento: card compatta (titolo + data + badge stato)
- Descrizione nascosta per default, espandibile con tap
- Solo ultimi 3 eventi visibili, "Mostra altri" per espandere

### Accessibilità

- `role="list"` con `aria-label="Cronologia eventi"`
- Ogni evento: `role="listitem"` con `aria-label` descrittivo (es. "Evento: Approvazione curricolo, 15 gennaio 2026")
- Stato evento: `aria-label` include lo stato (completato, in corso, futuro)
- Focus: `ring-2 ring-primary-500 ring-offset-2`
- Ordine cronologico: dal più recente al più vecchio (opposto al DOM)

---

## 14. Card

### Scopo

Contenitore di contenuto versatile utilizzato per raggruppare informazioni correlate. È il componente base per la maggior parte delle voci nell'interfaccia.

### Quando compare

- Dashboard: quick action cards, statistiche, riepiloghi
- Curricolo: elenco discipline, ambiti, traguardi
- Progettazione: elenco UDA, bozze, archivio
- Classe: schede studenti, valutazioni
- Revisione: elenco curricoli da revisionare
- Ovunque ci sia un insieme di elementi da visualizzare

### Quando scompare

- Non è un overlay; è parte del contenuto della schermata
- Scompare quando l'utente naviga a un'altra sezione
- Può essere nascosta con filtri o ricerche

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Caricamento | `fadeIn` o staggered `fadeIn` | 200ms | ease-out |
| Hover | `shadow-md` + `translateY(-2px)` | 200ms | ease-out |
| Click | `scale(0.98)` feedback tattile | 100ms | ease-out |
| Eliminazione | `fadeOut` + `height 0` | 250ms | ease-in |
| Aggiunta | `fadeIn` + `slideInTop` | 200ms | ease-out |

### Desktop

- Base: `bg-white rounded-2xl shadow-sm border border-slate-200 p-6`
- Hover: `shadow-md border-slate-300 transition-all duration-200`
- Click: `cursor-pointer` se cliccabile
- Layout interno: `flex flex-col gap-3`
- Variante compatta: `p-4` (dashboard statistiche)
- Variante orizzontale: `flex flex-row items-center` (lista elementi)

### Tablet

- Stesse proprietà del desktop
- Possibile layout a griglia: `grid grid-cols-2 gap-4`

### Mobile

- Stesse proprietà del desktop
- Spaziatura ridotta: `p-4`
- Layout stack: `flex flex-col gap-3`
- Possibile swipe per azioni secondarie

### Accessibilità

- `role="article"` o `role="listitem"` (se in una lista)
- Se cliccabile: `role="link"` o `role="button"` con `aria-label` descrittivo
- Focus: `ring-2 ring-primary-500 ring-offset-2`
- Contrasto bordo: `border-slate-200` su `bg-white` = 1.5:1 (visibile ma non distraente)
- Hover: non è l'unico indicatore (aggiunge anche ombra e bordo)

---

## 15. Tree

### Scopo

Visualizzazione gerarchica di dati strutturati, utilizzata per il Curricolo in vista ad albero, la struttura degli standard e le organizzazioni. Supporta espansione/chiusura dei nodi e selezione.

### Quando compare

- Curricolo: vista ad albero (ambiti → traguardi → standard)
- Struttura organizzativa: dipartimenti → classi → studenti
- Gerarchia standard: standard nazionali → standard regionali
- Solo su desktop e tablet; su mobile è sostituita da una lista piatta

### Quando scompare

- Cambio di sub-tab (es. da "Albero" a "Mappa")
- Navigazione a un'altra sezione
- Cambio di disciplina nel filtro
- Non è un overlay; è parte del contenuto

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Espansione nodo | `height 0→auto` + `fadeIn` figli | 250ms | ease-out |
| Chiusura nodo | `height auto→0` + `fadeOut` figli | 200ms | ease-in |
| Rotazione chevron | `rotate 0→90°` | 200ms | ease-out |
| Selezione nodo | `bg-primary-50` transition | 150ms | ease-out |
| Caricamento figli | `fadeIn` staggered | 50ms each | ease-out |

### Desktop

- Layout: `flex flex-col` con indentazione `pl-4` per ogni livello
- Nodo: `flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50`
- Icona espansione: `ChevronRight` ruota 90° quando espanso
- Indicatore selezione: `bg-primary-50 text-primary-700 border-l-2 border-primary-500`
- Testo: `text-sm text-slate-700` (nodo), `text-xs text-slate-500` (figli)
- Max profondità visualizzata: 4 livelli, poi "Mostra altro"
- `overflow-y-auto max-h-[calc(100vh-12rem)]`

### Tablet

- Stesse proprietà del desktop
- Indentazione ridotta: `pl-3`
- Possibile collasso automatico dei nodi non attivi

### Mobile

- Non disponibile come Tree
- Sostituita da lista piatta con breadcrumbs per contesto
- Ogni elemento è una card con indicatore di profondità
- Tap per espandere i figli inline

### Accessibilità

- `role="tree"` con `aria-label="Albero curricolo"`
- Ogni nodo: `role="treeitem"` con `aria-expanded` e `aria-level`
- Nodi figli: `role="group"` con `aria-labelledby` del nodo padre
- Navigazione tastiera: frecce su/giu per spostarsi, sinistra/destra per espandere/chiudere
- Selezione: `Enter` o `Space`
- Focus: `ring-2 ring-primary-500 ring-offset-2`
- announcements per screen reader: "Nodo espanso, 3 figli" o "Nodo chiuso"

---

## 16. Accordion

### Scopo

Sezione espandibile che nasconde o mostra contenuti aggiuntivi. Utilizzato per organizzare elenchi di elementi in sezioni collassabili, ridusndo il disordine visivo e facilitando la navigazione.

### Quando compare

- Curricolo: ambiti con traguardi e standard
- Progettazione: sezioni del wizard collassabili
- Revisione: dettagli di una UDA in revisione
- Dashboard: statistiche espandibili
- Impostazioni: sezioni di configurazione

### Quando scompare

- Non è un overlay; è parte del contenuto della schermata
- Scompare quando l'utente naviga a un'altra sezione
- Può essere collassato dall'utente

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Espansione | `height 0→auto` + `fadeIn` contenuto | 250ms | ease-out |
| Chiusura | `height auto→0` + `fadeOut` contenuto | 200ms | ease-in |
| Rotazione chevron | `rotate 0→90°` | 200ms | ease-out |
| Hover | `bg-slate-50` transition | 150ms | ease-out |

### Desktop

- Container: `border border-slate-200 rounded-xl overflow-hidden`
- Trigger: `flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 cursor-pointer`
- Testo trigger: `text-sm font-medium text-slate-700`
- Icona: `ChevronDown` ruota 90° quando espanso
- Contenuto: `px-4 pb-4 pt-2` con `border-t border-slate-100`
- Aperti di default: `defaultOpen` prop

### Tablet

- Stesse proprietà del desktop
- Possibile animazione più fluida per la transizione height

### Mobile

- Stesse proprietà del desktop
- Touch target: `min-h-[48px]` per il trigger
- Possibile gesto swipe per espandere/chiudere

### Accessibilità

- Trigger: `role="button"` con `aria-expanded` e `aria-controls` (ID del contenuto)
- Contenuto: `role="region"` con `aria-labelledby` (ID del trigger)
- Focus: `ring-2 ring-primary-500 ring-offset-2` sul trigger
- Keyboard: `Enter` o `Space` per toggle
- Animazione rispetta `prefers-reduced-motion`

---

## 17. Wizard

### Scopo

Formulario multi-passaggio che guida l'utente attraverso la creazione o modifica di un'UDA. Ogni passaggio mostra solo i campi rilevanti, ridusndo la complessità e prevenendo errori.

### Quando compare

- Creazione UDA: wizard a 4 passaggi (Info → Traguardi → Attività → Riepilogo)
- Modifica UDA: stesso wizard con dati pre-popolati
- Configurazione iniziale: wizard di primo accesso
- Solo su desktop e tablet; su mobile è un form a schermo intero

### Quando scompare

- Completamento del wizard (salvataggio)
- Annullamento (conferma con Dialog)
- Navigazione a un'altra sezione
- Non è un overlay; occupa l'intera area di contenuto

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Passaggio 1→2 | `slideLeft` contenuto + `slideRight` indietro | 300ms | ease-out |
| Passaggio 2→1 | `slideRight` contenuto + `slideLeft` indietro | 300ms | ease-out |
| Progress bar | `width` transition al nuovo step | 300ms | ease-out |
| Validazione errore | `shake` orizzontale + `border-red-500` | 300ms | ease-out |
| Completamento | `scale 100→105, opacity 1→0` + `checkmark` | 400ms | ease-out |

### Desktop

- Layout: `max-w-3xl mx-auto mt-8`
- Indicatore step: `flex items-center justify-center gap-4 mb-8`
- Step attivo: `bg-primary-600 text-white` con numero
- Step completato: `bg-emerald-500 text-white` con checkmark
- Step futuro: `bg-slate-200 text-slate-500`
- Progress bar: `h-1 bg-primary-600` con `transition-all duration-300`
- Contenuto: `bg-white rounded-2xl shadow-sm border p-6`
- Footer: `flex justify-between mt-6` con "Indietro" (secondary) e "Avanti" (primary)
- Ultimo step: "Salva" invece di "Avanti"

### Tablet

- Stesse proprietà del desktop
- Indicatore step: compattato (solo cerchi numerati, no labels)

### Mobile

- A tutto schermo: `fixed inset-0 bg-white z-100`
- Indicatore step: barra orizzontale in alto
- Contenuto: scrollabile
- Footer: sticky in basso, a tutta larghezza
- Swipe left/right per cambiare passaggio (se abilitato)
- "Indietro" è una freccia nell'header

### Accessibilità

- `role="form"` con `aria-label="Creazione UDA"`
- Indicatore step: `role="progressbar"` con `aria-valuenow` e `aria-valuemax`
- Ogni step: `role="group"` con `aria-labelledby` (titolo step)
- Focus management: al cambio step, il focus va al primo input del nuovo step
- Navigazione tastiera: `Enter` per avanzare, `Escape` per annullare
- Annuncio: `aria-live="polite"` per "Passaggio 2 di 4"
- Validazione: messaggi di errore con `aria-describedby` sugli input

---

## 18. Loading

### Scopo

Indicatore visivo che comunica all'utente che un'operazione è in corso. Utilizzato per il caricamento iniziale, le operazioni AI, l'esportazione e la sincronizzazione.

### Quando compare

- Caricamento iniziale dell'applicazione
- Generazione AI di un'UDA
- Esportazione in PDF/Word/Excel
- Sincronizzazione cloud
- Salvataggio di un elemento
- Caricamento di dati dalla memoria locale (Dexie)

### Quando scompare

- Completamento dell'operazione (successo o errore)
- Timeout dopo 30 secondi (mostra errore)
- Annullamento dell'operazione da parte dell'utente

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Comparsa | `fadeIn` | 200ms | ease-out |
| Spinner | `rotate 360°` continuo | 1000ms | linear |
| Progress bar | `width` transition continua | — | — |
| Scomparsa | `fadeOut` | 200ms | ease-in |

### Desktop

- **Spinner**: centrato, `w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full`
- **Spinner inline**: `w-4 h-4` nel bottone o nell'header
- **Progress bar**: `h-1 bg-primary-600 rounded-full` con `transition-all`
- **Overlay**: `fixed inset-0 bg-white/80 backdrop-blur-sm z-100` con spinner centrato
- **Testo opzionale**: `text-sm text-slate-500 mt-4` sotto lo spinner

### Tablet

- Stesse proprietà del desktop
- Spinner centrato nell'area di contenuto

### Mobile

- Stesse proprietà del desktop
- Spinner centrato a schermo intero
- Progress bar in alto, sotto l'header

### Accessibilità

- `role="status"` con `aria-label="Caricamento in corso"`
- Spinner: `aria-hidden="true"` (decorativo)
- Progress bar: `role="progressbar"` con `aria-valuenow` e `aria-valuemax`
- Testo: `sr-only` per screen reader ("Caricamento in corso...")
- Non blocca il focus: l'utente può comunque uscire con Escape

---

## 19. Skeleton

### Scopo

Placeholder visivo che mostra la forma attesa del contenuto prima del caricamento. Riduce la sensazione di lentezza e previene layout shifts.

### Quando compare

- Caricamento iniziale di una schermata
- Cambio di tab o sub-tab
- Caricamento di una lista dopo il filtro
- Caricamento di dettagli dopo la selezione
- Primo rendering di un componente che carica dati da Dexie

### Quando scompare

- Quando i dati sono effettivamente caricati e pronti per la visualizzazione
- Scompare con `fadeContent` (opacity 0→1) o sostituzione diretta
- Non scompare con un'animazione separata (viene sostituito dal contenuto reale)

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Comparsa | `fadeIn` | 200ms | ease-out |
| Shimmer | `background-position` animato da sinistra a destra | 1500ms | linear |
| Scomparsa | Sostituita dal contenuto reale con `fadeContent` | 200ms | ease-out |

### Desktop

- **Card skeleton**: `bg-white rounded-2xl p-6` con blocchi grigi animati
- Blocchi: `bg-slate-200 rounded-lg animate-pulse`
- Linea testo: `h-4 bg-slate-200 rounded animate-pulse`
- Cerchio avatar: `w-10 h-10 bg-slate-200 rounded-full animate-pulse`
- Shimmer: `bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-[shimmer_1.5s_infinite]`
- Layout: replica esattamente la forma del contenuto reale

### Tablet

- Stesse proprietà del desktop
- Possibile layout a griglia per Skeleton multiple

### Mobile

- Stesse proprietà del desktop
- Skeleton compatta (meno spazio verticale)
- Possibile singola Skeleton centrata per caricamenti rapidi

### Accessibilità

- `aria-hidden="true"` (decorativa, non informativa)
- `role="presentation"` sul container
- Quando i dati sono caricati, il contenuto reale prende il focus
- Non interferisce con il tab order
- Contrasto intenzionalmente basso: non è contenuto reale

---

## 20. Notification

### Scopo

Banner di sistema che mostra avvisi persistenti, informazioni importanti o errori che richiedono l'attenzione dell'utente fino a quando non vengono gestiti.

### Quando compare

- Banner di avviso: "Connessione cloud non configurata" (top della schermata)
- Banner di errore: "Errore di sincronizzazione" (top della schermata)
- Banner informativo: "Nuova versione disponibile" (top della schermata)
- Banner di successo: "Configurazione completata" (top della schermata)
- Posizionato sotto l'Header, sopra il contenuto principale

### Quando scompare

- Click sul pulsante "Chiudi" (icona X)
- Click su "Ignora" o "Non mostrare più"
- Azione completata (es. "Connessione stabilita" → banner scompare)
- Navigazione a un'altra sezione (persiste se il problema non è risolto)

### Animazioni

| Evento | Animazione | Durata | Easing |
|--------|-----------|--------|--------|
| Comparsa | `slideDown` + `fadeIn` | 300ms | ease-out |
| Scomparsa | `slideUp` + `fadeOut` | 250ms | ease-in |
| Aggiornamento contenuto | `fadeContent` opacity 0→1 | 200ms | ease-out |

### Desktop

- Posizione: sotto l'Header, `px-6 py-3`
- Larghezza: a tutta la larghezza del contenuto principale (non della sidebar)
- `border-b border-slate-200`
- Variante avviso: `bg-amber-50 text-amber-800 border-amber-200`
- Variante errore: `bg-red-50 text-red-800 border-red-200`
- Variante info: `bg-blue-50 text-blue-800 border-blue-200`
- Variante successo: `bg-emerald-50 text-emerald-800 border-emerald-200`
- Layout: `flex items-center gap-3`
- Icona: `text-amber-500` / `text-red-500` / `text-blue-500` / `text-emerald-500`
- Testo: `text-sm font-medium`
- Pulsante chiudi: `text-current opacity-60 hover:opacity-100`
- Azione opzionale: `text-sm font-semibold underline` a destra

### Tablet

- Stesse proprietà del desktop
- Possibile banner compatta (solo icona + titolo, dettaglio su tap)

### Mobile

- Stesse proprietà del desktop
- Testo più corto (truncation dopo 2 righe)
- Pulsante azione a tutta larghezza sotto il testo
- Possibile swipe up per chiudere

### Accessibilità

- `role="alert"` per banner di errore/avviso (annuncio immediato)
- `role="status"` per banner informativi/successo
- `aria-live="assertive"` per errori critici
- `aria-live="polite"` per informazioni
- Pulsante chiudi: `aria-label="Chiudi notifica"`
- Contrasto testo: `text-amber-800` su `bg-amber-50` = 10.5:1 (WCAG AAA)
- Contrasto testo: `text-red-800` su `bg-red-50` = 10.5:1 (WCAG AAA)
- Non interferisce con il focus trap dei modali

---

## Riferimenti

- **CML-600**: Design System, libreria componenti, specifiche schermate
- **WCAG 2.1**: Web Content Accessibility Guidelines (livello AA)
- **Tailwind CSS**: Documentazione utility classes
- **Lucide React**: Libreria icone
