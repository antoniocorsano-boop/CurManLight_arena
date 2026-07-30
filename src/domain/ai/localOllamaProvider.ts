import type { AiRequest, AiResponse, AiError, AiProvenance, AiProviderConfiguration, AiExecutionStatus } from './types';
import { OllamaTransport } from './ollamaTransport';

interface LocalOllamaConfig {
  providerId: string;
  endpoint: string;
  model: string;
}

function buildTransportConfig(config: AiProviderConfiguration): LocalOllamaConfig {
  const endpoint = config.endpoint?.trim() || 'http://localhost:11434';
  const model = config.model?.trim() || '';
  return { providerId: config.id, endpoint, model };
}

function buildError(
  code: AiExecutionStatus,
  message: string,
  details?: Record<string, unknown>,
): AiError {
  return { code, message, details };
}

function buildProvenance(
  config: AiProviderConfiguration,
  request: AiRequest,
  warning?: string,
): AiProvenance {
  return {
    providerId: config.id,
    providerKind: config.kind,
    capabilityUsed: request.capability,
    requestId: request.requestId,
    timestamp: Date.now(),
    warning,
  };
}

export class LocalOllamaProvider {
  private config: AiProviderConfiguration;
  private transport: OllamaTransport;
  private disabled: boolean;

  constructor(configuration: AiProviderConfiguration) {
    this.config = configuration;
    this.transport = new OllamaTransport(buildTransportConfig(configuration));
    this.disabled = configuration.status === 'disabled';
  }

  isAvailable(): boolean {
    if (this.disabled) return false;
    if (this.config.status !== 'available') return false;
    if (!this.config.capabilities.textGeneration) return false;
    return true;
  }

  async execute(request: AiRequest, options?: { consentGiven?: boolean; signal?: AbortSignal }): Promise<AiResponse> {
    if (!options?.consentGiven) {
      return {
        requestId: request.requestId,
        providerId: this.config.id,
        providerKind: this.config.kind,
        capability: request.capability,
        status: 'invalid_request',
        error: buildError('invalid_request', 'Consenso esplicito richiesto per l\'esecuzione locale.'),
        provenance: buildProvenance(this.config, request, 'Nessuna esecuzione avviata: consenso mancante.'),
        requiresHumanVerification: true,
      };
    }

    if (!this.isAvailable()) {
      return {
        requestId: request.requestId,
        providerId: this.config.id,
        providerKind: this.config.kind,
        capability: request.capability,
        status: 'provider_unavailable',
        error: buildError('provider_unavailable', `Il fornitore locale ${this.config.id} non è disponibile.`),
        provenance: buildProvenance(this.config, request, 'Il provider locale non è raggiungibile.'),
        requiresHumanVerification: true,
      };
    }

    try {
      const result = await this.transport.send(request, { signal: options?.signal });

      if (result.status !== 'success' || result.result === undefined) {
        return {
          requestId: request.requestId,
          providerId: this.config.id,
          providerKind: this.config.kind,
          capability: request.capability,
          status: 'failed',
          error: buildError('failed', 'Risposta Ollama non valida o vuota.', { model: result.model }),
          provenance: buildProvenance(this.config, request, 'Il provider locale ha risposto senza contenuto generato.'),
          requiresHumanVerification: true,
        };
      }

      return {
        requestId: request.requestId,
        providerId: this.config.id,
        providerKind: this.config.kind,
        capability: request.capability,
        status: 'success',
        result: result.result,
        error: undefined,
        provenance: buildProvenance(this.config, request, 'Risposta generata da un modello locale. Verifica umana necessaria prima dell\'uso.'),
        requiresHumanVerification: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      let status: AiExecutionStatus = 'provider_unavailable';

      if (message === 'Timeout') {
        status = 'provider_unavailable';
      } else if (message === 'Aborted') {
        status = 'cancelled';
      } else if (message === 'Invalid endpoint' || message === 'Empty prompt') {
        status = 'invalid_request';
      }

      return {
        requestId: request.requestId,
        providerId: this.config.id,
        providerKind: this.config.kind,
        capability: request.capability,
        status,
        error: buildError(status, message),
        provenance: buildProvenance(this.config, request, `Errore del provider locale: ${message}`),
        requiresHumanVerification: true,
      };
    }
  }
}