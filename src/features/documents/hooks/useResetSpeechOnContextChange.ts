import { useEffect } from 'react';

interface UseResetSpeechOnContextChangeArgs {
 selectedBrainDoc: string;
 activeTab: string;
 setIsSpeaking: (value: boolean) => void;
}

export function useResetSpeechOnContextChange({
 selectedBrainDoc,
 activeTab,
 setIsSpeaking
}: UseResetSpeechOnContextChangeArgs) {
 useEffect(() => {
  window.speechSynthesis.cancel();
  setIsSpeaking(false);
 }, [activeTab, selectedBrainDoc, setIsSpeaking]);
}
