import { describe, expect, it } from 'vitest';
import r7a7Migration from '../../supabase/migrations/20260902080000_r7a7_canonical_adoption_execution.sql?raw';
import r7a8Migration from '../../supabase/migrations/20260902090000_r7a8_canonical_materialization_bootstrap.sql?raw';
import { assessEndToEndAdoptionFlow } from '../domain/institution/endToEndAdoptionValidation';
import { getArenaProcessContract, isCanonicalAdoptionImplemented } from '../domain/institution/processRoleModel';

describe('R7A9 integrated P6 validation', () => {
  it('has a server-authoritative genesis → prepared candidate → adoption chain', () => {
    expect(r7a8Migration).toContain('bootstrap_shared_canonical_curriculum_v1');
    expect(r7a8Migration).toContain('prepare_shared_canonical_candidate_v1');
    expect(r7a8Migration).toContain("p_candidate_canonical_version_ref, 'PREPARED'");
    expect(r7a7Migration).toContain('adopt_shared_canonical_curriculum_v1');
    expect(r7a7Migration).toContain("v_candidate.status is distinct from 'PREPARED'");
    expect(r7a7Migration).toContain("set status = 'ACTIVE'");
    expect(r7a7Migration).toContain('insert into public.canonical_adoption_receipts');
  });

  it('keeps authority principal-bound and fail-closed', () => {
    expect(r7a8Migration).toContain('WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH');
    expect(r7a8Migration).toContain('CURRENT_FINAL_DECISION_REQUIRED');
    expect(r7a8Migration).toContain('AUTHORITATIVE_CANONICAL_HEAD_REQUIRED');
    expect(r7a7Migration).toContain('WORKSPACE_ACTOR_CONTEXT_PRINCIPAL_MISMATCH');
    expect(r7a7Migration).toContain('AUTHORITATIVE_DECISION_BINDING_MISMATCH');
    expect(r7a7Migration).toContain('CANONICAL_HEAD_CAS_MISMATCH');
  });

  it('classifies P6 as implemented and executable', () => {
    expect(isCanonicalAdoptionImplemented()).toBe(true);
    expect(getArenaProcessContract('P6_CANONICAL_ADOPTION').implementationStatus).toBe('IMPLEMENTED');
    const p6 = assessEndToEndAdoptionFlow().steps.find((step) => step.processId === 'P6_CANONICAL_ADOPTION');
    expect(p6?.reality).toBe('EXECUTABLE');
  });

  it('does not falsely validate R7 while P1 and P3 remain partial', () => {
    const assessment = assessEndToEndAdoptionFlow();
    expect(assessment.verdict).toBe('ADOPTION_FLOW_BLOCKED');
    expect(assessment.blockingProcessIds).toEqual([
      'P1_SOURCE_QUALIFICATION',
      'P3_CURRICULUM_ANALYSIS',
    ]);
  });
});
