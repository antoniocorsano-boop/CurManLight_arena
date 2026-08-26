# CurManLight Arena — Beta Environment & Release Operations v1

Status: B1 IMPLEMENTED / DEPLOYMENT EVIDENCE REQUIRED  
Date: 2026-08-26  
B1 base: `abd9e7be5138ae68b24c4108ae21ccccacfd41bb`

## 1. Purpose

This contract defines the first canonical CurManLight Arena Beta environment and its release/rollback procedure. It implements the technical foundation for `BETA-G2` without claiming the gate is PASS before an actual published deployment is observed.

## 2. Canonical Beta environment

Provider: GitHub Pages via GitHub Actions.  
Expected stable URL after the first successful deployment:

`https://antoniocorsano-boop.github.io/CurManLight_arena/`

This URL becomes authoritative only after `Deploy Arena Beta` completes successfully and the published site is smoke-tested.

The Beta is built in Vite `beta` mode with base path:

`/CurManLight_arena/`

`BrowserRouter` consumes `import.meta.env.BASE_URL`, so local/root builds retain `/` while the Beta uses the Pages repository path.

## 3. Release identity

Every Beta build produces `dist/beta-release.json` with schema `CML_BETA_RELEASE_V1` and records:

- exact immutable release SHA;
- source ref supplied to the workflow;
- build timestamp;
- product/channel;
- deployment base path;
- rollback strategy.

A Beta artifact is invalid if its `releaseSha` is not a 40-character Git SHA.

## 4. Deep-link recovery

Arena uses `BrowserRouter`. GitHub Pages does not natively rewrite unknown route paths to the SPA entry point.

The Beta preparation script therefore copies the single-file `dist/index.html` to `dist/404.html`. GitHub Pages serves that fallback while preserving the requested URL; BrowserRouter then resolves the route relative to `/CurManLight_arena/`.

The release verifier requires `404.html` to be byte-identical to `index.html`.

## 5. Reproducible release command

Local/CI contract:

```bash
CML_RELEASE_SHA=<40-char-sha> CML_RELEASE_REF=<ref> npm run build:beta
npm run beta:verify
```

The standard `npm run build` remains unchanged and continues to use base `/`.

## 6. CI gate

`Beta Release Contract` runs on pull requests to `main` and may also be invoked manually. It:

1. installs dependencies with `npm ci`;
2. builds in Beta mode;
3. creates release metadata and the Pages deep-link fallback;
4. runs the fail-closed release verifier.

Its success proves artifact reproducibility, not that a public deployment exists.

## 7. Deployment

Workflow: `Deploy Arena Beta`.

It is deliberately `workflow_dispatch` only. The operator supplies a Git ref; an immutable SHA is preferred for release candidates.

The workflow:

1. checks out the requested ref;
2. resolves the actual immutable SHA;
3. runs fast regressions;
4. runs TypeScript;
5. builds and verifies the Beta artifact;
6. configures GitHub Pages;
7. uploads `dist`;
8. deploys to the `github-pages` environment.

A merge to `main` therefore does not silently publish a new Beta.

## 8. Rollback

Rollback uses the same deployment path as release:

1. identify the previous known-good immutable commit SHA;
2. run `Deploy Arena Beta` manually;
3. enter that SHA as `ref`;
4. require build and release verification to pass;
5. redeploy it to the same stable Pages environment;
6. verify `beta-release.json` exposes the expected previous SHA;
7. smoke-test the critical Beta entry route.

There is no separate ad-hoc rollback mechanism and no manual replacement of generated site files.

## 9. Incident intake

The repository includes a Beta incident issue template. Reports must not include student personal data, credentials, access tokens or other secrets.

Operational severity and the complete support loop remain part of `BETA-G10`; this B1 intake is only the minimum release-operations foundation.

## 10. Fail-closed boundary

`BETA_ENVIRONMENT_READY` must not be emitted merely because these workflows exist.

`BETA-G2` requires observed evidence of all four items on one deployed release:

- canonical Beta URL reachable;
- `beta-release.json` reports the deployed immutable SHA;
- deployment is reproducible through the repository workflow;
- rollback to a prior known-good ref is successfully rehearsed or, if no prior Beta release yet exists, the rollback mechanism is verified and scheduled for rehearsal once two releases exist.

Until public deployment and smoke evidence exist, B1 remains `IN_PROGRESS`.
