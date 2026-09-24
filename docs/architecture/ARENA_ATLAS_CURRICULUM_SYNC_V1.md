# Arena → Atlas curriculum publication sync v1

## Decision

Arena remains the only curriculum authority. Atlas consumes a versioned read-only publication bundle and never becomes an authority source.

### Propagation flow

`Arena canonical master → Arena export bundle → Atlas sync watcher → Atlas PR → authority gate → human review → merge/publication`

Transport is automatic. Public visibility of an explicitly provisional/non-vigente curriculum may also be automatic after Atlas gates; institutional approval and vigency are not.

## Authority and publication gate

Public visibility and institutional vigency are distinct states.

- `PROVISIONAL_COMPLETE`: Atlas may publish the structurally complete curriculum publicly **only** with an explicit, persistent disclosure equivalent to **“Curriculum provvisorio — non vigente”** and with the pending institutional approval clearly stated. It MUST NOT claim an `authorityReceiptRef`, approval or vigency.
- `APPROVED`: requires `authorityReceiptRef` and a collision-resistant `sha256` integrity digest. Only this state may be presented by Atlas as approved/vigente after its own review/gates.
- Atlas never upgrades `PROVISIONAL_COMPLETE` to `APPROVED`; only Arena may propagate that authority transition.
- A fingerprint, authority-state, source-revision **or publication-policy** change must trigger/update the Atlas sync PR even when the nominal curriculum version is unchanged.
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
