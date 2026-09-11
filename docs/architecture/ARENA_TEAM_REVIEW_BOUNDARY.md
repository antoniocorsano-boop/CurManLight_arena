# Arena — Team Review Authority Boundary

## Regola non negoziabile

`contributo individuale != esito del team != decisione istituzionale != curricolo vigente`

Questa separazione è un vincolo di prodotto e di autorità, non una distinzione soltanto grafica.

## Contributo individuale

Un contributo individuale:

- richiede sessione autenticata e membership attiva del workspace;
- è registrabile dai ruoli `docente`, `dipartimento`, `referente`;
- rappresenta un orientamento preparatorio su una specifica impronta della scheda;
- può essere aggiornato dallo stesso utente;
- non è un voto;
- non è un esito del team;
- non può produrre direttamente una decisione istituzionale o un'adozione canonica.

## Sintesi del team

La sintesi è una proiezione deterministica dei contributi correnti. Non crea nuove autorità.

- `shared`: contributi correnti concordi su proposta o testo precedente **e copertura completa** dei contributori attivi attesi nel workspace selezionato;
- `change-proposed`: contributi correnti concordi sulla stessa formulazione alternativa;
- `divergent`: orientamenti diversi oppure formulazioni alternative diverse;
- `needs-clarification`: nessun contributo corrente, almeno un contributo riferito a una versione non più corrente oppure copertura incompleta per un orientamento che altrimenti apparirebbe condiviso.

### Copertura del team

Un singolo contributo non costituisce consenso quando il workspace contiene più contributori attivi. Arena verifica sul server il numero dei membri attivi con ruolo `docente`, `dipartimento` o `referente` e restituisce al client soltanto la numerosità, non le identità.

Una scheda può essere compressa come `shared` solo quando il numero dei contributori correnti distinti è almeno pari al numero dei contributori attivi attesi e gli orientamenti sono concordi. Se la copertura non è verificabile, Arena usa un comportamento fail-closed: la scheda resta `needs-clarification`.

La sintesi non può trasformare automaticamente un insieme di contributi in un esito del team.

## Esito del team

Un esito del team:

- è una ricevuta append-only del lavoro svolto durante la riunione;
- è registrabile soltanto da membership `dipartimento` o `referente`;
- può assumere gli esiti `accept-proposal`, `keep-previous`, `shared-text`, `defer`;
- richiede motivazione esplicita;
- per `shared-text` richiede il testo concordato;
- resta legato all'impronta corrente della scheda;
- non conferisce autorità istituzionale al registrante;
- non materializza né adotta automaticamente il curricolo.

## Decisione istituzionale

La decisione istituzionale resta sul confine già esistente di Arena:

- sessione autenticata;
- membership e capacità istituzionale verificate;
- versione della proposta congelata;
- ricevuta istituzionale separata;
- successivo eventuale percorso di adozione canonica.

Nessun dato in `team_review_contributions` o `team_review_outcomes` può essere interpretato come sostituto della ricevuta istituzionale.

## Persistenza

Le scritture dirette alle tabelle condivise del team sono revocate a client anonimi e autenticati. Le mutazioni avvengono esclusivamente tramite funzioni RPC `security definer` che verificano `auth.uid()`, workspace attivo e membership attiva.

Le letture sono consentite ai membri attivi del workspace tramite RLS. La verifica della copertura usa una RPC separata che restituisce soltanto il conteggio dei contributori attivi attesi.

## Conseguenza per l'interfaccia

Arena deve rendere immediatamente visibile la distinzione:

1. **Il mio lavoro nel curricolo** — preparazione individuale locale;
2. **Il lavoro del team** — aggregazione dei contributi autenticati;
3. **Esito del team** — ciò che il gruppo ha concordato;
4. **Decisione istituzionale** — passaggio separato con autorità verificata.

Nessun pulsante del livello 1-3 deve usare un linguaggio che faccia intendere approvazione istituzionale o entrata in vigore del curricolo.
