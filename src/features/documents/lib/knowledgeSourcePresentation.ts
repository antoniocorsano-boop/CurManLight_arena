import type { CustomKbDoc } from './localKnowledgeStore';

export type KnowledgeSourcePresentation = {
  label: 'Fonte locale da verificare' | 'Fonte locale verificata';
  explanation: string;
  verificationAvailable: boolean;
  institutionalAuthority: false;
  verifiedAt?: string;
};

export function deriveKnowledgeSourcePresentation(source: Pick<CustomKbDoc, 'authorityStatus' | 'verifiedAt'>): KnowledgeSourcePresentation {
  if (source.authorityStatus === 'LOCAL_VERIFIED') {
    return {
      label: 'Fonte locale verificata',
      explanation: 'Hai verificato localmente questa fonte. Resta distinta dalle fonti normative o istituzionali e non modifica il curricolo approvato.',
      verificationAvailable: false,
      institutionalAuthority: false,
      verifiedAt: source.verifiedAt,
    };
  }

  return {
    label: 'Fonte locale da verificare',
    explanation: 'Il materiale è disponibile localmente ma richiede il tuo controllo prima di essere usato come base per una decisione.',
    verificationAvailable: true,
    institutionalAuthority: false,
  };
}
