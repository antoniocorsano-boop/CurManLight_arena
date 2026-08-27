import { useEffect, useState } from 'react';
import type { SchoolOrder, UdaModel } from '../../../types/curriculum';

export const OPEN_ONBOARDING_PROFILE_EVENT = 'curmanlight:open-onboarding-profile';

export function requestOnboardingProfile() {
 if (typeof window !== 'undefined') {
  window.dispatchEvent(new Event(OPEN_ONBOARDING_PROFILE_EVENT));
 }
}

interface UseSessionUiStateArgs {
 order: SchoolOrder;
}

export function useSessionUiState({ order }: UseSessionUiStateArgs) {
 const [showOnlyProfileCurriculum, setShowOnlyProfileCurriculum] = useState(true);
 const [showOnlyProfileProcesso, setShowOnlyProfileProcesso] = useState(true);
 const [isDatabaseVolatile, setIsDatabaseVolatile] = useState(false);
 const [isWikiDyslexiaFont, setIsWikiDyslexiaFont] = useState(false);
 const [popolamentoTab, setPopolamentoTab] = useState<'copilot' | 'csv' | 'security'>('copilot');
 const [expandedMapSections, setExpandedMapSections] = useState<Record<string, boolean>>({
  infanzia: order === 'infanzia',
  primaria: order === 'primaria',
  secondaria: order === 'secondaria'
 });
 const [isCopilotChatOpen, setIsCopilotChatOpen] = useState(false);
 const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
 const [showSaveModal, setShowSaveModal] = useState(false);
 const [showMottoModal, setShowMottoModal] = useState(false);
 const [showOnboardingModal, setShowOnboardingModal] = useState(false);
 const [showWikiReaderModal, setShowWikiReaderModal] = useState(false);
 const [selectedUda, setSelectedUda] = useState<UdaModel | null>(null);
 const [generatedDocTitle, setGeneratedDocTitle] = useState<string | null>(null);
 const [generatedDocText, setGeneratedDocText] = useState<string | null>(null);
 const [showTourModal, setShowTourModal] = useState(false);

 useEffect(() => {
  const openOnboarding = () => setShowOnboardingModal(true);
  window.addEventListener(OPEN_ONBOARDING_PROFILE_EVENT, openOnboarding);
  return () => window.removeEventListener(OPEN_ONBOARDING_PROFILE_EVENT, openOnboarding);
 }, []);

 return {
  showOnlyProfileCurriculum,
  setShowOnlyProfileCurriculum,
  showOnlyProfileProcesso,
  setShowOnlyProfileProcesso,
  isDatabaseVolatile,
  setIsDatabaseVolatile,
  isWikiDyslexiaFont,
  setIsWikiDyslexiaFont,
  popolamentoTab,
  setPopolamentoTab,
  expandedMapSections,
  setExpandedMapSections,
  isCopilotChatOpen,
  setIsCopilotChatOpen,
  roleDropdownOpen,
  setRoleDropdownOpen,
  showSaveModal,
  setShowSaveModal,
  showMottoModal,
  setShowMottoModal,
  showOnboardingModal,
  setShowOnboardingModal,
  showWikiReaderModal,
  setShowWikiReaderModal,
  selectedUda,
  setSelectedUda,
  generatedDocTitle,
  setGeneratedDocTitle,
  generatedDocText,
  setGeneratedDocText,
  showTourModal,
  setShowTourModal
 };
}