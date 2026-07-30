import { describe, expect, it, vi, afterEach } from 'vitest';
import { AiExecutionServiceImpl } from './executionService';
import { AiProviderRegistryImpl } from './registry';
import type { AiProviderConfiguration, AiRequest } from './types';

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

describe('AiExecutionServiceImpl', () => {
  const localProvider: AiProviderConfiguration = {
    id: 'local-ollama',
    kind: 'local',
    status: 'available',
    capabilities: {
      textGeneration: true,
      structuredCompletion: false,
      analysisOrClassification: false,
      streamingAvailable: false,
      localExecution: true,
      remoteExecution: false,
    },
    label: 'Ollama Locale',
    description: 'Provider locale per Ollama.',
    requiresConsent: true,
    endpoint: 'http://localhost:11434',
    model: 'llama3.2',
  };

  const baseRequest: AiRequest = {
    requestId: 'test-1',
    providerId: 'local-ollama',
    capability: 'textGeneration',
    prompt: 'Hello',
    consentGiven: true,
    timestamp: Date.now(),
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('cancel', () => {
    it('returns true and produces cancelled status when aborting a pending request', async () => {
      vi.useFakeTimers();
      const fetchMock = createAbortableFetchMock(100);
      vi.stubGlobal('fetch', fetchMock);

      const registry = new AiProviderRegistryImpl();
      registry.register(localProvider);
      const service = new AiExecutionServiceImpl(registry);

      const executePromise = service.execute(baseRequest);

      const cancelResult = service.cancel('test-1');
      expect(cancelResult).toBe(true);

      await vi.advanceTimersByTimeAsync(100);

      const response = await executePromise;
      expect(response.status).toBe('cancelled');
      expect(response.provenance.warning).toContain('Errore del provider locale');

      vi.useRealTimers();
    });

    it('returns false for an unknown request id', () => {
      const registry = new AiProviderRegistryImpl();
      const service = new AiExecutionServiceImpl(registry);

      const result = service.cancel('nonexistent');
      expect(result).toBe(false);
    });

    it('returns false after a request completes naturally', async () => {
      vi.useFakeTimers();
      const fetchMock = createAbortableFetchMock(100);
      vi.stubGlobal('fetch', fetchMock);

      const registry = new AiProviderRegistryImpl();
      registry.register(localProvider);
      const service = new AiExecutionServiceImpl(registry);

      const executePromise = service.execute(baseRequest);
      await vi.advanceTimersByTimeAsync(100);

      const response = await executePromise;
      expect(response.status).toBe('success');

      const cancelResult = service.cancel('test-1');
      expect(cancelResult).toBe(false);

      vi.useRealTimers();
    });

    it('returns false after a cancelled request completes', async () => {
      vi.useFakeTimers();
      const fetchMock = createAbortableFetchMock(100);
      vi.stubGlobal('fetch', fetchMock);

      const registry = new AiProviderRegistryImpl();
      registry.register(localProvider);
      const service = new AiExecutionServiceImpl(registry);

      const executePromise = service.execute(baseRequest);

      service.cancel('test-1');
      await vi.advanceTimersByTimeAsync(100);

      await executePromise;

      const cancelResult = service.cancel('test-1');
      expect(cancelResult).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('user abort vs timeout distinction', () => {
    it('returns cancelled on user-initiated abort', async () => {
      vi.useFakeTimers();
      const fetchMock = createAbortableFetchMock(50000);
      vi.stubGlobal('fetch', fetchMock);

      const registry = new AiProviderRegistryImpl();
      registry.register(localProvider);
      const service = new AiExecutionServiceImpl(registry);

      const executePromise = service.execute(baseRequest);

      service.cancel('test-1');
      await vi.advanceTimersByTimeAsync(100);

      const response = await executePromise;
      expect(response.status).toBe('cancelled');
      expect(response.error?.message).toBe('Aborted');

      vi.useRealTimers();
    });

    it('returns provider_unavailable on transport timeout', async () => {
      vi.useFakeTimers();
      const fetchMock = createAbortableFetchMock(50000);
      vi.stubGlobal('fetch', fetchMock);

      const registry = new AiProviderRegistryImpl();
      registry.register(localProvider);
      const service = new AiExecutionServiceImpl(registry);

      const executePromise = service.execute(baseRequest);

      await vi.advanceTimersByTimeAsync(30000);

      const response = await executePromise;
      expect(response.status).toBe('provider_unavailable');
      expect(response.error?.message).toBe('Timeout');

      vi.useRealTimers();
    });
  });
});
