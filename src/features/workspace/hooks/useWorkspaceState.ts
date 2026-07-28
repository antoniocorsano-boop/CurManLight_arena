import { useState } from 'react';
import { safeLocalStorageGetItem } from '../../../lib/consolidatedStorage';

export function useWorkspaceState() {
 const [cloudAccountType, setCloudAccountType] = useState<'scolastica' | 'personale'>(() => {
  return safeLocalStorageGetItem('curman_cloudAccountType', 'personale') as 'scolastica' | 'personale';
 });
 const [showCloudAccountModal, setShowCloudAccountModal] = useState(false);
 const [personalUserEmail, setPersonalUserEmail] = useState(() => safeLocalStorageGetItem('curman_personalUserEmail', ''));
 const [isWorkspaceLoggedIn, setIsWorkspaceLoggedIn] = useState(() => safeLocalStorageGetItem('curman_isWorkspaceLoggedIn', 'false') === 'true');
 const [workspaceUserEmail, setWorkspaceUserEmail] = useState(() => safeLocalStorageGetItem('curman_workspaceUserEmail', ''));
 const [isSyncingWorkspace, setIsSyncingWorkspace] = useState(false);
 const [workspaceAccessToken, setWorkspaceAccessToken] = useState(() => safeLocalStorageGetItem('curman_workspaceAccessToken', ''));
 const [workspaceTokenExpiry, setWorkspaceTokenExpiry] = useState(() => {
  return Number(safeLocalStorageGetItem('curman_workspaceTokenExpiry', '0'));
 });
 const [isWorkspaceSyncLocked, setIsWorkspaceSyncLocked] = useState(false);
 const [isFileProtocol, setIsFileProtocol] = useState(false);
 const [workspaceClientId, setWorkspaceClientId] = useState(() => {
   return safeLocalStorageGetItem('curman_workspaceClientId', import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '');
 });

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
