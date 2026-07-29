import type { AiRequest, AiResponse, AiExecutionStatus, AiProviderRegistry, AiExecutionService } from './types';
import { NULL_PROVIDER_ID } from './types';
import { createNullProviderResponse, isValidProviderForRequest } from './nullAdapter';

export class AiExecutionServiceImpl implements AiExecutionService {
  private registry: AiProviderRegistry;
  private pendingRequests: Map<string, AiRequest> = new Map();

  constructor(registry: AiProviderRegistry) {
    this.registry = registry;
  }

  async execute<T = unknown>(request: AiRequest): Promise<AiResponse<T>> {
    this.pendingRequests.set(request.requestId, request);

    try {
      const provider = this.registry.resolveProvider(request);

      if (provider.id === NULL_PROVIDER_ID) {
        return createNullProviderResponse<T>(request);
      }

      if (provider.status !== 'available') {
        return this.failureResponse<T>(request, 'provider_unavailable', `Fornitore ${provider.id} non disponibile.`);
      }

      if (!isValidProviderForRequest(provider, request)) {
        return this.failureResponse<T>(request, 'capability_not_supported', `Il fornitore ${provider.id} non supporta la capacità richiesta.`);
      }

      return createNullProviderResponse<T>(request);
    } finally {
      this.pendingRequests.delete(request.requestId);
    }
  }

  cancel(requestId: string): boolean {
    const exists = this.pendingRequests.has(requestId);
    if (exists) {
      this.pendingRequests.delete(requestId);
    }
    return exists;
  }

  getStatus(requestId: string): AiExecutionStatus | undefined {
    if (this.pendingRequests.has(requestId)) {
      return 'pending';
    }
    return undefined;
  }

  private failureResponse<T>(request: AiRequest, code: AiExecutionStatus, message: string): AiResponse<T> {
    return {
      requestId: request.requestId,
      providerId: request.providerId,
      providerKind: 'none',
      capability: request.capability,
      status: code,
      error: { code, message },
      provenance: {
        providerId: request.providerId,
        providerKind: 'none',
        capabilityUsed: request.capability,
        requestId: request.requestId,
        timestamp: Date.now(),
        warning: message,
      },
      requiresHumanVerification: true,
    };
  }
}