import { useEffect, useRef, useState } from 'react';
import { Archive, BookOpen, CheckCircle2, FilePlus2, ShieldCheck } from 'lucide-react';
import type { AppViewsLayerProps } from '../../session';
import {
  USER_VISIBLE_BUILT_IN_KNOWLEDGE_SOURCES,
  describeKnowledgeAuthorityClass,
} from '../lib/knowledgeBuiltInSources';
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

const shortVersion = (versionId: string): string => versionId.startsWith('sha256:')
  ? `sha256:${versionId.slice(7, 19)}…`
  : versionId;

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
      showToast(
        verified.evidenceEligibility === 'LOCAL_EVIDENCE'
          ? `Fonte “${verified.title}” verificata localmente e abilitata come evidenza locale. La sua autorità resta locale.`
          : `Fonte “${verified.title}” verificata localmente. Resta in sola consultazione finché l'estrazione non è completa.`,
        true,
      );
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
      <details
        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
        data-local-source-registry
        data-hcm-level="3"
      >
        <summary className="cursor-pointer list-none marker:content-none">
          <span className="flex items-start gap-3">
            <Archive className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-base font-black text-slate-900">Archivio locale e fonti personali</span>
              <span className="mt-1 block text-sm leading-5 text-slate-600">
                Materiali di supporto separati dalle fonti che sostengono il curricolo corrente.
              </span>
            </span>
          </span>
        </summary>

        <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
          <details className="rounded-xl border border-slate-200 bg-slate-50/70 p-3" data-hcm-level="3">
            <summary className="cursor-pointer text-sm font-bold text-slate-700">
              Materiali inclusi in Arena ({USER_VISIBLE_BUILT_IN_KNOWLEDGE_SOURCES.length})
            </summary>
            <div className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {USER_VISIBLE_BUILT_IN_KNOWLEDGE_SOURCES.map((source) => (
                <article
                  key={source.id}
                  className="p-3"
                  data-source-kind="bundled-local"
                  data-authority-class={source.authorityClass}
                  data-retrieval-eligible={source.retrievalEligible ? 'true' : 'false'}
                >
                  <div className="flex items-start gap-3">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{source.title}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">{source.group}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{source.description}</p>
                      <p className="mt-1 text-xs text-slate-500">{describeKnowledgeAuthorityClass(source.authorityClass)}</p>
                      <button
                        type="button"
                        onClick={() => openKnowledge(source.id)}
                        className="mt-2 min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                      >
                        Apri
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </details>

          <section className="rounded-xl border border-slate-200 p-3" aria-labelledby="local-sources-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 id="local-sources-title" className="text-sm font-black text-slate-900">Fonti personali</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">Restano locali anche dopo la verifica.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddKbModal(true)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-indigo-700 px-3 py-2 text-sm font-bold text-white"
              >
                <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                Aggiungi fonte
              </button>
            </div>

            {customKbDocs.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Nessuna fonte personale aggiunta.</p>
            ) : (
              <div className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200">
                {customKbDocs.map((source) => {
                  const presentation = deriveKnowledgeSourcePresentation(source);
                  const verified = source.authorityStatus === 'LOCAL_VERIFIED';
                  const evidenceReady = source.evidenceEligibility === 'LOCAL_EVIDENCE';
                  return (
                    <article
                      key={source.id}
                      className="p-3"
                      data-source-kind="uploaded-local"
                      data-source-lifecycle={source.lifecycleStatus}
                      data-evidence-eligibility={source.evidenceEligibility}
                      data-authority-class={source.authorityClass}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-900">{source.title}</h4>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{source.subtitle}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${verified ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                          {verified ? 'Verificata' : 'Da verificare'}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" onClick={() => openKnowledge(source.id)} className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700">Apri</button>
                        {!verified && (
                          <button type="button" onClick={() => beginVerification(source.id)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-indigo-700 px-3 py-2 text-sm font-bold text-white">
                            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                            Verifica
                          </button>
                        )}
                        {verified && <CheckCircle2 className="mt-3 h-4 w-4 text-emerald-600" aria-label="Fonte verificata localmente" />}
                      </div>

                      <details className="mt-2 text-xs text-slate-600" data-hcm-level="3">
                        <summary className="cursor-pointer font-bold">Dettagli</summary>
                        <div className="mt-2 space-y-1 leading-5">
                          <p>{presentation.explanation}</p>
                          <p><strong className="text-slate-800">Versione:</strong> {shortVersion(source.sourceVersionId)}</p>
                          <p><strong className="text-slate-800">Autorità:</strong> {describeKnowledgeAuthorityClass(source.authorityClass)}</p>
                          <p><strong className="text-slate-800">Uso:</strong> {evidenceReady ? 'evidenza locale' : 'sola consultazione'}</p>
                        </div>
                      </details>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </details>

      {verificationCandidate && (
        <section
          ref={verificationPanelRef}
          tabIndex={-1}
          data-kx-task="source-verification"
          data-hcm-level="1"
          className="space-y-4 rounded-2xl border-2 border-indigo-300 bg-indigo-50/50 p-4 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:p-5"
          aria-labelledby="source-registry-verification-title"
        >
          <div className="max-w-2xl">
            <h2 id="source-registry-verification-title" className="text-base font-black text-slate-900">Verifica la fonte personale</h2>
            <p className="mt-2 text-sm font-bold text-slate-900">{verificationCandidate.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">La conferma può abilitarla come evidenza locale; non la rende fonte normativa o istituzionale.</p>
          </div>
          <details className="rounded-xl border border-indigo-200 bg-white p-3" data-hcm-level="3">
            <summary className="cursor-pointer text-xs font-bold text-slate-600">Dati della fonte</summary>
            <div className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
              {verificationCandidate.originalFileName && <p>File: {verificationCandidate.originalFileName}</p>}
              <p>Versione: {shortVersion(verificationCandidate.sourceVersionId)}</p>
              <p>Autorità: {describeKnowledgeAuthorityClass(verificationCandidate.authorityClass)}</p>
              <p>Estrazione: {verificationCandidate.extractionStatus}</p>
            </div>
          </details>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setVerificationCandidateId(null)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700">Annulla</button>
            <button type="button" disabled={isVerifying} onClick={confirmVerification} className="min-h-11 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300">
              {isVerifying ? 'Registrazione…' : 'Conferma verifica locale'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
