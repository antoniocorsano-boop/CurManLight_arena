# AI Decision Records (ADR)

## ADR-001: Provider Kind Enumeration

**Status:** Accepted
**Context:** Need to categorize AI providers
**Decision:** Limit to `none`, `local`, `remote`
**Consequences:** Easily extensible, clear semantics

## ADR-002: Null Provider as Default

**Status:** Accepted
**Context:** Product must work without AI configured
**Decision:** Null provider is default, returns controlled error
**Consequences:** Safe default, no configuration required

## ADR-003: Provenance on All Responses

**Status:** Accepted
**Context:** Need audit trail for AI responses
**Decision:** Every response includes `AiProvenance`
**Consequences:** Full traceability, no anonymous responses

## ADR-004: Human Verification Always Required

**Status:** Accepted
**Context:** AI must not make autonomous decisions
**Decision:** `requiresHumanVerification: true` on all responses
**Consequences:** Teacher retains control, no auto-application

## ADR-005: Provider Registry as Single Source

**Status:** Accepted
**Context:** Need centralized provider management
**Decision:** Single `AiProviderRegistryImpl` instance
**Consequences:** No duplicate configuration, clear authority

## ADR-006: No Exceptions in Error Handling

**Status:** Accepted
**Context:** Predictable control flow required
**Decision:** All errors returned as `AiResponse` with error field
**Consequences:** No thrown exceptions, consistent error handling

## ADR-007: Capability Declaration Before Use

**Status:** Accepted
**Context:** Providers may not support all operations
**Decision:** Check `capabilities` before executing
**Consequences:** No runtime capability surprises

## ADR-008: Cancellation as Controlled Exit

**Status:** Accepted
**Context:** Long-running requests may need cancellation
**Decision:** `cancel()` returns boolean, doesn't throw
**Consequences:** Clean cancellation, no partial state