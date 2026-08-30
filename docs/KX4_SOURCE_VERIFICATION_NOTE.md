# KX-4 — Local source verification

Status: IMPLEMENTATION_CANDIDATE

## Human task
A teacher who imports a local source can inspect it and explicitly record that they have checked its available content and provenance.

## Authority boundary
`LOCAL_VERIFIED` means only that the local user has explicitly checked the source in Arena.

It does **not** mean:
- normative or official source;
- institutional approval;
- curriculum approval;
- automatic promotion into canonical curriculum data.

## State transition

`LOCAL_UNVERIFIED -> LOCAL_VERIFIED`

The transition requires an explicit user action and records `verifiedAt` locally. There is no automatic transition and no institutional authority state in KX-4.
