# CML-633B — Legacy Adapter Contract

> **Classificazione:** `CML_633B_LEGACY_ADAPTER_CONTRACT`  
> **Branch:** `feat/cml-633b-canonical-identity-metadata`  
> **Data:** 27 luglio 2026  
> **Stato:** COMPLETO

---

## 1. Dati Analizzati

### 1.1 curriculumKB

**Posizione:** `src/data/curriculumKB.ts`

**Struttura:**
```typescript
Record<string, DisciplineData>
```

**Campi per disciplina:**
- `discipline`: string
- `order`: string
- `hasSpecificDiscipline`: boolean
- `traguardi`: string[]
- `obiettivi`: string[]
- `proposals`: string[]

**Problemi:**
- Nessun ID univoco per gli elementi
- Testo usato come identificativo
- Nessun metadati di provenienza
- Nessuna versione dello schema

### 1.2 UDA Salvate

**Posizione:** `src/store/useCurriculumStore.ts` (savedUda)

**Struttura:**
```typescript
UdaModel[]
```

**Campi:**
- `id`: string (generato dal componente)
- `title`: string
- `discipline`: string
- `order`: string
- `description?`: string
- `content?`: string
- `classes?`: string[]
- `status`: 'work-in-progress' | 'review-needed' | 'completed'
- `tags?`: string[]
- `createdAt`: string
- `updatedAt`: string
- `exportedAt?`: string
- `workStatus?`: string

**Problemi:**
- ID generato nei componenti (non deterministico)
- Status non mappato a stati canonici
- Nessun metadati di provenienza
- Nessuna versione dello schema

---

## 2. Classificazione

| Categoria | Quantità | Strategia |
|-----------|----------|-----------|
| curriculumKB | ~14 discipline × 3 ordini | Migrazione automatica con avvisi |
| UDA salvate | Variabile (per utente) | Migrazione con conferma |

---

## 3. Metadati Mancanti

### curriculumKB

| Campo | Stato | Azione |
|-------|-------|--------|
| id | Mancante | Generato durante adattamento |
| createdAt | Mancante | Usata data di migrazione |
| updatedAt | Mancante | Usata data di migrazione |
| createdBy | Mancante | Non attribuito |
| origin | Mancante | Impostata su 'legacy' |
| schemaVersion | Mancante | Impostata su CURRENT_SCHEMA_VERSION |

### UDA salvate

| Campo | Stato | Azione |
|-------|-------|--------|
| origin | Mancante | Impostata su 'legacy' |
| schemaVersion | Mancante | Impostata su CURRENT_SCHEMA_VERSION |
| createdBy | Mancante | Non attribuito (preservato ID originale) |

---

## 4. Comportamento degli Adattatori

### 4.1 adaptCurriculumKBItem

**Input:** LegacyCurriculumKBItem + migrationDate  
**Output:** AdaptedLegacyItem<LegacyCurriculumKBItem>

**Comportamento:**
1. Preserva il dato originale
2. Assegna origine 'legacy'
3. Registra metadati mancanti
4. Non attribuisce fonte inesistente
5. Non attribuisce autore inesistente
6. Non attribuisce validazione
7. Produce avvisi verificabili

### 4.2 adaptUdaModel

**Input:** LegacyUdaModel + migrationDate  
**Output:** AdaptedLegacyItem<LegacyUdaModel>

**Comportamento:**
1. Preserva il dato originale
2. Preserva l'ID originale se valido
3. Assegna origine 'legacy'
4. Registra metadati mancanti
5. Non promuove automaticamente a 'institute'

---

## 5. Avvisi

| Avviso | Significato |
|--------|-------------|
| `Campo discipline mancante o vuoto` | Dato legacy incompleto |
| `Campo order mancante o vuoto` | Dato legacy incompleto |
| `Nessun traguardo definito` | Contenuto mancante |
| `Nessun obiettivo definito` | Contenuto mancante |
| `Data di creazione mancante` | Metadati mancanti |
| `Data di aggiornamento mancante` | Metadati mancanti |
| `ID originale preservato: {id}` | Informazione tracciamento |
| `Chiave originale: {key}` | Informazione tracciamento |

---

## 6. Limitazioni

1. **Non migra automaticamente:** Gli adattatori preparano i dati, non sostituiscono lo store
2. **Non promuove:** Un dato legacy non diventa automaticamente 'institute'
3. **Non valida:** Un dato legacy non viene validato come canonico
4. **Non preserva relazioni:** Le relazioni tra elementi non sono tracciate
5. **Non gestisce conflitti:** La duplicazione non è gestita dagli adattatori

---

## 7. Verifica

Gli adattatori sono verificati tramite:
- Test unitari in `identity.test.ts`
- Proprietà: `isLegacyDataPreserved()`
- Proprietà: `hasNoPhantomSource()`
- Proprietà: `hasNoPhantomAuthor()`
