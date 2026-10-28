import express from 'express';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import logger from './middlewares/logger.mjs';
import notFound from './middlewares/notFound.mjs';
import errorHandler from './middlewares/errorHandler.mjs';
import emplacementRoutes from './routes/emplacement.routes.mjs';
import reservationRoutes from './routes/reservation.routes.mjs';
import authRoutes from './routes/auth.routes.mjs';
import hospitalRoutes from './routes/hospital.routes.mjs';

const app = express();
const publicDirectory = fileURLToPath(new URL('../public/', import.meta.url));

app.disable('x-powered-by');

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error('Non autorisé par CORS'));
    },
    credentials: true,
  })
);

app.use(logger);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use(express.static(publicDirectory));

// Normalisation de l'URL pour Vercel serverless si x-matched-path est fourni
app.use((req, res, next) => {
  const matched = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
  if (matched && matched.startsWith('/api') && req.url === '/api') {
    req.url = matched;
  }
  next();
});

// Healthcheck pour tester l'API en direct
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'API Fondation CHU en ligne' });
});

// Routes principales (local ou avec réécriture)
app.use('/emplacements', emplacementRoutes);
app.use('/auth', authRoutes);
app.use('/reservations', reservationRoutes);

// Pour Vercel
app.use('/api/emplacements', emplacementRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;