import { rechercherEmplacementsParLieu, rechercherEmplacementsParDescription } from '../models/emplacement.mjs';

export async function obtenirEmplacementsParLieu(req, res, next) {
  const lieu = req.query.lieu;

  if (typeof lieu !== 'string' || lieu.trim() === '') {
    const erreur = new Error('Veuillez fournir un lieu à rechercher');
    erreur.status = 400;

    return next(erreur);
  }

  try {
    const emplacements = await rechercherEmplacementsParLieu(lieu.trim());
    if (emplacements.length === 0) {
      const suggestions= await rechercherEmplacementsParDescription(lieu.trim());
          return res.status(200).json(suggestions);
}
    return res.status(200).json(emplacements);
  } catch (erreur) {
    return next(erreur);
  }
}