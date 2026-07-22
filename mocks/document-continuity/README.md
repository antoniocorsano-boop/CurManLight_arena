# Document Continuity Mock

> Mock interattivo per la validazione dell'iniziativa Document Continuity.

## Obiettivo

Riprodurre realisticamente il comportamento proposto: un registro locale essenziale delle esportazioni che collega i documenti prodotti al lavoro sorgente.

## Stati simulati

1. **Nessuna esportazione** — messaggio vuoto con azione primaria
2. **Esportazione appena completata** — conferma con dettagli
3. **Registro con piu documenti** — lista massimo 5 eventi
4. **Lavoro modificato successivamente** — warning con azioni
5. **Documento ancora coerente** — conferma positiva
6. **Stato non verificabile** — formulazione prudente
7. **Mobile** — viewport 390x844

## Come usare il mock

1. Aprire `index.html` in un browser
2. Usare il pannello "Modalita test" (in alto a destra) per cambiare stato
3. Ogni stato mostra il registro come apparirebbe nella vista Documenti
4. Il mock e separato dal runtime — nessuna modifica al prodotto

## Linguaggio

- "Documenti prodotti" (non "log" o "eventi")
- "Ultima esportazione" (non "timestamp")
- "Deriva da" (non "source")
- "Il lavoro e stato modificato dopo questa esportazione" (non "stale")
- "Il file e stato scaricato sul dispositivo" (non "saved")

## File

- `index.html` — struttura e stati
- `styles.css` — stili coerenti con CurManLight
- `script.js` — logica di transizione stati
- `README.md` — questo file
