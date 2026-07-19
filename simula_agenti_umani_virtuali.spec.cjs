// simula_agenti_umani_virtuali.spec.cjs
const { test, expect } = require('@playwright/test');
const path = require('path');

// Definizione estocastica e parametrica dei 3 Agenti Umani Virtuali d'Istituto (v5.0-Ultimate)
const AgentiIstituzionali = {
  'Chiara_Verdi_Tradizionalista': {
    nome: 'Prof.ssa Chiara Verdi (Scuola Primaria - Lettere, Bassa Skill Digitale)',
    preparazioneMentaleMultiplier: 1.5, // Coefficiente di esitazione cognitiva (KLM)
    probabilitaMissClick: 0.8,          // Alta probabilità di errore di tocco alla LIM (Fitts)
    layoutPreferito: 'wizard',
    ordine: 'primaria',
    disciplina: 'italiano',
    tendenzaSceltaDescrittoreStandard: false
  },
  'Marco_Rossi_Tecnologico': {
    nome: 'Prof. Marco Rossi (Scuola Secondaria - Tecnologia, Alta Skill Digitale)',
    preparazioneMentaleMultiplier: 0.25, // Navigatore istantaneo, risposte rapide (GOMS)
    probabilitaMissClick: 0.01,          // Precisione millimetrica
    layoutPreferito: 'grid',
    ordine: 'secondaria',
    disciplina: 'tecnologia',
    tendenzaSceltaDescrittoreStandard: false
  },
  'Rosa_Bruno_Sostegno': {
    nome: 'Ins. Rosa Bruno (Docente di Sostegno, Esperta in Privacy & GDPR)',
    preparazioneMentaleMultiplier: 0.8, // Standard
    probabilitaMissClick: 0.05,
    layoutPreferito: 'wizard',
    ordine: 'primaria',
    disciplina: 'italiano',
    tendenzaSceltaDescrittoreStandard: true // Usa molto i descrittori standard d'Istituto
  }
};

test.describe('OIV Telemetria - Motore di Simulazione degli Agenti Umani Virtuali d\'Istituto', () => {

  // ==========================================
  // SIMULAZIONE 1: CHIARA VERDI (Primaria - Lettere)
  // ==========================================
  test(`Simulazione 1: ${AgentiIstituzionali['Chiara_Verdi_Tradizionalista'].nome}`, async ({ page }) => {
    const Agente = AgentiIstituzionali['Chiara_Verdi_Tradizionalista'];
    await page.setViewportSize({ width: 1280, height: 800 });
    
    const filePath = 'file://' + path.resolve('/home/user/dist/index.html');
    console.log(`\n▶️ Avvio SIMULAZIONE 1 per: ${Agente.nome}`);
    await page.goto(filePath);
    await page.waitForTimeout(1000 * Agente.preparazioneMentaleMultiplier);

    // Gestione confirm auto-pull cloud (Chiara Verdi rifiuta per incertezza)
    page.on('dialog', async dialog => {
      console.log(`   [Dialogo Cloud] Intercettato: "${dialog.message().substring(0, 50)}..."`);
      await page.waitForTimeout(1000 * Agente.preparazioneMentaleMultiplier);
      await dialog.dismiss(); // Clic su Annulla
      console.log(`   [Dialogo Cloud] Esito: ANNULLA. Attivato Interlock di Sicurezza.`);
    });

    // Passo 1 d'Onboarding: Ruolo Insegnante (Scoping dentro .max-w-lg del modale per evitare il bottone header)
    console.log(`   [Onboarding Step 1] Profilazione ruolo...`);
    const ruoloBtn = page.locator('.max-w-lg button', { hasText: 'Insegnante' }).first();
    await expect(ruoloBtn).toBeVisible();
    await page.waitForTimeout(500 * Agente.preparazioneMentaleMultiplier);
    await ruoloBtn.click({ force: true });

    const proseguiBtn = page.locator('.max-w-lg button', { hasText: 'Prossimo' }).first();
    await proseguiBtn.click({ force: true });

    // Passo 2 d'Onboarding: Ordine Primaria
    console.log(`   [Onboarding Step 2] Profilazione ordine...`);
    await page.waitForTimeout(600 * Agente.preparazioneMentaleMultiplier);
    const ordineBtn = page.locator('.max-w-lg button', { hasText: 'Primaria' }).first();
    await expect(ordineBtn).toBeVisible();
    await ordineBtn.click({ force: true });
    await proseguiBtn.click({ force: true });

    // Passo 3 d'Onboarding: Disciplina Italiano
    console.log(`   [Onboarding Step 3] Profilazione materia...`);
    await page.waitForTimeout(500 * Agente.preparazioneMentaleMultiplier);
    const selectDropdown = page.locator('.max-w-lg select.p-3.bg-white').first();
    await expect(selectDropdown).toBeVisible();
    await selectDropdown.selectOption(Agente.disciplina);
    await proseguiBtn.click({ force: true });

    // Passo 4 d'Onboarding: Gestione Sezioni ed inserimento Sezione ROSSA
    console.log(`   [Onboarding Step 4] Gestione sezioni...`);
    await page.waitForTimeout(800 * Agente.preparazioneMentaleMultiplier);
    const inputSezione = page.locator('.max-w-lg input[placeholder="Es. D, E, ROSSA..."]').first();
    await expect(inputSezione).toBeVisible();
    await inputSezione.fill('ROSSA');
    
    const aggiungiBtn = page.locator('.max-w-lg button', { hasText: 'Aggiungi' }).first();
    await aggiungiBtn.click({ force: true });

    // Clic con probabilità di miss-click su 1^Rossa (Legge di Fitts d'Istituto)
    const targetBtn = page.locator('.max-w-lg button', { hasText: '1^Rossa' }).first();
    const box = await targetBtn.boundingBox();
    if (box && Math.random() < Agente.probabilitaMissClick) {
      console.log(`   [Fitts Miss-Click] Tocco errato simulato sul lato sinistro.`);
      await page.mouse.click(box.x - 5, box.y + box.height / 2);
      await page.waitForTimeout(1000 * Agente.preparazioneMentaleMultiplier); // Pausa di frustrazione
    }
    await targetBtn.click({ force: true });

    const salvaBtn = page.locator('.max-w-lg button', { hasText: 'Salva Profilo' }).first();
    await salvaBtn.click({ force: true });
    console.log(`   [Onboarding] Onboarding completato con successo. Ingresso in Dashboard.`);
    await page.waitForTimeout(1500);

    // Navigazione a Compilatore UDA ed esitazione semantica
    const navProgettaBtn = page.locator('[role="button"]', { hasText: 'Compilatore UDA' }).first();
    await navProgettaBtn.click({ force: true });
    console.log(`   [Attivita] Navigazione a Compilatore UDA.`);

    const nuovaUdaBtn = page.locator('button', { hasText: 'Crea Nuova UDA' }).first();
    if (await nuovaUdaBtn.isVisible()) {
      await nuovaUdaBtn.click({ force: true });
    }

    console.log(`   [Hick Hesitation] Simulazione di Esitazione Semantica nella ricerca...`);
    await page.waitForTimeout(2000 * Agente.preparazioneMentaleMultiplier);

    // Navigazione a ritroso su Consulta Curricolo
    const navCurricoloBtn = page.locator('button', { hasText: 'Consulta Curricolo' }).first();
    await navCurricoloBtn.click({ force: true });
    console.log(`   [Hick Backtracking] Navigazione a ritroso su Consulta Curricolo.`);
    await page.waitForTimeout(1000);

    console.log(`✔️ SIMULAZIONE 1 conclusa con successo per ${Agente.nome}!`);
  });


  // ==========================================
  // SIMULAZIONE 2: MARCO ROSSI (Secondaria - Tecnologia)
  // ==========================================
  test(`Simulazione 2: ${AgentiIstituzionali['Marco_Rossi_Tecnologico'].nome}`, async ({ page }) => {
    const Agente = AgentiIstituzionali['Marco_Rossi_Tecnologico'];
    await page.setViewportSize({ width: 1280, height: 800 });
    
    const filePath = 'file://' + path.resolve('/home/user/dist/index.html');
    console.log(`\n▶️ Avvio SIMULAZIONE 2 per: ${Agente.nome}`);
    await page.goto(filePath);
    await page.waitForTimeout(500 * Agente.preparazioneMentaleMultiplier); // Clic fulminei

    // Passo 1 d'Onboarding: Ruolo Insegnante (Scoping dentro la classe .max-w-lg)
    const ruoloBtn = page.locator('.max-w-lg button', { hasText: 'Insegnante' }).first();
    await expect(ruoloBtn).toBeVisible();
    await ruoloBtn.click({ force: true });

    const proseguiBtn = page.locator('.max-w-lg button', { hasText: 'Prossimo' }).first();
    await proseguiBtn.click({ force: true });

    // Passo 2 d'Onboarding: Ordine Secondaria
    const ordineBtn = page.locator('.max-w-lg button', { hasText: 'Secondaria' }).first();
    await expect(ordineBtn).toBeVisible();
    await ordineBtn.click({ force: true });
    await proseguiBtn.click({ force: true });

    // Passo 3 d'Onboarding: Disciplina Tecnologia
    const selectDropdown = page.locator('.max-w-lg select.p-3.bg-white').first();
    await expect(selectDropdown).toBeVisible();
    await selectDropdown.selectOption(Agente.disciplina);
    await proseguiBtn.click({ force: true });

    // Passo 4 d'Onboarding: Clic rapido sulle combinazioni Classe-Sezione
    console.log(`   [Onboarding Step 4] Selezione combinazioni Classe-Sezione...`);
    const combo1A = page.locator('.max-w-lg button', { hasText: '1^A' }).first();
    const combo2A = page.locator('.max-w-lg button', { hasText: '2^A' }).first();
    await expect(combo1A).toBeVisible();
    await combo1A.click({ force: true });
    await combo2A.click({ force: true });

    const salvaBtn = page.locator('.max-w-lg button', { hasText: 'Salva Profilo' }).first();
    await salvaBtn.click({ force: true });
    console.log(`   [Onboarding] Completato istantaneamente.`);
    await page.waitForTimeout(1000);

    // Navigazione rapida a Consulta Curricolo ad albero (Pillar Grid)
    const navCurricoloBtn = page.locator('button', { hasText: 'Consulta Curricolo' }).first();
    await navCurricoloBtn.click({ force: true });
    console.log(`   [Attivita] Consultazione della Pillar Grid d'Istituto.`);
    await page.waitForTimeout(1000);

    console.log(`✔️ SIMULAZIONE 2 conclusa con successo per ${Agente.nome}!`);
  });


  // ==========================================
  // SIMULAZIONE 3: ROSSA BRUNO (Sostegno con Blocco GDPR e Reset)
  // ==========================================
  test(`Simulazione 3: ${AgentiIstituzionali['Rosa_Bruno_Sostegno'].nome}`, async ({ page }) => {
    const Agente = AgentiIstituzionali['Rosa_Bruno_Sostegno'];
    await page.setViewportSize({ width: 1280, height: 800 });
    
    const filePath = 'file://' + path.resolve('/home/user/dist/index.html');
    console.log(`\n▶️ Avvio SIMULAZIONE 3 per: ${Agente.nome}`);
    await page.goto(filePath);
    await page.waitForTimeout(1000 * Agente.preparazioneMentaleMultiplier);

    // Passo 1 d'Onboarding: Ruolo Sostegno (Scoping dentro la classe .max-w-lg)
    console.log(`   [Onboarding Step 1] Profilazione Sostegno...`);
    const ruoloBtn = page.locator('.max-w-lg button', { hasText: 'Insegnante' }).first();
    await expect(ruoloBtn).toBeVisible();
    await ruoloBtn.click({ force: true });

    // Attiva la tipologia di cattedra "Sostegno"
    const sostegnoToggle = page.locator('.max-w-lg button', { hasText: 'Sostegno' }).first();
    await expect(sostegnoToggle).toBeVisible();
    await sostegnoToggle.click({ force: true });

    const proseguiBtn = page.locator('.max-w-lg button', { hasText: 'Prossimo' }).first();
    await proseguiBtn.click({ force: true });

    // Passo 2 d'Onboarding: Ordine Primaria
    console.log(`   [Onboarding Step 2] Profilazione ordine...`);
    const ordineBtn = page.locator('.max-w-lg button', { hasText: 'Primaria' }).first();
    await expect(ordineBtn).toBeVisible();
    await ordineBtn.click({ force: true });
    await proseguiBtn.click({ force: true });

    // Passo 4 d'Onboarding (Sostegno salta passo 3 d'area): Scelta classe 1^A
    console.log(`   [Onboarding Step 4] Selezione combinazioni classe per sostegno...`);
    const combo1A = page.locator('.max-w-lg button', { hasText: '1^A' }).first();
    await expect(combo1A).toBeVisible();
    await combo1A.click({ force: true });

    const salvaBtn = page.locator('.max-w-lg button', { hasText: 'Salva Profilo' }).first();
    await salvaBtn.click({ force: true });
    console.log(`   [Onboarding] Completato per posto di Sostegno d'Istituto.`);
    await page.waitForTimeout(1500);

    // Navigazione ad Ambiente & Esiti Classe
    const navAmbienteBtn = page.locator('[role="button"]', { hasText: 'Ambiente & Esiti Classe' }).first();
    await navAmbienteBtn.click({ force: true });
    console.log(`   [Attivita] Apertura Ambiente & Esiti Classe.`);
    await page.waitForTimeout(2000);

    // Apri scheda feedback del primo alunno d'aula (Matteo Rossi / Einstein)
    const cardMatteo = page.locator('button', { hasText: 'Valuta' }).first();
    await expect(cardMatteo).toBeVisible();
    await cardMatteo.click({ force: true });
    console.log(`   [Attivita] Apertura scheda osservazioni studente.`);

    // Seleziona un descrittore standard d'Istituto dal dropdown (Proposta 2 - GDPR Safe)
    console.log(`   [GDPR Remediation] Uso del Sintetizzatore Qualitativo d'Istituto...`);
    const descrittoreSelect = page.locator('select', { hasText: 'Descrittore Standard' }).first();
    await expect(descrittoreSelect).toBeVisible();
    await descrittoreSelect.selectOption("Mostra spiccata autonomia, originalità e fluidità nello svolgimento del compito di realtà d'Istituto.");
    
    // Clicca su Conferma
    const confermaBtn = page.locator('button', { hasText: 'Conferma' }).first();
    await confermaBtn.click({ force: true });
    console.log(`   [Attivita] Osservazione qualitativa anonima salvata con successo.`);
    await page.waitForTimeout(1000);

    // Clicca su Salvataggio e poi Azzera Memoria d'Istituto per igiene digitale d'aula
    console.log(`   [Igiene Digitale] Chiusura sessione sicura ed Azzeramento Memoria...`);
    const saveModalBtn = page.locator('button', { hasText: 'Salvataggio' }).first();
    await saveModalBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // Intercetta la conferma di reset local storage
    page.on('dialog', async dialog => {
      console.log(`   [Reset Dialog] Intercettato avviso: "${dialog.message().substring(0, 40)}..."`);
      await page.waitForTimeout(1000);
      await dialog.accept(); // Clicca su OK/Accetta
      console.log(`   [Reset Dialog] Clic su ACCETTA eseguito. Svuotamento cache effettuato.`);
    });

    const resetBtn = page.locator('button', { hasText: 'Azzera Memoria' }).first();
    await expect(resetBtn).toBeVisible();
    await resetBtn.click({ force: true });
    await page.waitForTimeout(2000);

    console.log(`✔️ SIMULAZIONE 3 conclusa con successo per ${Agente.nome}!`);
  });

});
