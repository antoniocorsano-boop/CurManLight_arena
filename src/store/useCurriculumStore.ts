import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserState, DecisionStatus, UdaModel, SchoolOrder, UserRole, DocumentExportEvent } from '../types/curriculum';
import { getCurriculumBaseline } from '../lib';
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

const getCurriculumBaselineData = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('curmanlight-custom-curriculum-v2');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Invalid override: fall back to the bundled baseline.
        }
      }
    } catch (error) {
      console.warn('[CurManLight Storage Guard] Lettura curriculum personalizzato da localStorage non disponibile:', error);
    }
  }
  return getCurriculumBaseline();
};

type PersistedStateRecord = {
  key: string;
  value: string;
};

function markStorageVolatile(reason: unknown) {
  if (typeof window === 'undefined') return;
  (window as Window & { __curmanStorageVolatile?: boolean }).__curmanStorageVolatile = true;
  window.dispatchEvent(new CustomEvent('arena:storage-volatile', {
    detail: { reason: reason instanceof Error ? reason.message : String(reason) },
  }));
}

let db: Dexie | null = null;
try {
  if (typeof window !== 'undefined' && window.indexedDB) {
    db = createCurriculumDatabase();
  }
} catch (e) {
  markStorageVolatile(e);
  console.warn("[CurManLight Storage Guard] Impossibile configurare Dexie/IndexedDB:", e);
}

const memoryStore: Record<string, string> = {};

export const CURRICULUM_STATE_STORAGE_KEY = 'curmanlight-react-db-state-v1.4.0';

const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (!db) throw new Error("IndexedDB non inizializzato");
      const val = (await db.table('state').get(name)) as PersistedStateRecord | undefined;
      return val ? val.value : null;
    } catch (e) {
      markStorageVolatile(e);
      console.warn("[CurManLight Storage Guard] Impossibile leggere da IndexedDB, uso la memoria temporanea:", e);
      return memoryStore[name] || null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (!db) throw new Error("IndexedDB non inizializzato");
      await db.table('state').put({ key: name, value });
    } catch (e) {
      markStorageVolatile(e);
      console.warn("[CurManLight Storage Guard] Impossibile scrivere in IndexedDB, uso la memoria temporanea:", e);
      memoryStore[name] = value;
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (!db) throw new Error("IndexedDB non inizializzato");
      await db.table('state').delete(name);
    } catch (e) {
      markStorageVolatile(e);
      console.warn("[CurManLight Storage Guard] Impossibile eliminare da IndexedDB, uso la memoria temporanea:", e);
      delete memoryStore[name];
    }
  }
};

export async function hasPersistedCurriculumState(): Promise<boolean> {
  return (await indexedDBStorage.getItem(CURRICULUM_STATE_STORAGE_KEY)) !== null;
}

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

const ARENA_OWNED_PROG_TABS = new Set<UserState['activeProgTab']>([
  'home',
  'annuale',
  'uda',
  'certificazione',
]);

function normalizeArenaProgTab(value: unknown): UserState['activeProgTab'] {
  return typeof value === 'string' && ARENA_OWNED_PROG_TABS.has(value as UserState['activeProgTab'])
    ? value as UserState['activeProgTab']
    : 'annuale';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeUserState(value: unknown): Partial<UserState> {
  if (!isRecord(value)) return {};
  const sanitized: Record<string, unknown> = {};
  for (const key of USER_STATE_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
    sanitized[key] = key === 'activeProgTab'
      ? normalizeArenaProgTab(value[key])
      : value[key];
  }
  return sanitized as Partial<UserState>;
}

interface StoreActions extends CurriculumStoreState {
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
  restoreBackupState: (newState: unknown) => RestoreBackupResult;
  replaceInstitutionalArchive: (archive: InstitutionalArchive) => void;
  replaceDocumentArchive: (archive: DocumentArchive) => void;
  replaceRevisionArchive: (archive: RevisionArchive) => void;
  replaceDesignArchive: (archive: DesignArchive) => void;
  addDocumentExportEvent: (event: DocumentExportEvent) => void;
  clearDocumentExportHistory: () => void;
  setGuidedWorkflowState: (state: GuidedTeacherWorkflowState) => void;
  resetGuidedWorkflowState: () => void;
}

export const useCurriculumStore = create<StoreActions>()(
  persist(
    (set) => ({
      role: 'non-dichiarato',
      discipline: 'italiano',
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
        const data = getCurriculumBaselineData()[discipline]?.[state.order] || { traguardi: [], obiettivi: [], evidenze: [] };
        return {
          discipline,
          selectedTraguardi: data.traguardi?.length > 0 ? [0] : [],
          selectedObiettivi: data.obiettivi?.length > 0 ? [0] : [],
          selectedEvidenze: data.evidenze?.length > 0 ? [data.evidenze[0]] : []
        };
      }),
      setOrder: (order) => set((state) => {
        const data = getCurriculumBaselineData()[state.discipline]?.[order] || { traguardi: [], obiettivi: [], evidenze: [] };
        return {
          order,
          selectedTraguardi: data.traguardi?.length > 0 ? [0] : [],
          selectedObiettivi: data.obiettivi?.length > 0 ? [0] : [],
          selectedEvidenze: data.evidenze?.length > 0 ? [data.evidenze[0]] : []
        };
      }),
      setSchoolYear: (schoolYear) => set({ schoolYear }),
      setDecision: (id, status) => set((state) => ({ decisions: { ...state.decisions, [id]: status } })),
      setCustomText: (id, text) => set((state) => ({ customTexts: { ...state.customTexts, [id]: text } })),
      resetDecision: (id) => set((state) => {
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
      toggleTraguardoSelection: (index) => set((state) => {
        const list = [...state.selectedTraguardi];
        const idx = list.indexOf(index);
        if (idx > -1) list.splice(idx, 1);
        else list.push(index);
        return { selectedTraguardi: list };
      }),
      toggleObiettivoSelection: (index) => set((state) => {
        const list = [...state.selectedObiettivi];
        const idx = list.indexOf(index);
        if (idx > -1) list.splice(idx, 1);
        else list.push(index);
        return { selectedObiettivi: list };
      }),
      toggleEvidenceSelection: (evText) => set((state) => {
        const list = [...state.selectedEvidenze];
        const idx = list.indexOf(evText);
        if (idx > -1) list.splice(idx, 1);
        else list.push(evText);
        return { selectedEvidenze: list };
      }),
      setActiveProgTab: (activeProgTab) => set({ activeProgTab: normalizeArenaProgTab(activeProgTab) }),
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
      addDocumentExportEvent: (event) => set((state) => ({
        documentExportHistory: [event, ...state.documentExportHistory].slice(0, 5)
      })),
      clearDocumentExportHistory: () => set({ documentExportHistory: [] }),
      setGuidedWorkflowState: (state) => set({ guidedWorkflowState: state }),
      resetGuidedWorkflowState: () => set({ guidedWorkflowState: undefined }),
    }),
    {
      name: CURRICULUM_STATE_STORAGE_KEY,
      storage: createJSONStorage(() => indexedDBStorage),
      merge: (persistedState, currentState) => {
        const persisted = isRecord(persistedState) ? persistedState : {};
        const institutionalArchive = validateArchiveIntegrity(persisted.institutionalArchive).valid
          ? cloneInstitutionalValue(persisted.institutionalArchive as InstitutionalArchive)
          : createEmptyInstitutionalArchive();
        const documentArchive = persisted.documentArchive && validateDocumentArchiveIntegrity(persisted.documentArchive as DocumentArchive).valid
          ? persisted.documentArchive as DocumentArchive
          : createEmptyDocumentArchive();
        const revisionArchive = persisted.revisionArchive && verifyRevisionArchiveIntegrity(persisted.revisionArchive as RevisionArchive)
          ? cloneRevisionArchiveStore(persisted.revisionArchive as RevisionArchive)
          : createEmptyRevisionStore();
        const designArchive = persisted.designArchive && verifyDesignIntegrity(persisted.designArchive as DesignArchive)
          ? cloneDesignArchive(persisted.designArchive as DesignArchive)
          : createEmptyDesignStore();
        const guidedWorkflowState = (persisted.guidedWorkflowState ?? undefined) as GuidedTeacherWorkflowState | undefined;
        return { ...currentState, ...sanitizeUserState(persisted), institutionalArchive, documentArchive, revisionArchive, designArchive, guidedWorkflowState };
      }
    }
  )
);

export type { StoreActions };
