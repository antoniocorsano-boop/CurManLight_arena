import { validateLocalEndpoint } from './endpointUtils';

export interface OllamaModelDetails {
  format?: string;
  family?: string;
  families?: string[];
  parameterSize?: string;
  quantizationLevel?: string;
}

export interface OllamaInstalledModel {
  name: string;
  model: string;
  modifiedAt?: string;
  size?: number;
  digest?: string;
  details?: OllamaModelDetails;
}

export interface OllamaTagResponse {
  models: OllamaInstalledModel[];
}

export type OllamaModelDiscoveryStatus = 'success' | 'unavailable' | 'invalid_response' | 'failed';

export type OllamaModelDiscoveryResult =
  | {
      status: 'success';
      models: OllamaInstalledModel[];
    }
  | {
      status: 'unavailable' | 'invalid_response' | 'failed';
      models: [];
      message: string;
    };

export class OllamaModelDiscoveryClient {
  private readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint.replace(/\/$/, '');
  }

  async discoverModels(options?: { signal?: AbortSignal }): Promise<OllamaModelDiscoveryResult> {
    try {
      validateLocalEndpoint(this.endpoint);
    } catch {
      return { status: 'failed', models: [], message: 'Invalid endpoint' };
    }

    try {
      const response = await fetch(`${this.endpoint}/api/tags`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: options?.signal,
      });

      if (!response.ok) {
        return {
          status: 'unavailable',
          models: [],
          message: `Ollama risponde con HTTP ${response.status}`,
        };
      }

      let data: Record<string, unknown>;
      try {
        data = (await response.json()) as Record<string, unknown>;
      } catch {
        return {
          status: 'invalid_response',
          models: [],
          message: 'Il formato della risposta Ollama non è riconosciuto.',
        };
      }

      if (!data || !Array.isArray(data.models)) {
        return {
          status: 'invalid_response',
          models: [],
          message: 'Il formato della risposta Ollama non è riconosciuto.',
        };
      }

      const models: OllamaInstalledModel[] = data.models.map((m: unknown) => {
        const entry = m as Record<string, unknown>;
        return {
          name: typeof entry.name === 'string' ? entry.name : '',
          model: typeof entry.model === 'string' ? entry.model : '',
          modifiedAt: typeof entry.modified_at === 'string' ? entry.modified_at : undefined,
          size: typeof entry.size === 'number' ? entry.size : undefined,
          digest: typeof entry.digest === 'string' ? entry.digest : undefined,
          details: entry.details as OllamaModelDetails | undefined,
        };
      });

      return { status: 'success', models };
    } catch (error) {
      const isAbort =
        (error instanceof DOMException && error.name === 'AbortError') ||
        (error instanceof Error && error.name === 'AbortError') ||
        (typeof error === 'object' && error !== null && (error as { name?: string }).name === 'AbortError');
      if (isAbort) {
        return { status: 'failed', models: [], message: 'Ricerca annullata.' };
      }
      const message = error instanceof Error ? error.message : String(error);
      return { status: 'unavailable', models: [], message };
    }
  }
}

export function formatModelSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '';
  const gb = bytes / 1024 / 1024 / 1024;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / 1024 / 1024;
  return `${Math.round(mb)} MB`;
}

export function getModelFamilyLabel(model: OllamaInstalledModel): string {
  const family = model.details?.family;
  if (family) return family;
  const nameParts = model.name.split(':')[0].split('/');
  return nameParts[nameParts.length - 1] || '';
}
