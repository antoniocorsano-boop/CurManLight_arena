/**
 * EC-01/Arena-F1 — Quadro annuale di Educazione civica.
 *
 * Profilo specializzato del dominio curricolare esistente.
 * Non crea una seconda autorità: il quadro resta legato a una InstituteCurriculumVersion
 * e riusa gli stati istituzionali già governati da Arena.
 */

import type { AcademicYear, SchoolOrder } from '../../types/curriculumTransition';
import type { EntityId, EntityReference } from './identity/types';
import type { DisciplineCode } from './model/vocabularies';
import type { DomainValidationIssue, InstituteCurriculumStatus } from './types';

export const CIVIC_EDUCATION_FRAMEWORK_SCHEMA_VERSION =
  'cml-civic-education-framework-v1' as const;

export const CIVIC_EDUCATION_MIN_ANNUAL_HOURS = 33;

export const CIVIC_EDUCATION_REQUIRED_NUCLEI = [
  'costituzione',
  'sviluppo-economico-sostenibilita',
  'cittadinanza-digitale',
] as const;

export type CivicEducationNucleusId =
  (typeof CIVIC_EDUCATION_REQUIRED_NUCLEI)[number];

export type CivicEducationNormativeAuthority =
  | 'MIM'
  | 'NORMATTIVA'
  | 'GAZZETTA_UFFICIALE';

export type CivicEducationNormativeSourceOutcome =
  | 'unchanged'
  | 'changed'
  | 'unavailable';

export type CivicEducationNormativeVerificationResult =
  | 'no-relevant-change'
  | 'relevant-change-incorporated'
  | 'relevant-change-unresolved'
  | 'check-failed';

export interface CivicEducationNormativeSourceCheck {
  id: string;
  authority: CivicEducationNormativeAuthority;
  title: string;
  url: string;
  checkedAt: string;
  outcome: CivicEducationNormativeSourceOutcome;
}

export interface CivicEducationNormativeVerification {
  automaticCheck: true;
  checkedAt: string;
  verifiedFrameworkVersion: string;
  sources: CivicEducationNormativeSourceCheck[];
  result: CivicEducationNormativeVerificationResult;
  humanConfirmedAt?: string;
  humanConfirmedByRole?: 'referente' | 'collegio';
}

export type CivicEducationAllocationTarget =
  | {
      type: 'discipline';
      disciplineCode: Exclude<DisciplineCode, 'educazione-civica'>;
    }
  | {
      type: 'area';
      areaId: string;
      label: string;
    };

export interface CivicEducationAnnualAllocation {
  id: string;
  target: CivicEducationAllocationTarget;
  annualHours: number;
  nucleusIds: CivicEducationNucleusId[];
  objectiveRefs: EntityReference[];
  rationale?: string;
}

export interface CivicEducationInfanziaMapping {
  id: string;
  experienceFieldId: string;
  citizenshipAreaId: string;
  objectiveRefs: EntityReference[];
  rationale?: string;
}

export interface CivicEducationAnnualFramework {
  schemaVersion: typeof CIVIC_EDUCATION_FRAMEWORK_SCHEMA_VERSION;
  id: string;
  institutionId: string;
  curriculumVersionId: string;
  academicYear: AcademicYear;
  schoolOrder: SchoolOrder;
  versionLabel: string;
  previousFrameworkId?: string;
  status: InstituteCurriculumStatus;
  allocations: CivicEducationAnnualAllocation[];
  infanziaMappings: CivicEducationInfanziaMapping[];
  normativeVerification?: CivicEducationNormativeVerification;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedByRole?: 'collegio';
}

export interface CivicEducationApprovalGateResult {
  approvable: boolean;
  issues: DomainValidationIssue[];
  totalAnnualHours: number | null;
  uncoveredNuclei: CivicEducationNucleusId[];
}

export interface CloneCivicEducationFrameworkInput {
  id: string;
  academicYear: AcademicYear;
  versionLabel: string;
  now: string;
}

const OFFICIAL_DOMAINS: Readonly<Record<CivicEducationNormativeAuthority, readonly string[]>> = {
  MIM: ['mim.gov.it'],
  NORMATTIVA: ['normattiva.it'],
  GAZZETTA_UFFICIALE: ['gazzettaufficiale.it'],
};

function domainIssue(
  code: string,
  severity: 'error' | 'warning',
  framework: CivicEducationAnnualFramework,
  message: string,
): DomainValidationIssue {
  return {
    code,
    severity,
    entityType: 'CivicEducationAnnualFramework',
    entityId: framework.id,
    message,
  };
}

function isIsoLikeDate(value: string | undefined): boolean {
  return Boolean(value && Number.isFinite(Date.parse(value)));
}

function academicYearKey(year: AcademicYear): string {
  return `${year.startYear}-${year.endYear}`;
}

function isAcademicYearValid(year: AcademicYear): boolean {
  return Number.isInteger(year.startYear)
    && Number.isInteger(year.endYear)
    && year.endYear === year.startYear + 1;
}

function targetKey(target: CivicEducationAllocationTarget): string {
  return target.type === 'discipline'
    ? `discipline:${target.disciplineCode}`
    : `area:${target.areaId.trim().toLowerCase()}`;
}

function isCurriculumNodeRef(ref: EntityReference): boolean {
  return Boolean(ref?.id) && ref.entityType === 'curriculum-node';
}

export function isOfficialCivicEducationNormativeSourceUrl(
  authority: CivicEducationNormativeAuthority,
  value: string,
): boolean {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return OFFICIAL_DOMAINS[authority].some(
      domain => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

export function getCivicEducationAnnualHours(
  framework: CivicEducationAnnualFramework,
): number | null {
  if (framework.schoolOrder === 'infanzia') return null;
  return framework.allocations.reduce((sum, allocation) => sum + allocation.annualHours, 0);
}

export function getUncoveredCivicEducationNuclei(
  framework: CivicEducationAnnualFramework,
): CivicEducationNucleusId[] {
  if (framework.schoolOrder === 'infanzia') return [];

  const covered = new Set(
    framework.allocations.flatMap(allocation => allocation.nucleusIds),
  );

  return CIVIC_EDUCATION_REQUIRED_NUCLEI.filter(nucleus => !covered.has(nucleus));
}

export function validateCivicEducationAnnualFramework(
  framework: CivicEducationAnnualFramework,
): DomainValidationIssue[] {
  const issues: DomainValidationIssue[] = [];

  if (framework.schemaVersion !== CIVIC_EDUCATION_FRAMEWORK_SCHEMA_VERSION) {
    issues.push(domainIssue(
      'CIVIC_FRAMEWORK_SCHEMA_UNSUPPORTED',
      'error',
      framework,
      'Schema del quadro di Educazione civica non supportato.',
    ));
  }

  if (!framework.id?.trim()) {
    issues.push(domainIssue('CIVIC_FRAMEWORK_MISSING_ID', 'error', framework, 'ID del quadro obbligatorio.'));
  }
  if (!framework.institutionId?.trim()) {
    issues.push(domainIssue(
      'CIVIC_FRAMEWORK_MISSING_INSTITUTION',
      'error',
      framework,
      'Il quadro deve appartenere a un istituto.',
    ));
  }
  if (!framework.curriculumVersionId?.trim()) {
    issues.push(domainIssue(
      'CIVIC_FRAMEWORK_MISSING_CURRICULUM_VERSION',
      'error',
      framework,
      'Il quadro deve riferirsi a una versione curricolare Arena.',
    ));
  }
  if (!framework.versionLabel?.trim()) {
    issues.push(domainIssue(
      'CIVIC_FRAMEWORK_MISSING_VERSION_LABEL',
      'error',
      framework,
      'La versione del quadro è obbligatoria.',
    ));
  }
  if (!isAcademicYearValid(framework.academicYear)) {
    issues.push(domainIssue(
      'CIVIC_FRAMEWORK_INVALID_ACADEMIC_YEAR',
      'error',
      framework,
      'L’anno scolastico deve essere espresso come coppia di anni consecutivi.',
    ));
  }
  if (!['infanzia', 'primaria', 'secondaria'].includes(framework.schoolOrder)) {
    issues.push(domainIssue(
      'CIVIC_FRAMEWORK_INVALID_SCHOOL_ORDER',
      'error',
      framework,
      'Ordine di scuola non supportato.',
    ));
  }
  if (!isIsoLikeDate(framework.createdAt) || !isIsoLikeDate(framework.updatedAt)) {
    issues.push(domainIssue(
      'CIVIC_FRAMEWORK_INVALID_TIMESTAMPS',
      'error',
      framework,
      'createdAt e updatedAt devono essere timestamp validi.',
    ));
  }
  if (framework.previousFrameworkId && framework.previousFrameworkId === framework.id) {
    issues.push(domainIssue(
      'CIVIC_FRAMEWORK_SELF_REFERENCING_PREVIOUS',
      'error',
      framework,
      'previousFrameworkId non può coincidere con id.',
    ));
  }

  if (framework.schoolOrder === 'infanzia') {
    if (framework.allocations.length > 0) {
      issues.push(domainIssue(
        'CIVIC_INFANZIA_HOUR_ALLOCATIONS_FORBIDDEN',
        'error',
        framework,
        'Per l’infanzia il quadro non usa allocazioni orarie.',
      ));
    }

    for (const mapping of framework.infanziaMappings) {
      if (!mapping.id?.trim() || !mapping.experienceFieldId?.trim() || !mapping.citizenshipAreaId?.trim()) {
        issues.push(domainIssue(
          'CIVIC_INFANZIA_MAPPING_INCOMPLETE',
          'error',
          framework,
          'Ogni collegamento infanzia deve indicare campo di esperienza e ambito di cittadinanza.',
        ));
      }
      if (mapping.objectiveRefs.length === 0 || mapping.objectiveRefs.some(ref => !isCurriculumNodeRef(ref))) {
        issues.push(domainIssue(
          'CIVIC_INFANZIA_MAPPING_OBJECTIVE_REQUIRED',
          'error',
          framework,
          'Ogni collegamento infanzia deve riferirsi ad almeno un obiettivo curricolare.',
        ));
      }
    }
  } else {
    if (framework.infanziaMappings.length > 0) {
      issues.push(domainIssue(
        'CIVIC_NON_INFANZIA_MAPPING_FORBIDDEN',
        'error',
        framework,
        'I collegamenti ai campi di esperienza sono riservati all’infanzia.',
      ));
    }

    const targets = new Set<string>();
    for (const allocation of framework.allocations) {
      if (!allocation.id?.trim()) {
        issues.push(domainIssue(
          'CIVIC_ALLOCATION_MISSING_ID',
          'error',
          framework,
          'Ogni quota annuale deve avere un ID.',
        ));
      }
      if (!Number.isFinite(allocation.annualHours) || allocation.annualHours <= 0) {
        issues.push(domainIssue(
          'CIVIC_ALLOCATION_INVALID_HOURS',
          'error',
          framework,
          'Ogni quota annuale deve essere espressa con un numero positivo di ore.',
        ));
      }
      if (allocation.nucleusIds.length === 0) {
        issues.push(domainIssue(
          'CIVIC_ALLOCATION_NUCLEUS_REQUIRED',
          'error',
          framework,
          'Ogni quota annuale deve essere collegata ad almeno un nucleo di Educazione civica.',
        ));
      }
      if (allocation.nucleusIds.some(nucleus => !CIVIC_EDUCATION_REQUIRED_NUCLEI.includes(nucleus))) {
        issues.push(domainIssue(
          'CIVIC_ALLOCATION_INVALID_NUCLEUS',
          'error',
          framework,
          'La quota contiene un nucleo di Educazione civica non riconosciuto.',
        ));
      }
      if (allocation.objectiveRefs.length === 0 || allocation.objectiveRefs.some(ref => !isCurriculumNodeRef(ref))) {
        issues.push(domainIssue(
          'CIVIC_ALLOCATION_OBJECTIVE_REQUIRED',
          'error',
          framework,
          'Ogni quota annuale deve essere collegata ad almeno un obiettivo curricolare.',
        ));
      }
      if (allocation.target.type === 'area') {
        if (!allocation.target.areaId?.trim() || !allocation.target.label?.trim()) {
          issues.push(domainIssue(
            'CIVIC_ALLOCATION_AREA_INCOMPLETE',
            'error',
            framework,
            'Un ambito deve avere identificativo ed etichetta.',
          ));
        }
      }

      const key = targetKey(allocation.target);
      if (targets.has(key)) {
        issues.push(domainIssue(
          'CIVIC_ALLOCATION_DUPLICATE_TARGET',
          'error',
          framework,
          'Una disciplina o un ambito può avere una sola quota annuale nel quadro.',
        ));
      }
      targets.add(key);
    }
  }

  const verification = framework.normativeVerification;
  if (verification) {
    if (verification.automaticCheck !== true) {
      issues.push(domainIssue(
        'CIVIC_NORMATIVE_CHECK_NOT_AUTOMATIC',
        'error',
        framework,
        'La verifica normativa registrata deve provenire dal controllo automatico governato.',
      ));
    }
    if (!isIsoLikeDate(verification.checkedAt)) {
      issues.push(domainIssue(
        'CIVIC_NORMATIVE_CHECK_INVALID_DATE',
        'error',
        framework,
        'La verifica normativa deve avere una data valida.',
      ));
    }
    if (verification.verifiedFrameworkVersion !== framework.versionLabel) {
      issues.push(domainIssue(
        'CIVIC_NORMATIVE_CHECK_VERSION_MISMATCH',
        'error',
        framework,
        'La verifica normativa deve riferirsi alla stessa versione del quadro.',
      ));
    }

    for (const source of verification.sources) {
      if (!source.id?.trim() || !source.title?.trim() || !isIsoLikeDate(source.checkedAt)) {
        issues.push(domainIssue(
          'CIVIC_NORMATIVE_SOURCE_INCOMPLETE',
          'error',
          framework,
          'Ogni fonte normativa verificata deve avere identità, titolo e data di controllo.',
        ));
      }
      if (!isOfficialCivicEducationNormativeSourceUrl(source.authority, source.url)) {
        issues.push(domainIssue(
          'CIVIC_NORMATIVE_SOURCE_NOT_OFFICIAL',
          'error',
          framework,
          'Le verifiche che abilitano l’approvazione possono usare soltanto fonti ufficiali riconosciute.',
        ));
      }
    }
  }

  return issues;
}

export function evaluateCivicEducationApprovalGate(
  framework: CivicEducationAnnualFramework,
): CivicEducationApprovalGateResult {
  const issues = [...validateCivicEducationAnnualFramework(framework)];
  const totalAnnualHours = getCivicEducationAnnualHours(framework);
  const uncoveredNuclei = getUncoveredCivicEducationNuclei(framework);

  if (framework.schoolOrder === 'infanzia') {
    if (framework.infanziaMappings.length === 0) {
      issues.push(domainIssue(
        'CIVIC_INFANZIA_MAPPING_REQUIRED_FOR_APPROVAL',
        'error',
        framework,
        'L’approvazione del quadro infanzia richiede almeno un collegamento a campi di esperienza e cittadinanza.',
      ));
    }
  } else {
    if (framework.allocations.length === 0) {
      issues.push(domainIssue(
        'CIVIC_ALLOCATION_REQUIRED_FOR_APPROVAL',
        'error',
        framework,
        'L’approvazione richiede almeno una quota annuale.',
      ));
    }
    if ((totalAnnualHours ?? 0) < CIVIC_EDUCATION_MIN_ANNUAL_HOURS) {
      issues.push(domainIssue(
        'CIVIC_MINIMUM_HOURS_NOT_MET',
        'error',
        framework,
        `Il totale annuale deve essere almeno di ${CIVIC_EDUCATION_MIN_ANNUAL_HOURS} ore.`,
      ));
    }
    for (const nucleus of uncoveredNuclei) {
      issues.push(domainIssue(
        'CIVIC_NUCLEUS_NOT_COVERED',
        'warning',
        framework,
        `Il nucleo "${nucleus}" non risulta coperto dal quadro corrente.`,
      ));
    }
  }

  const verification = framework.normativeVerification;
  if (!verification) {
    issues.push(domainIssue(
      'CIVIC_NORMATIVE_CHECK_REQUIRED',
      'error',
      framework,
      'Prima dell’approvazione è obbligatoria una verifica normativa automatica aggiornata.',
    ));
  } else {
    if (verification.sources.length === 0) {
      issues.push(domainIssue(
        'CIVIC_NORMATIVE_SOURCES_REQUIRED',
        'error',
        framework,
        'La verifica normativa deve dichiarare le fonti ufficiali controllate.',
      ));
    }

    const authorities = new Set(verification.sources.map(source => source.authority));
    if (!authorities.has('MIM') || (!authorities.has('NORMATTIVA') && !authorities.has('GAZZETTA_UFFICIALE'))) {
      issues.push(domainIssue(
        'CIVIC_NORMATIVE_BASELINE_INCOMPLETE',
        'error',
        framework,
        'La verifica deve includere almeno una fonte ministeriale e una fonte legislativa ufficiale.',
      ));
    }

    if (verification.sources.some(source => source.outcome === 'unavailable')) {
      issues.push(domainIssue(
        'CIVIC_NORMATIVE_SOURCE_UNAVAILABLE',
        'error',
        framework,
        'Una fonte ufficiale necessaria alla verifica normativa non è risultata disponibile.',
      ));
    }

    if (!['no-relevant-change', 'relevant-change-incorporated'].includes(verification.result)) {
      issues.push(domainIssue(
        'CIVIC_NORMATIVE_CHANGE_UNRESOLVED',
        'error',
        framework,
        'L’approvazione è bloccata finché una modifica normativa rilevante non è recepita.',
      ));
    }

    if (!isIsoLikeDate(verification.humanConfirmedAt) || !verification.humanConfirmedByRole) {
      issues.push(domainIssue(
        'CIVIC_NORMATIVE_HUMAN_CONFIRMATION_REQUIRED',
        'error',
        framework,
        'L’esito del controllo normativo automatico deve essere confermato esplicitamente da una persona.',
      ));
    }
  }

  if (framework.status === 'approved') {
    if (!isIsoLikeDate(framework.approvedAt) || framework.approvedByRole !== 'collegio') {
      issues.push(domainIssue(
        'CIVIC_APPROVAL_EVIDENCE_REQUIRED',
        'error',
        framework,
        'Un quadro approvato deve conservare data di approvazione e ruolo Collegio.',
      ));
    }
  }

  return {
    approvable: !issues.some(issue => issue.severity === 'error'),
    issues,
    totalAnnualHours,
    uncoveredNuclei,
  };
}

export function validateCivicEducationFrameworkSet(
  frameworks: CivicEducationAnnualFramework[],
): DomainValidationIssue[] {
  const issues: DomainValidationIssue[] = [];
  const approvedKeys = new Map<string, CivicEducationAnnualFramework>();

  for (const framework of frameworks) {
    issues.push(...validateCivicEducationAnnualFramework(framework));
    if (framework.status !== 'approved') continue;

    const key = [
      framework.institutionId,
      academicYearKey(framework.academicYear),
      framework.schoolOrder,
    ].join(':');

    const existing = approvedKeys.get(key);
    if (existing) {
      issues.push(domainIssue(
        'CIVIC_DUPLICATE_APPROVED_FRAMEWORK',
        'error',
        framework,
        `Esiste già un quadro approvato per lo stesso istituto, anno scolastico e ordine (ID: ${existing.id}).`,
      ));
    } else {
      approvedKeys.set(key, framework);
    }
  }

  return issues;
}

export function canProjectCivicEducationFramework(
  framework: CivicEducationAnnualFramework,
): boolean {
  if (framework.status !== 'approved') return false;
  return evaluateCivicEducationApprovalGate(framework).approvable;
}

export function cloneCivicEducationFrameworkForAcademicYear(
  previous: CivicEducationAnnualFramework,
  input: CloneCivicEducationFrameworkInput,
): CivicEducationAnnualFramework {
  return {
    ...previous,
    id: input.id,
    academicYear: { ...input.academicYear },
    versionLabel: input.versionLabel,
    previousFrameworkId: previous.id,
    status: 'draft',
    allocations: previous.allocations.map(allocation => ({
      ...allocation,
      target: { ...allocation.target },
      nucleusIds: [...allocation.nucleusIds],
      objectiveRefs: allocation.objectiveRefs.map(ref => ({ ...ref })),
    })),
    infanziaMappings: previous.infanziaMappings.map(mapping => ({
      ...mapping,
      objectiveRefs: mapping.objectiveRefs.map(ref => ({ ...ref })),
    })),
    normativeVerification: undefined,
    createdAt: input.now,
    updatedAt: input.now,
    approvedAt: undefined,
    approvedByRole: undefined,
  };
}

// Type-level marker used by fixtures and downstream contracts without adding
// a new entity family to the canonical identity registry.
export type CivicEducationObjectiveReference = EntityReference & {
  readonly id: EntityId;
  readonly entityType: 'curriculum-node';
};
