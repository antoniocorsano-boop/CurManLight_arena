import { ArrowRight, BookOpenCheck, CircleHelp, FileText, Layers, RotateCcw, Route, ShieldCheck } from 'lucide-react';
import type { AppViewsLayerProps } from '../types/appViewContracts';

export type SupportGuideViewProps = Pick<AppViewsLayerProps, 'handleTabSwitch' | 'institutionalProfile'>;

export function SupportGuideView({ handleTabSwitch, institutionalProfile }: SupportGuideViewProps) {

  const tasks = [
    {
      id: 'curriculum',
      title: 'Consultare il curricolo',
      description: 'Parti dal catalogo, scegli area o disciplina e verifica sempre fonte, versione e stato del fascicolo.',
      action: 'Vai al curricolo',
      tab: 'curricolo' as const,
      icon: Layers,
    },
    {
      id: 'sources',
      title: 'Capire fonti e provenienza',
      description: 'Nel Fascicolo trovi la pubblicazione sorgente, le fonti collegate e gli archivi locali senza confonderli con un’adozione istituzionale.',
      action: 'Apri il Fascicolo',
      tab: 'fonti' as const,
      icon: BookOpenCheck,
    },
    {
      id: 'checks',
      title: 'Capire cosa manca',
      description: 'Verifiche sintetizza prerequisiti, blocchi e azioni di recupero senza trasformarli in certificazioni.',
      action: 'Apri Verifiche',
      tab: 'verifiche' as const,
      icon: ShieldCheck,
    },
    {
      id: 'review',
      title: 'Esaminare una proposta',
      description: 'Riesame distingue il tuo contributo professionale dalla decisione istituzionale e mostra quando un passaggio non è ancora disponibile.',
      action: 'Apri il riesame',
      tab: 'revisione' as const,
      icon: RotateCcw,
    },
    {
      id: 'atlas',
      title: 'Esplorare relazioni in Curriculum Atlas',
      description: 'Apri il confine di progettazione per passare alla preview read-only di Atlas. Atlas aiuta a navigare il curricolo, ma non lo approva e non lo modifica.',
      action: 'Apri il passaggio',
      tab: 'progetta-annuale' as const,
      icon: Route,
    },
    {
      id: 'handoff',
      title: 'Preparare il passaggio a Docente OS',
      description: 'Arena prepara un contesto curricolare versionato; Docente OS lo accetta prima di usarlo per programmazione annuale, UDA, lezioni e materiali.',
      action: 'Apri Documenti',
      tab: 'esportazioni' as const,
      icon: FileText,
    },
  ];

  return (
    <section className="space-y-5 text-left" aria-labelledby="support-guide-title" data-teacher-surface="support-guide">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <CircleHelp className="mt-0.5 h-6 w-6 shrink-0 text-indigo-700" aria-hidden="true" />
          <div>
            <span className="block text-xs font-bold uppercase tracking-wide text-indigo-700">Supporto</span>
            <h1 id="support-guide-title" className="mt-1 text-2xl font-black text-slate-950">Guida</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Scegli il compito che devi svolgere. La Guida ti porta alla superficie corretta e chiarisce i confini delle azioni disponibili.
            </p>
          </div>
        </div>

        {!institutionalProfile.configured && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
            <strong>Contesto istituzionale non configurato.</strong> Puoi consultare e preparare lavoro locale, ma le azioni che richiedono un istituto verificabile restano bloccate.
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <article key={task.id} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-black text-slate-900">{task.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTabSwitch(task.tab)}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {task.action}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-black text-slate-900">Domande frequenti</h2>

        <details className="rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer font-bold text-slate-800">Perché un’azione è bloccata?</summary>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Apri Verifiche: troverai il prerequisito mancante e, quando disponibile, l’azione di recupero. Arena non simula ruoli o autorizzazioni per sbloccare un percorso.
          </p>
        </details>

        <details className="rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer font-bold text-slate-800">Una fonte presente significa che l’istituto l’ha adottata?</summary>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            No. La presenza di una fonte o di un fascicolo ne documenta provenienza e contenuto; l’adozione istituzionale è uno stato distinto e deve essere attestata dal relativo processo.
          </p>
        </details>

        <details className="rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer font-bold text-slate-800">Che cosa fa Curriculum Atlas?</summary>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Curriculum Atlas rende il curricolo leggibile e navigabile con viste e relazioni read-only. Non approva il curricolo, non modifica Arena e non sostituisce l’ambiente operativo Docente OS.
          </p>
        </details>

        <details className="rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer font-bold text-slate-800">Arena modifica automaticamente Docente OS?</summary>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            No. Il passaggio alla progettazione è esplicito, versionato e richiede controllo umano. Arena non modifica automaticamente classi, UDA o lezioni.
          </p>
        </details>
      </div>
    </section>
  );
}
