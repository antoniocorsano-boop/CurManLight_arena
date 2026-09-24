# Arena → Atlas curriculum publication sync v1

## Decision

Arena remains the only curriculum authority. Atlas consumes a versioned read-only publication bundle and never becomes an authority source.

### Propagation flow

`Arena canonical master → Arena export bundle → Atlas sync watcher → Atlas PR → authority gate → human review → merge/publication`

Transport is automatic. Institutional approval is not.

## Authority gate

- `PROVISIONAL_COMPLETE`: Atlas may fetch and preview the candidate, but the sync PR MUST NOT be promoted to public `main`.
- `APPROVED`: requires `authorityReceiptRef` and a collision-resistant `sha256` integrity digest. Only then may Atlas publish after its own review/gates.
- A fingerprint change triggers a new Atlas sync PR even when the nominal curriculum version is unchanged.
- Withdrawal/supersession must produce a new Arena export state; Atlas never infers it locally.

## Canonical source

Initial materialization is derived from:
- `CAN-CURR-MASTER-00_Curricolo_verticale_integrale_unificato_3-14_2026-2027`
- Drive ID `12eWTPUZBJxZixd6-p8drNAaW5_eL8qWpXZUSDyZZAv4`
- master state at materialization: `MATERIALIZED / HUMAN_VALIDATION_OPEN / NOT_IN_FORCE`

The current bundle is therefore intentionally `PROVISIONAL_COMPLETE`.

## Coverage

The initial bundle materializes:
- 5 native Infanzia fields × ages 3/4/5;
- 11 ordinary Primary disciplines × classes I–V;
- 12 ordinary lower-secondary disciplines × classes I–III;
- Latino LEL, Educazione civica and AI literacy as separate/transversal structures.

## Update rule

After this bootstrap, Arena release/promotion is responsible for updating `exports/atlas-curriculum/current.json`. Atlas polls that path and creates/updates its sync PR automatically.
