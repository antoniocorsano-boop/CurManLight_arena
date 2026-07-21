import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'curmanlight-tep-dismissed';

export function useTEP() {
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [simplifyActive, setSimplifyActive] = useState(false);
  const [wizardMode, setWizardMode] = useState(false);
  const [missClickCount, setMissClickCount] = useState(0);

  const dismissSimplify = useCallback(() => {
    setSimplifyActive(true);
    setIsDismissed(true);
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
  }, []);

  const dismissWizard = useCallback(() => {
    setWizardMode(true);
    setIsDismissed(true);
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
  }, []);

  const resetTEP = useCallback(() => {
    setSimplifyActive(false);
    setWizardMode(false);
    setIsDismissed(false);
    setMissClickCount(0);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  useEffect(() => {
    if (isDismissed) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        const rect = target.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          setMissClickCount(c => c + 1);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isDismissed]);

  return { isDismissed, simplifyActive, wizardMode, missClickCount, dismissSimplify, dismissWizard, resetTEP };
}
