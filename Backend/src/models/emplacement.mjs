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

export async function createPlot(emplacement) {
  const {
    composante_id,
    no_local_pavillon,
    categorie,
    type_lieu,
    lieu_specifique,
    description,
    superficie,
    fl_id,
    ff_id,
    superficie_ajuste,
    poid_relatif,
    valeur_toponymique,
    valeur_toponymique_ancien,
    commentaire,
    statut
  } = emplacement;

  const requete = `
    INSERT INTO emplacement (
      composante_id,
      no_local_pavillon,
      categorie,
      type_lieu,
      lieu_specifique,
      description,
      superficie,
      fl_id,
      ff_id,
      superficie_ajuste,
      poid_relatif,
      valeur_toponymique,
      valeur_toponymique_ancien,
      commentaire,
      statut
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15
    )
    RETURNING *
  `;

  const result = await pool.query(requete, [
    composante_id,
    no_local_pavillon,
    categorie,
    type_lieu,
    lieu_specifique,
    description,
    superficie,
    fl_id,
    ff_id,
    superficie_ajuste,
    poid_relatif,
    valeur_toponymique,
    valeur_toponymique_ancien,
    commentaire,
    statut
  ]);

  return result.rows[0];
}


export async function updatePlot(id, emplacement) {
  const {
    composante_id,
    no_local_pavillon,
    categorie,
    type_lieu,
    lieu_specifique,
    description,
    superficie,
    fl_id,
    ff_id,
    superficie_ajuste,
    poid_relatif,
    valeur_toponymique,
    valeur_toponymique_ancien,
    commentaire,
    statut
  } = emplacement;

  const requete = `
    UPDATE emplacement
    SET
      composante_id = $1,
      no_local_pavillon = $2,
      categorie = $3,
      type_lieu = $4,
      lieu_specifique = $5,
      description = $6,
      superficie = $7,
      fl_id = $8,
      ff_id = $9,
      superficie_ajuste = $10,
      poid_relatif = $11,
      valeur_toponymique = $12,
      valeur_toponymique_ancien = $13,
      commentaire = $14,
      statut = $15
    WHERE id = $16
    RETURNING *
  `;

  const result = await pool.query(requete, [
    composante_id,
    no_local_pavillon,
    categorie,
    type_lieu,
    lieu_specifique,
    description,
    superficie,
    fl_id,
    ff_id,
    superficie_ajuste,
    poid_relatif,
    valeur_toponymique,
    valeur_toponymique_ancien,
    commentaire,
    statut,
    id
  ]);

  return result.rows[0];
}
