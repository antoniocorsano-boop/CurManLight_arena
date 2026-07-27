# CML-633 Implementation Roadmap

> **Classificazione:** `CML_633_IMPLEMENTATION_ROADMAP`  
> **Branch:** `design/cml-633-product-foundation-redesign`  
> **Data:** 27 luglio 2026  
> **Stato:** COMPLETO

---

## 1. Fasi

### CML-633A: Fondazione Dominio (24h)

| Task | Durata | Dipendenze |
|------|--------|------------|
| A1: Institute e InstituteConfig | 2h | — |
| A2: CurriculumVersion | 2h | A1 |
| A3: CurriculumSegment | 3h | A2 |
| A4: CurriculumNode | 2h | A3 |
| A5: VerticalCurriculumLink | 1h | A4 |
| A6: Source | 2h | — |
| A7: Proposal | 2h | A2 |
| A8: Document e DocumentVersion | 3h | A2 |
| A9: Validazione dominio | 4h | A1-A8 |
| A10: Transizioni stato | 3h | A1-A8 |

### CML-633B: Persistenza (30h)

| Task | Durata | Dipendenze |
|------|--------|------------|
| B1: Schema IndexedDB | 3h | 633A |
| B2-B9: Repository (8 entità) | 20h | B1 |
| B10: Calcolo hash | 3h | — |
| B11: Backup e restore | 4h | B2-B9 |

### CML-633C: Event Log (13h)

| Task | Durata | Dipendenze |
|------|--------|------------|
| C1: Tipo DomainEvent | 1h | 633A |
| C2: EventLogRepository | 3h | C1 |
| C3: EventChain | 4h | C2 |
| C4: Integrazione transizioni | 3h | 633A |
| C5: Query eventi | 2h | C2 |

### CML-633D: Configurazione Istituzionale (18h)

| Task | Durata | Dipendenze |
|------|--------|------------|
| D1: InstituteConfig editor | 4h | 633A |
| D2: Department manager | 2h | D1 |
| D3: RoleAssignment manager | 3h | D1 |
| D4: Refactor schoolIdentity | 2h | D1 |
| D5: Refactor export handlers | 4h | D4 |
| D6: InstitutionalRules editor | 3h | D1 |

### CML-633E: Transfer Contracts (22h)

| Task | Durata | Dipendenze |
|------|--------|------------|
| E1: TransferContract base | 3h | 633A |
| E2: A11-A02 transfer | 4h | E1 |
| E3: A02-A03 transfer | 3h | E1 |
| E4: A02/A03-A04 transfer | 4h | E1 |
| E5: A04-A07 transfer | 3h | E1 |
| E6: Transfer signatures | 2h | E1 |
| E7: Error handling | 3h | E1 |

### CML-633F: Document System (16h)

| Task | Durata | Dipendenze |
|------|--------|------------|
| F1: DocumentTemplate engine | 4h | 633A |
| F2: DocumentStyle manager | 3h | F1 |
| F3: Generazione documenti | 4h | F1, F2 |
| F4: Versioning documenti | 3h | F1 |
| F5: Coerenza tracking | 2h | F1 |

### CML-633G: Template System (15h)

| Task | Durata | Dipendenze |
|------|--------|------------|
| G1: Template di sistema | 3h | 633F |
| G2: Template editor | 4h | G1 |
| G3: Variabili e condizioni | 3h | G1 |
| G4: Preview template | 2h | G1 |
| G5: Test template reali | 3h | G1-G4 |

### CML-633H: Migrazione Dati (28h)

| Task | Durata | Dipendenze |
|------|--------|------------|
| H1: Backup completo | 4h | 633B |
| H2: UdaModel - CurriculumNode | 6h | 633A, 633B |
| H3: Proposal - Proposal | 3h | 633A, 633B |
| H4: DocumentExportEvent - Document | 4h | 633A, 633B |
| H5: curriculumKB - Source+Node | 5h | 633A, 633B |
| H6: Validazione migrazione | 3h | H2-H5 |
| H7: Rollback | 3h | H1 |

### CML-633I: Refactoring UI (38h)

| Task | Durata | Dipendenze |
|------|--------|------------|
| I1: Refactor A01 | 6h | 633A |
| I2: Refactor A02 | 8h | 633A |
| I3: Refactor A03 | 6h | 633A |
| I4: Refactor A04 | 8h | 633A |
| I5: Refactor A07 | 6h | 633A |
| I6: Transfer UI | 4h | 633E |

### CML-633J: Archiviazione Prototipi (11h)

| Task | Durata | Dipendenze |
|------|--------|------------|
| J1: Archiviare programmazione | 3h | 633H |
| J2: Archiviare confronto | 2h | 633H |
| J3: Migrare dati prototipi | 4h | J1, J2 |
| J4: Rimuovere codice | 2h | J3 |

### CML-633K: Test e Validazione (30h)

| Task | Durata | Dipendenze |
|------|--------|------------|
| K1: Test unitari dominio | 6h | 633A |
| K2: Test integrazione persistenza | 4h | 633B |
| K3: Test transfer | 4h | 633E |
| K4: Test documenti | 4h | 633F |
| K5: Test migrazione | 4h | 633H |
| K6: Test E2E | 8h | Tutti |

### CML-633L: Documentazione (12h)

| Task | Durata | Dipendenze |
|------|--------|------------|
| L1: Documentare modello dominio | 3h | 633A |
| L2: Documentare persistenza | 2h | 633B |
| L3: Documentare transfer | 2h | 633E |
| L4: Documentare documenti | 2h | 633F |
| L5: Documentare migrazione | 2h | 633H |
| L6: Aggiornare README | 1h | Tutti |

---

## 2. Dipendenze

```
CML-633A (Fondazione Dominio)
  |
  +---> CML-633B (Persistenza)
  |       |
  |       +---> CML-633H (Migrazione Dati)
  |       |       |
  |       |       +---> CML-633J (Archiviazione Prototipi)
  |       |
  |       +---> CML-633K (Test)
  |
  +---> CML-633C (Event Log)
  |
  +---> CML-633D (Configurazione Istituzionale)
  |
  +---> CML-633E (Transfer Contracts)
  |       |
  |       +---> CML-633I (Refactoring UI)
  |
  +---> CML-633F (Document System)
  |       |
  |       +---> CML-633G (Template System)
  |
  +---> CML-633L (Documentazione)
```

---

## 3. Timeline

| Fase | Settimana | Durata |
|------|-----------|--------|
| CML-633A | 1 | 24h |
| CML-633B | 2 | 30h |
| CML-633C | 2 | 13h |
| CML-633D | 3 | 18h |
| CML-633E | 3-4 | 22h |
| CML-633F | 4 | 16h |
| CML-633G | 4-5 | 15h |
| CML-633H | 5-6 | 28h |
| CML-633I | 6-8 | 38h |
| CML-633J | 8 | 11h |
| CML-633K | 9-10 | 30h |
| CML-633L | 10 | 12h |

---

## 4. Totale

| Metrica | Valore |
|---------|--------|
| Fasi | 12 |
| Task | 89 |
| Ore totali | 277h |
| Settimane stimate | 10 |
| Parallelismo max | 3 fasi concorrenti |
