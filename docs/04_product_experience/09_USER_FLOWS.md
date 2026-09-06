# 09 — USER FLOWS CRITICI

**Product vision:** `ARENA-PRODUCT-VISION@1.0.0`  
**Lifecycle:** `CURRICULUM_LIFECYCLE@1.1.1`  
**Stato:** `CANONICAL_TARGET_FLOWS`  
**Data:** 2026-09-06

---

Questo documento descrive i percorsi che Arena deve rendere semplici e verificabili. I flow sono espressi in termini professionali e non dipendono dall'attuale implementazione per tab o componenti.

---

## 1. Capire che cosa si applica

**Trigger:** un docente apre Arena o entra nel Curricolo.

**Passi:**
1. Arena identifica ordine, classe/coorte, disciplina/campo/asse pertinenti.
2. Mostra la `CurriculumUnit` applicabile e distingue fonte/benchmark nazionale da annualizzazione d'Istituto.
3. Evidenzia eventuali decisioni professionali ancora aperte.
4. Fonti e tracciabilità sono disponibili su richiesta.

**Successo:** il docente comprende che cosa si applica senza consultare manualmente il fascicolo.

**Errore da evitare:** trattare una annualizzazione locale come OSA nazionale annuale o riscrivere retroattivamente coorti ancora in regime precedente.

---

## 2. Validazione professionale individuale

**Trigger:** esiste un `CurriculumReviewCase` assegnato al docente.

**Passi:**
1. `ESAMINA` — confronto fra testo/proposta e contesto applicabile.
2. Il docente sceglie l'azione professionale prevista: confermare, proporre modifica, mantenere il testo precedente o rinviare al confronto.
3. L'effetto resta personale finché non viene esplicitamente registrato/condiviso.
4. `CONDIVIDI` — il contributo diventa `ProfessionalContribution` persistito e tracciato.
5. Arena considera la condivisione corrente solo se il contributo persistito corrisponde a utente, scheda/versione o fingerprint, orientamento personale ed eventuale testo di modifica correnti.
6. Se il docente cambia successivamente il proprio orientamento, la precedente condivisione non abilita più il passaggio successivo finché non viene aggiornata.

**Successo:** il docente termina il proprio compito senza dover interpretare stati tecnici o autorità future e senza che una semplice dichiarazione locale possa simulare una condivisione registrata.

**Confine:** `ProfessionalContribution != TeamProfessionalOutcome`.

---

## 3. Confronto del gruppo ed esito professionale

**Trigger:** il contributo personale dell'attore è persistito e corrente; sono inoltre disponibili i contributi richiesti dal gruppo e un attore autorizzato al confronto.

**Passi:**
1. Arena verifica che la condivisione personale corrente corrisponda ancora al lavoro individuale corrente.
2. Arena compatta i contributi convergenti.
3. Porta in primo piano solo differenze, proposte alternative e punti da discutere.
4. `CONFRONTA` — il gruppo esamina i punti realmente aperti.
5. Solo con prerequisiti e autorità soddisfatti compare `REGISTRA L'ESITO`.
6. L'esito registrato diventa `TeamProfessionalOutcome` legato alla stessa versione/fingerprint.

**Successo:** il gruppo non deve rileggere tutto, l'esito è ricostruibile e nessun attore può entrare nel confronto attraverso una dichiarazione di condivisione non verificata.

**Confine:** `TeamProfessionalOutcome != InstitutionalDecision`.

---

## 4. Riesame verticale

**Trigger:** esiti professionali sufficienti per verificare la progressione 3–14 o presenza di una criticità verticale.

**Passi:**
1. Arena presenta raccordi precedente/successivo e questioni irrisolte.
2. Il referente/attore competente verifica salti, duplicazioni, prerequisiti e coerenza di progressione.
3. Le criticità generano casi mirati, non riscritture indiscriminate.
4. Un esito esplicito diventa `VerticalReviewOutcome`.

**Successo:** la verticalità viene verificata come relazione fra unità curricolari, non come semplice completezza documentale.

---

## 5. Iter istituzionale

**Trigger:** il master ha completato i gate professionali richiesti ed è pronto per il passaggio previsto dall'Istituto.

**Passi:**
1. Arena mostra readiness, esiti professionali e questioni ancora aperte.
2. Le azioni istituzionali compaiono solo agli attori autorizzati.
3. Una decisione viene registrata come `InstitutionalDecision`.
4. L'adozione, quando prevista e realmente registrata, genera `AdoptionReceipt`.

**Successo:** nessun passaggio tecnico o professionale viene presentato come adozione.

---

## 6. Collegare il curricolo alla progettazione

**Trigger:** un docente apre Programmazione, UDA o un'attività didattica.

**Passi:**
1. Arena propone le `CurriculumUnit` applicabili alla classe/periodo/discipline.
2. Il docente seleziona quelle realmente utilizzate.
3. Arena crea `DidacticBinding` con identità e versione.
4. La progettazione mostra cosa è collegato e cosa resta scoperto senza generare ranking.
5. Per Educazione civica vengono collegati risultato civico, nucleo, attività, ore, responsabilità ed evidenza.

**Successo:** la progettazione deriva dal curricolo senza duplicarlo come nuova fonte di verità.

---

## 7. Registrare un'osservazione dalla pratica

**Trigger:** durante o dopo l'attuazione il docente rileva un problema o un punto di forza curricolare.

**Passi:**
1. Dalla progettazione o dalla `CurriculumUnit` il docente sceglie “Segnala per il riesame”.
2. Registra un segnale professionale (`TOO_EARLY`, `MISSING_PREREQUISITE`, `DUPLICATED`, ecc.) e, se necessario, una nota non contenente dati personali degli alunni.
3. L'osservazione diventa `ImplementationObservation`.
4. Arena aggrega segnali ricorrenti.
5. L'aggregazione può generare o suggerire un `RevisionTrigger` / `CurriculumReviewCase` mirato.

**Successo:** la pratica alimenta il miglioramento senza modifiche automatiche al curricolo.

---

## 8. Nuova norma, linea guida, nota o circolare

**Trigger:** viene acquisita una nuova fonte esterna potenzialmente rilevante.

**Passi:**
1. La fonte entra nel Fascicolo come candidata, senza autorità inferita dalla sola presenza.
2. Vengono verificati identità, provenienza e localizzatore.
3. Arena qualifica applicabilità per ordine, coorte, disciplina/asse e decorrenza.
4. Nasce un `RevisionTrigger` di tipo `EXTERNAL_NORMATIVE`.
5. Il trigger registra il master corrente e l'ambito potenzialmente interessato.
6. Viene eseguita un'analisi di impatto sul master corrente.
7. Solo gli elementi interessati diventano `CurriculumReviewCase`.
8. Il ciclo riparte dal `Quadro applicabile` e dalla `Validazione professionale`.

**Successo:** una nuova norma può riaprire il processo senza creare una baseline parallela e senza cambiare automaticamente il curricolo.

---

## 9. Esigenza dell'Istituto

**Trigger:** Collegio, Dipartimento, commissione, referente o altra sede competente formula un'esigenza motivata.

**Passi:**
1. Viene registrata motivazione, proponente e ambito.
2. Il trigger viene classificato `INSTITUTE_NEED`.
3. Arena esplicita che non si tratta di fonte nazionale.
4. Si analizza l'impatto sulle `CurriculumUnit` interessate.
5. Si aprono soltanto i casi necessari.
6. Si percorrono validazione professionale, riesame verticale ed eventuale iter istituzionale secondo autorità e stato.

**Successo:** l'Istituto può evolvere il proprio curricolo senza confondere autonomia professionale con prescrizione normativa.

---

## 10. Riesame periodico

**Trigger:** scadenza annuale/pluriennale definita dall'Istituto.

**Passi:**
1. Arena crea `RevisionTrigger` di tipo `PERIODIC_REVIEW`.
2. Mostra solo unità con questioni aperte, osservazioni ricorrenti, versioni normative cambiate o necessità di verifica.
3. Le unità stabili non vengono forzatamente riaperte senza una ragione registrata.
4. Gli esiti seguono il normale ciclo professionale.

**Successo:** il riesame periodico non diventa una riscrittura rituale dell'intero curricolo.

---

## 11. Segnale dalla pratica come trigger

**Trigger:** più `ImplementationObservation` convergono oppure un professionista registra una motivazione sufficientemente forte.

**Passi:**
1. Arena qualifica il segnale come `PRACTICE_SIGNAL`.
2. Verifica ricorrenza, ambito e unità interessate.
3. Non usa dati personali degli alunni come requisito del riesame.
4. Se il segnale è qualificato, apre un `RevisionTrigger` collegato al master corrente.
5. Il ciclo rientra dal `Quadro applicabile`.

**Successo:** la pratica può attivare il riesame senza trasformare impressioni isolate in modifiche automatiche.

---

## 12. Verificare una fonte o una decisione

**Trigger:** un utente chiede “da dove viene?” o deve controllare una scelta.

**Passi:**
1. Apre `FASCICOLO` o “Vedi fonte” dall'oggetto corrente.
2. Vede prima la relazione con il master.
3. Poi fonte/repertorio, stato di verifica e localizzatore.
4. Solo al livello tecnico compaiono Drive ID, fingerprint, ricevute e storico.

**Successo:** la tracciabilità è completa ma non affolla il lavoro ordinario.

---

## 13. Recupero e continuità

Per tutti i flow conseguenti:
- una bozza non diventa esito senza commit esplicito;
- uscire da una sessione non deve perdere lavoro senza avviso;
- refresh/re-entry devono ricostruire oggetto, stato e fase compatibili;
- la fase `CONFRONTA` non può essere ripristinata se la condivisione persistita non corrisponde più all'orientamento personale corrente;
- una versione/fingerprint diversa deve impedire il riuso implicito di una decisione precedente;
- errori tecnici non devono cambiare lo stato umano o istituzionale;
- un `RevisionTrigger` deve sempre restare legato all'identità/versione del master da cui è nato.

---

## Criterio complessivo di accettazione

I flow sono conformi quando il docente può svolgere il proprio compito senza conoscere pipeline, gate, membership IDs o struttura del repository; le autorità restano separate; la condivisione è verificabile e non simulabile localmente; le fonti sono verificabili; il curricolo alimenta la progettazione reale; nuove norme, esigenze d'Istituto e osservazioni dalla pratica possono riaprire il processo in modo mirato e tracciato.
