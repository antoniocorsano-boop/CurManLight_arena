import type { AiRequest } from './types';

export interface OllamaTransportConfiguration {
  endpoint: string;
  model: string;
  timeoutMs?: number;
}

export interface OllamaTransportResult<T = unknown> {
  model: string;
  prompt: string;
  stream: boolean;
  status: 'success' | 'failed';
  result?: T;
  error?: string;
}

const LOCAL_ENDPOINT_PATTERN = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\/?$/;

export class OllamaTransport {
  private readonly endpoint: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(configuration: OllamaTransportConfiguration) {
    this.endpoint = configuration.endpoint.replace(/\/$/, '');
    this.model = configuration.model;
    this.timeoutMs = configuration.timeoutMs ?? 30000;
  }

  private validateEndpoint(endpoint: string): void {
    if (!LOCAL_ENDPOINT_PATTERN.test(endpoint)) {
      throw new Error('Invalid endpoint');
    }
  }

  async send<T = unknown>(
    request: AiRequest,
    options?: { signal?: AbortSignal }
  ): Promise<OllamaTransportResult<T>> {
    this.validateEndpoint(this.endpoint);

    if (!request.prompt.trim()) {
      throw new Error('Empty prompt');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    let abortedByUser = false;

    if (options?.signal) {
      if (options.signal.aborted) {
        clearTimeout(timeoutId);
        throw new Error('Aborted');
      }
      const abortListener = () => {
        abortedByUser = true;
        controller.abort();
      };
      options.signal.addEventListener('abort', abortListener, { once: true });
    }

    try {
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, prompt: request.prompt, stream: false }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = response.statusText;
        try {
          const errorBody = await response.json() as Record<string, unknown>;
          if (typeof errorBody?.error === 'string') {
            errorDetail = errorBody.error;
          }
        } catch {
          // body non JSON, usa statusText
        }
        throw new Error(`HTTP ${response.status}: ${errorDetail}`);
      }

      const data = (await response.json()) as Record<string, unknown>;
      const result = data?.response;

      if (typeof result === 'undefined') {
        throw new Error('Missing response field');
      }

      return {
        model: this.model,
        prompt: request.prompt,
        stream: false,
        status: 'success',
        result: result as T,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (abortedByUser || error.message === 'Aborted') {
          throw new Error('Aborted');
        }
        if (error.name === 'AbortError') {
          throw new Error('Timeout');
        }
        throw new Error(error.message);
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        typeof (error as { name?: string }).name === 'string' &&
        (error as { name?: string }).name === 'AbortError'
      ) {
        if (abortedByUser) {
          throw new Error('Aborted');
        }
        throw new Error('Timeout');
      }

      const message = typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message)
        : String(error);
      throw new Error(message);
    }
  }
}
