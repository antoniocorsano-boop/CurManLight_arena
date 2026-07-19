import csv

# Nuove righe curricolari elaborate dalla Task Force Operativa d'Istituto (v5.0-Gold)
new_rows = [
    # Referente 1: Tecnologia Primaria (Pensiero Computazionale e Geometria con Scratch)
    ["tecnologia", "primaria", "traguardo", "L'alunno padroneggia le basi del pensiero computazionale ed il coding visuale a blocchi (Scratch) in raccordo con la geometria cartesiana d'Istituto."],
    ["tecnologia", "primaria", "obiettivo", "Sviluppare ed eseguire algoritmi sequenziali, cicli condizionali e variabili in Scratch per disegnare poligoni regolari d'aula."],
    ["tecnologia", "primaria", "evidenza", "Disegna autonomamente un quadrato o un triangolo equilatero sulla griglia cartesiana della LIM programmando i blocchi di movimento e rotazione in Scratch."],
    
    # Referente 2: Italiano Primaria (Continuità Corsivo Fine e Pregrafismo)
    ["italiano", "primaria", "obiettivo", "Consolidare ed esercitare regolarmente la fluidità e la continuità della scrittura in corsivo fine d'Istituto, in raccordo con i percorsi di pregrafismo dell'Infanzia."],
    ["italiano", "primaria", "evidenza", "Redige un intero brano in corsivo sul foglio a righe rispettando le legature e le altezze delle lettere in modo armonioso e senza interruzioni grafiche."],
    
    # Referente 4: Educazione Civica Secondaria (Allineamento Tre Assi: Educazione Finanziaria e I.A. Literacy)
    ["educazioneCivica", "secondaria", "obiettivo", "Comprendere i principi fondamentali dell'Educazione Finanziaria, del risparmio consapevole e della gestione programmata del bilancio personale d'Istituto."],
    ["educazioneCivica", "secondaria", "obiettivo", "Analizzare criticamente l'impatto etico, sociale e di privacy derivante dall'uso quotidiano di algoritmi di Intelligenza Artificiale e sistemi di ricerca web."],
    ["educazioneCivica", "secondaria", "evidenza", "Elabora un piccolo bilancio economico scolastico o un saggio critico che descriva i bias algoritmici dell'I.A. raccordandoli alla cittadinanza attiva d'Istituto."]
]

# Appending rows to the complete vertical curriculum CSV of the school
file_path = "CURRICOLO_VERTICALE_D_ISTITUTO_COMPLETO_AVIC849003.csv"
try:
    # First, let's verify if the rows are already in there to prevent double-appending
    existing_items = []
    try:
        with open(file_path, mode='r', encoding='utf-8') as rf:
            reader = csv.reader(rf)
            next(reader) # skip header
            for row in reader:
                if len(row) >= 4:
                    existing_items.append((row[0], row[1], row[2], row[3].strip()))
    except FileNotFoundError:
        pass

    rows_to_add = []
    for r in new_rows:
        key = (r[0], r[1], r[2], r[3].strip())
        if key not in existing_items:
            rows_to_add.append(r)

    if len(rows_to_add) > 0:
        with open(file_path, mode='a', encoding='utf-8', newline='') as file:
            writer = csv.writer(file, quoting=csv.QUOTE_MINIMAL)
            for row in rows_to_add:
                writer.writerow(row)
        print(f"✅ Allineamento Completato: Aggiunte {len(rows_to_add)} nuove righe della Task Force Operativa nel curricolo d'Istituto!")
    else:
        print("ℹ️ Avviso: Le righe elaborate dalla Task Force sono già presenti e perfettamente integrate nel curricolo d'Istituto.")
except Exception as e:
    print(f"❌ Errore durante l'aggiornamento: {e}")
