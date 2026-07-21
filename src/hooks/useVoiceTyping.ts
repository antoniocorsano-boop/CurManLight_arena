import { useState, useCallback, useRef } from 'react';

type SpeechRecognitionResultLike = {
  readonly 0: { readonly transcript: string };
};

type SpeechRecognitionEventLike = {
  readonly results: {
    readonly length: number;
    readonly [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionErrorEventLike = {
  readonly error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export interface VoiceTypingState {
  start: () => void;
  stop: () => void;
  isActive: boolean;
  transcript: string;
  error: string | null;
}

const getSpeechRecognition = (): SpeechRecognitionConstructor | undefined => {
  const speechWindow = window as SpeechRecognitionWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
};

export function useVoiceTyping(): VoiceTypingState {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError('Speech recognition non supportato');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      setTranscript(result[0].transcript);
    };

    recognition.onend = () => {
      setIsActive(false);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setIsActive(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsActive(true);
    setError(null);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsActive(false);
  }, []);

  return { start, stop, isActive, transcript, error };
}
