import { Archive, BookOpen, Network, Search, Sparkles } from 'lucide-react';
import LegacySecondBrainTab, { type SecondBrainTabProps } from './SecondBrainTabLegacy';

export type { SecondBrainTabProps } from './SecondBrainTabLegacy';

export default function SecondBrainTab(props: SecondBrainTabProps) {
  const { secondBrainTab, setSecondBrainTab, setWikiWorkspaceTab } = props;

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
      <style>{`.kx-legacy-shell > div > div:nth-child(1), .kx-legacy-shell > div > div:nth-child(2) { display: none; }`}</style>

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
            aria-current={secondBrainTab === 'brain' ? 'page' : undefined}
            className={`min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${secondBrainTab === 'brain' ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
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
            className="min-h-12 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <span className="flex items-center gap-2"><Archive className="h-4 w-4" aria-hidden="true" />Archivio storico</span>
          </button>
        </nav>
      </header>

      <div className="kx-legacy-shell">
        <LegacySecondBrainTab {...props} />
      </div>
    </div>
  );
}
