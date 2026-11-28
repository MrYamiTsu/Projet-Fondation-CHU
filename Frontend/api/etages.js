import pool from './_db.js';
import {
  HttpError,
  setCors,
  sendError,
  parseId,
  routeSegments,
  requireAdmin,
  readMultipartFile,
} from './_http.js';
import { uploadImage, deleteImage } from './_cloudinary.js';

const TYPES_IMAGE = ['image/jpeg', 'image/png', 'image/webp'];
// Vercel refuse les requêtes de plus de 4,5 Mo : on reste en dessous.
export const TAILLE_MAX_IMAGE = 4 * 1024 * 1024;
const MESSAGE_ID = 'Veuillez fournir un id entier positif valide';

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

async function etageParId(id) {
  const { rows } = await pool.query('SELECT * FROM etage WHERE id = $1', [id]);
  if (!rows[0]) {
    throw new HttpError(404, 'Étage non trouvé');
  }
  return rows[0];
}

async function envoyerImage(req, res, idBrut) {
  requireAdmin(req);
  const id = parseId(idBrut, MESSAGE_ID);
  const fichier = await readMultipartFile(req, 'image', TAILLE_MAX_IMAGE);

  if (!TYPES_IMAGE.includes(fichier.type)) {
    throw new HttpError(400, "L'image doit être au format JPEG, PNG ou WebP");
  }
  if (fichier.size > TAILLE_MAX_IMAGE) {
    throw new HttpError(400, "L'image ne doit pas dépasser 4 Mo");
  }

  const etage = await etageParId(id);
  const upload = await uploadImage(fichier, 'etages');

  let maj;
  try {
    const { rows } = await pool.query(
      'UPDATE etage SET image_url = $1, image_public_id = $2 WHERE id = $3 RETURNING *',
      [upload.secure_url, upload.public_id, id],
    );
    maj = rows[0];
  } catch (err) {
    await deleteImage(upload.public_id).catch(() => {});
    throw err;
  }

  if (etage.image_public_id) {
    await deleteImage(etage.image_public_id).catch((err) =>
      console.error("Suppression de l'ancienne image impossible :", err),
    );
  }

  return res.status(200).json(maj);
}

async function supprimerImage(req, res, idBrut) {
  requireAdmin(req);
  const id = parseId(idBrut, MESSAGE_ID);
  const etage = await etageParId(id);

  if (!etage.image_public_id) {
    throw new HttpError(404, "Cet étage n'a pas d'image");
  }

  const { rows } = await pool.query(
    'UPDATE etage SET image_url = NULL, image_public_id = NULL WHERE id = $1 RETURNING *',
    [id],
  );
  await pool.query('DELETE FROM pin_emplacement WHERE etage_id = $1', [id]);

  await deleteImage(etage.image_public_id).catch((err) =>
    console.error("Suppression de l'image Cloudinary impossible :", err),
  );

  return res.status(200).json(rows[0]);
}

export default async function handler(req, res) {
  setCors(res, 'GET, PUT, DELETE');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const [id, sousRoute, ...reste] = routeSegments(req);

    if (sousRoute !== undefined) {
      if (sousRoute !== 'image' || reste.length > 0) {
        throw new HttpError(404, 'Route introuvable');
      }
      if (req.method === 'PUT') return await envoyerImage(req, res, id);
      if (req.method === 'DELETE') return await supprimerImage(req, res, id);
      throw new HttpError(405, 'Méthode non autorisée');
    }

    if (req.method !== 'GET') {
      throw new HttpError(405, 'Méthode non autorisée');
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
