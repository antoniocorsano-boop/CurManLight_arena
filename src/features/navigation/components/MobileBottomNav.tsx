import { Calendar, DownloadCloud, FolderOpen, Layers, RotateCcw } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  pendingCount: number;
  handleTabSwitch: (tab: string) => void;
}

export function MobileBottomNav({ activeTab, pendingCount, handleTabSwitch }: MobileBottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl z-50 h-16 flex justify-around items-center px-2 pb-safe">
      <button onClick={() => handleTabSwitch('dashboard')} className={`flex flex-col items-center justify-center transition flex-1 ${activeTab === 'dashboard' ? 'text-primary-600 font-extrabold' : 'text-slate-400 font-medium'}`}><FolderOpen className="w-5 h-5" /><span className="text-[9px] mt-1">Home</span></button>
      <button onClick={() => handleTabSwitch('curricolo')} className={`flex flex-col items-center justify-center transition flex-1 ${activeTab === 'curricolo' ? 'text-primary-600 font-extrabold' : 'text-slate-400 font-medium'}`}><Layers className="w-5 h-5" /><span className="text-[9px] mt-1">Consulta</span></button>
      <button onClick={() => handleTabSwitch('revisione')} className={`flex flex-col items-center justify-center transition flex-1 relative ${activeTab === 'revisione' ? 'text-primary-600 font-extrabold' : 'text-slate-400 font-medium'}`}><RotateCcw className="w-5 h-5" /><span className="text-[9px] mt-1">Revisione</span>{pendingCount > 0 && <span className="absolute top-1.5 right-6 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full">{pendingCount}</span>}</button>
      <button onClick={() => handleTabSwitch('progetta-annuale')} className={`flex flex-col items-center justify-center transition flex-1 ${activeTab === 'progetta-annuale' ? 'text-primary-600 font-extrabold' : 'text-slate-400 font-medium'}`}><Calendar className="w-5 h-5" /><span className="text-[9px] mt-1">Progetta</span></button>
      <button onClick={() => handleTabSwitch('esportazioni')} className={`flex flex-col items-center justify-center transition flex-1 ${activeTab === 'esportazioni' ? 'text-primary-600 font-extrabold' : 'text-slate-400 font-medium'}`}><DownloadCloud className="w-5 h-5" /><span className="text-[9px] mt-1">Esporta</span></button>
    </div>
  );
}
