-- CurManLight Arena — continuità delle ricevute team pre-scope
--
-- Questa migrazione NON crea nuove decisioni e NON inferisce nuovi incarichi.
-- Riallinea soltanto ricevute già esistenti al nuovo schema di scope quando
-- l'identità della proposta è deterministica e verificata.
--
-- Tecnologia R2: i cinque fingerprint legacy sono stati ricostruiti con
-- l'algoritmo pre-#201 e coincidono con quelli presenti nel pilota Beta.
-- Poiché testo e proposta sono invariati, vengono re-identificati con il nuovo
-- fingerprint scoped (anno + ordine + gruppo + disciplina + proposta + testo).
--
-- Italiano legacy: viene recuperato solo lo scope. Il fingerprint NON viene
-- promosso al nuovo schema: quei contributi restano intenzionalmente stale e
-- richiedono una nuova condivisione esplicita dell'utente sulla versione scoped.

-- 1. Fail closed se una ricevuta Tecnologia nota non corrisponde né al
-- fingerprint legacy verificato né al nuovo fingerprint scoped atteso.
do $$
begin
  if exists (
    select 1
    from public.team_review_contributions c
    where c.proposal_ref in (
      'tec-sec1-2026-r2-n1',
      'tec-sec1-2026-r2-n2',
      'tec-sec1-2026-r2-n3',
      'tec-sec1-2026-r2-n4',
      'tec-sec1-2026-r2-verticalita'
    )
      and c.proposal_fingerprint <> case c.proposal_ref
        when 'tec-sec1-2026-r2-n1' then '13440266d7439e96c56ad44bd723a3017e8bcbc222db5495c3965627de96d8cd'
        when 'tec-sec1-2026-r2-n2' then 'f8c55c86063251b85ea4e6fdcca405d65b79f296d7306c5121337c2aa4403194'
        when 'tec-sec1-2026-r2-n3' then '9916b4c92139d194ac480409c57f9fb2d0c1bd1c97699a4383069a79dad101e5'
        when 'tec-sec1-2026-r2-n4' then '5a553d6ac03fa839a00b8470e398a01b437e22b72fc8cc2cb8f6f7296861ae0f'
        when 'tec-sec1-2026-r2-verticalita' then 'a405b4a454748509c258e155230103f9c42e607ab588cac14092d416803e331b'
      end
      and c.proposal_fingerprint <> case c.proposal_ref
        when 'tec-sec1-2026-r2-n1' then '48a7c6bb5f4d6aa6a541489de54e2ee3bae08117eb35518714291f9f33210e0e'
        when 'tec-sec1-2026-r2-n2' then '1fa4ce024884329c32d78a16ffdc5f28573627683ad038b0cfb3bb793a22d8a9'
        when 'tec-sec1-2026-r2-n3' then '0a4fc3fd15bc6a05299d660a9cf6f13d9fb38154b47053c8de6ca556d0b84a16'
        when 'tec-sec1-2026-r2-n4' then '40edc8e1d3f7c0464db54545a5c12d74b7059e01a6c7489676398173d6ee204e'
        when 'tec-sec1-2026-r2-verticalita' then '9c626a358ff3f718db84c1fb4d76170b69272a4b086382b2106124e0bc43543c'
      end
  ) then
    raise exception 'LEGACY_TECHNOLOGY_CONTRIBUTION_FINGERPRINT_MISMATCH' using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.team_review_outcomes o
    where o.proposal_ref in (
      'tec-sec1-2026-r2-n1',
      'tec-sec1-2026-r2-n2',
      'tec-sec1-2026-r2-n3',
      'tec-sec1-2026-r2-n4',
      'tec-sec1-2026-r2-verticalita'
    )
      and o.recorded_by_role not in ('dipartimento','referente')
  ) then
    raise exception 'LEGACY_TECHNOLOGY_OUTCOME_AUTHORITY_MISMATCH' using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.team_review_outcomes o
    where o.proposal_ref in (
      'tec-sec1-2026-r2-n1',
      'tec-sec1-2026-r2-n2',
      'tec-sec1-2026-r2-n3',
      'tec-sec1-2026-r2-n4',
      'tec-sec1-2026-r2-verticalita'
    )
      and o.proposal_fingerprint <> case o.proposal_ref
        when 'tec-sec1-2026-r2-n1' then '13440266d7439e96c56ad44bd723a3017e8bcbc222db5495c3965627de96d8cd'
        when 'tec-sec1-2026-r2-n2' then 'f8c55c86063251b85ea4e6fdcca405d65b79f296d7306c5121337c2aa4403194'
        when 'tec-sec1-2026-r2-n3' then '9916b4c92139d194ac480409c57f9fb2d0c1bd1c97699a4383069a79dad101e5'
        when 'tec-sec1-2026-r2-n4' then '5a553d6ac03fa839a00b8470e398a01b437e22b72fc8cc2cb8f6f7296861ae0f'
        when 'tec-sec1-2026-r2-verticalita' then 'a405b4a454748509c258e155230103f9c42e607ab588cac14092d416803e331b'
      end
      and o.proposal_fingerprint <> case o.proposal_ref
        when 'tec-sec1-2026-r2-n1' then '48a7c6bb5f4d6aa6a541489de54e2ee3bae08117eb35518714291f9f33210e0e'
        when 'tec-sec1-2026-r2-n2' then '1fa4ce024884329c32d78a16ffdc5f28573627683ad038b0cfb3bb793a22d8a9'
        when 'tec-sec1-2026-r2-n3' then '0a4fc3fd15bc6a05299d660a9cf6f13d9fb38154b47053c8de6ca556d0b84a16'
        when 'tec-sec1-2026-r2-n4' then '40edc8e1d3f7c0464db54545a5c12d74b7059e01a6c7489676398173d6ee204e'
        when 'tec-sec1-2026-r2-verticalita' then '9c626a358ff3f718db84c1fb4d76170b69272a4b086382b2106124e0bc43543c'
      end
  ) then
    raise exception 'LEGACY_TECHNOLOGY_OUTCOME_FINGERPRINT_MISMATCH' using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.team_review_contributions c
    where c.proposal_ref in (
      'tec-sec1-2026-r2-n1',
      'tec-sec1-2026-r2-n2',
      'tec-sec1-2026-r2-n3',
      'tec-sec1-2026-r2-n4',
      'tec-sec1-2026-r2-verticalita'
    )
      and (
        (c.academic_year is not null and c.academic_year <> '2026/2027')
        or (c.group_code is not null and c.group_code <> 'S-G02')
        or (c.discipline is not null and c.discipline <> 'tecnologia')
      )
  ) then
    raise exception 'LEGACY_TECHNOLOGY_CONTRIBUTION_SCOPE_MISMATCH' using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.team_review_outcomes o
    where o.proposal_ref in (
      'tec-sec1-2026-r2-n1',
      'tec-sec1-2026-r2-n2',
      'tec-sec1-2026-r2-n3',
      'tec-sec1-2026-r2-n4',
      'tec-sec1-2026-r2-verticalita'
    )
      and (
        (o.academic_year is not null and o.academic_year <> '2026/2027')
        or (o.group_code is not null and o.group_code <> 'S-G02')
        or (o.discipline is not null and o.discipline <> 'tecnologia')
      )
  ) then
    raise exception 'LEGACY_TECHNOLOGY_OUTCOME_SCOPE_MISMATCH' using errcode = '23514';
  end if;
end;
$$;

-- 2. Riallineamento deterministico delle contribuzioni Tecnologia R2.
update public.team_review_contributions
set academic_year = '2026/2027',
    group_code = 'S-G02',
    discipline = 'tecnologia',
    proposal_fingerprint = case proposal_ref
      when 'tec-sec1-2026-r2-n1' then '48a7c6bb5f4d6aa6a541489de54e2ee3bae08117eb35518714291f9f33210e0e'
      when 'tec-sec1-2026-r2-n2' then '1fa4ce024884329c32d78a16ffdc5f28573627683ad038b0cfb3bb793a22d8a9'
      when 'tec-sec1-2026-r2-n3' then '0a4fc3fd15bc6a05299d660a9cf6f13d9fb38154b47053c8de6ca556d0b84a16'
      when 'tec-sec1-2026-r2-n4' then '40edc8e1d3f7c0464db54545a5c12d74b7059e01a6c7489676398173d6ee204e'
      when 'tec-sec1-2026-r2-verticalita' then '9c626a358ff3f718db84c1fb4d76170b69272a4b086382b2106124e0bc43543c'
    end
where proposal_ref in (
  'tec-sec1-2026-r2-n1',
  'tec-sec1-2026-r2-n2',
  'tec-sec1-2026-r2-n3',
  'tec-sec1-2026-r2-n4',
  'tec-sec1-2026-r2-verticalita'
);

-- 3. Riallineamento delle cinque ricevute di esito già emesse dal ruolo
-- Dipartimento nel pilota. authority_state resta professionale/provvisorio:
-- questa migrazione non trasforma l'esito in approvazione istituzionale.
update public.team_review_outcomes
set academic_year = '2026/2027',
    group_code = 'S-G02',
    discipline = 'tecnologia',
    proposal_fingerprint = case proposal_ref
      when 'tec-sec1-2026-r2-n1' then '48a7c6bb5f4d6aa6a541489de54e2ee3bae08117eb35518714291f9f33210e0e'
      when 'tec-sec1-2026-r2-n2' then '1fa4ce024884329c32d78a16ffdc5f28573627683ad038b0cfb3bb793a22d8a9'
      when 'tec-sec1-2026-r2-n3' then '0a4fc3fd15bc6a05299d660a9cf6f13d9fb38154b47053c8de6ca556d0b84a16'
      when 'tec-sec1-2026-r2-n4' then '40edc8e1d3f7c0464db54545a5c12d74b7059e01a6c7489676398173d6ee204e'
      when 'tec-sec1-2026-r2-verticalita' then '9c626a358ff3f718db84c1fb4d76170b69272a4b086382b2106124e0bc43543c'
    end,
    recorded_by_operational_role = 'coordinatore',
    authority_state = 'OPERATIVO_PROVVISORIO'
where proposal_ref in (
  'tec-sec1-2026-r2-n1',
  'tec-sec1-2026-r2-n2',
  'tec-sec1-2026-r2-n3',
  'tec-sec1-2026-r2-n4',
  'tec-sec1-2026-r2-verticalita'
);

-- 4. I due contributi Italiani legacy vengono solamente collocati nello scope
-- corretto. La vecchia impronta viene deliberatamente conservata: nel nuovo
-- modello appariranno come contributi da aggiornare, non come consenso corrente.
do $$
begin
  if exists (
    select 1
    from public.team_review_contributions c
    where c.proposal_ref in ('it-sec-1','it-sec-2')
      and (
        (c.academic_year is not null and c.academic_year <> '2026/2027')
        or (c.group_code is not null and c.group_code <> 'S-G01')
        or (c.discipline is not null and c.discipline <> 'italiano')
      )
  ) then
    raise exception 'LEGACY_ITALIAN_CONTRIBUTION_SCOPE_MISMATCH' using errcode = '23514';
  end if;
end;
$$;

update public.team_review_contributions
set academic_year = '2026/2027',
    group_code = 'S-G01',
    discipline = 'italiano'
where proposal_ref in ('it-sec-1','it-sec-2');

-- 5. Postcondizioni sulle sole ricevute mappate. Nessuna membership operativa
-- viene creata qui: ogni docente dovrà dichiarare/sincronizzare la competenza
-- dal proprio profilo personale; i ruoli Dipartimento/Referente restano quelli
-- della membership condivisa verificata.
do $$
begin
  if exists (
    select 1
    from public.team_review_contributions c
    where c.proposal_ref in (
      'tec-sec1-2026-r2-n1','tec-sec1-2026-r2-n2','tec-sec1-2026-r2-n3',
      'tec-sec1-2026-r2-n4','tec-sec1-2026-r2-verticalita','it-sec-1','it-sec-2'
    )
      and (c.academic_year is null or c.group_code is null or c.discipline is null)
  ) then
    raise exception 'LEGACY_TEAM_REVIEW_CONTRIBUTION_SCOPE_BACKFILL_INCOMPLETE' using errcode = '23514';
  end if;

  if exists (
    select 1
    from public.team_review_outcomes o
    where o.proposal_ref in (
      'tec-sec1-2026-r2-n1','tec-sec1-2026-r2-n2','tec-sec1-2026-r2-n3',
      'tec-sec1-2026-r2-n4','tec-sec1-2026-r2-verticalita'
    )
      and (
        o.academic_year is null
        or o.group_code is null
        or o.discipline is null
        or o.recorded_by_operational_role is null
        or o.authority_state is null
      )
  ) then
    raise exception 'LEGACY_TEAM_REVIEW_OUTCOME_SCOPE_BACKFILL_INCOMPLETE' using errcode = '23514';
  end if;
end;
$$;

comment on column public.team_review_outcomes.authority_state is
'Autorità professionale associata alla ricevuta. Il backfill del pilota usa OPERATIVO_PROVVISORIO e non costituisce approvazione istituzionale.';
