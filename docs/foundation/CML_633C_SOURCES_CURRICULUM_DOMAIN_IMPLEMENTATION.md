# CML-633C Sources and Curriculum Domain Implementation

**Status:** implemented locally, read-only transition boundary

Il docente potra' consultare un repertorio curricolare tracciabile senza modificare il contenuto legacy durante la transizione.

| Ambito | Contratto | Costruttori | Validatori | Repository | Adattatore | Serializzazione | Test | Integrazione |
|---|---|---|---|---|---|---|---|---|
| Source | si | si | si | si | si | si | si | A11 read contract |
| Source version | si | si | si | si | n/a, dati assenti | si | si | pronta |
| CurriculumVersion | si | si | si | si | si | si | si | A02 read contract |
| CurriculumSegment | si | si | si | si | si | si | si | A02 read contract |
| CurriculumNode | si | si | si | si | si | si | si | A02 read contract |
| CurriculumLink | si | si | si | si | nessun link legacy inventato | si | si | pronta |
| Evidence | nodo `evidenza` | si | si | nodi | si | si | si | A02 read contract |
| Vocabulary | si | n/a | normalizzazione | n/a | si | n/a | si | pronta |

## Decisioni

- Le evidenze sono `CanonicalCurriculumNode` con `nodeType: 'evidenza'`; non esiste una seconda entita' concorrente.
- `curriculumKB` resta autorevole. L'adattatore e il repository in memoria sono soltanto viste in lettura e non usano IndexedDB.
- Le fonti esterne non presenti nel repository non sono inventate: esiste solo il record di provenienza `curriculumKB legacy`, privo di autorita', data e versione; ogni nodo resta quindi senza fonte normativa risolvibile.
- Le proposte legacy sono nodi `indicatore` sperimentali separati da `nodes`; non diventano contenuto attivo.
- Il dominio usa ID deterministici derivati da contesto e testo per le entita' adattate. La modifica successiva del testo non ricalcola un ID gia' persistito: una migrazione approvata dovra' conservarlo.

## Lettura minima

- `createA11SourceReadModel` espone stato, completezza, metadati mancanti, nodi collegati e nodi senza fonte.
- `createA02CurriculumReadModel` filtra nodi per ordine, disciplina, tipo e testo. Non trasferisce dati ad A04 e non modifica la UI.

## Limiti espliciti

- Nessun collegamento canonico viene creato in assenza di una relazione verificabile nel legacy.
- I nuclei multipli sono conservati nelle note del segmento e classificati come incompleti: non viene assegnato arbitrariamente un nucleo al nodo.
- Non esistono SourceVersion legacy perche' il repository non contiene versioni della fonte; il contratto e il repository sono disponibili per l'import futuro.
- Gli alias `CanonicalCurriculumVersion`, `CanonicalCurriculumSegment`, `CanonicalCurriculumNode`, `CanonicalCurriculumLink`, i rispettivi validatori e `VALID_CANONICAL_LINK_STATUSES` restano temporanei fino a una migrazione persistente approvata.
