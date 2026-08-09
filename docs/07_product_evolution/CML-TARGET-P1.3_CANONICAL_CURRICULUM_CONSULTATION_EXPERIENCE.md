# P1.3 — Canonical Curriculum Consultation Experience

**Stato:** slice pronta per implementazione  
**Fonte prodotto:** H2 — Canonical Product System Model  
**Fonte visuale:** H2V — `CURR-01`, `CURR-02`, `CURR-03`, `CURR-04`  
**Prerequisiti:** H0, H0.1, H1-R1, H2-R1 e H2V approvati  
**Scope:** definizione della slice; nessuna implementazione in questo documento

## 1. Obiettivo umano

Il docente deve poter comprendere il curricolo vigente, passare tra lista, albero
e mappa delle relazioni, aprire il dettaglio di un riferimento e portarlo nella
progettazione senza perdere versione, disciplina, contesto o provenienza.

Frase di valore:

> Il docente potrà capire quale riferimento vale, come si collega al percorso
> verticale e come usarlo nella progettazione.

## 2. Superfici incluse

| ID H2V | Superficie | Funzione |
|---|---|---|
| CURR-01 | Curricolo vigente | trovare e consultare il riferimento corrente |
| CURR-02 | Vista albero | comprendere gerarchia e struttura |
| CURR-03 | Vista grafo | comprendere relazioni, provenienza e continuità |
| CURR-04 | Dettaglio nodo | comprendere significato, evidenze e usi disponibili |
| PLAN-02 | Ingresso progettazione | usare il riferimento senza perdere contesto |

Non sono inclusi nella slice: apertura della revisione curricolare, proposta B3B,
decisione, applicazione, entrata in vigore, Biblioteca UDA, feedback o dashboard
di sistema.

## 3. Contratto di comportamento

```text
curricolo vigente
  → lista/albero/grafo
  → dettaglio del nodo
  → selezione del riferimento
  → progettazione con contesto conservato
```

La slice è consultiva. L'unica transizione verso una mutazione è l'avvio
contestuale della progettazione, non la modifica del curricolo.

## 4. Stato e continuità obbligatori

Ogni percorso deve conservare:

```text
istituto
→ curriculumVersion vigente
→ ordine
→ disciplina
→ nodo/segmento selezionato
→ provenienza
→ contesto classe, se disponibile
→ progettazione di destinazione
```

Se una relazione, una classe o un uso in progettazione non sono disponibili, la
UI deve dichiararlo e non simulare il collegamento.

## 5. Dominio e capability

| Elemento | Contratto |
|---|---|
| Consultazione | `curriculum.consult` / `curriculum.read` |
| Avvio progettazione | `planning.write`, solo dopo selezione esplicita |
| Modalità CURR-01..04 | READ |
| Modalità ingresso PLAN-02 | WRITE contestuale |
| Mutazione del vigente | vietata nella slice |
| Provenienza | sempre leggibile nel dettaglio o nel contesto |

Non sono autorizzate nuove capability di revisione o consolidamento.

## 6. Gap baseline → target

| Gap | Baseline `9f2ac12` | Target P1.3 | Rischio |
|---|---|---|---|
| CURR-01 | consultazione presente ma continuità variabile | riferimento vigente identificabile | mostrare dati non correnti |
| CURR-02 | struttura verticale presente | passaggio coerente lista → albero | gerarchia senza versione |
| CURR-03 | mappa disponibile/parziale | grafo canonico consultivo | relazioni decorative o inventate |
| CURR-04 | nodi consultabili | dettaglio con provenienza e usi | nodo orfano |
| Curricolo → Progettazione | collegamento incompleto | contesto trasferito | perdita di disciplina/classe |
| Stato | stati tecnici non sempre professionali | vigente/disponibile/selezionato | linguaggio interno esposto |

## 7. Matrice valore, gap, dipendenze e rischio

| Criterio | Valutazione |
|---|---|
| Valore umano | alto: risponde direttamente a H2 e H3 |
| Riduzione complessità | alta: un solo riferimento comprensibile in tre viste |
| Gap runtime | medio: consultazione esiste, continuità e grafo canonico sono parziali |
| Dipendenze | dominio curriculum, read model, contesto classe, ingresso planning |
| Rischio | medio-basso se la slice resta read-only |
| Rischio da evitare | trasformare la mappa in editor o inventare relazioni |
| Priorità | prima slice coerente con H2/H2V |

## 8. Criteri di accettazione

- **AC-P13-01:** CURR-01 identifica senza ambiguità il curricolo vigente e la sua versione.
- **AC-P13-02:** lista, albero e grafo rappresentano lo stesso riferimento, non tre dataset diversi.
- **AC-P13-03:** CURR-02 rende leggibile la gerarchia senza introdurre nodi inesistenti.
- **AC-P13-04:** CURR-03 mostra solo relazioni disponibili e ne espone la provenienza.
- **AC-P13-05:** CURR-03 consente di seguire una relazione e tornare al nodo corrente.
- **AC-P13-06:** CURR-04 mostra significato, fonte, versione e usi realmente collegati.
- **AC-P13-07:** l'utente può selezionare un riferimento e avviare PLAN-02 conservando contesto e disciplina.
- **AC-P13-08:** nessuna vista CURR consente modifica diretta, revisione o cambio del vigente.
- **AC-P13-09:** dati mancanti sono dichiarati, non sostituiti da placeholder presentati come reali.
- **AC-P13-10:** il percorso umano H2 → H3 è completabile senza conoscere nomi tecnici.

## 9. Verifica futura della slice

Quando sarà implementata, la slice dovrà essere verificata con:

```text
H2 requirement
  → H2V CURR-01..04
  → H2/H3 use case
  → gap CURR-01..04 + continuity
  → curriculum.consult / planning.write
  → focused fast tests
  → visual acceptance
  → human workflow smoke H2 → H3
```

Questa sezione definisce il contratto di verifica; non autorizza ancora
l'esecuzione dei test o la modifica del codice in questo segmento documentale.

## 10. Fuori perimetro

- revisione curricolare istituzionale e mandato;
- workflow B3B, verifica B3C, decisione B3E e applicazione B3D/B3F;
- condivisione e reputazione delle UDA;
- miglioramento anonimo;
- nuove fonti remote o nuove architetture;
- visual polish non collegato ai criteri sopra;
- implementazione automatica di altre viste H2V.

## Verdetto

```text
CML_TARGET_P1_3_CANONICAL_CURRICULUM_CONSULTATION_EXPERIENCE_READY_FOR_IMPLEMENTATION
CML_TARGET_P1_3_SCOPE_FROZEN
H2V_CURRICULUM_SURFACES_SELECTED
NO_RUNTIME_CHANGE_AUTHORIZED
```
