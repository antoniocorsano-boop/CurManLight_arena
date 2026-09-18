import type { TechnologyArtifactCode } from './technologyArtifacts';

export interface TechnologyArtifactFieldGroup {
  groupId: string;
  label: string;
  fieldKeys: readonly string[];
}

export interface TechnologyArtifactTemplateSchema {
  code: TechnologyArtifactCode;
  schemaVersion: 'technology-annex-schema-v1';
  groups: readonly TechnologyArtifactFieldGroup[];
}

export const TECHNOLOGY_ARTIFACT_TEMPLATE_SCHEMAS: readonly TechnologyArtifactTemplateSchema[] = [
  {
    code: 'A',
    schemaVersion: 'technology-annex-schema-v1',
    groups: [
      { groupId: 'variation-matrix', label: 'Matrice delle variazioni', fieldKeys: ['nucleusOrArea', 'currentCurriculum', 'proposedUpdate', 'operationalImpact'] },
      { groupId: 'variation-classification', label: 'Classificazione variazione', fieldKeys: ['variationCode', 'variationMeaning'] },
      { groupId: 'collegial-outcome', label: 'Esito del confronto collegiale', fieldKeys: ['nucleusOrArea', 'variationCode', 'decision', 'notesOrActions', 'meetingDate', 'workingGroup', 'resultingCurriculumVersion'] },
    ],
  },
  {
    code: 'B',
    schemaVersion: 'technology-annex-schema-v1',
    groups: [
      { groupId: 'identification', label: 'Identificazione', fieldKeys: ['nucleus', 'classes', 'periodOrDuration', 'teacherOrWorkingGroup', 'linkedUdaOrNuclei'] },
      { groupId: 'disciplinary-framework', label: 'Quadro disciplinare', fieldKeys: ['essentialKnowledge', 'skills', 'expectedCompetence', 'observableEvidence', 'essentialTechnicalVocabulary'] },
      { groupId: 'vertical-progression', label: 'Progressione verticale', fieldKeys: ['grade1', 'grade2', 'grade3'] },
      { groupId: 'didactic-design', label: 'Progettazione didattica', fieldKeys: ['problemOrSituation', 'expectedProduct', 'operationalPhases', 'methodologies', 'toolsAndMaterials', 'safety', 'inclusionMeasures', 'crossCurricularConnections', 'digitalDataAiPurpose', 'digitalDataAiSources', 'humanVerification', 'privacy'] },
      { groupId: 'assessment-monitoring', label: 'Valutazione e monitoraggio', fieldKeys: ['knowledgeAssessment', 'operationalSkillsAssessment', 'competenceProcessAssessment', 'productEvidenceAssessment', 'selfAssessment', 'recoveryEnhancement', 'reviewOutcome', 'nextCycleNotes'] },
    ],
  },
  {
    code: 'C',
    schemaVersion: 'technology-annex-schema-v1',
    groups: [
      { groupId: 'general-data', label: 'Dati generali UDA', fieldKeys: ['title', 'classOrSection', 'period', 'plannedDuration', 'nucleusRefs', 'crossCurricularConnections'] },
      { groupId: 'task-results', label: 'Compito e risultati attesi', fieldKeys: ['problemSituation', 'authenticTask', 'finalProduct', 'essentialKnowledge', 'skills', 'expectedCompetence', 'assessableEvidence'] },
      { groupId: 'sequence', label: 'Sequenza operativa', fieldKeys: ['activation', 'problemAnalysis', 'requirementsAndHypotheses', 'designOrRepresentation', 'realisationOrPrototype', 'verificationAndTest', 'improvement', 'restitutionAndReflection'] },
      { groupId: 'methods-inclusion-digital-safety', label: 'Metodologie, inclusione, digitale e sicurezza', fieldKeys: ['methodologies', 'inclusion', 'digitalPurpose', 'digitalSources', 'humanSupervision', 'privacyAndSecurity', 'safetyRules'] },
      { groupId: 'assessment', label: 'Valutazione', fieldKeys: ['knowledge', 'designMethod', 'technicalDrawingCommunication', 'productPrototype', 'digitalAi', 'socialCivicCompetences'] },
      { groupId: 'closure-improvement', label: 'Chiusura e miglioramento', fieldKeys: ['learningEvidence', 'difficulties', 'recoveryActions', 'enhancementActions', 'nextEditionChanges'] },
    ],
  },
  {
    code: 'D',
    schemaVersion: 'technology-annex-schema-v1',
    groups: [
      { groupId: 'general-rubric', label: 'Rubrica trasversale di Tecnologia', fieldKeys: ['technicalUnderstanding', 'designMethod', 'representationCommunication', 'sustainabilityResponsibility', 'digitalDataAi', 'autonomyCollaboration'] },
      { groupId: 'technical-drawing-rubric', label: 'Rubrica tavola tecnica / rappresentazione', fieldKeys: ['geometricCorrectness', 'precisionAndTools', 'graphicStandardsAndDimensioning', 'cleanlinessReadability', 'technicalCommunication'] },
      { groupId: 'project-prototype-rubric', label: 'Rubrica compito progettuale / prototipo', fieldKeys: ['needConstraintAnalysis', 'solutionQuality', 'realisationPrototype', 'verificationImprovement', 'documentation'] },
    ],
  },
  {
    code: 'E',
    schemaVersion: 'technology-annex-schema-v1',
    groups: [
      { groupId: 'laboratory-observation', label: 'Osservazione laboratorio', fieldKeys: ['safetyAndTools', 'workspaceOrder', 'procedures', 'measurementsAndData', 'qualityControl', 'errorCorrectionImprovement', 'documentation'] },
      { groupId: 'transversal-competences', label: 'Competenze trasversali', fieldKeys: ['roleAndCommitments', 'collaborationAndListening', 'argumentation', 'helpAndFeedback', 'problemConflictSolving', 'autonomy', 'responsibleSourcesDataDigital'] },
      { groupId: 'observation-summary', label: 'Sintesi osservativa', fieldKeys: ['observedStrength', 'aspectToConsolidate', 'nextDidacticAction'] },
    ],
  },
  {
    code: 'F',
    schemaVersion: 'technology-annex-schema-v1',
    groups: [
      { groupId: 'activity-data', label: 'Dati dell’attività', fieldKeys: ['activityOrUdaTitle', 'class', 'dateOrPeriod', 'portfolioEvidence'] },
      { groupId: 'student-self-assessment', label: 'Autovalutazione studente', fieldKeys: ['problemUnderstanding', 'technicalKnowledgeVocabulary', 'method', 'dataResultChecking', 'representationCommunication', 'collaborationRules', 'responsibleDigitalAi'] },
      { groupId: 'reflection', label: 'Riflessione sul processo', fieldKeys: ['mainLearning', 'bestPart', 'mainDifficulty', 'strategyUsed', 'whatToChange', 'nextGoal'] },
      { groupId: 'responsible-digital-ai', label: 'Uso responsabile del digitale e dell’IA', fieldKeys: ['toolAndPurpose', 'dataAndSources', 'humanVerification', 'personalDataProtection', 'recognizedLimitOrError'] },
      { groupId: 'portfolio', label: 'Portfolio', fieldKeys: ['evidence', 'selectionReason', 'whatItDemonstrates', 'teacherFeedback'] },
    ],
  },
  {
    code: 'G',
    schemaVersion: 'technology-annex-schema-v1',
    groups: [
      { groupId: 'class-overview', label: 'Quadro di classe per nucleo / UDA', fieldKeys: ['nucleusOrUda', 'evidenceUsed', 'prevailingOutcomes', 'recurringWeaknesses', 'actions'] },
      { groupId: 'recovery-enhancement', label: 'Registro recupero e potenziamento', fieldKeys: ['identifiedNeed', 'intervention', 'recipients', 'period', 'verificationEvidence', 'outcome'] },
      { groupId: 'monitoring-indicators', label: 'Indicatori di monitoraggio', fieldKeys: ['essentialKnowledge', 'drawingRepresentation', 'designMethod', 'digitalDataAi', 'socialCivicCompetences', 'participationAutonomy'] },
      { groupId: 'continuity', label: 'Continuità', fieldKeys: ['transition', 'evidenceConsidered', 'continuityPoints', 'aspectsToMonitor', 'agreedActions'] },
      { groupId: 'periodic-summary', label: 'Sintesi periodica', fieldKeys: ['consolidatedLearning', 'sharedWeaknesses', 'effectivePractices', 'udaOrToolsToReview', 'enhancementToMaintain'] },
    ],
  },
  {
    code: 'H',
    schemaVersion: 'technology-annex-schema-v1',
    groups: [
      { groupId: 'minutes-metadata', label: 'Verbale di dipartimento', fieldKeys: ['dateTimePlace', 'chair', 'secretary', 'presentAbsent', 'agenda', 'documentsAndEvidenceExamined'] },
      { groupId: 'discussion-decisions', label: 'Discussione e decisioni', fieldKeys: ['agendaItem', 'discussionSummary', 'decision', 'responsibleAndDeadline'] },
      { groupId: 'document-effects', label: 'Effetti sui documenti curricolari', fieldKeys: ['documentOrAnnex', 'interventionType', 'nextVersion', 'responsible', 'status'] },
      { groupId: 'decision-register', label: 'Registro delle decisioni', fieldKeys: ['decisionId', 'date', 'subject', 'decision', 'motivationOrEvidence', 'affectedDocument', 'status'] },
      { groupId: 'closure', label: 'Chiusura', fieldKeys: ['postponedDecisions', 'nextVerification', 'signatures'] },
    ],
  },
] as const;

export function getTechnologyArtifactTemplateSchema(
  code: TechnologyArtifactCode,
): TechnologyArtifactTemplateSchema {
  const schema = TECHNOLOGY_ARTIFACT_TEMPLATE_SCHEMAS.find(candidate => candidate.code === code);
  if (!schema) throw new Error(`TECHNOLOGY_ARTIFACT_SCHEMA_NOT_FOUND: ${code}`);
  return schema;
}
