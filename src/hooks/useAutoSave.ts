import { useEffect, useRef, useCallback } from 'react';
import { useCurriculumStore, useClassroomStore, useWorkspaceStore, useSessionStore } from '../stores';
import { safeLocalStorageSetLarge } from '../lib/storage';
import { safeLocalStorageSetItem } from '../lib/consolidatedStorage';

type AutoSaveSnapshot = {
  curriculum: ReturnType<typeof useCurriculumStore.getState>;
  classroom: ReturnType<typeof useClassroomStore.getState>;
  workspace: ReturnType<typeof useWorkspaceStore.getState>;
  session: ReturnType<typeof useSessionStore.getState>;
  timestamp: number;
};

export function useAutoSave(): void {
  const stateRef = useRef<AutoSaveSnapshot | null>(null);

  const syncRef = useCallback(() => {
    stateRef.current = {
      curriculum: useCurriculumStore.getState(),
      classroom: useClassroomStore.getState(),
      workspace: useWorkspaceStore.getState(),
      session: useSessionStore.getState(),
      timestamp: Date.now(),
    };
  }, []);

  useEffect(() => {
    syncRef();

    const unsubscribes = [
      useCurriculumStore.subscribe(syncRef),
      useClassroomStore.subscribe(syncRef),
      useWorkspaceStore.subscribe(syncRef),
      useSessionStore.subscribe(syncRef),
    ];

    const handleBeforeUnload = () => {
      syncRef();
      safeLocalStorageSetLarge('curmanlight-emergency-backup', JSON.stringify(stateRef.current));
      safeLocalStorageSetItem('curman_lastSaveTime', String(Date.now()));
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBeforeUnload();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribes.forEach(u => u());
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncRef]);
}
