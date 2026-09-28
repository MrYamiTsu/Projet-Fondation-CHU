import express from 'express';
import { obtenirEmplacementsParLieu } from '../controllers/emplacement.controller.mjs';

const router = express.Router();

router.get('/', obtenirEmplacementsParLieu);

export default router;