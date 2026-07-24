# CML-617A — Teacher Workspace Activity Mock

> Mock dell'area "Attività recenti" nella Dashboard del docente. Definisce contenuto, layout, gerarchia informativa e comportamento prima dell'implementazione (CML-617B).

## 1. Posizione

Il widget "Attività recenti" si inserisce **dopo** il widget "Stato del Lavoro" (esistente) e **prima** delle tre card area core (Curricolo, Progettazione, Classe).

Sequenza nel flusso Dashboard (insegnante):

```
┌─ Stato del Lavoro ─────────────────────────────┐  ← esistente
│  Badge, metriche, azione primaria              │
└────────────────────────────────────────────────┘
┌─ Attività recenti ─────────────────────────────┐  ← nuovo (CML-617B)
│  3 elementi max                                │
└────────────────────────────────────────────────┘
┌─ Card area core ───────────────────────────────┐  ← esistente
│  Curricolo | Progettazione | Classe            │
└────────────────────────────────────────────────┘
```

## 2. Layout

### 2.1 Stato "con attività"

```
┌──────────────────────────────────────────────────────────┐
│  ATTIVITÀ RECENTI                              [3 attività]│
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  UDA "Smart Home" — in corso (passo 3/5)         │   │
│  │  oggi                                             │   │
│  │  ────────────────────────────────────────────     │   │
│  │  [Riprendi →]                                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  UDA "Letteratura" — bozza                        │   │
│  │  2 giorni fa                                      │   │
│  │  ────────────────────────────────────────────     │   │
│  │  [Apri →]                                         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  "Smart Home.docx" — esportato                   │   │
│  │  ieri                                             │   │
│  │  ────────────────────────────────────────────     │   │
│  │  [Apri →]                                         │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Stato vuoto (CML-610)

```
┌──────────────────────────────────────────────────────────┐
│  ATTIVITÀ RECENTI                                        │
│                                                          │
│  Non hai ancora attività. Inizia a progettare un         │
│  UDA o consulta il curricolo per impostare il tuo        │
│  percorso didattico.                                     │
│                                                          │
│  [Inizia dal Curricolo]                                  │
└──────────────────────────────────────────────────────────┘
```

## 3. Contenuto

### 3.1 Fonti dati

| Elemento | Fonte | Esempio |
|----------|-------|---------|
| Titolo attività | `savedUda[i].title` o `progTitle` o `DocumentExportEvent.label` | "Smart Home" |
| Tipo attività | Derivato dal contesto | "UDA", "documento", "esportazione" |
| Stato/descrizione | `savedUda[i].status` o `wizardStep` | "in corso (3/5)", "bozza" |
| Tempo relativo | `savedUda[i].createdAt` o `curman_lastSaveTime` o `exportedAt` | "oggi", "ieri", "2 giorni fa" |
| Azione | Dipende dal tipo attività | "Riprendi", "Apri" |

### 3.2 Regole di selezione (3 elementi massimo)

1. **Primo**: UDA con `wizardStep > 1` (progettazione in corso) — se esiste, è sempre primo
2. **Secondo**: Ultimo UDA modificato da `savedUda` (più recente per `createdAt`) — se diverso dal primo
3. **Terzo**: Ultimo evento da `documentExportHistory` (più recente per `exportedAt`) — se esiste

Se una fonte non ha dati, si scala alla successiva. Se tutte sono vuote → stato vuoto.

### 3.3 Tempo relativo (soglia giorno)

| Periodo | Etichetta |
|---------|-----------|
| < 24h da ora | oggi |
| < 48h | ieri |
| < 7gg | N giorni fa |
| >= 7gg | data (gg/mm) |

Nessuna precisione al minuto. Nessun badge "nuovo" in questa slice.

### 3.4 Azioni

| Elemento | Azione | Destinazione |
|----------|--------|-------------|
| UDA in corso (wizardStep > 1) | Riprendi → | progetta-annuale → annuale (wizard) |
| UDA salvato (bozza/completo) | Apri → | progetta-annuale → uda (archivio) |
| Documento esportato | Apri → | esportazioni (vista documenti) |

## 4. Dati utilizzati (esistenti, nessuna nuova chiave)

| Chiave | Origine | Oggi esiste |
|--------|---------|-------------|
| `savedUda[]` | useCurriculumStore | ✅ |
| `wizardStep` | useCurriculumStore / localStorage | ✅ |
| `progTitle` | useCurriculumStore / localStorage | ✅ |
| `curman_lastSaveTime` | localStorage | ✅ |
| `documentExportHistory[]` | useCurriculumStore | ✅ |

Nessuna nuova chiave localStorage. Nessun nuovo store. Nessuna nuova prop in AppViewsLayer.

## 5. Variante per CML-617B

La prima slice implementa esattamente questo mock, con:

- 1 widget sotto "Stato del Lavoro", full-width (`col-span-3`)
- Stesso linguaggio visivo (badge, testo, spaziatura)
- Stessa palette colore del widget esistente (slate/indigo)
- 3 item massimo, ordinati per rilevanza
- Tempo relativo a granularità giorno
- Stato vuoto con messaggio e azione
- Assenza di badge nuovi/filtri/ordinamenti/notifiche
- Test: 14 nuovi (stato pieno, stato vuoto, ordinamento, azioni, edge case)

## 6. Criteri di validazione del mock

| # | Criterio | Metodo |
|---|----------|--------|
| M1 | Il docente vede "Attività recenti" sotto "Stato del Lavoro" | Ispezione visiva |
| M2 | Il docente vede massimo 3 elementi | Conteggio |
| M3 | Il docente vede tempo relativo senza minuti | Ispezione |
| M4 | Il docente può cliccare "Riprendi" o "Apri" | Click test |
| M5 | Il docente senza attività vede stato vuoto | Ispezione |
| M6 | Il messaggio vuoto contiene azione "Inizia dal Curricolo" | Ispezione |
| M7 | Nessun badge "nuovo" visibile | Ispezione |
| M8 | Nessun filtro/ordinamento visibile | Ispezione |

---

*Mock approvato per implementazione CML-617B. Nessuna modifica a questo mock senza nuova validazione.*
