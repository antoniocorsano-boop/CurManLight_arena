-- CurManLight Arena — #201 corrective migration
--
-- Fixes a false negative in upsert_my_operational_profile_v1 when the same
-- discipline exists in more than one school order (for example tecnologia in
-- both primaria and secondaria). Validation must reject a discipline only when
-- there is NO active mapping for the requested school order.

create or replace function public.upsert_my_operational_profile_v1(
  p_academic_year text,
  p_school_order text,
  p_disciplines text[],
  p_coordinator_group_code text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_invalid_count integer;
  v_result jsonb;
begin
  if v_user is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;
  if p_coordinator_group_code is not null then
    raise exception 'SELF_ASSIGNED_OPERATIONAL_COORDINATOR_FORBIDDEN' using errcode = '42501';
  end if;
  if p_academic_year is null or p_academic_year !~ '^[0-9]{4}/[0-9]{4}$' then
    raise exception 'INVALID_ACADEMIC_YEAR' using errcode = '22023';
  end if;
  if p_school_order not in ('primaria','secondaria') then
    raise exception 'OPERATIONAL_SCHOOL_ORDER_REQUIRED' using errcode = '22023';
  end if;
  if p_disciplines is null or cardinality(p_disciplines) = 0 then
    raise exception 'OPERATIONAL_DISCIPLINE_REQUIRED' using errcode = '22023';
  end if;
  if exists (
    select 1 from unnest(p_disciplines) as raw(discipline)
    where raw.discipline is null
      or raw.discipline = ''
      or raw.discipline <> trim(raw.discipline)
      or position(chr(31) in raw.discipline) > 0
  ) then
    raise exception 'INVALID_OPERATIONAL_DISCIPLINE' using errcode = '22023';
  end if;

  select count(*)::integer into v_invalid_count
  from (
    select distinct raw.discipline
    from unnest(p_disciplines) as raw(discipline)
  ) selected
  where not exists (
    select 1
    from public.operational_group_discipline_map map
    join public.operational_group_definitions defs
      on defs.group_code = map.group_code
    where map.discipline = selected.discipline
      and defs.school_order = p_school_order
      and defs.active = true
  );

  if v_invalid_count > 0 then
    raise exception 'DISCIPLINE_NOT_AVAILABLE_FOR_OPERATIONAL_ORDER' using errcode = '22023';
  end if;

  delete from public.team_operational_memberships membership
  using public.operational_group_definitions defs
  where membership.user_id = v_user
    and membership.academic_year = p_academic_year
    and membership.school_order = p_school_order
    and membership.membership_state = 'OPERATIVO_PROVVISORIO'
    and defs.group_code = membership.group_code
    and defs.school_order = p_school_order;

  insert into public.team_operational_memberships(
    user_id, academic_year, school_order, group_code, member_role,
    membership_state, disciplines, updated_at
  )
  select
    v_user,
    p_academic_year,
    p_school_order,
    grouped.group_code,
    'docente',
    'OPERATIVO_PROVVISORIO',
    grouped.disciplines,
    now()
  from (
    select
      map.group_code,
      array_agg(distinct selected.discipline order by selected.discipline) as disciplines
    from (
      select distinct raw.discipline
      from unnest(p_disciplines) as raw(discipline)
    ) selected
    join public.operational_group_discipline_map map
      on map.discipline = selected.discipline
    join public.operational_group_definitions defs
      on defs.group_code = map.group_code
      and defs.school_order = p_school_order
      and defs.active = true
    group by map.group_code
  ) grouped
  on conflict (user_id, academic_year, group_code)
  do update set
    school_order = case
      when public.team_operational_memberships.membership_state = 'FORMALIZZATO'
        then public.team_operational_memberships.school_order
      else excluded.school_order
    end,
    member_role = case
      when public.team_operational_memberships.membership_state = 'FORMALIZZATO'
        then public.team_operational_memberships.member_role
      else 'docente'
    end,
    disciplines = case
      when public.team_operational_memberships.membership_state = 'FORMALIZZATO'
        then public.team_operational_memberships.disciplines
      else excluded.disciplines
    end,
    updated_at = now();

  select jsonb_build_object(
    'academic_year', p_academic_year,
    'school_order', p_school_order,
    'groups', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'group_code', membership.group_code,
          'member_role', membership.member_role,
          'membership_state', membership.membership_state,
          'disciplines', membership.disciplines
        ) order by membership.group_code
      ),
      '[]'::jsonb
    )
  ) into v_result
  from public.team_operational_memberships membership
  where membership.user_id = v_user
    and membership.academic_year = p_academic_year
    and membership.school_order = p_school_order;

  return v_result;
end;
$$;

revoke all on function public.upsert_my_operational_profile_v1(text,text,text[],text) from public;
revoke all on function public.upsert_my_operational_profile_v1(text,text,text[],text) from anon;
grant execute on function public.upsert_my_operational_profile_v1(text,text,text[],text) to authenticated;
