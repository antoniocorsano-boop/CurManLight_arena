import { describe, expect, it } from 'vitest';
import { generateWikiResponse, type WikiResponseParams } from '../lib/wikiLLM';

const sourceModules = import.meta.glob('../**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Exact legacy-source exceptions only: volumesKB is an immutable historical archive;
// curriculumKB is the CML-633C authoritative legacy curriculum and cannot be edited.
// Active consumers must still label both sources as legacy/archive and non-verified.
const exactFileAllowlist = new Set([
  'data/volumesKB.ts',
  'data/curriculumKB.ts',
]);

const excludedPathSegments = ['/__tests__/', '/ui/stories/'];

const forbiddenPatterns: Array<[label: string, pattern: RegExp]> = [
  ['previous institute name', /(?:Istituto Comprensivo|I\.?C\.?)\s+(?:Calvario[- ]Covotta\s+)?["“”']?don\s+Lorenzo\s+Milani|I\.?C\.?\s+don\s+Milani/i],
  ['previous institute code', /AVIC849003/i],
  ['previous identity address', /(?:Via|Rione)\s+(?:Calvario|Covotta|Marconi)|Via\s+Calvario[^\n]*Ariano\s+Irpino/i],
  ['previous named principal', /(?:Prof\.?ssa\s+)?M(?:aria|\.)\s+Letizia/i],
  ['previous institutional email or domain', /icdonmilani|curmanlight-donmilani/i],
  ['previous fixed backup filename', /(?:CopiaSicurezza|Copia_Sicurezza)[^\n'"`]*Milani|Milani[^\n'"`]*\.json/i],
  ['previous presumed local context', /(?:Plesso\s+(?:Greci|Calvario)|Sede\s+Covotta|Greci\s*\/\s*Covotta|Novecento\s+ad\s+Ariano\s+Irpino)/i],
  ['previous institutional signature', /Firma\s+(?:autografa|omessa)|VALIDATO\s+ED\s+APPROVATO|MOCK_SIGNATURE/i],
  ['obsolete static academic year', /2025-2026/],
  ['previous fake user email', /docente@gmail\.com/i],
  ['assumed classroom coordinator', /Il\s+Docente\s+Coordinatore/i],
  ['fabricated classroom person', /(?:Mario\s+Rossi|Luca\s+Bianchi|Sofia\s+Romano|Enzo\s+Ferrari|Maria\s+Montessori|Rita\s+Levi)/i],
  ['fabricated classroom diagnosis', /(?:Disabilità\s+Relazionale|Disgrafia\s+Lieve|Dislessia|Disabilità\s+Motoria)/i],
  ['false classroom import success', /(?:importato\s+da\s+Google\s+Classroom|Bypass\s+completato:\s+Registro\s+Studenti)/i],
  ['false encrypted local persistence claim', /AES-GCM|encrypted\s+(?:sync|storage|backup)|Cifrato\s+in\s+DB|Allineamento\s+centrale\s+cifrat|cifrat[oa]\s+(?:localmente|AES)|(?:dati|registro)[^\n]{0,80}(?:vengono|(?<!non\s)sono)\s+cifrat/i],
  ['false SCORM publication success', /SCORM[^\n]{0,60}pubblicat[ao]/i],
  ['false student import success', /Anagrafica\s+alunni[^\n]{0,60}importat[ao]|studenti[^\n]{0,60}importat[io]\s+con\s+successo/i],
  ['false active security or compliance claim', /Attivo\s+e\s+Cifrato|Cache\s+SW[^\n]{0,40}Attiva\s+e\s+protetta|Conforme\s*\(WCAG|GDPR[^\n]{0,40}Conforme|in\s+conformità\s+al\s+GDPR|(?:Drive|OneDrive)[^\n]{0,80}(?:sicuro|protett)|memoria\s+locale\s+protetta/i],
  ['fake anonymous AI interrogation claim', /Interrogazione\s+completata\s+in\s+modo\s+anonimo|Interroga\s+I\.A\.\s+per\s+Adattamento/i],
  ['invented dashboard metric', /46\s*\/\s*46|94\.5%|8\s*\/\s*8\s+Assi/i],
  ['teacher role default', /role:\s*['"]insegnante['"]|useState<UserRole>\(['"]insegnante['"]\)/i],
  ['default classroom assignment fixture', /(?:assignedClasses|onboardingAssignedClasses)[^\n]*\[['"]1['"],\s*['"]2['"]\]|(?:assignedCombinations|onboardingCombinations)[^\n]*\[['"]1\^A['"],\s*['"]2\^A['"]/i],
  ['default curriculum selection fixture', /selected(?:Traguardi|Obiettivi):\s*\[0,\s*1\]|selectedEvidenze:\s*\[\s*["']/i],
  ['synthesized social metric fallback', /selfEvaluation\s*\|\|\s*4|studentOutcomes\?\.(?:avanzato|intermedio|base|iniziale)\s*\|\|\s*(?:50|30|15|5)|reusedCount\s*\|\|\s*5/i],
  ['unverified institutional social approval', /Approvato\s+d['’]Istituto/i],
  ['default class assignment', /selectedClassCombination[^\n]{0,80}useState\(['"]1\^A['"]\)|useState\(['"]1\^A['"]\)/i],
  ['unverified Wiki institutional authority', /In\s+conformità\s+alle\s+disposizioni\s+organizzative\s+caricate|dati\s+curricolari\s+d['’]istituto\s+solidi\s+ed\s+oggettivi|Agenti\s+di\s+conformità\s+verificano|allineamento\s+verticale\s+d['’]istituto\s+assicura|CurManLight\s+garantisce/i],
  ['SecondBrain authority claim', /garantisce\s+l['’]assenza\s+di\s+errori|garantendo\s+l['’]allineamento|autorità\s+decisionale\s+ultima|convalidando\s+formalmente|Validazione\s+Collegiale\s+Finale|dizionario\s+pedagogico\s+ufficiale|Glossario\s+ufficiale/i],
  ['Copilot invented institutional rule', /priorità[^\n]{0,80}triennali|almeno\s+il\s+15%|obbligatorie\s+da\s+settembre\s+2026|protocollo\s+d['’]Istituto|Dall['’]esame\s+del\s+Curricolo\s+d['’]Istituto|forma\s+protetta\s+d['’]Istituto|Misure\s+d['’]Istituto|incrementati\s+del\s+30%/i],
  ['seeded outcome metric', /selfEvaluationStars[^\n]*useState\(5\)|outcomesAvanzato[^\n]*useState\(50\)|outcomesIntermedio[^\n]*useState\(35\)|outcomesBase[^\n]*useState\(10\)|outcomesIniziale[^\n]*useState\(5\)/i],
  ['formal authority assigned to local decisions', /Verifica\s+formale\s+e\s+validazione|discipline\s+deliberate|approva\s+con\s+delibera\s+formale|Approvazione\s+formale|Delibera\s+Finale|Approvata\s+IN\s+2025|adotta\s+la\s+proposta\s+formale\s+deliberata/i],
  ['false classroom security authority', /Themed\/Cifrato|Regolamento\s+d['’]Istituto\s*\(GDPR\)|tutele\s+d['’]Istituto|scansionando\s+i\s+460\s+elementi|piano\s+d['’]Istituto|bacheca\s+d['’]Istituto/i],
  ['send-ready AgID authority action', /pronto\s+per\s+essere\s+inviato\s+telematicamente|Scarica\s+Dichiarazione/i],
  ['remaining SecondBrain authority badge', /fonte\s+certa|agenti\s+di\s+convalida|Raccordo\s+Certificato|Risposta\s+Certificata/i],
  ['fake SecondBrain Drive operation', /drive-doc-[12]|Sincronizzazione\s+completata:\s+2\s+documenti|documenti\s+d['’]Istituto\s+estratti\s+ed\s+indicizzati/i],
  ['architecture authority claim', /memoria\s+locale\s+sicura\s+d['’]Istituto|livelli\s+di\s+autorizzazione\s+della\s+governance|Conformità\s+PA\s+e\s+AgID|atto\s+formale\s+di\s+approvazione|zero\s+allucinazioni/i],
  ['mandatory local revision choice', /decisioni\s+espresse\s+diventeranno\s+obbligatorie|Layout\s+di\s+Votazione\s+d['’]Istituto/i],
  ['formal certification claim', /ha\s+superato\s+i\s+controlli\s+di\s+allineamento|validare\s+formalmente\s+la\s+proposta/i],
  ['institutional hours compliance claim', /Conforme\s+alle\s+quote\s+minime\s+d['’]autonomia\s+d['’]Istituto/i],
  ['institutional onboarding assignment copy', /Tipologia\s+di\s+Cattedra\s+d['’]Istituto|Gestione\s+Sezioni\s+d['’]Istituto|Sezioni\s+Attive\s+d['’]Istituto|combinazioni\s+Classe-Sezione[^\n]{0,40}d['’]Istituto/i],
  ['inferred or privileged account identity', /isScolastica|endsWith\(['"]\.edu\.it['"]\)|Connesso\s+a\s+Google\s+Workspace\s+d['’]Istituto|Accesso\s+Locale\s+Privilegiato|Google\s+Workspace\s+d['’]Istituto|Token\s+d['’]Istituto|Sincronizzazione\s+Cloud\s+d['’]Istituto|connessione\s+di\s+sicurezza\s+d['’]Istituto/i],
  ['guaranteed native or maximum-privacy save', /massima\s+privacy|eseguirà\s+comunque\s+il\s+salvataggio|File\s+inviato\s+all['’]applicazione\s+Google\s+Drive/i],
  ['guaranteed anonymization or GDPR filter', /forma\s+interamente\s+anonima|filtro\s+GDPR\s+applicato/i],
  ['certified PA navigation label', /Certificazione\s+PA(?:\s*\(AgID\))?/i],
  ['departmental approval UI wording', /stato\s+delle\s+delibere\s+dei\s+dipartimenti|Adeguamenti\s+e\s+voti\s+dipartimentali|voteStr\s*=\s*["']Da\s+Votare|voteStr\s*=\s*["']Approvato\s+2025|Vota\s+.*Accetta\s+2025|f\s*===\s*['"]approved['"]\s*\?\s*['"]Approvati|schede[^\n]{0,80}deliberate/i],
  ['institutional authority guide wording', /dipartimenti[^\n]{0,80}deliberare|voto\s+collegiale|direttive\s+del\s+CAD\s+per\s+la\s+PA|coerenza\s+automatica\s+d['’]Istituto/i],
  ['certification matrix authority wording', /MATRICE\s+DELLE\s+COMPETENZE[^\n]{0,30}D['’]ISTITUTO|Raccordo\s+attivo|allegato\s+PTOF|Matrice\s+di\s+Correlazione[^\n]{0,50}d['’]Istituto|Esporta\s+Matrice\s+PTOF|Audit\s+Semantico\s+d['’]Istituto|Raccomandazione\s+dell['’]Agente\s+Pedagogico/i],
  ['unverified curriculum map label', /Discipline\s+attive\s+d['’]Istituto|Mappa\s+Validata|Traguardi(?:\s+di\s+Competenza)?\s+d['’]Istituto/i],
  ['false protected SecondBrain inspection', /dipendenze\s+in\s+modo\s+protetto/i],
  ['institutional assistant/setup assumption', /Co-pilota(?:\s+IA)?\s+d['’]Istituto|Connettore\s+LLM[^\n]{0,40}d['’]Istituto|Server\s+d['’]Istituto|Hardware\s+d['’]Istituto|modello\s+gratuito\s+d['’]Istituto/i],
  ['institutional import/generation claim', /contesti\s+scolastici\s+reali\s+d['’]Istituto|Generazione\s+completata\s+dal\s+Co-pilota\s+d['’]Istituto|elementi\s+curricolari\s+d['’]Istituto|Curricolo\s+d['’]Istituto\s+ripristinato/i],
  ['secure memory label', /Memoria\s+Sicura/i],
  ['unverified DM or institute-wide UDA claim', /giudizi[^\n]{0,60}conformi\s+al\s+D\.M\.|UDA\s+pi[uù]\s+utilizzate\s+dell['’]Istituto/i],
  ['current authority assigned to archived volume', /curricolo\s+fondativo\s+dell['’]Istituto|Mappatura\s+completa[^\n]{0,60}discipline\s+dell['’]Istituto|category:\s*['"]Fonte\s+normativa['"]/i],
  ['invented glossary institution source', /D\.M\.\s*(?:221\/2025|183\/2024)\s+d['’]Istituto|assicura\s+la\s+coerenza\s+formativa\s+tra\s+i\s+plessi/i],
  ['institutional microphone copy', /dispositivo\s+mobile\s+d['’]aula|dettatura\s+vocale\s+d['’]Istituto/i],
  ['anonymization guarantee label', /anagrafica\s+tematica\s+d['’]anonimato/i],
  ['AgID print-alignment claim', /layout\s+di\s+stampa[^\n]{0,80}linee\s+guida\s+AgID/i],
];

describe('CML-633D active institutional hardcode regression', () => {
  it('contains no previous presumed institutional identity or static defaults', () => {
    const violations = Object.entries(sourceModules).flatMap(([file, source]) => {
      if (file.startsWith('./')) return [];
      const sourceRelative = file.replace(/^\.\.\//, '').replace(/\\/g, '/');
      if (excludedPathSegments.some(segment => `/${sourceRelative}`.includes(segment))) return [];
      if (exactFileAllowlist.has(sourceRelative)) return [];
      return source.split(/\r?\n/).flatMap((line, index) =>
        forbiddenPatterns
          .filter(([, pattern]) => pattern.test(line))
          .map(([label]) => `${sourceRelative}:${index + 1} [${label}] ${line.trim()}`),
      );
    });

    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('keeps the allowlist narrow and explicitly classified', () => {
    expect([...exactFileAllowlist]).toEqual([
      'data/volumesKB.ts',
      'data/curriculumKB.ts',
    ]);
  });

  it('keeps personal onboarding isolated from the canonical institutional archive', () => {
    const onboardingSource = sourceModules['../features/session/hooks/useOnboardingProfile.ts'];
    expect(onboardingSource).not.toMatch(/replaceInstitutionalArchive|setInstitutionalContext|setActiveInstitute/);
  });

  it('keeps curriculum generation, import, and reset isolated from the canonical archive', () => {
    const importSource = sourceModules['../features/curriculum/hooks/useCurriculumImportHandlers.ts'];
    expect(importSource).not.toMatch(/replaceInstitutionalArchive|setInstitutionalContext|setActiveInstitute|institutionalArchive/);
  });

  it('labels active legacy curriculum and volume consumers without promoting source authority', () => {
    const curriculumSource = sourceModules['../features/curriculum/components/CurriculumTab.tsx'];
    const companionSource = sourceModules['../features/progettazione/hooks/useKnowledgeCompanion.ts'];
    const glossarySource = sourceModules['../features/documents/hooks/useWikiGlossaryHandlers.ts'];
    expect(curriculumSource).toMatch(/legacy\s+CML-633C[^\n]*non verificat/i);
    expect(companionSource).toMatch(/archivio storico[^\n]*non verificat/i);
    expect(companionSource).not.toMatch(/category:\s*['"]Fonte normativa['"]/i);
    expect(glossarySource).toMatch(/fonte locale generata[^\n]*non verificat/i);
  });

  it('contains no unconditional institute assumption in the targeted unconfigured UI surfaces', () => {
    const targetFiles = [
      '../features/classroom/components/ClasseTab.tsx',
      '../features/curriculum/components/CurriculumTab.tsx',
      '../features/documents/components/KnowledgeModals.tsx',
      '../features/documents/components/SecondBrainTab.tsx',
      '../features/progettazione/components/ProgettazioneTab.tsx',
      '../features/progettazione/components/UdaModals.tsx',
      '../features/session/components/DashboardView.tsx',
      '../features/session/components/InfoViews.tsx',
    ];
    const violations = targetFiles.flatMap(file =>
      sourceModules[file].split(/\r?\n/).flatMap((line, index) =>
        /d['’]Istituto/i.test(line) ? [`${file.replace(/^\.\.\//, '')}:${index + 1} ${line.trim()}`] : [],
      ),
    );
    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('contains no unconditional institutional phrase in raw active implementation source', () => {
    const violations = Object.entries(sourceModules).flatMap(([file, source]) => {
      if (file.startsWith('./')) return [];
      const sourceRelative = file.replace(/^\.\.\//, '').replace(/\\/g, '/');
      if (excludedPathSegments.some(segment => `/${sourceRelative}`.includes(segment))) return [];
      if (exactFileAllowlist.has(sourceRelative)) return [];
      if (/^(?:domain\/|types\/)|\/(?:domain|types)\/|Contracts\.ts$|contracts\.ts$/.test(sourceRelative)) return [];
      return source.split(/\r?\n/).flatMap((line, index) => {
        if (!/d(?:ell)?['’]Istituto/i.test(line)) return [];
        if (/^\s*(?:\/\/|\/\*|\*|\*\/|\{\s*\/\*)/.test(line)) return [];
        if (sourceRelative === 'features/session/components/InstitutionConfigPanel.tsx') return [];
        if (/(?:non configura|non assegna|non verifica)[^\n]*d(?:ell)?['’]Istituto/i.test(line)) return [];
        if (/\.configured\s*\?|configur(?:ed|ato)[^?]*\?/i.test(line)) return [];
        return [`${sourceRelative}:${index + 1} ${line.trim()}`];
      });
    });
    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('generates neutral personal guidance when no knowledge source matches', () => {
    const params: WikiResponseParams = {
      query: 'richiesta senza corrispondenze',
      discipline: 'italiano',
      order: 'primaria',
      customDocs: [],
      volumes: [],
      getVolumeTitle: id => id,
    };

    const response = generateWikiResponse(params);

    expect(response).toContain('progettazione personale');
    expect(response).not.toMatch(/codice meccanografico|AVIC849003|autorità|ufficiale/i);
  });

  it('labels matches from the named-volume archive as historical rather than active authority', () => {
    const response = generateWikiResponse({
      query: 'archivio identità storica',
      discipline: 'storia',
      order: 'secondaria',
      customDocs: [],
      volumes: [{ id: 'vol-archivio', title: 'Volume storico', text: 'archivio identità storica di una scuola precedente' }],
      getVolumeTitle: () => 'Volume storico',
    });

    expect(response).toContain('fonte storica archiviata');
    expect(response).not.toMatch(/autorità attiva|disposizioni vigenti/i);
  });

  it.each([
    ['volume 14', 'Volume 14'],
    ['volume 19', 'Volume 19'],
  ])('labels the %s canned answer as a historical source', (query, volume) => {
    const response = generateWikiResponse({
      query,
      discipline: 'italiano',
      order: 'primaria',
      customDocs: [],
      volumes: [],
      getVolumeTitle: id => id,
    });

    expect(response).toContain(`Fonte storica archiviata: ${volume}`);
    expect(response).not.toMatch(/si attesta|linee d.indirizzo.*istituto/i);
  });

  it('preserves the Volume 14 sensitive-minor-data safeguard as historical guidance', () => {
    const response = generateWikiResponse({
      query: 'volume 14', discipline: 'italiano', order: 'primaria', customDocs: [], volumes: [], getVolumeTitle: id => id,
    });

    expect(response).toContain('Fonte storica archiviata: Volume 14');
    expect(response).toMatch(/Art(?:icolo|\.)\s*9/i);
    expect(response).toMatch(/dati sensibili.*minori/i);
    expect(response).not.toMatch(/policy attiva|autorità attiva/i);
  });

  it('keeps the archived Green Cross Corner project out of generic science guidance', () => {
    const generic = generateWikiResponse({
      query: 'scienze e metodo sperimentale', discipline: 'scienze', order: 'primaria', customDocs: [], volumes: [], getVolumeTitle: id => id,
    });
    const historical = generateWikiResponse({
      query: 'Green Cross Corner', discipline: 'scienze', order: 'primaria', customDocs: [], volumes: [], getVolumeTitle: id => id,
    });

    expect(generic).toContain('contesto locale');
    expect(generic).not.toContain('Green Cross Corner');
    expect(historical).toContain('Fonte storica archiviata');
    expect(historical).toContain('Green Cross Corner');
    expect(historical).not.toMatch(/progetto attivo|iniziativa corrente/i);
  });

  it('treats uploaded and canned Wiki guidance as local non-verified source material', () => {
    const base = { discipline: 'italiano', order: 'primaria' as const, volumes: [], getVolumeTitle: (id: string) => id };
    const uploaded = generateWikiResponse({
      ...base, query: 'Documento locale', customDocs: [{ id: 'doc', title: 'Documento locale', subtitle: 'Fonte caricata', content: 'Indicazione locale' }],
    });
    const certification = generateWikiResponse({ ...base, query: 'dm 14/2024 certificazione', customDocs: [] });
    const civics = generateWikiResponse({ ...base, query: 'dm 183/2024 educazione civica', customDocs: [] });
    const vertical = generateWikiResponse({ ...base, query: 'allineamento verticale', customDocs: [] });

    for (const response of [uploaded, certification, civics, vertical]) {
      expect(response).toMatch(/fonte|riferimento|non verificat/i);
      expect(response).not.toMatch(/disposizioni organizzative caricate|solidi ed oggettivi|Agenti di conformità verificano|assicura la continuità|CurManLight garantisce/i);
    }
  });
});
