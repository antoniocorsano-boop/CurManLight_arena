# CurManLight Arena — GOV.UK-informed Human Task Metrics

Status: CANONICAL CANDIDATE / BETA-G5
Date: 2026-08-27

## Provenienza

Questo contratto trasferisce in CurManLight Arena il modello già adottato in Docente OS attraverso:

- `docs/architecture/HUMAN_TASK_MODEL.md` di Docente OS;
- `docs/research/HUMAN_TASK_CONTENT_MODEL_RESEARCH.md` di Docente OS;
- GOV.UK Service Manual come riferimento di progettazione per bisogni utente, struttura dei flussi e riduzione delle decisioni simultanee.

I valori numerici sotto sono **budget di prodotto Arena**, non soglie scientifiche universali e non sono presentati come requisiti normativi GOV.UK. Devono essere misurati, riesaminati con utenti reali e modificati solo con evidenza.

## Principio

Il documento, il registro o l'archivio completo non sono automaticamente una buona interfaccia operativa.

Quando Arena conosce il compito corrente deve mostrare prima:

1. dove sono;
2. che cosa sto facendo;
3. a che punto sono;
4. che cosa faccio adesso;
5. conseguenza e limite di autorità;
6. solo dopo, dettagli, provenienza e vista completa.

## Modalità

### FOCUSED

Compito, oggetto e stato sono noti.

- una sola azione primaria visibile allo stesso livello;
- massimo due azioni di supporto allo stesso livello;
- nessuna panoramica generale sopra il compito;
- stato e contesto sempre leggibili;
- dettagli tecnici dietro progressive disclosure;
- il percorso completo resta sempre raggiungibile.

### GUIDED

Il contesto è parziale. Arena può proporre il prossimo passo ma deve spiegare il perché e consentire l'accesso alla vista completa.

### EXPLORE

La persona ha scelto volontariamente una vista ampia. Liste lunghe, filtri e confronti completi sono leciti, ma non devono essere imposti come passaggio obbligatorio dentro un task FOCUSED.

## Budget misurabili BETA-G5

| Metrica | Budget Arena | Significato |
| --- | ---: | --- |
| Overflow orizzontale mobile | `<= 1 px` | nessuno scorrimento laterale involontario |
| Prossima azione in ingresso FOCUSED | entro `1 viewport` | nessuno scroll iniziale per capire come procedere |
| Accesso al lavoro quando l'azione reale è più in basso | `<= 1 tap` | un comando sopra la piega porta al punto operativo |
| Azioni primarie simultanee | `1` | nessuna competizione tra CTA principali |
| Azioni di supporto simultanee | `<= 2` | riduzione delle decisioni concorrenti |
| Scroll di una superficie FOCUSED mobile | target `<= 3 viewport`, hard stop `<= 4 viewport` | oltre il target si deve segmentare; oltre 4 il gate fallisce |
| Token tecnici nel primo viewport | `0` UUID / `CML_*` / riferimenti interni | il primo livello usa linguaggio umano |
| Scritture istituzionali durante HIA non autorizzata | `0` | il test UX non attraversa il confine di autorità |
| Immagini visibili rotte | `0` | nessun fallback grafico che altera gerarchia o layout |

Il target `<= 3 viewport` è un **budget di comfort**, mentre `4 viewport` è il limite automatico di non conformità per una superficie FOCUSED. Una vista EXPLORE esplicitamente aperta può essere più lunga.

## Budget qualitativi ereditati da Docente OS

Una persona deve poter rispondere entro pochi secondi a:

- Dove sono?
- Che cosa sto facendo?
- A che punto sono?
- Che cosa faccio adesso?
- Che cosa succede se proseguo?
- Qual è il limite della mia autorità?
- Come vedo il resto senza perdere il contesto?

Il task fallisce Human Interaction Acceptance se richiede di:

- leggere una pagina lunga prima di trovare il prossimo passo;
- interpretare UUID, codici o nomi interni;
- scorrere contenuti non pertinenti al compito;
- comprendere l'architettura del prodotto;
- aprire il registro completo per eseguire una singola azione;
- distinguere a memoria tra più CTA concorrenti;
- perdere il contesto passando da confronto locale, proposta, decisione e handoff.

## Applicazione a Revisione

La sequenza umana è:

**orienta → scegli localmente → struttura la proposta → prepara → invia → prendi in carico → ammetti alla decisione → verifica autorità/conseguenza → consulta handoff**.

Regole di proiezione:

1. orientamento + stato + confine devono stare sopra la piega;
2. se non esiste ancora una scelta locale trasformabile, sopra la piega compare un solo comando che porta alla prima scelta utile;
3. appena esiste una proposta strutturata, il registro completo delle scelte locali diventa secondario e collassato;
4. quando una proposta è `accepted-for-decision`, il pannello decisionale viene prima del confronto testuale completo;
5. confronto completo, provenienza, eventi e footprint restano disponibili ma non dominano il task;
6. l'anteprima verso Docente OS resta `PREVIEW_ONLY` ed è consultabile su richiesta.

## Gate

`Beta HIA Evidence` deve registrare nel proprio `summary.json`:

- `scrollViewports`;
- posizione della prima azione operativa in viewport;
- numero di azioni primarie visibili;
- overflow orizzontale;
- token tecnici nel primo viewport;
- immagini rotte;
- RPC istituzionali;
- screenshot desktop/mobile degli stati critici.

L'automazione può certificare i budget strutturali, ma **non può emettere `BETA_HIA_PASS`**: comprensibilità, gerarchia, comfort e linguaggio richiedono comunque decisione umana esplicita.
