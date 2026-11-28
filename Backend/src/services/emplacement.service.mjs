import {
  findPlotByLieu,
  findPlotByDescription,
  findPlotById,
  findAllPlots,
  findPlotByComposanteAndLieu,
  createPlot,
  updatePlot,
  deletePlot,
  findFacteurs,
} from '../models/emplacement.mjs';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';
const MESSAGE_RESERVATIONS_ACTIVES =
  'Impossible de supprimer : cet emplacement a des réservations en attente ou confirmées. Annulez-les d’abord.';

function createError(message, status) {
  const erreur = new Error(message);
  erreur.status = status;
  return erreur;
}

function validateId(id) {
  const nombre = Number(id);

  if (!Number.isSafeInteger(nombre) || nombre <= 0) {
    throw createError("Identifiant d'emplacement invalide", 400);
  }

  return nombre;
}

function duplicateError(lieu) {
  return createError(`Un emplacement « ${String(lieu).trim()} » existe déjà pour cet hôpital`, 409);
}

async function ensureLieuAvailable(donnees, ignoredId = null) {
  const doublon = await findPlotByComposanteAndLieu(donnees.composante_id, donnees.lieu_specifique, ignoredId);

  if (doublon) {
    throw duplicateError(donnees.lieu_specifique);
  }
}

function toDuplicateError(erreur, lieu) {
  return erreur.code === UNIQUE_VIOLATION ? duplicateError(lieu) : erreur;
}

export async function getPlotByLieu(lieu) {
  if (typeof lieu !== 'string' || lieu.trim() === '') {
    throw createError('Veuillez fournir un lieu à rechercher', 400);
  }

  const lieuNettoye = lieu.trim();
  const emplacements = await findPlotByLieu(lieuNettoye);

  if (emplacements.length > 0) {
    return emplacements;
  }

  return findPlotByDescription(lieuNettoye);
}

export async function getPlotById(id) {
  const emplacement = await findPlotById(validateId(id));

  if (!emplacement) {
    throw createError('Aucun emplacement trouvé avec cet id', 404);
  }

  return emplacement;
}

export async function getFacteurs() {
  return findFacteurs();
}

export async function getAllPlots() {
  return findAllPlots();
}

export async function addPlot(donnees) {
  await ensureLieuAvailable(donnees);

  try {
    return await createPlot(donnees);
  } catch (erreur) {
    throw toDuplicateError(erreur, donnees.lieu_specifique);
  }
}

export async function modifyPlot(id, donnees) {
  const idValide = validateId(id);
  await ensureLieuAvailable(donnees, idValide);

  let emplacement;

  try {
    emplacement = await updatePlot(idValide, donnees);
  } catch (erreur) {
    throw toDuplicateError(erreur, donnees.lieu_specifique);
  }

  if (!emplacement) {
    throw createError('Emplacement introuvable', 404);
  }
  return emplacement;
}

export async function deleteAPlot(id) {
  const idValide = validateId(id);

  let resultat;
  try {
    resultat = await deletePlot(idValide);
  } catch (erreur) {
    if (erreur.code === FOREIGN_KEY_VIOLATION) {
      throw createError(MESSAGE_RESERVATIONS_ACTIVES, 409);
    }
    throw erreur;
  }

  if (resultat.reservationsActives) {
    throw createError(MESSAGE_RESERVATIONS_ACTIVES, 409);
  }

  if (!resultat.supprime) {
    throw createError('Emplacement introuvable', 404);
  }
}
