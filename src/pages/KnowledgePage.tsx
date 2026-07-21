import { useAppContext } from '../components/layout/AppContext';
import { SecondBrainTab } from '../features/documents';

export default function KnowledgePage() {
 const ctx = useAppContext();
 return <SecondBrainTab {...ctx} />;
}
