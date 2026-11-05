import pool from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const requete = `
        SELECT emplacement.*, hopital.acronyme
        FROM emplacement
        LEFT JOIN hopital ON emplacement.composante_id = hopital.id
        ORDER BY emplacement.id ASC
      `;
      const result = await pool.query(requete);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching emplacements:', err);
      return res.status(500).json({ erreur: 'Erreur lors de la récupération des emplacements.', details: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
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
      } = req.body || {};

      const requete = `
        INSERT INTO emplacement (
          composante_id, no_local_pavillon, categorie, type_lieu, lieu_specifique,
          description, superficie, fl_id, ff_id, superficie_ajuste, poid_relatif,
          valeur_toponymique, valeur_toponymique_ancien, commentaire, statut
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;

      const result = await pool.query(requete, [
        composante_id, no_local_pavillon, categorie, type_lieu, lieu_specifique,
        description, superficie, fl_id, ff_id, superficie_ajuste, poid_relatif,
        valeur_toponymique, valeur_toponymique_ancien, commentaire, statut
      ]);

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating emplacement:', err);
      return res.status(500).json({ erreur: "Erreur lors de la création de l'emplacement.", details: err.message });
    }
  }

  return res.status(405).json({ erreur: 'Méthode non autorisée' });
}
