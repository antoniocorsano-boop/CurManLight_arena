-- CurManLight Arena — #201 preflight for operational scope migration
-- Read-only assertions. This migration performs no DDL/DML and exists only to
-- fail closed before the atomic 20260906094500 mutation if known Beta receipts
-- do not match the exact proposal/fingerprint pairs already verified in code.

do $$
declare
  v_bad_contributions integer;
  v_bad_outcomes integer;
  v_bad_authority integer;
begin
  with expected(proposal_ref, legacy_fingerprint, scoped_fingerprint) as (
    values
      ('tec-sec1-2026-r2-n1',
       '13440266d7439e96c56ad44bd723a3017e8bcbc222db5495c3965627de96d8cd',
       '48a7c6bb5f4d6aa6a541489de54e2ee3bae08117eb35518714291f9f33210e0e'),
      ('tec-sec1-2026-r2-n2',
       'f8c55c86063251b85ea4e6fdcca405d65b79f296d7306c5121337c2aa4403194',
       '1fa4ce024884329c32d78a16ffdc5f28573627683ad038b0cfb3bb793a22d8a9'),
      ('tec-sec1-2026-r2-n3',
       '9916b4c92139d194ac480409c57f9fb2d0c1bd1c97699a4383069a79dad101e5',
       '0a4fc3fd15bc6a05299d660a9cf6f13d9fb38154b47053c8de6ca556d0b84a16'),
      ('tec-sec1-2026-r2-n4',
       '5a553d6ac03fa839a00b8470e398a01b437e22b72fc8cc2cb8f6f7296861ae0f',
       '40edc8e1d3f7c0464db54545a5c12d74b7059e01a6c7489676398173d6ee204e'),
      ('tec-sec1-2026-r2-verticalita',
       'a405b4a454748509c258e155230103f9c42e607ab588cac14092d416803e331b',
       '9c626a358ff3f718db84c1fb4d76170b69272a4b086382b2106124e0bc43543c')
  )
  select count(*)::integer into v_bad_contributions
  from public.team_review_contributions c
  join expected e on e.proposal_ref = c.proposal_ref
  where c.proposal_fingerprint not in (e.legacy_fingerprint, e.scoped_fingerprint);

  if v_bad_contributions > 0 then
    raise exception 'LEGACY_TECHNOLOGY_CONTRIBUTION_FINGERPRINT_MISMATCH' using errcode = '23514';
  end if;

  with expected(proposal_ref, legacy_fingerprint, scoped_fingerprint) as (
    values
      ('tec-sec1-2026-r2-n1',
       '13440266d7439e96c56ad44bd723a3017e8bcbc222db5495c3965627de96d8cd',
       '48a7c6bb5f4d6aa6a541489de54e2ee3bae08117eb35518714291f9f33210e0e'),
      ('tec-sec1-2026-r2-n2',
       'f8c55c86063251b85ea4e6fdcca405d65b79f296d7306c5121337c2aa4403194',
       '1fa4ce024884329c32d78a16ffdc5f28573627683ad038b0cfb3bb793a22d8a9'),
      ('tec-sec1-2026-r2-n3',
       '9916b4c92139d194ac480409c57f9fb2d0c1bd1c97699a4383069a79dad101e5',
       '0a4fc3fd15bc6a05299d660a9cf6f13d9fb38154b47053c8de6ca556d0b84a16'),
      ('tec-sec1-2026-r2-n4',
       '5a553d6ac03fa839a00b8470e398a01b437e22b72fc8cc2cb8f6f7296861ae0f',
       '40edc8e1d3f7c0464db54545a5c12d74b7059e01a6c7489676398173d6ee204e'),
      ('tec-sec1-2026-r2-verticalita',
       'a405b4a454748509c258e155230103f9c42e607ab588cac14092d416803e331b',
       '9c626a358ff3f718db84c1fb4d76170b69272a4b086382b2106124e0bc43543c')
  )
  select count(*)::integer into v_bad_outcomes
  from public.team_review_outcomes o
  join expected e on e.proposal_ref = o.proposal_ref
  where o.proposal_fingerprint not in (e.legacy_fingerprint, e.scoped_fingerprint);

  if v_bad_outcomes > 0 then
    raise exception 'LEGACY_TECHNOLOGY_OUTCOME_FINGERPRINT_MISMATCH' using errcode = '23514';
  end if;

  select count(*)::integer into v_bad_authority
  from public.team_review_outcomes o
  where o.proposal_ref in (
    'tec-sec1-2026-r2-n1','tec-sec1-2026-r2-n2','tec-sec1-2026-r2-n3',
    'tec-sec1-2026-r2-n4','tec-sec1-2026-r2-verticalita'
  )
    and o.recorded_by_role not in ('dipartimento','referente');

  if v_bad_authority > 0 then
    raise exception 'LEGACY_TECHNOLOGY_OUTCOME_AUTHORITY_MISMATCH' using errcode = '23514';
  end if;
end;
$$;

-- Explicit non-mutation contract for review/CI:
-- this preflight does not insert, update, delete, alter, create, drop or grant.
