import pool from '../_db.js';
import { setCors, sendError, requireAdmin } from '../_http.js';

export default async function handler(req, res) {
  setCors(res, 'GET');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  try {
    requireAdmin(req);

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

    return res.status(200).json({
      fl: fl.rows,
      ff: ff.rows,
      totalSuperficieAjustee: Number(total.rows[0].total),
    });
  } catch (err) {
    return sendError(res, err);
  }
}
