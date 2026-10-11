import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { z } from "zod";

const SERVICE_NAME = "notification-service";

const env = z.object({ PORT: z.coerce.number().int().min(1).max(65535) }).parse(process.env);

const app = express();

app.use(helmet());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ service: SERVICE_NAME, status: "OK", timestamp: new Date().toISOString() });
});

app.post("/send", (_req, res) => {
  res.json({ message: "Notification send endpoint placeholder" });
});

app.listen(env.PORT, () => {
  console.log(`[${SERVICE_NAME}] Running on port ${env.PORT}`);
});
