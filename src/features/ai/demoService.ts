import { AiProviderRegistryImpl } from '../../domain/ai/registry';
import type { AiProviderRegistry } from '../../domain/ai/types';
import type { AiProviderConfiguration, AiRequest } from '../../domain/ai/types';

export function getAiRegistry(): AiProviderRegistry {
  return new AiProviderRegistryImpl();
}

export function createDemoRequest(providerId: string, capability: string): AiRequest {
  return {
    requestId: `demo-${Date.now()}`,
    providerId,
    capability: capability as keyof AiProviderConfiguration['capabilities'],
    prompt: 'Demo request for boundary verification.',
    timestamp: Date.now(),
  };
}