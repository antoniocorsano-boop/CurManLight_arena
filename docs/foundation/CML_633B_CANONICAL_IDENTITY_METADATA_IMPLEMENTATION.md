# CML-633B — Canonical Identity and Metadata Implementation

> **Classificazione:** `CML_633B_CANONICAL_IDENTITY_METADATA`  
> **Branch:** `feat/cml-633b-canonical-identity-metadata`  
> **Data:** 27 luglio 2026  
> **Stato:** COMPLETO

---

## 1. Obiettivo

Implementare il primo nucleo tecnico della rifondazione strutturale definita in CML-633, introducendo contratti condivisi e riutilizzabili per identità, metadati, provenienza e relazioni tra entità.

---

## 2. Contratti Introdotti

### 2.1 EntityId

Identificativo canonico per tutte le entità del dominio.

```typescript
type EntityId = string & { readonly __brand: 'EntityId' };
```

**Caratteristiche:**
- Non vuoto
- Stabile
- Serializzabile
- Utilizzabile in IndexedDB
- Indipendente dalla descrizione
- Preservabile durante esportazione e importazione

**Generazione:**
- `generateEntityId()`: Usa `crypto.randomUUID()` quando disponibile, altrimenti fallback UUID v4
- `generateDeterministicId(seed)`: Solo per dati canonici importati da fonte autorevole

### 2.2 EntityMetadata

Metadati condivisi per tutte le entità del dominio.

```typescript
interface EntityMetadata {
  id: EntityId;
  createdAt: string;           // ISO 8601
  updatedAt: string;           // ISO 8601
  createdBy?: ActorReference;
  updatedBy?: ActorReference;
  origin: ContentOrigin;
  schemaVersion: SchemaVersion;
  migration?: MigrationMetadata;
}
```

### 2.3 ContentOrigin

Classificazione canonica dell'origine del contenuto.

**Origini supportate:**
- `normative-source`: Fonte normativa (DPR, D.Lgs)
- `institute`: Contenuto approvato dall'istituto
- `teacher`: Contenuto creato dal docente
- `imported`: Contenuto importato da fonte esterna
- `assisted`: Contenuto generato con assistenza AI
- `synthetic`: Contenuto suggerito dal sistema
- `demonstration`: Contenuto dimostrativo
- `legacy`: Dato legacy pre-migrazione
- `migration`: Dato generato durante la migrazione

**Regola essenziale:** `synthetic`, `assisted`, `demonstration` e `legacy` non sono interpretati come `institute` senza evento esplicito.

### 2.4 ActorReference

Riferimento all'attore dichiarato (non autenticato).

```typescript
interface ActorReference {
  id?: EntityId;
  displayName: string;
  role: InstitutionalRole;
  organizationalUnit?: string;
  assertion: 'self-declared' | 'imported' | 'system';
  note?: string;
}
```

### 2.5 EntityReference

Riferimento a un'altra entità.

```typescript
interface EntityReference {
  id: EntityId;
  entityType: EntityType;
  snapshotLabel?: string;  // Solo snapshot visuale, non chiave di ricerca
}
```

### 2.6 SchemaVersion

Versione dello schema per compatibilità.

```typescript
type SchemaVersion = number & { readonly __brand: 'SchemaVersion' };
const CURRENT_SCHEMA_VERSION = 1;
```

### 2.7 EntityType

Enum canonico dei tipi di entità supportati.

**Tipi:** `institute`, `source`, `curriculum-version`, `curriculum-segment`, `curriculum-node`, `curriculum-link`, `revision-proposal`, `decision`, `teaching-design`, `document`, `document-version`, `template`, `class-context`, `assessment`, `actor`, `event`

### 2.8 MigrationStatus

Stato di migrazione del dato.

**Stati:** `native-canonical`, `migrated-automatic`, `migrated-incomplete`, `imported-legacy`, `requires-confirmation`, `non-migrable`, `archived-historical`

---

## 3. Collocazione

```
src/domain/curriculum/identity/
├── types.ts           // Tipi e interfacce
├── validators.ts      // Validatori puri
├── constructors.ts    // Costruttori canonici
├── serialization.ts   // Serializzazione/deserializzazione
├── legacyAdapters.ts  // Adattatori pilota
├── index.ts           // Barrel pubblico
└── __tests__/
    └── identity.test.ts
```

---

## 4. Decisioni

| ID | Decisione | Razionalizzazione |
|----|-----------|-------------------|
| ID-001 | EntityId come branded type | Type safety a compile time |
| ID-002 | generateEntityId() usa crypto.randomUUID() | Standard industriale, fallback sicuro |
| ID-003 | SchemaVersion numerico | Ordinabile, semplice |
| MD-001 | EntityMetadata con ISO 8601 | Formato serializzabile, non ambiguo |
| MD-002 | Date mancanti non inventate | Integrità dati |
| OR-001 | 9 origini con registry | Flessibilità, tracciabilità |
| LG-001 | Legacy non promosso automaticamente | Previene reinterpretazione indebita |

---

## 5. API Interne

### Generazione ID
```typescript
generateEntityId(): EntityId
generateDeterministicId(seed: string): EntityId
```

### Costruzione Metadati
```typescript
createMetadata(origin: ContentOrigin, createdBy?: ActorReference, now?: string): EntityMetadata
touchMetadata(metadata: EntityMetadata, updatedBy?: ActorReference, now?: string): EntityMetadata
createLegacyMetadata(migrationDate: string, ...): EntityMetadata
createMigrationMetadata(migrationDate: string, previousOrigin: string, ...): EntityMetadata
```

### Costruttori Attori
```typescript
createSelfDeclaredActor(displayName: string, role: string, ...): ActorReference
createImportedActor(displayName: string, role: string, note?: string): ActorReference
createSystemActor(note?: string): ActorReference
```

### Costruttori Riferimenti
```typescript
createEntityReference(id: EntityId, entityType: EntityType, snapshotLabel?: string): EntityReference
createUnresolvedReference(entityType: EntityType, reason: string): EntityReference
```

### Validatori
```typescript
isValidEntityId(value: unknown): value is EntityId
isValidMetadata(value: unknown): value is EntityMetadata
isValidContentOrigin(value: unknown): value is ContentOrigin
isValidActorReference(value: unknown): value is ActorReference
isValidEntityReference(value: unknown): value is EntityReference
isSupportedSchemaVersion(version: SchemaVersion, entityType: EntityType): boolean
```

### Serializzazione
```typescript
serialize<T>(data: T): string
deserialize<T>(json: string): DeserializationResult<T>
serializeMetadata(metadata: EntityMetadata): string
deserializeMetadata(json: string): DeserializationResult<EntityMetadata>
checkSchemaCompatibility(data: { schemaVersion?: number }, entityType: EntityType): { compatible: boolean; reason?: string }
preserveId(originalId: unknown, fallback?: EntityId): EntityId
```

---

## 6. Integrazione Minima

I contratti nuovi sono integrati solo nei punti necessari per dimostrarne l'uso:
- Tipi condivisi in `src/domain/curriculum/identity/`
- Adattatore di lettura del `curriculumKB`
- Test di trasferimento concettuale

**Evitato:**
- Sostituzione completa degli store
- Modifica estesa dei componenti
- Doppia scrittura persistente
- Cambiamenti visibili all'utente non necessari
- Migrazione automatica all'avvio

---

## 7. Test

Aggiunti test unitari per:
- Generazione identificativi
- Validazione identificativi
- Unicità
- Metadati di creazione
- Aggiornamento metadati
- Origini ammesse
- Attori dichiarati
- Riferimenti
- Schema supportato
- Schema futuro
- Adattatore legacy
- Dati mancanti
- Duplicati
- Serializzazione
- Deserializzazione
- Ciclo completo
- Assenza di valori istituzionali hardcoded

**Test di proprietà:**
- Modificare il testo non modifica l'identità
- Un dato legacy resta leggibile senza essere promosso a canonico completo

---

## 8. Rischi Residui

| Rischio | Impatto | Mitigazione |
|---------|---------|-------------|
| crypto.randomUUID() non disponibile | Medio | Fallback UUID v4 implementato |
| Schema futuro non supportato | Basso | checkSchemaCompatibility() rileva |
| Dati legacy con campi mancanti | Alto | MigrationMetadata registra missingFields |
| Concorrenza scrittura IndexedDB | Medio | Gestito dallo store esistente |

---

## 9. Dipendenze Successive

- **CML-633C**: Sources and Curriculum Domain
- **CML-633D**: Store and Persistence
- **CML-633E**: Transfer Contracts
- **CML-633F**: Document System
