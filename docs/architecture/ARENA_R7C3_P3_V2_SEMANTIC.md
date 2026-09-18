# Arena R7C3 — P3-v2 semantico elemento-per-elemento

## Scopo

R7C3 introduce il secondo livello di analisi curricolare di Arena senza sostituire ancora il P3 legacy produttivo.

Il P3 precedente risponde a una domanda strutturale: esistono contenuti per disciplina/ordine nella `CurriculumMap`?

P3-v2 risponde invece a una domanda più rigorosa:

> per ciascun singolo elemento nazionale verificato, quale relazione è stata effettivamente accertata da una persona rispetto ai nodi della versione corrente del curricolo d’istituto?

La tranche pilota resta limitata a **Tecnologia — scuola secondaria di primo grado**.

## Scope nazionale del pilota

L’inventario esistente di Tecnologia contiene 61 elementi complessivi tra primaria e secondaria. R7C3 filtra esclusivamente i 30 elementi della scuola secondaria di primo grado:

- 8 competenze attese al termine della classe terza;
- 18 obiettivi specifici di apprendimento al termine della classe terza;
- 4 gruppi/elementi di conoscenze inventariati.

Il numero di inventario non equivale a testo verificato. Ogni elemento resta `SOURCE_UNVERIFIED` finché il corrispondente testo nazionale non è stato verificato da persona e inserito nell’aggregato operativo con binding e fingerprint validi.

## Distinzione epistemica

R7C3 vieta due scorciatoie:

1. **assenza di testo nazionale verificato ≠ lacuna del curricolo d’istituto**;
2. **testi simili o identici ≠ copertura automatica**.

Gli stati sono quindi:

- `SOURCE_UNVERIFIED` — manca il testo nazionale verificato;
- `REVIEW_REQUIRED` — il testo nazionale è verificato ma manca il giudizio semantico umano;
- `COVERAGE` — copertura confermata da persona;
- `GAP` — lacuna confermata da persona;
- `DISCONTINUITY` — copertura/progressione semanticamente discontinua secondo revisione umana;
- `OVERLAP` — sovrapposizione esplicitamente rilevata; richiede almeno due nodi d’istituto;
- `CONFLICT` — conflitto semantico esplicitamente rilevato.

## Receipt di revisione semantica

Ogni conclusione diversa da `SOURCE_UNVERIFIED` e `REVIEW_REQUIRED` richiede un `CurriculumSemanticReviewReceipt` con:

- `curriculumVersionRef`;
- `nationalElementId`;
- `nationalNodeRef`;
- fingerprint SHA-256 del testo nazionale verificato;
- riferimenti ai nodi d’istituto esaminati;
- fingerprint SHA-256 corrente di ciascun nodo d’istituto;
- conclusione;
- revisore;
- attestazione esplicita;
- data;
- motivazione.

Il receipt viene respinto se il testo nazionale o un nodo d’istituto è cambiato dopo la revisione.

## Regole delle conclusioni

### COVERAGE

Richiede almeno un nodo d’istituto esplicitamente esaminato.

### GAP

Richiede zero nodi dichiarati come coprenti. Non viene mai generato dalla sola assenza di mapping.

### DISCONTINUITY

Richiede almeno un nodo d’istituto coinvolto e una motivazione umana. In R7C3 il sistema non deduce automaticamente una discontinuità dalla progressione prima-seconda-terza.

### OVERLAP

Richiede almeno due nodi d’istituto esplicitamente coinvolti. La presenza di più nodi, da sola, non genera automaticamente l’esito: il giudizio resta umano.

### CONFLICT

Richiede almeno un nodo d’istituto coinvolto e una motivazione umana.

## Nessun effetto di autorità

P3-v2 produce osservazioni semantiche con:

`authorityEffect = NONE`

Non adotta il curricolo, non modifica il testo nazionale, non promuove nodi locali, non materializza una decisione collegiale e non crea automaticamente una proposta P4.

`reviewComplete = true` significa soltanto che tutti gli elementi dello scope dispongono di fonte verificata e revisione semantica corrente.

`fullyCovered = true` richiede inoltre che tutti gli elementi siano classificati `COVERAGE`.

Una revisione completa può quindi contenere GAP, DISCONTINUITY, OVERLAP o CONFLICT ed essere comunque una analisi completa ma bisognosa di azione istituzionale.

## Fail-closed

R7C3 rifiuta:

- receipt relativi a elementi fuori scope;
- due receipt concorrenti per lo stesso elemento;
- `reviewRef` duplicati;
- receipt su testo nazionale non verificato;
- receipt riferiti a una diversa versione curricolare;
- fingerprint nazionali o locali non correnti;
- nodi nazionali usati come presunta copertura d’istituto;
- `GAP` con nodi coprenti dichiarati;
- `OVERLAP` con meno di due nodi.

## Confini invariati

R7C3 non:

- cambia `CURRICULUM_PERSISTENCE_MODE = legacy-only`;
- modifica UI/import produttivi;
- modifica il P3 legacy già in uso;
- abilita l’infanzia nel runtime;
- inventa mapping tra i nove nuclei di Tecnologia e gli elementi nazionali;
- dichiara verificati i 30 testi nazionali;
- promuove la bozza di Tecnologia a curricolo adottato.

## Uscita della tranche

Il gate R7C3 verifica che:

1. lo scope Tecnologia secondaria sia esattamente di 30 elementi;
2. gli elementi non verificati non vengano classificati come gap;
3. la semplice uguaglianza testuale non generi mapping;
4. una copertura richieda receipt umano valido e corrente;
5. un gap richieda giudizio esplicito;
6. receipt obsoleti siano respinti;
7. overlap richieda almeno due nodi;
8. la completezza globale resti falsa finché persiste lavoro su fonte o revisione.

Il passo successivo previsto dall’audit resta **R7C4 — infanzia nativa nel runtime**, mantenendo separata l’identità dei cinque campi di esperienza dalle discipline del primo ciclo.
