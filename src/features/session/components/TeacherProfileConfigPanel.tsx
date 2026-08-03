import { useEffect, useState } from 'react';
import type { SchoolOrder } from '../../../types/curriculum';
import type { CurriculumMap } from '../types/appViewContracts';
import type { TeacherProfileDraft } from '../hooks/useOnboardingProfile';

interface TeacherProfileConfigPanelProps {
  profile: TeacherProfileDraft;
  localCurriculum: CurriculumMap;
  getDisciplineLabel: (discipline: string, order?: SchoolOrder) => string;
  onSave: (profile: TeacherProfileDraft) => void;
  onReset: () => void;
}

const fieldClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2';

const parseList = (value: string) => [...new Set(value.split(',').map(item => item.trim()).filter(Boolean))];

export function TeacherProfileConfigPanel({ profile, localCurriculum, getDisciplineLabel, onSave, onReset }: TeacherProfileConfigPanelProps) {
  const [draft, setDraft] = useState(profile);

  useEffect(() => setDraft(profile), [profile]);

  const hasPersonalData = draft.isSostegno || draft.order !== 'secondaria' || draft.discipline !== 'italiano' || draft.assignedClasses.length > 0 || draft.availableSections.length > 0 || draft.assignedCombinations.length > 0;
  const status = !hasPersonalData
    ? 'Profilo non configurato'
    : draft.assignedCombinations.length > 0 ? 'Profilo operativo' : 'Profilo parzialmente configurato';
  const disciplines = Object.keys(localCurriculum).filter(discipline => draft.order === 'secondaria' || discipline !== 'latino');

  return (
    <section aria-labelledby="teacher-profile-config-title" className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="space-y-1">
        <h2 id="teacher-profile-config-title" className="text-base font-black text-slate-900">Profilo docente</h2>
        <p className="font-bold text-indigo-800" role="status">{status}</p>
        <p className="text-xs text-slate-600">Preferenze personali per consultare e progettare. Non rappresentano assegnazioni ufficiali dell’istituto.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-bold text-slate-700">
          <span>Ordine scolastico</span>
          <select aria-label="Ordine scolastico" value={draft.order} onChange={event => setDraft(current => ({ ...current, order: event.target.value as SchoolOrder }))} className={fieldClass}>
            <option value="infanzia">Scuola dell’infanzia</option>
            <option value="primaria">Scuola primaria</option>
            <option value="secondaria">Scuola secondaria</option>
          </select>
        </label>
        <label className="space-y-1 text-xs font-bold text-slate-700">
          <span>Disciplina</span>
          <select aria-label="Disciplina" value={draft.discipline} onChange={event => setDraft(current => ({ ...current, discipline: event.target.value }))} className={fieldClass}>
            {disciplines.map(discipline => <option key={discipline} value={discipline}>{getDisciplineLabel(discipline, draft.order)}</option>)}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
        <input type="checkbox" aria-label="Docente di sostegno" checked={draft.isSostegno} onChange={event => setDraft(current => ({ ...current, isSostegno: event.target.checked }))} />
        Docente di sostegno / inclusione PEI
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-xs font-bold text-slate-700">
          <span>Classi assegnate</span>
          <input aria-label="Classi assegnate" value={draft.assignedClasses.join(', ')} onChange={event => setDraft(current => ({ ...current, assignedClasses: parseList(event.target.value) }))} placeholder="1, 2, 3" className={fieldClass} />
        </label>
        <label className="space-y-1 text-xs font-bold text-slate-700">
          <span>Sezioni</span>
          <input aria-label="Sezioni" value={draft.availableSections.join(', ')} onChange={event => setDraft(current => ({ ...current, availableSections: parseList(event.target.value) }))} placeholder="A, B, C" className={fieldClass} />
        </label>
        <label className="space-y-1 text-xs font-bold text-slate-700">
          <span>Combinazioni classe-sezione</span>
          <input aria-label="Combinazioni classe-sezione" value={draft.assignedCombinations.join(', ')} onChange={event => setDraft(current => ({ ...current, assignedCombinations: parseList(event.target.value) }))} placeholder="1^A, 2^B" className={fieldClass} />
        </label>
      </div>

      {draft.assignedCombinations.length === 0 && <p className="text-xs text-slate-500">Nessuna classe o sezione operativa ancora indicata.</p>}

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-3">
        <button type="button" onClick={() => { onReset(); setDraft(profile); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600">Ripristina profilo</button>
        <button type="button" onClick={() => onSave(draft)} className="rounded-lg bg-indigo-700 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">Salva profilo</button>
      </div>
    </section>
  );
}
