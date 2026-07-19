# Audit di Fattibilità Tecnica per la Migrazione a Stack Evoluto (Vite / React / Vue)
### Piattaforma CurManLight — I.C. Calvario-Covotta «don Lorenzo Milani»
**A cura del Principal Frontend Architect**

---

## 1. Analisi dello Stato Attuale (Legacy SPA in HTML/Vanilla JS)

L'attuale architettura di **CurManLight** è strutturata come una Single Page Application (SPA) monolitica contenuta in un singolo file `index.html` con Javascript Vanilla. Sebbene questo approccio garantisca la massima portabilità ("zero configurazione", esecuzione locale immediata con doppio clic), presenta forti limitazioni di scalabilità e manutenzione a lungo termine (debito tecnico):

### 1.1 Limiti Tecnici Rilevati
* **Monolite Difficile da Manutenere:** Il file `index.html` supera i 260 KB, accorpando markup HTML, database conoscitivo (Knowledge Base) e logica di controllo dello stato in oltre 1600 righe di codice.
* **Assenza di Tipizzazione (Type Safety):** Javascript Vanilla non offre controlli statici. Modifiche parziali alla struttura dei dati (es. l'aggiunta di una nuova materia o la variazione dei campi UDA) possono generare eccezioni a runtime (`TypeError: undefined is not an object`) difficili da intercettare prima della produzione.
* **Manipolazione Manuale del DOM:** L'uso esteso di stringhe letterali interpolate iniettate tramite `.innerHTML` (*es. `renderCurricoloTab()` o `renderRevisioneTab()`*) rallenta il rendering del browser e rende complessa la gestione degli ascoltatori di eventi (event listeners), oltre ad esporre l'app a potenziali vulnerabilità XSS se si importano file esterni non sanificati.
* **Limiti di Persistenza del LocalStorage:** La serializzazione JSON su `localStorage` è limitata a circa 5MB e ha prestazioni sincrone bloccanti su dataset pesanti (come l'archivio storico delle UDA di un intero plesso).

---

## 2. Valutazione Comparativa degli Stack di Migrazione

Per superare questi limiti, si analizza la migrazione verso un moderno ambiente di sviluppo guidato da **Vite** come orchestratore di build, mettendo a confronto i due principali framework component-based: **React** e **Vue**.

### 2.1 Vite come Strumento di Build (Prescrizione Comune)
Indipendentemente dal framework scelto, **Vite** deve essere adottato come server di sviluppo e bundler di produzione per i seguenti motivi:
* **Hot Module Replacement (HMR) Istantaneo:** Vite esegue la compilazione tramite moduli ES nativi (ESM), garantendo aggiornamenti dell'interfaccia in meno di 100ms durante lo sviluppo.
* **Vite Plugin PWA:** Automatizza la generazione del Service Worker (`sw.js`) e del file `manifest.json` tramite configurazione dichiarativa, eliminando la scrittura manuale dei cicli di cache.
* **Ottimizzazione degli Asset:** Compila e minifica il CSS (Tailwind) e il codice JS, riducendo del 70% il peso complessivo dell'applicazione da scaricare.

---

### 2.2 Opzione A: Migrazione a React (Stack Consigliato per Enterprise)

React è lo standard di fatto per le applicazioni web ricche di dati e logiche di stato complesse.

```
+---------------------------------------------------------+
|                    REACT ARCHITECTURE                   |
+---------------------------------------------------------+
|                                                         |
|  [ Components View: JSX ] <----> [ Zustand State Store ]|
|       (Tailwind CSS)                (IndexedDB / Dexie) |
|                                                         |
+---------------------------------------------------------+
|                        [ Vite ]                         |
+---------------------------------------------------------+
```

#### I Componenti Chiave dello Stack React:
* **State Management:** **Zustand** (leggerissimo, privo di boilerplate boilerplate, basato su hook reattivi).
* **Tipizzazione:** **TypeScript** (interfacce rigide per raccordi, UDA e decisioni).
* **Database locale:** **Dexie.js** per interagire con IndexedDB in modo asincrono e sicuro.

#### Pro:
* **Ecosistema immenso:** Vastissima disponibilità di librerie per tabelle complesse (*React Table*), grafici e drag-and-drop.
* ** shadcn/ui (Radix UI):** Permette di creare interfacce splendide, accessibili (normativa AgID per le PA) e altamente personalizzabili senza dipendere da framework CSS pesanti.
* **Tipi statici eccellenti:** Pieno supporto nativo per TypeScript.

#### Contro:
* Curva di apprendimento leggermente più ripida rispetto a Vue (concetti di immutabilità dello stato, re-rendering e hook come `useEffect`).

---

### 2.3 Opzione B: Migrazione a Vue (Stack Consigliato per Rapidità)

Vue offre un approccio estremamente lineare, intuitivo e molto amato nei contesti scolastici e accademici.

```
+---------------------------------------------------------+
|                     VUE ARCHITECTURE                    |
+---------------------------------------------------------+
|                                                         |
|  [ Components: SFC .vue ] <----> [ Pinia State Store ]  |
|    (Template/Script/Style)          (IndexedDB / Dexie) |
|                                                         |
+---------------------------------------------------------+
|                        [ Vite ]                         |
+---------------------------------------------------------+
```

#### I Componenti Chiave dello Stack Vue:
* **State Management:** **Pinia** (lo store ufficiale di Vue, modulare e intuitivo).
* **Linguaggio:** **TypeScript** (tramite la *Composition API* di Vue 3).

#### Pro:
* **Single File Components (SFC):** Riunisce in un unico file `.vue` il template HTML, il codice logico JS/TS e lo stile CSS del singolo componente, facilitando l'organizzazione del codice.
* **Curva di apprendimento dolce:** Molto intuitivo per chi proviene da Vanilla JS/HTML/CSS.
* **Reattività automatica:** Gestione dello stato più semplice tramite oggetti reattivi (`ref`, `reactive`).

#### Contro:
* Ecosistema di componenti pronti leggermente inferiore rispetto a React per applicazioni enterprise complesse.

---

### 2.4 Matrice di Confronto per la Scelta Tecnologica

| Parametro di Confronto | Vanilla JS (Attuale) | Vite + React + Zustand | Vite + Vue + Pinia |
| :--- | :--- | :--- | :--- |
| **Modularità del Codice** | ❌ Nulla (file unico) | ⭐⭐⭐ Eccellente (Componenti) | ⭐⭐⭐ Eccellente (SFC `.vue`) |
| **Type Safety (TS)** | ❌ Assente | ⭐⭐⭐ Nativo ed eccellente | ⭐⭐ Buono con Composition API |
| **Performance Rendering** | ❌ Bassa (innerHTML) | ⭐⭐⭐ Virtual DOM efficiente | ⭐⭐⭐ Reattività nativa fine |
| **Gestione dello Stato** | ⚠️ Complessa (state globale) | ⭐⭐⭐ Store Zustand dichiarativo | ⭐⭐⭐ Store Pinia intuitivo |
| **Accessibilità (AgID)** | ⚠️ Da programmare a mano | ⭐⭐⭐ Facile con shadcn/ui | ⭐⭐ Buono con librerie esterne |
| **Offline-First Storage** | ⚠️ LocalStorage (5MB max) | ⭐⭐⭐ Dexie.js (IndexedDB asincrono) | ⭐⭐⭐ Dexie.js (IndexedDB asincrono) |

---

## 3. Definizione delle Interfacce TypeScript (La Nuova Base Dati)

Il primo passo della migrazione consiste nel blindare i dati tramite contratti di tipo TypeScript, prevenendo a monte errori di compilazione.

```typescript
// src/types/curriculum.ts

export type SchoolOrder = 'infanzia' | 'primaria' | 'secondaria';

export type DecisionStatus = 'approved' | 'rejected' | 'custom';

export interface Proposal {
  id: string;          // es: "it-prim-1"
  focus: string;       // es: "Pratica del corsivo"
  oldText: string;     // Testo DM 254/2012
  newText: string;     // Testo DM 221/2025
  notes: string;       // Giustificazione pedagogica
}

export interface CurricularLevel {
  traguardi: string[];
  obiettivi: string[];
  proposals: Proposal[];
  evidenze: string[];
}

export interface DisciplineData {
  infanzia: CurricularLevel;
  primaria: CurricularLevel;
  secondaria: CurricularLevel;
}

export interface UserState {
  role: 'docente' | 'coordinatore' | 'referente';
  discipline: string;
  order: SchoolOrder;
  schoolYear: string;
  decisions: Record<string, DecisionStatus>; // id_proposta -> stato_voto
  customTexts: Record<string, string>;       // id_proposta -> testo_personalizzato
  savedUda: UdaModel[];
}

export interface UdaModel {
  id: string;
  title: string;
  discipline: string;
  order: SchoolOrder;
  period: string;
  hours: number;
  status: 'bozza' | 'in revisione' | 'pronta per confronto' | 'validata' | 'archiviata';
  traguardi: string[];
  obiettivi: string[];
  evidenze: string[];
  realTask: string;
  notes: string;
  createdAt: string;
}
```

---

## 4. Architettura dello Stato (Esempio Zustand per React)

Ecco come si presenta il file di gestione dello stato centralizzato reattivo con persistenza automatica IndexedDB gestita da Zustand:

```typescript
// src/store/useCurriculumStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserState, DecisionStatus, UdaModel, SchoolOrder } from '../types/curriculum';
import Dexie from 'dexie';

// Configurazione DB locale asincrono Dexie per superare i limiti di LocalStorage
const db = new Dexie('CurManLightDB');
db.version(1).stores({
  state: 'key, value'
});

const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const val = await db.table('state').get(name);
    return val ? val.value : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await db.table('state').put({ key: name, value });
  },
  removeItem: async (name: string): Promise<void> => {
    await db.table('state').delete(name);
  }
};

interface StoreActions extends UserState {
  setRole: (role: UserState['role']) => void;
  setDiscipline: (discipline: string) => void;
  setOrder: (order: SchoolOrder) => void;
  setSchoolYear: (year: string) => void;
  setDecision: (id: string, status: DecisionStatus) => void;
  setCustomText: (id: string, text: string) => void;
  addUda: (uda: UdaModel) => void;
  deleteUda: (id: string) => void;
  resetAll: () => void;
}

export const useCurriculumStore = create<StoreActions>()(
  persist(
    (set) => ({
      role: 'docente',
      discipline: 'italiano',
      order: 'secondaria',
      schoolYear: '2025-2026',
      decisions: {},
      customTexts: {},
      savedUda: [],

      setRole: (role) => set({ role }),
      setDiscipline: (discipline) => set({ discipline }),
      setOrder: (order) => set({ order }),
      setSchoolYear: (schoolYear) => set({ schoolYear }),
      setDecision: (id, status) => 
        set((state) => ({ decisions: { ...state.decisions, [id]: status } })),
      setCustomText: (id, text) => 
        set((state) => ({ customTexts: { ...state.customTexts, [id]: text } })),
      addUda: (uda) => set((state) => ({ savedUda: [...state.savedUda, uda] })),
      deleteUda: (id) => set((state) => ({ savedUda: state.savedUda.filter(u => u.id !== id) })),
      resetAll: () => set({ decisions: {}, customTexts: {}, savedUda: [] })
    }),
    {
      name: 'curmanlight-app-state',
      storage: createJSONStorage(() => indexedDBStorage)
    }
  )
);
```

---

## 5. Piano Operativo di Migrazione in 5 Fasi

La transizione deve essere eseguita per step incrementali per garantire la stabilità e la continuità del servizio d'istituto:

```
+---------------------------------------------------------------------------------+
|                                 MIGRATION ROADMAP                               |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [ Fase 1: Setup ] ➔ [ Fase 2: Store ] ➔ [ Fase 3: Views ] ➔ [ Fase 4: PWA ]    |
|   Vite/Tailwind        Zustand / TS        Componenti JSX      Dexie / Offline  |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                         [ Fase 5: CI/CD & Deploy ]                              |
+---------------------------------------------------------------------------------+
```

### 5.1 Fase 1: Setup dell'Ambiente e Build Pipeline
1. Inizializzare il progetto Vite con React e TypeScript:
   ```bash
   npm create vite@latest curmanlight-evoluto -- --template react-ts
   ```
2. Installare le dipendenze essenziali:
   ```bash
   npm install tailwindcss postcss autoprefixer lucide-react zustand dexie
   ```
3. Configurare Tailwind CSS e inizializzare shadcn/ui per disporre dei componenti di design preconfezionati.

### 5.2 Fase 2: Migrazione della Base Dati (Knowledge Base)
1. Creare la cartella `src/data/` ed inserire il file `curriculumData.ts`.
2. Portare l'intero oggetto `kb` (14 discipline strutturate incluse le modifiche del Latino LEL) come costante tipizzata TypeScript:
   ```typescript
   import { DisciplineData } from '../types/curriculum';
   export const curriculumKB: Record<string, DisciplineData> = { ... };
   ```

### 5.3 Fase 3: Componentizzazione delle Viste (UI Reusable Components)
1. Suddividere l'interfaccia monolitica in componenti riutilizzabili sotto `src/components/`:
   * `Layout/Sidebar.tsx` (Menu collassabile a comparsa desktop).
   * `Layout/MobileNavBar.tsx` (Barra mobile a 5 icone fissa in basso).
   * `Dashboard/QuickActions.tsx` (Sezione "Cosa vuoi fare oggi").
   * `Consulta/DisciplineAccordion.tsx` (L'accordion context-aware con auto-espansione sul profilo utente).
   * `Revisione/GapComparisonCard.tsx` (Le schede di voto 2012 vs 2025).
   * `Progetta/UdaDetailModal.tsx` (La finestra modale con i badge 🟢 / 🟡).
2. Sostituire le logiche di rendering JS che manipolavano il DOM con i componenti JSX reattivi legati allo store Zustand.

### 5.4 Fase 4: Integrazione Database Locale Dexie & PWA
1. Implementare il middleware di persistenza Zustand su IndexedDB tramite Dexie.js (come descritto nel capitolo 4) per superare i limiti di spazio del localStorage.
2. Integrare il plugin `@vite-pwa/plugin` in `vite.config.ts` per configurare in modo dichiarativo le strategie di caching dei font, del CSS e delle icone offline.

### 5.5 Fase 5: Integrazione Collaborative e Deployment
1. Configurare una pipeline di Continuous Integration (CI/CD) su **Vercel** o **GitHub Pages** per automatizzare i test di build e pubblicare l'applicazione ad ogni commit su repository.
2. (*Opzionale per collaborazione in tempo reale*): Configurare **Supabase** per l'autenticazione tramite Google Workspace d'istituto e implementare **Yjs** per la sincronizzazione dei raccordi tra i docenti di dipartimento.

---

## 6. Conclusioni dell'Audit
La migrazione a uno stack evoluto basato su **Vite + React + Zustand + TypeScript** eliminerà interamente il debito tecnico dell'applicazione monolitica, garantendo un'interfaccia impeccabile su qualsiasi schermo, la tipizzazione statica contro i crash e la capacità di estendere all'infinito le funzionalità di CurManLight per l'I.C. "don Lorenzo Milani" con garanzie di accessibilità a norma di legge.
