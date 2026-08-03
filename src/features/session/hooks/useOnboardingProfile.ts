import { useState } from 'react';
import type { SchoolOrder, UserRole } from '../../../types/curriculum';
import { safeLocalStorageGetItem, safeLocalStorageRemoveItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';

export interface TeacherProfileDraft {
  teacherType: 'comune' | 'specialista';
  isSostegno: boolean;
  order: SchoolOrder;
  discipline: string;
  assignedClasses: string[];
  availableSections: string[];
  assignedCombinations: string[];
}

interface UseOnboardingProfileArgs {
  order: SchoolOrder;
  discipline?: string;
  setRole: (role: UserRole) => void;
  setDiscipline: (discipline: string) => void;
  setOrder: (order: SchoolOrder) => void;
  setShowOnboardingModal: (value: boolean) => void;
  showToast: (msg: string, success?: boolean) => void;
}

const PROFILE_KEYS = {
  teacherType: 'curman_teacherType',
  isSostegno: 'curman_isSostegno',
  assignedClasses: 'curman_assignedClasses',
  availableSections: 'curman_availableSections',
  assignedCombinations: 'curman_assignedCombinations',
} as const;

function readList(key: string): string[] {
  const saved = safeLocalStorageGetItem(key, '');
  return [...new Set(saved.split(',').map(value => value.trim()).filter(Boolean))];
}

function readTeacherProfile(order: SchoolOrder, discipline: string): TeacherProfileDraft {
  const teacherType = safeLocalStorageGetItem(PROFILE_KEYS.teacherType, 'comune');
  return {
    teacherType: teacherType === 'specialista' ? 'specialista' : 'comune',
    isSostegno: safeLocalStorageGetItem(PROFILE_KEYS.isSostegno, 'false') === 'true',
    order,
    discipline,
    assignedClasses: readList(PROFILE_KEYS.assignedClasses),
    availableSections: readList(PROFILE_KEYS.availableSections),
    assignedCombinations: readList(PROFILE_KEYS.assignedCombinations),
  };
}

function writeTeacherProfile(profile: TeacherProfileDraft): void {
  safeLocalStorageSetItem(PROFILE_KEYS.teacherType, profile.teacherType);
  safeLocalStorageSetItem(PROFILE_KEYS.isSostegno, profile.isSostegno ? 'true' : 'false');
  safeLocalStorageSetItem(PROFILE_KEYS.assignedClasses, profile.assignedClasses.join(','));
  safeLocalStorageSetItem(PROFILE_KEYS.availableSections, profile.availableSections.join(','));
  safeLocalStorageSetItem(PROFILE_KEYS.assignedCombinations, profile.assignedCombinations.join(','));
}

export const useOnboardingProfile = ({
  order,
  discipline = 'italiano',
  setRole,
  setDiscipline,
  setOrder,
  setShowOnboardingModal,
  showToast,
}: UseOnboardingProfileArgs) => {
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfileDraft>(() => readTeacherProfile(order, discipline));
  const [newSectionInput, setNewSectionInput] = useState('');
  const [onboardingRole, setOnboardingRoleLocal] = useState<UserRole>('non-dichiarato');
  const [onboardingDisc, setOnboardingDiscLocal] = useState(teacherProfile.discipline);
  const [onboardingOrd, setOnboardingOrdLocal] = useState<SchoolOrder>(teacherProfile.order);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingAssignedClasses, setOnboardingAssignedClasses] = useState<string[]>(teacherProfile.assignedClasses);
  const [onboardingIsSostegno, setOnboardingIsSostegno] = useState(teacherProfile.isSostegno);
  const [onboardingCombinations, setOnboardingCombinations] = useState<string[]>(teacherProfile.assignedCombinations);
  const [availableSections, setAvailableSections] = useState<string[]>(teacherProfile.availableSections);

  const setTeacherProfileDraft = (draft: TeacherProfileDraft) => setTeacherProfile(draft);

  const saveTeacherProfile = (draft: TeacherProfileDraft) => {
    const normalized: TeacherProfileDraft = {
      ...draft,
      assignedClasses: [...new Set(draft.assignedClasses.map(value => value.trim()).filter(Boolean))],
      availableSections: [...new Set(draft.availableSections.map(value => value.trim()).filter(Boolean))],
      assignedCombinations: [...new Set(draft.assignedCombinations.map(value => value.trim()).filter(Boolean))],
    };
    setOrder(normalized.order);
    setDiscipline(normalized.isSostegno || (normalized.order === 'infanzia' && normalized.teacherType === 'comune') ? 'italiano' : normalized.discipline);
    writeTeacherProfile(normalized);
    setTeacherProfile(normalized);
    setOnboardingOrdLocal(normalized.order);
    setOnboardingDiscLocal(normalized.discipline);
    setOnboardingIsSostegno(normalized.isSostegno);
    setOnboardingAssignedClasses(normalized.assignedClasses);
    setAvailableSections(normalized.availableSections);
    setOnboardingCombinations(normalized.assignedCombinations);
  };

  const resetTeacherProfile = () => {
    Object.values(PROFILE_KEYS).forEach(key => safeLocalStorageRemoveItem(key));
    const neutral: TeacherProfileDraft = { teacherType: 'comune', isSostegno: false, order, discipline: 'italiano', assignedClasses: [], availableSections: [], assignedCombinations: [] };
    setTeacherProfile(neutral);
    setOnboardingAssignedClasses([]);
    setAvailableSections([]);
    setOnboardingCombinations([]);
  };

  const handleSetOnboardingOrdLocal = (ord: SchoolOrder) => {
    setOnboardingOrdLocal(ord);
    setOnboardingAssignedClasses([]);
    setOnboardingCombinations([]);
    setAvailableSections([]);
  };

  const setSections = (sections: string[]) => setAvailableSections([...new Set(sections.map(value => value.trim()).filter(Boolean))]);
  const handleToggleOnboardingCombination = (combo: string) => {
    setOnboardingCombinations(current => current.includes(combo) ? current.filter(item => item !== combo) : [...current, combo]);
  };

  const handleAddSectionLocal = () => {
    const cleanSec = newSectionInput.toUpperCase().trim();
    if (!cleanSec) return;
    if (availableSections.includes(cleanSec)) {
      showToast('Questa sezione locale è già presente in elenco.', false);
      return;
    }
    setSections([...availableSections, cleanSec]);
    setNewSectionInput('');
    showToast(`Sezione '${cleanSec}' aggiunta al contesto personale.`);
  };

  const saveOnboardingProfile = () => {
    const draft: TeacherProfileDraft = {
      teacherType: teacherProfile.teacherType,
      isSostegno: onboardingIsSostegno,
      order: onboardingOrd,
      discipline: onboardingDisc,
      assignedClasses: onboardingAssignedClasses,
      availableSections,
      assignedCombinations: onboardingCombinations,
    };
    setRole(onboardingRole);
    saveTeacherProfile(draft);
    setShowOnboardingModal(false);
    showToast('Profilo personale locale salvato. Il ruolo dichiarato non è autenticato.');
  };

  return {
    teacherProfile,
    setTeacherProfileDraft,
    saveTeacherProfile,
    resetTeacherProfile,
    assignedCombinations: teacherProfile.assignedCombinations,
    onboardingRole,
    setOnboardingRoleLocal,
    onboardingDisc,
    setOnboardingDiscLocal,
    onboardingOrd,
    setOnboardingOrdLocal,
    onboardingStep,
    setOnboardingStep,
    onboardingAssignedClasses,
    setOnboardingAssignedClasses,
    onboardingCombinations,
    setOnboardingCombinations,
    onboardingIsSostegno,
    setOnboardingIsSostegno,
    availableSections,
    setAvailableSections: setSections,
    newSectionInput,
    setNewSectionInput,
    handleSetOnboardingOrdLocal,
    handleToggleOnboardingCombination,
    handleAddSectionLocal,
    saveOnboardingProfile,
  };
};
