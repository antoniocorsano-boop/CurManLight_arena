import { create } from 'zustand';

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface WorkspaceState {
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: WorkspaceUser | null;
  folderId: string | null;
  lastSyncTime: number | null;
  isSyncLocked: boolean;
  syncProgress: number;

  setTokens: (access: string, refresh: string) => void;
  setUserInfo: (info: WorkspaceUser) => void;
  setFolderId: (id: string) => void;
  setSyncStatus: (locked: boolean, progress: number) => void;
  setLastSyncTime: (time: number) => void;
  logout: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  accessToken: null,
  refreshToken: null,
  userInfo: null,
  folderId: null,
  lastSyncTime: null,
  isSyncLocked: false,
  syncProgress: 0,

  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setUserInfo: (userInfo) => set({ userInfo }),
  setFolderId: (folderId) => set({ folderId }),
  setSyncStatus: (isSyncLocked, syncProgress) => set({ isSyncLocked, syncProgress }),
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
  logout: () =>
    set({
      accessToken: null,
      refreshToken: null,
      userInfo: null,
      folderId: null,
      lastSyncTime: null,
      isSyncLocked: false,
      syncProgress: 0,
    }),
}));
