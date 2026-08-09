# CML-631F-RB-D1R1 Mockup / Reality Reconciliation

**Status:** `APPROVED / CANONICAL`
**Purpose:** record what the historical product language intends, what the current checkout actually supports, and what becomes target rather than fact.

## 1. Source inventory

| Source | Intent | Reliability for target | Reality status |
|---|---|---|---|
| `docs/04_product_experience/00_VISION.md` | teacher/school mission, offline-first, school language, role-aware experience | high for values; low for current capability claims | mixed: many capabilities are broader than current runtime |
| `docs/04_product_experience/01_INFORMATION_ARCHITECTURE.md` | five-area sidebar with Home, Curriculum, Planning, Class, support/knowledge and Copilot overlay | high for historical information architecture | partly superseded by frozen React Router/shell baseline and newer Teacher Workspace contracts |
| `docs/04_product_experience/02_NAVIGATION_MODEL.md` | state-based navigation, tabs, technical status controls and global Copilot | useful as interaction history | conflicts with current frozen routing/shell and target disclosure policy in places |
| `docs/04_product_design/13_INTERACTION_MODEL.md` | rail/header, cards, overlays, state transitions and accessibility patterns | useful visual/interaction reference | must be filtered for prototype density and technical labels |
| `docs/04_product_design/14_BEHAVIOUR_SPECIFICATION.md` | detailed flows for curriculum, revision, UDA, class and export | useful for existing behavior comparison | not a target IA by itself; contains implementation assumptions |
| `docs/07_product_evolution/CML-617A_ACTIVITY_MOCK.md` | recent activity and teacher workspace orientation | high and already reflected in baseline | keep, constrained by CML-620/621/625/627 |
| CML-635A workspace identity design | explicit local institutional context and snapshots | high for context semantics | design proposed, not a blanket claim of runtime completion |
| CML-638B/CML-636B document contracts | canonical document continuity, preview and export | high for document target | current branch contains the related local work; integration status must remain explicit |
| CML-630E/633C curriculum domain | canonical curriculum entities, sources, nodes, links, statuses and adapters | high for domain truth | current runtime still exposes legacy/read-model surfaces in places |
| CML-631F self-validation materials | observed confusion and real teacher findings | highest for gaps | the reason for this target gate |

The named D1 unified direction file was not present in the checkout. This absence is itself a reconciliation note, not an invitation to invent its contents.

## 2. Historical mockup language to retain

Retain these elements:

- a professional teacher environment rather than a generic CRUD application;
- Home as an orientation and continuation surface;
- teacher-facing language: curricolo, progettazione, UDA, classe, documento;
- a stable navigation rail/sidebar with visible current location;
- context headers and clear empty/attention states;
- curriculum consultation by discipline, school order and class/level;
- UDA guided completion with autosave/continuation where supported;
- document preview and professional export;
- assistant available in context and local/offline-first privacy boundaries;
- accessible keyboard/focus behavior and reduced-motion support;
- recent activity constrained to meaningful UDA/document work.

## 2.1 Mockup classification

| Classification | Sources/elements | Rule |
|---|---|---|
| `CANONICAL` | Teacher Workspace activity direction; the reconciled language in section 6; context header, professional object, contextual actions, status/attention, assistant entry | May guide implementation and validation |
| `SUPPORTING` | Historical vision, information architecture, interaction and behavior specifications | May provide patterns or interaction detail only when consistent with the Product Contract |
| `SUPERSEDED` | Technical dashboard widgets, standalone Copilot world, “Integrazione & Popolamento” as primary destination, equal-weight tool/card launchers and prototype-heavy labels | Must not guide implementation |

No historical screenshot or document overrides the canonical Product Contract.

## 3. Historical elements to supersede or constrain

| Historical element | Decision | Reason |
|---|---|---|
| Five-area sidebar as a direct implementation map | `RENAME / MERGE` | target uses professional areas, not historical state names; frozen shell/routing remains authoritative |
| “Consulta Curricolo” as the entire curriculum model | `RENAME / CONTEXTUALIZE` | teacher must know reference vs local working curriculum vs proposal |
| “Vista Strutturata”, “Raccordo Diacronico” as primary product destinations | `CONTEXTUALIZE` | useful views inside Curriculum, not separate mental models |
| “Integrazione & Popolamento” | `ADVANCED / CONTEXTUALIZE` | operation language is technical; expose import/propose/revise when relevant |
| “Revisione Gap 2025” | `RENAME` | retain domain value, use teacher language such as “Revisione del curricolo” with provenance and status |
| “Processo & Consenso” | `MERGE / ADVANCED` | expose review/decision status on UDA/document/curriculum; keep institutional consensus only where supported |
| “Esportazione File d’Ufficio” | `MOVE` | Documents owns preview, versions and print/PDF; format choice is contextual |
| “Co-pilota Chat” as a primary world | `MOVE / CONTEXTUALIZE` | assistant is an overlay/entry attached to work, not a separate workflow |
| WebGPU, AI provider status, IndexedDB, service worker | `HIDE` | advanced diagnostics only; never Home content |
| Second Brain / WikiLLM as a broad primary destination | `ADVANCED / CONTEXTUALIZE` | retain source-backed help where it supports a visible work task |
| role-specific institutional dashboards | `CONTEXTUALIZE` | role and support must be real; do not claim remote permissions from declared role |
| equal-weight card grids and heavy uppercase badges | `REMOVE_FROM_PRIMARY_SURFACE` | conflicts with calm editorial target and increases cognitive load |

## 4. Disclosure matrix

| Current label | Real function in checkout/history | User value | Target label | Target location | Decision |
|---|---|---|---|---|---|
| Home Dashboard | current Teacher Workspace/dashboard and recent activity | resume work | Home | Home | `KEEP / REFRAME` |
| Consulta Curricolo | curriculum consultation/read model | inspect source content | Curricolo | Curriculum | `RENAME` |
| Vista Strutturata | tree/accordion curriculum view | inspect hierarchy | Vista del curricolo | Curriculum | `CONTEXTUALIZE` |
| Raccordo Diacronico | vertical map/links | understand progression | Progressione verticale | Curriculum | `RENAME` |
| Integrazione & Popolamento | CSV/AI/import and generated curriculum operations | add or propose content | Importa o proponi contenuti | Curriculum contextual action / Advanced | `RENAME / MOVE` |
| Revisione Gap | review/proposal decisions | identify and decide gaps | Revisione del curricolo | Curriculum | `RENAME` |
| Fonti locali / Fonti d’Istituto | source/knowledge consultation | know origin and institutional material | Fonti e riferimenti | Curriculum or contextual Assistant | `MERGE` |
| Pilota sperimentale | pilot/test surface | no ordinary teacher value | — | none | `REMOVE_FROM_PRIMARY_SURFACE` |
| Progettazione UDA | guided UDA workflow | create didactic plan | Progettazione | Planning | `RENAME / KEEP AREA` |
| Compilatore | wizard/editor | complete fields | UDA in lavorazione | Planning | `RENAME` |
| Archivio locale / Archivio UDA | saved local UDA list | reopen and reuse | Le mie progettazioni | Planning | `RENAME` |
| Matrice competenze | curriculum/UDA competency relation | check coverage | Copertura e competenze | Planning contextual view | `RENAME / MOVE` |
| Processo & Consenso | decision and institutional review workflow | human review | Revisioni e decisioni | relevant object / Institute | `MERGE` |
| Esportazione File d’Ufficio | Word/ODF/PDF/download handlers | produce office output | Documenti | Documents | `MOVE` |
| Document preview/print | canonical document version preview and print | inspect before export | Anteprima documento | Documents | `KEEP` |
| Classe | classroom/social/local outcome tools | work for a group | Classe | Class | `KEEP / CONTEXTUALIZE` |
| Collegio | institutional collective view | only for supported institutional role | Istituto | Institute | `CONTEXTUALIZE` |
| Checklist | validation/attention list | know what is missing | Richiede attenzione | Home or object status | `MERGE` |
| WikiLLM | source-backed knowledge reader/query | ask about sources | Fonti e assistenza | contextual | `RENAME / MOVE` |
| Guida | operational help | learn how to proceed | Guida | Settings/help | `KEEP / MOVE` |
| Co-pilota Chat | chat panel and AI suggestions | get contextual help | Assistente | contextual entry | `RENAME / CONTEXTUALIZE` |
| WebGPU | technical AI capability status | none in daily workflow | — | Settings > Avanzate | `HIDE` |
| Drive / Cloud | optional sync/account flow | optional backup/sync | Dati locali / Sync | Settings > Dati locali | `MOVE` |
| SCORM | export/integration capability | not target-critical | — | backlog | `NOT_YET_SUPPORTED` |
| Import studenti | classroom data import | configure class data | Importa dati classe | Class/Settings | `CONTEXTUALIZE` |

## 5. Current runtime reality

### Supported or materially present

- React 18 + TypeScript + Vite + Tailwind, with frozen React Router v7 shell.
- Teacher Workspace Home behavior and recent activity contracts, including direct UDA continuation.
- Onboarding/session state for role, school order, discipline, classes and combinations.
- Curriculum read surfaces, legacy `curriculumKB` compatibility and canonical curriculum domain contracts for sources, versions, segments, nodes, links and validation.
- UDA guided workflow, local saved UDA archive, target class/section state and classroom/social surfaces.
- Canonical document continuity types, document export history and local preview/print/export work in the current product lineage.
- Local institutional archive/context contracts and local persistence/backup paths.
- Contextual or overlay-style copilot/WikiLLM capabilities with explicit local/provider boundaries; governance still requires product-surface alignment.

### Contract/design exists but must not be overstated

- `WorkspaceIdentity` and unified configuration are described as proposed/adaptation work, not proof of a finished single teacher context.
- The canonical curriculum domain is publicly exported, but some visible curriculum surfaces still derive from legacy/read-model data.
- Canonical documents and preview/export are present in the current local lineage, but the target requires the teacher-facing Documents area to expose status, version, provenance and approval coherently.
- Role-aware capability work must not be interpreted as authenticated remote authorization.
- Institutional and collaborative views exist in the historical UX/domain direction, but their target exposure depends on actual supported data and role context.

### Historical/mockup-only or advanced

- A complete six-role institutional dashboard with live permissions.
- Full remote collaboration, cloud governance, SCORM and every listed institutional certification workflow.
- Technical launchers for WebGPU, diagnostics, providers and storage.
- A standalone chatbot product separate from the teacher workflow.

## 6. Canonical target mockup language

The canonical language is the intersection of approved intent and runtime truth:

```text
calm teacher workspace
  → visible personal/institutional context
  → one primary professional object
  → contextual actions
  → status and next decision
  → assistant help bounded by the visible context
```

It uses readable editorial surfaces, a stable rail/sidebar, a context header, meaningful progress, semantic state colors, restrained cards, explicit empty states and teacher language. It does not use technical status as primary content, nor does it give every capability equal visual weight.

## 7. Reality-to-target gap summary

| Area | Current | Target | Gap | Dependencies | Risk | User value | Implementation slice |
|---|---|---|---|---|---|---|---|
| Onboarding | role/order/discipline/classes state exists | one understandable environment setup | configuration concepts may be split | workspace identity, Settings | medium | high | P2.1 |
| Home | Teacher Workspace/recent activity exists | work continuation + attention + context | target composition and technical disclosure | CML-617A/B/CML-627, context | low/medium | high | P3.1 |
| Navigation | historical labels plus frozen Router/shell | professional areas with advanced disclosure | IA and labels diverge | P1.1, frozen shell | medium | high | P1.1/P3.1 |
| Curriculum | canonical domain plus legacy/read surfaces | provenance/state-first curriculum workspace | semantic labels and surface mapping | curriculum contracts | high | high | P4.1 |
| Target context | target class/section state exists in planning | every operational view names class/group | not uniformly surfaced | P2.2 | medium | high | P1.2/P2.2 |
| Planning | guided UDA and archive exist | curriculum-selected, class-targeted workflow | continuity and next-step visibility | P4.1, existing UDA flow | medium | high | P4.2 |
| Documents | canonical document/preview/export lineage exists | professional object with version/status/approval | surface cohesion and human gate | CML-636B/638B | medium | high | P5.1 |
| Class | local classroom/social features exist | editable class context connected to work | configuration and privacy boundaries | onboarding/context | high | high | P2.2/P4.2 |
| Institution | archive/context contracts and historical views | only supported institutional surfaces exposed | role/support truth must be explicit | workspace identity, role contracts | high | medium | P2/P5 |
| Assistant | copilot/WikiLLM handlers and local boundary | contextual explainer/proposer with approval | separate-chat mental model | context + governance | high | high | P5.2 |
| Settings | configuration pieces exist in session/workspace surfaces | one stable configuration home | disclosure/consolidation | P2.1 | medium | high | P2.1 |
| Visual system | rich but technical/card-heavy historical language | calm editorial and semantic | inconsistent density/labels | P3–P5 | medium | high | P6.1 |
| Human approval | revision/decision/export pieces exist | proposal→edit→approve→commit explicit | not consistently visible end-to-end | curriculum/doc/AI contracts | high | high | P5.1/P5.2/P6.2 |

## 8. Change control

This reconciliation is canonical together with the Product Contract and Roadmap. New mockups are classified as `CANONICAL`, `SUPPORTING` or `SUPERSEDED` before use. A new idea is classified as `TARGET_REQUIRED`, `TARGET_SUPPORTING`, `AFTER_TARGET`, `BACKLOG` or `REJECT`; it cannot alter the target without `TARGET_CONTRACT_CHANGE_APPROVED`.

## 9. Reconciliation verdict

`CML_TARGET_PRODUCT_BASELINE_APPROVED`

The three documents are now the canonical reference for the Product Experience Wave. This verdict does not authorize P1.1 implementation in this turn; P1.1 remains the single NOW increment and must first satisfy its visible-IA gate.
