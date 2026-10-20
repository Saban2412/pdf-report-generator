import express from "express";
import { initializeDatabase } from "./data/db.js";
import reportRoutes from "./routes/reports.js";

const app = express();
const PORT = process.env.PORT || 3000;

initializeDatabase();

app.use(express.json());

app.use(reportRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
