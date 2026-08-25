# CleanFlow — CSV Data Cleaning & Quality Control

> A client-style demonstration of turning an imperfect CSV export into clean, reviewable and documented data.

## Client outcome

CleanFlow targets a common small-business workflow: a CRM, customer, billing or migration export needs the same manual cleanup every week before it can be reused.

The tool lets the user load a CSV, immediately compare **before / after**, review what was corrected, identify values that still require human attention, and export both the cleaned dataset and a structured quality report.

## Delivery workflow

```text
Messy CSV export
      ↓
Delimiter detection + safe CSV parsing
      ↓
Whitespace / email / phone / date normalization
      ↓
Duplicate detection
      ↓
Before / After preview
      ↓
Quality status: READY or REVIEW REQUIRED
      ↓
Clean CSV + JSON quality report
```

## What the user gets

- automatic `,`, `;` or tab delimiter detection;
- quoted-field CSV parsing;
- whitespace cleanup;
- email normalization and validation;
- French phone normalization and validation;
- date normalization to `YYYY-MM-DD`;
- duplicate removal prioritizing email/phone identity;
- before/after preview;
- correction counters;
- explicit `READY` / `REVIEW REQUIRED` quality status;
- cleaned CSV export;
- structured JSON quality report with source filename, timestamp, summary, transformations, validation counts, detected delimiter and headers;
- local browser processing: the imported file is not uploaded to an application server;
- no external runtime dependency for the cleaning engine.

## Try the demo

```bash
npm run serve
```

Then open the local address shown by the server and click **Charger l'exemple**, or import a CSV of your own.

The included sample is synthetic and intentionally contains formatting issues so the before/after workflow can be demonstrated immediately.

## Quality philosophy

CleanFlow does **not** silently invent replacement values for malformed data. Recognized values are normalized when the transformation is deterministic; unresolved formats remain visible and are counted in the quality report for human review.

That distinction matters in real client work: automation should reduce repetitive cleanup without hiding uncertainty.

## Tests

```bash
npm test
```

The automated tests cover CSV parsing, quoted fields, dates, French phone numbers, deduplication and export behavior. The repository also includes GitHub Actions CI. fileciteturn238file0L1-L2

## Typical client adaptations

This pattern can be adapted to CRM exports, customer databases, billing preparation, migrations, recurring reporting inputs, custom business validation rules, XLSX files, APIs or database workflows.

## Stack

JavaScript ES modules · HTML · CSS · Node.js for tests/local serving.

## Scope

This repository is a portfolio demonstration using synthetic sample data. Production rules should always be adapted to the client's fields, country formats and business requirements before delivery.

---

**Still cleaning the same spreadsheet manually every week?** This workflow can be adapted to the exact columns, validation rules and output format of an existing business process.
