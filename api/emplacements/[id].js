import { findPlotById, updatePlot } from '../../Backend/src/models/emplacement.mjs';
import pool from '../../Backend/src/db.mjs';

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
      const plot = await findPlotById(id);
      if (!plot) {
        return res.status(404).json({ erreur: 'Emplacement introuvable' });
      }
      return res.status(200).json(plot);
    } catch (err) {
      console.error('Error fetching plot:', err);
      return res.status(500).json({ erreur: 'Erreur serveur', details: err.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updated = await updatePlot(id, req.body);
      return res.status(200).json(updated);
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
