import { useAppContext } from '../components/layout/AppContext';
import { SocialTab } from '../features/social';

export default function SocialPage() {
 const ctx = useAppContext();
 return <SocialTab {...ctx} />;
}
