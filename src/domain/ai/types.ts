export type AiProviderId = string;
export type AiProviderKind = 'none' | 'local' | 'remote';
export type AiProviderStatus = 'unconfigured' | 'disabled' | 'available' | 'unavailable';
export type AiExecutionStatus = 'pending' | 'success' | 'cancelled' | 'failed' | 'provider_not_configured' | 'provider_disabled' | 'provider_unavailable' | 'provider_not_found' | 'capability_not_supported' | 'invalid_request';

export interface AiProviderCapabilities {
  textGeneration: boolean;
  structuredCompletion: boolean;
  analysisOrClassification: boolean;
  streamingAvailable: boolean;
  localExecution: boolean;
  remoteExecution: boolean;
}

export interface AiProviderConfiguration {
  id: AiProviderId;
  kind: AiProviderKind;
  status: AiProviderStatus;
  capabilities: AiProviderCapabilities;
  label: string;
  description: string;
  requiresConsent: boolean;
  endpoint?: string;
  model?: string;
}

export interface AiRequest {
  requestId: string;
  providerId: AiProviderId;
  capability: keyof AiProviderCapabilities;
  prompt: string;
  context?: Record<string, unknown>;
  consentGiven?: boolean;
  timestamp: number;
}

export interface AiResponse<T = unknown> {
  requestId: string;
  providerId: AiProviderId;
  providerKind: AiProviderKind;
  capability: keyof AiProviderCapabilities;
  status: AiExecutionStatus;
  result?: T;
  error?: AiError;
  provenance: AiProvenance;
  requiresHumanVerification: boolean;
}

export interface AiError {
  code: AiExecutionStatus;
  message: string;
  details?: Record<string, unknown>;
}

export interface AiProvenance {
  providerId: AiProviderId;
  providerKind: AiProviderKind;
  capabilityUsed: keyof AiProviderCapabilities;
  requestId: string;
  timestamp: number;
  warning?: string;
}

export interface AiProviderRegistry {
  register(provider: AiProviderConfiguration): void;
  unregister(providerId: AiProviderId): void;
  getProvider(providerId: AiProviderId): AiProviderConfiguration | undefined;
  listProviders(): readonly AiProviderConfiguration[];
  resolveProvider(request: AiRequest): AiProviderConfiguration;
}

export interface AiExecutionService {
  execute<T = unknown>(request: AiRequest): Promise<AiResponse<T>>;
  cancel(requestId: string): boolean;
  getStatus(requestId: string): AiExecutionStatus | undefined;
}

export const NULL_PROVIDER_ID = '__null__';
export const NULL_PROVIDER: AiProviderConfiguration = {
  id: NULL_PROVIDER_ID,
  kind: 'none',
  status: 'unconfigured',
  capabilities: {
    textGeneration: false,
    structuredCompletion: false,
    analysisOrClassification: false,
    streamingAvailable: false,
    localExecution: false,
    remoteExecution: false,
  },
  label: 'Nessun fornitore',
  description: 'Fornitore nullo. Nessuna chiamata esterna viene effettuata.',
  requiresConsent: false,
};