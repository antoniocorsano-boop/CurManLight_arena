import { create } from 'zustand';

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface CopilotContext {
  activeTab: string;
  discipline: string;
  order: string;
}

export interface CopilotState {
  messages: CopilotMessage[];
  context: CopilotContext;
  voiceEnabled: boolean;
  language: string;
  theme: string;
  isLoading: boolean;

  addMessage: (msg: CopilotMessage) => void;
  setContext: (ctx: Partial<CopilotContext>) => void;
  setLoading: (loading: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  clearMessages: () => void;
}

export const useCopilotStore = create<CopilotState>()((set) => ({
  messages: [],
  context: { activeTab: 'curriculum', discipline: 'italiano', order: 'secondaria' },
  voiceEnabled: false,
  language: 'it-IT',
  theme: 'light',
  isLoading: false,

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  setContext: (ctx) =>
    set((state) => ({ context: { ...state.context, ...ctx } })),
  setLoading: (isLoading) => set({ isLoading }),
  setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
  clearMessages: () => set({ messages: [] }),
}));
