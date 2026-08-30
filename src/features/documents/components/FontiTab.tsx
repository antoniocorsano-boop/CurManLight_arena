import { Archive, CheckCircle2, FilePlus2, FileSearch, ShieldCheck } from 'lucide-react';
import type { AppViewsLayerProps } from '../../session';
import { deriveKnowledgeSourcePresentation } from '../lib/knowledgeSourcePresentation';

export type FontiTabProps = Pick<AppViewsLayerProps,
  | 'customKbDocs'
  | 'setSelectedBrainDoc'
  | 'setSecondBrainTab'
  | 'setWikiWorkspaceTab'
  | 'setShowAddKbModal'
  | 'handleTabSwitch'
>;

export function FontiTab({
  customKbDocs,
  setSelectedBrainDoc,
  setSecondBrainTab,
  setWikiWorkspaceTab,
  setShowAddKbModal,
  handleTabSwitch,
}: FontiTabProps) {
  const openKnowledge = (sourceId?: string) => {
    if (sourceId) setSelectedBrainDoc(sourceId);
    setSecondBrainTab('brain');
    setWikiWorkspaceTab('read');
    handleTabSwitch('second-brain');
  };

  return (
    <div className="space-y-4 fade-in text-left" data-teacher-surface="sources" data-human-task="source-registry">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Archive className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <div className="min-w-0">
            <h1 className="text-lg font-black text-slate-900">Fonti</h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Qui controlli da dove arrivano i materiali usati in Arena. Una fonte caricata o verificata localmente non diventa automaticamente normativa o istituzionale.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="local-sources-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="local-sources-title" className="text-base font-black text-slate-900">Fonti locali</h2>
            <p className="mt-1 text-sm text-slate-600">Documenti che hai aggiunto in questo browser.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddKbModal(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white"
          >
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            Aggiungi fonte
          </button>
        </div>

        {customKbDocs.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            <FileSearch className="mb-2 h-5 w-5 text-slate-400" aria-hidden="true" />
            Non hai ancora aggiunto fonti locali.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {customKbDocs.map((source) => {
              const presentation = deriveKnowledgeSourcePresentation(source);
              const verified = source.authorityStatus === 'LOCAL_VERIFIED';
              return (
                <article key={source.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900">{source.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{source.subtitle}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${verified ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                      {verified ? 'Verificata localmente' : 'Da verificare'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-5 text-slate-600">{presentation.explanation}</p>
                  <button
                    type="button"
                    onClick={() => openKnowledge(source.id)}
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800"
                  >
                    {verified ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                    {verified ? 'Apri fonte' : 'Apri e verifica'}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <details className="rounded-2xl border border-slate-200 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-slate-800">Riferimenti già inclusi nella copia locale</summary>
        <div className="border-t border-slate-100 p-4">
          <p className="text-sm leading-6 text-slate-600">
            Arena contiene anche riferimenti curriculari e materiali di supporto. Consultali in Conoscenza e controlla sempre provenienza e applicabilità prima di usarli per una decisione.
          </p>
          <button type="button" onClick={() => openKnowledge()} className="mt-3 min-h-11 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">
            Apri Conoscenza
          </button>
        </div>
      </details>
    </div>
  );
}
