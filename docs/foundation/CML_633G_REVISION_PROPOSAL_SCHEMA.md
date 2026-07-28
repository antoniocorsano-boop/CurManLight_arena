# CML-633G — Schema della proposta di revisione

## RevisionProposal

| Campo | Tipo | Obbligatorio |
|-------|------|--------------|
| `id` | `EntityId` | ✅ |
| `metadata` | `EntityMetadata` | ✅ |
| `targetNodeRef` | `EntityReference` | ✅ |
| `curriculumVersionRef` | `EntityReference` | ✅ |
| `currentTextSnapshot` | `string` | ✅ |
| `proposedText` | `string` | ✅ |
| `rationale` | `string` | Obbligatorio prima di `ready-for-review` |
| `evidenceRefs` | `EntityReference[]` | No |
| `sourceRefs` | `EntityReference[]` | No |
| `author` | `ActorReference` | No (dichiarato, non verificato) |
| `institutionalContext` | `InstitutionalContext` | No |
| `status` | `RevisionProposalStatus` | ✅ (iniziale: `draft`) |
| `currentVersionRef` | `EntityId` | ✅ |
| `decisionRefs` | `EntityReference[]` | ✅ |

## RevisionProposalStatus
`draft`, `ready-for-review`, `submitted`, `under-review`, `changes-requested`, `withdrawn`, `accepted-for-decision`, `rejected`, `archived`, `legacy`.

**Non ammesso:** `approved` — l'approvazione è una decisione, non uno stato della proposta.

## Versionamento
Ogni modifica sostanziale crea una nuova `RevisionProposalVersion`:
- `versionNumber` auto-incrementale
- `previousVersionRef` link alla versione precedente
- `frozen: true` (immutabile)
- `restoreProposalVersion` crea una nuova versione (non modifica la precedente)

## Motivazione obbligatoria
`rationale` richiesto non vuoto prima del passaggio a `ready-for-review` o `submitted`.

## Confronto con A03 legacy
| A03 Legacy | CML-633G Canonico |
|------------|-------------------|
| voto personale = approvazione | decisione separata dalla proposta |
| `approved` = stato | `approved` non è uno stato proposta |
| nessuna autorità dichiarata | `DecisionAuthority` obbligatorio |
| nessuna versione | versioni immutabili numerate |