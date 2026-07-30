# CML-637 — Trama
## Grafo interattivo del curricolo

**Prodotto:** CurManLight  
**Modulo:** Trama  
**Nome tecnico:** Curriculum Graph  
**Stato:** product blueprint  
**Verdetto:** `TRAMA_PRODUCT_BLUEPRINT_READY_FOR_TAXONOMY_DESIGN`

## 1. Visione

Trama è l’ambiente di CurManLight attraverso il quale il curricolo viene rappresentato, esplorato e utilizzato come una rete navigabile di elementi collegati.

Lo strumento permette al docente di comprendere:

- dove si colloca un elemento curricolare;
- da quali apprendimenti deriva;
- quali apprendimenti prepara;
- con quali conoscenze, abilità e concetti è collegato;
- quali attività possono svilupparlo;
- quali evidenze possono documentarlo;
- quali fonti ne sostengono la formulazione;
- quali connessioni interdisciplinari presenta;
- come può essere trasferito nella progettazione didattica.

Trama non rappresenta il curricolo come un elenco o come un unico albero gerarchico. Lo rappresenta come un **grafo curricolare tipizzato, versionato e fondato su fonti**, accessibile mediante viste progressive.

## 2. Problema

I curricoli tradizionali sono generalmente organizzati in documenti, tabelle ed elenchi disciplinari. Questa forma rende difficile:

- leggere la continuità tra ordini e classi;
- distinguere competenze, traguardi, obiettivi, conoscenze e abilità;
- individuare prerequisiti, sviluppi, duplicazioni e lacune;
- rendere esplicite le connessioni interdisciplinari;
- risalire dalle formulazioni alle fonti;
- collegare consultazione, revisione, progettazione e documentazione;
- governare versioni, proposte e decisioni.

Trama rende esplicite, navigabili e verificabili le relazioni già presenti o deliberate nel curricolo.

## 3. Promessa al docente

> Il docente può partire da un elemento del curricolo, comprenderne il significato, attraversarne le connessioni e utilizzarlo nella progettazione senza perdere il riferimento alla fonte, alla versione e al contesto istituzionale.

## 4. Principi vincolanti

1. **Un solo grafo canonico, molte viste operative.**
2. **L’albero è una proiezione del grafo**, non il modello dati.
3. Nodi e relazioni sono entità distinte e versionate.
4. Ogni relazione significativa deve essere motivabile.
5. Il curricolo vigente deve essere distinto da proposte e suggerimenti.
6. Le versioni approvate sono immutabili.
7. La fonte deve essere raggiungibile dal nodo.
8. Il grafo deve alimentare progettazione, revisione e documenti.
9. La visualizzazione completa non è la vista iniziale.
10. Deve esistere una vista tabellare accessibile.
11. Nessun dato personale dello studente appartiene al primo dominio.
12. L’intelligenza artificiale può suggerire, non decidere.
13. Il primo rilascio deve funzionare localmente.
14. La tassonomia deve restare estendibile.
15. Il linguaggio dell’interfaccia deve essere scolastico, non informatico.

## 5. Posizionamento in CurManLight

Trama non è una superficie isolata. Si integra con:

- Consultazione del curricolo;
- Revisione curricolare;
- Progettazione didattica;
- Percorso guidato del docente;
- Fonti;
- Documenti ed esportazione;
- Configurazione istituzionale;
- Registro delle decisioni;
- Assistente locale opzionale.

### Punti di accesso

- disciplina o nucleo nella consultazione;
- scheda di traguardo, obiettivo o competenza;
- progettazione;
- revisione;
- dettaglio di una fonte;
- documento curricolare;
- ricerca generale;
- curricolo verticale.

### Azioni in uscita

- aggiungere un nodo alla progettazione;
- aprire una fonte;
- iniziare una proposta di revisione;
- confrontare nodi;
- creare una raccolta;
- aprire il curricolo verticale;
- esportare una vista;
- aprire il documento di origine.

## 6. Ruoli

### Docente

Consulta, filtra, segue connessioni, crea raccolte, trasferisce nodi alla progettazione e propone collegamenti o revisioni. Non modifica direttamente il curricolo vigente.

### Coordinatore di dipartimento

Esamina proposte, confronta nodi, individua sovrapposizioni, prepara revisioni e relazioni dipartimentali.

### Referente per il curricolo

Cura coerenza, tassonomia, validazione, versioni, lacune e duplicazioni.

### Dirigente o soggetto autorizzato

Consulta lo stato complessivo, verifica provenienza e decisioni e formalizza versioni secondo le procedure d’istituto.

## 7. Modello concettuale

Il dominio comprende:

1. nodi curricolari;
2. relazioni curricolari;
3. contesti;
4. fonti;
5. versioni;
6. decisioni;
7. viste;
8. raccolte operative.

## 8. Famiglie di nodi

### A. Struttura curricolare

- curricolo;
- sezione curricolare;
- ordine di scuola;
- fascia o classe;
- periodo;
- area disciplinare;
- disciplina;
- campo di esperienza;
- nucleo tematico;
- ambito;
- percorso;
- unità curricolare.

### B. Finalità e risultati

- finalità;
- profilo;
- competenza;
- competenza chiave;
- traguardo per lo sviluppo della competenza;
- obiettivo di apprendimento;
- risultato atteso;
- prestazione;
- livello di padronanza.

### C. Componenti dell’apprendimento

- concetto;
- conoscenza;
- abilità;
- procedura;
- tecnica;
- metodo;
- strategia;
- atteggiamento;
- disposizione;
- linguaggio specifico;
- rappresentazione;
- modello;
- strumento.

### D. Esperienze didattiche

- attività;
- esercizio;
- laboratorio;
- esperienza;
- progetto;
- problema;
- compito;
- compito autentico;
- situazione;
- caso;
- esperimento;
- produzione;
- discussione;
- ricerca;
- osservazione.

### E. Valutazione ed evidenze

- evidenza;
- prodotto;
- comportamento osservabile;
- prova;
- compito di verifica;
- criterio;
- indicatore;
- descrittore;
- livello;
- rubrica;
- strumento di osservazione;
- riscontro formativo.

### F. Fonti e riferimenti

- fonte normativa;
- documento ministeriale;
- documento europeo;
- documento d’istituto;
- delibera;
- verbale;
- estratto;
- riferimento;
- nota interpretativa;
- fonte disciplinare;
- bibliografia;
- risorsa.

### G. Governo e revisione

- proposta;
- osservazione;
- decisione;
- revisione;
- approvazione;
- sostituzione;
- integrazione;
- motivazione;
- versione;
- evento;
- responsabilità.

## 9. Famiglie di relazioni

Ogni relazione possiede tipo, origine, destinazione, direzione, motivazione, fonte, stato, versione, autore e data.

### Strutturali

- appartiene a;
- contiene;
- è parte di;
- è collocato in;
- è valido per;
- è una specializzazione di;
- è una formulazione locale di.

### Di sviluppo

- sviluppa;
- contribuisce a;
- prepara a;
- prosegue in;
- approfondisce;
- consolida;
- amplia;
- trasferisce;
- integra;
- introduce;
- riprende.

### Di prerequisito

- richiede;
- presuppone;
- è prerequisito di;
- dipende da;
- utilizza;
- mobilita.

### Semantiche

- è affine a;
- è equivalente a;
- è distinto da;
- è esempio di;
- è applicazione di;
- rappresenta;
- definisce;
- specifica;
- condivide il concetto;
- condivide l’abilità.

### Interdisciplinari

- si collega a;
- converge con;
- contribuisce con;
- condivide un problema;
- condivide un prodotto;
- condivide un’evidenza;
- è trasversale a;
- è applicato in.

### Didattiche e valutative

- è sviluppato attraverso;
- è esercitato mediante;
- è osservato attraverso;
- produce;
- utilizza;
- è documentato da;
- è verificato da;
- è valutato mediante;
- produce evidenza di;
- è descritto da;
- utilizza il criterio.

### Documentali e di revisione

- deriva da;
- è citato in;
- è fondato su;
- è approvato mediante;
- compare nella versione;
- sostituisce;
- modifica;
- integra;
- corregge;
- supera;
- è proposta di modifica di.

### Continuità verticale già canonica in CurManLight

- continuità;
- sviluppo;
- approfondimento;
- prerequisito;
- integrazione;
- discontinuità.

## 10. Stati

### Stato istituzionale del nodo

- bozza;
- proposto;
- in esame;
- validato;
- approvato;
- vigente;
- in revisione;
- sostituito;
- archiviato;
- respinto.

### Origine

- nazionale;
- europea;
- regionale;
- istituzionale;
- dipartimentale;
- docente;
- importata;
- sperimentale.

### Stato di completezza

- completo;
- privo di fonte;
- privo di relazioni;
- privo di collocazione;
- possibile duplicato;
- incoerente;
- da verificare;
- non classificato.

### Stato della relazione

- proposta;
- suggerita;
- da verificare;
- validata;
- approvata;
- respinta;
- sostituita;
- archiviata.

## 11. Scheda del nodo

La selezione di un nodo apre un pannello laterale coerente in tutte le viste.

### Intestazione

- titolo;
- tipo;
- stato;
- origine;
- disciplina;
- ordine;
- classe o fascia;
- nucleo;
- versione.

### Contenuto

- formulazione completa;
- descrizione;
- interpretazione;
- parole chiave;
- note;
- percorso di collocazione.

### Connessioni

- ciò che viene prima;
- ciò che viene dopo;
- elementi richiesti;
- elementi sviluppati;
- collegamenti interdisciplinari;
- attività;
- evidenze;
- fonti;
- documenti.

### Provenienza

- fonte;
- estratto;
- sezione o pagina;
- data;
- versione;
- decisione associata;
- responsabile della validazione.

### Azioni

- aggiungi alla progettazione;
- confronta;
- segui il percorso;
- apri la fonte;
- mostra nel curricolo verticale;
- mostra le connessioni;
- aggiungi a una raccolta;
- proponi una relazione;
- proponi una revisione;
- esporta la scheda.

## 12. Viste

### Esplora

Vista iniziale filtrabile per ordine, classe, disciplina, area, nucleo, tipo, stato, origine, fonte e versione.

### Albero curricolare

Proiezione gerarchica configurabile, per esempio:

- disciplina → nucleo → traguardo → obiettivo;
- competenza → traguardi → obiettivi;
- ordine → classe → disciplina → nucleo;
- fonte → elementi derivati.

### Percorso

Mostra una sequenza leggibile:

> prerequisiti → nodo corrente → sviluppi successivi

### Curricolo verticale

Mostra continuità, sviluppo, approfondimento, prerequisiti, integrazioni e discontinuità tra ordini, classi e fasce.

### Mappa delle connessioni

Mostra il nodo corrente e un insieme limitato di relazioni selezionate, con espansione progressiva e alternativa testuale.

### Interdisciplinare

Parte da concetto, competenza, problema, prodotto, abilità, tema, obiettivo o attività e mostra le discipline collegate.

### Fonti

Parte da una fonte e mostra nodi derivati, decisioni, versioni ed elementi privi di riferimento puntuale.

### Revisione

Evidenzia differenze tra versioni, proposte, motivazioni, decisioni e relazioni modificate.

### Tabella

Offre una consultazione accessibile con colonne configurabili.

## 13. Ricerca e raccolte

La ricerca opera su titolo, formulazione, descrizione, parole chiave, codice, fonte, disciplina, nucleo e note.

Il docente può creare raccolte personali, dipartimentali, per progettazione, confronto, revisione o esportazione. Le raccolte non modificano il curricolo.

## 14. Integrazione con la progettazione

Il comando **Aggiungi alla progettazione** trasferisce:

- identificativo;
- formulazione;
- tipo;
- disciplina;
- fonte;
- versione;
- stato;
- data di selezione;
- eventuale motivazione del docente.

La progettazione conserva un riferimento al nodo originario. Gli aggiornamenti successivi non vengono applicati automaticamente: il docente confronta e decide.

## 15. Integrazione con revisione, fonti e documenti

Ogni proposta genera una nuova entità e non modifica direttamente il nodo vigente.

Ogni nodo può essere collegato a fonti, estratti, documenti, decisioni, verbali, versioni, progettazioni e documenti prodotti. La navigazione deve funzionare in entrambe le direzioni.

## 16. Assistenza locale opzionale

L’intelligenza artificiale locale può suggerire:

- relazioni;
- prerequisiti;
- sviluppi;
- affinità;
- duplicazioni;
- nodi isolati;
- connessioni interdisciplinari;
- spiegazioni del percorso;
- categorie e parole chiave.

Ogni suggerimento resta non approvato, motivato, riconoscibile e soggetto a consenso e verifica umana.

## 17. Regole di integrità

### Nodi

- tipo e identificativo obbligatori;
- appartenenza ad almeno un contesto;
- fonte o decisione per ogni nodo approvato;
- successore indicato per ogni nodo sostituito;
- appartenenza a una versione;
- impossibilità di trattare un nodo archiviato come vigente.

### Relazioni

- origine e destinazione esistenti;
- tipo obbligatorio;
- motivazione per relazioni interpretative;
- assenza di cicli nelle relazioni di prerequisito e appartenenza;
- separazione tra proposte e relazioni approvate;
- riconoscibilità dei suggerimenti dell’intelligenza artificiale;
- conservazione della cronologia.

### Versioni

- immutabilità delle versioni approvate;
- confronto di nodi e relazioni;
- dichiarazione della versione in ogni esportazione;
- conservazione della versione usata nelle progettazioni.

## 18. Controlli automatici di qualità

Trama segnala:

- nodi senza fonte, contesto o relazioni;
- relazioni non motivate;
- possibili duplicati;
- cicli di prerequisito;
- progressioni interrotte;
- passaggi verticali critici;
- obiettivi senza traguardi;
- traguardi senza obiettivi;
- competenze prive di evidenze;
- attività non collegate;
- prove prive di criteri;
- fonti superate;
- elementi rimossi tra versioni senza motivazione.

Le segnalazioni non modificano automaticamente il grafo.

## 19. Accessibilità e usabilità

- navigazione completa da tastiera;
- struttura semantica;
- descrizione testuale delle connessioni;
- contrasto adeguato;
- nessuna informazione affidata soltanto al colore;
- vista tabellare alternativa;
- densità visiva controllabile;
- riduzione delle animazioni;
- focalizzazione visibile;
- modalità essenziale, standard e approfondita.

L’interfaccia preferisce espressioni come “Ciò che viene prima”, “Ciò che viene dopo”, “Collegamenti con altre discipline” e “Aggiungi alla progettazione”, evitando il lessico tecnico dei grafi nelle superfici docente.

## 20. Modello dati minimo

### CurriculumGraphNode

- `id`
- `entityType`
- `nodeType`
- `title`
- `statement`
- `description`
- `status`
- `origin`
- `versionId`
- `contextIds`
- `sourceReferenceIds`
- `metadata`
- `createdAt`
- `updatedAt`
- `createdBy`
- `validationStatus`

### CurriculumGraphEdge

- `id`
- `sourceNodeId`
- `targetNodeId`
- `relationType`
- `direction`
- `rationale`
- `status`
- `origin`
- `sourceReferenceIds`
- `versionId`
- `createdAt`
- `updatedAt`
- `createdBy`
- `validationStatus`

### CurriculumGraphView

- `id`
- `name`
- `viewType`
- `rootNodeIds`
- `filters`
- `visibleRelationTypes`
- `layout`
- `scope`
- `owner`
- `createdAt`

### CurriculumGraphCollection

- `id`
- `title`
- `description`
- `nodeIds`
- `edgeIds`
- `order`
- `notes`
- `purpose`
- `owner`
- `createdAt`
- `updatedAt`

## 21. Compatibilità e funzionamento locale

Il modello interno resta specifico per il sistema scolastico italiano, ma mantiene identificativi stabili, tipi, associazioni e versioni compatibili con futuri adattatori CASE di 1EdTech.

La prima versione opera localmente, senza autenticazione obbligatoria, servizi remoti, telemetria o dati personali degli studenti.

## 22. Criteri di riuscita

Un docente non tecnico deve riuscire a:

1. trovare un elemento curricolare;
2. comprenderne il contesto;
3. vedere almeno un antecedente e uno sviluppo;
4. aprire la fonte;
5. individuare un collegamento interdisciplinare;
6. aggiungere il nodo alla progettazione;
7. tornare al punto di partenza;
8. distinguere un dato vigente da una proposta.

## 23. Prima versione

### Incluso

- tassonomie di nodi e relazioni;
- archivio locale;
- viste Esplora e Albero;
- scheda del nodo;
- ricerca e filtri;
- fonti;
- prerequisiti e sviluppi;
- curricolo verticale essenziale;
- aggiunta alla progettazione;
- proposta di relazione;
- esportazione;
- controlli strutturali principali.

### Escluso

- collaborazione simultanea;
- archivio remoto;
- profili studente;
- tracciamento individuale;
- raccomandazioni automatiche;
- modifica automatica del curricolo;
- valutazione automatica;
- amministrazione centralizzata dei modelli di intelligenza artificiale.

## 24. Programma CML-637

- **CML-637A:** vocabolario tassonomico e regole formali;
- **CML-637B:** dominio canonico del grafo;
- **CML-637C:** adattatore dei dati curricolari;
- **CML-637D:** esplorazione e scheda del nodo;
- **CML-637E:** albero e percorso;
- **CML-637F:** curricolo verticale;
- **CML-637G:** connessioni interdisciplinari;
- **CML-637H:** integrazione con progettazione;
- **CML-637I:** revisione e governo;
- **CML-637J:** controlli di qualità;
- **CML-637K:** assistenza locale opzionale;
- **CML-637L:** validazione docente.

## 25. Dipendenze

Trama dipende dai domini canonici introdotti da CML-633 e può utilizzare in modo opzionale il confine e il fornitore locale di CML-634. Il primo rilascio non dipende dalle funzioni collaborative future di CML-635.

## 26. Campione iniziale

La prima prova deve utilizzare un campione controllato:

- due discipline;
- un nucleo per disciplina;
- tre annualità;
- traguardi;
- obiettivi;
- conoscenze;
- abilità;
- attività;
- evidenze;
- fonti;
- relazioni verticali;
- almeno una connessione interdisciplinare.

Solo dopo la validazione del campione il modello può essere esteso all’intero patrimonio curricolare.

## 27. Formula di prodotto

> Trama rende il curricolo una rete esplorabile di apprendimenti, fonti e connessioni, permettendo al docente di comprendere ciò che viene prima, ciò che viene dopo e come ogni elemento può entrare nella progettazione didattica.
