# CML-633 Decision Register

> **Classificazione:** `CML_633_DECISION_REGISTER`  
> **Branch:** `design/cml-633-product-foundation-redesign`  
> **Data:** 27 luglio 2026  
> **Stato:** COMPLETO

---

## 1. Registro Decisioni

### D01: Modello Dati Canonico

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Adottare un modello dati canonico condefinito in `src/domain/curriculum/types.ts` |
| **Alternativa** | Mantenere tipi separati per area |
| **Risultato** | Ogni entità ha un'unica definizione condivisa |
| **Razionalizzazione** | Elimina duplicazioni, riduce errori di consistenza |

### D02: Persistenza IndexedDB

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Mantenere IndexedDB come unico backend |
| **Alternativa** | Aggiungere backend server |
| **Risultato** | Architettura client-side pura |
| **Razionalizzazione** | Semplifica deployment, preserva privacy dati scuola |

### D03: Hash SHA-256

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Usare SHA-256 per firme e integrità |
| **Alternativa** | MD5 o CRC32 |
| **Risultato** | Integrità crittografica garantita |
| **Razionalizzazione** | SHA-256 è standard industriale, supportato nativamente |

### D04: UUID v4

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Usare UUID v4 per tutti gli ID |
| **Alternativa** | ID incrementali o hash |
| **Risultato** | ID univoci senza coordinamento |
| **Razionalizzazione** | UUID v4 è standard, non richiede sincronizzazione |

### D05: Macchine a Stati Esplicite

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Definire macchine a stati esplicite con transizioni valide |
| **Alternativa** | Stati come enum liberi |
| **Risultato** | Transizioni validate dal dominio |
| **Razionalizzazione** | Previene stati illegali, rende esplicito il workflow |

### D06: Event Log Immutabile

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Registrare ogni cambio di stato in un event log immutabile |
| **Alternativa** | Solo stato corrente |
| **Risultato** | Storico completo e verificabile |
| **Razionalizzazione** | Audit trail, debugging, rollback possibile |

### D07: Transfer Contracts Formali

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Definire contratti di transfer formali tra aree |
| **Alternativa** | Transfer impliciti via store |
| **Risultato** | Interfacce tipizzate e tracciate |
| **Razionalizzazione** | Elimina transfer breaking, rende espliciti i flussi |

### D08: Fonte Unica Identità

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Centralizzare identità scuola in `InstituteConfig` |
| **Alternativa** | Mantenere hardcoded in 8+ posizioni |
| **Risultato** | Singola fonte di verità |
| **Razionalizzazione** | Facile aggiornamento, consistenza, testabilità |

### D09: Document come Entità

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Trattare ogni documento come entità tracciata con versioning |
| **Alternativa** | Mantenere come eventi di esportazione |
| **Risultato** | Documenti con storico e coerenza |
| **Razionalizzazione** | Permette tracking, confronto, rollback documenti |

### D10: Template Configurabili

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Sistema di template configurabili con variabili e condizioni |
| **Alternativa** | Template hardcoded nell'HTML |
| **Risultato** | Template personalizzabili per istituto |
| **Razionalizzazione** | Flessibilità, riusabilità, manutenibilità |

### D11: Immutabilità Dopo Approvazione

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Il curricolo approvato è immutabile |
| **Alternativa** | Modifiche anche dopo approvazione |
| **Risultato** | Versioni stabili e tracciabili |
| **Razionalizzazione** | Previene modifiche accidentali, garantisce audit trail |

### D12: Dual Write per Migrazione

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Usare dual write durante la migrazione |
| **Alternativa** | Migrazione one-shot |
| **Risultato** | Transizione graduale senza perdita dati |
| **Razionalizzazione** | Rollback facile, zero downtime |

### D13: Nessuna Dipendenza Aggiuntiva

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Nessuna nuova dipendenza npm |
| **Alternativa** | Aggiungere librerie (immer, zod, etc.) |
| **Risultato** | Stack invariato |
| **Razionalizzazione** | Mantiene semplicità, riduce superficie di attacco |

### D14: TypeScript Strict Mode

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Mantenere TypeScript strict per tutti i nuovi tipi |
| **Alternativa** | Relaxed typing per velocità |
| **Risultato** | Type safety completa |
| **Razionalizzazione** | Cattura errori a compile time, migliora manutenibilità |

### D15: Validazione a Domain Level

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Validazione nel dominio, non nella UI |
| **Alternativa** | Validazione solo nell'interfaccia |
| **Risritato** | Regole applicate indipendentemente dalla UI |
| **Razionalizzazione** | Garantisce integrità indipendentemente dal contesto |

### D16: Coerenza Tracking

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Tracciare coerenza documento-fonte |
| **Alternativa** | Nessun tracking |
| **Risultato** | Documenti sempre aggiornati |
| **Razionalizzazione** | Previene documenti obsoleti, guida utente |

### D17: Transfer Unidirezionali

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Transfer unidirezionali con operazione inverse esplicita |
| **Alternativa** | Transfer bidirezionali |
| **Risultato** | Flussi chiari e prevedibili |
| **Razionalizzazione** | Riduce complessità, rende esplicito il directionality |

### D18: Firma Transfer

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Ogni transfer genera una firma crittografica |
| **Alternativa** | Nessuna firma |
| **Risultato** | Integrità verificabile |
| **Razionalizzazione** | Previene manomissioni, garantisce audit trail |

### D19: Backup Prima della Migrazione

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Backup completo prima di ogni migrazione |
| **Alternativa** | Migrazione diretta |
| **Risultato** | Rollback garantito |
| **Razionalizzazione** | Sicurezza dati, zero rischio perdita |

### D20: Archiviazione Prototipi

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Archiviare prototipi (programmazione, confronto) dopo migrazione |
| **Alternativa** | Mantenere nel prodotto |
| **Risultato** | Codice rimosso, dati preservati |
| **Razionalizzazione** | Pulizia codice, riduzione complessità, focus su funzionalità core |

### D21: EntityId come Branded Type (CML-633B)

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Usare branded type per EntityId |
| **Alternativa** | String semplice |
| **Risultato** | Type safety a compile time |
| **Razionalizzazione** | Previene scambi di tipi, rende esplicito il contratto |

### D22: generateEntityId() con Fallback (CML-633B)

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Usare crypto.randomUUID() con fallback UUID v4 |
| **Alternativa** | Solo Math.random() |
| **Risultato** | Standard industriale, fallback sicuro |
| **Razionalizzazione** | Qualità crittografica quando disponibile, compatibilità sempre |

### D23: SchemaVersion Numerico (CML-633B)

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Usare numero intero per SchemaVersion |
| **Alternativa** | Stringa semver |
| **Risultato** | Semplice, ordinabile |
| **Razionalizzazione** | Minima complessità, sufficiente per il dominio |

### D24: 9 Origini con Registry (CML-633B)

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Definire 9 origini con registry completo |
| **Alternativa** | Enum semplice senza metadati |
| **Risultato** | Flessibilità, tracciabilità, affidabilità dichiarata |
| **Razionalizzazione** | Ogni origina ha regole chiare, prevenzione di promozione automatica |

### D25: Legacy Non Promosso Automaticamente (CML-633B)

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | I dati legacy non sono promossi a institute senza evento esplicito |
| **Alternativa** | Promozione automatica per dati completi |
| **Risultato** | Prevenzione di reinterpretazione indebita |
| **Razionalizzazione** | Integrità dati, tracciabilità, conferma umana richiesta |

### D26: Adattatori Legacy Pilota (CML-633B)

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Implementare adattatori per curriculumKB e UDA |
| **Alternativa** | Nessun adattatore, solo tipi |
| **Risultato** | Verifica pratica dei contratti |
| **Razionalizzazione** | Validazione su dati reali, identificazione problemi |

### D27: Validatori Puri (CML-633B)

| Campo | Valore |
|-------|--------|
| **Data** | 27 luglio 2026 |
| **Decisione** | Validatori funzioni pure senza effetti collaterali |
| **Alternativa** | Classi con stato |
| **Risultato** | Testabilità, riutilizzabilità, determinismo |
| **Razionalizzazione** | Funzioni pure sono più facili da testare e combinare |

---

## 2. Statistiche

| Metrica | Valore |
|---------|--------|
| Decisioni totali | 27 |
| Decisioni implementate | 7 (CML-633B) |
| Decisioni in revisione | 0 |
| Decisioni deprecate | 0 |
