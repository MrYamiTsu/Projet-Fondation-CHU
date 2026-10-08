
import {
  getAllReservations,
  createReservation,
  getReservationById,
  getReservationsByEmplacementId,
  getReservationsByStatus
} from '../models/reservation.mjs';


export async function obtenirToutesLesReservations(req, res, next) {
  try {
    const reservations = await getAllReservations();

    return res.status(200).json(reservations);
  } catch (erreur) {
    return next(erreur);
  }
}


export async function addReservation(req, res, next) {
  const { emplacementId, dateDebut, dateFin } = req.body;

  try {
    const reservation = await createReservation(
      Number(emplacementId),
      dateDebut,
      dateFin
    );

    return res.status(201).json(reservation);
  } catch (erreur) {
    return next(erreur);
  }
}

export async function obtenirReservationParId(req, res, next) {
  const { id } = req.params;

  if (!Number.isSafeInteger(Number(id)) ||
      Number(id) <= 0 ||
      id.trim() === '') {
    const erreur = new Error('Identifiant de réservation invalide');
    erreur.status = 400;
    return next(erreur);
  }

  try {
    const reservation = await getReservationById(Number(id));

    if (!reservation) {
      const erreur = new Error('Réservation introuvable');
      erreur.status = 404;
      return next(erreur);
    }

    return res.status(200).json(reservation);
  } catch (erreur) {
    return next(erreur);
  }
}


export async function obtenirReservationsParEmplacement(req, res, next) {
  const { emplacementId } = req.params;

  if (!Number.isSafeInteger(Number(emplacementId)) ||
      Number(emplacementId) <= 0 ||
      emplacementId.trim() === '') {
    const erreur = new Error('Identifiant d’emplacement invalide');
    erreur.status = 400;
    return next(erreur);
  }

  try {
    const reservations = await getReservationsByEmplacementId(
      Number(emplacementId)
    );

    return res.status(200).json(reservations);
  } catch (erreur) {
    return next(erreur);
  }
}


export async function obtenirReservationsParStatut(req, res, next) {
  const { status } = req.query;

  if (typeof status !== 'string' || status.trim() === '') {
    const erreur = new Error('Veuillez fournir un statut valide');
    erreur.status = 400;
    return next(erreur);
  }

  try {
    const reservations = await getReservationsByStatus(status.trim());

    return res.status(200).json(reservations);
  } catch (erreur) {
    return next(erreur);
  }
}
