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

## La domanda giusta

Non: "Come miglioriamo il codice?"

Ma: "Qual è il prossimo problema reale che un docente incontra usando CurManLight?"

## Ciclo di lavoro

1. **Osservazione del lavoro del docente**
   - dove perde tempo?
   - dove si blocca?
   - dove deve ricordare troppe cose?

2. **Analisi funzionale**
   - il problema è davvero del prodotto?
   - è un problema di flusso, di linguaggio o di informazioni?

3. **Mock realistico**
   - comportamento prima dell'implementazione
   - un solo cambiamento significativo per volta

4. **Implementazione incrementale**
   - senza toccare la baseline salvo necessità documentata

5. **Validazione**
   - il docente completa il lavoro più velocemente?
   - commette meno errori?
   - capisce meglio cosa fare?

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

## Regola per ogni proposta

> **Ogni nuova iniziativa deve poter essere riassunta in una frase che inizi con "Il docente potrà..."**

Esempi:
- "Il docente potrà riprendere il lavoro esattamente dal punto in cui lo aveva lasciato."
- "Il docente potrà confrontare due UDA senza cambiare schermata."
- "Il docente potrà verificare automaticamente se la progettazione copre tutti gli obiettivi previsti."

Se una proposta non riesce a essere espressa in questo modo, probabilmente è ancora centrata sulla tecnologia invece che sul prodotto.

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

1. **Frase "Il docente potrà..."**
2. Problema osservato
3. Impatto sugli utenti
4. Analisi UX
5. Analisi funzionale
6. Mock del comportamento
7. Piano incrementale
8. Rischi
9. Criteri di validazione

Solo dopo approvazione procedere con l'implementazione.

## Iniziative tipo

Più che milestone tecniche, programmi orientati al lavoro reale:

- **Teacher Workspace**: ridurre il carico cognitivo durante la progettazione
- **Department Collaboration**: migliorare il confronto tra docenti e dipartimento
- **Knowledge Companion**: usare la base documentale per dare suggerimenti contestuali
- **Curriculum Review**: aiutare il docente a verificare completezza e coerenza prima dell'esportazione
- **First-time Experience**: fare in modo che un docente nuovo riesca a usare il sistema senza spiegazioni esterne

Queste iniziative sfruttano la piattaforma costruita invece di modificarla.

## Obiettivo finale

CurManLight deve diventare il miglior ambiente possibile per la progettazione curricolare dei docenti.

La priorità assoluta non è più la tecnologia.

La priorità è l'esperienza di lavoro dell'utente.

---

*Definito post-CML-604. Ogni modifica a questo protocollo richiede una nuova Architecture Decision.*
