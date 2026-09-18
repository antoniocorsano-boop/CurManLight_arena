import { describe, expect, it } from 'vitest';
import audit from '../../docs/architecture/ARENA_CURRICULUM_SYSTEM_STATUS_2026-09-03.json';
import { CURRICULUM_PERSISTENCE_MODE } from '../domain/curriculum/persistence/compatibilityMode';
import {
  CURRICULUM_ANALYSIS_CANONICAL_SCOPE,
  CURRICULUM_ANALYSIS_EXCLUDED_SCHOOL_ORDERS,
} from '../domain/institution/curriculumAnalysis';

describe('Arena curriculum system audit contract', () => {
  it('does not mistake the current R7 runtime scope for semantic whole-school completeness', () => {
    expect(audit.overallStatus).toBe('CONVERGENCE_REQUIRED');
    expect(audit.authorityPipeline.status).toBe('IMPLEMENTED_SCOPE_BOUND');
    expect(audit.authorityPipeline.semanticCompletenessClaim).toBe(false);
    expect(audit.authorityPipeline.canonicalScope).toBe(CURRICULUM_ANALYSIS_CANONICAL_SCOPE);
    expect(audit.authorityPipeline.excludedSchoolOrders).toEqual(CURRICULUM_ANALYSIS_EXCLUDED_SCHOOL_ORDERS);
  });

  it('records the actual productive persistence mode instead of treating the new domain as active', () => {
    expect(CURRICULUM_PERSISTENCE_MODE).toBe('legacy-only');
    expect(audit.operationalCurriculum.persistenceMode).toBe(CURRICULUM_PERSISTENCE_MODE);
    expect(audit.operationalCurriculum.newDomainPrimary).toBe(false);
  });

  it('keeps convergence blockers machine-readable until dedicated remediation tranches close them', () => {
    const blockerIds = new Set(audit.blockers.map((blocker) => blocker.id));
    expect(blockerIds).toEqual(new Set([
      'CURR-SYS-001',
      'CURR-SYS-002',
      'CURR-SYS-003',
      'CURR-SYS-004',
      'CURR-SYS-005',
      'CURR-SYS-006',
      'CURR-SYS-007',
      'CURR-SYS-008',
    ]));
  });
});
