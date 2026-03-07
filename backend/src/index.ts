import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import savingRoutes from './routes/savingRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:5173'];

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(cors({ origin: allowedOrigins, optionsSuccessStatus: 200 }));
app.use(helmet());
app.use(express.json());
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/savings', savingRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Chama API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
