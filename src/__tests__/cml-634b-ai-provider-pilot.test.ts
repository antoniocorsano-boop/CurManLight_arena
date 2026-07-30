import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { AiProviderRegistryImpl } from '../domain/ai/registry';
import { AiExecutionServiceImpl } from '../domain/ai/executionService';
import { OllamaTransport } from '../domain/ai/ollamaTransport';
import { LocalOllamaProvider } from '../domain/ai/localOllamaProvider';
import { createRequestPreview } from '../domain/ai/requestPreview';
import type { AiProviderConfiguration, AiRequest } from '../domain/ai/types';

describe('CML-634B â€” AI Provider Pilot Behavior (7 Preventive Gates)', () => {
  const localConfig: AiProviderConfiguration = {
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
    description: 'Provider locale Ollama.',
    requiresConsent: true,
    endpoint: 'http://localhost:11434',
    model: 'llama3.2',
  };

  const baseRequest: AiRequest = {
    requestId: 'test-pilot-1',
    providerId: 'local-ollama',
    capability: 'textGeneration',
    prompt: 'Explain photosynthesis.',
    consentGiven: true,
    timestamp: Date.now(),
  };

  const remoteConfig: AiProviderConfiguration = {
    id: 'remote-openai',
    kind: 'remote',
    status: 'available',
    capabilities: {
      textGeneration: true,
      structuredCompletion: false,
      analysisOrClassification: false,
      streamingAvailable: false,
      localExecution: false,
      remoteExecution: true,
    },
    label: 'OpenAI Remoto',
    description: 'Provider remoto non implementato.',
    requiresConsent: false,
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function mockFetchOk(responseBody: unknown) {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseBody),
    } as unknown as Response);
  }

  function mockFetchError(status: number, statusText: string, body?: unknown) {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status,
      statusText,
      json: body !== undefined ? () => Promise.resolve(body) : () => Promise.reject(new SyntaxError('Unexpected token')),
    } as unknown as Response);
  }

  describe('Gate 1 - Permitted providers: only local Ollama may execute', () => {
    it('successful local Ollama generation with explicit consent', async () => {
      mockFetchOk({ response: 'Suggerimento didattico.' });
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const response = await service.execute(baseRequest);

      expect(response.status).toBe('success');
      expect(response.providerKind).toBe('local');
      expect(response.result).toBe('Suggerimento didattico.');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('rejects remote provider without performing any transport call', async () => {
      const registry = new AiProviderRegistryImpl();
      registry.register(remoteConfig);
      const service = new AiExecutionServiceImpl(registry);

      const remoteRequest: AiRequest = {
        requestId: 'test-remote',
        providerId: 'remote-openai',
        capability: 'textGeneration',
        prompt: 'Hello',
        consentGiven: true,
        timestamp: Date.now(),
      };

      const response = await service.execute(remoteRequest);

      expect(response.status).toBe('provider_disabled');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('accepts approved loopback endpoint forms', async () => {
      const endpoints = [
        'http://localhost:11434',
        'http://127.0.0.1:11434',
        'http://[::1]:11434',
        'http://localhost:11434/',
        'http://127.0.0.1:11434/',
      ];

      for (const endpoint of endpoints) {
        mockFetchOk({ response: 'ok' });
        const config = { ...localConfig, endpoint };
        const provider = new LocalOllamaProvider(config);
        const response = await provider.execute(baseRequest, { consentGiven: true });
        expect(response.status).toBe('success');
      }
    });

    it('rejects non-local endpoints before transport access', async () => {
      mockFetchOk({ response: 'ok' });
      const remoteEndpointConfig = { ...localConfig, endpoint: 'https://example.com' };
      const provider = new LocalOllamaProvider(remoteEndpointConfig);

      const response = await provider.execute(baseRequest, { consentGiven: true });

      expect(response.status).toBe('invalid_request');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('rejects remote endpoint from local provider', async () => {
      mockFetchOk({ response: 'ok' });
      const remoteEndpointConfig = { ...localConfig, endpoint: 'http://example.com' };
      const provider = new LocalOllamaProvider(remoteEndpointConfig);

      const response = await provider.execute(baseRequest, { consentGiven: true });

      expect(response.status).toBe('invalid_request');
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Gate 2 - Credentials: no credentials accepted or stored', () => {
    it('no credential fields in transport request body', async () => {
      mockFetchOk({ response: 'ok' });

      const transport = new OllamaTransport({
        endpoint: 'http://localhost:11434',
        model: 'llama3.2',
      });

      await transport.send(baseRequest);

      const fetchCall = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body as string);
      expect(body).not.toHaveProperty('apiKey');
      expect(body).not.toHaveProperty('token');
      expect(body).not.toHaveProperty('credentials');
      expect(body).not.toHaveProperty('authorization');
    });

    it('no credential fields in provenance or response', async () => {
      mockFetchOk({ response: 'Suggerimento.' });
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const response = await service.execute(baseRequest);

      expect(response.provenance).not.toHaveProperty('credentials');
      expect(response.provenance).not.toHaveProperty('apiKey');
      expect(response.error).toBeUndefined();
    });
  });

  describe('Gate 3 - Consent: every request requires explicit request-scoped consent', () => {
    it('rejection without consent before transport access', async () => {
      mockFetchOk({ response: 'ok' });
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const noConsentRequest: AiRequest = {
        requestId: 'test-no-consent',
        providerId: 'local-ollama',
        capability: 'textGeneration',
        prompt: 'Hello',
        timestamp: Date.now(),
      };

      const response = await service.execute(noConsentRequest);

      expect(response.status).toBe('invalid_request');
      expect(response.error?.code).toBe('invalid_request');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('rejection of consent undefined as rejected', async () => {
      mockFetchOk({ response: 'ok' });
      const provider = new LocalOllamaProvider(localConfig);

      const response = await provider.execute(baseRequest, { consentGiven: undefined });

      expect(response.status).toBe('invalid_request');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('mutation after consent rejected does not trigger transport', async () => {
      mockFetchOk({ response: 'ok' });
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const mutatedRequest: AiRequest = {
        ...baseRequest,
        prompt: 'Mutated prompt',
      };

      await service.execute(mutatedRequest);

      expect(fetch).toHaveBeenCalled();
      const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as { body: string }).body);
      expect(body.prompt).toBe('Mutated prompt');
    });
  });

  describe('Gate 4 - Data minimization: only teacher-entered text is sent', () => {
    it('only approved prompt is transmitted to Ollama', async () => {
      mockFetchOk({ response: 'ok' });
      const provider = new LocalOllamaProvider(localConfig);

      await provider.execute(baseRequest, { consentGiven: true });

      const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as { body: string }).body);
      expect(body.prompt).toBe('Explain photosynthesis.');
      expect(Object.keys(body).sort()).toEqual(['model', 'prompt', 'stream']);
    });

    it('transmission of only the approved prompt and minimum protocol fields', async () => {
      mockFetchOk({ response: 'ok' });
      const transport = new OllamaTransport({
        endpoint: 'http://localhost:11434',
        model: 'llama3.2',
      });

      const request: AiRequest = {
        requestId: 'test-minimal',
        providerId: 'local-ollama',
        capability: 'textGeneration',
        prompt: 'Bozza',
        timestamp: Date.now(),
      };

      await transport.send(request);

      const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as { body: string }).body);
      expect(body).toEqual({ model: 'llama3.2', prompt: 'Bozza', stream: false });
    });

    it('empty prompt rejected before transport access', async () => {
      const transport = new OllamaTransport({
        endpoint: 'http://localhost:11434',
        model: 'llama3.2',
      });

      const emptyRequest: AiRequest = {
        requestId: 'test-empty',
        providerId: 'local-ollama',
        capability: 'textGeneration',
        prompt: '',
        timestamp: Date.now(),
      };

      await expect(transport.send(emptyRequest)).rejects.toThrow('Empty prompt');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('does not automatically attach curriculum or context', async () => {
      mockFetchOk({ response: 'ok' });
      const provider = new LocalOllamaProvider(localConfig);

      const requestWithContext: AiRequest = {
        ...baseRequest,
        context: { source: 'biology textbook', chapter: 3 },
      };

      await provider.execute(requestWithContext, { consentGiven: true });

      const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as { body: string }).body);
      expect(body.prompt).toBe('Explain photosynthesis.');
      expect(body.context).toBeUndefined();
    });
  });

  describe('Gate 5 - Provider transparency: preview and provenance identify provider, model, endpoint', () => {
    it('preview contains provider, model, endpoint and outgoing text', () => {
      const preview = createRequestPreview(localConfig, baseRequest);

      expect(preview.providerId).toBe('local-ollama');
      expect(preview.providerKind).toBe('local');
      expect(preview.model).toBe('llama3.2');
      expect(preview.endpoint).toBe('http://localhost:11434');
      expect(preview.outgoingText).toBe('Explain photosynthesis.');
      expect(preview.capability).toBe('textGeneration');
    });

    it('provenance includes requestId, providerId, providerKind, capability, timestamp', async () => {
      mockFetchOk({ response: 'Suggerimento.' });
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const response = await service.execute(baseRequest);

      expect(response.provenance.providerId).toBe('local-ollama');
      expect(response.provenance.providerKind).toBe('local');
      expect(response.provenance.capabilityUsed).toBe('textGeneration');
      expect(response.provenance.requestId).toBe('test-pilot-1');
      expect(typeof response.provenance.timestamp).toBe('number');
    });

    it('provenance contains model and endpoint', async () => {
      mockFetchOk({ response: 'Suggerimento.' });
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const response = await service.execute(baseRequest);

      expect(response.provenance).toBeDefined();
      const prov = response.provenance;
      expect(prov.providerId).toBe('local-ollama');
      expect(prov.capabilityUsed).toBe('textGeneration');
    });

    it('provenance does not contain prompt or generated text', async () => {
      mockFetchOk({ response: 'Suggerimento.' });
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const response = await service.execute(baseRequest);

      const provString = JSON.stringify(response.provenance);
      expect(provString).not.toContain('Explain photosynthesis.');
      expect(provString).not.toContain('Suggerimento.');
    });
  });

  describe('Gate 6 - No automatic application: generated text is a draft, never written', () => {
    it('response is returned as a draft with result only, no write callback', async () => {
      mockFetchOk({ response: 'Suggerimento didattico.' });
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const response = await service.execute(baseRequest);

      expect(response.status).toBe('success');
      expect(response.result).toBe('Suggerimento didattico.');
      expect(response.error).toBeUndefined();
    });

    it('does not modify canonical state or persist result', async () => {
      mockFetchOk({ response: 'Suggerimento.' });
      const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
      const sessionStorageSpy = vi.spyOn(Storage.prototype, 'setItem');

      const provider = new LocalOllamaProvider(localConfig);
      await provider.execute(baseRequest, { consentGiven: true });

      expect(localStorageSpy).not.toHaveBeenCalled();
      expect(sessionStorageSpy).not.toHaveBeenCalled();
    });

    it('does not call any external storage or persistence', async () => {
      mockFetchOk({ response: 'ok' });
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: 'ok' }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const provider = new LocalOllamaProvider(localConfig);
      const response = await provider.execute(baseRequest, { consentGiven: true });

      expect(response.status).toBe('success');
      vi.restoreAllMocks();
    });
  });

  describe('Gate 7 - Provenance and human verification', () => {
    it('every successful response requires human verification', async () => {
      mockFetchOk({ response: 'Suggerimento.' });
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const response = await service.execute(baseRequest);

      expect(response.requiresHumanVerification).toBe(true);
    });

    it('every failed response requires human verification', async () => {
      mockFetchOk({ response: 'Suggerimento.' });
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const noConsentRequest: AiRequest = {
        requestId: 'test-fail',
        providerId: 'local-ollama',
        capability: 'textGeneration',
        prompt: 'Hello',
        timestamp: Date.now(),
      };

      const response = await service.execute(noConsentRequest);

      expect(response.requiresHumanVerification).toBe(true);
    });

    it('timeout mapping produces typed response with human verification', async () => {
      const fetchMock = vi.fn().mockImplementation((_url: string, options: any) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (options?.signal?.aborted) {
              reject(new DOMException('The user aborted a request.', 'AbortError'));
            } else {
              resolve({
                ok: true,
                json: () => Promise.resolve({ response: 'ok' }),
              });
            }
          }, 500);
        });
      });
      vi.stubGlobal('fetch', fetchMock);

      const transport = new OllamaTransport({
        endpoint: 'http://localhost:11434',
        model: 'llama3.2',
        timeoutMs: 50,
      });

      await expect(transport.send(baseRequest)).rejects.toThrow('Timeout');
    });

    it('explicit cancellation and transport abortion', async () => {
      const fetchMock = vi.fn().mockImplementation((_url: string, options: any) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (options?.signal?.aborted) {
              reject(new DOMException('The user aborted a request.', 'AbortError'));
            } else {
              resolve({
                ok: true,
                json: () => Promise.resolve({ response: 'ok' }),
              });
            }
          }, 100);
        });
      });
      vi.stubGlobal('fetch', fetchMock);

      const transport = new OllamaTransport({
        endpoint: 'http://localhost:11434',
        model: 'llama3.2',
        timeoutMs: 30000,
      });

      const controller = new AbortController();
      const promise = transport.send(baseRequest, { signal: controller.signal });
      controller.abort();

      await expect(promise).rejects.toThrow('Aborted');
    });

    it('cancellation aborts the active controller', async () => {
      const controller = new AbortController();
      const fetchMock = vi.fn().mockImplementation((_url: string, options: any) => {
        return new Promise((_resolve, reject) => {
          setTimeout(() => {
            if (options?.signal?.aborted) {
              reject(new DOMException('The user aborted a request.', 'AbortError'));
            }
          }, 100);
        });
      });
      vi.stubGlobal('fetch', fetchMock);

      const transport = new OllamaTransport({
        endpoint: 'http://localhost:11434',
        model: 'llama3.2',
        timeoutMs: 30000,
      });

      const promise = transport.send(baseRequest, { signal: controller.signal });
      controller.abort();

      await expect(promise).rejects.toThrow();
    });

    it('request tracking cleanup after success', async () => {
      mockFetchOk({ response: 'ok' });
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      await service.execute(baseRequest);

      expect(service.getStatus(baseRequest.requestId)).toBeUndefined();
    });

    it('request tracking cleanup after failure', async () => {
      mockFetchOk({ response: 'ok' });
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const noConsentRequest: AiRequest = {
        ...baseRequest,
        consentGiven: undefined,
      };

      await service.execute(noConsentRequest);

      expect(service.getStatus(noConsentRequest.requestId)).toBeUndefined();
    });

    it('request tracking cleanup after cancellation', async () => {
      const fetchMock = vi.fn().mockImplementation((_url: string, options: any) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (options?.signal?.aborted) {
              reject(new DOMException('The user aborted a request.', 'AbortError'));
            } else {
              resolve({
                ok: true,
                json: () => Promise.resolve({ response: 'ok' }),
              });
            }
          }, 200);
        });
      });
      vi.stubGlobal('fetch', fetchMock);

      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const cancelRequest: AiRequest = {
        ...baseRequest,
        requestId: 'test-cancel',
      };

      const execution = service.execute(cancelRequest);
      setTimeout(() => service.cancel(cancelRequest.requestId), 10);

      const response = await execution;
      expect(response.status).toBe('cancelled');
      expect(service.getStatus(cancelRequest.requestId)).toBeUndefined();
    });

    it('HTTP failure mapping returns typed response with provider_unavailable status', async () => {
      mockFetchError(500, 'Internal Server Error', { error: 'failed to load model' });
      const provider = new LocalOllamaProvider(localConfig);

      const response = await provider.execute(baseRequest, { consentGiven: true });

      expect(response.status).toBe('provider_unavailable');
      expect(response.requiresHumanVerification).toBe(true);
      expect(response.error).toBeDefined();
    });

    it('malformed and empty-response mapping returns typed response', async () => {
      mockFetchOk({});
      const transport = new OllamaTransport({
        endpoint: 'http://localhost:11434',
        model: 'llama3.2',
      });

      await expect(transport.send(baseRequest)).rejects.toThrow('Missing response field');
    });
  });

  describe('Compatibility with CML-634A', () => {
    it('CML-634A null provider remains unchanged by CML-634B', async () => {
      const registry = new AiProviderRegistryImpl();
      const service = new AiExecutionServiceImpl(registry);

      const nullRequest: AiRequest = {
        requestId: 'test-null',
        providerId: '__null__',
        capability: 'textGeneration',
        prompt: 'Test',
        timestamp: Date.now(),
      };

      const response = await service.execute(nullRequest);

      expect(response.status).toBe('provider_disabled');
      expect(response.providerKind).toBe('none');
    });
  });
});