-- Wrap the exact-byte validator so the frozen parseable-timestamptz createdAt rule remains enforced.
alter function public.validate_shared_revision_proposal_payload_v1(text,text,text)
  rename to validate_shared_revision_proposal_payload_exact_bytes_v1;

create function public.validate_shared_revision_proposal_payload_v1(
  p_proposal_ref text,
  p_proposal_version_ref text,
  p_canonical_payload text
) returns void
language plpgsql set search_path=public,pg_temp
as $$
declare
  v_payload jsonb;
begin
  perform public.validate_shared_revision_proposal_payload_exact_bytes_v1(
    p_proposal_ref,
    p_proposal_version_ref,
    p_canonical_payload
  );
  v_payload := p_canonical_payload::jsonb;
  perform public.validate_shared_revision_proposal_created_at_v1(v_payload->>'createdAt');
end;
$$;

revoke all on function public.validate_shared_revision_proposal_payload_exact_bytes_v1(text,text,text) from public;
revoke all on function public.validate_shared_revision_proposal_payload_v1(text,text,text) from public;
