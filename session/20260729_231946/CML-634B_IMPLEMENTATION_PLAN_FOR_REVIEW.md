# CML-634B Local/Remote AI Provider Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a consent-bound Ollama loopback pilot behind the CML-634A boundary while keeping remote execution structurally disabled and every result an unapplied, human-verified draft.

**Architecture:** Extend the existing AI domain contracts with immutable request-consent and execution metadata, add focused endpoint/consent validation helpers, implement an injected-transport Ollama adapter, and make `AiExecutionServiceImpl` orchestrate registered adapters only after all pre-transport checks pass. The design commit `7f84eba` is documentation-only and derives from the immutable implementation baseline `0021a8b6c3820c2fb8da23830a59ce294ef0c112`.

**Tech Stack:** TypeScript, Vitest, React 18/Vite build pipeline, Storybook, native `fetch`, `AbortController`, Web `URL` API.

---

## Authorized Baseline and Invariants

Before any implementation action:

```powershell
git merge-base --is-ancestor 0021a8b HEAD
git diff --name-status 0021a8b..HEAD
git status --short
```

Expected before code work: ancestry succeeds; the only delta is the approved design document; status is empty.

Every task must preserve these invariants:

1. Consent binds the exact request ID, provider, prompt, model, and normalized endpoint. Any mutation invalidates consent.
2. Ollama receives exactly `{ model, prompt, stream: false }`.
3. Prompt, model, consent, capability, provider status, and endpoint are validated before transport access.
4. The disabled remote configuration has no adapter and cannot reach adapter resolution or transport.
5. User cancellation and timeout use abort signals but return distinct deterministic codes.
6. Provenance contains execution metadata, never prompt or generated text.
7. Pending-request cleanup occurs through `finally` for every terminal path.
8. Ollama URL construction discards ambiguity by accepting only an origin-like loopback endpoint and producing exactly `<normalized-origin>/api/generate`.

## File Responsibility Map

- Modify `src/domain/ai/types.ts`: consent, runtime configuration, adapter, execution metadata, and deterministic error-code contracts.
- Create `src/domain/ai/requestValidation.ts`: normalization, consent fingerprinting, request validation, and minimal body construction.
- Create `src/domain/ai/ollamaAdapter.ts`: local Ollama transport only.
- Create `src/domain/ai/providerAdapters.ts`: adapter registry with no remote fallback.
- Modify `src/domain/ai/executionService.ts`: validation-first orchestration, cancellation, timeout distinction, and cleanup.
- Modify `src/domain/ai/index.ts`: export new public contracts.
- Create `src/__tests__/cml-634b-ai-provider-pilot.test.ts`: behavioral pilot tests mapped to preventive gates.
- Modify `docs/03_execution/CML-634B_DESIGN.md`: only if implementation reveals a contradiction. Do not broaden scope.
- Create `docs/03_execution/CML-634B_VERIFICATION.md`: final evidence and real command exits.

## Test-to-Gate Matrix

| Test behavior | Preventive gate |
|---|---|
| Local Ollama success | 1 permitted providers |
| Remote provider rejected without adapter lookup | 1 permitted providers |
| No credential fields in contracts/body/provenance | 2 credentials |
| Missing consent rejected before transport | 3 consent |
| Mutation after consent rejected | 3 consent |
| Only approved prompt is sent | 4 minimization |
| Provider/model/endpoint exposed in preview and provenance | 5 transparency |
| Response is draft metadata only, with no write callback | 6 no automatic application |
| Provenance metadata and `requiresHumanVerification: true` | 7 provenance/human review |

### Task 1: Lock the baseline and create the failing contract tests

**Files:**
- Create: `src/__tests__/cml-634b-ai-provider-pilot.test.ts`
- Reference: `src/domain/ai/types.ts`

- [ ] **Step 1: Verify the branch and baseline**

Run:

```powershell
git branch --show-current
git merge-base --is-ancestor 0021a8b HEAD
git status --short
```

Expected: branch `feat/cml-634b-local-remote-ai-provider-pilot`, ancestor exit `0`, empty status.

- [ ] **Step 2: Write the first failing compile-time/behavior tests**

Create imports for the wished-for API:

```ts
import {
  createAiRequestConsent,
  validateExecutableRequest,
  normalizeLoopbackEndpoint,
  createOllamaRequestBody,
} from '../domain/ai/requestValidation';
import type { AiRequest, AiRequestConsent, AiProviderRuntimeConfiguration } from '../domain/ai/types';
```

Add tests asserting:

```ts
expect(normalizeLoopbackEndpoint('http://localhost:11434/')).toBe('http://localhost:11434');
expect(createOllamaRequestBody('llama3', 'Bozza')).toEqual({
  model: 'llama3',
  prompt: 'Bozza',
  stream: false,
});
expect(Object.keys(createOllamaRequestBody('llama3', 'Bozza')).sort()).toEqual([
  'model', 'prompt', 'stream',
]);
```

Create a request and its full `AiRequestPreview`, create consent from that reviewed preview, then mutate prompt/model/endpoint/provider/request ID individually and expect `validateExecutableRequest` to return `consent_mismatch` before any transport exists. Assert the preview contains exactly the outgoing prompt plus provider, model, normalized endpoint, and request ID.

- [ ] **Step 3: Run RED**

```powershell
npm test -- src/__tests__/cml-634b-ai-provider-pilot.test.ts
```

Expected: FAIL because `requestValidation` and the new contracts do not exist.

- [ ] **Step 4: Commit the red tests**

```powershell
git add src/__tests__/cml-634b-ai-provider-pilot.test.ts
git commit -m "test(CML-634B): define consent and payload invariants"
```

### Task 2: Add minimal consent and runtime contracts

**Files:**
- Modify: `src/domain/ai/types.ts`
- Modify: `src/domain/ai/index.ts`
- Test: `src/__tests__/cml-634b-ai-provider-pilot.test.ts`

- [ ] **Step 1: Add exact types**

```ts
export type AiExecutionStatus =
  | 'pending'
  | 'success'
  | 'cancelled'
  | 'failed'
  | 'provider_not_configured'
  | 'provider_disabled'
  | 'provider_unavailable'
  | 'provider_not_found'
  | 'capability_not_supported'
  | 'invalid_request'
  | 'consent_required'
  | 'consent_mismatch'
  | 'invalid_endpoint'
  | 'timeout';

export interface AiProviderRuntimeConfiguration {
  providerId: AiProviderId;
  model: string;
  endpoint: string;
  timeoutMs: number;
}

export interface AiRequestPreview {
  requestId: string;
  providerId: AiProviderId;
  prompt: string;
  model: string;
  endpoint: string;
}

export interface AiRequestConsent {
  requestId: string;
  providerId: AiProviderId;
  previewDigest: string;
  model: string;
  endpoint: string;
  grantedAt: number;
}

export interface AiRequest {
  // retain existing fields
  runtime?: AiProviderRuntimeConfiguration;
  consent?: AiRequestConsent;
}

export interface AiProvenance {
  // retain existing fields
  model?: string;
  endpoint?: string;
}
```

Do not add credential, token, API-key, prompt, result, or arbitrary headers fields.

- [ ] **Step 2: Export contracts from `index.ts`**

Export through the existing domain barrel only. Do not add a new layer.

- [ ] **Step 3: Run RED again**

Expected: tests still fail because validation functions are absent, but type imports resolve.

- [ ] **Step 4: Commit**

```powershell
git add src/domain/ai/types.ts src/domain/ai/index.ts
git commit -m "feat(CML-634B): add request consent and runtime contracts"
```

### Task 3: Implement validation, immutable consent, and normalized URL construction

**Files:**
- Create: `src/domain/ai/requestValidation.ts`
- Test: `src/__tests__/cml-634b-ai-provider-pilot.test.ts`

- [ ] **Step 1: Expand failing tests for all loopback forms and rejection cases**

Accept origins using `localhost`, `127.0.0.1`, or `[::1]`. Reject credentials, query, fragment, non-root path, unsupported protocol, and all other hosts. Assert generation URL is exactly `${normalizedEndpoint}/api/generate`.

- [ ] **Step 2: Run RED and confirm no transport is involved**

Expected failures must be assertion failures for missing behavior, not setup errors.

- [ ] **Step 3: Implement minimal helpers**

```ts
export function normalizeLoopbackEndpoint(value: string): string;
export function buildOllamaGenerateUrl(endpoint: string): string;
export function createOllamaRequestBody(model: string, prompt: string): {
  model: string;
  prompt: string;
  stream: false;
};
export function createAiRequestPreview(request: AiRequest): AiRequestPreview;
export function createAiRequestConsent(
  preview: AiRequestPreview,
  grantedAt?: number,
): AiRequestConsent;
export function validateExecutableRequest(
  provider: AiProviderConfiguration,
  request: AiRequest,
): AiExecutionStatus | undefined;
```

Use a deterministic digest derived from the exact preview tuple `[requestId, providerId, prompt, model, normalizedEndpoint]`. `createAiRequestPreview` exposes that exact tuple for teacher review; `createAiRequestConsent` accepts only the reviewed preview, and execution recomputes the tuple from the request. This is an integrity binding, not cryptographic authentication. Do not persist the preview or digest.

Validation order must be: provider identity/status, capability, prompt, runtime/model, endpoint normalization, consent presence, consent tuple equality.

- [ ] **Step 4: Run GREEN**

```powershell
npm test -- src/__tests__/cml-634b-ai-provider-pilot.test.ts
```

Expected: consent, body, and endpoint tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/domain/ai/requestValidation.ts src/__tests__/cml-634b-ai-provider-pilot.test.ts
git commit -m "feat(CML-634B): validate consent-bound local requests"
```

### Task 4: Define adapter registry with remote execution structurally absent

**Files:**
- Create: `src/domain/ai/providerAdapters.ts`
- Modify: `src/domain/ai/types.ts`
- Test: `src/__tests__/cml-634b-ai-provider-pilot.test.ts`

- [ ] **Step 1: Write RED tests**

Register one local adapter. Assert lookup returns it. Register a disabled remote provider only in `AiProviderRegistryImpl`, leave the adapter registry empty for that ID, and assert execution rejects on provider status before `adapterRegistry.get` is called.

- [ ] **Step 2: Add minimal adapter contract**

```ts
export interface AiProviderAdapter {
  readonly providerId: AiProviderId;
  execute<T>(request: AiRequest, signal: AbortSignal): Promise<T>;
}

export interface AiProviderAdapterRegistry {
  register(adapter: AiProviderAdapter): void;
  get(providerId: AiProviderId): AiProviderAdapter | undefined;
}
```

Implement `AiProviderAdapterRegistryImpl` as a private `Map`. Do not implement fallback selection.

- [ ] **Step 3: Run GREEN and commit**

```powershell
npm test -- src/__tests__/cml-634b-ai-provider-pilot.test.ts
git add src/domain/ai/types.ts src/domain/ai/providerAdapters.ts src/__tests__/cml-634b-ai-provider-pilot.test.ts
git commit -m "feat(CML-634B): add explicit provider adapter registry"
```

### Task 5: Implement Ollama adapter with injected transport

**Files:**
- Create: `src/domain/ai/ollamaAdapter.ts`
- Test: `src/__tests__/cml-634b-ai-provider-pilot.test.ts`

- [ ] **Step 1: Write RED transport tests**

Use `vi.fn` as an injected fetch-compatible transport. Assert one call to normalized `/api/generate`, method `POST`, JSON content type, supplied abort signal, and body exactly:

```json
{"model":"llama3","prompt":"Bozza","stream":false}
```

Assert response `{ response: 'Suggerimento' }` returns only `'Suggerimento'`. Add RED cases for non-2xx, rejected fetch, malformed JSON, missing response, and empty response.

- [ ] **Step 2: Implement minimal adapter**

Constructor dependencies:

```ts
constructor(
  providerId: AiProviderId,
  transport: typeof fetch = globalThis.fetch,
) {}
```

`execute` uses request runtime data already validated by orchestration. It must not add options, context, headers, credentials, or metadata beyond the minimum body.

- [ ] **Step 3: Run GREEN and commit**

```powershell
npm test -- src/__tests__/cml-634b-ai-provider-pilot.test.ts
git add src/domain/ai/ollamaAdapter.ts src/__tests__/cml-634b-ai-provider-pilot.test.ts
git commit -m "feat(CML-634B): add minimal Ollama loopback adapter"
```

### Task 6: Orchestrate validation, timeout, cancellation, and cleanup

**Files:**
- Modify: `src/domain/ai/executionService.ts`
- Test: `src/__tests__/cml-634b-ai-provider-pilot.test.ts`

- [ ] **Step 1: Write RED orchestration tests**

For every invalid input, inject spies for adapter lookup and transport and assert both remain untouched where required. Add deferred-promise tests proving `cancel(requestId)` aborts the active controller and returns `cancelled`. Use fake timers for timeout and expect `timeout`, never `cancelled`.

After success, validation failure, adapter failure, timeout, and cancellation, assert `getStatus(requestId)` is `undefined`.

- [ ] **Step 2: Change constructor without breaking CML-634A callers**

```ts
constructor(
  registry: AiProviderRegistry,
  adapters: AiProviderAdapterRegistry = new AiProviderAdapterRegistryImpl(),
) {}
```

Maintain a pending record containing request plus controller and terminal cause. Resolve provider, run all validation, then resolve adapter. A disabled remote provider must return before adapter lookup.

- [ ] **Step 3: Implement deterministic abort causes**

Set cause to `cancelled` only from `cancel`. Set cause to `timeout` only from the timeout callback. Map `AbortError` using that stored cause. Clear the timer and delete pending state in `finally`.

- [ ] **Step 4: Construct responses safely**

On success set provider kind `local`, result as draft text, provenance model/normalized endpoint, and `requiresHumanVerification: true`. Never include prompt/result in provenance and never call a persistence/write callback.

- [ ] **Step 5: Run pilot and compatibility tests**

```powershell
npm test -- src/__tests__/cml-634b-ai-provider-pilot.test.ts
npm test -- src/__tests__/cml-634a-ai-provider-boundary.test.ts
```

Expected: both suites pass.

- [ ] **Step 6: Commit**

```powershell
git add src/domain/ai/executionService.ts src/__tests__/cml-634b-ai-provider-pilot.test.ts
git commit -m "feat(CML-634B): orchestrate safe local AI execution"
```

### Task 7: Complete exports and full regression verification

**Files:**
- Modify: `src/domain/ai/index.ts`
- Test: both CML-634 suites

- [ ] **Step 1: Export only approved public API**

Export adapter registry, Ollama adapter, and validation helpers. Do not export test helpers or mutable internal maps.

- [ ] **Step 2: Run focused tests together**

```powershell
npm test -- src/__tests__/cml-634a-ai-provider-boundary.test.ts src/__tests__/cml-634b-ai-provider-pilot.test.ts
```

Expected: all tests pass with no unexpected network call.

- [ ] **Step 3: Run TypeScript and capture the real exit**

```powershell
npx tsc --noEmit
```

Record exact diagnostics and exit code. Compare with baseline evidence: the accepted baseline has three TS6133 errors in `src/__tests__/design-transfer-integration.test.tsx`. Any additional diagnostic is a CML-634B regression and must be fixed before proceeding.

- [ ] **Step 4: Run builds**

```powershell
npm run build
npm run build-storybook
```

Expected: exit `0`. Record the non-blocking missing `*.mdx` warning separately if present.

- [ ] **Step 5: Commit exports**

```powershell
git add src/domain/ai/index.ts
git commit -m "feat(CML-634B): expose local provider pilot contracts"
```

### Task 8: Produce verification evidence and closure candidate

**Files:**
- Create: `docs/03_execution/CML-634B_VERIFICATION.md`

- [ ] **Step 1: Capture scope evidence**

```powershell
git diff --check 0021a8b..HEAD
git diff --name-status 0021a8b..HEAD
git diff --stat 0021a8b..HEAD
git status --short
git log --oneline 0021a8b..HEAD
```

Expected: no whitespace errors, only CML-634B files, clean status.

- [ ] **Step 2: Document gate-by-gate evidence**

For each preventive gate, cite the exact test name and command result. Include the consent mutation cases, exact Ollama body assertion, pre-transport spy assertions, disabled-remote structural test, separate timeout/cancellation tests, provenance key assertion, and cleanup table.

- [ ] **Step 3: State TypeScript truthfully**

Use one unambiguous statement. If only the three baseline errors remain:

> The global TypeScript check exits non-zero with the same three pre-existing TS6133 diagnostics in `design-transfer-integration.test.tsx`; CML-634B introduces no additional TypeScript diagnostic.

Do not say that TypeScript compiles without errors.

- [ ] **Step 4: Commit evidence**

```powershell
git add docs/03_execution/CML-634B_VERIFICATION.md
git commit -m "docs(CML-634B): record pilot verification evidence"
```

- [ ] **Step 5: Final immutable checks**

```powershell
git show --check --stat --oneline HEAD
git status --short
git merge-base --is-ancestor 0021a8b HEAD
```

Expected: clean commit, empty status, baseline ancestry exit `0`. Do not publish or merge without separate authorization.
