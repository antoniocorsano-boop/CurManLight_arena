import { describe, expect, it } from 'vitest';
import {
  addProposal,
  createEmptyRevisionStore,
  createInstitutionalDecisionQualification,
  isInstitutionalDecisionQualification,
  prepareCurriculumVersionFromDecision,
  recordDecision,
  validateInstitutionalDecisionQualification,
  type Decision,
  type RevisionArchive,
  type RevisionVersionBridgeInput,
} from '../../domain/revision';
import { createEntityReference, generateEntityId, type EntityId, type EntityReference } from '../../domain/curriculum/identity';

const id = (value: string) => value as EntityId;
const ref = (value: string, entityType: EntityReference['entityType']): EntityReference => ({ id: id(value), entityType });
const validRef = (entityType: EntityReference['entityType']): EntityReference => ({ id: generateEntityId(), entityType });
const decisionRef = validRef('decision');
const authorityRef = validRef('institute');
const validationRef = validRef('source');

const validQualification = () => createInstitutionalDecisionQualification({
  decisionRef,
  authorityRef,
  status: 'qualified',
  validationRef,
  validatedAt: '2026-08-20',
});

describe('CURR-R5-C institutional decision qualification boundary', () => {
  it('creates and validates a qualified external evidence record', () => {
    const qualification = validQualification();
    expect(isInstitutionalDecisionQualification(qualification)).toBe(true);
    expect(validateInstitutionalDecisionQualification(qualification)).toEqual({ valid: true, errors: [] });
  });

  it.each([
    [{ ...validQualification(), validationRef: undefined }],
    [{ ...validQualification(), validatedAt: '2026/08/20' }],
    [{ ...validQualification(), validatedAt: '2026-02-30' }],
    [{ ...validQualification(), authorityRef: ref('invalid', 'curriculum-node') }],
  ])('rejects qualified records without complete valid qualification evidence', (candidate) => {
    expect(validateInstitutionalDecisionQualification(candidate)).toMatchObject({ valid: false });
    expect(() => createInstitutionalDecisionQualification(candidate)).toThrow();
  });

  it.each(['unverified', 'rejected'] as const)('does not validate %s as institutionally qualified', (status) => {
    const candidate = { ...validQualification(), status, validationRef: undefined, validatedAt: undefined };
    expect(validateInstitutionalDecisionQualification(candidate)).toMatchObject({ valid: false });
    expect(isInstitutionalDecisionQualification(candidate)).toBe(false);
  });

  it('rejects a qualified record whose decision reference is not the requested decision', () => {
    const result = validateInstitutionalDecisionQualification(validQualification(), validRef('decision'));
    expect(result).toMatchObject({ valid: false });
  });

  it('blocks a matching decision id with the wrong entity type', () => {
    const result = validateInstitutionalDecisionQualification(validQualification(), {
      id: decisionRef.id,
      entityType: 'revision-proposal',
    });
    expect(result).toMatchObject({ valid: false });
  });

  it('blocks null, primitive and missing qualification values closed', () => {
    for (const candidate of [null, 42, 'qualified', undefined]) {
      expect(validateInstitutionalDecisionQualification(candidate)).toMatchObject({ valid: false });
      expect(isInstitutionalDecisionQualification(candidate)).toBe(false);
    }
  });

  it('keeps local recorded decisions distinct from qualified institutional decisions', () => {
    const local = { status: 'recorded-local' as const };
    expect(local.status).not.toBe('qualified');
    expect(validateInstitutionalDecisionQualification(local)).toMatchObject({ valid: false });
  });

  it('requires a matching qualified record in the institutional bridge path', async () => {
    const archive = createEmptyRevisionStore('2026-08-20T10:00:00.000Z');
    const proposalResult = addProposal(archive, {
      targetNodeRef: ref('node-1', 'curriculum-node'),
      curriculumVersionRef: ref('version-1', 'curriculum-version'),
      currentTextSnapshot: 'corrente',
      proposedText: 'proposta',
      rationale: 'motivazione',
      evidenceRefs: [],
    }, '2026-08-20T10:00:00.000Z');
    if (!proposalResult.success) throw new Error('proposal fixture failed');
    const proposal = proposalResult.proposal;
    const decisionResult = recordDecision(proposalResult.archive, {
      proposalRef: createEntityReference(proposal.id, 'revision-proposal'),
      proposalVersionRef: createEntityReference(proposal.currentVersionRef, 'revision-proposal'),
      outcome: 'approve',
      rationale: 'decisione locale',
      authority: { declaredRole: 'collegio-docenti' },
    }, '2026-08-20T11:00:00.000Z');
    if (!decisionResult.success) throw new Error('decision fixture failed');
    const decision = { ...decisionResult.decision, status: 'recorded-local' as Decision['status'] };
    const decided: RevisionArchive = { ...decisionResult.archive, decisions: [decision] };
    const versions = [{ id: 'version-1', versionNumber: '1.0', title: 'Curricolo', status: 'approved' as const, createdAt: '2025-09-01', updatedAt: '2025-09-01', approvedAt: '2025-09-01' }];
    const input = {
      revisionArchive: decided,
      proposalId: proposal.id,
      decisionId: decision.id,
      versionRepository: { list: async () => versions, save: async (version: typeof versions[number]) => { versions.push(version); } },
      requireFormalInstitutionalValidation: true,
      institutionalDecisionQualification: { ...validQualification(), decisionRef: { id: decision.id, entityType: 'decision' } },
    } satisfies RevisionVersionBridgeInput;

    const qualified = await prepareCurriculumVersionFromDecision(input);
    expect(qualified.status).toBe('created-draft');
    expect(qualified.version?.status).toBe('draft');
    expect(qualified.version?.effectiveFrom).toBeUndefined();

    const blocked = await prepareCurriculumVersionFromDecision({ ...input, institutionalDecisionQualification: undefined });
    expect(blocked.status).toBe('blocked');

    for (const status of ['unverified', 'rejected'] as const) {
      const rejected = await prepareCurriculumVersionFromDecision({
        ...input,
        institutionalDecisionQualification: { ...input.institutionalDecisionQualification, status },
      });
      expect(rejected.status).toBe('blocked');
    }

    const mismatch = await prepareCurriculumVersionFromDecision({
      ...input,
      institutionalDecisionQualification: {
        ...input.institutionalDecisionQualification,
        decisionRef: validRef('decision'),
      },
    });
    expect(mismatch.status).toBe('blocked');
  });
});
