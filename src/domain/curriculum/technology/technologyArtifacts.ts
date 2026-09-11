export type TechnologyArtifactCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export type TechnologyArtifactKind =
  | 'CHANGE_MATRIX'
  | 'NUCLEUS_DESIGN_SHEET'
  | 'UDA_TEMPLATE'
  | 'ASSESSMENT_RUBRICS'
  | 'OBSERVATION_GRIDS'
  | 'STUDENT_SELF_ASSESSMENT_PORTFOLIO'
  | 'OUTCOMES_RECOVERY_ENRICHMENT_CONTINUITY_MONITORING'
  | 'DEPARTMENT_MINUTES_DECISION_REGISTER';

export type TechnologyArtifactOperationalStatus =
  | 'WORKING_TEMPLATE'
  | 'DRAFT_INSTANCE'
  | 'DECISION_REQUIRED'
  | 'ADOPTED_INSTANCE'
  | 'SUPERSEDED';

export interface TechnologyCurriculumArtifactDefinition {
  code: TechnologyArtifactCode;
  artifactKind: TechnologyArtifactKind;
  label: string;
  purpose: string;
  requiresCurriculumVersionRef: true;
  requiresNodeRefs: boolean;
  requiresDecisionRefs: boolean;
}

export interface TechnologyCurriculumArtifactInstance {
  artifactRef: string;
  code: TechnologyArtifactCode;
  artifactKind: TechnologyArtifactKind;
  curriculumVersionRef: string;
  segmentRefs: readonly string[];
  nodeRefs: readonly string[];
  decisionRefs: readonly string[];
  sourceRef: string;
  status: TechnologyArtifactOperationalStatus;
  snapshotLabel: string;
}

export const TECHNOLOGY_ARTIFACT_DEFINITIONS: readonly TechnologyCurriculumArtifactDefinition[] = [
  {
    code: 'A',
    artifactKind: 'CHANGE_MATRIX',
    label: 'Matrice delle variazioni dal curricolo vigente al curricolo aggiornato',
    purpose: 'Confronto collegiale tra curricolo vigente e proposta aggiornata, con classificazione della variazione e decisione.',
    requiresCurriculumVersionRef: true,
    requiresNodeRefs: true,
    requiresDecisionRefs: true,
  },
  {
    code: 'B',
    artifactKind: 'NUCLEUS_DESIGN_SHEET',
    label: 'Scheda di progettazione per nucleo fondante',
    purpose: 'Progettazione di un nucleo con conoscenze, abilità, competenza attesa, evidenze, progressione, metodologie e valutazione.',
    requiresCurriculumVersionRef: true,
    requiresNodeRefs: true,
    requiresDecisionRefs: false,
  },
  {
    code: 'C',
    artifactKind: 'UDA_TEMPLATE',
    label: 'Formato UDA di Tecnologia',
    purpose: 'Progettazione di UDA con situazione-problema, compito autentico, risultati attesi, sequenza operativa, valutazione e miglioramento.',
    requiresCurriculumVersionRef: true,
    requiresNodeRefs: true,
    requiresDecisionRefs: false,
  },
  {
    code: 'D',
    artifactKind: 'ASSESSMENT_RUBRICS',
    label: 'Rubriche di valutazione',
    purpose: 'Rubriche comuni per comprensione tecnica, metodo progettuale, rappresentazione, sostenibilità, digitale/IA, autonomia e collaborazione.',
    requiresCurriculumVersionRef: true,
    requiresNodeRefs: true,
    requiresDecisionRefs: false,
  },
  {
    code: 'E',
    artifactKind: 'OBSERVATION_GRIDS',
    label: 'Griglie di osservazione laboratorio e competenze trasversali',
    purpose: 'Osservazione strutturata di sicurezza, procedure, misure/dati, qualità, collaborazione, autonomia e uso responsabile delle fonti.',
    requiresCurriculumVersionRef: true,
    requiresNodeRefs: true,
    requiresDecisionRefs: false,
  },
  {
    code: 'F',
    artifactKind: 'STUDENT_SELF_ASSESSMENT_PORTFOLIO',
    label: 'Scheda di autovalutazione studente e portfolio',
    purpose: 'Autovalutazione del processo e selezione di evidenze per il portfolio, compreso l’uso responsabile del digitale e dell’IA.',
    requiresCurriculumVersionRef: true,
    requiresNodeRefs: true,
    requiresDecisionRefs: false,
  },
  {
    code: 'G',
    artifactKind: 'OUTCOMES_RECOVERY_ENRICHMENT_CONTINUITY_MONITORING',
    label: 'Monitoraggio esiti, recupero, potenziamento e continuità',
    purpose: 'Lettura periodica degli esiti, fragilità, azioni di recupero/potenziamento e continuità verticale.',
    requiresCurriculumVersionRef: true,
    requiresNodeRefs: true,
    requiresDecisionRefs: false,
  },
  {
    code: 'H',
    artifactKind: 'DEPARTMENT_MINUTES_DECISION_REGISTER',
    label: 'Verbale di dipartimento e registro delle decisioni',
    purpose: 'Registrazione di discussioni, decisioni, effetti sui documenti curricolari, responsabilità, scadenze e versioni.',
    requiresCurriculumVersionRef: true,
    requiresNodeRefs: false,
    requiresDecisionRefs: true,
  },
] as const;

export function buildTechnologyWorkingArtifactGraph(input: {
  curriculumVersionRef: string;
  segmentRefs: readonly string[];
  nodeRefs: readonly string[];
  sourceRef: string;
}): readonly TechnologyCurriculumArtifactInstance[] {
  return TECHNOLOGY_ARTIFACT_DEFINITIONS.map((definition) => ({
    artifactRef: `technology-artifact:${definition.code}:${input.curriculumVersionRef}`,
    code: definition.code,
    artifactKind: definition.artifactKind,
    curriculumVersionRef: input.curriculumVersionRef,
    segmentRefs: input.segmentRefs,
    nodeRefs: definition.requiresNodeRefs ? input.nodeRefs : [],
    decisionRefs: [],
    sourceRef: input.sourceRef,
    status: definition.requiresDecisionRefs ? 'DECISION_REQUIRED' : 'WORKING_TEMPLATE',
    snapshotLabel: `Allegato ${definition.code} — ${definition.label}`,
  }));
}

export function canArtifactBeAdopted(
  artifact: TechnologyCurriculumArtifactInstance,
): boolean {
  const definition = TECHNOLOGY_ARTIFACT_DEFINITIONS.find(candidate => candidate.code === artifact.code);
  if (!definition) return false;
  if (!artifact.curriculumVersionRef.trim()) return false;
  if (definition.requiresNodeRefs && artifact.nodeRefs.length === 0) return false;
  if (definition.requiresDecisionRefs && artifact.decisionRefs.length === 0) return false;
  return true;
}
