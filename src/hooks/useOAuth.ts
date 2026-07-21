import { useEffect, useCallback } from 'react';
import { useWorkspaceStore } from '../stores';

type OAuthTokenPayload = {
  exp?: number;
};

const isOAuthTokenPayload = (value: unknown): value is OAuthTokenPayload => {
  return typeof value === 'object' && value !== null && (!('exp' in value) || typeof (value as OAuthTokenPayload).exp === 'number');
};

export interface OAuthHandlers {
  parseHashToken: () => void;
  clearExpiredToken: () => void;
}

export function useOAuth(): OAuthHandlers {
  const parseHashToken = useCallback(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    if (accessToken) {
      useWorkspaceStore.getState().setTokens(accessToken, '');
      window.location.hash = '';
    }
  }, []);

  const clearExpiredToken = useCallback(() => {
    const { accessToken } = useWorkspaceStore.getState();
    if (!accessToken) return;

    try {
      const rawPayload: unknown = JSON.parse(atob(accessToken.split('.')[1] ?? ''));
      if (isOAuthTokenPayload(rawPayload) && rawPayload.exp && rawPayload.exp * 1000 < Date.now()) {
        useWorkspaceStore.getState().logout();
      }
    } catch {
      // Token might not be JWT, skip validation.
    }
  }, []);

  useEffect(() => {
    parseHashToken();
    clearExpiredToken();
  }, [parseHashToken, clearExpiredToken]);

  return { parseHashToken, clearExpiredToken };
}
