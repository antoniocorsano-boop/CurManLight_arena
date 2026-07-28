# CML-633E Area Boundary Contracts

> Contract specifications for each cross-area transfer boundary.

## A11 → A02 (Knowledge Builder → Curriculum Editor)

**Payload:** Structured references to source knowledge nodes, target curriculum version, merge strategy, discipline, area.

**Pre-conditions:**
- Source nodes non-empty
- Target version ID present
- Merge strategy in allowed list
- Target discipline non-empty

**Post-conditions:**
- Created curriculum nodes reference target version
- Origin classified as 'A11'

**Allowed statuses:** Any (knowledge nodes are source-only)

## A02 → A03 (Curriculum Editor → Proposal Generator)

**Payload:** Node reference, current text snapshot, curriculum version, sources, evidences, context, origin, status.

**Pre-conditions:**
- Node reference valid
- Text snapshot non-empty
- Curriculum version reference present
- Status in allowed list ('draft', 'under-review')

**Post-conditions:**
- Created proposals reference source node
- Status is NOT auto-approved

**Forbidden:** Auto-approval of proposals.

## A02 → A04 (Curriculum Editor → Teaching Design)

**Payload:** Node references, explicit snapshots, sources, evidences, curriculum version, origin, legacy warnings.

**Pre-conditions:**
- Node references non-empty
- Curriculum version reference present
- No auto-created document entities in node references

**Post-conditions:**
- Created entries reference curriculum nodes
- Legacy warnings preserved

## A03 → A04 (Proposal Generator → Teaching Design)

**Payload:** Proposal references with statuses, allowed states.

**Pre-conditions:**
- Proposal references non-empty
- Only explicitly allowed states
- Non-approved proposals flagged as warnings

**Post-conditions:**
- Approved proposals become curriculum entries
- Non-approved proposals excluded or qualified as "proposed content"

**Forbidden:** Non-approved proposals becoming current curriculum.

## A04 → A07 (Teaching Design → Export Center)

**Payload:** Design identification, curriculum references, sources, institutional context, teaching structure, assisted content origin, version/snapshot, warnings.

**Pre-conditions:**
- Design ID present
- No auto-created document entities

**Post-conditions:**
- Teaching plan created (not document entity)
- Institutional context preserved
- Structural footprint valid

**Forbidden:** Auto-creation of persistent document entities.
