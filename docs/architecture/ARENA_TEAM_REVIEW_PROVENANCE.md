# Arena — Provenienza dei punti portati al confronto del team

## Decisione di prodotto

Un punto presente nella coda `Da discutere` non è soltanto uno stato aggregato. Deve poter spiegare in modo verificabile:

1. **su quale oggetto curricolare si sta lavorando**;
2. **perché il punto è entrato nella coda del team**;
3. **quali contributi correnti hanno prodotto quella situazione**;
4. **a quale versione visibile della scheda si riferiscono**;
5. **da quali fonti documentali derivano il testo precedente e il testo proposto**;
6. **quale esito viene eventualmente registrato dal team**.

La provenienza non coincide con il nome dell'autore. È la catena che collega contenuto, versione, contributi, motivo del confronto ed esito.

## Regola di autorità

Resta non negoziabile:

`contributo individuale != sintesi del team != esito del team != decisione istituzionale != curricolo vigente`

La provenienza serve a rendere questa separazione verificabile, non a ridurla.

## Provenienza visibile nella coda

Ogni punto aperto deve mostrare sempre tre informazioni.

### Perché è qui

La causa è derivata deterministicamente dai dati correnti e non viene assegnata manualmente dal coordinatore.

Codici operativi:

- `no-current-contributions`: nessun contributo sulla versione corrente;
- `stale-contributions`: almeno un contributo appartiene a una versione precedente;
- `coverage-incomplete`: non sono ancora presenti tutti i contributori attesi;
- `divergent-orientations`: orientamenti o formulazioni alternative differenti;
- `alternative-text-proposed`: esiste una formulazione alternativa corrente da esaminare;
- `shared`: orientamento concorde con copertura completa.

### Da dove arriva

Devono essere leggibili:

- disciplina e ordine di scuola;
- identificativo della scheda;
- versione corrente in forma comprensibile;
- riferimento tecnico/fingerprint come dettaglio di integrità;
- stato del collegamento alle fonti documentali.

Il fingerprint prova la coerenza della versione, ma non sostituisce la fonte documentale.

### Contributi e provenienza

Per ciascun contributo corrente Arena mostra:

- provenienza personale leggibile (`Il tuo contributo`, `Docente`, `Coordinatore di dipartimento`, `Referente`);
- orientamento;
- eventuale formulazione alternativa;
- data dell'ultimo aggiornamento;
- stato rispetto alla versione corrente.

L'interfaccia non espone automaticamente email o identificativi tecnici dell'utente. L'identità nominale potrà essere mostrata solo quando esiste un profilo istituzionale verificato e una regola di governo che ne autorizza l'esposizione nel contesto di coordinamento.

## Fonti documentali

La UI non deve presentare come fonte verificata una semplice etichetta (`quadro 2012`, `quadro 2025`) quando la scheda legacy non contiene un riferimento canonico al documento.

In assenza di riferimento strutturato Arena dichiara esplicitamente:

`Fonti documentali canoniche: collegamento non ancora verificato per questa scheda.`

Lo stato `unlinked` è preferibile a una provenienza inventata.

Il passo successivo è collegare le schede legacy al dominio canonico già esistente (`RevisionProposal`, `RevisionProposalVersion`, `sourceRefs`, `curriculumVersionRef`) senza duplicare la semantica delle fonti.

## Separazione dei contesti operativi

La Revisione espone due spazi distinti:

### Il mio contributo

- lettura della scheda;
- orientamento personale;
- eventuale modifica personale;
- pubblicazione esplicita nel team.

Anche un coordinatore, quando lavora qui, è un contributore individuale.

### Coordinamento / lavoro del team

- copertura;
- punti condivisi;
- modifiche proposte;
- divergenze;
- punti da chiarire;
- coda `Da discutere` con provenienza;
- registrazione dell'esito del team per i ruoli autorizzati.

L'accesso allo spazio di coordinamento deriva esclusivamente da membership autenticata `dipartimento` o `referente`, mai dal ruolo locale autodichiarato.

## Gap deliberatamente ancora aperto: identità della riunione

L'attuale `team_review_outcomes` conserva workspace, scheda, fingerprint, esito, motivazione, registrante e data. Non conserva ancora una vera identità della riunione.

Per raggiungere il modello maturo completo devono essere introdotte, in una slice successiva e additive-first, due entità:

### TeamMeeting

- workspace;
- titolo/data;
- stato `draft/open/closed`;
- creatore;
- apertura/chiusura;
- elenco dei punti congelati per quella sessione.

### TeamMeetingItem

- meeting;
- proposalRef;
- proposalFingerprint;
- snapshot umano dei testi;
- snapshot della provenienza documentale;
- motivo di ingresso nella coda;
- snapshot della copertura e delle classi di orientamento;
- stato `open/resolved/deferred`;
- collegamento all'esito del team.

Questa estensione non deve sostituire la sintesi corrente: la sintesi resta dinamica durante la preparazione; il `TeamMeetingItem` nasce quando il punto viene congelato per una specifica riunione.

## Criteri di accettazione della slice corrente

- un coordinatore riconosce immediatamente lo spazio personale e quello di coordinamento come contesti differenti;
- il coordinatore viene indirizzato inizialmente allo spazio del team solo quando la membership autenticata lo giustifica;
- ogni punto aperto espone `Perché è qui`;
- ogni punto aperto espone `Da dove arriva`;
- i contributi correnti sono ispezionabili senza esporre dati personali non necessari;
- una fonte non collegata viene dichiarata `non verificata`, non simulata;
- un contributo su fingerprint precedente resta distinguibile e non viene conteggiato come corrente;
- la registrazione dell'esito del team resta separata da qualsiasi decisione istituzionale.
