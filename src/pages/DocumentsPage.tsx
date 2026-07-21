import { useAppContext } from '../components/layout/AppContext';
import { EsportazioniTab } from '../features/documents';

export default function DocumentsPage() {
 const ctx = useAppContext();
 return <EsportazioniTab {...ctx} />;
}
