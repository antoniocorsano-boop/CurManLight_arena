import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { CopilotPanel } from '../../copilot';
import { useNavigationStore } from '../../../stores';

interface AppShellProps {
  children: React.ReactNode;
  onShowSave?: () => void;
  onShowAgentSetup?: () => void;
}

export function AppShell({ children, onShowSave, onShowAgentSetup }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { copilotChatOpen, setCopilotChatOpen } = useNavigationStore();

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleCopilot = () => setCopilotChatOpen(!copilotChatOpen);

  return (
    <div className="flex-1 flex flex-col">
      <TopBar
        onToggleSidebar={toggleSidebar}
        onToggleCopilot={toggleCopilot}
        onShowSave={onShowSave || (() => {})}
        onShowAgentSetup={onShowAgentSetup || (() => {})}
      />

      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} />

        <div className="flex-1 flex flex-col min-w-0">
          <main id="main-content" className="flex-1 bg-white rounded-2xl shadow-sm p-6 overflow-y-auto">
            {children}
          </main>
        </div>

        <CopilotPanel />
      </div>
    </div>
  );
}