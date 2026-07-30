import { AiProviderRegistryImpl } from '../../domain/ai/registry';
import { AiExecutionServiceImpl } from '../../domain/ai/executionService';
import type { AiProviderConfiguration, AiRequest, AiResponse } from '../../domain/ai/types';

export class LocalAiExecutionService {
  private registry: AiProviderRegistryImpl;
  private service: AiExecutionServiceImpl;

  constructor() {
    this.registry = new AiProviderRegistryImpl();
    this.service = new AiExecutionServiceImpl(this.registry);
  }

  configure(endpoint: string, model: string): void {
    const provider: AiProviderConfiguration = {
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
      endpoint,
      model,
    };

    this.registry.register(provider);
  }

  async execute(prompt: string): Promise<AiResponse<string>> {
    const request: AiRequest = {
      requestId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      providerId: 'local-ollama',
      capability: 'textGeneration',
      prompt,
      consentGiven: true,
      timestamp: Date.now(),
    };

    return this.service.execute<string>(request);
  }

  cancel(requestId: string): boolean {
    return this.service.cancel(requestId);
  }
}
