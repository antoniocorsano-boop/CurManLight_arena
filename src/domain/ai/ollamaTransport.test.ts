import { describe, expect, it, vi } from 'vitest';
import { OllamaTransport } from './ollamaTransport';
import type { AiRequest } from './types';

describe('OllamaTransport', () => {
  const baseRequest: AiRequest = {
    requestId: 'test-1',
    providerId: 'localhost',
    capability: 'textGeneration',
    prompt: 'Hello world',
    timestamp: Date.now(),
  };

  it('sends correct Ollama payload with configured model', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: 'generated text' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const transport = new OllamaTransport({
      endpoint: 'http://localhost:11434',
      model: 'mistral',
    });

    const response = await transport.send(baseRequest);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'mistral', prompt: 'Hello world', stream: false }),
      })
    );

    expect(response.status).toBe('success');
    expect(response.model).toBe('mistral');
    expect(response.stream).toBe(false);
    expect(response.result).toBe('generated text');
  });

  it('accepts localhost endpoints', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: 'ok' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const transport = new OllamaTransport({
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
    });

    const request = { ...baseRequest, requestId: 'test-2' };
    await expect(transport.send(request)).resolves.toBeDefined();
  });

  it('rejects remote endpoints', async () => {
    const transport = new OllamaTransport({
      endpoint: 'https://example.com',
      model: 'llama3.2',
    });

    await expect(transport.send(baseRequest)).rejects.toThrow('Invalid endpoint');
  });

  it('rejects empty prompt', async () => {
    const transport = new OllamaTransport({
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
    });

    await expect(transport.send({ ...baseRequest, prompt: '' })).rejects.toThrow('Empty prompt');
  });

  it('returns HTTP error when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 400,
      statusText: 'Bad Request',
    }));

    const transport = new OllamaTransport({
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
    });

    await expect(transport.send(baseRequest)).rejects.toThrow('HTTP 400: Bad Request');
  });

  it('returns service unreachable when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('NetworkError')));

    const transport = new OllamaTransport({
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
    });

    await expect(transport.send(baseRequest)).rejects.toThrow('NetworkError');
  });

  it('throws Timeout when abort comes from timeout', async () => {
    const fetchMock = vi.fn().mockImplementation((_url: string, options: any) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (options?.signal?.aborted) {
            reject(new DOMException('The user aborted a request.', 'AbortError'));
          } else {
            resolve({
              ok: true,
              json: () => Promise.resolve({ response: 'ok' }),
            });
          }
        }, 500);
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const transport = new OllamaTransport({
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
      timeoutMs: 50,
    });

    await expect(transport.send(baseRequest)).rejects.toThrow('Timeout');
  });

  it('throws Aborted when external signal is aborted', async () => {
    const fetchMock = vi.fn().mockImplementation((_url: string, options: any) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (options?.signal?.aborted) {
            reject(new DOMException('The user aborted a request.', 'AbortError'));
          } else {
            resolve({
              ok: true,
              json: () => Promise.resolve({ response: 'ok' }),
            });
          }
        }, 100);
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const transport = new OllamaTransport({
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
      timeoutMs: 30000,
    });

    const controller = new AbortController();
    const promise = transport.send(baseRequest, { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toThrow('Aborted');
  });

  it('throws error when response JSON is invalid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    }));

    const transport = new OllamaTransport({
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
    });

    await expect(transport.send(baseRequest)).rejects.toThrow('Unexpected token');
  });

  it('throws error when response lacks response field', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }));

    const transport = new OllamaTransport({
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
    });

    await expect(transport.send(baseRequest)).rejects.toThrow('Missing response field');
  });
});
