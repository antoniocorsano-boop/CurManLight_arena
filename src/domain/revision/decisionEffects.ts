/**
 * Controlled decision effects.
 *
 * Preconditions:
 * - Decision must exist and be in recorded-local status
 * - Rationale must be present
 * - Authority must be declared
 * - Proposal version must be resolvable
 * - Effect must be compatible with the outcome
 *
 * Does NOT:
 * - Modify curriculumKB
 * - Replace nodes
 * - Modify curriculum versions
 * - Create official content
 * - Write to legacy fields
 * - Declare effect as institutionally adopted
 */

import type {
  RevisionArchive,
  Decision,
  DecisionEffectRecord,
  DecisionEffectType,
  EntityReference,
  ActorReference,
  RevisionError,
  RevisionWarning,
} from './types';
import { cloneRevisionArchive } from './constructors';
import { createDecisionEffectRecord, createRevisionEvent } from './constructors';
import { createEntityReference } from '../curriculum/identity';
import type { EntityId } from '../curriculum/identity/types';

// ─── Effect Application ────────────────────────────────────────────────────

export interface PlanEffectInput {
  decisionRef: EntityReference;
  effectType: DecisionEffectType;
  targetRef?: EntityReference;
  description: string;
  appliedBy?: ActorReference;
}

export interface ApplyEffectResult {
  success: boolean;
  archive: RevisionArchive;
  effect?: DecisionEffectRecord;
  errors: RevisionError[];
  warnings: RevisionWarning[];
}

/**
 * Plan a decision effect — records an effect as "planned" without applying it.
 */
export function planDecisionEffect(
  archive: RevisionArchive,
  input: PlanEffectInput,
): ApplyEffectResult {
  const warnings: RevisionWarning[] = [];
  const decision = archive.decisions.find(d => d.id === input.decisionRef.id);
  if (!decision) {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'DECISION_NOT_FOUND', message: `Decision ${input.decisionRef.id} not found` }],
      warnings: [],
    };
  }

  // Only recorded-local (or legacy) decisions can have effects
  if (decision.status !== 'recorded-local' && decision.status !== 'legacy') {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'DECISION_NOT_FINAL', message: `Decision ${decision.id} is not in a final status (current: ${decision.status})` }],
      warnings: [],
    };
  }

  // Validate effect is compatible with outcome
  const compatibilityIssue = checkEffectCompatibility(decision.outcome, input.effectType);
  if (compatibilityIssue) {
    warnings.push({ code: 'EFFECT_COMPATIBILITY', message: compatibilityIssue });
  }

  const effect = createDecisionEffectRecord({
    decisionRef: { ...input.decisionRef },
    effectType: input.effectType,
    targetRef: input.targetRef ? { ...input.targetRef } : undefined,
    description: input.description,
    status: 'planned',
    appliedBy: input.appliedBy,
  });

  const event = createRevisionEvent({
    entityRef: createEntityReference(effect.id as EntityId, 'decision' as never),
    eventType: 'curricular-effect-applied',
    actor: input.appliedBy,
    rationale: `Effect planned: ${input.effectType} — ${input.description}`,
  });

  const updated = cloneRevisionArchive(archive);
  updated.effects.push(effect);
  updated.events.push(event);
  updated.updatedAt = new Date().toISOString();

  return {
    success: true,
    archive: updated,
    effect,
    errors: [],
    warnings,
  };
}

/**
 * Apply a planned decision effect locally.
 * marks it as applied-local and records timestamp.
 * This does NOT modify curriculum content.
 */
export function applyDecisionEffectLocally(
  archive: RevisionArchive,
  effectId: string,
  actor?: ActorReference,
): ApplyEffectResult {
  const effect = archive.effects.find(e => e.id === effectId);
  if (!effect) {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'EFFECT_NOT_FOUND', message: `Effect ${effectId} not found` }],
      warnings: [],
    };
  }

  if (effect.status !== 'planned') {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'EFFECT_NOT_PLANNED', message: `Effect ${effectId} is not in planned status (current: ${effect.status})` }],
      warnings: [],
    };
  }

  const decision = archive.decisions.find(d => d.id === effect.decisionRef.id);
  if (!decision) {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'DECISION_NOT_FOUND', message: `Decision ${effect.decisionRef.id} not found` }],
      warnings: [],
    };
  }

  // Preconditions
  if (decision.status !== 'recorded-local') {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'DECISION_NOT_RECORDED', message: `Decision ${decision.id} not in recorded-local status` }],
      warnings: [],
    };
  }

  if (!decision.rationale || decision.rationale.trim().length === 0) {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'MISSING_RATIONALE', message: 'Decision rationale required before applying effect' }],
      warnings: [],
    };
  }

  if (!decision.authority) {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'MISSING_AUTHORITY', message: 'Decision authority required before applying effect' }],
      warnings: [],
    };
  }

  const now = new Date().toISOString();

  const updated = cloneRevisionArchive(archive);
  const updatedEffect = updated.effects.find(e => e.id === effectId);
  if (!updatedEffect) {
    return {
      success: false,
      archive: archive,
      errors: [{ code: 'EFFECT_NOT_FOUND', message: `Effect ${effectId} not found in updated archive` }],
      warnings: [],
    };
  }

  updatedEffect.status = 'applied-local';
  updatedEffect.appliedAt = now;
  updatedEffect.appliedBy = actor;

  const event = createRevisionEvent({
    entityRef: createEntityReference(effectId as EntityId, 'decision' as never),
    eventType: 'curricular-effect-applied',
    actor,
    rationale: `Effect applied locally: ${effect.effectType} — ${effect.description}`,
    previousStatus: 'planned',
    newStatus: 'applied-local',
  });
  updated.events.push(event);
  updated.updatedAt = now;

  // Note: this does NOT touch curriculum content, nodes, versions, or legacy data
  return {
    success: true,
    archive: updated,
    effect: updatedEffect,
    errors: [],
    warnings: [{ code: 'EFFECT_APPLIED_LOCAL', message: 'Effect applied locally. Not institutionally adopted.' }],
  };
}

/**
 * Cancel a planned effect.
 */
export function cancelDecisionEffect(
  archive: RevisionArchive,
  effectId: string,
  reason?: string,
  actor?: ActorReference,
): ApplyEffectResult {
  const effect = archive.effects.find(e => e.id === effectId);
  if (!effect) {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'EFFECT_NOT_FOUND', message: `Effect ${effectId} not found` }],
      warnings: [],
    };
  }

  if (effect.status === 'applied-local') {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'EFFECT_ALREADY_APPLIED', message: `Effect ${effectId} already applied — cannot cancel. Revoke the decision instead.` }],
      warnings: [],
    };
  }

  if (effect.status === 'cancelled' || effect.status === 'legacy') {
    return {
      success: false,
      archive: cloneRevisionArchive(archive),
      errors: [{ code: 'EFFECT_ALREADY_CANCELLED', message: `Effect ${effectId} is already ${effect.status}` }],
      warnings: [],
    };
  }

  const now = new Date().toISOString();
  const updated = cloneRevisionArchive(archive);
  const updatedEffect = updated.effects.find(e => e.id === effectId);
  if (!updatedEffect) {
    return {
      success: false,
      archive,
      errors: [{ code: 'EFFECT_NOT_FOUND', message: `Effect ${effectId} not found` }],
      warnings: [],
    };
  }

  updatedEffect.status = 'cancelled';
  updatedEffect.appliedAt = now;
  updatedEffect.appliedBy = actor;

  const event = createRevisionEvent({
    entityRef: createEntityReference(effectId as EntityId, 'decision' as never),
    eventType: 'curricular-effect-applied',
    actor,
    rationale: reason ?? `Effect cancelled: ${effect.effectType}`,
    previousStatus: effect.status,
    newStatus: 'cancelled',
  });
  updated.events.push(event);
  updated.updatedAt = now;

  return {
    success: true,
    archive: updated,
    effect: updatedEffect,
    errors: [],
    warnings: [],
  };
}

/**
 * List all effects for a decision.
 */
export function listDecisionEffects(
  archive: RevisionArchive,
  decisionId: string,
): DecisionEffectRecord[] {
  return archive.effects.filter(e => e.decisionRef.id === decisionId);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function checkEffectCompatibility(
  outcome: Decision['outcome'],
  effectType: DecisionEffectType,
): string | null {
  // None and defer are always compatible
  if (effectType === 'none' || effectType === 'defer') return null;

  // record-only should only have 'none' effect (already returned above)
  if (outcome === 'record-only') {
    return `Decision outcome "record-only" should not have effect "${effectType}". Use "none" instead.`;
  }

  // reject should not have content-modifying effects
  if (outcome === 'reject' && (effectType === 'new-proposal' || effectType === 'planned-update' || effectType === 'node-replacement')) {
    return `Decision outcome "reject" is incompatible with effect "${effectType}".`;
  }

  // return-for-revision should use new-proposal
  if (outcome === 'return-for-revision' && effectType !== 'new-proposal') {
    return `Decision outcome "return-for-revision" should use "new-proposal" effect.`;
  }

  return null;
}