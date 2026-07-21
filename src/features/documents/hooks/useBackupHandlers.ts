import type React from 'react';
import type { DecisionStatus, UdaModel, UserState } from '../../../types/curriculum';
import { useCurriculumStore } from '../../../store/useCurriculumStore';

type UseBackupHandlersArgs = {
 schoolYear: string;
 setDecision: (id: string, status: DecisionStatus) => void;
 setCustomText: (id: string, text: string) => void;
 restoreBackupState: (newState: Partial<UserState>) => void;
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
 // CML file merger
 const handleImportMergeCml = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
   try {
    const imported = JSON.parse(e.target?.result as string);
    if (imported.format !== "CML-LIGHT-EXPORT") {
     showToast("Formato file non valido. Caricare un file .cml valido!", false);
     return;
    }

    let mergedCount = 0;
    Object.keys(imported.decisions).forEach(id => {
     setDecision(id, imported.decisions[id]);
     mergedCount++;
    });

    Object.keys(imported.customTexts).forEach(id => {
     setCustomText(id, imported.customTexts[id]);
    });

    showToast(`Sintesi completata! Importate ed unite ${mergedCount} decisioni da file .cml.`);
   } catch(err) {
    showToast("Errore di decodifica del file di lavoro", false);
   }
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
  showToast("Copia di sicurezza d'Istituto scaricata con successo!");
  setShowSaveModal(false);
 };

 const handleRestoreBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
   try {
    const restoredState = JSON.parse(e.target?.result as string) as Partial<UserState>;
    
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
      restoreBackupState(restoredState);
      showToast("Configurazione d'Istituto ripristinata con successo!");
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
  handleDownloadBackup,
  handleRestoreBackup
 };
}