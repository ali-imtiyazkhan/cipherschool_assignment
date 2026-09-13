import express from "express";
import cors from "cors";
import routes from "./api/routes";

const app = express();

const allowedOrigins = [
  "https://cipherschool-assignment-web.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== "*") {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      if (
        process.env.CORS_ORIGIN === "*" ||
        allowedOrigins.some((o) => o.replace(/\/+$/, "") === cleanOrigin) ||
        cleanOrigin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
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