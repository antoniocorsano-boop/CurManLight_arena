# CurManLight Arena — Knowledge Experience Specification v1.0

Status: FROZEN_FOR_IMPLEMENTATION
Scope: Fonti / Conoscenza / Assistente / Relazioni / Archivio storico / Termini chiave
Baseline: `eebd82fc3abba2de27346c87d5963a2214f9fb69`

## 1. Product intent

La superficie oggi denominata internamente “WikiLLM locale e archivio Second Brain” deve diventare un ambiente di consultazione curricolare evidence-first, comprensibile senza conoscere l’architettura tecnica del prodotto.

La fruizione segue questi principi:

1. task first: l’utente parte dal compito, non dallo strumento;
2. plain language: nessun gergo tecnico interno nella vista ordinaria;
3. progressive disclosure: prima il compito, poi i dettagli;
4. provenance visible: ogni contenuto o risposta conserva provenienza e stato;
5. human authority: nessuna vista o risposta crea decisioni istituzionali;
6. mobile first: la vista 390×844 è baseline di accettazione;
7. evidence before inference: le relazioni devono distinguere fonte, passaggio, interpretazione e proposta;
8. technical diagnostics separated: codice, moduli, store, bundle e grafo tecnico non appartengono alla superficie ordinaria.

## 2. Non-definitions

La Knowledge Experience non è:

- un IDE o una mappa del codice;
- un browser di file `.ts` / `.tsx`;
- una vetrina di Graphify;
- un knowledge graph presentato come prodotto;
- un agente autonomo che decide;
- una fonte ufficiale quando i dati provengono da archivio locale non verificato.

## 3. Canonical information architecture

La navigazione primaria di Arena resta invariata:

`Home → Curricolo → Revisione → Fonti → Documenti`

L’Assistente resta trasversale nell’header e non diventa un sesto modulo.

Dentro la superficie di conoscenza, i compiti canonici sono:

1. **Cerca e chiedi**
2. **Relazioni**
3. **Termini chiave**
4. **Archivio storico**

## 4. Canonical labels

| Interno / legacy | Etichetta utente |
| --- | --- |
| WikiLLM locale e archivio Second Brain | Conoscenza locale e archivio |
| Biblioteca & Copilota | Cerca e chiedi |
| Mappa Connessioni | Relazioni |
| Glossario locale | Termini chiave |
| Archivio non verificato | Archivio storico locale |
| Mappa strutturata dei componenti dell’ecosistema (Graphify) | Mappa delle relazioni |
| Chiedi al Co-Pilota (WikiLLM) | Fai una domanda |
| Leggi Volume | Consulta fonte |

I nomi tecnici possono restare nei contratti interni, nei test e nella diagnostica, ma non devono essere la terminologia primaria dell’interfaccia utente.

## 5. Task model

### 5.1 Cerca e chiedi

L’utente deve poter:

- cercare una fonte o un termine;
- selezionare il contesto;
- leggere una fonte;
- fare una domanda sul contesto selezionato;
- vedere provenienza e stato della fonte;
- passare dalla risposta alla fonte e alle relazioni.

Il flusso desiderato è:

`Chiedi → scegli il contesto → vedi le fonti → risposta → esplora collegamenti`

### 5.2 Relazioni

Le relazioni devono essere semantiche e curriculari, non tecniche.

Nodi canonici:

`Fonte → Documento → Passaggio → Concetto → Traguardo → Obiettivo → Disciplina → Classe/Ordine → Proposta → Decisione`

Relazioni canoniche:

- deriva da;
- cita;
- interpreta;
- corrisponde a;
- sviluppa;
- contrasta con;
- sostiene;
- modifica;
- riguarda;
- è prerequisito di.

La vista Relazioni deve offrire tre modalità progressive:

1. **Elenco** — default mobile, leggibile e ordinato;
2. **Percorso** — catene significative tra evidenza e impatto;
3. **Mappa** — grafo visuale guidato, non canvas tecnico libero.

### 5.3 Termini chiave

Ogni termine deve poter mostrare:

- definizione breve;
- origine / fonte;
- stato: normativo, locale, da verificare;
- collegamenti a documenti, concetti, traguardi e obiettivi.

### 5.4 Archivio storico

L’archivio storico conserva materiali locali e precedenti senza elevarli a fonte ufficiale.

Deve:

- restare consultabile;
- mostrare chiaramente il proprio stato;
- essere subordinato alle attività di ricerca e comprensione;
- non presentarsi come identità primaria del prodotto.

## 6. Intelligent visualizations

Le visualizzazioni intelligenti sono viste orientate a domande, non decorazioni.

### 6.1 Mappa delle evidenze

Domanda: “Da dove viene questa affermazione?”

Catena minima:

`Fonte → Passaggio → Interpretazione → Proposta`

### 6.2 Confronto 2012 / 2025

Deve rendere visibili:

- continuità;
- trasformazioni;
- elementi nuovi;
- elementi rimossi o ridefiniti;
- evidenze a supporto del confronto.

### 6.3 Percorso verticale

Domanda: “Come evolve questo nucleo tra ordini e classi?”

Esempio:

`Primaria → Secondaria I grado → Esiti attesi`

### 6.4 Rete interdisciplinare

Domanda: “Quali discipline condividono questo concetto o traguardo?”

### 6.5 Vista di impatto

Domanda: “Se cambia questa fonte/proposta, che cosa viene toccato?”

La vista di impatto deve distinguere dipendenze documentali, interpretative e decisionali.

## 7. Authority and provenance contract

L’Assistente e le viste intelligenti possono:

- spiegare;
- chiarire;
- confrontare;
- sintetizzare;
- analizzare documenti;
- mostrare fonti;
- esplorare relazioni.

Non possono:

- approvare o respingere proposte;
- promuovere contenuti;
- modificare automaticamente il curricolo canonico;
- presentare output generato come fonte ufficiale;
- trasformare una relazione inferita in decisione istituzionale.

Ogni output inferenziale deve poter essere ricondotto alle fonti disponibili e mantenere l’indicazione di verifica umana quando richiesta.

## 8. GOV.UK-inspired interaction rules

Questa specifica adotta i principi GOV.UK rilevanti come disciplina progettuale:

- start with user needs;
- do less;
- design with data;
- iterate, then iterate again;
- make things open and understandable;
- use plain English / plain language;
- one primary task per page or section;
- labels that describe user intent rather than implementation;
- progressive disclosure rather than dense all-at-once surfaces;
- accessible touch targets, focus order and readable hierarchy.

## 9. Mobile acceptance baseline

Viewport di riferimento: 390×844.

PASS richiede:

- nessun overflow orizzontale;
- nessun nested scroll obbligatorio per il compito principale;
- tab/segmenti leggibili senza abbreviazioni tecniche;
- target touch ≥ 44px dove applicabile;
- titolo e azione primaria visibili senza scroll eccessivo;
- nessun pannello tecnico del codice nella vista ordinaria;
- ritorno chiaro al flusso principale.

## 10. Diagnostics boundary

La mappa tecnica attuale basata su `App.tsx`, store, database, bundle, moduli `.ts/.tsx` deve essere rimossa dalla superficie ordinaria.

Può sopravvivere solo come:

- diagnostica interna;
- pagina di audit tecnico;
- artefatto non raggiungibile dalla navigazione utente ordinaria.

## 11. Definition of done

La migrazione è completa quando:

1. il linguaggio tecnico legacy non è più primario nella UI;
2. la conoscenza è organizzata per compiti;
3. Relazioni mostra entità curriculari e documentali, non moduli del codice;
4. almeno una visualizzazione intelligente evidence-first è realmente fruibile;
5. l’Assistente preserva provenance e human authority;
6. mobile audit 390×844 passa;
7. Product CI, Beta Release Contract e Live Beta Browser Audit passano sul medesimo release SHA;
8. un revisore terzo indipendente non rileva conflitti bloccanti con questa specifica.
