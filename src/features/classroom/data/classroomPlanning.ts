export const CLASSROOM_STUDENT_IDS = ['st1', 'st2', 'st3', 'st4', 'st5', 'st6', 'st7', 'st8'];

export const CLASSROOM_THEME_NAME_MAP: Record<string, Record<string, string>> = {
 scientists: {
  st1: 'Einstein', st2: 'Curie', st3: 'Galileo', st4: 'Newton',
  st5: 'Tesla', st6: 'Ada Lovelace', st7: 'Darwin', st8: 'Ipazia'
 },
 classico: {
  st1: 'Socrate', st2: 'Platone', st3: 'Aristotele', st4: 'Minerva',
  st5: 'Ulisse', st6: 'Cicerone', st7: 'Omero', st8: 'Virgilio'
 },
 miti: {
  st1: 'Apollo', st2: 'Zeus', st3: 'Artemide', st4: 'Atena',
  st5: 'Dioniso', st6: 'Ercole', st7: 'Enea', st8: 'Pegaso'
 }
};

export const CLASSROOM_THEME_NAME_POOLS: Record<string, string[]> = {
 scientists: ['Einstein', 'Curie', 'Galileo', 'Newton', 'Tesla', 'Ada Lovelace', 'Darwin', 'Ipazia'],
 classico: ['Socrate', 'Platone', 'Aristotele', 'Minerva', 'Ulisse', 'Cicerone', 'Omero', 'Virgilio'],
 miti: ['Apollo', 'Zeus', 'Artemide', 'Atena', 'Dioniso', 'Ercole', 'Enea', 'Pegaso']
};

export const JIGSAW_ROLES = [
 { role: 'Scriba (Docente Base)', task: 'Redige il verbale finale.' },
 { role: 'Portavoce (Docente Avanzato)', task: 'Espone i risultati alla classe.' },
 { role: 'Facilitatore (Docente Intermedio)', task: 'Coordina il turno di parola.' },
 { role: 'Custode del Tempo (Docente Iniziale)', task: 'Monitora le tempistiche.' }
];

export const PEER_TUTORING_PAIR_NAMES = ['Coppia Alfa', 'Coppia Beta', 'Coppia Gamma', 'Coppia Delta'];

export const PEER_TUTORING_PAIR_TASKS = [
 'Consolidamento della morfosintassi.',
 'Sviluppo del calcolo mentale rapido.',
 'Sintesi critica del testo d\'aula.',
 'Sviluppo delle competenze di coding.'
];

export const LABORATORY_ROLES_A = [
 { role: 'Teorico', task: 'Analizza l\'etimologia e i casi d\'area.' },
 { role: 'Teorico', task: 'Rafforza lo schema logico-lessicale.' },
 { role: 'Documentarista', task: 'Raccoglie i riferimenti del PTOF.' },
 { role: 'Documentarista', task: 'Unisce i file d\'analisi.' }
];

export const LABORATORY_ROLES_B = [
 { role: 'Maker', task: 'Esegue proiezioni ortogonali d\'aula.' },
 { role: 'Maker', task: 'Modella l\'ingranaggio su Tinkercad.' },
 { role: 'Sperimentatore', task: 'Risolve le formule fisiche.' },
 { role: 'Sperimentatore', task: 'Testa l\'UDA sul flauto dolce.' }
];