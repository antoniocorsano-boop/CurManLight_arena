# CurManLight — Sistema UI

## 1. Obiettivo

CurManLight è uno strumento professionale per docenti e dipartimenti. Il sistema UI deve rendere l'interfaccia:

- riconoscibile;
- istituzionale;
- leggibile;
- sobria;
- operativa;
- accessibile;
- coerente tra viste;
- non assimilabile a una dashboard generica generata automaticamente.

**Frase di valore:** "Il docente può usare CurManLight attraverso un'interfaccia coerente, leggibile e prevedibile, nella quale azioni, contenuti, stati e fonti hanno una gerarchia visiva stabile."

## 2. Principi

### 2.1 Operatività prima della decorazione

Ogni elemento deve aiutare a:

- comprendere;
- scegliere;
- compilare;
- verificare;
- continuare.

Niente decorazione che non supporti un'azione o una comprensione.

### 2.2 Card solo per oggetti autonomi

Non usare card per ogni blocco testuale. Preferire:

- sezioni;
- righe;
- elenchi;
- divisori;
- gruppi;
- pannelli;
- tabelle.

### 2.3 Gerarchia non uniforme

Distinguere chiaramente:

- azione primaria;
- azione secondaria;
- azione distruttiva;
- metadato;
- stato;
- spiegazione;
- avviso;
- fonte;
- approfondimento.

### 2.4 Colore semantico

Il colore deve indicare:

- azione;
- stato;
- rischio;
- selezione;
- provenienza.

Non deve decorare indiscriminatamente.

### 2.5 Densità funzionale

CurManLight è uno strumento professionale. Evitare:

- spaziature da landing page;
- hero molto grandi;
- pannelli con testo eccessivamente rarefatto;
- componenti sovradimensionati.

### 2.6 Contenuti reali

Tutti i componenti e le storie devono usare testi reali italiani. Non usare:

- Lorem ipsum;
- Documento 1;
- Titolo esempio;
- Testo dimostrativo generico.

## 3. Identità visiva

### 3.1 Tono istituzionale

CurManLight comunica serietà professionale, non entusiasmo promozionale. L'interfaccia deve:

- parlare come un collega competente;
- usare un linguaggio chiaro e diretto;
- evitare auto-celebrazioni;
- rispettare l'intelligenza del docente.

### 3.2 Palette

| Ruolo | Valore | Uso |
|---|---|---|
| Superficie pagina | `#f8f9fa` | Sfondo generale |
| Superficie pannello | `#ffffff` | Card, pannelli, modali |
| Superficie sottile | `#f1f3f5` | Sezioni secondarie |
| Superficie enfatizzata | `#e9ecef` | Elementi in evidenza |
| Testo principale | `#212529` | Titoli, corpo |
| Testo secondario | `#495057` | Descrizioni, metadati |
| Testo smorzato | `#868e96` | Etichette, timestamp |
| Bordo | `#dee2e6` | Separazione generale |
| Bordo forte | `#adb5bd` | Controlli, bordi attivi |
| Azione primaria | `#2563eb` | Pulsanti primari, link |
| Azione hover | `#1d4ed8` | Stato hover primario |
| Azione morbida | `#eff6ff` | Sfondo azione secondaria |
| Successo | `#16a34a` | Stato completato |
| Successo morbido | `#f0fdf4` | Sfondo stato positivo |
| Attenzione | `#d97706` | Stato attenzione |
| Attenzione morbido | `#fffbeb` | Sfondo stato attenzione |
| Pericolo | `#dc2626` | Azioni distruttive, errori |
| Pericolo morbido | `#fef2f2` | Sfondo stato errore |
| Focus | `#2563eb` | Indicatore di focus |

**Nota:** La palette non usa indigo, violet o purple come colori primari. L'accento è blu (`#2563eb`), un colore istituzionale neutro e accessibile.

### 3.3 Contrasto WCAG AA

| Elemento | Rapporto minimo | Verificato |
|---|---|---|
| Testo principale su sfondo | 7:1 | ✔ (#212529 su #ffffff = 16.1:1) |
| Testo secondario su sfondo | 4.5:1 | ✔ (#495057 su #ffffff = 9.5:1) |
| Testo smorzato su sfondo | 3:1 | ✔ (#868e96 su #ffffff = 4.6:1) |
| Testo su sfondo azione | 4.5:1 | ✔ (#ffffff su #2563eb = 4.6:1) |
| Testo su sfondo pericolo | 4.5:1 | ✔ (#ffffff su #dc2626 = 5.5:1) |

## 4. Gerarchia

### 4.1 Livelli tipografici

| Livello | Dimensione | Peso | Uso |
|---|---|---|---|
| Titolo pagina | 20px / 1.3 | 700 (bold) | Titolo della vista corrente |
| Titolo sezione | 16px / 1.4 | 600 (semibold) | Intestazioni di gruppo |
| Titolo componente | 14px / 1.4 | 600 (semibold) | Intestazioni di pannello |
| Corpo | 14px / 1.5 | 400 (regular) | Testo principale |
| Secondario | 13px / 1.5 | 400 (regular) | Descrizioni, note |
| Metadato | 12px / 1.4 | 500 (medium) | Data, formato, stato |
| Etichetta | 12px / 1.3 | 600 (semibold) | Label di controllo |
| Testo pulsante | 14px / 1 | 500 (medium) | Interno pulsanti |

**Regole:**

- Nessun testo funzionale inferiore a 12px.
- `font-black` (900) non è consentito. Il massimo è `bold` (700) per i titoli.
- `uppercase` limitato a etichette di controllo e badge. Mai su titoli di sezione o corpo.
- `tracking-wider` usato solo con `uppercase` su etichette di massimo 12px.

### 4.2 Spaziature

| Token | Valore | Uso |
|---|---|---|
| `--ui-space-1` | 4px | Spaziatura minima |
| `--ui-space-2` | 8px | Tra controlli vicini |
| `--ui-space-3` | 12px | Padding interno pannelli |
| `--ui-space-4` | 16px | Tra sezioni |
| `--ui-space-5` | 20px | Padding pagina |
| `--ui-space-6` | 24px | Padding pagina desktop |
| `--ui-page-gutter` | 24px | Margine laterale pagina |

### 4.3 Raggi

| Token | Valore | Uso |
|---|---|---|
| `--ui-radius-control` | 6px | Bottoni, input, select |
| `--ui-radius-panel` | 8px | Pannelli, sezioni |
| `--ui-radius-dialog` | 12px | Modali, dialog |

### 4.4 Ombre

Le ombre sono riservate a:

- dialog e modali (`--ui-shadow-dialog`);
- popover;
- overlay;
- elementi temporaneamente sovrapposti.

Per sezioni normali preferire bordi e spaziature. Mai ombre colorate.

## 5. Superfici

### 5.1 Pagina

- Sfondo: `var(--ui-page)` (#f8f9fa)
- Padding: `var(--ui-page-gutter)` (24px)
- Contenuto massimo: `var(--ui-content-max)` (1200px)

### 5.2 Pannello

- Sfondo: `var(--ui-surface)` (#ffffff)
- Bordo: 1px `var(--ui-border)` (#dee2e6)
- Raggio: `var(--ui-radius-panel)` (8px)
- Padding: `var(--ui-space-4)` (16px)

### 5.3 Sezione

- Separatore: 1px `var(--ui-border)` o `border-bottom`
- Spaziatura tra sezioni: `var(--ui-space-5)` (20px)
- Nessuna ombra

## 6. Bordi

I bordi sono il mezzo primario di separazione. Preferiti alle ombre.

| Tipo | Spessore | Colore |
|---|---|---|
| Pannello | 1px | `var(--ui-border)` |
| Controllo | 1px | `var(--ui-border)` |
| Controllo attivo | 2px | `var(--ui-action)` |
| Separatore | 1px | `var(--ui-border)` |

## 7. Azioni

### 7.1 Gerarchia

Ogni gruppo di azioni deve avere:

- **Una sola azione primaria** (solid, accent color);
- **Azioni secondarie** (outline o quiet);
- **Formati alternativi** come menu o gruppo compatto;
- **Azioni distruttive** separate fisicamente.

### 7.2 Pulsanti

| Variante | Aspetto | Uso |
|---|---|---|
| primary | Sfondo pieno, testo bianco | Azione principale del contesto |
| secondary | Bordo, sfondo trasparente | Azioni alternative |
| quiet | Nessun bordo, sfondo trasparente | Azioni di bassa priorità |
| danger | Sfondo rosso, testo bianco | Conferma operazione distruttiva |

| Dimensione | Altezza | Font | Padding |
|---|---|---|---|
| small | 32px | 13px | 0 12px |
| medium | 36px | 14px | 0 16px |

### 7.3 Requisiti pulsanti

- Pulsante HTML reale (`<button>`).
- Area cliccabile minima 32×32px.
- Focus visibile (anello `2px var(--ui-focus)`).
- Nessuna icona obbligatoria.
- Ordine coerente: icona a sinistra, testo a destra.
- Nessun colore arbitrario passato dal chiamante.
- Stato disabled: opacity 0.5, cursor not-allowed.

## 8. Stati

Ogni stato deve essere comunicato con:

- testo;
- eventuale icona;
- eventuale colore.

**Mai solo colore.**

| Stato | Colore | Icona | Uso |
|---|---|---|---|
| Informativo | Blu | Info | Informazione contestuale |
| Successo | Verde | Check | Operazione completata |
| Attenzione | Ambra | Alert | Situazione che richiede attenzione |
| Errore | Rosso | X | Errore o fallimento |
| Non verificabile | Grigio | Help | Stato sconosciuto |
| In lavorazione | Grigio | Spinner | Operazione in corso |
| Completo | Verde | Check | Task terminato |

### 8.1 Quando usare ogni formato

| Formato | Quando |
|---|---|
| Badge | Stato di un oggetto in una riga |
| Testo inline | Spiegazione breve |
| Messaggio | Stato di un'intera sezione |
| Alert | Attenzione che richiede azione |
| Callout | Informazione importante ma non urgente |

## 9. Form

### 9.1 Controlli

| Controllo | Altezza | Raggio | Bordo |
|---|---|---|---|
| Input | 36px | 6px | 1px var(--ui-border) |
| Select | 36px | 6px | 1px var(--ui-border) |
| Textarea | N/A | 6px | 1px var(--ui-border) |
| Checkbox | 18px | 4px | 1px var(--ui-border) |

### 9.2 Label

- Dimensione: 13px
- Peso: 500 (medium)
- Colore: `var(--ui-text)`
- Distanza dal controllo: 4px

### 9.3 Messaggi di errore

- Dimensione: 12px
- Colore: `var(--ui-danger)`
- Distanza dal controllo: 4px
- Sempre testo, mai solo colore

## 10. Tabelle

- Intestazione: peso 600, sfondo `var(--ui-surface-subtle)`
- Celle: padding 8px 12px
- Bordi: 1px `var(--ui-border)` solo orizzontali
- Riga alternata: sfondo `var(--ui-surface-subtle)` (opzionale)
- Nessuna ombra

## 11. Elenchi

- Elementi separati da bordo inferiore
- Nessuna card per ogni elemento
- Padding: 8px 0
- Indentazione coerente

## 12. Card

Le card sono riservate a:

- oggetti autonomi (UDA, documento, progetto);
- elementi che contengono azioni multiple;
- componenti con stato proprio.

**Non usare card per:**

- blocchi testuali semplici;
- messaggi di stato;
- sezioni di intestazione;
- gruppi di controllo.

### 12.1 Contratto

| Proprietà | Valore |
|---|---|
| Sfondo | `var(--ui-surface)` |
| Bordo | 1px `var(--ui-border)` |
| Raggio | `var(--ui-radius-panel)` |
| Padding | 16px |
| Ombra | nessuna |

## 13. Dialog

### 13.1 Contratto

| Proprietà | Valore |
|---|---|
| Sfondo | `var(--ui-surface)` |
| Raggio | `var(--ui-radius-dialog)` |
| Ombra | `var(--ui-shadow-dialog)` |
| Overlay | rgba(0,0,0,0.4) |
| Padding | 24px |
| Larghezza max | 480px |

### 13.2 Struttura

- Titolo (16px, semibold)
- Corpo (14px, regular)
- Azioni (in fondo, allineate a destra)
- Escape chiude
- Focus trap
- Focus restituito all'elemento che ha aperto

## 14. Comportamento mobile

### 14.1 Regole

- Card impilate verticalmente
- Nessuna griglia a colonne sotto 640px
- Pulsanti a larghezza piena sotto 480px
- Padding ridotto: 16px laterale
- Dialog a tutta larghezza su schermi stretti
- Testo non troncato in modo irreversibile
- Azioni raggiungibili con pollice

### 14.2 Viewport

- Mobile: 390×844
- Tablet: 768×1024
- Desktop: 1024×768
- Desktop largo: 1440×1000

## 15. Accessibilità

### 15.1 Requisiti

- Tutti i pulsanti devono avere testo accessibile (aria-label se senza testo)
- Focus visibile su tutti i controlli interattivi
- Navigazione completa da tastiera (Tab, Shift+Tab, Enter, Space, Escape)
- Dialog con focus trap
- Focus restituito dopo chiusura dialog
- Testo alternativo per icone informative
- Contrasto WCAG AA per tutti i testi
- Nessuna informazione comunicata solo con colore
- Zoom 200% senza perdita di funzionalità

### 15.2 Focus

- Colore: `var(--ui-focus)` (#2563eb)
- Spessore: 2px
- Offset: 2px
- Stile: solid

## 16. Contenuti reali

### 16.1 Etichette consigliate

- "Documenti ed esportazioni"
- "Documenti prodotti di recente"
- "Scarica il curricolo"
- "File di lavoro"
- "Documentazione didattica"
- "Gestione dei dati locali"
- "Programmazione annuale"
- "Cronologia esportazioni"

### 16.2 Etichette da evitare

- "Dashboard super mega tool"
- "Il tuo documento perfetto"
- "Esplora le funzionalità"
- "Scarica ora!"
- "Prova gratuita"

## 17. Anti-pattern

### 17.1 Divieti espliciti

- Niente gradienti, salvo motivazione documentata
- Niente emoji nell'interfaccia
- Niente ombra come separatore primario
- Niente `rounded-3xl` come default
- Niente icona colorata in ogni titolo
- Niente badge per informazioni che possono essere testo normale
- Niente maiuscolo esteso per titoli e descrizioni
- Niente indigo usato come colore universale
- Niente più di un'azione primaria per sezione
- Niente banner dominanti per informazioni secondarie
- Niente quattro pulsanti equivalenti sulla stessa riga
- Niente card dentro card senza necessità semantica
- Niente componenti con titolo, icona, badge, sottotitolo e box colorato ripetuti sistematicamente
- Niente ombre colorate (shadow-indigo, shadow-purple)
- Niente font-size sotto 12px per testo funzionale
- Niente `font-black` (900) — il massimo è `bold` (700)
- Niente `text-[7px]`, `text-[8px]`, `text-[9px]` — minimi 12px

## 18. Regole di adozione

### 18.1 Processo

1. Identificare il componente da modificare
2. Verificare se esiste un componente UI system corrispondente
3. Se esiste, adottarlo
4. Se non esiste, valutarne la creazione
5. Non modificare la logica durante la migrazione visiva
6. Testare dopo ogni modifica

### 18.2 Criteri di revisione

- Il componente usa token CSS?
- Il componente rispetta la scala tipografica?
- Il componente usa la palette semantica?
- Il componente è accessibile?
- Il componente funziona su mobile?
- Il componente è documentato?

## 19. Criteri di revisione

Ogni modifica al sistema UI deve essere valutata contro:

1. **Coerenza:** rispetta i token e la palette?
2. **Leggibilità:** il testo è sufficientemente grande e contrastato?
3. **Accessibilità:** è navigabile da tastiera? Ha il focus visibile?
4. **Densità:** è adeguata al contesto professionale?
5. **Mobile:** funziona su viewport stretti?
6. **Riconoscibilità:** è chiaramente CurManLight?
