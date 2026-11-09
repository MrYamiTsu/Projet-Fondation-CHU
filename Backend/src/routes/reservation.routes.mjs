import express from 'express';

import {
  obtenirToutesLesReservations,
  addReservation,
  obtenirReservationParId,
  obtenirReservationsParEmplacement,
  obtenirReservationsConfirmees,
  obtenirReservationsParStatut,
  modifyReservation,
  approveReservation
} from '../controllers/reservation.controller.mjs';

import {
  validateReservation,
  validateReservationId
} from '../middlewares/reservation.middleware.mjs';

import {
  verifyToken,
  requireAdmin
} from '../middlewares/auth.middleware.mjs';

const router = express.Router();

router.get('/', verifyToken, requireAdmin, obtenirToutesLesReservations);

router.get('/status', verifyToken, requireAdmin, obtenirReservationsParStatut);

router.get('/confirmed', obtenirReservationsConfirmees);

router.get('/emplacement/:emplacementId', obtenirReservationsParEmplacement);

router.get('/:id', verifyToken, requireAdmin, validateReservationId, obtenirReservationParId);

router.post('/', verifyToken, validateReservation, addReservation);

router.put('/:id', verifyToken, requireAdmin, validateReservationId, validateReservation, modifyReservation);

router.patch('/:id/confirm', verifyToken, requireAdmin, validateReservationId, approveReservation);

export default router;