import { useAppContext } from '../components/layout/AppContext';
import { ProgettazioneTab } from '../features/progettazione';
import { WorkspaceHeader } from '../features/workspace/components';

export default function PlanningPage() {
 const ctx = useAppContext();
 return (
  <div className="space-y-6">
   <WorkspaceHeader
    identity="Progettazione"
    context={`${ctx.getDisciplineLabel(ctx.discipline, ctx.order)} · ${ctx.targetClass ? `Classe ${ctx.targetClass}` : ctx.order === 'primaria' ? 'Scuola Primaria' : 'Contesto non selezionato'}`}
    workObject={ctx.progTitle || undefined}
    status={ctx.progStatus}
    primaryAction={{ label: 'Apri documenti', onClick: () => ctx.handleTabSwitch('esportazioni') }}
   />
   <ProgettazioneTab {...ctx} />
  </div>
 );
}
