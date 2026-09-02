# Arena R7A8 — Canonical Materialization + Authoritative Bootstrap

Status: **IMPLEMENTATION_IN_PROGRESS**

## Purpose

R7A7 can atomically adopt a server-known `PREPARED` canonical candidate, but it deliberately does not create that candidate or establish the first authoritative canonical head. R7A8 closes those two prerequisites without allowing Dexie/localStorage, free text, or an unbound client artifact to become canonical authority.

## Authority model

R7A8 introduces an immutable server-side canonical materialization artifact. Every artifact stores the exact UTF-8 payload text, a server-recomputed SHA-256 fingerprint, the canonical version it materializes, its provenance and the authenticated principal that created it.

Two distinct operations are allowed:

1. **Genesis bootstrap** — one-time workspace bootstrap by an authenticated `amministratore` (`WORKSPACE_ADMIN`). It is permitted only when no shared canonical head exists. It creates the first immutable materialization, the first `ACTIVE` canonical version and the first canonical head atomically. It does not fabricate an adoption receipt.
2. **Candidate preparation** — performed by an authenticated `dirigente` only after an authoritative R7A6 adoptive decision exists. The payload must bind exactly to the decision proposal/version/fingerprint and to the current canonical head. It creates an immutable materialization plus one `PREPARED` canonical version, but does not activate it. Activation remains exclusively R7A7 `CURRICULUM_ADOPT`.

## Payload contracts

Genesis exact top-level keys:

`schemaVersion`, `kind`, `canonicalVersionRef`, `curriculum`

with `schemaVersion = 1` and `kind = "GENESIS"`.

Candidate exact top-level keys:

`schemaVersion`, `kind`, `canonicalVersionRef`, `baseCanonicalVersionRef`, `proposalRef`, `proposalVersionRef`, `proposalVersionFingerprint`, `curriculum`

with `schemaVersion = 1` and `kind = "CANDIDATE"`.

The server parses the text as JSON, rejects extra/missing top-level keys, verifies all authority-binding fields, hashes the **exact supplied UTF-8 text** with SHA-256 and requires equality with the expected lowercase 64-hex fingerprint.

`curriculum` is the materialized curriculum document. R7A8 does not interpret a revision proposal as executable patch instructions and does not synthesize curriculum from `proposedText`. The materialization payload is therefore explicit, immutable and human-accountable rather than silently inferred.

## Invariants

- no local fallback or local canonical success;
- no second genesis bootstrap once a head exists;
- bootstrap and candidate preparation are workspace-serialized;
- server-session principal must equal `WorkspaceActorContext` principal;
- fresh active membership and active workspace are re-read in every operation;
- candidate base must equal the current authoritative canonical head;
- candidate decision must be current, adoptive and `shared_proposal_authority_version = 1`;
- one decision may prepare only a materialization with the exact same proposal/version/fingerprint binding;
- `materialization_ref`, canonical version refs and consequential refs are trimmed, U+001F-free and PostgreSQL-representable;
- materialization rows are immutable; direct authenticated DML is revoked;
- R7A7 adoption remains the only operation that changes `PREPARED → ACTIVE` and supersedes the previous canonical head.

## Non-goals

No UI, no deploy, no automatic proposal-to-curriculum patch engine, no migration of Dexie state into authority, no weakening of R7A5/R7A6/R7A7 gates.
