import type { CurriculumMap } from '../../features/session/types/appViewContracts';
import { parseSchoolYear } from '../../lib/academicYear';
import { resolveNationalFramework } from '../../lib/curriculumTransitionResolver';
import type { SchoolOrder } from '../../types/curriculum';
import type { Decision, RevisionArchive, RevisionProposal } from '../revision';
import { canonicalSerialize, fnv1a } from './signatures';
import {
  CML_CURRICULUM_CONTEXT_CONTRACT,
  createCmlLocalHandoffV2,
  type CmlLocalHandoffV2,
  type CurriculumContextForClassV1,
  type CurriculumRequirementV1,
  type TransitionRemodulationV1,
} from './interopCurriculumContextV2';
import type {
  AnnualPlanningFrameworkPayload,
  CmlCanonicalRef,
  CmlInteropEnvelope,
  PlanningConstraint,
} from './interopV1';

const ARENA_NAMESPACE = 'curmanlight.arena';
const TRANSITION_START_YEAR = 2026;

export interface ArenaRuntimeCurriculumBindingInput {
  readonly institutionId: string;
  readonly schoolYearRef: string;
  readonly schoolOrder: SchoolOrder;
  readonly classLevel: number;
  readonly sectionRef?: string;
  readonly cohortRef?: string;
  readonly disciplineRef: string;
  /** The exact local curriculum map currently consumed by the Arena runtime. */
  readonly curriculumMap: CurriculumMap;
  /** The exact institutional revision archive currently persisted by Arena. */
  readonly revisionArchive: RevisionArchive;
  readonly sourceVersion?: string;
  readonly emittedAt?: string;
}

export interface ArenaRuntimeCurriculumProjection {
  readonly curricularContext: CurriculumContextForClassV1;
  readonly annualPlanningFramework: CmlInteropEnvelope<AnnualPlanningFrameworkPayload>;
}

function nonEmpty(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function ref(entityType: string, entityId: string, versionId?: string): CmlCanonicalRef {
  return {
    namespace: ARENA_NAMESPACE,
    entityType,
    entityId,
    ...(versionId ? { versionId } : {}),
  };
}

function stableId(prefix: string, material: unknown): string {
  return `${prefix}-${fnv1a(canonicalSerialize(material))}`;
}

function nationalFrameworkRef(framework: 'IN2012' | 'IN2025'): CmlCanonicalRef {
  return ref(
    'NationalFramework',
    framework,
    framework === 'IN2025' ? 'DM-221-2025' : 'DM-254-2012',
  );
}

function latestDecisionForProposal(archive: RevisionArchive, proposal: RevisionProposal): Decision | undefined {
  return archive.decisions
    .filter(decision => decision.proposalRef.id === proposal.id)
    .sort((a, b) => b.metadata.createdAt.localeCompare(a.metadata.createdAt))[0];
}

function findRevisionProposal(archive: RevisionArchive, legacyId: string, oldText: string): RevisionProposal | undefined {
  return archive.proposals.find(proposal => proposal.id === legacyId)
    ?? archive.proposals.find(proposal => proposal.currentTextSnapshot === oldText);
}

function selectedTransitionText(
  archive: RevisionArchive,
  proposal: RevisionProposal | undefined,
  fallbackText: string,
): { readonly text?: string; readonly sourceRefs: readonly CmlCanonicalRef[] } {
  if (!proposal) {
    return {
      text: fallbackText,
      sourceRefs: [],
    };
  }

  const proposalRef = ref('RevisionProposal', proposal.id, String(proposal.currentVersionRef));
  const decision = latestDecisionForProposal(archive, proposal);
  if (!decision) {
    return { text: proposal.proposedText || fallbackText, sourceRefs: [proposalRef] };
  }

  const decisionRef = ref('RevisionDecision', decision.id);
  if (decision.outcome === 'reject' || decision.outcome === 'defer' || decision.outcome === 'return-for-revision') {
    return { sourceRefs: [proposalRef, decisionRef] };
  }

  if (decision.outcome === 'approve-with-changes') {
    const version = archive.versions.find(candidate => candidate.id === decision.proposalVersionRef.id);
    return {
      text: version?.proposedText || proposal.proposedText || fallbackText,
      sourceRefs: [proposalRef, decisionRef],
    };
  }

  if (decision.outcome === 'approve') {
    return {
      text: proposal.proposedText || fallbackText,
      sourceRefs: [proposalRef, decisionRef],
    };
  }

  return {
    text: fallbackText,
    sourceRefs: [proposalRef, decisionRef],
  };
}

function makeRequirement(input: {
  readonly disciplineRef: string;
  readonly schoolOrder: SchoolOrder;
  readonly classLevel: number;
  readonly kind: CurriculumRequirementV1['kind'];
  readonly authorityLevel: CurriculumRequirementV1['authorityLevel'];
  readonly description: string;
  readonly coverageRequired: boolean;
  readonly sourceRefs: readonly CmlCanonicalRef[];
  readonly transitionOriginRef?: CmlCanonicalRef;
  readonly sourceNodeRef?: CmlCanonicalRef;
}): CurriculumRequirementV1 {
  const identityMaterial = {
    disciplineRef: input.disciplineRef,
    schoolOrder: input.schoolOrder,
    classLevel: input.classLevel,
    kind: input.kind,
    authorityLevel: input.authorityLevel,
    description: input.description,
  };
  const requirementId = stableId('req', identityMaterial);
  return {
    requirementId,
    kind: input.kind,
    authorityLevel: input.authorityLevel,
    curriculumNodeRef: input.sourceNodeRef ?? ref('CurriculumNodeProjection', stableId('node', identityMaterial)),
    description: input.description,
    coverageRequired: input.coverageRequired,
    sourceRefs: input.sourceRefs,
    ...(input.transitionOriginRef ? { transitionOriginRef: input.transitionOriginRef } : {}),
  };
}

function deduplicateRequirements(requirements: readonly CurriculumRequirementV1[]): CurriculumRequirementV1[] {
  const seen = new Set<string>();
  return requirements.filter(requirement => {
    if (seen.has(requirement.requirementId)) return false;
    seen.add(requirement.requirementId);
    return true;
  });
}

export function projectArenaRuntimeCurriculumV2(
  input: ArenaRuntimeCurriculumBindingInput,
): ArenaRuntimeCurriculumProjection {
  if (!nonEmpty(input.institutionId)) throw new Error('Arena runtime binding requires institutionId.');
  if (!nonEmpty(input.disciplineRef)) throw new Error('Arena runtime binding requires disciplineRef.');
  if (!nonEmpty(input.sectionRef) && !nonEmpty(input.cohortRef)) {
    throw new Error('Arena runtime binding requires sectionRef or cohortRef.');
  }

  const schoolYear = parseSchoolYear(input.schoolYearRef);
  if (!schoolYear) throw new Error('Arena runtime binding requires schoolYearRef in YYYY-YYYY format.');

  const level = input.curriculumMap[input.disciplineRef]?.[input.schoolOrder];
  if (!level) throw new Error('Arena runtime binding cannot find the current curriculum level for the requested discipline/order.');

  const frameworkResolution = resolveNationalFramework({
    schoolOrder: input.schoolOrder,
    schoolYear,
    classLevel: input.classLevel,
  });
  if (frameworkResolution.status !== 'resolved' || !frameworkResolution.framework) {
    throw new Error('Arena runtime binding cannot resolve the national curriculum framework for this class.');
  }

  const currentFrameworkRef = nationalFrameworkRef(frameworkResolution.framework);
  const transitionTargetRef = nationalFrameworkRef('IN2025');
  const levelVersionHash = fnv1a(canonicalSerialize(level));
  const revisionVersionHash = fnv1a(canonicalSerialize({
    proposals: input.revisionArchive.proposals,
    versions: input.revisionArchive.versions,
    decisions: input.revisionArchive.decisions,
  }));
  const legacyLevelRef = ref(
    'RuntimeCurriculumLevel',
    `${input.disciplineRef}:${input.schoolOrder}`,
    levelVersionHash,
  );
  const approvalProcessRef = ref(
    'CurriculumApprovalProcess',
    `${input.institutionId}:${input.disciplineRef}`,
    revisionVersionHash,
  );
  const curriculumRef = ref('InstituteCurriculum', `${input.institutionId}:${input.disciplineRef}`);

  const baselineSourceRefs = [currentFrameworkRef, legacyLevelRef];
  const requirements: CurriculumRequirementV1[] = [];

  level.traguardi.forEach(description => {
    if (!nonEmpty(description)) return;
    requirements.push(makeRequirement({
      disciplineRef: input.disciplineRef,
      schoolOrder: input.schoolOrder,
      classLevel: input.classLevel,
      kind: 'COMPETENCE',
      authorityLevel: 'NATIONAL_PRESCRIPTIVE',
      description,
      coverageRequired: true,
      sourceRefs: baselineSourceRefs,
    }));
  });

  level.obiettivi.forEach(description => {
    if (!nonEmpty(description)) return;
    requirements.push(makeRequirement({
      disciplineRef: input.disciplineRef,
      schoolOrder: input.schoolOrder,
      classLevel: input.classLevel,
      kind: 'SPECIFIC_LEARNING_OBJECTIVE',
      authorityLevel: 'NATIONAL_PRESCRIPTIVE',
      description,
      coverageRequired: true,
      sourceRefs: baselineSourceRefs,
    }));
  });

  (level.nucleiFondanti ?? []).forEach(description => {
    if (!nonEmpty(description)) return;
    requirements.push(makeRequirement({
      disciplineRef: input.disciplineRef,
      schoolOrder: input.schoolOrder,
      classLevel: input.classLevel,
      kind: 'ESSENTIAL_KNOWLEDGE',
      authorityLevel: 'INSTITUTIONAL_REQUIRED',
      description,
      coverageRequired: true,
      sourceRefs: [legacyLevelRef],
    }));
  });

  level.evidenze.forEach(description => {
    if (!nonEmpty(description)) return;
    requirements.push(makeRequirement({
      disciplineRef: input.disciplineRef,
      schoolOrder: input.schoolOrder,
      classLevel: input.classLevel,
      kind: 'INSTITUTIONAL_REQUIREMENT',
      authorityLevel: 'RECOMMENDED',
      description,
      coverageRequired: false,
      sourceRefs: [legacyLevelRef],
    }));
  });

  const transitionalLegacyCohort = schoolYear.startYear >= TRANSITION_START_YEAR
    && frameworkResolution.framework === 'IN2012'
    && input.schoolOrder !== 'infanzia';

  const transitionRequirementIds: string[] = [];
  const transitionSourceRefs: CmlCanonicalRef[] = [currentFrameworkRef, transitionTargetRef, legacyLevelRef];

  if (transitionalLegacyCohort) {
    level.proposals.forEach(legacyProposal => {
      const revisionProposal = findRevisionProposal(input.revisionArchive, legacyProposal.id, legacyProposal.oldText);
      const selected = selectedTransitionText(input.revisionArchive, revisionProposal, legacyProposal.newText);
      transitionSourceRefs.push(...selected.sourceRefs);
      if (!selected.text || !nonEmpty(selected.text)) return;

      const originRef = revisionProposal
        ? ref('RevisionProposal', revisionProposal.id, String(revisionProposal.currentVersionRef))
        : ref('TransitionRemodulationSource', legacyProposal.id, levelVersionHash);
      const sourceNodeRef = revisionProposal
        ? ref(
            revisionProposal.targetNodeRef.entityType,
            String(revisionProposal.targetNodeRef.id),
            String(revisionProposal.currentVersionRef),
          )
        : undefined;
      const requirement = makeRequirement({
        disciplineRef: input.disciplineRef,
        schoolOrder: input.schoolOrder,
        classLevel: input.classLevel,
        kind: 'INSTITUTIONAL_REQUIREMENT',
        authorityLevel: 'TRANSITION_REQUIRED',
        description: selected.text,
        coverageRequired: true,
        sourceRefs: [legacyLevelRef, ...selected.sourceRefs],
        transitionOriginRef: originRef,
        sourceNodeRef,
      });
      requirements.push(requirement);
      transitionRequirementIds.push(requirement.requirementId);
    });
  }

  const resolvedRequirements = deduplicateRequirements(requirements);
  const mandatoryRequirements = resolvedRequirements.filter(requirement => requirement.coverageRequired);
  if (mandatoryRequirements.length === 0) {
    throw new Error('Arena runtime binding refuses to mark an empty curriculum as completeForPlanning.');
  }

  const transitionHypothesisRef = ref(
    'TransitionRemodulationProposal',
    stableId('transition-hypothesis', {
      institutionId: input.institutionId,
      schoolYearRef: input.schoolYearRef,
      disciplineRef: input.disciplineRef,
      schoolOrder: input.schoolOrder,
      classLevel: input.classLevel,
      sourceVersion: levelVersionHash,
      affectedRequirementIds: transitionRequirementIds,
    }),
    revisionVersionHash,
  );

  const transitionRemodulation: TransitionRemodulationV1 = transitionalLegacyCohort
    ? {
        state: 'HYPOTHESIS',
        rationale: transitionRequirementIds.length > 0
          ? 'Ipotesi transitoria costruita dalle fonti curricolari e dalle proposte di revisione disponibili in Arena. Resta da approvare collegialmente.'
          : 'Ipotesi transitoria conservativa: mantenere i requisiti vigenti IN2012 per la coorte durante la transizione, senza inventare nuovi requisiti, fino alla rimodulazione collegiale.',
        sourceRefs: deduplicateRefs(transitionSourceRefs),
        affectedRequirementIds: transitionRequirementIds,
        usableForPlanning: true,
        institutionallyApproved: false,
        proposalRef: transitionHypothesisRef,
      }
    : {
        state: 'NOT_REQUIRED',
        rationale: 'Il resolver normativo determina direttamente il quadro applicabile alla classe; non è richiesta una rimodulazione transitoria per questo contesto.',
        sourceRefs: [currentFrameworkRef],
        affectedRequirementIds: [],
        usableForPlanning: true,
        institutionallyApproved: false,
      };

  const projectedVersionMaterial = {
    institutionId: input.institutionId,
    schoolYearRef: input.schoolYearRef,
    disciplineRef: input.disciplineRef,
    schoolOrder: input.schoolOrder,
    classLevel: input.classLevel,
    framework: frameworkResolution.framework,
    levelVersionHash,
    revisionVersionHash,
    requirements: resolvedRequirements,
    transitionRemodulation,
  };
  const curriculumVersionRef = ref(
    'CurriculumVersionProjection',
    `${input.institutionId}:${input.disciplineRef}:${input.schoolOrder}:grade-${input.classLevel}`,
    fnv1a(canonicalSerialize(projectedVersionMaterial)),
  );

  const contextId = stableId('ctx', {
    curriculumVersionRef,
    schoolYearRef: input.schoolYearRef,
    sectionRef: input.sectionRef,
    cohortRef: input.cohortRef,
  });
  const sourceRefs = deduplicateRefs([
    currentFrameworkRef,
    legacyLevelRef,
    approvalProcessRef,
    ...transitionRemodulation.sourceRefs,
  ]);

  const curricularContext: CurriculumContextForClassV1 = {
    contract: CML_CURRICULUM_CONTEXT_CONTRACT,
    contextId,
    institutionRef: ref('Institution', input.institutionId),
    schoolYearRef: input.schoolYearRef,
    disciplineRef: input.disciplineRef,
    gradeRef: `grade-${input.classLevel}`,
    ...(input.sectionRef ? { sectionRef: input.sectionRef } : {}),
    ...(input.cohortRef ? { cohortRef: input.cohortRef } : {}),
    curriculumRef,
    curriculumVersionRef,
    curriculumState: 'PROVISIONAL_COMPLETE',
    approvalProcessRef,
    applicabilityStatus: transitionalLegacyCohort ? 'TRANSITIONAL' : 'APPLICABLE',
    transitionRuleRef: ref('NationalTransitionRule', 'DM-221-2025-art-5'),
    completeForPlanning: true,
    requirements: resolvedRequirements,
    transitionRemodulation,
    sourceRefs,
  };

  const constraints: PlanningConstraint[] = [
    {
      id: 'cover-mandatory-curriculum-requirements',
      kind: 'REQUIRED',
      description: 'Il Piano annuale deve dimostrare la copertura di tutti i requisiti curricolari obbligatori forniti da Arena.',
      sourceRef: curriculumVersionRef,
    },
    {
      id: 'provisional-baseline-revalidation',
      kind: 'REQUIRED',
      description: 'La baseline è provvisoria e deve essere rivalidata quando Arena registra l’approvazione istituzionale del curricolo.',
      sourceRef: approvalProcessRef,
    },
  ];
  if (transitionalLegacyCohort) {
    constraints.push({
      id: 'transition-remodulation-hypothesis',
      kind: 'REQUIRED',
      description: 'Per questa coorte in transizione il Piano usa l’ipotesi di rimodulazione fino alla decisione collegiale e dovrà essere rivalidato dopo l’approvazione.',
      sourceRef: transitionHypothesisRef,
    });
  }

  const annualPlanningFramework: CmlInteropEnvelope<AnnualPlanningFrameworkPayload> = {
    contract: 'CML_INTEROP_V1',
    messageId: stableId('msg-framework', { contextId, curriculumVersionRef }),
    messageType: 'ANNUAL_PLANNING_FRAMEWORK_AVAILABLE',
    sourceProduct: 'CURMANLIGHT_ARENA',
    sourceVersion: input.sourceVersion ?? 'arena-runtime-binding-v2',
    emittedAt: input.emittedAt ?? new Date().toISOString(),
    payloadVersion: 1,
    privacyClass: 'PROFESSIONAL_NON_PERSONAL',
    provenance: {
      sourceRefs,
      generatedBy: 'SYSTEM_DERIVED',
      humanConfirmed: false,
      note: 'Framework derivato dal curricolo runtime corrente di Arena. Baseline provvisoria fino all’approvazione istituzionale.',
    },
    payload: {
      curriculumVersionRef,
      disciplineRef: input.disciplineRef,
      gradeRef: `grade-${input.classLevel}`,
      periods: [
        {
          periodId: 'annual',
          label: 'Intero anno',
          suggestedNodeRefs: mandatoryRequirements.map(requirement => requirement.curriculumNodeRef),
        },
      ],
      constraints,
    },
  };

  return { curricularContext, annualPlanningFramework };
}

export function createCmlLocalHandoffV2FromArenaRuntime(
  input: ArenaRuntimeCurriculumBindingInput,
): CmlLocalHandoffV2 {
  const projection = projectArenaRuntimeCurriculumV2(input);
  return createCmlLocalHandoffV2({
    curricularContext: projection.curricularContext,
    annualPlanningFramework: projection.annualPlanningFramework,
    generatedAt: input.emittedAt,
  });
}

function deduplicateRefs(refs: readonly CmlCanonicalRef[]): CmlCanonicalRef[] {
  const seen = new Set<string>();
  return refs.filter(candidate => {
    const key = `${candidate.namespace}|${candidate.entityType}|${candidate.entityId}|${candidate.versionId ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
