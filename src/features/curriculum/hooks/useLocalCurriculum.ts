import { useState } from 'react';
import { curriculumKB } from '../../../data/curriculumKB';

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
  return curriculumKB;
 });

 return {
  localCurriculum,
  setLocalCurriculum
 };
}
