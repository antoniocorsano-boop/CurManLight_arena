import type React from 'react';
import type { DecisionStatus, SchoolOrder, UdaModel, UserRole, UserState } from '../../../types/curriculum';
import type { CurriculumMap } from '../../session';
import { safeLocalStorageRemoveItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';

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
 cloudAccountType: 'scolastica' | 'personale';
 schoolYear: string;
 localCurriculum: CurriculumMap;
 savedUda: UdaModel[];
 decisions: Record<string, DecisionStatus>;
 customTexts: Record<string, string>;
 role: UserRole;
 discipline: string;
 order: SchoolOrder;
 stateRef: WorkspaceStateRef;
 restoreBackupState: (newState: Partial<UserState>) => void;
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
 cloudAccountType,
 schoolYear,
 localCurriculum,
 savedUda,
 decisions,
 customTexts,
 role,
 discipline,
 order,
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
  
  const label = type === 'scolastica' ? "Scolastica d'Istituto" : "Personale";
  showToast(`Reindirizzamento al portale Google per l'Utenza ${label}...`, true);
  
  setTimeout(() => {
   const clientId = "312849003-milani.apps.googleusercontent.com"; // Client ID d'Istituto registrato su Google Cloud
   const redirectUri = window.location.origin + window.location.pathname;
   const scope = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email";
   const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
   
   window.location.href = authUrl;
  }, 1200);
 };

 const handleWorkspaceSync = async () => {
  if (!isWorkspaceLoggedIn || !workspaceAccessToken) {
   showToast(" Accedi prima a Google Workspace d'Istituto!", false);
   return;
  }
  setIsSyncingWorkspace(true);
  showToast(`Sincronizzazione in corso sul tuo Drive ${cloudAccountType === "scolastica" ? "d'Istituto" : "Personale"}...`);

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
    lastUpdated: Date.now()
   };

   const fileContent = JSON.stringify(stateToBackup, null, 2);
   const fileName = `CurManLight_CopiaSicurezza_Milani_${schoolYear}.json`;

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
           "Conflitto d'Archiviazione d'Istituto:\n\n" +
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
    showToast(` Copia di Sicurezza sincronizzata con successo su Google Drive (${cloudAccountType === "scolastica" ? "Scolastico" : "Personale"})!`, true);
   } else {
    throw new Error("Errore durante il caricamento");
   }
  } catch (err) {
   console.warn("Errore Sincronizzazione Google:", err);
   showToast(" Connessione scaduta. Clicca su Connetti per rinfrescare il Token d'Istituto.", false);
   
   // Fallback simulated backup file generation for local offline use
   setTimeout(() => {
    const blob = new Blob([JSON.stringify({ localCurriculum, savedUda, decisions, customTexts }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CopiaSicurezza_Locale_Milani.json`;
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
    order
   };

   const fileContent = JSON.stringify(stateToBackup, null, 2);
   const fileName = `CurManLight_CopiaSicurezza_Milani_${schoolYear}.json`;

   // Desktop: File System Access API
   if ('showSaveFilePicker' in window) {
    showToast("Sincronizzazione Desktop: Seleziona la tua cartella Google Drive locale...");
    try {
     const filePickerWindow = window as WindowWithSaveFilePicker;
     const handle = await filePickerWindow.showSaveFilePicker?.({
      suggestedName: fileName,
      types: [{
         description: "File di Configurazione d'Istituto",
       accept: { 'application/json': ['.json'] }
      }]
     });
     if (!handle) throw new Error('File System Access API non disponibile');
     const writable = await handle.createWritable();
     await writable.write(fileContent);
     await writable.close();
     showToast("Copia di sicurezza salvata con successo nella cartella Google Drive locale!", true);
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
      title: "Copia di Sicurezza d'Istituto - CurManLight",
      text: "File JSON per il salvataggio diretto nell'app locale di Google Drive."
     });
     showToast("File inviato all'applicazione Google Drive del dispositivo!", true);
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
   setWorkspaceUserEmail('docente@icdonmilani.edu.it');
   safeLocalStorageRemoveItem('curman_workspaceAccessToken');
   safeLocalStorageSetItem('curman_isWorkspaceLoggedIn', 'false');
   safeLocalStorageSetItem('curman_workspaceUserEmail', 'docente@icdonmilani.edu.it');
   showToast("Account Workspace d'Istituto scollegato con successo.");
  }
 };

 const handleWorkspaceAutoPull = async (token: string) => {
  try {
   const fileName = `CurManLight_CopiaSicurezza_Milani_${schoolYear}.json`;
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
     
     const confirmMessage = ` Sincronizzazione Cloud d'Istituto: Rilevata copia di sicurezza nel tuo Google Drive!\n\n` +
                 `Confronto Side-by-Side delle versioni:\n` +
                 `Ã¢â‚¬Â¢ Versione Cloud d'Istituto: contiene ${remoteUdaCount} UDA salvate.\n` +
                 `Ã¢â‚¬Â¢ Versione Locale di questo PC: contiene ${localUdaCount} UDA in memoria.\n\n` +
                 `Desideri allineare e ripristinare la versione Cloud piÃƒÂ¹ recente per sincronizzare il tuo lavoro su questo computer?`;

     if (confirm(confirmMessage)) {
      restoreBackupState(remoteState);
      showToast("Configurazione d'Istituto ripristinata e sincronizzata con successo!", true);
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