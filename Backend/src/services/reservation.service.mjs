import {
  getAllReservations,
  createReservation,
  getReservationById,
  getReservationsByEmplacementId,
  getReservationsByStatus,
  getReservationsByUserId,
  confirmReservation,
  updateMyPendingReservation,
  cancelMyPendingReservation,
} from "../models/reservation.mjs";

const STATUTS_BLOQUANTS = ["pending", "confirmed"];
const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/;

const MESSAGE_ID_RESERVATION = "Identifiant de réservation invalide";
const MESSAGE_ID_EMPLACEMENT = "Identifiant d'emplacement invalide";
const MESSAGE_CONFLIT = "Cet emplacement est déjà réservé pour cette période";
const MESSAGE_INTROUVABLE = "Réservation introuvable";


function creerErreur(message, status) {
  const erreur = new Error(message);
  erreur.status = status;
  return erreur;
}

function validerId(id, message) {
  const nombre = Number(id);

  if (!Number.isSafeInteger(nombre) || nombre <= 0) {
    throw creerErreur(message, 400);
  }

  return nombre;
}

function estDateValide(valeur) {
  return (
    typeof valeur === "string" &&
    FORMAT_DATE.test(valeur) &&
    !Number.isNaN(Date.parse(valeur))
  );
}

function validerPeriode(dateDebut, dateFin) {
  if (!estDateValide(dateDebut) || !estDateValide(dateFin) || dateDebut > dateFin) {
    throw creerErreur("Dates invalides", 400);
  }
}


async function verifierDisponibilite(emplacementId, dateDebut, dateFin, idAIgnorer = null) {
  const reservations = await getReservationsByEmplacementId(Number(emplacementId));

  const conflit = reservations.some(
    (reservation) =>
      Number(reservation.id) !== idAIgnorer &&
      STATUTS_BLOQUANTS.includes(reservation.statut) &&
      new Date(reservation.date_debut) <= new Date(dateFin) &&
      new Date(reservation.date_fin) >= new Date(dateDebut),
  );

  if (conflit) {
    throw creerErreur(MESSAGE_CONFLIT, 409);
  }
}


export async function obtenirToutesLesReservations() {
  return getAllReservations();
}

export async function getMyReservations(utilisateurId) {
  return getReservationsByUserId(utilisateurId);
}

export async function obtenirReservationParId(id) {
  const reservation = await getReservationById(validerId(id, MESSAGE_ID_RESERVATION));

  if (!reservation) {
    throw creerErreur(MESSAGE_INTROUVABLE, 404);
  }

  return reservation;
}

export async function obtenirReservationsParEmplacement(emplacementId) {
  return getReservationsByEmplacementId(validerId(emplacementId, MESSAGE_ID_EMPLACEMENT));
}

export async function obtenirReservationsParStatut(status) {
  if (typeof status !== "string" || status.trim() === "") {
    throw creerErreur("Statut invalide", 400);
  }

  return getReservationsByStatus(status.trim());
}


export async function addReservation(utilisateurId, { emplacementId, dateDebut, dateFin }) {
  const idEmplacement = validerId(emplacementId, MESSAGE_ID_EMPLACEMENT);
  validerPeriode(dateDebut, dateFin);

  await verifierDisponibilite(idEmplacement, dateDebut, dateFin);

  return createReservation(idEmplacement, utilisateurId, dateDebut, dateFin);
}

export async function updateMyReservation(utilisateurId, id, { dateDebut, dateFin }) {
  const idReservation = validerId(id, MESSAGE_ID_RESERVATION);
  validerPeriode(dateDebut, dateFin);

  const reservation = await getReservationById(idReservation);

  if (!reservation || Number(reservation.utilisateur_id) !== Number(utilisateurId)) {
    throw creerErreur(MESSAGE_INTROUVABLE, 404);
  }

  if (reservation.statut !== "pending") {
    throw creerErreur("Seule une réservation en attente peut être modifiée", 409);
  }

  await verifierDisponibilite(reservation.emplacement_id, dateDebut, dateFin, idReservation);

  const reservationModifiee = await updateMyPendingReservation(
    idReservation,
    utilisateurId,
    dateDebut,
    dateFin,
  );

  if (!reservationModifiee) {
    throw creerErreur("La réservation ne peut plus être modifiée", 409);
  }

  return reservationModifiee;
}

export async function cancelMyReservation(utilisateurId, id) {
  const idReservation = validerId(id, MESSAGE_ID_RESERVATION);

  const reservation = await cancelMyPendingReservation(idReservation, utilisateurId);

  if (!reservation) {
    throw creerErreur("Réservation introuvable ou non annulable", 409);
  }

  return reservation;
}


export async function approveReservation(id) {
  const idReservation = validerId(id, MESSAGE_ID_RESERVATION);

  const demande = await getReservationById(idReservation);

  if (!demande) {
    throw creerErreur(MESSAGE_INTROUVABLE, 404);
  }

  await verifierDisponibilite(
    demande.emplacement_id,
    demande.date_debut,
    demande.date_fin,
    idReservation,
  );

  const reservation = await confirmReservation(idReservation);

  if (!reservation) {
    throw creerErreur("Cette réservation n'est pas en attente", 409);
  }

  return reservation;
}
