import type React from 'react';
import type { DecisionStatus, UdaModel, UserState } from '../../../types/curriculum';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type { RestoreBackupResult } from '../../../store/useCurriculumStore';
import {
 validateArchiveIntegrity,
 type InstitutionalArchive,
} from '../../../domain/institution';
import { useWorkspaceCapabilities } from '../../session/hooks/useWorkspaceCapabilities';
import { executeDepartmentConsolidation, parseCmlImport } from '../services/departmentConsolidation';

type BackupState = Partial<UserState> & { institutionalArchive?: InstitutionalArchive };

type UseBackupHandlersArgs = {
 schoolYear: string;
 setDecision: (id: string, status: DecisionStatus) => void;
 setCustomText: (id: string, text: string) => void;
 restoreBackupState: (newState: unknown) => RestoreBackupResult;
 setShowSaveModal: (value: boolean) => void;
 showToast: (msg: string, success?: boolean) => void;
};

export function useBackupHandlers({
 schoolYear,
 setDecision,
 setCustomText,
 restoreBackupState,
 setShowSaveModal,
 showToast
}: UseBackupHandlersArgs) {
 const workspaceCapabilities = useWorkspaceCapabilities();
 // CML file merger
 const handleImportMergeCml = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
   const parsed = parseCmlImport(e.target?.result as string);
   if ('ok' in parsed) {
    showToast(parsed.message, false);
    return;
   }
   const result = executeDepartmentConsolidation(workspaceCapabilities.resolution, parsed, { setDecision, setCustomText });
   if (!result.ok) {
    showToast(result.reason === 'CAPABILITY_NOT_GRANTED' ? 'Funzione non disponibile per il ruolo dichiarato.' : result.message, false);
    return;
   }
   showToast(`Sintesi completata! Importate ed unite ${result.value.mergedDecisions} decisioni e ${result.value.mergedCustomTexts} testi da file .cml.`);
  };
  reader.readAsText(file);
 };

 // Backup files
 const handleDownloadBackup = () => {
  const dataStr = JSON.stringify(useCurriculumStore.getState(), null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `curmanlight_copia_sicurezza_completa_${schoolYear}.json`;
  link.click();
   showToast("Copia JSON locale scaricata.");
  setShowSaveModal(false);
 };

 const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
   try {
    const restoredState = JSON.parse(e.target?.result as string) as BackupState;
    
    // Strict structural schema validation check
    const restoredSavedUda = restoredState.savedUda;
    const hasUdaList = Array.isArray(restoredSavedUda);
    const hasDecisionsMap = restoredState.decisions && typeof restoredState.decisions === 'object' && !Array.isArray(restoredState.decisions);
    const hasCustomTextsMap = restoredState.customTexts && typeof restoredState.customTexts === 'object' && !Array.isArray(restoredState.customTexts);
    
    if (hasUdaList && hasDecisionsMap && hasCustomTextsMap) {
     // Verify that all items inside savedUda are valid UDA objects
     const isValidUdaStructure = restoredSavedUda.every((uda: Partial<UdaModel>) => {
      return typeof uda.id === 'string' && typeof uda.title === 'string' && typeof uda.discipline === 'string' && Array.isArray(uda.traguardi) && Array.isArray(uda.obiettivi);
     });

     if (isValidUdaStructure) {
      if (restoredState.institutionalArchive !== undefined && !validateArchiveIntegrity(restoredState.institutionalArchive).valid) {
       showToast("Archivio istituzionale non valido o con versione non supportata.", false);
       return;
      }
      const result = restoreBackupState(restoredState);
      if (!result.success) {
       showToast(result.message, false);
       return;
      }
     showToast("Copia JSON validata e applicata localmente.");
      setShowSaveModal(false);
     } else {
      showToast("Struttura dei dati didattici non conforme nel file di configurazione.", false);
     }
    } else {
     showToast("Struttura del file di sicurezza non valida o corrotta.", false);
    }
   } catch(err) {
    showToast("Impossibile caricare il file di ripristino", false);
   }
  };
  reader.readAsText(file);
 };


 return {
  handleImportMergeCml,
  canConsolidate: workspaceCapabilities.can('department.consolidate'),
  handleDownloadBackup,
  handleRestoreBackup
 };
}
