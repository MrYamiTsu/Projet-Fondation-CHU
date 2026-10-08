import pool from '../db.mjs';

export async function rechercherEmplacementsParLieu(lieu) {
  const requete = `
    SELECT emplacement.*, hopital.acronyme
    FROM emplacement
    LEFT JOIN hopital ON emplacement.composante_id = hopital.id
    WHERE emplacement.lieu_specifique ILIKE $1
  `;

  const result = await pool.query(requete, ['%' + lieu + '%']);

  return result.rows;
}

export async function rechercherEmplacementsParDescription(mot) {
  const requete = `
    SELECT emplacement.*, hopital.acronyme
    FROM emplacement
    LEFT JOIN hopital ON emplacement.composante_id = hopital.id
    WHERE emplacement.description ILIKE $1
  `;

  const result = await pool.query(requete, ['%' + mot + '%']);

  return result.rows;
}

export async function rechercherEmplacementParId(id) {
  const requete = `
    SELECT emplacement.*, hopital.acronyme
    FROM emplacement
    LEFT JOIN hopital ON emplacement.composante_id = hopital.id
    WHERE emplacement.id = $1
  `;

  const result = await pool.query(requete, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function findAllPlots(){
  const request=`
    SELECT emplacement.*, hopital.acronyme
    FROM emplacement
    LEFT JOIN hopital ON emplacement.composante_id = hopital.id
  `;
    const result = await pool.query(request,);
    return result.rows;

}