import { useAppContext } from '../components/layout/AppContext';
import { ProcessoTab } from '../features/processo';

export default function SettingsPage() {
 const ctx = useAppContext();
 return <ProcessoTab {...ctx} />;
}
