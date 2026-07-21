import { useAppContext } from '../components/layout/AppContext';
import { CurriculumTab } from '../features/curriculum';

export default function CurriculumPage() {
 const ctx = useAppContext();
 return <CurriculumTab {...ctx} />;
}
