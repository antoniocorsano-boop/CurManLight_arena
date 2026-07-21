import { X, Bot } from 'lucide-react';
import { useNavigationStore, useCopilotStore } from '../../../stores';

export function CopilotPanel() {
  const { copilotChatOpen, setCopilotChatOpen } = useNavigationStore();
  const { messages, isLoading } = useCopilotStore();

  if (!copilotChatOpen) return null;

  return (
    <div className="fixed top-20 bottom-4 right-4 w-80 z-[150] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <Bot size={18} />
          <span className="font-bold text-sm">Co-pilota d'Istituto</span>
        </div>
        <button onClick={() => setCopilotChatOpen(false)} className="text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-8">
            <Bot size={32} className="mx-auto mb-2 opacity-50" />
            <p>Chiedimi qualcosa sulla didattica</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 px-3 py-2 rounded-lg text-sm text-slate-500">
              Sto pensando...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
