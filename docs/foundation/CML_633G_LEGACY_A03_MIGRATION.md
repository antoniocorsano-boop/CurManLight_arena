# CML-633G — Legacy A03 Migration

## Tipi legacy
```typescript
type LegacyDecisionStatus = 'approved' | 'rejected' | 'custom';

interface LegacyProposal {
  id: string;
  focus: string;
  oldText: string;
  newText: string;
  notes: string;
}
```

## Import: importLegacyProposals
Converte proposte A03 legacy in `RevisionArchive` canonico.
- Ogni `LegacyProposal` → `RevisionProposal` con status `legacy`
- `LegacyDecisionStatus` mappato:
  - `approved` → `outcome: 'approve'`
  - `rejected` → `outcome: 'reject'`
  - `custom` → `outcome: 'approve-with-changes'`
- Le decisioni importate hanno status `legacy`
- Eventi generati con role `system` e rationale di importazione
- `author` rimane `undefined` (non inventato)
- Nessuna data inventata per l'autore

## Export: exportLegacyState
Estrae `LegacyStateSnapshot` da `RevisionArchive` per proposte con status `legacy`.

## Cosa NON viene promosso
- `approved` legacy → mai stato proposta `approved`
- `legacy` decision → mai `recorded-local`
- Nessun autore inventato
- Nessuna data di creazione inventata
- Nessuna fonte inventata
- Le valutazioni personali restano `legacy`

## Validazione
`validateLegacyImport` esegue validatori su proposte e decisioni legacy più integrità archivio.

## Nessuna doppia scrittura
L'archivio canonico e i campi legacy mantengono percorsi separati. Le azioni sulla superficie A03 canonica non scrivono nei campi legacy.