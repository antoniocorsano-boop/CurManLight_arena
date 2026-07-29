# AI Provider Contracts

## Core Types

### AiProviderId
```typescript
export type AiProviderId = string;
```
Unique identifier for a provider instance.

### AiProviderKind
```typescript
export type AiProviderKind = 'none' | 'local' | 'remote';
```
Categories of provider:
- `none` - Null/disabled provider (default)
- `local` - Provider runs on local machine
- `remote` - Provider accessed via network

### AiProviderStatus
```typescript
export type AiProviderStatus = 'unconfigured' | 'disabled' | 'available' | 'unavailable';
```
Operational status of a provider.

### AiProviderCapabilities
```typescript
export interface AiProviderCapabilities {
  textGeneration: boolean;
  structuredCompletion: boolean;
  analysisOrClassification: boolean;
  streamingAvailable: boolean;
  localExecution: boolean;
  remoteExecution: boolean;
}
```
Declared capabilities of a provider. Consumers check capabilities before requesting.

### AiProviderConfiguration
```typescript
export interface AiProviderConfiguration {
  id: AiProviderId;
  kind: AiProviderKind;
  status: AiProviderStatus;
  capabilities: AiProviderCapabilities;
  label: string;
  description: string;
  requiresConsent: boolean;
}
```
Complete configuration for a provider instance.

### AiRequest
```typescript
export interface AiRequest {
  requestId: string;
  providerId: AiProviderId;
  capability: keyof AiProviderCapabilities;
  prompt: string;
  context?: Record<string, unknown>;
  timestamp: number;
}
```
Request structure. Context is caller-provided, not system-wide state.

### AiResponse
```typescript
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
```
Response structure. Always includes provenance and verification flag.

### AiError
```typescript
export interface AiError {
  code: AiExecutionStatus;
  message: string;
  details?: Record<string, unknown>;
}
```
Error information for failed requests.

### AiProvenance
```typescript
export interface AiProvenance {
  providerId: AiProviderId;
  providerKind: AiProviderKind;
  capabilityUsed: keyof AiProviderCapabilities;
  requestId: string;
  timestamp: number;
  warning?: string;
}
```
Source tracking for responses. Never includes credentials or personal data.

### AiExecutionContext
```typescript
export interface AiExecutionContext {
  requestId: string;
  providerId: AiProviderId;
  capability: keyof AiProviderCapabilities;
  timestamp: number;
}
```
Lightweight context for execution tracking.

### AiProviderRegistry
```typescript
export interface AiProviderRegistry {
  register(provider: AiProviderConfiguration): void;
  unregister(providerId: AiProviderId): void;
  getProvider(providerId: AiProviderId): AiProviderConfiguration | undefined;
  listProviders(): readonly AiProviderConfiguration[];
  resolveProvider(request: AiRequest): AiProviderConfiguration;
}
```
Central registry for provider management and resolution.

### AiExecutionService
```typescript
export interface AiExecutionService {
  execute<T = unknown>(request: AiRequest): Promise<AiResponse<T>>;
  cancel(requestId: string): boolean;
  getStatus(requestId: string): AiExecutionStatus | undefined;
}
```
Service for executing AI requests through the boundary.