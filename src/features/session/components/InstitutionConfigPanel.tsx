import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  DECLARED_INSTITUTIONAL_ROLES,
  SCHOOL_ORDERS,
  addAcademicYear,
  addInstitute,
  addInstituteSite,
  archiveInstituteSite,
  archiveInstitute,
  confirmInstitute,
  createAcademicYear,
  createInstituteDraft,
  createInstituteSite,
  createInstitutionalContext,
  instituteReference,
  setActiveAcademicYear,
  setActiveInstitute,
  setInstitutionalContext,
  updateInstitute,
  updateInstituteSite,
  type ArchiveOperationResult,
} from '../../../domain/institution';
import type { InstitutionalRole } from '../../../domain/curriculum/types';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import type { SchoolOrder } from '../../../types/curriculum';
import { UiConfirmDialog } from '../../../ui/components/UiConfirmDialog';

const ORDER_LABELS: Record<SchoolOrder, string> = {
  infanzia: "Scuola dell'Infanzia",
  primaria: 'Scuola Primaria',
  secondaria: 'Scuola Secondaria di Primo Grado',
};

const ROLE_LABELS: Record<InstitutionalRole, string> = {
  'non-dichiarato': 'Nessun ruolo dichiarato',
  docente: 'Docente',
  dipartimento: 'Dipartimento',
  referente: 'Referente',
  collegio: 'Collegio',
  dirigente: 'Dirigente',
  amministratore: 'Amministratore',
};

type FieldErrors = Partial<Record<'name' | 'orders' | 'mechanicalCode' | 'year' | 'actorName' | 'actorRole' | 'operation', string>>;

const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
const buttonClass = 'rounded-lg border px-3 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

interface InstitutionConfigPanelProps {
  onExportBackup: () => void;
  onExportError: (message: string) => void;
}

export function InstitutionConfigPanel({ onExportBackup, onExportError }: InstitutionConfigPanelProps) {
  const archive = useCurriculumStore(state => state.institutionalArchive);
  const replaceInstitutionalArchive = useCurriculumStore(state => state.replaceInstitutionalArchive);
  const activeInstitute = archive.institutes.find(item => item.id === archive.activeInstituteRef?.id);
  const institute = activeInstitute ?? archive.institutes.find(item => !['archived', 'legacy-imported'].includes(item.status));
  const instituteYears = institute ? archive.academicYears.filter(item => item.instituteRef.id === institute.id && item.status !== 'archived') : [];
  const site = institute ? archive.sites.find(item => item.instituteRef.id === institute.id && item.isMain && item.status !== 'archived') : undefined;
  const context = institute ? archive.contexts.find(item => item.id === archive.currentContextRef?.id && item.instituteRef.id === institute.id) : undefined;

  const [name, setName] = useState('');
  const [mechanicalCode, setMechanicalCode] = useState('');
  const [orders, setOrders] = useState<SchoolOrder[]>([]);
  const [siteName, setSiteName] = useState('');
  const [yearLabel, setYearLabel] = useState('');
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [footer, setFooter] = useState('');
  const [generalReferences, setGeneralReferences] = useState('');
  const [actorName, setActorName] = useState('');
  const [actorRole, setActorRole] = useState<InstitutionalRole | ''>('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState('');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [institutionDirty, setInstitutionDirty] = useState(false);
  const year = instituteYears.find(item => item.id === selectedYearId)
    ?? instituteYears.find(item => item.id === institute?.activeAcademicYearRef?.id)
    ?? instituteYears[0];
  const nameRef = useRef<HTMLInputElement>(null);
  const mechanicalCodeRef = useRef<HTMLInputElement>(null);
  const firstOrderRef = useRef<HTMLInputElement>(null);
  const yearLabelRef = useRef<HTMLInputElement>(null);
  const actorNameRef = useRef<HTMLInputElement>(null);
  const actorRoleRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setName(institute?.name ?? '');
    setMechanicalCode(institute?.mechanicalCode ?? '');
    setOrders(institute?.schoolOrders ?? []);
    setSiteName(site?.name ?? '');
    setHeading(institute?.documentProfile?.heading ?? '');
    setSubheading(institute?.documentProfile?.subheading ?? '');
    setFooter(institute?.documentProfile?.footer ?? '');
    setGeneralReferences(institute?.documentProfile?.generalReferences ?? '');
    if (!archive.activeInstituteRef || !context) {
      setActorName('');
      setActorRole('');
    } else if (context.declaredActor) {
      setActorName(context.declaredActor.displayName);
      setActorRole(context.declaredActor.role);
    } else {
      setActorName('');
      setActorRole('');
    }
    setErrors({});
    setInstitutionDirty(false);
  }, [archive.updatedAt, archive.activeInstituteRef?.id, institute?.id, institute?.metadata.updatedAt, site?.id, site?.metadata.updatedAt, context?.id, context?.metadata.updatedAt]);

  useEffect(() => {
    if (!instituteYears.some(item => item.id === selectedYearId)) {
      setSelectedYearId(instituteYears.find(item => item.id === institute?.activeAcademicYearRef?.id)?.id ?? instituteYears[0]?.id ?? '');
    }
  }, [institute?.activeAcademicYearRef?.id, instituteYears.map(item => item.id).join('|'), selectedYearId]);

  const operationArchive = (result: ArchiveOperationResult) => {
    if (!result.success || !result.archive) {
      setErrors({ operation: result.errors.map(item => item.message).join('. ') || 'Operazione non riuscita' });
      return undefined;
    }
    return result.archive;
  };

  const validateDraft = () => {
    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = 'Il nome istituto è obbligatorio.';
    if (orders.length === 0) nextErrors.orders = 'Seleziona almeno un ordine scolastico.';
    if (mechanicalCode.trim() && !/^[A-Z0-9-]{6,20}$/i.test(mechanicalCode.trim())) nextErrors.mechanicalCode = 'Inserisci un codice di 6-20 lettere, numeri o trattini.';
    if (actorRole && !actorName.trim()) nextErrors.actorName = 'Inserisci il nome associato al ruolo dichiarato.';
    if (actorName.trim() && !actorRole) nextErrors.actorRole = 'Seleziona il ruolo associato al nome dichiarato.';
    setErrors(nextErrors);
    if (nextErrors.name) nameRef.current?.focus();
    else if (nextErrors.mechanicalCode) mechanicalCodeRef.current?.focus();
    else if (nextErrors.orders) firstOrderRef.current?.focus();
    else if (nextErrors.actorName) actorNameRef.current?.focus();
    else if (nextErrors.actorRole) actorRoleRef.current?.focus();
    return Object.keys(nextErrors).length === 0;
  };

  const saveDraft = (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (!validateDraft()) return;
    const now = new Date().toISOString();
    const documentProfile = {
      heading: heading.trim() || undefined,
      subheading: subheading.trim() || undefined,
      footer: footer.trim() || undefined,
      generalReferences: generalReferences.trim() || undefined,
    };
    let next = archive;
    let savedInstitute = institute;

    if (savedInstitute) {
      const result = operationArchive(updateInstitute(next, savedInstitute.id, {
        name: name.trim(),
        mechanicalCode: mechanicalCode.trim() || undefined,
        schoolOrders: orders,
        documentProfile,
        status: savedInstitute.status === 'confirmed-local' ? 'draft' : savedInstitute.status,
      }, now));
      if (!result) return;
      next = result;
      savedInstitute = next.institutes.find(item => item.id === savedInstitute?.id);
    } else {
      const draft = createInstituteDraft({ name, mechanicalCode, schoolOrders: orders, documentProfile }, now);
      const result = operationArchive(addInstitute(next, draft, now));
      if (!result) return;
      next = result;
      savedInstitute = draft;
    }

    if (!savedInstitute) {
      setErrors({ operation: 'Impossibile rileggere la bozza istituzionale salvata.' });
      return;
    }

    if (siteName.trim()) {
      const existingSite = next.sites.find(item => item.instituteRef.id === savedInstitute.id && item.isMain && item.status !== 'archived');
      const result = existingSite
        ? operationArchive(updateInstituteSite(next, existingSite.id, { name: siteName.trim() }, now))
        : operationArchive(addInstituteSite(next, createInstituteSite({ instituteRef: instituteReference(savedInstitute), name: siteName, isMain: true }, now), now));
      if (!result) return;
      next = result;
    } else {
      const existingSite = next.sites.find(item => item.instituteRef.id === savedInstitute.id && item.isMain && item.status !== 'archived');
      if (existingSite) {
        const result = operationArchive(archiveInstituteSite(next, existingSite.id, now));
        if (!result) return;
        next = result;
      }
    }

    replaceInstitutionalArchive(next);
    setErrors({});
    setInstitutionDirty(false);
    setMessage('Bozza istituzionale salvata localmente.');
  };

  const addYear = () => {
    if (!institute) {
      setErrors({ operation: 'Salva prima la bozza dell’istituto.' });
      nameRef.current?.focus();
      return;
    }
    if (!/^\d{4}\/\d{4}$/.test(yearLabel) || !startsOn || !endsOn || startsOn > endsOn || startsOn.slice(0, 4) !== yearLabel.slice(0, 4) || endsOn.slice(0, 4) !== yearLabel.slice(5)) {
      setErrors({ year: 'Completa un anno coerente nel formato 2026/2027, con date di inizio e fine.' });
      yearLabelRef.current?.focus();
      return;
    }
    const now = new Date().toISOString();
    const created = createAcademicYear({ instituteRef: instituteReference(institute), label: yearLabel, startsOn, endsOn, status: 'planned' }, now);
    const result = operationArchive(addAcademicYear(archive, created, now));
    if (!result) return;
    replaceInstitutionalArchive(result);
    if (!selectedYearId) setSelectedYearId(created.id);
    setYearLabel('');
    setStartsOn('');
    setEndsOn('');
    setErrors({});
    setMessage('Anno scolastico aggiunto alla configurazione.');
  };

  const confirmLocally = () => {
    if (!institute) return;
    const next = operationArchive(confirmInstitute(archive, institute.id));
    if (!next) return;
    replaceInstitutionalArchive(next);
    setMessage('Conferma locale: non verifica identità, ruolo o autorità dell’istituto.');
  };

  const activateContext = () => {
    if (actorRole && !actorName.trim()) {
      setErrors({ actorName: 'Inserisci il nome associato al ruolo dichiarato.' });
      actorNameRef.current?.focus();
      return;
    }
    if (actorName.trim() && !actorRole) {
      setErrors({ actorRole: 'Seleziona il ruolo associato al nome dichiarato.' });
      actorRoleRef.current?.focus();
      return;
    }
    if (!institute || !year || institute.status !== 'confirmed-local') {
      setErrors({ operation: 'Salva, conferma localmente e completa un anno prima di attivare il contesto.' });
      return;
    }
    const now = new Date().toISOString();
    let next = operationArchive(setActiveInstitute(archive, institute.id, now));
    if (!next) return;
    next = operationArchive(setActiveAcademicYear(next, institute.id, year.id, now));
    if (!next) return;
    const declaredActor = actorName.trim() && actorRole ? {
      displayName: actorName.trim(),
      role: actorRole,
      assertion: 'self-declared' as const,
    } : undefined;
    const currentSite = next.sites.find(item => item.instituteRef.id === institute.id && item.isMain && item.status !== 'archived');
    const nextContext = createInstitutionalContext({
      instituteRef: instituteReference(institute),
      academicYearRef: { id: year.id, entityType: 'academic-year', snapshotLabel: year.label },
      siteRef: currentSite ? { id: currentSite.id, entityType: 'institute-site', snapshotLabel: currentSite.name } : undefined,
      declaredActor,
    }, now);
    next = operationArchive(setInstitutionalContext(next, nextContext, now));
    if (!next) return;
    replaceInstitutionalArchive(next);
    setErrors({});
    setMessage('Anno scolastico e contesto istituzionale attivati.');
  };

  const exportBackup = () => {
    try {
      onExportBackup();
    } catch {
      const error = 'Impossibile esportare la copia di sicurezza completa.';
      setErrors({ operation: error });
      onExportError(error);
    }
  };

  const archiveConfiguration = () => {
    if (!institute) return;
    const next = operationArchive(archiveInstitute(archive, institute.id));
    if (!next) return;
    replaceInstitutionalArchive(next);
    setShowArchiveConfirm(false);
    setMessage('Configurazione archiviata e contesto attivo azzerato.');
  };

  const statusLabel = !institute
    ? 'Istituto non configurato'
    : institute.status === 'confirmed-local' && archive.activeInstituteRef?.id === institute.id
      ? 'Stato: configurato localmente'
      : institute.status === 'confirmed-local'
        ? 'Stato: confermato localmente, contesto non attivo'
        : 'Stato: bozza';

  return (
    <section aria-labelledby="institution-config-title" className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="space-y-1">
        <h2 id="institution-config-title" className="text-base font-black text-slate-900">Configurazione istituzionale</h2>
        <p className="font-bold text-indigo-800" role="status">{statusLabel}</p>
        <p className="text-xs text-slate-600">La modalità personale resta utilizzabile senza configurazione. Le esportazioni istituzionali richiedono la configurazione.</p>
        {institute && <p className="text-xs text-slate-600">Ordini configurati: {institute.schoolOrders.join(', ') || 'nessuno'}</p>}
      </div>

      <form onSubmit={saveDraft} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1 text-xs font-bold text-slate-700">
            <label htmlFor="institution-name" className="block">Nome istituto</label>
            <input ref={nameRef} id="institution-name" value={name} onChange={event => { setName(event.target.value); setInstitutionDirty(true); }} className={fieldClass} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'institution-name-error' : undefined} />
            {errors.name && <span id="institution-name-error" className="block text-rose-700">{errors.name}</span>}
          </div>
          <div className="space-y-1 text-xs font-bold text-slate-700">
            <label htmlFor="institution-mechanical-code" className="block">Codice meccanografico (facoltativo)</label>
            <input ref={mechanicalCodeRef} id="institution-mechanical-code" value={mechanicalCode} onChange={event => { setMechanicalCode(event.target.value); setInstitutionDirty(true); }} className={fieldClass} aria-invalid={Boolean(errors.mechanicalCode)} aria-describedby={errors.mechanicalCode ? 'mechanical-code-error' : undefined} />
            {errors.mechanicalCode && <span id="mechanical-code-error" className="block text-rose-700">{errors.mechanicalCode}</span>}
          </div>
        </div>

        <fieldset className="rounded-lg border border-slate-200 p-3" aria-invalid={Boolean(errors.orders)} aria-describedby={errors.orders ? 'school-orders-error' : undefined}>
          <legend className="px-1 text-xs font-bold text-slate-700">Ordini scolastici</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {SCHOOL_ORDERS.map(order => (
              <label key={order} className="flex items-start gap-2 rounded-md p-2 text-xs font-semibold focus-within:ring-2 focus-within:ring-indigo-600">
                <input ref={order === SCHOOL_ORDERS[0] ? firstOrderRef : undefined} type="checkbox" checked={orders.includes(order)} onChange={() => { setOrders(current => current.includes(order) ? current.filter(item => item !== order) : [...current, order]); setInstitutionDirty(true); }} />
                <span>{ORDER_LABELS[order]}</span>
              </label>
            ))}
          </div>
          {errors.orders && <p id="school-orders-error" className="text-xs text-rose-700">{errors.orders}</p>}
        </fieldset>

        <label className="block space-y-1 text-xs font-bold text-slate-700">
          <span>Sede principale (facoltativa)</span>
          <input value={siteName} onChange={event => { setSiteName(event.target.value); setInstitutionDirty(true); }} className={fieldClass} />
        </label>

        <fieldset className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-3" aria-describedby={errors.year ? 'academic-year-error' : undefined}>
          <legend className="px-1 text-xs font-bold text-slate-700">Nuovo anno scolastico</legend>
          <label className="space-y-1 text-xs font-bold text-slate-700"><span>Etichetta nuovo anno scolastico</span><input ref={yearLabelRef} value={yearLabel} onChange={event => setYearLabel(event.target.value)} placeholder="2026/2027" className={fieldClass} aria-invalid={Boolean(errors.year)} aria-describedby={errors.year ? 'academic-year-error' : undefined} /></label>
          <label className="space-y-1 text-xs font-bold text-slate-700"><span>Data inizio nuovo anno</span><input type="date" value={startsOn} onChange={event => setStartsOn(event.target.value)} className={fieldClass} aria-invalid={Boolean(errors.year)} aria-describedby={errors.year ? 'academic-year-error' : undefined} /></label>
          <label className="space-y-1 text-xs font-bold text-slate-700"><span>Data fine nuovo anno</span><input type="date" value={endsOn} onChange={event => setEndsOn(event.target.value)} className={fieldClass} aria-invalid={Boolean(errors.year)} aria-describedby={errors.year ? 'academic-year-error' : undefined} /></label>
          {errors.year && <p id="academic-year-error" className="text-xs text-rose-700 sm:col-span-3">{errors.year}</p>}
          <button type="button" onClick={addYear} disabled={institutionDirty} aria-describedby={institutionDirty ? 'institution-dirty-help' : undefined} className={`${buttonClass} border-slate-400 text-slate-800 hover:bg-slate-50 sm:col-span-3 sm:justify-self-start`}>Aggiungi anno scolastico</button>
        </fieldset>

        {instituteYears.length > 0 && (
          <div className="space-y-2 rounded-lg border border-slate-200 p-3">
            <label className="block space-y-1 text-xs font-bold text-slate-700"><span>Anno scolastico selezionato</span><select value={year?.id ?? ''} onChange={event => setSelectedYearId(event.target.value)} className={fieldClass}>{instituteYears.map(item => <option key={item.id} value={item.id}>{item.label} - {item.status === 'active' ? 'attivo' : item.status}</option>)}</select></label>
            <ul aria-label="Anni scolastici configurati" className="space-y-1 text-xs text-slate-600">{instituteYears.map(item => <li key={item.id}>{item.label}: {item.status === 'active' ? 'attivo' : item.status}</li>)}</ul>
          </div>
        )}

        <fieldset className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
          <legend className="px-1 text-xs font-bold text-slate-700">Profilo documentale (facoltativo)</legend>
          <label className="space-y-1 text-xs font-bold text-slate-700"><span>Intestazione documento (facoltativa)</span><input value={heading} onChange={event => { setHeading(event.target.value); setInstitutionDirty(true); }} className={fieldClass} /></label>
          <label className="space-y-1 text-xs font-bold text-slate-700"><span>Sottotitolo documento (facoltativo)</span><input value={subheading} onChange={event => { setSubheading(event.target.value); setInstitutionDirty(true); }} className={fieldClass} /></label>
          <label className="space-y-1 text-xs font-bold text-slate-700"><span>Piè di pagina documento (facoltativo)</span><input value={footer} onChange={event => { setFooter(event.target.value); setInstitutionDirty(true); }} className={fieldClass} /></label>
          <label className="space-y-1 text-xs font-bold text-slate-700"><span>Riferimenti generali (facoltativi)</span><textarea value={generalReferences} onChange={event => { setGeneralReferences(event.target.value); setInstitutionDirty(true); }} className={fieldClass} /></label>
        </fieldset>

        <fieldset className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
          <legend className="px-1 text-xs font-bold text-slate-700">Dichiarazione personale facoltativa</legend>
          <div className="space-y-1 text-xs font-bold text-slate-700"><label htmlFor="declared-actor-name" className="block">Nome dichiarato (facoltativo)</label><input ref={actorNameRef} id="declared-actor-name" value={actorName} onChange={event => setActorName(event.target.value)} className={fieldClass} aria-invalid={Boolean(errors.actorName)} aria-describedby={errors.actorName ? 'actor-name-error' : undefined} />{errors.actorName && <span id="actor-name-error" className="block text-rose-700">{errors.actorName}</span>}</div>
          <div className="space-y-1 text-xs font-bold text-slate-700"><label htmlFor="declared-actor-role" className="block">Ruolo dichiarato per questa sessione</label><select ref={actorRoleRef} id="declared-actor-role" value={actorRole} onChange={event => setActorRole(event.target.value as InstitutionalRole | '')} className={fieldClass} aria-invalid={Boolean(errors.actorRole)} aria-describedby={errors.actorRole ? 'actor-role-error' : undefined}><option value="">Nessun ruolo dichiarato</option>{DECLARED_INSTITUTIONAL_ROLES.map(role => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select>{errors.actorRole && <span id="actor-role-error" className="block text-rose-700">{errors.actorRole}</span>}</div>
        </fieldset>

        {errors.operation && <p role="alert" className="text-xs font-bold text-rose-700">{errors.operation}</p>}
        {institutionDirty && <p id="institution-dirty-help" className="text-xs font-bold text-amber-700">Salva la bozza prima di confermare o cambiare anno e contesto.</p>}
        {message && <p role="status" className="text-xs font-bold text-emerald-700">{message}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={`${buttonClass} border-indigo-700 bg-indigo-700 text-white hover:bg-indigo-600`}>Salva bozza</button>
          <button type="button" onClick={confirmLocally} disabled={!institute || institute.status !== 'draft' || institutionDirty} aria-describedby={institutionDirty ? 'institution-dirty-help' : undefined} className={`${buttonClass} border-emerald-700 text-emerald-800 hover:bg-emerald-50`}>Conferma localmente</button>
          <button type="button" onClick={activateContext} disabled={!institute || !year || institutionDirty} aria-describedby={institutionDirty ? 'institution-dirty-help' : undefined} className={`${buttonClass} border-slate-400 text-slate-800 hover:bg-slate-50`}>Attiva anno e contesto</button>
          <button type="button" onClick={exportBackup} className={`${buttonClass} border-slate-400 text-slate-800 hover:bg-slate-50`}>Esporta backup JSON</button>
          <button type="button" onClick={() => setShowArchiveConfirm(true)} disabled={!institute} className={`${buttonClass} border-rose-600 text-rose-700 hover:bg-rose-50`}>Archivia configurazione</button>
        </div>
      </form>

      <UiConfirmDialog
        open={showArchiveConfirm}
        title="Archiviare e azzerare la configurazione?"
        message="L’istituto sarà archiviato e il contesto attivo sarà rimosso. I dati personali restano utilizzabili."
        confirmLabel="Archivia e azzera"
        onConfirm={archiveConfiguration}
        onCancel={() => setShowArchiveConfirm(false)}
      />
    </section>
  );
}
