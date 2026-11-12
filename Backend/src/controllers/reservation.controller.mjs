import * as reservationService from "../services/reservation.service.mjs";
import { envoyerSucces } from "../utils/reponse.mjs";

function envoyerReservations(req, res, message, reservations) {
  return envoyerSucces(req, res, 200, message, {
    reservations,
    count: reservations.length,
  });
}

export async function obtenirToutesLesReservations(req, res, next) {
  try {
    const reservations = await reservationService.obtenirToutesLesReservations();

    return envoyerReservations(req, res, "Réservations récupérées avec succès", reservations);
  } catch (erreur) {
    return next(erreur);
  }
}

export async function getMyReservations(req, res, next) {
  try {
    const reservations = await reservationService.getMyReservations(req.user.id);

    return envoyerReservations(req, res, "Réservations récupérées avec succès", reservations);
  } catch (erreur) {
    return next(erreur);
  }
}


export async function addReservation(req, res, next) {
  try {
    const reservation = await reservationService.addReservation(req.user.id, req.body);

    return envoyerSucces(req, res, 201, "Réservation créée avec succès", { reservation });
  } catch (erreur) {
    return next(erreur);
  }
}

export async function obtenirReservationParId(req, res, next) {
  try {
    const reservation = await reservationService.obtenirReservationParId(req.params.id);

    return envoyerSucces(req, res, 200, "Réservation récupérée avec succès", { reservation });
  } catch (erreur) {
    return next(erreur);
  }
}

export async function obtenirReservationsParEmplacement(req, res, next) {
  try {
    const reservations = await reservationService.obtenirReservationsParEmplacement(
      req.params.emplacementId,
    );

    return envoyerReservations(
      req,
      res,
      "Réservations de l'emplacement récupérées avec succès",
      reservations,
    );
  } catch (erreur) {
    return next(erreur);
  }
}

export async function obtenirReservationsParStatut(req, res, next) {
  try {
    const reservations = await reservationService.obtenirReservationsParStatut(req.query.status);

    return envoyerReservations(
      req,
      res,
      "Réservations par statut récupérées avec succès",
      reservations,
    );
  } catch (erreur) {
    return next(erreur);
  }
}

export async function updateMyReservation(req, res, next) {
  try {
    const reservation = await reservationService.updateMyReservation(
      req.user.id,
      req.params.id,
      req.body,
    );

    return envoyerSucces(req, res, 200, "Réservation modifiée avec succès", { reservation });
  } catch (erreur) {
    return next(erreur);
  }
}

export async function cancelMyReservation(req, res, next) {
  try {
    const reservation = await reservationService.cancelMyReservation(req.user.id, req.params.id);

    return envoyerSucces(req, res, 200, "Réservation annulée avec succès", { reservation });
  } catch (erreur) {
    return next(erreur);
  }
}

export async function approveReservation(req, res, next) {
  try {
    const reservation = await reservationService.approveReservation(req.params.id);

    return envoyerSucces(req, res, 200, "Réservation confirmée avec succès", { reservation });
  } catch (erreur) {
    return next(erreur);
  }
}
