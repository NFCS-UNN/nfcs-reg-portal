export interface CSVRow {
  [key: string]: string;
}

export function parseCSV(csvText: string): CSVRow[] {
  const lines: string[] = [];
  let currentLine = "";
  let insideQuotes = false;

  // Split lines accounting for quoted newlines
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      insideQuotes = !insideQuotes;
      currentLine += char;
    } else if (char === "\n" && !insideQuotes) {
      lines.push(currentLine.trim());
      currentLine = "";
    } else if (char === "\r" && !insideQuotes) {
      // Ignore carriage returns
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  if (lines.length === 0) return [];

  // Parse headers
  const headers = parseCSVLine(lines[0]);
  const results: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === "")) continue;

    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header.toLowerCase().trim()] = (values[index] || "").trim();
    });
    results.push(row);
  }

  return results;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentVal = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      // If we see two double quotes together, it's an escaped quote
      if (nextChar === '"' && insideQuotes) {
        currentVal += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(currentVal);
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  result.push(currentVal);
  return result;
}
