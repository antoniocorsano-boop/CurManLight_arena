import { useState } from 'react';

export const useToast = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSuccess, setToastSuccess] = useState(true);

  const showToast = (msg: string, success = true) => {
    setToastMessage(msg);
    setToastSuccess(success);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return {
    toastMessage,
    toastSuccess,
    showToast
  };
};
