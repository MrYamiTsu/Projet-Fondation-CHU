import pool from "../db.mjs";

export async function findEtageById(id) {
  const requete = `
    SELECT etage.*, hopital.acronyme, hopital.nom AS hopital_nom
    FROM etage
    JOIN hopital ON etage.hopital_id = hopital.id
    WHERE etage.id = $1
  `;

  const result = await pool.query(requete, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const etage = result.rows[0];
  const pinsResult = await pool.query(`
    SELECT 
      p.id,
      p.hopital_id,
      p.etage_id,
      p.emplacement_id,
      p.x,
      p.y,
      e.no_local_pavillon,
      e.lieu_specifique,
      e.description,
      e.valeur_toponymique,
      e.statut,
      e.type_lieu,
      e.categorie,
      e.superficie
    FROM pin_emplacement p
    JOIN emplacement e ON p.emplacement_id = e.id
    WHERE p.etage_id = $1
    ORDER BY p.id ASC
  `, [id]);
  etage.pins = pinsResult.rows;

  return etage;
}

export async function findAllEtageByHospital(nom) {
  const requete = `
    SELECT etage.*, hopital.acronyme, hopital.nom AS hopital_nom
    FROM etage
    JOIN hopital ON etage.hopital_id = hopital.id
    WHERE hopital.nom ILIKE $1 OR hopital.acronyme ILIKE $1
    ORDER BY etage.niveau ASC
  `;

  const result = await pool.query(requete, ["%" + nom + "%"]);
  const etages = result.rows;

  if (etages.length > 0) {
    const etageIds = etages.map((e) => e.id);
    const pinsResult = await pool.query(`
      SELECT 
        p.id,
        p.hopital_id,
        p.etage_id,
        p.emplacement_id,
        p.x,
        p.y,
        e.no_local_pavillon,
        e.lieu_specifique,
        e.description,
        e.valeur_toponymique,
        e.statut,
        e.type_lieu,
        e.categorie,
        e.superficie
      FROM pin_emplacement p
      JOIN emplacement e ON p.emplacement_id = e.id
      WHERE p.etage_id = ANY($1::int[])
      ORDER BY p.id ASC
    `, [etageIds]);

    const pinsByEtage = {};
    for (const pin of pinsResult.rows) {
      if (!pinsByEtage[pin.etage_id]) {
        pinsByEtage[pin.etage_id] = [];
      }
      pinsByEtage[pin.etage_id].push(pin);
    }

    for (const etage of etages) {
      etage.pins = pinsByEtage[etage.id] || [];
    }
  }

  return etages;
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

export async function AddImageToEtage(etageId, imageUrl, imagePublicId) {
  const requete = `
    UPDATE etage
    SET image_url = $1, image_public_id = $2
    WHERE id = $3
    RETURNING *
  `;
  const result = await pool.query(requete, [imageUrl, imagePublicId, etageId]);
  return result.rows[0];
}

export async function DeleteImageFromEtage(etageId) {
  const requete = `
    UPDATE etage
    SET image_url = NULL, image_public_id = NULL
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(requete, [etageId]);
  return result.rows[0];
}
