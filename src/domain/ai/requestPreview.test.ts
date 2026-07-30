import { describe, expect, it } from 'vitest';
import { createRequestPreview } from './requestPreview';
import type { AiProviderConfiguration, AiRequest } from './types';

describe('createRequestPreview', () => {
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

  it('shows contextIncluded false when context is an empty object', () => {
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

  it('uses default endpoint when provider has no endpoint', () => {
    const configWithoutEndpoint: AiProviderConfiguration = {
      ...previewConfig,
      endpoint: undefined,
      model: 'llama3',
    };

    const request: AiRequest = {
      requestId: 'test-default-endpoint',
      providerId: 'local-ollama',
      capability: 'textGeneration',
      prompt: 'Test',
      timestamp: Date.now(),
    };

    const preview = createRequestPreview(configWithoutEndpoint, request);

    expect(preview.endpoint).toBe('http://localhost:11434');
    expect(preview.model).toBe('llama3');
  });

  it('uses empty string for model when provider has no model', () => {
    const configWithoutModel: AiProviderConfiguration = {
      ...previewConfig,
      model: undefined,
    };

    const request: AiRequest = {
      requestId: 'test-empty-model',
      providerId: 'local-ollama',
      capability: 'textGeneration',
      prompt: 'Test',
      timestamp: Date.now(),
    };

    const preview = createRequestPreview(configWithoutModel, request);

    expect(preview.model).toBe('');
  });

  it('does not fallback to default model when model is empty string', () => {
    const configWithEmptyModel: AiProviderConfiguration = {
      ...previewConfig,
      model: '',
    };

    const request: AiRequest = {
      requestId: 'test-empty-model-string',
      providerId: 'local-ollama',
      capability: 'textGeneration',
      prompt: 'Test',
      timestamp: Date.now(),
    };

    const preview = createRequestPreview(configWithEmptyModel, request);

    expect(preview.model).toBe('');
  });

  it('preserves configured model without modification', () => {
    const configWithModel: AiProviderConfiguration = {
      ...previewConfig,
      model: 'mistral-7b',
    };

    const request: AiRequest = {
      requestId: 'test-preserved-model',
      providerId: 'local-ollama',
      capability: 'textGeneration',
      prompt: 'Test',
      timestamp: Date.now(),
    };

    const preview = createRequestPreview(configWithModel, request);

    expect(preview.model).toBe('mistral-7b');
  });

  it('preserves endpoint without modification', () => {
    const configWithEndpoint: AiProviderConfiguration = {
      ...previewConfig,
      endpoint: 'http://localhost:11434',
    };

    const request: AiRequest = {
      requestId: 'test-preserved-endpoint',
      providerId: 'local-ollama',
      capability: 'textGeneration',
      prompt: 'Test',
      timestamp: Date.now(),
    };

    const preview = createRequestPreview(configWithEndpoint, request);

    expect(preview.endpoint).toBe('http://localhost:11434');
  });

  it('outgoingText matches request prompt exactly', () => {
    const request: AiRequest = {
      requestId: 'test-prompt-parity',
      providerId: 'local-ollama',
      capability: 'textGeneration',
      prompt: 'Exact prompt text.',
      timestamp: Date.now(),
    };

    const preview = createRequestPreview(previewConfig, request);

    expect(preview.outgoingText).toBe('Exact prompt text.');
    expect(preview.outgoingText).toBe(request.prompt);
  });
});