import {
  findPlotByLieu,
  findPlotByDescription,
  findPlotById,
  findAllPlots
} from '../models/emplacement.mjs';

export async function getPlotByLieu(req, res, next) {
  const lieu = req.query.lieu;

  if (typeof lieu !== 'string' || lieu.trim() === '') {
    const erreur = new Error('Veuillez fournir un lieu à rechercher');
    erreur.status = 400;

    return next(erreur);
  }

  try {
    const emplacements = await findPlotByLieu(lieu.trim());

    if (emplacements.length === 0) {
      const suggestions = await findPlotByDescription(
        lieu.trim()
      );

      return res.status(200).json(suggestions);
    }

    return res.status(200).json(emplacements);
  } catch (erreur) {
    return next(erreur);
  }
}

export async function getPlotById(req, res, next) {
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
    const emplacement = await findPlotById(Number(id));

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


import {
  createPlot,
  updatePlot
} from '../models/emplacement.mjs';


export async function addPlot(req, res, next) {
  try {
    const emplacement = await createPlot(req.body);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Emplacement ajouté avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        emplacement
      }
    });

  } catch (erreur) {
    return next(erreur);
  }
}


export async function modifyPlot(req, res, next) {
  const { id } = req.params;

  if (
    !id ||
    !Number.isSafeInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    const erreur = new Error("Identifiant d'emplacement invalide");
    erreur.status = 400;
    return next(erreur);
  }

  try {
    const emplacement = await updatePlot(Number(id), req.body);

    if (!emplacement) {
      const erreur = new Error("Emplacement introuvable");
      erreur.status = 404;
      return next(erreur);
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Emplacement modifié avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        emplacement
      }
    });

  } catch (erreur) {
    return next(erreur);
  }
}
