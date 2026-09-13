import express from "express";
import cors from "cors";
import routes from "./api/routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

export default app;