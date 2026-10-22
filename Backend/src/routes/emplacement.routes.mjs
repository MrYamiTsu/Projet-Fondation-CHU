import express from 'express';
import { getPlotByLieu, getPlotById, getAllPlots, addPlot, modifyPlot} from '../controllers/emplacement.controller.mjs';
import {validatePlot, validatePlotId} from '../middlewares/emplacement.middleware.mjs';

const router = express.Router();

router.get('/', getAllPlots);

router.get('/recherche', getPlotByLieu);

router.get('/:id', validatePlotId, obtenirEmplacementParId);

router.post('/', verifyToken, requireAdmin, validatePlot, addPlot);

router.put('/:id', verifyToken, requireAdmin, validatePlotId, validatePlot, modifyPlot);

export default router;