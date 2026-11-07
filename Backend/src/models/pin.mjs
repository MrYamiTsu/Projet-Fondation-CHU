import pool from "../db.mjs";

export async function deletePinsByEtage(etageId) {
  const requete = `
    DELETE FROM pin_emplacement
    WHERE etage_id = $1
  `;
  const result = await pool.query(requete, [etageId]);
  return result.rowCount;
}