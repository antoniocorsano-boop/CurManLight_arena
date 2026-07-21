import { useState } from 'react';
import type { SchoolOrder, UdaModel } from '../../../types/curriculum';

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
