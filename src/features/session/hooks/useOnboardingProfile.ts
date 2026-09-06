import { useEffect, useState } from 'react';
import type { SchoolOrder, UserRole } from '../../../types/curriculum';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';
import { getOptionalSupabaseBrowserClient } from '../../../infrastructure/supabase/client';
import {
  rememberOperationalDiscipline,
  syncStoredOperationalProfile,
} from '../../../infrastructure/supabase/operationalProfile';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import {
  PERSONAL_WORK_PROFILE_SCHEMA_VERSION,
  PERSONAL_WORK_PROFILE_STORAGE_KEY,
  parsePersonalWorkProfile,
  toPersonalProfileRole,
  type PersonalWorkProfileV1,
} from '../domain/personalWorkProfile';

interface UseOnboardingProfileArgs {
  role: UserRole;
  discipline: string;
  order: SchoolOrder;
  setRole: (role: UserRole) => void;
  setDiscipline: (discipline: string) => void;
  setOrder: (order: SchoolOrder) => void;
  setShowOnboardingModal: (value: boolean) => void;
  showToast: (msg: string, success?: boolean) => void;
}

const splitStoredList = (value: string): string[] => value ? value.split(',').filter(Boolean) : [];
const isOperationalOrder = (value: SchoolOrder): value is 'primaria' | 'secondaria' => value === 'primaria' || value === 'secondaria';

export const useOnboardingProfile = ({
  role,
  discipline,
  order,
  setRole,
  setDiscipline,
  setOrder,
  setShowOnboardingModal,
  showToast
}: UseOnboardingProfileArgs) => {
  const schoolYear = useCurriculumStore((state) => state.schoolYear);
  const storedProfile = parsePersonalWorkProfile(
    safeLocalStorageGetItem(PERSONAL_WORK_PROFILE_STORAGE_KEY, '')
  );

  const [, setTeacherType] = useState<'comune' | 'specialista'>(() => {
    return storedProfile?.teacherType
      ?? safeLocalStorageGetItem('curman_teacherType', 'comune') as 'comune' | 'specialista';
  });
  const [, setAssignedClasses] = useState<string[]>(() => {
    return storedProfile?.assignedClasses
      ?? splitStoredList(safeLocalStorageGetItem('curman_assignedClasses', ''));
  });
  const [assignedCombinations, setAssignedCombinations] = useState<string[]>(() => {
    return storedProfile?.assignedCombinations
      ?? splitStoredList(safeLocalStorageGetItem('curman_assignedCombinations', ''));
  });
  const [availableSections, setAvailableSections] = useState<string[]>(() => {
    return storedProfile?.availableSections
      ?? splitStoredList(safeLocalStorageGetItem('curman_availableSections', ''));
  });
  const [newSectionInput, setNewSectionInput] = useState<string>('');

  const [onboardingRole, setOnboardingRoleState] = useState<UserRole>(() =>
    storedProfile?.role ?? 'non-dichiarato'
  );
  const setOnboardingRoleLocal = (nextRole: UserRole) => {
    setOnboardingRoleState(toPersonalProfileRole(nextRole));
  };

  const [onboardingDisc, setOnboardingDiscLocal] = useState(() => storedProfile?.discipline ?? 'italiano');
  const [onboardingOrd, setOnboardingOrdLocal] = useState<SchoolOrder>(() => storedProfile?.order ?? 'secondaria');
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [onboardingAssignedClasses, setOnboardingAssignedClasses] = useState<string[]>(() => storedProfile?.assignedClasses ?? []);
  const [onboardingTeacherType] = useState<'comune' | 'specialista'>(() => storedProfile?.teacherType ?? 'comune');
  const [, setIsSostegno] = useState(() =>
    storedProfile?.teachingActivity === 'sostegno'
      || safeLocalStorageGetItem('curman_isSostegno', 'false') === 'true'
  );
  const [onboardingIsSostegno, setOnboardingIsSostegno] = useState(() =>
    storedProfile?.teachingActivity === 'sostegno'
      || safeLocalStorageGetItem('curman_isSostegno', 'false') === 'true'
  );
  const [onboardingCombinations, setOnboardingCombinations] = useState<string[]>(() => storedProfile?.assignedCombinations ?? []);

  useEffect(() => {
    const handleAssistantOpen = () => setShowOnboardingModal(false);
    window.addEventListener('arena:assistant-open', handleAssistantOpen);
    return () => window.removeEventListener('arena:assistant-open', handleAssistantOpen);
  }, [setShowOnboardingModal]);

  const handleSetOnboardingOrdLocal = (nextOrder: SchoolOrder) => {
    setOnboardingOrdLocal(nextOrder);
    setOnboardingAssignedClasses([]);
    setOnboardingCombinations([]);
    setAvailableSections([]);
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
      showToast('Questa sezione locale è già presente in elenco.', false);
      return;
    }
    setAvailableSections([...availableSections, cleanSec]);
    setNewSectionInput('');
  };

  const openOnboardingProfileEditor = () => {
    const profile = parsePersonalWorkProfile(
      safeLocalStorageGetItem(PERSONAL_WORK_PROFILE_STORAGE_KEY, '')
    );
    const savedClasses = profile?.assignedClasses
      ?? splitStoredList(safeLocalStorageGetItem('curman_assignedClasses', ''));
    const savedCombinations = profile?.assignedCombinations
      ?? splitStoredList(safeLocalStorageGetItem('curman_assignedCombinations', ''));
    const savedSections = profile?.availableSections
      ?? splitStoredList(safeLocalStorageGetItem('curman_availableSections', ''));

    setOnboardingRoleState(profile?.role ?? toPersonalProfileRole(role));
    setOnboardingDiscLocal(profile?.discipline ?? discipline);
    setOnboardingOrdLocal(profile?.order ?? order);
    setOnboardingAssignedClasses(savedClasses);
    setOnboardingCombinations(savedCombinations);
    setAvailableSections(savedSections);
    setOnboardingIsSostegno(
      profile?.teachingActivity === 'sostegno'
        || safeLocalStorageGetItem('curman_isSostegno', 'false') === 'true'
    );
    setNewSectionInput('');
    setOnboardingStep(1);
    setShowOnboardingModal(true);
  };

  const saveOnboardingProfile = () => {
    const personalRole = toPersonalProfileRole(onboardingRole);
    const savedDiscipline = onboardingIsSostegno
      ? 'italiano'
      : onboardingOrd === 'infanzia' && onboardingTeacherType === 'comune'
        ? 'italiano'
        : onboardingDisc;

    const profile: PersonalWorkProfileV1 = {
      schemaVersion: PERSONAL_WORK_PROFILE_SCHEMA_VERSION,
      completedAt: new Date().toISOString(),
      role: personalRole,
      order: onboardingOrd,
      discipline: savedDiscipline,
      teachingActivity: onboardingIsSostegno ? 'sostegno' : 'disciplinare',
      teacherType: onboardingTeacherType,
      assignedClasses: [...onboardingAssignedClasses],
      assignedCombinations: [...onboardingCombinations],
      availableSections: [...availableSections],
    };

    setRole(personalRole);
    setOrder(onboardingOrd);
    setTeacherType(onboardingTeacherType);
    setIsSostegno(onboardingIsSostegno);
    setDiscipline(savedDiscipline);
    setAssignedClasses(onboardingAssignedClasses);
    setAssignedCombinations(onboardingCombinations);

    safeLocalStorageSetItem(PERSONAL_WORK_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    safeLocalStorageSetItem('curman_teacherType', onboardingTeacherType);
    safeLocalStorageSetItem('curman_isSostegno', onboardingIsSostegno ? 'true' : 'false');
    safeLocalStorageSetItem('curman_assignedClasses', onboardingAssignedClasses.join(','));
    safeLocalStorageSetItem('curman_assignedCombinations', onboardingCombinations.join(','));
    safeLocalStorageSetItem('curman_availableSections', availableSections.join(','));

    const operationalProfile = !onboardingIsSostegno && isOperationalOrder(onboardingOrd)
      ? rememberOperationalDiscipline(schoolYear, onboardingOrd, savedDiscipline)
      : null;

    if (operationalProfile) {
      const optional = getOptionalSupabaseBrowserClient();
      if (optional.client) {
        void syncStoredOperationalProfile(optional.client)
          .then((synced) => {
            if (synced) showToast('Profilo di lavoro e competenza disciplinare aggiornati. Gli incarichi nel team restano verificati separatamente.');
          })
          .catch(() => showToast('Profilo salvato sul dispositivo; la competenza disciplinare verrà sincronizzata al prossimo accesso condiviso.', false));
      }
    }

    setShowOnboardingModal(false);
    showToast('Profilo di lavoro personale salvato. Le competenze dichiarate non attribuiscono incarichi o autorità istituzionale.');
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
    openOnboardingProfileEditor,
    saveOnboardingProfile
  };
};
