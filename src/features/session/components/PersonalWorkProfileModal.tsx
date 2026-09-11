import { Check, ChevronLeft, ChevronRight, ShieldCheck, UserCog, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { SchoolOrder, UserRole } from '../../../types/curriculum';
import type { CurriculumMap } from '../types/appViewContracts';

interface PersonalWorkProfileModalProps {
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
  saveOnboardingProfile: () => void;
  getDisciplineLabel: (discipline: string, order?: SchoolOrder) => string;
}

export function PersonalWorkProfileModal({
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
  setOnboardingCombinations,
  handleToggleOnboardingCombination,
  availableSections,
  setAvailableSections,
  newSectionInput,
  setNewSectionInput,
  handleAddSectionLocal,
  saveOnboardingProfile,
  getDisciplineLabel,
}: PersonalWorkProfileModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const allGrades = onboardingOrd === 'primaria' ? ['1', '2', '3', '4', '5'] : ['1', '2', '3'];
  const [selectedGrades, setSelectedGrades] = useState<string[]>(allGrades);

  useEffect(() => {
    setSelectedGrades(allGrades);
  }, [onboardingOrd]);

  useEffect(() => {
    if (!showOnboardingModal) {
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
      return;
    }
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
  }, [showOnboardingModal]);

  const closeWithoutSaving = () => setShowOnboardingModal(false);

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeWithoutSaving();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) ?? []
    ).filter((element) => !element.hasAttribute('disabled'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!showOnboardingModal) return null;

  const skipDisciplineStep = onboardingOrd === 'infanzia' || onboardingIsSostegno;
  const visibleSteps = [1, 2, 3, 4].filter((step) => !(skipDisciplineStep && step === 3));

  const goBack = () => {
    if (onboardingStep === 4 && skipDisciplineStep) {
      setOnboardingStep(2);
      return;
    }
    setOnboardingStep((current) => Math.max(1, current - 1));
  };

  const goNext = () => {
    if (onboardingStep === 2 && skipDisciplineStep) {
      setOnboardingStep(4);
      return;
    }
    setOnboardingStep((current) => Math.min(4, current + 1));
  };

  const resetSectionExamples = () => {
    const defaults = onboardingOrd === 'infanzia' ? ['Rossa', 'Verde', 'Blu'] : ['A', 'B', 'C'];
    setAvailableSections(defaults);
    setOnboardingCombinations(
      onboardingCombinations.filter((combo) => {
        const section = combo.split('^')[1];
        return section ? defaults.includes(section) : true;
      })
    );
  };

  const removeSection = (section: string, index: number) => {
    const updated = availableSections.filter((_, sectionIndex) => sectionIndex !== index);
    setAvailableSections(updated);
    setOnboardingCombinations(
      onboardingCombinations.filter((combo) => combo.split('^')[1] !== section)
    );
  };

  const renameSection = (index: number, value: string) => {
    const next = value.toUpperCase().trim();
    if (!next) return;
    const updated = [...availableSections];
    const previous = updated[index];
    updated[index] = next;
    setAvailableSections(updated);
    setOnboardingCombinations(
      onboardingCombinations.map((combo) => {
        const [grade, section] = combo.split('^');
        return section === previous ? `${grade}^${next}` : combo;
      })
    );
  };

  const stepTitle = onboardingStep === 1
    ? 'Il tuo profilo di lavoro'
    : onboardingStep === 2
      ? 'Ordine di scuola'
      : onboardingStep === 3
        ? 'Disciplina'
        : 'Classi e sezioni';

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="personal-work-profile-title"
      onKeyDown={handleDialogKeyDown}
      className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      data-onboarding-contract="personal-work-profile-v1"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-white font-medium shadow-2xl">
        <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-primary-600 to-indigo-700 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5" aria-hidden="true" />
            <div>
              <h2 id="personal-work-profile-title" className="text-sm font-black">Profilo di lavoro personale</h2>
              <p className="mt-0.5 text-[10px] text-indigo-100">Preferenze locali · nessuna autorità istituzionale</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeWithoutSaving}
            aria-label="Chiudi senza salvare"
            className="rounded-lg p-2 text-indigo-100 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex shrink-0 gap-1 border-b bg-slate-50 px-5 py-3" aria-label="Avanzamento profilo">
          {visibleSteps.map((step) => (
            <div key={step} className="flex-1">
              <div className={`h-1 rounded-full ${step <= onboardingStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              <span className={`mt-1 hidden text-[9px] font-bold sm:block ${step === onboardingStep ? 'text-indigo-700' : 'text-slate-400'}`}>
                {step === 1 ? 'Profilo' : step === 2 ? 'Ordine' : step === 3 ? 'Disciplina' : 'Classi'}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">{stepTitle}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {onboardingStep === 1 && 'Configura come vuoi lavorare in Arena su questo dispositivo. Gli incarichi organizzativi non si autoassegnano qui.'}
              {onboardingStep === 2 && 'Questa scelta filtra il curricolo che consulti e non configura l’offerta formativa della scuola.'}
              {onboardingStep === 3 && 'Seleziona la disciplina utile al tuo lavoro personale.'}
              {onboardingStep === 4 && 'Prepara il contesto delle classi e sezioni. Le modifiche verranno persistite solo quando premi Salva.'}
            </p>
          </div>

          {onboardingStep === 1 && (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setOnboardingRoleLocal('insegnante')}
                  className={`rounded-xl border p-3 text-left ${onboardingRole === 'insegnante' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'}`}
                  data-personal-role="insegnante"
                >
                  <strong className="block text-sm">Docente</strong>
                  <span className={`mt-1 block text-[11px] leading-4 ${onboardingRole === 'insegnante' ? 'text-indigo-100' : 'text-slate-500'}`}>Profilo didattico personale.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingRoleLocal('non-dichiarato')}
                  className={`rounded-xl border p-3 text-left ${onboardingRole === 'non-dichiarato' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'}`}
                  data-personal-role="non-dichiarato"
                >
                  <strong className="block text-sm">Solo consultazione</strong>
                  <span className={`mt-1 block text-[11px] leading-4 ${onboardingRole === 'non-dichiarato' ? 'text-indigo-100' : 'text-slate-500'}`}>Nessun profilo didattico dichiarato.</span>
                </button>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950" data-institutional-role-boundary="explicit">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>
                    <strong>Coordinatore di dipartimento, referente, dirigente e ruoli negli organi collegiali</strong> non si scelgono nel profilo personale. Arena riconosce questi incarichi solo quando risultano verificati nel contesto istituzionale. Le relative facoltà operative dipendono dalle autorizzazioni associate all’incarico.
                  </p>
                </div>
              </div>

              {onboardingRole === 'insegnante' && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Attività didattica personale</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOnboardingIsSostegno(false)}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold ${!onboardingIsSostegno ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                    >
                      Disciplinare
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardingIsSostegno(true)}
                      className={`rounded-lg border px-3 py-2 text-xs font-bold ${onboardingIsSostegno ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                    >
                      Sostegno
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="grid grid-cols-3 gap-2">
              {(['infanzia', 'primaria', 'secondaria'] as SchoolOrder[]).map((schoolOrder) => (
                <button
                  key={schoolOrder}
                  type="button"
                  onClick={() => handleSetOnboardingOrdLocal(schoolOrder)}
                  className={`rounded-xl border p-3 text-center text-xs font-extrabold capitalize ${onboardingOrd === schoolOrder ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                >
                  {schoolOrder}
                </button>
              ))}
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label htmlFor="personal-work-discipline" className="text-[10px] font-black uppercase tracking-wide text-slate-500">Disciplina personale</label>
              <select
                id="personal-work-discipline"
                value={onboardingDisc}
                onChange={(event) => setOnboardingDiscLocal(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                {Object.keys(localCurriculum)
                  .filter((discipline) => onboardingOrd === 'secondaria' || discipline !== 'latino')
                  .map((discipline) => (
                    <option key={discipline} value={discipline}>{getDisciplineLabel(discipline, onboardingOrd)}</option>
                  ))}
              </select>
            </div>
          )}

          {onboardingStep === 4 && (
            <div className="space-y-3">
              <section className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-indigo-900">Sezioni del contesto personale</p>
                <p className="mt-1 text-[10px] leading-4 text-slate-600">Questi dati restano una preferenza di lavoro; non rappresentano assegnazioni ufficiali della scuola.</p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newSectionInput}
                    onChange={(event) => setNewSectionInput(event.target.value.toUpperCase().trim())}
                    maxLength={10}
                    placeholder="Es. A, B, ROSSA"
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase outline-none focus:border-indigo-500"
                  />
                  <button type="button" onClick={handleAddSectionLocal} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white">Aggiungi</button>
                </div>

                <div className="mt-3 flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
                  {availableSections.length === 0 && <span className="text-[10px] text-slate-400">Nessuna sezione ancora inserita.</span>}
                  {availableSections.map((section, index) => (
                    <div key={`${section}-${index}`} className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                      <input
                        value={section}
                        onChange={(event) => renameSection(index, event.target.value)}
                        aria-label={`Modifica sezione ${section}`}
                        className="w-16 bg-transparent px-2 py-1 text-center text-[10px] font-extrabold uppercase outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeSection(section, index)}
                        aria-label={`Rimuovi sezione ${section}`}
                        className="border-l border-slate-200 px-2 py-1 text-xs font-black text-rose-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={resetSectionExamples} className="mt-2 text-[10px] font-bold text-indigo-700">Ripristina esempi locali</button>
              </section>

              {onboardingOrd === 'infanzia' ? (
                <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Sezioni personali dell’infanzia</p>
                  <div className="mt-2 space-y-2">
                    {onboardingCombinations.map((combo, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          value={combo}
                          onChange={(event) => {
                            const updated = [...onboardingCombinations];
                            updated[index] = event.target.value;
                            setOnboardingCombinations(updated);
                          }}
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                        />
                        <button type="button" onClick={() => setOnboardingCombinations(onboardingCombinations.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg border border-rose-200 bg-white px-3 text-xs font-bold text-rose-700">Rimuovi</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setOnboardingCombinations([...onboardingCombinations, 'Sezione nuova'])} className="w-full rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-bold text-indigo-700">Aggiungi sezione</button>
                  </div>
                </section>
              ) : (
                <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Combinazioni classe-sezione</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {allGrades.map((grade) => (
                      <label key={grade} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold">
                        <input
                          type="checkbox"
                          checked={selectedGrades.includes(grade)}
                          onChange={() => setSelectedGrades((current) => current.includes(grade) ? current.filter((item) => item !== grade) : [...current, grade])}
                        />
                        <span>{grade}ª</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 grid max-h-44 grid-cols-3 gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2">
                    {selectedGrades.flatMap((grade) => availableSections.map((section) => {
                      const combo = `${grade}^${section}`;
                      return (
                        <button
                          key={combo}
                          type="button"
                          onClick={() => handleToggleOnboardingCombination(combo)}
                          className={`rounded-lg border px-2 py-2 text-[10px] font-black ${onboardingCombinations.includes(combo) ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                        >
                          {grade}^{section}
                        </button>
                      );
                    }))}
                  </div>
                </section>
              )}

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] leading-5 text-emerald-950">
                <strong>Salvataggio esplicito.</strong> Le modifiche di questa schermata vengono persistite soltanto con il pulsante “Salva profilo”. Chiudere il dialogo non modifica il profilo già salvato.
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-between border-t bg-slate-50 px-5 py-3.5">
          <button
            type="button"
            onClick={goBack}
            disabled={onboardingStep === 1}
            className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Precedente
          </button>

          {onboardingStep < 4 ? (
            <button type="button" onClick={goNext} className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white">
              Prossimo
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button type="button" onClick={saveOnboardingProfile} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white" data-save-personal-profile="explicit">
              <Check className="h-4 w-4" aria-hidden="true" />
              Salva profilo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}