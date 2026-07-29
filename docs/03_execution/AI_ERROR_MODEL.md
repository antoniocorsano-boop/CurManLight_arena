# AI Provider Error Model

## Status Codes

All error status codes are discriminated union members of `AiExecutionStatus`.

### Success

| Code | Meaning |
|------|---------|
| `success` | Request completed successfully with valid response |

### Provider States

| Code | Meaning |
|------|---------|
| `provider_not_configured` | No provider configured for the requested capability |
| `provider_disabled` | Provider explicitly disabled in configuration |
| `provider_unavailable` | Provider exists but is not operational (e.g., service down) |
| `provider_not_found` | Requested provider ID does not exist in registry |

### Request Errors

| Code | Meaning |
|------|---------|
| `invalid_request` | Request malformed or missing required fields |
| `capability_not_supported` | Provider does not support the requested capability |

### Execution Errors

| Code | Meaning |
|------|---------|
| `execution_failed` | Unknown execution error occurred |
| `execution_cancelled` | Request was cancelled by user or system |

## Error Handling Patterns

### Null Provider Response
When no provider is configured or the null provider is selected:
```json
{
  "status": "provider_disabled",
  "error": {
    "code": "provider_disabled",
    "message": "Nessun fornitore IA configurato. Il prodotto Funziona senza intelligenza artificiale."
  }
}
```

### Provider Unavailable
When provider is configured but not operational:
```json
{
  "status": "provider_unavailable",
  "error": {
    "code": "provider_unavailable",
    "message": "Fornitore X non disponibile."
  }
}
```

### Capability Not Supported
When provider lacks the requested capability:
```json
{
  "status": "capability_not_supported",
  "error": {
    "code": "capability_not_supported",
    "message": "Il fornitore Y non supporta la capacità richiesta."
  }
}
```

## Consumer Patterns

Consumers should handle errors by:
1. Checking `response.status` for success/failure
2. Reading `response.error` for error details
3. Noting `response.requiresHumanVerification` to determine if action is needed
4. Preserving `response.provenance` for audit trail

## No Exceptions

Errors are communicated through the `AiResponse` type, not thrown exceptions. This ensures predictable control flow and proper error handling.

## Security Considerations

- Error messages never contain credentials
- Error messages never contain prompt content
- Error messages never contain response data
- Error messages are generic and user-friendly