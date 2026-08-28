import { useEffect, useState } from 'react';
import type { SchoolOrder, UserRole } from '../../../types/curriculum';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';

interface UseOnboardingProfileArgs {
  order: SchoolOrder;
  setRole: (role: UserRole) => void;
  setDiscipline: (discipline: string) => void;
  setOrder: (order: SchoolOrder) => void;
  setShowOnboardingModal: (value: boolean) => void;
  showToast: (msg: string, success?: boolean) => void;
}

export const useOnboardingProfile = ({
  setRole,
  setDiscipline,
  setOrder,
  setShowOnboardingModal,
  showToast
}: UseOnboardingProfileArgs) => {
  const [, setTeacherType] = useState<'comune' | 'specialista'>(() => {
    return safeLocalStorageGetItem('curman_teacherType', 'comune') as 'comune' | 'specialista';
  });
  const [, setAssignedClasses] = useState<string[]>(() => {
    const saved = safeLocalStorageGetItem('curman_assignedClasses', '');
    return saved ? saved.split(',') : [];
  });
  const [assignedCombinations, setAssignedCombinations] = useState<string[]>(() => {
    const saved = safeLocalStorageGetItem('curman_assignedCombinations', '');
    if (saved) return saved.split(',');
    return [];
  });
  const [availableSections, setAvailableSections] = useState<string[]>(() => {
    const saved = safeLocalStorageGetItem('curman_availableSections', '');
    if (saved) return saved.split(',');
    return [];
  });
  const [newSectionInput, setNewSectionInput] = useState<string>('');

  const [onboardingRole, setOnboardingRoleLocal] = useState<UserRole>('non-dichiarato');
  const [onboardingDisc, setOnboardingDiscLocal] = useState('italiano');
  const [onboardingOrd, setOnboardingOrdLocal] = useState<SchoolOrder>('secondaria');
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [onboardingAssignedClasses, setOnboardingAssignedClasses] = useState<string[]>([]);
  const [onboardingTeacherType] = useState<'comune' | 'specialista'>('comune');
  const [, setIsSostegno] = useState(() => safeLocalStorageGetItem('curman_isSostegno', 'false') === 'true');
  const [onboardingIsSostegno, setOnboardingIsSostegno] = useState(() => safeLocalStorageGetItem('curman_isSostegno', 'false') === 'true');
  const [onboardingCombinations, setOnboardingCombinations] = useState<string[]>([]);

  useEffect(() => {
    const handleAssistantOpen = () => setShowOnboardingModal(false);
    window.addEventListener('arena:assistant-open', handleAssistantOpen);
    return () => window.removeEventListener('arena:assistant-open', handleAssistantOpen);
  }, [setShowOnboardingModal]);

  const handleSetOnboardingOrdLocal = (ord: SchoolOrder) => {
    setOnboardingOrdLocal(ord);
    setOnboardingAssignedClasses([]);
    setOnboardingCombinations([]);
    setAvailableSections([]);
    safeLocalStorageSetItem('curman_availableSections', '');
  };

  const handleToggleOnboardingCombination = (combo: string) => {
    const list = [...onboardingCombinations];
    const idx = list.indexOf(combo);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(combo);
    }
    setOnboardingCombinations(list);
  };

  const handleAddSectionLocal = () => {
    if (!newSectionInput.trim()) return;
    const cleanSec = newSectionInput.toUpperCase().trim();
    if (availableSections.includes(cleanSec)) {
      showToast("Questa sezione locale è già presente in elenco.", false);
      return;
    }
    const updated = [...availableSections, cleanSec];
    setAvailableSections(updated);
    safeLocalStorageSetItem('curman_availableSections', updated.join(','));
    setNewSectionInput('');
    showToast(`Sezione '${cleanSec}' aggiunta al contesto personale.`);
  };

  const saveOnboardingProfile = () => {
    setRole(onboardingRole);
    setOrder(onboardingOrd);
    setTeacherType(onboardingTeacherType);
    safeLocalStorageSetItem('curman_teacherType', onboardingTeacherType);
    setIsSostegno(onboardingIsSostegno);
    safeLocalStorageSetItem('curman_isSostegno', onboardingIsSostegno ? 'true' : 'false');

    if (onboardingIsSostegno) {
      setDiscipline('italiano');
    } else if (onboardingOrd === 'infanzia' && onboardingTeacherType === 'comune') {
      setDiscipline('italiano');
    } else {
      setDiscipline(onboardingDisc);
    }

    setAssignedClasses(onboardingAssignedClasses);
    safeLocalStorageSetItem('curman_assignedClasses', onboardingAssignedClasses.join(','));
    setAssignedCombinations(onboardingCombinations);
    safeLocalStorageSetItem('curman_assignedCombinations', onboardingCombinations.join(','));
    setShowOnboardingModal(false);
    showToast('Profilo personale locale salvato. Il ruolo dichiarato non è autenticato.');
  };

  return {
    assignedCombinations,
    onboardingRole,
    setOnboardingRoleLocal,
    onboardingDisc,
    setOnboardingDiscLocal,
    onboardingOrd,
    setOnboardingOrdLocal,
    onboardingStep,
    setOnboardingStep,
    onboardingCombinations,
    setOnboardingCombinations,
    onboardingIsSostegno,
    setOnboardingIsSostegno,
    availableSections,
    setAvailableSections,
    newSectionInput,
    setNewSectionInput,
    handleSetOnboardingOrdLocal,
    handleToggleOnboardingCombination,
    handleAddSectionLocal,
    saveOnboardingProfile
  };
};
