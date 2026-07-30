import { create } from 'zustand';
import type { RequestPreview } from '../../domain/ai/requestPreview';
import type { AiResponse } from '../../domain/ai/types';

export type ConfigurationStatus =
  | 'not_configured'
  | 'ready'
  | 'unavailable'
  | 'disabled';

export type ExecutionStatus =
  | 'idle'
  | 'preview'
  | 'running'
  | 'success'
  | 'cancelled'
  | 'error';

export interface LocalAiSessionState {
  configuration: {
    providerId: string;
    kind: 'local';
    enabled: boolean;
    endpoint: string;
    model: string;
  };
  configurationStatus: ConfigurationStatus;
  draftText: string;
  preview: RequestPreview | null;
  consentGiven: boolean;
  executionStatus: ExecutionStatus;
  activeRequestId: string | null;
  response: AiResponse<string> | null;
  errorMessage: string | null;
}

interface LocalAiSessionActions {
  setEndpoint: (endpoint: string) => void;
  setModel: (model: string) => void;
  enableConfiguration: () => void;
  disableConfiguration: () => void;
  setConfigurationUnavailable: () => void;
  setDraftText: (text: string) => void;
  setPreview: (preview: RequestPreview | null) => void;
  setConsentGiven: (given: boolean) => void;
  invalidateConsent: () => void;
  setExecutionStatus: (status: ExecutionStatus) => void;
  setActiveRequestId: (id: string | null) => void;
  setResponse: (response: AiResponse<string> | null) => void;
  setErrorMessage: (message: string | null) => void;
  resetConsentAfterExecution: () => void;
  resetSession: () => void;
  enterPreview: () => void;
  exitPreview: () => void;
}

const initialState: LocalAiSessionState = {
  configuration: {
    providerId: 'local-ollama',
    kind: 'local',
    enabled: false,
    endpoint: 'http://localhost:11434',
    model: '',
  },
  configurationStatus: 'not_configured',
  draftText: '',
  preview: null,
  consentGiven: false,
  executionStatus: 'idle',
  activeRequestId: null,
  response: null,
  errorMessage: null,
};

export const useLocalAiSessionStore = create<LocalAiSessionState & LocalAiSessionActions>()(
  (set) => ({
    ...initialState,

    setEndpoint: (endpoint) =>
      set((state) => ({
        configuration: { ...state.configuration, endpoint },
      })),

    setModel: (model) =>
      set((state) => ({
        configuration: { ...state.configuration, model },
      })),

    enableConfiguration: () =>
      set((state) => ({
        configuration: { ...state.configuration, enabled: true },
        configurationStatus: state.configuration.model.trim()
          ? 'ready'
          : 'not_configured',
      })),

    disableConfiguration: () =>
      set({
        configuration: { ...initialState.configuration, enabled: false },
        configurationStatus: 'disabled',
        draftText: '',
        preview: null,
        consentGiven: false,
        executionStatus: 'idle',
        activeRequestId: null,
        response: null,
        errorMessage: null,
      }),

    setConfigurationUnavailable: () =>
      set({ configurationStatus: 'unavailable' }),

    setDraftText: (text) =>
      set({ draftText: text }),

    setPreview: (preview) =>
      set({ preview }),

    setConsentGiven: (given) =>
      set({ consentGiven: given }),

    invalidateConsent: () =>
      set({ consentGiven: false }),

    setExecutionStatus: (status) =>
      set({ executionStatus: status }),

    setActiveRequestId: (id) =>
      set({ activeRequestId: id }),

    setResponse: (response) =>
      set({ response }),

    setErrorMessage: (message) =>
      set({ errorMessage: message }),

    resetConsentAfterExecution: () =>
      set({
        consentGiven: false,
        activeRequestId: null,
        executionStatus: 'idle',
      }),

    resetSession: () =>
      set({ ...initialState }),

    enterPreview: () =>
      set({ executionStatus: 'preview' }),

    exitPreview: () =>
      set({ executionStatus: 'idle', preview: null, consentGiven: false }),
  }),
);
