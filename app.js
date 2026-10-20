import express from "express";
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});
app.get("/", (req, res) => {
  res.send("Welcome to the PDF Report Generator API");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
