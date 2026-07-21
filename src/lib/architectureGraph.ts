// Interactive Graph Node Interface
export interface GraphNode {
 id: string;
 label: string;
 category: 'codice' | 'conoscenza' | 'interazione';
 x: number;
 y: number;
 desc: string;
 details: string;
 labelOffset?: 'top' | 'bottom';
}

// Interactive Graph Edge Interface
export interface GraphEdge {
 source: string;
 target: string;
 label: string;
}

// Initial Nodes data for the Interactive Architecture Graph
export const initialNodes: GraphNode[] = [
 { id: "app", label: "App.tsx (Interfaccia)", category: "codice", x: 180, y: 120, desc: "Interfaccia Utente principale", details: "Gestisce l'intera logica visiva, i moduli interattivi e il Wizard di progettazione a 3 colonne." },
 { id: "store", label: "useCurriculumStore.ts (Zustand)", category: "codice", x: 100, y: 220, desc: "Gestione dello Stato (Zustand)", details: "Sincronizza le decisioni di voto dei dipartimenti e l'archivio UDA con la memoria locale sicura d'Istituto.", labelOffset: 'bottom' },
 { id: "kb", label: "curriculumKB.ts (Banca Dati)", category: "codice", x: 250, y: 200, desc: "Database Disciplinare", details: "Racchiude la mappatura verticale di tutti i 106 traguardi e 92 obiettivi delle 14 materie." },
 { id: "types", label: "curriculum.ts (Tipi)", category: "codice", x: 320, y: 240, desc: "Contratti TypeScript", details: "Definisce i tipi strutturali e i contratti per i ruoli di governance, le UDA e le evidenze.", labelOffset: 'bottom' },
 { id: "index", label: "index.html (Bundle)", category: "codice", x: 230, y: 60, desc: "Bundle Monolitico Compilato", details: "Il file finale statico in linea, autoportante e offline-first ottimizzato per l'Istituto." },
 { id: "sw", label: "sw.js (Offline Cache)", category: "codice", x: 340, y: 50, desc: "PWA Service Worker", details: "Gestisce il caching intelligente degli asset esterni per garantire l'avvio offline in aula." },
 
 { id: "brain", label: "second-brain/ (Indice)", category: "conoscenza", x: 450, y: 140, desc: "Secondo Cervello d'Istituto", details: "La directory centrale in formato Markdown (.md) che organizza la memoria storica della scuola." },
 { id: "vol1", label: "Vol 1: Progetti & Territorio", category: "conoscenza", x: 380, y: 260, desc: "Progetti e Territorio", details: "Documenta Scuola Viva (Blender 3D), PNRR INNOVACLASS, progetto CINELAB e curvatura STEM.", labelOffset: 'top' },
 { id: "vol2", label: "Vol 2: RAV/NIV/PdM d'Istituto", category: "conoscenza", x: 480, y: 280, desc: "Autovalutazione RAV/NIV/PdM", details: "Mappa gli indicatori del portale ministeriale, le priorità di miglioramento e il NIV.", labelOffset: 'bottom' },
 { id: "vol3", label: "Vol 3: Inclusione & Privacy", category: "conoscenza", x: 580, y: 260, desc: "Didattica, Inclusione e Privacy", details: "Quadro legislativo della didattica per competenze, tutele PEI/PDP ed il decalogo privacy d'aula.", labelOffset: 'top' },
 { id: "vol4", label: "Vol 4: Curricolo Fondativo", category: "conoscenza", x: 420, y: 80, desc: "Curricolo Fondativo", details: "Il testo strutturato in 5 parti raccordato alle riforme nazionali e europee." },
 { id: "vol5", label: "Vol 5: Wiki & Manuale CML", category: "conoscenza", x: 580, y: 90, desc: "Manuale d'Uso Tecnico", details: "Mappa i 6 livelli di autorizzazione della governance e i modelli del database offline." },
 { id: "vol6", label: "Vol 6: Repertorio Pedagogico", category: "conoscenza", x: 580, y: 185, desc: "Repertorio Concettuale", details: "Il dizionario d'istituto con i 14 concetti chiave della didattica per competenze." },
 { id: "vol7", label: "Vol 7: Transizione IN2025", category: "conoscenza", x: 410, y: 340, desc: "Adozione Graduale", details: "Il piano di transizione d'Istituto per l'introduzione graduale delle Indicazioni 2025.", labelOffset: 'top' },
 { id: "vol8", label: "Vol 8: 14 Discipline d'Istituto", category: "conoscenza", x: 490, y: 365, desc: "Curricolo 14 Discipline", details: "Mappatura completa classe per classe delle 14 discipline e dei 5 Campi di Esperienza.", labelOffset: 'bottom' },
 { id: "vol9", label: "Vol 9: Accessibilità & GDPR", category: "conoscenza", x: 570, y: 340, desc: "Conformità PA e AgID", details: "La guida d'Istituto sulle regole di accessibilità WCAG 2.1, qualificazione ACN e GDPR.", labelOffset: 'top' },
 { id: "vol10", label: "Vol 10: Delibera Collegiale", category: "conoscenza", x: 660, y: 290, desc: "Bozza di Delibera d'Istituto", details: "L'atto formale di approvazione consiliare per l'adozione del Curricolo Verticale v1.5.3 e del sistema CurManLight.", labelOffset: 'bottom' },
 
 { id: "wikillm", label: "WikiLLM (Copilota)", category: "interazione", x: 310, y: 120, desc: "Copilota Pedagogico", details: "Motore di risposta a zero allucinazioni raccordato semanticamente ai volumi .md d'Istituto." },
 { id: "glossario", label: "Glossario Interattivo", category: "interazione", x: 490, y: 190, desc: "Dizionario Dinamico", details: "Glossario dei termini d'area alimentato in tempo reale dall'Agente Pedagogico IA." }
];

// Initial Edges data for the Interactive Architecture Graph
export const initialEdges: GraphEdge[] = [
 { source: "app", target: "store", label: "interroga" },
 { source: "app", target: "kb", label: "scansiona" },
 { source: "store", target: "types", label: "implementa" },
 { source: "kb", target: "types", label: "implementa" },
 { source: "app", target: "index", label: "compila" },
 { source: "index", target: "sw", label: "registra" },
 { source: "app", target: "brain", label: "indicizza" },
 { source: "brain", target: "vol1", label: "raccorda" },
 { source: "brain", target: "vol2", label: "raccorda" },
 { source: "brain", target: "vol3", label: "raccorda" },
 { source: "brain", target: "vol4", label: "raccorda" },
 { source: "brain", target: "vol5", label: "raccorda" },
 { source: "brain", target: "vol6", label: "raccorda" },
 { source: "brain", target: "vol7", label: "raccorda" },
 { source: "brain", target: "vol8", label: "raccorda" },
 { source: "brain", target: "vol9", label: "raccorda" },
 { source: "brain", target: "vol10", label: "raccorda" },
 { source: "wikillm", target: "brain", label: "interroga" },
 { source: "glossario", target: "vol6", label: "sincronizza" },
 { source: "app", target: "wikillm", label: "integra" },
 { source: "app", target: "glossario", label: "integra" }
];


