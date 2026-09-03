# Arena R7C5C3 — Final MIM source fingerprint gate

Date: 2026-09-03

## Purpose

R7C5C3 separates three facts that must not be conflated:

1. Arena knows the official MIM URL and printed-page locator contract;
2. a human can attest which downloaded PDF they actually reviewed and compute its SHA-256 locally;
3. the repository still needs a separately acquired **canonical expected SHA-256** before a cryptographic match can participate in any `NATIONAL_PRESCRIPTIVE` authority gate.

## Canonical source state

`DM221_2025_SOURCE.officialCurriculumVolume.contentFingerprint` is now explicit:

- algorithm: `SHA-256`;
- status: `REQUIRED`;
- canonical `sha256`: `null`.

The null value is intentional. The current execution environment could not obtain the PDF bytes directly from the MIM endpoint, so no hash has been guessed or derived from an untrusted copy.

## Local evidence acquisition

`FinalPublicationSourceFingerprintPanel` lets a reviewer:

- open the registered MIM PDF URL;
- explicitly attest that the selected local PDF was obtained from that URL;
- select the PDF from their device;
- calculate SHA-256 locally with Web Crypto;
- persist the fingerprint receipt locally;
- export/import the fingerprint receipt.

The fingerprint receipt binds:

- source id;
- official curriculum-volume URL;
- print edition;
- page-numbering contract;
- SHA-256;
- byte length;
- file name;
- computation time;
- explicit source-origin attestation.

## Fail-closed authority rule

A valid local fingerprint receipt is useful evidence of the exact file reviewed, but **cannot satisfy the national-prescriptive fingerprint gate while the canonical expected SHA-256 is absent**.

Therefore:

`VALID_LOCAL_FINGERPRINT ≠ CANONICAL_FINGERPRINT_MATCH ≠ NATIONAL_PRESCRIPTIVE`

A later controlled source-acquisition step must obtain the official PDF bytes, calculate SHA-256 independently, freeze that expected value in the canonical source registry, and re-run the gate.
