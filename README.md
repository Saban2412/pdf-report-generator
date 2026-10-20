# PDF Report Generator

> A small Express.js service that aggregates sales data from SQLite and generates executive sales reports as PDF documents.

## Overview

This project was built as a practical exercise in designing a backend reporting workflow. It demonstrates how to:

- expose a REST API with Express;
- persist orders and generated reports in SQLite;
- calculate report metrics with SQL aggregations;
- render a styled HTML report;
- convert the HTML document to an A4 PDF with Playwright;
- avoid unnecessary PDF generation by returning the latest report created on the current day.

The generated report contains:

- total order count;
- total revenue;
- the five products with the highest revenue;
- daily order and revenue breakdowns for the most recent seven days within the last 30 days.

## Tech Stack

- **Node.js** with native ES modules
- **Express 5** for the HTTP API
- **SQLite** through Node's built-in `node:sqlite` module
- **Playwright** for HTML-to-PDF rendering

## Requirements

- Node.js **22.5 or newer** (the project uses `node:sqlite` and `DatabaseSync`)
- npm
- Playwright browser dependencies

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Saban2412/pdf-report-generator.git
cd pdf-report-generator
```

### 2. Install dependencies

```bash
npm install
npx playwright install chromium
```

### 3. Start the API

```bash
node app.js
```

The server starts at:

```text
http://localhost:3000
```

The SQLite database is stored in `report.db`. The required `orders` and `reports` tables are created automatically when the application starts.

## Seed Sample Data

To replace the existing orders with 200 randomly generated orders covering the last 30 days, run:

```bash
node data/seed.js
```

> The seed script deletes the current rows from the `orders` table before inserting sample data. Use it only in a development environment.

## API Reference

### Generate a report

```http
POST /reports
Content-Type: application/json
```

#### Request body

The request body is optional:

```json
{}
```

By default, if a report was already generated today, the API returns that existing report instead of creating another PDF.

To explicitly generate a new report:

```json
{
  "force": true
}
```

#### New report response

`201 Created`

```json
{
  "id": 2,
  "file": "/reports/2/file"
}
```

#### Existing report response

`200 OK`

```json
{
  "id": 2,
  "file": "/reports/2/file",
  "message": "Report already generated today. Returned existing file."
}
```

### Get report metadata

```http
GET /reports/:id
```

Example:

```bash
curl http://localhost:3000/reports/2
```

Response:

```json
{
  "id": 2,
  "created_at": "2026-10-20 09:15:00",
  "file": "/reports/2/file"
}
```

### Download a generated PDF

```http
GET /reports/:id/file
```

Example:

```bash
curl --output report.pdf http://localhost:3000/reports/2/file
```

The endpoint returns `404 Not Found` when the report does not exist or its PDF file is missing from disk.

## Generate a PDF Without Starting the API

The standalone script in `test-pdf.js` runs the aggregation, HTML generation and PDF rendering pipeline directly:

```bash
node test-pdf.js
```

The output is written to `reports/test.pdf`.

## Project Structure

```text
.
├── app.js                  # Express application entry point
├── data/
│   ├── aggregation.js      # SQL queries used to build report data
│   ├── db.js               # SQLite connection and schema initialization
│   └── seed.js             # Development data generator
├── routes/
│   └── reports.js           # Report generation, metadata and file routes
├── src/
│   ├── generateHtml.js      # HTML report template
│   └── pdfService.js        # Playwright PDF rendering service
├── reports/                 # Generated PDF files
├── report.db               # SQLite database
├── test-pdf.js              # Standalone PDF generation script
└── package.json
```

## Report Generation Flow

1. `POST /reports` checks whether a report has already been generated today.
2. The aggregation layer reads order totals, top products and daily sales from SQLite.
3. The HTML template transforms the aggregated data into a printable report.
4. Playwright opens the HTML in Chromium and renders it as an A4 PDF.
5. The generated report path is saved in the `reports` table.
6. The API returns the report ID and download URL.

Generated PDF files are excluded from version control through `.gitignore`. The local `report.db` file is used by the application as its SQLite database.

## Database Schema

### `orders`

| Column | Type | Description |
| --- | --- | --- |
| `id` | `INTEGER` | Auto-incrementing primary key |
| `customer` | `TEXT` | Customer name |
| `product` | `TEXT` | Product name |
| `amount` | `REAL` | Order amount |
| `created_at` | `DATETIME` | Order creation timestamp |

### `reports`

| Column | Type | Description |
| --- | --- | --- |
| `id` | `INTEGER` | Auto-incrementing primary key |
| `path` | `TEXT` | Relative path to the generated PDF |
| `created_at` | `DATETIME` | Report creation timestamp |

## Development Notes

- The current implementation performs PDF generation synchronously inside the HTTP request.
- The daily report lookup provides a simple idempotency and duplicate-work protection mechanism.
- The `force` flag intentionally bypasses the daily reuse behavior.
- There is currently no automated test suite configured in `package.json`; `test-pdf.js` is a manual smoke-test script for the generation pipeline.
- For production use, add request validation, authentication/authorization, structured logging, stronger report-generation locking, and automated tests.

## Engineering Q&A

### Stage 4: Moving Work Out of the Request

> *At what point would you move this work out of the request?*
I would move the PDF generation out of the HTTP request into a background job queue (e.g., using Inngest or BullMQ) when the generation time exceeds 2–3 seconds, or when multiple concurrent users cause server CPU bottlenecks, preventing the API from blocking client requests.

### Stage 5: Idempotency Protection

> *What does your idempotency check protect against, and where does a missing check cost money?*
The idempotency check protects against duplicate resource creation and redundant server processing when a user double-clicks "Generate Report" or retries a request. In e-commerce or fintech, lacking idempotency can lead to double-billing a customer's credit card or sending duplicate promotional emails, directly resulting in financial loss and bad customer experience.

## License

This project is provided for educational and demonstration purposes.
