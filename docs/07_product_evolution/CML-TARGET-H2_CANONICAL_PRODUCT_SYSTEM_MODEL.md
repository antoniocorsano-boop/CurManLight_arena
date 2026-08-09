# CML-TARGET-H2 — Canonical Product System Model & Visual North Star

**Stato:** specifica madre pronta per approvazione  
**Baseline:** P1.2 congelata, commit `9f2ac12`  
**Dipendenze:** H0, H0.1 e H1-R1  
**Scope:** modello del prodotto, comportamento umano e north star visiva; nessuna modifica al runtime

## 1. Visione del prodotto

CurManLight è un ambiente curricolare d'istituto che collega curricolo,
progettazione, pratica didattica, valutazione riflessiva, condivisione
professionale e governance della revisione, mantenendo sempre le decisioni sotto
controllo umano.

Non è un generatore UDA, un repository di PDF, un social network, un compilatore
ministeriale, un dashboard di performance o un sistema che modifica
autonomamente il curricolo.

Il docente deve poter accumulare conoscenza utile senza perdere provenienza,
responsabilità e significato.

## 2. Attori e responsabilità

| Attore | Responsabilità canonica |
|---|---|
| Docente | consulta il vigente, progetta, usa UDA, formula osservazioni, condivide volontariamente e riflette sull'uso |
| Docente adottante | consulta una UDA condivisa, crea una copia derivata, la adatta e può valutarla dopo l'uso reale |
| Struttura intermedia | esamina, confronta, aggrega, modifica e sintetizza contributi secondo il processo configurato |
| Referente del curricolo | prepara e orchestra una revisione aperta su mandato; coordina materiali, fasi, conflitti e dossier |
| Dirigente scolastico | conferisce il mandato istituzionale che può aprire la revisione |
| Organo decisionale | assume la decisione curricolare prevista dal processo d'istituto |
| Sistema | conserva stato, provenienza, versioni, relazioni e vincoli; non sostituisce il giudizio umano |

Il nome della struttura intermedia è configurabile: dipartimento, intersezione,
interclasse o altra articolazione pertinente.

## 3. I quattro cicli canonici

### 3.1 Ciclo didattico

```text
curricolo vigente → contesto/classe → progettazione → UDA → erogazione → documentazione
```

### 3.2 Ciclo di miglioramento continuo

```text
UDA erogata → valutazione/autovalutazione anonima → evidenze
→ restituzione al docente → aggregazione di sistema → riflessione
→ miglioramento delle progettazioni successive
```

### 3.3 Ciclo di condivisione professionale delle UDA

```text
UDA del docente → condivisione volontaria → biblioteca condivisa
→ consultazione → adotta e crea una copia → adattamento personale
→ uso reale → valutazione professionale → conoscenza della comunità di pratiche
```

### 3.4 Ciclo straordinario di evoluzione del curricolo

```text
evento/esigenza istituzionale → mandato del dirigente
→ attivazione della Revisione Curricolo
→ preparazione guidata del referente → contributi dei docenti
→ elaborazione intermedia → sintesi del referente → verifica tecnica
→ decisione curricolare → applicazione → nuova versione → entrata in vigore
```

La revisione è normalmente chiusa. B3B gestisce proposte solo dentro una
revisione formalmente aperta; non apre il processo e non rende vigente una
modifica.

## 4. Oggetti professionali canonici

| Oggetto | Significato umano |
|---|---|
| Curricolo vigente | riferimento che vale per l'uso ordinario |
| Versione curricolare | stato identificabile del curricolo, con validità e provenienza |
| Segmento/nodo curricolare | elemento disciplinare o verticale consultabile e collegabile |
| Classe/contesto | gruppo reale a cui si riferisce il lavoro didattico |
| Progettazione | lavoro didattico costruito dal docente |
| UDA | unità progettuale utilizzabile, documentabile e condivisibile |
| Attività | azione prevista o svolta nel percorso |
| Evidenza/criterio | elemento osservabile usato per comprendere il lavoro |
| Verifica/rubrica | strumento di osservazione e valutazione professionale |
| Documento | risultato prodotto dalla progettazione o dal processo |
| Proposta di revisione | modifica versionata del curricolo dentro una revisione aperta |
| Processo/campagna di revisione | contenitore istituzionale di mandato, fasi, partecipanti e stato |
| Decisione curricolare | esito umano autorizzato su una proposta/versione |
| UDA condivisa | versione pubblicata volontariamente per la consultazione professionale |
| Copia derivata | UDA personale nata da un'UDA condivisa, con genealogia preservata |
| Evidenza anonima | feedback non identificativo usato per la riflessione aggregata |

## 5. Relazioni tra gli oggetti

Le relazioni devono conservare natura e provenienza. Esempi canonici:

```text
fonte/versione → segmento curricolare → nodo/obiettivo → evidenza/criterio
curricolo vigente → progettazione → UDA → attività → verifica/rubrica
UDA → documento
UDA condivisa → copia derivata → adattamento → uso reale → valutazione anonima
revisione aperta → proposta/versione → decisione → applicazione → nuova versione vigente
```

Una relazione può essere ufficiale, importata, proposta dall'IA, confermata dal
docente, proposta all'istituto o validata dal processo collegiale. Il tipo di
relazione non può essere dedotto soltanto dalla sua presenza nella UI.

## 6. Curricolo come lista, albero e grafo

La vista a grafo è una vista canonica del Curricolo, non un esperimento laterale.
Convive con:

| Vista | Bisogno |
|---|---|
| Lista | trovare rapidamente un riferimento noto |
| Albero | comprendere gerarchia e struttura |
| Grafo/Mappa | comprendere provenienza, continuità e relazioni |

Il grafo può mostrare fonti/versioni, segmenti, competenze, traguardi, obiettivi,
conoscenze, abilità, evidenze, progettazioni, UDA, attività, verifiche, rubriche,
documenti e decisioni.

La domanda professionale della mappa è:

> Fammi vedere da dove viene questo obiettivo, cosa lo precede, cosa segue, quali
> UDA lo usano, quali evidenze lo verificano e dove ricompare nel percorso verticale.

Il grafo è quindi uno strumento didattico e professionale. La selezione di un
nodo deve mantenere almeno `curriculumVersion`, disciplina, nodo, provenienza e
semantica di sola lettura quando si sta consultando.

## 7. Progettazione e UDA

La progettazione è il centro del ciclo didattico. Deve collegare classe/target,
curricolo, UDA, attività, evidenze e documento risultante.

Le azioni umane canoniche sono:

```text
consultare → progettare → salvare/riprendere → usare → documentare → riflettere
```

Le UDA possono essere condivise, ma la condivisione è sempre volontaria. “Adotta
e crea una copia” produce una nuova UDA personale; la copia può essere modificata
liberamente e non modifica l'originale.

## 8. Miglioramento continuo anonimo

La valutazione/autovalutazione collegata all'uso reale deve essere anonima e
aggregabile. Il sistema può restituire al docente segnali utili alla riflessione,
ma non deve trasformarli in una classifica personale o in una valutazione
individuale non autorizzata.

Il ciclo minimo è:

```text
uso reale → feedback anonimo → aggregazione → restituzione → riflessione
```

Il feedback non deve esporre identità, dati identificativi o inferenze su singoli
studenti. Gli output aggregati devono avere una soglia minima di anonimato.

## 9. Biblioteca condivisa delle UDA

L'interfaccia deve preferire “Biblioteca condivisa delle UDA” o “Comunità delle
pratiche” al termine generico “social”. La reputazione appartiene soprattutto
all'UDA, non al docente.

Indicatori professionali ammessi:

- numero di adozioni;
- utilizzi dichiarati o completati;
- valutazioni dopo l'uso reale;
- utilità percepita e adattabilità;
- chiarezza della struttura e coerenza con gli obiettivi;
- note professionali;
- numero e genealogia delle versioni derivate.

Non sono obiettivi canonici stelle decorative, classifiche competitive, follower
o engagement fine a se stesso.

La genealogia deve restare leggibile:

```text
UDA originale
  ├─ copia adattata A
  ├─ copia adattata B
  └─ copia adattata C
```

## 10. Revisione Curricolo di Istituto

La revisione è un processo straordinario e normalmente chiuso. Il referente può
attivarla solo su mandato esplicito del dirigente, nel quadro del processo che
conduce alla decisione dell'organo previsto.

Il wizard iniziale è quindi un wizard di apertura e preparazione, non di scrittura
di una singola proposta. Deve guidare il referente su:

1. motivazione;
2. mandato e contesto;
3. perimetro;
4. materiali;
5. partecipanti e articolazioni;
6. fasi, scadenze e responsabilità;
7. materiali per i docenti;
8. avvio formale.

Il percorso multilivello è:

```text
referente su mandato → apertura → docenti → strutture intermedie
→ referente/dossier → verifica tecnica → decisione curricolare
→ applicazione → nuova versione → entrata in vigore → chiusura
```

La decisione curricolare registra attore autorizzato, proposta/versione, esito,
data, motivazione e provenienza. Non è sinonimo di verifica tecnica.

## 11. Dashboard per docente e figure di sistema

Le dashboard devono mostrare lavoro e prossime azioni pertinenti al ruolo, non
metriche decorative.

| Ruolo | Vista utile |
|---|---|
| Docente | classe, lavori aperti, riferimenti usati, UDA, documenti e ripresa |
| Struttura intermedia | contributi, confronti, sintesi, conflitti e stato della fase |
| Referente | mandato, perimetro, completezza, materiali, convergenze e dossier |
| Organo decisionale | versione pertinente, motivazioni, verifiche, sintesi ed esito |
| Dirigente | mandato, stato istituzionale e passaggi autorizzativi |

Ogni card deve avere origine, stato, azione, autorizzazione e dato reale
disponibile. Un numero senza significato professionale non entra nella dashboard.

## 12. Privacy e anonimato

- il feedback di miglioramento è anonimo e aggregato;
- non si mostrano dati identificativi di studenti in viste professionali non autorizzate;
- l'adozione di un'UDA non espone automaticamente il docente autore;
- la condivisione è volontaria e distinta dall'uso personale;
- ruoli e capability limitano azioni e dati visibili;
- la provenienza deve restare leggibile anche quando i dati sono aggregati;
- nessun indicatore di reputazione deve diventare una valutazione personale implicita.

## 13. Ruoli e capability

Le capability descrivono azioni autorizzate, non solo elementi visibili.

| Azione | Capability concettuale | Semantica |
|---|---|---|
| consultare curricolo/grafo | `curriculum.read` | sola lettura |
| creare o reinviare proposta | `proposal.create` | dentro revisione aperta |
| eseguire verifica tecnica | `curriculum.validate` | esito tecnico, non approvazione |
| revisionare proposta | `document.review` | transizioni protette |
| registrare decisione | `curriculum.decide` | esito umano autorizzato |
| attivare revisione | `curriculum.review.open` | richiede mandato |
| condividere UDA | `uda.share` | volontario |
| adottare e copiare UDA | `uda.adopt` | crea derivata indipendente |
| registrare feedback anonimo | `feedback.submit.anonymous` | senza identificazione |
| applicare decisione | `curriculum.apply` | produce nuova versione |

Le capability effettive restano subordinate alle decisioni di implementazione e
alle autorizzazioni reali del prodotto.

## 14. Provenienza e versionamento

Ogni oggetto significativo deve poter rispondere a:

```text
da dove proviene → chi lo ha creato/modificato → quale versione è
→ in quale processo è stato usato → quale effetto ha prodotto
```

Le copie derivate non sovrascrivono l'originale. Le proposte sono immutabili per
versione. Una decisione deve puntare alla versione pertinente. Una nuova versione
curricolare diventa vigente solo attraverso un'applicazione esplicita e tracciata.

## 15. Mappa delle viste

| Vista canonica | Ciclo prevalente | Bisogno principale |
|---|---|---|
| Home | tutti | riprendere il lavoro e vedere la prossima azione |
| Classe | didattico | orientare il lavoro su un gruppo |
| Curricolo — lista/albero/grafo | didattico/evoluzione | comprendere riferimenti e relazioni |
| Progettazione/UDA | didattico | costruire il lavoro |
| Biblioteca UDA | condivisione | adottare e adattare pratiche |
| Pratica e feedback | miglioramento | riflettere su uso ed evidenze |
| Revisione Curricolo | evoluzione | preparare e seguire una campagna aperta |
| Struttura intermedia | evoluzione | confrontare e sintetizzare |
| Dossier/Decisione | evoluzione | assumere e registrare l'esito |
| Documenti | didattico/evoluzione | vedere risultati e versioni |

Una vista non può introdurre una mutazione soltanto perché il dato è visibile.

## 16. Mockup canonico: north star

```text
                         CURMANLIGHT
                Ambiente curricolare d'istituto

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ CURRICOLO    │ PROGETTAZIONE│ PRATICA      │ MIGLIORAMENTO │
│ lista        │ percorsi     │ classi       │ feedback      │
│ albero       │ UDA          │ erogazione   │ riflessione   │
│ grafo/mappa  │ rubriche     │ evidenze     │ dashboard     │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘
       └───────────────┴──────────────┴───────────────┘
                              │
                    BIBLIOTECA UDA CONDIVISE
                       adotta / copia / valuta
                              │
             REVISIONE CURRICOLO D'ISTITUTO
                         [normalmente chiusa]
                              │
                    mandato → apertura → lavoro
                 docenti → strutture → referente
                    decisione → nuovo vigente
```

Questo mockup è una mappa mentale, non una prescrizione di layout. Ogni elemento
visivo dovrà avere la catena:

```text
screen/widget → bisogno umano → caso d'uso → dominio → capability
→ stato → azione → autorizzazione → dato reale disponibile
```

Se la catena non è dimostrabile, l'elemento non entra nel mockup canonico.

## 17. Matrice vista → caso d'uso → dominio → capability

| Vista | Caso d'uso | Dominio | Capability | Stato minimo |
|---|---|---|---|---|
| Curricolo grafo | capire relazioni | curriculum | `curriculum.read` | versione, disciplina, nodo |
| Classe | lavorare sulla 2A | context/class | `class.read` | classe attiva |
| Progettazione | preparare UDA | planning | `planning.write` | bozza/in corso |
| Home | riprendere lavoro | workspace | `workspace.read` | ultimo lavoro reale |
| Biblioteca UDA | adottare una pratica | shared-uda | `uda.adopt` | pubblicata, derivata |
| Feedback | riflettere sull'uso | improvement | `feedback.submit.anonymous` | aggregabile |
| Revisione | preparare campagna | curriculum-review | `curriculum.review.open` | mandato, aperta/chiusa |
| Decisione | registrare esito | curriculum-decision | `curriculum.decide` | versione pertinente |
| Documenti | vedere risultato | documents | `documents.read` | origine/versione |

## 18. Criteri di accettazione

- **AC-H2-01:** ogni nuova superficie è riconducibile a un ciclo canonico.
- **AC-H2-02:** ogni widget dichiara bisogno, dominio, capability, stato e dato reale.
- **AC-H2-03:** il Curricolo offre lista, albero e grafo senza confondere lettura e mutazione.
- **AC-H2-04:** la revisione è normalmente chiusa e richiede mandato per l'apertura.
- **AC-H2-05:** una proposta B3B non esiste come modifica indipendente fuori da una revisione aperta.
- **AC-H2-06:** una copia UDA non modifica l'originale e conserva la genealogia.
- **AC-H2-07:** il feedback di miglioramento è anonimo e aggregato.
- **AC-H2-08:** la reputazione deriva soprattutto dall'uso reale, non da engagement decorativo.
- **AC-H2-09:** una decisione punta alla versione pertinente e non equivale alla verifica tecnica.
- **AC-H2-10:** una nuova versione diventa vigente solo tramite applicazione esplicita e tracciata.
- **AC-H2-11:** le dashboard mostrano azioni e stati pertinenti al ruolo.
- **AC-H2-12:** nessuna vista inventa relazioni o dati mancanti.

## 19. Gap baseline / target

| Target | Stato rispetto alla baseline `9f2ac12` |
|---|---|
| Consultazione verticale curricolo | Parzialmente presente |
| Progettazione, UDA e documenti | Presenti con continuità incompleta |
| Revisione istituzionale aperta su mandato | Non presente come processo completo |
| Workflow B3B protetto | Non presente integralmente |
| Verifica tecnica B3C | Non presente |
| Decisione curricolare B3E | Non presente |
| Applicazione e nuova versione vigente | Da definire nel target |
| Biblioteca UDA e genealogia | Non presente come ciclo completo |
| Miglioramento anonimo aggregato | Non presente come ciclo completo |
| Grafo canonico collegato a UDA/evidenze | Parziale/sperimentale |
| Dashboard per ruoli | Parziale |

Il gap è una guida alla convergenza, non un'autorizzazione a implementare tutto.

## 20. Sequenza di implementazione

P1.3 non viene ancora definita come elenco di schermate. Ogni successiva slice
dovrà prima specificare:

```text
target view → bisogno umano → caso d'uso → dominio → capability
→ continuità di stato → vincoli di provenienza → criteri di accettazione → gap
```

Ordine concettuale consigliato:

1. validare H2 come contratto del prodotto;
2. derivare il mockup canonico verificato;
3. scegliere una sola slice umana coerente con H2;
4. definire il task e la sua superficie senza introdurre dati fittizi;
5. implementare e verificare contro la matrice e gli acceptance criteria.

## Verdetto

```text
CML_TARGET_H2_CANONICAL_PRODUCT_SYSTEM_MODEL_READY_FOR_APPROVAL
H1_R1_REMAINS_THE_HUMAN_WORKFLOW_SOURCE
P1_3_NOT_DEFINED
NO_RUNTIME_CHANGE_AUTHORIZED
```

Questo documento è la fonte di verità proposta per mockup, roadmap tecnica e
task degli agenti. Nessuna feature significativa deve essere costruita senza
essere riconducibile a H2 e al mockup canonico aggiornato.
