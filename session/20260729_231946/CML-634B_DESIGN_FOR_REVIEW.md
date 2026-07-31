# CML-634B — Local/Remote AI Provider Pilot Design

## Status

- Baseline: `0021a8b6c3820c2fb8da23830a59ce294ef0c112`
- Branch: `feat/cml-634b-local-remote-ai-provider-pilot`
- Design status: approved
- Implementation status: not started

## Teacher Value

> Il docente potrà ottenere una bozza di suggerimento didattico tramite un modello locale, sapendo esattamente quali dati vengono elaborati, senza modifiche automatiche al proprio lavoro.

## Objective

Implement a safe pilot behind the CML-634A provider boundary. The pilot executes real requests only against a locally running Ollama instance. A remote provider is represented only by a disabled, non-executable configuration. No remote credentials or remote traffic are introduced.

## Approved Scope

### Included

- Real local text generation through Ollama
- In-memory endpoint and model configuration
- Default local endpoint `http://localhost:11434`
- Explicit consent for every request
- Preview of provider, model, endpoint, and complete outgoing text
- Transmission of only text explicitly entered or selected by the teacher
- Typed responses with provenance and mandatory human-verification metadata
- Cancellation and timeout handling
- Disabled remote-provider configuration that cannot perform network traffic
- Tests for all seven preventive gates

### Excluded

- Remote-provider execution
- API keys, tokens, or other credentials
- Credential persistence
- `localStorage` or canonical-domain persistence
- Automatic curriculum, design, document, or archive context
- Automatic application of generated output
- Streaming
- Provider-selection UI beyond the minimum pilot-facing contract
- Refactoring of unrelated code or architecture

## Seven Preventive Gates

1. **Permitted providers**: only local Ollama may execute. The remote pilot provider remains disabled.
2. **Credentials**: the pilot accepts and stores no credentials.
3. **Consent**: every request requires explicit, request-scoped consent after showing the exact outgoing data.
4. **Data minimization**: only teacher-entered or explicitly selected text is sent. No automatic context is attached.
5. **Provider transparency**: the preview and response identify provider, model, execution kind, and endpoint.
6. **No automatic application**: generated text is returned as a draft and never writes to canonical state.
7. **Provenance and human verification**: every response records provenance and requires human verification.

## Architecture

### Existing boundary

CML-634B extends the CML-634A contracts rather than creating a parallel service. `AiExecutionServiceImpl` remains the orchestration boundary used by callers.

### Provider adapter

Introduce an adapter contract that separates provider metadata from provider execution. The execution service resolves configuration through the existing registry and delegates available providers to an adapter registered for the provider ID.

The Ollama adapter:

- accepts an in-memory endpoint and model;
- validates that the endpoint is local;
- sends non-streaming generation requests to `/api/generate`;
- uses an injected fetch-compatible transport for deterministic testing;
- maps HTTP, timeout, cancellation, and payload failures to typed AI errors;
- returns the generated text only through `AiResponse`.

The disabled remote adapter/configuration has no executable transport. Any attempt to use it is rejected before network access.

### Legacy Ollama client

`src/lib/ollamaClient.ts` is not called directly by features and is not refactored as part of this milestone. CML-634B implements the pilot through the approved domain boundary. Removal or migration of the legacy helper is separate work.

## Contracts

### Request consent

The request carries an explicit consent record scoped to that request. Consent includes confirmation that the teacher reviewed:

- provider;
- model;
- endpoint;
- complete outgoing text.

Consent is never inferred from prior requests and is not persisted.

### Runtime configuration

The local adapter configuration contains:

- provider ID;
- local endpoint;
- model name;
- timeout.

The endpoint defaults to `http://localhost:11434`. The model must be provided explicitly. Configuration exists only in memory.

### Provenance

Successful and failed responses identify:

- request ID;
- provider ID and kind;
- capability;
- timestamp;
- model;
- endpoint or execution location;
- mandatory human-verification flag.

Provenance contains no credentials and no copy of the complete prompt.

## Data Flow

1. The teacher enters or explicitly selects source text.
2. The pilot constructs a preview containing the exact text plus provider, model, and local endpoint.
3. The teacher provides request-scoped consent.
4. Validation rejects empty prompts, missing models, missing consent, and non-local endpoints before transport execution.
5. `AiExecutionServiceImpl` resolves the Ollama provider and delegates to its adapter.
6. The adapter sends only the approved prompt and minimum Ollama protocol fields.
7. The adapter maps the result into a typed response with provenance.
8. The caller presents the result as a separate AI-generated draft.
9. No result is automatically written or applied.

## Local Endpoint Policy

The pilot permits loopback endpoints only:

- `localhost`
- `127.0.0.1`
- `[::1]`

The URL must use `http` or `https`. User information embedded in the URL is rejected. Other hosts are rejected before `fetch`.

## Error Handling

The following failures produce typed responses and never trigger a remote fallback:

- missing or declined consent;
- empty prompt;
- missing model;
- invalid or non-local endpoint;
- provider disabled or unavailable;
- unsupported capability;
- connection failure;
- timeout;
- cancellation;
- non-success HTTP response;
- malformed or empty Ollama response.

Cancellation uses `AbortController`. Request tracking is cleaned up after success, failure, timeout, or cancellation.

## Security and Privacy

- No remote provider can execute.
- No credentials are accepted or stored.
- No automatic context collection occurs.
- No prompt or generated result is persisted by the provider layer.
- No canonical archive or product state is mutated.
- Provider identity and execution location are visible before consent and in provenance.
- Generated content is always marked as requiring human verification.

## Testing Strategy

Implementation follows red-green-refactor. Tests must first fail for the expected missing behavior.

Required tests cover:

1. Successful local Ollama generation with explicit consent
2. Rejection without consent before transport access
3. Rejection of empty prompt before transport access
4. Rejection of missing model before transport access
5. Rejection of non-local endpoints before transport access
6. Acceptance of approved loopback endpoint forms
7. Transmission of only the approved prompt and minimum protocol fields
8. Complete provider/model/location provenance without prompt duplication
9. Mandatory human verification
10. No canonical writes or automatic application
11. Disabled remote provider performs no traffic
12. Timeout mapping
13. Explicit cancellation and transport abortion
14. HTTP failure mapping
15. Malformed and empty-response mapping
16. Request tracking cleanup
17. Compatibility with all CML-634A tests

## Verification Matrix

Before closure, run:

```powershell
npm test -- src/__tests__/cml-634a-ai-provider-boundary.test.ts
npm test -- src/__tests__/cml-634b-ai-provider-pilot.test.ts
npx tsc --noEmit
npm run build
npm run build-storybook
git diff --check 0021a8b..HEAD
git diff --name-status 0021a8b..HEAD
git diff --stat 0021a8b..HEAD
git status --short
```

The final report must state the real TypeScript exit code and distinguish pre-existing errors from CML-634B regressions.

## Acceptance Criteria

CML-634B is locally acceptable when:

- only Ollama loopback execution is possible;
- the remote provider cannot execute or access a transport;
- every request requires explicit consent;
- only explicitly approved text is transmitted;
- no credentials or automatic context are used;
- results remain unapplied drafts;
- provenance and human verification are mandatory;
- failure and cancellation behavior are typed and tested;
- CML-634A compatibility tests pass;
- builds pass and no new TypeScript regression is attributable to CML-634B;
- the branch contains no unrelated changes.
