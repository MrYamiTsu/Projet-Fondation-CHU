import pool from '../db.mjs';

const SELECT_EMPLACEMENT = `
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

export async function findPlotByLieu(lieu) {
  const requete = `${SELECT_EMPLACEMENT} WHERE emplacement.lieu_specifique ILIKE $1`;

  const result = await pool.query(requete, ['%' + lieu + '%']);

  return result.rows;
}

export async function findPlotByDescription(mot) {
  const requete = `${SELECT_EMPLACEMENT} WHERE emplacement.description ILIKE $1`;

  const result = await pool.query(requete, ['%' + mot + '%']);

  return result.rows;
}

export async function findPlotById(id) {
  const requete = `${SELECT_EMPLACEMENT} WHERE emplacement.id = $1`;

  const result = await pool.query(requete, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function findAllPlots() {
  const requete = `${SELECT_EMPLACEMENT} ORDER BY emplacement.id`;

  const result = await pool.query(requete);

  return result.rows;
}

export async function findPlotByComposanteAndLieu(composanteId, lieu, ignoredId = null) {
  const requete = `
    SELECT id
    FROM emplacement
    WHERE composante_id = $1
      AND LOWER(TRIM(lieu_specifique)) = LOWER(TRIM($2))
      AND ($3::int IS NULL OR id <> $3)
    LIMIT 1
  `;

  const result = await pool.query(requete, [composanteId, lieu, ignoredId]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
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
      valeur_toponymique,
      valeur_toponymique_ancien,
      commentaire,
      statut
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13
    )
    RETURNING id
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
    valeur_toponymique,
    valeur_toponymique_ancien,
    commentaire,
    statut
  ]);

  return findPlotById(result.rows[0].id);
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
      valeur_toponymique = $10,
      valeur_toponymique_ancien = $11,
      commentaire = $12,
      statut = $13
    WHERE id = $14
    RETURNING id
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
    valeur_toponymique,
    valeur_toponymique_ancien,
    commentaire,
    statut,
    id
  ]);

  return result.rows[0] ? findPlotById(result.rows[0].id) : undefined;
}

export async function findFacteurs() {
  const [fl, ff, total] = await Promise.all([
    pool.query('SELECT id, fl, type_lieu FROM fl ORDER BY fl, id'),
    pool.query('SELECT id, ff, nbr_personnes FROM ff ORDER BY ff, id'),
    pool.query(`
      SELECT COALESCE(SUM(fl.fl * ff.ff * e.superficie), 0) AS total
      FROM emplacement e
      LEFT JOIN fl ON fl.id = e.fl_id
      LEFT JOIN ff ON ff.id = e.ff_id
    `),
  ]);

  return {
    fl: fl.rows,
    ff: ff.rows,
    totalSuperficieAjustee: Number(total.rows[0].total),
  };
}
export async function deletePlot(id) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const actives = await client.query(
      `SELECT id FROM reservation
        WHERE emplacement_id = $1 AND statut IS DISTINCT FROM 'cancelled'
        FOR UPDATE`,
      [id],
    );

    if (actives.rowCount > 0) {
      await client.query('ROLLBACK');
      return { supprime: false, reservationsActives: true };
    }

    await client.query('DELETE FROM reservation WHERE emplacement_id = $1', [id]);
    const result = await client.query('DELETE FROM emplacement WHERE id = $1', [id]);

    await client.query('COMMIT');
    return { supprime: result.rowCount > 0, reservationsActives: false };
  } catch (erreur) {
    await client.query('ROLLBACK').catch(() => {});
    throw erreur;
  } finally {
    client.release();
  }
}