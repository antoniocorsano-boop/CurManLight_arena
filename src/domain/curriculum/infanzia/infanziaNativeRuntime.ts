import {
  DM221_INFANZIA_FIELDS,
  type InfanziaFieldId,
} from '../national/canonicalStructure';

export const INFANZIA_NATIVE_RUNTIME_VERSION = 'r7c4-infanzia-native-runtime-v1' as const;

export type InfanziaNativeContentStatus =
  | 'NATIVE_IDENTITY_NO_CANONICAL_INSTITUTE_CONTENT'
  | 'CANONICAL_INSTITUTE_CONTENT_AVAILABLE';

export interface LegacyInfanziaCandidateLevel {
  traguardi?: readonly string[];
  obiettivi?: readonly string[];
  evidenze?: readonly string[];
}

export type LegacyInfanziaCurriculumSnapshot = Readonly<Record<
  string,
  Partial<Record<'infanzia', LegacyInfanziaCandidateLevel>>
>>;

export interface InfanziaLegacyCandidateSummary {
  legacyKey: string;
  populated: boolean;
  traguardiCount: number;
  obiettiviCount: number;
  evidenzeCount: number;
  migrationStatus: 'BLOCKED_PENDING_HUMAN_SEMANTIC_MIGRATION';
  authorityEffect: 'NONE';
}

export interface InfanziaNativeRuntimeField {
  fieldId: InfanziaFieldId;
  segmentId: string;
  label: string;
  schoolOrder: 'infanzia';
  sourceSection?: string;
  identityKind: 'FIELD_OF_EXPERIENCE';
  contentStatus: InfanziaNativeContentStatus;
  canonicalInstituteNodeRefs: readonly string[];
  legacyCandidates: readonly InfanziaLegacyCandidateSummary[];
  legacyCandidateCount: number;
  authorityEffect: 'NONE';
}

export interface InfanziaNativeRuntimeView {
  runtimeVersion: typeof INFANZIA_NATIVE_RUNTIME_VERSION;
  schoolOrder: 'infanzia';
  identityModel: 'DM221_NATIVE_FIELDS_OF_EXPERIENCE';
  fields: readonly InfanziaNativeRuntimeField[];
  legacyProjectionAllowed: false;
  legacyMutationAllowed: false;
  planningAllowed: false;
  planningBlockReason: string;
  authorityEffect: 'NONE';
}

/**
 * These keys describe only where the legacy product currently stores candidate
 * material. They are not semantic mappings and cannot become canonical field
 * identities without a separate human migration decision.
 */
export const INFANZIA_LEGACY_CANDIDATE_KEYS: Readonly<Record<InfanziaFieldId, readonly string[]>> = {
  IL_SE_E_L_ALTRO: ['educazioneCivica'],
  IL_CORPO_E_IL_MOVIMENTO: ['educazioneFisica'],
  IMMAGINI_SUONI_COLORI: ['arteImmagine', 'musica'],
  I_DISCORSI_E_LE_PAROLE: ['italiano', 'inglese'],
  LA_CONOSCENZA_DEL_MONDO: ['matematica', 'scienze', 'tecnologia', 'storia', 'geografia'],
};

function nonEmptyCount(values: readonly string[] | undefined): number {
  return values?.filter(value => value.trim().length > 0).length ?? 0;
}

function candidateSummary(
  curriculum: LegacyInfanziaCurriculumSnapshot,
  legacyKey: string,
): InfanziaLegacyCandidateSummary {
  const level = curriculum[legacyKey]?.infanzia;
  const traguardiCount = nonEmptyCount(level?.traguardi);
  const obiettiviCount = nonEmptyCount(level?.obiettivi);
  const evidenzeCount = nonEmptyCount(level?.evidenze);
  return {
    legacyKey,
    populated: traguardiCount + obiettiviCount + evidenzeCount > 0,
    traguardiCount,
    obiettiviCount,
    evidenzeCount,
    migrationStatus: 'BLOCKED_PENDING_HUMAN_SEMANTIC_MIGRATION',
    authorityEffect: 'NONE',
  };
}

export function buildInfanziaNativeRuntimeView(
  legacyCurriculum: LegacyInfanziaCurriculumSnapshot = {},
): InfanziaNativeRuntimeView {
  const fields = (Object.keys(DM221_INFANZIA_FIELDS) as InfanziaFieldId[]).map((fieldId) => {
    const segment = DM221_INFANZIA_FIELDS[fieldId];
    const legacyCandidates = INFANZIA_LEGACY_CANDIDATE_KEYS[fieldId]
      .map(key => candidateSummary(legacyCurriculum, key));

    return {
      fieldId,
      segmentId: segment.id,
      label: segment.label,
      schoolOrder: 'infanzia',
      sourceSection: segment.sourceLocator.section,
      identityKind: 'FIELD_OF_EXPERIENCE',
      contentStatus: 'NATIVE_IDENTITY_NO_CANONICAL_INSTITUTE_CONTENT',
      canonicalInstituteNodeRefs: [],
      legacyCandidates,
      legacyCandidateCount: legacyCandidates.filter(candidate => candidate.populated).length,
      authorityEffect: 'NONE',
    } satisfies InfanziaNativeRuntimeField;
  });

  return {
    runtimeVersion: INFANZIA_NATIVE_RUNTIME_VERSION,
    schoolOrder: 'infanzia',
    identityModel: 'DM221_NATIVE_FIELDS_OF_EXPERIENCE',
    fields,
    legacyProjectionAllowed: false,
    legacyMutationAllowed: false,
    planningAllowed: false,
    planningBlockReason:
      'La progettazione dell’infanzia resta bloccata finché il curricolo d’istituto non dispone di nodi nativi per i cinque campi di esperienza e della relativa validazione umana.',
    authorityEffect: 'NONE',
  };
}

export function assertNoLegacyInfanziaProjection(view: InfanziaNativeRuntimeView): void {
  if (view.legacyProjectionAllowed || view.legacyMutationAllowed) {
    throw new Error('R7C4_LEGACY_INFANZIA_PROJECTION_FORBIDDEN');
  }
  const fieldIds = new Set(view.fields.map(field => field.fieldId));
  if (fieldIds.size !== 5) {
    throw new Error('R7C4_INFANZIA_REQUIRES_FIVE_NATIVE_FIELDS');
  }
  for (const field of view.fields) {
    if (field.identityKind !== 'FIELD_OF_EXPERIENCE' || field.schoolOrder !== 'infanzia') {
      throw new Error(`R7C4_INFANZIA_INVALID_NATIVE_FIELD:${field.fieldId}`);
    }
    if (field.canonicalInstituteNodeRefs.length > 0 && field.contentStatus !== 'CANONICAL_INSTITUTE_CONTENT_AVAILABLE') {
      throw new Error(`R7C4_INFANZIA_CONTENT_STATUS_MISMATCH:${field.fieldId}`);
    }
  }
}
