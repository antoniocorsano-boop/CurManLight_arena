import { useEffect, useState } from 'react';
import { getStorageUsage } from '../lib/storage';
import { useToast } from '../components/ui';

export function useStorageMaintenance() {
  const [usage, setUsage] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const check = () => {
      const { bytes, overThreshold } = getStorageUsage();
      setUsage(bytes);
      setIsWarning(overThreshold);
      if (overThreshold) {
        toast.warning('Spazio di archiviazione quasi esaurito');
      }
    };

    check();

    const interval = setInterval(check, 60000);

    const handleQuota = () => {
      toast.error('Errore di archiviazione: spazio insufficiente');
      setIsWarning(true);
    };

    window.addEventListener('curman:storage-quota', handleQuota);

    return () => {
      clearInterval(interval);
      window.removeEventListener('curman:storage-quota', handleQuota);
    };
  }, [toast]);

  return { usage, isWarning };
}
