import pool from './_db.js';
import {
  HttpError,
  setCors,
  sendSuccess,
  sendError,
  authenticate,
  requireAdmin,
  parseId,
  routeSegments,
} from './_http.js';

const STATUTS_BLOQUANTS = ['pending', 'confirmed'];
const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MESSAGE_ID_RESERVATION = 'Identifiant de réservation invalide';
const MESSAGE_ID_EMPLACEMENT = "Identifiant d'emplacement invalide";
const MESSAGE_INTROUVABLE = 'Réservation introuvable';

function estDateValide(valeur) {
  return typeof valeur === 'string' && FORMAT_DATE.test(valeur) && !Number.isNaN(Date.parse(valeur));
}

function validerPeriode(dateDebut, dateFin) {
  if (!estDateValide(dateDebut) || !estDateValide(dateFin) || dateDebut > dateFin) {
    throw new HttpError(400, 'Dates invalides');
  }
}

async function reservationsParEmplacement(emplacementId) {
  const { rows } = await pool.query(
    `SELECT id, emplacement_id, statut, date_debut, date_fin
       FROM reservation
      WHERE emplacement_id = $1
      ORDER BY date_debut ASC`,
    [emplacementId],
  );
  return rows;
}

async function reservationParId(id) {
  const { rows } = await pool.query('SELECT * FROM reservation WHERE id = $1', [id]);
  return rows[0];
}

async function verifierDisponibilite(emplacementId, dateDebut, dateFin, idAIgnorer = null) {
  const reservations = await reservationsParEmplacement(Number(emplacementId));
  const conflit = reservations.some(
    (r) =>
      Number(r.id) !== idAIgnorer &&
      STATUTS_BLOQUANTS.includes(r.statut) &&
      new Date(r.date_debut) <= new Date(dateFin) &&
      new Date(r.date_fin) >= new Date(dateDebut),
  );

  if (conflit) {
    throw new HttpError(409, 'Cet emplacement est déjà réservé pour cette période');
  }
}

function envoyerListe(req, res, message, reservations) {
  return sendSuccess(req, res, 200, message, { reservations, count: reservations.length });
}

function envoyerUne(req, res, status, message, reservation) {
  return sendSuccess(req, res, status, message, { reservation });
}

async function listerToutes(req, res) {
  requireAdmin(req);
  const { rows } = await pool.query(
    `SELECT r.*, u.prenom, u.nom, u.email
       FROM reservation r
       LEFT JOIN utilisateur u ON u.id = r.utilisateur_id
      ORDER BY r.date_debut ASC`,
  );
  return envoyerListe(req, res, 'Réservations récupérées avec succès', rows);
}

async function creer(req, res) {
  const user = authenticate(req);
  const { emplacementId, dateDebut, dateFin } = req.body || {};
  const idEmplacement = parseId(emplacementId, MESSAGE_ID_EMPLACEMENT);

  if (typeof dateDebut !== 'string' || typeof dateFin !== 'string' || !dateDebut.trim() || !dateFin.trim()) {
    throw new HttpError(400, 'Veuillez fournir les deux dates');
  }
  validerPeriode(dateDebut, dateFin);
  if (dateDebut >= dateFin) {
    throw new HttpError(400, 'Les dates de réservation sont invalides');
  }

  await verifierDisponibilite(idEmplacement, dateDebut, dateFin);

  const { rows } = await pool.query(
    `INSERT INTO reservation (emplacement_id, utilisateur_id, statut, date_debut, date_fin)
     VALUES ($1, $2, 'pending', $3, $4)
     RETURNING *`,
    [idEmplacement, user.id, dateDebut, dateFin],
  );
  return envoyerUne(req, res, 201, 'Réservation créée avec succès', rows[0]);
}

async function listerConfirmees(req, res) {
  const { rows } = await pool.query(
    `SELECT id, emplacement_id, statut, date_debut, date_fin
       FROM reservation
      WHERE statut = 'confirmed'
      ORDER BY date_debut ASC`,
  );
  return envoyerListe(req, res, 'Réservations confirmées récupérées avec succès', rows);
}

async function listerParStatut(req, res) {
  requireAdmin(req);
  const status = req.query?.status;
  if (typeof status !== 'string' || status.trim() === '') {
    throw new HttpError(400, 'Statut invalide');
  }
  const { rows } = await pool.query(
    'SELECT * FROM reservation WHERE statut ILIKE $1 ORDER BY date_debut ASC',
    [status.trim()],
  );
  return envoyerListe(req, res, 'Réservations par statut récupérées avec succès', rows);
}

async function listerParEmplacement(req, res, emplacementId) {
  const rows = await reservationsParEmplacement(parseId(emplacementId, MESSAGE_ID_EMPLACEMENT));
  return envoyerListe(req, res, "Réservations de l'emplacement récupérées avec succès", rows);
}

async function listerMiennes(req, res) {
  const user = authenticate(req);
  const { rows } = await pool.query(
    `SELECT r.id, r.emplacement_id, r.statut, r.date_debut, r.date_fin,
            e.no_local_pavillon, e.lieu_specifique
       FROM reservation r
       LEFT JOIN emplacement e ON e.id = r.emplacement_id
      WHERE r.utilisateur_id = $1
      ORDER BY r.date_debut DESC`,
    [user.id],
  );
  return envoyerListe(req, res, 'Réservations récupérées avec succès', rows);
}

async function modifierMienne(req, res, id) {
  const user = authenticate(req);
  const idReservation = parseId(id, MESSAGE_ID_RESERVATION);
  const { dateDebut, dateFin } = req.body || {};
  validerPeriode(dateDebut, dateFin);

  const reservation = await reservationParId(idReservation);
  if (!reservation || Number(reservation.utilisateur_id) !== Number(user.id)) {
    throw new HttpError(404, MESSAGE_INTROUVABLE);
  }
  if (reservation.statut !== 'pending') {
    throw new HttpError(409, 'Seule une réservation en attente peut être modifiée');
  }

  await verifierDisponibilite(reservation.emplacement_id, dateDebut, dateFin, idReservation);

  const { rows } = await pool.query(
    `UPDATE reservation
        SET date_debut = $1, date_fin = $2
      WHERE id = $3 AND utilisateur_id = $4 AND statut = 'pending'
      RETURNING *`,
    [dateDebut, dateFin, idReservation, user.id],
  );
  if (!rows[0]) {
    throw new HttpError(409, 'La réservation ne peut plus être modifiée');
  }
  return envoyerUne(req, res, 200, 'Réservation modifiée avec succès', rows[0]);
}

async function annulerMienne(req, res, id) {
  const user = authenticate(req);
  const idReservation = parseId(id, MESSAGE_ID_RESERVATION);
  const { rows } = await pool.query(
    `UPDATE reservation
        SET statut = 'cancelled'
      WHERE id = $1 AND utilisateur_id = $2 AND statut = 'pending'
      RETURNING *`,
    [idReservation, user.id],
  );
  if (!rows[0]) {
    throw new HttpError(409, 'Réservation introuvable ou non annulable');
  }
  return envoyerUne(req, res, 200, 'Réservation annulée avec succès', rows[0]);
}

async function obtenirUne(req, res, id) {
  requireAdmin(req);
  const reservation = await reservationParId(parseId(id, MESSAGE_ID_RESERVATION));
  if (!reservation) {
    throw new HttpError(404, MESSAGE_INTROUVABLE);
  }
  return envoyerUne(req, res, 200, 'Réservation récupérée avec succès', reservation);
}

async function confirmer(req, res, id) {
  requireAdmin(req);
  const idReservation = parseId(id, MESSAGE_ID_RESERVATION);
  const demande = await reservationParId(idReservation);
  if (!demande) {
    throw new HttpError(404, MESSAGE_INTROUVABLE);
  }

  await verifierDisponibilite(demande.emplacement_id, demande.date_debut, demande.date_fin, idReservation);

  const { rows } = await pool.query(
    `UPDATE reservation SET statut = 'confirmed'
      WHERE id = $1 AND statut = 'pending'
      RETURNING *`,
    [idReservation],
  );
  if (!rows[0]) {
    throw new HttpError(409, "Cette réservation n'est pas en attente");
  }
  return envoyerUne(req, res, 200, 'Réservation confirmée avec succès', rows[0]);
}

async function annulerCommeAdmin(req, res, id) {
  requireAdmin(req);
  const idReservation = parseId(id, MESSAGE_ID_RESERVATION);
  const { rows } = await pool.query(
    `UPDATE reservation SET statut = 'cancelled'
      WHERE id = $1 AND statut IN ('pending', 'confirmed')
      RETURNING *`,
    [idReservation],
  );
  if (!rows[0]) {
    throw new HttpError(409, 'Réservation introuvable ou non annulable');
  }
  return envoyerUne(req, res, 200, 'Réservation annulée avec succès', rows[0]);
}

function router(method, seg) {
  const [a, b, c] = seg;

  if (seg.length === 0) {
    if (method === 'GET') return (req, res) => listerToutes(req, res);
    if (method === 'POST') return (req, res) => creer(req, res);
  }
  if (seg.length === 1 && method === 'GET') {
    if (a === 'confirmed') return (req, res) => listerConfirmees(req, res);
    if (a === 'status') return (req, res) => listerParStatut(req, res);
    if (a === 'me') return (req, res) => listerMiennes(req, res);
    return (req, res) => obtenirUne(req, res, a);
  }
  if (seg.length === 2) {
    if (a === 'emplacement' && method === 'GET') return (req, res) => listerParEmplacement(req, res, b);
    if (a === 'me' && method === 'PUT') return (req, res) => modifierMienne(req, res, b);
    if (b === 'confirm' && method === 'PATCH') return (req, res) => confirmer(req, res, a);
    if (b === 'cancel' && method === 'PATCH') return (req, res) => annulerCommeAdmin(req, res, a);
  }
  if (seg.length === 3 && a === 'me' && c === 'cancel' && method === 'PATCH') {
    return (req, res) => annulerMienne(req, res, b);
  }
  return null;
}

export default async function handler(req, res) {
  setCors(res, 'GET, POST, PUT, PATCH');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = router(req.method, routeSegments(req));
  if (!action) {
    return res.status(404).json({ success: false, message: 'Route introuvable', erreur: 'Route introuvable' });
  }

  try {
    return await action(req, res);
  } catch (err) {
    return sendError(res, err);
  }
}
