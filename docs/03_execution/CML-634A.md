# CML-634A — Optional AI Provider Boundary

## Overview

CML-634A introduces an architectural boundary and functional contract through which CurManLight can use local or remote AI providers in the future. This implementation does **not** connect to any real AI services. It establishes the infrastructure for optional, safe AI integration.

## Baseline

- **Previous commit**: `1f74421` (CML-633J closure)
- **Branch**: `feat/cml-634a-optional-ai-provider-boundary`
- **Verdict**: `CML_634A_OPTIONAL_AI_PROVIDER_BOUNDARY_COMPLETE_LOCAL`

## Scope

CML-634A introduces:
- Domain contracts and types for AI providers
- Null/disabled provider adapter
- Provider registry and resolution mechanism
- Execution service with provenance tracking
- Minimal demonstration integration
- Comprehensive test coverage
- Documentation

CML-634A does **not** introduce:
- Any real AI provider integrations
- API keys or credentials
- Network calls
- Telemetry or data transmission
- Backend services
- Authentication systems

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AiProviderRegistry                        │
│  (single source of truth for provider configuration)       │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                     │
          ▼                     ▼
┌───────────────────┐   ┌───────────────────┐
│ Null Provider     │   │ Future Providers  │
│ (disabled, safe)  │   │ (local/remote)  │
└───────────────────┘   └───────────────────┘
          │                     │
          └───────────┬───────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 AiExecutionService                         │
│  - Request routing                                        │
│  - Capability validation                                  │
│  - Error handling                                         │
│  - Provenance tracking                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Caller (Feature Layer)                  │
│  - Receives typed response                                  │
│  - Applies human verification                             │
│  - No direct provider knowledge                           │
└─────────────────────────────────────────────────────────────┘
```

## Provider States

| State | Description |
|-------|-------------|
| `unconfigured` | Provider not yet configured (null provider default) |
| `disabled` | Provider explicitly disabled |
| `available` | Provider ready for requests |
| `unavailable` | Provider present but not operational |

## Capabilities

Providers declare their capabilities:
- `textGeneration` - Generate text from prompts
- `structuredCompletion` - Generate structured data
- `analysisOrClassification` - Analyze or classify content
- `streamingAvailable` - Support streaming responses
- `localExecution` - Can run locally
- `remoteExecution` - Requires remote service

## Error Model

| Error Code | Description |
|------------|-------------|
| `provider_not_configured` | No provider set for request |
| `provider_disabled` | Provider explicitly disabled |
| `provider_unavailable` | Provider not operational |
| `provider_not_found` | Unknown provider identifier |
| `capability_not_supported` | Provider lacks required capability |
| `invalid_request` | Malformed request |
| `execution_cancelled` | Request was cancelled |
| `execution_failed` | Unknown execution error |
| `success` | Request completed successfully |

## Security Guarantees

- No network calls are made
- No credentials are stored or transmitted
- No data leaves the local environment
- Null provider is safe default
- All responses require human verification

## Separation from CML-634B

CML-634A establishes the boundary. CML-634B will implement:
- Local AI provider adapter
- Remote AI provider adapter
- Credential management
- Network connectivity handling
- Model selection interface

## Test Coverage

8 tests covering:
1. Null provider response behavior
2. Provider identification
3. Registry initialization
4. Unknown provider resolution
5. Provider status validation
6. Capability checking
7. Null provider capabilities
8. Integration flow

## Next Steps

See CML-634B — AI Provider Implementation for:
- Local provider adapter (e.g., llama.cpp, Ollama)
- Remote provider adapter (OpenAI, Anthropic, etc.)
- Credential management
- Consent and privacy controls