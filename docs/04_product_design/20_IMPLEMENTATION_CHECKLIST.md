# CML-601: Checklist Implementazione — Tutte le Schermate

> Checklist dettagliata per ogni schermata dell'applicazione.
> Ogni voce include: route, componente, hooks, store, layout, stati, accessibilita, toast, copy.

---

## Indice

1. [Dashboard](#1-dashboard)
2. [Curricolo Albero](#2-curricolo-albero)
3. [Curricolo Mappa](#3-curricolo-mappa)
4. [Curricolo Popolamento](#4-curricolo-popolamento)
5. [Revisione](#5-revisione)
6. [Progettazione Home](#6-progettazione-home)
7. [UDA Wizard](#7-uda-wizard)
8. [UDA Archivio](#8-uda-archivio)
9. [Matrice Competenze](#9-matrice-competenze)
10. [Social UDA](#10-social-uda)
11. [Classe Home](#11-classe-home)
12. [Classe Registro](#12-classe-registro)
13. [Classe Strumenti](#13-classe-strumenti)
14. [Classe Pianificazione](#14-classe-pianificazione)
15. [Processo Flusso](#15-processo-flusso)
16. [Processo Verifica](#16-processo-verifica)
17. [Esportazioni](#17-esportazioni)
18. [Certificazione PA](#18-certificazione-pa)
19. [Fonti d Istituto](#19-fonti-d-istituto)
20. [Second Brain](#20-second-brain)
21. [Guida](#21-guida)
22. [Onboarding](#22-onboarding)
23. [Copilot](#23-copilot)
24. [Riepilogo](#riepilogo)

---

## 1. Dashboard

### Route and Componente
- [ ] Route `/home` configurata in router.tsx
- [ ] Componente `HomeScreen.tsx` estratto da App.tsx
- [ ] Hook `useScreenState()` estratto
- [ ] Hook `useScreenActions()` estratto
- [ ] Store slice `useNavigationStore` collegato
- [ ] Store slice `useCurriculumStore` (stats, recentActivity) collegato

### Layout
- [ ] Desktop layout con sidebar
- [ ] Tablet layout collapsed
- [ ] Mobile layout con bottom nav

### Sottocomponenti
- [ ] `StatsGrid.tsx` — griglia 2x2 statistiche
- [ ] `QuickActions.tsx` — lista azioni rapide
- [ ] `RecentActivity.tsx` — feed attivita recente
- [ ] `GreetingHeader.tsx` — saluto personalizzato

### Stati
- [ ] Empty state: "Benvenuto in CurManLight"
- [ ] Loading state: Skeleton per stats e activity
- [ ] Error state: "Errore nel caricamento dei dati"

### Accessibilita
- [ ] Focus management su elementi interattivi
- [ ] Keyboard navigation: Tab through stats, actions, activity
- [ ] ARIA labels su stat cards
- [ ] ARIA live region per aggiornamenti real-time

### Toast messages
- [ ] "Sincronizzazione completata" (success)
- [ ] "Errore di sincronizzazione" (error)
- [ ] "Dati aggiornati" (info)

### Copy
- [ ] Greeting personalizzato con nome professoressa
- [ ] Stat labels validati
- [ ] Quick action labels validati
- [ ] Recent activity format: "HH:MM — azione"

---

## 2. Curricolo Albero

### Route and Componente
- [ ] Route `/curricolo/tree` configurata
- [ ] Componente `CurricoloAlbero.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useCurricoloActions()` estratto
- [ ] Store slice `useCurriculumStore` (localCurriculum, expandedAccordions)

### Layout
- [ ] Desktop layout con sidebar
- [ ] Tablet layout
- [ ] Mobile layout con bottom nav

### Sottocomponenti
- [ ] `CurricoloSubTabs.tsx` — Albero Mappa Popolamento
- [ ] `DisciplineDropdown.tsx` — dropdown 14 discipline
- [ ] `OrderSelector.tsx` — dropdown 3 ordini
- [ ] `CompetenzaAccordion.tsx` — accordion competenza
- [ ] `TreeView.tsx` — albero gerarchico competenze
- [ ] `IndicatorBadge.tsx` — badge indicatori

### Stati
- [ ] Empty state: "Seleziona una disciplina per visualizzare il curriculum"
- [ ] Loading state: Skeleton tree
- [ ] Error state: "Errore nel caricamento del curriculum"

### Accessibilita
- [ ] Focus management su accordion
- [ ] Keyboard: Enter/Space per expand, Arrow keys per navigare
- [ ] ARIA expanded su accordion trigger
- [ ] ARIA tree role per ilTreeView
- [ ] ARIA label per ogni nodo

### Toast messages
- [ ] "Curriculum aggiornato" (success)
- [ ] "Errore nel salvataggio" (error)

### Copy
- [ ] Discipline names validati (14 nomi)
- [ ] Ordini scolastici validati (3 nomi)
- [ ] Labels accordion validati

---

## 3. Curricolo Mappa

### Route and Componente
- [ ] Route `/curricolo/map` configurata
- [ ] Componente `CurricoloMappa.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useCurricoloActions()` riusato
- [ ] Store slice `useCurriculumStore` (mapData, mapFilters)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `CurricoloSubTabs.tsx` — riusato
- [ ] `MappaGrid.tsx` — griglia mappa
- [ ] `CompetenzaCell.tsx` — cella individuale
- [ ] `MapLegend.tsx` — legenda colori
- [ ] `MapZoomControls.tsx` — zoom mobile

### Stati
- [ ] Empty state: "Mappa non disponibile per questa disciplina"
- [ ] Loading state: Skeleton grid
- [ ] Error state: "Errore nel caricamento della mappa"

### Accessibilita
- [ ] ARIA grid role per la mappa
- [ ] Keyboard navigation: Arrow keys tra celle
- [ ] Screen reader: nome competenza in ogni cella

### Toast messages
- [ ] "Filtri mappa aggiornati" (info)

### Copy
- [ ] Legenda colori validata
- [ ] Labels celle validati

---

## 4. Curricolo Popolamento

### Route and Componente
- [ ] Route `/curricolo/populate` configurata
- [ ] Componente `CurricoloPopolamento.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useCurricoloActions()` riusato
- [ ] Store slice `useCurriculumStore` (localCurriculum, customTexts, decisions)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `CurricoloSubTabs.tsx` — riusato
- [ ] `PopolamentoForm.tsx` — form popolamento
- [ ] `IndicatorEditor.tsx` — editor indicatori
- [ ] `DecisionCard.tsx` — card decisione didattica
- [ ] `PopolamentoProgress.tsx` — progresso popolamento

### Stati
- [ ] Empty state: "Nessuna competenza da popolare"
- [ ] Loading state: Spinner durante salvataggio
- [ ] Error state: "Errore nel salvataggio"
- [ ] Success state: Toast "Curriculum popolato con successo"

### Accessibilita
- [ ] Form labels associati agli input
- [ ] Error messages con aria-describedby
- [ ] Keyboard: Tab through form fields
- [ ] Focus management post-save

### Toast messages
- [ ] "Curriculum popolato con successo" (success)
- [ ] "Errore nel salvataggio" (error)
- [ ] "Modifiche non salvate" (warning on leave)

### Copy
- [ ] Form labels validati
- [ ] Placeholder text validati
- [ ] Error messages validati

---

## 5. Revisione

### Route and Componente
- [ ] Route `/revisione` configurata
- [ ] Componente `RevisioneScreen.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useRevisioneActions()` estratto
- [ ] Store slice `useCurriculumStore` (proposals, proposalStats)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout con swipe gestures

### Sottocomponenti
- [ ] `RevisioneStats.tsx` — griglia statistiche 2x2
- [ ] `ProposalCard.tsx` — card proposta
- [ ] `ProposalActions.tsx` — bottoni approva rifiuta
- [ ] `ProposalFilters.tsx` — dropdown filtro
- [ ] `ProposalDetail.tsx` — vista dettaglio
- [ ] `SwipeableCard.tsx` — wrapper swipe mobile

### Stati
- [ ] Empty state: "Nessuna proposta in attesa di revisione"
- [ ] Loading state: Skeleton cards
- [ ] Error state: "Errore nel caricamento delle proposte"
- [ ] Approved state: card diventa emerald
- [ ] Rejected state: card diventa rose

### Accessibilita
- [ ] ARIA labels su bottoni approva rifiuta
- [ ] Keyboard: A per approvare, R per rifiutare
- [ ] Focus management dopo approva rifiuta
- [ ] Screen reader: annuncio stato proposta

### Toast messages
- [ ] "Proposta approvata" (success)
- [ ] "Proposta rifiutata" (warning)
- [ ] "Errore nell'approvazione" (error)
- [ ] "Proposta modificata" (info)

### Copy
- [ ] Stat labels validati
- [ ] Filter options validati
- [ ] Proposal status labels validati
- [ ] Confirmation messages validati

---

## 6. Progettazione Home

### Route and Componente
- [ ] Route `/progettazione` configurata
- [ ] Componente `ProgettazioneHome.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useScreenActions()` riusato
- [ ] Store slice `useUdaStore` (savedUda, socialUdas)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `ProgettazioneQuickActions.tsx` — card azioni
- [ ] `UdaArchivioPreview.tsx` — preview archivio
- [ ] `ProgettazioneRecent.tsx` — UDA recenti

### Stati
- [ ] Empty state: "Inizia creando la tua prima UDA"
- [ ] Loading state: Skeleton cards
- [ ] Error state: "Errore nel caricamento"

### Accessibilita
- [ ] Focus management su card azioni
- [ ] Keyboard: Enter per navigare
- [ ] ARIA labels su card

### Toast messages
- [ ] "Nessun toast in questa schermata"

### Copy
- [ ] Action card titles validati
- [ ] Description text validati

---

## 7. UDA Wizard

### Route and Componente
- [ ] Route `/progettazione/wizard` configurata
- [ ] Componente `UdaWizard.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useUdaActions()` estratto
- [ ] Store slice `useUdaStore` (wizardStep, wizardData, savedUda)

### Layout
- [ ] Desktop layout (modal fullscreen)
- [ ] Tablet layout
- [ ] Mobile layout (fullscreen overlay)

### Sottocomponenti
- [ ] `WizardHeader.tsx` — header con chiudi salva
- [ ] `WizardStepIndicator.tsx` — barra progresso step
- [ ] `StepInfo.tsx` — step 1: dati base
- [ ] `StepObiettivi.tsx` — step 2: obiettivi
- [ ] `StepAttivita.tsx` — step 3: attivita
- [ ] `StepVerifica.tsx` — step 4: verifica
- [ ] `StepRiepilogo.tsx` — step 5: riepilogo
- [ ] `WizardNavigation.tsx` — nav avanti indietro

### Stati
- [ ] Empty state: form vuoto step 1
- [ ] Loading state: spinner durante salvataggio
- [ ] Validation state: errori inline per campo
- [ ] Success state: redirect a archivio con toast

### Accessibilita
- [ ] ARIA progress bar con valori
- [ ] Keyboard: Enter per avanzare, Escape per chiudere
- [ ] Focus management su cambio step
- [ ] Screen reader: annuncio step corrente
- [ ] Form validation con aria-describedby

### Toast messages
- [ ] "UDA salvato con successo" (success)
- [ ] "Errore nel salvataggio" (error)
- [ ] "Modifiche non salvate" (warning on close)
- [ ] "Step completato" (info)

### Copy
- [ ] Step titles validati
- [ ] Form labels validati
- [ ] Validation messages validati
- [ ] Confirmation messages validati

---

## 8. UDA Archivio

### Route and Componente
- [ ] Route `/progettazione/archivio` configurata
- [ ] Componente `UdaArchivio.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useUdaActions()` riusato
- [ ] Store slice `useUdaStore` (savedUdas, udaFilters)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `UdaSearchBar.tsx` — barra ricerca
- [ ] `UdaListFilter.tsx` — filtri multipli
- [ ] `UdaCard.tsx` — card UDA archiviata
- [ ] `UdaCardActions.tsx` — azioni card
- [ ] `UdaEmptyState.tsx` — stato vuoto

### Stati
- [ ] Empty state: "Nessun UDA archiviato"
- [ ] Loading state: Skeleton cards
- [ ] Error state: "Errore nel caricamento archivio"
- [ ] Search state: risultati filtrati
- [ ] Delete confirm: dialog conferma eliminazione

### Accessibilita
- [ ] ARIA labels su azioni card
- [ ] Keyboard: Delete per eliminare, Enter per modificare
- [ ] Focus management dopo eliminazione
- [ ] Screen reader: annuncio risultati ricerca

### Toast messages
- [ ] "UDA eliminato" (success)
- [ ] "UDA duplicato" (success)
- [ ] "Errore nell'eliminazione" (error)
- [ ] "Ricerca completata" (info)

### Copy
- [ ] Search placeholder validato
- [ ] Filter labels validati
- [ ] Delete confirmation validato
- [ ] Empty state message validato

---

## 9. Matrice Competenze

### Route and Componente
- [ ] Route `/progettazione/certificazione` configurata
- [ ] Componente `MatriceCompetenze.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useCertificazioneActions()` estratto
- [ ] Store slice `useCurriculumStore` (competenze, valutazioni)

### Layout
- [ ] Desktop layout (table view)
- [ ] Tablet layout
- [ ] Mobile layout (card stacked)

### Sottocomponenti
- [ ] `CertificazioneHeader.tsx` — header filtri
- [ ] `CompetencyMatrix.tsx` — matrice alunni x competenze
- [ ] `MatrixCell.tsx` — cella individuale
- [ ] `MatrixRow.tsx` — riga alunno
- [ ] `MatrixLegend.tsx` — legenda livelli
- [ ] `CertificazioneExport.tsx` — CTA esporta

### Stati
- [ ] Empty state: "Nessuna competenza da certificare"
- [ ] Loading state: Skeleton table
- [ ] Error state: "Errore nel caricamento matrice"
- [ ] Export state: download in corso

### Accessibilita
- [ ] ARIA grid role per matrice
- [ ] Keyboard: Arrow keys navigano celle
- [ ] Screen reader: nome alunno + competenza + livello
- [ ] Focus management su cella attiva

### Toast messages
- [ ] "Matrice esportata" (success)
- [ ] "Errore nell'esportazione" (error)
- [ ] "Valutazione salvata" (success)

### Copy
- [ ] Competence names validati
- [ ] Level labels validati
- [ ] Legend text validato

---

## 10. Social UDA

### Route and Componente
- [ ] Route `/progettazione/social` configurata
- [ ] Componente `SocialFeed.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useSocialActions()` estratto
- [ ] Store slice `useUdaStore` (socialUdas, socialFilters)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `SocialSearchBar.tsx` — barra ricerca
- [ ] `SocialUdaCard.tsx` — card UDA condivisa
- [ ] `SocialActions.tsx` — like commento clona
- [ ] `SocialTags.tsx` — lista tag
- [ ] `SocialCommentThread.tsx` — thread commenti

### Stati
- [ ] Empty state: "Nessun UDA condiviso"
- [ ] Loading state: Skeleton feed
- [ ] Error state: "Errore nel caricamento feed"
- [ ] Like state: animazione cuore
- [ ] Clone confirm: dialog conferma

### Accessibilita
- [ ] ARIA labels su bottoni like clona
- [ ] Keyboard: L per like, C per clonare
- [ ] Focus management post-azione
- [ ] Screen reader: annuncio like count

### Toast messages
- [ ] "UDA clonato nell'archivio" (success)
- [ ] "Errore nel clone" (error)
- [ ] "UDA aggiunto ai preferiti" (info)

### Copy
- [ ] Search placeholder validato
- [ ] Tag labels validati
- [ ] Clone confirmation validato

---

## 11. Classe Home

### Route and Componente
- [ ] Route `/classe` configurata
- [ ] Componente `ClasseHome.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useClassActions()` estratto
- [ ] Store slice `useClassroomStore` (classi, activeClasse)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `ClasseSelector.tsx` — selezione classe
- [ ] `ClasseStats.tsx` — statistiche classe
- [ ] `ClasseQuickActions.tsx` — azioni rapide
- [ ] `ClasseCard.tsx` — card classe

### Stati
- [ ] Empty state: "Nessuna classe configurata"
- [ ] Loading state: Skeleton cards
- [ ] Error state: "Errore nel caricamento classi"

### Accessibilita
- [ ] Focus management su card classe
- [ ] Keyboard: Enter per selezionare
- [ ] ARIA labels su statistiche

### Toast messages
- [ ] "Classe selezionata" (info)
- [ ] "Nuova classe aggiunta" (success)

### Copy
- [ ] Class names validati
- [ ] Stat labels validati
- [ ] Action labels validati

---

## 12. Classe Registro

### Route and Componente
- [ ] Route `/classe/registro` configurata
- [ ] Componente `RegistroScreen.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useRegistroActions()` estratto
- [ ] Store slice `useClassroomStore` (students, feedback, grades)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `ClasseSubTabs.tsx` — Registro Strumenti Pianificazione
- [ ] `StudentSearchBar.tsx` — ricerca alunni
- [ ] `StudentCard.tsx` — card alunno expandable
- [ ] `StudentFeedbackForm.tsx` — form feedback inline
- [ ] `StarRating.tsx` — valutazione a stelle 48px
- [ ] `GradeInput.tsx` — input voto

### Stati
- [ ] Empty state: "Nessun alunno in questa classe"
- [ ] Loading state: Skeleton list
- [ ] Error state: "Errore nel caricamento registro"
- [ ] Expanded state: form feedback visibile
- [ ] Saved state: feedback salvato

### Accessibilita
- [ ] Star rating: aria-label "Valutazione X su 5"
- [ ] Keyboard: 1-5 per rating, Tab per navigare
- [ ] Focus management su expand
- [ ] Screen reader: annuncio studente selezionato

### Toast messages
- [ ] "Feedback salvato" (success)
- [ ] "Errore nel salvataggio feedback" (error)
- [ ] "Voto registrato" (success)

### Copy
- [ ] Student name format: "Cognome, Nome"
- [ ] Rating labels: "1 stella" ... "5 stelle"
- [ ] Feedback placeholder validato

---

## 13. Classe Strumenti

### Route and Componente
- [ ] Route `/classe/strumenti` configurata
- [ ] Componente `StrumentiScreen.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useStrumentiActions()` estratto
- [ ] Store slice `useClassroomStore` (strumenti, strumentiTemplates)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `ClasseSubTabs.tsx` — riusato
- [ ] `InstrumentCard.tsx` — card strumento
- [ ] `RubricBuilder.tsx` — costruttore rubrica
- [ ] `InstrumentEditor.tsx` — editor strumento

### Stati
- [ ] Empty state: "Nessuno strumento valutativo"
- [ ] Loading state: Skeleton cards
- [ ] Error state: "Errore nel caricamento"
- [ ] Edit state: editor aperto

### Accessibilita
- [ ] Focus management su form editor
- [ ] Keyboard: Tab through rubric rows
- [ ] ARIA labels su strumenti

### Toast messages
- [ ] "Strumento salvato" (success)
- [ ] "Strumento eliminato" (success)
- [ ] "Errore nel salvataggio" (error)

### Copy
- [ ] Instrument type labels validati
- [ ] Rubric level labels validati

---

## 14. Classe Pianificazione

### Route and Componente
- [ ] Route `/classe/pianificazione` configurata
- [ ] Componente `PianificazioneScreen.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `usePianificazioneActions()` estratto
- [ ] Store slice `useClassroomStore` (pianificazione, lezioni)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `ClasseSubTabs.tsx` — riusato
- [ ] `PianificazioneCalendar.tsx` — vista calendario
- [ ] `LezioneCard.tsx` — card lezione
- [ ] `PianificazioneForm.tsx` — form nuova lezione
- [ ] `PianificazioneTimeline.tsx` — timeline verticale

### Stati
- [ ] Empty state: "Nessuna lezione pianificata"
- [ ] Loading state: Skeleton calendar
- [ ] Error state: "Errore nel caricamento"
- [ ] Create state: form nuova lezione

### Accessibilita
- [ ] Calendar: ARIA grid con date
- [ ] Keyboard: Arrow keys per navigare date
- [ ] Screen reader: "Lezione del GG/MM/YYYY"
- [ ] Focus management su lezione selezionata

### Toast messages
- [ ] "Lezione pianificata" (success)
- [ ] "Lezione eliminata" (success)
- [ ] "Errore nella pianificazione" (error)

### Copy
- [ ] Day names validati (Lun Mar Mer Gio Ven Sab Dom)
- [ ] Month names validati
- [ ] Time format validato

---

## 15. Processo Flusso

### Route and Componente
- [ ] Route `/processo` configurata
- [ ] Componente `ProcessoFlusso.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useProcessoActions()` estratto
- [ ] Store slice `useCurriculumStore` (flussi, processoSteps)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `ProcessoTimeline.tsx` — timeline processo
- [ ] `ProcessoStep.tsx` — step singolo
- [ ] `ProcessoStepActions.tsx` — azioni step
- [ ] `ProcessoProgress.tsx` — progresso globale
- [ ] `ProcessoDecisionCard.tsx` — card decisione

### Stati
- [ ] Empty state: "Nessun flusso di processo attivo"
- [ ] Loading state: Skeleton timeline
- [ ] Error state: "Errore nel caricamento"
- [ ] Completed state: tutti step completati

### Accessibilita
- [ ] Timeline: ARIA list con step
- [ ] Keyboard: Enter per completare step
- [ ] Screen reader: "Step X di Y completato"

### Toast messages
- [ ] "Step completato" (success)
- [ ] "Flusso completato" (success)
- [ ] "Errore nell'aggiornamento" (error)

### Copy
- [ ] Step names validati
- [ ] Description text validati
- [ ] Completion messages validati

---

## 16. Processo Verifica

### Route and Componente
- [ ] Route `/processo/verifica` configurata
- [ ] Componente `ProcessoVerifica.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useVerificaActions()` estratto
- [ ] Store slice `useCurriculumStore` (verifiche, verificaResults)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `VerificaChecklist.tsx` — checklist verifiche
- [ ] `VerificaItem.tsx` — item singola verifica
- [ ] `VerificaStatusBadge.tsx` — badge stato
- [ ] `VerificaReport.tsx` — report risultati

### Stati
- [ ] Empty state: "Nessuna verifica configurata"
- [ ] Loading state: Spinner
- [ ] Pass state: badge emerald
- [ ] Fail state: badge rose

### Accessibilita
- [ ] Checklist: ARIA checkbox
- [ ] Keyboard: Space per toggolare
- [ ] Screen reader: "Verifica completata" / "Verifica non completata"

### Toast messages
- [ ] "Verifica completata" (success)
- [ ] "Verifica fallita" (warning)
- [ ] "Report generato" (success)

### Copy
- [ ] Checklist item labels validati
- [ ] Status messages validati
- [ ] Report text validato

---

## 17. Esportazioni

### Route and Componente
- [ ] Route `/esportazioni` configurata
- [ ] Componente `EsportazioniScreen.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useExportActions()` estratto
- [ ] Store slice `useSyncStore` (exportHistory, isExporting, exportProgress)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `ExportCard.tsx` — card formato esportazione
- [ ] `ExportFormatList.tsx` — lista formati
- [ ] `ExportProgress.tsx` — progresso esportazione
- [ ] `ExportDownloadButton.tsx` — bottone download

### Stati
- [ ] Empty state: "Nessun formato disponibile"
- [ ] Loading state: progress bar durante export
- [ ] Error state: "Errore nell'esportazione"
- [ ] Success state: download completato

### Accessibilita
- [ ] Progress bar: ARIA progressbar
- [ ] Keyboard: Enter per avviare export
- [ ] Screen reader: "Esportazione in corso X%"

### Toast messages
- [ ] "Esportazione completata" (success)
- [ ] "Errore nell'esportazione" (error)
- [ ] "Esportazione avviata" (info)

### Copy
- [ ] Format names validati (PDF, Excel, Word, JSON, HTML)
- [ ] File size labels validati
- [ ] Progress messages validati

---

## 18. Certificazione PA

### Route and Componente
- [ ] Route `/certificazione-pa` configurata
- [ ] Componente `CertificazionePa.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useCertificazionePaActions()` estratto
- [ ] Store slice `useCurriculumStore` (certificazione, trattiIdentitari)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `CertificazionePAHeader.tsx` — header filtri
- [ ] `CertificazionePATable.tsx` — tabella certificazioni
- [ ] `CertificazionePARow.tsx` — riga alunno
- [ ] `CertificazionePAExport.tsx` — CTA esporta
- [ ] `CertificazionePASummary.tsx` — riepilogo

### Stati
- [ ] Empty state: "Nessuna certificazione da generare"
- [ ] Loading state: Spinner durante generazione
- [ ] Error state: "Errore nella generazione"
- [ ] Generating state: progress bar

### Accessibilita
- [ ] Table: ARIA table con headers
- [ ] Keyboard: Arrow keys navigano celle
- [ ] Screen reader: "Certificazione per [alunno]"

### Toast messages
- [ ] "Certificazione generata" (success)
- [ ] "Errore nella generazione" (error)
- [ ] "Certificazione esportata" (success)

### Copy
- [ ] Period labels validati
- [ ] Tratti identitari validati
- [ ] Certification format validato

---

## 19. Fonti d Istituto

### Route and Componente
- [ ] Route `/fonti` configurata
- [ ] Componente `FontiIstituto.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useFontiActions()` estratto
- [ ] Store slice `useCurriculumStore` (fonti, fontiCategories)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `FontiSearch.tsx` — ricerca fonti
- [ ] `FonteCard.tsx` — card fonte
- [ ] `FonteDetail.tsx` — dettaglio fonte
- [ ] `FonteCategoryFilter.tsx` — filtro categorie

### Stati
- [ ] Empty state: "Nessuna fonte istituzionale"
- [ ] Loading state: Skeleton cards
- [ ] Error state: "Errore nel caricamento fonti"
- [ ] Search state: risultati filtrati

### Accessibilita
- [ ] Search: ARIA search role
- [ ] Keyboard: Enter per cercare
- [ ] Focus management su risultati

### Toast messages
- [ ] "Fonte aggiunta" (success)
- [ ] "Fonte eliminata" (success)
- [ ] "Nessun risultato trovato" (info)

### Copy
- [ ] Category names validati
- [ ] Search placeholder validato
- [ ] Empty state messages validati

---

## 20. Second Brain

### Route and Componente
- [ ] Route `/second-brain` configurata
- [ ] Componente `SecondBrainScreen.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Hook `useChatActions()` estratto
- [ ] Store slice `useUdaStore` (volumes, chatHistory, activeVolume)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `VolumeList.tsx` — lista volumi
- [ ] `VolumePill.tsx` — pill volume
- [ ] `WikiLLMChat.tsx` — interfaccia chat
- [ ] `ChatMessage.tsx` — messaggio singolo
- [ ] `ChatInput.tsx` — barra input chat
- [ ] `ChatVoiceButton.tsx` — bottone voce

### Stati
- [ ] Empty state: "Nessun volume disponibile"
- [ ] Loading state: Skeleton volumes + chat
- [ ] Streaming state: risposta in streaming
- [ ] Error state: "Errore di connessione con WikiLLM"
- [ ] Voice state: ascolto attivo

### Accessibilita
- [ ] Chat: ARIA live region per nuovi messaggi
- [ ] Keyboard: Enter per inviare, Shift+Enter per newline
- [ ] Screen reader: "WikiLLM risponde"
- [ ] Voice button: aria-label "Attiva microfono"

### Toast messages
- [ ] "Risposta generata" (info)
- [ ] "Errore di connessione" (error)
- [ ] "Microfono attivato" (info)
- [ ] "Volume selezionato" (info)

### Copy
- [ ] Welcome message validato
- [ ] Error messages validati
- [ ] Volume names validati
- [ ] Voice button labels validati

---

## 21. Guida

### Route and Componente
- [ ] Route `/guida` configurata
- [ ] Componente `GuidaScreen.tsx` estratto
- [ ] Hook `useScreenState()` riusato
- [ ] Store slice: nessuno (contenuto statico)

### Layout
- [ ] Desktop layout
- [ ] Tablet layout
- [ ] Mobile layout

### Sottocomponenti
- [ ] `GuidaSearchBar.tsx` — ricerca guida
- [ ] `GuidaSection.tsx` — sezione guida
- [ ] `GuidaArticle.tsx` — articolo singolo
- [ ] `GuidaTOC.tsx` — tabella contenuti

### Stati
- [ ] Empty state: "Nessun risultato per la ricerca"
- [ ] Loading state: Skeleton content
- [ ] Search state: risultati evidenziati

### Accessibilita
- [ ] Search: ARIA search role
- [ ] TOC: ARIA navigation
- [ ] Keyboard: Arrow keys per navigare sezioni
- [ ] Heading hierarchy corretta (h1 -> h2 -> h3)

### Toast messages
- [ ] Nessun toast in questa schermata

### Copy
- [ ] All guide content validato
- [ ] Search placeholder validato
- [ ] Section titles validati

---

## 22. Onboarding

### Route and Componente
- [ ] Nessuna route (modal overlay)
- [ ] Componente `OnboardingModal.tsx` estratto
- [ ] Hook `useOnboardingState()` estratto
- [ ] Store slice `useNavigationStore` (onboardingComplete)

### Layout
- [ ] Overlay layout (fullscreen su mobile, centered su desktop)

### Sottocomponenti
- [ ] `OnboardingStep1.tsx` — benvenuto
- [ ] `OnboardingStep2.tsx` — configurazione
- [ ] `OnboardingStep3.tsx` — guida rapida
- [ ] `OnboardingProgress.tsx` — progress bar

### Stati
- [ ] Active state: step corrente
- [ ] Skip state: conferma salto
- [ ] Complete state: redirect a dashboard

### Accessibilita
- [ ] Focus trap nel modal
- [ ] Keyboard: Enter per avanzare, Escape per saltare
- [ ] Screen reader: "Onboarding passo X di Y"
- [ ] ARIA modal con aria-modal=true

### Toast messages
- [ ] "Setup completato! Benvenuto in CurManLight" (success)

### Copy
- [ ] Welcome text validato
- [ ] Step descriptions validati
- [ ] Skip button label validato
- [ ] Complete message validato

---

## 23. Copilot

### Route and Componente
- [ ] Nessuna route (floating overlay)
- [ ] Componente `CopilotFloating.tsx` estratto
- [ ] Componente `CopilotChat.tsx` estratto
- [ ] Hook `useCopilotState()` estratto
- [ ] Hook `useCopilotActions()` estratto
- [ ] Store slice `useUdaStore` (copilotMessages, copilotOpen)

### Layout
- [ ] Overlay layout (bottom 85vh su mobile, sidebar su desktop)

### Sottocomponenti
- [ ] `CopilotBubble.tsx` — FAB floating button
- [ ] `CopilotHeader.tsx` — header chat
- [ ] `CopilotMessage.tsx` — messaggio chat
- [ ] `CopilotInput.tsx` — barra input
- [ ] `CopilotVoiceButton.tsx` — bottone voce
- [ ] `CopilotSuggestions.tsx` — suggerimenti rapidi

### Stati
- [ ] Closed state: floating button visibile
- [ ] Open state: pannello chat aperto
- [ ] Typing state: indicator digitazione
- [ ] Streaming state: risposta in streaming
- [ ] Error state: "Copilot non disponibile"
- [ ] Voice state: ascolto attivo

### Accessibilita
- [ ] Focus trap nel pannello
- [ ] Keyboard: Escape per chiudere
- [ ] ARIA live region per messaggi
- [ ] Screen reader: "Copilot aperto" / "Copilot chiuso"
- [ ] Floating button: aria-label="Apri Copilot"

### Toast messages
- [ ] "Copilot non disponibile al momento" (error)
- [ ] "Messaggio inviato" (info)
- [ ] "Microfono attivato" (info)

### Copy
- [ ] Welcome message validato
- [ ] Quick action labels validati
- [ ] Error messages validati
- [ ] Voice button label validato

---

## Riepilogo

### Componenti da Creare

| Categoria | Quantita |
|-----------|----------|
| Screen components | 23 |
| Sottocomponenti screen | ~85 |
| UI components | 15 |
| Layout components | 6 |
| Domain components | 9 |
| Shared components | 5 |
| **Totale componenti** | **~143** |

### Hooks da Estrarre

| Tipo | Quantita |
|------|----------|
| useScreenState | 23 (1 per screen) |
| useScreenActions | 23 (1 per screen) |
| Store-specific hooks | 5 |
| Custom hooks (gestures, voice, etc.) | 6 |
| **Totale hooks** | **~57** |

### Routes da Configurare

| Tipo | Quantita |
|------|----------|
| Screen routes | 21 |
| Overlays (no route) | 2 |
| **Totale routes** | **21** |

### Store Slices

| Store | Campi | Actions |
|-------|-------|---------|
| useNavigationStore | 8 | 8 |
| useCurriculumStore | 13 | 19 |
| useUdaStore | 10 | 14 |
| useClassroomStore | 8 | 10 |
| useSyncStore | 5 | 5 |
| **Totale** | **44** | **56** |

### Stima Effort per Schermata

| Schermata | Componenti | Hook | Effort (gg) |
|-----------|-----------|------|-------------|
| 1. Dashboard | 4 | 2 | 2 |
| 2. Curricolo Albero | 6 | 2 | 3 |
| 3. Curricolo Mappa | 5 | 2 | 2.5 |
| 4. Curricolo Popolamento | 5 | 2 | 2.5 |
| 5. Revisione | 6 | 2 | 3 |
| 6. Progettazione Home | 3 | 2 | 1.5 |
| 7. UDA Wizard | 8 | 2 | 4 |
| 8. UDA Archivio | 5 | 2 | 2.5 |
| 9. Matrice Competenze | 6 | 2 | 3 |
| 10. Social UDA | 5 | 2 | 2.5 |
| 11. Classe Home | 4 | 2 | 2 |
| 12. Classe Registro | 6 | 2 | 3 |
| 13. Classe Strumenti | 4 | 2 | 2 |
| 14. Classe Pianificazione | 5 | 2 | 2.5 |
| 15. Processo Flusso | 5 | 2 | 2.5 |
| 16. Processo Verifica | 4 | 2 | 2 |
| 17. Esportazioni | 4 | 2 | 2 |
| 18. Certificazione PA | 5 | 2 | 2.5 |
| 19. Fonti Istituto | 4 | 2 | 2 |
| 20. Second Brain | 6 | 2 | 3 |
| 21. Guida | 4 | 1 | 1.5 |
| 22. Onboarding | 4 | 1 | 2 |
| 23. Copilot | 6 | 2 | 3 |
| **Totale** | **~125** | **~45** | **~58.5** |

### Infrastruttura

| Item | Effort (gg) |
|------|-------------|
| Configurazione router | 1 |
| Store setup (5 stores) | 2 |
| UI component library (15) | 5 |
| Layout components (6) | 2 |
| Shared components (5) | 1.5 |
| Error boundaries | 0.5 |
| Toast system | 1 |
| Animazioni base | 1 |
| Testing setup | 1 |
| **Totale infra** | **~15** |

### Effort Totale Stimato

| Fase | Effort (gg) |
|------|-------------|
| Fase 0: Infrastruttura | 15 |
| Fase 1: Screens core (Dashboard, Curricolo, Revisione) | 18 |
| Fase 2: Progettazione (Wizard, Archivio, Social, Matrice) | 15 |
| Fase 3: Classe (Registro, Strumenti, Pianificazione) | 8.5 |
| Fase 4: Processo + Esportazioni + Certificazione | 8 |
| Fase 5: Fonti + Second Brain + Guida | 7 |
| Fase 6: Onboarding + Copilot | 5 |
| Fase 7: Testing e polish | 5 |
| **Totale** | **~81.5 gg** |
| Con overlap 20% | **~65 gg** |

### Priority Order

1. Infrastruttura (router, stores, UI library)
2. Dashboard + Navigation shell
3. Curricolo (Albero, Mappa, Popolamento)
4. Revisione
5. Progettazione (Wizard, Archivio)
6. Classe (Registro)
7. Social UDA + Matrice Competenze
8. Classe (Strumenti, Pianificazione)
9. Processo + Verifica
10. Esportazioni + Certificazione PA
11. Fonti + Second Brain
12. Guida + Onboarding
13. Copilot
14. Testing e polish
