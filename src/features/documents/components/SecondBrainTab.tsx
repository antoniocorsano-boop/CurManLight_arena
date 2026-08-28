import { useEffect } from 'react';
import { Archive, BookOpen, Network, Search, Sparkles } from 'lucide-react';
import LegacySecondBrainTab, { type SecondBrainTabProps } from './SecondBrainTabLegacy';

export type { SecondBrainTabProps } from './SecondBrainTabLegacy';

export default function SecondBrainTab(props: SecondBrainTabProps) {
  const { secondBrainTab, setSecondBrainTab, wikiWorkspaceTab, setWikiWorkspaceTab } = props;
  const isSearchActive = secondBrainTab === 'brain' && wikiWorkspaceTab === 'chat';
  const isArchiveActive = secondBrainTab === 'brain' && wikiWorkspaceTab === 'read';

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('arena:knowledge-open'));
  }, []);

  const openSearch = () => {
    setSecondBrainTab('brain');
    setWikiWorkspaceTab('chat');
  };

  const openArchive = () => {
    setSecondBrainTab('brain');
    setWikiWorkspaceTab('read');
  };

  return (
    <div className="space-y-5 text-left" data-kx-shell="plain-language-v1">
      <style>{`
        .kx-legacy-shell > div > div:nth-child(1),
        .kx-legacy-shell > div > div:nth-child(2),
        .kx-legacy-shell[data-kx-task="brain"] [class*="xl:col-span-8"] > div:first-child {
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
          <button
            type="button"
            onClick={openSearch}
            aria-current={isSearchActive ? 'page' : undefined}
            className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${isSearchActive ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <span className="flex items-center gap-2"><Search className="h-4 w-4" aria-hidden="true" />Cerca e chiedi</span>
          </button>
          <button
            type="button"
            onClick={() => setSecondBrainTab('graph')}
            aria-current={secondBrainTab === 'graph' ? 'page' : undefined}
            className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${secondBrainTab === 'graph' ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <span className="flex items-center gap-2"><Network className="h-4 w-4" aria-hidden="true" />Relazioni</span>
          </button>
          <button
            type="button"
            onClick={() => setSecondBrainTab('glossary')}
            aria-current={secondBrainTab === 'glossary' ? 'page' : undefined}
            className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${secondBrainTab === 'glossary' ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" aria-hidden="true" />Termini chiave</span>
          </button>
          <button
            type="button"
            onClick={openArchive}
            aria-current={isArchiveActive ? 'page' : undefined}
            className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${isArchiveActive ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            <span className="flex items-center gap-2"><Archive className="h-4 w-4" aria-hidden="true" />Archivio storico</span>
          </button>
        </nav>
      </header>

      {secondBrainTab === 'graph' ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="kx-relations-title">
          <div className="max-w-2xl space-y-2">
            <h2 id="kx-relations-title" className="text-base font-black text-slate-900">Relazioni in preparazione</h2>
            <p className="text-sm leading-6 text-slate-600">
              La vecchia mappa tecnica non viene mostrata nella fruizione ordinaria. Questa vista sarà riaperta quando potrà rappresentare relazioni verificabili tra fonti, documenti, concetti, traguardi, obiettivi, proposte e decisioni.
            </p>
            <p className="text-sm leading-6 text-slate-600">
              Nel frattempo puoi usare Cerca e chiedi, Termini chiave o Archivio storico senza perdere il contesto.
            </p>
          </div>
        </section>
      ) : (
        <div className="kx-legacy-shell" data-kx-task={secondBrainTab}>
          <LegacySecondBrainTab {...props} />
        </div>
      )}
    </div>
  );
}
