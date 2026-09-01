import { describe, expect, it } from 'vitest';
import {
  ARENA_ROLE_SURFACE_INVENTORY,
  getArenaRoleSurfaceInventoryItem,
} from '../domain/institution/roleSurfaceInventory';

describe('Arena Role Experience Inventory v1', () => {
  it('covers all seven canonical first-class surfaces exactly once', () => {
    expect(ARENA_ROLE_SURFACE_INVENTORY.map((item) => item.id)).toEqual([
      'HOME',
      'CURRICULUM',
      'SOURCES',
      'REVISION',
      'KNOWLEDGE',
      'DOCUMENTS',
      'SUPPORT',
    ]);
  });

  it('records Home as only partially role-oriented rather than a complete role work queue', () => {
    expect(getArenaRoleSurfaceInventoryItem('HOME').currentRoleDifferentiation).toBe('ROLE_ORIENTED_COPY');
    expect(getArenaRoleSurfaceInventoryItem('HOME').targetPrimaryTask).toMatch(/lavoro.*attenzione/i);
  });

  it('records Curricolo, Fonti, Conoscenza and Documenti as common surfaces', () => {
    for (const id of ['CURRICULUM', 'SOURCES', 'KNOWLEDGE', 'DOCUMENTS'] as const) {
      expect(getArenaRoleSurfaceInventoryItem(id).currentRoleDifferentiation).toBe('COMMON_SURFACE');
    }
  });

  it('keeps Revision distinct because only its institutional decision boundary is authenticated', () => {
    expect(getArenaRoleSurfaceInventoryItem('REVISION').currentRoleDifferentiation).toBe('COMMON_WITH_AUTHENTICATED_BOUNDARY');
  });

  it('maps every non-support surface to at least one canonical process', () => {
    for (const item of ARENA_ROLE_SURFACE_INVENTORY) {
      if (item.id !== 'SUPPORT') expect(item.processes.length).toBeGreaterThan(0);
    }
  });

  it('does not disguise high-priority role experience gaps as low-severity polish', () => {
    expect(getArenaRoleSurfaceInventoryItem('REVISION').gapSeverity).toBe('HIGH');
    expect(getArenaRoleSurfaceInventoryItem('DOCUMENTS').gapSeverity).toBe('HIGH');
    expect(getArenaRoleSurfaceInventoryItem('SUPPORT').gapSeverity).toBe('LOW');
  });
});
