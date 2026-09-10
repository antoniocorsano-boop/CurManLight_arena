# G5 — Curricolo: Esplora + Trama V1

## Origine

Il retest umano mobile della release `37d89ff26358ebf4eae84108c27956eae5897277` ha confermato due fatti distinti:

1. la prima schermata del Curricolo è decisamente più professionale e leggibile rispetto alla superficie precedente;
2. la fruizione nel merito resta troppo vicina a una lettura sequenziale da documento, oltre al finding separato sulle tabelle portrait.

Il finding di fruibilità è registrato come `G5-UX-CURRICULUM-NONSEQUENTIAL-EXPLORATION-001`.

## Decisione di prodotto

Il curricolo deve essere un solo contenuto canonico con proiezioni diverse, non più copie concorrenti.

Le tre proiezioni target sono:

- **Esplora** — ingresso ordinario del docente, orientato a disciplina, ordine, annualità e nodo curricolare;
- **Trama** — vista relazionale del curricolo, utile a leggere continuità e progressioni senza trasformare il curricolo in un grafo libero;
- **Documento** — resa editoriale sequenziale, istituzionale e stampabile.

La V1 non sostituisce ancora il contratto `Vista web ↔ Documento` della candidata G5 corrente. Viene sviluppata su branch separato e resta fuori dall'exact-head gate della Beta finché la remediation portrait non viene chiusa da nuovo deploy e retest umano.

## Principio di autorità

`Esplora`, `Trama` e `Documento` devono derivare dagli stessi blocchi del fascicolo dipartimentale v3.1.

Nessuna vista può:

- creare nuovi obiettivi, conoscenze, abilità o traguardi;
- dedurre autorità istituzionale;
- promuovere automaticamente un contenuto a curricolo vigente;
- inventare relazioni curricolari.

La Trama V1 mostra solo relazioni deterministiche e spiegabili, ricavate da dati già presenti:

- successione delle annualità nella stessa disciplina;
- ricorrenza dello stesso `Nucleo` con denominazione identica in annualità diverse;
- appartenenza di un nodo alla specifica annualità e disciplina.

Se una relazione non è disponibile in modo deterministico, la vista deve fallire in chiusura: la relazione non viene mostrata.

## Esplora V1

Percorso minimo:

`Disciplina → ordine di scuola → annualità → nuclei → dettaglio`

Per ogni annualità, la matrice viene proiettata su mobile come schede verticali. La tabella integrale non viene cancellata: resta disponibile nella pubblicazione integrale e nel Documento.

Ogni scheda annuale deve preservare almeno:

- Nucleo;
- Esito annuale d'Istituto;
- Obiettivi annualizzati;
- Conoscenze essenziali;
- Abilità operative;
- Evidenze osservabili.

Per Tecnologia nella secondaria di primo grado, il passaggio al Riesame resta un'azione separata e intenzionale.

## Trama V1

La Trama è una proiezione relazionale, non un editor e non un motore di inferenza.

Flusso minimo:

`Disciplina → annualità di partenza → nucleo → occorrenze dello stesso nucleo nelle altre annualità`

Ogni nodo deve mostrare almeno:

- annualità;
- nucleo;
- esito annuale;
- provenienza dal fascicolo.

Il collegamento è dichiarato come `stesso-nucleo-esatto`; nessun collegamento semantico fuzzy è autorizzato in V1.

## Vincoli mobili

- nessuna dipendenza da tabelle orizzontali per la consultazione ordinaria;
- target touch ≥ 44 px;
- nessun canvas con pan/zoom obbligatorio per capire la progressione;
- il grafo deve degradare in una sequenza verticale leggibile;
- nessun overflow orizzontale a livello pagina;
- testo e controlli leggibili a 390×844 senza zoom browser.

## Compatibilità con G5 corrente

Finché la candidata `8e992fd80d78685fea0635b31df1a7745bf49115` non chiude i propri gate:

- `Vista web` resta il contratto esterno della Beta corrente;
- la pubblicazione integrale e i suoi selector restano montati e testabili;
- Esplora/Trama vengono aggiunti in modo additivo e non diventano ancora l'unico percorso di consultazione;
- nessun finding umano viene chiuso da questa implementazione senza un nuovo retest reale.

## Gate di accettazione V1

`EXPLORE_TRAMA_V1_PASS` richiede:

1. Tecnologia raggiungibile senza percorrere le 16 sezioni editoriali;
2. annualità selezionabile con massimo due decisioni dopo la disciplina;
3. matrice annuale leggibile su mobile come schede verticali;
4. Trama leggibile senza zoom o trascinamento obbligatorio;
5. relazioni della Trama deterministiche e senza inferenze non tracciate;
6. pubblicazione integrale ancora disponibile;
7. Riesame separato dalla consultazione;
8. nessuna regressione dei gate di autorità H2/H3/H4;
9. nessuna regressione del finding portrait-table già corretto tecnicamente;
10. nuovo retest umano su telefono prima di qualsiasi claim di accettazione.

## Non-claim

Questo documento definisce una slice di esperienza utente. Non modifica il curricolo, non approva contenuti, non chiude G5 e non attribuisce `BETA_HIA_PASS`.
