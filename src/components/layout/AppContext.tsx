import { createContext, useContext } from 'react';
import type { AppViewsLayerProps } from '../../features/session';

export type AppContextValue = AppViewsLayerProps;

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
 const ctx = useContext(AppContext);
 if (!ctx) throw new Error('useAppContext must be used within AppProvider');
 return ctx;
}
