import { useCallback } from 'react';
import { useCurriculumStore } from '../../../store/useCurriculumStore';
import { getA07InstitutionalDocumentRead } from '../../../domain/institution';
import {
  produceCanonicalDocumentFromUda,
  type DocumentProductionResult,
} from '../services/documentProduction';

export type CreateDocumentFromUdaResult =
  | { status: 'uda-not-found' }
  | DocumentProductionResult;

export function useDocumentProduction() {
  const documentArchive = useCurriculumStore((s) => s.documentArchive);
  const replaceDocumentArchive = useCurriculumStore((s) => s.replaceDocumentArchive);
  const savedUda = useCurriculumStore((s) => s.savedUda);
  const institutionalArchive = useCurriculumStore((s) => s.institutionalArchive);

  const createDocumentFromUda = useCallback(
    (udaId: string): CreateDocumentFromUdaResult => {
      const uda = savedUda.find((u) => u.id === udaId);
      if (!uda) {
        return { status: 'uda-not-found' };
      }

      const institutionalRead = getA07InstitutionalDocumentRead(institutionalArchive);
      const result = produceCanonicalDocumentFromUda(uda, institutionalRead, documentArchive);

      if (result.status === 'created') {
        replaceDocumentArchive(result.archive);
      }

      return result;
    },
    [savedUda, institutionalArchive, documentArchive, replaceDocumentArchive],
  );

  return { createDocumentFromUda, documentArchive };
}
