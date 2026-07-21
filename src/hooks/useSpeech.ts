import { useState, useCallback, useRef } from 'react';

interface SpeechOptions {
  rate?: number;
  pitch?: number;
  voice?: SpeechSynthesisVoice;
}

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, blockId: string, options?: SpeechOptions) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (options?.voice) utterance.voice = options.voice;
    if (options?.rate) utterance.rate = options.rate;
    if (options?.pitch) utterance.pitch = options.pitch;

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentBlock(null);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setCurrentBlock(blockId);
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentBlock(null);
    utteranceRef.current = null;
  }, []);

  return { speak, cancel, isSpeaking, currentBlock };
}
