# Arena Google Drive Backup Action

**Status:** stacked implementation candidate  
**Parent:** PR #204 — outbound Google Drive backup adapter  
**Boundary:** CML-DRIVE-01

## User goal

Arena must offer a clear, explicit action to back up the local personal source registry without turning Google Drive into a runtime dependency, source of truth or authority provider.

The visible action is intentionally scoped as:

`Backup delle fonti personali → autorizzazione temporanea → snapshot locale → Google Drive → ricevuta`

It is not a whole-product backup and does not claim to include institutional workspaces, curriculum decisions or shared canonical state.

## Activation rule

The action is enabled only when:

1. at least one personal source exists locally;
2. a public Google OAuth client ID is configured;
3. no backup operation is already running.

Configuration is resolved from `VITE_GOOGLE_DRIVE_BACKUP_CLIENT_ID`, with the existing public `VITE_GOOGLE_CLIENT_ID` accepted as a compatibility fallback. A client ID is configuration, not a secret.

If no client ID is configured, Arena remains fully usable and the UI states that Drive backup is unavailable in the current release.

## Authentication boundary

The user starts the operation by pressing **Backup su Google Drive**. Only then Arena loads Google Identity Services and requests an access token with the single scope:

`https://www.googleapis.com/auth/drive.file`

The token provider:

- requests no refresh token;
- stores no access token in localStorage, sessionStorage or IndexedDB;
- does not expose the token to the backup receipt;
- does not put the token in the backup package;
- does not run in background;
- does not authorize Drive list/read/watch/sync operations.

The token is supplied directly to the outbound `GoogleDriveBackupSink` for the one human-started operation.

## Data boundary

The current action backs up only the local personal source registry introduced by CML-DRIVE-01:

- user-uploaded local sources;
- exact source-version identifiers;
- persisted source governance records;
- contextual validity and provenance already present in those records.

The snapshot continues to use the exact manifest/hash/package pipeline implemented by PR #204.

## Authority boundary

A successful backup produces a `BackupReceipt` with:

- `provider = google-drive`;
- `direction = outbound-backup`;
- `authorityEffect = none`.

No source changes verification status, authority level or validity because it has been written to Drive. The Drive object ID remains a provider-owned reference only.

## Failure semantics

Authorization cancellation, GIS loading failure, payload-integrity failure or Drive upload failure must leave Arena's local and canonical state unchanged. The UI reports failure without implying that a partial upload was adopted or synchronized.

## Human-facing wording

The surface must say **Backup delle fonti personali**, not generic **Backup Arena**, because this slice does not yet cover all Arena state. It must also state that Drive does not make any source institutional or normative.

## Restore remains separate

This action is outbound-only. No restore button is introduced here. Restore/import remains a separate Slice D with its own sequence:

`select package → decode → verify schema/hash → preview changes → explicit human confirmation → atomic restore`

That future flow must not turn Drive into a bidirectional synchronization channel.
