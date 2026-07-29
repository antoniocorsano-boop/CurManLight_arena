import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserState, DecisionStatus, UdaModel, SchoolOrder, UserRole, DocumentExportEvent } from '../types/curriculum';
import { curriculumKB } from '../data/curriculumKB';
import type Dexie from 'dexie';
import { createCurriculumDatabase } from '../domain/curriculum/persistence/backend';
import {
  cloneInstitutionalValue,
  createEmptyInstitutionalArchive,
  validateArchiveIntegrity,
  type InstitutionalArchive,
} from '../domain/institution';
import {
  createEmptyDocumentArchive,
  validateArchiveIntegrity as validateDocumentArchiveIntegrity,
  type DocumentArchive,
} from '../domain/documents';
import {
  createEmptyRevisionStore,
  cloneRevisionArchiveStore,
  verifyArchiveIntegrity as verifyRevisionArchiveIntegrity,
  type RevisionArchive,
} from '../domain/revision';
import {
  createEmptyDesignStore,
  cloneDesignArchive,
  verifyDesignIntegrity,
  type DesignArchive,
} from '../domain/design';
import { GuidedTeacherWorkflowState } from '../features/guided-workflow/types';

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
type PersistedStateRecord = {
  key: string;
  value: string;
};

let db: Dexie | null = null;
try {
  if (typeof window !== 'undefined' && window.indexedDB) {
    db = createCurriculumDatabase();
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
      const val = (await db.table('state').get(name)) as PersistedStateRecord | undefined;
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

type CurriculumStoreState = UserState & {
  institutionalArchive: InstitutionalArchive;
  documentArchive: DocumentArchive;
  revisionArchive: RevisionArchive;
  designArchive: DesignArchive;
  guidedWorkflowState: GuidedTeacherWorkflowState | undefined;
};

export type RestoreBackupResult =
  | { success: true }
  | { success: false; error: 'invalid-backup' | 'invalid-institutional-archive'; message: string };

const USER_STATE_KEYS: readonly (keyof UserState)[] = [
  'role',
  'discipline',
  'order',
  'schoolYear',
  'decisions',
  'customTexts',
  'savedUda',
  'activeRevisionFilter',
  'selectedTraguardi',
  'selectedObiettivi',
  'selectedEvidenze',
  'activeProgTab',
  'activeCurricoloView',
  'activeProcessoTab',
  'activeGeneralSubtab',
  'documentExportHistory',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeUserState(value: unknown): Partial<UserState> {
  if (!isRecord(value)) return {};
  const sanitized: Record<string, unknown> = {};
  for (const key of USER_STATE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(value, key)) sanitized[key] = value[key];
  }
  return sanitized as Partial<UserState>;
}

interface StoreActions extends CurriculumStoreState {
  setRole: (role: UserRole) => void;
  setDiscipline: (discipline: string) => void;
  setOrder: (order: SchoolOrder) => void;
  setSchoolYear: (year: string) => void;
  setDecision: (id: string, status: DecisionStatus) => void;
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
  restoreBackupState: (newState: unknown) => RestoreBackupResult;
  replaceInstitutionalArchive: (archive: InstitutionalArchive) => void;
  replaceDocumentArchive: (archive: DocumentArchive) => void;
  replaceRevisionArchive: (archive: RevisionArchive) => void;
  replaceDesignArchive: (archive: DesignArchive) => void;
  addDocumentExportEvent: (event: DocumentExportEvent) => void;
  clearDocumentExportHistory: () => void;
  // Guided workflow actions
  setGuidedWorkflowState: (state: GuidedTeacherWorkflowState) => void;
  resetGuidedWorkflowState: () => void;
}

export const useCurriculumStore = create<StoreActions>()(
  persist(
    (set) => ({
      role: 'non-dichiarato',
      discipline: 'italiano',
      // Personal consultation choice only; institutional availability comes from A04/A07.
      order: 'secondaria',
      schoolYear: '',
      decisions: {},
      customTexts: {},
      savedUda: [],
      activeRevisionFilter: 'all',
      selectedTraguardi: [],
      selectedObiettivi: [],
      selectedEvidenze: [],
      activeProgTab: 'annuale',
      activeCurricoloView: 'albero',
      activeProcessoTab: 'flusso',
      activeGeneralSubtab: 'premessa',
      documentExportHistory: [],
      institutionalArchive: createEmptyInstitutionalArchive(),
      documentArchive: createEmptyDocumentArchive(),
      revisionArchive: createEmptyRevisionStore(),
      designArchive: createEmptyDesignStore(),
      guidedWorkflowState: undefined,

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
      
      resetAll: () => set({ decisions: {}, customTexts: {}, savedUda: [], selectedTraguardi: [], selectedObiettivi: [], selectedEvidenze: [], documentExportHistory: [] }),
      restoreBackupState: (newState) => {
        if (!isRecord(newState)) {
          return { success: false, error: 'invalid-backup', message: 'La copia di sicurezza non contiene uno stato valido.' };
        }
        const hasArchive = Object.prototype.hasOwnProperty.call(newState, 'institutionalArchive');
        if (hasArchive && !validateArchiveIntegrity(newState.institutionalArchive).valid) {
          return { success: false, error: 'invalid-institutional-archive', message: 'Archivio istituzionale non valido o con versione non supportata.' };
        }
        const institutionalArchive = hasArchive
          ? cloneInstitutionalValue(newState.institutionalArchive as InstitutionalArchive)
          : createEmptyInstitutionalArchive();
        const hasRevision = Object.prototype.hasOwnProperty.call(newState, 'revisionArchive');
        const revisionArchive = hasRevision && verifyRevisionArchiveIntegrity(newState.revisionArchive as RevisionArchive)
          ? cloneRevisionArchiveStore(newState.revisionArchive as RevisionArchive)
          : createEmptyRevisionStore();
        set({ ...sanitizeUserState(newState), institutionalArchive, revisionArchive });
        return { success: true };
      },
      replaceInstitutionalArchive: (institutionalArchive) => {
        if (!validateArchiveIntegrity(institutionalArchive).valid) return;
        set({ institutionalArchive: cloneInstitutionalValue(institutionalArchive) });
      },
      replaceDocumentArchive: (documentArchive) => {
        if (!validateDocumentArchiveIntegrity(documentArchive).valid) return;
        set({ documentArchive });
      },
      replaceRevisionArchive: (revisionArchive) => {
        if (!verifyRevisionArchiveIntegrity(revisionArchive)) return;
        set({ revisionArchive: cloneRevisionArchiveStore(revisionArchive) });
      },
      replaceDesignArchive: (designArchive) => {
        if (!verifyDesignIntegrity(designArchive)) return;
        set({ designArchive: cloneDesignArchive(designArchive) });
      },
      addDocumentExportEvent: (event) =>
        set((state) => {
          const history = [event, ...state.documentExportHistory].slice(0, 5);
          return { documentExportHistory: history };
        }),
      clearDocumentExportHistory: () => set({ documentExportHistory: [] }),
      // Guided workflow actions
      setGuidedWorkflowState: (state) => set({ guidedWorkflowState: state }),
      resetGuidedWorkflowState: () => set({ guidedWorkflowState: undefined }),
    }),
    {
      name: 'curmanlight-react-db-state-v1.4.0',
      storage: createJSONStorage(() => indexedDBStorage),
      merge: (persistedState, currentState) => {
        const persisted = isRecord(persistedState) ? persistedState : {};
        const institutionalArchive = validateArchiveIntegrity(persisted.institutionalArchive).valid
          ? cloneInstitutionalValue(persisted.institutionalArchive as InstitutionalArchive)
          : createEmptyInstitutionalArchive();
        const documentArchive = persisted.documentArchive &&
          validateDocumentArchiveIntegrity(persisted.documentArchive as DocumentArchive).valid
          ? (persisted.documentArchive as DocumentArchive)
          : createEmptyDocumentArchive();
        const revisionArchive = persisted.revisionArchive &&
          verifyRevisionArchiveIntegrity(persisted.revisionArchive as RevisionArchive)
          ? cloneRevisionArchiveStore(persisted.revisionArchive as RevisionArchive)
          : createEmptyRevisionStore();
        const designArchive = persisted.designArchive &&
          verifyDesignIntegrity(persisted.designArchive as DesignArchive)
          ? cloneDesignArchive(persisted.designArchive as DesignArchive)
          : createEmptyDesignStore();
        const guidedWorkflowState = (persisted.guidedWorkflowState ?? undefined) as GuidedTeacherWorkflowState | undefined;
        return { ...currentState, ...sanitizeUserState(persisted), institutionalArchive, documentArchive, revisionArchive, designArchive, guidedWorkflowState };
      }
    }
  )
);
export type { StoreActions };