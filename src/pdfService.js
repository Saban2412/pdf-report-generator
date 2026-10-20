import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

export async function generatePdfReport(htmlContent, outputPath) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle" });

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();
}
