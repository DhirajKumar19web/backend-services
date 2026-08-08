import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'notification-service', status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/v1/notifications/send', (req, res) => {
  res.json({ message: 'Notification send endpoint placeholder' });
});

app.listen(PORT, () => {
  console.log(`[notification-service] Running on port ${PORT}`);
});
