import express from 'express';
import { obtenirEmplacementsParLieu, obtenirEmplacementParId, getAllPlots, addPlot, modifyPlot} from '../controllers/emplacement.controller.mjs';
import {validatePlot, validatePlotId} from '../middlewares/emplacement.middleware.mjs';

const router = express.Router();

router.get('/', getAllPlots);

router.get('/recherche', obtenirEmplacementsParLieu);

router.get('/:id', validatePlotId, obtenirEmplacementParId);

router.post('/', validatePlot, addPlot);

router.put('/:id', validatePlotId, validatePlot, modifyPlot);

export default router;