import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'user-service', status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/v1/users/test', (req, res) => {
  res.json({ message: 'user-service test endpoint' });
});

app.listen(PORT, () => {
  console.log(`[user-service] Running on port ${PORT}`);
});
