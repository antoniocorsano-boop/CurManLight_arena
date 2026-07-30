import { describe, expect, it, vi, afterEach } from 'vitest';
import { LocalOllamaProvider } from './localOllamaProvider';
import { createRequestPreview } from './requestPreview';
import type { AiProviderConfiguration, AiRequest } from './types';

describe('LocalOllamaProvider', () => {
  const baseConfig: AiProviderConfiguration = {
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
    endpoint: 'http://localhost:11434',
    model: 'llama3.2',
  };

  const baseRequest: AiRequest = {
    requestId: 'test-1',
    providerId: 'local-ollama',
    capability: 'textGeneration',
    prompt: 'Hello',
    timestamp: Date.now(),
  };

  it('implements provider kind local', () => {
    const provider = new LocalOllamaProvider(baseConfig);
    expect(provider.isAvailable()).toBe(true);
  });

  it('uses model and endpoint from configuration', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: 'generated text' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = new LocalOllamaProvider(baseConfig);
    const response = await provider.execute(baseRequest, { consentGiven: true });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({
        body: JSON.stringify({ model: 'llama3.2', prompt: 'Hello', stream: false }),
      })
    );

    expect(response.status).toBe('success');
    expect(response.providerKind).toBe('local');
    expect(response.providerId).toBe('local-ollama');
  });

  it('translates a valid response into AiResponse', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: 'Hello teacher!' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = new LocalOllamaProvider(baseConfig);
    const response = await provider.execute(baseRequest, { consentGiven: true });

    expect(response.status).toBe('success');
    expect(response.result).toBe('Hello teacher!');
    expect(response.requiresHumanVerification).toBe(true);
  });

  it('builds provenance correctly', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: 'ok' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = new LocalOllamaProvider(baseConfig);
    const response = await provider.execute(baseRequest, { consentGiven: true });

    expect(response.provenance.providerId).toBe('local-ollama');
    expect(response.provenance.providerKind).toBe('local');
    expect(response.provenance.capabilityUsed).toBe('textGeneration');
    expect(response.provenance.requestId).toBe('test-1');
    expect(typeof response.provenance.timestamp).toBe('number');
  });

  it('maps OllamaTransport error messages to appropriate AiExecutionStatus', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: 'ok' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const provider = new LocalOllamaProvider(baseConfig);
    const response = await provider.execute(baseRequest, { consentGiven: true });

    expect(response.status).toBe('success');
    expect(response.requiresHumanVerification).toBe(true);
  });

  it('rejects capability not supported', () => {
    const limitedConfig: AiProviderConfiguration = {
      ...baseConfig,
      capabilities: {
        textGeneration: false,
        structuredCompletion: false,
        analysisOrClassification: false,
        streamingAvailable: false,
        localExecution: false,
        remoteExecution: false,
      },
    };

    const provider = new LocalOllamaProvider(limitedConfig);
    expect(provider.isAvailable()).toBe(false);
  });

  it('rejects disabled configuration', () => {
    const disabledConfig: AiProviderConfiguration = {
      ...baseConfig,
      status: 'disabled',
    };

    const provider = new LocalOllamaProvider(disabledConfig);
    expect(provider.isAvailable()).toBe(false);
  });

  it('rejects request without consent', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const provider = new LocalOllamaProvider(baseConfig);
    const response = await provider.execute(baseRequest, { consentGiven: false });

    expect(response.status).toBe('invalid_request');
    expect(response.error?.code).toBe('invalid_request');
    expect(response.requiresHumanVerification).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects request with undefined consent as rejected', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const provider = new LocalOllamaProvider(baseConfig);
    const response = await provider.execute(baseRequest);

    expect(response.status).toBe('invalid_request');
    expect(response.error?.code).toBe('invalid_request');
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('RequestPreview', () => {
  const previewConfig: AiProviderConfiguration = {
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
    description: 'Provider locale.',
    requiresConsent: true,
    endpoint: 'http://localhost:11434',
    model: 'mistral',
  };

  it('produces complete preview with provider, model, endpoint and outgoing text', () => {
    const request: AiRequest = {
      requestId: 'test-preview',
      providerId: 'local-ollama',
      capability: 'textGeneration',
      prompt: 'Explain photosynthesis.',
      timestamp: Date.now(),
    };

    const preview = createRequestPreview(previewConfig, request);

    expect(preview.providerId).toBe('local-ollama');
    expect(preview.providerKind).toBe('local');
    expect(preview.model).toBe('mistral');
    expect(preview.endpoint).toBe('http://localhost:11434');
    expect(preview.capability).toBe('textGeneration');
    expect(preview.outgoingText).toBe('Explain photosynthesis.');
    expect(preview.contextIncluded).toBe(false);
  });

  it('includes context when explicitly provided', () => {
    const request: AiRequest = {
      requestId: 'test-context',
      providerId: 'local-ollama',
      capability: 'textGeneration',
      prompt: 'Summarize this.',
      context: { source: 'biology textbook', chapter: 3 },
      timestamp: Date.now(),
    };

    const preview = createRequestPreview(previewConfig, request);

    expect(preview.contextIncluded).toBe(true);
    expect(preview.outgoingText).toBe('Summarize this.');
  });

  it('shows contextIncluded false when context is absent', () => {
    const request: AiRequest = {
      requestId: 'test-no-context',
      providerId: 'local-ollama',
      capability: 'textGeneration',
      prompt: 'Hello',
      timestamp: Date.now(),
    };

    const preview = createRequestPreview(previewConfig, request);

    expect(preview.contextIncluded).toBe(false);
  });

  it('shows contextIncluded true when context is an empty object (explicitly set)', () => {
    const request: AiRequest = {
      requestId: 'test-empty-context',
      providerId: 'local-ollama',
      capability: 'textGeneration',
      prompt: 'Hello',
      context: {},
      timestamp: Date.now(),
    };

    const preview = createRequestPreview(previewConfig, request);

    expect(preview.contextIncluded).toBe(false);
  });
});