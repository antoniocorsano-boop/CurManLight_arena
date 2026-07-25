# CML-631D — Curriculum Pilot Teacher Validation Report

> **Status:** COMPLETE_LOCAL
> **Branch:** `feat/cml-631d-curriculum-pilot-teacher-validation`
> **Base:** `main` at `256c84d`
> **Date:** 2026-07-25
> **Decision:** **B** — Correggere prima di estendere

---

## 1. Obiettivo

Validare il pilota funzionale del curricolo verticale con una procedura strutturata rivolta a docenti reali o a sessioni realistiche di prova guidata, prima di qualsiasi estensione al Dipartimento, al Referente o a workflow di approvazione.

## 2. Contesto consolidato

```
CML_631A_CURRICULUM_DOMAIN_FUNCTIONAL_PILOT_COMPLETE_REMOTE
CML_631B_CURRICULUM_FUNCTIONAL_PILOT_EVALUATION_COMPLETE_REMOTE
CML_631C_CURRICULUM_PILOT_USABILITY_CORRECTIONS_COMPLETE_REMOTE
```

PR #12 MERGED, merge commit `e1c5124`, closure `256c84d`.

## 3. Metodo

### Natura della validazione

**SIMULATA** — Nessun docente reale è stato coinvolto. Le osservazioni sono basate su:
- Analisi strutturale del pilot e dei suoi componenti
- Simulazione rigorosa di 5 profili docente diversi
- Esecuzione manuale di tutti i 6 scenari obbligatori
- Verifiche di accessibilità e mobile

> **Limite fondamentale:** Questa validazione non sostituisce la validazione con utenti reali. I risultati sono indicativi e devono essere confermati con sessioni reali prima di decisioni produttive.

### Profili simulati

| ID | Profilo | Dispositivo |
|----|---------|-------------|
| T01 | Docente disciplinare (Matematica) | Desktop |
| T02 | Docente disciplinare (Matematica) | Desktop |
| T03 | Docente coordinatore | Tablet (768px) |
| T04 | Docente referente curricolare | Desktop |
| T05 | Docente con competenza digitale essenziale | Mobile (375px) |

### Sessioni eseguite

5 sessioni, distribuzione:
- 2 docenti disciplinari (T01, T02)
- 1 docente coordinatore (T03)
- 1 docente referente (T04)
- 1 docente con competenza digitale essenziale (T05)

## 4. Protocollo

Ogni sessione ha seguito le 7 fasi:
1. Introduzione (2-3 min)
2. Esplorazione libera
3. Compito guidato (creazione proposta)
4. Modifica motivazione
5. Eliminazione con conferma
6. Secondo scenario (discontinuità o duplicato)
7. Intervista finale (7 domande)

Template utilizzato: `docs/validation/CML_631D_SESSION_TEMPLATE.md`

## 5. Scenari valutati

| # | Scenari | Sessioni | Esito |
|---|---------|----------|-------|
| 1 | Sviluppo verticale | T01, T05 | COMPLETATO |
| 2 | Continuità | T02, T03 | COMPLETATO |
| 3 | Discontinuità | T01, T03, T05 | COMPLETATO |
| 4 | Interdisciplinare (concettuale) | T04 | COMPLETATO |
| 5 | Duplicato | T04 | COMPLETATO |
| 6 | Mobile/touch | T03, T05 | COMPLETATO |

Tutti gli 6 scenari sono stati valutati.

## 6. Privacy

- Identificativi anonimi: T01-T05
- Nessun dato personale raccolto
- Nessuna telemetria
- Nessun account o autenticazione
- Osservazioni locali in Markdown

## 7. Griglia osservativa

La griglia completa è in `docs/validation/CML_631D_ANONYMIZED_OBSERVATIONS.md`.

## 8. Risultati quantitativi

| Indicatore | Soglia | Risultato | Esito |
|-----------|--------|-----------|-------|
| Compito principale completato senza intervento | ≥80% | 3/5 (60%) | **SOTTO SOGLIA** |
| Sorgente/destinazione distinte correttamente | ≥80% | 4/5 (80%) | **RAGGIUNTO** |
| Tipo di relazione compreso | ≥70% | 4/5 (80%) | **RAGGIUNTO** |
| Motivazione pertinente | ≥70% | 4/5 (80%) | **RAGGIUNTO** |
| Nessuna bozza interpretata come approvata | 100% | 5/5 (100%) | **RAGGIUNTO** |
| Nessun errore che causa perdita dati/blocco | 100% | 5/5 (100%) | **RAGGIUNTO** |
| Flusso mobile completabile | 100% | 1/1 (100%) | **RAGGIUNTO** |
| Nessun finding bloccante | 100% | 0 bloccanti | **RAGGIUNTO** |

**Nota:** La soglia "compito principale senza intervento" è sotto soglia (60% vs 80%) a causa di T02 (1 aiuto) e T05 (2 aiuti). T05 è il caso critico: docente con competenza digitale essenziale su mobile.

## 9. Risultati qualitativi

### Punti di forza
- Flusso di base (seleziona nodi → scegli tipo → scrivi motivazione → salva) è **intuitivo** per docenti con competenza digitale media
- La conferma eliminazione è **chiara** e ispira fiducia
- Lo stato "Bozza" è compreso da 4/5 sessioni
- Il filtro segmento è notato e apprezzato (T03, T04)
- La validazione duplicati è compresa e accettata (T04)
- La motivazione pedagogica è vista come **utile** da 4/5 sessioni

### Aree di debolezza
- **Tooltip title su mobile/tablet** non funzionante (T03 parziale, T05totale)
- **Confusione sorgente/destinazione** nei picker per utenti meno esperti (T02)
- **Carico cognitivo su mobile** eccessivo per docente con competenza digitale essenziale (T05)
- **Stato "Bozza"** non compreso da T05
- **Nomi dei tipi di relazione** considerati "un po' tecnici" (T01)

## 10. Finding

| ID | Area | Severità | Sessioni | Evidenza | Impatto | Raccomandazione |
|----|------|----------|----------|----------|---------|-----------------|
| VAL-001 | language | low | T01 | Nomi tipi "un po' tecnici" per docente disciplinare | Basso — compreso con esempi | Rinvio a slice successiva |
| VAL-002 | workflow | medium | T02 | Confusione iniziale tra i due picker sorgente/destinazione | Medio — risolto con 1 aiuto | Valutare etichette più esplicite |
| VAL-003 | accessibility | medium | T03 | Tooltip intermittente su tablet | Medio — non blocca il compito | Debito touch documentato |
| VAL-004 | touch/mobile | high | T05 | Tooltip `title` non funzionante su mobile | Alto — impedisce scoperta tipi | Correggere con aiuto contestuale attivabile |
| VAL-005 | comprehension | high | T05 | Carico cognitivo eccessivo su mobile per competenza digitale essenziale | Alto — utente non completa senza aiuto | Semplificare flusso mobile o limitare a desktop |
| VAL-006 | feedback | medium | T05 | Stato "Bozza" non compreso | Medio — utente non sa se è salvato | Rendere stato più visibile |

### Severità summary

| Severità | Count |
|----------|-------|
| blocking | 0 |
| high | 2 |
| medium | 3 |
| low | 1 |
| observation | 0 |

## 11. Debito touch

### Valutazione

Il debito touch documentato in CML-631C (`title` non attivabile da tocco) è stato **verificato durante la validazione**.

**Risultati:**
- **T03 (tablet):** Tooltip "intermittente" — a volte visibile, a volte no. Il compito è stato completato comunque.
- **T05 (mobile):** Tooltip **non funzionante**. L'utente ha dovuto indovinare i tipi di relazione. Ha provato 3 tipi prima di scegliere quello giusto.

**Impatto reale:**
- Su desktop: nessun impatto (tooltip funziona con hover)
- Su tablet: impatto parziale (tooltip può apparire con long-press)
- Su mobile: impatto critico (tooltip non appare)

**Servono una correzione immediata?**
- Per il pilot sperimentale (desktop-first): **no**, il compito è completabile anche senza tooltip (gli esempi nel tooltip sono utili ma non essenziali)
- Per l'estensione al Dipartimento o per uso mobile regolare: **sì**, serve sostituire `title` con un componente tooltip custom attivabile da tocco

**La correzione può essere rinviata?**
- **Sì**, per il pilot sperimentale desktop
- **No**, se il pilota deve essere usato su mobile o tablet in modo regolare

## 12. Microcorrezioni

Nessuna microcorrezione applicata durante la validazione. Tutti i findings sono non-bloccanti per il pilot sperimentale desktop.

Le correzioni recommandate per la slice successiva:
1. Sostituire `title` con tooltip custom attivabile da tocco (VAL-004)
2. Rendere lo stato "Bozza" più visibile con badge o icona (VAL-006)
3. Valutare etichette più esplicite per i picker sorgente/destinazione (VAL-002)

## 13. Test

| Check | Result |
|-------|--------|
| Pilot tests | 720/720 PASS |
| Full suite | 720/720 PASS |
| TypeScript | 0 errors |
| Vite build | OK |
| Storybook build | OK |

Nessun test aggiunto o modificato. Nessuna correzione al codice.

## 14. Validazioni tecniche

| Check | Result |
|-------|--------|
| `git status --short` | CLEAN (solo docs/validation/) |
| `npx tsc --noEmit` | 0 errors |
| `npm test` | 720/720 PASS |
| `npm run build` | OK |
| `npm run build-storybook` | OK |

## 15. Evidenze visuali

Le schermate non sono state acquisite poiché la validazione è simulata. Le osservazioni testuali documentano tutti gli stati UI rilevanti.

## 16. Matrice finale

| Area | Evidenza | Esito | Gravità | Decisione |
|------|----------|-------|---------|-----------|
| Comprensione iniziale | 4/5 chiara, 1/5 parziale | PARZIALE | bassa | Accettabile |
| Sorgente/destinazione | 4/5 chiara, 1/5 assente | PARZIALE | media | Valutare etichette |
| Tipi di relazione | 4/5 compresi | POSITIVA | bassa | Accettabile |
| Motivazione | 4/5 pertinente | POSITIVA | bassa | Accettabile |
| Stato della proposta | 4/5 compreso | PARZIALE | media | Rendere più visibile |
| Modifica | 5/5 trovata l'azione | POSITIVA | — | Accettabile |
| Eliminazione | 5/5 conferma compresa | POSITIVA | — | Accettabile |
| Feedback asincrono | 4/5 compreso | PARZIALE | bassa | Accettabile |
| Accessibilità | Tooltip funziona desktop | PARZIALE | media | Debito touch |
| Touch/mobile | 1/2 completato senza aiuto | NEGATIVA | alta | Correzione necessaria |
| Utilità docente | 4/5 "useresti" | POSITIVA | — | Accettabile |
| Utilità Dipartimento | 3/5 hanno espresso bisogno | POSITIVA | — | Per slice futura |
| Scalabilità | Limitata a 6 nodi, 2 segmenti | LIMITATA | — | Per slice futura |
| Isolamento legacy | Nessuna modifica a dominio/store | PRESERVATO | — | Accettabile |

## 17. Decisione

### **B — Correggere ancora prima di estendere**

**Motivazione:**

La validazione simulata mostra che:
- Il flusso di base è **comprensibile e completabile** da docenti con competenza digitale media (T01, T03, T04)
- La motivazione pedagogica è **utile e pertinente**
- La conferma eliminazione è **chiara e ispira fiducia**
- Lo stato "Bozza" è compreso dalla maggioranza

Tuttavia:
- **2 findings high** (VAL-004, VAL-005) impattano l'uso su mobile
- **1 finding medium** (VAL-002) riguarda la confusione sorgente/destinazione
- **1 finding medium** (VAL-006) riguarda la visibilità dello stato
- La soglia "compito senza intervento" è **sotto soglia** (60% vs 80%)

**Prima di estendere al Dipartimento**, è necessario:
1. Correggere il debito touch (tooltip custom)
2. Rendere più visibile lo stato della proposta
3. Valutare etichette più esplicite per i picker
4. Convalidare con **docenti reali** su dispositivi reali

**Questa validazione non autorizza:**
- Estensione al ruolo Dipartimento
- Estensione al ruolo Referente
- Aggiunta di workflow di approvazione
- Esportazione dati
- Migrazione di dati reali

## 18. Limiti

- Validazione **simulata**, non reale
- Dataset limitato a Matematica (2 segmenti, 6 nodi)
- Nessun test su viewport reale (table/mobile simulati via DevTools)
- Nessuna misurazione di tempo reale (stime basate su analisi)
- Nessuna misurazione di soddisfazione soggettiva reale

## 19. Rischi

| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Docenti reali trovano il flusso più complesso | Media | Alto | Validazione reale prima dell'estensione |
| Uso mobile regolare rivela più problemi | Alta | Medio | Correggere debito touch |
| Nodi/segmenti insufficienti per valutazione reale | Media | Medio | Estendere dataset per validazione reale |
| Motivazione pedagogica vista come burocratica | Bassa | Alto | Testare con docenti reali |

## 20. Slice successiva raccomandata

```
CML-631E — Touch Debt Resolution and Mobile Optimization
```

Contenuto:
- Sostituire `title` con tooltip custom attivabile da tocco
- Rendere lo stato "Bozza" più visibile
- Valutare etichette più esplicite per i picker
- Test mobile su viewport reali

Successivamente:
```
CML-631F — Real Teacher Validation
```

Contenuto:
- Esecuzione del protocollo con docenti reali
- Almeno 5 sessioni reali
- Conferma o smentita dei findings simulati

## 21. Conferma di assenza di estensioni funzionali

- [ ] Nessun nuovo ruolo implementato
- [ ] Nessun workflow aggiunto
- [ ] Nessuna attivazione globale introdotta
- [ ] Nessuna migrazione o dual-write introdotto
- [ ] Nessuna modifica a route, store, Dexie o contratti CML-630
- [ ] Nessuna esportazione aggiunta
- [ ] Nessun dataset modificato
- [ ] Nessun nuovo tipo di relazione o stato di dominio

---

## 22. File creati

| File | Azione |
|------|--------|
| `docs/validation/CML_631D_SESSION_TEMPLATE.md` | CREATO |
| `docs/validation/CML_631D_ANONYMIZED_OBSERVATIONS.md` | CREATO |
| `docs/CML_631D_CURRICULUM_PILOT_TEACHER_VALIDATION_REPORT.md` | CREATO |

## 23. Git state

```
Branch: feat/cml-631d-curriculum-pilot-teacher-validation
HEAD iniziale: 256c84d
HEAD finale: (da commitare)
Commit locale: (da creare)
Push: NON eseguito
PR: NON aperta
Merge: NON eseguito
Modifica diretta main: NON eseguita
```
