import { describe, expect, it, vi, afterEach } from 'vitest';
import { AiProviderRegistryImpl } from '../domain/ai/registry';
import { AiExecutionServiceImpl } from '../domain/ai/executionService';
import { createNullProviderResponse, isNullProvider } from '../domain/ai/nullAdapter';
import { LocalOllamaProvider } from '../domain/ai/localOllamaProvider';
import { createRequestPreview } from '../domain/ai/requestPreview';
import { NULL_PROVIDER_ID } from '../domain/ai/types';
import type { AiProviderConfiguration, AiRequest } from '../domain/ai/types';

describe('CML-634B-R2 — Local Ollama Provider Integration', () => {
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
    requestId: 'test-exec',
    providerId: 'local-ollama',
    capability: 'textGeneration',
    prompt: 'Hello',
    timestamp: Date.now(),
    consentGiven: true,
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

  describe('Local provider registration and resolution', () => {
    it('registers the local provider', () => {
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);

      const providers = registry.listProviders();
      expect(providers.length).toBeGreaterThanOrEqual(2);
      expect(providers.some((p) => p.id === 'local-ollama')).toBe(true);
    });

    it('resolves the local provider by id', () => {
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);

      const resolved = registry.resolveProvider(baseRequest);
      expect(resolved.id).toBe('local-ollama');
      expect(resolved.kind).toBe('local');
    });

    it('returns null provider for unknown id', () => {
      const registry = new AiProviderRegistryImpl();

      const unknownRequest: AiRequest = {
        requestId: 'test-unknown',
        providerId: 'unknown',
        capability: 'textGeneration',
        prompt: 'Test',
        timestamp: Date.now(),
      };

      const resolved = registry.resolveProvider(unknownRequest);
      expect(resolved.id).toBe(NULL_PROVIDER_ID);
    });

    it('keeps null provider unchanged', () => {
      const registry = new AiProviderRegistryImpl();
      const providers = registry.listProviders();
      const nullProvider = providers[0];

      expect(nullProvider.id).toBe(NULL_PROVIDER_ID);
      expect(nullProvider.kind).toBe('none');
      expect(isNullProvider(nullProvider)).toBe(true);
    });
  });

  describe('Local provider with execution service', () => {
    it('executes a local request successfully via service', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: 'Generated lesson plan.' }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const response = await service.execute(baseRequest);

      expect(response.status).toBe('success');
      expect(response.providerKind).toBe('local');
      expect(response.providerId).toBe('local-ollama');
      expect(response.requiresHumanVerification).toBe(true);
      expect(response.result).toBe('Generated lesson plan.');
    });

    it('returns invalid_request when consent is missing', async () => {
      const registry = new AiProviderRegistryImpl();
      registry.register(localConfig);
      const service = new AiExecutionServiceImpl(registry);

      const noConsentRequest: AiRequest = {
        ...baseRequest,
        consentGiven: undefined,
      };

      const response = await service.execute(noConsentRequest);

      expect(response.status).toBe('invalid_request');
      expect(response.error?.code).toBe('invalid_request');
    });

    it('returns provider_disabled when provider is not configured', async () => {
      const registry = new AiProviderRegistryImpl();
      const service = new AiExecutionServiceImpl(registry);

      const response = await service.execute(baseRequest);

      expect(response.status).toBe('provider_disabled');
    });

    it('returns provider_unavailable when provider is disabled', async () => {
      const disabledConfig: AiProviderConfiguration = {
        ...localConfig,
        status: 'disabled',
      };

      const registry = new AiProviderRegistryImpl();
      registry.register(disabledConfig);
      const service = new AiExecutionServiceImpl(registry);

      const response = await service.execute(baseRequest);

      expect(response.status).toBe('provider_unavailable');
      expect(response.providerKind).toBe('local');
    });

    it('returns provider_unavailable when capability is not enabled', async () => {
      const limitedConfig: AiProviderConfiguration = {
        ...localConfig,
        capabilities: {
          textGeneration: false,
          structuredCompletion: false,
          analysisOrClassification: false,
          streamingAvailable: false,
          localExecution: false,
          remoteExecution: false,
        },
      };

      const registry = new AiProviderRegistryImpl();
      registry.register(limitedConfig);
      const service = new AiExecutionServiceImpl(registry);

      const response = await service.execute(baseRequest);

      expect(response.status).toBe('provider_unavailable');
    });
  });

  describe('Remote provider remains disabled', () => {
    it('does not execute remote provider', async () => {
      const registry = new AiProviderRegistryImpl();
      registry.register(remoteConfig);
      const service = new AiExecutionServiceImpl(registry);

      const remoteRequest: AiRequest = {
        requestId: 'test-remote',
        providerId: 'remote-openai',
        capability: 'textGeneration',
        prompt: 'Hello',
        timestamp: Date.now(),
        consentGiven: true,
      };

      const response = await service.execute(remoteRequest);

      expect(response.status).toBe('provider_disabled');
    });

    it('ensures no remote fetch is made by the execution service', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const registry = new AiProviderRegistryImpl();
      registry.register(remoteConfig);
      const service = new AiExecutionServiceImpl(registry);

      await service.execute(baseRequest);

      expect(fetchMock).not.toHaveBeenCalled();
      vi.restoreAllMocks();
    });
  });

  describe('Null provider invariance', () => {
    it('returns null provider response for null provider', async () => {
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

    it('createNullProviderResponse produces consistent output', () => {
      const response = createNullProviderResponse(baseRequest);

      expect(response.status).toBe('provider_disabled');
      expect(response.providerId).toBe(NULL_PROVIDER_ID);
      expect(response.providerKind).toBe('none');
      expect(response.requiresHumanVerification).toBe(true);
      expect(response.provenance.warning).toBeDefined();
      expect(response.result).toBeUndefined();
    });
  });

  describe('Security and privacy', () => {
    it('rejects remote endpoint from local provider', async () => {
      const remoteEndpointConfig: AiProviderConfiguration = {
        ...localConfig,
        endpoint: 'http://example.com',
      };

      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const provider = new LocalOllamaProvider(remoteEndpointConfig);
      const response = await provider.execute(baseRequest, { consentGiven: true });

      expect(response.status).toBe('invalid_request');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('does not persist endpoint or model', async () => {
      const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
      const sessionStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
      const indexedDbOpenSpy = typeof indexedDB !== 'undefined' ? vi.spyOn(indexedDB, 'open') : null;

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: 'ok' }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const provider = new LocalOllamaProvider(localConfig);
      const response = await provider.execute(baseRequest, { consentGiven: true });

      expect(response.status).toBe('success');
      expect(localStorageSpy).not.toHaveBeenCalled();
      expect(sessionStorageSpy).not.toHaveBeenCalled();
      if (indexedDbOpenSpy) {
        expect(indexedDbOpenSpy).not.toHaveBeenCalled();
      }
      expect(fetchMock).toHaveBeenCalled();
    });

    it('does not modify prompt automatically', async () => {
      let capturedPrompt = '';
      const fetchMock = vi.fn().mockImplementation((_url: string, options: any) => {
        capturedPrompt = JSON.parse(options.body).prompt;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: 'ok' }),
        });
      });
      vi.stubGlobal('fetch', fetchMock);

      const provider = new LocalOllamaProvider(localConfig);
      const originalPrompt = 'Original teacher text.';
      const request: AiRequest = {
        ...baseRequest,
        prompt: originalPrompt,
      };

      await provider.execute(request, { consentGiven: true });

      expect(capturedPrompt).toBe(originalPrompt);
    });
  });

  describe('Preview correctness', () => {
    it('preview outgoingText matches request prompt exactly', () => {
      const request: AiRequest = {
        requestId: 'test-preview-match',
        providerId: 'local-ollama',
        capability: 'textGeneration',
        prompt: 'The exact prompt text.',
        timestamp: Date.now(),
      };

      const preview = createRequestPreview(localConfig, request);

      expect(preview.outgoingText).toBe('The exact prompt text.');
    });

    it('preview includes providerId, providerKind, model, endpoint', () => {
      const preview = createRequestPreview(localConfig, baseRequest);

      expect(preview.providerId).toBe('local-ollama');
      expect(preview.providerKind).toBe('local');
      expect(preview.model).toBe('llama3.2');
      expect(preview.endpoint).toBe('http://localhost:11434');
    });
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});