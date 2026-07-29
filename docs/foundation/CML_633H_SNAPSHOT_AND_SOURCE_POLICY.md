# CML-633H — Snapshot and Source Policy

## Immutable Snapshots

Every `DesignCurriculumSelection` stores two frozen text snapshots:
- `currentTextSnapshot`: frozen copy of the source at transfer time
- `selectedTextSnapshot`: the text placed into the teaching design

Neither snapshot is updated automatically when the source changes.

## Source Comparison

`compareSelectionWithSource(selection, sourceCurrentText)` returns:

| Source State | Condition |
|-------------|-----------|
| `source-current` | `sourceCurrentText === selection.currentTextSnapshot` |
| `source-updated` | `sourceCurrentText !== selection.currentTextSnapshot` |
| `source-unavailable` | `sourceCurrentText === undefined` |
| `source-legacy` | `selection.qualification === 'legacy-content'` |

## Explicit Update Only

Updating a snapshot requires explicit action via `replaceSelectionSnapshot(archive, id, newSnapshot)`. This:
- Creates a new archive (immutable pattern)
- Updates `selectedTextSnapshot` and `currentTextSnapshot`
- Updates `metadata.updatedAt`
- Does NOT modify the source
- Does NOT create a new selection

## Source Status Changes

`markSourceStatusChanged(archive, selectionId, reason)` handles:
- `decision-revoked`: decision linked to the selection was revoked
- `decision-superseded`: decision was superseded by a newer one
- `proposal-superseded`: proposal was replaced
- `source-unavailable`: source entity no longer resolvable

Effect:
- Updates `comparisonState` to `source-updated` or `source-unavailable`
- Adds warning to the selection
- Preserves the selection as historical reference
- Does NOT delete the selection
- Does NOT modify the source

## What Never Happens
- No automatic snapshot update
- No silent replacement
- No deletion of historical snapshots
- No modification of source entities
- No automatic promotion of legacy content