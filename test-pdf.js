import { getReportData } from "./data/aggregation.js";
import { generateHtml } from "./src/generateHtml.js";
import { generatePdfReport } from "./src/pdfService.js";
import path from "node:path";

async function run() {
  console.log("1. Fetching report data from SQLite...");
  const data = getReportData();

  console.log("2. Generating HTML template...");
  const html = generateHtml(data);

  const outputPath = path.resolve(process.cwd(), "reports", "test.pdf");

  console.log("3. Rendering PDF with Playwright...");
  await generatePdfReport(html, outputPath);

  console.log(`✅ SUCCESS: PDF generated at ${outputPath}`);
}

run().catch(console.error);
