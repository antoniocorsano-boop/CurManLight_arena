import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useLocalAiSessionStore } from '../features/ai/localAiSessionStore';
import { LocalAiExecutionService } from '../features/ai/localAiExecutionService';

function createAbortableFetchMock(resolveDelay: number) {
  return vi.fn().mockImplementation((_url: string, options: any) => {
    return new Promise((resolve, reject) => {
      if (options?.signal?.aborted) {
        reject(new DOMException('The user aborted a request.', 'AbortError'));
        return;
      }
      const onAbort = () => {
        reject(new DOMException('The user aborted a request.', 'AbortError'));
      };
      options?.signal?.addEventListener('abort', onAbort, { once: true });
      setTimeout(() => {
        options?.signal?.removeEventListener('abort', onAbort);
        resolve({ ok: true, json: () => Promise.resolve({ response: 'generated text' }) });
      }, resolveDelay);
    });
  });
}

describe('useLocalAiSessionStore', () => {
  beforeEach(() => {
    useLocalAiSessionStore.setState(useLocalAiSessionStore.getInitialState());
  });

  describe('initial state', () => {
    it('starts with default configuration disabled and idle execution', () => {
      const state = useLocalAiSessionStore.getState();
      expect(state.configuration.enabled).toBe(false);
      expect(state.configuration.endpoint).toBe('http://localhost:11434');
      expect(state.configuration.model).toBe('');
      expect(state.configurationStatus).toBe('not_configured');
      expect(state.draftText).toBe('');
      expect(state.preview).toBeNull();
      expect(state.consentGiven).toBe(false);
      expect(state.executionStatus).toBe('idle');
      expect(state.activeRequestId).toBeNull();
      expect(state.response).toBeNull();
      expect(state.errorMessage).toBeNull();
    });
  });

  describe('configuration lifecycle', () => {
    it('allows setting endpoint and model then enabling', () => {
      const store = useLocalAiSessionStore.getState();
      store.setEndpoint('http://10.0.0.1:11434');
      store.setModel('mistral');

      let s = useLocalAiSessionStore.getState();
      expect(s.configuration.endpoint).toBe('http://10.0.0.1:11434');
      expect(s.configuration.model).toBe('mistral');

      store.enableConfiguration();
      s = useLocalAiSessionStore.getState();
      expect(s.configuration.enabled).toBe(true);
      expect(s.configurationStatus).toBe('ready');
    });

    it('stays not_configured after enable when model is empty', () => {
      const store = useLocalAiSessionStore.getState();
      store.setEndpoint('http://localhost:11434');
      store.enableConfiguration();

      const s = useLocalAiSessionStore.getState();
      expect(s.configurationStatus).toBe('not_configured');
    });

    it('disable resets all execution state and marks disabled', () => {
      const store = useLocalAiSessionStore.getState();
      store.setModel('llama3.2');
      store.enableConfiguration();

      store.setDraftText('some text');
      store.setConsentGiven(true);
      store.setExecutionStatus('running');
      store.setActiveRequestId('req-1');

      store.disableConfiguration();

      const s = useLocalAiSessionStore.getState();
      expect(s.configurationStatus).toBe('disabled');
      expect(s.configuration.enabled).toBe(false);
      expect(s.draftText).toBe('');
      expect(s.preview).toBeNull();
      expect(s.consentGiven).toBe(false);
      expect(s.executionStatus).toBe('idle');
      expect(s.activeRequestId).toBeNull();
      expect(s.response).toBeNull();
      expect(s.errorMessage).toBeNull();
    });

    it('setConfigurationUnavailable transitions to unavailable', () => {
      const store = useLocalAiSessionStore.getState();
      store.setConfigurationUnavailable();
      expect(useLocalAiSessionStore.getState().configurationStatus).toBe('unavailable');
    });
  });

  describe('draft, preview, consent flow', () => {
    it('setDraftText updates draft text', () => {
      useLocalAiSessionStore.getState().setDraftText('Hello AI');
      expect(useLocalAiSessionStore.getState().draftText).toBe('Hello AI');
    });

    it('setPreview stores request preview and updates execution status', () => {
      const store = useLocalAiSessionStore.getState();
      store.setDraftText('test prompt');
      store.enterPreview();

      const mockPreview = {
        providerId: 'local-ollama',
        providerKind: 'local',
        model: 'llama3.2',
        endpoint: 'http://localhost:11434',
        capability: 'textGeneration',
        outgoingText: 'test prompt',
        contextIncluded: false,
      };
      store.setPreview(mockPreview);

      const s = useLocalAiSessionStore.getState();
      expect(s.executionStatus).toBe('preview');
      expect(s.preview).toEqual(mockPreview);
    });

    it('setConsentGiven records consent', () => {
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      expect(useLocalAiSessionStore.getState().consentGiven).toBe(true);
    });

    it('invalidateConsent resets consent', () => {
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      store.invalidateConsent();
      expect(useLocalAiSessionStore.getState().consentGiven).toBe(false);
    });

    it('exitPreview clears preview, consent and resets status to idle', () => {
      const store = useLocalAiSessionStore.getState();
      store.enterPreview();
      store.setPreview({ providerId: 'local-ollama', providerKind: 'local', model: 'm', endpoint: 'http://localhost:11434', capability: 'textGeneration', outgoingText: 'x', contextIncluded: false });
      store.setConsentGiven(true);
      store.exitPreview();

      const s = useLocalAiSessionStore.getState();
      expect(s.executionStatus).toBe('idle');
      expect(s.preview).toBeNull();
      expect(s.consentGiven).toBe(false);
    });
  });

  describe('execution state transitions', () => {
    it('tracks running request id and status', () => {
      const store = useLocalAiSessionStore.getState();
      store.setExecutionStatus('running');
      store.setActiveRequestId('req-abc');

      const s = useLocalAiSessionStore.getState();
      expect(s.executionStatus).toBe('running');
      expect(s.activeRequestId).toBe('req-abc');
    });

    it('stores response on success', () => {
      const response = { requestId: 'req-1', providerId: 'local-ollama', providerKind: 'local' as const, capability: 'textGeneration' as const, status: 'success' as const, result: 'output', provenance: { providerId: 'local-ollama', providerKind: 'local' as const, capabilityUsed: 'textGeneration' as const, requestId: 'req-1', timestamp: Date.now() }, requiresHumanVerification: true };
      const store = useLocalAiSessionStore.getState();
      store.setExecutionStatus('success');
      store.setResponse(response);

      const s = useLocalAiSessionStore.getState();
      expect(s.executionStatus).toBe('success');
      expect(s.response).toEqual(response);
    });

    it('stores error message', () => {
      const store = useLocalAiSessionStore.getState();
      store.setExecutionStatus('error');
      store.setErrorMessage('Connection refused');

      const s = useLocalAiSessionStore.getState();
      expect(s.executionStatus).toBe('error');
      expect(s.errorMessage).toBe('Connection refused');
    });

    it('resetConsentAfterExecution clears consent, request id, and resets to idle', () => {
      const store = useLocalAiSessionStore.getState();
      store.setConsentGiven(true);
      store.setActiveRequestId('req-1');
      store.setExecutionStatus('success');
      store.resetConsentAfterExecution();

      const s = useLocalAiSessionStore.getState();
      expect(s.consentGiven).toBe(false);
      expect(s.activeRequestId).toBeNull();
      expect(s.executionStatus).toBe('idle');
    });

    it('resetSession restores initial state', () => {
      const store = useLocalAiSessionStore.getState();
      store.setModel('llama3');
      store.enableConfiguration();
      store.setDraftText('text');
      store.setExecutionStatus('success');

      store.resetSession();

      const s = useLocalAiSessionStore.getState();
      expect(s.configuration.enabled).toBe(false);
      expect(s.draftText).toBe('');
      expect(s.executionStatus).toBe('idle');
    });
  });
});

describe('LocalAiExecutionService', () => {
  let service: LocalAiExecutionService;

  beforeEach(() => {
    service = new LocalAiExecutionService();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('configure registers a provider that can execute a request', async () => {
    vi.useFakeTimers();
    const fetchMock = createAbortableFetchMock(50);
    vi.stubGlobal('fetch', fetchMock);

    service.configure('http://localhost:11434', 'llama3.2');
    const executePromise = service.execute('Hello AI');
    await vi.advanceTimersByTimeAsync(50);

    const result = await executePromise;
    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.result).toBe('generated text');
    }

    vi.useRealTimers();
  });

  it('cancel returns false for unknown request id', () => {
    const result = service.cancel('nonexistent');
    expect(result).toBe(false);
  });

  it('cancel returns true and execution returns cancelled status', async () => {
    vi.useFakeTimers();
    const fetchMock = createAbortableFetchMock(500);
    vi.stubGlobal('fetch', fetchMock);

    service.configure('http://localhost:11434', 'llama3.2');

    const executePromise = service.execute('Hello');

    const pendingRequests = service['service']['pendingRequests'];
    expect(pendingRequests.size).toBe(1);

    const firstRequestId = pendingRequests.keys().next().value as string;
    const cancelResult = service.cancel(firstRequestId);
    expect(cancelResult).toBe(true);

    await vi.advanceTimersByTimeAsync(500);

    const result = await executePromise;
    expect(result.status).toBe('cancelled');

    vi.useRealTimers();
  });

  it('returns provider_disabled when executing before configure', async () => {
    const result = await service.execute('test');
    expect(result.status).toBe('provider_disabled');
    expect(result.error?.message).toContain('Nessun fornitore IA configurato');
  });
});
