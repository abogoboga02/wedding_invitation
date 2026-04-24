import { slugify } from "@/lib/utils/slug";

export type ParsedGuestCsvRow = {
  name: string;
  phone?: string;
  email?: string;
  line: number;
  baseSlug: string;
};

function cleanCell(value: string) {
  return value.trim().replace(/\uFEFF/g, "");
}

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        currentCell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === "," && !insideQuotes) {
      currentRow.push(cleanCell(currentCell));
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      currentRow.push(cleanCell(currentCell));
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  currentRow.push(cleanCell(currentCell));
  if (currentRow.some((cell) => cell.length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase();
}

export function parseGuestCsv(text: string): ParsedGuestCsvRow[] {
  const rows = parseCsv(text);

  if (rows.length === 0) {
    throw new Error("File CSV kosong.");
  }

  const headers = rows[0].map(normalizeHeader);
  const nameIndex = headers.findIndex((header) => ["name", "nama"].includes(header));
  const phoneIndex = headers.findIndex((header) => ["phone", "telepon", "no hp", "whatsapp"].includes(header));
  const emailIndex = headers.findIndex((header) => header === "email");

  if (nameIndex === -1) {
    throw new Error("Kolom `name` wajib tersedia di CSV.");
  }

  return rows
    .slice(1)
    .map((row, rowIndex) => {
      const name = row[nameIndex]?.trim() ?? "";
      const phone = phoneIndex >= 0 ? row[phoneIndex]?.trim() : undefined;
      const email = emailIndex >= 0 ? row[emailIndex]?.trim() : undefined;

      return {
        name,
        phone: phone || undefined,
        email: email || undefined,
        line: rowIndex + 2,
        baseSlug: slugify(name) || `guest-${rowIndex + 1}`,
      };
    })
    .filter((row) => row.name.length > 0);
}
