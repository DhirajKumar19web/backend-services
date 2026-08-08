import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'auth-service', status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/v1/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint placeholder' });
});

app.post('/api/v1/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint placeholder' });
});

app.listen(PORT, () => {
  console.log(`[auth-service] Running on port ${PORT}`);
});
