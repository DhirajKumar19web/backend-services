import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5009;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'certificate-service', status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/v1/certificates/test', (req, res) => {
  res.json({ message: 'certificate-service test endpoint' });
});

app.listen(PORT, () => {
  console.log(`[certificate-service] Running on port ${PORT}`);
});
