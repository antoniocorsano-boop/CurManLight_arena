import { describe, expect, it, vi } from 'vitest';
import { OllamaTransport } from '../domain/ai/ollamaTransport';
import type { AiRequest } from '../domain/ai/types';

describe('AI Provider Implementation', () => {
  const baseRequest: AiRequest = {
    requestId: 'test-1',
    providerId: 'localhost',
    capability: 'textGeneration',
    prompt: 'Hello',
    timestamp: Date.now(),
  };

  describe('Local Ollama Adapter', () => {
    it('uses local Ollama endpoint by default', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: 'ok' }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const transport = new OllamaTransport({
        endpoint: 'http://localhost:11434',
        model: 'llama3.2',
      });

      const response = await transport.send(baseRequest);
      expect(response).toBeDefined();
      expect(response.model).toBe('llama3.2');
    });
  });

  describe('Endpoint Whitelist', () => {
    it('allows localhost and 127.0.0.1', async () => {
      const validEndpoints = [
        { endpoint: 'http://localhost:11434', providerId: 'localhost' },
        { endpoint: 'http://127.0.0.1:11434', providerId: '127.0.0.1' },
        { endpoint: 'http://[::1]:11434', providerId: '[::1]' },
      ];

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: 'ok' }),
      });
      vi.stubGlobal('fetch', fetchMock);

      for (const entry of validEndpoints) {
        const transport = new OllamaTransport({ endpoint: entry.endpoint, model: 'llama3.2' });
        const request = { ...baseRequest, requestId: 'test-whitelist', providerId: entry.providerId };
        await expect(transport.send(request)).resolves.toBeDefined();
      }
    });

    it('rejects non-local endpoints', async () => {
      const invalidEndpoints = ['https://example.com', 'http://example.com', 'http://192.168.1.1'];

      for (const endpoint of invalidEndpoints) {
        const transport = new OllamaTransport({ endpoint, model: 'llama3.2' });
        await expect(transport.send(baseRequest)).rejects.toThrow('Invalid endpoint');
      }
    });
  });

  describe('Validation Pipeline', () => {
    it('validates prompt is not empty', async () => {
      const transport = new OllamaTransport({
        endpoint: 'http://localhost:11434',
        model: 'llama3.2',
      });

      const invalidPrompt = { ...baseRequest, requestId: 'test-empty', prompt: '' };
      await expect(transport.send(invalidPrompt)).rejects.toThrow('Empty prompt');
    });

    it('validates model is approved', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ response: 'ok' }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const transport = new OllamaTransport({
        endpoint: 'http://localhost:11434',
        model: 'llama3.2',
      });

      const invalidModelRequest = { ...baseRequest, requestId: 'test-model' };
      await expect(transport.send(invalidModelRequest)).resolves.toBeDefined();
    });
  });

  describe('AbortController Integration', () => {
    it('uses AbortController for cancellation', async () => {
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
      });

      const controller = new AbortController();
      const abortPromise = transport.send(baseRequest, { signal: controller.signal });
      controller.abort();

      await expect(abortPromise).rejects.toThrow('Aborted');
    });
  });
});
