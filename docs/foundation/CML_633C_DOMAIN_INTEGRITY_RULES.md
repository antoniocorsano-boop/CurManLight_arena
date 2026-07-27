# CML-633C Domain Integrity Rules

| Classification | Rule |
|---|---|
| Error | Entity ID and metadata must be valid; source, version, segment, node and link types/states must be recognized. |
| Error | A segment references a curriculum version; a node references both its segment and version; a link endpoint must be resolvable. |
| Error | Links cannot be self-relations and must use a recognized status. |
| Error | A node and its segment must belong to the same version; duplicates are detected by normalized text and context is retained in the ID seed. |
| Warning | A source, node or version promoted to active while legacy requires explicit confirmation. |
| Warning | Duplicate source titles or logical duplicate nodes require review, not automatic deletion. |
| Incomplete | A node without a normative source, an empty segment/version, a missing or multi-valued legacy nucleus, or incomplete source metadata is surfaced without fabrication. |
| Information | Legacy and experimental records remain labelled and separate; experimental proposals do not become active curriculum. |

`checkReferentialIntegrity`, `detectDuplicateNodes`, and `detectDuplicateSources` are pure checks. The in-memory repository has no DOM, React, IndexedDB, or remote dependency.
