import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserState, DecisionStatus, UdaModel, SchoolOrder, UserRole } from '../types/curriculum';
import { curriculumKB } from '../data/curriculumKB';
import Dexie from 'dexie';

const getCurriculumKB = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('curmanlight-custom-curriculum-v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
  }
  return curriculumKB;
};

// Configure Dexie for Local IndexedDB storage bypassing localStorage limits!
let db: any = null;
try {
  if (typeof window !== 'undefined' && window.indexedDB) {
    db = new Dexie('CurManLightDB_Evoluto_v1.3');
    db.version(1).stores({
      state: 'key, value'
    });
  }
} catch (e) {
  console.warn("[CurManLight Storage Guard] Impossibile configurare Dexie/IndexedDB:", e);
}

// Memory fallback for environments where IndexedDB is blocked (sandboxed iframes, private browsing)
const memoryStore: Record<string, string> = {};

const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (!db) throw new Error("IndexedDB non inizializzato");
      const val = await db.table('state').get(name);
      return val ? val.value : null;
    } catch (e) {
      console.warn("[CurManLight Storage Guard] Impossibile leggere da IndexedDB, uso la memoria temporanea:", e);
      return memoryStore[name] || null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (!db) throw new Error("IndexedDB non inizializzato");
      await db.table('state').put({ key: name, value });
    } catch (e) {
      console.warn("[CurManLight Storage Guard] Impossibile scrivere in IndexedDB, uso la memoria temporanea:", e);
      memoryStore[name] = value;
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (!db) throw new Error("IndexedDB non inizializzato");
      await db.table('state').delete(name);
    } catch (e) {
      console.warn("[CurManLight Storage Guard] Impossibile eliminare da IndexedDB, uso la memoria temporanea:", e);
      delete memoryStore[name];
    }
  }
};

interface StoreActions extends UserState {
  setRole: (role: UserRole) => void;
  setDiscipline: (discipline: string) => void;
  setOrder: (order: SchoolOrder) => void;
  setSchoolYear: (year: string) => void;
  setDecision: (id: string, status: DecisionStatus) => void;
  setCustomText: (id: string, text: string) => void;
  resetDecision: (id: string) => void;
  addUda: (uda: UdaModel) => void;
  deleteUda: (id: string) => void;
  clearUdaLibrary: () => void;
  setActiveRevisionFilter: (filter: UserState['activeRevisionFilter']) => void;
  toggleTraguardoSelection: (index: number) => void;
  toggleObiettivoSelection: (index: number) => void;
  toggleEvidenceSelection: (evText: string) => void;
  setActiveProgTab: (tab: UserState['activeProgTab']) => void;
  setActiveCurricoloView: (view: UserState['activeCurricoloView']) => void;
  setActiveProcessoTab: (tab: UserState['activeProcessoTab']) => void;
  setActiveGeneralSubtab: (subtab: UserState['activeGeneralSubtab']) => void;
  resetAll: () => void;
  restoreBackupState: (newState: Partial<UserState>) => void;
}

export const useCurriculumStore = create<StoreActions>()(
  persist(
    (set) => ({
      role: 'insegnante',
      discipline: 'italiano',
      order: 'secondaria',
      schoolYear: '2025-2026',
      decisions: {},
      customTexts: {},
      savedUda: [],
      activeRevisionFilter: 'all',
      selectedTraguardi: [0, 1],
      selectedObiettivi: [0, 1],
      selectedEvidenze: [
        "Riconosce e analizza la struttura sintattica di una frase complessa indicandone i gradi",
        "Redige un saggio breve o testo argomentativo strutturato in paragrafi formali"
      ],
      activeProgTab: 'annuale',
      activeCurricoloView: 'albero',
      activeProcessoTab: 'flusso',
      activeGeneralSubtab: 'premessa',

      setRole: (role) => set({ role }),
      setDiscipline: (discipline) => set((state) => {
        const data = getCurriculumKB()[discipline]?.[state.order] || { traguardi: [], obiettivi: [], evidenze: [] };
        const selTrag = data.traguardi?.length > 0 ? [0] : [];
        const selObj = data.obiettivi?.length > 0 ? [0] : [];
        const selEv = data.evidenze?.length > 0 ? [data.evidenze[0]] : [];
        return {
          discipline,
          selectedTraguardi: selTrag,
          selectedObiettivi: selObj,
          selectedEvidenze: selEv
        };
      }),
      setOrder: (order) => set((state) => {
        const data = getCurriculumKB()[state.discipline]?.[order] || { traguardi: [], obiettivi: [], evidenze: [] };
        const selTrag = data.traguardi?.length > 0 ? [0] : [];
        const selObj = data.obiettivi?.length > 0 ? [0] : [];
        const selEv = data.evidenze?.length > 0 ? [data.evidenze[0]] : [];
        return {
          order,
          selectedTraguardi: selTrag,
          selectedObiettivi: selObj,
          selectedEvidenze: selEv
        };
      }),
      setSchoolYear: (schoolYear) => set({ schoolYear }),
      setDecision: (id, status) =>
        set((state) => ({ decisions: { ...state.decisions, [id]: status } })),
      setCustomText: (id, text) =>
        set((state) => ({ customTexts: { ...state.customTexts, [id]: text } })),
      resetDecision: (id) =>
        set((state) => {
          const decisions = { ...state.decisions };
          const customTexts = { ...state.customTexts };
          delete decisions[id];
          delete customTexts[id];
          return { decisions, customTexts };
        }),
      addUda: (uda) => set((state) => ({ savedUda: [...state.savedUda, uda] })),
      deleteUda: (id) => set((state) => ({ savedUda: state.savedUda.filter(u => u.id !== id) })),
      clearUdaLibrary: () => set({ savedUda: [] }),
      setActiveRevisionFilter: (activeRevisionFilter) => set({ activeRevisionFilter }),
      
      toggleTraguardoSelection: (index) =>
        set((state) => {
          const list = [...state.selectedTraguardi];
          const idx = list.indexOf(index);
          if (idx > -1) list.splice(idx, 1);
          else list.push(index);
          return { selectedTraguardi: list };
        }),
      toggleObiettivoSelection: (index) =>
        set((state) => {
          const list = [...state.selectedObiettivi];
          const idx = list.indexOf(index);
          if (idx > -1) list.splice(idx, 1);
          else list.push(index);
          return { selectedObiettivi: list };
        }),
      toggleEvidenceSelection: (evText) =>
        set((state) => {
          const list = [...state.selectedEvidenze];
          const idx = list.indexOf(evText);
          if (idx > -1) list.splice(idx, 1);
          else list.push(evText);
          return { selectedEvidenze: list };
        }),
      
      setActiveProgTab: (activeProgTab) => set({ activeProgTab }),
      setActiveCurricoloView: (activeCurricoloView) => set({ activeCurricoloView }),
      setActiveProcessoTab: (activeProcessoTab) => set({ activeProcessoTab }),
      setActiveGeneralSubtab: (activeGeneralSubtab) => set({ activeGeneralSubtab }),
      
      resetAll: () => set({ decisions: {}, customTexts: {}, savedUda: [], selectedTraguardi: [], selectedObiettivi: [], selectedEvidenze: [] }),
      restoreBackupState: (newState) => set((state) => ({ ...state, ...newState }))
    }),
    {
      name: 'curmanlight-react-db-state-v1.4.0',
      storage: createJSONStorage(() => indexedDBStorage)
    }
  )
);
export type { StoreActions };
