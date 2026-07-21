import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserState, DecisionStatus, UdaModel, SchoolOrder, UserRole } from '../types/curriculum';

interface CurriculumState extends Pick<UserState,
  'role' | 'discipline' | 'order' | 'schoolYear' | 'decisions' | 'customTexts' |
  'savedUda' | 'activeRevisionFilter' | 'selectedTraguardi' | 'selectedObiettivi' |
  'selectedEvidenze' | 'activeProgTab' | 'activeCurricoloView' | 'activeProcessoTab' |
  'activeGeneralSubtab'
> {
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
  restoreBackupState: (newState: Partial<CurriculumState>) => void;
}

export const useCurriculumStore = create<CurriculumState>()(
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
      selectedEvidenze: [],
      activeProgTab: 'annuale',
      activeCurricoloView: 'albero',
      activeProcessoTab: 'flusso',
      activeGeneralSubtab: 'premessa',

      setRole: (role) => set({ role }),
      setDiscipline: (discipline) => set({ discipline }),
      setOrder: (order) => set({ order }),
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
      restoreBackupState: (newState) => set((state) => ({ ...state, ...newState })),
    }),
    {
      name: 'curmanlight-react-db-state-v1.4.0',
    }
  )
);
export type { CurriculumState };
