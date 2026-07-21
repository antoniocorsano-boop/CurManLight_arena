import { BookOpen, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { KnowledgeReference } from '../hooks/useKnowledgeCompanion';

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  'Curricolo': { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Curricolo' },
  'Fonte normativa': { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Fonte normativa' },
  'Approfondimento': { bg: 'bg-cyan-50', text: 'text-cyan-700', label: 'Approfondimento' },
};

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] ?? { bg: 'bg-slate-50', text: 'text-slate-600', label: category };
  return (
    <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

interface RefCardProps {
  knowledgeRef: KnowledgeReference;
  onOpen: (volumeId: string) => void;
}

function MainRefCard({ knowledgeRef: r, onOpen }: RefCardProps) {
  return (
    <div className="border border-slate-200 rounded-xl p-3 bg-white">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <CategoryBadge category={r.category} />
        <span className="text-[9px] text-slate-400 font-semibold shrink-0">{r.volumeId.replace('vol', 'Vol. ')}</span>
      </div>
      <h4 className="text-[11px] font-bold text-slate-800 mb-1 leading-tight">{r.title}</h4>
      <p className="text-[10px] text-slate-500 italic mb-2 leading-relaxed">{r.relevance}</p>
      <p className="text-[10px] text-slate-600 leading-relaxed mb-3 line-clamp-3">{r.excerpt}</p>
      <button
        onClick={() => onOpen(r.volumeId)}
        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
      >
        <BookOpen className="w-3 h-3" />
        Apri riferimento
      </button>
    </div>
  );
}

function AdditionalRefCard({ knowledgeRef: r, onOpen }: RefCardProps) {
  return (
    <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
      <div className="flex items-start justify-between gap-2 mb-1">
        <CategoryBadge category={r.category} />
        <span className="text-[9px] text-slate-400 font-semibold shrink-0">{r.volumeId.replace('vol', 'Vol. ')}</span>
      </div>
      <h4 className="text-[10px] font-bold text-slate-700 mb-1 leading-tight">{r.title}</h4>
      <p className="text-[10px] text-slate-500 italic mb-2 leading-relaxed">{r.relevance}</p>
      <button
        onClick={() => onOpen(r.volumeId)}
        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
      >
        <BookOpen className="w-3 h-3" />
        Apri riferimento
      </button>
    </div>
  );
}

interface VolumeOverlayProps {
  title: string;
  html: string;
  onClose: () => void;
}

function VolumeOverlay({ title, html, onClose }: VolumeOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-[92vw] max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 truncate">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 text-xs text-slate-700 leading-relaxed prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}

interface KnowledgeCompanionPanelProps {
  intro: string;
  mainRef: KnowledgeReference | null;
  additionalRefs: KnowledgeReference[];
  expanded: boolean;
  onToggleExpand: () => void;
  onOpenVolume: (volumeId: string) => void;
}

export function KnowledgeCompanionPanel({
  intro,
  mainRef,
  additionalRefs,
  expanded,
  onToggleExpand,
  onOpenVolume,
}: KnowledgeCompanionPanelProps) {
  if (!mainRef && additionalRefs.length === 0) return null;

  return (
    <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {intro && (
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
          <p className="text-[10px] text-slate-500 leading-relaxed">{intro}</p>
        </div>
      )}

      <div className="p-4 space-y-3">
        {mainRef && <MainRefCard knowledgeRef={mainRef} onOpen={onOpenVolume} />}

        {additionalRefs.length > 0 && (
          <>
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Nascondi' : `Mostra altre ${additionalRefs.length} fonti`}
            </button>

            {expanded && (
              <div className="space-y-2 pt-1">
                {additionalRefs.map(r => (
                  <AdditionalRefCard key={r.volumeId} knowledgeRef={r} onOpen={onOpenVolume} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[9px] text-slate-400 italic">Puoi continuare anche senza consultare i riferimenti.</p>
      </div>
    </div>
  );
}

interface VolumeReaderOverlayProps {
  content: { id: string; title: string; html: string } | null;
  onClose: () => void;
}

export function VolumeReaderOverlay({ content, onClose }: VolumeReaderOverlayProps) {
  if (!content) return null;
  return <VolumeOverlay title={content.title} html={content.html} onClose={onClose} />;
}
