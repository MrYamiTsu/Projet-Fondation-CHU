import express from 'express';

import {
  obtenirEmplacementsParLieu,
  obtenirEmplacementParId,
  getAllPlots
} from '../controllers/emplacement.controller.mjs';

const router = express.Router();

router.get('/', getAllPlots);
router.get('/recherche', obtenirEmplacementsParLieu);
router.get('/:id', obtenirEmplacementParId);

export default router;