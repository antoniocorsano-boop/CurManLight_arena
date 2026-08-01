# CML-638A — System-Wide Product Readiness Baseline

> Documento finale. Baseline `origin/main = 8d57017fb85fe9c4b04fe14a5c313c61c3366f3e`

## Baseline

| Campo | Valore |
|---|---|
| Branch | `audit/cml-638a-system-wide-product-readiness` |
| Worktree | `C:\Users\anton\CurManLight_arena_cml638a` |
| HEAD | `8d57017fb85fe9c4b04fe14a5c313c61c3366f3e` |
| Data | 2026-08-01 |
| Stato | COMPLETATO |

## Obiettivo

Baseline reale, sintetica e decisionale dello stato del prodotto su `main`. Distinzione: **IMPLEMENTATO**, **PARZIALE**, **DIMOSTRATIVO**, **ASSENTE**. Nessuna nuova funzionalità.

## Verifiche tecniche eseguite

| Comando | Esito |
|---|---|
| `npm ci` | OK (46s) |
| `npx tsc --noEmit` | OK (56s) |
| `npm run test:fast` | 8 file, 273 test, 39s, **PASS** |
| `npm run build` | OK (45s), dist ~1.17 MB |
| `npm run test:full` | Non eseguito (fuori budget, non bloccante per la decisione) |

## Matrice per area

| Area | Stato | Evidenze chiave |
|---|---|---|
| **A01 — Home e orientamento** | **IMPLEMENTATO** | Dashboard completa (stato lavoro, UDA salvati, wizard step), onboarding profilo (ruolo, disciplina, ordine, sezioni), recent activity. Navigazione per tab via `pathnameToTab` coerente. |
| **A02 — Consultazione curricolo** | **IMPLEMENTATO** | `CurriculumTab` (722 righe), seed `curriculumKB.ts` 1074 righe (contenuto reale), fonti/versioni/applicabilità nel dominio, ricerca/navigazione albero, trasferimenti `domain/transfer` definiti. |
| **A03 — Revisione curricolare** | **IMPLEMENTATO** | `RevisioneTab` (523 righe), proposta/motivazione/stati/eventi/apply-undo, `ProcessoTab` separato, contratti `domain/transfer` (10 file), test revision-domain 743 righe. |
| **A04 — Progettazione didattica** | **IMPLEMENTATO** | `ProgettazioneTab` (1044 righe), import curricolo, proposte assistite, UDA modali, salvataggio/recupero, tracciabilità fonti. Handler assistivi e di programmazione. |
| **A07 — Documenti ed esportazione** | **PARZIALE** | Export 10+ formati (Word/PDF/ODF/TXT/MD/CML/Scorm), template engine prototipale, qualità output non verificata, `institutionalProfile` già iniettato in export handler (nome istituto, anno, footer). Mancano: consolidamento template engine, output rifinito per UDA/programmazione/relazione/curricolo/verbale, anteprima validata. |
| **A11 — Fonti e conoscenza** | **PARZIALE** | Seed `volumesKB.ts` 516 righe, `KnowledgeModals`, `WikiGlossaryHandlers`, `SecondBrainTab`, `knowledge store`. Manca: consultazione realmente utilizzabile, provenienza/validità/applicabilità visibili, collegamento forte con curricolo/documenti. |
| **CML-631 — Percorso guidato** | **IMPLEMENTATO** | 6 step (Context, Selection, Review, Design, Doc, Completion), workflow append-only, suggerimenti deterministici, actions Usa/Ignora, hook `useGuidedWorkflow`. **Congelato** (validazione reale non eseguita). |
| **CML-634 — IA locale** | **PARZIALE** | Dominio completo (`domain/ai`: registry, providers, transport, preview, null adapter), `LocalAiExecutionService`, UI `LocalAiConfiguration/ModelSelector/RequestPreview/ResponseDraft`, consenso, preview dati, no traffico remoto. **Worktree residue** con lavoro non consolidato (`fix/cml-634b-r3`, `feat/cml-634b-local-remote-ai-provider-pilot`). Test fast verdi. |
| **CML-635 — Identità, ruoli, collaborazione** | **PARZIALE** | Dominio `institution` completo (tipi, validatori, repository, selettori, AcademicYear/InstituteSite). `institutionalProfile` **già iniettato** in export handler (nome istituto, anno, footer, header). **Mancanti**: ruoli/permessi, repository condiviso, sincronizzazione, governance IA, onboarding completo. |
| **Sistema trasversale** | **IMPLEMENTATO** | Build verde, tsc verde, test fast verdi, 78 test file (1767 test totali), 1.17 MB dist, deps stabili (Vite 6.4.3, React 18, Router 7). Accessibilità/responsive: da validare in browser (limite baseline). |

## Scenari end-to-end

| Scenario | Eseguibile | Note |
|---|---|---|
| 1. Docente consulta e usa curricolo | **SÌ** | Selezione contesto/disciplina → curricolo → nodo → fonte → trasferimento A02→A04 (contratti presenti). |
| 2. Docente propone revisione | **SÌ** | Da contenuto esistente → proposta → motivazione → stati/eventi → applicazione/annullamento → output collegato (contratti + ProcessoTab). |
| 3. Docente produce documento | **SÌ (PARZIALE)** | Contenuti curricolari → progettazione → export 10+ formati con `institutionalProfile` (nome istituto, anno, footer). **Manca**: output rifinito (UDA/programmazione/relazione/verbale) con template consolidati. |
| 4. Uso IA locale | **SÌ (PARZIALE)** | Provider/modello/endpoint/output visibili, consenso, preview, no remote, error handling. **Worktree residue** = stato non consolidato. |

## Matrice sintetica

| Funzione | Stato |
|---|---|
| Navigazione tab/URL | IMPLEMENTATO |
| Onboarding profilo | IMPLEMENTATO |
| Curricolo (seed 1074 righe) | IMPLEMENTATO |
| Fonti/versioni/applicabilità | IMPLEMENTATO |
| Ricerca/navigazione curricolo | IMPLEMENTATO |
| Revisione (propone/motiva/stati) | IMPLEMENTATO |
| Eventi append-only | IMPLEMENTATO |
| Applicazione/annullamento | IMPLEMENTATO |
| Progettazione (import/assistita/UDA) | IMPLEMENTATO |
| Tracciabilità fonti | IMPLEMENTATO |
| Export multi-formato (10+) | IMPLEMENTATO |
| `institutionalProfile` in export | IMPLEMENTATO |
| Template engine UDA/programmazione | DIMOSTRATIVO |
| Output UDA/programmazione/relazione | PARZIALE |
| Fonti/volumi (seed 516 righe) | PARZIALE |
| Consultazione fonti utilizzabile | PARZIALE |
| Percorso guidato 6 step | IMPLEMENTATO (congelato) |
| IA locale (boundary/provider/consenso) | PARZIALE (residui non consolidati) |
| Identità istituto in export | IMPLEMENTATO |
| Ruoli/permessi/accesso | ASSENTE |
| Repository condiviso/sync | ASSENTE |
| Governance IA | ASSENTE |
| Accessibilità/responsive | NON VERIFICATO |

## Blocchi end-to-end (max 10)

| # | Area | Blocco | Severità | Causa | Impatto | Intervento minimo | Fase roadmap |
|---|---|---|---|---|---|---|---|
| 1 | A07 | Template engine non consolidato | **BLOCKING** | `useTemplateEngine` prototipale, manca pipeline rifinita per UDA/programmazione/relazione | Documenti scolastici non rifiniti | Consolidare `useTemplateEngine` → template definitivi per UDA, programmazione, relazione, curricolo, verbale | CML-636A/B |
| 2 | A07 | Qualità output documenti non validata | **SIGNIFICANT** | 10+ formati ma template non rifiniti per output scolastici specifici | Docente non ha documento finale utilizzabile | Definire template per UDA, programmazione, relazione, curricolo, verbale; validare output | CML-636B |
| 3 | CML-634 | Residui non consolidati | **SIGNIFICANT** | Worktree `fix/cml-634b-r3`, `feat/cml-634b-local-remote-ai-provider-pilot` con lavoro non su main | Stato IA locale incerto | Classificare worktree, integrare su main, rapporto conclusivo CML-634B | CML-634B consolidamento |
| 4 | CML-635 | Ruoli/permessi/repository condiviso | **BLOCKING** | Dominio `institution` c'è, ma ruoli/permessi, repository condiviso, sync, governance IA assenti | Prodotto rimane personale/locale, non istituzionale | CML-635B/C/D: ruoli, repo condiviso, sync, governance IA | CML-635B/C/D |
| 5 | A11 | Fonti non realmente utilizzabili | **SIGNIFICANT** | Seed `volumesKB` c'è, ma consultazione/validità/provenienza non integrate nel flusso docente | Fonti = archivio tecnico, non strumento docente | Integrare fonti in curricolo/revisione/documenti, mostrare provenienza/validità | CML-637 follow-up |
| 5 | CML-631 | Validazione reale assente | **SIGNIFICANT** | Percorso guidato implementato ma congelato, nessuna sessione reale | Non si sa se utile/usabile | Riattivare pilota, sessioni reali | CML-631D |
| 6 | A07 | Anteprima/validazione export | **MINOR** | Nessuna anteprima prima dell'export, no validazione output | Rischio documenti malformattati | Anteprima prima di scaricare | CML-636B |
| 7 | Sistema | Accessibilità/responsive non verificati | **MINOR** | Limite baseline (CLI) | Possibili barriere | Audit accessibilità + test responsive | Prossima fase |
| 8 | Test | Suite completa lenta | **MINOR** | ~4-6 min, già noto | Velocità CI | Separare test puri/DOM (CML_TEST_SUITE_PERFORMANCE) | Debito separato |

## Debiti non bloccanti

- Suite test completa lenta (~4-6 min) — debito `CML_TEST_SUITE_PERFORMANCE`.
- Accessibilità/responsive non verificati (limite baseline CLI).
- Mojibake/blank-line EOF/trailing whitespace in doc governance (LOW, preesistenti).
- Placeholder `$SessionName` in 3 handoff.

## Decisione principale

**D — Correggere prima i blocchi end-to-end esistenti**

**Motivazione:** La catena A02→A03→A04→A07 è la parte più matura del sistema (tutte **IMPLEMENTATE** a livello dominio/contratti/UI). Il blocco reale per il docente non è "aggiungere nuove aree" ma **completare l'ultimo miglio della catena esistente**:

1. A07 template engine → output rifinito (blocco #1 BLOCKING).
2. CML-635 ruoli/sync/repository → prodotto istituzionale (blocco #4 BLOCKING).
3. CML-634 residui → consolidare IA locale prima di estendere.

Solo dopo aver reso **affidabile e completo il flusso esistente** ha senso estendere con identità avanzata (CML-635B/C/D), validazione docenti (CML-631D), o governance IA (CML-635D).

## Roadmap raccomandata post-baseline

1. **CML-638A follow-up** — Consolidare template engine A07 + chiudere residui CML-634B (2-3 settimane).
2. **CML-636A/B** — Template definitivi per UDA, programmazione, relazione, curricolo, verbale + anteprima validata (3-4 settimane).
3. **CML-635A/B** — Ruoli base (Docente/Dipartimento/Referente), permessi minimi, repository condiviso locale (3-4 settimane).
4. **CML-634B consolidamento** — Integrazione worktree residue, rapporto conclusivo, flusso IA locale end-to-end (1-2 settimane).
5. **CML-635C/D** — Repository condiviso, sync, governance IA (dopo ruoli base).
5. **CML-631D** — Riattivare pilota guidato con docenti reali.
6. **CML-635C/D avanzati** — Sync remoto, governance IA istituzionale.
7. **CML-637 follow-up** — Fonti integrate nel flusso docente.
8. **CML_TEST_SUITE_PERFORMANCE** — Separare test puri/DOM.

## Evidenze

- Branch: `audit/cml-638a-system-wide-product-readiness`
- Worktree: `C:\Users\anton\CurManLight_arena_cml638a`
- Commit locale: `docs(CML-638A): establish system-wide product readiness baseline`
- File creati: `docs/CML_638A_SYSTEM_WIDE_PRODUCT_READINESS_BASELINE.md` (questo)
- Test fast: 8 file, 273 test, 39s, PASS
- Build: OK, 45s, 1.17 MB
- TypeScript: OK, 56s

## Limiti della baseline

- Livello 2 (esecuzione browser) e Livello 4 (valore utente reale): **dichiarati esplicitamente come limiti** — valutazione basata su lettura codice/contratti/test, non su sessioni browser manuali.
- Scenario 3 e 4 classificati **PARZIALI** per rifinitura output / residui non consolidati.
- Accessibilità, responsive, UX mobile: **non verificati** (richiedono browser).
- Seed curricolare: **un solo dataset** (`curriculumKB.ts` 1074 righe); comportamento con curricoli reali d'istituto non testato.
- Non eseguito `test:full` né `build-storybook` (fuori budget tempo; non bloccanti per la decisione).

---

**Verdetto finale:** `CML_638A_SYSTEM_WIDE_PRODUCT_READINESS_BASELINE_COMPLETE_LOCAL`

**Decisione:** `CML_638A_DECISION_D_FIX_END_TO_END_BLOCKERS`

**Prossimo passo operativo:** Creare worktree dedicata per `CML-638A follow-up` (template engine A07 + residui CML-634B) su `origin/main = 8d57017`.