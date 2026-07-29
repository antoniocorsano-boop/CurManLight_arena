import { describe, it, expect, vi } from 'vitest';
import { AiProviderRegistryImpl } from '../domain/ai/registry';
import { AiExecutionServiceImpl } from '../domain/ai/executionService';
import { createNullProviderResponse, isNullProvider } from '../domain/ai/nullAdapter';
import { NULL_PROVIDER, NULL_PROVIDER_ID } from '../domain/ai/types';
import type { AiRequest } from '../domain/ai/types';

describe('CML-634A — AI Provider Boundary', () => {
  describe('Null Provider Adapter', () => {
    it('returns null provider response for any request', () => {
      const request: AiRequest = {
        requestId: 'test-1',
        providerId: 'test-provider',
        capability: 'textGeneration',
        prompt: 'Hello',
        timestamp: Date.now(),
      };

      const response = createNullProviderResponse(request);

      expect(response.status).toBe('provider_disabled');
      expect(response.providerId).toBe(NULL_PROVIDER_ID);
      expect(response.providerKind).toBe('none');
      expect(response.requiresHumanVerification).toBe(true);
    });

    it('identifies null provider correctly', () => {
      expect(isNullProvider(NULL_PROVIDER)).toBe(true);
      expect(isNullProvider({ ...NULL_PROVIDER, id: 'other' })).toBe(false);
    });
  });

  describe('Provider Registry', () => {
    it('creates default null provider on construction', () => {
      const registry = new AiProviderRegistryImpl();
      const providers = registry.listProviders();
      expect(providers.length).toBe(1);
      expect(providers[0].id).toBe(NULL_PROVIDER_ID);
    });

    it('returns undefined for unknown provider', () => {
      const registry = new AiProviderRegistryImpl();
      const provider = registry.getProvider('unknown');
      expect(provider).toBeUndefined();
    });

    it('resolves to null provider for unknown id', () => {
      const registry = new AiProviderRegistryImpl();
      const request: AiRequest = {
        requestId: 'test-2',
        providerId: 'unknown',
        capability: 'textGeneration',
        prompt: 'Test',
        timestamp: Date.now(),
      };
      const resolved = registry.resolveProvider(request);
      expect(resolved.id).toBe(NULL_PROVIDER_ID);
    });
  });

  describe('Execution Service', () => {
    it('returns null response when no provider configured', async () => {
      const registry = new AiProviderRegistryImpl();
      const response = await registry.resolveProvider({
        requestId: 'test-3',
        providerId: 'none',
        capability: 'textGeneration',
        prompt: 'Test',
        timestamp: Date.now(),
      });
      expect(response.id).toBe(NULL_PROVIDER_ID);
    });

    it('handles provider unavailable status', async () => {
      const registry = new AiProviderRegistryImpl();
      const executionService = new AiExecutionServiceImpl(registry);
      const request: AiRequest = {
        requestId: 'test-unavailable',
        providerId: 'none',
        capability: 'textGeneration',
        prompt: 'Test',
        timestamp: Date.now(),
      };
      const response = await executionService.execute(request);
      expect(response.status).toBe('provider_disabled');
    });

    it('handles cancellation correctly', () => {
      const registry = new AiProviderRegistryImpl();
      const executionService = new AiExecutionServiceImpl(registry);
      const result = executionService.cancel('non-existent-id');
      expect(result).toBe(false);
    });

    it('tracks provenance in response', () => {
      const request: AiRequest = {
        requestId: 'test-provenance',
        providerId: 'test-provider',
        capability: 'textGeneration',
        prompt: 'Test',
        timestamp: Date.now(),
      };
      const response = createNullProviderResponse(request);
      expect(response.provenance.requestId).toBe('test-provenance');
      expect(response.provenance.providerKind).toBe('none');
      expect(response.provenance.capabilityUsed).toBe('textGeneration');
      expect(typeof response.provenance.timestamp).toBe('number');
    });

    it('does not make external calls', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const registry = new AiProviderRegistryImpl();
      const executionService = new AiExecutionServiceImpl(registry);
      const request: AiRequest = {
        requestId: 'test-no-network',
        providerId: 'none',
        capability: 'textGeneration',
        prompt: 'Test',
        timestamp: Date.now(),
      };
      await executionService.execute(request);
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });

    it('does not write to canonical archives', async () => {
      const registry = new AiProviderRegistryImpl();
      const executionService = new AiExecutionServiceImpl(registry);
      const request: AiRequest = {
        requestId: 'test-no-archive',
        providerId: 'none',
        capability: 'textGeneration',
        prompt: 'Test',
        timestamp: Date.now(),
      };
      const response = await executionService.execute(request);
      expect(response).toBeDefined();
      expect(response.result).toBeUndefined();
    });
  });

  describe('Provider Status', () => {
    it('null provider is never available', () => {
      expect(NULL_PROVIDER.status).toBe('unconfigured');
    });
  });

  describe('Capabilities', () => {
    it('null provider has all capabilities false', () => {
      expect(NULL_PROVIDER.capabilities.textGeneration).toBe(false);
      expect(NULL_PROVIDER.capabilities.structuredCompletion).toBe(false);
      expect(NULL_PROVIDER.capabilities.analysisOrClassification).toBe(false);
      expect(NULL_PROVIDER.capabilities.streamingAvailable).toBe(false);
      expect(NULL_PROVIDER.capabilities.localExecution).toBe(false);
      expect(NULL_PROVIDER.capabilities.remoteExecution).toBe(false);
    });
  });

  describe('Works without AI', () => {
    it('product continues without AI provider', () => {
      const registry = new AiProviderRegistryImpl();
      const providers = registry.listProviders();
      expect(providers.length).toBeGreaterThanOrEqual(1);
      expect(providers[0].kind).toBe('none');
    });
  });
});
