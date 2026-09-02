import type { InstitutionalRole } from '../curriculum/types';
import type { ArenaCapability } from './capabilities';

export type ArenaProcessId =
  | 'P1_SOURCE_QUALIFICATION'
  | 'P2_CURRICULUM_CONTEXT'
  | 'P3_CURRICULUM_ANALYSIS'
  | 'P4_REVISION_REVIEW'
  | 'P5_INSTITUTIONAL_DECISION'
  | 'P6_CANONICAL_ADOPTION'
  | 'P7_PLANNING_HANDOFF';

export type ArenaProcessImplementationStatus = 'IMPLEMENTED' | 'PARTIAL' | 'NOT_IMPLEMENTED';

export type ArenaWorkQueueState =
  | 'TO_READ'
  | 'TO_VERIFY'
  | 'TO_REVIEW'
  | 'TO_DECIDE'
  | 'COMPLETED';

export interface ArenaProcessContract {
  id: ArenaProcessId;
  label: string;
  intent: string;
  input: readonly string[];
  output: readonly string[];
  humanTaskIds: readonly string[];
  consequential: boolean;
  authenticatedAuthorityRequired: boolean;
  implementationStatus: ArenaProcessImplementationStatus;
}

export interface ArenaRoleExperienceContract {
  role: Exclude<InstitutionalRole, 'non-dichiarato'>;
  primaryObject: string;
  primaryQuestions: readonly string[];
  capabilities: readonly ArenaCapability[];
  queueStates: readonly ArenaWorkQueueState[];
}

export const ARENA_PROCESS_PIPELINE: readonly ArenaProcessContract[] = [
  {
    id: 'P1_SOURCE_QUALIFICATION',
    label: 'Fonti ed evidenze',
    intent: 'Rendere il materiale consultabile e qualificare ciò che può essere usato come evidenza senza promuovere automaticamente la sua autorità.',
    input: ['bundled-source', 'user-upload', 'authority-candidate'],
    output: ['consult-only-source', 'eligible-evidence'],
    humanTaskIds: [],
    consequential: false,
    authenticatedAuthorityRequired: false,
    implementationStatus: 'IMPLEMENTED',
  },
  {
    id: 'P2_CURRICULUM_CONTEXT',
    label: 'Quadro curricolare applicabile',
    intent: 'Determinare il quadro curricolare applicabile al contesto e mostrarne provenienza e stato.',
    input: ['school-year', 'school-order', 'class-cohort', 'discipline', 'qualified-sources'],
    output: ['curriculum-baseline', 'provenance', 'applicability-state'],
    humanTaskIds: ['HT-BETA-CURRICULUM-CONTEXT'],
    consequential: false,
    authenticatedAuthorityRequired: false,
    implementationStatus: 'IMPLEMENTED',
  },
  {
    id: 'P3_CURRICULUM_ANALYSIS',
    label: 'Analisi del curricolo',
    intent: 'Individuare copertura, gap, discontinuità e candidati alla revisione mantenendoli distinti dalle decisioni.',
    input: ['curriculum-baseline', 'eligible-evidence'],
    output: ['observations', 'evidence-linked-issues', 'proposal-candidates'],
    humanTaskIds: [],
    consequential: false,
    authenticatedAuthorityRequired: false,
    implementationStatus: 'PARTIAL',
  },
  {
    id: 'P4_REVISION_REVIEW',
    label: 'Preparazione e revisione',
    intent: 'Preparare una proposta versionata, motivata e verificabile per il passaggio al decisore.',
    input: ['proposal-candidate', 'eligible-evidence', 'rationale'],
    output: ['revision-proposal-version', 'review-readiness'],
    humanTaskIds: ['HT-BETA-REVISION-PREPARE'],
    consequential: false,
    authenticatedAuthorityRequired: false,
    implementationStatus: 'IMPLEMENTED',
  },
  {
    id: 'P5_INSTITUTIONAL_DECISION',
    label: 'Decisione istituzionale',
    intent: 'Registrare la decisione esplicita di un decisore umano autorizzato su una versione stabile della proposta.',
    input: ['review-ready-proposal-version', 'authenticated-workspace-membership'],
    output: ['institutional-decision-receipt'],
    humanTaskIds: ['HT-REVISION-DECISION'],
    consequential: true,
    authenticatedAuthorityRequired: true,
    implementationStatus: 'IMPLEMENTED',
  },
  {
    id: 'P6_CANONICAL_ADOPTION',
    label: 'Adozione canonica',
    intent: 'Promuovere una decisione istituzionale valida a nuova versione canonica attraverso una transizione umana esplicita e auditabile.',
    input: ['institutional-decision-receipt', 'prepared-canonical-version', 'authenticated-workspace-membership'],
    output: ['canonical-curriculum-version', 'adoption-receipt'],
    humanTaskIds: [],
    consequential: true,
    authenticatedAuthorityRequired: true,
    implementationStatus: 'IMPLEMENTED',
  },
  {
    id: 'P7_PLANNING_HANDOFF',
    label: 'Passaggio alla pianificazione',
    intent: 'Trasferire una baseline curricolare validata alla pianificazione senza applicarla automaticamente al lavoro del docente.',
    input: ['curriculum-baseline', 'approval-state', 'provenance'],
    output: ['validated-planning-handoff'],
    humanTaskIds: ['HT-BETA-PLANNING-HANDOFF'],
    consequential: true,
    authenticatedAuthorityRequired: true,
    implementationStatus: 'IMPLEMENTED',
  },
] as const;

export const ARENA_ROLE_EXPERIENCES: readonly ArenaRoleExperienceContract[] = [
  {
    role: 'docente',
    primaryObject: 'curricolo applicabile alla propria disciplina e contesto di classe',
    primaryQuestions: ['Quale curricolo si applica?', 'Cosa è cambiato?', 'Quali evidenze lo sostengono?', 'Cosa posso proporre?', 'Cosa posso trasferire alla pianificazione?'],
    capabilities: ['CURRICULUM_READ', 'CURRICULUM_PROPOSE', 'DOCUMENT_PREPARE', 'DOCUMENT_EXPORT'],
    queueStates: ['TO_READ', 'TO_VERIFY', 'TO_REVIEW', 'COMPLETED'],
  },
  {
    role: 'dipartimento',
    primaryObject: 'coerenza verticale disciplinare',
    primaryQuestions: ['Quali gap disciplinari richiedono attenzione?', 'Quali proposte sono pronte da esaminare?', 'Le evidenze sono sufficienti?', 'Cosa deve passare al referente?'],
    capabilities: ['CURRICULUM_READ', 'CURRICULUM_PROPOSE', 'REVISION_REVIEW', 'DOCUMENT_PREPARE', 'DOCUMENT_EXPORT'],
    queueStates: ['TO_READ', 'TO_VERIFY', 'TO_REVIEW', 'COMPLETED'],
  },
  {
    role: 'referente',
    primaryObject: 'coerenza e readiness del curricolo di istituto',
    primaryQuestions: ['Dove sono i gap e le coperture mancanti?', 'Quali proposte sono bloccate?', 'Quali fonti o evidenze richiedono verifica?', 'Cosa è pronto per la decisione istituzionale?'],
    capabilities: ['CURRICULUM_READ', 'CURRICULUM_PROPOSE', 'REVISION_REVIEW', 'DOCUMENT_PREPARE', 'DOCUMENT_EXPORT'],
    queueStates: ['TO_READ', 'TO_VERIFY', 'TO_REVIEW', 'COMPLETED'],
  },
  {
    role: 'collegio',
    primaryObject: 'decisione istituzionale sulla revisione',
    primaryQuestions: ['Che cosa cambia?', 'Perché cambia?', 'Quali evidenze e revisioni lo sostengono?', 'Quale decisione devo assumere?'],
    capabilities: ['CURRICULUM_READ', 'REVISION_DECIDE', 'DOCUMENT_EXPORT'],
    queueStates: ['TO_READ', 'TO_DECIDE', 'COMPLETED'],
  },
  {
    role: 'dirigente',
    primaryObject: 'governance e readiness del processo curricolare',
    primaryQuestions: ['Il processo è pronto per la decisione?', 'Quali blocchi istituzionali restano?', 'Le fonti, versioni e ricevute sono tracciabili?'],
    capabilities: ['CURRICULUM_READ', 'REVISION_REVIEW', 'DOCUMENT_EXPORT'],
    queueStates: ['TO_READ', 'TO_VERIFY', 'TO_REVIEW', 'COMPLETED'],
  },
  {
    role: 'amministratore',
    primaryObject: 'integrità tecnica del workspace',
    primaryQuestions: ['Il workspace è integro?', 'Membership, storage, backup e restore sono operativi?', 'La release pubblicata è verificabile?'],
    capabilities: ['CURRICULUM_READ', 'WORKSPACE_ADMIN'],
    queueStates: ['TO_READ', 'TO_VERIFY', 'COMPLETED'],
  },
] as const;

export const getArenaProcessContract = (id: ArenaProcessId): ArenaProcessContract => {
  const process = ARENA_PROCESS_PIPELINE.find((candidate) => candidate.id === id);
  if (!process) throw new Error(`Unknown Arena process: ${id}`);
  return process;
};

export const getArenaRoleExperience = (
  role: Exclude<InstitutionalRole, 'non-dichiarato'>
): ArenaRoleExperienceContract => {
  const experience = ARENA_ROLE_EXPERIENCES.find((candidate) => candidate.role === role);
  if (!experience) throw new Error(`Unknown Arena role experience: ${role}`);
  return experience;
};

export const isCanonicalAdoptionImplemented = (): boolean =>
  getArenaProcessContract('P6_CANONICAL_ADOPTION').implementationStatus === 'IMPLEMENTED';
