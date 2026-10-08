import pool from '../db.mjs';

export async function getAllReservations() {
  const requete = `
    SELECT *
    FROM reservation
    ORDER BY date_debut ASC
  `;

  const result = await pool.query(requete);
  return result.rows;
}

export async function createReservation(emplacementId, dateDebut, dateFin) {
  const requete = `
    INSERT INTO reservation (emplacement_id, statut, date_debut, date_fin)
    VALUES ($1, 'en attente', $2, $3)
    RETURNING *
  `;

  const result = await pool.query(requete, [
    emplacementId,
    dateDebut,
    dateFin
  ]);

  return result.rows[0];
}
export async function getReservationById(id) {
  const requete = `
    SELECT *
    FROM reservation
    WHERE id = $1
  `;

  const result = await pool.query(requete, [id]);
  return result.rows[0];
}

export async function getReservationsByEmplacementId(emplacementId) {
  const requete = `
    SELECT *
    FROM reservation
    WHERE emplacement_id = $1
    ORDER BY date_debut ASC
  `;

  const result = await pool.query(requete, [emplacementId]);
  return result.rows;
}

export async function getReservationsByStatus(status) {
  const requete = `
    SELECT *
    FROM reservation
    WHERE statut ILIKE $1
    ORDER BY date_debut ASC
  `;

  const result = await pool.query(requete, [status]);
  return result.rows;
}