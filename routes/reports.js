import express from "express";
import path from "node:path";
import fs from "node:fs";
import { db } from "../data/db.js";
import { getReportData } from "../data/aggregation.js";
import { generateHtml } from "../src/generateHtml.js";
import { generatePdfReport } from "../src/pdfService.js";

const router = express.Router();

router.post("/reports", async (req, res, next) => {
  try {
    const reportData = getReportData();
    const htmlContent = generateHtml(reportData);

    const dummyPath = "pending";
    const insertStmt = db
      .prepare(`INSERT INTO reports (path) VALUES (?)`)
      .run(dummyPath);
    const reportId = insertStmt.lastInsertRowid;

    const pdfFileName = `${reportId}.pdf`;
    const relativePdfPath = path.join("reports", pdfFileName);
    const absolutePdfPath = path.resolve(process.cwd(), relativePdfPath);

    await generatePdfReport(htmlContent, absolutePdfPath);

    db.prepare(`UPDATE reports SET path = ? WHERE id = ?`).run(
      relativePdfPath,
      reportId,
    );

    res.status(201).json({
      id: reportId,
      file: `/reports/${reportId}/file`,
    });
  } catch (error) {
    console.error("Error generating report:", error.message);
    next(error);
  }
});

router.get("/reports/:id", (req, res) => {
  try {
    const { id } = req.params;
    const report = db.prepare(`SELECT * FROM reports WHERE id = ?`).get(id);

    if (!report) {
      return res.status(404).json({ error: `Report with id ${id} not found.` });
    }

    res.status(200).json({
      id: report.id,
      created_at: report.created_at,
      file: `/reports/${report.id}/file`,
    });
  } catch (error) {
    console.error("Error fetching report record:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reports/:id/file", (req, res) => {
  try {
    const { id } = req.params;
    const report = db.prepare(`SELECT * FROM reports WHERE id = ?`).get(id);

    if (!report) {
      return res.status(404).json({ error: "Report not found." });
    }

    const absolutePdfPath = path.resolve(process.cwd(), report.path);

    if (!fs.existsSync(absolutePdfPath)) {
      return res.status(404).json({ error: "PDF file missing from disk." });
    }

    res.sendFile(absolutePdfPath);
  } catch (error) {
    console.error("Error serving PDF file:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
