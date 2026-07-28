# CML-633G — State and Event Model

## Proposal State Machine

```
draft → ready-for-review
ready-for-review → submitted
submitted → under-review | withdrawn
under-review → changes-requested | accepted-for-decision | rejected
changes-requested → ready-for-review | withdrawn
accepted-for-decision → archived
rejected → archived
withdrawn → archived
legacy → draft | archived
```

## Decision State Machine

```
draft → recorded-local
recorded-local → superseded | revoked | archived
superseded → archived
revoked → archived
legacy → draft | archived
```

## RevisionEvent

```typescript
interface RevisionEvent {
  id: string;
  entityRef: EntityReference;
  eventType: RevisionEventType;
  actor?: ActorReference;
  role?: string;
  timestamp: string;
  previousStatus?: string;
  newStatus?: string;
  rationale?: string;
  references: EntityReference[];
  structuralFootprint: string;
}
```

## RevisionEventType

`proposal-created`, `proposal-modified`, `version-created`, `proposal-submitted`, `proposal-taken-over`, `changes-requested`, `proposal-withdrawn`, `decision-recorded`, `decision-superseded`, `decision-revoked`, `proposal-archived`, `document-generated`, `curricular-effect-applied`.

## Event Log Principles

- **Append-only.** Mai modificare o cancellare eventi registrati.
- **Immutable.** Ogni evento è un record immutabile con ID univoco e timestamp.
- **Cronologico deterministico.** Ordinamento per timestamp ISO 8601.
- **Impronta strutturale.** Ogni evento include `structuralFootprint`.
- **Riferimenti espliciti.** `entityRef`, `actor`, `previousStatus`, `newStatus`, `rationale`.
- **Non è protocollo ufficiale.** Qualificato esplicitamente come "Registro locale delle attività, non protocollo ufficiale".

## Separazione TransferEvent / RevisionEvent

- **TransferEvent** (CML-633E): attraversamento tecnico tra aree (A02→A03, etc.)
- **RevisionEvent** (CML-633G): ciclo di vita di proposta/decisione/effetto

Principi condivisi: immutabilità, impronta strutturale, costruttori comuni, convenzioni temporali. Non condivisi: sistema di tipi, tipi di eventi, storage.