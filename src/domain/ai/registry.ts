import type { AiProviderConfiguration, AiProviderId, AiProviderRegistry, AiRequest } from './types';
import { NULL_PROVIDER, NULL_PROVIDER_ID } from './types';

export class AiProviderRegistryImpl implements AiProviderRegistry {
  private providers: Map<AiProviderId, AiProviderConfiguration> = new Map();

  constructor() {
    this.register(NULL_PROVIDER);
  }

  register(provider: AiProviderConfiguration): void {
    this.providers.set(provider.id, provider);
  }

  unregister(providerId: AiProviderId): void {
    if (providerId === NULL_PROVIDER_ID) return;
    this.providers.delete(providerId);
  }

  getProvider(providerId: AiProviderId): AiProviderConfiguration | undefined {
    return this.providers.get(providerId);
  }

  listProviders(): readonly AiProviderConfiguration[] {
    return Array.from(this.providers.values());
  }

  resolveProvider(request: AiRequest): AiProviderConfiguration {
    const provider = this.providers.get(request.providerId);
    if (!provider) {
      return NULL_PROVIDER;
    }
    return provider;
  }
}