import type { AiRequest, AiResponse, AiExecutionStatus, AiProviderRegistry, AiExecutionService } from './types';
import { NULL_PROVIDER_ID } from './types';
import { createNullProviderResponse, isValidProviderForRequest } from './nullAdapter';
import { LocalOllamaProvider } from './localOllamaProvider';

export class AiExecutionServiceImpl implements AiExecutionService {
  private registry: AiProviderRegistry;
  private pendingRequests: Map<string, AiRequest> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(registry: AiProviderRegistry) {
    this.registry = registry;
  }

  async execute<T = unknown>(request: AiRequest): Promise<AiResponse<T>> {
    this.pendingRequests.set(request.requestId, request);

    const controller = new AbortController();
    this.abortControllers.set(request.requestId, controller);

    try {
      const provider = this.registry.resolveProvider(request);

      if (provider.id === NULL_PROVIDER_ID) {
        return createNullProviderResponse<T>(request);
      }

      if (provider.kind === 'local' && provider.endpoint && provider.model) {
        const localProvider = new LocalOllamaProvider(provider);
        const response = await localProvider.execute(request, {
          consentGiven: request.consentGiven,
          signal: controller.signal,
        });
        return response as AiResponse<T>;
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
      this.abortControllers.delete(request.requestId);
    }
  }

  cancel(requestId: string): boolean {
    const controller = this.abortControllers.get(requestId);

    if (!controller) {
      return false;
    }

    controller.abort();
    return true;
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