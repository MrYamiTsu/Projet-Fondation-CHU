import express from "express";

import {
  obtenirToutesLesReservations,
  addReservation,
  obtenirReservationParId,
  obtenirReservationsParEmplacement,
  obtenirReservationsConfirmees,
  obtenirReservationsParStatut,
  approveReservation,
  getMyReservations,
  updateMyReservation,
  cancelMyReservation,
} from "../controllers/reservation.controller.mjs";

import {
  validateReservation,
  validateReservationId,
} from "../middlewares/reservation.middleware.mjs";

import { verifyToken, requireAdmin } from "../middlewares/auth.middleware.mjs";

const router = express.Router();

router.get("/confirmed", obtenirReservationsConfirmees);
router.get("/", verifyToken, requireAdmin, obtenirToutesLesReservations);
router.get("/status", verifyToken, requireAdmin, obtenirReservationsParStatut);

router.get(
  "/emplacement/:emplacementId",
  obtenirReservationsParEmplacement,
);

router.get("/me", verifyToken, getMyReservations);

router.put("/me/:id", verifyToken, updateMyReservation);
router.patch("/me/:id/cancel", verifyToken, cancelMyReservation);

router.get(
  "/:id",
  verifyToken,
  requireAdmin,
  validateReservationId,
  obtenirReservationParId,
);

router.post("/", verifyToken, validateReservation, addReservation);



router.patch(
  "/:id/confirm",
  verifyToken,
  requireAdmin,
  validateReservationId,
  approveReservation,
);

export default router;
