import type { UdaModel } from '../../../types/curriculum';
import { projectA07InstitutionalDocumentHeader, type A07InstitutionalDocumentRead } from '../../../domain/institution';
import { LocalZipPacker } from '../../../lib/localZipPacker';
import { escapeHtml } from '../../../lib/escapeHtml';

const escapeHtmlWithBreaks = (value: string): string => escapeHtml(value).replace(/\r?\n/g, '<br>');
const escapeXml = (value: string): string => escapeHtml(value);

type UseUdaPackageHandlersArgs = {
 savedUda: UdaModel[];
 targetClass: string;
 targetSection: string;
 showToast: (msg: string, success?: boolean) => void;
 institutionalProfile: A07InstitutionalDocumentRead;
};

export function useUdaPackageHandlers({
 savedUda,
 targetClass,
 targetSection,
 showToast,
 institutionalProfile
}: UseUdaPackageHandlersArgs) {
 const notifyA07Result = (message: string, success = true) => {
  showToast(institutionalProfile.warning ? `${institutionalProfile.warning} ${message}` : message, institutionalProfile.warning ? false : success);
 };
 const projection = projectA07InstitutionalDocumentHeader(institutionalProfile);
 const identityLines = [projection.primaryHeading, projection.displayName, ...projection.secondaryLines, projection.declaredRoleLine]
  .filter((line): line is string => Boolean(line));
 const identityText = identityLines.join('\n');
 const identityHtml = identityLines.map(line => `<div>${escapeHtml(line)}</div>`).join('');
 const copyUdaTextLocal = (id: string) => {
  const u = savedUda.find(item => item.id === id);
  if (!u) return;

  let text = `${identityText}\n\nUNITA' DI APPRENDIMENTO (UDA): ${u.title.toUpperCase()}\n`;
  text += `Discipline correlate: ${u.discipline.toUpperCase()} (${u.order.toUpperCase()})\n`;
  text += `Periodo di svolgimento: ${u.period} (Monte ore: ${u.hours} ore)\n\n`;
  
  text += `1. TRAGUARDI DI RIFERIMENTO:\n`;
  u.traguardi.forEach((t) => { text += `- ${t}\n`; });
  text += `\n`;

  text += `2. OBIETTIVI FORMATIVI:\n`;
  u.obiettivi.forEach((ob) => { text += `- ${ob}\n`; });
  text += `\n`;

  text += `3. EVIDENZE DI COMPETENZA OSSERVABILI:\n`;
  u.evidenze.forEach((e) => { text += `- ${e}\n`; });
  text += `\n`;

  text += `4. COMPITO DI REALTA' / PRODOTTO ATTESO:\n${u.realTask}\n\n`;
  text += `5. NOTE METODOLOGICHE:\n${u.notes}\n`;
  if (projection.footer) text += `\n${projection.footer}\n`;

  navigator.clipboard.writeText(text).then(() => {
    notifyA07Result("Testo completo dell'UDA copiato negli appunti!");
  }).catch(err => {
   console.error("Errore nella copia:", err);
    notifyA07Result("Errore durante la copia dell'UDA negli appunti.", false);
  });
 };

 const copyUdaForRegister = (id: string) => {
  const u = savedUda.find(item => item.id === id);
  if (!u) return;
  let text = `${identityText}\n\n*** TRACCIATO LOCALE DI CO-PROGETTAZIONE UDA ***\n`;
  text += `MODULO: ${u.title.toUpperCase()}\n`;
  text += `DISCIPLINA: ${u.discipline.toUpperCase()} (${u.order.toUpperCase()})\n`;
  text += `PERIODO / ORE: ${u.period} - Ore previste: ${u.hours}\n`;
  text += `CLASSE/SEZIONE: Classe ${targetClass}^ Sezione ${targetSection}\n\n`;
  text += `TRAGUARDI SELEZIONATI:\n`;
  u.traguardi.forEach((t) => { text += `- ${t}\n`; });
  text += `\nOBIETTIVI FORMATIVI:\n`;
  u.obiettivi.forEach((o) => { text += `- ${o}\n`; });
  text += `\nCOMPITO DI REALTÃƒâ‚¬ / PRODOTTO ATTESO:\n"${u.realTask}"\n\n`;
  text += `MISURE METODOLOGICHE & INCLUSIONE (PEI/PDP/DSA):\n"${u.notes}"\n`;
  text += `\nGenerato localmente con CurManLight`;
  if (projection.footer) text += `\n${projection.footer}`;
  
  navigator.clipboard.writeText(text).then(() => {
    notifyA07Result("Tracciato per Registro Elettronico (Argo/ClasseViva) copiato!", true);
  }).catch(() => {
    notifyA07Result("Errore durante la copia del tracciato locale.", false);
  });
 };

 const handleDownloadScormManifest = (id: string) => {
  const u = savedUda.find(item => item.id === id);
  if (!u) return;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
   xml += `<manifest identifier="UDA-${escapeXml(u.id)}" version="1.1"\n`;
  xml += `     xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"\n`;
  xml += `     xmlns:adlcp="http://www.adlnet.org/Adlcp_v1p2"\n`;
  xml += `     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  xml += `     xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd\n`;
  xml += `               http://www.adlnet.org/xsd/adlcp_v1p2 adlcp_v1p2.xsd">\n`;
  xml += ` <metadata>\n`;
  xml += `  <schema>ADL SCORM</schema>\n`;
  xml += `  <schemaversion>1.2</schemaversion>\n`;
  xml += `  <lom xmlns="http://ltsc.ieee.org/xsd/LOM">\n`;
  xml += `   <general>\n`;
   xml += `    <title><string language="it">${escapeXml(u.title)}</string></title>\n`;
  xml += `    <description><string language="it">Progettazione curricolare locale - UDA</string></description>\n`;
  xml += `    <keyword><string language="it">CURRICOLO</string></keyword>\n`;
  xml += `    <keyword><string language="it">UDA</string></keyword>\n`;
   xml += `    <identifier>UDA-${escapeXml(u.id)}</identifier>\n`;
  xml += `    <language>it</language>\n`;
  xml += `   </general>\n`;
  xml += `   <lifecycle>\n`;
   xml += `    <version><string language="it">v1.0.0 (${escapeXml(String(u.status))})</string></version>\n`;
  xml += `   </lifecycle>\n`;
  xml += `   <technical>\n`;
  xml += `    <format>application/zip</format>\n`;
   xml += `    <location>scorm_package_${escapeXml(u.id)}.zip</location>\n`;
  xml += `   </technical>\n`;
  xml += `   <localMetadata>\n`;
   if (projection.primaryHeading) xml += `    <primaryHeading>${escapeXml(projection.primaryHeading)}</primaryHeading>\n`;
   xml += `    <displayName>${escapeXml(projection.displayName)}</displayName>\n`;
   projection.secondaryLines.forEach(line => { xml += `    <secondaryLine>${escapeXml(line)}</secondaryLine>\n`; });
   if (projection.footer) xml += `    <footer>${escapeXml(projection.footer)}</footer>\n`;
   if (projection.declaredRoleLine) xml += `    <declaredRole>${escapeXml(projection.declaredRoleLine)}</declaredRole>\n`;
  xml += `    <tipoDocumento>UDA (UnitÃƒÂ  di Apprendimento)</tipoDocumento>\n`;
  xml += `    <chiaveLettura>CURRICOLO / UDA</chiaveLettura>\n`;
  xml += `   </localMetadata>\n`;
  xml += `  </lom>\n`;
  xml += ` </metadata>\n`;
   xml += ` <organizations default="${escapeXml(institutionalProfile.organizationId)}">\n`;
   xml += `  <organization identifier="${escapeXml(institutionalProfile.organizationId)}">\n`;
   xml += `   <title>${escapeXml(u.title)}</title>\n`;
   xml += `   <item identifier="ITEM-${escapeXml(u.id)}" identifierref="RES-${escapeXml(u.id)}">\n`;
   xml += `    <title>${escapeXml(u.title)}</title>\n`;
  xml += `   </item>\n`;
  xml += `  </organization>\n`;
  xml += ` </organizations>\n`;
  xml += ` <resources>\n`;
   xml += `  <resource identifier="RES-${escapeXml(u.id)}" type="webcontent" adlcp:scormtype="sco" href="uda_content.html">\n`;
  xml += `   <file href="uda_content.html"/>\n`;
  xml += `  </resource>\n`;
  xml += ` </resources>\n`;
  xml += `</manifest>`;

  let htmlContent = `<!DOCTYPE html>
<html lang="it">
<head>
 <meta charset="UTF-8">
 <title>${escapeHtml(u.title)}</title>
 <style>
  body { font-family: sans-serif; padding: 30px; background: #f8fafc; color: #1e293b; max-width: 800px; margin: 0 auto; }
  h1 { color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
  .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; font-weight: bold; }
  .section { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .section h2 { margin-top: 0; font-size: 14px; text-transform: uppercase; color: #4338ca; }
  ul { padding-left: 20px; }
  li { margin-bottom: 8px; }
 </style>
 <script>
  // Real, Offline-First SCORM 1.2 API Runtime Wrapper
  var scormAPI = null;
  var startTime = Date.now();

  function findAPI(win) {
   var findAttempts = 0;
   while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
    findAttempts++;
    if (findAttempts > 500) return null;
    win = win.parent;
   }
   return win.API;
  }

  function initSCORM() {
   scormAPI = findAPI(window);
   if (scormAPI == null && window.opener != null) {
    scormAPI = findAPI(window.opener);
   }
   
   if (scormAPI != null) {
    scormAPI.LMSInitialize("");
    scormAPI.LMSSetValue("cmi.core.lesson_status", "incomplete");
    scormAPI.LMSCommit("");
    console.log("[SCORM locale] Attività inizializzata.");
   } else {
    console.log("[SCORM locale] Nessuna piattaforma collegata. Esecuzione locale.");
   }
  }

  function submitQuiz() {
   var elapsedSeconds = (Date.now() - startTime) / 1000;
   // Uses a local reading threshold for this self-assessment.
   if (elapsedSeconds < 180) {
    alert("Tempo di consultazione breve. Dedica almeno 3 minuti alla lettura prima di registrare l'autovalutazione.");
    return;
   }

   var q1 = document.querySelector('input[name="q1"]:checked');
   var q2 = document.querySelector('input[name="q2"]:checked');
   
   if (!q1 || !q2) {
    alert(" Per favore, rispondi a tutte le domande dell'autovalutazione prima di inviare!");
    return;
   }
   
   var score = 0;
   if (q1.value === "correct") score += 50;
   if (q2.value === "correct") score += 50;
   
   if (scormAPI != null) {
    scormAPI.LMSSetValue("cmi.core.score.raw", score.toString());
    scormAPI.LMSSetValue("cmi.core.lesson_status", "completed");
    scormAPI.LMSCommit("");
    alert("Risultato inviato all'ambiente SCORM. Punteggio: " + score + "%");
   } else {
    alert("Risultato disponibile localmente. Punteggio: " + score + "%");
   }
   
   document.getElementById('quiz-result').innerHTML = "<strong>Stato invio:</strong> Autovalutazione completata. Risultato registrato: <strong>" + score + "%</strong>.";
  }

  function finishSCORM() {
   if (scormAPI != null) {
    scormAPI.LMSSetValue("cmi.core.exit", "suspend");
    scormAPI.LMSCommit("");
    scormAPI.LMSFinish("");
    console.log("[SCORM locale] Sessione terminata.");
   }
  }

  window.onload = initSCORM;
  window.onbeforeunload = finishSCORM;
 </script>
</head>
<body>
 <div class="meta">${identityHtml}</div>
 <h1>${escapeHtml(u.title)}</h1>
  <div class="meta">Disciplina: ${escapeHtml(u.discipline.toUpperCase())} | Grado: ${escapeHtml(u.order.toUpperCase())} | Ore: ${escapeHtml(String(u.hours))} ore</div>
 
 <div class="section">
  <h2>Traguardi</h2>
   <ul>${u.traguardi.map(t => `<li>${escapeHtmlWithBreaks(t)}</li>`).join('')}</ul>
 </div>
 
 <div class="section">
  <h2>Obiettivi di Apprendimento</h2>
   <ul>${u.obiettivi.map(ob => `<li>${escapeHtmlWithBreaks(ob)}</li>`).join('')}</ul>
 </div>
 
 <div class="section">
  <h2>Evidenze di Competenza (D.M. 14/2024)</h2>
   <ul>${u.evidenze.map(ev => `<li>${escapeHtmlWithBreaks(ev)}</li>`).join('')}</ul>
 </div>
 
 <div class="section">
  <h2>Compito di RealtÃƒÂ </h2>
   <p><em>"${escapeHtmlWithBreaks(u.realTask)}"</em></p>
 </div>
 
 <div class="section">
  <h2>Note didattiche d'aula</h2>
   <p>${escapeHtmlWithBreaks(u.notes || 'Nessuna nota aggiuntiva.')}</p>
 </div>

 <div class="section" style="border: 2px solid #cbd5e1; background-color: #f8fafc;">
  <h2>Autovalutazione locale</h2>
  <p style="font-size: 11px; font-weight: bold; color: #64748b;">Completa le domande per registrare un esito locale o inviarlo all'ambiente SCORM collegato:</p>
  
  <div style="margin-top: 15px;">
   <div style="margin-bottom: 15px;">
    <p><strong>1. Qual ÃƒÂ¨ lo scopo fondamentale di questa UnitÃƒÂ  di Apprendimento (UDA)?</strong></p>
    <label style="display: block; margin-top: 5px; cursor: pointer;"><input type="radio" name="q1" value="wrong"> Svolgere memorizzazioni passive di nozioni</label>
    <label style="display: block; margin-top: 5px; cursor: pointer;"><input type="radio" name="q1" value="correct"> Sviluppare competenze attraverso un compito di realtÃƒÂ  autentico</label>
   </div>
   
   <div style="margin-bottom: 15px;">
    <p><strong>2. Come vengono descritti gli esiti in questa attivitÃƒÂ ?</strong></p>
    <label style="display: block; margin-top: 5px; cursor: pointer;"><input type="radio" name="q2" value="correct"> Tramite i 4 livelli nazionali (Avanzato, Intermedio, Base, Iniziale)</label>
    <label style="display: block; margin-top: 5px; cursor: pointer;"><input type="radio" name="q2" value="wrong"> Tramite un solo giudizio numerico fisso non modificabile</label>
   </div>
  </div>
  
  <button onclick="submitQuiz()" style="margin-top: 10px; background-color: #4f46e5; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: background-color 0.2s;">
   Registra autovalutazione
  </button>
  
  <p id="quiz-result" style="margin-top: 15px; color: #1e1b4b; font-weight: bold;"></p>
 </div>
 ${projection.footer ? `<footer>${escapeHtml(projection.footer)}</footer>` : ''}
</body>
</html>`;

  // Pack everything using LocalZipPacker nativo client-side (Fase A)
  const packer = new LocalZipPacker();
  packer.addFile('imsmanifest.xml', xml);
  packer.addFile('uda_content.html', htmlContent);

  const zipBlob = packer.exportZip();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = `scorm_package_${u.id}.zip`;
  link.click();
  notifyA07Result("Pacchetto SCORM locale scaricato con successo!", true);
 };


 return {
  copyUdaTextLocal,
  copyUdaForRegister,
  handleDownloadScormManifest
 };
}
