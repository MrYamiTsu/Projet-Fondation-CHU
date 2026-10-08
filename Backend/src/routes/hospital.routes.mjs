import express from 'express';

import { getHospitalById, getAllHospitals } from '../controllers/hospital.controller.mjs';

const router = express.Router();

router.get('/:id', getHospitalById);
router.get('/', getAllHospitals);

export default router;