import pool from '../db.mjs';

export async function rechercherEmplacementsParLieu(lieu) {
  const requete = `
    SELECT *
    FROM emplacement
    WHERE lieu_specifique ILIKE $1
  `;

  const resultat = await pool.query(requete, ['%' + lieu + '%']);

  return resultat.rows;
}

export async function rechercherEmplacementsParDescription(mot) {
  const requete = `
    SELECT *
    FROM emplacement
    WHERE  description ILIKE $1
  `;

  const resultat = await pool.query(requete, ['%' + mot + '%']);

  return resultat.rows;
}
export async function rechercherEmplacementParId(id) {
  const requete = `
    SELECT *
    FROM emplacement
    WHERE id = $1
  `;

  const resultat = await pool.query(requete, [id]);

  if (resultat.rows.length === 0) {
    return null;
  }

  return resultat.rows[0];
}