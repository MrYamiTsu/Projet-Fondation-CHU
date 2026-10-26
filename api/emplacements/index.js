import { findAllPlots, createPlot } from '../../Backend/src/models/emplacement.mjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const plots = await findAllPlots();
      return res.status(200).json(plots);
    } catch (err) {
      console.error('Error fetching emplacements:', err);
      return res.status(500).json({ erreur: 'Erreur lors de la récupération des emplacements.', details: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const newPlot = await createPlot(req.body);
      return res.status(201).json(newPlot);
    } catch (err) {
      console.error('Error creating emplacement:', err);
      return res.status(500).json({ erreur: "Erreur lors de la création de l'emplacement.", details: err.message });
    }
  }

  return res.status(405).json({ erreur: 'Méthode non autorisée' });
}
