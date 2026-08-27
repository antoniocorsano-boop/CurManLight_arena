-- CurManLight Arena B3 hotfix — institutional decision sequence guard
-- Final decisions are unique per workspace + proposal version. Non-final outcomes
-- may be followed by a later deliberation, but writes are serialized server-side.

create index if not exists institutional_revision_decisions_version_idx
  on public.institutional_revision_decisions(workspace_id, proposal_version_ref, decided_at desc);

create unique index if not exists institutional_revision_decisions_one_final_per_version_uidx
  on public.institutional_revision_decisions(workspace_id, proposal_version_ref)
  where outcome in ('approve', 'approve-with-changes', 'reject');

create or replace function public.record_institutional_revision_decision(
  p_workspace_id uuid,
  p_proposal_ref text,
  p_proposal_version_ref text,
  p_proposal_version_fingerprint text,
  p_outcome text,
  p_rationale text,
  p_client_request_id uuid
)
returns setof public.institutional_revision_decisions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_existing public.institutional_revision_decisions%rowtype;
  v_latest public.institutional_revision_decisions%rowtype;
begin
  if v_user_id is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;

  if p_workspace_id is null
     or p_proposal_ref is null
     or nullif(trim(p_proposal_ref), '') is null
     or p_proposal_version_ref is null
     or nullif(trim(p_proposal_version_ref), '') is null
     or p_proposal_version_fingerprint is null
     or p_proposal_version_fingerprint !~ '^[a-f0-9]{64}$'
     or p_outcome is null
     or p_outcome not in ('approve', 'approve-with-changes', 'reject', 'defer', 'return-for-revision')
     or p_rationale is null
     or nullif(trim(p_rationale), '') is null
     or char_length(trim(p_rationale)) > 4000
     or p_client_request_id is null then
    raise exception 'INVALID_INSTITUTIONAL_DECISION_INPUT' using errcode = '22023';
  end if;

  select membership.role
    into v_role
  from public.workspace_memberships membership
  join public.workspaces workspace on workspace.id = membership.workspace_id
  where membership.workspace_id = p_workspace_id
    and membership.user_id = v_user_id
    and membership.status = 'active'
    and workspace.status = 'active';

  if v_role is distinct from 'collegio' then
    raise exception 'REVISION_DECIDE_REQUIRED' using errcode = '42501';
  end if;

  -- Exact client-request retries remain idempotent even after a final outcome.
  select *
    into v_existing
  from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id
    and decision.client_request_id = p_client_request_id;

  if found then
    if v_existing.decided_by <> v_user_id
       or v_existing.proposal_ref <> trim(p_proposal_ref)
       or v_existing.proposal_version_ref <> trim(p_proposal_version_ref)
       or v_existing.proposal_version_fingerprint <> p_proposal_version_fingerprint
       or v_existing.outcome <> p_outcome
       or v_existing.rationale <> trim(p_rationale) then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;

    return next v_existing;
    return;
  end if;

  -- Serialize independent decision attempts for the same workspace + proposal version.
  perform pg_advisory_xact_lock(
    hashtextextended(p_workspace_id::text || ':' || trim(p_proposal_version_ref), 0)
  );

  select *
    into v_latest
  from public.institutional_revision_decisions decision
  where decision.workspace_id = p_workspace_id
    and decision.proposal_version_ref = trim(p_proposal_version_ref)
  order by decision.decided_at desc, decision.id desc
  limit 1;

  if found then
    if v_latest.proposal_ref <> trim(p_proposal_ref) then
      raise exception 'PROPOSAL_VERSION_REFERENCE_MISMATCH' using errcode = '23514';
    end if;

    if v_latest.proposal_version_fingerprint <> p_proposal_version_fingerprint then
      raise exception 'PROPOSAL_VERSION_FINGERPRINT_MISMATCH' using errcode = '23514';
    end if;

    if v_latest.outcome in ('approve', 'approve-with-changes', 'reject') then
      raise exception 'INSTITUTIONAL_DECISION_ALREADY_FINAL' using errcode = '23505';
    end if;
  end if;

  insert into public.institutional_revision_decisions (
    workspace_id,
    proposal_ref,
    proposal_version_ref,
    proposal_version_fingerprint,
    outcome,
    rationale,
    decided_by,
    authority_role,
    client_request_id
  ) values (
    p_workspace_id,
    trim(p_proposal_ref),
    trim(p_proposal_version_ref),
    p_proposal_version_fingerprint,
    p_outcome,
    trim(p_rationale),
    v_user_id,
    'collegio',
    p_client_request_id
  )
  returning * into v_existing;

  return next v_existing;
end;
$$;

revoke all on function public.record_institutional_revision_decision(uuid, text, text, text, text, text, uuid) from public;
grant execute on function public.record_institutional_revision_decision(uuid, text, text, text, text, text, uuid) to authenticated;

comment on function public.record_institutional_revision_decision(uuid, text, text, text, text, text, uuid) is
  'Server-authoritative REVISION_DECIDE boundary. Serializes writes per proposal version, preserves idempotent retries, permits continuation only after non-final outcomes, and rejects duplicate final decisions.';
