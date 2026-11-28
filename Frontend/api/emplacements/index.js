import pool from '../_db.js';
import { requireAdmin, sendError } from '../_http.js';
import { SELECT_EMPLACEMENT, emplacementParId, valeursEcrites } from '../_emplacements.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    try {
      requireAdmin(req);
    } catch (err) {
      return sendError(res, err);
    }
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query(`${SELECT_EMPLACEMENT} ORDER BY emplacement.id ASC`);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching emplacements:', err);
      return res.status(500).json({ erreur: 'Erreur lors de la récupération des emplacements.', details: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const requete = `
        INSERT INTO emplacement (
          composante_id, no_local_pavillon, categorie, type_lieu, lieu_specifique,
          description, superficie, fl_id, ff_id,
          valeur_toponymique, valeur_toponymique_ancien, commentaire, statut
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `;

      const result = await pool.query(requete, valeursEcrites(req.body));
      const emplacement = await emplacementParId(result.rows[0].id);

      return res.status(201).json({ ...emplacement, success: true, message: 'Emplacement ajouté avec succès', data: { emplacement } });
    } catch (err) {
      console.error('Error creating emplacement:', err);
      return res.status(500).json({ erreur: "Erreur lors de la création de l'emplacement.", details: err.message });
    }
  }

  return res.status(405).json({ erreur: 'Méthode non autorisée' });
}
