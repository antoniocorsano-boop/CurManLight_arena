import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, UserCog, X } from 'lucide-react';
import type { SchoolOrder, UserRole } from '../../../types/curriculum';
import type { CurriculumMap } from '../types/appViewContracts';
import {
  getOperationalGroupsForDisciplines,
  getOperationalGroupsForOrder,
  type OperationalGroupCode,
  type OperationalSchoolOrder,
} from '../../../domain/institution/operationalGroups';
import {
  readLocalOperationalProfile,
  saveLocalOperationalProfile,
} from '../../../infrastructure/supabase/operationalProfile';
import { useCurriculumStore } from '../../../store/useCurriculumStore';

interface OperationalOnboardingModalProps {
  showOnboardingModal: boolean;
  setShowOnboardingModal: (value: boolean) => void;
  onboardingRole: UserRole;
  setOnboardingRoleLocal: (value: UserRole) => void;
  onboardingStep: number;
  setOnboardingStep: React.Dispatch<React.SetStateAction<number>>;
  onboardingOrd: SchoolOrder;
  handleSetOnboardingOrdLocal: (order: SchoolOrder) => void;
  onboardingIsSostegno: boolean;
  setOnboardingIsSostegno: (value: boolean) => void;
  onboardingDisc: string;
  setOnboardingDiscLocal: (value: string) => void;
  localCurriculum: CurriculumMap;
  onboardingCombinations: string[];
  setOnboardingCombinations: (value: string[]) => void;
  handleToggleOnboardingCombination: (combo: string) => void;
  availableSections: string[];
  setAvailableSections: (value: string[]) => void;
  newSectionInput: string;
  setNewSectionInput: (value: string) => void;
  handleAddSectionLocal: () => void;
  safeLocalStorageSetItem: (key: string, value: string) => void;
  showToast: (msg: string, success?: boolean) => void;
  saveOnboardingProfile: () => void;
  getRoleLabel: (role: UserRole) => string;
  getDisciplineLabel: (discipline: string, order?: SchoolOrder) => string;
}

const isOperationalOrder = (order: SchoolOrder): order is OperationalSchoolOrder => order === 'primaria' || order === 'secondaria';

export function OperationalOnboardingModal({
  showOnboardingModal,
  setShowOnboardingModal,
  onboardingRole,
  setOnboardingRoleLocal,
  onboardingStep,
  setOnboardingStep,
  onboardingOrd,
  handleSetOnboardingOrdLocal,
  onboardingIsSostegno,
  setOnboardingIsSostegno,
  onboardingDisc,
  setOnboardingDiscLocal,
  localCurriculum,
  onboardingCombinations,
  handleToggleOnboardingCombination,
  availableSections,
  setAvailableSections,
  newSectionInput,
  setNewSectionInput,
  handleAddSectionLocal,
  safeLocalStorageSetItem,
  showToast,
  saveOnboardingProfile,
  getRoleLabel,
  getDisciplineLabel,
}: OperationalOnboardingModalProps) {
  const schoolYear = useCurriculumStore((state) => state.schoolYear);
  const allGrades = onboardingOrd === 'primaria' ? ['1', '2', '3', '4', '5'] : ['1', '2', '3'];
  const [selectedGrades, setSelectedGrades] = useState<string[]>(allGrades);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [coordinatorGroupCode, setCoordinatorGroupCode] = useState<OperationalGroupCode | null>(null);

  const operationalGroups = useMemo(() => getOperationalGroupsForOrder(onboardingOrd), [onboardingOrd]);
  const selectedGroups = useMemo(
    () => getOperationalGroupsForDisciplines(onboardingOrd, selectedDisciplines),
    [onboardingOrd, selectedDisciplines],
  );

  useEffect(() => {
    setSelectedGrades(allGrades);
    const stored = readLocalOperationalProfile();
    if (stored && stored.schoolOrder === onboardingOrd) {
      setSelectedDisciplines(stored.disciplines);
      setCoordinatorGroupCode(stored.coordinatorGroupCode);
      if (stored.disciplines.length > 0) setOnboardingDiscLocal(stored.disciplines[0]);
    } else {
      setSelectedDisciplines([]);
      setCoordinatorGroupCode(null);
    }
  }, [onboardingOrd]);

  const toggleGrade = (grade: string) => {
    setSelectedGrades((current) => current.includes(grade)
      ? current.filter((item) => item !== grade)
      : [...current, grade]);
  };

  const toggleDiscipline = (discipline: string) => {
    setSelectedDisciplines((current) => {
      const next = current.includes(discipline)
        ? current.filter((item) => item !== discipline)
        : [...current, discipline];
      const nextGroups = getOperationalGroupsForDisciplines(onboardingOrd, next);
      if (coordinatorGroupCode && !nextGroups.some((group) => group.code === coordinatorGroupCode)) {
        setCoordinatorGroupCode(null);
      }
      if (next.length > 0 && !next.includes(onboardingDisc)) setOnboardingDiscLocal(next[0]);
      return next;
    });
  };

  const changeOrder = (order: SchoolOrder) => {
    handleSetOnboardingOrdLocal(order);
    setSelectedDisciplines([]);
    setCoordinatorGroupCode(null);
  };

  const commitProfile = () => {
    if (isOperationalOrder(onboardingOrd) && !onboardingIsSostegno) {
      if (selectedDisciplines.length === 0) {
        showToast('Seleziona almeno una disciplina di competenza.', false);
        return;
      }
      const groups = getOperationalGroupsForDisciplines(onboardingOrd, selectedDisciplines);
      if (coordinatorGroupCode && !groups.some((group) => group.code === coordinatorGroupCode)) {
        showToast('Il gruppo coordinato deve derivare dalle discipline che hai selezionato.', false);
        return;
      }
      saveLocalOperationalProfile({
        academicYear: schoolYear,
        schoolOrder: onboardingOrd,
        disciplines: selectedDisciplines,
        coordinatorGroupCode,
      });
      if (!selectedDisciplines.includes(onboardingDisc)) setOnboardingDiscLocal(selectedDisciplines[0]);
    }
    saveOnboardingProfile();
  };

  const skipToNextVisibleStep = () => {
    if (onboardingRole === 'dirigente' || onboardingRole === 'collegio' || onboardingRole === 'amministratore') {
      commitProfile();
      return;
    }
    if (onboardingStep === 2 && (onboardingOrd === 'infanzia' || onboardingIsSostegno)) {
      setOnboardingStep(4);
      return;
    }
    if (onboardingStep === 3 && isOperationalOrder(onboardingOrd) && !onboardingIsSostegno && selectedDisciplines.length === 0) {
      showToast('Seleziona almeno una disciplina di competenza.', false);
      return;
    }
    if (onboardingStep === 4) commitProfile();
    else setOnboardingStep((current) => current + 1);
  };

  const goBack = () => {
    if (onboardingStep === 4 && (onboardingOrd === 'infanzia' || onboardingIsSostegno)) setOnboardingStep(2);
    else setOnboardingStep((current) => Math.max(1, current - 1));
  };

  if (!showOnboardingModal) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-primary-600 to-indigo-700 px-6 py-4 text-white">
          <span className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider"><UserCog className="h-5 w-5" /><span>Profilo e gruppi di lavoro</span></span>
          <button type="button" onClick={() => setShowOnboardingModal(false)} className="text-indigo-100 hover:text-white" aria-label="Chiudi"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex items-center space-x-1 border-b bg-slate-50 px-6 py-3">
          {[1, 2, 3, 4].filter((step) => {
            if (['dirigente', 'collegio', 'amministratore'].includes(onboardingRole)) return step === 1;
            if ((onboardingOrd === 'infanzia' || onboardingIsSostegno) && step === 3) return false;
            return true;
          }).map((step) => (
            <div key={step} className="flex flex-1 flex-col space-y-1">
              <div className={`h-1 rounded-full ${step <= onboardingStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              <span className={`hidden text-[8px] font-black uppercase sm:inline ${step === onboardingStep ? 'text-indigo-600' : 'text-slate-400'}`}>
                {step === 1 && '1. Ruolo'}{step === 2 && '2. Ordine'}{step === 3 && '3. Discipline e gruppo'}{step === 4 && '4. Classi'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs text-slate-700">
          <div className="text-center">
            <h4 className="text-base font-extrabold text-slate-900">
              {onboardingStep === 1 && 'Qual è il tuo ruolo di lavoro?'}
              {onboardingStep === 2 && 'In quale ordine di scuola lavori?'}
              {onboardingStep === 3 && 'Quali sono le tue discipline di competenza?'}
              {onboardingStep === 4 && 'Quali classi e sezioni ti servono?'}
            </h4>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
              {onboardingStep === 1 && 'Il ruolo locale orienta l’interfaccia. Il coordinamento del gruppo viene indicato separatamente e non costituisce nomina istituzionale.'}
              {onboardingStep === 2 && 'Primaria e Secondaria usano quattro gruppi operativi paralleli. La formalizzazione potrà essere aggiunta in seguito.'}
              {onboardingStep === 3 && 'Arena associa automaticamente le discipline ai gruppi. Puoi dichiarare più competenze senza duplicare la tua appartenenza allo stesso gruppo.'}
              {onboardingStep === 4 && 'Queste informazioni servono al tuo contesto personale e non modificano l’organizzazione dell’Istituto.'}
            </p>
          </div>

          {onboardingStep === 1 && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {(['non-dichiarato', 'insegnante', 'dipartimento', 'referente', 'dirigente', 'collegio', 'amministratore'] as UserRole[]).map((role) => (
                  <button key={role} type="button" onClick={() => setOnboardingRoleLocal(role)} className={`rounded-xl border p-2.5 text-left text-[11px] font-bold ${onboardingRole === role ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{getRoleLabel(role)}</button>
                ))}
              </div>
              {onboardingRole === 'insegnante' && (
                <div className="grid gap-2 border-t pt-3 sm:grid-cols-2">
                  <button type="button" onClick={() => setOnboardingIsSostegno(false)} className={`rounded-xl border p-2.5 text-[10px] font-bold ${!onboardingIsSostegno ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white'}`}>Posto comune / disciplinare</button>
                  <button type="button" onClick={() => setOnboardingIsSostegno(true)} className={`rounded-xl border p-2.5 text-[10px] font-bold ${onboardingIsSostegno ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white'}`}>Sostegno / inclusione</button>
                </div>
              )}
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {(['infanzia', 'primaria', 'secondaria'] as SchoolOrder[]).map((order) => (
                <button key={order} type="button" onClick={() => changeOrder(order)} className={`rounded-xl border p-3 text-xs font-bold ${onboardingOrd === order ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white'}`}>{order === 'infanzia' ? 'Infanzia' : order === 'primaria' ? 'Primaria' : 'Secondaria'}</button>
              ))}
            </div>
          )}

          {onboardingStep === 3 && isOperationalOrder(onboardingOrd) && (
            <div className="space-y-4" data-operational-onboarding>
              <div className="space-y-3">
                {operationalGroups.map((group) => {
                  const disciplines = group.disciplines.filter((discipline) => Object.prototype.hasOwnProperty.call(localCurriculum, discipline));
                  const groupSelected = disciplines.some((discipline) => selectedDisciplines.includes(discipline));
                  return (
                    <section key={group.code} className={`rounded-2xl border p-4 ${groupSelected ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 bg-white'}`}>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><strong className="text-sm text-slate-900">{group.code} · {group.label}</strong><p className="mt-1 text-[10px] text-slate-500">Seleziona solo le discipline sulle quali hai competenza professionale.</p></div>{groupSelected && <span className="rounded-full bg-indigo-100 px-2 py-1 text-[9px] font-bold text-indigo-800">Gruppo associato</span>}</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {disciplines.map((discipline) => (
                          <label key={discipline} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-[11px] font-semibold ${selectedDisciplines.includes(discipline) ? 'border-indigo-500 bg-white text-indigo-950' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                            <input type="checkbox" checked={selectedDisciplines.includes(discipline)} onChange={() => toggleDiscipline(discipline)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                            <span>{getDisciplineLabel(discipline, onboardingOrd)}</span>
                          </label>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

              {selectedDisciplines.length > 0 && (
                <div className="rounded-2xl border border-indigo-200 bg-white p-4">
                  <strong className="text-sm text-slate-900">Gruppi operativi derivati</strong>
                  <div className="mt-2 flex flex-wrap gap-2">{selectedGroups.map((group) => <span key={group.code} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-800">{group.code} · {group.label}</span>)}</div>

                  <label className="mt-4 block text-[10px] font-black uppercase tracking-wider text-slate-500">Disciplina iniziale nell’app
                    <select value={selectedDisciplines.includes(onboardingDisc) ? onboardingDisc : selectedDisciplines[0]} onChange={(event) => setOnboardingDiscLocal(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold normal-case text-slate-700">
                      {selectedDisciplines.map((discipline) => <option key={discipline} value={discipline}>{getDisciplineLabel(discipline, onboardingOrd)}</option>)}
                    </select>
                  </label>

                  <label className="mt-3 block text-[10px] font-black uppercase tracking-wider text-slate-500">Coordinamento operativo
                    <select value={coordinatorGroupCode ?? ''} onChange={(event) => setCoordinatorGroupCode((event.target.value || null) as OperationalGroupCode | null)} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold normal-case text-slate-700">
                      <option value="">Non coordino un gruppo</option>
                      {selectedGroups.map((group) => <option key={group.code} value={group.code}>Sono coordinatore operativo di {group.code} · {group.label}</option>)}
                    </select>
                  </label>
                  <p className="mt-2 text-[10px] leading-relaxed text-amber-800">Il coordinatore guida il lavoro e registra l’esito professionale del gruppo. Non acquisisce per questo competenza nelle altre discipline e non esercita autorità istituzionale.</p>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[10px] leading-relaxed text-slate-600"><strong>Assi trasversali:</strong> Educazione civica e AI Literacy non costituiscono un quinto gruppo. Ogni formulazione sarà instradata al gruppo responsabile in base al proprio nucleo interno.</div>
            </div>
          )}

          {onboardingStep === 4 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Sezioni del contesto personale</label>
                <div className="mt-2 flex gap-2"><input type="text" value={newSectionInput} onChange={(event) => setNewSectionInput(event.target.value.toUpperCase().trim())} maxLength={10} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold uppercase" placeholder="Es. A, B, C" /><button type="button" onClick={handleAddSectionLocal} className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white">Aggiungi</button></div>
                <div className="mt-3 flex flex-wrap gap-2">{availableSections.map((section) => <span key={section} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold">{section}</span>)}</div>
                {availableSections.length === 0 && <button type="button" onClick={() => { const defaults = onboardingOrd === 'infanzia' ? ['Rossa', 'Verde', 'Blu'] : ['A', 'B', 'C']; setAvailableSections(defaults); safeLocalStorageSetItem('curman_availableSections', defaults.join(',')); }} className="mt-3 text-[10px] font-bold text-indigo-700 underline">Usa esempi di sezione</button>}
              </div>

              {onboardingOrd !== 'infanzia' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Classi</label>
                  <div className="mt-2 flex flex-wrap gap-2">{allGrades.map((grade) => <label key={grade} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold"><input type="checkbox" checked={selectedGrades.includes(grade)} onChange={() => toggleGrade(grade)} />{grade}ª</label>)}</div>
                  {availableSections.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{selectedGrades.flatMap((grade) => availableSections.map((section) => { const combo = `${grade}^${section}`; const selected = onboardingCombinations.includes(combo); return <button key={combo} type="button" onClick={() => handleToggleOnboardingCombination(combo)} className={`rounded-xl border p-2 text-[10px] font-bold ${selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white'}`}>{grade}^{section}</button>; }))}</div>}
                </div>
              )}

              {onboardingOrd === 'infanzia' && (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-[10px] leading-relaxed text-slate-700">Per l’infanzia questa tranche non costituisce dipartimenti disciplinari: il lavoro resta collegato ai campi di esperienza e ai plessi secondo la successiva configurazione specifica.</div>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t bg-slate-50 px-6 py-3.5">
          <button type="button" onClick={goBack} disabled={onboardingStep === 1} className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Indietro</button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setShowOnboardingModal(false)} className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500">Chiudi</button>
            <button type="button" onClick={skipToNextVisibleStep} className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white">
              {onboardingStep === 4 || ['dirigente', 'collegio', 'amministratore'].includes(onboardingRole) ? <><Check className="h-4 w-4" />Salva profilo</> : <>Continua<ChevronRight className="h-4 w-4" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
