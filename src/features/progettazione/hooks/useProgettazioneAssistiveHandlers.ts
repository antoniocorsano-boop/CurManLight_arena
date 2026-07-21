import { useEffect, useRef, useState } from 'react';
import type { SchoolOrder, UdaModel } from '../../../types/curriculum';
import type { CurriculumMap } from '../../session';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';
import { sanitizeInclusiveSensitiveTerms } from '../../../lib/gdprFilter';

interface UseProgettazioneAssistiveHandlersArgs {
  savedUda: UdaModel[];
  localCurriculum: CurriculumMap;
  order: SchoolOrder;
  targetClass: string;
  targetSection: string;
  progNotes: string;
  setProgNotes: (value: string) => void;
  realTaskInput: string;
  setRealTaskInput: (value: string) => void;
  addUda: (uda: UdaModel) => void;
  setProgettazioneMode: (mode: 'grid' | 'wizard') => void;
  showToast: (msg: string, success?: boolean) => void;
}

export const useProgettazioneAssistiveHandlers = ({
  savedUda,
  localCurriculum,
  order,
  targetClass,
  targetSection,
  progNotes,
  setProgNotes,
  realTaskInput,
  setRealTaskInput,
  addUda,
  setProgettazioneMode,
  showToast
}: UseProgettazioneAssistiveHandlersArgs) => {
  const [tepBannerVisible, setTepBannerVisible] = useState(false);
  const [tepBannerDismissed, setTepBannerDismissed] = useState(false);
  const [branchFocusHighlight, setBranchFocusHighlight] = useState(() => safeLocalStorageGetItem('curman_branchFocusHighlight', 'false') === 'true');
  const [anticipatedFields, setAnticipatedFields] = useState<string[]>([]);
  const tepMissClickLog = useRef<number[]>([]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (tepBannerDismissed) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('button, a, input, select, textarea, label, [role="button"]');
      const isSmallTarget = interactive ? (() => {
        const rect = (interactive as HTMLElement).getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      })() : true;

      if (!interactive || isSmallTarget) {
        const now = Date.now();
        tepMissClickLog.current = [...tepMissClickLog.current.filter(ts => now - ts < 10000), now];
        if (tepMissClickLog.current.length > 3) {
          setTepBannerVisible(true);
          tepMissClickLog.current = [];
        }
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [tepBannerDismissed]);

  const handleTepSwitchToWizard = () => {
    setProgettazioneMode('wizard');
    safeLocalStorageSetItem('curman_progettazioneMode', 'wizard');
    setTepBannerVisible(false);
    setTepBannerDismissed(true);
    showToast("Sei passato all'Assistente Guidato (Wizard): passaggi semplificati attivi.", true);
  };

  const handleTepSimplifyGrid = () => {
    setBranchFocusHighlight(true);
    safeLocalStorageSetItem('curman_branchFocusHighlight', 'true');
    setTepBannerVisible(false);
    setTepBannerDismissed(true);
    showToast("Griglia semplificata: rami non pertinenti attenuati al 40% di opacità.", true);
  };

  const toggleBranchFocusHighlight = () => {
    const next = !branchFocusHighlight;
    setBranchFocusHighlight(next);
    safeLocalStorageSetItem('curman_branchFocusHighlight', String(next));
  };

  const applyAnticipatoryPrefill = () => {
    const recent = [...savedUda].slice(-5);
    if (recent.length === 0) return;
    const mostCommon = (values: string[]) => {
      const freq: Record<string, number> = {};
      values.filter(v => v && v.trim()).forEach(v => { freq[v] = (freq[v] || 0) + 1; });
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      return sorted.length > 0 ? sorted[0][0] : '';
    };
    const prefillNotes = sanitizeInclusiveSensitiveTerms(mostCommon(recent.map(u => u.notes)));
    const prefillTask = sanitizeInclusiveSensitiveTerms(mostCommon(recent.map(u => u.realTask)));
    const fields: string[] = [];
    if (prefillNotes && !progNotes.trim()) {
      setProgNotes(prefillNotes);
      fields.push('progNotes');
    }
    if (prefillTask && !realTaskInput.trim()) {
      setRealTaskInput(prefillTask);
      fields.push('realTaskInput');
    }
    if (fields.length > 0) {
      setAnticipatedFields(fields);
      showToast("Bozza assistita d'Istituto: campi ricorrenti pre-compilati dallo storico (verifica e conferma).", true);
    }
  };

  const confirmAnticipatedField = (field: string) => {
    setAnticipatedFields(prev => prev.filter(f => f !== field));
  };

  const handleCloneUdaAdaptive = (uda: UdaModel) => {
    const currentData = localCurriculum[uda.discipline]?.[order] || { traguardi: [], obiettivi: [] };
    const realignedTraguardi = (uda.traguardi || []).map((t: string) => {
      const exactIdx = currentData.traguardi.indexOf(t);
      if (exactIdx > -1) return currentData.traguardi[exactIdx];
      const keywords = t.toLowerCase().split(/\s+/).filter((w: string) => w.length > 5);
      const found = currentData.traguardi.find((ct: string) => keywords.some((k: string) => ct.toLowerCase().includes(k)));
      return found || t;
    });
    const titleSuffix = order === 'infanzia' ? '' : ` (Target: ${targetClass}^${targetSection})`;
    const cloned: UdaModel = {
      ...uda,
      id: `uda-cloned-${Date.now()}`,
      title: `${uda.title.replace(/\s*\((Clonata|Importata|Target:[^)]*)\)/g, '')} (Clonata)${titleSuffix}`,
      status: 'bozza',
      traguardi: realignedTraguardi,
      realTask: sanitizeInclusiveSensitiveTerms(uda.realTask || ''),
      notes: sanitizeInclusiveSensitiveTerms(uda.notes || ''),
      createdAt: new Date().toLocaleDateString('it-IT')
    };
    addUda(cloned);
    showToast(`UDA clonata e ri-allineata sulla classe target ${order === 'infanzia' ? 'Fascia Unica' : `${targetClass}^${targetSection}`} con filtro GDPR applicato!`, true);
  };

  return {
    branchFocusHighlight,
    toggleBranchFocusHighlight,
    tepBannerVisible,
    setTepBannerVisible,
    setTepBannerDismissed,
    handleTepSwitchToWizard,
    handleTepSimplifyGrid,
    anticipatedFields,
    confirmAnticipatedField,
    applyAnticipatoryPrefill,
    handleCloneUdaAdaptive
  };
};
