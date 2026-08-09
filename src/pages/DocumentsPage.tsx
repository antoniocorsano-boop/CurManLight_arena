import { useAppContext } from '../components/layout/AppContext';
import { EsportazioniTab } from '../features/documents';
import { WorkspaceHeader } from '../features/workspace/components';

export default function DocumentsPage() {
 const ctx = useAppContext();
 return (
  <div className="space-y-6">
   <WorkspaceHeader
    identity="Documenti"
    context={`${ctx.getDisciplineLabel(ctx.discipline, ctx.order)} · ${ctx.order === 'primaria' ? 'Scuola Primaria' : ctx.order === 'infanzia' ? "Scuola dell'Infanzia" : 'Scuola secondaria di I grado'}`}
    workObject={ctx.documentExportHistory[0]?.sourceTitle || (ctx.documentExportHistory.length > 0 ? 'Documenti recenti' : undefined)}
    status={ctx.documentExportHistory.length > 0 ? `${ctx.documentExportHistory.length} attività registrate` : undefined}
    primaryAction={{ label: 'Apri progettazione', onClick: () => { ctx.handleTabSwitch('progetta-annuale'); ctx.setActiveProgTab('annuale'); } }}
   />
   <EsportazioniTab {...ctx} />
  </div>
 );
}
