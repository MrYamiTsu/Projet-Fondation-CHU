// POST   /api/pins       { etage_id, emplacement_id, x, y }  (admin)
// DELETE /api/pins/:id                                       (admin)
// vercel.json réécrit /api/pins/<chemin> vers /api/pins?route=<chemin>.
// Reprend Backend/src/services/pin.service.mjs et Backend/src/models/pin.mjs.
import pool from './_db.js';
import { HttpError, setCors, sendError, parseId, routeSegments, requireAdmin } from './_http.js';

function estEntier(v) {
  return typeof v === 'number' && Number.isInteger(v);
}

function estCoordonnee(v) {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;
}

async function creer(req, res) {
  requireAdmin(req);
  const { etage_id, emplacement_id, x, y } = req.body || {};

  if (!estEntier(etage_id) || etage_id <= 0) {
    throw new HttpError(400, "Veuillez fournir un id d'étage entier positif valide");
  }
  if (!estEntier(emplacement_id) || emplacement_id <= 0) {
    throw new HttpError(400, "Veuillez fournir un id d'emplacement entier positif valide");
  }
  if (!estCoordonnee(x)) {
    throw new HttpError(400, 'Veuillez fournir une coordonnée x entre 0 et 1');
  }
  if (!estCoordonnee(y)) {
    throw new HttpError(400, 'Veuillez fournir une coordonnée y entre 0 et 1');
  }

  const etage = (await pool.query('SELECT * FROM etage WHERE id = $1', [etage_id])).rows[0];
  if (!etage) {
    throw new HttpError(404, 'Étage non trouvé');
  }
  if (!etage.image_url) {
    throw new HttpError(409, "Cet étage n'a pas d'image : impossible d'y placer un pin");
  }

  const emplacement = (await pool.query('SELECT * FROM emplacement WHERE id = $1', [emplacement_id]))
    .rows[0];
  if (!emplacement) {
    throw new HttpError(404, 'Emplacement non trouvé');
  }

  const { rows } = await pool.query(
    `INSERT INTO pin_emplacement (hopital_id, etage_id, emplacement_id, x, y)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (emplacement_id) DO UPDATE SET
       hopital_id = EXCLUDED.hopital_id,
       etage_id = EXCLUDED.etage_id,
       x = EXCLUDED.x,
       y = EXCLUDED.y
     RETURNING *`,
    [etage.hopital_id, etage.id, emplacement_id, x, y],
  );

  return res.status(201).json({
    ...rows[0],
    no_local_pavillon: emplacement.no_local_pavillon,
    lieu_specifique: emplacement.lieu_specifique,
    description: emplacement.description,
    valeur_toponymique: emplacement.valeur_toponymique,
    statut: emplacement.statut,
    type_lieu: emplacement.type_lieu,
    categorie: emplacement.categorie,
    superficie: emplacement.superficie,
  });
}

async function supprimer(req, res, idBrut) {
  requireAdmin(req);
  const id = parseId(idBrut, 'Veuillez fournir un id de pin entier positif valide');
  const { rows } = await pool.query('DELETE FROM pin_emplacement WHERE id = $1 RETURNING *', [id]);
  if (!rows[0]) {
    throw new HttpError(404, 'Pin non trouvé');
  }
  return res.status(200).json(rows[0]);
}

export default async function handler(req, res) {
  setCors(res, 'POST, DELETE');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const segments = routeSegments(req);

    if (segments.length === 0 && req.method === 'POST') return await creer(req, res);
    if (segments.length === 1 && req.method === 'DELETE') return await supprimer(req, res, segments[0]);

    throw new HttpError(segments.length <= 1 ? 405 : 404, segments.length <= 1 ? 'Méthode non autorisée' : 'Route introuvable');
  } catch (err) {
    return sendError(res, err);
  }
}
