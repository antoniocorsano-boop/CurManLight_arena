-- Preserve the frozen R7A4 createdAt contract after the Codex review closure.
create or replace function public.validate_shared_revision_proposal_created_at_v1(p_value text)
returns void
language plpgsql set search_path=public,pg_temp
as $$
begin
  if p_value is null then raise exception 'INVALID_CANONICAL_PAYLOAD_CREATED_AT' using errcode='22023'; end if;
  begin
    perform p_value::timestamptz;
  exception when others then
    raise exception 'INVALID_CANONICAL_PAYLOAD_CREATED_AT' using errcode='22023';
  end;
end;
$$;

-- The canonical payload validator invokes this helper through the submission RPC guard.
-- Keep this helper non-IMMUTABLE because timestamptz parsing is environment-sensitive.
revoke all on function public.validate_shared_revision_proposal_created_at_v1(text) from public;
