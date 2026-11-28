import pool from './_db.js';

export const SELECT_EMPLACEMENT = `
  WITH ajuste AS (
    SELECT e.id, fl.fl * ff.ff * e.superficie AS superficie_ajuste
    FROM emplacement e
    LEFT JOIN fl ON fl.id = e.fl_id
    LEFT JOIN ff ON ff.id = e.ff_id
  ),
  calcul AS (
    SELECT id,
           superficie_ajuste,
           superficie_ajuste / NULLIF(SUM(superficie_ajuste) OVER (), 0) AS poid_relatif
    FROM ajuste
  )
  SELECT emplacement.*, hopital.acronyme, calcul.superficie_ajuste, calcul.poid_relatif
  FROM emplacement
  JOIN calcul ON calcul.id = emplacement.id
  LEFT JOIN hopital ON emplacement.composante_id = hopital.id
`;

export async function emplacementParId(id) {
  const { rows } = await pool.query(`${SELECT_EMPLACEMENT} WHERE emplacement.id = $1`, [id]);
  return rows[0] ?? null;
}

export function valeursEcrites(body = {}) {
  return [
    body.composante_id,
    body.no_local_pavillon,
    body.categorie,
    body.type_lieu,
    body.lieu_specifique,
    body.description,
    body.superficie,
    body.fl_id,
    body.ff_id,
    body.valeur_toponymique,
    body.valeur_toponymique_ancien,
    body.commentaire,
    body.statut,
  ];
}
