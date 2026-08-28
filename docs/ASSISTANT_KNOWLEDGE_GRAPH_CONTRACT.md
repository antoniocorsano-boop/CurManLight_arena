# Assistente Arena · Conoscenza · Grafo — contratto Beta

## Scopo

L'Assistente Arena è una capacità trasversale di supporto cognitivo al lavoro curricolare istituzionale. Non è una sezione primaria della navigazione e non acquisisce autorità decisionale.

## 1. Assistant Surface Contract

- L'Assistente è accessibile dall'header tramite un controllo dedicato e riconoscibile.
- Il controllo apre e chiude la chat contestuale già montata nel layout applicativo.
- Su mobile e desktop l'Assistente resta separato da navigazione, account e azioni di sessione.
- L'eventuale stato del motore locale può essere mostrato come stato tecnico, senza trasformarlo in gergo dominante nell'interfaccia.

## 2. Knowledge Grounding Contract

L'Assistente può:

- spiegare la schermata e il contesto correnti;
- chiarire concetti curricolari, normativi e procedurali;
- riassumere e confrontare testi;
- svolgere analisi documentale;
- usare contenuti che l'utente porta esplicitamente nel contesto;
- riportare la provenienza delle informazioni quando disponibile;
- aprire la fonte o la vista di conoscenza da cui deriva un contenuto.

L'Assistente non deve usare implicitamente contenuti non selezionati dall'utente né presentare contenuti generati come fonti ufficiali.

## 3. Assistant Authority Contract

L'Assistente non può:

- approvare, respingere o promuovere una proposta;
- modificare automaticamente il curricolo canonico;
- trasformare una risposta in decisione istituzionale;
- simulare consenso, voto o deliberazione;
- attribuirsi autorità derivante dal ruolo visualizzato nell'interfaccia.

Ogni passaggio da analisi a proposta o da proposta a decisione resta soggetto ai boundary umani già canonici di Arena.

## 4. Knowledge Graph Contract

La Mappa Connessioni è una vista della conoscenza, non una dashboard tecnica.

Tipi di nodo ammessi nel modello Beta:

- fonte;
- documento;
- passaggio documentale;
- concetto;
- traguardo;
- obiettivo;
- disciplina;
- ordine/classe;
- proposta;
- decisione.

Le relazioni devono essere semanticamente dichiarate, ad esempio:

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

La selezione di un nodo deve poter ricondurre alla relativa provenienza e, quando applicabile, alla fonte leggibile.

## 5. Relazione tra Assistente, Conoscenza e Grafo

Il modello applicativo è:

`Assistente ↔ Conoscenza istituzionale ↔ Grafo`

La chat è l'interfaccia conversazionale; la Conoscenza conserva e rende leggibili le fonti; il Grafo rende visibili le relazioni. Nessuno dei tre livelli introduce decisioni automatiche.

Azioni contestuali previste:

- Spiegami questa schermata;
- Analizza il documento;
- Confronta con le Indicazioni 2025;
- Mostra le fonti;
- Apri nella conoscenza;
- Mostra connessioni.

## 6. Compatibilità con la Beta primaria

La navigazione primaria resta:

`Home → Curricolo → Revisione → Fonti → Documenti`

Assistente, Conoscenza avanzata e Grafo sono capacità trasversali o contestuali e non devono reintrodurre il vecchio prodotto generalista nella shell primaria.
