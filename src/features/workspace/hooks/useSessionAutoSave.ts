import { useEffect, useRef } from 'react';
import type { DecisionStatus, SchoolOrder, UdaModel, UserRole, UserState } from '../../../types/curriculum';
import type { CurriculumMap } from '../../session';
import { safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';

interface SessionAutoSaveState {
  localCurriculum: CurriculumMap;
  savedUda: UdaModel[];
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
  schoolYear: string;
  role: UserRole;
  discipline: string;
  order: SchoolOrder;
  isWorkspaceLoggedIn: boolean;
  workspaceAccessToken: string;
  isWorkspaceSyncLocked: boolean;
}

interface EmergencyBackupPayload {
  localCurriculum: CurriculumMap;
  savedUda: UdaModel[];
  decisions: Record<string, DecisionStatus>;
  customTexts: Record<string, string>;
  schoolYear: string;
  role: UserRole;
  discipline: string;
  order: SchoolOrder;
}

interface UseSessionAutoSaveArgs extends SessionAutoSaveState {
  restoreBackupState: (state: Partial<UserState>) => void;
  showToast: (msg: string, success?: boolean) => void;
}

const toEmergencyBackupPayload = (state: SessionAutoSaveState): EmergencyBackupPayload => ({
  localCurriculum: state.localCurriculum,
  savedUda: state.savedUda,
  decisions: state.decisions,
  customTexts: state.customTexts,
  schoolYear: state.schoolYear,
  role: state.role,
  discipline: state.discipline,
  order: state.order
});

export const useSessionAutoSave = ({
  localCurriculum,
  savedUda,
  decisions,
  customTexts,
  schoolYear,
  role,
  discipline,
  order,
  isWorkspaceLoggedIn,
  workspaceAccessToken,
  isWorkspaceSyncLocked,
  restoreBackupState,
  showToast
}: UseSessionAutoSaveArgs) => {
  const stateRef = useRef<SessionAutoSaveState>({
    localCurriculum,
    savedUda,
    decisions,
    customTexts,
    schoolYear,
    role,
    discipline,
    order,
    isWorkspaceLoggedIn,
    workspaceAccessToken,
    isWorkspaceSyncLocked
  });

  useEffect(() => {
    stateRef.current = {
      localCurriculum,
      savedUda,
      decisions,
      customTexts,
      schoolYear,
      role,
      discipline,
      order,
      isWorkspaceLoggedIn,
      workspaceAccessToken,
      isWorkspaceSyncLocked
    };
  }, [localCurriculum, savedUda, decisions, customTexts, schoolYear, role, discipline, order, isWorkspaceLoggedIn, workspaceAccessToken, isWorkspaceSyncLocked]);

  useEffect(() => {
    const performSessionAutoSave = () => {
      const currentState = stateRef.current;
      const fileContent = JSON.stringify(toEmergencyBackupPayload(currentState), null, 2);

      try {
        localStorage.setItem('curman_emergency_backup', fileContent);
        safeLocalStorageSetItem('curman_lastSaveTime', String(Date.now()));
        console.log("[CurManLight Auto-Saver] Copia d'Emergenza salvata in localStorage.");
      } catch (e) {
        console.warn("[CurManLight Auto-Saver] Scrittura localStorage inibita:", e);
      }

      if (currentState.isWorkspaceLoggedIn && currentState.workspaceAccessToken) {
        if (currentState.isWorkspaceSyncLocked) {
          console.log("[CurManLight Auto-Saver] Scrittura su Google Drive bloccata per prevenire la sovrascrittura di dati validi d'Istituto.");
          return;
        }
        const fileName = `CurManLight_CopiaSicurezza_Milani_${currentState.schoolYear}.json`;
        const metadata = {
          name: fileName,
          mimeType: 'application/json'
        };
        const boundary = 'foo_bar_boundary';
        const body = [
          `--${boundary}`,
          'Content-Type: application/json; charset=UTF-8',
          '',
          JSON.stringify(metadata),
          `--${boundary}`,
          'Content-Type: application/json',
          '',
          fileContent,
          `--${boundary}--`
        ].join('\r\n');

        fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${currentState.workspaceAccessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body,
          keepalive: true
        }).catch(err => console.error("[CurManLight Auto-Saver] Keepalive upload failed:", err));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        performSessionAutoSave();
      }
    };

    const handleBeforeUnload = () => {
      performSessionAutoSave();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleRestoreFromLocalEmergencyStorage = () => {
    try {
      const saved = localStorage.getItem('curman_emergency_backup');
      if (!saved) {
        showToast(" Nessuna copia d'emergenza trovata nella cache locale!", false);
        return;
      }
      const restoredState: unknown = JSON.parse(saved);
      if (typeof restoredState !== 'object' || restoredState === null) {
        throw new Error('Invalid emergency backup payload');
      }
      restoreBackupState(restoredState as Partial<UserState>);
      showToast(" Copia d'Emergenza recuperata con successo dalla cache locale!", true);
    } catch (e) {
      showToast(" Errore durante il recupero d'emergenza.", false);
    }
  };

  return {
    stateRef,
    handleRestoreFromLocalEmergencyStorage
  };
};
