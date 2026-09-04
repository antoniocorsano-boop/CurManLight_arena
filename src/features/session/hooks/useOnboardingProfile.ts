import { useEffect, useState } from 'react';
import type { SchoolOrder, UserRole } from '../../../types/curriculum';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';
import { getOptionalSupabaseBrowserClient } from '../../../infrastructure/supabase/client';
import {
  readLocalOperationalProfile,
  syncStoredOperationalProfile,
} from '../../../infrastructure/supabase/operationalProfile';

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
    return saved ? saved.split(',') : [];
  });
  const [assignedCombinations, setAssignedCombinations] = useState<string[]>(() => {
    const saved = safeLocalStorageGetItem('curman_assignedCombinations', '');
    return saved ? saved.split(',') : [];
  });
  const [availableSections, setAvailableSections] = useState<string[]>(() => {
    const saved = safeLocalStorageGetItem('curman_availableSections', '');
    return saved ? saved.split(',') : [];
  });
  const [newSectionInput, setNewSectionInput] = useState<string>('');

  const storedOperationalProfile = readLocalOperationalProfile();
  const [onboardingRole, setOnboardingRoleLocal] = useState<UserRole>('non-dichiarato');
  const [onboardingDisc, setOnboardingDiscLocal] = useState(storedOperationalProfile?.disciplines[0] ?? 'italiano');
  const [onboardingOrd, setOnboardingOrdLocal] = useState<SchoolOrder>(storedOperationalProfile?.schoolOrder ?? order);
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
    if (idx > -1) list.splice(idx, 1);
    else list.push(combo);
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
    const operationalProfile = readLocalOperationalProfile();
    const needsOperationalProfile = (onboardingOrd === 'primaria' || onboardingOrd === 'secondaria') && !onboardingIsSostegno;
    if (needsOperationalProfile && (!operationalProfile || operationalProfile.schoolOrder !== onboardingOrd || operationalProfile.disciplines.length === 0)) {
      showToast('Seleziona almeno una disciplina di competenza prima di entrare.', false);
      return;
    }

    setRole(onboardingRole);
    setOrder(onboardingOrd);
    setTeacherType(onboardingTeacherType);
    safeLocalStorageSetItem('curman_teacherType', onboardingTeacherType);
    setIsSostegno(onboardingIsSostegno);
    safeLocalStorageSetItem('curman_isSostegno', onboardingIsSostegno ? 'true' : 'false');

    if (onboardingIsSostegno || onboardingOrd === 'infanzia') {
      setDiscipline('italiano');
    } else if (operationalProfile) {
      const activeDiscipline = operationalProfile.disciplines.includes(onboardingDisc)
        ? onboardingDisc
        : operationalProfile.disciplines[0];
      setDiscipline(activeDiscipline);
      setOnboardingDiscLocal(activeDiscipline);
    }

    if (needsOperationalProfile) {
      const optional = getOptionalSupabaseBrowserClient();
      if (optional.client) {
        void syncStoredOperationalProfile(optional.client)
          .then((synced) => {
            if (synced) showToast('Profilo operativo condiviso aggiornato. Il coordinamento resta una funzione di lavoro, non un’autorità istituzionale.');
          })
          .catch(() => showToast('Profilo salvato localmente; la sincronizzazione del gruppo potrà essere ripetuta dopo l’accesso ad Arena.', false));
      }
    }

    setAssignedClasses(onboardingAssignedClasses);
    safeLocalStorageSetItem('curman_assignedClasses', onboardingAssignedClasses.join(','));
    setAssignedCombinations(onboardingCombinations);
    safeLocalStorageSetItem('curman_assignedCombinations', onboardingCombinations.join(','));
    setShowOnboardingModal(false);
    showToast('Profilo personale salvato. Gruppi e competenze operative non equivalgono a una nomina istituzionale.');
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
