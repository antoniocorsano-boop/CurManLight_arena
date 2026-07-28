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
 { id: "store", label: "useCurriculumStore.ts (Zustand)", category: "codice", x: 100, y: 220, desc: "Gestione dello stato locale", details: "Memorizza scelte di lavoro, UDA e configurazione nel browser quando disponibile; non dichiara cifratura o sicurezza del dispositivo.", labelOffset: 'bottom' },
 { id: "kb", label: "curriculumKB.ts (Banca Dati)", category: "codice", x: 250, y: 200, desc: "Database Disciplinare", details: "Racchiude la mappatura verticale di tutti i 106 traguardi e 92 obiettivi delle 14 materie." },
 { id: "types", label: "curriculum.ts (Tipi)", category: "codice", x: 320, y: 240, desc: "Contratti TypeScript", details: "Definisce i tipi strutturali e i contratti per i ruoli di governance, le UDA e le evidenze.", labelOffset: 'bottom' },
 { id: "index", label: "index.html (Bundle)", category: "codice", x: 230, y: 60, desc: "Bundle statico compilato", details: "Punto di ingresso del client web compilato." },
 { id: "sw", label: "sw.js (Offline Cache)", category: "codice", x: 340, y: 50, desc: "PWA Service Worker", details: "Gestisce il caching intelligente degli asset esterni per garantire l'avvio offline in aula." },
 
 { id: "brain", label: "second-brain/ (Archivio storico)", category: "conoscenza", x: 450, y: 140, desc: "Fonti storiche archiviate", details: "Directory Markdown di fonti storiche non verificate e non rappresentative della configurazione attiva." },
 { id: "vol1", label: "Vol 1: Progetti & Territorio", category: "conoscenza", x: 380, y: 260, desc: "Progetti e Territorio", details: "Documenta Scuola Viva (Blender 3D), PNRR INNOVACLASS, progetto CINELAB e curvatura STEM.", labelOffset: 'top' },
 { id: "vol2", label: "Archivio Vol 2: RAV/NIV/PdM", category: "conoscenza", x: 480, y: 280, desc: "Fonte storica di autovalutazione", details: "Materiale storico da verificare; non descrive priorità attive.", labelOffset: 'bottom' },
 { id: "vol3", label: "Vol 3: Inclusione & Privacy", category: "conoscenza", x: 580, y: 260, desc: "Didattica, Inclusione e Privacy", details: "Quadro legislativo della didattica per competenze, tutele PEI/PDP ed il decalogo privacy d'aula.", labelOffset: 'top' },
 { id: "vol4", label: "Vol 4: Curricolo Fondativo", category: "conoscenza", x: 420, y: 80, desc: "Curricolo Fondativo", details: "Il testo strutturato in 5 parti raccordato alle riforme nazionali e europee." },
 { id: "vol5", label: "Archivio Vol 5: Wiki e manuale", category: "conoscenza", x: 580, y: 90, desc: "Manuale storico", details: "Descrive precedenti ipotesi di ruoli e modelli locali; non assegna autorizzazioni." },
 { id: "vol6", label: "Archivio Vol 6: Repertorio pedagogico", category: "conoscenza", x: 580, y: 185, desc: "Fonte storica non verificata", details: "Raccolta archiviata di concetti didattici." },
 { id: "vol7", label: "Archivio Vol 7: Transizione IN2025", category: "conoscenza", x: 410, y: 340, desc: "Proposta storica di transizione", details: "Fonte archiviata da confrontare con regole e configurazione correnti.", labelOffset: 'top' },
 { id: "vol8", label: "Archivio Vol 8: discipline", category: "conoscenza", x: 490, y: 365, desc: "Mappatura storica non verificata", details: "Fonte archiviata con una precedente mappatura disciplinare.", labelOffset: 'bottom' },
 { id: "vol9", label: "Archivio Vol 9: Accessibilità e privacy", category: "conoscenza", x: 570, y: 340, desc: "Appunti storici non verificati", details: "Riferimenti archiviati a WCAG, AgID e GDPR; non attestano conformità.", labelOffset: 'top' },
 { id: "vol10", label: "Archivio Vol 10: Bozza collegiale", category: "conoscenza", x: 660, y: 290, desc: "Bozza storica non approvata", details: "Materiale archiviato che non costituisce adozione o delibera formale.", labelOffset: 'bottom' },
 
 { id: "wikillm", label: "WikiLLM (consultazione locale)", category: "interazione", x: 310, y: 120, desc: "Risposte dipendenti dalle fonti", details: "Genera risposte locali non verificate che possono contenere errori." },
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


