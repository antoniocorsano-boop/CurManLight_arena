import { describe, expect, it } from 'vitest';

import type { EntityId } from '../domain/curriculum/identity';
import {
  INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION,
  MAX_LOCAL_LOGO_BYTES,
  addAcademicYear,
  addInstitute,
  addInstituteSite,
  applyInstitutionalImport,
  archiveAcademicYear,
  archiveInstitute,
  archiveInstituteSite,
  calculateInstitutionCompleteness,
  canTransitionInstituteStatus,
  confirmInstitute,
  createAcademicYear,
  createEmptyInstitutionalArchive,
  createInstituteDraft,
  createInstituteSite,
  createInstitutionalContext,
  deserializeInstitutionalArchive,
  getActiveAcademicYear,
  getActiveInstitute,
  getA04InstitutionalRead,
  getA07InstitutionalDocumentRead,
  projectA07InstitutionalDocumentHeader,
  getConfiguredSchoolOrders,
  getCurrentInstitutionalContext,
  getDeclaredRoleWording,
  getInstitutionalDocumentProfile,
  getInstitutionalWarnings,
  getMainInstituteSite,
  getNeutralInstituteName,
  importLegacyInstitutions,
  instituteReference,
  previewInstitutionalImport,
  readAcademicYear,
  readInstitute,
  readInstituteSite,
  rollbackInstitutionalImport,
  serializeInstitutionalArchive,
  setActiveAcademicYear,
  setActiveInstitute,
  setInstitutionalContext,
  updateInstitute,
  updateAcademicYear,
  updateInstituteSite,
  validateAcademicYear,
  validateArchiveIntegrity,
  validateInstitute,
  validateInstituteSite,
  validateInstitutionalContext,
} from '../domain/institution';

const NOW = '2026-07-27T10:00:00Z';

function activeArchiveWithOrders(schoolOrders: Array<'infanzia' | 'primaria' | 'secondaria'>) {
  const institute = createInstituteDraft({ name: 'Istituto A04', schoolOrders }, NOW);
  let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute, NOW).archive!;
  archive = confirmInstitute(archive, institute.id, NOW).archive!;
  return setActiveInstitute(archive, institute.id, NOW).archive!;
}

describe('CML-633D institutional contracts and constructors', () => {
  it('creates an empty archive without inferred institute or academic year', () => {
    const archive = createEmptyInstitutionalArchive(NOW);

    expect(archive.schemaVersion).toBe(INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION);
    expect(archive.institutes).toEqual([]);
    expect(archive.academicYears).toEqual([]);
    expect(archive.activeInstituteRef).toBeUndefined();
    expect(getActiveAcademicYear(archive)).toBeUndefined();
  });

  it('creates a minimal draft from name and existing SchoolOrder values', () => {
    const institute = createInstituteDraft({ name: 'Istituto Locale', schoolOrders: ['primaria'] }, NOW);

    expect(institute.name).toBe('Istituto Locale');
    expect(institute.schoolOrders).toEqual(['primaria']);
    expect(institute.status).toBe('draft');
    expect(institute.mechanicalCode).toBeUndefined();
  });

  it('supports optional site address fields without requiring a site', () => {
    const institute = createInstituteDraft({ name: 'Istituto Locale', schoolOrders: ['secondaria'] }, NOW);
    const site = createInstituteSite({
      instituteRef: { id: institute.id, entityType: 'institute' },
      name: 'Sede centrale',
      isMain: true,
      address: { street: 'Via Locale 1', city: 'Roma', postalCode: '00100' },
    }, NOW);

    expect(validateInstitute(institute).valid).toBe(true);
    expect(validateInstituteSite(site).valid).toBe(true);
    expect(site.address?.city).toBe('Roma');
  });

  it('constructs context from references and keeps declared actors self-declared', () => {
    const institute = createInstituteDraft({ name: 'Istituto Locale', schoolOrders: ['primaria'] }, NOW);
    const context = createInstitutionalContext({
      instituteRef: { id: institute.id, entityType: 'institute' },
      declaredActor: { displayName: 'Ada Rossi', role: 'docente', assertion: 'self-declared' },
    }, NOW);

    expect(context.declaredActor?.assertion).toBe('self-declared');
  });
});

describe('institutional validation and completeness', () => {
  it('checks IDs, optional mechanical-code structure, duplicate orders and logos', () => {
    const valid = createInstituteDraft({
      name: 'Istituto Locale',
      schoolOrders: ['primaria'],
      mechanicalCode: 'RMIC123456',
      documentProfile: {
        heading: 'Istituto Locale',
        logo: { assetId: 'asset-opaque-1', fileName: 'logo.webp', mediaType: 'image/webp', byteSize: MAX_LOCAL_LOGO_BYTES },
      },
    }, NOW);
    expect(validateInstitute(valid).valid).toBe(true);

    expect(validateInstitute({ ...valid, id: 'bad' as EntityId }).valid).toBe(false);
    expect(validateInstitute({ ...valid, mechanicalCode: 'bad code!' }).valid).toBe(false);
    expect(validateInstitute({ ...valid, schoolOrders: ['primaria', 'primaria'] }).valid).toBe(false);
    expect(validateInstitute({
      ...valid,
      documentProfile: { logo: { assetId: 'asset-opaque-1', fileName: 'logo.svg', mediaType: 'image/svg+xml' as 'image/png', byteSize: 10 } },
    }).valid).toBe(false);
    expect(validateInstitute({
      ...valid,
      documentProfile: { logo: { assetId: 'asset-opaque-1', fileName: 'logo.png', mediaType: 'image/png', byteSize: MAX_LOCAL_LOGO_BYTES + 1 } },
    }).valid).toBe(false);
  });

  it('checks academic date order and label/date coherence', () => {
    const institute = createInstituteDraft({ name: 'Istituto Locale', schoolOrders: ['primaria'] }, NOW);
    const instituteRef = { id: institute.id, entityType: 'institute' as const };
    const coherent = createAcademicYear({
      instituteRef,
      label: '2026/2027',
      startsOn: '2026-09-01',
      endsOn: '2027-08-31',
      status: 'planned',
    }, NOW);

    expect(validateAcademicYear(coherent).valid).toBe(true);
    expect(validateAcademicYear({ ...coherent, endsOn: '2026-01-01' }).valid).toBe(false);
    expect(validateAcademicYear({ ...coherent, label: '2025/2026' }).valid).toBe(false);
  });

  it('allows only cautious explicit status transitions', () => {
    expect(canTransitionInstituteStatus('unconfigured', 'draft')).toBe(true);
    expect(canTransitionInstituteStatus('draft', 'confirmed-local')).toBe(true);
    expect(canTransitionInstituteStatus('confirmed-local', 'incomplete')).toBe(true);
    expect(canTransitionInstituteStatus('legacy-imported', 'draft')).toBe(true);
    expect(canTransitionInstituteStatus('draft', 'archived')).toBe(true);
    expect(canTransitionInstituteStatus('draft', 'confirmed-local')).toBe(true);
    expect(canTransitionInstituteStatus('legacy-imported', 'confirmed-local')).toBe(false);
    expect(canTransitionInstituteStatus('confirmed-local', 'draft')).toBe(true);
    expect(canTransitionInstituteStatus('incomplete', 'confirmed-local')).toBe(false);
    expect(canTransitionInstituteStatus('archived', 'confirmed-local')).toBe(false);
  });

  it('distinguishes completeness without treating complete-local as authentication', () => {
    const draft = createInstituteDraft({ name: 'Istituto Locale', schoolOrders: ['primaria'] }, NOW);
    expect(calculateInstitutionCompleteness(undefined)).toBe('unconfigured');
    expect(calculateInstitutionCompleteness(draft)).toBe('minimal');
    expect(calculateInstitutionCompleteness({ ...draft, mechanicalCode: 'RMIC123456' })).toBe('partial');
    expect(calculateInstitutionCompleteness({
      ...draft,
      status: 'confirmed-local',
      mechanicalCode: 'RMIC123456',
      documentProfile: { heading: 'Istituto Locale' },
    })).toBe('complete-local');
    expect(calculateInstitutionCompleteness({ ...draft, status: 'legacy-imported' })).toBe('legacy');
    expect(calculateInstitutionCompleteness({ ...draft, name: '' })).toBe('invalid');
    expect(calculateInstitutionCompleteness({ ...draft, status: 'confirmed-local' })).not.toBe('verified');
  });
});

describe('immutable institutional repository', () => {
  it('creates, reads, updates, confirms and archives without mutating prior snapshots', () => {
    const empty = createEmptyInstitutionalArchive(NOW);
    const institute = createInstituteDraft({ name: 'Istituto Locale', schoolOrders: ['primaria'] }, NOW);
    const created = addInstitute(empty, institute);
    const updated = updateInstitute(created.archive!, institute.id, { name: 'Istituto Aggiornato' }, NOW);
    const confirmed = confirmInstitute(updated.archive!, institute.id, NOW);
    const archived = archiveInstitute(confirmed.archive!, institute.id, NOW);

    expect(created.success).toBe(true);
    expect(empty.institutes).toHaveLength(0);
    expect(readInstitute(updated.archive!, institute.id)?.name).toBe('Istituto Aggiornato');
    expect(readInstitute(confirmed.archive!, institute.id)?.status).toBe('confirmed-local');
    expect(readInstitute(archived.archive!, institute.id)?.status).toBe('archived');
    expect(archived.archive?.institutes).toHaveLength(1);
  });

  it('enforces one active institute and one active non-overlapping year per institute', () => {
    const first = createInstituteDraft({ name: 'Primo', schoolOrders: ['primaria'] }, NOW);
    const second = createInstituteDraft({ name: 'Secondo', schoolOrders: ['secondaria'] }, NOW);
    let archive = addInstitute(addInstitute(createEmptyInstitutionalArchive(NOW), first).archive!, second).archive!;
    archive = confirmInstitute(archive, first.id, NOW).archive!;
    archive = confirmInstitute(archive, second.id, NOW).archive!;
    archive = setActiveInstitute(archive, first.id).archive!;
    expect(getActiveInstitute(archive)?.id).toBe(first.id);
    archive = setActiveInstitute(archive, second.id).archive!;
    expect(getActiveInstitute(archive)?.id).toBe(second.id);

    const year1 = createAcademicYear({ instituteRef: { id: second.id, entityType: 'institute' }, label: '2025/2026', startsOn: '2025-09-01', endsOn: '2026-08-31', status: 'planned' }, NOW);
    const year2 = createAcademicYear({ instituteRef: { id: second.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);
    archive = addAcademicYear(addAcademicYear(archive, year1).archive!, year2).archive!;
    archive = setActiveAcademicYear(archive, second.id, year1.id).archive!;
    archive = setActiveAcademicYear(archive, second.id, year2.id).archive!;

    expect(getActiveAcademicYear(archive)?.id).toBe(year2.id);
    expect(archive.academicYears.filter(year => year.status === 'active')).toHaveLength(1);
    expect(validateArchiveIntegrity(archive).valid).toBe(true);

    const overlap = createAcademicYear({ instituteRef: { id: second.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-01-01', endsOn: '2027-01-01', status: 'planned' }, NOW);
    expect(addAcademicYear(archive, overlap).success).toBe(false);
  });

  it('allows active authority only for confirmed-local institutes and clears all authority on demotion', () => {
    const draft = createInstituteDraft({ name: 'Autorità locale', schoolOrders: ['primaria'] }, NOW);
    let archive = addInstitute(createEmptyInstitutionalArchive(NOW), draft, NOW).archive!;
    expect(setActiveInstitute(archive, draft.id, NOW).success).toBe(false);
    expect(validateArchiveIntegrity({ ...archive, activeInstituteRef: { id: draft.id, entityType: 'institute' } }).valid).toBe(false);
    for (const status of ['incomplete', 'legacy-imported', 'archived'] as const) {
      expect(setActiveInstitute({ ...archive, institutes: [{ ...draft, status }] }, draft.id, NOW).success).toBe(false);
    }

    archive = confirmInstitute(archive, draft.id, NOW).archive!;
    archive = setActiveInstitute(archive, draft.id, NOW).archive!;
    const year = createAcademicYear({ instituteRef: { id: draft.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);
    archive = addAcademicYear(archive, year, NOW).archive!;
    archive = setActiveAcademicYear(archive, draft.id, year.id, NOW).archive!;
    const context = createInstitutionalContext({ instituteRef: { id: draft.id, entityType: 'institute' }, academicYearRef: { id: year.id, entityType: 'academic-year' } }, NOW);
    archive = setInstitutionalContext(archive, context, NOW).archive!;

    const demoted = updateInstitute(archive, draft.id, { name: 'Autorità da riconfermare', status: 'draft' }, '2026-07-27T11:00:00Z');

    expect(demoted.success).toBe(true);
    expect(demoted.archive?.activeInstituteRef).toBeUndefined();
    expect(demoted.archive?.currentContextRef).toBeUndefined();
    expect(demoted.archive?.institutes[0].activeAcademicYearRef).toBeUndefined();
    expect(demoted.archive?.academicYears[0].status).toBe('closed');
    expect(validateArchiveIntegrity(demoted.archive).valid).toBe(true);
  });

  it('adds a planned year without demoting or activating a confirmed institute', () => {
    const draft = createInstituteDraft({ name: 'Istituto confermato', schoolOrders: ['primaria'] }, NOW);
    let archive = addInstitute(createEmptyInstitutionalArchive(NOW), draft, NOW).archive!;
    archive = confirmInstitute(archive, draft.id, NOW).archive!;
    const year = createAcademicYear({ instituteRef: { id: draft.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);

    const result = addAcademicYear(archive, year, NOW);

    expect(result.archive?.institutes[0].status).toBe('confirmed-local');
    expect(result.archive?.institutes[0].activeAcademicYearRef).toBeUndefined();
    expect(result.archive?.academicYears[0].status).toBe('planned');
  });

  it('rejects broken context references and duplicate main sites', () => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute).archive!;
    const main = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute' }, name: 'Centrale', isMain: true }, NOW);
    const otherMain = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute' }, name: 'Succursale', isMain: true }, NOW);
    archive = addInstituteSite(archive, main).archive!;
    expect(addInstituteSite(archive, otherMain).success).toBe(false);
    const duplicate = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute' }, name: 'Centrale', isMain: false }, NOW);
    expect(addInstituteSite(archive, duplicate).success).toBe(false);

    const context = createInstitutionalContext({ instituteRef: { id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' as EntityId, entityType: 'institute' } }, NOW);
    expect(setInstitutionalContext(archive, context).success).toBe(false);
  });
});

describe('institutional serialization and import', () => {
  it('round-trips identity, metadata, archived records, context and active references', () => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute).archive!;
    archive = confirmInstitute(archive, institute.id, NOW).archive!;
    archive = setActiveInstitute(archive, institute.id).archive!;
    archive = setInstitutionalContext(archive, createInstitutionalContext({ instituteRef: { id: institute.id, entityType: 'institute' } }, NOW)).archive!;

    const result = deserializeInstitutionalArchive(serializeInstitutionalArchive(archive, NOW));

    expect(result.success).toBe(true);
    expect(result.envelope?.archive).toEqual(archive);
    expect(result.envelope?.exportedAt).toBe(NOW);
  });

  it('rejects malformed and future schemas before producing applyable data', () => {
    expect(deserializeInstitutionalArchive('{bad').success).toBe(false);
    expect(deserializeInstitutionalArchive(JSON.stringify({
      schemaVersion: INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION + 1,
      exportedAt: NOW,
      archive: createEmptyInstitutionalArchive(NOW),
    })).success).toBe(false);
  });

  it('previews additions, updates and conflicts without mutation, then applies with rollback', () => {
    const existing = createInstituteDraft({ name: 'Esistente', schoolOrders: ['primaria'] }, NOW);
    const added = createInstituteDraft({ name: 'Nuovo', schoolOrders: ['secondaria'] }, NOW);
    const current = addInstitute(createEmptyInstitutionalArchive(NOW), existing).archive!;
    const incoming = addInstitute(
      addInstitute(createEmptyInstitutionalArchive(NOW), { ...existing, name: 'Aggiornato' }).archive!,
      added,
    ).archive!;
    const preview = previewInstitutionalImport(current, serializeInstitutionalArchive(incoming, NOW));

    expect(current.institutes[0].name).toBe('Esistente');
    expect(preview.success).toBe(true);
    expect(preview.additions).toContain(added.id);
    expect(preview.updates).toContain(existing.id);
    expect(preview.conflicts).toContain(existing.id);

    const applied = applyInstitutionalImport(current, preview, { resolvedConflictIds: preview.conflicts });
    expect(applied.success).toBe(true);
    expect(applied.previousArchive).toEqual(current);
    expect(applied.archive?.institutes).toHaveLength(2);
    expect(rollbackInstitutionalImport(applied)).toEqual(current);
  });
});

describe('legacy adapter and selectors', () => {
  it('emits separate inactive legacy candidates for discordant addresses', () => {
    const result = importLegacyInstitutions([
      { origin: 'A04', name: 'Istituto Storico', address: 'Via Uno', schoolOrders: ['primaria'] },
      { origin: 'A07', name: 'Istituto Storico', address: 'Via Due', schoolOrders: ['primaria'] },
      { origin: 'profilo', name: '', schoolOrders: [] },
    ], NOW);

    expect(result.archive.institutes).toHaveLength(3);
    expect(result.archive.institutes.every(item => item.status === 'legacy-imported')).toBe(true);
    expect(result.archive.activeInstituteRef).toBeUndefined();
    expect(result.warnings.some(warning => warning.includes('indirizz'))).toBe(true);
    expect(result.warnings.some(warning => warning.includes('mancant'))).toBe(true);
  });

  it('returns neutral selector values when no valid active configuration exists', () => {
    const archive = createEmptyInstitutionalArchive(NOW);

    expect(getNeutralInstituteName(archive)).toBe('Istituto non configurato');
    expect(getActiveInstitute(archive)).toBeUndefined();
    expect(getActiveAcademicYear(archive)).toBeUndefined();
    expect(getConfiguredSchoolOrders(archive)).toEqual([]);
    expect(getMainInstituteSite(archive)).toBeUndefined();
    expect(getInstitutionalDocumentProfile(archive)).toEqual({ instituteName: 'Istituto non configurato' });
    expect(getInstitutionalWarnings(archive).join(' ')).toContain('incompleta');
    expect(getCurrentInstitutionalContext(archive)).toBeUndefined();
  });

  it('selects configured order, site, profile, year, context and declared-role wording', () => {
    const institute = createInstituteDraft({
      name: 'Istituto Locale',
      schoolOrders: ['infanzia', 'primaria'],
      documentProfile: { heading: 'Intestazione locale' },
    }, NOW);
    let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute).archive!;
    const site = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute' }, name: 'Centrale', isMain: true }, NOW);
    const year = createAcademicYear({ instituteRef: { id: institute.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);
    archive = addInstituteSite(archive, site).archive!;
    archive = addAcademicYear(archive, year).archive!;
    archive = confirmInstitute(archive, institute.id, NOW).archive!;
    archive = setActiveInstitute(archive, institute.id).archive!;
    archive = setActiveAcademicYear(archive, institute.id, year.id).archive!;
    const context = createInstitutionalContext({
      instituteRef: { id: institute.id, entityType: 'institute' },
      academicYearRef: { id: year.id, entityType: 'academic-year' },
      siteRef: { id: site.id, entityType: 'institute-site' },
      declaredActor: { displayName: 'Ada Rossi', role: 'docente', assertion: 'self-declared' },
    }, NOW);
    archive = setInstitutionalContext(archive, context).archive!;

    expect(getConfiguredSchoolOrders(archive)).toEqual(['infanzia', 'primaria']);
    expect(getMainInstituteSite(archive)?.id).toBe(site.id);
    expect(getInstitutionalDocumentProfile(archive).heading).toBe('Intestazione locale');
    expect(getCurrentInstitutionalContext(archive)?.id).toBe(context.id);
    expect(getDeclaredRoleWording(archive)).toBe('Ruolo dichiarato per questa sessione: docente');
  });
});

describe('A07 institutional document read facade', () => {
  it('returns an exact neutral identity and incomplete warning without inferred metadata', () => {
    expect(getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW))).toEqual({
      configured: false,
      instituteName: 'Istituto non configurato',
      organizationId: 'curmanlight-local',
      warning: 'Configurazione istituzionale incompleta: l’esportazione userà un’intestazione neutra.',
    });
  });

  it('derives configured document identity only from the active canonical archive', () => {
    const institute = createInstituteDraft({
      name: 'Istituto Galileo',
      mechanicalCode: 'RMIC123456',
      schoolOrders: ['secondaria'],
      documentProfile: {
        heading: 'Intestazione locale',
        subheading: 'Sottotitolo configurato',
        footer: 'Piè di pagina locale',
        generalReferences: 'Riferimenti deliberati localmente',
      },
    }, NOW);
    let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute, NOW).archive!;
    const site = createInstituteSite({
      instituteRef: instituteReference(institute),
      name: 'Sede Centro',
      isMain: true,
      address: { street: 'Via Roma 1', city: 'Roma', province: 'RM', postalCode: '00100' },
    }, NOW);
    const year = createAcademicYear({
      instituteRef: instituteReference(institute),
      label: '2027/2028',
      startsOn: '2027-09-01',
      endsOn: '2028-08-31',
      status: 'planned',
    }, NOW);
    archive = addInstituteSite(archive, site, NOW).archive!;
    archive = addAcademicYear(archive, year, NOW).archive!;
    archive = confirmInstitute(archive, institute.id, NOW).archive!;
    archive = setActiveInstitute(archive, institute.id, NOW).archive!;
    archive = setActiveAcademicYear(archive, institute.id, year.id, NOW).archive!;

    expect(getA07InstitutionalDocumentRead(archive)).toEqual({
      configured: true,
      instituteName: 'Istituto Galileo',
      mechanicalCode: 'RMIC123456',
      heading: 'Intestazione locale',
      subheading: 'Sottotitolo configurato',
      footer: 'Piè di pagina locale',
      generalReferences: 'Riferimenti deliberati localmente',
      siteName: 'Sede Centro',
      siteAddress: 'Via Roma 1, 00100 Roma (RM)',
      academicYearLabel: '2027/2028',
      organizationId: `institute-${institute.id}`,
    });
  });

  it('projects every configured field once in a stable shared document header', () => {
    const projection = projectA07InstitutionalDocumentHeader({
      configured: true,
      instituteName: 'Istituto Galileo',
      heading: 'Intestazione locale',
      subheading: 'Sottotitolo configurato',
      mechanicalCode: 'RMIC123456',
      siteName: 'Sede Centro',
      siteAddress: 'Via Roma 1, 00100 Roma (RM)',
      generalReferences: 'Riferimenti locali',
      academicYearLabel: '2027/2028',
      footer: 'Contatti locali',
      declaredRole: 'docente',
      organizationId: 'institute-local',
    });

    expect(projection).toEqual({
      primaryHeading: 'Intestazione locale',
      displayName: 'Istituto Galileo',
      secondaryLines: [
        'Sottotitolo configurato',
        'Sede: Sede Centro - Via Roma 1, 00100 Roma (RM)',
        'Codice meccanografico: RMIC123456',
        'Riferimenti: Riferimenti locali',
        'Anno scolastico: 2027/2028',
      ],
      footer: 'Contatti locali',
      declaredRoleLine: 'Ruolo dichiarato: docente',
    });
  });

  it('projects no inferred metadata or role in neutral mode', () => {
    expect(projectA07InstitutionalDocumentHeader(getA07InstitutionalDocumentRead(createEmptyInstitutionalArchive(NOW)))).toEqual({
      displayName: 'Istituto non configurato',
      secondaryLines: [],
    });
  });

  it('keeps display name and secondary fields structurally stable when the optional heading is missing', () => {
    expect(projectA07InstitutionalDocumentHeader({
      configured: true,
      instituteName: 'Istituto Parziale',
      subheading: 'Sottotitolo presente',
      siteName: 'Sede Nord',
      organizationId: 'institute-partial',
    })).toEqual({
      displayName: 'Istituto Parziale',
      secondaryLines: ['Sottotitolo presente', 'Sede: Sede Nord'],
    });
  });
});

describe('A04 institutional read facade', () => {
  it.each([
    createEmptyInstitutionalArchive(NOW),
    { ...createEmptyInstitutionalArchive(NOW), schemaVersion: INSTITUTIONAL_ARCHIVE_SCHEMA_VERSION + 1 },
  ])('keeps the selected order usable in neutral mode for empty or invalid archives', archive => {
    expect(getA04InstitutionalRead(archive, 'primaria')).toMatchObject({
      configured: false,
      instituteName: 'Istituto non configurato',
      order: 'primaria',
      orderAvailable: true,
      configuredOrders: [],
    });
  });

  it('preserves a supported request across multiple configured orders', () => {
    const result = getA04InstitutionalRead(activeArchiveWithOrders(['infanzia', 'primaria', 'secondaria']), 'secondaria');

    expect(result).toMatchObject({
      configured: true,
      order: 'secondaria',
      orderAvailable: true,
      configuredOrders: ['infanzia', 'primaria', 'secondaria'],
    });
    expect(result.orderWarning).toBeUndefined();
  });

  it('gives a coherent configured context order precedence over selected order', () => {
    const result = getA04InstitutionalRead(
      activeArchiveWithOrders(['primaria', 'secondaria']),
      'primaria',
      'secondaria',
    );

    expect(result.order).toBe('secondaria');
    expect(result.orderAvailable).toBe(true);
    expect(result.orderWarning).toBeUndefined();
  });

  it('does not replace an unsupported request with the institute first order', () => {
    const result = getA04InstitutionalRead(activeArchiveWithOrders(['primaria', 'infanzia']), 'secondaria');

    expect(result.order).toBe('secondaria');
    expect(result.orderAvailable).toBe(false);
    expect(result.orderWarning).toMatch(/secondaria.*non.*configurat/i);
  });

  it('ignores an incoherent context candidate and retains a coherent selected order', () => {
    const result = getA04InstitutionalRead(
      activeArchiveWithOrders(['primaria']),
      'primaria',
      'secondaria',
    );

    expect(result.order).toBe('primaria');
    expect(result.orderAvailable).toBe(true);
    expect(result.orderWarning).toMatch(/contesto.*secondaria.*non.*configurat/i);
  });

  it('returns detached outputs without mutating its input archive', () => {
    const archive = activeArchiveWithOrders(['primaria', 'secondaria']);
    const before = structuredClone(archive);

    const result = getA04InstitutionalRead(archive, 'primaria');
    result.configuredOrders.push('infanzia');

    expect(archive).toEqual(before);
    expect(archive.institutes[0].schoolOrders).toEqual(['primaria', 'secondaria']);
  });
});

describe('CML-633D review corrections', () => {
  it('deeply isolates constructor inputs and repository snapshots', () => {
    const profile = {
      heading: 'Intestazione',
      logo: { assetId: 'asset-1', fileName: 'logo.png', mediaType: 'image/png' as const, byteSize: 10 },
    };
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'], documentProfile: profile }, NOW);
    const address = { city: 'Roma' };
    const site = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute' }, name: 'Centrale', isMain: true, address }, NOW);
    const empty = createEmptyInstitutionalArchive(NOW);
    const created = addInstitute(empty, institute);

    profile.heading = 'Mutata';
    profile.logo.fileName = 'mutato.png';
    address.city = 'Milano';
    institute.schoolOrders.push('secondaria');
    const read = readInstitute(created.archive!, institute.id)!;
    read.schoolOrders.push('infanzia');
    const updated = updateInstitute(created.archive!, institute.id, { name: 'Aggiornato' }, NOW);

    expect(site.address?.city).toBe('Roma');
    expect(empty.institutes).toEqual([]);
    expect(updated.archive?.institutes[0].name).toBe('Aggiornato');
    expect(created.archive?.institutes[0].name).toBe('Locale');
    expect(readInstitute(created.archive!, institute.id)?.schoolOrders).toEqual(['primaria']);
    expect(readInstitute(created.archive!, institute.id)?.documentProfile?.heading).toBe('Intestazione');
    expect(readInstitute(created.archive!, institute.id)?.documentProfile?.logo?.fileName).toBe('logo.png');
  });

  it.each([
    { assetId: '', fileName: 'logo.png', mediaType: 'image/png', byteSize: 10 },
    { assetId: 'data:image/png;base64,x', fileName: 'logo.png', mediaType: 'image/png', byteSize: 10 },
    { assetId: 'asset-1', fileName: '../logo.png', mediaType: 'image/png', byteSize: 10 },
    { assetId: 'asset-1', fileName: 'C:\\logo.png', mediaType: 'image/png', byteSize: 10 },
    { assetId: 'asset-1', fileName: 'https://example.test/logo.png', mediaType: 'image/png', byteSize: 10 },
    { assetId: 'asset-1', fileName: 'logo.jpg', mediaType: 'image/png', byteSize: 10 },
    { assetId: 'asset-1', fileName: 'logo.svg', mediaType: 'image/png', byteSize: 10 },
  ])('rejects unsafe or incoherent logo descriptor %#', logo => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'], documentProfile: { logo: logo as any } }, NOW);
    expect(validateInstitute(institute).valid).toBe(false);
  });

  it('requires confirmation, configured orders and heading for complete-local, with optional code and site', () => {
    const draft = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'], documentProfile: { heading: 'Locale' } }, NOW);
    expect(calculateInstitutionCompleteness(draft)).toBe('partial');
    expect(calculateInstitutionCompleteness({ ...draft, status: 'confirmed-local' })).toBe('complete-local');
    expect(calculateInstitutionCompleteness({ ...draft, status: 'confirmed-local', schoolOrders: [] })).not.toBe('complete-local');
  });

  it('uses total structural validators and rejects status and future entity schemas', () => {
    expect(() => validateInstitute(null as any)).not.toThrow();
    expect(() => validateAcademicYear({} as any)).not.toThrow();
    expect(() => validateInstituteSite('bad' as any)).not.toThrow();
    expect(validateInstitute(null as any).valid).toBe(false);

    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    expect(validateInstitute({ ...institute, schoolOrders: [] }).valid).toBe(false);
    expect(validateInstitute({ ...institute, status: 'official' as any }).valid).toBe(false);
    expect(validateInstitute({ ...institute, metadata: { ...institute.metadata, schemaVersion: 999 as any } }).valid).toBe(false);
    const site = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute' }, name: 'Centrale', isMain: true }, NOW);
    expect(validateInstituteSite({ ...site, status: 'active' as any }).valid).toBe(false);
    expect(validateInstituteSite({ ...site, instituteRef: { ...site.instituteRef, snapshotLabel: 42 as any } }).valid).toBe(false);
    const context = createInstitutionalContext({ instituteRef: { id: institute.id, entityType: 'institute' } }, NOW);
    expect(validateInstitutionalContext({ ...context, academicYearRef: { id: institute.id, entityType: 'event' } }).valid).toBe(false);
    expect(() => validateArchiveIntegrity({ schemaVersion: 1, updatedAt: NOW, institutes: [{}], academicYears: [], sites: [], contexts: [] })).not.toThrow();
    expect(validateArchiveIntegrity({ schemaVersion: 1, updatedAt: NOW, institutes: [{}], academicYears: [], sites: [], contexts: [] }).valid).toBe(false);
  });

  it('uses typed institutional year/site references and one bidirectional active-year authority', () => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute).archive!;
    const directActive = createAcademicYear({ instituteRef: { id: institute.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'active' }, NOW);
    expect(addAcademicYear(archive, directActive).success).toBe(false);

    const planned = { ...directActive, status: 'planned' as const };
    archive = addAcademicYear(archive, planned).archive!;
    archive = confirmInstitute(archive, institute.id, NOW).archive!;
    archive = setActiveAcademicYear(archive, institute.id, planned.id).archive!;
    expect(readInstitute(archive, institute.id)?.activeAcademicYearRef).toEqual({ id: planned.id, entityType: 'academic-year', snapshotLabel: planned.label });
    expect(readAcademicYear(archive, planned.id)?.status).toBe('active');
    expect(validateArchiveIntegrity(archive).valid).toBe(true);

    const missingRef = { ...archive, institutes: archive.institutes.map(item => ({ ...item, activeAcademicYearRef: undefined })) };
    expect(validateArchiveIntegrity(missingRef as any).valid).toBe(false);
  });

  it('supports immutable year and site lifecycle without deletion', () => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute).archive!;
    const year = createAcademicYear({ instituteRef: { id: institute.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);
    const site = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute' }, name: 'Centrale', isMain: true, address: { city: 'Roma' } }, NOW);
    archive = addAcademicYear(archive, year).archive!;
    archive = addInstituteSite(archive, site).archive!;
    const before = JSON.parse(JSON.stringify(archive));

    const updatedYear = updateAcademicYear(archive, year.id, { label: '2026/2027' }, NOW);
    const updatedSite = updateInstituteSite(updatedYear.archive!, site.id, { address: { city: 'Milano' } }, NOW);
    const archivedYear = archiveAcademicYear(updatedSite.archive!, year.id, NOW);
    const archivedSite = archiveInstituteSite(archivedYear.archive!, site.id, NOW);

    expect(archive).toEqual(before);
    expect(readInstituteSite(updatedSite.archive!, site.id)?.address?.city).toBe('Milano');
    expect(readAcademicYear(archivedYear.archive!, year.id)?.status).toBe('archived');
    expect(readInstituteSite(archivedSite.archive!, site.id)?.status).toBe('archived');
    expect(archivedSite.archive?.academicYears).toHaveLength(1);
    expect(archivedSite.archive?.sites).toHaveLength(1);
  });

  it('rejects cross-owner context, orphan and unknown active-reference violations', () => {
    const first = createInstituteDraft({ name: 'Primo', schoolOrders: ['primaria'] }, NOW);
    const second = createInstituteDraft({ name: 'Secondo', schoolOrders: ['secondaria'] }, NOW);
    let archive = addInstitute(addInstitute(createEmptyInstitutionalArchive(NOW), first).archive!, second).archive!;
    const year = createAcademicYear({ instituteRef: { id: first.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);
    const site = createInstituteSite({ instituteRef: { id: first.id, entityType: 'institute' }, name: 'Centrale', isMain: true }, NOW);
    archive = addAcademicYear(archive, year).archive!;
    archive = addInstituteSite(archive, site).archive!;
    archive = confirmInstitute(archive, second.id, NOW).archive!;
    archive = setActiveInstitute(archive, second.id).archive!;
    const wrongContext = createInstitutionalContext({
      instituteRef: { id: second.id, entityType: 'institute' },
      academicYearRef: { id: year.id, entityType: 'academic-year' },
      siteRef: { id: site.id, entityType: 'institute-site' },
    }, NOW);
    expect(setInstitutionalContext(archive, wrongContext).success).toBe(false);

    expect(validateArchiveIntegrity({ ...archive, activeAcademicYearRefs: { unknown: { id: year.id, entityType: 'event' } } } as any).valid).toBe(false);
    const orphan = { ...archive, academicYears: [{ ...year, instituteRef: { id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' as EntityId, entityType: 'institute' as const } }] };
    expect(validateArchiveIntegrity(orphan).valid).toBe(false);
  });

  it('never confirms or activates legacy/archived candidates and failed operations preserve input', () => {
    const imported = importLegacyInstitutions([{ origin: 'legacy', name: 'Storico', schoolOrders: ['primaria'] }], NOW);
    const legacy = imported.archive.institutes[0];
    const snapshot = JSON.parse(JSON.stringify(imported.archive));
    expect(setActiveInstitute(imported.archive, legacy.id).success).toBe(false);
    expect(confirmInstitute(imported.archive, legacy.id, NOW).success).toBe(false);
    expect(imported.archive).toEqual(snapshot);

    const draft = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    const archived = archiveInstitute(addInstitute(createEmptyInstitutionalArchive(NOW), draft).archive!, draft.id, NOW).archive!;
    expect(setActiveInstitute(archived, draft.id).success).toBe(false);
  });

  it('round-trips archived configurations and isolates import/apply/rollback snapshots', () => {
    const currentInstitute = createInstituteDraft({ name: 'Corrente', schoolOrders: ['primaria'], documentProfile: { heading: 'Corrente' } }, NOW);
    const incomingInstitute = createInstituteDraft({ name: 'Importato', schoolOrders: ['secondaria'], documentProfile: { heading: 'Importato' } }, NOW);
    const current = addInstitute(createEmptyInstitutionalArchive(NOW), currentInstitute).archive!;
    let incoming = addInstitute(createEmptyInstitutionalArchive(NOW), incomingInstitute).archive!;
    incoming = archiveInstitute(incoming, incomingInstitute.id, NOW).archive!;
    const preview = previewInstitutionalImport(current, serializeInstitutionalArchive(incoming, NOW));
    const applied = applyInstitutionalImport(current, preview);
    current.institutes[0].name = 'Mutato dopo apply';
    preview.incomingArchive!.institutes[0].name = 'Mutato preview';

    expect(applied.success).toBe(true);
    expect(applied.previousArchive?.institutes[0].name).toBe('Corrente');
    expect(applied.archive?.institutes[0].name).toBe('Importato');
    expect(applied.archive?.institutes[0].status).toBe('archived');
    expect(rollbackInstitutionalImport(applied)?.institutes[0].name).toBe('Corrente');

    const malformedPreview = { ...preview, incomingArchive: { ...preview.incomingArchive!, institutes: [{ ...incomingInstitute, status: 'official' as any }] } };
    expect(applyInstitutionalImport(current, malformedPreview).success).toBe(false);
  });

  it('rejects duplicate imported IDs and future nested entity schemas', () => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    const duplicateArchive = {
      ...createEmptyInstitutionalArchive(NOW),
      institutes: [institute, { ...institute }],
    };
    expect(deserializeInstitutionalArchive(JSON.stringify({ schemaVersion: 1, exportedAt: NOW, archive: duplicateArchive })).success).toBe(false);

    const year = createAcademicYear({ instituteRef: { id: institute.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);
    const futureEntityArchive = {
      ...createEmptyInstitutionalArchive(NOW),
      institutes: [institute],
      academicYears: [{ ...year, metadata: { ...year.metadata, schemaVersion: 999 } }],
    };
    expect(deserializeInstitutionalArchive(JSON.stringify({ schemaVersion: 1, exportedAt: NOW, archive: futureEntityArchive })).success).toBe(false);
  });

  it('derives document institute name from Institute.name despite conflicting profile input', () => {
    const institute = createInstituteDraft({
      name: 'Nome canonico',
      schoolOrders: ['primaria'],
      documentProfile: { instituteName: 'Nome in conflitto', heading: 'Intestazione' } as any,
    }, NOW);
    let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute).archive!;
    archive = confirmInstitute(archive, institute.id, NOW).archive!;
    archive = setActiveInstitute(archive, institute.id).archive!;
    expect(getInstitutionalDocumentProfile(archive).instituteName).toBe('Nome canonico');
  });
});

describe('CML-633D second review corrections', () => {
  it('treats archived institutes, years and sites as terminal', () => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute).archive!;
    const year = createAcademicYear({ instituteRef: { id: institute.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);
    const site = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute' }, name: 'Centrale', isMain: true }, NOW);
    archive = addAcademicYear(archive, year).archive!;
    archive = addInstituteSite(archive, site).archive!;
    const archivedYear = archiveAcademicYear(archive, year.id, NOW).archive!;
    const archivedSite = archiveInstituteSite(archivedYear, site.id, NOW).archive!;
    const archivedInstitute = archiveInstitute(archivedSite, institute.id, NOW).archive!;

    expect(updateInstitute(archivedInstitute, institute.id, { name: 'Riaperto' }, NOW).success).toBe(false);
    expect(updateAcademicYear(archivedInstitute, year.id, { status: 'planned' }, NOW).success).toBe(false);
    expect(updateInstituteSite(archivedInstitute, site.id, { status: 'draft' }, NOW).success).toBe(false);
    expect(archiveInstitute(archivedInstitute, institute.id, NOW).success).toBe(false);
    expect(archiveAcademicYear(archivedInstitute, year.id, NOW).success).toBe(false);
    expect(archiveInstituteSite(archivedInstitute, site.id, NOW).success).toBe(false);
  });

  it('rejects archived context targets and clears references when targets are archived', () => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    let archive = addInstitute(createEmptyInstitutionalArchive(NOW), institute).archive!;
    archive = confirmInstitute(archive, institute.id, NOW).archive!;
    archive = setActiveInstitute(archive, institute.id).archive!;
    const year = createAcademicYear({ instituteRef: { id: institute.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);
    const site = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute' }, name: 'Centrale', isMain: true }, NOW);
    archive = addAcademicYear(archive, year).archive!;
    archive = addInstituteSite(archive, site).archive!;
    const context = createInstitutionalContext({
      instituteRef: { id: institute.id, entityType: 'institute' },
      academicYearRef: { id: year.id, entityType: 'academic-year' },
      siteRef: { id: site.id, entityType: 'institute-site' },
    }, NOW);
    archive = setInstitutionalContext(archive, context).archive!;
    archive = archiveAcademicYear(archive, year.id, NOW).archive!;
    expect(getCurrentInstitutionalContext(archive)?.academicYearRef).toBeUndefined();
    archive = archiveInstituteSite(archive, site.id, NOW).archive!;
    expect(getCurrentInstitutionalContext(archive)?.siteRef).toBeUndefined();

    const stale = {
      ...archive,
      contexts: [{ ...context }],
      currentContextRef: { id: context.id, entityType: 'institutional-context' as const },
    };
    expect(validateArchiveIntegrity(stale).valid).toBe(false);
    expect(setInstitutionalContext(archive, context).success).toBe(false);
  });

  it('binds import apply to deterministic base and incoming fingerprints', () => {
    const existing = createInstituteDraft({ name: 'Esistente', schoolOrders: ['primaria'] }, NOW);
    const current = addInstitute(createEmptyInstitutionalArchive(NOW), existing).archive!;
    const incoming = addInstitute(createEmptyInstitutionalArchive(NOW), { ...existing, name: 'Aggiornato' }).archive!;
    const preview = previewInstitutionalImport(current, serializeInstitutionalArchive(incoming, NOW));

    expect(preview.baseFingerprint).toMatch(/^[a-f0-9]+$/);
    expect(preview.incomingFingerprint).toMatch(/^[a-f0-9]+$/);
    expect(applyInstitutionalImport(current, preview).success).toBe(false);
    expect(applyInstitutionalImport(current, preview, { resolvedConflictIds: preview.conflicts }).success).toBe(true);

    const staleBase = updateInstitute(current, existing.id, { name: 'Modificato nel frattempo' }, NOW).archive!;
    expect(applyInstitutionalImport(staleBase, preview, { resolvedConflictIds: preview.conflicts }).success).toBe(false);

    const tampered = { ...preview, incomingArchive: { ...preview.incomingArchive!, institutes: [{ ...preview.incomingArchive!.institutes[0], name: 'Manomesso' }] } };
    expect(applyInstitutionalImport(current, tampered, { resolvedConflictIds: preview.conflicts }).success).toBe(false);
    expect(applyInstitutionalImport(current, { ...preview, conflicts: [] }, { resolvedConflictIds: [] }).success).toBe(false);
  });

  it('uses strict typed institute references, safe transitions, calendar dates and declared roles', () => {
    expect(canTransitionInstituteStatus('unknown' as any, 'draft')).toBe(false);
    expect(canTransitionInstituteStatus('draft', 'unknown' as any)).toBe(false);

    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    const invalidDate = createAcademicYear({ instituteRef: { id: institute.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-02-30', endsOn: '2027-02-28', status: 'planned' }, NOW);
    expect(validateAcademicYear(invalidDate).valid).toBe(false);
    const site = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'event' } as any, name: 'Centrale', isMain: true }, NOW);
    expect(validateInstituteSite(site).valid).toBe(false);

    const importedRole = createInstitutionalContext({
      instituteRef: { id: institute.id, entityType: 'institute' },
      declaredActor: { displayName: 'Ada', role: 'docente', assertion: 'imported' } as any,
    }, NOW);
    const unknownRole = createInstitutionalContext({
      instituteRef: { id: institute.id, entityType: 'institute' },
      declaredActor: { displayName: 'Ada', role: 'preside' as any, assertion: 'self-declared' },
    }, NOW);
    expect(validateInstitutionalContext(importedRole).valid).toBe(false);
    expect(validateInstitutionalContext(unknownRole).valid).toBe(false);
  });

  it('promotes reviewed legacy to a local imported draft while preserving migration provenance', () => {
    const imported = importLegacyInstitutions([{ origin: 'A04', name: 'Storico', schoolOrders: ['primaria'] }], NOW);
    const legacy = imported.archive.institutes[0];
    const migration = legacy.metadata.migration;
    const reviewed = updateInstitute(imported.archive, legacy.id, {
      status: 'draft',
      documentProfile: { heading: 'Storico' },
    }, NOW);

    expect(reviewed.success).toBe(true);
    expect(readInstitute(reviewed.archive!, legacy.id)?.metadata.origin).toBe('imported');
    expect(readInstitute(reviewed.archive!, legacy.id)?.metadata.migration).toEqual(migration);
    const confirmed = confirmInstitute(reviewed.archive!, legacy.id, NOW);
    expect(confirmed.success).toBe(true);
    expect(calculateInstitutionCompleteness(readInstitute(confirmed.archive!, legacy.id))).toBe('complete-local');
  });

  it('normalizes legacy fields into a valid inactive archive with warnings', () => {
    const imported = importLegacyInstitutions([{
      origin: 'legacy',
      name: 'Storico',
      schoolOrders: ['primaria', 'primaria', 'universita'] as any,
      mechanicalCode: ' bad code! ',
    }], NOW);
    const institute = imported.archive.institutes[0];

    expect(institute.schoolOrders).toEqual(['primaria']);
    expect(institute.mechanicalCode).toBeUndefined();
    expect(imported.warnings.join(' ')).toMatch(/ordine|codice/i);
    expect(validateArchiveIntegrity(imported.archive).valid).toBe(true);
    expect(imported.archive.activeInstituteRef).toBeUndefined();
  });

  it('turns wholly malformed legacy records into warned valid candidates without throwing', () => {
    const malformed = [{ origin: 42, name: 99, schoolOrders: null, mechanicalCode: 5, address: { city: 7 } }] as any;
    expect(() => importLegacyInstitutions(malformed, NOW)).not.toThrow();
    const imported = importLegacyInstitutions(malformed, NOW);
    expect(validateArchiveIntegrity(imported.archive).valid).toBe(true);
    expect(imported.warnings.length).toBeGreaterThan(0);
    expect(imported.archive.activeInstituteRef).toBeUndefined();
  });

  it('rejects control characters in local logo identifiers and names', () => {
    const withControl = createInstituteDraft({
      name: 'Locale',
      schoolOrders: ['primaria'],
      documentProfile: { logo: { assetId: 'asset\u0000id', fileName: 'logo\u0007.png', mediaType: 'image/png', byteSize: 10 } },
    }, NOW);
    expect(validateInstitute(withControl).valid).toBe(false);
  });
});

describe('CML-633D validated selector boundary', () => {
  it('returns only neutral active-derived values for an invalid active archive', () => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    const invalidArchive = {
      ...createEmptyInstitutionalArchive(NOW),
      institutes: [{ ...institute, name: '' }],
      activeInstituteRef: { id: institute.id, entityType: 'institute' as const },
    };

    expect(getActiveInstitute(invalidArchive)).toBeUndefined();
    expect(getNeutralInstituteName(invalidArchive)).toBe('Istituto non configurato');
    expect(getActiveAcademicYear(invalidArchive)).toBeUndefined();
    expect(getConfiguredSchoolOrders(invalidArchive)).toEqual([]);
    expect(getMainInstituteSite(invalidArchive)).toBeUndefined();
    expect(getInstitutionalDocumentProfile(invalidArchive)).toEqual({ instituteName: 'Istituto non configurato' });
    expect(getCurrentInstitutionalContext(invalidArchive)).toBeUndefined();
    expect(getDeclaredRoleWording(invalidArchive)).toBeUndefined();
    expect(getInstitutionalWarnings(invalidArchive).join(' ')).toContain('incompleta');
  });

  it('does not throw or expose values from a malformed active archive', () => {
    const malformed = {
      schemaVersion: 1,
      updatedAt: NOW,
      institutes: null,
      academicYears: 'bad',
      sites: {},
      contexts: [],
      activeInstituteRef: { id: 'not-valid', entityType: 'institute' },
    } as any;

    expect(() => getActiveInstitute(malformed)).not.toThrow();
    expect(getNeutralInstituteName(malformed)).toBe('Istituto non configurato');
    expect(getConfiguredSchoolOrders(malformed)).toEqual([]);
    expect(getActiveAcademicYear(malformed)).toBeUndefined();
    expect(getMainInstituteSite(malformed)).toBeUndefined();
    expect(getCurrentInstitutionalContext(malformed)).toBeUndefined();
    expect(getInstitutionalWarnings(malformed).join(' ')).toContain('incompleta');
  });
});

describe('CML-633D repository metadata quality', () => {
  const T1 = '2026-07-27T11:00:00Z';
  const T2 = '2026-07-27T12:00:00Z';
  const T3 = '2026-07-27T13:00:00Z';
  const T4 = '2026-07-27T14:00:00Z';

  it('rejects year and site creation under an archived institute', () => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    const added = addInstitute(createEmptyInstitutionalArchive(NOW), institute, T1);
    expect(added.success).toBe(true);
    const archived = archiveInstitute(added.archive!, institute.id, T2);
    expect(archived.success).toBe(true);
    const snapshot = JSON.parse(JSON.stringify(archived.archive));
    const year = createAcademicYear({ instituteRef: { id: institute.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);
    const site = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute' }, name: 'Centrale', isMain: true }, NOW);

    expect(addAcademicYear(archived.archive!, year, T3).success).toBe(false);
    expect(addInstituteSite(archived.archive!, site, T3).success).toBe(false);
    expect(archived.archive).toEqual(snapshot);
  });

  it('touches institute and every year whose active status changes using injected now', () => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    let result = addInstitute(createEmptyInstitutionalArchive(NOW), institute, T1);
    expect(result.success).toBe(true);
    result = confirmInstitute(result.archive!, institute.id, T1);
    expect(result.success).toBe(true);
    const year1 = createAcademicYear({ instituteRef: { id: institute.id, entityType: 'institute' }, label: '2025/2026', startsOn: '2025-09-01', endsOn: '2026-08-31', status: 'planned' }, NOW);
    const year2 = createAcademicYear({ instituteRef: { id: institute.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);
    result = addAcademicYear(result.archive!, year1, T1);
    expect(result.success).toBe(true);
    result = addAcademicYear(result.archive!, year2, T1);
    expect(result.success).toBe(true);
    result = setActiveAcademicYear(result.archive!, institute.id, year1.id, T1);
    expect(result.success).toBe(true);
    result = setActiveAcademicYear(result.archive!, institute.id, year2.id, T2);
    expect(result.success).toBe(true);

    expect(result.archive?.updatedAt).toBe(T2);
    expect(readInstitute(result.archive!, institute.id)?.metadata.updatedAt).toBe(T2);
    expect(readAcademicYear(result.archive!, year1.id)?.status).toBe('closed');
    expect(readAcademicYear(result.archive!, year1.id)?.metadata.updatedAt).toBe(T2);
    expect(readAcademicYear(result.archive!, year2.id)?.status).toBe('active');
    expect(readAcademicYear(result.archive!, year2.id)?.metadata.updatedAt).toBe(T2);
  });

  it('touches archived entities, owners and contexts changed during reference cleanup', () => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    let result = addInstitute(createEmptyInstitutionalArchive(NOW), institute, T1);
    expect(result.success).toBe(true);
    result = confirmInstitute(result.archive!, institute.id, T1);
    expect(result.success).toBe(true);
    result = setActiveInstitute(result.archive!, institute.id, T1);
    expect(result.success).toBe(true);
    const year = createAcademicYear({ instituteRef: { id: institute.id, entityType: 'institute' }, label: '2026/2027', startsOn: '2026-09-01', endsOn: '2027-08-31', status: 'planned' }, NOW);
    const site = createInstituteSite({ instituteRef: { id: institute.id, entityType: 'institute' }, name: 'Centrale', isMain: true }, NOW);
    result = addAcademicYear(result.archive!, year, T1);
    expect(result.success).toBe(true);
    result = addInstituteSite(result.archive!, site, T1);
    expect(result.success).toBe(true);
    result = setActiveAcademicYear(result.archive!, institute.id, year.id, T1);
    expect(result.success).toBe(true);
    const context = createInstitutionalContext({
      instituteRef: { id: institute.id, entityType: 'institute' },
      academicYearRef: { id: year.id, entityType: 'academic-year' },
      siteRef: { id: site.id, entityType: 'institute-site' },
    }, NOW);
    result = setInstitutionalContext(result.archive!, context, T1);
    expect(result.success).toBe(true);

    result = archiveAcademicYear(result.archive!, year.id, T3);
    expect(result.success).toBe(true);
    expect(result.archive?.updatedAt).toBe(T3);
    expect(readAcademicYear(result.archive!, year.id)?.metadata.updatedAt).toBe(T3);
    expect(readInstitute(result.archive!, institute.id)?.metadata.updatedAt).toBe(T3);
    expect(getCurrentInstitutionalContext(result.archive!)?.metadata.updatedAt).toBe(T3);
    expect(getCurrentInstitutionalContext(result.archive!)?.academicYearRef).toBeUndefined();

    result = archiveInstituteSite(result.archive!, site.id, T4);
    expect(result.success).toBe(true);
    expect(result.archive?.updatedAt).toBe(T4);
    expect(readInstituteSite(result.archive!, site.id)?.metadata.updatedAt).toBe(T4);
    expect(getCurrentInstitutionalContext(result.archive!)?.metadata.updatedAt).toBe(T4);
    expect(getCurrentInstitutionalContext(result.archive!)?.siteRef).toBeUndefined();
  });

  it('touches institute updates, confirmation and archive with deterministic timestamps', () => {
    const institute = createInstituteDraft({ name: 'Locale', schoolOrders: ['primaria'] }, NOW);
    let result = addInstitute(createEmptyInstitutionalArchive(NOW), institute, NOW);
    expect(result.success).toBe(true);
    result = updateInstitute(result.archive!, institute.id, { name: 'Aggiornato' }, T1);
    expect(result.success).toBe(true);
    expect(readInstitute(result.archive!, institute.id)?.metadata.updatedAt).toBe(T1);
    result = confirmInstitute(result.archive!, institute.id, T2);
    expect(result.success).toBe(true);
    expect(readInstitute(result.archive!, institute.id)?.metadata.updatedAt).toBe(T2);
    result = archiveInstitute(result.archive!, institute.id, T3);
    expect(result.success).toBe(true);
    expect(result.archive?.updatedAt).toBe(T3);
    expect(readInstitute(result.archive!, institute.id)?.metadata.updatedAt).toBe(T3);
  });
});
