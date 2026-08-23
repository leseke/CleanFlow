const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function detectDelimiter(text) {
  const line = (text.split(/\r?\n/).find(Boolean) || '');
  const candidates = [',',';','\t'];
  return candidates.map(d => ({ d, n: countOutsideQuotes(line, d) }))
    .sort((a,b) => b.n - a.n)[0]?.d || ',';
}

function countOutsideQuotes(line, delimiter) {
  let quoted = false, count = 0;
  for (let i=0;i<line.length;i++) {
    if (line[i] === '"') {
      if (quoted && line[i+1] === '"') i++;
      else quoted = !quoted;
    } else if (!quoted && line[i] === delimiter) count++;
  }
  return count;
}

export function parseCSV(text, delimiter = detectDelimiter(text)) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i=0;i<text.length;i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i+1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (c === delimiter && !quoted) {
      row.push(field); field = '';
    } else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i+1] === '\n') i++;
      row.push(field); field='';
      if (row.some(v => v !== '')) rows.push(row);
      row=[];
    } else field += c;
  }
  if (field.length || row.length) { row.push(field); if (row.some(v => v !== '')) rows.push(row); }
  return { delimiter, rows };
}

export function normalizeHeader(value, index) {
  const clean = String(value ?? '').trim().replace(/^\uFEFF/, '').replace(/\s+/g, ' ');
  return clean || `Colonne ${index + 1}`;
}

function inferKind(header) {
  const h = header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/(^|\b)(e-?mail|courriel)(\b|$)/.test(h)) return 'email';
  if (/(telephone|tel\b|mobile|portable|phone)/.test(h)) return 'phone';
  if (/(date|naissance|created|creation|inscription)/.test(h)) return 'date';
  return 'text';
}

export function normalizeEmail(value) {
  const out = String(value ?? '').trim().toLowerCase();
  return { value: out, valid: out === '' || EMAIL_RE.test(out) };
}

export function normalizeFrenchPhone(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return { value:'', valid:true, changed:false };
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0033')) digits = digits.slice(4);
  else if (digits.startsWith('33')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 9) {
    return { value:`+33 ${digits[0]} ${digits.slice(1).match(/.{1,2}/g).join(' ')}`, valid:true, changed:true };
  }
  return { value:raw.replace(/\s+/g,' '), valid:false, changed:false };
}

export function normalizeDate(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return { value:'', valid:true, changed:false };
  let m = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2}|\d{4})$/);
  if (m) {
    let [,d,mo,y] = m; if (y.length===2) y = Number(y) >= 70 ? `19${y}` : `20${y}`;
    const iso = `${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
    const dt = new Date(`${iso}T00:00:00Z`);
    const valid = !Number.isNaN(dt.getTime()) && dt.getUTCDate()===Number(d) && dt.getUTCMonth()+1===Number(mo);
    return { value: valid ? iso : raw, valid, changed: valid && iso !== raw };
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { value:raw, valid:true, changed:false };
  return { value:raw, valid:false, changed:false };
}

function rowKey(row, headers) {
  const normalized = row.map(v => String(v ?? '').trim().toLowerCase());
  const emailIdx = headers.findIndex(h => inferKind(h)==='email');
  const phoneIdx = headers.findIndex(h => inferKind(h)==='phone');
  if (emailIdx >= 0 && normalized[emailIdx]) return `email:${normalized[emailIdx]}`;
  if (phoneIdx >= 0 && normalized[phoneIdx]) return `phone:${normalized[phoneIdx].replace(/\D/g,'')}`;
  return normalized.join('\u241f');
}

export function cleanDataset(parsed, options = {}) {
  const removeDuplicates = options.removeDuplicates ?? true;
  if (!parsed.rows.length) return emptyResult();
  const maxCols = Math.max(...parsed.rows.map(r => r.length));
  const headers = Array.from({length:maxCols},(_,i)=>normalizeHeader(parsed.rows[0][i],i));
  const kinds = headers.map(inferKind);
  const report = {
    inputRows: Math.max(0, parsed.rows.length - 1), outputRows:0, duplicatesRemoved:0,
    trimmedCells:0, emailsNormalized:0, invalidEmails:0, phonesNormalized:0, invalidPhones:0,
    datesNormalized:0, invalidDates:0, emptyCells:0, headers, delimiter: parsed.delimiter
  };
  const seen = new Set();
  const rows = [];
  for (const source of parsed.rows.slice(1)) {
    const padded = Array.from({length:maxCols},(_,i)=>source[i] ?? '');
    const cleaned = padded.map((v,i) => {
      const before = String(v ?? '');
      let value = before.trim().replace(/\s+/g,' ');
      if (value !== before) report.trimmedCells++;
      if (!value) report.emptyCells++;
      if (kinds[i] === 'email') {
        const r = normalizeEmail(value); if (r.value !== value) report.emailsNormalized++; if (!r.valid) report.invalidEmails++; value=r.value;
      } else if (kinds[i] === 'phone') {
        const r = normalizeFrenchPhone(value); if (r.changed) report.phonesNormalized++; if (!r.valid) report.invalidPhones++; value=r.value;
      } else if (kinds[i] === 'date') {
        const r = normalizeDate(value); if (r.changed) report.datesNormalized++; if (!r.valid) report.invalidDates++; value=r.value;
      }
      return value;
    });
    const key = rowKey(cleaned, headers);
    if (removeDuplicates && seen.has(key)) { report.duplicatesRemoved++; continue; }
    seen.add(key); rows.push(cleaned);
  }
  report.outputRows = rows.length;
  return { headers, kinds, rows, report };
}

function emptyResult() { return { headers:[], kinds:[], rows:[], report:{inputRows:0,outputRows:0,duplicatesRemoved:0,trimmedCells:0,emailsNormalized:0,invalidEmails:0,phonesNormalized:0,invalidPhones:0,datesNormalized:0,invalidDates:0,emptyCells:0,headers:[],delimiter:','} }; }

export function toCSV(headers, rows, delimiter = ';') {
  const quote = v => {
    const s = String(v ?? '');
    return /["\r\n;,\t]/.test(s) || s.includes(delimiter) ? `"${s.replace(/"/g,'""')}"` : s;
  };
  return [headers, ...rows].map(r => r.map(quote).join(delimiter)).join('\r\n');
}