# 01 — INFORMATION ARCHITECTURE

**Product vision:** `ARENA-PRODUCT-VISION@1.0.0`  
**Lifecycle:** `CURRICULUM_LIFECYCLE@1.0.0`  
**Stato:** `CANONICAL_TARGET_ARCHITECTURE`  
**Data:** 2026-09-06

---

## 1. Scopo

L'architettura informativa di Arena non è organizzata intorno ai documenti o ai moduli tecnici. È organizzata intorno al **ciclo professionale del curricolo**.

La regola è:

> ciò che il docente deve fare è struttura primaria; ciò che il sistema deve sapere per rendere il lavoro affidabile è struttura di supporto.

---

## 2. Strati dell'architettura

### A. Strato di lavoro umano

È l'unico strato che deve dominare la navigazione ordinaria.

1. **Il mio lavoro** — mostra soltanto i compiti realmente pertinenti alla persona e allo stato corrente.
2. **Curricolo** — consulta il master canonico e apre i casi di lavoro pertinenti.
3. **Progettazione** — collega il curricolo a programmazione annuale, UDA e attività tramite `DidacticBinding`.
4. **Riesame** — raccoglie criticità verticali, `ImplementationObservation`, `RevisionTrigger` e casi di revisione mirata.

### B. Strato istituzionale proiettato

Non è navigazione universale. Le azioni istituzionali compaiono solo quando ruolo, membership, competenza e stato del processo le rendono legittime.

Esempi:
- confronto e registrazione dell'esito professionale del gruppo;
- riesame verticale;
- verifica di readiness;
- decisione istituzionale;
- adozione e relativa ricevuta.

### C. Strato di fascicolo e supporto

È secondario e progressivamente divulgato:
- fonti normative e istituzionali;
- repertorio fonti;
- versioni e fingerprint;
- matrici di conformità;
- registri delle decisioni;
- ricevute;
- export e backup;
- storico tecnico e archivi legacy.

Questo strato deve essere raggiungibile, ma non deve interrompere il lavoro ordinario.

---

## 3. Modello di oggetti

### Oggetto canonico

`CurriculumUnit`

Dimensioni minime:
- ordine / età / classe / coorte;
- disciplina / campo / asse trasversale;
- nucleo o dominio;
- requisito nazionale o fonte specifica;
- annualizzazione d'Istituto;
- competenze o traguardi;
- obiettivi;
- conoscenze essenziali;
- evidenze osservabili;
- raccordi verticali precedente/successivo;
- provenienza;
- versione o fingerprint;
- stato di validazione.

### Oggetti derivati

- `CurriculumReviewCase`
- `ProfessionalContribution`
- `TeamProfessionalOutcome`
- `VerticalReviewOutcome`
- `InstitutionalDecision`
- `AdoptionReceipt`
- `DidacticBinding`
- `ImplementationObservation`
- `RevisionTrigger`

Nessuno di questi oggetti sostituisce la `CurriculumUnit`; la referenzia e ne conserva l'identità/versione.

---

## 4. Relazioni canoniche

```text
Source / Applicable rule
        ↓
CurriculumUnit
        ↓
CurriculumReviewCase
        ↓
ProfessionalContribution
        ↓
TeamProfessionalOutcome
        ↓
VerticalReviewOutcome
        ↓
InstitutionalDecision
        ↓
AdoptionReceipt
        ↓
DidacticBinding
        ↓
Programmazione / UDA / attività
        ↓
ImplementationObservation
        ↓
RevisionTrigger / targeted CurriculumReviewCase
```

La freccia rappresenta dipendenza e tracciabilità, non promozione automatica di autorità.

---

## 5. CurriculumWorkSession

Le superfici oggi separate per contributo, condivisione, team e coordinamento convergono in una sola sessione progressiva:

`EXAMINE → SHARE → COMPARE → RECORD_TEAM_OUTCOME`

Regole:
- un solo stadio dominante;
- gli stadi futuri sono nascosti finché non diventano pertinenti;
- uno stadio completato si compatta;
- lo scroll non è una transizione di fase;
- il docente privo di ulteriori responsabilità termina a `SHARE`;
- `COMPARE` e `RECORD_TEAM_OUTCOME` compaiono solo quando prerequisiti e autorità sono soddisfatti.

---

## 6. RevisionTrigger

Un `RevisionTrigger` apre il riesame senza modificare il curricolo.

Tipi:
- `EXTERNAL_NORMATIVE` — legge, decreto, Indicazioni, linee guida, nota, circolare;
- `INSTITUTE_NEED` — esigenza motivata interna;
- `PRACTICE_SIGNAL` — osservazioni aggregate dalla pratica;
- `PERIODIC_REVIEW` — riesame programmato.

Campi minimi:
- identità del trigger;
- origine;
- fonte o motivazione;
- data;
- applicabilità;
- ambito curricolare potenzialmente interessato;
- stato di qualificazione;
- eventuali `CurriculumReviewCase` generati.

Le fonti esterne richiedono qualificazione della fonte e dell'applicabilità. Le esigenze interne devono restare esplicitamente qualificate come scelte o bisogni d'Istituto.

---

## 7. Progettazione didattica

`DidacticBinding` collega una progettazione a una o più `CurriculumUnit` specifiche e versionate.

Target ammessi:
- programmazione annuale;
- UDA;
- attività di apprendimento.

Regole:
- nessuna copia del curricolo come nuova fonte di verità;
- il binding conserva identità/versione;
- la copertura della progettazione non è un punteggio del docente;
- Educazione civica richiede binding reale fra risultato, attività, ore, responsabilità ed evidenza.

---

## 8. Riesame dalla pratica

`ImplementationObservation` non contiene necessariamente dati personali degli alunni.

Segnali previsti:
- `ADEQUATE`
- `TOO_EARLY`
- `TOO_LATE`
- `DUPLICATED`
- `MISSING_PREREQUISITE`
- `WEAK_EVIDENCE`
- `UNSUSTAINABLE_LOAD`
- `EFFECTIVE_VERTICAL_LINK`
- `OTHER`

L'aggregazione può suggerire o aprire un caso di riesame; la modifica automatica del curricolo è vietata.

---

## 9. Autorità

L'architettura deve preservare:

`personal profile != verified role`  
`discipline competence != institutional authority`  
`ProfessionalContribution != TeamProfessionalOutcome`  
`TeamProfessionalOutcome != InstitutionalDecision`  
`InstitutionalDecision != AdoptionReceipt`  
`technical PASS != human/institutional state transition`

Ogni superficie deve derivare le azioni disponibili da identità, membership, competenza e stato, non da una selezione cosmetica di ruolo.

---

## 10. Fonti e Fascicolo

Le fonti non sono una fase primaria del lavoro. Sono un servizio di supporto del `Quadro applicabile` e restano consultabili nel `Fascicolo`.

Ordine logico:
1. master corrente;
2. catena documentale;
3. repertorio fonti;
4. fonte specifica o copia istituzionale qualificata;
5. archivio locale/legacy subordinato.

La presenza di una fonte non attribuisce autorità.

---

## 11. Migrazione dall'architettura precedente

La precedente IA basata su ambienti e tab (`dashboard`, `curricolo`, `revisione`, `fonti`, `processo`, `esportazioni`, ecc.) è uno **snapshot storico di implementazione** e non definisce più la direzione di prodotto.

Convergenza target:

| Superfici precedenti | Destinazione |
|---|---|
| Dashboard / Home | Il mio lavoro |
| Consulta curricolo | Curricolo |
| Revisione personale | CurriculumWorkSession |
| Condivisione | CurriculumWorkSession |
| Lavoro del team | CurriculumWorkSession |
| Coordinamento | CurriculumWorkSession / azione proiettata |
| Fonti | Fascicolo |
| Processo / Delibera | azioni istituzionali proiettate |
| Progettazione / UDA | Progettazione con DidacticBinding |
| feedback/review non strutturato | Riesame con ImplementationObservation / RevisionTrigger |

---

## 12. Criteri di accettazione

L'architettura è conforme quando:
- il docente vede una sola gerarchia primaria;
- il Fascicolo non compete con il lavoro;
- il processo istituzionale non è navigazione universale;
- la sessione curricolare non duplica avanzamenti;
- la progettazione referenzia il curricolo canonico;
- il riesame può essere innescato da norme future, esigenze d'Istituto, pratica o periodicità;
- nessun trigger o segnale modifica automaticamente il master;
- la catena di autorità resta distinguibile in ogni passaggio.
