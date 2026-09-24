# Security Policy

## Scope

This policy applies to CurManLight Arena source, Beta releases, shared institutional persistence boundaries, release automation and cross-product contracts.

## Reporting a vulnerability

Do **not** place secrets, tokens, credentials, private keys, pupil data or private institutional content in a public issue.

Use a private repository-owner channel or GitHub's private vulnerability/security reporting mechanism when available.

A public issue may be used only after sensitive details have been removed and the issue can be discussed safely.

## Sensitive information that must never be committed

- passwords;
- OAuth access/refresh tokens;
- service-role keys;
- private API keys;
- private keys/certificates;
- real pupil personal data;
- health/diagnostic information;
- private connected-account content.

## Security boundaries

Arena security design preserves:

- explicit authority;
- server-enforced membership/RLS for shared institutional writes;
- local state not treated as institutional authority;
- no shared database across Arena, Curriculum Atlas and Docente OS;
- no automatic cross-product authority mutation;
- credentials not treated as durable domain state;
- exact-SHA release identity.

## Severity

Operational incidents follow the current Arena M4 operations runbook.

High-priority examples include:

- credential/token exposure;
- unauthorized institutional action;
- authority bypass;
- destructive data corruption;
- release SHA mismatch;
- privacy event with plausible impact.

## Release security

A Beta release must be tied to an immutable 40-character Git SHA and must pass the applicable release contract and smoke identity checks.

Manual edits of published GitHub Pages release artifacts are not an accepted release path.

## Dependency security

The repository includes a dependency-security workflow. A green dependency scan is one assurance input, not a third-party security certification.

## Privacy boundary

Arena is a curriculum-governance product. Pupil-level operational data are outside its intended product boundary.

Any proposal to introduce student personal data is a separate privacy/security program and must not be inferred from existing architecture.

## Disclosure handling

When a valid vulnerability is received:

1. preserve evidence without exposing secrets;
2. classify impact;
3. freeze affected promotion if necessary;
4. create a minimal remediation;
5. test on the exact remediation head;
6. rotate/revoke credentials if exposed;
7. deploy through the governed release workflow;
8. record recovery evidence.

## No blanket certification claim

This repository documents and tests software controls. It does not assert an external security, GDPR, AgID or AI Act certification.
