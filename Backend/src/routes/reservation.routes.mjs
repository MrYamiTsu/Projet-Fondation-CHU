import express from 'express';

import {
  obtenirToutesLesReservations,
  addReservation,
  obtenirReservationParId,
  obtenirReservationsParEmplacement,
  obtenirReservationsParStatut,modifyReservation,
  approveReservation
} from '../controllers/reservation.controller.mjs';

import {validateReservation, validateReservationId } from '../middlewares/reservation.middleware.mjs';

const router = express.Router();

router.get('/', obtenirToutesLesReservations);

router.get('/status', obtenirReservationsParStatut);

router.get('/emplacement/:emplacementId', obtenirReservationsParEmplacement);

router.get('/:id', obtenirReservationParId);

router.post('/', validateReservation, addReservation);

router.put('/:id', validateReservationId,validateReservation, modifyReservation);

router.patch('/:id/confirm', validateReservationId, approveReservation)

export default router;