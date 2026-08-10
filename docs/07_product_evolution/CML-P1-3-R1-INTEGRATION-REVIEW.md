# CML P1.3-R1 — Canonical Curriculum Consultation Integration Review

Date: 2026-08-10  
Scope: audit only; no runtime changes authorized or made.

## Human-path verdict

The complete teacher path is coherent:

`Curricolo → Lista → Albero → Grafo → Dettaglio → Usa nella progettazione → PLAN-02`

The browser smoke confirmed that the next surface preserves the working context and that the transferred curriculum reference is visible in the planning workspace.

## H2/H2V matrix

| Target | Function | Finding |
|---|---|---|
| CURR-01 | Consultazione vigente | MATCH |
| CURR-02 | Struttura ad albero | MATCH |
| CURR-03 | Relazioni a grafo | MATCH |
| CURR-04 | Comprensione del nodo | MATCH |
| CURR-04 → PLAN-02 | Uso didattico | MATCH |
| Contesto condiviso | Versione, ordine, disciplina e nodo | MATCH |
| Provenienza | Conservata nel dettaglio e nel riferimento trasferito | MATCH |
| Revisione curricolo | Non attivata dal percorso di consultazione | MATCH |

## Evidence

- Focused P1.3 UI tests: 6/6.
- Curriculum/design regression: 425/425.
- Fast regression: 273/273.
- Typecheck: green.
- Production build: green.
- Browser E2E: CURR-01, CURR-02, CURR-03, CURR-04 and PLAN-02 all reached.
- Browser console: no errors.
- PLAN-02 displayed the transferred `Dal curricolo vigente` selection.
- The post-transfer check found no revision/proposal language and no curriculum mutation path.
- Deterministic CURR-03 fixture: one real `CurriculumLink`, rendered source `B` → target `C`, with the directional arrow visible and the node/detail action available.

The production legacy dataset contains no links. CURR-03 therefore correctly renders zero synthetic edges in the normal smoke; the fixture supplies the complementary visual evidence without changing production data.

## Non-blocking environment note

`graphify hook-rebuild` remains an environmental non-blocker because it times out and produces no committed artifact. It does not affect the application gates or the R1 verdict.

## Verdict

```text
CML_TARGET_P1_3_CANONICAL_CURRICULUM_CONSULTATION_EXPERIENCE_COMPLETE
CML_TARGET_P1_3_CURR01_CANONICAL_LIST_CONFIRMED
CML_TARGET_P1_3_CURR02_CANONICAL_TREE_CONFIRMED
CML_TARGET_P1_3_CURR03_CANONICAL_GRAPH_CONFIRMED
CML_TARGET_P1_3_CURR04_CANONICAL_NODE_DETAIL_CONFIRMED
CML_TARGET_P1_3_CURRICULUM_TO_PLAN02_CONTINUITY_CONFIRMED
CML_TARGET_P1_3_H2_TRACEABILITY_CONFIRMED
CML_TARGET_P1_3_H2V_VISUAL_CONVERGENCE_CONFIRMED
CML_TARGET_P1_3_HUMAN_WORKFLOW_CONFIRMED
CML_TARGET_P1_3_REGRESSION_GATES_GREEN
NO_P1_4_RUNTIME_CHANGE_AUTHORIZED
```
