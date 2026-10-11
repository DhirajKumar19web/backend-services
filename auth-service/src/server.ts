import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { z } from "zod";

const SERVICE_NAME = "auth-service";

const env = z.object({ PORT: z.coerce.number().int().min(1).max(65535) }).parse(process.env);

const app = express();

app.use(helmet());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ service: SERVICE_NAME, status: "OK", timestamp: new Date().toISOString() });
});

app.post("/login", (_req, res) => {
  res.json({ message: "Login endpoint placeholder" });
});

app.post("/register", (_req, res) => {
  res.json({ message: "Register endpoint placeholder" });
});

app.listen(env.PORT, () => {
  console.log(`[${SERVICE_NAME}] Running on port ${env.PORT}`);
});
