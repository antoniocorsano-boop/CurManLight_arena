import { CURRENT_SCHEMA_VERSION, type EntityId } from '../../../domain/curriculum/identity/types';
import {
  isSourceUsableForContext,
  validateSourceGovernance,
  type SourceGovernanceRecord,
  type SourceUsageContext,
} from '../../../domain/curriculum/sources/governance';
import type { Source, SourceVersion } from '../../../domain/curriculum/sources/types';
import type { CustomKbDoc } from './localKnowledgeStore';

export interface LocalSourceGovernanceScope {
  instituteId?: string;
  schoolOrder?: string;
  discipline?: string;
}

export type LocalSourceContextStatus =
  | 'valid-evidence'
  | 'valid-consult-only'
  | 'needs-verification'
  | 'context-mismatch'
  | 'stale-version'
  | 'governance-missing'
  | 'governance-invalid';

export interface LocalSourceContextEvaluation {
  status: LocalSourceContextStatus;
  validForContext: boolean;
  evidenceEligible: boolean;
  explanation: string;
}

const toEntityId = (value: string): EntityId => value as EntityId;

export function projectLocalKnowledgeSource(source: CustomKbDoc): {
  source: Source;
  version: SourceVersion;
} {
  const sourceId = toEntityId(source.id);
  const sourceVersionId = toEntityId(source.sourceVersionId);
  const updatedAt = source.verifiedAt ?? source.importedAt;

  const metadata = {
    id: sourceId,
    createdAt: source.importedAt,
    updatedAt,
    origin: 'imported' as const,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };

  const canonicalSource: Source = {
    id: sourceId,
    metadata,
    title: source.title,
    sourceType: 'local-import',
    status: 'active',
    scope: {},
    locator: source.originalFileName
      ? { type: 'file', value: source.originalFileName }
      : { type: 'internal', value: source.id },
    usedByNodeRefs: [],
  };

  const canonicalVersion: SourceVersion = {
    id: sourceVersionId,
    metadata: {
      ...metadata,
      id: sourceVersionId,
    },
    sourceRef: {
      id: sourceId,
      entityType: 'source',
      snapshotLabel: source.title,
    },
    versionNumber: 1,
    label: source.sourceVersionId,
    status: 'active',
    usedByNodeRefs: [],
  };

  return { source: canonicalSource, version: canonicalVersion };
}

/**
 * Bridges the existing R7B1 local verification state into CML-DRIVE-01.
 * It never promotes a local source above personal authority.
 */
export function buildLocalSourceGovernanceRecord(
  source: CustomKbDoc,
  principalId: string,
  versionFingerprint: string,
  scope: LocalSourceGovernanceScope = {},
): SourceGovernanceRecord {
  const isVerified = source.authorityStatus === 'LOCAL_VERIFIED' && Boolean(source.verifiedAt);

  return {
    sourceId: toEntityId(source.id),
    sourceVersionId: toEntityId(source.sourceVersionId),
    versionFingerprint,
    authorityLevel: 'personal',
    verificationStatus: isVerified ? 'verified' : 'imported',
    validFor: {
      userIds: [principalId],
      instituteIds: scope.instituteId ? [scope.instituteId] : undefined,
      schoolOrders: scope.schoolOrder ? [scope.schoolOrder] : undefined,
      disciplines: scope.discipline ? [scope.discipline] : undefined,
    },
    provenance: {
      originKind: 'local-upload',
      assertedBy: principalId,
      verifiedBy: isVerified ? principalId : undefined,
      verifiedAt: isVerified ? source.verifiedAt : undefined,
      evidenceRef: source.sha256
        ? `file-sha256:${source.sha256}`
        : source.originalFileName
          ? `file:${source.originalFileName}`
          : `local-source:${source.id}`,
    },
  };
}

export function classifyLocalKnowledgeSourceForContext(
  source: CustomKbDoc,
  governance: SourceGovernanceRecord | undefined,
  currentFingerprint: string | undefined,
  context: SourceUsageContext,
): LocalSourceContextEvaluation {
  if (!governance || !currentFingerprint) {
    return {
      status: 'governance-missing',
      validForContext: false,
      evidenceEligible: false,
      explanation: 'Registro di governance non disponibile: Arena non presume la validità della fonte.',
    };
  }

  if (governance.versionFingerprint !== currentFingerprint) {
    return {
      status: 'stale-version',
      validForContext: false,
      evidenceEligible: false,
      explanation: 'La versione corrente non coincide con quella verificata: serve una nuova verifica umana.',
    };
  }

  if (!validateSourceGovernance(governance).valid) {
    return {
      status: 'governance-invalid',
      validForContext: false,
      evidenceEligible: false,
      explanation: 'Il record di governance è incompleto o incoerente: la fonte resta fuori dall’uso operativo.',
    };
  }

  if (source.authorityStatus !== 'LOCAL_VERIFIED' || governance.verificationStatus !== 'verified') {
    return {
      status: 'needs-verification',
      validForContext: false,
      evidenceEligible: false,
      explanation: 'La fonte è disponibile per consultazione ma non è ancora stata verificata umanamente.',
    };
  }

  const canonical = projectLocalKnowledgeSource(source);
  if (!isSourceUsableForContext(canonical.source, canonical.version, governance, context)) {
    return {
      status: 'context-mismatch',
      validForContext: false,
      evidenceEligible: false,
      explanation: 'La fonte è verificata, ma non è valida per il profilo o il contesto scolastico corrente.',
    };
  }

  if (source.evidenceEligibility !== 'LOCAL_EVIDENCE') {
    return {
      status: 'valid-consult-only',
      validForContext: true,
      evidenceEligible: false,
      explanation: 'Fonte verificata e valida nel contesto; resta in sola consultazione finché l’estrazione non è completa.',
    };
  }

  return {
    status: 'valid-evidence',
    validForContext: true,
    evidenceEligible: true,
    explanation: 'Fonte verificata, coerente con la versione registrata e valida nel contesto corrente.',
  };
}
