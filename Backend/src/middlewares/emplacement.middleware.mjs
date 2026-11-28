const CHAMPS_ID = ["composante_id", "fl_id", "ff_id"];
const CHAMPS_SUPERFICIE = ["superficie"];
const CHAMPS_ENTIERS = ["valeur_toponymique", "valeur_toponymique_ancien"];

const LONGUEURS_MAX = {
  no_local_pavillon: 100,
  categorie: 100,
  type_lieu: 100,
  lieu_specifique: 255,
  description: 255,
  commentaire: 255,
  statut: 50,
};

function badRequest(message) {
  const erreur = new Error(message);
  erreur.status = 400;
  return erreur;
}

const isNumber = (valeur) =>
  (typeof valeur === "number" || typeof valeur === "string") &&
  String(valeur).trim() !== "" &&
  Number.isFinite(Number(valeur));

const isInteger = (valeur) => isNumber(valeur) && Number.isSafeInteger(Number(valeur));
const isPositiveInteger = (valeur) => isInteger(valeur) && Number(valeur) > 0;
const isNonNegative = (valeur) => isNumber(valeur) && Number(valeur) >= 0;
const isOptional = (valeur, isValid) => valeur == null || isValid(valeur);

export function validatePlot(req, res, next) {
  const body = req.body ?? {};

  if (!CHAMPS_ID.every((champ) => isPositiveInteger(body[champ]))) {
    return next(badRequest("composante_id, fl_id et ff_id doivent être des entiers positifs valides"));
  }

  if (!CHAMPS_SUPERFICIE.every((champ) => isOptional(body[champ], isNonNegative))) {
    return next(badRequest("Les superficies doivent être des nombres positifs ou nuls"));
  }

  if (!CHAMPS_ENTIERS.every((champ) => isOptional(body[champ], isInteger))) {
    return next(badRequest("Les champs numériques entiers doivent contenir des entiers valides"));
  }

  for (const [champ, longueurMax] of Object.entries(LONGUEURS_MAX)) {
    const valeur = body[champ];

    if (valeur != null && (typeof valeur !== "string" || valeur.length > longueurMax)) {
      return next(badRequest(`${champ} doit être un texte de ${longueurMax} caractères maximum`));
    }
  }

  next();
}

export function validatePlotId(req, res, next) {
  if (!isPositiveInteger(req.params.id)) {
    return next(badRequest("Identifiant d'emplacement invalide"));
  }

  next();
}
