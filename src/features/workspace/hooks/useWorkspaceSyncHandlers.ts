import type React from 'react';
import type { DecisionStatus, SchoolOrder, UdaModel, UserRole } from '../../../types/curriculum';
import type { CurriculumMap } from '../../session';
import { safeLocalStorageRemoveItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';
import type { RestoreBackupResult } from '../../../store/useCurriculumStore';
import type { InstitutionalArchive } from '../../../domain/institution';

type WorkspaceStateRef = React.MutableRefObject<{
 savedUda: UdaModel[];
}>;
type FileSystemWritableLike = {
 write: (data: string) => Promise<void>;
 close: () => Promise<void>;
};

type FileSystemFileHandleLike = {
 createWritable: () => Promise<FileSystemWritableLike>;
};

type SaveFilePickerOptions = {
 suggestedName: string;
 types: Array<{
  description: string;
  accept: Record<string, string[]>;
 }>;
};

type WindowWithSaveFilePicker = Window & {
 showSaveFilePicker?: (options: SaveFilePickerOptions) => Promise<FileSystemFileHandleLike>;
};

type UseWorkspaceSyncHandlersArgs = {
 isWorkspaceLoggedIn: boolean;
 workspaceAccessToken: string;
 workspaceClientId?: string;
 cloudAccountType: 'scolastica' | 'personale';
 schoolYear: string;
 localCurriculum: CurriculumMap;
 savedUda: UdaModel[];
 decisions: Record<string, DecisionStatus>;
 customTexts: Record<string, string>;
 role: UserRole;
 discipline: string;
 order: SchoolOrder;
 institutionalArchive: InstitutionalArchive;
 stateRef: WorkspaceStateRef;
 restoreBackupState: (newState: unknown) => RestoreBackupResult;
 setIsSyncingWorkspace: (value: boolean) => void;
 setCloudAccountType: (value: 'scolastica' | 'personale') => void;
 setShowCloudAccountModal: (value: boolean) => void;
 setIsWorkspaceLoggedIn: (value: boolean) => void;
 setWorkspaceAccessToken: (value: string) => void;
 setWorkspaceUserEmail: (value: string) => void;
 setIsWorkspaceSyncLocked: (value: boolean) => void;
 showToast: (msg: string, success?: boolean) => void;
};

export function useWorkspaceSyncHandlers({
 isWorkspaceLoggedIn,
 workspaceAccessToken,
 workspaceClientId,
 cloudAccountType,
 schoolYear,
 localCurriculum,
 savedUda,
 decisions,
 customTexts,
 role,
 discipline,
 order,
 institutionalArchive,
 stateRef,
 restoreBackupState,
 setIsSyncingWorkspace,
 setCloudAccountType,
 setShowCloudAccountModal,
 setIsWorkspaceLoggedIn,
 setWorkspaceAccessToken,
 setWorkspaceUserEmail,
 setIsWorkspaceSyncLocked,
 showToast
}: UseWorkspaceSyncHandlersArgs) {
 // Google Workspace Cloud Sync Handlers (Real Implicit Grant OAuth2 Flow & Google Drive REST API)
 const handleWorkspaceLogin = (type: 'scolastica' | 'personale') => {
  setIsSyncingWorkspace(true);
  setCloudAccountType(type);
  safeLocalStorageSetItem('curman_cloudAccountType', type);
  
  const label = type === 'scolastica' ? "dichiarata scolastica (non verificata)" : "personale";
  showToast(`Reindirizzamento al portale Google per l'Utenza ${label}...`, true);
  
  setTimeout(() => {
   const clientId = workspaceClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;
   if (!clientId) {
    setIsSyncingWorkspace(false);
    showToast('Configura il client Google OAuth per collegare Drive.', false);
    return;
   }
   const redirectUri = window.location.origin + window.location.pathname;
   const scope = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email";
   const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
   
   window.location.href = authUrl;
  }, 1200);
 };

 const handleWorkspaceSync = async () => {
  if (!isWorkspaceLoggedIn || !workspaceAccessToken) {
    showToast("Accedi prima a una sessione Google Drive.", false);
   return;
  }
  setIsSyncingWorkspace(true);
   showToast(`Copia JSON in corso sul Drive dell'account ${cloudAccountType === "scolastica" ? "dichiarato scolastico, non verificato" : "personale"}...`);

  try {
   const stateToBackup = {
    localCurriculum,
    savedUda,
    decisions,
    customTexts,
    schoolYear,
    role,
    discipline,
     order,
     institutionalArchive,
    lastUpdated: Date.now()
   };

   const fileContent = JSON.stringify(stateToBackup, null, 2);
    const fileName = `curmanlight_copia_sicurezza_${schoolYear || 'sessione'}.json`;

   // 1. Search for existing file on Google Drive to update
   const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false&fields=files(id)`, {
    headers: { Authorization: `Bearer ${workspaceAccessToken}` }
   });
   
   if (!searchRes.ok) {
    throw new Error("Token scaduto");
   }
   
   const searchData = await searchRes.json();
   const existingFile = searchData.files?.[0];

   // Cooperative Conflict Resolution: Check if Cloud version is newer before overwriting
   if (existingFile) {
    try {
     const getFileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, {
       headers: { Authorization: `Bearer ${workspaceAccessToken}` }
     });
     if (getFileRes.ok) {
       const existingContent = await getFileRes.json();
       const cloudTimestamp = existingContent.lastUpdated || 0;
       const localTimestamp = Number(localStorage.getItem('curman_lastUpdatedTime') || '0');
       
       if (cloudTimestamp > localTimestamp) {
         const confirmMerge = confirm(
            "Conflitto tra copie JSON:\n\n" +
           "La copia di sicurezza presente sul Cloud risulta piÃƒÂ¹ recente di quella locale.\n\n" +
           "Desideri forzare la sovrascrittura perdendo le modifiche Cloud presenti?"
         );
         if (!confirmMerge) {
           showToast("Sincronizzazione annullata per proteggere la copia di sicurezza sul Cloud.", false);
           setIsSyncingWorkspace(false);
           return;
         }
       }
     }
    } catch (e) {
     console.warn("Could not download cloud file for conflict check, proceeding...", e);
    }
   }

   let uploadRes;
   if (existingFile) {
    // PATCH update file content
    uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`, {
     method: 'PATCH',
     headers: {
      Authorization: `Bearer ${workspaceAccessToken}`,
      'Content-Type': 'application/json'
     },
     body: fileContent
    });
   } else {
    // POST create new file with metadata (multipart)
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

    uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
     method: 'POST',
     headers: {
      Authorization: `Bearer ${workspaceAccessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
     },
     body: body
    });
   }

   if (uploadRes && uploadRes.ok) {
    localStorage.setItem('curman_lastUpdatedTime', String(stateToBackup.lastUpdated));
     showToast("Copia JSON caricata su Google Drive per l'account selezionato.", true);
   } else {
    throw new Error("Errore durante il caricamento");
   }
  } catch (err) {
   console.warn("Errore Sincronizzazione Google:", err);
    showToast("Sessione Google scaduta. Riconnetti l'account per ottenere un nuovo token.", false);
   
   // Fallback simulated backup file generation for local offline use
   setTimeout(() => {
     const blob = new Blob([JSON.stringify({ localCurriculum, savedUda, decisions, customTexts, institutionalArchive }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
     link.download = 'curmanlight_copia_sicurezza_locale.json';
    link.click();
    showToast("Sincronizzazione di emergenza: Copia scaricata in locale.", true);
   }, 1500);
  } finally {
   setIsSyncingWorkspace(false);
  }
 };

 const handleLocalDriveSync = async () => {
  try {
   const stateToBackup = {
    localCurriculum,
    savedUda,
    decisions,
    customTexts,
    schoolYear,
    role,
    discipline,
     order,
     institutionalArchive
   };

   const fileContent = JSON.stringify(stateToBackup, null, 2);
    const fileName = `curmanlight_copia_sicurezza_${schoolYear || 'sessione'}.json`;

   // Desktop: File System Access API
   if ('showSaveFilePicker' in window) {
    showToast("Sincronizzazione Desktop: Seleziona la tua cartella Google Drive locale...");
    try {
     const filePickerWindow = window as WindowWithSaveFilePicker;
     const handle = await filePickerWindow.showSaveFilePicker?.({
      suggestedName: fileName,
      types: [{
         description: "File JSON CurManLight",
       accept: { 'application/json': ['.json'] }
      }]
     });
     if (!handle) throw new Error('File System Access API non disponibile');
     const writable = await handle.createWritable();
     await writable.write(fileContent);
     await writable.close();
      showToast("File JSON scritto nella destinazione scelta dall'utente.", true);
     setShowCloudAccountModal(false);
     return;
    } catch (err: unknown) {
     if (err instanceof DOMException && err.name === 'AbortError') {
      showToast("Operazione annullata dal docente.", false);
      return;
     }
     console.warn("showSaveFilePicker failed, trying Web Share fallback", err);
    }
   }

   // Mobile / Fallback: Web Share API (Passes directly to native Google Drive App)
   if (navigator.share && navigator.canShare) {
    const file = new File([fileContent], fileName, { type: 'application/json' });
    if (navigator.canShare({ files: [file] })) {
     showToast("Apertura condivisione d'aula... Seleziona 'Google Drive' o 'Salva in Files'.");
     await navigator.share({
      files: [file],
       title: "Copia JSON CurManLight",
      text: "File JSON per il salvataggio diretto nell'app locale di Google Drive."
     });
      showToast("Pannello di condivisione chiuso. Destinazione e salvataggio non verificati.", false);
     setShowCloudAccountModal(false);
     return;
    }
   }

   // Direct Browser Download Fallback
   const blob = new Blob([fileContent], { type: 'application/json' });
   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.download = fileName;
   link.click();
   showToast("Sincronizzazione locale: File di copia scaricato in archivio.", true);
   setShowCloudAccountModal(false);
  } catch (err) {
   console.error("Local sync error:", err);
   showToast("Errore durante l'allineamento locale.", false);
  }
 };

 const handleWorkspaceLogout = () => {
  if (confirm("Sei sicuro di voler scollegare l'account Workspace? Le prossime modifiche saranno salvate solo localmente.")) {
   setIsWorkspaceLoggedIn(false);
   setWorkspaceAccessToken('');
    setWorkspaceUserEmail('');
   safeLocalStorageRemoveItem('curman_workspaceAccessToken');
   safeLocalStorageSetItem('curman_isWorkspaceLoggedIn', 'false');
    safeLocalStorageRemoveItem('curman_workspaceUserEmail');
    showToast("Sessione Google scollegata localmente.");
  }
 };

 const handleWorkspaceAutoPull = async (token: string) => {
  try {
    const fileName = `curmanlight_copia_sicurezza_${schoolYear || 'sessione'}.json`;
   const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false&fields=files(id)`, {
    headers: { Authorization: `Bearer ${token}` }
   });
   if (!searchRes.ok) return;
   const searchData = await searchRes.json();
   const existingFile = searchData.files?.[0];
   if (existingFile) {
    const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, {
     headers: { Authorization: `Bearer ${token}` }
    });
    if (fileRes.ok) {
     const remoteState = await fileRes.json();
     
     // Proposta 3: Sincronizzazione Cloud con Confronto Comparativo Side-by-Side d'Istituto
     const remoteUdaCount = remoteState.savedUda?.length || 0;
     const localUdaCount = stateRef.current.savedUda?.length || 0;
     
     const confirmMessage = `Rilevata una copia JSON nel Google Drive dell'account selezionato.\n\n` +
                 `Confronto Side-by-Side delle versioni:\n` +
                 `Ã¢â‚¬Â¢ Copia Drive: contiene ${remoteUdaCount} UDA salvate.\n` +
                 `Ã¢â‚¬Â¢ Versione Locale di questo PC: contiene ${localUdaCount} UDA in memoria.\n\n` +
                 `Desideri allineare e ripristinare la versione Cloud piÃƒÂ¹ recente per sincronizzare il tuo lavoro su questo computer?`;

     if (confirm(confirmMessage)) {
       const result = restoreBackupState(remoteState);
       if (result.success) {
         showToast("Copia Drive validata e ripristinata localmente.", true);
       } else {
        showToast(`Copia cloud non ripristinata: ${result.message}`, false);
       }
     } else {
      setIsWorkspaceSyncLocked(true);
      showToast(" Sincronizzazione cloud disattivata in questa sessione per proteggere il tuo faldone remoto.", false);
     }
    }
   }
  } catch (e) {
   console.warn("[Google Sync] Errore di auto-pulling:", e);
  }
 };


 return {
  handleWorkspaceLogin,
  handleWorkspaceSync,
  handleLocalDriveSync,
  handleWorkspaceLogout,
  handleWorkspaceAutoPull
 };
}
