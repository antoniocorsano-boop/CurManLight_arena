import { useAppContext } from '../components/layout/AppContext';
import { CurriculumTab } from '../features/curriculum';
import { WorkspaceHeader } from '../features/workspace/components';

export default function CurriculumPage() {
 const ctx = useAppContext();
 return (
  <div className="space-y-6">
   <WorkspaceHeader
    identity="Curricolo"
    context={`${ctx.getDisciplineLabel(ctx.discipline, ctx.order)} · ${ctx.order === 'primaria' ? 'Scuola Primaria' : ctx.order === 'infanzia' ? "Scuola dell'Infanzia" : 'Scuola secondaria di I grado'}`}
    workObject="Curricolo locale"
    primaryAction={{ label: 'Apri progettazione', onClick: () => { ctx.handleTabSwitch('progetta-annuale'); ctx.setActiveProgTab('annuale'); } }}
   />
   <CurriculumTab {...ctx} />
  </div>
 );
}
