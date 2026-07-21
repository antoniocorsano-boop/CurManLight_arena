import { useAppContext } from '../components/layout/AppContext';
import { ProgettazioneTab } from '../features/progettazione';

export default function PlanningPage() {
 const ctx = useAppContext();
 return <ProgettazioneTab {...ctx} />;
}
