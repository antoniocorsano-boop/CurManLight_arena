# CML-633C CML-631 Compatibility

| Category | Treatment |
|---|---|
| CML-631 dataset | preserve as legacy; no implicit conversion |
| Segments and nodes | reusable only through explicit future adapter; canonical aliases avoid name conflicts |
| VerticalCurriculumLink | preserve as legacy persistence contract; canonical links coexist and do not replace it |
| Experimental pilot data | retain status and provenance; not promoted to active curriculum |
| Legacy persistence | unchanged; no IndexedDB schema or store migration |
| Barrel consumers | protected by `c4c976f` regression test and legacy exports |

The legacy barrel continues to export `CurriculumNode`, `CurriculumSegment`, `VerticalCurriculumLink`, legacy validators, transition helpers, and `VALID_LINK_STATUSES`. The canonical equivalents use explicit `Canonical*` aliases. No pilot route or ordinary navigation is reactivated.
