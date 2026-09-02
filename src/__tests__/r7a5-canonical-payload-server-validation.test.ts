import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.resolve(
  process.cwd(),
  'supabase/migrations/20260902062000_r7a5_canonical_payload_validation.sql',
);
const sql = fs.readFileSync(migrationPath, 'utf8');

describe('R7A5 canonical payload server validation', () => {
  it('validates the frozen payload before fingerprint acceptance and persistence', () => {
    const validatorCall = sql.indexOf(
      'perform public.validate_shared_revision_proposal_payload_v1(p_proposal_ref,p_proposal_version_ref,p_canonical_payload);',
    );
    const digest = sql.indexOf("v_digest := encode(digest(convert_to(p_canonical_payload,'UTF8'),'sha256'),'hex');");
    const idempotencyLookup = sql.indexOf('select * into v_existing from public.shared_proposal_request_reservations');

    expect(validatorCall).toBeGreaterThan(-1);
    expect(digest).toBeGreaterThan(validatorCall);
    expect(idempotencyLookup).toBeGreaterThan(digest);
  });

  it('fails closed on missing and extra top-level keys', () => {
    expect(sql).toContain('CANONICAL_PAYLOAD_REQUIRED_KEY_MISSING');
    expect(sql).toContain('CANONICAL_PAYLOAD_EXTRA_KEY');
    expect(sql).toContain("v_required_keys text[] := array['id','proposalRef','versionNumber','currentTextSnapshot','proposedText','rationale','sourceRefs','evidenceRefs','createdAt','structuralFootprint','frozen']");
    expect(sql).toContain("v_allowed_keys text[] := array['id','proposalRef','versionNumber','currentTextSnapshot','proposedText','rationale','sourceRefs','evidenceRefs','createdAt','structuralFootprint','previousVersionRef','changeNote','frozen']");
  });

  it('binds canonical payload identities to the submitted command', () => {
    expect(sql).toContain("if v_payload->>'id' <> p_proposal_version_ref or v_payload->>'proposalRef' <> p_proposal_ref then raise exception 'CANONICAL_PAYLOAD_IDENTITY_MISMATCH'");
  });

  it('freezes reference shape and the canonical 16 entity types', () => {
    expect(sql).toContain('CANONICAL_PAYLOAD_REFERENCE_REQUIRED_KEY_MISSING');
    expect(sql).toContain('CANONICAL_PAYLOAD_REFERENCE_EXTRA_KEY');
    expect(sql).toContain("v_allowed_entity_types text[] := array['institute','source','curriculum-version','curriculum-segment','curriculum-node','curriculum-link','revision-proposal','decision','teaching-design','document','document-version','template','class-context','assessment','actor','event']");
    expect(sql).toContain('INVALID_CANONICAL_PAYLOAD_REFERENCE_ENTITY_TYPE');
  });

  it('preserves the R7A4 trimmed and typed field rules', () => {
    expect(sql).toContain('INVALID_CANONICAL_PAYLOAD_PROPOSED_TEXT');
    expect(sql).toContain('INVALID_CANONICAL_PAYLOAD_VERSION_NUMBER');
    expect(sql).toContain('INVALID_CANONICAL_PAYLOAD_CREATED_AT');
    expect(sql).toContain('INVALID_CANONICAL_PAYLOAD_STRUCTURAL_FOOTPRINT');
    expect(sql).toContain('INVALID_CANONICAL_PAYLOAD_FROZEN');
    expect(sql).toContain('INVALID_CANONICAL_PAYLOAD_PREVIOUS_VERSION_REF');
    expect(sql).toContain('INVALID_CANONICAL_PAYLOAD_CHANGE_NOTE');
  });
});
