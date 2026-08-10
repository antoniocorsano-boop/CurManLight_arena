import { useAppContext } from '../components/layout/AppContext';
import PlanningCatalogue from '../features/progettazione/components/PlanningCatalogue';
import { WorkspaceHeader } from '../features/workspace/components';
import { buildPlanningCatalogue, mapLegacyDraftToPlanning } from '../domain/planning';

export default function PlanningPage() {
 const ctx = useAppContext();
 const catalogue = buildPlanningCatalogue({
  compatibilityResults: [mapLegacyDraftToPlanning({
   title: ctx.progTitle,
   discipline: ctx.discipline,
   schoolOrder: ctx.order,
   classLabel: ctx.targetClass,
   period: ctx.progPeriod,
   hours: ctx.progHours,
   notes: ctx.progNotes,
  })],
  udaArtifacts: ctx.savedUda,
 });

 return (
  <div className="space-y-6">
   <WorkspaceHeader
    identity="Progettazione"
    context={`${ctx.getDisciplineLabel(ctx.discipline, ctx.order)} · ${ctx.targetClass ? `Classe ${ctx.targetClass}` : ctx.order === 'primaria' ? 'Scuola Primaria' : 'Contesto non selezionato'}`}
    workObject={ctx.progTitle || undefined}
    status={ctx.progStatus}
    primaryAction={{ label: 'Apri documenti', onClick: () => ctx.handleTabSwitch('esportazioni') }}
   />
   <PlanningCatalogue
    entries={catalogue}
    onContinue={(entry) => {
     ctx.setProgTitle(entry.title === 'Progettazione senza titolo' ? '' : entry.title);
     ctx.setActiveProgTab('annuale');
    }}
    onNew={() => { ctx.setProgTitle(''); ctx.setActiveProgTab('annuale'); }}
    disciplineLabel={(discipline) => ctx.getDisciplineLabel(discipline, ctx.order)}
   />
  </div>
 );
}
