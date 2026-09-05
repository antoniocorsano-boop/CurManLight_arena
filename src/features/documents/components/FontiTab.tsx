import { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, BookOpen, CheckCircle2, FilePlus2, FileSearch, ShieldCheck } from 'lucide-react';
import type { SourceGovernanceRecord, SourceUsageContext } from '../../../domain/curriculum/sources/governance';
import type { AppViewsLayerProps } from '../../session';
import {
  USER_VISIBLE_BUILT_IN_KNOWLEDGE_SOURCES,
  describeKnowledgeAuthorityClass,
} from '../lib/knowledgeBuiltInSources';
import { deriveKnowledgeSourcePresentation } from '../lib/knowledgeSourcePresentation';
import {
  calculateLocalKnowledgeSourceFingerprint,
  ensureLocalKnowledgeGovernanceRecords,
  getOrCreateLocalKnowledgePrincipalId,
  verifyLocalKnowledgeSource,
} from '../lib/localKnowledgeStore';
import {
  classifyLocalKnowledgeSourceForContext,
  type LocalSourceContextEvaluation,
} from '../lib/localSourceGovernance';

export type FontiTabProps = Pick<AppViewsLayerProps,
  | 'customKbDocs'
  | 'setCustomKbDocs'
  | 'setSelectedBrainDoc'
  | 'setSecondBrainTab'
  | 'setWikiWorkspaceTab'
  | 'setShowAddKbModal'
  | 'handleTabSwitch'
  | 'showToast'
  | 'discipline'
  | 'order'
  | 'institutionalProfile'
>;

const shortVersion = (versionId: string): string => versionId.startsWith('sha256:')
  ? `sha256:${versionId.slice(7, 19)}…`
  : versionId;

const governanceKey = (sourceId: string, sourceVersionId: string): string => `${sourceId}::${sourceVersionId}`;

const localIsoDate = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const evaluationBadge = (evaluation: LocalSourceContextEvaluation): { label: string; className: string } => {
  switch (evaluation.status) {
    case 'valid-evidence':
      return { label: 'Valida · evidenza locale', className: 'bg-emerald-50 text-emerald-800' };
    case 'valid-consult-only':
      return { label: 'Valida · sola consultazione', className: 'bg-sky-50 text-sky-800' };
    case 'needs-verification':
      return { label: 'Da verificare', className: 'bg-amber-50 text-amber-800' };
    case 'context-mismatch':
      return { label: 'Fuori contesto', className: 'bg-slate-100 text-slate-700' };
    case 'stale-version':
      return { label: 'Versione cambiata', className: 'bg-rose-50 text-rose-800' };
    case 'governance-invalid':
      return { label: 'Governance incompleta', className: 'bg-rose-50 text-rose-800' };
    default:
      return { label: 'Registro non disponibile', className: 'bg-slate-100 text-slate-700' };
  }
};

export function FontiTab({
  customKbDocs,
  setCustomKbDocs,
  setSelectedBrainDoc,
  setSecondBrainTab,
  setWikiWorkspaceTab,
  setShowAddKbModal,
  handleTabSwitch,
  showToast,
  discipline,
  order,
  institutionalProfile,
}: FontiTabProps) {
  const [verificationCandidateId, setVerificationCandidateId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registryLoading, setRegistryLoading] = useState(false);
  const [registryError, setRegistryError] = useState<string | null>(null);
  const [localPrincipalId, setLocalPrincipalId] = useState<string | null>(null);
  const [governanceRecords, setGovernanceRecords] = useState<Record<string, SourceGovernanceRecord>>({});
  const [fingerprints, setFingerprints] = useState<Record<string, string>>({});
  const verificationPanelRef = useRef<HTMLElement | null>(null);
  const verificationCandidate = verificationCandidateId
    ? customKbDocs.find((source) => source.id === verificationCandidateId) ?? null
    : null;

  const usageContext = useMemo<SourceUsageContext>(() => ({
    at: localIsoDate(),
    userId: localPrincipalId ?? undefined,
    instituteId: institutionalProfile.configured ? institutionalProfile.organizationId : undefined,
    schoolOrder: order,
    discipline,
  }), [discipline, institutionalProfile.configured, institutionalProfile.organizationId, localPrincipalId, order]);

  const evaluatedSources = useMemo(() => customKbDocs.map((source) => {
    const key = governanceKey(source.id, source.sourceVersionId);
    const evaluation = registryLoading || registryError
      ? classifyLocalKnowledgeSourceForContext(source, undefined, undefined, usageContext)
      : classifyLocalKnowledgeSourceForContext(source, governanceRecords[key], fingerprints[key], usageContext);
    return { source, evaluation };
  }), [customKbDocs, fingerprints, governanceRecords, registryError, registryLoading, usageContext]);

  const validSources = evaluatedSources.filter(({ evaluation }) => evaluation.validForContext);
  const unavailableSources = evaluatedSources.filter(({ evaluation }) => !evaluation.validForContext);

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
      const verified = await verifyLocalKnowledgeSource(verificationCandidate.id, {
        scope: {
          instituteId: institutionalProfile.configured ? institutionalProfile.organizationId : undefined,
          schoolOrder: order,
          discipline,
        },
      });
      setCustomKbDocs((current) => current.map((source) => source.id === verified.id ? verified : source));
      setVerificationCandidateId(null);
      showToast(
        verified.evidenceEligibility === 'LOCAL_EVIDENCE'
          ? `Fonte “${verified.title}” verificata per il contesto corrente e abilitata come evidenza locale. La sua autorità resta personale.`
          : `Fonte “${verified.title}” verificata per il contesto corrente. Resta in sola consultazione finché l'estrazione non è completa.`,
        true,
      );
    } catch (error) {
      console.warn('[CML-DRIVE-01] Source governance verification failed:', error);
      showToast('Non riesco a registrare verifica e governance di questa fonte nel browser.', false);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (customKbDocs.length === 0) {
      setGovernanceRecords({});
      setFingerprints({});
      setRegistryError(null);
      setRegistryLoading(false);
      return () => { cancelled = true; };
    }

    const hydrateRegistry = async () => {
      setRegistryLoading(true);
      setRegistryError(null);
      try {
        const principalId = await getOrCreateLocalKnowledgePrincipalId();
        const records = await ensureLocalKnowledgeGovernanceRecords(customKbDocs);
        const fingerprintPairs = await Promise.all(customKbDocs.map(async (source) => [
          governanceKey(source.id, source.sourceVersionId),
          await calculateLocalKnowledgeSourceFingerprint(source),
        ] as const));
        if (cancelled) return;
        setLocalPrincipalId(principalId);
        setGovernanceRecords(Object.fromEntries(records.map((record) => [
          governanceKey(record.sourceId, record.sourceVersionId),
          record,
        ])));
        setFingerprints(Object.fromEntries(fingerprintPairs));
      } catch (error) {
        console.warn('[CML-DRIVE-01] Contextual source registry unavailable:', error);
        if (!cancelled) {
          setRegistryError('Il registro di governance non è disponibile: Arena non dichiarerà valida alcuna fonte locale.');
          setGovernanceRecords({});
          setFingerprints({});
        }
      } finally {
        if (!cancelled) setRegistryLoading(false);
      }
    };

    void hydrateRegistry();
    return () => { cancelled = true; };
  }, [customKbDocs]);

  useEffect(() => {
    if (!verificationCandidateId) return;
    const frame = window.requestAnimationFrame(() => {
      verificationPanelRef.current?.scrollIntoView({ block: 'center', inline: 'nearest' });
      verificationPanelRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [verificationCandidateId]);

  const renderLocalSourceCard = ({ source, evaluation }: (typeof evaluatedSources)[number]) => {
    const presentation = deriveKnowledgeSourcePresentation(source);
    const verified = source.authorityStatus === 'LOCAL_VERIFIED';
    const badge = evaluationBadge(evaluation);
    return (
      <article
        key={source.id}
        className="rounded-xl border border-slate-200 p-4"
        data-source-kind="uploaded-local"
        data-source-lifecycle={source.lifecycleStatus}
        data-evidence-eligibility={source.evidenceEligibility}
        data-authority-class={source.authorityClass}
        data-source-context-status={evaluation.status}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900">{source.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{source.subtitle}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        <p className="mt-3 text-sm leading-5 text-slate-600">{evaluation.explanation}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{presentation.explanation}</p>
        <dl className="mt-3 grid gap-1 text-xs leading-5 text-slate-600">
          <div><dt className="inline font-bold text-slate-800">Tipo: </dt><dd className="inline">documento locale caricato dall’utente</dd></div>
          <div><dt className="inline font-bold text-slate-800">Versione: </dt><dd className="inline">{shortVersion(source.sourceVersionId)}</dd></div>
          <div><dt className="inline font-bold text-slate-800">Autorità: </dt><dd className="inline">{describeKnowledgeAuthorityClass(source.authorityClass)}; la governance CML resta personale</dd></div>
          <div><dt className="inline font-bold text-slate-800">Contesto: </dt><dd className="inline">{institutionalProfile.configured ? institutionalProfile.instituteName : 'istituto non vincolato'} · {order} · {discipline}</dd></div>
          <div><dt className="inline font-bold text-slate-800">Uso nel retrieval: </dt><dd className="inline">{evaluation.evidenceEligible ? 'evidenza locale' : 'non abilitata come evidenza'}</dd></div>
        </dl>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => openKnowledge(source.id)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800">Apri fonte</button>
          {!evaluation.validForContext && (
            <button type="button" onClick={() => beginVerification(source.id)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-700 px-3 py-2 text-sm font-bold text-white">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {verified ? 'Rivalida nel contesto' : 'Apri e verifica'}
            </button>
          )}
          {evaluation.validForContext && <CheckCircle2 className="mt-3 h-4 w-4 text-emerald-600" aria-label="Fonte valida nel contesto corrente" />}
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-4 fade-in text-left" data-teacher-surface="sources" data-human-task="source-registry">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Archive className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <div className="min-w-0">
            <h1 className="text-lg font-black text-slate-900">Fonti</h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Qui controlli provenienza, versione, verifica, autorità e validità nel contesto corrente. Verificare una fonte locale non la rende normativa o istituzionale.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="context-valid-sources-title" data-source-registry-view="contextual">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="context-valid-sources-title" className="text-base font-black text-slate-900">Fonti valide per me / per questo contesto</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Arena mostra qui solo versioni con governance persistita, verifica umana e ambito compatibile con il profilo corrente. La validità non attribuisce autorità istituzionale.
            </p>
            <p className="mt-2 text-xs font-bold text-slate-500">
              Contesto: {institutionalProfile.configured ? institutionalProfile.instituteName : 'istituto non vincolato'} · {order} · {discipline} · {usageContext.at}
            </p>
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

        {registryLoading && (
          <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Verifico il registro locale delle fonti…</p>
        )}
        {registryError && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800" role="alert">{registryError}</p>
        )}
        {!registryLoading && !registryError && validSources.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            <FileSearch className="mb-2 h-5 w-5 text-slate-400" aria-hidden="true" />
            Nessuna fonte locale soddisfa ancora verifica, versione e contesto. Le fonti non utilizzabili sono elencate sotto con il motivo.
          </div>
        )}
        {!registryLoading && !registryError && validSources.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">{validSources.map(renderLocalSourceCard)}</div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="unavailable-sources-title">
        <div className="max-w-2xl">
          <h2 id="unavailable-sources-title" className="text-base font-black text-slate-900">Fonti disponibili ma non utilizzabili nel contesto</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Restano visibili per evitare perdita di informazione, ma Arena non le tratta come valide finché manca una condizione verificabile.</p>
        </div>
        {customKbDocs.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            <FileSearch className="mb-2 h-5 w-5 text-slate-400" aria-hidden="true" />
            Non hai ancora aggiunto fonti personali.
          </div>
        ) : unavailableSources.length === 0 ? (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Tutte le fonti locali registrate sono valide nel contesto corrente.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">{unavailableSources.map(renderLocalSourceCard)}</div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="included-sources-title">
        <div className="max-w-2xl">
          <h2 id="included-sources-title" className="text-base font-black text-slate-900">Fonti incluse nella copia locale</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Sono materiali incorporati nella release. Arena li tratta come riferimenti archiviati o derivati finché non esiste una verifica separata della loro autorità e applicabilità.</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {USER_VISIBLE_BUILT_IN_KNOWLEDGE_SOURCES.map((source) => (
            <article key={source.id} className="rounded-xl border border-slate-200 p-4" data-source-kind="bundled-local" data-authority-class={source.authorityClass} data-retrieval-eligible={source.retrievalEligible ? 'true' : 'false'}>
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
                    <div><dt className="inline font-bold text-slate-800">Autorità: </dt><dd className="inline">{describeKnowledgeAuthorityClass(source.authorityClass)}</dd></div>
                    <div><dt className="inline font-bold text-slate-800">Uso nel retrieval: </dt><dd className="inline">{source.retrievalEligible ? 'ammesso come riferimento archiviato' : 'escluso'}</dd></div>
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
            <p className="mt-2 text-sm leading-6 text-slate-700">Controlla titolo, provenienza e contenuto. La conferma registra la versione esatta e la rende valida solo nel contesto dichiarato. L’autorità resta personale: questa azione non può promuovere il documento a fonte istituzionale o normativa.</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{verificationCandidate.title}</p>
            {verificationCandidate.originalFileName && <p className="mt-1 text-xs text-slate-600">File: {verificationCandidate.originalFileName}</p>}
            <p className="mt-1 text-xs text-slate-600">Versione: {shortVersion(verificationCandidate.sourceVersionId)}</p>
            <p className="mt-1 text-xs text-slate-600">Autorità: {describeKnowledgeAuthorityClass(verificationCandidate.authorityClass)} → governance personale</p>
            <p className="mt-1 text-xs text-slate-600">Estrazione: {verificationCandidate.extractionStatus}</p>
            <p className="mt-1 text-xs font-bold text-slate-700">Validità proposta: {institutionalProfile.configured ? institutionalProfile.instituteName : 'istituto non vincolato'} · {order} · {discipline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setVerificationCandidateId(null)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700">Annulla</button>
            <button type="button" disabled={isVerifying} onClick={confirmVerification} className="min-h-11 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300">
              {isVerifying ? 'Registrazione…' : 'Conferma verifica nel contesto'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
