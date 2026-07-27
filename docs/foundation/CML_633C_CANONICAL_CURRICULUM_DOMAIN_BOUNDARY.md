# CML-633C Canonical Curriculum Domain Boundary

> **Stato:** IMPLEMENTATO LOCALMENTE, NON GOVERNANCE-ADOPTED
> **Data:** 27 luglio 2026
> **Vincolo:** nessuna promozione automatica dei dati legacy

## Scopo realizzato

Questa tranche introduce contratti TypeScript puri per descrivere fonti e nodi
curricolari canonici. Il docente potra' consultare in futuro dati curricolari
tracciabili per fonte senza modificare il curriculum esistente durante la
transizione.

Sono disponibili:

- `Source` e `SourceVersion`, con tipo, stato, ambito, localizzatore e catena di versione;
- `CurriculumVersion`, `CurriculumSegment`, `CurriculumNode` e `CurriculumLink` canonici;
- vocabolari per ordini, discipline, nuclei, nodi e relazioni;
- costruttori, validatori puri, repository in memoria, serializzazione con rifiuto degli schemi futuri e adapter di sola lettura da `curriculumKB`.

## Compatibilita' CML-631

Il barrel `src/domain/curriculum/index.ts` preserva i nomi e i validatori
CML-630E/CML-631 usati dal pilot. I contratti canonici che confliggono con essi
sono esportati con prefisso `Canonical` o con un alias esplicito, ad esempio
`CanonicalCurriculumNode`, `validateCanonicalCurriculumNode` e
`VALID_CANONICAL_LINK_STATUSES`.

Il pilot continua quindi a usare:

- `CurriculumSegment` e `CurriculumNode` legacy;
- `validateCurriculumSegment`, `validateCurriculumNode` e i validatori dei
  link verticali legacy;
- i propri dati e le proprie regole senza conversione implicita.

Gli alias sono temporanei: potranno essere rimossi solo dopo una migrazione
persistente approvata, la sostituzione di tutti i consumatori CML-631/CML-630E,
la verifica di parita' dei dati e la dismissione esplicita dei contratti legacy.

## Matrice di migrazione `curriculumKB`

| Dato legacy | Destinazione canonica | Stato |
|---|---|---|
| disciplina | `CurriculumSegment.disciplineCode` | adattato in sola lettura |
| ordine scolastico | `CurriculumSegment.schoolOrder` | adattato in sola lettura |
| traguardi | `CurriculumNode` di tipo `traguardo` | adattato in sola lettura |
| obiettivi | `CurriculumNode` di tipo `obiettivo` | adattato in sola lettura |
| evidenze | `CurriculumNode` di tipo `evidenza` | adattato in sola lettura |
| nuclei fondanti | vocabolario e note del segmento | preservati; multi-nucleo non assegnato arbitrariamente |
| proposte | nodo sperimentale separato | conservato senza promozione ad attivo |

Gli adapter non scrivono dati, non modificano `curriculumKB` e non sono una
migrazione persistente. Gli ID derivati sono deterministici da contesto e testo;
una migrazione effettiva richiedera' una decisione esplicita, conservazione degli
ID gia' assegnati, parita' completa dei dati e rollback.

`curriculumKB` resta l'autorita' legacy in sola lettura. Non esistono doppia
scrittura, promozione automatica, sincronizzazione o persistenza dei dati
canonici derivati.

## Regole di integrita'

- Ogni entita' canonica richiede ID e metadati validi.
- Ogni segmento fa riferimento a una versione curricolare valida.
- Ogni nodo fa riferimento a versione e segmento validi.
- Ogni link collega due nodi distinti e validi.
- Ogni segmento adattato appartiene alla versione legacy del proprio ordine, mai a
  una versione `primaria` usata come default per altri ordini.
- Una fonte legacy attiva genera un avviso: richiede conferma esplicita.
- I dati legacy restano autorevoli in lettura finche' non viene approvata una
  migrazione persistente.

## Esclusioni esplicite

- Nessun event log o event chain: il roadmap vigente lo assegna a CML-633C e
  richiede una decisione di scope prima di procedere.
- Nessuna persistenza IndexedDB dei nuovi contratti.
- Nessuna doppia scrittura tra legacy e dominio canonico.
- Nessuna modifica di contenuto al curriculum legacy.
- Nessun workflow istituzionale, modello documentale o configurazione
  dell'istituto.
- Nessuna modifica a roadmap o decision register, che sono governance congelata.

## Evidenza di verifica

- Test del dominio canonico: 59 test.
- Test identita' e dominio legacy: 125 test.
- Test di compatibilita' del barrel pubblico: 2 test.
- `npx tsc --noEmit`: nessun errore.

## Classificazione timeout IndexedDB

Il test `upgrades an isolated real IndexedDB from v1 to v2 preserving state` in
`src/__tests__/curriculum-persistence/schema.test.ts` e' escluso dal perimetro
di questa integrazione. Non importa il barrel pubblico, non usa il dominio
canonico e nessun file di schema, store o persistenza e' modificato qui.

Il timeout a 30 secondi e' stato osservato in una precedente esecuzione della
suite completa e del file isolato. Il caso eseguito con:

```text
npx vitest run src/__tests__/curriculum-persistence/schema.test.ts --testNamePattern "upgrades an isolated real IndexedDB from v1 to v2 preserving state"
```

ha poi superato in isolamento con exit code `0` (45,305 ms del processo;
13.48 s del test Vitest). Una successiva `npm test` e' terminata con exit code
`0` e 877 test superati. Il comportamento e' quindi classificato come
`PRE_EXISTING_INFRASTRUCTURE_TIMEOUT`: un'instabilita' intermittente della
suite, non una regressione di prodotto di questa integrazione.

La classificazione non autorizza modifiche al test, allo schema IndexedDB o ai
tempi di attesa in questa tranche.
