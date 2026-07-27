# CML-633D Institutional Configuration Implementation

> **Status:** DESIGN APPROVED, IMPLEMENTATION PENDING
> **Baseline:** `06a91a8`
> **Branch:** `feat/cml-633d-institutional-configuration`

## Objective

The teacher can configure the local institutional context once and reuse it consistently across planning, documents, exports and contextual filters without the product claiming verified identity or authority.

In the absence of an explicit configuration, every active product surface uses the neutral identity `Istituto non configurato`. Curriculum consultation remains available, while institutional exports expose an incompleteness warning and never add presumed signatures, codes, sites or authorities.

## Approved Boundary

CML-633D introduces `src/domain/institution/` as the canonical institutional boundary. It reuses CML-633B identity, metadata, actor and reference contracts and the CML-633C school-order vocabulary. It does not add authentication, authorization, workflow authority, remote services or a canonical Document entity.

The domain contains:

- `Institute`;
- `AcademicYear`;
- `InstituteSite`;
- `InstitutionalDocumentProfile`;
- `InstitutionalContext`;
- prudent configuration states and explicit transitions;
- structural validity and completeness classifications;
- a canonical repository over one institutional archive aggregate;
- serialization, backup/import preview and rollback;
- legacy detection without automatic activation;
- pure selectors for A04, A07 and other active consumers.

## Persistence Decision

The canonical archive is one versioned aggregate persisted atomically inside the existing Zustand state record stored in the existing IndexedDB `state` object store.

No Dexie table, object store or schema version is added. Logical boundaries remain separate:

- repository controls domain operations and integrity;
- persistence stores and restores the aggregate;
- backup/import validates envelopes and reports conflicts;
- active context contains references only and never replaces entities.

The aggregate supports multiple institutes, academic years and archived configurations, with at most one active institute reference and one active academic year per institute. Existing persisted state without the aggregate receives an empty, unconfigured archive. No legacy identity is activated during hydration.

## Data Flow

1. The configuration editor creates or updates a draft.
2. Pure validators distinguish structural errors from incomplete optional data.
3. Explicit local confirmation changes `draft` to `confirmed-local`; it never means verified or official.
4. The repository writes a complete archive snapshot through the existing Zustand persistence boundary.
5. Selectors derive active institute, active academic year, available orders, site, document header, completeness and warnings.
6. A04 consumes context values without rewriting existing UDA records.
7. A07 consumes one document-header selector. Missing configuration yields neutral identity and an export warning.
8. Backup exports a schema envelope. Import first returns a preview; only explicit apply can replace the archive, retaining the previous snapshot for rollback.

## Legacy Policy

Production literals representing the previous institute are detected and represented as one or more `legacy-imported` candidates with missing-field and conflict warnings. They are never confirmed or made active automatically. Discordant addresses or identities are not merged.

Historical source material under `src/data/volumesKB.ts`, `second-brain/`, audits and generated historical documentation remains unchanged. It describes archived content, not the current institutional configuration.

Active code paths must not synthesize the historical identity. This includes A04, A07, classroom reports, workspace defaults and filenames, WikiLLM generic responses, Copilot generic suggestions, dashboard identity and profile headers.

## Logo Policy

The document profile reserves an optional local logo descriptor with media type and size metadata. CML-633D does not enable SVG or remote logo import. If a raster logo value is accepted by an existing local flow, validators enforce an explicit size limit and allow only PNG, JPEG or WebP. Removing the logo is always possible.

## UI Integration

The existing profile/settings surface receives a minimal accessible institutional editor. No route, shell or navigation redesign is introduced. The editor supports:

- institute name and optional mechanical code;
- configured school orders;
- optional principal site;
- academic year creation and active selection;
- optional document heading fields;
- optional self-declared actor name and role;
- draft save, local confirmation and backup export.

Destructive archive actions require confirmation. Role copy explicitly says `Ruolo dichiarato per questa sessione`.

## Error Handling

- Invalid entities are rejected without mutating the archive.
- Only one academic year can be active for an institute.
- Unsupported future schemas are rejected before replacement.
- Import conflicts are reported and require explicit application.
- Failed persistence leaves the last valid archive intact.
- Missing optional site, code or contact fields produce incompleteness, not structural invalidity.

## Test Strategy

Implementation follows test-first increments covering:

- constructors, validators, completeness and state transitions;
- sites, school-order reuse and academic-year integrity;
- repository CRUD, active references and archive behavior;
- legacy candidates and no automatic activation;
- serialization, backup, preview, conflicts, future schema and rollback;
- selectors and neutral identity;
- persisted-store compatibility without Dexie schema changes;
- A04 context and A07 neutral/configured headers;
- regression scan preventing the previous identity from reappearing in active production paths;
- unchanged curriculum barrel and CML-630E/CML-631 tests.

## Completion Evidence

CML-633D can be declared complete only after TypeScript, relevant tests, the full suite, production build, Storybook build and diff checks pass, and the hardcoded identity register classifies every occurrence as removed, isolated fixture, demonstration or historical archive.
