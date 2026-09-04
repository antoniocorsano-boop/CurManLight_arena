# Arena — collegamento dei team ai gruppi istituzionali correnti

## Regola non negoziabile

`utenti presenti nel workspace != componenti del gruppo istituzionale competente`

Arena può raccogliere contributi individuali da utenti autenticati, ma non può qualificare una convergenza come partecipazione completa del team e non può registrare un esito professionale del team finché il workspace non è collegato a un gruppo organizzativo corrente documentato.

## Perché il vincolo è necessario

Le fonti istituzionali correnti acquisite per settembre 2026 attestano l'uso delle categorie «ambiti disciplinari / classi parallele / plessi», qualificano le attività come lavori dipartimentali e prevedono referenti delle attività. Non forniscono però, nel materiale disponibile, l'elenco completo 2026/2027 dei singoli gruppi, delle discipline aggregate, dei componenti e dei relativi referenti.

È disponibile anche evidenza storica di un dipartimento comune Matematica–Scienze–Tecnologia. Questa continuità è utile per la ricognizione, ma non viene promossa automaticamente a configurazione corrente.

Il fascicolo istituzionale di riferimento è `ARENA-VAL-ORG-01_Mappa_gruppi_di_lavoro_dipartimenti_e_fonti_2026-2027`.

## Gerarchia delle fonti

1. **Fonte corrente primaria** — delibera del Collegio dei docenti, atto di nomina/designazione, organigramma o funzionigramma corrente, circolare organizzativa esplicita, verbale ufficiale di costituzione/conferma.
2. **Evidenza corrente di funzionamento** — verbali dei gruppi, relazioni, elenchi dei partecipanti, comunicazioni istituzionali dei referenti.
3. **Fonte programmatica** — PTOF, RAV, Piano di Miglioramento: utile a definire funzioni e assetto, non sufficiente da sola per ricostruire la composizione nominale corrente.
4. **Fonte storica** — prova continuità o precedenti organizzativi, mai membership corrente.

## Registro organizzativo annuale

La tabella `team_organizational_bindings` collega un workspace a:

- anno scolastico;
- ordine di scuola;
- tipo di gruppo;
- denominazione ufficiale;
- ambito di competenza;
- riferimento alla fonte;
- data della fonte e periodo di validità;
- eventuale responsabile;
- numero dei componenti/contributori ricavato dalla fonte;
- impronta SHA-256 della composizione tecnica corrente del workspace;
- utente autorizzato che ha confermato il collegamento;
- stato della conferma.

Nessun gruppo 2026/2027 viene precaricato o dedotto dal curricolo.

## Conferma

`confirm_team_organizational_binding_v1` richiede un utente autenticato con ruolo `dirigente` o `amministratore` nel workspace.

La conferma è accettata solo se il numero dei contributori attivi tecnicamente presenti nel workspace coincide con il numero dichiarato dalla fonte organizzativa esaminata. Al momento della conferma Arena congela anche l'impronta SHA-256 della composizione tecnica.

Se successivamente cambia un componente attivo o il suo ruolo, l'impronta non coincide più e il collegamento diventa operativamente non valido fino a nuova verifica.

## Comportamento fail-closed

`get_team_review_eligible_contributor_count_v2` restituisce il denominatore del team soltanto se:

- esiste un binding `CONFIRMED_CURRENT`;
- il binding è temporalmente valido;
- il numero dei membri attivi coincide ancora;
- l'impronta della composizione coincide ancora.

Altrimenti restituisce `NULL`.

Il dominio di revisione interpreta `NULL` come **copertura non verificabile**: anche contributi individuali perfettamente concordi restano `needs-clarification` e non possono essere compressi come `shared`.

In aggiunta, un trigger server-side blocca qualsiasi inserimento in `team_review_outcomes` se il binding manca o è diventato obsoleto. Il blocco vale anche se un client non aggiornato tentasse di registrare la decisione.

## Cosa resta consentito senza binding

- leggere il curricolo;
- preparare la propria revisione;
- condividere un contributo individuale autenticato;
- proporre una modifica;
- vedere le divergenze e preparare il confronto.

## Cosa resta bloccato senza binding

- dichiarare che tutti i componenti del gruppo hanno partecipato;
- classificare automaticamente un punto come già condiviso dal team;
- confermare in blocco i punti condivisi;
- registrare un esito professionale del team con valore di chiusura del passaggio professionale.

## Confine di autorità

Il collegamento organizzativo prova soltanto quale gruppo professionale è rappresentato dal workspace e quale denominatore può essere usato per la partecipazione completa.

Non equivale a:

- validazione professionale di una formulazione;
- decisione istituzionale;
- approvazione del Collegio dei docenti;
- adozione canonica;
- entrata in vigore del curricolo.

La catena resta:

`contributo individuale → decisione professionale del team → proposta istituzionale → decisione dell'organo competente → versione vigente`

## Stato della ricognizione 4 settembre 2026

- struttura generale dei lavori di settembre: **confermata**;
- esistenza di referenti delle attività: **confermata**;
- composizione dei singoli dipartimenti/ambiti 2026/2027: **aperta**;
- binding storico Matematica–Scienze–Tecnologia: **verificato come storico**;
- calcolo della copertura completa dei team reali: **bloccato fino alla fonte corrente**;
- revisione individuale: **autorizzata**.
