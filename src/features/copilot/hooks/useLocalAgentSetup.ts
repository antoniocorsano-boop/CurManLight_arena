import { useRef, useState } from 'react';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';

type LocalAgentStatus = 'not_installed' | 'downloading' | 'installed';
type LocalAgentType = 'webgpu' | 'ollama' | 'none';
type LocalAgentSize = 'light' | 'full' | 'none';
type OllamaStatus = 'idle' | 'testing' | 'connected' | 'error';
type DetectedDeviceType = 'desktop' | 'mobile';

interface UseLocalAgentSetupArgs {
  showToast: (msg: string, success?: boolean) => void;
}

export const useLocalAgentSetup = ({ showToast }: UseLocalAgentSetupArgs) => {
  const [localAgentStatus, setLocalAgentStatus] = useState<LocalAgentStatus>(() => {
    return safeLocalStorageGetItem('curman_localAgentStatus', 'not_installed') as LocalAgentStatus;
  });
  const [localAgentType, setLocalAgentType] = useState<LocalAgentType>('webgpu');
  const [ollamaServerUrl, setOllamaServerUrl] = useState(() => safeLocalStorageGetItem('curman_ollamaServerUrl', 'http://localhost:11434'));
  const [ollamaModelName, setOllamaModelName] = useState(() => safeLocalStorageGetItem('curman_ollamaModelName', 'llama3.2'));
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('idle');
  const [localAgentProgress, setLocalAgentProgress] = useState(0);
  const [localAgentSize, setLocalAgentSize] = useState<LocalAgentSize>(() => {
    return safeLocalStorageGetItem('curman_localAgentSize', 'none') as LocalAgentSize;
  });
  const [showAgentSetupModal, setShowAgentSetupModal] = useState(() => {
    if (typeof navigator !== 'undefined' && navigator.webdriver) {
      return false;
    }
    return safeLocalStorageGetItem('curman_localAgentStatus', '') === '';
  });
  const [activeHelpModel, setActiveHelpModel] = useState<string | null>(null);
  const agentIntervalRefs = useRef<number[]>([]);
  const [detectedDeviceType] = useState<DetectedDeviceType>(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes('mobi') || ua.includes('tablet') || ua.includes('ipad') || ua.includes('android')) {
        return 'mobile';
      }
    }
    return 'desktop';
  });

  const handleTestOllamaConnection = async () => {
    setOllamaStatus('testing');
    try {
      const response = await fetch(`${ollamaServerUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setOllamaStatus('connected');
        setLocalAgentStatus('installed');
        setLocalAgentSize('full');
        safeLocalStorageSetItem('curman_localAgentStatus', 'installed');
        safeLocalStorageSetItem('curman_localAgentSize', 'full');
        safeLocalStorageSetItem('curman_ollamaServerUrl', ollamaServerUrl);
        safeLocalStorageSetItem('curman_ollamaModelName', ollamaModelName);
        showToast("Connessione stabilita con il Server Ollama d'Istituto!");
      } else {
        setOllamaStatus('error');
        showToast("Il Server d'Istituto è online, ma ha risposto con errore.");
      }
    } catch (e) {
      setOllamaStatus('error');
      showToast("Errore di connessione. Verifica CORS o server offline.");
    }
  };

  return {
    localAgentStatus,
    setLocalAgentStatus,
    localAgentType,
    setLocalAgentType,
    ollamaServerUrl,
    setOllamaServerUrl,
    ollamaModelName,
    setOllamaModelName,
    ollamaStatus,
    setOllamaStatus,
    localAgentProgress,
    setLocalAgentProgress,
    localAgentSize,
    setLocalAgentSize,
    showAgentSetupModal,
    setShowAgentSetupModal,
    activeHelpModel,
    setActiveHelpModel,
    agentIntervalRefs,
    detectedDeviceType,
    handleTestOllamaConnection
  };
};
