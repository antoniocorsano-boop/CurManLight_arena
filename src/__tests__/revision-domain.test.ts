import { describe, it, expect } from 'vitest';
import {
  createEmptyRevisionArchive,
  cloneRevisionArchive,
  createProposal,
  createInitialProposalVersion,
  createNextProposalVersion,
  restoreProposalVersion,
  createDecision,
  createDecisionEffectRecord,
  createRevisionEvent,
} from '../domain/revision/constructors';
import {
  validateProposal,
  validateProposalVersion,
  validateDecision,
  validateProposalMandatoryRationale,
  validateArchiveIntegrity,
  validateInternalArchiveReferences,
} from '../domain/revision/validators';
import { VALID_PROPOSAL_STATUSES } from '../domain/revision/vocabularies';
import type { EntityReference, EntityId } from '../domain/curriculum/identity';
import type { RevisionArchive, Decision } from '../domain/revision/types';
import { addProposal, createEmptyRevisionStore, recordDecision, transitionProposalStatus } from '../domain/revision/repository';
import { serializeRevisionArchive, deserializeRevisionArchive, importRevisionArchive, fingerprintRevisionArchive } from '../domain/revision/serialization';
import { planDecisionEffect, applyDecisionEffectLocally, cancelDecisionEffect } from '../domain/revision/decisionEffects';
import { appendRevisionEvent, getRevisionEvents, verifyRevisionEventIntegrity } from '../domain/revision/eventLog';
import { executeA02ToA03ProposalTransfer, executeA03ToA04ProposalTransfer } from '../domain/revision/transferIntegration';
import { importLegacyProposals, validateLegacyImport } from '../domain/revision/legacyAdapter';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRef(id: string, entityType = 'curriculum-node'): EntityReference {
  return { id: id as EntityId, entityType: entityType as never };
}

function makeDecisionAuthority(role: Decision['authority']['declaredRole'] = 'docente') {
  return { declaredRole: role };
}

// ─── Constructors ────────────────────────────────────────────────────────────

describe('createEmptyRevisionArchive', () => {
  it('creates empty archive with schema version 1', () => {
    const archive = createEmptyRevisionArchive();
    expect(archive.schemaVersion).toBe(1);
    expect(archive.proposals).toEqual([]);
    expect(archive.versions).toEqual([]);
    expect(archive.decisions).toEqual([]);
    expect(archive.effects).toEqual([]);
    expect(archive.events).toEqual([]);
    expect(typeof archive.updatedAt).toBe('string');
  });
});

describe('cloneRevisionArchive', () => {
  it('creates a deep clone that does not mutate the original', () => {
    const original = createEmptyRevisionArchive();
    const clone = cloneRevisionArchive(original);
    expect(clone).toEqual(original);
    clone.proposals.push({} as never);
    expect(original.proposals.length).toBe(0);
  });
});

describe('createProposal', () => {
  it('creates proposal with draft status and valid ID', () => {
    const p = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'testo vigente',
      proposedText: 'testo proposto',
      rationale: 'motivazione di test',
    });
    expect(p.status).toBe('draft');
    expect(typeof p.id).toBe('string');
    expect(p.id.length).toBeGreaterThan(0);
    expect(p.currentTextSnapshot).toBe('testo vigente');
    expect(p.proposedText).toBe('testo proposto');
    expect(p.rationale).toBe('motivazione di test');
    expect(p.decisionRefs).toEqual([]);
    expect(p.evidenceRefs).toEqual([]);
    expect(p.sourceRefs).toEqual([]);
  });
});

describe('createInitialProposalVersion', () => {
  it('creates version 1 with frozen=true', () => {
    const proposal = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const v = createInitialProposalVersion(proposal, {
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    expect(v.versionNumber).toBe(1);
    expect(v.frozen).toBe(true);
    expect(v.proposalRef).toBe(proposal.id);
    expect(v.previousVersionRef).toBeUndefined();
  });
});

describe('createNextProposalVersion', () => {
  it('increments version and links previousVersionRef', () => {
    const proposal = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const v1 = createInitialProposalVersion(proposal, {
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const v2 = createNextProposalVersion(proposal, v1, {
      currentTextSnapshot: 'old',
      proposedText: 'new-v2',
    });
    expect(v2.versionNumber).toBe(2);
    expect(v2.previousVersionRef).toBe(v1.id);
    expect(v2.frozen).toBe(true);
    expect(v2.proposedText).toBe('new-v2');
  });
});

describe('restoreProposalVersion', () => {
  it('creates new version with restore note', () => {
    const proposal = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const v1 = createInitialProposalVersion(proposal, {
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const v3 = restoreProposalVersion(proposal, v1, {
      currentTextSnapshot: 'old',
      proposedText: 'new-original',
    });
    expect(v3.versionNumber).toBe(2);
    expect(v3.changeNote).toContain('Ripristino dalla versione 1');
    expect(v3.frozen).toBe(true);
  });
});

describe('createDecision', () => {
  it('creates decision with required fields and draft status', () => {
    const proposal = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const v1 = createInitialProposalVersion(proposal, {
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const d = createDecision({
      proposalRef: { id: proposal.id, entityType: 'revision-proposal' },
      proposalVersionRef: { id: v1.id, entityType: 'revision-proposal' },
      outcome: 'approve',
      rationale: 'Motivazione della decisione',
      authority: makeDecisionAuthority('docente'),
    });
    expect(d.status).toBe('draft');
    expect(d.proposalRef.id).toBe(proposal.id);
    expect(d.proposalVersionRef.id).toBe(v1.id);
    expect(d.outcome).toBe('approve');
    expect(d.rationale).toBe('Motivazione della decisione');
    expect(d.authority.declaredRole).toBe('docente');
  });
});

describe('createDecisionEffectRecord', () => {
  it('creates effect with planned status', () => {
    const e = createDecisionEffectRecord({
      decisionRef: makeRef('dec-1', 'decision'),
      effectType: 'none',
      description: 'test effect',
    });
    expect(e.status).toBe('planned');
    expect(e.decisionRef.id).toBe('dec-1');
    expect(e.effectType).toBe('none');
    expect(e.description).toBe('test effect');
  });
});

describe('createRevisionEvent', () => {
  it('creates event with unique ID, timestamp, entityRef', () => {
    const e1 = createRevisionEvent({
      entityRef: makeRef('prop-1'),
      eventType: 'proposal-created',
      newStatus: 'draft',
    });
    const e2 = createRevisionEvent({
      entityRef: makeRef('prop-2'),
      eventType: 'proposal-created',
      newStatus: 'draft',
    });
    expect(e1.id).not.toBe(e2.id);
    expect(typeof e1.id).toBe('string');
    expect(typeof e1.timestamp).toBe('string');
    expect(e1.entityRef.id).toBe('prop-1');
    expect(e1.eventType).toBe('proposal-created');
  });
});

// ─── Validators ──────────────────────────────────────────────────────────────

describe('validateProposal', () => {
  it('rejects null/undefined', () => {
    expect(validateProposal(null).valid).toBe(false);
    expect(validateProposal(undefined).valid).toBe(false);
    expect(validateProposal('string').valid).toBe(false);
  });

  it('accepts a valid proposal', () => {
    const p = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const result = validateProposal(p);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateProposalVersion', () => {
  it('requires frozen=true', () => {
    const invalid = {
      id: 'v-1',
      proposalRef: 'p-1',
      versionNumber: 1,
      frozen: false,
      currentTextSnapshot: 'old',
      proposedText: 'new',
    };
    const result = validateProposalVersion(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'VERSION_NOT_FROZEN')).toBe(true);
  });

  it('accepts a valid frozen version', () => {
    const proposal = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const v = createInitialProposalVersion(proposal, {
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    expect(validateProposalVersion(v).valid).toBe(true);
  });
});

describe('validateDecision', () => {
  it('requires rationale', () => {
    const invalid = {
      id: 'd-1',
      status: 'draft',
      outcome: 'approve',
      proposalRef: { id: 'p-1' },
      proposalVersionRef: { id: 'v-1' },
      rationale: '',
      authority: { declaredRole: 'docente' },
    };
    const result = validateDecision(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_RATIONALE')).toBe(true);
  });

  it('requires authority', () => {
    const invalid = {
      id: 'd-1',
      status: 'draft',
      outcome: 'approve',
      proposalRef: { id: 'p-1' },
      proposalVersionRef: { id: 'v-1' },
      rationale: 'test',
      authority: undefined,
    };
    const result = validateDecision(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_AUTHORITY')).toBe(true);
  });

  it('accepts a valid decision', () => {
    const proposal = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const v = createInitialProposalVersion(proposal, {
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const d = createDecision({
      proposalRef: { id: proposal.id, entityType: 'revision-proposal' },
      proposalVersionRef: { id: v.id, entityType: 'revision-proposal' },
      outcome: 'approve',
      rationale: 'ok',
      authority: makeDecisionAuthority('docente'),
    });
    expect(validateDecision(d).valid).toBe(true);
  });
});

describe('validateProposalMandatoryRationale', () => {
  it('rejects empty rationale on ready-for-review', () => {
    const proposal = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
      rationale: '',
    });
    const p = { ...proposal, status: 'ready-for-review' as const };
    const result = validateProposalMandatoryRationale(p);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_RATIONALE')).toBe(true);
  });

  it('accepts rationale on ready-for-review', () => {
    const proposal = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
      rationale: 'motivazione',
    });
    const p = { ...proposal, status: 'ready-for-review' as const };
    expect(validateProposalMandatoryRationale(p).valid).toBe(true);
  });
});

describe('Proposal status: "approved" is not a proposal status', () => {
  it('approved is not in VALID_PROPOSAL_STATUSES', () => {
    expect(VALID_PROPOSAL_STATUSES.includes('approved' as never)).toBe(false);
  });
});

describe('validateArchiveIntegrity', () => {
  it('catches duplicate proposal IDs', () => {
    const proposal = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const archive = createEmptyRevisionArchive();
    archive.proposals.push(proposal, proposal);
    const result = validateArchiveIntegrity(archive);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'DUPLICATE_PROPOSAL')).toBe(true);
  });

  it('accepts valid archive', () => {
    const proposal = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    const archive = createEmptyRevisionArchive();
    archive.proposals.push(proposal);
    expect(validateArchiveIntegrity(archive).valid).toBe(true);
  });
});

describe('validateInternalArchiveReferences', () => {
  it('catches orphan version reference in proposal', () => {
    const archive = createEmptyRevisionArchive();
    archive.proposals.push({
      id: 'p-1' as EntityId,
      currentVersionRef: 'v-missing' as EntityId,
      decisionRefs: [],
    } as never);
    const result = validateInternalArchiveReferences(archive);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'ORPHAN_VERSION_REF')).toBe(true);
  });

  it('catches orphan proposal reference in version', () => {
    const archive = createEmptyRevisionArchive();
    archive.versions.push({
      id: 'v-1' as EntityId,
      proposalRef: 'p-missing' as EntityId,
    } as never);
    const result = validateInternalArchiveReferences(archive);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'ORPHAN_VERSION')).toBe(true);
  });
});

// ─── Repository ──────────────────────────────────────────────────────────────

describe('addProposal', () => {
  it('creates proposal and version in archive', () => {
    const archive = createEmptyRevisionStore();
    const r = addProposal(archive, {
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    expect(r.success).toBe(true);
    if (!r.success) throw new Error('should not fail');
    expect(r.archive.proposals.length).toBe(1);
    expect(r.archive.versions.length).toBe(1);
    expect(r.archive.events.length).toBe(1);
    expect(r.proposal.status).toBe('draft');
  });
});

describe('recordDecision', () => {
  it('records decision and links to proposal', () => {
    const archive = createEmptyRevisionStore();
    const r = addProposal(archive, {
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    expect(r.success).toBe(true);
    if (!r.success) throw new Error('should not fail');

    const dr = recordDecision(r.archive, {
      proposalRef: { id: r.proposal.id, entityType: 'revision-proposal' },
      proposalVersionRef: { id: r.version.id, entityType: 'revision-proposal' },
      outcome: 'approve',
      rationale: 'ok',
      authority: makeDecisionAuthority('docente'),
    });
    expect(dr.success).toBe(true);
    if (!dr.success) throw new Error('should not fail');
    expect(dr.archive.decisions.length).toBe(1);
    expect(dr.archive.proposals[0].decisionRefs.length).toBe(1);
  });
});

describe('transitionProposalStatus', () => {
  it('transitions draft to ready-for-review', () => {
    const archive = createEmptyRevisionStore();
    const r = addProposal(archive, {
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
      rationale: 'motivazione',
    });
    if (!r.success) throw new Error('should not fail');

    const tr = transitionProposalStatus(r.archive, r.proposal.id, 'ready-for-review');
    expect(tr.success).toBe(true);
    if (!tr.success) throw new Error('should not fail');
    expect(tr.archive.proposals[0].status).toBe('ready-for-review');
    expect(tr.event.eventType).toBe('proposal-modified');
  });
});

// ─── Event Log ───────────────────────────────────────────────────────────────

describe('eventLog', () => {
  it('appendRevisionEvent adds event immutably', () => {
    const archive = createEmptyRevisionStore();
    const { event, archive: updated } = appendRevisionEvent(archive, {
      entityRef: makeRef('prop-1'),
      eventType: 'proposal-created',
      newStatus: 'draft',
      rationale: 'test',
    });
    expect(updated.events.length).toBe(1);
    expect(archive.events.length).toBe(0);
    expect(event.id.length).toBeGreaterThan(0);
  });

  it('getRevisionEvents filters by entityRefId', () => {
    let archive = createEmptyRevisionStore();
    const r1 = appendRevisionEvent(archive, {
      entityRef: makeRef('prop-a'),
      eventType: 'proposal-created',
      newStatus: 'draft',
    });
    const r2 = appendRevisionEvent(r1.archive, {
      entityRef: makeRef('prop-b'),
      eventType: 'proposal-created',
      newStatus: 'draft',
    });

    const events = getRevisionEvents(r2.archive, { entityRefId: 'prop-a' });
    expect(events.length).toBe(1);
    expect(events[0].entityRef.id).toBe('prop-a');
  });

  it('verifyRevisionEventIntegrity detects duplicate IDs', () => {
    const archive = createEmptyRevisionStore();
    const event = createRevisionEvent({
      entityRef: makeRef('p-1'),
      eventType: 'proposal-created',
    });
    archive.events.push(event, event);
    const result = verifyRevisionEventIntegrity(archive);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'DUPLICATE_EVENT_ID')).toBe(true);
  });
});

// ─── Serialization ───────────────────────────────────────────────────────────

describe('serialization', () => {
  it('serialize and deserialize round-trip', () => {
    const archive = createEmptyRevisionStore();
    const json = serializeRevisionArchive(archive);
    expect(typeof json).toBe('string');

    const result = deserializeRevisionArchive(json);
    expect(result.valid).toBe(true);
    expect(result.archive!.schemaVersion).toBe(1);
  });

  it('importRevisionArchive merges without conflicts', () => {
    const existing = createEmptyRevisionStore();
    const incoming = createEmptyRevisionStore();
    const r = importRevisionArchive(existing, incoming);
    expect(r.success).toBe(true);
  });

  it('importRevisionArchive detects ID conflicts', () => {
    const archive = createEmptyRevisionStore();
    const p = createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    archive.proposals.push(p);
    const incoming = cloneRevisionArchive(archive);
    const r = importRevisionArchive(archive, incoming);
    expect(r.success).toBe(false);
    expect(r.errors.some(e => e.code === 'IMPORT_CONFLICT')).toBe(true);
  });

  it('fingerprint differs after change', () => {
    const a1 = createEmptyRevisionStore();
    const a2 = createEmptyRevisionStore();
    a2.proposals.push(createProposal({
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    }));
    expect(fingerprintRevisionArchive(a1)).not.toBe(fingerprintRevisionArchive(a2));
  });
});

// ─── Decision Effects ────────────────────────────────────────────────────────

describe('decisionEffects', () => {
  it('planDecisionEffect rejects missing decision', () => {
    const archive = createEmptyRevisionStore();
    const r = planDecisionEffect(archive, {
      decisionRef: makeRef('dec-1', 'decision'),
      effectType: 'none',
      description: 'record only',
    });
    expect(r.success).toBe(false);
    expect(r.errors[0].code).toBe('DECISION_NOT_FOUND');
  });

  it('effect with recorded-local decision succeeds', () => {
    const archive = createEmptyRevisionStore();
    const r = addProposal(archive, {
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    if (!r.success) throw new Error('unexpected');
    const dr = recordDecision(r.archive, {
      proposalRef: { id: r.proposal.id, entityType: 'revision-proposal' },
      proposalVersionRef: { id: r.version.id, entityType: 'revision-proposal' },
      outcome: 'approve',
      rationale: 'ok',
      authority: makeDecisionAuthority('docente'),
    });
    if (!dr.success) throw new Error('unexpected');
    const updatedD = structuredClone(dr.archive.decisions[0]);
    updatedD.status = 'recorded-local';
    const finalArchive: RevisionArchive = { ...dr.archive, decisions: [updatedD] };

    const er = planDecisionEffect(finalArchive, {
      decisionRef: { id: updatedD.id, entityType: 'decision' },
      effectType: 'planned-update',
      description: 'update planned',
    });
    expect(er.success).toBe(true);
    if (!er.success) throw new Error('unexpected');
    expect(er.effect!.status).toBe('planned');
  });

  it('applyDecisionEffectLocally transitions planned to applied-local', () => {
    const archive = createEmptyRevisionStore();
    const r = addProposal(archive, {
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    if (!r.success) throw new Error('unexpected');
    const dr = recordDecision(r.archive, {
      proposalRef: { id: r.proposal.id, entityType: 'revision-proposal' },
      proposalVersionRef: { id: r.version.id, entityType: 'revision-proposal' },
      outcome: 'approve',
      rationale: 'ok',
      authority: makeDecisionAuthority('docente'),
    });
    if (!dr.success) throw new Error('unexpected');
    const updatedD = structuredClone(dr.archive.decisions[0]);
    updatedD.status = 'recorded-local';
    const a1: RevisionArchive = { ...dr.archive, decisions: [updatedD] };

    const er = planDecisionEffect(a1, {
      decisionRef: { id: updatedD.id, entityType: 'decision' },
      effectType: 'planned-update',
      description: 'update',
    });
    if (!er.success) throw new Error('unexpected');

    const ar = applyDecisionEffectLocally(er.archive, er.effect!.id as string);
    expect(ar.success).toBe(true);
    if (!ar.success) throw new Error('unexpected');
    expect(ar.effect!.status).toBe('applied-local');
  });

  it('cancelDecisionEffect transitions planned to cancelled', () => {
    const archive = createEmptyRevisionStore();
    const r = addProposal(archive, {
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    if (!r.success) throw new Error('unexpected');
    const dr = recordDecision(r.archive, {
      proposalRef: { id: r.proposal.id, entityType: 'revision-proposal' },
      proposalVersionRef: { id: r.version.id, entityType: 'revision-proposal' },
      outcome: 'approve',
      rationale: 'ok',
      authority: makeDecisionAuthority('docente'),
    });
    if (!dr.success) throw new Error('unexpected');
    const updatedD = structuredClone(dr.archive.decisions[0]);
    updatedD.status = 'recorded-local';
    const a1: RevisionArchive = { ...dr.archive, decisions: [updatedD] };

    const er = planDecisionEffect(a1, {
      decisionRef: { id: updatedD.id, entityType: 'decision' },
      effectType: 'planned-update',
      description: 'update',
    });
    if (!er.success) throw new Error('unexpected');

    const cr = cancelDecisionEffect(er.archive, er.effect!.id as string);
    expect(cr.success).toBe(true);
    if (!cr.success) throw new Error('unexpected');
    expect(cr.effect!.status).toBe('cancelled');
  });
});

// ─── A02→A03 Transfer ───────────────────────────────────────────────────────

describe('executeA02ToA03ProposalTransfer', () => {
  it('creates draft proposal from A02 payload', () => {
    const archive = createEmptyRevisionStore();
    const result = executeA02ToA03ProposalTransfer({
      curriculumNodeRef: { entityId: 'node-1', entityType: 'curriculum-node', label: 'Test Node' },
      curriculumVersionRef: { entityId: 'cv-1', entityType: 'curriculum-version', label: 'v1' },
      textSnapshot: 'testo',
      sources: [],
      evidences: [],
      contentOrigin: 'teacher',
      warnings: [],
      contractVersion: 1,
      structuralFootprint: 'abc',
    }, archive);
    expect(result.success).toBe(true);
    expect(result.proposal!.status).toBe('draft');
    expect(result.archive.proposals.length).toBe(1);
  });

  it('rejects invalid contract version', () => {
    const archive = createEmptyRevisionStore();
    const result = executeA02ToA03ProposalTransfer({
      curriculumNodeRef: { entityId: 'node-1', entityType: 'curriculum-node' },
      curriculumVersionRef: { entityId: 'cv-1', entityType: 'curriculum-version' },
      textSnapshot: 'testo',
      sources: [],
      evidences: [],
      contentOrigin: 'teacher',
      warnings: [],
      contractVersion: 0,
      structuralFootprint: 'abc',
    }, archive);
    expect(result.success).toBe(false);
  });
});

// ─── A03→A04 Transfer ───────────────────────────────────────────────────────

describe('executeA03ToA04ProposalTransfer', () => {
  it('propagates typed R4D evidence references without copying report content', () => {
    const archive = createEmptyRevisionStore();
    const r = addProposal(archive, {
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
      rationale: 'test',
    });
    if (!r.success) throw new Error('unexpected');
    const archiveWithEvidence = {
      ...r.archive,
      proposals: r.archive.proposals.map(proposal => proposal.id === r.proposal.id
        ? {
          ...proposal,
          evidenceRefs: [{
            source: 'R4D' as const,
            reportItemId: 'r4d-item-1',
            frameworkRefs: [makeRef('framework-1', 'source')],
            provenanceRefs: [makeRef('provenance-1', 'source')],
          }],
        }
        : proposal),
    };
    const tr = transitionProposalStatus(archiveWithEvidence, r.proposal.id, 'ready-for-review', undefined, 'test');
    if (!tr.success) throw new Error('unexpected');
    const tr2 = transitionProposalStatus(tr.archive, r.proposal.id, 'submitted', undefined, 'test');
    if (!tr2.success) throw new Error('unexpected');

    const result = executeA03ToA04ProposalTransfer(
      [{ id: r.proposal.id, entityType: 'revision-proposal' }],
      tr2.archive,
    );

    expect(result.transferableProposals[0]?.evidenceRefs).toEqual([{
      source: 'R4D',
      reportItemId: 'r4d-item-1',
      frameworkRefs: [makeRef('framework-1', 'source')],
      provenanceRefs: [makeRef('provenance-1', 'source')],
    }]);
    expect(JSON.stringify(result)).not.toContain('structuralDifference');
  });

  it('draft proposals are not transferable', () => {
    const archive = createEmptyRevisionStore();
    const r = addProposal(archive, {
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
    });
    if (!r.success) throw new Error('unexpected');
    const result = executeA03ToA04ProposalTransfer(
      [{ id: r.proposal.id, entityType: 'revision-proposal' }],
      r.archive,
    );
    expect(result.transferableProposals.length).toBe(0);
    expect(result.nonTransferableProposals.length).toBe(1);
    expect(result.nonTransferableProposals[0].reason).toContain('Draft');
  });

  it('submitted proposals are transferable as proposed-content', () => {
    const archive = createEmptyRevisionStore();
    const r = addProposal(archive, {
      targetNodeRef: makeRef('node-1'),
      curriculumVersionRef: makeRef('cv-1'),
      currentTextSnapshot: 'old',
      proposedText: 'new',
      rationale: 'test',
    });
    if (!r.success) throw new Error('unexpected');
    const tr = transitionProposalStatus(r.archive, r.proposal.id, 'ready-for-review', undefined, 'test');
    if (!tr.success) throw new Error('unexpected');
    const tr2 = transitionProposalStatus(tr.archive, r.proposal.id, 'submitted', undefined, 'test');
    if (!tr2.success) throw new Error('unexpected');

    const result = executeA03ToA04ProposalTransfer(
      [{ id: r.proposal.id, entityType: 'revision-proposal' }],
      tr2.archive,
    );
    expect(result.transferableProposals.length).toBe(1);
    expect(result.transferableProposals[0].transferType).toBe('proposed-content');
  });
});

// ─── Legacy Adapter ──────────────────────────────────────────────────────────

describe('legacyAdapter', () => {
  it('importLegacyProposals creates legacy status proposals', () => {
    const archive = importLegacyProposals({
      proposals: [
        { id: 'leg-1', focus: 'Focus test', oldText: 'testo 2012', newText: 'testo proposto', notes: 'nota' },
      ],
      state: { decisions: { 'leg-1': 'custom' }, customTexts: { 'leg-1': 'testo custom' } },
      disciplineSnapshot: 'Matematica',
      schoolOrderSnapshot: 'Primaria',
      academicYearSnapshot: '2024/2025',
    });
    expect(archive.proposals.length).toBe(1);
    expect(archive.proposals[0].status).toBe('legacy');
    expect(archive.decisions.length).toBe(1);
    expect(archive.decisions[0].status).toBe('legacy');
  });

  it('validateLegacyImport passes for valid legacy archive', () => {
    const archive = importLegacyProposals({
      proposals: [
        { id: 'leg-1', focus: 'Focus test', oldText: 'old', newText: 'new', notes: '' },
      ],
      state: { decisions: { 'leg-1': 'approved' }, customTexts: {} },
      disciplineSnapshot: 'Italiano',
      schoolOrderSnapshot: 'Secondaria',
      academicYearSnapshot: '2025/2026',
    });
    const result = validateLegacyImport(archive);
    expect(result.valid).toBe(true);
  });

  it('legacy approved does not create approved proposal status', () => {
    const archive = importLegacyProposals({
      proposals: [
        { id: 'leg-1', focus: 'Focus', oldText: 'old', newText: 'new', notes: '' },
      ],
      state: { decisions: { 'leg-1': 'approved' }, customTexts: {} },
      disciplineSnapshot: 'Storia',
      schoolOrderSnapshot: 'Primaria',
      academicYearSnapshot: '2024/2025',
    });
    expect(archive.proposals.every(p => p.status === 'legacy')).toBe(true);
    expect(archive.decisions.every(d => d.status === 'legacy')).toBe(true);
  });
});
