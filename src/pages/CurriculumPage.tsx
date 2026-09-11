import { useAppContext } from '../components/layout/AppContext';
import { CurriculumTab } from '../features/curriculum';
import { InfanziaNativeCurriculumPanel } from '../features/curriculum/components/InfanziaNativeCurriculumPanel';

export default function CurriculumPage() {
  const ctx = useAppContext();

  if (ctx.order === 'infanzia') {
    return <InfanziaNativeCurriculumPanel localCurriculum={ctx.localCurriculum} />;
  }

  return <CurriculumTab {...ctx} />;
}
