# CML-633E Structural Signature Policy

> Policy for structural footprints used in transfer contracts.

## Label

All structural footprints are explicitly labeled as **non-cryptographic**. They do not provide:

- Authentication
- Non-repudiation
- Security
- Verified provenance
- Integrity against intentional alteration

## Purpose

Structural footprints serve exclusively to:

- Detect accidental modifications
- Compare payloads
- Identify a specific representation of a transfer
- Verify that a recorded result corresponds to the processed payload

## Algorithm

- **Algorithm:** FNV-1a (Fowler-Noll-Vo)
- **Version:** 1
- **Output:** 32-bit hex string
- **Dependencies:** None (pure TypeScript implementation)

## Canonical Serialization

Before hashing, payloads are canonicalized:

1. **Recursive key sorting:** All object keys sorted alphabetically at every level
2. **Array order preserved:** Array elements maintain their order
3. **Null vs absent:** `null` is distinguished from missing field
4. **Undefined rejected:** `undefined`, functions, and non-serializable values throw
5. **Date normalization:** `Date` objects converted to ISO strings
6. **Order-independent:** Two identical payloads with different key order produce identical canonical form
7. **Excluded fields:** Only explicitly excluded fields (e.g., the footprint itself) are omitted

## Essential Test

Two semantically identical payloads with keys inserted in different order **must** produce the same structural footprint.

## Versioning

The footprint includes a `version` field (currently `1`) for future algorithm evolution. Payload consumers should check the version before comparison.

## Exports

```typescript
// Non-cryptographic structural footprint
computeStructuralFootprint(payload, excludedFields?): StructuralFootprint
validateStructuralFootprint(payload, footprint): boolean
canonicalSerialize(value): string
fnv1a(str): string
```
