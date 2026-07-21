# Specifiche Schermate — CurManLight Product Experience 2.0

> Milestone: CML-600 | Aggiornato: luglio 2026

---

## 1. Home Dashboard

### Scopo
Punto di ingresso dell'applicazione. Mostra stato attuale, statistiche e azioni rapide.

### Utente
Tutti i ruoli. Personalizzata in base al profilo (onboarding prima volta).

### Contesto
- Primo accesso giornaliero
- Verifica rapida stato revisione
- Accesso rapido alle funzioni principali

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Consulta Curricolo | Navigazione | Alta |
| Nuova UDA | Navigazione | Alta |
| Esporta Documento | Navigazione | Media |
| Azzera Memoria | Azione critica | Bassa |

### Navigazione
- **Da**: Login / primo accesso
- **Verso**: Qualsiasi schermata via sidebar o quick actions

### Contenuti
- Banner onboarding (solo primo accesso)
- Statistiche: progresso revisione, UDA create, proposte decise
- Quick actions grid (3-6 azioni)
- Attività recenti (ultime modifiche)
- Architettura sistema (opzionale)

### Componenti
WarningBanner, OnboardingModal, StatsCard, QuickActionGrid, ActivityFeed

### Desktop
Griglia 2 colonne: stats a sinistra, quick actions a destra.

### Tablet
Stack verticale: stats → quick actions → attività.

### Mobile
Card stack verticale con stats in griglia 2×2.

### Empty State
"Benvenuto in CurManLight! Inizia configurando il tuo profilo." + bottone onboarding.

### Loading State
Skeleton cards per stats e quick actions.

### Error State
Toast errore + banner "Impossibile caricare i dati. Riprova."

### Accessibilità
- Heading h1 per titolo pagina
- Stats con aria-label
- Quick actions come lista nav con aria-label

---

## 2. Consulta Curricolo — Vista Albero

### Scopo
Visualizzare la struttura completa del curricolo verticale per disciplina e ordine scolastico.

### Utente
Docenti, coordinatori, referenti curricolo.

### Contesto
- Consultazione durante consiglio
- Verifica allineamento con indicazioni nazionali
- Preparazione documento curricolo

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Cambia disciplina | Filtraggio | Alta |
| Cambia ordine | Filtraggio | Alta |
| Espandi/collassa accordion | Interazione | Alta |
| Copia testo | Clipboard | Media |

### Navigazione
- **Da**: Sidebar → Curricolo → Vista Strutturata (Albero)
- **Verso**: Revisione, Mappa, Popolamento

### Contenuti
- Filtro disciplina (14 discipline)
- Filtro ordine (infanzia, primaria, secondaria)
- Struttura ad albero: Traguardi → Obiettivi → Proposte
- Badge stato per ogni proposta

### Componenti
DisciplineSelector, SchoolOrderSelector, AccordionItem, Badge

### Desktop
Albero espandibile con 3 colonne per livello.

### Tablet
Albero espandibile full-width.

### Mobile
Accordion cards, una disciplina alla volta.

### Empty State
"Nessun dato curricolo disponibile. Importa il curricolo base."

### Loading State
Skeleton tree structure.

### Error State
Toast errore + banner "Errore nel caricamento del curricolo."

### Accessibilità
- Tree role con aria-expanded
- Navigazione keyboard con arrow keys
- Live region per conteggio elementi

---

## 3. Consulta Curricolo — Mappa Diacronica

### Scopo
Mostrare le relazioni tra traguardi e obiettivi attraverso i livelli scolastici (infanzia → primaria → secondaria).

### Utente
Referenti curricolo, coordinatori.

### Contesto
- Verifica coerenza verticale del curricolo
- Identificazione gap tra livelli
- Preparazione verbale consiglio

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Cambia disciplina | Filtraggio | Alta |
| Espandi nodi | Interazione | Alta |
| Confronta livelli | Visualizzazione | Media |

### Navigazione
- **Da**: Sidebar → Curricolo → Raccordo Diacronico (Mappa)
- **Verso**: Albero, Popolamento

### Contenuti
- Mappa visuale dei livelli scolastici
- Relazioni tra traguardi/obiettivi per livello
- Indicatori di continuità/discontinuità

### Componenti
DiacronicMap, LevelColumn, ConnectionLine

### Desktop
Layout a 3 colonne (infanzia | primaria | secondaria) con connessioni visive.

### Tablet
Layout a 3 colonne compatte con scroll orizzontale se necessario.

### Mobile
Stack verticale con connessioni indicate da frecce.

### Empty State
"Nessuna relazione diacronica configurata per questa disciplina."

### Loading State
Skeleton a 3 colonne.

### Error State
Fallback a Vista Albero.

### Accessibilità
- Table role con headers
- Alt text per relazioni visive
- Navigazione keyboard tra colonne

---

## 4. Consulta Curricolo — Popolamento

### Scopo
Integrare e popolare il curricolo con dati esterni (CSV, AI, copilot).

### Utente
Referenti, coordinatori, amministratori.

### Contesto
- Importazione dati da fonti ministeriali
- Generazione proposte con AI
- Integrazione con sistemi esterni

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Upload CSV | File import | Alta |
| Genera con AI | Generazione | Alta |
| Conferma import | Conferma | Alta |
| Backup sicurezza | Download | Media |

### Navigazione
- **Da**: Sidebar → Curricolo → Integrazione & Popolamento
- **Verso**: Albero (per verificare risultato)

### Contenuti
- Tab: Copilot AI, CSV Import, Sicurezza
- Form upload CSV
- Interfaccia AI per generazione
- Opzioni backup

### Componenti
TabGroup, FileUpload, AIGeneratorForm, BackupPanel

### Desktop
Layout a tab con pannelli affiancati.

### Tablet
Tab orizzontali con pannelli full-width.

### Mobile
Tab scrollabili con pannelli stack.

### Empty State
"Carica il tuo primo file CSV o genera il curricolo con l'AI."

### Loading State
Spinner + "Generazione in corso..."

### Error State
Toast errore con dettagli + suggerimento.

### Accessibilità
- Tab role con aria-selected
- File input con label associato
- Progress indicator per upload

---

## 5. Revisione (Gap 2025)

### Scopo
Revisionare le proposte di aggiornamento del curricolo in base alla riforma 2025 (D.M. 221/2025).

### Utente
Tutti i ruoli (con permessi variabili).

### Contesto
- Consiglio di dipartimento
- Revisione collegiale
- Decisione su adozione proposte

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Approva proposta | Decisione | Alta |
| Rifiuta proposta | Decisione | Alta |
| Personalizza testo | Editing | Alta |
| Filtra per stato | Filtraggio | Media |
| Esporta verbale | Download | Media |

### Navigazione
- **Da**: Sidebar → Curricolo → Revisione (Gap 2025)
- **Verso**: Curricolo (per contesto), Esportazioni

### Contenuti
- Statistiche: totali, in corso, approvati, rifiutati, personalizzati
- Filtro per stato
- Card per ogni proposta con:
  - Disciplina e livello
  - Testo traguardo/obiettivo
  - Confronto vecchio vs nuovo
  - Bottoni azione

### Componenti
StatsBar, FilterTabs, ProposalCard, DecisionButtons, TextArea

### Desktop
Stats in riga, filtri tabs, card con layout a 2 colonne (vecchio | nuovo).

### Tablet
Stats in griglia 2×2, card full-width.

### Mobile
Stats in griglia 2×2, card stack con azioni inline.

### Empty State
"Nessuna proposta in attesa di revisione."

### Loading State
Skeleton cards.

### Error State
Toast errore + "Impossibile caricare le proposte."

### Accessibilità
- Live region per aggiornamento stats
- Conferma azione prima di approvare/rifiutare
- Keyboard: Enter per approvare, Escape per annullare

---

## 6. Progettazione UDA — Compilatore Wizard

### Scopo
Creare una Unità di Apprendimento (UDA) guidata.

### Utente
Docenti, coordinatori.

### Contesto
- Progettazione didattica annuale
- Preparazione consiglio
- Redazione verbali di programmazione

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Compila campi form | Input | Alta |
| Seleziona traguardi | Checkbox | Alta |
| Seleziona obiettivi | Checkbox | Alta |
| Inserisci compito reale | Textarea | Alta |
| Salva UDA | Salvataggio | Alta |
| Carica template | Caricamento | Media |

### Navigazione
- **Da**: Sidebar → Progettazione UDA → Compilatore
- **Verso**: Archivio (per vedere salvate), Matrice (per verificare)

### Contenuti
- Step indicator (3 step)
- Form: titolo, disciplina, periodo, ore
- Checkbox: traguardi selezionati
- Textarea: compito di realtà
- Textarea: note

### Componenti
StepIndicator, FormCard, CheckboxGroup, TextArea, SaveButton

### Desktop
Form a 2 colonne: sinistra campi base, destra selezioni.

### Tablet
Form full-width con campi stack.

### Mobile
Form full-width con step indicator scrollabile.

### Empty State
"Compila i campi per creare la tua prima UDA."

### Loading State
Spinner su "Salva UDA".

### Error State
Toast errore + "Controlla i campi obbligatori."

### Accessibilità
- Form labels associati
- Error messages con aria-describedby
- Required fields con aria-required
- Step indicator con aria-current

---

## 7. Progettazione UDA — Archivio

### Scopo
Visualizzare, cercare e gestire tutte le UDA create.

### Utente
Docenti, coordinatori.

### Contesto
- Ricerca UDA esistenti
- Gestione biblioteca didattica
- Condivisione con colleghi

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Cerca UDA | Ricerca | Alta |
| Filtra per classe/periodo | Filtraggio | Alta |
| Ordina | Ordinamento | Media |
| Elimina UDA | Azione critica | Media |
| Esporta singola | Download | Media |

### Navigazione
- **Da**: Sidebar → Progettazione UDA → Archivio
- **Verso**: Compilatore (per modifica), Esportazioni

### Contenuti
- Barra ricerca
- Filtri: classe, periodo, stato
- Ordinamento: recenti, alfabético, disciplina
- Lista/card UDA con: titolo, disciplina, stato, data

### Componenti
SearchBar, FilterBar, SortSelect, UdaCard, EmptyState

### Desktop
Lista con card affiancate, sidebar filtri.

### Tablet
Lista full-width con filtri in dropdown.

### Mobile
Card stack con filtri in bottom sheet.

### Empty State
"Nessuna UDA presente. Inizia creandone una nuova!"

### Loading State
Skeleton cards.

### Error State
Toast errore + "Impossibile caricare l'archivio."

### Accessibilità
- Search con aria-label
- Lista con role="list" e role="listitem"
- Elimina con conferma

---

## 8. Esportazioni

### Scopo
Esportare documenti in vari formati ufficiali.

### Utente
Tutti i ruoli.

### Contesto
- Preparazione verbali di consiglio
- Generazione documenti ufficiali
- Backup e archiviazione

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Scarica Word (.doc) | Download | Alta |
| Scarica Word (.docx) | Download | Alta |
| Scarica PDF | Download | Alta |
| Scarica SCORM (.zip) | Download | Alta |
| Backup JSON | Download | Media |
| Sincronizza Drive | Sync | Media |
| Scarica Markdown | Download | Bassa |
| Scarica ODT | Download | Bassa |

### Navigazione
- **Da**: Sidebar → Progettazione UDA → Esportazione
- **Verso**: Esterno (download file)

### Contenuti
- Elenco formati disponibili
- Opzioni di esportazione
- Stato sincronizzazione cloud
- Cronologia export

### Componenti
ExportCard, DownloadButton, SyncStatus, FormatBadge

### Desktop
Grid 2 colonne con cards per ogni formato.

### Tablet
Grid 2 colonne compatte.

### Mobile
Lista verticale con cards full-width.

### Empty State
"Seleziona un formato per esportare i tuoi documenti."

### Loading State
Spinner con "Generazione file in corso..."

### Error State
Toast errore con dettaglio formato fallito.

### Accessibilità
- Bottoni con aria-label descrittivo
- Download con feedback sonoro/visivo
- Stato sincronizzazione con aria-live

---

## 9. Certificazione PA (AgID)

### Scopo
Verificare e garantire la conformità del prodotto agli standard AgID, WCAG 2.1 e GDPR.

### Utente
Amministratori, dirigenti, revisori tecnici.

### Contesto
- Verifica periodica conformità
- Preparazione audit AgID
- Documentazione per ispezione

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Esegui audit | Analisi | Alta |
| Visualizza report | Lettura | Alta |
| Esporta report | Download | Media |

### Navigazione
- **Da**: Sidebar → Supporto → Certificazione PA
- **Verso**: Guida (per dettagli)

### Contenuti
- Checklist WCAG 2.1 Level A/AA
- Status conformità GDPR
- Report AgID
- Raccomandazioni

### Componenti
ChecklistGroup, StatusBadge, ReportCard

### Desktop
Layout a pannelli: checklist a sinistra, report a destra.

### Tablet
Stack verticale: checklist → report.

### Mobile
Accordion con items expandabili.

### Empty State
"Esegui il primo audit per verificare la conformità."

### Loading State
Spinner "Analisi in corso..."

### Error State
"Impossibile eseguire l'audit. Contatta l'amministratore."

### Accessibilità
- Checklist con aria-checked
- Report con heading structure
- Links con aria-label

---

## 10. Fonti d'Istituto

### Scopo
Consultare i 22 volumi della conoscenza istituzionale (second-brain).

### Utente
Tutti i ruoli.

### Contesto
- Ricerca documentazione istituzionale
- Consultazione normativa
- Preparazione incontri

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Cerca nei volumi | Ricerca | Alta |
| Seleziona volume | Navigazione | Alta |
| Leggi volume | Lettura | Alta |
| Copia testo | Clipboard | Media |

### Navigazione
- **Da**: Sidebar → Curricolo → Fonti d'Istituto
- **Verso**: Second Brain (per ricerca avanzata)

### Contenuti
- Lista 22 volumi con titolo
- Barra ricerca full-text
- Volume selezionato: HTML rendering
- IndiceArgomenti per volume

### Componenti
VolumeList, SearchBar, VolumeReader, IndexPanel

### Desktop
Sidebar lista volumi + pannello lettura.

### Tablet
Dropdown selezione + pannello full-width.

### Mobile
Lista volumi + navigazione a schermo pieno.

### Empty State
"Nessun volume caricato. Importa la base di conoscenza."

### Loading State
Skeleton per contenuto volume.

### Error State
"Errore nel caricamento del volume."

### Accessibilità
- Lista volumi con role="list"
- Contenuto HTML con heading structure
- Ricerca con aria-live

---

## 11. Guida Operativa / Second Brain / WikiLLM

### Scopo
Fornire assistenza contestuale, glossario e ricerca nella conoscenza istituzionale.

### Utente
Tutti i ruoli.

### Contesto
- Ricerca glossario pedagogico
- Aiuto contestuale durante l'uso
- Definizioni UDA, competenza, evidenza, ecc.

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Cerca termine | Ricerca | Alta |
| Aggiungi glossario | Creazione | Media |
| Leggi guida | Lettura | Media |

### Navigazione
- **Da**: Sidebar → Supporto → Guida / WikiLLM
- **Verso**: Qualsiasi schermata (per contesto)

### Contenuti
- Glossario predefinito (14 termini)
- Funzione di ricerca glossario
- Volumi WikiLLM con risposte contestuali
- Guida operativa per ogni schermata

### Componenti
GlossaryList, SearchBar, VolumeCard, HelpSection

### Desktop
Layout a 2 pannelli: indice a sinistra, contenuto a destra.

### Tablet
Full-width con tabs.

### Mobile
Lista + schermo pieno.

### Empty State
"Nessun termine nel glossario."

### Loading State
"Ricerca in corso..."

### Error State
"Impossibile accedere alla base di conoscenza."

### Accessibilità
- Glossary con role="list"
- Search con aria-label
- Links interni con href

---

## 12. Spazio d'Aula (Classe)

### Scopo
Gestire l'ambiente classe: registro, strumenti, pianificazione.

### Utente
Docenti in servizio.

### Contesto
- Durante la lezione
- Pianificazione settimanale
- Gestione alunni

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Registro alunni | CRUD | Alta |
| Feedback alunno | Input | Alta |
| Pianifica lezione | Form | Alta |
| Gruppi cooperativi | Generazione | Media |
| Mappa seduti | Layout | Bassa |

### Navigazione
- **Da**: Sidebar → Classe → Registro/Strumenti/Pianificazione
- **Verso**: Social (per condividere UDA)

### Contenuti
- Registro: lista alunni con feedback
- Strumenti: gruppi cooperativi, mappa seduti, esiti
- Pianificazione: ore settimanali per disciplina

### Componenti
StudentList, FeedbackForm, GroupGenerator, WeeklyPlanner

### Desktop
3 tabs con layout dedicato per ciascuno.

### Tablet
Tabs orizzontali con pannelli full-width.

### Mobile
Card stack con navigazione per tab.

### Empty State
"Nessun alunno registrato. Importa l'anagrafica classe."

### Loading State
Skeleton per lista alunni.

### Error State
"Errore nel caricamento degli alunni."

### Accessibilità
- Lista con role="list"
- Feedback con aria-label
- Gruppi con aria-describedby

---

## 13. Social UDA (Osservatorio dei Riusi)

### Scopo
Condividere e riusare UDA tra docenti dell'istituto.

### Utente
Tutti i docenti.

### Contesto
- Ricerca ispirazione didattica
- Condivisione esperienze
- Community di pratica

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Sfoglia UDA condivise | Navigazione | Alta |
| Metti "mi piace" | Interazione | Media |
| Aggiungi annotazione | Commento | Media |
| Clona UDA | Copia | Media |

### Navigazione
- **Da**: Sidebar → Classe → Osservatorio
- **Verso**: Compilatore (per modifica cloned)

### Contenuti
- Lista UDA condivise con autore, disciplina, likes
- Dettaglio UDA: traguardi, obiettivi, compito
- Annotazioni dei colleghi
- Statistiche riuso

### Componenti
SocialFeed, UdaCard, LikeButton, AnnotationInput

### Desktop
Feed con card a griglia.

### Tablet
Feed con card stack.

### Mobile
Feed full-width con card.

### Empty State
"Nessuna UDA condivisa ancora. Condividi la tua prima progettazione!"

### Loading State
Skeleton feed.

### Error State
"Impossibile caricare le UDA condivise."

### Accessibilità
- Feed con role="feed"
- Like con aria-pressed
- Card con heading per ogni UDA

---

## 14. Onboarding Modal

### Scopo
Configurare il profilo utente al primo accesso.

### Utente
Nuovi utenti.

### Contesto
- Primo accesso all'applicazione
- Setup iniziale profilo

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Seleziona ruolo | Selezione | Alta |
| Seleziona disciplina | Selezione | Alta |
| Seleziona ordine | Selezione | Alta |
| Seleziona classi assegnate | Selezione | Alta |
| Conferma setup | Conferma | Alta |

### Navigazione
- **Da**: Dashboard (primo accesso)
- **Verso**: Dashboard (con profilo configurato)

### Contenuti
- Form step-by-step
- Selezione ruolo (6 opzioni)
- Selezione disciplina (14 opzioni)
- Selezione ordine (3 opzioni)
- Selezione classi

### Componenti
Modal, StepForm, SelectGroup

### Desktop
Modal centrato max-w-xl.

### Tablet
Modal full-width landscape.

### Mobile
Full-screen modal.

### Empty State
N/A (mostrato sempre al primo accesso).

### Loading State
N/A.

### Error State
Toast errore + "Riprova il setup."

### Accessibilità
- Modal con focus trap
- Escape per chiudere
- Steps con aria-current

---

## 15. Copilot Chat Overlay

### Scopo
Fornire assistenza AI contestuale durante l'uso.

### Utente
Tutti i ruoli.

### Contesto
- Domande durante compilazione
- Ricerca informazioni rapide
- Help contestuale

### Azioni
| Azione | Tipo | Priorità |
|--------|------|----------|
| Invia messaggio | Input | Alta |
| Leggi risposta | Lettura | Alta |
| Input vocale | Voice | Media |
| Chiudi chat | Toggle | Alta |

### Navigazione
- **Da**: Bottone Copilot in header (overlay globale)
- **Verso**: Nessuna (rimane overlay)

### Contenuti
- Header con titolo e chiudi
- Lista messaggi (user + assistant)
- Input con voice toggle
- Stato "rispondendo..."

### Componenti
ChatOverlay, MessageBubble, InputBar, VoiceButton

### Desktop
Overlay fixed bottom-right w-96 h-[450px].

### Tablet
Overlay full-width bottom.

### Mobile
Full-screen overlay.

### Empty State
"Chiedimi qualcosa sul curricolo o sulla progettazione!"

### Loading State
"Sto elaborando la risposta..."

### Error State
"Errore di connessione. Riprova."

### Accessibilità
- Chat con role log
- Input con aria-label
- Messaggi con aria-live
- Keyboard: Enter per inviare
