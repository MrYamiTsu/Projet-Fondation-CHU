import express from 'express';
import { fileURLToPath } from 'node:url';
import logger from './middlewares/logger.mjs';
import notFound from './middlewares/notFound.mjs';
import errorHandler from './middlewares/errorHandler.mjs';
import emplacementRoutes from './routes/emplacement.routes.mjs';
const app = express();
const publicDirectory = fileURLToPath(new URL('../public/', import.meta.url));

app.disable('x-powered-by');

app.use(logger);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use(express.static(publicDirectory));
app.use('/emplacements', emplacementRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;
