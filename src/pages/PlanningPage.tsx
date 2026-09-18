import { useAppContext } from '../components/layout/AppContext';
import { ProgettazioneTab } from '../features/progettazione';
import { InfanziaNativePlanningBoundary } from '../features/progettazione/components/InfanziaNativePlanningBoundary';

export default function PlanningPage() {
  const ctx = useAppContext();

  if (ctx.order === 'infanzia') {
    return <InfanziaNativePlanningBoundary localCurriculum={ctx.localCurriculum} />;
  }

  return <ProgettazioneTab {...ctx} />;
}
