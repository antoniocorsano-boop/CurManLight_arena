# Arena R7C5C2 — Source-review receipt round-trip

Date: 2026-09-03

## Purpose

R7C5C2 makes the R7C5C1 human source-review receipts portable and recoverable without weakening the authority model.

The problem addressed is operational: source verification can span many sessions and machines. A local-only receipt set must be exportable and recoverable, but an import must never silently replace an already recorded human decision.

## Contract

The exchange package uses schema:

`dm221-final-publication-source-review-package-v1`

It binds the exported receipts to:

- source id `dm-221-2025-indicazioni-nazionali`;
- the registered final MIM curriculum-volume URL;
- print edition `2026-03`;
- page numbering contract `PRINTED_PAGE`;
- the current structural inventory size of 868 elements.

This is an edition/registry binding, not a cryptographic fingerprint of the PDF bytes. It therefore does not satisfy any later requirement that explicitly demands a content SHA-256 before `NATIONAL_PRESCRIPTIVE` authority can be attributed.

## Import policy

Each incoming receipt is revalidated against the current 868-slot queue.

- valid receipt with no local counterpart → `ADDED`;
- byte-equivalent receipt already present → `DUPLICATE`;
- different valid receipt for an element already present → `CONFLICT` and the local receipt is retained;
- invalid identity/locator/attestation → `INVALID`.

A package bound to a different registered publication or inventory size is rejected as a whole.

R7C5C1 raw JSON receipt arrays remain accepted as a compatibility input. New exports use the bound package schema.

## Authority boundary

Import/export never creates a new human verification. It transports receipts that already carry a human attestation and revalidates their structural/source binding.

It does not:

- pre-fill source text;
- convert `NEEDS_CORRECTION` or `REJECTED` into `VERIFIED`;
- resolve conflicts automatically;
- map institute curriculum content to national elements;
- adopt or promote an institute curriculum;
- mutate P3/P7 authority.

## User surface

`FinalPublicationSourceReviewWorkbench` wraps the R7C5C1 review task and adds two explicit actions:

- **Esporta pacchetto**;
- **Importa verifiche**.

Import results report added, duplicate, conflict and invalid counts. Conflicts are never overwritten automatically.
