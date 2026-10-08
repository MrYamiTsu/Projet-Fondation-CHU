import {
  rechercherEmplacementsParLieu,
  rechercherEmplacementsParDescription,
  rechercherEmplacementParId,
  findAllPlots
} from '../models/emplacement.mjs';

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
      const suggestions = await rechercherEmplacementsParDescription(
        lieu.trim()
      );

      return res.status(200).json(suggestions);
    }

    return res.status(200).json(emplacements);
  } catch (erreur) {
    return next(erreur);
  }
}

export async function obtenirEmplacementParId(req, res, next) {
  const id = req.params.id;

  if (
    typeof id !== 'string' ||
    id.trim() === '' ||
    !Number.isInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    const erreur = new Error('Veuillez fournir un id entier positif valide');
    erreur.status = 400;

    return next(erreur);
  }

  try {
    const emplacement = await rechercherEmplacementParId(Number(id));

    if (!emplacement) {
      const erreur = new Error('Aucun emplacement trouvé avec cet id');
      erreur.status = 404;

      return next(erreur);
    }

    return res.status(200).json(emplacement);
  } catch (erreur) {
    return next(erreur);
  }
}

export async function getAllPlots(req, res, next) {
  try {
    const emplacements = await findAllPlots();

    return res.status(200).json(emplacements);
  } catch (erreur) {
    return next(erreur);
  }
}