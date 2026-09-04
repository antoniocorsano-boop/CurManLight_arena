# Arena — gruppi operativi per disciplina e formalizzazione successiva

## Decisione di prodotto

Arena non attende la disponibilità di nominativi o atti di nomina per consentire il lavoro professionale sul curricolo.

I gruppi vengono costituiti operativamente **per aggregazione disciplinare**. Il docente dichiara durante l’onboarding le discipline di competenza; Arena deriva automaticamente il gruppo o i gruppi di appartenenza. L’eventuale coordinatore dichiara separatamente la funzione di coordinamento operativo.

La formalizzazione istituzionale può avvenire successivamente, collegando fonte, atto e dati organizzativi senza perdere contributi, esiti o storia del gruppo.

Regola di autorità:

`appartenenza al gruppo != competenza disciplinare != coordinamento operativo != autorità istituzionale`

e resta valida la catena:

`contributo individuale != esito professionale del gruppo != decisione istituzionale != curricolo vigente`

## Otto gruppi operativi

### Scuola primaria

| Codice | Gruppo | Discipline |
|---|---|---|
| P-G01 | Area linguistico-storico-geografica | Italiano, Storia, Geografia, Insegnamento della religione cattolica |
| P-G02 | Area matematico-scientifico-tecnologica | Matematica, Scienze, Tecnologia |
| P-G03 | Area delle lingue straniere | Lingua inglese |
| P-G04 | Area artistico-espressiva e motoria | Musica, Arte e immagine, Educazione motoria |

### Scuola secondaria di primo grado

| Codice | Gruppo | Discipline |
|---|---|---|
| S-G01 | Area linguistico-storico-geografica | Italiano, Storia, Geografia, Latino per l’Educazione Linguistica, Insegnamento della religione cattolica |
| S-G02 | Area matematico-scientifico-tecnologica | Matematica, Scienze, Tecnologia |
| S-G03 | Area delle lingue straniere | Lingua inglese, Seconda lingua comunitaria — Francese |
| S-G04 | Area artistico-espressiva e motoria | Musica, Arte e immagine, Educazione fisica |

I codici sono identificativi operativi stabili. La futura denominazione istituzionale può essere collegata senza cambiare l’identità tecnica del gruppo.

## Educazione civica e AI Literacy

Educazione civica non costituisce un quinto gruppo. È un asse trasversale: ogni formulazione viene instradata al gruppo responsabile in base al **nucleo interno specifico**, con eventuali gruppi collegati in consultazione.

AI Literacy resta a sua volta un asse trasversale distinto. Anche in questo caso il routing è per nucleo e non per gruppo autonomo.

## Onboarding

Per scuola primaria e scuola secondaria di primo grado il docente indica:

1. ordine di scuola;
2. una o più discipline di competenza;
3. disciplina iniziale per la navigazione nell’app;
4. eventuale gruppo coordinato.

Arena mostra immediatamente i gruppi derivati dalle discipline. Più discipline nello stesso gruppo producono una sola appartenenza al gruppo, conservando più competenze disciplinari. Discipline appartenenti a gruppi diversi producono più appartenenze.

Il sostegno/inclusione non crea un quinto gruppo disciplinare. Rimane funzione trasversale; l’eventuale competenza disciplinare deve essere dichiarata separatamente.

## Stati del gruppo

### OPERATIVO_PROVVISORIO

È lo stato iniziale. Consente:

- revisione individuale;
- condivisione dei pareri;
- sintesi per disciplina;
- riunione guidata;
- registrazione dell’esito professionale da parte del coordinatore operativo.

Ogni ricevuta deve indicare che si tratta di un **esito professionale del gruppo operativo provvisorio** e che non costituisce approvazione istituzionale.

### FORMALIZZATO

È uno stato successivo. Richiede fonte/atto, data e soggetto che formalizza. La formalizzazione non modifica retroattivamente la natura degli esiti prodotti quando il gruppo era provvisorio.

## Competenza disciplinare e partecipazione

La partecipazione non viene calcolata su tutti i membri del gruppo.

Per una scheda di Tecnologia in S-G02, Arena conta esclusivamente gli utenti attivi che:

- appartengono a S-G02;
- hanno dichiarato Tecnologia tra le proprie discipline di competenza;
- partecipano allo spazio condiviso corrente.

Un docente di Matematica appartenente allo stesso S-G02 non viene contato automaticamente nella validazione di Tecnologia, salvo che abbia dichiarato anche Tecnologia come propria competenza.

Questa regola vale per tutti i gruppi, compreso S-G01: appartenere allo stesso gruppo non abilita automaticamente un docente a validare formulazioni specifiche dell’Insegnamento della religione cattolica o del Latino per l’Educazione Linguistica.

## Coordinatore operativo

Il coordinatore:

- guida il confronto;
- può avviare la riunione guidata;
- registra l’esito professionale del gruppo;
- non acquisisce automaticamente competenza nelle altre discipline;
- non acquisisce un ruolo deliberativo istituzionale.

Un esito diverso da `Rinvia` richiede la partecipazione completa dei docenti competenti per la disciplina. `Rinvia` resta utilizzabile quando il confronto non può ancora essere chiuso.

## Modello dati

La configurazione comprende:

- `operational_group_definitions` — gli otto gruppi;
- `operational_group_discipline_map` — relazione disciplina → gruppo;
- `operational_transversal_axes` — Educazione civica e AI Literacy con routing per nucleo;
- `team_operational_memberships` — appartenenza dell’utente, discipline di competenza, ruolo operativo e stato provvisorio/formalizzato.

L’onboarding usa `upsert_my_operational_profile_v1`: l’utente può costituire il proprio profilo operativo, ma non può autoattribuirsi autorità istituzionale.

I contributi e gli esiti sono inoltre legati a:

`anno scolastico + gruppo + disciplina + proposta + versione`

per impedire che un parere espresso in un’altra disciplina o in un altro gruppo venga contato nel consenso corrente.

## Privacy minima

La costituzione dei gruppi non richiede nominativi nell’interfaccia o nel modello organizzativo iniziale. Il sistema utilizza gli identificativi tecnici autenticati soltanto per impedire duplicazioni e calcolare il numero dei partecipanti competenti. L’interfaccia può mostrare il denominatore senza esporre identità personali.

## Formalizzazione futura

Quando saranno disponibili circolari, verbali, atti di nomina, organigramma o funzionigramma, Arena potrà:

- confermare o correggere la denominazione del gruppo;
- collegare la fonte istituzionale;
- formalizzare le appartenenze;
- registrare il coordinamento formale;
- mantenere invariati contributi ed esiti storici con il loro stato originario.

La formalizzazione è quindi un **upgrade di autorità e provenienza**, non la condizione necessaria per iniziare il lavoro professionale.
