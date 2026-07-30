import type { AiRequest, AiProviderConfiguration } from './types';

export interface RequestPreview {
  providerId: string;
  providerKind: string;
  model: string;
  endpoint: string;
  capability: string;
  outgoingText: string;
  contextIncluded: boolean;
}

export function createRequestPreview(
  provider: AiProviderConfiguration,
  request: AiRequest,
): RequestPreview {
  const endpoint = provider.endpoint?.trim() || 'http://localhost:11434';
  const model = provider.model?.trim() || 'default';
  const contextIncluded = request.context !== undefined && Object.keys(request.context).length > 0;

  return {
    providerId: provider.id,
    providerKind: provider.kind,
    model,
    endpoint,
    capability: request.capability,
    outgoingText: request.prompt,
    contextIncluded,
  };
}