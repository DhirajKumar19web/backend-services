import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5006;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'payment-service', status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/v1/payments/test', (req, res) => {
  res.json({ message: 'payment-service test endpoint' });
});

app.listen(PORT, () => {
  console.log(`[payment-service] Running on port ${PORT}`);
});
