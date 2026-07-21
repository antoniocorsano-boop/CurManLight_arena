import { useState } from 'react';
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
  order,
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
    return saved ? saved.split(',') : ['1', '2'];
  });
  const [assignedCombinations, setAssignedCombinations] = useState<string[]>(() => {
    const saved = safeLocalStorageGetItem('curman_assignedCombinations', '');
    if (saved) return saved.split(',');
    return order === 'infanzia' ? ['Sezione A'] : (order === 'primaria' ? ['1^A', '2^A'] : ['1^A', '2^A', '2^B']);
  });
  const [availableSections, setAvailableSections] = useState<string[]>(() => {
    const saved = safeLocalStorageGetItem('curman_availableSections', '');
    if (saved) return saved.split(',');
    return order === 'infanzia' ? ['Rossa', 'Verde', 'Blu'] : ['A', 'B', 'C'];
  });
  const [newSectionInput, setNewSectionInput] = useState<string>('');

  const [onboardingRole, setOnboardingRoleLocal] = useState<UserRole>('insegnante');
  const [onboardingDisc, setOnboardingDiscLocal] = useState('italiano');
  const [onboardingOrd, setOnboardingOrdLocal] = useState<SchoolOrder>('secondaria');
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [onboardingAssignedClasses, setOnboardingAssignedClasses] = useState<string[]>(['1', '2']);
  const [onboardingTeacherType] = useState<'comune' | 'specialista'>('comune');
  const [, setIsSostegno] = useState(() => safeLocalStorageGetItem('curman_isSostegno', 'false') === 'true');
  const [onboardingIsSostegno, setOnboardingIsSostegno] = useState(() => safeLocalStorageGetItem('curman_isSostegno', 'false') === 'true');
  const [onboardingCombinations, setOnboardingCombinations] = useState<string[]>(() => {
    return ['1^A', '2^A'];
  });

  const handleSetOnboardingOrdLocal = (ord: SchoolOrder) => {
    setOnboardingOrdLocal(ord);
    if (ord === 'infanzia') {
      setOnboardingAssignedClasses(['Fascia Unica 3-5 anni']);
      setOnboardingCombinations(['Rossa']);
      setAvailableSections(['Rossa', 'Verde', 'Blu']);
      safeLocalStorageSetItem('curman_availableSections', 'Rossa,Verde,Blu');
    } else if (ord === 'primaria') {
      setOnboardingAssignedClasses(['1', '2']);
      setOnboardingCombinations(['1^A', '2^A']);
      setAvailableSections(['A', 'B', 'C']);
      safeLocalStorageSetItem('curman_availableSections', 'A,B,C');
    } else {
      setOnboardingAssignedClasses(['1', '2']);
      setOnboardingCombinations(['1^A', '2^A', '2^B']);
      setAvailableSections(['A', 'B', 'C']);
      safeLocalStorageSetItem('curman_availableSections', 'A,B,C');
    }
  };

  const handleToggleOnboardingCombination = (combo: string) => {
    const list = [...onboardingCombinations];
    const idx = list.indexOf(combo);
    if (idx > -1) {
      if (list.length > 1) {
        list.splice(idx, 1);
      }
    } else {
      list.push(combo);
    }
    setOnboardingCombinations(list);
  };

  const handleAddSectionLocal = () => {
    if (!newSectionInput.trim()) return;
    const cleanSec = newSectionInput.toUpperCase().trim();
    if (availableSections.includes(cleanSec)) {
      showToast("Questa sezione d'Istituto è già presente in elenco!", false);
      return;
    }
    const updated = [...availableSections, cleanSec];
    setAvailableSections(updated);
    safeLocalStorageSetItem('curman_availableSections', updated.join(','));
    setNewSectionInput('');
    showToast(`Sezione '${cleanSec}' aggiunta all'elenco d'Istituto!`, true);
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
    showToast("Profilo utente d'Istituto configurato con successo!");
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
