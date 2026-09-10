import { useState } from 'react';
import { BookOpen, ExternalLink, FileText } from 'lucide-react';
import type { A07InstitutionalDocumentRead } from '../../../domain/institution';

const DEPARTMENT_CURRICULUM_DOC_ID = '1VYNvik8oLAVWjwB5Y_Q960D62t-eUZRc';
const DEPARTMENT_FOUNDATIONS_DOC_ID = '1KNjcyBzNAOsK-1FD1_HpasN9cyfASQTm';
const DEPARTMENT_CURRICULUM_DOC_URL = `https://docs.google.com/document/d/${DEPARTMENT_CURRICULUM_DOC_ID}/edit`;
const DEPARTMENT_CURRICULUM_PREVIEW_URL = `https://docs.google.com/document/d/${DEPARTMENT_CURRICULUM_DOC_ID}/preview`;
const DEPARTMENT_FOUNDATIONS_DOC_URL = `https://docs.google.com/document/d/${DEPARTMENT_FOUNDATIONS_DOC_ID}/edit`;

type CurriculumPresentationMode = 'web' | 'document';

type CurriculumSection = {
  id: string;
  title: string;
  summary: string;
  highlights?: string[];
};

const CURRICULUM_SECTIONS: CurriculumSection[] = [
  {
    id: 'identita',
    title: 'Premessa e identità epistemologica',
    summary: 'Il Dipartimento raccorda Matematica, Scienze, Tecnologia e Informatica in un percorso comune, mantenendo distinta l’identità di ogni disciplina e rendendo visibili i processi condivisi.',
    highlights: ['razionalità matematica', 'indagine scientifica', 'progettazione tecnologica', 'pensiero computazionale'],
  },
  {
    id: 'quadro',
    title: 'Quadro normativo, fonti e regime transitorio',
    summary: 'Il curricolo distingue il quadro nazionale applicabile alle diverse coorti dalle annualizzazioni d’Istituto, con particolare attenzione alla transizione tra Indicazioni 2012 e Indicazioni 2025 nell’anno scolastico 2026/2027.',
  },
  {
    id: 'architettura',
    title: 'Architettura del curricolo e lessico professionale',
    summary: 'Competenze, traguardi, obiettivi, conoscenze, abilità, evidenze e raccordi sono trattati come elementi diversi e tracciabili, evitando sovrapposizioni terminologiche.',
  },
  {
    id: 'profilo',
    title: 'Profilo dello studente e competenze chiave',
    summary: 'Il contributo del Dipartimento mira a uno studente capace di interpretare problemi e fenomeni, usare linguaggi formali e tecnici, valutare dati e fonti, progettare soluzioni e argomentare decisioni sulla base di evidenze.',
  },
  {
    id: 'stem',
    title: 'STEM e Informatica',
    summary: 'L’approccio STEM è parte della didattica ordinaria e non una somma di attività occasionali. L’Informatica è trattata come componente culturale, distinta dal semplice uso di dispositivi e integrata con dati, algoritmi, programmazione, reti, sicurezza e comprensione critica dell’intelligenza artificiale.',
  },
  {
    id: 'verticalita',
    title: 'Competenze verticali comuni e progressione 3–14',
    summary: 'La verticalità è letta come crescita della complessità cognitiva, dell’autonomia, dell’astrazione e della capacità di trasferimento, con un raccordo esplicito tra scuola dell’infanzia, primaria e secondaria di primo grado.',
  },
  {
    id: 'matematica',
    title: 'Matematica — curricolo verticale',
    summary: 'La Matematica sviluppa astrazione, rappresentazione, modellizzazione, problem solving e argomentazione, facendo crescere progressivamente la capacità di passare tra linguaggio naturale, simbolico, grafico e informatico.',
  },
  {
    id: 'scienze',
    title: 'Scienze — curricolo verticale',
    summary: 'Le Scienze educano a costruire spiegazioni fondate su osservazioni ed evidenze: porre domande, formulare ipotesi, misurare, sperimentare, interpretare dati e modelli, comunicare risultati e rivedere le spiegazioni.',
  },
  {
    id: 'tecnologia',
    title: 'Tecnologia — curricolo verticale',
    summary: 'Tecnologia sviluppa una razionalità progettuale per comprendere come persone e comunità trasformano materiali, energia, informazioni e ambienti in risposta a bisogni, valutando funzionalità, sicurezza, sostenibilità e conseguenze.',
    highlights: ['analizzare bisogni e sistemi', 'definire requisiti e vincoli', 'rappresentare e progettare', 'realizzare o simulare', 'testare e valutare impatti'],
  },
  {
    id: 'informatica',
    title: 'Informatica — progressione trasversale',
    summary: 'La progressione informatica rende espliciti dati, algoritmi, programmazione, strutture di controllo, debugging, reti, automazione, sicurezza e comprensione critica dell’intelligenza artificiale.',
  },
  {
    id: 'assi',
    title: 'Assi trasversali',
    summary: 'Sostenibilità, Educazione civica, sicurezza e orientamento sono raccordati alle discipline e alle rispettive fonti, senza essere trasformati in temi aggiuntivi scollegati dal curricolo.',
  },
  {
    id: 'metodologie',
    title: 'Metodologie e ambienti di apprendimento',
    summary: 'Laboratorio, osservazione, modellizzazione, problem solving, progettazione, sperimentazione, discussione e revisione dell’errore sono utilizzati come modalità di costruzione della conoscenza.',
  },
  {
    id: 'inclusione',
    title: 'Inclusione e personalizzazione',
    summary: 'Il curricolo comune resta il riferimento culturale, mentre mediazioni, strumenti, tempi, evidenze e modalità di espressione possono essere personalizzati o individualizzati in coerenza con PEI e PDP.',
  },
  {
    id: 'valutazione',
    title: 'Evidenze, verifica e valutazione',
    summary: 'La valutazione è collegata a evidenze osservabili e criteri espliciti. Le rubriche interne non vengono confuse con i dispositivi ufficiali di valutazione e certificazione delle competenze.',
  },
  {
    id: 'monitoraggio',
    title: 'Impegni operativi e monitoraggio dipartimentale',
    summary: 'Il curricolo è sottoposto a monitoraggio per individuare sovrapposizioni, lacune, prerequisiti impliciti, carico curricolare e qualità dei raccordi tra annualità e ordini di scuola.',
  },
  {
    id: 'validazione',
    title: 'Sintesi identitaria e validazione',
    summary: 'La versione predisposta per il Dipartimento è pronta per l’esame professionale, ma non equivale ad approvazione formale né rende il curricolo vigente senza i successivi passaggi collegiali previsti dall’Istituto.',
  },
];

type ProfessionalCurriculumReaderProps = {
  institutionalProfile: A07InstitutionalDocumentRead;
  targetClass: string;
  onOpenTechnologyReview: (targetClass: '1' | '2' | '3') => void;
};

export function ProfessionalCurriculumReader({
  institutionalProfile,
  targetClass,
  onOpenTechnologyReview,
}: ProfessionalCurriculumReaderProps) {
  const [mode, setMode] = useState<CurriculumPresentationMode>('web');
  const [sectionId, setSectionId] = useState(CURRICULUM_SECTIONS[0].id);
  const selectedSection = CURRICULUM_SECTIONS.find((section) => section.id === sectionId) ?? CURRICULUM_SECTIONS[0];
  const selectedSectionIndex = CURRICULUM_SECTIONS.findIndex((section) => section.id === selectedSection.id);
  const academicYear = institutionalProfile.academicYearLabel || '2026/2027';
  const instituteName = institutionalProfile.instituteName || 'Istituto Comprensivo Statale “don Lorenzo Milani” — Calvario–Covotta';

  const moveSection = (offset: number) => {
    const nextIndex = selectedSectionIndex + offset;
    if (nextIndex < 0 || nextIndex >= CURRICULUM_SECTIONS.length) return;
    setSectionId(CURRICULUM_SECTIONS[nextIndex].id);
  };

  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      data-canonical-curriculum-entry
      data-curriculum-primary-task="consultation"
      data-curriculum-presentation="professional-publication"
      data-hcm-level="1"
    >
      <header className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-5 py-7 text-center sm:px-8 sm:py-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{instituteName}</p>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Curricolo verticale</h1>
        <p className="mt-2 text-sm font-bold text-indigo-700 sm:text-base">Dipartimento Scientifico-Matematico-Tecnologico</p>
        <p className="mt-1 text-sm text-slate-600">Matematica · Scienze · Tecnologia · Informatica · STEM</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">A.S. {academicYear}</span>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-900">Da esaminare e validare</span>
          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-800">Percorso 3–14</span>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6" aria-label="Modalità di consultazione del curricolo">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1" data-curriculum-mode-switch>
          <button
            type="button"
            onClick={() => setMode('web')}
            aria-pressed={mode === 'web'}
            data-curriculum-mode="web"
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${mode === 'web' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Vista web
          </button>
          <button
            type="button"
            onClick={() => setMode('document')}
            aria-pressed={mode === 'document'}
            data-curriculum-mode="document"
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${mode === 'document' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Documento
          </button>
        </div>
      </div>

      {mode === 'web' ? (
        <div className="mx-auto max-w-4xl space-y-6 px-5 py-6 sm:px-8 sm:py-8" data-curriculum-web-reader>
          <div className="space-y-2">
            <p className="text-base leading-7 text-slate-700">
              Questa vista organizza il curricolo per una consultazione rapida e leggibile. La modalità Documento conserva il testo integrale e le matrici predisposte per il Dipartimento.
            </p>
            <div className="flex flex-wrap gap-2" aria-label="Copertura del curricolo" data-curriculum-scope-summary>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Infanzia · 3–5 anni</span>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Primaria · I–V</span>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Secondaria · I–III</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="curriculum-section" className="text-xs font-bold uppercase tracking-wide text-slate-500">Indice del curricolo</label>
            <select
              id="curriculum-section"
              value={sectionId}
              onChange={(event) => setSectionId(event.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none"
              data-curriculum-section-selector
            >
              {CURRICULUM_SECTIONS.map((section, index) => (
                <option key={section.id} value={section.id}>{index + 1}. {section.title}</option>
              ))}
            </select>
          </div>

          <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-7" data-curriculum-section={selectedSection.id}>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Sezione {selectedSectionIndex + 1} di {CURRICULUM_SECTIONS.length}</p>
            <h2 className="mt-2 text-xl font-black leading-tight text-slate-950 sm:text-2xl">{selectedSection.title}</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">{selectedSection.summary}</p>

            {selectedSection.highlights && (
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedSection.highlights.map((highlight) => (
                  <span key={highlight} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">{highlight}</span>
                ))}
              </div>
            )}

            {selectedSection.id === 'tecnologia' && (
              <div className="mt-6 border-t border-slate-200 pt-5" data-secondary-curriculum-navigation>
                <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Dal curricolo al lavoro del docente</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Se vuoi riesaminare Tecnologia, scegli l’annualità. La consultazione del curricolo resta separata dal Riesame.</p>
                <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Apri il riesame di Tecnologia per classe">
                  {(['1', '2', '3'] as const).map((classId) => {
                    const selected = targetClass === classId;
                    return (
                      <button
                        key={classId}
                        type="button"
                        onClick={() => onOpenTechnologyReview(classId)}
                        aria-label={`Apri il riesame di Tecnologia per la classe ${classId === '1' ? 'prima' : classId === '2' ? 'seconda' : 'terza'}`}
                        data-open-technology-review-class={classId}
                        className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-bold transition ${selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-200 bg-white text-indigo-800 hover:border-indigo-400'}`}
                      >
                        {classId === '1' ? 'Classe I' : classId === '2' ? 'Classe II' : 'Classe III'}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">Classe III: il Riesame non è ancora disponibile.</p>
              </div>
            )}
          </article>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => moveSection(-1)}
              disabled={selectedSectionIndex === 0}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Precedente
            </button>
            <button
              type="button"
              onClick={() => moveSection(1)}
              disabled={selectedSectionIndex === CURRICULUM_SECTIONS.length - 1}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Successiva
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl space-y-5 px-5 py-6 sm:px-8 sm:py-8" data-curriculum-document-reader>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Versione predisposta per il Dipartimento</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">Curricolo verticale · versione v3.1</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Testo integrale con premessa, quadro normativo, profilo dello studente, progressioni disciplinari, metodologie, inclusione, valutazione e monitoraggio.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <a
                href={DEPARTMENT_CURRICULUM_DOC_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                data-open-department-curriculum-document
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Apri il documento
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={DEPARTMENT_FOUNDATIONS_DOC_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-indigo-300"
                data-open-department-foundations-document
              >
                Fondamenti e tracciabilità
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block" data-curriculum-document-preview>
            <iframe
              title="Curricolo verticale del Dipartimento Scientifico-Matematico-Tecnologico"
              src={DEPARTMENT_CURRICULUM_PREVIEW_URL}
              className="h-[72vh] w-full border-0"
            />
          </div>

          <p className="text-sm leading-6 text-slate-500 lg:hidden">
            Su smartphone il documento completo si apre in una scheda dedicata, evitando una seconda area di scorrimento dentro la pagina.
          </p>
        </div>
      )}
    </section>
  );
}
