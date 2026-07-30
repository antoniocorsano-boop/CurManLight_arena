import { describe, expect, it, vi } from 'vitest';
import { OllamaModelDiscoveryClient, formatModelSize, getModelFamilyLabel } from './ollamaModelDiscovery';
import type { OllamaInstalledModel } from './ollamaModelDiscovery';

function makeModel(overrides: Partial<OllamaInstalledModel> = {}): OllamaInstalledModel {
  return {
    name: 'llama3.2:3b',
    model: 'llama3.2:3b',
    size: 2019393189,
    digest: 'abc123',
    details: { family: 'Llama', parameterSize: '3B' },
    ...overrides,
  };
}

describe('OllamaModelDiscoveryClient', () => {
  it('returns models from GET /api/tags', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        models: [
          { name: 'llama3.2:3b', model: 'llama3.2:3b', size: 2019393189 },
          { name: 'mistral:latest', model: 'mistral:latest', size: 4372824384 },
        ],
      }),
    }));

    const client = new OllamaModelDiscoveryClient('http://localhost:11434');
    const result = await client.discoverModels();

    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.models).toHaveLength(2);
      expect(result.models[0].name).toBe('llama3.2:3b');
      expect(result.models[1].name).toBe('mistral:latest');
    }
  });

  it('accepts localhost endpoints', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ models: [] }) }));

    const client = new OllamaModelDiscoveryClient('http://localhost:11434');
    const result = await client.discoverModels();
    expect(result.status).toBe('success');
  });

  it('accepts 127.0.0.1 endpoints', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ models: [] }) }));

    const client = new OllamaModelDiscoveryClient('http://127.0.0.1:11434');
    const result = await client.discoverModels();
    expect(result.status).toBe('success');
  });

  it('rejects remote endpoints without calling fetch', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const client = new OllamaModelDiscoveryClient('https://example.com');
    const result = await client.discoverModels();

    expect(result.status).toBe('failed');
    if (result.status === 'failed') {
      expect(result.message).toContain('Invalid endpoint');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns unavailable on HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const client = new OllamaModelDiscoveryClient('http://localhost:11434');
    const result = await client.discoverModels();

    expect(result.status).toBe('unavailable');
    expect(result.models).toEqual([]);
  });

  it('returns invalid_response when models field is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }));

    const client = new OllamaModelDiscoveryClient('http://localhost:11434');
    const result = await client.discoverModels();

    expect(result.status).toBe('invalid_response');
    expect(result.models).toEqual([]);
  });

  it('handles invalid JSON response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    }));

    const client = new OllamaModelDiscoveryClient('http://localhost:11434');
    const result = await client.discoverModels();

    expect(result.status).toBe('invalid_response');
    expect(result.models).toEqual([]);
  });

  it('returns unavailable on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const client = new OllamaModelDiscoveryClient('http://localhost:11434');
    const result = await client.discoverModels();

    expect(result.status).toBe('unavailable');
    if (result.status === 'unavailable') {
      expect(result.message).toContain('Failed to fetch');
    }
  });

  it('returns failed when cancelled via AbortSignal', async () => {
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

    const controller = new AbortController();
    const client = new OllamaModelDiscoveryClient('http://localhost:11434');
    const promise = client.discoverModels({ signal: controller.signal });
    controller.abort();

    const result = await promise;
    expect(result.status).toBe('failed');
    if (result.status === 'failed') {
      expect(result.message).toContain('annullata');
    }
  });

  it('preserves model name with tag', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        models: [
          { name: 'llama3.2:3b', model: 'llama3.2:3b' },
          { name: 'qwen2.5:7b-instruct-q4_K_M', model: 'qwen2.5:7b-instruct-q4_K_M' },
        ],
      }),
    }));

    const client = new OllamaModelDiscoveryClient('http://localhost:11434');
    const result = await client.discoverModels();

    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.models[0].name).toBe('llama3.2:3b');
      expect(result.models[1].name).toBe('qwen2.5:7b-instruct-q4_K_M');
    }
  });

  it('preserves namespace in model name', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        models: [{ name: 'my-namespace/my-model:latest', model: 'my-namespace/my-model:latest' }],
      }),
    }));

    const client = new OllamaModelDiscoveryClient('http://localhost:11434');
    const result = await client.discoverModels();

    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.models[0].name).toBe('my-namespace/my-model:latest');
    }
  });

  it('handles empty models list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ models: [] }),
    }));

    const client = new OllamaModelDiscoveryClient('http://localhost:11434');
    const result = await client.discoverModels();

    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.models).toEqual([]);
    }
  });

  it('passes AbortSignal to fetch', async () => {
    const controller = new AbortController();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ models: [] }) }));

    const client = new OllamaModelDiscoveryClient('http://localhost:11434');
    await client.discoverModels({ signal: controller.signal });

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal })
    );
  });
});

describe('formatModelSize', () => {
  it('formats bytes as GB', () => {
    expect(formatModelSize(2019393189)).toBe('1.9 GB');
  });

  it('formats bytes as MB when under 1 GB', () => {
    expect(formatModelSize(500_000_000)).toBe('477 MB');
  });

  it('returns empty for undefined', () => {
    expect(formatModelSize()).toBe('');
  });
});

describe('getModelFamilyLabel', () => {
  it('returns family from details', () => {
    const model = makeModel({ details: { family: 'Llama' } });
    expect(getModelFamilyLabel(model)).toBe('Llama');
  });

  it('extracts from name when no family', () => {
    const model = makeModel({ name: 'llama3.2:3b', details: undefined });
    expect(getModelFamilyLabel(model)).toBe('llama3.2');
  });

  it('handles namespaced name', () => {
    const model = makeModel({ name: 'my-ns/my-model:tag', details: undefined });
    expect(getModelFamilyLabel(model)).toBe('my-model');
  });
});
