# CURR-REF-01/E-R4b — Accesso alle schede di riesame in Arena

**Data:** 19 novembre 2026. **Stato:** candidata di chiarezza operativa, non autorizzazione curricolare.

## Verifica delle superfici esistenti

- **Ingresso:** navigazione principale **Riesame**, gestita da `AppViewsLayer`; passaggio contestuale da `Curricolo` solo per richiesta esplicita.
- **Classe:** `CaseAwareRevisionSurface` ha selezione di Classe I, II e III per Tecnologia nella secondaria. La scelta è esplicita; l'applicazione non può dedurre la classe dal profilo utente.
- **Cinque schede:** Classe I → `TEC-SEC1-2026-01`, revisione R2, `tec-sec1-2026-r2-n1`, `n2`, `n3`, `n4`, `verticalita`; tutti e cinque gli identificativi sono già presenti nel pilota Arena, senza inserimento o duplicazione.
- **Separazione:** Classe II → una scheda propria `tec-sec2-2026-r1-n1`, Classe III → nessuna scheda H2 ancora materializzata. Nessuna classe eredita le schede della I.
- **Compito personale:** `RevisionWorkspace` → `RevisioneTab` presenta testo precedente, proposta, contesto e fonti espandibili. Le scelte restano nel registro delle preferenze personali fino alla condivisione autorizzata.
- **Contributo condiviso:** `TeamContributionPublisher` richiede appartenenza operativa attiva, identità autenticata e condivisione corrente persistita; il confronto e l'esito appartengono a un soggetto autorizzato e sono gestiti da `TeamCoordinationWorkspace`.
- **Casi mirati:** `CurriculumReviewCasePanel` richiede trigger qualificato, unità curricolare esatta, scheda registrata e motivazione; `CaseScopedExperienceShell` separa lavoro individuale e decisione. L'inbox condivisa usa la stessa selezione di classe.
- **Riesame verticale:** passaggio separato `VerticalReviewPanel`, non adottivo. Curriculum master `CAN-CURR-MASTER-00@1.3` rimane in stato non vigente.

## Correzione circoscritta

Prima, quando `targetClass` era vuota (stato iniziale legittimo, che non prova una selezione), l'intestazione poteva mostrare «Classe » e il messaggio generico «schede non pronte». La candidata distingue ora **classe non selezionata** da **classe con schede non materializzate**. Mostra un'istruzione esplicita, non sceglie automaticamente la Classe I. La normalizzazione già esistente governa sia la scelta visiva sia il risolutore semantico; nessuna variazione a casi, contributi, ruoli, master o persistenza.

## Verifica e responsabilità

La prova `canonical-curriculum-entry.test.ts` conferma nessuna scheda senza selezione, cinque schede Classe I, una Classe II, zero Classe III e mancata contaminazione con altre discipline. Le verifiche del percorso di gruppo e del caso mirato restano nei test già esistenti. Il test automatizzato qui introdotto verifica contratti e fonte dell'interfaccia: **non dimostra un collaudo manuale con account istituzionale, persistenza condivisa o decisione umana**.

Non sono stati aperti casi, condivisi contributi, registrati esiti o modificati documenti. Il fascicolo E-R4 di TRAMA resta istruttorio. Per la validazione professionale reale serve un docente autorizzato che esamini le cinque schede e, se previsto, le condivida nel gruppo; la successiva azione del coordinatore è distinta.
