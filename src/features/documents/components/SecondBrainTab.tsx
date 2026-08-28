import { useEffect, useMemo } from 'react';
import { Archive, BookOpen, Network, Search, Sparkles } from 'lucide-react';
import LegacySecondBrainTab, { type SecondBrainTabProps } from './SecondBrainTabLegacy';

export type { SecondBrainTabProps } from './SecondBrainTabLegacy';

const normalizePublicText = (value: string) => value
  .replace(/Unit�/g, 'Unità')
  .replace(/Capacit�/g, 'Capacità')
  .replace(/abilit�/g, 'abilità')
  .replace(/�/g, '');

export default function SecondBrainTab(props: SecondBrainTabProps) {
  const {
    secondBrainTab,
    setSecondBrainTab,
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

  const isSearchActive = secondBrainTab === 'brain' && wikiWorkspaceTab === 'chat';
  const isArchiveActive = secondBrainTab === 'brain' && wikiWorkspaceTab === 'read';

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('arena:knowledge-open'));
  }, []);

  const filteredGlossary = useMemo(() => {
    const query = glossarySearch.trim().toLocaleLowerCase('it');
    return glossary.filter((entry) => !query || entry.term.toLocaleLowerCase('it').includes(query));
  }, [glossary, glossarySearch]);

  const openSearch = () => {
    setSecondBrainTab('brain');
    setWikiWorkspaceTab('chat');
  };

  const openArchive = () => {
    setSecondBrainTab('brain');
    setWikiWorkspaceTab('read');
  };

  const submitQuestion = () => {
    const query = wikiQuery.trim();
    if (!query || wikiLoading) return;
    triggerWikiLLMQuery(query);
  };

  return (
    <div className="space-y-5 text-left" data-kx-shell="plain-language-v1">
      <style>{`
        .kx-legacy-shell > div > div:nth-child(1),
        .kx-legacy-shell > div > div:nth-child(2),
        /* Archive is read-only in the public KX journey: hide the legacy read/chat selector. */
        .kx-legacy-shell[data-kx-task="archive"] [class*="xl:col-span-8"] > div:first-child {
          display: none;
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
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <h1 className="text-lg font-black text-slate-900">Conoscenza e fonti</h1>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Cerca nelle fonti, fai domande e esplora relazioni. I contenuti locali e le risposte generate restano da verificare prima di essere usati in una decisione istituzionale.
          </p>
        </div>

        <nav aria-label="Attività nella conoscenza" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button type="button" onClick={openSearch} aria-current={isSearchActive ? 'page' : undefined} className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${isSearchActive ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <span className="flex items-center gap-2"><Search className="h-4 w-4" aria-hidden="true" />Cerca e chiedi</span>
          </button>
          <button type="button" onClick={() => setSecondBrainTab('graph')} aria-current={secondBrainTab === 'graph' ? 'page' : undefined} className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${secondBrainTab === 'graph' ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <span className="flex items-center gap-2"><Network className="h-4 w-4" aria-hidden="true" />Relazioni</span>
          </button>
          <button type="button" onClick={() => setSecondBrainTab('glossary')} aria-current={secondBrainTab === 'glossary' ? 'page' : undefined} className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${secondBrainTab === 'glossary' ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" aria-hidden="true" />Termini chiave</span>
          </button>
          <button type="button" onClick={openArchive} aria-current={isArchiveActive ? 'page' : undefined} className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${isArchiveActive ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
            <span className="flex items-center gap-2"><Archive className="h-4 w-4" aria-hidden="true" />Archivio storico</span>
          </button>
        </nav>
      </header>

      {secondBrainTab === 'graph' ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="kx-relations-title">
          <div className="max-w-2xl space-y-2">
            <h2 id="kx-relations-title" className="text-base font-black text-slate-900">Relazioni in preparazione</h2>
            <p className="text-sm leading-6 text-slate-600">La vecchia mappa tecnica non viene mostrata nella fruizione ordinaria. Questa vista sarà riaperta quando potrà rappresentare relazioni verificabili tra fonti, documenti, concetti, traguardi, obiettivi, proposte e decisioni.</p>
            <p className="text-sm leading-6 text-slate-600">Nel frattempo puoi usare Cerca e chiedi, Termini chiave o Archivio storico senza perdere il contesto.</p>
          </div>
        </section>
      ) : secondBrainTab === 'glossary' ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="kx-glossary-title">
          <div className="space-y-1">
            <h2 id="kx-glossary-title" className="text-base font-black text-slate-900">Termini chiave</h2>
            <p className="text-sm leading-6 text-slate-600">Consulta definizioni locali collegate alle fonti. Queste definizioni non sono ufficiali e vanno verificate nel contesto d’uso.</p>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-800">Cerca un termine</span>
            <input value={glossarySearch} onChange={(event) => setGlossarySearch(event.target.value)} placeholder="Es. competenza, UDA, traguardo" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-indigo-500" />
          </label>
          <div className="space-y-3">
            {filteredGlossary.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">Nessun termine corrispondente.</p>
            ) : filteredGlossary.map((entry) => (
              <article key={`${entry.term}-${entry.source}`} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-black text-slate-900">{normalizePublicText(entry.term)}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">Definizione locale</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{normalizePublicText(entry.definition)}</p>
                <p className="mt-3 text-xs text-slate-500">Fonte: {normalizePublicText(entry.source)}</p>
              </article>
            ))}
          </div>
        </section>
      ) : isSearchActive ? (
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="kx-search-title">
          <div className="space-y-1">
            <h2 id="kx-search-title" className="text-base font-black text-slate-900">Cerca e chiedi</h2>
            <p className="text-sm leading-6 text-slate-600">Parti da una domanda concreta. La risposta usa soltanto le fonti locali disponibili e resta una bozza da verificare.</p>
          </div>
          <div className="space-y-3">
            <label htmlFor="kx-question" className="block text-sm font-bold text-slate-900">Che cosa vuoi capire?</label>
            <textarea id="kx-question" value={wikiQuery} onChange={(event) => setWikiQuery(event.target.value)} rows={4} placeholder="Per esempio: quali fonti sostengono questo traguardo?" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm leading-6 outline-none focus:border-indigo-500" />
            <button type="button" onClick={submitQuestion} disabled={!wikiQuery.trim() || wikiLoading} className="min-h-12 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto">
              {wikiLoading ? 'Analisi in corso…' : 'Cerca nelle fonti'}
            </button>
          </div>
          {wikiResponse ? (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4" aria-live="polite">
              <div className="text-xs font-black uppercase tracking-wide text-indigo-800">Risposta da verificare</div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{normalizePublicText(wikiResponse)}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-600">La risposta comparirà qui. Per consultare documenti senza fare una domanda, usa Archivio storico.</div>
          )}
        </section>
      ) : (
        <div className="kx-legacy-shell" data-kx-task="archive">
          <LegacySecondBrainTab {...props} />
        </div>
      )}
    </div>
  );
}
