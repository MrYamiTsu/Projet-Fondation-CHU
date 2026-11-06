import pool from "../db.mjs";

export async function findEtageById(id) {
  const requete = `
    SELECT etage.*, hopital.acronyme
    FROM etage
    JOIN hopital ON etage.hopital_id = hopital.id
    WHERE etage.id = $1
  `;

  const result = await pool.query(requete, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function findAllEtageByHospital(nom) {
  const requete = `
    SELECT etage.*, hopital.acronyme
    FROM etage
    JOIN hopital ON etage.hopital_id = hopital.id
    WHERE hopital.nom ILIKE $1
    ORDER BY etage.niveau
  `;

  const result = await pool.query(requete, ["%" + nom + "%"]);
  return result.rows;
}

export async function createEtage(hopital_id, niveau, nom) {
  const requete = `
    INSERT INTO etage (hopital_id, niveau, nom)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await pool.query(requete, [hopital_id, niveau, nom]);
  return result.rows[0];
}

export async function deleteEtage(id) {
  const requete = `
    DELETE FROM etage
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(requete, [id]);
  return result.rows[0];
}

export async function AddImageToEtage(etageId, imageUrl) {
  const requete = `
    UPDATE etage
    SET image_url = $1
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(requete, [imageUrl, etageId]);
  return result.rows[0];
}

export async function DeleteImageFromEtage(etageId) {
  const requete = `
    UPDATE etage
    SET image_url = NULL
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(requete, [etageId]);
  return result.rows[0];
}
