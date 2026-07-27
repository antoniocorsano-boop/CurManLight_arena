# CML-633 Product Foundation Redesign

> **Classificazione:** `CML_633_PRODUCT_FOUNDATION_REDESIGN`  
> **Branch:** `design/cml-633-product-foundation-redesign`  
> **Data:** 27 luglio 2026  
> **Stato:** COMPLETO

---

## 1. Contesto

CurManLight Arena è nato come prototipo funzionante per la gestione curricolare scuola media. Dopo 8 iterazioni (CML-630 → CML-632), l'analisi strutturale CML-632 ha rivelato **7 cause radice** fondamentali che impediscono l'evoluzione del prodotto verso una piattaforma professionale.

**Punteggio complessivo audit:** 12/100 (0.6/5)  
**Verdetto:** `CML_632H_PRODUCT_STRUCTURAL_REFOUNDATION`

---

## 2. Principi Guida

### 2.1 Principi Fondamentali

| # | Principio | Significato |
|---|-----------|-------------|
| P1 | **Modello canonico prima** | Ogni entità ha una definizione unica, condivisa tra tutte le aree |
| P2 | **Persistenza con hash** | Ogni record ha ID deterministico, versione, firma crittografica |
| P3 | **Aree come viste** | Le 5 aree UI sono proiezioni diverse sullo stesso dominio |
| P4 | **Processo istituzionale** | Il flusso di lavoro segue la normativa scolastica italiana |
| P5 | **Documenti come entità** | Ogni documento è un oggetto tracciato, non un side-effect |
| P6 | **Configurazione istituzionale** | Struttura, ruoli, e regole sono configurabili per istituto |
| P7 | **UI dopo il dominio** | L'interfaccia consuma il modello, non lo definisce |

### 2.2 Vincoli di Implementazione

- **Nessuna modifica prodotto:** solo documenti di design e pseudotipi
- **Nessuna dipendenza aggiuntiva:** il design deve essere realizzabile con lo stack attuale
- **Nessun backend:** tutto rimane client-side con IndexedDB
- **Compatibilità:** il piano di migrazione deve preservare i dati esistenti

---

## 3. Cause Radice e Soluzioni

### RC-01: Assenza di modello dati canonico
**Problema:** Ogni area definisce i propri tipi. `UdaModel`, `Proposal`, `CurriculumSegment` coesistono senza relazioni formali.

**Soluzione:** `CML_633_CANONICAL_DOMAIN_MODEL.md`  
- Entità uniche: `Institute`, `CurriculumVersion`, `CurriculumSegment`, `CurriculumNode`, `VerticalCurriculumLink`, `Source`, `Proposal`, `Document`, `DocumentVersion`
- Ogni entità ha `id` (UUID), `version` (number), `sourceSignature` (hash SHA-256)
- Relazioni esplicite con foreign key tipizzate

### RC-02: Assenza di modello di processo istituzionale
**Problema:** Lo stato è un enum libero. Non esiste un workflow che rappresenti il percorso istituzionale reale.

**Soluzione:** `CML_633_STATE_ROLE_EVENT_MODEL.md`  
- Macchina a stati per ogni entità con transizioni definite
- Ruoli istituzionali: docente, dipartimento, referente, collegio, dirigente
- Event log immutabile per ogni cambio di stato

### RC-03: Aree progettate come moduli isolati
**Problema:** A01, A02, A03, A04, A07 non condividono contratti. I transfer sono breaking.

**Soluzione:** `CML_633_CROSS_AREA_TRANSFER_CONTRACTS.md`  
- Contratti di transfer formali con input/output tipizzati
- Firma crittografica per validità
- Transizioni di stato che attivano transfer

### RC-04: Prototipi rimasti nel prodotto
**Problema:** `programmazione-insegnamento` e `confronto-curricoli` sono prototipi in `src/features/planning/`.

**Soluzione:** classificazione e migrazione  
- `programmazione-insegnamento` → archiviata (dati migrati a `Document`)
- `confronto-curricoli` → mantenuta come tool di confronto (non generativa)
- Rimozione da `src/` dopo migrazione

### RC-05: Assenza di modello documento
**Problema:** I documenti sono eventi di esportazione. Non esiste un'entità `Document` tracciata.

**Soluzione:** `CML_633_DOCUMENT_AND_INSTITUTION_MODEL.md`  
- `Document` con versioning, firme, stili, destinatari
- `DocumentVersion` per ogni esportazione
- Template come entità configurabili

### RC-06: Assenza di configurazione istituzionale
**Problema:** Struttura e ruoli sono hardcoded in 8+ punti.

**Soluzione:** `CML_633_DOCUMENT_AND_INSTITUTION_MODEL.md`  
- `InstituteConfig` con struttura, ruoli, regole
- Identità scuola centralizzata
- Template e stili configurabili

### RC-07: Architettura UI precede il modello dominio
**Problema:** Lo store Zustand definisce lo schema. Il dominio è un sottoprodotto.

**Soluzione:** invertere la dipendenza  
- Il dominio definisce i tipi e le regole
- Lo store persiste il dominio
- La UI consuma il dominio

---

## 4. Visione Futura

### 4.1 Architettura Target

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React)                      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐             │
│  │ A01 │ │ A02 │ │ A03 │ │ A04 │ │ A07 │             │
│  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘             │
│     │        │        │        │        │                │
├─────┼────────┼────────┼────────┼────────┼────────────────┤
│     ▼        ▼        ▼        ▼        ▼                │
│              Domain Layer (TypeScript)                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Institute · CurriculumVersion · Segment · Node  │    │
│  │  VerticalLink · Source · Proposal · Document     │    │
│  │  StateMachine · EventLog · Validation            │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                                │
├─────────────────────────┼────────────────────────────────┤
│                         ▼                                │
│              Persistence Layer (IndexedDB)               │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Repositories · Migrations · Backups · Hash     │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Flusso Dati

1. **Utente agisce** → UI invoca operazione dominio
2. **Dominio valida** → transizione stato, vincoli, regole istituzionali
3. **Dominio persiste** → repository salva con hash e versione
4. **Event log registra** → immutabile, tracciabile
5. **UI reagisce** → stato aggiornato dal dominio

---

## 5. Documenti della Fondazione

| Documento | Contenuto |
|-----------|-----------|
| `CML_633_CANONICAL_DOMAIN_MODEL.md` | Modello entità, relazioni, vincoli |
| `CML_633_STATE_ROLE_EVENT_MODEL.md` | Macchine a stati, ruoli, event log |
| `CML_633_CROSS_AREA_TRANSFER_CONTRACTS.md` | Contratti di transfer tra aree |
| `CML_633_DOCUMENT_AND_INSTITUTION_MODEL.md` | Documento, configurazione, template |
| `CML_633_MIGRATION_AND_COMPATIBILITY_PLAN.md` | Piano di migrazione dati esistenti |
| `CML_633_IMPLEMENTATION_ROADMAP.md` | Roadmap CML-633A → CML-633L |
| `CML_633_DECISION_REGISTER.md` | Registro decisioni strutturali |

---

## 6. Criteri di Accettazione

| # | Criterio | Verifica |
|---|----------|----------|
| AC-01 | Ogni entità del modello canonico ha un'unica definizione | grep su `src/domain/curriculum/types.ts` |
| AC-02 | Ogni transizione stato è definita in una macchina a stati | grep su `src/domain/curriculum/types.ts` (mappe transizione) |
| AC-03 | Ogni transfer area ha un contratto formale | grep su `docs/foundation/CML_633_CROSS_AREA_TRANSFER_CONTRACTS.md` |
| AC-04 | Identità scuola è centralizzata in un'unica fonte | grep su `src/domain/curriculum/types.ts` (`InstituteConfig`) |
| AC-05 | Ogni documento esportato è un'entità tracciata | grep su `src/domain/curriculum/types.ts` (`Document`) |
| AC-06 | Piano di migrazione copre il 100% dei dati esistenti | `docs/foundation/CML_633_MIGRATION_AND_COMPATIBILITY_PLAN.md` |
| AC-07 | Roadmap ha dipendenze e milestone definite | `docs/foundation/CML_633_IMPLEMENTATION_ROADMAP.md` |
| AC-08 | Decision register ha almeno 15 decisioni documentate | `docs/foundation/CML_633_DECISION_REGISTER.md` |

---

## 7. Verdetto Finale

```
CML_633_PRODUCT_FOUNDATION_REDESIGN_COMPLETE
CANONICAL_DOMAIN_MODEL_DEFINED
STATE_ROLE_EVENT_MODEL_DEFINED
CROSS_AREA_TRANSFER_CONTRACTS_DEFINED
DOCUMENT_AND_INSTITUTION_MODEL_DEFINED
MIGRATION_PLAN_DEFINED
IMPLEMENTATION_ROADMAP_DEFINED
DECISION_REGISTER_DEFINED
```
