# B3 browser evidence — CI-bound

The executable evidence is `scripts/verify-beta-g4-browser.cjs` and is run by `.github/workflows/beta-e2e-workflow.yml` against the Beta production build generated from the pull-request head.

This file does not claim PASS by itself. The browser evidence is accepted only when the workflow completes successfully on the same immutable pull-request SHA.
