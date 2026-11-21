/* ------------------------------------------------------------------ */
/* Règles de validation                                                */
/* ------------------------------------------------------------------ */

const CHAMPS_ID = ["composante_id", "fl_id", "ff_id"];
const CHAMPS_SUPERFICIE = ["superficie", "superficie_ajuste"];
const CHAMPS_ENTIERS = ["poid_relatif", "valeur_toponymique", "valeur_toponymique_ancien"];

// Longueur maximale de chaque champ texte
const LONGUEURS_MAX = {
  no_local_pavillon: 100,
  categorie: 100,
  type_lieu: 100,
  lieu_specifique: 255,
  description: 255,
  commentaire: 255,
  statut: 50,
};

/* ------------------------------------------------------------------ */
/* Fonctions utilitaires                                               */
/* ------------------------------------------------------------------ */

function erreur400(message) {
  const erreur = new Error(message);
  erreur.status = 400;
  return erreur;
}

// Un nombre peut arriver en JSON sous forme de number ou de chaîne ("12")
const estNombre = (valeur) =>
  (typeof valeur === "number" || typeof valeur === "string") &&
  String(valeur).trim() !== "" &&
  Number.isFinite(Number(valeur));

const estEntier = (valeur) => estNombre(valeur) && Number.isSafeInteger(Number(valeur));
const estEntierPositif = (valeur) => estEntier(valeur) && Number(valeur) > 0;
const estPositifOuNul = (valeur) => estNombre(valeur) && Number(valeur) >= 0;

// Un champ facultatif peut être absent ou null
const facultatif = (valeur, estValide) => valeur == null || estValide(valeur);

/* ------------------------------------------------------------------ */
/* Middlewares                                                         */
/* ------------------------------------------------------------------ */

export function validatePlot(req, res, next) {
  const body = req.body ?? {};

  if (!CHAMPS_ID.every((champ) => estEntierPositif(body[champ]))) {
    return next(erreur400("composante_id, fl_id et ff_id doivent être des entiers positifs valides"));
  }

  if (!CHAMPS_SUPERFICIE.every((champ) => facultatif(body[champ], estPositifOuNul))) {
    return next(erreur400("Les superficies doivent être des nombres positifs ou nuls"));
  }

  if (!CHAMPS_ENTIERS.every((champ) => facultatif(body[champ], estEntier))) {
    return next(erreur400("Les champs numériques entiers doivent contenir des entiers valides"));
  }

  for (const [champ, longueurMax] of Object.entries(LONGUEURS_MAX)) {
    const valeur = body[champ];

    if (valeur != null && (typeof valeur !== "string" || valeur.length > longueurMax)) {
      return next(erreur400(`${champ} doit être un texte de ${longueurMax} caractères maximum`));
    }
  }

  next();
}

export function validatePlotId(req, res, next) {
  if (!estEntierPositif(req.params.id)) {
    return next(erreur400("Identifiant d'emplacement invalide"));
  }

  next();
}