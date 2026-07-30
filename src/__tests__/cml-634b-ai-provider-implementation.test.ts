import { describe, expect, it, vi } from 'vitest';
import { OllamaTransport } from '../domain/ai/ollamaTransport';
import type { AiRequest } from '../domain/ai/types';

describe('CML-634B — AI Provider Implementation', () => {
  const baseRequest: AiRequest = {
    requestId: 'test-1',
    providerId: 'localhost',
    capability: 'textGeneration',
    prompt: 'Hello world',
    timestamp: Date.now(),
  };

  it('transport sends minimal Ollama payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: 'generated text' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const transport = new OllamaTransport({
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
    });

    const response = await transport.send(baseRequest);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3.2', prompt: 'Hello world', stream: false }),
      })
    );

    expect(response.status).toBe('success');
    expect(response.model).toBe('llama3.2');
    expect(response.stream).toBe(false);
  });

  it('transport rejects remote endpoints', async () => {
    const transport = new OllamaTransport({
      endpoint: 'https://example.com',
      model: 'llama3.2',
    });

    const invalidRequest: AiRequest = {
      requestId: 'test-2',
      providerId: 'https://example.com',
      capability: 'textGeneration',
      prompt: 'Test',
      timestamp: Date.now(),
    };

    await expect(transport.send(invalidRequest)).rejects.toThrow('Invalid endpoint');
  });

  it('validates prompt and model before transport', async () => {
    const transport = new OllamaTransport({
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
    });

    const invalidModelRequest: AiRequest = {
      requestId: 'test-3',
      providerId: 'localhost',
      capability: 'textGeneration',
      prompt: 'Test',
      timestamp: Date.now(),
    };

    await expect(transport.send(invalidModelRequest)).resolves.toBeDefined();

    const invalidPromptRequest: AiRequest = {
      requestId: 'test-4',
      providerId: 'localhost',
      capability: 'textGeneration',
      prompt: '',
      timestamp: Date.now(),
    };

    await expect(transport.send(invalidPromptRequest)).rejects.toThrow('Empty prompt');
  });

  it('distinguishes between abort and timeout errors', async () => {
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

    const fetchMock2 = vi.fn().mockImplementation((_url: string, options: any) => {
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

    vi.stubGlobal('fetch', fetchMock2);

    const transport2 = new OllamaTransport({
      endpoint: 'http://localhost:11434',
      model: 'llama3.2',
      timeoutMs: 30000,
    });

    const controller = new AbortController();
    const abortPromise = transport2.send(baseRequest, { signal: controller.signal });
    controller.abort();

    await expect(abortPromise).rejects.toThrow('Aborted');
  });
});
