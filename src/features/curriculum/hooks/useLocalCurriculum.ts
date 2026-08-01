import { useState } from 'react';
import { getCurriculumBaseline } from '../../../lib';

export function useLocalCurriculum() {
  const [localCurriculum, setLocalCurriculum] = useState(() => {
    const saved = localStorage.getItem('curmanlight-custom-curriculum-v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Errore di parse del curricolo salvato, uso baseline:', e);
      }
    }
    return getCurriculumBaseline();
  });

  return {
    localCurriculum,
    setLocalCurriculum
  };
}
