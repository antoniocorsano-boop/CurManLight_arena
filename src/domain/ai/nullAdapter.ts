import type { AiProviderConfiguration, AiRequest, AiResponse } from './types';
import { NULL_PROVIDER_ID } from './types';

export function createNullProviderResponse<T = unknown>(request: AiRequest): AiResponse<T> {
  return {
    requestId: request.requestId,
    providerId: NULL_PROVIDER_ID,
    providerKind: 'none',
    capability: request.capability,
    status: 'provider_disabled',
    result: undefined,
    error: {
      code: 'provider_disabled',
      message: 'Nessun fornitore IA configurato. Il prodotto Funziona senza intelligenza artificiale.',
    },
    provenance: {
      providerId: NULL_PROVIDER_ID,
      providerKind: 'none',
      capabilityUsed: request.capability,
      requestId: request.requestId,
      timestamp: Date.now(),
      warning: 'Risposta non disponibile. Il fornitore nullo non genera contenuti.',
    },
    requiresHumanVerification: true,
  };
}

export function isNullProvider(provider: AiProviderConfiguration): boolean {
  return provider.id === NULL_PROVIDER_ID;
}

export function isValidProviderForRequest(provider: AiProviderConfiguration, request: AiRequest): boolean {
  if (provider.status !== 'available') return false;
  if (provider.capabilities[request.capability] !== true) return false;
  return true;
}