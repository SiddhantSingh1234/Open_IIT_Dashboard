// csv_to_json.js
// Usage: node csv_to_json.js <path/to/movies.csv> > movies.json

const fs = require("fs");

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node csv_to_json.js <path/to/movies.csv>");
  process.exit(1);
}

let csv = fs.readFileSync(inputPath, "utf8");
// strip BOM if present
csv = csv.replace(/^\uFEFF/, "");

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"') {
      if (inQuotes) {
        // Escaped quote ("")
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        inQuotes = true;
      }
    } else if (ch === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      // Handle Windows newlines \r\n
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }

  // Push any trailing field/row
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop empty trailing lines
  return rows.filter((r) => r.some((v) => v !== ""));
}

function toTyped(val) {
  // empty -> null
  if (val === "" || val == null) return null;
  const s = val.trim();
  // number?
  if (/^-?\d+(\.\d+)?$/.test(s)) {
    const num = Number(s);
    // only return number if it’s a safe integer/float
    if (Number.isFinite(num)) return num;
  }
  return s;
}

// columns we want as arrays
const ARRAY_COLS = new Set(["cast", "genres", "country"]);

// Parse CSV
const rows = parseCSV(csv);
if (rows.length === 0) {
  console.error("No rows found in CSV.");
  process.exit(1);
}

const headers = rows[0].map((h) => h.trim());
const dataRows = rows.slice(1);

// Build JSON objects
const out = dataRows.map((r) => {
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    const key = headers[i];
    const raw = r[i] ?? "";
    if (ARRAY_COLS.has(key)) {
      const s = (raw || "").trim();
      obj[key] = s
        ? s
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : [];
    } else {
      obj[key] = raw;
    }
  }
  return obj;
});

// Print pretty JSON to stdout
process.stdout.write(JSON.stringify(out, null, 2) + "\n");
