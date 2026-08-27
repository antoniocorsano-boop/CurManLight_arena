import {
  detectPrimaryTechnicalLeak,
  projectHcmTerm,
  type HcmContext,
  type HcmRoleTone,
  type HcmTermSpec,
} from '../../../domain/human-communication';
import type { UserRole } from '../../../types/curriculum';

export interface HomeTechnicalDetail {
  label: string;
  value: string;
}

export interface HomeRoleCommunication {
  eyebrow: string;
  title: string;
  summary: string;
  detailSummary: string;
  details: HomeTechnicalDetail[];
}

const ROLE_TONES: Record<UserRole, HcmRoleTone> = {
  'non-dichiarato': 'plain',
  insegnante: 'operational',
  dipartimento: 'facilitative',
  referente: 'facilitative',
  dirigente: 'formal',
  collegio: 'formal',
  amministratore: 'technical',
};

const ROLE_EYEBROW: HcmTermSpec = {
  id: 'home.role.eyebrow',
  human: 'Area di lavoro',
  roleVariants: {
    insegnante: 'Il tuo lavoro',
    dipartimento: 'Lavoro del dipartimento',
    referente: 'Coordinamento',
    dirigente: 'Quadro di controllo',
    collegio: 'Lavoro collegiale',
    amministratore: 'Gestione locale',
  },
};

const ROLE_TITLE: HcmTermSpec = {
  id: 'home.role.title',
  human: 'Scegli il tuo contesto di lavoro',
  roleVariants: {
    insegnante: 'Riprendi la progettazione',
    dipartimento: 'Confronta il lavoro del dipartimento',
    referente: 'Raccogli il lavoro dei dipartimenti',
    dirigente: 'Controlli e materiali da seguire',
    collegio: 'Materiali per il lavoro collegiale',
    amministratore: 'Dati, aggiornamenti e copie',
  },
};

const TECHNICAL_TERMS = {
  accessibility: { id: 'home.tech.accessibility', human: 'Accessibilità digitale', technical: 'WCAG / AgID' },
  privacy: { id: 'home.tech.privacy', human: 'Protezione dei dati', technical: 'GDPR' },
  exchange: { id: 'home.tech.exchange', human: 'Formato di scambio', technical: '.cml' },
  storage: { id: 'home.tech.storage', human: 'Dati salvati nel browser', technical: 'IndexedDB / Dexie.js' },
  offline: { id: 'home.tech.offline', human: 'Aggiornamenti e uso offline', technical: 'Service Worker / cache PWA' },
  backup: { id: 'home.tech.backup', human: 'Formato delle copie', technical: 'JSON' },
} satisfies Record<string, HcmTermSpec>;

function context(role: UserRole, detailLevel: HcmContext['detailLevel']): HcmContext {
  return {
    roleId: role,
    roleTone: ROLE_TONES[role],
    phase: 'ORIENT',
    detailLevel,
    consequence: 'NONE',
    authority: { state: 'NOT_REQUIRED', source: 'NONE' },
  };
}

function project(spec: HcmTermSpec, role: UserRole, detailLevel: HcmContext['detailLevel'] = 'PRIMARY'): string {
  return projectHcmTerm(spec, context(role, detailLevel)).text;
}

function technicalDetail(spec: HcmTermSpec, role: UserRole, value: string): HomeTechnicalDetail {
  return {
    label: project(spec, role, 'TECHNICAL'),
    value,
  };
}

export function getHomeRoleCommunication(role: UserRole): HomeRoleCommunication {
  const base = {
    eyebrow: project(ROLE_EYEBROW, role),
    title: project(ROLE_TITLE, role),
    detailSummary: 'Dettagli tecnici',
  };

  switch (role) {
    case 'insegnante':
      return {
        ...base,
        summary: 'Consulta il curricolo, prepara le UDA e riprendi il lavoro didattico dal punto in cui lo hai lasciato.',
        details: [],
      };
    case 'dipartimento':
      return {
        ...base,
        summary: 'Confronta le proposte e prepara una sintesi di lavoro. Le scelte registrate qui restano preparatorie e non producono effetti istituzionali.',
        details: [technicalDetail(TECHNICAL_TERMS.exchange, role, 'Usato solo per trasferire una copia del lavoro.')],
      };
    case 'referente':
      return {
        ...base,
        summary: 'Raccogli e confronta i contributi ricevuti. Il quadro complessivo si forma solo dai dati effettivamente importati.',
        details: [technicalDetail(TECHNICAL_TERMS.exchange, role, 'Formato locale usato per importare i contributi.')],
      };
    case 'dirigente':
      return {
        ...base,
        summary: 'Consulta le fonti e prepara le verifiche che richiedono conferma esterna. Questa Home non certifica conformità.',
        details: [
          technicalDetail(TECHNICAL_TERMS.accessibility, role, 'Verifica non disponibile in questa vista.'),
          technicalDetail(TECHNICAL_TERMS.privacy, role, 'Verifica non disponibile in questa vista.'),
        ],
      };
    case 'collegio':
      return {
        ...base,
        summary: 'Consulta le fonti e prepara il lavoro collegiale. Gli effetti istituzionali restano nel percorso autenticato di decisione.',
        details: [
          technicalDetail(TECHNICAL_TERMS.accessibility, role, 'Verifica non disponibile in questa vista.'),
          technicalDetail(TECHNICAL_TERMS.privacy, role, 'Verifica non disponibile in questa vista.'),
        ],
      };
    case 'amministratore':
      return {
        ...base,
        summary: 'Controlla come il browser conserva i dati e gestisci le copie locali. Le verifiche tecniche restano separate dallo stato di lavoro.',
        details: [
          technicalDetail(TECHNICAL_TERMS.storage, role, 'Stato da verificare nel browser corrente.'),
          technicalDetail(TECHNICAL_TERMS.offline, role, 'Stato da verificare nel browser corrente.'),
          technicalDetail(TECHNICAL_TERMS.backup, role, 'Formato tecnico delle copie locali.'),
        ],
      };
    case 'non-dichiarato':
      return {
        ...base,
        summary: 'Il ruolo serve a organizzare linguaggio e strumenti. Non attribuisce autorità istituzionale.',
        details: [],
      };
  }
}

const PRIMARY_HOME_TECHNICAL_PATTERNS: ReadonlyArray<{ label: string; pattern: RegExp }> = [
  { label: 'WCAG/AgID', pattern: /\b(?:WCAG|AgID)\b/i },
  { label: 'GDPR', pattern: /\bGDPR\b/i },
  { label: 'storage implementation', pattern: /\b(?:IndexedDB|Dexie(?:\.js)?)\b/i },
  { label: 'offline implementation', pattern: /\b(?:PWA|Service Worker|cache SW)\b/i },
  { label: 'file format', pattern: /(?:\.cml\b|\bJSON\b|\bCSV\b)/i },
  { label: 'process jargon', pattern: /\b(?:Merger|Wizard)\b/i },
];

const PRIMARY_HOME_AUTHORITY_SIMULATION = /\b(?:voto|voti|consenso|consensi|approvazione|approvazioni)\b/i;

export function auditHomePrimaryCommunication(role: UserRole): string[] {
  const communication = getHomeRoleCommunication(role);
  const primaryText = [communication.eyebrow, communication.title, communication.summary].join(' ');
  const errors = detectPrimaryTechnicalLeak(primaryText).map((item) => `technical leak: ${item}`);

  for (const item of PRIMARY_HOME_TECHNICAL_PATTERNS) {
    if (item.pattern.test(primaryText)) errors.push(`technical leak: ${item.label}`);
  }

  if (PRIMARY_HOME_AUTHORITY_SIMULATION.test(primaryText)) {
    errors.push('authority simulation language in primary Home communication');
  }

  return errors;
}
