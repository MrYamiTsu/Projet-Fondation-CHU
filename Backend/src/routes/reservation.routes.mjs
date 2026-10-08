import express from 'express';

import {
  obtenirToutesLesReservations,
  addReservation,
  obtenirReservationParId,
  obtenirReservationsParEmplacement,
  obtenirReservationsParStatut
} from '../controllers/reservation.controller.mjs';

import {validateReservation } from '../middlewares/reservation.middleware.mjs';

const router = express.Router();

router.get('/', obtenirToutesLesReservations);

router.get('/status', obtenirReservationsParStatut);

router.get('/emplacement/:emplacementId', obtenirReservationsParEmplacement);

router.get('/:id', obtenirReservationParId);

router.post('/', validateReservation, addReservation);

export default router;