# ECO-01/S2 — readable prototype source boundary

Status: **ARCHITECTURE_ONLY / NON_OPERATIONAL_PROTOTYPE / RUNTIME_DEFERRED**  
Date: 2026-09-20

## Purpose

Define what the readable S2 prototype may show from Arena without creating a second curriculum channel or a runtime integration.

## Arena-visible curriculum block

The prototype may render, read-only:

- curriculum source = CurManLight Arena;
- contract profile = `CurriculumSnapshot v1`;
- curriculum version reference;
- structural/authority fingerprint;
- authority state and decision evidence;
- discipline and grade applicability;
- relevant curriculum-node / requirement labels;
- provenance and acquisition/export timestamp.

The prototype must not imply that Atlas supplied any of these authority fields.

## Authority boundary

The canonical authority path remains:

`Arena -> Docente OS intake/revalidation`

The readable prototype is only a view of already-governed S1 semantics.

It MUST NOT:

- call Arena;
- create a new export transport;
- create a second snapshot format;
- write back to Arena;
- allow Atlas to replace or reinterpret Arena authority;
- use student personal data.

## Atlas relationship

Atlas may appear only in the **materials** area of the lesson card, with explicit subordinate provenance.

An Atlas resource:

- is not a curriculum source;
- does not change `authorityState`;
- does not change the curriculum fingerprint;
- does not become accepted for the lesson merely because Atlas lifecycle/assurance is reviewed;
- must still be represented inside Docente OS canonical `materialSlots`.

## Human-review focus

The S2 human reviewer should be able to answer yes to all of these:

1. Is Arena unmistakably the curriculum source?
2. Can the reviewer see version/fingerprint/authority without technical ambiguity?
3. Is Atlas visually and semantically separated from curriculum authority?
4. Is the prototype clearly non-operational?
5. Is `DOS-A1` still explicitly deferred?
