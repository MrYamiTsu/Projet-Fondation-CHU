// GET /api/etages?nom=<hôpital> et GET /api/etages/:id (réécriture ?route=<id> dans vercel.json).
// Reprend Backend/src/models/etage.mjs (étages + pins des emplacements).
import pool from './_db.js';
import { HttpError, setCors, sendError, parseId, routeSegments } from './_http.js';

const REQUETE_PINS = `
  SELECT p.id, p.hopital_id, p.etage_id, p.emplacement_id, p.x, p.y,
         e.no_local_pavillon, e.lieu_specifique, e.description, e.valeur_toponymique,
         e.statut, e.type_lieu, e.categorie, e.superficie
    FROM pin_emplacement p
    JOIN emplacement e ON p.emplacement_id = e.id
   WHERE p.etage_id = ANY($1::int[])
   ORDER BY p.id ASC
`;

async function ajouterPins(etages) {
  if (etages.length === 0) return etages;

  const { rows } = await pool.query(REQUETE_PINS, [etages.map((e) => e.id)]);
  const pinsParEtage = {};
  for (const pin of rows) {
    (pinsParEtage[pin.etage_id] ||= []).push(pin);
  }
  for (const etage of etages) {
    etage.pins = pinsParEtage[etage.id] || [];
  }
  return etages;
}

export default async function handler(req, res) {
  setCors(res, 'GET');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const [id, ...reste] = routeSegments(req);

    if (reste.length > 0) {
      throw new HttpError(404, 'Route introuvable');
    }

    if (id !== undefined) {
      const { rows } = await pool.query(
        `SELECT etage.*, hopital.acronyme, hopital.nom AS hopital_nom
           FROM etage
           JOIN hopital ON etage.hopital_id = hopital.id
          WHERE etage.id = $1`,
        [parseId(id, 'Veuillez fournir un id entier positif valide')],
      );
      if (!rows[0]) {
        throw new HttpError(404, 'Étage non trouvé');
      }
      const [etage] = await ajouterPins(rows);
      return res.status(200).json(etage);
    }

    const nom = req.query?.nom;
    if (typeof nom !== 'string' || nom.trim() === '') {
      throw new HttpError(400, "Veuillez fournir un nom d'hôpital valide");
    }

    const { rows } = await pool.query(
      `SELECT etage.*, hopital.acronyme, hopital.nom AS hopital_nom
         FROM etage
         JOIN hopital ON etage.hopital_id = hopital.id
        WHERE hopital.nom ILIKE $1 OR hopital.acronyme ILIKE $1
        ORDER BY etage.niveau ASC`,
      [`%${nom.trim()}%`],
    );
    return res.status(200).json(await ajouterPins(rows));
  } catch (err) {
    return sendError(res, err);
  }
}
