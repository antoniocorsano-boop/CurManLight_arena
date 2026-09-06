# Arena — gruppi operativi per disciplina e autorità verificata

## Decisione di prodotto

Arena consente il lavoro professionale sul curricolo anche prima che ogni appartenenza operativa sia collegata a un atto organizzativo, senza però trasformare un dato auto-dichiarato in autorità condivisa.

Il docente può dichiarare **le proprie discipline di competenza**. Arena deriva automaticamente il gruppo o i gruppi operativi corrispondenti. Il profilo personale **non consente di autoattribuirsi il coordinamento, il ruolo di Dipartimento, il ruolo di Referente o altra autorità condivisa**.

La capacità di registrare un esito del team richiede invece una membership condivisa autenticata e verificata di **Dipartimento o Referente**, oltre alla competenza nella disciplina della scheda.

Regola di autorità:

`profilo personale != competenza disciplinare != membership condivisa verificata != esito del team != decisione istituzionale != curricolo vigente`

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
| S-G03 | Area delle lingue straniere | Lingua inglese, Seconda lingua comunitaria |
| S-G04 | Area artistico-espressiva e motoria | Musica, Arte e immagine, Educazione fisica |

I codici sono identificativi operativi stabili. Una futura denominazione istituzionale può essere collegata senza cambiare l’identità tecnica del gruppo.

## Educazione civica e AI Literacy

Educazione civica non costituisce un quinto gruppo. È un asse trasversale: ogni formulazione deve essere instradata al gruppo responsabile in base al nucleo specifico, con eventuali gruppi collegati in consultazione.

AI Literacy resta a sua volta un asse trasversale distinto, con instradamento per nucleo e non tramite un gruppo autonomo.

## Profilo personale e onboarding

Per la scuola primaria e la scuola secondaria di primo grado il profilo personale può raccogliere:

1. ordine di scuola;
2. disciplina o discipline utili al lavoro personale;
3. disciplina iniziale di navigazione;
4. classi e sezioni personali.

Arena può derivare i gruppi dalle discipline. Più discipline nello stesso gruppo non duplicano l’appartenenza tecnica; discipline appartenenti a gruppi diversi possono produrre più associazioni operative.

**Non viene chiesto né salvato un coordinamento auto-dichiarato.** Gli incarichi di Dipartimento, Referente, Dirigente e le altre facoltà condivise derivano esclusivamente dal contesto autenticato e dalle membership verificate.

Il sostegno/inclusione non crea un quinto gruppo disciplinare e non attribuisce automaticamente competenza sulle singole discipline.

## Stati dell’appartenenza operativa

### `OPERATIVO_PROVVISORIO`

È lo stato iniziale delle competenze dichiarate e consente di partecipare al lavoro professionale nella disciplina per cui l’utente risulta competente. Non attribuisce da solo alcuna facoltà di registrare l’esito del team.

### `FORMALIZZATO`

È uno stato successivo collegabile a fonte, data e soggetto che formalizza. La formalizzazione non modifica retroattivamente la natura dei contributi già registrati e **non trasforma un esito del team in approvazione istituzionale**.

## Competenza disciplinare e partecipazione

La partecipazione non viene calcolata su tutti i membri del gruppo.

Per una scheda di Tecnologia in S-G02, Arena conta esclusivamente gli utenti attivi che:

- partecipano allo spazio condiviso corrente;
- risultano associati a S-G02 per l’anno scolastico corrente;
- hanno Tecnologia tra le proprie discipline di competenza.

Un docente di Matematica appartenente allo stesso S-G02 non viene contato automaticamente nella validazione di Tecnologia.

La stessa regola vale per tutti i gruppi: appartenere al gruppo non abilita automaticamente a validare una disciplina diversa da quelle dichiarate e correnti.

## Autorità per l’esito del team

La registrazione dell’esito richiede contemporaneamente:

- sessione autenticata;
- membership attiva nello spazio condiviso;
- ruolo verificato `dipartimento` oppure `referente`;
- competenza operativa sulla disciplina esatta;
- collegamento all’anno scolastico, gruppo, disciplina, proposta e impronta della versione corrente;
- per ogni esito diverso da `Rinvia`, copertura completa dei contributori competenti correnti.

Un utente con sola membership `docente` può contribuire e consultare il confronto, ma **non può registrare l’esito del team**. Una competenza disciplinare auto-dichiarata non può elevare questa facoltà.

`Rinvia` resta disponibile all’autorità verificata quando il confronto non può ancora essere chiuso.

## Confine istituzionale

Un esito del team:

- documenta il risultato professionale del confronto;
- non è una deliberazione del Collegio dei docenti;
- non approva il curricolo;
- non produce adozione o promozione canonica;
- non modifica automaticamente il curricolo vigente.

La catena resta:

`contributo individuale → esito professionale del team → proposta istituzionale → decisione dell’organo competente → versione vigente`

## Modello dati

La configurazione comprende:

- `operational_group_definitions` — gli otto gruppi;
- `operational_group_discipline_map` — relazione disciplina → gruppo;
- `operational_transversal_axes` — Educazione civica e AI Literacy con instradamento per nucleo;
- `team_operational_memberships` — associazioni operative, competenze disciplinari e stato provvisorio/formalizzato;
- `workspace_memberships` — fonte condivisa autenticata dei ruoli che possono esercitare le relative facoltà.

`upsert_my_operational_profile_v1` conserva la firma compatibile, ma accetta esclusivamente competenze disciplinari: un tentativo di valorizzare il parametro di coordinamento viene respinto in modo fail-closed.

I contributi e gli esiti sono legati a:

`anno scolastico + gruppo + disciplina + proposta + impronta della versione`

per impedire che un parere espresso in un’altra disciplina, gruppo o versione venga contato nel consenso corrente.

## Difesa in profondità

Il confine di autorità viene applicato su più livelli:

1. il profilo personale non espone un controllo per autoassegnare il coordinamento;
2. il client invia sempre `p_coordinator_group_code = null`;
3. la RPC del profilo rifiuta esplicitamente ogni tentativo di autoattribuzione;
4. il repository applicativo rifiuta la registrazione dell’esito senza ruolo Dipartimento/Referente;
5. la RPC di registrazione verifica nuovamente ruolo, competenza, scope e copertura;
6. un trigger protegge anche insert diretti o percorsi legacy.

## Privacy minima

La costituzione dei gruppi non richiede nominativi nell’interfaccia organizzativa. Il sistema utilizza identificativi tecnici autenticati per impedire duplicazioni e calcolare il numero dei partecipanti competenti. La sintesi può mostrare il denominatore senza esporre identità personali non necessarie.

## Formalizzazione futura

Quando saranno disponibili circolari, verbali, atti di nomina, organigramma o funzionigramma, Arena potrà collegare le fonti organizzative alle appartenenze e agli incarichi verificati.

Questa formalizzazione aumenta **provenienza e verificabilità**; non sostituisce la successiva decisione dell’organo competente e non rende retroattivamente istituzionali gli esiti professionali già prodotti.
