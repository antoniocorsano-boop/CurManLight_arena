import type { Proposal, SchoolOrder, UdaModel, UserRole, DecisionStatus } from '../../../types/curriculum';

type CurricularExportData = {
 traguardi: string[];
 obiettivi: string[];
 proposals: Proposal[];
 evidenze?: string[];
};

type CurriculumMap = Record<string, Record<SchoolOrder, CurricularExportData>>;

type UseDocumentExportHandlersArgs = {
 localCurriculum: CurriculumMap;
 decisions: Record<string, DecisionStatus>;
 customTexts: Record<string, string>;
 schoolYear: string;
 discipline: string;
 order: SchoolOrder;
 role: UserRole;
 selectedTraguardi: number[];
 selectedObiettivi: number[];
 selectedEvidenze: string[];
 savedUda: UdaModel[];
 targetClass: string;
 targetSection: string;
 showToast: (msg: string, success?: boolean) => void;
 getDisciplineLabel: (disc: string, ord?: SchoolOrder) => string;
 setGeneratedDocTitle: (value: string | null) => void;
 setGeneratedDocText: (value: string | null) => void;
};

export function useDocumentExportHandlers({
 localCurriculum,
 decisions,
 customTexts,
 schoolYear,
 discipline,
 order,
 role,
 selectedTraguardi,
 selectedObiettivi,
 selectedEvidenze,
 savedUda,
 targetClass,
 targetSection,
 showToast,
 getDisciplineLabel,
 setGeneratedDocTitle,
 setGeneratedDocText
}: UseDocumentExportHandlersArgs) { // Microsoft Word Exporters with absolute HTML escapes avoiding Vite build optimizations
  const handleDownloadWordDefinitivo = () => {
  const LT = String.fromCharCode(60);
  const GT = String.fromCharCode(62);
  const SL = String.fromCharCode(47);

  let html = LT + "html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http:" + SL + SL + "www.w3.org" + SL + "TR" + SL + "REC-html40'" + GT;
  html += LT + "head" + GT + LT + "title" + GT + "Curricolo d'Istituto Don Milani" + LT + SL + "title" + GT;
  html += LT + "style" + GT + "body { font-family: Arial, sans-serif; line-height: 1.5; font-size: 11pt; } h1 { color: #1e3a8a; text-align: center; margin-top: 10px; } h2 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; margin-top: 30px; padding-bottom: 3px; text-transform: uppercase; } h3 { color: #475569; margin-top: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; } th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; font-size: 10pt; }" + LT + SL + "style" + GT;
  html += LT + SL + "head" + GT + LT + "body" + GT;

  // Header Ministeriale d'Istituto
  html += LT + "div style='text-align: center; border-bottom: 2px double #1e3a8a; padding-bottom: 10px; margin-bottom: 20px; font-family: 'Times New Roman', Times, serif;'" + GT;
  html += LT + "div style='font-size: 10pt; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase;'" + GT + "MINISTERO DELL'ISTRUZIONE E DEL MERITO" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 9pt; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase;'" + GT + "UFFICIO SCOLASTICO REGIONALE PER LA CAMPANIA" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 14pt; font-weight: bold; color: #1e3a8a; margin-top: 5px;'" + GT + "ISTITUTO COMPRENSIVO CALVARIO-COVOTTA \"DON LORENZO MILANI\"" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 8.5pt; color: #64748b; margin-top: 2px;'" + GT + "Via Covotta, Ariano Irpino (AV) - Cod. Fiscale: 90013010649 - Cod. Mecc.: AVIC849003" + LT + SL + "div" + GT;
  html += LT + SL + "div" + GT;

  // Copertina
  html += LT + "div style='text-align: center; margin: 40px 0 50px 0;'" + GT;
  html += LT + "h1 style='color: #1e3a8a; font-size: 20pt; font-weight: bold; margin: 0;'" + GT + "LIBRO DEL CURRICOLO VERTICALE D'ISTITUTO" + LT + SL + "h1" + GT;
  html += LT + "p style='font-size: 12pt; color: #475569; font-style: italic; margin-top: 8px;'" + GT + "Declinato per Competenze e Allineato alle Nuove Indicazioni Nazionali (D.M. 221/2025)" + LT + SL + "p" + GT;
  html += LT + "div style='font-size: 10.5pt; font-weight: bold; color: #1e3a8a; background-color: #f1f5f9; border: 1px solid #cbd5e1; display: inline-block; padding: 6px 20px; border-radius: 4px; margin-top: 15px;'" + GT + "ANNO SCOLASTICO: " + schoolYear + LT + SL + "div" + GT;
  html += LT + SL + "div" + GT;

  Object.keys(localCurriculum).forEach(disc => {
   html += LT + "h2" + GT + "Disciplina: " + getDisciplineLabel(disc).toUpperCase() + LT + SL + "h2" + GT;
   (['infanzia', 'primaria', 'secondaria'] as SchoolOrder[]).forEach(ord => {
    const data = localCurriculum[disc][ord] || { traguardi: [], obiettivi: [], proposals: [] };
    html += LT + "h3" + GT + "Livello: " + ord.toUpperCase() + LT + SL + "h3" + GT;
    html += LT + "table" + GT;
    html += LT + "tr style='background-color: #1e3a8a; color: #ffffff;'" + GT + LT + "th style='width:30%; padding:8px; border: 1px solid #cbd5e1;'" + GT + "Traguardi di Competenza" + LT + SL + "th" + GT + LT + "th style='width:30%; padding:8px; border: 1px solid #cbd5e1;'" + GT + "Obiettivi di Apprendimento" + LT + SL + "th" + GT + LT + "th style='width:40%; padding:8px; border: 1px solid #cbd5e1;'" + GT + "Raccordi & Integrazioni IN 2025" + LT + SL + "th" + GT + LT + SL + "tr" + GT;
    
    const maxLen = Math.max(data.traguardi.length, data.obiettivi.length, data.proposals.length);
    for (let i = 0; i < maxLen; i++) {
     const t = data.traguardi[i] || "";
     const ob = data.obiettivi[i] || "";
     const prop = data.proposals[i];
     let propTxt = "";
     
     if (prop) {
      const dec = decisions[prop.id];
      if (dec === 'approved') propTxt = `[APPROVATO 2025] ${prop.newText}`;
      else if (dec === 'custom') propTxt = `[PERSONALIZZATO] ${customTexts[prop.id] || prop.newText}`;
      else propTxt = `[INVARIATO 2012] ${prop.oldText}`;
     }
     const rowBg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
     html += LT + "tr style='background-color: " + rowBg + ";'" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9.5pt;'" + GT + t + LT + SL + "td" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9.5pt;'" + GT + ob + LT + SL + "td" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9.5pt;'" + GT + propTxt + LT + SL + "td" + GT + LT + SL + "tr" + GT;
    }
    html += LT + SL + "table" + GT + LT + "br" + GT;
   });
  });

  // Blocco Firme
  html += LT + "div style='margin-top: 50px; page-break-inside: avoid; font-family: Arial, sans-serif;'" + GT;
  html += LT + "table style='width: 100%; border: none !important;'" + GT;
  html += LT + "tr style='border: none !important;'" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: left; vertical-align: top; font-size: 10pt;'" + GT + LT + "strong" + GT + "Il Referente del Curricolo" + LT + SL + "strong" + GT + LT + "br" + GT + LT + "br" + GT + LT + "br" + GT + "_________________________________" + LT + SL + "td" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: right; vertical-align: top; font-size: 10pt;'" + GT + LT + "strong" + GT + "Il Dirigente Scolastico" + LT + SL + "strong" + GT + LT + "br" + GT + LT + "br" + GT + LT + "br" + GT + "_________________________________" + LT + SL + "td" + GT;
  html += LT + SL + "tr" + GT;
  html += LT + "tr style='border: none !important;'" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: left; font-size: 8.5pt; color: #64748b;'" + GT + "(Firma autografa omessa ai sensi del CAD)" + LT + SL + "td" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: right; font-size: 8.5pt; color: #64748b;'" + GT + "(Prof.ssa Maria Letizia CML)" + LT + SL + "td" + GT;
  html += LT + SL + "tr" + GT;
  html += LT + SL + "table" + GT;
  html += LT + SL + "div" + GT;

  html += LT + SL + "body" + GT + LT + SL + "html" + GT;

  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `curricolo_verticale_coordinato_${schoolYear}.doc`;
  link.click();
  showToast("Download del documento Word coordinato (.doc) avviato!");
 };

  const handleDownloadWordDocx = () => {
  const LT = String.fromCharCode(60);
  const GT = String.fromCharCode(62);
  const SL = String.fromCharCode(47);

  let html = LT + "html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http:" + SL + SL + "www.w3.org" + SL + "TR" + SL + "REC-html40'" + GT;
  html += LT + "head" + GT + LT + "title" + GT + "Curricolo d'Istituto Don Milani" + LT + SL + "title" + GT;
  html += LT + "style" + GT + "body { font-family: Arial, sans-serif; line-height: 1.5; font-size: 11pt; } h1 { color: #1e3a8a; text-align: center; margin-top: 10px; } h2 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; margin-top: 30px; padding-bottom: 3px; text-transform: uppercase; } h3 { color: #475569; margin-top: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; } th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; font-size: 10pt; }" + LT + SL + "style" + GT;
  html += LT + SL + "head" + GT + LT + "body" + GT;

  // Header Ministeriale d'Istituto
  html += LT + "div style='text-align: center; border-bottom: 2px double #1e3a8a; padding-bottom: 10px; margin-bottom: 20px; font-family: 'Times New Roman', Times, serif;'" + GT;
  html += LT + "div style='font-size: 10pt; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase;'" + GT + "MINISTERO DELL'ISTRUZIONE E DEL MERITO" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 9pt; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase;'" + GT + "UFFICIO SCOLASTICO REGIONALE PER LA CAMPANIA" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 14pt; font-weight: bold; color: #1e3a8a; margin-top: 5px;'" + GT + "ISTITUTO COMPRENSIVO CALVARIO-COVOTTA \"DON LORENZO MILANI\"" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 8.5pt; color: #64748b; margin-top: 2px;'" + GT + "Via Covotta, Ariano Irpino (AV) - Cod. Fiscale: 90013010649 - Cod. Mecc.: AVIC849003" + LT + SL + "div" + GT;
  html += LT + SL + "div" + GT;

  // Copertina
  html += LT + "div style='text-align: center; margin: 40px 0 50px 0;'" + GT;
  html += LT + "h1 style='color: #1e3a8a; font-size: 20pt; font-weight: bold; margin: 0;'" + GT + "LIBRO DEL CURRICOLO VERTICALE D'ISTITUTO" + LT + SL + "h1" + GT;
  html += LT + "p style='font-size: 12pt; color: #475569; font-style: italic; margin-top: 8px;'" + GT + "Declinato per Competenze e Allineato alle Nuove Indicazioni Nazionali (D.M. 221/2025)" + LT + SL + "p" + GT;
  html += LT + "div style='font-size: 10.5pt; font-weight: bold; color: #1e3a8a; background-color: #f1f5f9; border: 1px solid #cbd5e1; display: inline-block; padding: 6px 20px; border-radius: 4px; margin-top: 15px;'" + GT + "ANNO SCOLASTICO: " + schoolYear + LT + SL + "div" + GT;
  html += LT + SL + "div" + GT;

  Object.keys(localCurriculum).forEach(disc => {
   html += LT + "h2" + GT + "Disciplina: " + getDisciplineLabel(disc).toUpperCase() + LT + SL + "h2" + GT;
   (['infanzia', 'primaria', 'secondaria'] as SchoolOrder[]).forEach(ord => {
    const data = localCurriculum[disc][ord] || { traguardi: [], obiettivi: [], proposals: [] };
    html += LT + "h3" + GT + "Livello: " + ord.toUpperCase() + LT + SL + "h3" + GT;
    html += LT + "table" + GT;
    html += LT + "tr style='background-color: #1e3a8a; color: #ffffff;'" + GT + LT + "th style='width:30%; padding:8px; border: 1px solid #cbd5e1;'" + GT + "Traguardi di Competenza" + LT + SL + "th" + GT + LT + "th style='width:30%; padding:8px; border: 1px solid #cbd5e1;'" + GT + "Obiettivi di Apprendimento" + LT + SL + "th" + GT + LT + "th style='width:40%; padding:8px; border: 1px solid #cbd5e1;'" + GT + "Raccordi & Integrazioni IN 2025" + LT + SL + "th" + GT + LT + SL + "tr" + GT;
    
    const maxLen = Math.max(data.traguardi.length, data.obiettivi.length, data.proposals.length);
    for (let i = 0; i < maxLen; i++) {
     const t = data.traguardi[i] || "";
     const ob = data.obiettivi[i] || "";
     const prop = data.proposals[i];
     let propTxt = "";
     
     if (prop) {
      const dec = decisions[prop.id];
      if (dec === 'approved') propTxt = `[APPROVATO 2025] ${prop.newText}`;
      else if (dec === 'custom') propTxt = `[PERSONALIZZATO] ${customTexts[prop.id] || prop.newText}`;
      else propTxt = `[INVARIATO 2012] ${prop.oldText}`;
     }
     const rowBg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
     html += LT + "tr style='background-color: " + rowBg + ";'" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9.5pt;'" + GT + t + LT + SL + "td" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9.5pt;'" + GT + ob + LT + SL + "td" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9.5pt;'" + GT + propTxt + LT + SL + "td" + GT + LT + SL + "tr" + GT;
    }
    html += LT + SL + "table" + GT + LT + "br" + GT;
   });
  });

  // Blocco Firme
  html += LT + "div style='margin-top: 50px; page-break-inside: avoid; font-family: Arial, sans-serif;'" + GT;
  html += LT + "table style='width: 100%; border: none !important;'" + GT;
  html += LT + "tr style='border: none !important;'" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: left; vertical-align: top; font-size: 10pt;'" + GT + LT + "strong" + GT + "Il Referente del Curricolo" + LT + SL + "strong" + GT + LT + "br" + GT + LT + "br" + GT + LT + "br" + GT + "_________________________________" + LT + SL + "td" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: right; vertical-align: top; font-size: 10pt;'" + GT + LT + "strong" + GT + "Il Dirigente Scolastico" + LT + SL + "strong" + GT + LT + "br" + GT + LT + "br" + GT + LT + "br" + GT + "_________________________________" + LT + SL + "td" + GT;
  html += LT + SL + "tr" + GT;
  html += LT + "tr style='border: none !important;'" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: left; font-size: 8.5pt; color: #64748b;'" + GT + "(Firma autografa omessa ai sensi del CAD)" + LT + SL + "td" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: right; font-size: 8.5pt; color: #64748b;'" + GT + "(Prof.ssa Maria Letizia CML)" + LT + SL + "td" + GT;
  html += LT + SL + "tr" + GT;
  html += LT + SL + "table" + GT;
  html += LT + SL + "div" + GT;

  html += LT + SL + "body" + GT + LT + SL + "html" + GT;

  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `curricolo_verticale_coordinato_${schoolYear}.docx`;
  link.click();
  showToast("Download del documento Word (.docx) avviato!");
 };

  const handleDownloadODF = () => {
  const LT = String.fromCharCode(60);
  const GT = String.fromCharCode(62);
  const SL = String.fromCharCode(47);

  let html = LT + "html" + GT;
  html += LT + "head" + GT + LT + "title" + GT + "Curricolo d'Istituto Don Milani" + LT + SL + "title" + GT;
  html += LT + "style" + GT + "body { font-family: Arial, sans-serif; line-height: 1.5; font-size: 11pt; } h1 { color: #1e3a8a; text-align: center; margin-top: 10px; } h2 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; margin-top: 30px; padding-bottom: 3px; text-transform: uppercase; } h3 { color: #475569; margin-top: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; } table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; } th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; font-size: 10pt; }" + LT + SL + "style" + GT;
  html += LT + SL + "head" + GT + LT + "body" + GT;

  // Header Ministeriale d'Istituto
  html += LT + "div style='text-align: center; border-bottom: 2px double #1e3a8a; padding-bottom: 10px; margin-bottom: 20px; font-family: 'Times New Roman', Times, serif;'" + GT;
  html += LT + "div style='font-size: 10pt; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase;'" + GT + "MINISTERO DELL'ISTRUZIONE E DEL MERITO" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 9pt; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase;'" + GT + "UFFICIO SCOLASTICO REGIONALE PER LA CAMPANIA" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 14pt; font-weight: bold; color: #1e3a8a; margin-top: 5px;'" + GT + "ISTITUTO COMPRENSIVO CALVARIO-COVOTTA \"DON LORENZO MILANI\"" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 8.5pt; color: #64748b; margin-top: 2px;'" + GT + "Via Covotta, Ariano Irpino (AV) - Cod. Fiscale: 90013010649 - Cod. Mecc.: AVIC849003" + LT + SL + "div" + GT;
  html += LT + SL + "div" + GT;

  // Copertina
  html += LT + "div style='text-align: center; margin: 40px 0 50px 0;'" + GT;
  html += LT + "h1 style='color: #1e3a8a; font-size: 20pt; font-weight: bold; margin: 0;'" + GT + "LIBRO DEL CURRICOLO VERTICALE D'ISTITUTO" + LT + SL + "h1" + GT;
  html += LT + "p style='font-size: 12pt; color: #475569; font-style: italic; margin-top: 8px;'" + GT + "Declinato per Competenze e Allineato alle Nuove Indicazioni Nazionali (D.M. 221/2025)" + LT + SL + "p" + GT;
  html += LT + "div style='font-size: 10.5pt; font-weight: bold; color: #1e3a8a; background-color: #f1f5f9; border: 1px solid #cbd5e1; display: inline-block; padding: 6px 20px; border-radius: 4px; margin-top: 15px;'" + GT + "ANNO SCOLASTICO: " + schoolYear + LT + SL + "div" + GT;
  html += LT + SL + "div" + GT;

  Object.keys(localCurriculum).forEach(disc => {
   html += LT + "h2" + GT + "Disciplina: " + getDisciplineLabel(disc).toUpperCase() + LT + SL + "h2" + GT;
   (['infanzia', 'primaria', 'secondaria'] as SchoolOrder[]).forEach(ord => {
    const data = localCurriculum[disc][ord] || { traguardi: [], obiettivi: [], proposals: [] };
    html += LT + "h3" + GT + "Livello: " + ord.toUpperCase() + LT + SL + "h3" + GT;
    html += LT + "table" + GT;
    html += LT + "tr style='background-color: #1e3a8a; color: #ffffff;'" + GT + LT + "th style='width:30%; padding:8px; border: 1px solid #cbd5e1;'" + GT + "Traguardi di Competenza" + LT + SL + "th" + GT + LT + "th style='width:30%; padding:8px; border: 1px solid #cbd5e1;'" + GT + "Obiettivi di Apprendimento" + LT + SL + "th" + GT + LT + "th style='width:40%; padding:8px; border: 1px solid #cbd5e1;'" + GT + "Raccordi & Integrazioni IN 2025" + LT + SL + "th" + GT + LT + SL + "tr" + GT;
    
    const maxLen = Math.max(data.traguardi.length, data.obiettivi.length, data.proposals.length);
    for (let i = 0; i < maxLen; i++) {
     const t = data.traguardi[i] || "";
     const ob = data.obiettivi[i] || "";
     const prop = data.proposals[i];
     let propTxt = "";
     
     if (prop) {
      const dec = decisions[prop.id];
      if (dec === 'approved') propTxt = `[APPROVATO 2025] ${prop.newText}`;
      else if (dec === 'custom') propTxt = `[PERSONALIZZATO] ${customTexts[prop.id] || prop.newText}`;
      else propTxt = `[INVARIATO 2012] ${prop.oldText}`;
     }
     const rowBg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
     html += LT + "tr style='background-color: " + rowBg + ";'" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9.5pt;'" + GT + t + LT + SL + "td" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9.5pt;'" + GT + ob + LT + SL + "td" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9.5pt;'" + GT + propTxt + LT + SL + "td" + GT + LT + SL + "tr" + GT;
    }
    html += LT + SL + "table" + GT + LT + "br" + GT;
   });
  });

  // Blocco Firme
  html += LT + "div style='margin-top: 50px; page-break-inside: avoid; font-family: Arial, sans-serif;'" + GT;
  html += LT + "table style='width: 100%; border: none !important;'" + GT;
  html += LT + "tr style='border: none !important;'" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: left; vertical-align: top; font-size: 10pt;'" + GT + LT + "strong" + GT + "Il Referente del Curricolo" + LT + SL + "strong" + GT + LT + "br" + GT + LT + "br" + GT + LT + "br" + GT + "_________________________________" + LT + SL + "td" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: right; vertical-align: top; font-size: 10pt;'" + GT + LT + "strong" + GT + "Il Dirigente Scolastico" + LT + SL + "strong" + GT + LT + "br" + GT + LT + "br" + GT + LT + "br" + GT + "_________________________________" + LT + SL + "td" + GT;
  html += LT + SL + "tr" + GT;
  html += LT + "tr style='border: none !important;'" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: left; font-size: 8.5pt; color: #64748b;'" + GT + "(Firma autografa omessa ai sensi del CAD)" + LT + SL + "td" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: right; font-size: 8.5pt; color: #64748b;'" + GT + "(Prof.ssa Maria Letizia CML)" + LT + SL + "td" + GT;
  html += LT + SL + "tr" + GT;
  html += LT + SL + "table" + GT;
  html += LT + SL + "div" + GT;

  html += LT + SL + "body" + GT + LT + SL + "html" + GT;

  const blob = new Blob([html], { type: 'application/vnd.oasis.opendocument.text;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `curricolo_verticale_coordinato_${schoolYear}.odt`;
  link.click();
  showToast("Download del documento LibreOffice/ODF (.odt) avviato!");
 };

 const handlePrintDocumentPdf = (title: string, text: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
   showToast("Blocco popup attivo! Consenti l'apertura dei popup per salvare in PDF.", false);
   return;
  }

  // Parse the plain text to generate a gorgeous, high-fidelity formatted document
  const lines = text.split('\n');
  let bodyHtml = "";

  lines.forEach(line => {
   const trimmed = line.trim();
   // Skip separators
   if (/^[=\-\*_]+$/.test(trimmed)) return;
   if (!trimmed) return;

   // Skip duplicated generic raw school title lines to avoid duplication with our premium header
   if (trimmed.includes("ISTITUTO COMPRENSIVO") || trimmed.includes("Rione Covotta") || trimmed.includes("AVIC849003")) {
    return;
   }

   // Check if it's a main metadata line
   if (trimmed.startsWith("DOCUMENTO:") || trimmed.startsWith("DISCIPLINA:") || trimmed.startsWith("ORDINE:") || trimmed.startsWith("CLASSE:") || trimmed.startsWith("ANNO SCOL.:")) {
    const parts = trimmed.split(':');
    bodyHtml += `<p style="margin: 3px 0; font-size: 10pt; color: #475569;"><strong>${parts[0].trim()}:</strong> ${parts.slice(1).join(':').trim()}</p>`;
   }
   // Check if it is a heading
   else if (/^\d+\.\s+[A-Z\s]+$/.test(trimmed) || (/^[A-Z0-9\s\.\,\/]{5,}\s*$/.test(trimmed) && trimmed === trimmed.toUpperCase())) {
    bodyHtml += `<h2 style="color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; font-size: 13pt; margin-top: 25px; text-transform: uppercase;">${trimmed}</h2>`;
   }
   // Standard paragraph
   else {
    bodyHtml += `<p style="text-align: justify; font-size: 11pt; color: #334155; line-height: 1.6; margin-bottom: 12px;">${trimmed}</p>`;
   }
  });

  const docHtml = `
   <html>
    <head>
     <title>${title}</title>
     <style>
      body { font-family: Arial, sans-serif; line-height: 1.5; font-size: 11pt; padding: 40px; color: #1e293b; background-color: #ffffff; }
      @media print {
       body { padding: 0; }
       @page { margin: 2cm; }
      }
     </style>
    </head>
    <body>
     <!-- Intestazione Ministeriale d'Istituto -->
     <div style="text-align: center; border-bottom: 2px double #1e3a8a; padding-bottom: 10px; margin-bottom: 25px; font-family: 'Times New Roman', Times, serif;">
      <div style="font-size: 9.5pt; font-weight: bold; color: #475569; letter-spacing: 1.5px; text-transform: uppercase;">MINISTERO DELL'ISTRUZIONE E DEL MERITO</div>
      <div style="font-size: 8.5pt; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase;">UFFICIO SCOLASTICO REGIONALE PER LA CAMPANIA</div>
      <div style="font-size: 13pt; font-weight: bold; color: #1e3a8a; margin-top: 4px; letter-spacing: 0.5px;">ISTITUTO COMPRENSIVO CALVARIO-COVOTTA "DON LORENZO MILANI"</div>
      <div style="font-size: 8pt; color: #64748b; margin-top: 2px;">Via Covotta, Ariano Irpino (AV) - Cod. Fiscale: 90013010649 - Cod. Mecc.: AVIC849003</div>
     </div>

     <h1 style="color: #1e3a8a; font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-top: 15px; margin-bottom: 20px;">${title}</h1>

     <div style="margin-top: 10px;">
      ${bodyHtml}
     </div>

     <!-- Blocco Firme di chiusura -->
     <div style="margin-top: 60px; page-break-inside: avoid;">
      <table style="width: 100%; border: none !important;">
       <tr style="border: none !important;">
        <td style="width: 50%; border: none !important; text-align: left; vertical-align: top; font-size: 10pt; font-family: Arial, sans-serif;">
         <strong>Il Referente del Curricolo</strong><br/><br/><br/>
         _________________________________<br/>
         <span style="font-size: 8.5pt; color: #64748b;">(Firma autografa omessa ai sensi del CAD)</span>
        </td>
        <td style="width: 50%; border: none !important; text-align: right; vertical-align: top; font-size: 10pt; font-family: Arial, sans-serif;">
         <strong>Il Dirigente Scolastico</strong><br/><br/><br/>
         _________________________________<br/>
         <span style="font-size: 8.5pt; color: #64748b;">(Prof.ssa Maria Letizia CML)</span>
        </td>
       </tr>
      </table>
     </div>

     <script>
      window.onload = function() {
       window.print();
       setTimeout(function() { window.close(); }, 500);
      };
     </script>
    </body>
   </html>
  `;

  printWindow.document.write(docHtml);
  printWindow.document.close();
  showToast("Interfaccia di stampa PDF avviata!", true);
 };

  const handleDownloadCurricoloPDF = () => {
  const LT = String.fromCharCode(60);
  const GT = String.fromCharCode(62);
  const SL = String.fromCharCode(47);

  let html = LT + "html" + GT;
  html += LT + "head" + GT + LT + "title" + GT + "Curricolo d'Istituto Don Milani" + LT + SL + "title" + GT;
  html += LT + "style" + GT + "body { font-family: Arial, sans-serif; line-height: 1.5; font-size: 10pt; padding: 20px; color: #1e293b; } h1 { color: #1e3a8a; text-align: center; text-transform: uppercase; font-size: 14pt; margin-top: 10px; } h2 { color: #1e293b; border-bottom: 2px solid #1e3a8a; margin-top: 25px; font-size: 12pt; text-transform: uppercase; padding-bottom: 3px; } h3 { color: #475569; font-size: 11pt; margin-top: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; } table { width: 100%; border-collapse: collapse; margin-top: 10px; page-break-inside: avoid; } th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 9pt; vertical-align: top; } th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; } @media print { body { padding: 0; } @page { margin: 1.5cm; } }" + LT + SL + "style" + GT;
  html += LT + SL + "head" + GT + LT + "body" + GT;

  // Header Ministeriale d'Istituto
  html += LT + "div style='text-align: center; border-bottom: 2px double #1e3a8a; padding-bottom: 10px; margin-bottom: 20px; font-family: 'Times New Roman', Times, serif;'" + GT;
  html += LT + "div style='font-size: 9.5pt; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase;'" + GT + "MINISTERO DELL'ISTRUZIONE E DEL MERITO" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 8.5pt; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase;'" + GT + "UFFICIO SCOLASTICO REGIONALE PER LA CAMPANIA" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 13pt; font-weight: bold; color: #1e3a8a; margin-top: 4px;'" + GT + "ISTITUTO COMPRENSIVO CALVARIO-COVOTTA \"DON LORENZO MILANI\"" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 8pt; color: #64748b; margin-top: 2px;'" + GT + "Via Covotta, Ariano Irpino (AV) - Cod. Fiscale: 90013010649 - Cod. Mecc.: AVIC849003" + LT + SL + "div" + GT;
  html += LT + SL + "div" + GT;

  // Copertina
  html += LT + "div style='text-align: center; margin: 30px 0 40px 0;'" + GT;
  html += LT + "h1 style='color: #1e3a8a; font-size: 18pt; font-weight: bold; margin: 0;'" + GT + "LIBRO DEL CURRICOLO VERTICALE D'ISTITUTO" + LT + SL + "h1" + GT;
  html += LT + "p style='font-size: 11pt; color: #475569; font-style: italic; margin-top: 6px;'" + GT + "Declinato per Competenze e Allineato alle Nuove Indicazioni Nazionali (D.M. 221/2025)" + LT + SL + "p" + GT;
  html += LT + "div style='font-size: 10pt; font-weight: bold; color: #1e3a8a; background-color: #f1f5f9; border: 1px solid #cbd5e1; display: inline-block; padding: 5px 15px; border-radius: 4px; margin-top: 10px;'" + GT + "ANNO SCOLASTICO: " + schoolYear + LT + SL + "div" + GT;
  html += LT + SL + "div" + GT;

  Object.keys(localCurriculum).forEach(disc => {
   html += LT + "h2" + GT + "Disciplina: " + getDisciplineLabel(disc).toUpperCase() + LT + SL + "h2" + GT;
   (['infanzia', 'primaria', 'secondaria'] as SchoolOrder[]).forEach(ord => {
    const data = localCurriculum[disc][ord] || { traguardi: [], obiettivi: [], proposals: [] };
    html += LT + "h3" + GT + "Livello scolastico: " + ord.toUpperCase() + LT + SL + "h3" + GT;
    html += LT + "table" + GT;
    html += LT + "tr style='background-color: #1e3a8a; color: #ffffff;'" + GT + LT + "th style='width:30%; padding:8px; border: 1px solid #cbd5e1;'" + GT + "Traguardi di Competenza" + LT + SL + "th" + GT + LT + "th style='width:30%; padding:8px; border: 1px solid #cbd5e1;'" + GT + "Obiettivi di Apprendimento" + LT + SL + "th" + GT + LT + "th style='width:40%; padding:8px; border: 1px solid #cbd5e1;'" + GT + "Raccordi & Integrazioni IN 2025" + LT + SL + "th" + GT + LT + SL + "tr" + GT;
    
    const maxLen = Math.max(data.traguardi.length, data.obiettivi.length, data.proposals.length);
    for (let i = 0; i < maxLen; i++) {
     const t = data.traguardi[i] || "";
     const ob = data.obiettivi[i] || "";
     const prop = data.proposals[i];
     let propTxt = "";
     
     if (prop) {
      const dec = decisions[prop.id];
      if (dec === 'approved') propTxt = `[APPROVATO 2025] ${prop.newText}`;
      else if (dec === 'custom') propTxt = `[PERSONALIZZATO] ${customTexts[prop.id] || prop.newText}`;
      else propTxt = `[INVARIATO 2012] ${prop.oldText}`;
     }
     const rowBg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
     html += LT + "tr style='background-color: " + rowBg + ";'" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9pt;'" + GT + t + LT + SL + "td" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9pt;'" + GT + ob + LT + SL + "td" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9pt;'" + GT + propTxt + LT + SL + "td" + GT + LT + SL + "tr" + GT;
    }
    html += LT + SL + "table" + GT + LT + "br" + GT;
   });
  });

  // Blocco Firme
  html += LT + "div style='margin-top: 40px; page-break-inside: avoid; font-family: Arial, sans-serif;'" + GT;
  html += LT + "table style='width: 100%; border: none !important;'" + GT;
  html += LT + "tr style='border: none !important;'" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: left; vertical-align: top; font-size: 9.5pt;'" + GT + LT + "strong" + GT + "Il Referente del Curricolo" + LT + SL + "strong" + GT + LT + "br" + GT + LT + "br" + GT + LT + "br" + GT + "_________________________________" + LT + SL + "td" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: right; vertical-align: top; font-size: 9.5pt;'" + GT + LT + "strong" + GT + "Il Dirigente Scolastico" + LT + SL + "strong" + GT + LT + "br" + GT + LT + "br" + GT + LT + "br" + GT + "_________________________________" + LT + SL + "td" + GT;
  html += LT + SL + "tr" + GT;
  html += LT + "tr style='border: none !important;'" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: left; font-size: 8pt; color: #64748b;'" + GT + "(Firma autografa omessa ai sensi del CAD)" + LT + SL + "td" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: right; font-size: 8pt; color: #64748b;'" + GT + "(Prof.ssa Maria Letizia CML)" + LT + SL + "td" + GT;
  html += LT + SL + "tr" + GT;
  html += LT + SL + "table" + GT;
  html += LT + SL + "div" + GT;

  html += LT + SL + "body" + GT + LT + SL + "html" + GT;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
   showToast("Blocco popup attivo! Consenti l'apertura dei popup per esportare in PDF.", false);
   return;
  }
  printWindow.document.write(html);
  printWindow.document.write(`
   <script>
    window.onload = function() {
     window.print();
     setTimeout(function() { window.close(); }, 500);
    };
   </script>
  `);
  printWindow.document.close();
  showToast("Generazione PDF del Curricolo avviata!", true);
 };

 const handleDownloadRichMarkdown = () => {
  let md = `# CURRICOLO VERTICALE COORDINATO E ALLINEATO D'ISTITUTO\n`;
  md += `### Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" Ã¢â‚¬â€ Ariano Irpino (AV)\n`;
  md += `**Codice Meccanografico:** AVIC849003 \n`;
  md += `**Anno Scolastico:** ${schoolYear} \n`;
  md += `**Riferimenti Normativi:** D.M. 254/2012, D.M. 14/2024 & D.M. 221/2025 \n`;
  md += `*Stato del Documento: VALIDATO ED APPROVATO DAL COLLEGIO DOCENTI* \n\n`;
  md += `---\n\n`;
  md += `## INTRODUZIONE PEDAGOGICA\n`;
  md += `Il presente curricolo verticale d'Istituto rappresenta lo strumento programmatorio sovrano che delinea, dai 3 ai 14 anni, il percorso continuo, progressivo e coerente volto allo sviluppo delle **8 Competenze Chiave Europee (2018)**. Esso integra i raccordi nazionali delle Nuove Indicazioni 2025 (D.M. 221/2025) in coesistenza transitoria graduale con il D.M. 254/2012.\n\n`;

  Object.keys(localCurriculum).forEach(disc => {
   md += `## Disciplina: ${getDisciplineLabel(disc).toUpperCase()}\n\n`;
   
   (['infanzia', 'primaria', 'secondaria'] as SchoolOrder[]).forEach(ord => {
    md += `### Grado: ${ord.toUpperCase()}\n\n`;
    md += `| Traguardi di Competenza | Obiettivi di Apprendimento | Raccordi & Integrazioni IN 2025 |\n`;
    md += `| :--- | :--- | :--- |\n`;

    const data = localCurriculum[disc][ord] || { traguardi: [], obiettivi: [], proposals: [] };
    const maxLen = Math.max(data.traguardi.length, data.obiettivi.length, data.proposals.length);
    
    for (let i = 0; i < maxLen; i++) {
     const t = (data.traguardi[i] || "").replace(/\n/g, " ");
     const ob = (data.obiettivi[i] || "").replace(/\n/g, " ");
     const prop = data.proposals[i];
     let propTxt = "";
     
     if (prop) {
      const dec = decisions[prop.id];
      if (dec === 'approved') propTxt = `**[APPROVATO 2025]** ${prop.newText.replace(/\n/g, " ")}`;
      else if (dec === 'custom') propTxt = `**[PERSONALIZZATO]** ${(customTexts[prop.id] || prop.newText).replace(/\n/g, " ")}`;
      else propTxt = `**[INVARIATO 2012]** ${prop.oldText.replace(/\n/g, " ")}`;
     }
     md += `| ${t} | ${ob} | ${propTxt} |\n`;
    }
    md += `\n`;
   });
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `curricolo_verticale_arricchito_${schoolYear}.md`;
  link.click();
  showToast("Download del Curricolo in Markdown Arricchito (.md) avviato!");
 };

 const handleDownloadPdfDirect = () => {
  showToast("Preparazione della stampa PDF d'Istituto... VerrÃƒÂ  aperta la finestra di dialogo del browser.", true);
  setTimeout(() => {
   window.print();
  }, 1200);
 };

  const handleDownloadWordConfronto = () => {
  const LT = String.fromCharCode(60);
  const GT = String.fromCharCode(62);
  const SL = String.fromCharCode(47);

  let html = LT + "html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http:" + SL + SL + "www.w3.org" + SL + "TR" + SL + "REC-html40'" + GT;
  html += LT + "head" + GT + LT + "title" + GT + "Tavola di Confronto Modifiche Curricolo" + LT + SL + "title" + GT;
  html += LT + "style" + GT + "body { font-family: Arial, sans-serif; line-height: 1.5; font-size: 11pt; } h1 { color: #b45309; text-align: center; margin-top: 10px; } h2 { color: #b45309; border-bottom: 2px solid #b45309; margin-top: 30px; padding-bottom: 3px; } table { width: 100%; border-collapse: collapse; margin-top: 15px; } th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; } th { background-color: #b45309; color: #ffffff; font-weight: bold; font-size: 10pt; }" + LT + SL + "style" + GT;
  html += LT + SL + "head" + GT + LT + "body" + GT;

  // Header Ministeriale d'Istituto
  html += LT + "div style='text-align: center; border-bottom: 2px double #b45309; padding-bottom: 10px; margin-bottom: 20px; font-family: 'Times New Roman', Times, serif;'" + GT;
  html += LT + "div style='font-size: 10pt; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase;'" + GT + "MINISTERO DELL'ISTRUZIONE E DEL MERITO" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 9pt; font-weight: bold; color: #475569; letter-spacing: 1px; text-transform: uppercase;'" + GT + "UFFICIO SCOLASTICO REGIONALE PER LA CAMPANIA" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 14pt; font-weight: bold; color: #b45309; margin-top: 5px;'" + GT + "ISTITUTO COMPRENSIVO CALVARIO-COVOTTA \"DON LORENZO MILANI\"" + LT + SL + "div" + GT;
  html += LT + "div style='font-size: 8.5pt; color: #64748b; margin-top: 2px;'" + GT + "Via Covotta, Ariano Irpino (AV) - Cod. Fiscale: 90013010649 - Cod. Mecc.: AVIC849003" + LT + SL + "div" + GT;
  html += LT + SL + "div" + GT;

  // Copertina
  html += LT + "div style='text-align: center; margin: 40px 0 50px 0;'" + GT;
  html += LT + "h1 style='color: #b45309; font-size: 20pt; font-weight: bold; margin: 0;'" + GT + "TAVOLA SINOTTICA DI CONFRONTO E ADOZIONE" + LT + SL + "h1" + GT;
  html += LT + "p style='font-size: 12pt; color: #475569; font-style: italic; margin-top: 8px;'" + GT + "Raccordi di Riforma Ordinamentale: Base D.M. 254/2012 vs Integrazioni D.M. 221/2025" + LT + SL + "p" + GT;
  html += LT + "div style='font-size: 10.5pt; font-weight: bold; color: #b45309; background-color: #fffbeb; border: 1px solid #fde68a; display: inline-block; padding: 6px 20px; border-radius: 4px; margin-top: 15px;'" + GT + "ANNO SCOLASTICO: " + schoolYear + LT + SL + "div" + GT;
  html += LT + SL + "div" + GT;

  html += LT + "table" + GT;
  html += LT + "tr style='background-color: #b45309; color: #ffffff;'" + GT + LT + "th style='width: 10%; padding: 8px; border: 1px solid #cbd5e1;'" + GT + "Codice" + LT + SL + "th" + GT + LT + "th style='width: 25%; padding: 8px; border: 1px solid #cbd5e1;'" + GT + "Ambito Disciplinare" + LT + SL + "th" + GT + LT + "th style='width: 20%; padding: 8px; border: 1px solid #cbd5e1;'" + GT + "Stato Decisione" + LT + SL + "th" + GT + LT + "th style='width: 45%; padding: 8px; border: 1px solid #cbd5e1;'" + GT + "Testo Finalizzato Deliberato" + LT + SL + "th" + GT + LT + SL + "tr" + GT;

  let i = 0;
  Object.keys(localCurriculum).forEach(disc => {
   (['infanzia', 'primaria', 'secondaria'] as SchoolOrder[]).forEach(ord => {
    const props = (localCurriculum[disc][ord].proposals || []) as Proposal[];
    props.forEach(p => {
     const dec = decisions[p.id];
     let statusText = "DA DECIDERE (FALLBACK 2012)";
     let txt = p.oldText;
     if (dec === 'approved') { statusText = "APPROVATO 2025"; txt = p.newText; }
     else if (dec === 'rejected') { statusText = "CONSERVATO 2012"; txt = p.oldText; }
     else if (dec === 'custom') { statusText = "MODIFICA D'ISTITUTO"; txt = customTexts[p.id] || p.newText; }

     html += LT + "tr style='background-color: " + (i % 2 === 0 ? '#ffffff' : '#fafaf9') + ";'" + GT + LT + "td style='font-family: monospace; border: 1px solid #cbd5e1; padding: 8px;'" + GT + p.id.toUpperCase() + LT + SL + "td" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px;'" + GT + getDisciplineLabel(disc).toUpperCase() + " (" + ord.toUpperCase() + ")" + LT + SL + "td" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; color: " + (dec === 'approved' ? '#047857' : dec === 'custom' ? '#4f46e5' : '#475569') + ";'" + GT + statusText + LT + SL + "td" + GT + LT + "td style='border: 1px solid #cbd5e1; padding: 8px; font-size: 9.5pt;'" + GT + txt + LT + SL + "td" + GT + LT + SL + "tr" + GT;
     i++;
    });
   });
  });

  html += LT + SL + "table" + GT;

  // Blocco Firme
  html += LT + "div style='margin-top: 50px; page-break-inside: avoid; font-family: Arial, sans-serif;'" + GT;
  html += LT + "table style='width: 100%; border: none !important;'" + GT;
  html += LT + "tr style='border: none !important;'" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: left; vertical-align: top; font-size: 10pt;'" + GT + LT + "strong" + GT + "Il Referente del Curricolo" + LT + SL + "strong" + GT + LT + "br" + GT + LT + "br" + GT + LT + "br" + GT + "_________________________________" + LT + SL + "td" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: right; vertical-align: top; font-size: 10pt;'" + GT + LT + "strong" + GT + "Il Dirigente Scolastico" + LT + SL + "strong" + GT + LT + "br" + GT + LT + "br" + GT + LT + "br" + GT + "_________________________________" + LT + SL + "td" + GT;
  html += LT + SL + "tr" + GT;
  html += LT + "tr style='border: none !important;'" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: left; font-size: 8.5pt; color: #64748b;'" + GT + "(Firma autografa omessa ai sensi del CAD)" + LT + SL + "td" + GT;
  html += LT + "td style='width: 50%; border: none !important; text-align: right; font-size: 8.5pt; color: #64748b;'" + GT + "(Prof.ssa Maria Letizia CML)" + LT + SL + "td" + GT;
  html += LT + SL + "tr" + GT;
  html += LT + SL + "table" + GT;
  html += LT + SL + "div" + GT;

  html += LT + SL + "body" + GT + LT + SL + "html" + GT;

  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `tavola_sinottica_confronto_modifiche.doc`;
  link.click();
  showToast("Download della Tavola di Confronto Word avviato!");
 };

 // Copy Word structured tables directly into the Clipboard
 const handleCopyToClipboardFormatted = () => {
  const LT = String.fromCharCode(60);
  const GT = String.fromCharCode(62);
  const SL = String.fromCharCode(47);

  let html = LT + "table style=\"width:100%; border-collapse:collapse; font-family:sans-serif; font-size:12px;\" border=\"1\"" + GT;
  html += LT + "tr style=\"background:#f1f5f9; font-weight:bold;\"" + GT + LT + "th style=\"padding:8px;\"" + GT + "Codice ID" + LT + SL + "th" + GT + LT + "th style=\"padding:8px;\"" + GT + "Ambito / Focus" + LT + SL + "th" + GT + LT + "th style=\"padding:8px;\"" + GT + "Stato del Confronto" + LT + SL + "th" + GT + LT + "th style=\"padding:8px;\"" + GT + "Testo del Curricolo Finale" + LT + SL + "th" + GT + LT + SL + "tr" + GT;

  let count = 0;
  Object.keys(localCurriculum).forEach(disc => {
   (['infanzia', 'primaria', 'secondaria'] as SchoolOrder[]).forEach(ord => {
    const props = (localCurriculum[disc][ord].proposals || []) as Proposal[];
    props.forEach(p => {
     const dec = decisions[p.id];
     let finalTxt = p.oldText;
     let statusText = "Mantenuto 2012 (Invariato)";
     
     if (dec === 'approved') {
      finalTxt = p.newText;
      statusText = "Approvata Integrazione 2025";
     } else if (dec === 'custom') {
      finalTxt = customTexts[p.id] || p.newText;
      statusText = "Modifica Dipartimentale Personalizzata";
     }

     html += LT + "tr" + GT + LT + "td style=\"padding:6px; font-family:monospace;\"" + GT + p.id.toUpperCase() + LT + SL + "td" + GT + LT + "td style=\"padding:6px;\"" + GT + LT + "strong" + GT + disc.toUpperCase() + LT + SL + "strong" + GT + ": " + p.focus + LT + SL + "td" + GT + LT + "td style=\"padding:6px;\"" + GT + statusText + LT + SL + "td" + GT + LT + "td style=\"padding:6px;\"" + GT + finalTxt + LT + SL + "td" + GT + LT + SL + "tr" + GT;
     count++;
    });
   });
  });

  html += LT + SL + "table" + GT;

  const blob = new Blob([html], { type: 'text/html' });
  const data = [new ClipboardItem({ 'text/html': blob })];
  
  navigator.clipboard.write(data).then(() => {
   showToast(`Copiato con successo formato compatibile Word (${count} raccordi)! Incolla ora in MS Word.`);
  }).catch(() => {
   navigator.clipboard.writeText(html);
   showToast("Copiata struttura in codice HTML", false);
  });
 };

 // Raw txt exporter
 const handleDownloadTxt = () => {
  let content = `Bozza Curricolo Disciplinare - ${discipline.toUpperCase()} (${order.toUpperCase()})\n`;
  content += `Generato con CurManLight il ${new Date().toLocaleDateString('it-IT')}\n`;
  content += `========================================================================\n\n`;

  const currentData = (localCurriculum[discipline]?.[order] || { traguardi: [], obiettivi: [], proposals: [] }) as CurricularExportData;
  
  content += `--- TRAGUARDI DI RIFERIMENTO (VIGENTI) ---\n`;
  currentData.traguardi.forEach((t, i) => {
   content += `${i+1}. ${t}\n`;
  });
  content += `\n`;

  content += `--- OBIETTIVI DI BASE ---\n`;
  currentData.obiettivi.forEach((o, i) => {
   content += `${i+1}. ${o}\n`;
  });
  content += `\n`;

  content += `--- DECISIONI DI AGGIORNAMENTO REVISIONE ---\n`;
  const proposals = currentData.proposals || [];
  proposals.forEach(p => {
   const dec = decisions[p.id];
   let out = `Codice: ${p.id.toUpperCase()} | Focus: ${p.focus}\n`;
   if (dec === 'approved') out += ` -> ESITO: APPROVATO 2025\n -> TESTO: ${p.newText}\n`;
   else if (dec === 'rejected') out += ` -> ESITO: MANTENUTO DM 2012\n -> TESTO: ${p.oldText}\n`;
   else if (dec === 'custom') out += ` -> ESITO: PERSONALIZZATO DAL DOCENTE\n -> TESTO: ${customTexts[p.id]}\n`;
   else out += ` -> ESITO: DA DECIDERE (FALLBACK SU TESTO VIGENTE 2012)\n -> TESTO: ${p.oldText}\n`;
   content += out + `\n`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `curmanlight_${discipline}_${order}.txt`;
  link.click();
  showToast("Download del file .txt avviato");
 };

 // CML JSON File Exporter
 const handleDownloadCml = () => {
  const cmlData = {
   format: "CML-LIGHT-EXPORT",
   version: "1.3.0",
   timestamp: Date.now(),
   discipline,
   order,
   schoolYear,
   decisions,
   customTexts,
   selectedTraguardi,
   selectedObiettivi,
   selectedEvidenze
  };

  const blob = new Blob([JSON.stringify(cmlData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `proposta_${role}_${discipline}_${order}.cml`;
  link.click();
  showToast("Esportazione file di lavoro .cml completata con successo!");
 };


 // Generate Programmazione Annuale Document
 const handleGenerateProgrammazioneAnnualeDoc = () => {
  let title = `PROGRAMMAZIONE ANNUALE - CLASSE ${order === 'infanzia' ? targetSection : `${targetClass}^${targetSection}`}`;
  let text = `========================================================================\n`;
  text += `  ISTITUTO COMPRENSIVO CALVARIO-COVOTTA \"DON LORENZO MILANI\"\n`;
  text += `  Sede Centrale: Rione Covotta - Ariano Irpino (AV) - AVIC849003\n`;
  text += `========================================================================\n\n`;
  text += `DOCUMENTO:  PROGRAMMAZIONE ANNUALE DIDATTICA PER QUADRIMESTRI\n`;
  text += `DISCIPLINA:  ${discipline.toUpperCase()}\n`;
  text += `ORDINE:    ${order.toUpperCase()}\n`;
  text += `CLASSE:    ${order === 'infanzia' ? 'Sezione Unica' : `Classe ${targetClass}^ Sezione ${targetSection}`}\n`;
  text += `ANNO SCOL.:  ${schoolYear}\n`;
  text += `NORMATIVA:  Nuovo Ordinamento D.M. 221/2025 d'Istituto\n\n`;

  if (order === 'infanzia') {
   text += `--- STRUTTURA PER CAMPI DI ESPERIENZA (D.M. 221/2025) ---\n\n`;
   text += `1Ã‚Â° QUADRIMESTRE (Primo Semestre: Settembre - Gennaio)\n`;
   text += `=====================================================\n`;
   text += `* IL SÃƒâ€° E L'ALTRO: Sviluppo della fiducia in sÃƒÂ©, nell'altro e delle prime regole di convivenza d'Istituto.\n`;
   text += `* IL CORPO E IL MOVIMENTO: Presa di coscienza del proprio corpo nello spazio e coordinazione oculo-manuale.\n`;
   text += `* IMMAGINI, SUONI, COLORI: Esplorazione dei linguaggi artistici e sonori attraverso pattern d'Istituto.\n`;
   text += `* I DISCORSI E LE PAROLE: Sviluppo della frase corretta, ascolto attivo e pregrafismo in corsivo.\n`;
   text += `* LA CONOSCENZA DEL MONDO: Orientamento topologico e classificazione elementare di oggetti e stagioni.\n\n`;
   text += `2Ã‚Â° QUADRIMESTRE (Secondo Semestre: Febbraio - Giugno)\n`;
   text += `=====================================================\n`;
   text += `* IL SÃƒâ€° E L'ALTRO: Partecipazione a compiti di realtÃƒÂ  collaborativi d'Istituto e rispetto delle diversitÃƒÂ .\n`;
   text += `* IL CORPO E IL MOVIMENTO: Consolidamento degli schemi motori e approccio alla calligrafia fine.\n`;
   text += `* IMMAGINI, SUONI, COLORI: Uso creativo di materiali riciclati e drammatizzazione cooperativa.\n`;
   text += `* I DISCORSI E LE PAROLE: Avvicinamento alla scrittura spontanea e lettura condivisa di favole.\n`;
   text += `* LA CONOSCENZA DEL MONDO: Introduzione al coding giocoso e osservazione scientifica della biodiversitÃƒÂ .\n`;
  } else {
   text += `--- PIANIFICAZIONE CURRICOLARE ANNUALE DIVISA PER QUADRIMESTRI ---\n\n`;
   
   const q1Uda = savedUda.filter(u => u.discipline === discipline && u.period.includes("Primo"));
   const q2Uda = savedUda.filter(u => u.discipline === discipline && (u.period.includes("Secondo") || u.period.includes("Terzo")));

   text += `1Ã‚Â° QUADRIMESTRE (Settembre - Gennaio)\n`;
   text += `=====================================\n`;
   if (q1Uda.length > 0) {
    q1Uda.forEach((u, i) => {
     text += `Modulo ${i+1}: ${u.title}\n`;
     text += `- Ore previste: ${u.hours} ore\n`;
     text += `- Compito autentico: ${u.realTask}\n`;
     text += `- Traguardi d'Istituto coperti: ${u.traguardi.length}\n\n`;
    });
   } else {
    text += `Nel Primo Quadrimestre sono previsti i seguenti nuclei fondanti d'Istituto:\n`;
    const kb = localCurriculum[discipline]?.[order] || { traguardi: [], obiettivi: [] };
    text += `- Traguardo Prioritario: ${kb.traguardi[0] || 'Apprendimento e partecipazione.'}\n`;
    text += `- Obiettivo Fondante: ${kb.obiettivi[0] || 'Conoscenza delle strutture basilari.'}\n`;
    text += `- Ore stimate: 33 ore di programmazione.\n\n`;
   }

   text += `2Ã‚Â° QUADRIMESTRE (Febbraio - Giugno)\n`;
   text += `=====================================\n`;
   if (q2Uda.length > 0) {
    q2Uda.forEach((u, i) => {
     text += `Modulo ${i+1}: ${u.title}\n`;
     text += `- Ore previste: ${u.hours} ore\n`;
     text += `- Compito autentico: ${u.realTask}\n`;
     text += `- Traguardi d'Istituto coperti: ${u.traguardi.length}\n\n`;
    });
   } else {
    text += `Nel Secondo Quadrimestre si consolideranno i seguenti nuclei d'Istituto:\n`;
    const kb = localCurriculum[discipline]?.[order] || { traguardi: [], obiettivi: [] };
    text += `- Traguardo Prioritario: ${kb.traguardi[1] || 'Competenza comunicativa e metodologica.'}\n`;
    text += `- Obiettivo Fondante: ${kb.obiettivi[1] || 'Sintesi e applicazione formale.'}\n`;
    text += `- Ore stimate: 33 ore di programmazione.\n\n`;
   }

   text += `--- MEZZI, METODOLOGIE E STRATEGIE D'INCLUSIONE ---\n`;
   text += `* Metodologie: Cooperative Learning, brainstorming d'aula, didattica laboratoriale e problem solving.\n`;
   text += `* Inclusione (BES/DSA): Fogli speciali a righe, software compensativi d'Istituto e testi semplificati.\n`;
  }

  setGeneratedDocTitle(title);
  setGeneratedDocText(text);
 };

 // Generate Evaluation Report Document
 const handleGenerateRelazioneDoc = () => {
  let title = `RELAZIONE SCOLASTICA (INTERMEDIA/FINALE) - CLASSE ${order === 'infanzia' ? targetSection : `${targetClass}^${targetSection}`}`;
  let text = `========================================================================\n`;
  text += `  ISTITUTO COMPRENSIVO CALVARIO-COVOTTA \"DON LORENZO MILANI\"\n`;
  text += `  Rione Covotta - Ariano Irpino (AV) - AVIC849003\n`;
  text += `========================================================================\n\n`;
  text += `DOCUMENTO:  RELAZIONE INTERMEDIA E FINALE SULLA CLASSE\n`;
  text += `DISCIPLINA:  ${discipline.toUpperCase()}\n`;
  text += `ORDINE:    ${order.toUpperCase()}\n`;
  text += `CLASSE:    ${order === 'infanzia' ? 'Sezione Unica' : `Classe ${targetClass}^ Sezione ${targetSection}`}\n`;
  text += `ANNO SCOL.:  ${schoolYear}\n\n`;

  text += `1. PRESENTAZIONE GENERALE DELLA CLASSE\n`;
  text += `======================================\n`;
  text += `La classe si presenta coesa e relazionalmente vivace. La partecipazione alle attivitÃƒÂ  d'Istituto ÃƒÂ¨ costante e costruttiva. I ritmi di apprendimento e la maturazione globale sono risultati in linea con la programmazione d'inizio anno, pur evidenziando le consuete diversitÃƒÂ  di stile cognitivo e tempi di esecuzione.\n\n`;

  text += `2. SVOLGIMENTO DELLA PROGRAMMAZIONE & METODOLOGIE\n`;
  text += `=================================================\n`;
  text += `Il piano di lavoro annuale ÃƒÂ¨ stato svolto in maniera regolare. Si ÃƒÂ¨ fatto ampio ricorso alle seguenti risorse e metodologie d'Istituto:\n`;
  text += `- Metodologie: Cooperative Learning, didattica laboratoriale attiva, problem-solving e scoperta guidata.\n`;
  text += `- Strumenti Tecnologici: Lavagna Interattiva Multimediale (LIM d'Istituto), registri d'aula elettronici e presentazioni digitali d'area.\n`;
  text += `- Collaborazione con le Famiglie: Rapporti costanti attraverso colloqui, assemblee di interclasse e condivisione dei percorsi sul registro.\n\n`;

  text += `3. CRITERI DI VALUTAZIONE E INCLUSIONE (PEI/PDP/DSA)\n`;
  text += `===================================================\n`;
  text += `La valutazione ÃƒÂ¨ stata improntata in ottica formativa e diacronica d'Istituto:\n`;
  if (order === 'infanzia') {
   text += `- Si ÃƒÂ¨ fatto ricorso all'osservazione sistematica e qualitativa dei comportamenti dei bambini, monitorando lo sviluppo dell'autonomia, della competenza ed il rispetto delle regole nei 5 Campi di Esperienza.\n`;
  } else if (order === 'primaria') {
   text += `- In conformitÃƒÂ  con la nuova valutazione ministeriale (D.M. 172/2020), sono stati utilizzati i 4 livelli descrittivi di apprendimento d'Istituto:\n`;
   text += ` * AVANZATO: L'alunno porta a termine compiti complessi in situazioni note e non note, mobilitando risorse proprie in modo autonomo.\n`;
   text += ` * INTERMEDIO: L'alunno svolge compiti in situazioni nuove usando le risorse fornite in modo autonomo.\n`;
   text += ` * BASE: L'alunno svolge compiti semplici in situazioni nuove applicando regole fondamentali apprese d'Istituto.\n`;
   text += ` * INIZIALE: L'alunno svolge compiti semplici solo se guidato.\n`;
  } else {
   text += `- La valutazione ÃƒÂ¨ stata registrata mediante prove scritte, orali e compiti di realtÃƒÂ , raccordando i voti in decimi ai livelli di competenza chiave d'Istituto.\n`;
  }
  text += `- Per gli alunni BES o DSA, sono state applicate costantemente le misure compensative e dispensative previste nel rispettivo PDP o PEI, con fogli facilitati e tempi di esecuzione flessibili.\n`;

  setGeneratedDocTitle(title);
  setGeneratedDocText(text);
 };

 // Generate Grade-Specific Document (Infanzia, Primaria or Secondaria)
 const handleGenerateSpecificoGradoDoc = () => {
  let title = "";
  let text = `========================================================================\n`;
  text += `  ISTITUTO COMPRENSIVO CALVARIO-COVOTTA \"DON LORENZO MILANI\"\n`;
  text += `  Rione Covotta - Ariano Irpino (AV) - AVIC849003\n`;
  text += `========================================================================\n\n`;

  if (order === 'infanzia') {
   title = `SCHEDA DI OSSERVAZIONE PEDAGOGICA QUALITATIVA - SEZIONE ${targetSection}`;
   text += `DOCUMENTO:  SCHEDA DI OSSERVAZIONE DI FINE ANNO\n`;
   text += `GRADO:    SCUOLA DELL'INFANZIA d'Istituto\n`;
   text += `SEZIONE:   Sezione ${targetSection}\n`;
   text += `ANNO SCOL.:  ${schoolYear}\n\n`;

   text += `--- GRIGLIA DI OSSERVAZIONE QUALITATIVA DEI CAMPI DI ESPERIENZA ---\n\n`;
   text += `1. IL SÃƒâ€° E L'ALTRO:\n`;
   text += `- Il bambino esprime fiducia e stima in sÃƒÂ©, coopera con i compagni e riconosce i sentimenti altrui.\n`;
   text += `2. IL CORPO E IL MOVIMENTO:\n`;
   text += `- Controlla gli schemi motori globali, possiede coordinazione fine ed orientamento nello spazio d'aula.\n`;
   text += `3. IMMAGINI, SUONI, COLORI:\n`;
   text += `- Utilizza materiali diversi con creativitÃƒÂ , partecipa a canti ed esplora linguaggi iconici.\n`;
   text += `4. I DISCORSI E LE PAROLE:\n`;
   text += `- Usa la lingua italiana corretta, racconta brevi favole in sequenza e sperimenta prime forme di pregrafismo.\n`;
   text += `5. LA CONOSCENZA DEL MONDO:\n`;
   text += `- Colloca eventi nel tempo (prima/dopo), raggruppa ed ordina elementi naturali d'Istituto.\n`;
  } else if (order === 'primaria') {
   title = `RELAZIONE SUI LIVELLI DI VALUTAZIONE DESCRITTIVA - CLASSE ${targetClass}^${targetSection}`;
   text += `DOCUMENTO:  RELAZIONE SUI LIVELLI DI VALUTAZIONE DESCRITTIVA (D.M. 172/2020)\n`;
   text += `GRADO:    SCUOLA PRIMARIA d'Istituto\n`;
   text += `CLASSE:    Classe ${targetClass}^ Sezione ${targetSection}\n`;
   text += `ANNO SCOL.:  ${schoolYear}\n\n`;

   text += `--- QUADRO DI DECODIFICA DEL VALORE FORMATIVO DEI GIUDIZI ---\n\n`;
   text += `In conformitÃƒÂ  con le linee guida della valutazione descrittiva d'Istituto:\n`;
   text += `1. LIVELLO AVANZATO (Voto 9-10):\n`;
   text += `- L'alunno/a porta a termine compiti in situazioni note e non note, mobilitando risorse proprie in modo autonomo e continuo.\n`;
   text += `2. LIVELLO INTERMEDIO (Voto 7-8):\n`;
   text += `- L'alunno/a risolve problemi in situazioni nuove, compie scelte consapevoli usando risorse fornite d'Istituto.\n`;
   text += `3. LIVELLO BASE (Voto 6):\n`;
   text += `- Svolge compiti semplici in situazioni nuove applicando regole fondamentali apprese d'Istituto.\n`;
   text += `4. LIVELLO INIZIALE (Voto 4-5):\n`;
   text += `- Svolge compiti semplici in situazioni note solo se opportunamente guidato dal docente.\n\n`;
   text += `La valutazione descrittiva favorisce la trasparenza del progresso formativo del bambino ed il raccordo scuola-famiglia.\n`;
  } else {
   title = `DOCUMENTO DEL PROGRAMMA SVOLTO (STATE EXAM) - CLASSE 3^${targetSection}`;
   text += `DOCUMENTO:  DOCUMENTO DEL PROGRAMMA DIDATTICO SVOLTO (D.Lgs. 62/2017)\n`;
   text += `GRADO:    SCUOLA SECONDARIA DI PRIMO GRADO d'Istituto\n`;
   text += `CLASSE:    Classe 3^ Sezione ${targetSection} (Classe Terminale)\n`;
   text += `DISCIPLINA:  ${discipline.toUpperCase()}\n`;
   text += `ANNO SCOL.:  ${schoolYear}\n\n`;

   text += `--- RELAZIONE DEL PROGRAMMA DIDATTICO SVOLTO PER L'ESAME DI STATO ---\n\n`;
   text += `Il sottoscritto docente dichiara che per l'a.s. ${schoolYear} nella Classe 3^ Sezione ${targetSection} ÃƒÂ¨ stato svolto il seguente programma didattico d'allineamento curricolare:\n\n`;
   
   text += `NUCLEI TEMATICI SVOLTI & MONTE ORE REALE:\n`;
   text += `==========================================\n`;
   text += `* Nucleo 1: Introduzione e Inquadramento d'Area (${discipline}) - Svolto nel 1Ã‚Â° Quadrimestre (15 ore)\n`;
   text += `* Nucleo 2: Consolidamento degli strumenti logici ed etici d'area - Svolto nel 1Ã‚Â° Quadrimestre (18 ore)\n`;
   text += `* Nucleo 3: Approfondimento avanzato, compiti autentici e laboratori - Svolto nel 2Ã‚Â° Quadrimestre (22 ore)\n`;
   text += `* Nucleo 4: Sviluppo del pensiero critico mediale e raccordi civici d'area - Svolto nel 2Ã‚Â° Quadrimestre (11 ore)\n\n`;

   text += `COMPETENZE CHIAVE EUROPEE CONSOLIDATE:\n`;
   text += `=======================================\n`;
   text += `- Competenza Alfabetica Funzionale ed Espressione culturale.\n`;
   text += `- Competenza STEM (Logica, accuratezza logico-scientifico e prototipazione d'Istituto).\n`;
   text += `- Competenza Digitale Consapevole (Comprensione degli algoritmi I.A. ed etica dell'informazione).\n\n`;

   text += `FIRMA DEL DOCENTE: _____________________________________\n\n`;
   text += `FIRMA DEI RAPPRESENTANTI DEGLI ALUNNI:\n`;
   text += `1. _____________________________________\n`;
   text += `2. _____________________________________\n`;
  }

  setGeneratedDocTitle(title);
  setGeneratedDocText(text);
 };


 return {
  handleDownloadWordDefinitivo,
  handleDownloadWordDocx,
  handleDownloadODF,
  handlePrintDocumentPdf,
  handleDownloadCurricoloPDF,
  handleDownloadRichMarkdown,
  handleDownloadPdfDirect,
  handleDownloadWordConfronto,
  handleCopyToClipboardFormatted,
  handleDownloadTxt,
  handleDownloadCml,
  handleGenerateProgrammazioneAnnualeDoc,
  handleGenerateRelazioneDoc,
  handleGenerateSpecificoGradoDoc
 };
}