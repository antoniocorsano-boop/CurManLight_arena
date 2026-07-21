# CurManLight - Working Protocol

> Modalità di lavoro dal post-CML-604 in poi.

## Stato del Progetto

CurManLight NON è più in fase di migrazione tecnica.

- **Baseline architetturale**: congelata (CML-603 Gate PASSED)
- **Baseline di navigazione**: congelata (CML-604 Gate PASSED)
- **Punto di ingresso**: `docs/PROJECT_BASELINE.md`

## Modalità

**Evolvere CurManLight come prodotto destinato ai docenti.**

Ogni modifica deve produrre un beneficio concreto per l'utente finale.

## Vincoli

### Vietato

- Nuovi refactoring strutturali
- Rinominare directory
- Cambiare layering
- Modificare la shell
- Modificare il routing
- Cambiare la governance
- Introdurre nuovi framework
- Introdurre nuovi state manager
- Modificare decisioni Verified

Ogni eccezione richiede una nuova Architecture Decision.

### Principio guida

Usare la baseline esistente. Non modificarla.

## Ordine di valutazione

Ogni proposta deve essere valutata secondo questo ordine:

1. Valore per il docente
2. Valore per il dipartimento
3. Riduzione del tempo necessario per svolgere il lavoro
4. Riduzione della complessità percepita
5. Solo infine impatto tecnico

## Ambiti consentiti

- Esperienza utente
- Workflow
- Onboarding
- Progettazione didattica
- Consultazione curriculum
- Gestione documentale
- Knowledge base
- Assistenza contestuale
- Esportazione
- Importazione
- Collaborazione dipartimentale
- Qualità delle informazioni
- Accessibilità
- Performance percepita

## Ambiti esclusi

- Nuovi pattern architetturali
- Nuova organizzazione repository
- Nuovi layer
- Nuove cartelle
- Nuovi wrapper
- Nuove librerie salvo reale necessità

## Formato proposta

Ogni proposta deve contenere:

1. Problema osservato
2. Impatto sugli utenti
3. Analisi UX
4. Analisi funzionale
5. Mock del comportamento
6. Piano incrementale
7. Rischi
8. Criteri di validazione

Solo dopo approvazione procedere con l'implementazione.

## Obiettivo finale

CurManLight deve diventare il miglior ambiente possibile per la progettazione curricolare dei docenti.

La priorità assoluta non è più la tecnologia.

La priorità è l'esperienza di lavoro dell'utente.

---

*Definito post-CML-604. Ogni modifica a questo protocollo richiede una nuova Architecture Decision.*
