import {
  findPlotByLieu,
  findPlotByDescription,
  findPlotById,
  findAllPlots,
  createPlot,
  updatePlot
} from '../models/emplacement.mjs';

// Crée une erreur avec un code HTTP, que le middleware d'erreurs saura utiliser
function creerErreur(message, status) {
  const erreur = new Error(message);
  erreur.status = status;
  return erreur;
}

// Vérifie que l'id est un entier positif et le retourne sous forme de nombre
function validerId(id) {
  const nombre = Number(id);

  if (!Number.isSafeInteger(nombre) || nombre <= 0) {
    throw creerErreur("Identifiant d'emplacement invalide", 400);
  }

  return nombre;
}

// Cherche par lieu. S'il n'y a aucun résultat, propose des emplacements
// dont la description correspond.
export async function getPlotByLieu(lieu) {
  if (typeof lieu !== 'string' || lieu.trim() === '') {
    throw creerErreur('Veuillez fournir un lieu à rechercher', 400);
  }

  const lieuNettoye = lieu.trim();
  const emplacements = await findPlotByLieu(lieuNettoye);

  if (emplacements.length > 0) {
    return emplacements;
  }

  return findPlotByDescription(lieuNettoye);
}

export async function getPlotById(id) {
  const emplacement = await findPlotById(validerId(id));

  if (!emplacement) {
    throw creerErreur('Aucun emplacement trouvé avec cet id', 404);
  }

  return emplacement;
}

export async function getAllPlots() {
  return findAllPlots();
}

export async function addPlot(donnees) {
  return createPlot(donnees);
}

export async function modifyPlot(id, donnees) {
  const emplacement = await updatePlot(validerId(id), donnees);

  if (!emplacement) {
    throw creerErreur('Emplacement introuvable', 404);
  }

  return emplacement;
}
