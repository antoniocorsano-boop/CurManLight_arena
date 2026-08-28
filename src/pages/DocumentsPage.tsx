import { useAppContext } from '../components/layout/AppContext';
import { HumanExportTab } from '../features/documents/components/HumanExportTab';

export default function DocumentsPage() {
 const ctx = useAppContext();
 return <HumanExportTab {...ctx} />;
}
