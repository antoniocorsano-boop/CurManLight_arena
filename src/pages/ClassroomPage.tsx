import { useAppContext } from '../components/layout/AppContext';
import { ClasseTab } from '../features/classroom';

export default function ClassroomPage() {
 const ctx = useAppContext();
 return <ClasseTab {...ctx} />;
}
