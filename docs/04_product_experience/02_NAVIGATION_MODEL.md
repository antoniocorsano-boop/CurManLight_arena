# Modello di Navigazione — CurManLight

> Documento derivato dall'analisi dell'architettura di navigazione inline in `App.tsx`.
> Ultimo aggiornamento: 2026-07-19

---

## 1. Architettura Generale

CurManLight utilizza un sistema di navigazione basato su `useState` senza React Router.
Il tab attivo è governato dallo stato `activeTab` che può assumere 11 valori discreti:

```
'dashboard' | 'curricolo' | 'revisione' | 'progetta-evidenze' |
'progetta-annuale' | 'processo' | 'esportazioni' | 'certificazione-pa' |
'fonti' | 'guida' | 'second-brain'
```

La navigazione secondaria è gestita da sotto-stati complementari:
- `activeCurricoloView`: `'albero' | 'mappa' | 'popolamento'` (per il curricolo)
- `activeProgTab`: `'annuale' | 'uda' | 'certificazione' | 'social' | 'classe'` (per la progettazione)
- `activeProcessoTab`: `'flusso' | 'verifica'` (per il processo)
- `activeGeneralSubtab`: `'premessa' | 'riforma' | 'obiettivi' | 'livelli'`
- `classeSubTab`: `'registro' | 'strumenti' | 'pianificazione'`
- `popolamentoTab`: `'copilot' | 'csv' | 'security'`

---

## 2. Layout Desktop (≥768px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER  (h-16, sticky top-0, z-50, bg-slate-900)                 │
│  [☰] [Logo] CurManLight    [Co-pilota Chat] [Stato IA] [💾] [👤] │
├─────────────┬────────────────────────────────────────────────────────┤
│             │                                                        │
│  SIDEBAR    │   MAIN CONTENT                                         │
│  (w-64)     │   (flex-1, overflow-y-auto)                           │
│  collaps.   │                                                        │
│             │   ┌──────────────────────────────────────────────┐     │
│  [Nav Glob] │   │                                              │     │
│  · Home     │   │   Contenuto del tab attivo                   │     │
│             │   │                                              │     │
│  [Curricol] │   │   (dashboard, curricolo, revisione, ...)     │     │
│  · Albero   │   │                                              │     │
│  · Mappa    │   │                                              │     │
│  · Popolam. │   │                                              │     │
│  · Revisione│   └──────────────────────────────────────────────┘     │
│  · Fonti    │                                                        │
│             │                                                        │
│  [Progettaz]│                                                        │
│  · Wizard   │                                                        │
│  · Archivio │                                                        │
│  · Matrice  │                                                        │
│  · Processo │                                                        │
│  · Esporta  │                                                        │
│             │                                                        │
│  [Classe]   │                                                        │
│  · Ambiente │                                                        │
│  · Osservat.│                                                        │
│             │                                                        │
│  [Supporto] │                                                        │
│  · Certif.  │                                                        │
│  · WikiLLM  │                                                        │
│  · Guida    │                                                        │
└─────────────┴────────────────────────────────────────────────────────┘
```

### Specifiche Desktop

| Elemento | Proprietà CSS | Comportamento |
|----------|---------------|---------------|
| Header | `sticky top-0 z-50 h-16 bg-slate-900` | Fisso in alto durante lo scroll |
| Sidebar | `w-64 shrink-0` | Collassabile con `sidebarCollapsed` state; su mobile diventa overlay |
| Main Content | `flex-1 min-w-0 overflow-hidden` | Scroll indipendente via `overflow-y-auto` |
| Container principale | `flex flex-col md:flex-row gap-6` | Sidebar + main affiancati |

### Comportamento Sidebar Desktop

Quando il pulsante ☰ viene premuto su desktop:
- `sidebarCollapsed` viene invertito (`false → true` o viceversa)
- La sidebar passa da `hidden md:block` a `hidden` (nascosta) e viceversa
- La transizione è gestita da `transition-all duration-300`

---

## 3. Layout Tablet (<768px ma non mobile strettamente)

Il rilevamento dispositivo avviene via `navigator.userAgent` e `navigator.maxTouchPoints`.
Lo stato `detectedDeviceType` determina `'desktop' | 'mobile'`.

Su tablet/mobile il sidebar si comporta come overlay:

```
┌──────────────────────────────────┐
│  HEADER  (h-16, sticky)         │
│  [☰] [Logo] CurManLight  [👤]  │
├──────────────────────────────────┤
│                                  │
│   MAIN CONTENT                   │
│   (occupa tutta la larghezza)    │
│                                  │
├──────────────────────────────────┤
│  BOTTOM NAV  (h-16, fixed)      │
│  [Home][Consulta][Rev][Progetta]│
│           [Esporta]              │
└──────────────────────────────────┘
```

Quando si preme ☰ su mobile:
1. Il sidebar viene reso visibile come overlay fisso
2. Classe applicata: `fixed inset-y-16 left-4 bg-white border-2 border-slate-200 shadow-2xl z-40 p-4 rounded-2xl w-[280px]`
3. Lo sfondo non ha backdrop scuro — il sidebar è un pannello flottante
4. Cliccando su un voce di menu, il sidebar si chiude automaticamente

---

## 4. Layout Mobile (<768px)

### Barra di Navigazione Inferiore (Bottom Nav)

La bottom nav è sempre visibile su dispositivi mobile (`md:hidden`):

```
┌──────────────────────────────┐
│  HEADER  (h-16, sticky)     │
│  [☰] [Logo] CurManLight    │
├──────────────────────────────┤
│                              │
│   MAIN CONTENT               │
│   (con padding-bottom: 4rem │
│    per evitare sovrapposiz.) │
│                              │
├──────────────────────────────┤
│  BOTTOM NAV (h-16, fixed)   │
│  [Home][Consulta][Rev][Pro] │
│           [Esporta]          │
└──────────────────────────────┘
```

| Voce | Icona | Tab target | Badge |
|------|-------|------------|-------|
| Home | FolderOpen | `dashboard` | — |
| Consulta | Layers | `curricolo` | — |
| Revisione | RotateCcw | `revisione` | Conteggio pending (se > 0) |
| Progetta | Calendar | `progetta-annuale` | — |
| Esporta | DownloadCloud | `esportazioni` | — |

**Stato attivo**: `text-primary-600 font-extrabold`
**Stato inattivo**: `text-slate-400 font-medium`

**Nota**: Solo 5 voci sono presenti nella bottom nav. Le voci `certificazione-pa`, `second-brain`, `guida`, `fonti`, `processo` non sono accessibili direttamente dalla bottom nav mobile — l'utente deve usare il sidebar overlay (☰) per raggiungerle.

---

## 5. Struttura Sidebar (Dettaglio Completo)

Il sidebar è organizzato in 5 sezioni con separatore visivo (`border-t border-slate-100`):

### Sezione 1: Navigazione Globale
| Voce | Tab | Icona | Note |
|------|-----|-------|------|
| Home Dashboard | `dashboard` | `FolderOpen` | Sempre visibile |

### Sezione 2: Consulta Curricolo
| Voce | Tab + View/State | Condizione visibilità |
|------|------------------|-----------------------|
| **Consulta Curricolo** (header) | `curricolo` | Attivo se tab è curricolo/revisione/fonti |
| Vista Strutturata (Albero) | `curricolo` + `albero` | Sez. curricolo attiva |
| Raccordo Diacronico (Mappa) | `curricolo` + `mappa` | Sez. curricolo attiva |
| Integrazione & Popolamento | `curricolo` + `popolamento` | Sez. curricolo attiva |
| Revisione (Gap 2025) | `revisione` | Sez. curricolo attiva, con badge pending |
| Fonti d'Istituto | `fonti` | Sez. curricolo attiva |

### Sezione 3: Progettazione UDA
| Voce | Tab + Tab | Condizione visibilità |
|------|-----------|-----------------------|
| **Progettazione UDA** (header) | `progetta-annuale` | Attivo se tab è progetta-annuale/processo/esportazioni |
| Compilatore UDA (Wizard) | `progetta-annuale` + `annuale` | Sez. progettazione attiva |
| Archivio UDA d'Istituto | `progetta-annuale` + `uda` | Sez. progettazione attiva |
| Matrice delle Competenze | `progetta-annuale` + `certificazione` | Sez. progettazione attiva |
| Processo & Consenso | `processo` | Sez. progettazione attiva |
| Esportazione File d'Ufficio | `esportazioni` | Sez. progettazione attiva |

### Sezione 4: Spazio d'Aula e Classe
| Voce | Tab + Tab | Condizione visibilità |
|------|-----------|-----------------------|
| **Spazio d'Aula e Classe** (header) | `progetta-annuale` | Attivo se progTab è classe/social |
| Ambiente & Esiti Classe | `progetta-annuale` + `classe` | Sez. classe attiva |
| Osservatorio dei Riusi d'UDA | `progetta-annuale` + `social` | Sez. classe attiva |

### Sezione 5: Supporto & Certificazioni
| Voce | Tab | Icona |
|------|-----|-------|
| Certificazione PA (AgID) | `certificazione-pa` | `ShieldCheck` (verde) |
| WikiLLM & Brain d'Istituto | `second-brain` | `Sparkles` (indaco) |
| Guida Operativa | `guida` | `HelpCircle` (blu) |

---

## 6. Header / Topbar

L'header è un elemento `sticky top-0 z-50` con sfondo `bg-slate-900` e altezza fissa `h-16`.

```
┌──────────────────────────────────────────────────────────────┐
│  [☰]  [Logo CML]  CurManLight    [🤖 Co-pilota] [IA] [💾] [👤] │
└──────────────────────────────────────────────────────────────┘
```

### Elementi Header (da sinistra a destra)

| Elemento | Componente | Comportamento |
|----------|------------|---------------|
| Menu toggle | `Menu` icon | Apre/chiude sidebar (overlay su mobile) |
| Logo | `<img>` curmanlight_v20_logo.png | Solo decorativo, h-9 |
| Titolo | Testo "CurManLight" | Gradient text `from-white to-slate-300` |
| Co-pilota Chat | `Sparkles` + testo | Apre il pannello laterale copilot |
| Stato IA | Badge圆点 + testo | Indica stato WebGPU/Ollama, click per configurare |
| Salva | `Save` icon | Apre modal salvataggio |
| Avatar utente | Cerchio gradient | Apre dropdown menu utente |

### Menu Dropdown Utente

L'avatar (`h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600`) apre un dropdown con:

| Sezione | Voci |
|---------|------|
| Intestazione | Nome utente + email (o "Utente Scolastico") |
| Azioni Cloud | Sincronizza Drive, Condividi Classroom, Importa Alunni Cifrati |
| Azioni Pericolose | Azzera Memoria d'Istituto |
| Account | Disconnetti Account / Connetti Cloud |

Il dropdown ha z-index `z-[180]` e sfondo `bg-slate-800`.

---

## 7. Navigazione Indietro (Back Navigation)

### Meccanismo Attuale

Non esiste un pulsante "Indietro" esplicito. La navigazione indietro avviene tramite:

1. **Sidebar**: cliccando su un'altra voce di sezione si cambia tab
2. **Bottom Nav mobile**: cliccando su un'altra icona
3. **Chiusura automatica sidebar mobile**: dopo ogni `handleTabSwitch`, la sidebar overlay si chiude

La funzione `handleTabSwitch` esegue:
```typescript
const handleTabSwitch = (tab) => {
  setActiveTab(tab);
  if (window.innerWidth < 768) {
    // Chiudi sidebar overlay mobile
  }
  // Reset scroll a 0
  mainEl.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'auto' });
};
```

### Back Navigation Tra Sub-Tab

Per tornare da una sotto-vista alla vista principale:
- Dalla **Vista Strutturata (Albero)** al **Dashboard**: cliccare "Home" nel sidebar/bottom nav
- Dalla **Mappa** all'**Albero**: cliccare "Vista Strutturata (Albero)" nel sidebar
- Dall'**Archivio UDA** al **Wizard**: cliccare "Compilatore UDA (Wizard)" nel sidebar

Non esiste un breadcrumb o un pulsante "← Indietro" esplicito.

---

## 8. Breadcrumb — Stato Attuale

**Non implementato.** Il percorso di navigazione è implicito dalla combinazione:
- `activeTab` + `activeCurricoloView` (per curricolo)
- `activeTab` + `activeProgTab` (per progettazione)
- `activeTab` + `activeProcessoTab` (per processo)

Esempio di percorso implicito:
```
Dashboard → Consulta Curricolo → Vista Strutturata (Albero) → Disciplina Italiano
```

**Stato attuale**: Nessun breadcrumb visibile. Il titolo della vista corrente è mostrato inline nel contenuto principale.

---

## 9. Azioni Rapide (Quick Actions)

### Toast Notifications

Sistema di notifiche inline posizionato in basso a destra:

```
┌──────────────────────────────┐
│                              │
│   (contenuto pagina)         │
│                              │
│                    ┌────────┐│
│                    │ ✓ Mess ││
│                    └────────┘│
└──────────────────────────────┘
```

- Posizione: `fixed bottom-6 right-6`
- Z-index: `z-[200]`
- Sfondo: `bg-slate-950`
- Durata: 3500ms auto-dismiss
- Tipi: successo (verde) / errore (rosso)

### Copilot Chat Overlay

Pannello laterale fisso sul lato destro:

```
┌──────────────────────────────┬────────────┐
│                              │ CO-PILOTA  │
│   (contenuto pagina)         │ [✕]       │
│                              │            │
│                              │ Messaggi   │
│                              │ ...        │
│                              │            │
│                              │ [Suggerim.]│
│                              │ [Input]    │
└──────────────────────────────┴────────────┘
```

- Posizione: `fixed top-20 bottom-4 right-4 left-4 md:left-auto md:w-80`
- Z-index: `z-[150]`
- Comportamento: su mobile occupa tutta la larghezza, su desktop 320px a destra

### Input Vocale

Integrato nel copilot chat tramite Web Speech API:
- `isVoiceListening` state
- Trascrizione automatica nel campo input
- Feedback visivo con icona microfono

---

## 10. Navigazione Sub-Tab — Percorsi Tipici

### Percorso Curricolo
```
Dashboard
  → Consulta Curricolo
    → Vista Strutturata (Albero)
    → Raccordo Diacronico (Mappa)
    → Integrazione & Popolamento
      → Copilot | CSV | Sicurezza
  → Revisione (Gap 2025)
  → Fonti d'Istituto
```

### Percorso Progettazione
```
Dashboard
  → Progettazione UDA
    → Compilatore UDA (Wizard)
    → Archivio UDA d'Istituto
    → Matrice delle Competenze
  → Processo & Consenso
  → Esportazione File d'Ufficio
```

### Percorso Classe
```
Dashboard
  → Spazio d'Aula e Classe
    → Ambiente & Esiti Classe
    → Osservatorio dei Riusi d'UDA
```

### Percorso Supporto
```
Dashboard
  → Certificazione PA (AgID)
  → WikiLLM & Brain d'Istituto
  → Guida Operativa
```

---

## 11. Diagramma di Stato Navigazione

```
                          ┌─────────────┐
                          │  dashboard  │◄─────────────────┐
                          └──────┬──────┘                  │
                                 │                         │
            ┌────────────────────┼────────────────────┐    │
            │                    │                    │    │
            ▼                    ▼                    ▼    │
   ┌────────────────┐  ┌──────────────────┐  ┌──────────┐│
   │   curricolo    │  │ progetta-annuale │  │ esporta  ││
   │  ┌───────────┐ │  │  ┌────────────┐  │  └──────────┘│
   │  │  albero   │ │  │  │  annuale   │  │              │
   │  │  mappa    │ │  │  │  uda       │  │              │
   │  │  popolam. │ │  │  │  certific. │  │              │
   │  └───────────┘ │  │  │  classe    │  │              │
   └────────────────┘  │  │  social    │  │              │
            │          │  └────────────┘  │              │
            ▼          └────────┬─────────┘              │
   ┌────────────────┐          │                         │
   │   revisione    │          │                         │
   └────────────────┘          │                         │
            │                  │                         │
            ▼                  ▼                         │
   ┌────────────────┐  ┌──────────────────┐              │
   │     fonti      │  │     processo     │              │
   └────────────────┘  └──────────────────┘              │
                                                          │
            ┌────────────────────────────────────────────┘
            │
            ▼
   ┌────────────────────┐  ┌──────────────────┐  ┌──────────┐
   │ certificazione-pa  │  │   second-brain   │  │   guida  │
   └────────────────────┘  └──────────────────┘  └──────────┘
```

---

## 12. Lacune e Raccomandazioni

### Assenti

| Funzionalità | Stato | Impatto |
|-------------|-------|---------|
| Breadcrumb | Non implementato | L'utente perde il percorso in viste profonde |
| Pulsante "← Indietro" | Non implementato | Navigazione unidirezionale via sidebar |
| Bottom Nav completa | Solo 5 voci su 11 tab | Su mobile, 6 tab non sono direttamente accessibili |
| Indicatore di profondità | Non implementato | Non è chiaro in che sotto-vista ci si trova |
| Transizioni animate tra tab | Solo `fade-in` sul contenuto | Nessuna transizione di slide o crossfade |

### Raccomandazioni

1. **Breadcrumb**: aggiungere un percorso visivo del tipo `Home > Consulta Curricolo > Albero` nel contenuto principale
2. **Bottom Nav estesa**: considerare 6-7 voci o un menu "Altri" per le voci mancanti
3. **Pulsante ← Indietro**: implementare nella sub-viste (Albero, Mappa, Popolamento) per tornare alla vista padre
4. **Gestione storia browser**: implementare `popstate` per supportare il tasto ← del browser
5. **Indicatore sub-tab**: mostrare visivamente quale sotto-vista è attiva (es. underline o dot indicator)
