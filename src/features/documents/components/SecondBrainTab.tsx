import { useEffect, useMemo, useState } from 'react';
import { Archive, BookOpen, FilePlus2, FileText, Network, Search, Sparkles } from 'lucide-react';
import LegacySecondBrainTab, { type SecondBrainTabProps } from './SecondBrainTabLegacy';

export type { SecondBrainTabProps } from './SecondBrainTabLegacy';

const normalizePublicText = (value: string) => value
  .replace(/Compito di Realt�/g, 'Compito di Realtà')
  .replace(/Unit�/g, 'Unità')
  .replace(/Capacit�/g, 'Capacità')
  .replace(/abilit�/g, 'abilità')
  .replace(/ � /g, ' — ')
  .replace(/�/g, '');

type SourceCard = {
  id: string;
  title: string;
  description: string;
  group: string;
  technical?: boolean;
};

const BUILT_IN_SOURCES: SourceCard[] = [
  { id: 'vol4', title: 'Curricolo della scuola', description: 'Il curricolo locale disponibile in Arena.', group: 'Curricolo' },
  { id: 'vol8', title: 'Curricolo per discipline', description: 'Traguardi, obiettivi e dettaglio disciplinare.', group: 'Curricolo' },
  { id: 'vol7', title: 'Passaggio alle Indicazioni 2025', description: 'Materiali per confrontare il quadro precedente con quello nuovo.', group: 'Curricolo' },
  { id: 'vol3', title: 'Normativa e riferimenti', description: 'Riferimenti normativi, inclusione, privacy e quadro generale.', group: 'Riferimenti' },
  { id: 'vol2', title: 'Scuola e miglioramento', description: 'Materiali RAV, NIV e Piano di miglioramento.', group: 'Scuola' },
  { id: 'vol1', title: 'Progetti e territorio', description: 'Raccolta di materiali, progetti e riferimenti territoriali.', group: 'Scuola' },
  { id: 'vol6', title: 'Termini e concetti', description: 'Repertorio locale per orientarsi nel lessico curricolare.', group: 'Riferimenti' },
  { id: 'vol10', title: 'Materiali per il Collegio', description: 'Bozze e materiali di supporto alla discussione collegiale.', group: 'Processo' },
  { id: 'vol9', title: 'Accessibilità e conformità', description: 'Materiali di verifica e documentazione storica.', group: 'Riferimenti' },
  { id: 'vol5', title: 'Guida tecnica di CurManLight', description: 'Documentazione interna del sistema.', group: 'Sistema', technical: true },
  { id: 'vol11', title: 'Stato dello sviluppo', description: 'Informazioni tecniche sullo stato dell’applicazione.', group: 'Sistema', technical: true },
  { id: 'vol12', title: 'Piano tecnico di completamento', description: 'Pianificazione interna dello sviluppo.', group: 'Sistema', technical: true },
];

export default function SecondBrainTab(props: SecondBrainTabProps) {
  const {
    secondBrainTab,
    setSecondBrainTab,
    selectedBrainDoc,
    setSelectedBrainDoc,
    customKbDocs,
    setShowAddKbModal,
    wikiWorkspaceTab,
    setWikiWorkspaceTab,
    wikiQuery,
    setWikiQuery,
    wikiResponse,
    wikiLoading,
    triggerWikiLLMQuery,
    glossary,
    glossarySearch,
    setGlossarySearch,
  } = props;

  const [sourceSearch, setSourceSearch] = useState('');

  const isSearchActive = secondBrainTab === 'brain' && wikiWorkspaceTab === 'chat';
  const isSourcesActive = secondBrainTab === 'brain' && wikiWorkspaceTab === 'read';

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('arena:knowledge-open'));
  }, []);

  const filteredGlossary = useMemo(() => {
    const query = glossarySearch.trim().toLocaleLowerCase('it');
    return glossary.filter((entry) => !query || entry.term.toLocaleLowerCase('it').includes(query));
  }, [glossary, glossarySearch]);

  const visibleBuiltInSources = useMemo(() => {
    const query = sourceSearch.trim().toLocaleLowerCase('it');
    return BUILT_IN_SOURCES.filter((source) => !source.technical)
      .filter((source) => !query || `${source.title} ${source.description} ${source.group}`.toLocaleLowerCase('it').includes(query));
  }, [sourceSearch]);

  const visibleCustomSources = useMemo(() => {
    const query = sourceSearch.trim().toLocaleLowerCase('it');
    return customKbDocs.filter((doc) => !query || `${doc.title} ${doc.subtitle}`.toLocaleLowerCase('it').includes(query));
  }, [customKbDocs, sourceSearch]);

  const openSearch = () => {
    setSecondBrainTab('brain');
    setWikiWorkspaceTab('chat');
  };

  const openSources = () => {
    setSecondBrainTab('brain');
    setWikiWorkspaceTab('read');
  };

  const openSource = (id: string) => {
    setSelectedBrainDoc(id);
    setSecondBrainTab('brain');
    setWikiWorkspaceTab('read');
  };

  const submitQuestion = () => {
    const query = wikiQuery.trim();
    if (!query || wikiLoading) return;
    triggerWikiLLMQuery(query);
  };

  return (
    <div className="space-y-5 text-left" data-kx-shell="teacher-first-v2" data-govuk-task-page="knowledge">
      <style>{`
        .kx-legacy-shell[data-kx-task="source-reader"] > div > div:nth-child(1),
        .kx-legacy-shell[data-kx-task="source-reader"] > div > div:nth-child(2),
        .kx-legacy-shell[data-kx-task="source-reader"] [class*="xl:grid-cols-12"] > div:first-child,
        .kx-legacy-shell[data-kx-task="source-reader"] [class*="xl:col-span-8"] > div:first-child {
          display: none;
        }

        .kx-legacy-shell[data-kx-task="source-reader"] [class*="xl:grid-cols-12"] > div:last-child {
          grid-column: 1 / -1;
        }

        @media (max-width: 1279px) {
          .kx-legacy-shell [class*="h-[580px]"] {
            height: auto !important;
            overflow: visible !important;
          }

          .kx-legacy-shell [class*="overflow-y-auto"] {
            overflow-y: visible !important;
            max-height: none !important;
          }

          .kx-legacy-shell [class*="overflow-hidden"] {
            overflow: visible !important;
          }

          .kx-legacy-shell [class*="max-h-"] {
            max-height: none !important;
          }
        }
      `}</style>

      <header className="space-y-3 border-b border-slate-200 pb-4">
        <div className="max-w-2xl space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <h1 className="text-xl font-black text-slate-900">Conoscenza</h1>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            Trova ciò che ti serve, aggiungi materiali e controlla sempre la fonte prima di usarla in una decisione della scuola.
          </p>
        </div>

        <nav aria-label="Cosa vuoi fare nella conoscenza" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button type="button" onClick={openSearch} aria-current={isSearchActive ? 'page' : undefined} className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${isSearchActive ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <span className="flex items-center gap-2"><Search className="h-4 w-4" aria-hidden="true" />Cerca</span>
          </button>
          <button type="button" onClick={openSources} aria-current={isSourcesActive ? 'page' : undefined} className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${isSourcesActive ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <span className="flex items-center gap-2"><Archive className="h-4 w-4" aria-hidden="true" />Fonti</span>
          </button>
          <button type="button" onClick={() => setSecondBrainTab('glossary')} aria-current={secondBrainTab === 'glossary' ? 'page' : undefined} className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${secondBrainTab === 'glossary' ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" aria-hidden="true" />Termini</span>
          </button>
          <button type="button" onClick={() => setSecondBrainTab('graph')} aria-current={secondBrainTab === 'graph' ? 'page' : undefined} className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${secondBrainTab === 'graph' ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <span className="flex items-center gap-2"><Network className="h-4 w-4" aria-hidden="true" />Relazioni</span>
          </button>
        </nav>
      </header>

      {secondBrainTab === 'graph' ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="kx-relations-title">
          <div className="max-w-2xl space-y-2">
            <h2 id="kx-relations-title" className="text-base font-black text-slate-900">Relazioni in preparazione</h2>
            <p className="text-sm leading-6 text-slate-600">Questa funzione sarà disponibile quando potrà mostrare collegamenti verificabili fra fonti, obiettivi, proposte e decisioni.</p>
            <p className="text-sm leading-6 text-slate-600">Per ora usa Cerca, Fonti o Termini.</p>
          </div>
        </section>
      ) : secondBrainTab === 'glossary' ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="kx-glossary-title">
          <div className="max-w-2xl space-y-1">
            <h2 id="kx-glossary-title" className="text-base font-black text-slate-900">Termini</h2>
            <p className="text-sm leading-6 text-slate-600">Cerca una definizione locale. Verificala nella fonte quando serve per una decisione.</p>
          </div>
          <label className="block max-w-2xl space-y-2">
            <span className="text-sm font-bold text-slate-800">Quale termine cerchi?</span>
            <input value={glossarySearch} onChange={(event) => setGlossarySearch(event.target.value)} placeholder="Per esempio: competenza, UDA, traguardo" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-indigo-500" />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            {filteredGlossary.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">Nessun termine trovato.</p>
            ) : filteredGlossary.map((entry) => (
              <article key={`${entry.term}-${entry.source}`} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-black text-slate-900">{normalizePublicText(entry.term)}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">Locale</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{normalizePublicText(entry.definition)}</p>
                <details className="mt-3 text-xs text-slate-500">
                  <summary className="cursor-pointer font-bold text-slate-600">Vedi la fonte</summary>
                  <p className="mt-2">{normalizePublicText(entry.source)}</p>
                </details>
              </article>
            ))}
          </div>
        </section>
      ) : isSearchActive ? (
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="kx-search-title">
          <div className="max-w-2xl space-y-1">
            <h2 id="kx-search-title" className="text-base font-black text-slate-900">Cerca nella conoscenza</h2>
            <p className="text-sm leading-6 text-slate-600">Scrivi una domanda concreta. La risposta resta da verificare nelle fonti.</p>
          </div>
          <div className="max-w-2xl space-y-3">
            <label htmlFor="kx-question" className="block text-sm font-bold text-slate-900">Che cosa vuoi capire?</label>
            <textarea id="kx-question" value={wikiQuery} onChange={(event) => setWikiQuery(event.target.value)} rows={3} placeholder="Per esempio: quali fonti sostengono questo traguardo?" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm leading-6 outline-none focus:border-indigo-500" />
            <button type="button" onClick={submitQuestion} disabled={!wikiQuery.trim() || wikiLoading} className="min-h-12 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto">
              {wikiLoading ? 'Ricerca in corso…' : 'Cerca nelle fonti'}
            </button>
          </div>
          {wikiResponse ? (
            <div className="max-w-2xl rounded-xl border border-indigo-100 bg-indigo-50/40 p-4" aria-live="polite">
              <div className="text-xs font-black uppercase tracking-wide text-indigo-800">Risposta da verificare</div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{normalizePublicText(wikiResponse)}</p>
            </div>
          ) : (
            <div className="max-w-2xl rounded-xl border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-600">Se vuoi soltanto leggere o aggiungere un materiale, apri Fonti.</div>
          )}
        </section>
      ) : (
        <section className="space-y-5" aria-labelledby="kx-sources-title">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl space-y-1">
                <h2 id="kx-sources-title" className="text-base font-black text-slate-900">Le tue fonti</h2>
                <p className="text-sm leading-6 text-slate-600">Cerca un materiale per argomento oppure aggiungine uno nuovo. I nomi tecnici dei file restano nascosti nella fruizione ordinaria.</p>
              </div>
              <button type="button" onClick={() => setShowAddKbModal(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-500">
                <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                Aggiungi una fonte
              </button>
            </div>

            <label className="mt-5 block max-w-2xl space-y-2">
              <span className="text-sm font-bold text-slate-800">Trova una fonte</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input value={sourceSearch} onChange={(event) => setSourceSearch(event.target.value)} placeholder="Per esempio: curricolo, RAV, privacy" className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-500" />
              </div>
            </label>
          </div>

          {visibleCustomSources.length > 0 && (
            <section className="space-y-3" aria-labelledby="kx-added-sources-title">
              <h3 id="kx-added-sources-title" className="text-sm font-black text-slate-900">Aggiunte da te</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {visibleCustomSources.map((doc) => (
                  <button key={doc.id} type="button" onClick={() => openSource(doc.id)} className={`rounded-xl border p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/30 ${selectedBrainDoc === doc.id ? 'border-indigo-500 bg-indigo-50/40' : 'border-slate-200 bg-white'}`}>
                    <span className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block font-black text-slate-900">{normalizePublicText(doc.title)}</span>
                        <span className="mt-1 block text-sm leading-5 text-slate-600">{normalizePublicText(doc.subtitle || 'Materiale aggiunto localmente')}</span>
                        <span className="mt-2 block text-xs font-bold text-amber-700">Da verificare prima dell’uso istituzionale</span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3" aria-labelledby="kx-built-in-title">
            <div className="flex items-center justify-between gap-3">
              <h3 id="kx-built-in-title" className="text-sm font-black text-slate-900">Materiali disponibili</h3>
              <span className="text-xs text-slate-500">{visibleBuiltInSources.length} risultati</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {visibleBuiltInSources.map((source) => (
                <button key={source.id} type="button" onClick={() => openSource(source.id)} className={`rounded-xl border p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/30 ${selectedBrainDoc === source.id ? 'border-indigo-500 bg-indigo-50/40' : 'border-slate-200 bg-white'}`}>
                  <span className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block font-black text-slate-900">{source.title}</span>
                      <span className="mt-1 block text-sm leading-5 text-slate-600">{source.description}</span>
                      <span className="mt-2 block text-xs font-bold text-slate-500">{source.group} · fonte locale</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            {visibleBuiltInSources.length === 0 && visibleCustomSources.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">Nessuna fonte corrisponde alla ricerca.</p>
            )}
          </section>

          <details className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700" data-hcm-secondary-content>
            <summary className="cursor-pointer font-bold text-slate-800">Materiali tecnici del sistema</summary>
            <p className="mt-2 max-w-2xl leading-6 text-slate-600">Questi documenti servono allo sviluppo e alla manutenzione di CurManLight. Non fanno parte del percorso ordinario del docente.</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {BUILT_IN_SOURCES.filter((source) => source.technical).map((source) => (
                <button key={source.id} type="button" onClick={() => openSource(source.id)} className="rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-slate-300">
                  <span className="font-bold text-slate-800">{source.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{source.description}</span>
                </button>
              ))}
            </div>
          </details>

          <div className="kx-legacy-shell" data-kx-task="source-reader" aria-label="Lettura della fonte selezionata">
            <LegacySecondBrainTab {...props} />
          </div>
        </section>
      )}
    </div>
  );
}
