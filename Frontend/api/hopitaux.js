import pool from './_db.js';
import { HttpError, setCors, sendError, parseId, routeSegments } from './_http.js';

export default async function handler(req, res) {
  setCors(res, 'GET');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  try {
    const [id, ...reste] = routeSegments(req);

    if (reste.length > 0) {
      throw new HttpError(404, 'Route introuvable');
    }

    if (id === undefined) {
      const { rows } = await pool.query('SELECT * FROM hopital ORDER BY id');
      return res.status(200).json(rows);
    }

    const { rows } = await pool.query('SELECT * FROM hopital WHERE id = $1', [
      parseId(id, 'Veuillez fournir un id valide'),
    ]);
    if (!rows[0]) {
      throw new HttpError(404, 'Aucun hôpital trouvé avec cet id');
    }
    return res.status(200).json(rows[0]);
  } catch (err) {
    return sendError(res, err);
  }
}
