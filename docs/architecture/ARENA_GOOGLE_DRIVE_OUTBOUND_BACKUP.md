# Arena Google Drive Outbound Backup — Slice C

**Status:** implementation candidate; activation requires an explicit credential integration and human validation  
**Parent:** PR #203 contextual source registry  
**Boundary:** CML-DRIVE-01

## Purpose

Slice C implements the Google Drive side of the provider-neutral `BackupSink` contract without making Drive part of Arena's canonical runtime.

The only supported direction is:

`Arena canonical snapshot → CML backup package → Google Drive → BackupReceipt`

There is deliberately no inverse API in this slice.

## Backup artifact

A provider-neutral backup artifact contains:

- exact canonical payload bytes;
- SHA-256 hash of those exact bytes;
- `CmlBackupManifest` with object counts and source-registry schema version.

The provider never creates or reinterprets canonical content. It receives an already-defined artifact.

## Package format

Drive stores a single `.cml-backup` object. The binary envelope is deterministic:

1. `CML_BACKUP_PACKAGE_V1\n` magic bytes;
2. four-byte unsigned big-endian manifest length;
3. UTF-8 JSON manifest;
4. raw canonical snapshot payload bytes.

`manifest.contentHash` refers to item 4 only. This permits a future restore flow to decode the envelope, independently recompute the payload hash and apply the existing restore validation contract.

## Google Drive write protocol

`GoogleDriveBackupSink` uses Drive's resumable upload flow:

1. recompute payload SHA-256 locally;
2. reject immediately if it differs from the manifest;
3. obtain a short-lived access token from an injected provider;
4. create a resumable Drive upload session;
5. accept the resumable location only when it is HTTPS and belongs to a trusted Google API/content host;
6. upload the single `.cml-backup` envelope;
7. create a `BackupReceipt` containing the Drive object ID.

The Drive file carries app properties for inspection (`schema`, `backupId`, `contentHash`, direction and authority effect). Those properties are metadata only and never become canonical state.

## Credential boundary

This slice **does not implement OAuth login** and does not add client IDs, refresh tokens or secrets to the repository.

The adapter receives:

`accessTokenProvider(): Promise<string>`

The provider is called only when `writeSnapshot` is explicitly invoked. The token:

- is never written to IndexedDB/localStorage;
- is never returned in the backup receipt;
- is never placed in the backup package;
- is not logged by the adapter.

A later host/institution integration may supply the token. Arena remains usable when no such integration exists.

## No inbound authority

`GoogleDriveBackupSink` implements `BackupSink` only. It exposes no method to:

- list Drive files;
- read a backup;
- watch Drive changes;
- synchronize Drive state;
- promote a Drive file to a source;
- alter source verification/authority/validity.

Therefore a successful upload has exactly one semantic effect: creation of a backup receipt with `authorityEffect = none`.

## Failure semantics

The operation fails before Drive contact when:

- manifest schema/product/id/hash is invalid;
- source-registry schema version is invalid;
- payload hash does not match the manifest;
- no access token is supplied.

The operation also fails closed when:

- Drive does not return a resumable location;
- the location is not a trusted Google HTTPS host;
- upload initialization fails;
- binary upload fails;
- Drive does not return a remote object ID.

No partial failure changes Arena's canonical state.

## What is not yet activated

This slice supplies the production adapter and package format, not a user credential flow. A visible **Backup su Google Drive** command must not be enabled until Arena has a governed way to provide a short-lived Drive token after an explicit user action.

That activation must preserve the same rules: no background sync, no stored Drive credentials, no authority inference, and no inbound mutation.

## Next boundary

Slice D is restore/import. It must remain a separate explicit flow:

`select backup → decode → recompute hash → preview → human confirm → restore`

It must not reuse this outbound adapter as a synchronization channel.
