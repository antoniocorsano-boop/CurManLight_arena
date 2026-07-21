import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { SchoolOrder, UserRole } from '../../../types/curriculum';
import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../../../lib/consolidatedStorage';

interface UseAppStartupEffectsArgs {
 role: UserRole;
 discipline: string;
 order: SchoolOrder;
 assignedCombinations: string[];
 setIsDatabaseVolatile: (value: boolean) => void;
 setProgettazioneMode: Dispatch<SetStateAction<'grid' | 'wizard'>>;
 setIsFileProtocol: (value: boolean) => void;
 setWorkspaceAccessToken: (value: string) => void;
 setWorkspaceTokenExpiry: (value: number) => void;
 setIsWorkspaceLoggedIn: (value: boolean) => void;
 setWorkspaceUserEmail: (value: string) => void;
 setCloudAccountType: (value: 'scolastica' | 'personale') => void;
 setOnboardingRoleLocal: (value: UserRole) => void;
 setOnboardingDiscLocal: (value: string) => void;
 setOnboardingOrdLocal: (value: SchoolOrder) => void;
 setShowOnboardingModal: (value: boolean) => void;
 showToast: (msg: string, success?: boolean) => void;
 handleWorkspaceAutoPull: (token: string) => void;
}

export function useAppStartupEffects({
 role,
 discipline,
 order,
 assignedCombinations,
 setIsDatabaseVolatile,
 setProgettazioneMode,
 setIsFileProtocol,
 setWorkspaceAccessToken,
 setWorkspaceTokenExpiry,
 setIsWorkspaceLoggedIn,
 setWorkspaceUserEmail,
 setCloudAccountType,
 setOnboardingRoleLocal,
 setOnboardingDiscLocal,
 setOnboardingOrdLocal,
 setShowOnboardingModal,
 showToast,
 handleWorkspaceAutoPull
}: UseAppStartupEffectsArgs) {
 useEffect(() => {
  try {
   if (!window.indexedDB) {
    setIsDatabaseVolatile(true);
   } else {
    const testReq = window.indexedDB.open('CurManLightDB_Test_Volume_Check', 1);
    testReq.onerror = () => setIsDatabaseVolatile(true);
   }
  } catch (e) {
   setIsDatabaseVolatile(true);
  }

  if (typeof window !== 'undefined' && window.innerWidth < 1280) {
   setProgettazioneMode('wizard');
  }

  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
   setIsFileProtocol(true);
  }

  if (navigator.storage && navigator.storage.persist) {
   navigator.storage.persisted().then((persisted) => {
    if (!persisted) {
     navigator.storage.persist().then((granted) => {
      if (granted) {
       console.log("[CurManLight Storage Guard] Memoria persistente d'Istituto concessa dal browser!");
      } else {
       console.warn('[CurManLight Storage Guard] Memoria persistente rifiutata o non supportata dal browser.');
      }
     });
    }
   });
  }

  if (window.location.hash) {
   try {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get('access_token');
    if (token) {
     setWorkspaceAccessToken(token);
     safeLocalStorageSetItem('curman_workspaceAccessToken', token);

     const expiresIn = Number(params.get('expires_in')) || 3600;
     const expiryTime = Date.now() + expiresIn * 1000;
     setWorkspaceTokenExpiry(expiryTime);
     safeLocalStorageSetItem('curman_workspaceTokenExpiry', String(expiryTime));

     setIsWorkspaceLoggedIn(true);
     safeLocalStorageSetItem('curman_isWorkspaceLoggedIn', 'true');

     fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
     })
      .then((r) => r.json())
      .then((data) => {
       if (data.email) {
        setWorkspaceUserEmail(data.email);
        safeLocalStorageSetItem('curman_workspaceUserEmail', data.email);

        const emailLower = data.email.toLowerCase();
        const isScolastica = emailLower.endsWith('@icdonmilani.edu.it') || emailLower.endsWith('.edu.it') || emailLower.includes('donmilani');
        const updatedType = isScolastica ? 'scolastica' : 'personale';
        setCloudAccountType(updatedType);
        safeLocalStorageSetItem('curman_cloudAccountType', updatedType);

        showToast(`Connesso a Google Drive (${isScolastica ? 'Scolastico' : 'Personale'}): ${data.email}`, true);
        handleWorkspaceAutoPull(token);
       }
      })
      .catch(() => {
       showToast("Connesso a Google Workspace d'Istituto!", true);
       handleWorkspaceAutoPull(token);
      });

     window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
   } catch (err) {
    console.error('Errore nel parsing del token Google:', err);
   }
  }

  const isNew = !safeLocalStorageGetItem('curmanlight-react-db-state-v1.4.0', '');
  if (isNew) {
   setTimeout(() => {
    setOnboardingRoleLocal(role);
    setOnboardingDiscLocal(discipline);
    setOnboardingOrdLocal(order);
    setShowOnboardingModal(true);
   }, 1000);
  }

  try {
   const allKeys = Object.keys(localStorage);
   const targets = [
    'curman_shuffledStudentMap_',
    'curman_exclusionsList_',
    'curman_cooperativeGroups_'
   ];
   allKeys.forEach((key) => {
    const matchedPrefix = targets.find((prefix) => key.startsWith(prefix));
    if (matchedPrefix) {
     const classComboInKey = key.replace(matchedPrefix, '');
     if (!assignedCombinations.includes(classComboInKey)) {
      localStorage.removeItem(key);
      console.log(`[OIV Garbage Collector] Rimossa chiave orfana obsoleta: ${key}`);
     }
    }
   });
  } catch (e) {
   console.warn('[OIV Garbage Collector] Errore di pulizia:', e);
  }
 }, []);
}
