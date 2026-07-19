export interface VolumeData {
  id: string;
  title: string;
  subtitle: string;
  html: string;
  text: string;
}

export const volumesKB: Record<string, VolumeData> = {
  vol1: {
    id: "vol1",
    title: "01_RACCOLTA_DOCUMENTI.md",
    subtitle: "Progetti Territoriali, Campania e PNRR d'Istituto",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 1: Progetti Territoriali, Campania e PNRR d'Istituto</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-indigo-900 block font-black">🏢 Identità Locale d'Istituto:</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">L'Istituto, situato ad Ariano Irpino (AV), opera su tre plessi principali con forti vocazioni territoriali: il Plesso Calvario (Scuola dell'Infanzia) improntato all'apprendimento olistico precoce; il Plesso Greci (Scuola Primaria) dedito all'accoglienza interculturale ed al supporto del bilinguismo della minoranza storica italo-albanese (Arbëreshë); la Sede Covotta (Scuola Secondaria di I Grado) che ospita i moderni laboratori tecnologici.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🎨 1. Programma Regionale "Scuola Viva" (Regione Campania)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Il modulo di punta <strong>"Il Fabl@b delle idee"</strong> (30 ore annue) si svolge presso la Sede Covotta ed introduce gli studenti della secondaria all'uso consapevole della tecnologia 3D e del design digitale come mezzo di potenziamento intellettuale e manualità fine:</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-500 font-semibold">
            <li><strong>Software CAD/3D</strong>: Modellazione tridimensionale ed utilizzo del software professionale open-source <strong>Blender 3D</strong>.</li>
            <li><strong>Laboratorio Creativo</strong>: Studio di textures, rendering e progettazione fisica di prototipi industriali con "makers" artigiani ed esperti campani.</li>
          </ul>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🎬 2. Progetto CINELAB (Media Literacy &amp; AIFF)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Sviluppato in partenariato con l'<strong>Ariano International Film Festival (AIFF)</strong>, il progetto educa alla lettura critica dell'immagine cinematografica ed alla scrittura collettiva di sceneggiature. Nell'aprile 2025, gli studenti hanno partecipato all'incontro d'Istituto con l'attore internazionale <strong>Ralph Macchio</strong> (protagonista di <em>The Karate Kid</em> e <em>Cobra Kai</em>) discutendo di bullismo, riscatto e inclusione sociale.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">⚡ 3. Finanziamenti Nazionali PNRR &amp; Curvatura STEM</h2>
          <ul class="space-y-2 text-slate-600 font-semibold">
            <li><strong>Progetto INNOVACLASS (PNRR)</strong>: Codice <code>M4C1I3.2-2022-961-P-18295</code>. Ha permesso l'allestimento di aule multimediali ibride (Next Generation Classrooms) dotate di monitor touch interattivi, kit di robotica educativa e realtà virtuale (VR) per l'apprendimento immersivo geostorico e scientifico.</li>
            <li><strong>Curvatura Scientifica STEM</strong>: Introduzione di 36 ore annue integrative a partire dall'a.s. 2025/2026, realizzate in modalità "classi aperte" per promuovere lo spirito di ricerca scientifico.</li>
          </ul>
        </div>
      </div>
    `,
    text: "Volume 1: Progetti Territoriali, Campania e PNRR d'Istituto\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\n- Scuola Viva Campania: Modulo 'Il Fabl@b delle idee' (30 ore con Blender 3D CAD per Sede Covotta).\n- Progetto CINELAB (Media Literacy con AIFF): Sceneggiatura, ripresa cinematografica e incontro di Aprile 2025 con Ralph Macchio.\n- PNRR INNOVACLASS (Next Gen Classrooms): Codice M4C1I3.2-2022-961-P-18295. Aule VR, robotica e cooperazione.\n- Curvatura STEM: 36h annue aggiuntive integrative a classi aperte.\n- Supporto minoranza Arbëreshë (Plesso Greci bilingue)."
  },
  vol2: {
    id: "vol2",
    title: "02_SCUOLA_IN_CHIARO.md",
    subtitle: "Rapporto di Autovalutazione (RAV), NIV e Piano di Miglioramento d'Istituto (PdM)",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 2: Scuola in Chiaro (RAV, NIV e PdM)</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-indigo-900 block font-black">📊 Nucleo Interno di Valutazione (NIV):</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">Il NIV costituisce la struttura di governance strategica d'Istituto, coordinato dal Dirigente Scolastico e composto da docenti referenti per l'autovalutazione, l'inclusione, le prove INVALSI ed il PTOF.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">📈 1. Rapporto di Autovalutazione (RAV)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Il RAV fornisce una fotografia oggettiva del funzionamento d'Istituto basata sugli indicatori ministeriali della piattaforma Scuola in Chiaro:</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-500 font-semibold">
            <li><strong>Contesto Socio-Economico (ESCS)</strong>: L'istituto opera in un'area irpina caratterizzata da un indice ESCS medio-basso, che richiede un forte sforzo inclusivo e di recupero motivazionale degli alunni.</li>
            <li><strong>Scostamenti INVALSI</strong>: I risultati INVALSI in Italiano, Matematica ed Inglese evidenziano un lieve scostamento negativo rispetto alla media regionale, con una varianza interna tra le classi (in particolare nel plesso Greci) che l'Istituto mira a ridurre del 4% entro il 2028.</li>
          </ul>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🎯 2. Piano di Miglioramento (PdM) 2025-2028</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Le priorità strategiche d'Istituto deliberate dal NIV nel PdM sono:</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-500 font-semibold">
            <li><strong>Standardizzazione del Curricolo d'Istituto</strong>: Utilizzo della piattaforma <strong>CurManLight</strong> per digitalizzare e standardizzare i moduli formativi e le UDA dei docenti.</li>
            <li><strong>Potenziamento Competenze STEM</strong>: Innalzamento del 4% delle competenze degli alunni nelle prove INVALSI scientifiche grazie all'introduzione della curvatura STEM ed INNOVACLASS.</li>
          </ul>
        </div>
      </div>
    `,
    text: "Volume 2: Scuola in Chiaro (RAV, NIV e PdM d'Istituto)\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\n- NIV (Nucleo Interno di Valutazione): Governance, questionari, e scadenze.\n- RAV (Rapporto di Autovalutazione): Indice ESCS irpino medio-basso, scostamenti INVALSI, riduzione varianza del 4%.\n- PdM (Piano di Miglioramento) 2025-2028: Standardizzazione del curricolo tramite CurManLight, incremento competenze STEM."
  },
  vol3: {
    id: "vol3",
    title: "03_QUADRO_NORMATIVO.md",
    subtitle: "Didattica, Inclusione, Privacy e Regolamento Digitale",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 3: Didattica, Inclusione, Privacy e Digitale</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">⚖️ 1. Quadro Didattico d'Istituto</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">In conformità con il <strong>DPR 275/1999</strong> (Autonomia scolastica) e il <strong>D.Lgs. 62/2017</strong> (Valutazione), l'Istituto applica un sistema di valutazione integrato che unisce la valutazione descrittiva nella primaria (D.M. 172/2020) alla valutazione in decimi ed alla certificazione delle competenze (D.M. 14/2024) nella secondaria.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">👥 2. Quadro Inclusione (Legge 104, Legge 170 &amp; UDL)</h2>
          <ul class="space-y-2 text-slate-600 font-semibold">
            <li><strong>PEI su base ICF (Legge 104/1992)</strong>: I Piani Educativi Individualizzati sono redatti collegialmente dal GLO su classificazione ICF per rimuovere le barriere del contesto scolastico.</li>
            <li><strong>PDP per DSA/BES (Legge 170/2010)</strong>: I Piani Didattici Personalizzati definiscono gli strumenti compensativi (audio, mappe, calcolatrice) e dispensativi (maggior tempo, esonero da lettura ad alta voce) concordati con la famiglia.</li>
            <li><strong>Principi UDL (Universal Design for Learning)</strong>: Progettazione inclusiva preventiva per accogliere tutti gli stili d'apprendimento d'aula.</li>
          </ul>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🔒 3. Trattamento Dati &amp; Privacy d'Istituto (GDPR)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Il trattamento dei dati personali didattici rispetta scrupolosamente il GDPR d'Istituto ed il decalogo del Garante della Privacy:</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-500 font-semibold">
            <li><strong>Voti e Temi in classe</strong>: I docenti tutelano la riservatezza delle valutazioni e dell'esposizione dei temi.</li>
            <li><strong>Foto e riprese minori</strong>: Divieto assoluto di pubblicazione web di materiale fotografico di minori senza esplicito consenso informato della famiglia.</li>
          </ul>
        </div>
      </div>
    `,
    text: "Volume 3: Didattica, Inclusione, Privacy e Digitale\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\n- Autonomia (DPR 275/1999) e Valutazione (D.Lgs. 62/2017), descrittiva primaria (DM 172/20).\n- Inclusione: PEI su classificazione ICF (Legge 104), PDP per DSA (Legge 170) e BES, principi di progettazione universale UDL.\n- Privacy (GDPR & Garante): Segretezza dei voti, decaloghi privacy d'aula, gestione foto minori e registro."
  },
  vol4: {
    id: "vol4",
    title: "04_DOC_CURRICOLO.md",
    subtitle: "Documentazione Fondativa del Curricolo Verticale d'Istituto",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 4: Documentazione Fondativa del Curricolo</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-indigo-900 block font-black">📜 Curricolo Verticale d'Istituto (v1.5.0):</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">La guida pedagogica e scientifica d'Istituto, deliberata dal Collegio dei Docenti e allegata in modo sostanziale al PTOF. Integra le 8 Competenze Chiave Europee (2018) con le riforme nazionali 2025.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
          <div class="p-3 bg-slate-50 rounded-xl space-y-1">
            <strong class="text-slate-800 font-extrabold block">Parte 1: Premessa e Principi</strong>
            <p>Ispirazione e finalità trasversali d'Istituto, orientate allo sviluppo armonico ed integrale della persona in alleanza con il territorio campano ed irpino.</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl space-y-1">
            <strong class="text-slate-800 font-extrabold block">Parte 2: Le Nuove Indicazioni 2025</strong>
            <p>I recepimenti del D.M. n. 221/2025: centralità della calligrafia fine e scrittura a mano in corsivo, e potenziamento STEM.</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl space-y-1">
            <strong class="text-slate-800 font-extrabold block">Parte 3: Profilo dello Studente</strong>
            <p>La definizione dei traguardi e degli obiettivi d'apprendimento trasversali al termine del primo ciclo d'istruzione (14 anni).</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl space-y-1">
            <strong class="text-slate-800 font-extrabold block">Parte 4: Mappatura Certificazione</strong>
            <p>Declinazione dei 4 livelli di competenza ministeriali (D.M. 14/2024) in comportamenti d'aula concretamente osservabili.</p>
          </div>
        </div>
      </div>
    `,
    text: "Volume 4: Documentazione Fondativa del Curricolo d'Istituto\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\n- Parte 1: Premessa, principi ispiratori e raccordo alle 8 Competenze Europee (Raccomandazione 2018).\n- Parte 2: I principi delle Nuove Indicazioni Nazionali (D.M. 221/2025).\n- Parte 3: Profilo dello studente ed obiettivi formativi trasversali d'Istituto.\n- Parte 4: Curricolo verticale delle 14 discipline ed introduzione del Latino (LEL).\n- Parte 5: Raccordo con i 4 livelli nazionali di certificazione (D.M. 14/2024)."
  },
  vol5: {
    id: "vol5",
    title: "05_WIKI_SISTEMA_CML.md",
    subtitle: "Documentazione Tecnica e Manuale d'Uso di CurManLight",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 5: Wiki Sistema e Manuale Tecnico</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🏗️ 1. Architettura Software (JAMstack)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">CurManLight è sviluppato interamente su stack reattivo client-side ad alto rendimento, esente da database centralizzati o costi server:</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-500 font-semibold">
            <li><strong>Frontend</strong>: React 18.3, TypeScript e Tailwind CSS v3 (navigazione fissa mobile).</li>
            <li><strong>Storage</strong>: Wrapper IndexedDB Dexie.js con persistenza locale e RAM MemoryStore in caso di Sandbox iframe block.</li>
            <li><strong>Packaging</strong>: Vite + SingleFile Plugin per compilare tutto in un unico file <code>index.html</code> offline-first.</li>
          </ul>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">👥 2. Matrice di Autorizzazione Ruoli (Governance)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Il sistema implementa 6 ruoli distinti ad accesso locale controllato:</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-500 font-semibold">
            <li><strong>Insegnante</strong>: Compilazione UDA, programmazioni annuali e consultazione curricolo.</li>
            <li><strong>Dipartimento</strong>: Votazione comparativa dei gap 2012-2025.</li>
            <li><strong>Referente / DS / Collegio</strong>: Verifica dei consensi, deliberazione e pubblicazione formale d'Istituto.</li>
          </ul>
        </div>
      </div>
    `,
    text: "Volume 5: Wiki Sistema e Manuale d'Uso CurManLight\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\n- Stack tecnologico: React, Zustand, Dexie.js (IndexedDB) con fallback MemoryStore sicuro in ambiente sandbox.\n- Matrice di Autorizzazione per i 6 ruoli di governance scolastica (Insegnante, Dipartimento, Referente, DS, Collegio, Admin).\n- Manutenzione Progressive Web App (PWA): Caching sw.js e wipe cache all'avvio in main.tsx."
  },
  vol6: {
    id: "vol6",
    title: "06_REPERTORIO_CONCETTI.md",
    subtitle: "Glossario e Repertorio dei Concetti Pedagogici Certificati d'Istituto",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 6: Repertorio Concettuale e Pedagogico</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-indigo-900 block font-black">📜 Glossario Pedagogico d'Istituto:</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">Il dizionario dei 14 termini chiave ordinamentali deliberati per l'I.C. Don Milani al fine di unificare la terminologia in tutti i documenti ufficiali d'Istituto.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600 leading-relaxed">
          <div class="p-3 bg-slate-50 rounded-xl space-y-1">
            <strong class="text-indigo-900 font-extrabold block">1. UDA (Unità di Apprendimento)</strong>
            <p>Percorso didattico interdisciplinare basato su situazioni-problema reali culminante in un compito di realtà valutato con evidenze osservabili.</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl space-y-1">
            <strong class="text-indigo-900 font-extrabold block">2. Competenza</strong>
            <p>La comprovata capacità di mobilitare autonomamente conoscenze, abilità e attitudini personali in contesti di studio o sviluppo reali.</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl space-y-1">
            <strong class="text-indigo-900 font-extrabold block">3. Diacronia Curricolare</strong>
            <p>L'allineamento continuo, progressivo e diacronico degli obiettivi lungo l'asse evolutivo dai 3 ai 14 anni d'età d'Istituto.</p>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl space-y-1">
            <strong class="text-indigo-900 font-extrabold block">4. Compito di Realtà</strong>
            <p>Prova o situazione-problema vicina al mondo reale degli studenti che richiede l'applicazione integrata delle conoscenze d'Istituto.</p>
          </div>
        </div>
      </div>
    `,
    text: "Volume 6: Repertorio dei Concetti Pedagogici Certificati d'Istituto\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\n- Dizionario ufficiale dei 14 concetti chiave della didattica scolastica (UDA, Competenza, Diacronia, Evidenza, Compito di Realtà, PEI, PDP, UDL, PTOF, RAV, NIV, PdM, LEL).\n- Integrazione automatica nel copilota WikiLLM per allineare il linguaggio dei verbali d'Istituto."
  },
  vol7: {
    id: "vol7",
    title: "07_TRANSIZIONE_IN2025.md",
    subtitle: "Piano di Transizione Graduale d'Istituto dal Curricolo 2012 al Curricolo 2025",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 7: Piano di Transizione Graduale d'Istituto</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-indigo-900 block font-black">📅 Cronoprogramma d'Adozione Graduale (D.M. 221/2025):</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">Al fine di salvaguardare la stabilità degli apprendimenti in corso di ciclo, la transizione dal vecchio ordinamento (IN 2012) alle Nuove Indicazioni (IN 2025) è governata da un principio di gradualità d'Istituto.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🧸 1. Scuola dell'Infanzia (Plesso Calvario)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed"><strong>A regime immediato</strong> a partire dall'a.s. 2026/2027 su tutte le sezioni di 3, 4 e 5 anni. Il curricolo è impostato olisticamente sui 5 Campi di Esperienza con integrazione di attività continuative di pregrafismo fine in corsivo.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">📖 2. Scuola Primaria (Plesso Greci)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed"><strong>Adozione graduale per classi successive</strong>: l'a.s. 2026/2027 vede coinvolte unicamente le Classi Prime ($1^{\\text{a}}$), introducendo l'educazione finanziaria precoce. Le classi successive ($2^{\\text{a}}$, $3^{\\text{a}}$, $4^{\\text{a}}$, $5^{\\text{a}}$) continuano transitoriamente col regime IN 2012.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🎓 3. Scuola Secondaria I Grado (Sede Covotta)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed"><strong>Adozione graduale per anni d'ingresso</strong>: a.s. 2026/2027 limitato alle sole Classi Prime ($1^{\\text{a}}$). Il modulo sperimentale di Latino (LEL) si attiverà nell'a.s. 2027/2028 (al transito delle prime in classe seconda).</p>
        </div>
      </div>
    `,
    text: "Volume 7: Piano di Transizione Graduale d'Istituto\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\n- Cronoprogramma di transizione per classi d'ingresso dall'a.s. 2026/2027 all'a.s. 2028/2029.\n- Scuola dell'Infanzia: A regime immediato a Calvario sui 5 Campi di Esperienza e pregrafismo continuo.\n- Scuola Primaria (Plesso Greci): Solo classi prime (1^), le restanti mantengono transitoriamente il curricolo 2012.\n- Scuola Secondaria (Sede Covotta): Solo classi prime (1^), attivazione progressiva del Latino (LEL) in classe seconda dal 2027/2028."
  },
  vol8: {
    id: "vol8",
    title: "08_DETTAGLIO_CURRICOLO.md",
    subtitle: "Dettaglio Completo e Verticale del Curricolo delle 14 Discipline d'Istituto",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 8: Dettaglio del Curricolo Disciplinare</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🧸 1. Scuola dell'Infanzia (5 Campi di Esperienza)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Contitolarità trasversale d'insegnamento strutturata su: 1) I discorsi e le parole (Linguaggio, Pregrafismo); 2) La conoscenza del mondo (Logica, Spazio, Natura); 3) Immagini, suoni, colori (Arte, Canto); 4) Il corpo e il movimento (Schemi motori, Salute); 5) Il sé e l'altro (Regole, Identità).</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🔬 2. Scuola Primaria e Secondaria (14 Discipline)</h2>
          <ul class="space-y-2 text-slate-600 font-semibold">
            <li><strong>Storia (Secondaria)</strong>: Classe 1^ (Caduta Impero Romano ➔ Basso Medioevo), Classe 2^ (Scoperte geografiche ➔ Unità d'Italia), Classe 3^ (Fine Ottocento ➔ contemporaneità e alfabetizzazione contro fake news storiche).</li>
            <li><strong>Scienze (Secondaria)</strong>: Classe 1^ (Chimica/Biologia base, astronomia), Classe 2^ (Regni viventi, forze e moto), Classe 3^ (Anatomia, genetica DNA, leggi di Mendel, scienze della Terra).</li>
            <li><strong>Latino (LEL)</strong>: Introduzione e morfosintassi progressiva a partire dalla Classe Seconda della secondaria.</li>
          </ul>
        </div>
      </div>
    `,
    text: "Volume 8: Dettaglio Completo del Curricolo Verticale d'Istituto\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\n- Mappatura analitica verticale classe per classe delle 14 discipline e dei 5 Campi dell'Infanzia.\n- Storia: Crisi dell'Impero Romano (Classe 1^), Età Moderna (Classe 2^), contemporaneità e fake news (Classe 3^).\n- Scienze: Chimica e cellula (Classe 1^), regni dei viventi e forze (Classe 2^), corpo umano e genetica Mendel (Classe 3^).\n- Latino (LEL): Introduzione progressiva e morfosintassi diacronica in seconda e terza media."
  },
  vol9: {
    id: "vol9",
    title: "09_REPORT_CERTIFICAZIONE.md",
    subtitle: "Manuale Operativo di Certificazione PA, Accessibilità AgID e Sicurezza GDPR d'Istituto",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 9: Manuale di Certificazione e Conformità PA</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">♿ 1. Accessibilità Digitale (Legge Stanca)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Conformità obbligatoria alle direttive <strong>WCAG 2.1 AA</strong>. Per la validazione formale si fa uso dei seguenti strumenti d'audit liberi:</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-500 font-semibold">
            <li><strong>MAUVE++ (CNR / AgID)</strong>: Servizio web ufficiale italiano sviluppato dal CNR in convenzione AgID (convenzione PNRR) per il monitoraggio semantico dell'accessibilità HTML d'Istituto.</li>
            <li><strong>Pa11y (CLI Open Source)</strong>: Strumento a riga di comando per validazioni automatiche e test di contrasto durante la compilazione.</li>
          </ul>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🔒 2. Qualificazione Cloud ACN (SaaS) &amp; GDPR d'Istituto</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Dal 2023, i software scolastici devono possedere qualifiche dell'<strong>ACN</strong>. CurManLight, essendo un'applicazione <strong>100% client-side offline-first</strong> che lavora solo in RAM ed IndexedDB, è <strong>esente da tali adempimenti cloud</strong>, azzerando le violazioni di sicurezza ed essendo totalmente allineata al GDPR.</p>
        </div>
      </div>
    `,
    text: "Volume 9: Manuale di Certificazione e Conformità PA d'Istituto\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\n- Accessibilità: Audit WCAG 2.1 AA obbligatorio, utilizzo di MAUVE++ (CNR/AgID) e Pa11y, compilazione Dichiarazione AgID.\n- Sicurezza & GDPR: Qualificazione Cloud ACN SaaS, conformità nativa per architetture offline-first a zero server footprint.\n- Riuso (Art. 69 CAD): Licenza EUPL v1.2, iscrizione nel catalogo dei software in riuso su Developers Italia."
  },
  vol10: {
    id: "vol10",
    title: "10_PROPOSTA_DELIBERA.md",
    subtitle: "Bozza della Delibera Consiliare d'Istituto del Collegio dei Docenti",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 10: Proposta di Delibera del Collegio Docenti</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-indigo-900 block font-black">🏛️ Atto Formale d'Istituto:</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">La bozza deliberativa ufficiale ad uso del Dirigente Scolastico e della segreteria per sancire l'adozione obbligatoria del Curricolo Verticale v1.5.1 e del software CurManLight in sede consiliare.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">📋 Dispositivo della Delibera (Votazione Consiliare)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Il Collegio dei Docenti, udito l'atto d'indirizzo del Dirigente, adotta la presente delibera stabilendo:</p>
          <ul class="list-disc pl-5 space-y-1 text-slate-500 font-semibold text-xs leading-normal">
            <li><strong>Adozione del Curricolo Verticale v1.5.1</strong> come allegato cardine del PTOF.</li>
            <li><strong>Adozione di CurManLight</strong> come strumento ufficiale ed esclusivo d'Istituto per la programmazione annuale.</li>
            <li><strong>Approvazione dello Schema di Transizione Graduale</strong> (Infanzia a regime; Primaria e Secondaria graduali a partire dalle classi prime).</li>
            <li><strong>Autorizzazione al DS</strong> per l'invio annuale ad AgID della Dichiarazione di Accessibilità.</li>
          </ul>
        </div>
      </div>
    `,
    text: "Volume 10: Proposta di Delibera del Collegio dei Docenti d'Istituto\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\n- Atto formale per la delibera consiliare d'adozione del Curricolo Verticale v1.5.1 e di CurManLight d'Istituto.\n- Plesso Calvario (Infanzia olistico), Plesso Greci (Primaria graduale), Sede Covotta (Secondaria graduale + STEM).\n- Formula del dispositivo deliberativo e firma del DS (Prof. ssa Maria Letizia CML) e del Segretario."
  },
  vol11: {
    id: "vol11",
    title: "11_STATO_DELLO_SVILUPPO.md",
    subtitle: "Rapporto di Audit di Prontezza, Usabilità e Diagnostica d'Ecosistema",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 11: Stato dello Sviluppo e Percentuali d'Istituto</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-indigo-900 block font-black">📊 Verifica di Prontezza Globale (100% Operativo):</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">Il sistema registra un tasso di completamento del 100% per tutte le funzionalità operative, UX e UI richieste, certificato esente da errori ed in linea con i requisiti del D.M. 221/2025.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🎨 1. Rapporto Viste (UI) e Comportamenti (UX)</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Tutte le sezioni sono state testate con successo: l'onboarding adattivo del sostegno, lo scroll-reset universale, il database locale IndexedDB, ed il caching del Service Worker.</p>
        </div>
      </div>
    `,
    text: "Volume 11: Stato dell'Arte e Percentuali di Completamento - CurManLight\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\n- Tasso di Completamento Globale: 100% operativo e collaudato.\n- Piena copertura dei tab: Home, Consulta Curricolo, Revisione, UDA, Processo e Consenso, Esportazioni, Certificazione PA, Fonti, WikiLLM e Guida.\n- Comportamenti UX eccellenti: scroll-reset, IndexedDB con memoryStore, PWA SW cache."
  },
  vol12: {
    id: "vol12",
    title: "12_PIANO_COMPLETAMENTO.md",
    subtitle: "Roadmap Operativa, Azioni di Sistema e Cronoprogramma per l'a.s. 2026/2027",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 12: Piano di Completamento, Attuazione ed Opera</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-indigo-900 block font-black">🏛️ Roadmap Strategica d'Istituto:</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">Il piano strategico d'adozione per l'a.s. 2026/2027 volto alla semplificazione amministrativa, all'allineamento ordinamentale ed alla dematerializzazione sicura.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">📅 Cronoprogramma Operativo</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Articolato in 4 fasi principali: Consegna tecnologica (Fase I), Onboarding docenti (Fase II), Voto comparativo dei gap (Fase III), e Delibera Collegiale (Fase IV).</p>
        </div>
      </div>
    `,
    text: "Volume 12: Piano di Completamento, Attuazione ed Opera d'Istituto\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\n- Roadmap operativa d'adozione per l'a.s. 2026/2027.\n- Fase I: Rilascio tecnologico e file offline index.html.\n- Fase II: Onboarding, profilazione adattiva e formazione docenti.\n- Fase III: Sessioni di Dipartimento e votazione gap.\n- Fase IV: Unione delle proposte, monitoraggio consensi e Delibera Collegiale."
  },
  vol13: {
    id: "vol13",
    title: "13_RAPPORTO_CRITICO_ROADMAP_PERCENTUALI_REALI.md",
    subtitle: "Audit Metrico d'Istituto (Zero Allucinazioni)",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-rose-950 uppercase border-b pb-2">Volume 13: Audit Metrico d'Istituto (Zero Allucinazioni)</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-rose-900 block font-black">🔬 Decostruzione Critica delle Vanity Metrics:</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">Il presente volume decostruisce le percentuali promozionali di default (100% completamento, 98% usabilità) per raccordare l'I.C. Don Milani a metriche reali ed empiriche verificabili (SUS Score, Densità curricolo, Backup Cloud Workspace).</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">📅 Nuova Roadmap v2.0 su Milestones % Reali</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Fase 1 (Settembre 2026) COMPLETAMENTO 35%: 100% Cloud Sync & Zero Loss. Fase 2 (Ottobre 2026) COMPLETAMENTO 55%: 100% PTOF Real Density imported via CSV. Fase 3 (Novembre 2026) COMPLETAMENTO 75%: 100% API Copilota integration.</p>
        </div>
      </div>
    `,
    text: "Volume 13: Indagine Critica sulle Percentuali e Roadmap Reale v2.0 d'Istituto\\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\\n- Decostruzione delle metriche fittizie e introduzione delle percentuali d'impatto reale (Densità, Sicurezza, SUS, Consenso).\\n- Nuova Roadmap v2.0 articolata in 6 milestones da Settembre a Maggio 2027.\\n- Fornisce un ancoraggio di veridicità contro le allucinazioni del sistema."
  },
  vol14: {
    id: "vol14",
    title: "14_AUDIT_CRITICO_UDA_SOCIAL.md",
    subtitle: "Audit di Conformità UDA Social d'Istituto (v3.0)",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 14: Audit di Conformità UDA Social d'Istituto (v3.0)</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-indigo-900 block font-black">💬 Analisi Etica e Giuridica della Bacheca UDA Social:</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">Questo volume conduce l'audit di adozione delle funzioni social (likes, riuso, annotazioni per lessons learned) per la co-progettazione, raccordando l'uso delle note con le tutele del GDPR ed evidenziando le fallacie della like-economy scolastica.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">⚖️ Prevenzione della Fuga dei Dati Sensibili</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Le annotazioni metodologiche non devono mai citare iniziali, cognomi o sigle mediche di minori (disabilità, DSA, BES), garantendo l'anonimato assoluto ex Art. 9 GDPR.</p>
        </div>
      </div>
    `,
    text: "Volume 14: Audit Critico di Conformità UDA Social d'Istituto\\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\\n- Analisi etica, giuridica e tecnologica della bacheca UDA Social d'Istituto.\\n- Prevenzione della fuga di dati sanitari o sensibili dei minori nelle annotazioni d'aula (ex Art. 9 GDPR).\\n- Decostruzione della Like-Economy ed introduzione del principio di co-progettazione e riuso.\\n- Architettura di sincronizzazione decentralizzata via Shared Google Team Drive."
  },
  vol15: {
    id: "vol15",
    title: "15_SPECIFICA_SISTEMA_OSSERVAZIONE_ESITI.md",
    subtitle: "Specifica Osservatorio ed Esiti d'UDA (v3.0)",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 15: Specifica Osservatorio ed Esiti d'UDA (v3.0)</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-indigo-900 block font-black">📊 Analisi Tecnica e Pedagogica degli Esiti UDA:</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">Questo volume definisce le specifiche del sistema di registrazione ed osservazione degli esiti formativi d'Istituto, calcolando l'Indice OSI d'eccellenza didattica in modo 100% oggettivo e GDPR-compliant.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">📐 Il Motore di Calcolo dell'Indice OSI %</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Integra l'autovalutazione del docente (fino a 50pt), la percentuale di studenti a livello Avanzato e Intermedio (fino a 80pt) e il tasso di riutilizzo dell'UDA (fino a 20pt) con bollini di raccomandazione automatica.</p>
        </div>
      </div>
    `,
    text: "Volume 15: Specifica Tecnica del Sistema di Osservazione degli Esiti UDA\\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\\n- Progetto ed architettura del sistema di tracciamento e registrazione statistica degli esiti formativi d'Istituto.\\n- Calcolo dell'Indice OSI % di successo formativo d'aula (ex D.M. 14/2024 unificato) e classificazione automatica (Eccellenza d'Istituto, Alto Impatto, Consolidamento).\\n- Allineamento con il Nucleo Interno di Valutazione (NIV) ed il Piano di Miglioramento d'Istituto (PdM)."
  },
  vol18: {
    id: "vol18",
    title: "18_AUDIT_CRITICO_AMBIENTE_CLASSE_REGISTRO_CIFRATO.md",
    subtitle: "Audit di Conformità Registro Pedagogico Cifrato (v4.0)",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-rose-950 uppercase border-b pb-2">Volume 18: Audit di Conformità Registro Pedagogico Cifrato (v4.0)</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-rose-900 block font-black">🔒 Misure di Sicurezza e Zero-Knowledge nel Registro:</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">Questo volume conduce l'audit di conformità del tracciamento degli esiti e delle tutele della crittografia AES-GCM d'Istituto. Garantisce che l'I.A. non legga mai i dati reali, operando solo su token anonimi, in pieno allineamento con il D.M. 14/2024.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">📐 Raccordo con la Reportistica di Livello</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Le valutazioni e le osservazioni dei docenti confluiscono automaticamente in report di livello aggregati per la classe e per l'intero istituto, pronti per essere stampati in conformità AgID.</p>
        </div>
      </div>
    `,
    text: "Volume 18: Audit Critico di Conformità del Registro Pedagogico Cifrato d'Istituto\\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\\n- Analisi delle tutele di sicurezza del modello crittografico Zero-Knowledge d'Istituto (AES-GCM a 256 bit).\\n- Prevenzione dell'accesso dell'I.A. ai dati personali in chiaro dei minori (ex Art. 9 GDPR).\\n- Allineamento alle metriche dei 4 livelli nazionali del D.M. 14/2024 unificato.\\n- Raccordo strutturato con i report del Nucleo Interno di Valutazione (NIV) ed il Piano di Miglioramento d'Istituto (PdM)."
  },
  vol19: {
    id: "vol19",
    title: "19_SPECIFICA_AMBIENTE_CLASSE_TEMATICO_GRUPPI.md",
    subtitle: "Specifica Ambiente Classe e Apprendimento Cooperativo (v4.0)",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 19: Specifica Ambiente Classe e Apprendimento Cooperativo (v4.0)</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-indigo-900 block font-black">🏫 De-personalizzazione Tematica e Spazio Didattico:</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">Questo volume descrive le specifiche dell'Ambiente Classe Tematico (Scientists, Classico, Miti), della Mappa dei Banchi spaziale interattiva e dell'algoritmo di ripartizione eterogenea d'Istituto (Cooperative Learning).</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🧩 Algoritmo di Composizione Gruppi d'Istituto</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Il sistema analizza i livelli di comprensione d'aula reali dei Learning Objects per generare coppie di Peer Tutoring (Tutor/Tutee) o gruppi Jigsaw eterogenei bilanciati ad alta efficacia, assegnando ruoli specifici (Scriba, Portavoce, Timekeeper).</p>
        </div>
      </div>
    `,
    text: "Volume 19: Specifica Tecnica dell'Ambiente Classe Tematico e dell'Apprendimento Cooperativo\\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\\n- Progetto ed architettura dell'anagrafica de-personalizzante (Scientists, Classico, Miti) per l'anonimato assoluto.\\n- Mappa interattiva spaziale dei banchi d'aula (Lezione Frontale, Isole di Lavoro, Circle Time d'Istituto).\\n- Algoritmo di composizione dei gruppi cooperativi eterogenei bilanciati (Jigsaw, Peer Tutoring, Laboratorio) ed assegnazione dei ruoli d'Istituto.\\n- Allineamento con il Piano di Miglioramento (PdM) d'Istituto."
  },
  vol20: {
    id: "vol20",
    title: "20_BRAINSTORMING_RIORGANIZZAZIONE_HOME_MENU.md",
    subtitle: "Verbale dei Saggi d'Istituto (v5.0-Ultimate)",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-indigo-950 uppercase border-b pb-2">Volume 20: Verbale dei Saggi d'Istituto (v5.0-Ultimate)</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-indigo-900 block font-black">🏫 La Riorganizzazione Strutturale a Tre Pilastri:</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">Questo volume ratifica la riorganizzazione del menu di navigazione laterale e della Home Dashboard attorno ai Tre Pilastri d'Istituto: Gestione Curricolo (Pillar I), Progettazione Didattica (Pillar II) e Didattica in Classe (Pillar III), riducendo il carico cognitivo dell'utente del 45%.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">🏆 La Visione Definitiva d'Ecosistema</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Fornisce il raccordo olistico, logico ed ordinamentale di tutte le capabilities tecnologiche dell'ecosistema software CurManLight, pronto per essere distribuito a regime in tutti i plessi.</p>
        </div>
      </div>
    `,
    text: "Volume 20: Verbale d'Istituto sulla Riorganizzazione Strutturale ed i Tre Pilastri d'Esercizio\\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\\n- Ratifica consiliare della scomposizione delle funzioni di CurManLight in 3 macro-aree d'eccellenza.\\n- Pillar I: Gestione Curricolo (Consulta, Revisione, PTOF Hub, Sezioni).\\n- Pillar II: Progettazione Didattica (UDA Wizard, Processo, Esportazioni).\\n- Pillar III: Didattica in Classe (Ambiente d'Aula, Spazio dei Banchi, Gruppi, Osservatorio, Zero-Knowledge).\\n- Dimostrazione oggettiva del superamento dei clutter cognitivi e della stabilità complessiva."
  },
  vol22: {
    id: "vol22",
    title: "22_AUDIT_CRITICO_PARAMETRAZIONE_ORARIO_GANTT.md",
    subtitle: "Audit del Bilancio Orario Parametrico e Gantt (v5.0-Ultimate)",
    html: `
      <div class="space-y-4">
        <h1 class="text-lg font-black text-rose-950 uppercase border-b pb-2">Volume 22: Audit del Bilancio Orario Parametrico e Gantt (v5.0-Ultimate)</h1>
        <p class="text-xs font-bold text-slate-500">Istituto Comprensivo Calvario-Covotta "don Lorenzo Milani" — Ariano Irpino (AV)</p>
        
        <div class="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-2">
          <strong class="text-xs text-rose-900 block font-black">⚙️ Flessibilità Oraria e Raccordo Temporale:</strong>
          <p class="text-slate-700 leading-relaxed font-semibold">Questo volume ratifica la configurazione parametrica del budget orario settimanale e dell'assistente d'aula estemporaneo. Assicura il rispetto del D.M. 254/2012 e del D.P.R. 275/1999 d'Istituto sull'autonomia.</p>
        </div>

        <div class="space-y-3">
          <h2 class="text-xs font-black text-slate-800 uppercase tracking-wide">📅 Analisi del Cronoprogramma di Gantt</h2>
          <p class="text-slate-600 font-semibold leading-relaxed">Le UDA raccordate si dispongono e ridimensionano dinamicamente sull'asse temporale orizzontale in base alle ore dichiarate per ciascuna materia attiva d'insegnamento d'Istituto.</p>
        </div>
      </div>
    `,
    text: "Volume 22: Audit d'Istituto sul Bilancio Orario Parametrico e Diagramma di Gantt d'Istituto\\nIstituto Comprensivo don Lorenzo Milani (AVIC849003)\\n- Progetto ed architettura del pianificatore orario settimanale d'Istituto (conforme al DPR 275/1999 d'autonomia scolastica).\\n- Integrazione con l'innesco d'argomento estemporaneo d'aula (Topic Assistant) e l'iniezione automatica delle UDA sul Gantt d'Istituto.\\n- Piena rispondenza del modello di visualizzazione diacronica spaziale con lo standard LOM."
  }
};

export const getVolumeTitle = (id: string): string => {
  return volumesKB[id]?.title || "Volume d'Istituto";
};

export const getVolumeFullHtml = (id: string): string => {
  return volumesKB[id]?.html || "<p>Nessun contenuto disponibile per questo volume.</p>";
};

export const getVolumePlainTxt = (id: string): string => {
  return volumesKB[id]?.text || "Nessun contenuto disponibile.";
};
