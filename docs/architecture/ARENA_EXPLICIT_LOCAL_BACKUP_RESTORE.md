# Arena Explicit Local Backup Restore — Slice D

**Status:** implementation candidate; human validation required  
**Parent:** PR #205 explicit Google Drive backup action  
**Boundary:** CML-DRIVE-01

## Purpose

Slice D restores the local personal Source Registry from a `.cml-backup` package through a provider-neutral, explicit human flow.

The sequence is fixed:

`select package → decode → verify schema/hash → validate sources/governance → preview effects → explicit human confirmation → atomic local replacement`

Selecting a file never writes data.

## Provider boundary

Restore does not call Google Drive and does not add `list`, `read`, `watch` or `sync` capabilities to the outbound Drive adapter. A `.cml-backup` package may come from any user-controlled file location. Drive remains a storage provider, not an inbound source of canonical truth.

## Scope boundary

This slice restores only the **local personal source registry** represented by `CML_LOCAL_SOURCE_REGISTRY_SNAPSHOT_V1`:

- local user-uploaded sources;
- exact source-version identifiers;
- governance records associated with those exact versions.

The manifest must declare zero curriculum versions, revisions and workspaces. A package claiming broader Arena state is rejected instead of being partially restored.

## Integrity validation

Before preview Arena verifies:

1. CML package magic and manifest shape;
2. supported backup and source-registry schema versions;
3. SHA-256 of the exact snapshot payload;
4. manifest object counts against decoded payload;
5. unique local source identities and governance bindings;
6. each governance fingerprint against the exact source content;
7. consistency between local source verification flags and governance verification status;
8. personal authority only.

Any authority level above `personal` is rejected for this restore surface. A backup file cannot promote a source to internal, institutional or normative authority.

## Local identity rule

The local principal stored in the browser is deliberately **not replaced** by a backup.

If a verified source in the package belongs to the same current local principal and its verifier matches that principal, verification may be preserved because exact content and exact governance have already been validated.

If the package belongs to another local principal, Arena:

- keeps the source content and contextual scope;
- rebinds the personal user scope to the current local principal;
- sets verification status to `imported`;
- removes inherited `verifiedBy` / `verifiedAt` from current governance;
- marks the local source `LOCAL_UNVERIFIED` / `PENDING_VERIFICATION` / `CONSULT_ONLY`;
- tells the user in the preview how many sources will need a new verification.

This is fail-closed: possession of a backup does not prove continuity of personal identity.

## Preview

The preview shows at least:

- backup creation timestamp;
- verified payload hash;
- number of sources in the backup;
- number of sources currently in the browser;
- number of verifications that can be preserved;
- number of sources requiring verification after restore;
- number of personal-principal rebindings.

The preview states clearly that the **current local source registry will be replaced**. It does not claim that any institutional or shared Arena state is affected.

## Confirmation and atomicity

Only the distinct action **Conferma ripristino locale** may apply the preview.

At confirmation the provider-neutral `validateRestoreRequest` is called with `humanConfirmed = true`, then sources and governance are replaced in one IndexedDB transaction. The browser's stable local principal metadata is preserved.

If validation or the transaction fails, Arena does not advertise a successful restore.

## Security consequences

A `.cml-backup` package is treated as untrusted input until all checks pass. The restore surface:

- caps selected package size;
- does not execute package content;
- does not derive authority from file name, location or provider;
- does not copy OAuth credentials or provider identifiers into source authority;
- rejects inconsistent or orphan governance;
- requires explicit confirmation for destructive replacement.

## Human gate

Technical green is insufficient. Human validation must confirm that a teacher understands three things before the slice can be promoted:

1. choosing a file is only a preview;
2. confirmation replaces the current local personal source registry;
3. sources whose personal identity cannot be proven after restore require a new verification.

## Out of scope

This slice does not restore shared workspaces, team outcomes, institutional decisions or the current institutional curriculum. Those objects require their own authority-aware backup/restore contract and must never be smuggled through the personal source-registry package.
