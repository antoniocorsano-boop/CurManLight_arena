import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionState {
  showOnboarding: boolean;
  showEmergencyBanner: boolean;
  storageUsage: number;
  isOffline: boolean;
  lastSaveTime: number | null;
  sessionActive: boolean;
  devMode: boolean;
  debugPanel: boolean;
  mockDataInjected: boolean;

  setShowOnboarding: (show: boolean) => void;
  setShowEmergencyBanner: (show: boolean) => void;
  setStorageUsage: (usage: number) => void;
  setIsOffline: (offline: boolean) => void;
  setLastSaveTime: (time: number) => void;
  setSessionActive: (active: boolean) => void;
  setDevMode: (dev: boolean) => void;
  setDebugPanel: (show: boolean) => void;
  setMockDataInjected: (injected: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      showOnboarding: false,
      showEmergencyBanner: false,
      storageUsage: 0,
      isOffline: false,
      lastSaveTime: null,
      sessionActive: true,
      devMode: false,
      debugPanel: false,
      mockDataInjected: false,

      setShowOnboarding: (showOnboarding) => set({ showOnboarding }),
      setShowEmergencyBanner: (showEmergencyBanner) => set({ showEmergencyBanner }),
      setStorageUsage: (storageUsage) => set({ storageUsage }),
      setIsOffline: (isOffline) => set({ isOffline }),
      setLastSaveTime: (lastSaveTime) => set({ lastSaveTime }),
      setSessionActive: (sessionActive) => set({ sessionActive }),
      setDevMode: (devMode) => set({ devMode }),
      setDebugPanel: (debugPanel) => set({ debugPanel }),
      setMockDataInjected: (mockDataInjected) => set({ mockDataInjected }),
    }),
    {
      name: 'curmanlight-session-v1',
      partialize: (state) => ({
        showOnboarding: state.showOnboarding,
        devMode: state.devMode,
        mockDataInjected: state.mockDataInjected,
      }),
    }
  )
);
