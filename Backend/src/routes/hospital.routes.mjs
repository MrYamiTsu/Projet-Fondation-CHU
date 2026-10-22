import express from 'express';

import {
  getHospitalById,
  getAllHospitals,
  getHospitalEmplacements,
  addHospital,
  modifyHospital,
} from '../controllers/hospital.controller.mjs';

const router = express.Router();

router.get('/', getAllHospitals);

router.get('/:id/emplacements', getHospitalEmplacements);

router.get('/:id', getHospitalById);

router.post('/', addHospital);

router.put('/:id', modifyHospital);

export default router;