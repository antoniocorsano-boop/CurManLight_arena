import type { RevisionProposal, RevisionProposalStatus } from '../../domain/revision';
import type {
  ArenaHumanTaskProjection,
  HumanTaskCapability,
  HumanTaskStakeholder,
  HumanTaskStakeholderRequirement,
} from './humanTask';
import { evaluateHumanTaskCognitiveGate } from './humanTask';

interface RevisionHumanTaskDescriptor {
  stateLabel: string;
  goal: string;
  primaryLabel: string;
  capability: HumanTaskCapability;
  responsibleStakeholder: HumanTaskStakeholder;
  requiredStakeholders: readonly HumanTaskStakeholder[];
  nextStepLabel?: string;
  requiresRationale: boolean;
}

const DESCRIPTORS: Record<RevisionProposalStatus, RevisionHumanTaskDescriptor> = {
  draft: {
    stateLabel: 'Da completare',
    goal: 'Completa la motivazione e controlla che il confronto tra testo vigente e proposta sia comprensibile.',
    primaryLabel: 'Prepara per la revisione',
    capability: 'CURRICULUM_PROPOSE',
    responsibleStakeholder: 'docente',
    requiredStakeholders: ['docente', 'sistema'],
    nextStepLabel: 'Revisione della proposta',
    requiresRationale: true,
  },
  'ready-for-review': {
    stateLabel: 'Pronta per il confronto',
    goal: 'Verifica che testo, motivazione e riferimenti siano sufficienti prima dell’invio.',
    primaryLabel: 'Invia al confronto',
    capability: 'REVISION_REVIEW',
    responsibleStakeholder: 'docente',
    requiredStakeholders: ['docente', 'dipartimento', 'referente', 'sistema'],
    nextStepLabel: 'Presa in carico della revisione',
    requiresRationale: false,
  },
  submitted: {
    stateLabel: 'Da prendere in carico',
    goal: 'Il referente deve poter comprendere immediatamente cosa cambia e su quali riferimenti si basa la proposta.',
    primaryLabel: 'Prendi in carico',
    capability: 'REVISION_REVIEW',
    responsibleStakeholder: 'referente',
    requiredStakeholders: ['docente', 'dipartimento', 'referente', 'sistema'],
    nextStepLabel: 'Valutazione della proposta',
    requiresRationale: false,
  },
  'under-review': {
    stateLabel: 'In revisione',
    goal: 'Confronta la proposta con il testo vigente e scegli un esito motivato senza attribuire al sistema la decisione.',
    primaryLabel: 'Valuta la proposta',
    capability: 'REVISION_REVIEW',
    responsibleStakeholder: 'referente',
    requiredStakeholders: ['docente', 'dipartimento', 'referente', 'sistema'],
    nextStepLabel: 'Modifiche richieste oppure passaggio alla decisione',
    requiresRationale: false,
  },
  'changes-requested': {
    stateLabel: 'Modifiche richieste',
    goal: 'Rivedi la proposta sulla base delle osservazioni e prepara una nuova versione verificabile.',
    primaryLabel: 'Prepara una nuova versione',
    capability: 'CURRICULUM_PROPOSE',
    responsibleStakeholder: 'docente',
    requiredStakeholders: ['docente', 'referente', 'sistema'],
    nextStepLabel: 'Nuovo controllo della proposta',
    requiresRationale: false,
  },
  withdrawn: {
    stateLabel: 'Ritirata',
    goal: 'Conserva la traccia della proposta ritirata senza confonderla con contenuto adottato.',
    primaryLabel: 'Archivia la proposta',
    capability: 'REVISION_REVIEW',
    responsibleStakeholder: 'referente',
    requiredStakeholders: ['docente', 'referente', 'sistema'],
    nextStepLabel: 'Archivio locale',
    requiresRationale: false,
  },
  'accepted-for-decision': {
    stateLabel: 'Pronta per decisione umana',
    goal: 'La proposta è istruita: la decisione deve essere registrata da una figura umana competente con motivazione e provenienza.',
    primaryLabel: 'Registra la decisione umana',
    capability: 'REVISION_DECIDE',
    responsibleStakeholder: 'collegio',
    requiredStakeholders: ['referente', 'collegio', 'sistema'],
    nextStepLabel: 'Registrazione dell’esito e produzione documentale',
    requiresRationale: false,
  },
  rejected: {
    stateLabel: 'Respinta',
    goal: 'Mantieni leggibile l’esito e la sua provenienza prima dell’archiviazione.',
    primaryLabel: 'Archivia la proposta',
    capability: 'REVISION_REVIEW',
    responsibleStakeholder: 'referente',
    requiredStakeholders: ['docente', 'referente', 'sistema'],
    nextStepLabel: 'Archivio locale',
    requiresRationale: false,
  },
  archived: {
    stateLabel: 'Archiviata',
    goal: 'Consulta la proposta come storico senza presentarla come lavoro attivo o curricolo vigente.',
    primaryLabel: 'Consulta lo storico',
    capability: 'CURRICULUM_READ',
    responsibleStakeholder: 'docente',
    requiredStakeholders: ['docente', 'sistema'],
    requiresRationale: false,
  },
  legacy: {
    stateLabel: 'Storico da verificare',
    goal: 'Consulta il dato legacy mantenendo visibile che non appartiene al flusso canonico corrente.',
    primaryLabel: 'Controlla lo storico',
    capability: 'CURRICULUM_READ',
    responsibleStakeholder: 'docente',
    requiredStakeholders: ['docente', 'sistema'],
    requiresRationale: false,
  },
};

const evidenceRequirements = (
  proposal: RevisionProposal,
  descriptor: RevisionHumanTaskDescriptor
): HumanTaskStakeholderRequirement[] => {
  const baseEvidence = ['current-text', 'proposed-text'];
  const authorEvidence = descriptor.requiresRationale
    ? [...baseEvidence, 'rationale']
    : baseEvidence;

  return descriptor.requiredStakeholders.map((stakeholder) => {
    if (stakeholder === 'sistema') {
      return {
        stakeholder,
        responsibility: 'Esporre stato, provenienza e limiti senza assumere decisioni istituzionali.',
        evidenceRefs: ['decision-boundary'],
      };
    }

    if (stakeholder === 'docente') {
      return {
        stakeholder,
        responsibility: 'Comprendere cosa cambia, perché viene proposto e quale passaggio viene dopo.',
        evidenceRefs: authorEvidence,
      };
    }

    if (stakeholder === 'dipartimento') {
      return {
        stakeholder,
        responsibility: 'Confrontare testo vigente e proposta senza ricostruire il contesto da documenti separati.',
        evidenceRefs: baseEvidence,
      };
    }

    if (stakeholder === 'referente') {
      return {
        stakeholder,
        responsibility: 'Verificare stato, contenuto e provenienza prima del passaggio successivo.',
        evidenceRefs: baseEvidence,
      };
    }

    if (stakeholder === 'collegio') {
      return {
        stakeholder,
        responsibility: 'Disporre di una proposta istruita e comprensibile prima della decisione umana.',
        evidenceRefs: baseEvidence,
      };
    }

    return {
      stakeholder,
      responsibility: 'Comprendere il proprio compito nel processo corrente.',
      evidenceRefs: baseEvidence,
    };
  });
};

export const buildRevisionHumanTaskProjection = (
  proposal: RevisionProposal
): ArenaHumanTaskProjection => {
  const descriptor = DESCRIPTORS[proposal.status];
  const canonicalSources = [proposal.curriculumVersionRef, ...proposal.sourceRefs];
  const uniqueSources = canonicalSources.filter(
    (source, index, all) => all.findIndex((candidate) => candidate.id === source.id) === index
  );

  const evidence: ArenaHumanTaskProjection['evidence'] = [
    {
      id: 'current-text',
      label: 'Testo curricolare vigente usato nel confronto',
      origin: 'canonical',
      sourceRef: proposal.curriculumVersionRef,
    },
    {
      id: 'proposed-text',
      label: 'Testo proposto nella versione corrente',
      origin: proposal.metadata.origin === 'assisted' ? 'system-derived' : 'human',
    },
    ...(proposal.rationale.trim()
      ? [{ id: 'rationale', label: 'Motivazione della proposta', origin: 'human' as const }]
      : []),
    {
      id: 'decision-boundary',
      label: 'La decisione istituzionale resta nel perimetro umano',
      origin: 'system-derived',
    },
  ];

  return {
    id: `revision-human-task-${proposal.id}`,
    stage: proposal.status === 'accepted-for-decision' ? 'decision' : 'revision',
    title: proposal.targetNodeRef.snapshotLabel || 'Proposta di revisione curricolare',
    goal: descriptor.goal,
    stateLabel: descriptor.stateLabel,
    sourceRefs: uniqueSources,
    evidence,
    stakeholderRequirements: evidenceRequirements(proposal, descriptor),
    primaryAction: {
      label: descriptor.primaryLabel,
      capability: descriptor.capability,
      responsibleStakeholder: descriptor.responsibleStakeholder,
      humanConfirmationRequired: descriptor.capability === 'REVISION_DECIDE',
    },
    nextStepLabel: descriptor.nextStepLabel,
  };
};

export const evaluateRevisionHumanTask = (proposal: RevisionProposal) => {
  const descriptor = DESCRIPTORS[proposal.status];
  const projection = buildRevisionHumanTaskProjection(proposal);
  return {
    projection,
    receipt: evaluateHumanTaskCognitiveGate(projection, descriptor.requiredStakeholders),
  };
};
