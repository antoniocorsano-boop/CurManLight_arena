# CML-TARGET-H2V — Canonical Visual Product Model

**Stato:** modello visuale pronto per approvazione  
**Fonte:** H2 — Canonical Product System Model  
**Scope:** mockup annotato e tracciabile; nessuna implementazione runtime

## 1. Regola del mockup

H2V rende immediatamente comprensibile ciò che H2 definisce. Non è un poster
aspirazionale e non prescrive ancora componenti React o layout pixel-perfect.

Ogni schermata o widget deve essere annotato con:

```text
screen/widget → bisogno umano → caso d'uso → oggetto/dominio
→ modalità → capability → contesto → stato → azioni
→ autorizzazione → dato reale disponibile → non consentito
```

Se una voce non è dimostrabile, non entra nel mockup canonico.

## 2. Mappa visiva del prodotto

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

La mappa è una north star di orientamento. La navigazione concreta deve
preservare il contesto di classe, l'oggetto corrente, lo stato e il prossimo
passo naturale.

## 3. Viste canoniche

### HOME-01 — La mia giornata / riprendi lavoro

```text
Bisogno: "Da dove riprendo oggi?"
Caso: H4
Oggetto/dominio: workspace, classe, progettazione, documento
Modalità: READ + contesto di ripresa
Capability: workspace.read
Contesto: docente + lavori realmente salvati
Stato: ultimo lavoro, classe, disciplina, bozza/pronto
Azioni: continua lavoro; apri documento; vai alla classe
Non consentito: metriche decorative; attività inventate; wizard senza stato
```

### CURR-01 — Curricolo vigente

```text
Bisogno: "Qual è il riferimento che vale adesso?"
Caso: H2
Oggetto/dominio: CurriculumVersion, CurriculumSegment
Modalità: READ
Capability: curriculum.consult
Contesto: istituto + versione vigente + ordine + disciplina
Stato: vigente, fonte, validità, provenienza
Azioni: cerca; filtra; apri albero; apri grafo; usa nella progettazione
Non consentito: modifica diretta; proposta implicita; vigente inventato
```

### CURR-02 — Vista albero

```text
Bisogno: "Come è organizzato questo riferimento?"
Caso: H2
Oggetto/dominio: struttura verticale e gerarchia curricolare
Modalità: READ
Capability: curriculum.consult
Contesto: versione + disciplina + ordine
Stato: nodi disponibili e relazioni gerarchiche reali
Azioni: espandi; apri nodo; passa alla mappa; usa riferimento
Non consentito: dedurre livelli mancanti; alterare la struttura
```

### CURR-03 — Mappa del curricolo

```text
Bisogno: "Come si collega questo elemento al percorso verticale e alla mia progettazione?"
Caso: H2/H3
Oggetto/dominio: CurriculumNode + relazioni
Modalità: READ
Capability: curriculum.consult
Contesto: istituto + versione vigente + ordine + disciplina + nodo
Stato: provenienza, relazioni ufficiali/importate/proposte/confermate
Azioni: apri nodo; segui relazione; mostra percorso verticale; usa nella progettazione
Non consentito: relazione inventata; modifica diretta; cambio del vigente
```

### CURR-04 — Dettaglio nodo curricolare

```text
Bisogno: "Che cosa significa questo riferimento e dove viene usato?"
Caso: H2/H3
Oggetto/dominio: CurriculumNode, evidenze, UDA collegate
Modalità: READ
Capability: curriculum.consult
Contesto: nodo + versione + disciplina
Stato: fonte, provenienza, relazioni e usi effettivamente disponibili
Azioni: consulta dettagli; apri UDA collegata; avvia progettazione
Non consentito: mostrare collegamenti non disponibili; approvare il nodo
```

### PLAN-01 — Progettazioni

```text
Bisogno: "Quale progettazione sto costruendo o posso riprendere?"
Caso: H3/H4
Oggetto/dominio: progettazione/UDA
Modalità: READ + WRITE contestuale
Capability: planning.read / planning.write
Contesto: classe + disciplina + riferimenti selezionati
Stato: bozza, in corso, pronta, documento aggiornato
Azioni: riprendi; crea; filtra; apri UDA; vai al documento
Non consentito: perdere il riferimento curricolare o la classe
```

### PLAN-02 — Workspace UDA

```text
Bisogno: "Come trasformo il riferimento in lavoro didattico?"
Caso: H3
Oggetto/dominio: UDA, attività, evidenze, rubrica
Modalità: WRITE
Capability: planning.write
Contesto: classe/target + curricolo + periodo
Stato: bozza con punto salvato
Azioni: compila; salva; collega riferimento; genera documento; condividi volontariamente
Non consentito: wizard senza identità dell'UDA; dati curricolari inventati
```

### PLAN-03 — UDA pronta / documento

```text
Bisogno: "Qual è il risultato utilizzabile della mia progettazione?"
Caso: H5
Oggetto/dominio: UDA + Document
Modalità: READ + document action
Capability: documents.read / documents.produce
Contesto: UDA + classe + versione del documento
Stato: pronta, origine, versione, ultimo aggiornamento
Azioni: anteprima; aggiorna; scarica; stampa; torna alla progettazione
Non consentito: documento senza origine o export come identità principale
```

### CLASS-01 — Classe

```text
Bisogno: "Su quale gruppo sto lavorando?"
Caso: H1/H6
Oggetto/dominio: classe/contesto
Modalità: READ + navigation context
Capability: class.read
Contesto: istituto + classe + docente
Stato: classe attiva e lavori realmente collegati
Azioni: apri progettazioni; apri UDA; consulta documenti; torna al curricolo
Non consentito: duplicare archivi o inventare lavori della classe
```

### CLASS-02 — Attività e UDA erogate

```text
Bisogno: "Che cosa ho effettivamente predisposto o svolto per questa classe?"
Caso: H6
Oggetto/dominio: UDA, attività, evidenze
Modalità: READ
Capability: class.read / planning.read
Contesto: classe + periodo
Stato: predisposta, in corso, svolta, documentata quando disponibile
Azioni: apri UDA; vedi evidenze; avvia riflessione
Non consentito: confondere pianificato con erogato
```

### IMPR-01 — Miglioramento personale

```text
Bisogno: "Che cosa posso imparare dall'uso reale delle mie UDA?"
Caso: ciclo di miglioramento
Oggetto/dominio: feedback anonimo aggregato, progettazioni
Modalità: READ
Capability: improvement.read
Contesto: docente + proprie UDA + soglia di anonimato
Stato: dati aggregati sufficienti
Azioni: consulta; confronta nel tempo; collega a progettazione successiva
Non consentito: identificare studenti o trasformare il feedback in voto personale
```

### IMPR-02 — Evidenze UDA

```text
Bisogno: "Quali evidenze ho raccolto e che cosa mi suggeriscono?"
Caso: ciclo di miglioramento
Oggetto/dominio: evidenze, rubriche, feedback anonimo
Modalità: READ
Capability: improvement.read
Contesto: UDA + classe + aggregazione anonima
Stato: evidenze disponibili e loro origine
Azioni: consulta; annota riflessione; torna alla progettazione
Non consentito: inferenze individuali non autorizzate
```

### IMPR-03 — Dashboard aggregata figure di sistema

```text
Bisogno: "Quali segnali aggregati aiutano il miglioramento dell'istituto?"
Caso: ciclo di miglioramento
Oggetto/dominio: aggregati anonimi di sistema
Modalità: READ
Capability: improvement.system.read
Contesto: istituto + periodo + soglia privacy
Stato: aggregato, periodo, numerosità minima
Azioni: consulta; segmenta solo secondo configurazione autorizzata
Non consentito: classifica personale; identificazione; performance score implicito
```

### SHARE-01 — UDA condivise

```text
Bisogno: "Quali pratiche professionali posso consultare?"
Caso: ciclo di condivisione
Oggetto/dominio: SharedUDA
Modalità: READ
Capability: uda.share.read
Contesto: biblioteca + filtri professionali
Stato: pubblicata, autore/provenienza secondo privacy, adozioni
Azioni: cerca; filtra; apri dettaglio; adotta e crea copia
Non consentito: follower, ranking decorativo, modifica dell'originale
```

### SHARE-02 — Dettaglio UDA condivisa

```text
Bisogno: "Questa UDA è adatta al mio lavoro?"
Caso: ciclo di condivisione
Oggetto/dominio: SharedUDA + genealogia + indicatori post-uso
Modalità: READ
Capability: uda.share.read
Contesto: UDA pubblicata + riferimenti + utilizzi dichiarati
Stato: struttura, obiettivi, adozioni, note professionali
Azioni: consulta; adotta e crea copia; torna al curricolo
Non consentito: confondere like con valutazione professionale
```

### SHARE-03 — Adotta e crea copia

```text
Bisogno: "Voglio partire da questa pratica senza modificare l'originale."
Caso: ciclo di condivisione
Oggetto/dominio: copia derivata UDA
Modalità: WRITE
Capability: uda.adopt
Contesto: UDA condivisa + docente + classe/target personale
Stato: nuova bozza derivata, genealogia conservata
Azioni: crea copia; assegna contesto; modifica liberamente
Non consentito: sovrascrivere l'originale; perdere la provenienza
```

### SHARE-04 — Valutazione dopo utilizzo

```text
Bisogno: "Dopo averla usata, quanto è stata utile e adattabile?"
Caso: ciclo di condivisione
Oggetto/dominio: valutazione professionale post-uso
Modalità: WRITE
Capability: uda.evaluate.after-use
Contesto: copia/uso dichiarato + UDA originale
Stato: utilizzata o completata, feedback registrabile
Azioni: valuta utilità; annota adattamento; invia feedback
Non consentito: valutare senza uso; esporre dati identificativi non necessari
```

### REV-00 — Revisione curricolo chiusa

```text
Bisogno: "Il curricolo è in uso ordinario o esiste una revisione aperta?"
Caso: evoluzione curricolare
Oggetto/dominio: Process/Campaign
Modalità: READ
Capability: curriculum.review.read
Contesto: istituto + vigente + stato revisione
Stato: chiusa
Azioni: consulta vigente; se autorizzato avvia preparazione su mandato
Non consentito: creare proposte indipendenti; mostrare un processo aperto inesistente
```

### REV-01 — Mandato / apertura

```text
Bisogno: "Perché e con quale autorizzazione riapriamo il curricolo?"
Caso: evoluzione curricolare
Oggetto/dominio: mandato istituzionale
Modalità: WRITE
Capability: curriculum.review.open
Contesto: mandato dirigente + perimetro + processo scolastico
Stato: mandato ricevuto, verificabile, da attivare
Azioni: registra mandato; definisci perimetro; prepara apertura
Non consentito: attivazione autonoma senza mandato
```

### REV-02 — Wizard referente

```text
Bisogno: "Come preparo correttamente la campagna di revisione?"
Caso: evoluzione curricolare
Oggetto/dominio: Process/Campaign
Modalità: WRITE guidata
Capability: curriculum.review.prepare
Contesto: mandato + motivazione + materiali + partecipanti
Stato: preparazione, pronta per apertura, aperta
Azioni: definisci motivazione, perimetro, materiali, fasi, responsabilità e avvio
Non consentito: decidere il curricolo; saltare il mandato; inventare partecipanti
```

### REV-03 — Lavoro dei docenti

```text
Bisogno: "Come contribuisco alla revisione aperta?"
Caso: evoluzione curricolare
Oggetto/dominio: osservazione/proposta versionata
Modalità: READ + WRITE contestuale
Capability: proposal.create
Contesto: revisione aperta + materiali + perimetro
Stato: bozza, inviata, in revisione, da correggere
Azioni: consulta; osserva; crea versione; reinvia; ritira
Non consentito: proposta fuori campagna; decisione personale; modifica del vigente
```

### REV-04 — Dipartimento / intersezione / interclasse

```text
Bisogno: "Come trasformiamo i contributi in una sintesi professionale?"
Caso: evoluzione curricolare
Oggetto/dominio: sintesi struttura intermedia
Modalità: READ + WRITE secondo ruolo
Capability: review.group.work
Contesto: revisione + articolazione configurata + proposte
Stato: raccolta, confronto, sintesi, pronta al referente
Azioni: confronta; aggrega; modifica sintesi; evidenzia conflitti
Non consentito: presentare la sintesi come decisione finale
```

### REV-05 — Sintesi referente

```text
Bisogno: "Qual è il quadro complessivo da portare alla decisione?"
Caso: evoluzione curricolare
Oggetto/dominio: dossier di revisione
Modalità: READ + WRITE secondo ruolo
Capability: review.coordinate
Contesto: revisione + sintesi intermedie + verifiche
Stato: incompleto, coordinato, pronto alla decisione
Azioni: verifica completezza; coordina; prepara dossier; richiede integrazioni
Non consentito: sostituire la decisione dell'organo competente
```

### REV-06 — Decisione curricolare

```text
Bisogno: "Quale decisione autorizzata è stata assunta su questa versione?"
Caso: evoluzione curricolare
Oggetto/dominio: decisione curricolare
Modalità: WRITE secondo processo
Capability: curriculum.decide
Contesto: dossier + versione pertinente + organo/soggetto autorizzato
Stato: da decidere, approvata, respinta, rinviata
Azioni: registra esito, motivazione, data e provenienza
Non consentito: confondere verifica tecnica con decisione; rendere subito vigente
```

### REV-07 — Nuova versione / entrata in vigore

```text
Bisogno: "Come diventa operativo l'esito e da quando vale?"
Caso: evoluzione curricolare
Oggetto/dominio: applicazione + CurriculumVersion
Modalità: WRITE secondo ruolo
Capability: curriculum.apply
Contesto: decisione registrata + versione derivata
Stato: da applicare, prodotta, vigente, processo chiuso
Azioni: applica; produci nuova versione; definisci decorrenza; chiudi revisione
Non consentito: applicazione implicita; sovrascrivere il vigente senza provenienza
```

### DOC-01 — Documenti

```text
Bisogno: "Dove vedo il risultato professionale e la sua origine?"
Caso: H5
Oggetto/dominio: Document + versioni
Modalità: READ + document action
Capability: documents.read
Contesto: classe/progettazione/UDA o revisione
Stato: origine, versione, aggiornamento, disponibile
Azioni: apri; anteprima; scarica; stampa; torna all'origine
Non consentito: documento orfano; export come unico significato
```

### SET-01 — Contesto e profilo

```text
Bisogno: "Qual è il mio contesto e quali azioni posso svolgere?"
Caso: orientamento e autorizzazione
Oggetto/dominio: profilo, ruolo, classe, istituto
Modalità: READ + configurazione autorizzata
Capability: context.read
Contesto: istituto + ruolo + classi + mandato eventuale
Stato: profilo e contesto correnti
Azioni: consulta; seleziona contesto; verifica ruolo
Non consentito: concedere capability solo perché una schermata è visibile
```

## 4. Matrice minima di tracciabilità

| ID | H2/H1 | Dominio | Capability | Stato obbligatorio | Rischio da evitare |
|---|---|---|---|---|---|
| HOME-01 | H4 | workspace | `workspace.read` | lavoro reale riprendibile | dashboard decorativa |
| CURR-03 | H2/H3 | curriculum graph | `curriculum.consult` | versione + nodo | grafo senza provenienza |
| PLAN-02 | H3 | planning/UDA | `planning.write` | bozza salvabile | wizard senza contesto |
| SHARE-03 | ciclo condivisione | shared UDA | `uda.adopt` | copia derivata | sovrascrittura originale |
| REV-02 | H1-R1 | curriculum review | `curriculum.review.prepare` | mandato + perimetro | apertura autonoma |
| REV-06 | H1-R1 | curriculum decision | `curriculum.decide` | versione pertinente | decisione automatica |

## 5. Criteri di accettazione H2V

- **AC-H2V-01:** tutte le viste canoniche hanno bisogno, caso, dominio, capability e stato.
- **AC-H2V-02:** CURR-03 è consultiva e conserva versione, nodo e provenienza.
- **AC-H2V-03:** il percorso didattico mantiene continuità classe → curricolo → progettazione → documento.
- **AC-H2V-04:** la Biblioteca distingue originale, copia derivata e valutazione post-uso.
- **AC-H2V-05:** il feedback di miglioramento resta anonimo e aggregato.
- **AC-H2V-06:** REV-00 non consente proposte indipendenti.
- **AC-H2V-07:** REV-01 richiede mandato e REV-02 appartiene al referente.
- **AC-H2V-08:** REV-06 non equivale a verifica tecnica e REV-07 non è applicazione implicita.
- **AC-H2V-09:** nessuna schermata mostra dati o relazioni non disponibili.
- **AC-H2V-10:** ogni futura implementazione può indicare il proprio ID H2V.

## Verdetto

```text
CML_TARGET_H2V_CANONICAL_VISUAL_PRODUCT_MODEL_APPROVED
CML_TARGET_PRODUCT_NORTH_STAR_FROZEN
NO_RUNTIME_CHANGE_AUTHORIZED
```
