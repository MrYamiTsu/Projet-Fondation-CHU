import pool from "../db.mjs";

export async function deletePinsByEtage(etageId) {
  const requete = `
    DELETE FROM pin_emplacement
    WHERE etage_id = $1
  `;
  const result = await pool.query(requete, [etageId]);
  return result.rowCount;
}

export async function createPin(hopitalId, etageId, emplacementId, x, y) {
  const requete = `
    INSERT INTO pin_emplacement (hopital_id, etage_id, emplacement_id, x, y)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await pool.query(requete, [hopitalId, etageId, emplacementId, x, y]);
  return result.rows[0];
}

export async function deletePin(id) {
  const requete = `
    DELETE FROM pin_emplacement
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(requete, [id]);
  return result.rows[0];
}