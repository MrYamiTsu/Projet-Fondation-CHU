import pool from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const requete = `
        SELECT emplacement.*, hopital.acronyme
        FROM emplacement
        LEFT JOIN hopital ON emplacement.composante_id = hopital.id
        WHERE emplacement.id = $1
      `;
      const result = await pool.query(requete, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ erreur: 'Emplacement introuvable' });
      }
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching plot:', err);
      return res.status(500).json({ erreur: 'Erreur serveur', details: err.message });
    }
  }

  if (req.method === 'PUT') {
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
        composante_id, no_local_pavillon, categorie, type_lieu, lieu_specifique,
        description, superficie, fl_id, ff_id, superficie_ajuste, poid_relatif,
        valeur_toponymique, valeur_toponymique_ancien, commentaire, statut, id
      ]);

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating plot:', err);
      return res.status(500).json({ erreur: 'Erreur mise à jour', details: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM emplacement WHERE id = $1', [id]);
      return res.status(200).json({ message: 'Emplacement supprimé' });
    } catch (err) {
      console.error('Error deleting plot:', err);
      return res.status(500).json({ erreur: 'Erreur suppression', details: err.message });
    }
  }

  return res.status(405).json({ erreur: 'Méthode non autorisée' });
}
