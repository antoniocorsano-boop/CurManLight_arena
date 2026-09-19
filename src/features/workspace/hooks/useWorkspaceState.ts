import { useEffect, useState } from 'react';
import { safeLocalStorageGetItem, safeLocalStorageRemoveItem } from '../../../lib/consolidatedStorage';

const LEGACY_WORKSPACE_CREDENTIAL_KEYS = [
 'curman_workspaceAccessToken',
 'curman_workspaceTokenExpiry',
 'curman_isWorkspaceLoggedIn',
] as const;

export function useWorkspaceState() {
 const [cloudAccountType, setCloudAccountType] = useState<'scolastica' | 'personale'>(() => {
  return safeLocalStorageGetItem('curman_cloudAccountType', 'personale') as 'scolastica' | 'personale';
 });
 const [showCloudAccountModal, setShowCloudAccountModal] = useState(false);
 const [personalUserEmail, setPersonalUserEmail] = useState(() => safeLocalStorageGetItem('curman_personalUserEmail', ''));
 const [isWorkspaceLoggedIn, setIsWorkspaceLoggedIn] = useState(false);
 const [workspaceUserEmail, setWorkspaceUserEmail] = useState(() => safeLocalStorageGetItem('curman_workspaceUserEmail', ''));
 const [isSyncingWorkspace, setIsSyncingWorkspace] = useState(false);
 const [workspaceAccessToken, setWorkspaceAccessToken] = useState('');
 const [workspaceTokenExpiry, setWorkspaceTokenExpiry] = useState(0);
 const [isWorkspaceSyncLocked, setIsWorkspaceSyncLocked] = useState(false);
 const [isFileProtocol, setIsFileProtocol] = useState(false);
 const [workspaceClientId, setWorkspaceClientId] = useState(() => {
   return safeLocalStorageGetItem('curman_workspaceClientId', import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '');
 });

 useEffect(() => {
  for (const key of LEGACY_WORKSPACE_CREDENTIAL_KEYS) {
   safeLocalStorageRemoveItem(key);
  }
 }, []);

 return {
  cloudAccountType,
  setCloudAccountType,
  showCloudAccountModal,
  setShowCloudAccountModal,
  personalUserEmail,
  setPersonalUserEmail,
  isWorkspaceLoggedIn,
  setIsWorkspaceLoggedIn,
  workspaceUserEmail,
  setWorkspaceUserEmail,
  isSyncingWorkspace,
  setIsSyncingWorkspace,
  workspaceAccessToken,
  setWorkspaceAccessToken,
  workspaceTokenExpiry,
  setWorkspaceTokenExpiry,
  isWorkspaceSyncLocked,
  setIsWorkspaceSyncLocked,
  isFileProtocol,
  setIsFileProtocol,
  workspaceClientId,
  setWorkspaceClientId
 };
}
