import test from 'node:test';
import assert from 'node:assert/strict';
import { detectDelimiter, parseCSV, cleanDataset, normalizeDate, normalizeFrenchPhone, toCSV } from '../src/cleaner.mjs';

test('detecte le point-virgule', () => assert.equal(detectDelimiter('Nom;Email;Téléphone\nA;B;C'), ';'));
test('parse les champs CSV quotes', () => {
  const p = parseCSV('Nom,Note\n"Martin, Paul","Bonjour, monde"', ',');
  assert.deepEqual(p.rows[1], ['Martin, Paul','Bonjour, monde']);
});
test('normalise date française', () => assert.deepEqual(normalizeDate('3/7/2026'), {value:'2026-07-03', valid:true, changed:true}));
test('normalise téléphone français', () => assert.equal(normalizeFrenchPhone('06 12 34 56 78').value, '+33 6 12 34 56 78'));
test('nettoie, normalise et dédoublonne', () => {
  const p = parseCSV('Nom;Email;Téléphone;Date inscription\n  Alice  ; ALICE@EXAMPLE.COM ;0612345678;01/08/2026\nAlice;alice@example.com;06 12 34 56 78;2026-08-01');
  const c = cleanDataset(p);
  assert.equal(c.rows.length, 1);
  assert.equal(c.rows[0][1], 'alice@example.com');
  assert.equal(c.rows[0][2], '+33 6 12 34 56 78');
  assert.equal(c.rows[0][3], '2026-08-01');
  assert.equal(c.report.duplicatesRemoved, 1);
});
test('exporte CSV sans perdre les séparateurs', () => {
  const csv = toCSV(['Nom','Note'], [['Alice','a;b']], ';');
  assert.match(csv, /"a;b"/);
});