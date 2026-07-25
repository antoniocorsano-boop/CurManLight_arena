# CML-631E — Guided Curriculum Connection Flow

## Proposta formale

**Data:** 2026-07-25
**Stato:** BOZZA — in attesa di revisione
**Preceduto da:** CML-631A (attività pilota funzionale)
**Blocca:** CML-631F (validazione reale con docenti)

---

## Frase "Il docente potrà..."

Il docente potrà creare collegamenti verticali nel curricolo seguendo un percorso guidato passo dopo passo, senza dover conoscere il modello interno dei nodi curricolari.

---

## Evidenza osservata

Durante la verifica della schermata di collegamento verticale (PilotMainView) con il dataset pilota attivo (2 segmenti, 6 elementi curricolari) sono emersi i seguenti problemi di usabilità:

1. **Terminologia tecnica non comprensibile**: il docente vede "nodi curricolari", "punto di partenza", "punto di arrivo" — termini che presuppongono familiarità con il modello interno.
2. **Due campi di ricerca vuoti**: il primo impatto è una schermata con due field di ricerca senza contenuto visibile, che non comunica all'utente cosa fare.
3. **Filtro segmenti non chiaro**: la presenza della sola voce "Tutti" nel filtro segmenti non indica se i segmenti sono caricati o se il dataset è stato inizializzato.
4. **Scelta simultanea di due decisioni**: l'utente deve scegliere contemporaneamente elemento di partenza e di arrivo, aumentando il carico cognitivo.
5. **Aiuto touch sui tipi di relazione**: i tooltip sui bottoni di relazione non sono accessibili da tocco in modo evidente.
6. **Lista collegamenti prominente**: il pannello dei collegamenti esistenti è visibile prima che l'utente abbia creato il primo collegamento, senza guidare verso l'azione principale.

---

## Problemi

| # | Problema | Gravità |
|---|----------|---------|
| P1 | La terminologia ("nodo", "punto di partenza", "punto di arrivo") presuppone conoscenza tecnica | Alta |
| P2 | Due campi di ricerca vuoti non guidano l'utente verso la prima azione | Alta |
| P3 | Il filtro segmenti potrebbe non mostrare i segmenti disponibili, lasciando l'utente senza contesto | Media |
| P4 | La scelta simultanea di partenza e arrivo è cognitivamente impegnativa | Media |
| P5 | L'aiuto sui tipi di relazione non è accessibile da tocco | Media |
| P6 | La lista dei collegamenti è secondaria rispetto alla creazione ma ha visibilità paritaria | Bassa |

---

## Causa probabile

La schermata è stata progettata come interfaccia tecnica per chi conosce il modello interno (nodi, segmenti, collegamenti verticali). Non è stata pensata per un docente che deve semplicemente esprimere come un elemento del curricolo primaria si collega a uno della secondaria.

La presenza della sola voce "Tutti" nel filtro segmenti potrebbe dipendere da:
- dati non ancora caricati al momento del rendering;
- filtro segmenti non alimentato correttamente;
- oppure scelta progettuale che nasconde i segmenti fino a quando non si seleziona un filtro.

Prima di ogni test con docenti reali, va verificato che il dataset pilota sia correttamente inizializzato e che i segmenti siano visibili nel filtro.

---

## Audit tecnico CML-631E

### A1. Verifica caricamento dati: 2 segmenti e 6 elementi

**Risultato**: Il dataset `pilotData.ts` definisce correttamente 2 segmenti e 6 nodi. Tuttavia, esiste un bug critico in `useCurriculumPilot.ts` alla riga 95:

```tsx
// BUG: carica i nodi solo per il primo segmento
setNodesState(listPilotNodes(pilotDatasetState.segmentIds[0] || '').ok ? ... : []);
```

`refreshData()` chiama `listPilotNodes(segmentIds[0])`, caricando in `nodesState` solo i 3 nodi primari. I 3 nodi secondari non vengono mai caricati. Di conseguenza, il filtro "Tutti" mostra solo 3 elementi, e il filtro per il segmento secondario mostra zero elementi.

**Impatto**: il docente vede solo elementi primari anche quando il filtro mostra entrambi i segmenti. Il collegamento tra primaria e secondaria non è rappresentabile con il dataset attuale.

**Correzione richiesta prima dell'implementazione CML-631E**: `refreshData()` deve caricare i nodi per TUTTI i segmenti, non solo il primo. Ad esempio:

```tsx
const allNodes = pilotDatasetState.segmentIds.flatMap(segmentId =>
  listPilotNodes(segmentId).ok ? (listPilotNodes(segmentId) as { ok: true; data: CurriculumNode[] }).data : []
);
setNodesState(allNodes);
```

### A2. Causa della sola voce "Tutti" nel filtro segmenti

**Risultato**: I segmenti vengono caricati correttamente (`listPilotSegments` → `PILOT_SEGMENTS` → 2 segmenti). I bottoni del filtro vengono renderizzati da `pilot.segments.map(segment => ...)`. Quindi, se il pilota è attivo e inizializzato, entrambi i bottoni di segmento appaiono.

La sola presenza di "Tutti" osservata dall'utente è causata da una di queste condizioni:
1. Il pilota non era stato inizializzato (nessun dataset caricato);
2. Il pilota non era stato attivato (modalità `disabled`);
3. Il bug A1 fa sì che il segmento secondario appaia nel filtro ma non mostri nodi quando selezionato, rendendolo inutilizzabile e dando l'impressione che non ci siano segmenti.

**Azione**: verificare l'inizializzazione del pilota prima di ogni test con docenti.

### A3. Fattibilità della selezione progressiva

**Risultato**: La selezione progressiva (prima la partenza, poi l'arrivo) è **fattibile senza modifiche al dominio e alla persistenza**. L'architettura attuale supporta già i cambiamenti necessari:

- `PilotMainView` mantiene `selectedSourceNodeId` e `selectedTargetNodeId` nello stato locale
- `PilotNodePicker` accetta props `nodes`, `selectedNodeId`, `onSelect`
- `PilotVerticalLinkForm` è condizionato alla selezione di entrambi i nodi

Le modifiche sono puramente UI/UX:
1. Aggiungere prop `isDisabled` a `PilotNodePicker`
2. Passare `isDisabled={!selectedSourceNodeId}` al picker target
3. Passare `selectedSourceNodeId` al picker target per escludere il nodo sorgente dalle opzioni
4. Aggiungere indicatore visivo del nodo sorgente selezionato

Nessuna modifica a: tipi di dominio, servizi, persistenza, store, route.

### A4. Comportamento desktop, tastiera e touch

| Aspetto | Stato attuale | Problema |
|---------|---------------|----------|
| **Desktop** | Tutti gli elementi sono `<button>` o `<input>` → navigabile con Tab/Enter | OK |
| **Tastiera** | Focus ring presente (`focus:ring-2 focus:ring-indigo-500/40`) | OK |
| **Touch — nodi** | Bottoni grandi (px-3 py-2) → adeguati | OK |
| **Touch — tipi di relazione** | Tooltip tramite `title` attribute → NON accessibili da tocco | **Problema** |
| **Touch — form** | textarea e bottoni adeguati | OK |

**Problema critico**: i 6 tipi di relazione in `PilotVerticalLinkForm` usano `title` per i tooltip. Su dispositivi touch, `title` non è visibile (richiede hover). L'utente non può scoprire la descrizione di ogni tipo di relazione senza un mouse.

**Correzione**: sostituire i tooltip `title` con descrizioni visibili accanto a ogni bottone, o con un pannello di aiuto accessibile.

### A5. Criteri misurabili per CML-631F

| # | Criterio | Misurazione | Soglia |
|---|----------|-------------|--------|
| C1 | Completamento flusso senza assistenza | % di utenti non tecnici che completano la creazione di un collegamento | ≥ 80% |
| C2 | Tempo medio per creare un collegamento | Tempo dall'apertura alla pressione del bottone "Proponi" | ≤ 120 secondi |
| C3 | Zero terminologia tecnica nell'interfaccia | Controllo visivo: nessuna occorrenza di "nodo", "punto di partenza", "punto di arrivo" | 0 occorrenze |
| C4 | Secondo picker disabilitato finché il primo non è selezionato | Verifica UI: il secondo picker è grigio/disabilitato all'apertura | Pass |
| C5 | Segmenti visibili nel filtro | Verifica: almeno 2 bottoni di segmento visibili quando il pilota è attivo | ≥ 2 |
| C6 | Elementi visibili come schede | Verifica: almeno 3 schede visibili senza digitare nella ricerca | ≥ 3 |
| C7 | Tipi di relazione accessibili da tocco | Verifica: la descrizione di ogni tipo è visibile senza hover | Pass |
| C8 | Lista collegamenti non distrae | Verifica: la lista è sotto il form di creazione, non accanto | Pass |
| C9 | Test interno con persona non tecnica | Una persona senza conoscenza del modello interno completa il flusso | Successo |

---

## Flusso attuale

```
1. La schermata mostra:
   - Titolo "COLLEGAMENTI VERTICALI CURRICOLARI"
   - Due field di ricerca vuoti ("Punto di partenza", "Punto di arrivo")
   - Filtro segmenti (solo "Tutti" se i dati non sono caricati)
   - Lista dei collegamenti esistenti (vuota)
   - Form di creazione collegamento (nascosto finché non si selezionano entrambi i nodi)

2. L'utente deve:
   - Capire che deve cercare un "nodo"
   - Digitare nella prima casella di ricerca
   - Selezionare un risultato
   - Digitare nella seconda casella di ricerca
   - Selezionare un risultato
   - Scegliere un tipo di relazione (con tooltip poco visibili)
   - Scrivere una motivazione
   - Salvare
```

---

## Flusso proposto

### Passaggio 1 — Presentare il compito

Sostituire "Seleziona i nodi da collegare" con:

> **Crea un collegamento nel curricolo verticale**
> Scegli un elemento della primaria e indica come prosegue nella secondaria.

### Passaggio 2 — Mostrare gli elementi come schede visibili

Il primo pannello mostra direttamente le opzioni disponibili come schede cliccabili, non solo tramite ricerca:

```
1. Da quale elemento vuoi partire?

Primaria · classe quinta · Matematica

┌─────────────────────────────────────┐
│ Leggere e interpretare rappresentazioni │
│ di dati                               │
│ Competenza · Traguardo               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Calcolare con le frazioni            │
│ Obiettivo · Traguardo               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Geometria piana                       │
│ Milestone · Traguardo               │
└─────────────────────────────────────┘

Cerca tra gli elementi del curricolo
[ campo di ricerca secondario ]
```

### Passaggio 3 — Abilitare il punto di arrivo dopo la prima scelta

Il secondo campo è disabilitato finché non è scelto il primo:

> Prima scegli il punto di partenza.

Dopo la scelta:

```
2. Quale elemento lo sviluppa?

Secondaria di primo grado · classe prima · Matematica

┌─────────────────────────────────────┐
│ Rappresentare dati mediante tabelle   │
│ e grafici                             │
│ Competenza · Traguardo               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Utilizzare frazioni e rapporti        │
│ nella soluzione di problemi         │
│ Obiettivo · Traguardo               │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Statistica descrittiva                │
│ Milestone · Traguardo               │
└─────────────────────────────────────┘
```

### Passaggio 4 — Mostrare il collegamento in linguaggio naturale

Dopo le due selezioni, prima del form:

```
Hai scelto:

"Interpretare rappresentazioni di dati"
nella primaria · classe quinta · Matematica

→

"Rappresentare dati mediante tabelle e grafici"
nella secondaria · classe prima · Matematica
```

### Passaggio 5 — Scegli il tipo di relazione

> Quale relazione esiste tra questi due elementi?

I tipi di relazione sono descritti in modo comprensibile, con esempi visibili e attivabili anche tramite tocco (non solo tooltip hover).

### Passaggio 6 — Inserisci la motivazione

Campo textarea per la motivazione della proposta di collegamento.

### Passaggio 7 — Controlla e salva

Riepilogo in linguaggio naturale prima del salvataggio.

---

## Microtesti da correggere

| Attuale | Più comprensibile |
|---------|-------------------|
| Nodi curricolari | Elementi del curricolo |
| Punto di partenza | Da quale elemento vuoi partire? |
| Punto di arrivo | Quale elemento lo sviluppa? |
| Cerca nodo curricolare | Cerca un obiettivo, un traguardo o una competenza |
| Elenco dei collegamenti | Collegamenti proposti |
| Nessun collegamento verticale presente | Non hai ancora creato collegamenti |
| SELEZIONA I NODI DA COLLEGARE | Crea un collegamento nel curricolo verticale |
| Scegli i due nodi curricolari da collegare | Scegli un elemento della primaria e indica come prosegue nella secondaria |
| Filtro per segmento: | Filtra per livello scolastico |

---

## Componenti coinvolti

| Componente | File | Cambiamento previsto |
|------------|------|---------------------|
| PilotMainView | `src/features/curriculum-functional-pilot/components/PilotMainView.tsx` | Riorganizzazione layout, sostituzione etichette, flusso progressivo |
| PilotNodePicker | `src/features/curriculum-functional-pilot/components/PilotNodePicker.tsx` | Mostrare schede visibili oltre alla ricerca, secondo picker disabilitato finché il primo non è selezionato |
| PilotVerticalLinkForm | `src/features/curriculum-functional-pilot/components/PilotVerticalLinkForm.tsx` | Aggiungere riepilogo in linguaggio naturale prima del form, migliorare accessibilità tooltip per tocco |
| PilotLinkList | `src/features/curriculum-functional-pilot/components/PilotLinkList.tsx` | Spostare in posizione secondaria o scheda separata |
| PilotStatusPanel | `src/features/curriculum-functional-pilot/components/PilotStatusPanel.tsx` | Nessun cambiamento strutturale |
| Filtro segmenti | `PilotMainView.tsx` (linee 91-122) | Verificare che i segmenti siano visibili quando il dataset è caricato |

---

## Perimetro

### Incluso
- Riorganizzazione del flusso di selezione in 5 passaggi progressivi
- Sostituzione della terminologia tecnica con linguaggio comprensibile
- Visualizzazione degli elementi come schede visibili (non solo ricerca)
- Disabilitazione del secondo picker finché il primo non è selezionato
- Mostrare ordine scolastico, classe e disciplina nelle opzioni
- Riepilogo in linguaggio naturale dopo le selezioni
- Miglioramento dell'accessibilità touch per i tipi di relazione
- Spostamento della lista dei collegamenti in posizione secondaria

### Escluso
- Nuovi ruoli o workflow di approvazione
- Nuovi dataset o dati sintetici aggiuntivi
- Nuove route o modifiche al routing
- Modifiche a store, Dexie o migrazione
- Export
- Attivazione globale del pilota
- Nuovi layer o pattern architetturali

---

## Test previsti

1. **Verifica dataset pilota**: confermare che 2 segmenti e 6 elementi curricolari siano caricati e visibili nel filtro segmenti
2. **Verifica flusso progressivo**: il secondo picker è disabilitato finché il primo non è selezionato
3. **Verifica terminologia**: nessuna occorrenza di "nodo", "punto di partenza", "punto di arrivo" nell'interfaccia
4. **Verifica schede visibili**: gli elementi sono mostrati come schede, non solo tramite ricerca
5. **Verifica ordine/classe/disciplina**: visibili per ogni elemento nella scheda
6. **Verifica riepilogo linguaggio naturale**: dopo le selezioni, il collegamento è espresso in linguaggio comprensibile
7. **Verifica accessibilità touch**: i tipi di relazione sono selezionabili con tocco senza dover tenere premuto
8. **Verifica lista secondaria**: i collegamenti esistenti non distraggono dalla creazione
9. **Test interno**: esecuzione con una persona non tecnica che deve completare la creazione di un collegamento senza istruzioni esterne

---

## Criteri di chiusura

1. Una persona non tecnica riesce a creare un collegamento verticale senza spiegazioni esterne
2. La terminologia tecnica ("nodo", "punto di partenza", "punto di arrivo") non appare nell'interfaccia
3. Il secondo picker è disabilitato e guida l'utente verso la prima scelta
4. I segmenti sono visibili nel filtro quando il dataset è caricato
5. Gli elementi sono visibili come schede, non solo tramite ricerca
6. Il riepilogo è espresso in linguaggio naturale
7. L'aiuto sui tipi di relazione funziona con mouse, tastiera e tocco
8. La lista dei collegamenti non distrae dalla creazione

---

## Rischio per CML-631F

Se CML-631F (validazione reale con 5 docenti) venisse eseguita prima di CML-631E, i seguenti rischi sono concreti:

1. **I docenti non riuscirebbero a usare la schermata senza spiegazioni esterne**, invalidando la validazione dell'interfaccia stessa
2. **Il feedback raccolto mescolerebbe problemi di usabilità con problemi di spiegazione**, rendendo i risultati inutilizzabili
3. **Si rischia di validare un flusso che i docenti reali non riuscirebbero a usare autonomamente**, sprecando risorse e tempo
4. **La correzione successiva sarebbe più costosa** (feedback consolidato da test con utenti reali vs. correzione preventiva)

La decisione operativa è: **sospendere CML-631F finché CML-631E non è completata e i criteri di chiusura sono soddisfatti**.

---

## Verdetto

```text
CML_631E_PROPOSAL_READY_FOR_DOMAIN_AND_UX_AUDIT
NO_IMPLEMENTATION_YET
REAL_TEACHER_VALIDATION_REMAINS_SUSPENDED
```

**Audit findings:**
- A1: Bug confermato — `refreshData()` carica nodi solo per il primo segmento. Correzione richiesta prima dell'implementazione CML-631E.
- A2: I segmenti sono caricati correttamente; la sola voce "Tutti" è causata da pilota non inizializzato o dal bug A1.
- A3: Selezione progressiva fattibile senza modifiche al dominio/persistenza.
- A4: Tooltip touch non accessibili — richiede correzione nell'implementazione CML-631E.
- A5: 9 criteri misurabili definiti per CML-631F readiness.

**Azione successiva:** revisione della proposta da parte del team. Nessuna implementazione fino all'approvazione.