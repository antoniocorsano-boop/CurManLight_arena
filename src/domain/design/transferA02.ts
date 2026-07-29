/**
 * CML-633H — A02→A04 Transfer
 *
 * Transfers curriculum consultation selections into teaching design.
 * Creates immutable DesignCurriculumSelection snapshots qualified as current-curriculum.
 */

import type { EntityReference, EntityId, EntityType } from '../curriculum/identity/types';
import { createEntityReference } from '../curriculum/identity';
import type { DesignArchive, DesignTransferResult, DesignTransferWarning } from './types';
import type { A02ToA04Payload } from '../transfer/areaContracts';
import { createDesignCurriculumSelection } from './constructors';
import { validateDesignCurriculumSelection } from './validators';
import { computeStructuralFootprint } from '../transfer/signatures';

export function executeA02ToA04Transfer(
  _payload: A02ToA04Payload,
  _archive: DesignArchive,
  designRef: EntityReference,
): DesignTransferResult {
  const payload = _payload;
  const warnings: DesignTransferWarning[] = [];
  const createdSelections: unknown[] = [];

  if (!payload.nodeRefs || payload.nodeRefs.length === 0) {
    return {
      ok: false,
      error: { code: 'MISSING_NODE_REFS', message: 'No curriculum node references provided' },
      warnings: [],
    };
  }

  if (!payload.curriculumVersionRef || payload.curriculumVersionRef.trim() === '') {
    return {
      ok: false,
      error: { code: 'MISSING_VERSION', message: 'curriculumVersionRef is required' },
      warnings: [],
    };
  }

  // Preserve legacy warnings
  for (const w of payload.legacyWarnings) {
    warnings.push({ code: 'A02_LEGACY_WARNING', message: w });
  }

  for (const nodeRef of payload.nodeRefs) {
    const snapshot = payload.explicitSnapshots[nodeRef.entityId] ?? '';

    const sourceEntityRef = createEntityReference(
      nodeRef.entityId as EntityId,
      nodeRef.entityType as EntityType,
    );

    const curriculumVersionRef = createEntityReference(
      payload.curriculumVersionRef as EntityId,
      'curriculum-version' as EntityType,
    );

    const sourceRefs = payload.sources.map(s =>
      createEntityReference(s as EntityId, 'source' as EntityType),
    );
    const evidenceRefs = payload.evidences.map(e =>
      createEntityReference(e as EntityId, 'evidence' as EntityType),
    );

    const structuralFootprint = String(computeStructuralFootprint({
      entityId: nodeRef.entityId,
      snapshot,
      versionRef: payload.curriculumVersionRef,
    }));

    const selection = createDesignCurriculumSelection({
      designRef: { ...designRef },
      sourceArea: 'A02',
      sourceEntityRef,
      sourceVersionRef: curriculumVersionRef,
      curriculumNodeRef: sourceEntityRef,
      curriculumVersionRef,
      currentTextSnapshot: snapshot,
      selectedTextSnapshot: snapshot,
      qualification: 'current-curriculum',
      sourceRefs,
      evidenceRefs,
      transferContractVersion: '1.0',
      structuralFootprint,
    });

    const validation = validateDesignCurriculumSelection(selection);
    if (!validation.valid) {
      return {
        ok: false,
        error: validation.errors[0],
        warnings,
      };
    }

    createdSelections.push(selection);
  }

  const selection = createdSelections[0] as ReturnType<typeof createDesignCurriculumSelection>;

  return {
    ok: true,
    selection,
    warnings,
  };
}