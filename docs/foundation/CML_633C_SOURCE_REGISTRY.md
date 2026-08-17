# CML-633C Source Registry

> Updated by CURR-R0 source reconciliation on 2026-08-17.

The registry records provenance and authority. A source record documents where content comes from; it does not automatically promote imported content to active curriculum or institutional approval.

| ID seed | Title | Type | Authority | Date / Version | Status | Completeness | Origin / locator | Linked nodes | Warnings |
|---|---|---|---|---|---|---|---|---:|---|
| `national-2012|dm-254-2012` | D.M. 16 novembre 2012, n. 254 — Indicazioni nazionali per il curricolo della scuola dell'infanzia e del primo ciclo d'istruzione | national normative | verified official | 2012; GU 05-02-2013; effective 20-02-2013 | verified | acquisition pending | Gazzetta Ufficiale — codice redazionale `13G00034` | 0 | immutable national source; full annex still to be normalised |
| `national-2025|dm-221-2025` | D.M. 9 dicembre 2025, n. 221 — Indicazioni nazionali per il curricolo della scuola dell'infanzia e del primo ciclo d'istruzione | national normative | verified official | 2025; GU 27-01-2026; effective 11-02-2026 | verified | acquisition pending | Gazzetta Ufficiale — codice redazionale `26G00021` | 0 | definitive adopted regulation; preliminary 2025 consultation drafts are not authoritative substitutes |
| `curriculumKB|source` | curriculumKB legacy | legacy | unavailable | unavailable | legacy | partial | repository legacy archive | 471 | provenance record only; not a normative citation; no automatic promotion |
| `avic849003|curriculum-csv` | CURRICOLO_VERTICALE_D_ISTITUTO_COMPLETO_AVIC849003.csv | institutional candidate | unverified | repository corpus | candidate | partial / macro-framework | repository root | unavailable | useful for migration and completeness tests; not national normative content |
| `milani|curriculum-book` | CURRICOLO_VERTICALE_COMPLETO_MILANI.md | institutional candidate | unverified | repository corpus | candidate | partial / structured | repository root | unavailable | self-declared approval/alignment is not proof of institutional adoption |
| `curriculum|density-audit` | ANALISI_METRICA_DENSITA_E_PERVASIVITA_CURRICOLO.md | diagnostic | analytical only | 2026-07-16 | diagnostic | n/a | repository root | 0 | quality-control report; not curriculum authority |
| `curriculum|task-force-governance` | Task-force / curriculum governance process material | governance candidate | unverified | repository corpus | candidate | n/a | repository documents | 0 | process-design material; not evidence of a real institutional act unless independently verified |

## Authority rules

1. National normative sources must be linked to independently verifiable official publication.
2. Institutional sources require independent evidence of adoption/approval before being marked verified.
3. File names, internal labels such as `APPROVATO`, `VIGENTE`, `CERTIFICATO`, or equivalent prose do not establish authority by themselves.
4. Legacy/generated/diagnostic material may support migration, testing or analysis but cannot become national normative content by inference.
5. Source registration and curriculum-node activation remain separate operations.
