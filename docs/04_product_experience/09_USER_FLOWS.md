# 09 — USER FLOWS CRITICI

**Product vision:** `ARENA-PRODUCT-VISION@1.0.0`  
**Lifecycle:** `CURRICULUM_LIFECYCLE@1.2.0`  
**Stato:** `CANONICAL_TARGET_FLOWS`  
**Data:** 2026-09-07

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

**Trigger:** un docente salva una programmazione, genera una UDA o collega un'attività didattica.

**Passi:**
1. Arena identifica il master corrente e il contesto curricolare applicabile: ordine, classe/fascia e disciplina/campo.
2. Costruisce una chiave stabile di riferimento comprendente identità e versione del master.
3. Crea `DidacticBinding` per il target (`annual-planning`, `uda`, in seguito `learning-activity`).
4. Il binding viene salvato insieme all'artefatto didattico e non ricostruito dai testi copiati.
5. Se il master non è vigente, Arena assegna `DRAFT_PLANNING_REFERENCE` e mostra **Riferimento di lavoro**.
6. Il dettaglio UDA mostra master/versione e contesto al livello ordinario; chiave e stato tecnico restano sotto `Tracciabilità del collegamento`.
7. Traguardi, obiettivi ed evidenze copiati nella bozza restano snapshot operativi e non diventano una seconda fonte di verità.
8. Per Educazione civica, gli incrementi successivi collegano risultato civico, nucleo, attività, ore, responsabilità ed evidenza.

**Successo:** la progettazione è ricostruibile rispetto al curricolo senza duplicarlo, e un master non vigente non viene presentato come adottato.

**Confine:** `DidacticBinding != AdoptionReceipt` e `DRAFT_PLANNING_REFERENCE != IN_FORCE_CURRICULUM_REFERENCE`.

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
4. Se il segnale è qualificato, registra un `RevisionTrigger` collegato al master corrente.
5. Il trigger non apre ancora automaticamente un `CurriculumReviewCase`.
6. Il ciclo rientra dal `Quadro applicabile` quando un caso mirato viene aperto esplicitamente.

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
- un `DidacticBinding` deve essere recuperato dall'artefatto salvato e non inferito dai testi della bozza;
- un binding verso un master non vigente resta `DRAFT_PLANNING_REFERENCE` anche dopo refresh/re-entry;
- una `ImplementationObservation` resta collegata al `DidacticBinding` e alla stessa identità/versione curricolare da cui nasce;
- errori tecnici non devono cambiare lo stato umano o istituzionale;
- un `RevisionTrigger` deve sempre restare legato all'identità/versione del master da cui è nato.

---

## 14. Proiezione corrente del Fascicolo

Nel runtime della candidata Beta, il flow di verifica mantiene la chiave tecnica interna `fonti` per compatibilità, ma la destinazione utente è `Fascicolo`.

Regole di attuazione:
- `/fascicolo` è la route pubblica canonica;
- `/fonti` e `/settings` restano deep-link storici leggibili e non vengono più emessi dalla navigazione nuova;
- il Fascicolo non compare nella bottom navigation mobile primaria;
- su desktop e nel drawer mobile è collocato nel livello secondario `Supporto`;
- un'attività concreta di verifica fonte può aprire direttamente il Fascicolo senza trasformarlo in una fase obbligatoria del ciclo professionale;
- Home e Curricolo possono offrire “Apri il Fascicolo” o “Vedi fonte” come azioni contestuali.

Questa proiezione non modifica l'autorità delle fonti, il master curricolare o lo stato di validazione.

---

## 15. Proiezione corrente del DidacticBinding

Nel primo incremento H5 della candidata Beta:
- `saveProgDraft` persiste il binding della programmazione annuale;
- `handleGenerateUda` salva il binding dentro la nuova UDA;
- la chiave di riferimento include master/versione, ordine, classe/fascia e disciplina/campo;
- il dettaglio UDA mostra lo stato del collegamento con divulgazione progressiva;
- `CAN-CURR-MASTER-00@1.3` non vigente produce `WORKING_BASELINE_NOT_IN_FORCE` e `DRAFT_PLANNING_REFERENCE`;
- la bozza conserva traguardi, obiettivi ed evidenze per il lavoro didattico, ma questi testi non sostituiscono il master canonico.

---

## 16. Proiezione corrente di ImplementationObservation

Nel primo incremento H6 della candidata Beta:
- il dettaglio UDA collegato al curricolo espone **Riesame dalla pratica**;
- il docente registra uno dei segnali professionali previsti dal lifecycle, senza punteggi o graduatorie;
- ogni osservazione conserva il riferimento al `DidacticBinding`, alla `CurriculumUnit`, all'identità/versione del master e alla UDA da cui nasce;
- la nota professionale è facoltativa, salvo il segnale `OTHER`, ed è limitata a 600 caratteri;
- prima della registrazione il docente deve confermare che l'osservazione non contiene nomi, voti, diagnosi o altri dati personali degli alunni;
- l'osservazione viene salvata con la UDA e resta `RECORDED_FOR_AGGREGATION`;
- l'aggregazione dei segnali è disponibile come conteggio descrittivo e non produce un punteggio pedagogico;
- una singola osservazione non apre automaticamente un riesame e non modifica il curricolo.

---

## 17. Proiezione corrente della qualificazione PRACTICE_SIGNAL

Nel primo incremento `REVISION_TRIGGER_QUALIFICATION` della candidata Beta:
- il pannello di qualificazione compare soltanto quando esiste almeno una `ImplementationObservation` collegata alla stessa `CurriculumUnit`;
- Arena qualifica automaticamente la **condizione di ricorrenza**, ma non apre alcun caso: sono necessari almeno due segnali problematici dello stesso tipo sulla stessa unità curricolare;
- i segnali positivi `ADEQUATE` ed `EFFECTIVE_VERTICAL_LINK` non vengono trasformati automaticamente in motivi di riesame problematico;
- anche con una sola osservazione il docente può qualificare il motivo registrando una **motivazione professionale esplicita**;
- la motivazione è limitata a 800 caratteri e non deve contenere dati degli alunni;
- il `RevisionTrigger` persistito conserva osservazioni di origine, artefatti didattici, ambito applicabile, unità curricolare, master/versione e base di qualificazione;
- il trigger rientra logicamente da `H1_APPLICABLE_CURRICULUM`, ma **non apre automaticamente** un `CurriculumReviewCase`;
- `automaticCurriculumChange = false`, `automaticReviewCaseOpening = false` e `parallelCurriculumBaselineCreation = false` sono invarianti del dominio;
- il linguaggio docente resta «Motivo di riesame qualificato», non il nome tecnico dell'oggetto.

---

## 18. Proiezione corrente delle altre cause RevisionTrigger

Nel secondo incremento `REVISION_TRIGGER_QUALIFICATION` della candidata Beta, le tre cause ulteriori riusano le superfici già esistenti:
- `EXTERNAL_NORMATIVE` parte dal **Fascicolo** esclusivamente da una fonte già qualificata nel repertorio istituzionale; l'azione **Valuta l’impatto sul curricolo** apre la superficie **Riesame** con la fonte preimpostata;
- una fonte personale o soltanto verificata localmente non può essere promossa implicitamente a fonte normativa;
- nel Riesame l'utente deve registrare una valutazione esplicita dell'impatto della fonte sull'ordine, classe/fascia e disciplina/campo correnti;
- `INSTITUTE_NEED` nasce nella stessa superficie **Riesame**, richiede sede/atto interno e motivazione esplicita, ed è registrata obbligatoriamente come origine **non nazionale**;
- `PERIODIC_REVIEW` nasce nella stessa superficie **Riesame**, richiede ciclo di verifica e una ragione concreta: il semplice decorso del tempo non riapre unità stabili;
- tutte e tre le cause usano la stessa `CurriculumUnit` del contesto corrente, la stessa identità/versione del master e lo stesso rientro logico da `H1_APPLICABLE_CURRICULUM`;
- la qualificazione persiste il `RevisionTrigger`, ma non apre automaticamente un `CurriculumReviewCase`, non modifica il master e non crea una baseline parallela;
- non viene introdotta alcuna nuova route o superficie primaria: Fascicolo resta servizio di supporto e Riesame resta l'unica superficie professionale di qualificazione delle cause non didattiche.

**Confine:** `fonte/esigenza/scadenza != RevisionTrigger qualificato != CurriculumReviewCase != CurriculumChange != InstitutionalDecision`.

---

## Criterio complessivo di accettazione

I flow sono conformi quando il docente può svolgere il proprio compito senza conoscere pipeline, gate, membership IDs o struttura del repository; le autorità restano separate; la condivisione è verificabile e non simulabile localmente; le fonti sono verificabili; il curricolo alimenta la progettazione reale mediante binding versionati; un master non vigente resta riconoscibile come riferimento di lavoro; la pratica produce osservazioni professionali collegate e prive di dati personali degli alunni; ogni motivo di riesame richiede la qualificazione prevista dalla propria origine e non apre automaticamente un caso; nuove norme, esigenze d'Istituto, riesami periodici e osservazioni dalla pratica possono riaprire il processo in modo mirato e tracciato senza creare baseline parallele.
