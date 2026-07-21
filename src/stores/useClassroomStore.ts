import { create } from 'zustand';

export type ClassroomMode = 'ordinario' | 'cooperativo' | 'inclusivo' | 'digitale';
export type CooperativeMethod = 'jigsaw' | 'think_pair_share' | 'numbered_head' | 'studio_circle';
export type ClassroomLayout = 'traditional' | 'u_shape' | 'groups' | 'pairs';

export interface ClassroomTheme {
  primaryColor: string;
  accentColor: string;
  background: string;
}

export interface CooperativeGroup {
  id: string;
  name: string;
  members: string[];
  method: CooperativeMethod;
}

export interface StudentFeedback {
  studentId: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: 'presente' | 'assente' | 'ritardo' | 'uscita_anticipata';
  note?: string;
}

export interface BehaviorEntry {
  studentId: string;
  date: string;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface ClassroomState {
  mode: ClassroomMode;
  layout: ClassroomLayout;
  theme: ClassroomTheme;
  activeMethod: CooperativeMethod;
  studentMap: Record<string, string> | null;
  exclusionsList: [string, string][];
  cooperativeGroups: CooperativeGroup[] | null;
  studentFeedback: StudentFeedback[];
  attendance: AttendanceRecord[];
  behaviorLog: BehaviorEntry[];
  activeTaughtUdaId: string | null;

  setMode: (mode: ClassroomMode) => void;
  setLayout: (layout: ClassroomLayout) => void;
  setTheme: (theme: ClassroomTheme) => void;
  setMethod: (method: CooperativeMethod) => void;
  setStudentMap: (map: Record<string, string>) => void;
  setExclusions: (list: [string, string][]) => void;
  setGroups: (groups: CooperativeGroup[]) => void;
  setFeedback: (feedback: StudentFeedback[]) => void;
  addAttendance: (record: AttendanceRecord) => void;
  addBehaviorEntry: (entry: BehaviorEntry) => void;
  setActiveTaughtUdaId: (id: string | null) => void;
  resetClassroom: () => void;
}

export const useClassroomStore = create<ClassroomState>()((set) => ({
  mode: 'ordinario',
  layout: 'traditional',
  theme: { primaryColor: '#6366f1', accentColor: '#10b981', background: '#f8fafc' },
  activeMethod: 'jigsaw',
  studentMap: null,
  exclusionsList: [],
  cooperativeGroups: null,
  studentFeedback: [],
  attendance: [],
  behaviorLog: [],
  activeTaughtUdaId: null,

  setMode: (mode) => set({ mode }),
  setLayout: (layout) => set({ layout }),
  setTheme: (theme) => set({ theme }),
  setMethod: (activeMethod) => set({ activeMethod }),
  setStudentMap: (studentMap) => set({ studentMap }),
  setExclusions: (exclusionsList) => set({ exclusionsList }),
  setGroups: (cooperativeGroups) => set({ cooperativeGroups }),
  setFeedback: (studentFeedback) => set({ studentFeedback }),
  addAttendance: (record) =>
    set((state) => ({ attendance: [...state.attendance, record] })),
  addBehaviorEntry: (entry) =>
    set((state) => ({ behaviorLog: [...state.behaviorLog, entry] })),
  setActiveTaughtUdaId: (activeTaughtUdaId) => set({ activeTaughtUdaId }),
  resetClassroom: () =>
    set({
      mode: 'ordinario',
      layout: 'traditional',
      studentMap: null,
      exclusionsList: [],
      cooperativeGroups: null,
      studentFeedback: [],
      attendance: [],
      behaviorLog: [],
    }),
}));
