import { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, BookOpen, CheckCircle2, FilePlus2, FileText, Network, Search, Sparkles } from 'lucide-react';
import { getVolumeFullHtml, getVolumePlainTxt, getVolumeTitle } from '../../../data/volumesKB';
import { copyText } from '../../../lib/clipboard';
import type { AppViewsLayerProps } from '../../session';
import { deriveKnowledgeSourcePresentation } from '../lib/knowledgeSourcePresentation';
import { verifyLocalKnowledgeSource } from '../lib/localKnowledgeStore';

export type SecondBrainTabProps = Pick<AppViewsLayerProps,
  | 'secondBrainTab'
  | 'setSecondBrainTab'
  | 'selectedBrainDoc'
  | 'setSelectedBrainDoc'
  | 'customKbDocs'
  | 'setCustomKbDocs'
  | 'setShowAddKbModal'
  | 'isSpeaking'
  | 'isWikiDyslexiaFont'
  | 'setIsWikiDyslexiaFont'
  | 'wikiWorkspaceTab'
  | 'setWikiWorkspaceTab'
  | 'wikiQuery'
  | 'setWikiQuery'
  | 'wikiResponse'
  | 'wikiLoading'
  | 'triggerWikiLLMQuery'
  | 'handleToggleSpeech'
  | 'handleDeleteCustomKbDoc'
  | 'isSyncingWorkspace'
  | 'setIsSyncingWorkspace'
  | 'showToast'
  | 'graphNodes'
  | 'selectedNodeId'
  | 'setSelectedNodeId'
  | 'glossary'
  | 'selectedGlossaryTerm'
  | 'setSelectedGlossaryTerm'
  | 'customGlossaryTerm'
  | 'setCustomGlossaryTerm'
  | 'isGlossaryLoading'
  | 'glossarySearch'
  | 'setGlossarySearch'
  | 'handleGlossaryAgentPopulate'
  | 'initialEdges'
>;

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
    setCustomKbDocs,
    setShowAddKbModal,
    isSpeaking,
    isWikiDyslexiaFont,
    setIsWikiDyslexiaFont,
    wikiWorkspaceTab,
    setWikiWorkspaceTab,
    wikiQuery,
    setWikiQuery,
    wikiResponse,
    wikiLoading,
    triggerWikiLLMQuery,
    handleToggleSpeech,
    handleDeleteCustomKbDoc,
    glossary,
    glossarySearch,
    setGlossarySearch,
    showToast,
  } = props;

  const [sourceSearch, setSourceSearch] = useState('');
  const [verificationCandidateId, setVerificationCandidateId] = useState<string | null>(null);
  const [isVerifyingSource, setIsVerifyingSource] = useState(false);
  const verificationPanelRef = useRef<HTMLElement | null>(null);

  const isSearchActive = secondBrainTab === 'brain' && wikiWorkspaceTab === 'chat';
  const isSourcesActive = secondBrainTab === 'brain' && wikiWorkspaceTab === 'read';
  const selectedCustomSource = selectedBrainDoc.startsWith('vol-custom-')
    ? customKbDocs.find((doc) => doc.id === selectedBrainDoc) ?? null
    : null;
  const verificationCandidate = verificationCandidateId
    ? customKbDocs.find((doc) => doc.id === verificationCandidateId) ?? null
    : null;

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('arena:knowledge-open'));
  }, []);

  useEffect(() => {
    if (!verificationCandidateId) return;
    const frame = window.requestAnimationFrame(() => {
      const panel = verificationPanelRef.current;
      if (!panel) return;
      panel.scrollIntoView({ block: 'center', inline: 'nearest' });
      panel.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [verificationCandidateId]);

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

  const beginSourceVerification = (id: string) => {
    openSource(id);
    setVerificationCandidateId(id);
  };

  const confirmSourceVerification = async () => {
    if (!verificationCandidate || isVerifyingSource) return;
    setIsVerifyingSource(true);
    try {
      const verified = await verifyLocalKnowledgeSource(verificationCandidate.id);
      setCustomKbDocs((current) => current.map((doc) => doc.id === verified.id ? verified : doc));
      setVerificationCandidateId(null);
      showToast(`Fonte “${verified.title}” verificata localmente. Non è stata resa fonte istituzionale.`, true);
    } catch (error) {
      console.warn('[KX-4] Local source verification failed:', error);
      showToast('Non riesco a registrare la verifica di questa fonte nel browser.', false);
    } finally {
      setIsVerifyingSource(false);
    }
  };

  const submitQuestion = () => {
    const query = wikiQuery.trim();
    if (!query || wikiLoading) return;
    triggerWikiLLMQuery(query);
  };

  const readerTitle = selectedCustomSource?.title ?? getVolumeTitle(selectedBrainDoc);
  const readerPlainText = selectedCustomSource
    ? `${selectedCustomSource.title}\n${selectedCustomSource.subtitle}\n\n${selectedCustomSource.content}`
    : getVolumePlainTxt(selectedBrainDoc);

  return (
    <div className="space-y-5 text-left" data-kx-shell="teacher-first-v3" data-govuk-task-page="knowledge">
      <header className="space-y-3 border-b border-slate-200 pb-4">
        <div className="max-w-2xl space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <h1 className="text-xl font-black text-slate-900">Conoscenza</h1>
          </div>
          <p className="text-sm leading-6 text-slate-600">Trova ciò che ti serve, aggiungi materiali e controlla sempre la fonte prima di usarla in una decisione della scuola.</p>
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
          <h2 id="kx-relations-title" className="text-base font-black text-slate-900">Relazioni in preparazione</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Questa funzione sarà disponibile quando potrà mostrare collegamenti verificabili fra fonti, obiettivi, proposte e decisioni. Per ora usa Cerca, Fonti o Termini.</p>
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
                <h3 className="font-black text-slate-900">{normalizePublicText(entry.term)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{normalizePublicText(entry.definition)}</p>
                <details className="mt-3 text-xs text-slate-500"><summary className="cursor-pointer font-bold text-slate-600">Vedi la fonte</summary><p className="mt-2">{normalizePublicText(entry.source)}</p></details>
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
            <button type="button" onClick={submitQuestion} disabled={!wikiQuery.trim() || wikiLoading} className="min-h-12 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">{wikiLoading ? 'Ricerca in corso…' : 'Cerca nelle fonti'}</button>
          </div>
          {wikiResponse && <div className="max-w-3xl rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700"><strong className="block text-slate-900">Risposta locale da verificare</strong><p className="mt-2">{wikiResponse}</p></div>}
        </section>
      ) : (
        <section className="space-y-5" aria-labelledby="kx-sources-title">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-1">
              <h2 id="kx-sources-title" className="text-base font-black text-slate-900">Le tue fonti</h2>
              <p className="text-sm leading-6 text-slate-600">Le fonti locali restano separate da quelle normative o istituzionali. La verifica locale richiede una tua conferma esplicita.</p>
            </div>
            <button type="button" onClick={() => setShowAddKbModal(true)} className="min-h-12 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white"><span className="flex items-center gap-2"><FilePlus2 className="h-4 w-4" aria-hidden="true" />Aggiungi una fonte</span></button>
          </div>

          <label className="block max-w-2xl space-y-2">
            <span className="text-sm font-bold text-slate-800">Cerca nelle fonti</span>
            <input value={sourceSearch} onChange={(event) => setSourceSearch(event.target.value)} placeholder="Titolo, argomento o gruppo" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-indigo-500" />
          </label>

          <div className="grid gap-3 lg:grid-cols-2">
            {visibleCustomSources.map((doc) => {
              const presentation = deriveKnowledgeSourcePresentation(doc);
              return (
                <article key={doc.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-900">{doc.title}</h3>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${doc.authorityStatus === 'LOCAL_VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{presentation.label}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{doc.subtitle}</p>
                      <p className="mt-3 text-xs leading-5 text-slate-500">{presentation.explanation}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" onClick={() => openSource(doc.id)} className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700">Apri</button>
                        {presentation.verificationAvailable && <button type="button" onClick={() => beginSourceVerification(doc.id)} className="min-h-10 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-black text-white">Apri e verifica</button>}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {visibleBuiltInSources.map((source) => (
              <article key={source.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3"><BookOpen className="mt-1 h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-slate-900">{source.title}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{source.group}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{source.description}</p><button type="button" onClick={() => openSource(source.id)} className="mt-3 min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700">Apri</button></div></div>
              </article>
            ))}
          </div>

          {verificationCandidate && (
            <section ref={verificationPanelRef} tabIndex={-1} data-kx-task="source-verification" className="space-y-4 rounded-2xl border-2 border-indigo-300 bg-indigo-50/40 p-5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2" aria-labelledby="kx-verification-title">
              <div className="max-w-2xl space-y-2">
                <h3 id="kx-verification-title" className="text-base font-black text-slate-900">Conferma la verifica della fonte</h3>
                <p className="text-sm leading-6 text-slate-700">Controlla titolo, provenienza e contenuto. La conferma registra soltanto una verifica locale: non rende la fonte normativa o istituzionale e non modifica il curricolo approvato.</p>
                <p className="text-sm font-bold text-slate-900">{verificationCandidate.title}</p>
                {verificationCandidate.originalFileName && <p className="text-xs text-slate-600">File: {verificationCandidate.originalFileName}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setVerificationCandidateId(null)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700">Annulla</button>
                <button type="button" disabled={isVerifyingSource} onClick={confirmSourceVerification} className="min-h-11 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-black text-white disabled:bg-slate-300">{isVerifyingSource ? 'Registrazione…' : 'Conferma come fonte locale verificata'}</button>
              </div>
            </section>
          )}

          <section data-kx-task="source-reader" className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="kx-reader-title">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Fonte aperta</span><h3 id="kx-reader-title" className="font-black text-slate-900">{readerTitle}</h3></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { setIsWikiDyslexiaFont(!isWikiDyslexiaFont); showToast(isWikiDyslexiaFont ? 'Ripristinato carattere standard.' : 'Attivata modalità alta leggibilità.'); }} className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700">Alta leggibilità</button>
                <button type="button" onClick={() => handleToggleSpeech(readerPlainText)} className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700">{isSpeaking ? 'Interrompi' : 'Ascolta'}</button>
                <button type="button" onClick={() => { void copyText(readerPlainText); showToast('Testo copiato negli appunti.', true); }} className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700">Copia testo</button>
              </div>
            </div>
            <div className="p-5" style={{ fontFamily: isWikiDyslexiaFont ? 'Comic Sans MS, cursive, sans-serif' : 'inherit' }}>
              {selectedCustomSource ? (() => {
                const presentation = deriveKnowledgeSourcePresentation(selectedCustomSource);
                return <div className="space-y-4"><div className={`rounded-xl border p-4 ${selectedCustomSource.authorityStatus === 'LOCAL_VERIFIED' ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50'}`}><div className="flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${selectedCustomSource.authorityStatus === 'LOCAL_VERIFIED' ? 'text-emerald-700' : 'text-amber-700'}`} aria-hidden="true" /><strong className="text-sm text-slate-900">{presentation.label}</strong></div><p className="mt-2 text-sm leading-6 text-slate-700">{presentation.explanation}</p>{presentation.verifiedAt && <p className="mt-2 text-xs text-slate-500">Verifica registrata: {new Date(presentation.verifiedAt).toLocaleString('it-IT')}</p>}</div><div className="whitespace-pre-wrap text-sm leading-7 text-slate-800">{selectedCustomSource.content}</div><button type="button" onClick={() => void handleDeleteCustomKbDoc(selectedCustomSource.id)} className="text-xs font-bold text-rose-700">Elimina fonte locale</button></div>;
              })() : <div className="prose prose-slate max-w-none text-left" dangerouslySetInnerHTML={{ __html: getVolumeFullHtml(selectedBrainDoc) }} />}
            </div>
          </section>
        </section>
      )}
    </div>
  );
}
