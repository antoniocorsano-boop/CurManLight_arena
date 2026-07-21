# Teacher Workspace — Prima Proposta Product-First

> Il docente potrà entrare in CurManLight e riprendere il proprio lavoro dal punto corretto, comprendendo immediatamente stato, priorità e prossima azione.

## 1. Rapporto di Osservazione

### Scenario testato: ritorno dopo interruzione

Un docente apre CurManLight dopo qualche giorno di assenza.

**Cosa succede oggi:**

1. L'app si apre su `/` (Dashboard)
2. La Dashboard mostra:
   - Per ruolo `insegnante`: un widget con "3/5 moduli" e barra di progresso
   - Tre card identiche (Curricolo, Progettazione, Classe) senza indicazione di stato
   - Nessuna informazione su cosa stava facendo
3. Se il docente stava compilando un UDA al passo 3 di 5:
   - Lo wizard si è resettato al passo 1
   - I campi compilati (titolo, periodo, ore, compito) sono persi
   - Deve ripartire da capo
4. Se aveva apportato glossario personalizzato:
   - I termini sono persi (useKnowledgeStore non persiste)
5. Se aveva una conversazione con il Copilot:
   - La chat è persa (useCopilotStore non persiste)

### Dove perde tempo il docente

| Scenario | Tempo perso | Causa |
|---|---|---|
| Riprendere un UDA in corso | 3-5 minuti | Wizard resettato |
| Verificare decisioni pendenti | 2-3 minuti | Non mostrate in Dashboard |
| Trovare l'ultimo UDA salvato | 1-2 minuti | Non evidenziato |
| Capire che cosa manca | 1-2 minuti | Nessun indicatore di completezza |
| Ripristinare contesto | 2-3 minuti | Nessun "benvenuto" personalizzato |

**Tempo totale perso per accesso: 10-15 minuti**

### Informazioni già disponibili ma non mostrate

| Dato | Fonte | Oggi visibile | Potrebbe servire per |
|---|---|---|---|
| `savedUda.length` | useCurriculumStore | Solo barra progresso | "Continua ultimo UDA" |
| `decisions` count | useCurriculumProgressStats | Solo nel tab Processo | Contatore urgenze |
| `progressPercent` | useCurriculumProgressStats | Nascosto | Anello progresso |
| `lastSaveTime` | useSessionStore | **Mai scritto** | "Ultimo salvataggio: 5 min fa" |
| `workspace.lastSyncTime` | useWorkspaceStore | Solo durante sync | "Ultimo sync: oggi 14:32" |
| `schoolYear` | useCurriculumStore | Solo interno | Badge "A.S. 2025-2026" |
| `discipline` + `order` | useCurriculumStore | Solo interno | "Italiano - Secondaria" |
| `assignedCombinations` | useOnboardingProfile | Solo filtro classe | "Le tue classi: 2^A, 3^B" |

### Problem specifici trovati

1. **Dashboard vuota e non informativa** — widget generici, nessun dato personalizzato
2. **Wizard non persistente** — wizardStep resettato ad ogni navigazione
3. **Navigazione perde sub-contesto** — URL non codifica sotto-viste
4. **Nessun indicatore "non salvato"** — il docente non sa se i dati sono al sicuro
5. **Knowledge e Glossario sono usa-e-getta** — investimento perso al refresh
6. **Nessun riepilogo cross-dominio** — ogni sezione opera isolata
7. **Sidebar troppo profonda** — 3 livelli per raggiungere funzioni semplici
8. **Onboarding non continua** — profilo statico dopo primo accesso

## 2. Mappa dei Problemi

### Problema primario
**Il docente non può riprendere il lavoro senza ricostruire il contesto.**

### Problemi secondari
- Non sa cosa ha già completato
- Non sa cosa richiede attenzione
- Non sa quale azione compiere ora
- Perde tempo a navigare per trovare informazioni già disponibili

## 3. Definizione degli Stati del Lavoro

### Stati identificati

| Stato | Descrizione | Azione consigliata |
|---|---|---|
| `nessuna_attivita` | Primo accesso o nessun UDA salvato | Inizia nuovo UDA |
| `in_corso` | UDA salvato ma incompleto o con errori | Continua compilazione |
| `pronto_per_verifica` | UDA completo, da rivedere | Verifica e esporta |
| `esportato` | UDA esportato ma modificabile | Consulta o modifica |
| `bozza` | UDA salvato come bozza | Continua o elimina |
| `completo` | UDA validato e pronto | Condividi o archivia |

### Transizioni

```
nessuna_attivita → in_corso (crea nuovo UDA)
in_corso → pronto_per_verifica (completa tutti i campi)
pronto_per_verifica → esportato (esporta)
esportato → in_corso (modifica)
bozza → in_corso (riprendi)
bozza → elimina (scarta)
completo → condividi (social)
```

## 4. Flusso Utente Principale

### Flusso A: Ritorno dopo interruzione

```
1. Docente apre CurManLight
2. Vede: "Bentornato. Lavoravi su: UDA 'Smart Home' (passo 3/5)"
3. Vede: "26 decisioni pendenti per Italiano"
4. Vede: "Ultimo salvataggio: ieri alle 15:20"
5. Clicca "Continua UDA"
6. Si apre il wizard al passo 3 con i dati precedenti
7. Prosegue il lavoro
```

### Flusso B: Primo accesso

```
1. Docente apre CurManLight per la prima volta
2. Vede: "Benvenuto in CurManLight"
3. Vede: "Per iniziare, configura il tuo profilo"
4. Compila: ruolo, disciplina, classe
5. Vede: "Profilo configurato. Inizia consultando il curricolo"
6. Clicca "Consulta Curricolo"
```

### Flusso C: Verifica decisioni pendenti

```
1. Docente apre CurManLight
2. Vede: "26 decisioni pendenti su 46 totali"
3. Clicca "Revisiona decisioni"
4. Si apre il tab Processo con filtro attivo
5. Revisiona e decide
6. Torna alla Dashboard
7. Il contatore si aggiorna
```

### Flusso D: Multiple attività

```
1. Docente apre CurManLight
2. Vede: "Le tue attività recenti"
   - UDA 'Smart Home' — in corso (passo 3/5) — Continua
   - UDA 'Letteratura' — bozza — Riprendi
   - UDA 'Geografia' — esportato — Consulta
3. Sceglie quale continuare
```

## 5. Tre Ipotesi di Soluzione

### Ipotesi 1: Dashboard Personalizzata

**Concetto:** Trasformare la Dashboard in un pannello "Stato del lavoro" che mostra:
- Benvenuto personalizzato con ultimo accesso
- Attività recenti con stato
- Decisioni pendenti con contatore
- Azione consigliata
- Ultimo salvataggio/sync

**Vantaggi:**
- Modifica minimale (solo componente Dashboard)
- Usa dati già disponibili nei store
- Nessuna modifica alla navigazione
- Coerente con baseline congelata

**Svantaggi:**
- Non risolve il problema del wizard resettato
- Non persiste sotto-viste

### Ipotesi 2: Persistenza Wizard + Dashboard Stato

**Concetto:** Combinare:
1. Dashboard personalizzata (come Ipotesi 1)
2. Persistenza dello stato del wizard (wizardStep + form data)
3. Indicatore "lavoro in corso" nel sidebar

**Vantaggi:**
- Risolve il problema principale (ripresa lavoro)
- Migliora la visibilità dello stato
- Mantiene semplicità

**Svantaggi:**
- Richiede aggiunta di persistenza a useSessionStore
- Più complessità dell'Ipotesi 1

### Ipotesi 3: Workspace Completo con Timeline

**Concetto:** Dashboard come "workspace" con:
- Timeline delle attività
- Stato di ogni dominio
- Azioni rapide
- Contesto persistente
- Notifiche contestuali

**Vantaggi:**
- Esperienza completa
- Massima visibilità

**Svantaggi:**
- Rischio sovraccarico visivo
- Complessità implementativa
- Potrebbe violare il principio "un solo cambiamento significativo per volta"

## 6. Valutazione Comparativa

| Criterio | Ipotesi 1 | Ipotesi 2 | Ipotesi 3 |
|---|---|---|---|
| Valore per il docente | ★★★☆☆ | ★★★★★ | ★★★★☆ |
| Complessità implementativa | ★☆☆☆☆ | ★★☆☆☆ | ★★★★☆ |
| Rischio regressione | ★☆☆☆☆ | ★☆☆☆☆ | ★★☆☆☆ |
| Coerenza con baseline | ★★★★★ | ★★★★★ | ★★★☆☆ |
| Validabilità | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| Tempo di implementazione | 1-2 giorni | 3-4 giorni | 7-10 giorni |

## 7. Raccomandazione

**Ipotesi 2: Persistenza Wizard + Dashboard Stato**

Motivazione:
- Risolve il problema principale (ripresa lavoro)
- Mantiene la complessità gestibile
- Coerente con baseline congelata
- Validabile con docenti reali
- Un solo cambiamento significativo per volta

## 8. Mock della Soluzione Raccomandata

### Dashboard — Stato "ritorno dopo interruzione"

```
┌─────────────────────────────────────────────────────────┐
│  Bentornato, Prof.ssa Rossi                             │
│  Ultimo accesso: ieri alle 15:20                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  IL TUO LAVORO IN CORSO                         │   │
│  │                                                  │   │
│  │  UDA "Smart Home con Blender 3D"                │   │
│  │  Passo 3 di 5 — Parametri Operativi             │   │
│  │  Ultimo salvataggio: 2 minuti fa                 │   │
│  │                                                  │   │
│  │  [Continua UDA →]                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  RIEPILOGO RAPIDO                               │   │
│  │                                                  │   │
│  │  Curricolo: 67% revisionato                      │   │
│  │  Decisioni pendenti: 26 su 46                    │   │
│  │  UDA salvati: 3                                  │   │
│  │  Classi configurate: 2^A, 3^B                    │   │
│  │                                                  │   │
│  │  [Revisiona decisioni]  [Consulta UDA]          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ATTIVITÀ RECENTI                               │   │
│  │                                                  │   │
│  │  📄 UDA "Letteratura" — bozza — 2 giorni fa     │   │
│  │  📄 UDA "Geografia" — esportato — 5 giorni fa   │   │
│  │  📚 Glossario: 12 termini definiti              │   │
│  │  🤖 Copilot: ultima chat ieri                   │   │
│  │                                                  │   │
│  │  [Vedi tutte le attività]                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Dashboard — Stato "primo accesso"

```
┌─────────────────────────────────────────────────────────┐
│  Benvenuto in CurManLight                               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  COMINCIARE                                      │   │
│  │                                                  │   │
│  │  1. Consulta il curricolo della tua disciplina   │   │
│  │  2. Revisiona le decisioni d'istituto            │   │
│  │  3. Inizia a progettare un'unità didattica       │   │
│  │                                                  │   │
│  │  [Consulta Curricolo →]                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  CONFIGURAZIONE                                 │   │
│  │                                                  │   │
│  │  Profilo: ✅ Configurato                        │   │
│  │  Classi: ⚠️ Da configurare                      │   │
│  │  Workspace: ⚠️ Non connesso                     │   │
│  │                                                  │   │
│  │  [Configura classi]  [Connetti workspace]       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Dashboard — Stato "multe attività"

```
┌─────────────────────────────────────────────────────────┐
│  Bentornato, Prof.ssa Rossi                             │
│  Ultimo accesso: oggi alle 9:15                         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  LE TUE ATTIVITÀ                                │   │
│  │                                                  │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │ UDA "Smart Home" — in corso (3/5)       │    │   │
│  │  │ [Continua →]                             │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │ UDA "Letteratura" — bozza               │    │   │
│  │  │ [Riprendi →]                             │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │ UDA "Geografia" — esportato             │    │   │
│  │  │ [Consulta →]                             │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │                                                  │   │
│  │  [Nuovo UDA]                                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  AZIONI RAPIDE                                  │   │
│  │                                                  │   │
│  │  [Revisiona 26 decisioni pendenti]              │   │
│  │  [Consulta curricolo]                           │   │
│  │  [Gestisci classi]                              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 9. Piano della Più Piccola Implementazione Utile

### Parte 1: Persistenza stato wizard (2 giorni)

**Beneficio per il docente:** "Il docente potrà riprendere un UDA esattamente dal passo in cui lo aveva lasciato."

- Aggiungere `persist` a `useSessionStore` per `wizardStep`, `progTitle`, `progPeriod`, `progHours`, `progNotes`, `realTaskInput`
- Aggiungere `lastSaveTime` al salvataggio
- Testare che il wizard sopravviva al refresh

### Parte 2: Dashboard personalizzata (2 giorni)

**Beneficio per il docente:** "Il docente potrà comprendere immediatamente stato, priorità e prossima azione."

- Creare componente `TeacherDashboard` con:
  - Benvenuto personalizzato con ultimo accesso
  - Attività in corso con stato
  - Contatore decisioni pendenti
  - Azione consigliata
- Integrare esistente DashboardPage

### Parte 3: Indicatore lavoro in corso (1 giorno)

**Beneficio per il docente:** "Il docente potrà sapere se ci sono modifiche non salvate."

- Aggiungere badge "Lavoro in corso" nel sidebar quando c'è un wizard attivo
- Mostrare "X minuti fa" per ultimo salvataggio

### Totale: 5 giorni di implementazione

## 10. Criteri di Validazione con Docenti

### Test 1: Ritorno dopo interruzione
- **Scenario:** Docente inizia un UDA, si interrompe, torna dopo 10 minuti
- **Atteso:** Vede "Continua UDA" con stato corretto
- **Misura:** Tempo per riprendere il lavoro

### Test 2: Dashboard informativa
- **Scenario:** Docente con 3 UDA salvati apre l'app
- **Atteso:** Vede riepilogo stato e azioni consigliate
- **Misura:** Numero di click per trovare informazione

### Test 3: Decisioni pendenti
- **Scenario:** Docente con 20 decisioni pendenti
- **Atteso:** Vede contatore e può accedere direttamente
- **Misura:** Tempo per raggiungere revisione

### Test 4: Wizard persistente
- **Scenario:** Docente al passo 3 di 5, fa refresh
- **Atteso:** Torna al passo 3 con dati precedenti
- **Misura:** Dati persi dopo refresh

### Test 5: Mobile
- **Scenario:** Docente usa tablet
- **Atteso:** Dashboard leggibile e utilizzabile
- **Misura:** Accessibilità su dispositivo mobile

---

*Documento prodotto come analisi e mock. Nessuna modifica al codice è stata effettuata.*
