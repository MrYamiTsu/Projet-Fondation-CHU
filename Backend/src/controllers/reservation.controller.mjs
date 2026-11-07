import {
  getAllReservations,
  createReservation,
  getReservationById,
  getReservationsByEmplacementId,
  getReservationsByStatus,
  updateReservation,
  confirmReservation,
} from "../models/reservation.mjs";

export async function obtenirToutesLesReservations(req, res, next) {
  try {
    const reservations = await getAllReservations();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Réservations récupérées avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        reservations,
        count: reservations.length,
      },
    });
  } catch (erreur) {
    return next(erreur);
  }
}

export async function addReservation(req, res, next) {
  try {
    const { emplacementId, dateDebut, dateFin } = req.body;
    const reservations = await getReservationsByEmplacementId(
      Number(emplacementId),
    );

    const conflit = reservations.some(
      (reservation) =>
        reservation.statut === "confirmed" &&
        new Date(reservation.date_debut) <= new Date(dateFin) &&
        new Date(reservation.date_fin) >= new Date(dateDebut),
    );

    if (conflit) {
      const erreur = new Error(
        "Cet emplacement est déjà réservé pour cette période",
      );
      erreur.status = 409;
      return next(erreur);
    }
    const reservation = await createReservation(
  Number(emplacementId),
  req.user.id,
  dateDebut,
  dateFin,
);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Réservation créée avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        reservation,
      },
    });
  } catch (erreur) {
    return next(erreur);
  }
}

export async function obtenirReservationParId(req, res, next) {
  const { id } = req.params;

  if (
    id.trim() === "" ||
    !Number.isSafeInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    const erreur = new Error("Identifiant de réservation invalide");
    erreur.status = 400;
    return next(erreur);
  }

  try {
    const reservation = await getReservationById(Number(id));

    if (!reservation) {
      const erreur = new Error("Réservation introuvable");
      erreur.status = 404;
      return next(erreur);
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Réservation récupérée avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        reservation,
      },
    });
  } catch (erreur) {
    return next(erreur);
  }
}

export async function obtenirReservationsParEmplacement(req, res, next) {
  const { emplacementId } = req.params;

  if (
    emplacementId.trim() === "" ||
    !Number.isSafeInteger(Number(emplacementId)) ||
    Number(emplacementId) <= 0
  ) {
    const erreur = new Error("Identifiant d'emplacement invalide");
    erreur.status = 400;
    return next(erreur);
  }

  try {
    const reservations = await getReservationsByEmplacementId(
      Number(emplacementId),
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Réservations de l'emplacement récupérées avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        reservations,
        count: reservations.length,
      },
    });
  } catch (erreur) {
    return next(erreur);
  }
}

export async function obtenirReservationsParStatut(req, res, next) {
  const { status } = req.query;

  if (typeof status !== "string" || status.trim() === "") {
    const erreur = new Error("Statut invalide");
    erreur.status = 400;
    return next(erreur);
  }

  try {
    const reservations = await getReservationsByStatus(status.trim());

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Réservations par statut récupérées avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        reservations,
        count: reservations.length,
      },
    });
  } catch (erreur) {
    return next(erreur);
  }
}

export async function modifyReservation(req, res, next) {
  const { id } = req.params;

  try {
    const { emplacementId, dateDebut, dateFin } = req.body;

    const reservation = await updateReservation(
      Number(id),
      Number(emplacementId),
      dateDebut,
      dateFin,
    );

    if (!reservation) {
      const erreur = new Error("Réservation introuvable");
      erreur.status = 404;
      return next(erreur);
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Réservation modifiée avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        reservation,
      },
    });
  } catch (erreur) {
    return next(erreur);
  }
}

export async function approveReservation(req, res, next) {
  const { id } = req.params;

  try {
    const demande = await getReservationById(Number(id));

    if (demande) {
      const reservations = await getReservationsByEmplacementId(
        Number(demande.emplacement_id),
      );

      const conflit = reservations.some(
        (reservation) =>
          Number(reservation.id) !== Number(id) &&
          reservation.statut === "confirmed" &&
          new Date(reservation.date_debut) <= new Date(demande.date_fin) &&
          new Date(reservation.date_fin) >= new Date(demande.date_debut),
      );

      if (conflit) {
        const erreur = new Error(
          "Cet emplacement est déjà réservé pour cette période",
        );
        erreur.status = 409;
        return next(erreur);
      }
    }
    const reservation = await confirmReservation(Number(id));

    if (!reservation) {
      const existingReservation = await getReservationById(Number(id));

      const erreur = existingReservation
        ? new Error("Cette réservation n'est pas en attente")
        : new Error("Réservation introuvable");

      erreur.status = existingReservation ? 409 : 404;
      return next(erreur);
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Réservation confirmée avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        reservation,
      },
    });
  } catch (erreur) {
    return next(erreur);
  }
}
