import { useState } from 'react';
import { BookOpen, ExternalLink, FileText, Network } from 'lucide-react';
import type { A07InstitutionalDocumentRead } from '../../../domain/institution';
import {
  DEPARTMENT_CURRICULUM_MANIFEST,
  DEPARTMENT_CURRICULUM_SECTIONS,
  DepartmentCurriculumPublication,
} from './DepartmentCurriculumPublication';
import {
  CurriculumExploreTrama,
  type CurriculumExploreContext,
  type CurriculumExploreView,
} from './CurriculumExploreTrama';

const DEPARTMENT_CURRICULUM_DOC_ID = '1VYNvik8oLAVWjwB5Y_Q960D62t-eUZRc';
const DEPARTMENT_FOUNDATIONS_DOC_ID = '1KNjcyBzNAOsK-1FD1_HpasN9cyfASQTm';
const DEPARTMENT_CURRICULUM_DOC_URL = `https://docs.google.com/document/d/${DEPARTMENT_CURRICULUM_DOC_ID}/edit`;
const DEPARTMENT_CURRICULUM_PREVIEW_URL = `https://docs.google.com/document/d/${DEPARTMENT_CURRICULUM_DOC_ID}/preview`;
const DEPARTMENT_FOUNDATIONS_DOC_URL = `https://docs.google.com/document/d/${DEPARTMENT_FOUNDATIONS_DOC_ID}/edit`;

type CurriculumPresentationMode = CurriculumExploreView | 'document';

type CurriculumSectionNavigation = {
  id: string;
  number: number;
};

const SECTION_NAVIGATION: CurriculumSectionNavigation[] = [
  { id: 'identita', number: 1 },
  { id: 'quadro', number: 2 },
  { id: 'architettura', number: 3 },
  { id: 'profilo', number: 4 },
  { id: 'stem', number: 5 },
  { id: 'verticalita', number: 6 },
  { id: 'matematica', number: 7 },
  { id: 'scienze', number: 8 },
  { id: 'tecnologia', number: 9 },
  { id: 'informatica', number: 10 },
  { id: 'assi', number: 11 },
  { id: 'metodologie', number: 12 },
  { id: 'inclusione', number: 13 },
  { id: 'valutazione', number: 14 },
  { id: 'monitoraggio', number: 15 },
  { id: 'validazione', number: 16 },
];

type ProfessionalCurriculumReaderProps = {
  institutionalProfile: A07InstitutionalDocumentRead;
  onUseInPlanning: (context: CurriculumExploreContext) => void;
  onOpenReview: (context: CurriculumExploreContext) => void;
  canOpenReview: (context: CurriculumExploreContext) => boolean;
  onOpenSource: (context: CurriculumExploreContext) => void;
};

export function ProfessionalCurriculumReader({
  institutionalProfile,
  onUseInPlanning,
  onOpenReview,
  canOpenReview,
  onOpenSource,
}: ProfessionalCurriculumReaderProps) {
  const [mode, setMode] = useState<CurriculumPresentationMode>('explore');
  const [sectionId, setSectionId] = useState(SECTION_NAVIGATION[0].id);
  const selectedNavigation = SECTION_NAVIGATION.find((section) => section.id === sectionId) ?? SECTION_NAVIGATION[0];
  const selectedNavigationIndex = SECTION_NAVIGATION.findIndex((section) => section.id === selectedNavigation.id);
  const selectedSection = DEPARTMENT_CURRICULUM_SECTIONS.find((section) => section.number === selectedNavigation.number) ?? DEPARTMENT_CURRICULUM_SECTIONS[0];
  const academicYear = institutionalProfile.academicYearLabel || DEPARTMENT_CURRICULUM_MANIFEST.institution.academicYear;
  const instituteName = institutionalProfile.instituteName || DEPARTMENT_CURRICULUM_MANIFEST.institution.name;

  const moveSection = (offset: number) => {
    const nextIndex = selectedNavigationIndex + offset;
    if (nextIndex < 0 || nextIndex >= SECTION_NAVIGATION.length) return;
    setSectionId(SECTION_NAVIGATION[nextIndex].id);
  };

  const setExploreView = (view: CurriculumExploreView) => setMode(view);

  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      data-canonical-curriculum-entry
      data-curriculum-primary-task="consultation"
      data-curriculum-presentation="professional-publication"
      data-curriculum-publication-parity="source-snapshot"
      data-curriculum-ux-contract="ARENA_UX_CONTRACT@1.0.0"
      data-hcm-level="1"
    >
      <header className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-5 py-7 text-center sm:px-8 sm:py-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{instituteName}</p>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Curricolo verticale</h1>
        <p className="mt-2 text-sm font-bold text-indigo-700 sm:text-base">{DEPARTMENT_CURRICULUM_MANIFEST.institution.department}</p>
        <p className="mt-1 text-sm text-slate-600">{DEPARTMENT_CURRICULUM_MANIFEST.institution.disciplines.join(' · ')}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">A.S. {academicYear}</span>
          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-indigo-800">Versione di lavoro</span>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-900">Validazione professionale aperta</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">Percorso verticale 3–14</span>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6" aria-label="Modalità di consultazione del curricolo">
        <div className="mx-auto grid max-w-xl grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1" data-curriculum-mode-switch>
          <button
            type="button"
            onClick={() => setMode('explore')}
            aria-pressed={mode === 'explore'}
            data-curriculum-mode="explore"
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-bold transition ${mode === 'explore' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Esplora
          </button>
          <button
            type="button"
            onClick={() => setMode('trama')}
            aria-pressed={mode === 'trama'}
            data-curriculum-mode="trama"
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-bold transition ${mode === 'trama' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
          >
            <Network className="h-4 w-4" aria-hidden="true" />
            Trama
          </button>
          <button
            type="button"
            onClick={() => setMode('document')}
            aria-pressed={mode === 'document'}
            data-curriculum-mode="document"
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-bold transition ${mode === 'document' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Documento
          </button>
        </div>
      </div>

      {mode !== 'document' ? (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8" data-curriculum-professional-explorer>
          <CurriculumExploreTrama
            sections={DEPARTMENT_CURRICULUM_SECTIONS}
            view={mode}
            onViewChange={setExploreView}
            onUseInPlanning={onUseInPlanning}
            onOpenReview={onOpenReview}
            canOpenReview={canOpenReview}
            onOpenSource={onOpenSource}
            onOpenDocument={() => setMode('document')}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-6xl space-y-5 px-5 py-6 sm:px-8 sm:py-8" data-curriculum-document-reader>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Documento del curricolo</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">Curricolo verticale · versione v3.1</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Questa è la resa editoriale completa: premessa, quadro normativo, profilo dello studente, progressioni disciplinari, metodologie, inclusione, valutazione e monitoraggio.
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
                Apri il documento completo
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

          <details className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" data-curriculum-integral-web-publication>
            <summary className="cursor-pointer text-sm font-bold text-slate-700">Consulta l’edizione web integrale per sezione</summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Questa lettura conserva l’ordine editoriale del documento. Per la consultazione ordinaria torna a Esplora o Trama.
            </p>

            <div className="mt-5 space-y-2 lg:hidden">
              <label htmlFor="curriculum-section" className="text-xs font-bold uppercase tracking-wide text-slate-500">Sezione del documento</label>
              <select
                id="curriculum-section"
                value={sectionId}
                onChange={(event) => setSectionId(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none"
                data-curriculum-section-selector
              >
                {SECTION_NAVIGATION.map((navigation) => {
                  const section = DEPARTMENT_CURRICULUM_SECTIONS.find((item) => item.number === navigation.number);
                  return <option key={navigation.id} value={navigation.id}>{navigation.number}. {section?.title}</option>;
                })}
              </select>
            </div>

            <div className="mt-5 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
              <nav className="hidden lg:block" aria-label="Indice del documento" data-curriculum-desktop-index>
                <div className="sticky top-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Indice del documento</p>
                  <div className="max-h-[72vh] space-y-1 overflow-y-auto pr-1">
                    {SECTION_NAVIGATION.map((navigation) => {
                      const section = DEPARTMENT_CURRICULUM_SECTIONS.find((item) => item.number === navigation.number);
                      const active = navigation.id === sectionId;
                      return (
                        <button
                          key={navigation.id}
                          type="button"
                          onClick={() => setSectionId(navigation.id)}
                          aria-current={active ? 'page' : undefined}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm leading-5 transition ${active ? 'bg-white font-bold text-indigo-800 shadow-sm ring-1 ring-indigo-100' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
                        >
                          <span className="mr-2 text-xs font-bold text-slate-400">{navigation.number}</span>
                          {section?.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>

              <div className="min-w-0">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-9" data-curriculum-section={selectedNavigation.id}>
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Sezione {selectedSection.number} di {DEPARTMENT_CURRICULUM_SECTIONS.length}</p>
                  <h3 className="mt-2 text-xl font-black leading-tight text-slate-950 sm:text-2xl lg:text-3xl">{selectedSection.title}</h3>
                  <div className="mt-5 border-t border-slate-100 pt-1">
                    <DepartmentCurriculumPublication section={selectedSection} />
                  </div>
                </article>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => moveSection(-1)}
                    disabled={selectedNavigationIndex === 0}
                    className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sezione precedente
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(1)}
                    disabled={selectedNavigationIndex === SECTION_NAVIGATION.length - 1}
                    className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sezione successiva
                  </button>
                </div>
              </div>
            </div>
          </details>
        </div>
      )}
    </section>
  );
}
