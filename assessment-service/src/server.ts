import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5008;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'assessment-service', status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/v1/assessments/test', (req, res) => {
  res.json({ message: 'assessment-service test endpoint' });
});

app.listen(PORT, () => {
  console.log(`[assessment-service] Running on port ${PORT}`);
});
