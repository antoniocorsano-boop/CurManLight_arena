# CML-633G — A02→A03→A04→A07 Integration

## A02→A03: Create draft proposal

`executeA02ToA03ProposalTransfer(payload, archive)` accetta `A02ToA03Payload` (CML-633E) e:
1. Valida contratto (`contractVersion >= 1`, `curriculumNodeRef`, `textSnapshot`)
2. Crea `RevisionProposal` draft con snapshot, fonti, evidenze, origine
3. Crea versione 1
4. Registra evento `proposal-created`
5. Restituisce risultato discriminato

**Non fa:** creare decisioni, impostare approvazione, modificare curricolo, cancellare dati legacy.

## A03→A04: Transfer matrix

`executeA03ToA04ProposalTransfer(proposalRefs, archive)` classifica ogni proposta:

| Stato/Esito | Comportamento |
|-------------|---------------|
| `draft` | non trasferibile |
| `ready-for-review` | non trasferibile |
| `submitted` | contenuto proposto |
| `under-review` | contenuto proposto |
| `changes-requested` | non trasferibile |
| `accepted-for-decision` | contenuto proposto |
| `rejected` | non trasferibile |
| `withdrawn` | non trasferibile |
| `archived` | non trasferibile |
| `legacy` + `reject` | non trasferibile |
| `legacy` + altro | trasferibile con warning |
| Decisione `approve` + `recorded-local` | contenuto d'istituto pianificato |
| Decisione `approve-with-changes` | solo versione della decisione |
| Decisione `reject` | non trasferibile |
| Decisione `defer` | non trasferibile |
| Decisione `record-only` | nessun effetto curricolare |

## A03→A07: Document generation

`documentIntegration.ts` genera documenti canonici CML-633F:

- `generateProposalSheet(proposal)` → scheda proposta (heading, stato, motivazione, confronto testuale, fonti)
- `generateDecisionRecord(proposal, decision)` → registro locale decisione (esito, autorità, motivazione, disclaimer)
- `generateSourceAttachment(sources, evidences)` → riepilogo fonti
- `generateEventHistory(archive, proposalId)` → cronologia eventi
- `generateProposalDocument(proposal, archive)` → DocumentEntity + DocumentVersion
- `generateDecisionDocument(proposal, decision, archive)` → DocumentEntity + DocumentVersion

**Non usa mai diciture:** "verbale ufficiale", "delibera certificata", "atto approvato", "documento protocollato" senza processo futuro verificato.

## Cosa non viene mai fatto

- Modifica diretta del curricolo
- Sostituzione di nodi
- Modifica di versioni curricolari
- Scrittura nei campi legacy
- Promozione automatica di dati legacy
- Creazione automatica di contenuto vigente
- Dichiarazione di effetto come istituzionalmente adottato