export interface EuropeanKeyCompetency {
  id: string;
  label: string;
  desc: string;
}

export const EuropeanKeyCompetencies: EuropeanKeyCompetency[] = [
  { id: 'KC1', label: 'Competenza alfabetica funzionale', desc: 'Comprendere, esprimere e interpretare concetti, sentimenti, fatti e opinioni in forma orale e scritta.' },
  { id: 'KC2', label: 'Competenza multilinguistica', desc: 'Utilizzare diverse lingue in modo appropriato ed efficace per la comunicazione orale e scritta.' },
  { id: 'KC3', label: 'Competenza STEM', desc: 'Sviluppare e applicare il pensiero logico-matematico, comprendere il mondo naturale e progettarne prototipi.' },
  { id: 'KC4', label: 'Competenza digitale', desc: 'Utilizzare con familiarita e spirito critico le tecnologie digitali per il lavoro, lo studio e la comunicazione.' },
  { id: 'KC5', label: 'Competenza personale, sociale e imparare a imparare', desc: "Riflettere su se stessi, gestire le informazioni, lavorare in gruppo e favorire l'inclusione." },
  { id: 'KC6', label: 'Competenza in materia di cittadinanza', desc: 'Agire da cittadini responsabili e partecipare alla vita sociale e civile, rispettando i diritti e la legalita.' },
  { id: 'KC7', label: 'Competenza imprenditoriale', desc: 'Tradurre le idee in azione, dimostrare spirito di iniziativa, creativita e capacita di pianificare progetti.' },
  { id: 'KC8', label: 'Competenza in materia di consapevolezza ed espressione culturali', desc: "Comprendere l'importanza dell'espressione creativa di idee ed emozioni in letteratura, arte e musica." },
];

export const getDisciplineKeyCompetencies = (disc: string): string[] => {
  const mapping: Record<string, string[]> = {
    italiano: ['KC1', 'KC8'],
    matematica: ['KC3'],
    scienze: ['KC3', 'KC5'],
    tecnologia: ['KC4', 'KC3', 'KC7'],
    storia: ['KC6', 'KC8'],
    geografia: ['KC6', 'KC8', 'KC5'],
    inglese: ['KC2'],
    secondaLingua: ['KC2'],
    arteImmagine: ['KC8'],
    musica: ['KC8'],
    educazioneFisica: ['KC5'],
    educazioneCivica: ['KC6', 'KC1'],
    religione: ['KC8', 'KC5'],
    latino: ['KC1', 'KC8'],
  };

  return mapping[disc] || [];
};