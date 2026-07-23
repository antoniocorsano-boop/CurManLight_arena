import { useCallback, type Dispatch, type SetStateAction } from 'react';
import { safeLocalStorageRemoveItem } from '../../../lib/consolidatedStorage';

interface UseAppLocalHandlersArgs {
 wizardStep: number;
 setWizardStep: Dispatch<SetStateAction<number>>;
 progTitle: string;
 resetAll: () => void;
 showToast: (msg: string, success?: boolean) => void;
}

export function useAppLocalHandlers({
 wizardStep,
 setWizardStep,
 progTitle,
 resetAll,
 showToast
}: UseAppLocalHandlersArgs) {
 const handleBack = useCallback(() => {
  if (wizardStep > 1) {
   setWizardStep((prev) => prev - 1);
  }
 }, [setWizardStep, wizardStep]);

 const handleNext = useCallback(() => {
  if (wizardStep === 1 && !progTitle.trim()) {
   showToast("Inserire un titolo per l'UDA d'Istituto prima di procedere!", false);
   return;
  }
  if (wizardStep < 5) {
   setWizardStep((prev) => prev + 1);
  }
 }, [progTitle, setWizardStep, showToast, wizardStep]);

 const handleClearLocalStorageWithReset = useCallback(() => {
  resetAll();
  safeLocalStorageRemoveItem('curmanlight-react-db-state-v1.4.0');

  try {
   const keys = Object.keys(localStorage);
   keys.forEach((key) => {
    if (key.startsWith('curman_') || key.startsWith('curmanlight-')) {
     localStorage.removeItem(key);
    }
   });
  } catch (e) {
   console.error('Purge failed:', e);
  }

  showToast("Tutti i dati locali d'Istituto sono stati cancellati con successo!");
  setTimeout(() => {
   window.location.reload();
  }, 1000);
 }, [resetAll, showToast]);

 const triggerPwaInstall = useCallback(() => {
  showToast('Installazione avviata o non supportata dal tuo browser.', true);
 }, [showToast]);

 return {
  handleBack,
  handleNext,
  handleClearLocalStorageWithReset,
  triggerPwaInstall
 };
}
