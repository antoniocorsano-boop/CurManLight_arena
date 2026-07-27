# CML-633B — Schema Versioning Policy

> **Classificazione:** `CML_633B_SCHEMA_VERSIONING_POLICY`  
> **Branch:** `feat/cml-633b-canonical-identity-metadata`  
> **Data:** 27 luglio 2026  
> **Stato:** COMPLETO

---

## 1. Versione Iniziale

**SchemaVersion corrente:** `1`

**Data di introduzione:** 27 luglio 2026

**Motivazione:** Prima implementazione della fondazione canonica.

---

## 2. Compatibilità

### 2.1 Regole

| Versione Schema | Comportamento |
|-----------------|---------------|
| = CURRENT_SCHEMA_VERSION | piena compatibilità |
| < CURRENT_SCHEMA_VERSION | compatibilità con adattamento |
| > CURRENT_SCHEMA_VERSION | errore esplicito, preservazione dati |

### 2.2 Gestione Versioni Future

Quando viene introdotta una versione schema successiva:

1. **Non sovrascrivere** dati con versione sconosciuta
2. **Produrre errore** esplicito per schema non compatibile
3. **Preservare** il dato originale
4. **Registrare** l'incompatibilità nei warning

### 2.3 Esempio

```typescript
// Versione 2 introdotta
const CURRENT_SCHEMA_VERSION = 2;

// Dato con versione 3 (futuro)
const data = { schemaVersion: 3 };

// Comportamento
checkSchemaCompatibility(data, 'curriculum-node');
// → { compatible: false, reason: 'Versione schema 3 non supportata (corrente: 2)' }
```

---

## 3. Aggiornamento

### 3.1 Processo

1. Incrementare `CURRENT_SCHEMA_VERSION`
2. Aggiungere campi opzionali (mai rimuovere)
3. Aggiungere validazione per nuovi campi
4. Aggiornare `isSupportedSchemaVersion()`
5. Aggiornare test

### 3.2 Regole di Aggiornamento

| Modifica | Versione | Compatibilità |
|----------|----------|---------------|
| Campo opzionale aggiunto | +1 | Backward compatible |
| Campo obbligatorio aggiunto | +1 | Richiede migrazione |
| Campo rimosso | +1 | Breaking change |
| Tipo campo cambiato | +1 | Richiede migrazione |
| Valore enum aggiunto | +1 | Backward compatible |
| Valore enum rimosso | +1 | Breaking change |

### 3.3 Campi Obbligatori vs Opzionali

**Regola:** Mai rimuovere campi, solo aggiungere.

```typescript
// Versione 1
interface EntityMetadataV1 {
  id: EntityId;
  createdAt: string;
  updatedAt: string;
  origin: ContentOrigin;
  schemaVersion: SchemaVersion;
}

// Versione 2 (campo opzionale aggiunto)
interface EntityMetadataV2 extends EntityMetadataV1 {
  checksum?: string;  // Opzionale per backward compatibility
}
```

---

## 4. Rollback

### 4.1 Strategia

In caso di rollback a versione precedente:

1. **Preservare** tutti i dati
2. **Ignorare** campi sconosciuti
3. **Non perdere** informazioni
4. **Registrare** il rollback

### 4.2 Implementazione

```typescript
function rollbackMetadata(data: EntityMetadata): EntityMetadata {
  // Preserva campi noti
  const rolledBack = {
    id: data.id,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    origin: data.origin,
    schemaVersion: 1,  // Forza versione precedente
  };
  
  // Ignora campi sconosciuti (checksum, etc.)
  return rolledBack;
}
```

---

## 5. Dati Sconosciuti

### 5.1 Regola

I dati con campi sconosciuti vengono:
1. **Preservati** integralmente
2. **Segnalati** nei warning
3. **Non interpretati**

### 5.2 Implementazione

```typescript
function handleUnknownFields<T>(data: T): { processed: T; warnings: string[] } {
  const warnings: string[] = [];
  
  // Controlla campi sconosciuti
  for (const key of Object.keys(data as object)) {
    if (!isKnownField(key)) {
      warnings.push(`Campo sconosciuto preservato: ${key}`);
    }
  }
  
  return { processed: data, warnings };
}
```

### 5.3 Vantaggi

- **Zero perdita silenziosa**
- **Tracciabilità completa**
- **Forward compatibility**
- **Sicurezza dati**

---

## 6. Migrazione

### 6.1 Processo

Quando si aggiorna la versione schema:

1. Rilevare dati con versione precedente
2. Applicare trasformazioni necessarie
3. Aggiornare `schemaVersion`
4. Registrare migrazione in `MigrationMetadata`

### 6.2 Esempio

```typescript
function migrateMetadataV1toV2(data: EntityMetadataV1): EntityMetadataV2 {
  return {
    ...data,
    schemaVersion: 2 as SchemaVersion,
    // Aggiungi nuovi campi con valori default
    checksum: undefined,
  };
}
```

---

## 7. Test

### 7.1 Test Obbligatori

| Test | Verifica |
|------|----------|
| Versione corrente supportata | `isSupportedSchemaVersion(1, entityType)` → true |
| Versione precedente supportata | `isSupportedSchemaVersion(1, entityType)` → true |
| Versione futura non supportata | `isSupportedSchemaVersion(100, entityType)` → false |
| Dato senza versione rilevato | `checkSchemaCompatibility({}, entityType)` → incompatible |
| Dato con versione sconosciuta preservato | Serializzazione/deserializzazione |

### 7.2 Test di Proprietà

- `un dato con versione sconosciuta non viene sovrascritto`
- `un dato con versione precedente viene adattato`
- `un dato con versione corrente è pienamente compatibile`
