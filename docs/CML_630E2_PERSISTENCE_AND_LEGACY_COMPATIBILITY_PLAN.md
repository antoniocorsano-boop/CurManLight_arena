# CML-630E2 — Persistence and Legacy Compatibility Plan

> **Stato:** PIANO — non implementativo  
> **Data:** 2026-07-24  
> **Fondazione:** CML-630E1 (contratti produttivi definiti)

---

## 1. Stato attuale degli store

Lo store principale è `src/store/useCurriculumStore.ts`:

- **Tecnologia:** Zustand 4 + persist + Dexie 4 (IndexedDB)
- **Tier:** Tier 2 (navigazione) per lo stato del curriculum
- **Dati persistiti:** schoolYear, decisions, customTexts, savedUda, activeRevisionFilter

### Store esistenti rilevanti

| Store | Dati | Tier |
|-------|------|------|
| `useCurriculumStore` | schoolYear, decisions, customTexts, savedUda | Tier 2 |
| `useUserStore` | role, discipline, order | Tier 2 |
| `useDocumentExportStore` | documentExportHistory | Tier 1 |

---

## 2. Schema IndexedDB corrente

Dexie gestisce automaticamente lo schema tramite le definizioni nello store. Lo schema attuale:

```typescript
// useCurriculumStore.ts (simplificato)
const useCurriculumStore = create(
  persist(
    (set, get) => ({
      schoolYear: '2025-2026',
      decisions: {},
      customTexts: {},
      savedUda: [],
      // ...
    }),
    {
      name: 'curmanlight-curriculum',
      storage: createJSONStorage(() => dexieStorage),
    }
  )
);
```

**Non esiste attualmente:** nessuna tabella per versioni, segmenti, nodi o link curricolari.

---

## 3. Dati legacy coinvolti

| Dati legacy | Tipo | Mapping futuro |
|-------------|------|----------------|
| `schoolYear: string` | `'2025-2026'` | `AcademicYear` strutturato |
| `decisions: Record<string, DecisionStatus>` | Voti su proposte | Estendibile per voti su versioni |
| `customTexts: Record<string, string>` | Testi custom | Compatibile con `Proposal` |
| `savedUda: UdaModel[]` | UDA salvate | Da non toccare |
| `curriculumKB` | Knowledge base statica | Primo segmento legacy |
| `DisciplineData` | Struttura statica | Diventa contenuto segmento |

---

## 4. Proposta di persistenza

### 4.1 Nuove tabelle IndexedDB

```typescript
// Nuove tabelle da aggiungere
interface CurManLightDB {
  curriculumVersions: InstituteCurriculumVersion;
  curriculumSegments: CurriculumSegment;
  curriculumNodes: CurriculumNode;
  curriculumVerticalLinks: VerticalCurriculumLink;
}
```

### 4.2 Strategia di versionamento schema

```text
Versione schema attuale: 1
Versione schema dopo CML-630E2: 2

Migrazione:
- Aggiungere tabelle nuove
- Non rimuovere tabelle esistenti
- Non modificare struttura tabelle esistenti
```

### 4.3 Indici consigliati

```typescript
// curriculumSegments
db.version(2).stores({
  curriculumVersions: 'id, status, effectiveFrom',
  curriculumSegments: 'id, versionId, schoolLevel, subjectOrFieldId',
  curriculumNodes: 'id, versionId, segmentId, type',
  curriculumVerticalLinks: 'id, versionId, sourceNodeId, targetNodeId, status',
});
```

---

## 5. Strategia di migrazione

### 5.1 Fase 1: Migrazione dati legacy (CML-630F+)

```text
curriculumKB → CurriculumSegment (snapshot iniziale)
DisciplineData → CurriculumSegmentContent (adattamento)
schoolYear → AcademicYear (trasformazione)
```

### 5.2 Fase 2: Creazione versione iniziale

```text
1. Creare InstituteCurriculumVersion "Curricolo 2025-2026"
2. Creare segmenti per ogni disciplina/ordine
3. Creare nodi per traguardi, obiettivi, evidenze
4. Impostare stato "effective" per dati esistenti
```

### 5.3 Fase 3: Coesistenza

```text
- Dati legacy restano leggibili
- Nuovi dati sono scrivibili solo nel nuovo formato
- Flag di migrazione per tracciare stato
```

---

## 6. Rollback

```text
1. Rimuovere nuove tabelle IndexedDB
2. Mantenere tabelle esistenti intatte
3. Nessuna modifica ai dati legacy
4. Flag di rollback per tracciare stato
```

---

## 7. Compatibilità in lettura

| Dato | Lettura legacy | Lettura nuova | Strategia |
|------|----------------|---------------|-----------|
| schoolYear | `string` | `AcademicYear` | Adattatore puro |
| decisions | `Record<string, DecisionStatus>` | Esteso | Compatibile |
| curriculumKB | `Record<string, DisciplineData>` | `CurriculumSegment[]` | Adattatore puro |
| savedUda | `UdaModel[]` | Invariato | Nessuna modifica |

---

## 8. Compatibilità in scrittura

| Operazione | Legacy | Nuova | Strategia |
|------------|--------|-------|-----------|
| Salvare UDA | `savedUda.push()` | Invariato | Nessuna modifica |
| Modificare testo | `customTexts[key] = value` | Invariato | Nessuna modifica |
| Creare versione | Non supportato | `curriculumVersions.add()` | Nuova funzione |
| Modificare segmento | Non supportato | `curriculumSegments.update()` | Nuova funzione |

---

## 9. Import/Export futuro

```text
Formato attuale: JSON con UDA, decisions, customTexts
Formato futuro: JSON con versioni, segmenti, nodi, link
Compatibilità: retroattiva (il formato futuro include il legacy)
```

---

## 10. Rischi

| Rischio | Impatto | Probabilità | Mitigazione |
|---------|---------|-------------|-------------|
| Incompatibilità schema IndexedDB | Alto | Media | Migrazione incrementale |
| Perdita dati legacy | Alto | Bassa | Backup prima della migrazione |
| Complessità adattatori | Medio | Alta | Test approfonditi |
| Performance con molte entità | Medio | Bassa | Indici appropriati |

---

## 11. Test di migrazione necessari

1. Migrazione da schema 1 a schema 2
2. Lettura dati legacy dopo migrazione
3. Scrittura nuovi dati dopo migrazione
4. Rollback a schema 1
5. Coesistenza legacy e nuovi dati

---

## 12. Criteri di apertura slice implementativa

La slice successiva (CML-630F2 o equivalente) potrà iniziare quando:

1. Questo piano è stato revisionato e approvato
2. I contratti CML-630E1 sono stabili
3. Non ci sono blocking issue dalla fase di analisi
4. La strategia di migrazione è chiara

---

## 13. Parti da non affrontare ancora

- Integrazione UI con nuovi tipi
- Modifica store esistenti
- Migrazione dati reale
- Import/Export nel nuovo formato
- Collaborazione con e-Twin
- Backend o sincronizzazione

---

## 14. Verdetto

```text
CML_630E2_PERSISTENCE_PLAN_COMPLETE
READY_FOR_REVIEW
AWAITING_CML_630E1_STABILITY_CONFIRMATION
```
