export type SourceOrigin = 'BUNDLED' | 'USER_UPLOAD' | 'AUTHORITY_CANDIDATE';
export type SourceQualificationDecision = 'CONSULT_ONLY' | 'ELIGIBLE_EVIDENCE';

export interface SourceQualificationCandidate {
  sourceId: string;
  origin: SourceOrigin;
  title: string;
  locator: string;
  contentAvailable: boolean;
}

export interface SourceQualificationRequest {
  candidate: SourceQualificationCandidate;
  decision: SourceQualificationDecision;
  qualifiedByHuman: boolean;
  authorityBasis?: string;
  qualifiedAt: string;
  notes?: string;
}

export interface QualifiedSource {
  sourceId: string;
  origin: SourceOrigin;
  title: string;
  locator: string;
  qualification: SourceQualificationDecision;
  eligibleEvidence: boolean;
  qualifiedByHuman: boolean;
  authorityBasis?: string;
  qualifiedAt: string;
  notes?: string;
}

const normalized = (value: string): string => value.replace(/\s+/g, ' ').trim();

const requireText = (value: string, field: string): string => {
  const result = normalized(value);
  if (!result) throw new Error(`SOURCE_QUALIFICATION_INVALID_${field}`);
  return result;
};

export const qualifySource = (request: SourceQualificationRequest): QualifiedSource => {
  const sourceId = requireText(request.candidate.sourceId, 'SOURCE_ID');
  const title = requireText(request.candidate.title, 'TITLE');
  const locator = requireText(request.candidate.locator, 'LOCATOR');

  if (!request.candidate.contentAvailable) {
    throw new Error('SOURCE_QUALIFICATION_CONTENT_REQUIRED');
  }
  if (!request.qualifiedAt || Number.isNaN(Date.parse(request.qualifiedAt))) {
    throw new Error('SOURCE_QUALIFICATION_INVALID_TIMESTAMP');
  }

  if (request.decision === 'ELIGIBLE_EVIDENCE') {
    if (!request.qualifiedByHuman) {
      throw new Error('SOURCE_QUALIFICATION_HUMAN_CONFIRMATION_REQUIRED');
    }
    if (!request.authorityBasis || !normalized(request.authorityBasis)) {
      throw new Error('SOURCE_QUALIFICATION_AUTHORITY_BASIS_REQUIRED');
    }
  }

  return {
    sourceId,
    origin: request.candidate.origin,
    title,
    locator,
    qualification: request.decision,
    eligibleEvidence: request.decision === 'ELIGIBLE_EVIDENCE',
    qualifiedByHuman: request.qualifiedByHuman,
    authorityBasis: request.authorityBasis ? normalized(request.authorityBasis) : undefined,
    qualifiedAt: request.qualifiedAt,
    notes: request.notes ? normalized(request.notes) : undefined,
  };
};

export const isEligibleEvidence = (source: QualifiedSource): boolean =>
  source.qualification === 'ELIGIBLE_EVIDENCE'
  && source.eligibleEvidence
  && source.qualifiedByHuman
  && Boolean(source.authorityBasis);
