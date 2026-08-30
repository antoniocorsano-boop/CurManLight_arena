import { useEffect, useRef, useState } from 'react';
import { Archive, BookOpen, CheckCircle2, FilePlus2, FileSearch, ShieldCheck } from 'lucide-react';
import type { AppViewsLayerProps } from '../../session';
import { USER_VISIBLE_BUILT_IN_KNOWLEDGE_SOURCES } from '../lib/knowledgeBuiltInSources';
import { deriveKnowledgeSourcePresentation } from '../lib/knowledgeSourcePresentation';
import { verifyLocalKnowledgeSource } from '../lib/localKnowledgeStore';

export type FontiTabProps = Pick<AppViewsLayerProps,
  | 'customKbDocs'
  | 'setCustomKbDocs'
  | 'setSelectedBrainDoc'
  | 'setSecondBrainTab'
  | 'setWikiWorkspaceTab'
  | 'setShowAddKbModal'
  | 'handleTabSwitch'
  | 'showToast'
>;

export function FontiTab({
  customKbDocs,
  setCustomKbDocs,
  setSelectedBrainDoc,
  setSecondBrainTab,
  setWikiWorkspaceTab,
  setShowAddKbModal,
  handleTabSwitch,
  showToast,
}: FontiTabProps) {
  const [verificationCandidateId, setVerificationCandidateId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const verificationPanelRef = useRef<HTMLElement | null>(null);
  const verificationCandidate = verificationCandidateId
    ? customKbDocs.find((source) => source.id === verificationCandidateId) ?? null
    : null;

  const openKnowledge = (sourceId?: string) => {
    if (sourceId) setSelectedBrainDoc(sourceId);
    setSecondBrainTab('brain');
    setWikiWorkspaceTab('read');
    handleTabSwitch('second-brain');
  };

  const beginVerification = (sourceId: string) => {
    setVerificationCandidateId(sourceId);
  };

  const confirmVerification = async () => {
    if (!verificationCandidate || isVerifying) return;
    setIsVerifying(true);
    try {
      const verified = await verifyLocalKnowledgeSource(verificationCandidate.id);
      setCustomKbDocs((current) => current.map((source) => source.id === verified.id ? verified : source));
      setVerificationCandidateId(null);
      showToast(`Fonte “${verified.title}” verificata localmente. Non è stata resa fonte istituzionale.`, true);
    } catch (error) {
      console.warn('[KX-4] Source registry verification failed:', error);
      showToast('Non riesco a registrare la verifica di questa fonte nel browser.', false);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!verificationCandidateId) return;
    const frame = window.requestAnimationFrame(() => {
      verificationPanelRef.current?.scrollIntoView({ block: 'center', inline: 'nearest' });
      verificationPanelRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [verificationCandidateId]);

  return (
    <div className="space-y-4 fade-in text-left" data-teacher-surface="sources" data-human-task="source-registry">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Archive className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <div className="min-w-0">
            <h1 className="text-lg font-black text-slate-900">Fonti</h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Qui controlli da dove arrivano i materiali usati in Arena. Una fonte inclusa, caricata o verificata localmente non diventa automaticamente normativa o istituzionale.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="included-sources-title">
        <div className="max-w-2xl">
          <h2 id="included-sources-title" className="text-base font-black text-slate-900">Fonti incluse nella copia locale</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Sono i materiali già disponibili in Arena. Il fatto che siano inclusi non certifica da solo provenienza normativa, vigenza o applicabilità.</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {USER_VISIBLE_BUILT_IN_KNOWLEDGE_SOURCES.map((source) => (
            <article key={source.id} className="rounded-xl border border-slate-200 p-4" data-source-kind="bundled-local">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900">{source.title}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{source.group}</span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-600">{source.description}</p>
                  <dl className="mt-3 grid gap-1 text-xs leading-5 text-slate-600">
                    <div><dt className="inline font-bold text-slate-800">Identità: </dt><dd className="inline">{source.id}</dd></div>
                    <div><dt className="inline font-bold text-slate-800">Versione: </dt><dd className="inline">inclusa nella release Arena corrente</dd></div>
                    <div><dt className="inline font-bold text-slate-800">Provenienza: </dt><dd className="inline">archivio locale incorporato nell’app; controlla il documento per la fonte originaria</dd></div>
                    <div><dt className="inline font-bold text-slate-800">Autorità: </dt><dd className="inline">riferimento locale, non approvazione istituzionale</dd></div>
                    <div><dt className="inline font-bold text-slate-800">Applicabilità: </dt><dd className="inline">da verificare rispetto a scuola, disciplina e anno</dd></div>
                  </dl>
                  <button type="button" onClick={() => openKnowledge(source.id)} className="mt-3 min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800">
                    Apri e controlla
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="local-sources-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="local-sources-title" className="text-base font-black text-slate-900">Fonti aggiunte da te</h2>
            <p className="mt-1 text-sm text-slate-600">Documenti caricati in questo browser.</p>
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
            Non hai ancora aggiunto fonti personali. Le fonti già incluse in Arena restano visibili sopra.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {customKbDocs.map((source) => {
              const presentation = deriveKnowledgeSourcePresentation(source);
              const verified = source.authorityStatus === 'LOCAL_VERIFIED';
              return (
                <article key={source.id} className="rounded-xl border border-slate-200 p-4" data-source-kind="uploaded-local">
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => openKnowledge(source.id)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800">Apri fonte</button>
                    {!verified && (
                      <button type="button" onClick={() => beginVerification(source.id)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-700 px-3 py-2 text-sm font-bold text-white">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Apri e verifica
                      </button>
                    )}
                    {verified && <CheckCircle2 className="mt-3 h-4 w-4 text-emerald-600" aria-label="Fonte verificata localmente" />}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {verificationCandidate && (
        <section
          ref={verificationPanelRef}
          tabIndex={-1}
          data-kx-task="source-verification"
          className="space-y-4 rounded-2xl border-2 border-indigo-300 bg-indigo-50/50 p-4 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:p-5"
          aria-labelledby="source-registry-verification-title"
        >
          <div className="max-w-2xl">
            <h2 id="source-registry-verification-title" className="text-base font-black text-slate-900">Conferma la verifica della fonte</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">Controlla titolo, provenienza e contenuto. Questa conferma registra solo una verifica locale: non rende la fonte normativa o istituzionale e non modifica il curricolo.</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{verificationCandidate.title}</p>
            {verificationCandidate.originalFileName && <p className="mt-1 text-xs text-slate-600">File: {verificationCandidate.originalFileName}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setVerificationCandidateId(null)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700">Annulla</button>
            <button type="button" disabled={isVerifying} onClick={confirmVerification} className="min-h-11 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300">
              {isVerifying ? 'Registrazione…' : 'Conferma come fonte locale verificata'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
