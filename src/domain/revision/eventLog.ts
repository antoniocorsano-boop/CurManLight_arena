/**
 * Registro locale delle attività, non protocollo ufficiale.
 *
 * Immutable append-only log for revision lifecycle events.
 * Separate from TransferEvent (CML-633E) — different type system, different storage.
 */

import type {
  RevisionArchive,
  RevisionEvent,
  RevisionEventType,
  EntityReference,
  ActorReference,
  RevisionValidationResult,
} from './types';
import { createRevisionEvent } from './constructors';

// ─── Append ─────────────────────────────────────────────────────────────────

export interface AppendRevisionEventInput {
  entityRef: EntityReference;
  eventType: RevisionEventType;
  actor?: ActorReference;
  role?: string;
  previousStatus?: string;
  newStatus?: string;
  rationale?: string;
  references?: EntityReference[];
  structuralFootprint?: string;
}

export function appendRevisionEvent(
  archive: RevisionArchive,
  input: AppendRevisionEventInput,
): { event: RevisionEvent; archive: RevisionArchive } {
  const event = createRevisionEvent({
    entityRef: { ...input.entityRef },
    eventType: input.eventType,
    actor: input.actor,
    role: input.role,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    rationale: input.rationale,
    references: input.references ? input.references.map(r => ({ ...r })) : [],
    structuralFootprint: input.structuralFootprint,
  });

  return {
    event,
    archive: {
      ...archive,
      events: [...archive.events, event],
      updatedAt: new Date().toISOString(),
    },
  };
}

// ─── Queries ────────────────────────────────────────────────────────────────

export function getRevisionEvents(
  archive: RevisionArchive,
  filter?: { entityRefId?: string; eventType?: RevisionEventType; since?: string; maxEvents?: number },
): RevisionEvent[] {
  let events = [...archive.events];

  if (filter?.entityRefId) {
    events = events.filter(e => e.entityRef.id === filter.entityRefId);
  }
  if (filter?.eventType) {
    events = events.filter(e => e.eventType === filter.eventType);
  }
  if (filter?.since) {
    events = events.filter(e => e.timestamp >= filter.since!);
  }

  events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  if (filter?.maxEvents && filter.maxEvents > 0) {
    events = events.slice(-filter.maxEvents);
  }

  return events;
}

export function getEventsByProposal(archive: RevisionArchive, proposalId: string): RevisionEvent[] {
  return getRevisionEvents(archive, { entityRefId: proposalId });
}

export function getEventsByDecision(archive: RevisionArchive, decisionId: string): RevisionEvent[] {
  return getRevisionEvents(archive, { entityRefId: decisionId });
}

export function getEventsByEffect(archive: RevisionArchive, effectId: string): RevisionEvent[] {
  return getRevisionEvents(archive, { entityRefId: effectId });
}

export function getRecentRevisionEvents(archive: RevisionArchive, maxEvents = 20): RevisionEvent[] {
  return getRevisionEvents(archive, { maxEvents });
}

// ─── Integrity ──────────────────────────────────────────────────────────────

export function verifyRevisionEventIntegrity(archive: RevisionArchive): RevisionValidationResult {
  const errors: { code: string; message: string; field?: string }[] = [];
  const warnings: { code: string; message: string; field?: string }[] = [];

  const seenIds = new Set<string>();

  for (const event of archive.events) {
    // Duplicate event IDs
    if (seenIds.has(event.id)) {
      errors.push({ code: 'DUPLICATE_EVENT_ID', message: `Duplicate event id: ${event.id}`, field: 'id' });
    }
    seenIds.add(event.id);

    // Missing required fields
    if (!event.entityRef || typeof event.entityRef.id !== 'string') {
      errors.push({ code: 'EVENT_MISSING_ENTITY_REF', message: `Event ${event.id} missing entityRef`, field: 'entityRef' });
    }
    if (!event.timestamp) {
      errors.push({ code: 'EVENT_MISSING_TIMESTAMP', message: `Event ${event.id} missing timestamp`, field: 'timestamp' });
    }
    if (!event.eventType) {
      errors.push({ code: 'EVENT_MISSING_TYPE', message: `Event ${event.id} missing eventType`, field: 'eventType' });
    }

    // Structural footprint required
    if (typeof event.structuralFootprint !== 'string') {
      warnings.push({ code: 'EVENT_MISSING_FOOTPRINT', message: `Event ${event.id} missing structuralFootprint`, field: 'structuralFootprint' });
    }
  }

  // Check chronological ordering
  for (let i = 1; i < archive.events.length; i++) {
    if (archive.events[i].timestamp < archive.events[i - 1].timestamp) {
      warnings.push({
        code: 'EVENT_OUT_OF_ORDER',
        message: `Events out of chronological order at index ${i}: ${archive.events[i - 1].timestamp} > ${archive.events[i].timestamp}`,
      });
    }
  }

  return errors.length > 0 ? { valid: false, errors, warnings } : { valid: true, errors, warnings };
}