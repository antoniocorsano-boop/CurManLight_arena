-- CurManLight Arena — team meeting workspace
-- Product rule: individual contribution != team outcome != institutional decision != canonical adoption.
-- Shared writes are authenticated RPC-only. Reads require active workspace membership.

create table if not exists public.team_review_contributions (
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  proposal_ref text not null,
  proposal_fingerprint text not null check (proposal_fingerprint ~ '^[0-9a-f]{64}$'),
  contributor_user_id uuid not null references auth.users(id) on delete restrict,
  contributor_role text not null check (contributor_role in ('docente','dipartimento','referente')),
  orientation text not null check (orientation in ('confirm-proposal','propose-change','keep-previous')),
  custom_text text,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, proposal_ref, contributor_user_id),
  check (proposal_ref = trim(proposal_ref) and char_length(proposal_ref) > 0 and position(chr(31) in proposal_ref) = 0),
  check (
    (orientation = 'propose-change' and custom_text is not null and char_length(trim(custom_text)) > 0)
    or
    (orientation <> 'propose-change' and custom_text is null)
  )
);

create table if not exists public.team_review_outcomes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  proposal_ref text not null,
  proposal_fingerprint text not null check (proposal_fingerprint ~ '^[0-9a-f]{64}$'),
  outcome text not null check (outcome in ('accept-proposal','keep-previous','shared-text','defer')),
  shared_text text,
  rationale text not null check (char_length(trim(rationale)) > 0),
  recorded_by_user_id uuid not null references auth.users(id) on delete restrict,
  recorded_by_role text not null check (recorded_by_role in ('dipartimento','referente')),
  recorded_at timestamptz not null default now(),
  client_request_id text not null,
  unique (workspace_id, client_request_id),
  check (proposal_ref = trim(proposal_ref) and char_length(proposal_ref) > 0 and position(chr(31) in proposal_ref) = 0),
  check (client_request_id = trim(client_request_id) and char_length(client_request_id) > 0 and position(chr(31) in client_request_id) = 0),
  check (
    (outcome = 'shared-text' and shared_text is not null and char_length(trim(shared_text)) > 0)
    or
    (outcome <> 'shared-text' and shared_text is null)
  )
);

alter table public.team_review_contributions enable row level security;
alter table public.team_review_outcomes enable row level security;

create policy "team_review_contributions_select_active_member" on public.team_review_contributions
for select to authenticated using (exists (
  select 1
  from public.workspace_memberships m
  join public.workspaces w on w.id = m.workspace_id
  where m.workspace_id = team_review_contributions.workspace_id
    and m.user_id = auth.uid()
    and m.status = 'active'
    and w.status = 'active'
));

create policy "team_review_outcomes_select_active_member" on public.team_review_outcomes
for select to authenticated using (exists (
  select 1
  from public.workspace_memberships m
  join public.workspaces w on w.id = m.workspace_id
  where m.workspace_id = team_review_outcomes.workspace_id
    and m.user_id = auth.uid()
    and m.status = 'active'
    and w.status = 'active'
));

revoke insert, update, delete on public.team_review_contributions, public.team_review_outcomes from anon, authenticated;
grant select on public.team_review_contributions, public.team_review_outcomes to authenticated;

create or replace function public.upsert_team_review_contribution_v1(
  p_workspace_id uuid,
  p_proposal_ref text,
  p_proposal_fingerprint text,
  p_orientation text,
  p_custom_text text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_row public.team_review_contributions%rowtype;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_proposal_ref is null or p_proposal_ref <> trim(p_proposal_ref) or p_proposal_ref = '' or position(chr(31) in p_proposal_ref) > 0 then
    raise exception 'INVALID_PROPOSAL_REF' using errcode = '22023';
  end if;
  if p_proposal_fingerprint is null or p_proposal_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'INVALID_PROPOSAL_FINGERPRINT' using errcode = '22023';
  end if;
  if p_orientation not in ('confirm-proposal','propose-change','keep-previous') then
    raise exception 'INVALID_TEAM_REVIEW_ORIENTATION' using errcode = '22023';
  end if;
  if p_orientation = 'propose-change' and (p_custom_text is null or char_length(trim(p_custom_text)) = 0) then
    raise exception 'CUSTOM_TEXT_REQUIRED' using errcode = '22023';
  end if;
  if p_orientation <> 'propose-change' and p_custom_text is not null then
    raise exception 'CUSTOM_TEXT_NOT_ALLOWED' using errcode = '22023';
  end if;

  select m.role into v_role
  from public.workspace_memberships m
  join public.workspaces w on w.id = m.workspace_id
  where m.workspace_id = p_workspace_id
    and m.user_id = v_user
    and m.status = 'active'
    and w.status = 'active';

  if v_role not in ('docente','dipartimento','referente') then
    raise exception 'TEAM_REVIEW_CONTRIBUTE_REQUIRED' using errcode = '42501';
  end if;

  insert into public.team_review_contributions(
    workspace_id,
    proposal_ref,
    proposal_fingerprint,
    contributor_user_id,
    contributor_role,
    orientation,
    custom_text,
    updated_at
  ) values (
    p_workspace_id,
    p_proposal_ref,
    p_proposal_fingerprint,
    v_user,
    v_role,
    p_orientation,
    case when p_orientation = 'propose-change' then trim(p_custom_text) else null end,
    now()
  )
  on conflict (workspace_id, proposal_ref, contributor_user_id)
  do update set
    proposal_fingerprint = excluded.proposal_fingerprint,
    contributor_role = excluded.contributor_role,
    orientation = excluded.orientation,
    custom_text = excluded.custom_text,
    updated_at = excluded.updated_at
  returning * into v_row;

  return jsonb_build_object(
    'workspace_id', v_row.workspace_id,
    'proposal_ref', v_row.proposal_ref,
    'proposal_fingerprint', v_row.proposal_fingerprint,
    'contributor_user_id', v_row.contributor_user_id,
    'contributor_role', v_row.contributor_role,
    'orientation', v_row.orientation,
    'custom_text', v_row.custom_text,
    'updated_at', v_row.updated_at
  );
end;
$$;

revoke all on function public.upsert_team_review_contribution_v1(uuid,text,text,text,text) from public;
grant execute on function public.upsert_team_review_contribution_v1(uuid,text,text,text,text) to authenticated;

create or replace function public.record_team_review_outcome_v1(
  p_workspace_id uuid,
  p_proposal_ref text,
  p_proposal_fingerprint text,
  p_outcome text,
  p_shared_text text,
  p_rationale text,
  p_client_request_id text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_existing public.team_review_outcomes%rowtype;
  v_row public.team_review_outcomes%rowtype;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_proposal_ref is null or p_proposal_ref <> trim(p_proposal_ref) or p_proposal_ref = '' or position(chr(31) in p_proposal_ref) > 0 then
    raise exception 'INVALID_PROPOSAL_REF' using errcode = '22023';
  end if;
  if p_proposal_fingerprint is null or p_proposal_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'INVALID_PROPOSAL_FINGERPRINT' using errcode = '22023';
  end if;
  if p_outcome not in ('accept-proposal','keep-previous','shared-text','defer') then
    raise exception 'INVALID_TEAM_REVIEW_OUTCOME' using errcode = '22023';
  end if;
  if p_rationale is null or char_length(trim(p_rationale)) = 0 then
    raise exception 'RATIONALE_REQUIRED' using errcode = '22023';
  end if;
  if p_client_request_id is null or p_client_request_id <> trim(p_client_request_id) or p_client_request_id = '' or position(chr(31) in p_client_request_id) > 0 then
    raise exception 'INVALID_CLIENT_REQUEST_ID' using errcode = '22023';
  end if;
  if p_outcome = 'shared-text' and (p_shared_text is null or char_length(trim(p_shared_text)) = 0) then
    raise exception 'SHARED_TEXT_REQUIRED' using errcode = '22023';
  end if;
  if p_outcome <> 'shared-text' and p_shared_text is not null then
    raise exception 'SHARED_TEXT_NOT_ALLOWED' using errcode = '22023';
  end if;

  select m.role into v_role
  from public.workspace_memberships m
  join public.workspaces w on w.id = m.workspace_id
  where m.workspace_id = p_workspace_id
    and m.user_id = v_user
    and m.status = 'active'
    and w.status = 'active';

  if v_role not in ('dipartimento','referente') then
    raise exception 'TEAM_REVIEW_DECIDE_REQUIRED' using errcode = '42501';
  end if;

  select * into v_existing
  from public.team_review_outcomes
  where workspace_id = p_workspace_id and client_request_id = p_client_request_id;

  if found then
    if v_existing.recorded_by_user_id <> v_user
      or v_existing.proposal_ref <> p_proposal_ref
      or v_existing.proposal_fingerprint <> p_proposal_fingerprint
      or v_existing.outcome <> p_outcome
      or coalesce(v_existing.shared_text, '') <> coalesce(case when p_outcome = 'shared-text' then trim(p_shared_text) else null end, '')
      or v_existing.rationale <> trim(p_rationale)
    then
      raise exception 'CLIENT_REQUEST_ID_REUSE_MISMATCH' using errcode = '23505';
    end if;
    v_row := v_existing;
  else
    insert into public.team_review_outcomes(
      workspace_id,
      proposal_ref,
      proposal_fingerprint,
      outcome,
      shared_text,
      rationale,
      recorded_by_user_id,
      recorded_by_role,
      recorded_at,
      client_request_id
    ) values (
      p_workspace_id,
      p_proposal_ref,
      p_proposal_fingerprint,
      p_outcome,
      case when p_outcome = 'shared-text' then trim(p_shared_text) else null end,
      trim(p_rationale),
      v_user,
      v_role,
      now(),
      p_client_request_id
    ) returning * into v_row;
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'workspace_id', v_row.workspace_id,
    'proposal_ref', v_row.proposal_ref,
    'proposal_fingerprint', v_row.proposal_fingerprint,
    'outcome', v_row.outcome,
    'shared_text', v_row.shared_text,
    'rationale', v_row.rationale,
    'recorded_by_user_id', v_row.recorded_by_user_id,
    'recorded_by_role', v_row.recorded_by_role,
    'recorded_at', v_row.recorded_at,
    'client_request_id', v_row.client_request_id
  );
end;
$$;

revoke all on function public.record_team_review_outcome_v1(uuid,text,text,text,text,text,text) from public;
grant execute on function public.record_team_review_outcome_v1(uuid,text,text,text,text,text,text) to authenticated;

comment on table public.team_review_contributions is
'Authenticated individual preparation contributions. They are not votes, team decisions, institutional decisions or canonical curriculum state.';

comment on table public.team_review_outcomes is
'Append-only working outcomes recorded for a team meeting. They never imply institutional approval or canonical adoption.';
