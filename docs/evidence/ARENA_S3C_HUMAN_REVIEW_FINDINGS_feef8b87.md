# ARENA-S3C — Human review findings

Date: 2026-08-29
Release SHA: `feef8b876e98c3d4a4b78d89f41f6600b580ba0e`
Beta: `https://antoniocorsano-boop.github.io/CurManLight_arena/`
Review type: actual human desktop + mobile review
Gate: `BETA-G5 — Human Interaction Acceptance`
Verdict: `BETA_HIA_BLOCK`

## Release binding

The reviewed Beta release is the immutable release `feef8b876e98c3d4a4b78d89f41f6600b580ba0e`.

Before the human review:

- `Deploy Arena Beta #38` completed successfully on this SHA;
- the published `beta-release.json` exposed the same `releaseSha`;
- `Live Beta Assistant Browser Audit #12` completed successfully on the same SHA.

Automation is supporting evidence only and does not issue the human verdict.

## Human observation summary

The reviewer reports that almost all views are understandable and that the desktop representation is generally good, visible and readable. The current interaction, however, remains too cognitively demanding and too technical for the intended teacher audience.

The Beta/institutional part is perceived as excessively heavy during development. The reviewer cannot legitimately connect a real institution while the product is still being developed. Human acceptance must therefore not require fabrication of institutional membership or authority. Development-time validation must support a clear no-institution / no-authority path that remains useful and understandable while failing closed for consequential institutional actions.

On mobile, the reviewer reports excessive vertical scrolling, long surfaces and terminal parts of content being covered. Cards, text areas and content panels also use inconsistent lateral margins. These are material usability defects for the intended mobile workflow.

## Findings

### HVA-S3C-01 — Mobile terminal content can be obscured

Severity: `S2`
Status: `OPEN`
Gate effect: `BLOCKING`

On mobile, terminal parts of surfaces can be covered and long scrolling makes completion/review uncomfortable. A user must be able to reach, read and act on the final content of every critical card/panel without content being hidden by persistent controls, browser chrome assumptions or fixed UI elements.

Acceptance:

- no terminal content hidden at approximately `390x844`;
- final interactive controls remain fully visible and reachable;
- no critical journey requires awkward compensating scrolling;
- browser/mobile audit covers bottom-safe-area and terminal-content visibility.

### HVA-S3C-02 — Inconsistent horizontal spacing across cards and text areas

Severity: `S2`
Status: `OPEN`
Gate effect: `BLOCKING`

Cards, panels and text areas do not consistently share the same horizontal margins/padding rhythm. The visual system must expose one coherent mobile content gutter and a bounded set of intentional exceptions.

Acceptance:

- one canonical mobile content gutter/token;
- cards, text areas and primary content panels align to it;
- exceptions are explicit and tested rather than accidental;
- desktop spacing remains visually balanced.

### HVA-S3C-03 — Teacher-facing language and information architecture are too cerebral

Severity: `S2`
Status: `OPEN`
Gate effect: `BLOCKING`

The product is generally understandable, but asks the teacher to process too much technical/governance language. Arena must preserve authority and provenance semantics without exposing implementation/governance complexity as the primary reading burden.

Acceptance:

- primary labels and explanatory copy use teacher-task language;
- technical/governance detail is progressively disclosed;
- primary action and current state are understandable without reading long explanatory blocks;
- proposal, decision, authority and provenance remain semantically distinct after simplification;
- Human Task/HIM checks protect the simplified language from later regression.

### HVA-S3C-04 — Institutional Beta simulation is too heavy for development-time review

Severity: `S2`
Status: `OPEN`
Gate effect: `BLOCKING_FOR_CURRENT_HVA`

Current development cannot legitimately assume a live institutional connection. The human-review path must not require a real institution or fabricated membership/authority merely to exercise the product.

Required product rule:

> Development/no-institution mode must be a first-class, explicit and useful state. It may expose institutional actions as unavailable, but must explain why, preserve inspectability of the workflow and never pressure the reviewer to fabricate authority.

Acceptance:

- no-institution state is explicit and understandable;
- non-consequential review/inspection remains usable;
- institutional decisions remain fail-closed;
- the UI explains what requires a future real institutional connection;
- HVA can complete all legitimately observable non-authority interactions without connecting a real institution;
- unavailable authorized-decision observations are recorded as `NOT_OBSERVABLE` with reason, not simulated.

## Human acceptance verdict

`BETA_HIA_BLOCK`

Reason: the reviewed release is technically operational and broadly understandable, but severity-2 human-interaction findings remain open in mobile reachability/layout, spacing consistency, cognitive load/teacher language and development-time institutional interaction. Under the canonical G5 protocol, `BETA_HIA_PASS` cannot be recorded while an S2 human-interaction finding remains open.

## Remediation order

1. establish canonical responsive gutter and bottom-safe-area rules;
2. remove mobile terminal-content coverage and excessive journey length;
3. simplify teacher-facing copy and progressively disclose governance detail;
4. formalize development/no-institution mode without weakening authority controls;
5. run desktop/mobile browser evidence again;
6. redeploy a new immutable SHA;
7. execute a new human review on that exact release.

No current institutional connection or authority is to be fabricated for remediation or retest.
