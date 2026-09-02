# Arena R7B1 — P1 Source Qualification

## Scope

R7B1 closes `P1_SOURCE_QUALIFICATION` as an executable runtime domain step without promoting source authority automatically.

## Runtime contract

Accepted origins:

- `BUNDLED`
- `USER_UPLOAD`
- `AUTHORITY_CANDIDATE`

Every source must have a non-empty source id, title, locator and available content.

The only outputs are:

- `CONSULT_ONLY`
- `ELIGIBLE_EVIDENCE`

`ELIGIBLE_EVIDENCE` requires both explicit human qualification and a non-empty authority basis. Bundled sources are never promoted automatically. User uploads and authority candidates receive no implicit authority from their origin.

The qualification record preserves source origin, locator, human qualification, authority basis and timestamp. Source qualification never constitutes institutional adoption.

## R7 effect

After this slice the expected pipeline reality is:

`P1 EXECUTABLE → P2 EXECUTABLE → P3 PARTIAL → P4 EXECUTABLE → P5 EXECUTABLE → P6 EXECUTABLE → P7 EXECUTABLE`

The global R7 verdict therefore remains `ADOPTION_FLOW_BLOCKED` with exactly `P3_CURRICULUM_ANALYSIS` as blocker.

## Non-goals

- no P3 curriculum analysis remediation;
- no source text generation;
- no automatic source-authority inference;
- no institutional adoption effect;
- no UI redesign;
- no deploy.
