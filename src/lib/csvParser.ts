export async function parseCsv(file: File): Promise<Record<string, string>[]> {
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
}

export function importCsvToCurriculum(rows: Record<string, string>[]): { type: string; text: string }[] {
  return rows.map(row => ({
    type: row.type || 'obiettivo',
    text: row.text || row.descrizione || '',
  })).filter(item => item.text);
}
