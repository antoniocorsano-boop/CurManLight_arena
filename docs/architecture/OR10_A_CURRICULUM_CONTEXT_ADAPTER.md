# OR-10-A — Arena Curriculum Context Adapter

**Stato:** PROPOSED / READ_ONLY / NO_RUNTIME  
**Authority:** ARENA UNCHANGED  
**DOS-A1:** RUNTIME_DEFERRED

## Scopo

Definire il mapping minimo da `CurriculumSnapshot v1` verso la shared capability `lesson.preparation.observe`, senza introdurre runtime, scritture o una seconda fonte curricolare.

## Input autorevole

L'adapter legge esclusivamente riferimenti Arena già canonici:
- curriculum snapshot ref;
- curriculum version;
- authority state;
- structural/authority fingerprint;
- disciplina e grado/classe applicabili;
- provenance/decision evidence quando presenti.

## Output

L'output è un `authorityContext` derivato e read-only:

```ts
interface ArenaCapabilityAuthorityContext {
  source: 'ARENA'
  snapshotRef: string
  curriculumVersion: string
  authorityState: string
  structuralFingerprint: string
  sourceRefs: readonly string[]
}
```

## Regole

- nessuna modifica del curriculum;
- nessuna approvazione implicita;
- nessuna persistenza cross-product;
- nessun accesso a provider/runtime;
- nessun dato personale studente;
- il consumer deve trattare l'output come contesto derivato, non come nuova authority.

## Invarianti

- OR10-A-01 Arena resta authority curricolare;
- OR10-A-02 mapping deterministico;
- OR10-A-03 provenance preservata;
- OR10-A-04 nessuna write surface;
- OR10-A-05 nessuna dipendenza da Atlas o Docente OS;
- OR10-A-06 DOS-A1 invariato.

## Exit

La slice è qualificabile quando il mapping è documentato, il CI prodotto è PASS e nessun confine di authority cambia.
