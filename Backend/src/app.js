import express from 'express';
import { fileURLToPath } from 'node:url';
import apiRoutes from './routes/index.routes.js';
import logger from './middlewares/logger.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
const publicDirectory = fileURLToPath(new URL('../public/', import.meta.url));

app.disable('x-powered-by');

// L'ordre compte : journalisation, lecture du corps, fichiers, routes, erreurs.
app.use(logger);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use(express.static(publicDirectory));
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
