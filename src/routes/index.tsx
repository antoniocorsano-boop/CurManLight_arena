import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

const CurriculumPage = lazy(() => import('../pages/CurriculumPage'));
const PlanningPage = lazy(() => import('../pages/PlanningPage'));
const DocumentsPage = lazy(() => import('../pages/DocumentsPage'));
const CopilotPage = lazy(() => import('../pages/CopilotPage'));
const KnowledgePage = lazy(() => import('../pages/KnowledgePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: <Navigate to="/curriculum" replace /> },
      { path: 'curriculum', element: <CurriculumPage /> },
      { path: 'curriculum/:discipline', element: <CurriculumPage /> },
      { path: 'classroom', element: <Navigate to="/planning" replace /> },
      { path: 'classroom/:mode', element: <Navigate to="/planning" replace /> },
      { path: 'planning', element: <PlanningPage /> },
      { path: 'planning/wizard', element: <PlanningPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'documents/:type', element: <DocumentsPage /> },
      { path: 'copilot', element: <CopilotPage /> },
      { path: 'knowledge', element: <KnowledgePage /> },
      { path: 'social', element: <Navigate to="/curriculum" replace /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '*', element: <Navigate to="/curriculum" replace /> },
]);
