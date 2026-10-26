
export function validatePlot(req, res, next) {
  const {
    composante_id,
    no_local_pavillon,
    categorie,
    type_lieu,
    lieu_specifique,
    description,
    superficie,
    fl_id,
    ff_id,
    superficie_ajuste,
    poid_relatif,
    valeur_toponymique,
    valeur_toponymique_ancien,
    commentaire,
    statut
  } = req.body ?? {};

  if (
    !Number.isSafeInteger(Number(composante_id)) ||
    Number(composante_id) <= 0 ||
    composante_id == null ||
    String(composante_id).trim() === "" ||

    !Number.isSafeInteger(Number(fl_id)) ||
    Number(fl_id) <= 0 ||
    fl_id == null ||
    String(fl_id).trim() === "" ||

    !Number.isSafeInteger(Number(ff_id)) ||
    Number(ff_id) <= 0 ||
    ff_id == null ||
    String(ff_id).trim() === ""
  ) {
    const erreur = new Error(
      "composante_id, fl_id et ff_id doivent être des entiers positifs valides"
    );
    erreur.status = 400;
    return next(erreur);
  }

  const nombres = [superficie, superficie_ajuste];

  for (const nombre of nombres) {
    if (
      nombre != null &&
      (typeof nombre === "boolean" ||
       String(nombre).trim() === "" ||
       !Number.isFinite(Number(nombre)) ||
       Number(nombre) < 0)
    ) {
      const erreur = new Error(
        "Les superficies doivent être des nombres positifs ou nuls"
      );
      erreur.status = 400;
      return next(erreur);
    }
  }

  const entiers = [
    poid_relatif,
    valeur_toponymique,
    valeur_toponymique_ancien
  ];

  for (const entier of entiers) {
    if (
      entier != null &&
      (String(entier).trim() === "" ||
       typeof entier === "boolean" ||
       !Number.isSafeInteger(Number(entier)))
    ) {
      const erreur = new Error(
        "Les champs numériques entiers doivent contenir des entiers valides"
      );
      erreur.status = 400;
      return next(erreur);
    }
  }

  const textes = {
    no_local_pavillon: 100,
    categorie: 100,
    type_lieu: 100,
    lieu_specifique: 255,
    description: 255,
    commentaire: 255,
    statut: 50
  };

  for (const [champ, longueurMax] of Object.entries(textes)) {
    const valeur = req.body[champ];

    if (
      valeur != null &&
      (typeof valeur !== "string" || valeur.length > longueurMax)
    ) {
      const erreur = new Error(
        `${champ} doit être un texte de ${longueurMax} caractères maximum`
      );
      erreur.status = 400;
      return next(erreur);
    }
  }

  // Toutes les données sont valides
  next();
}


export function validatePlotId(req, res, next) {
  const { id } = req.params;

  if (
    !id ||
    String(id).trim() === "" ||
    !Number.isSafeInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    const erreur = new Error("Identifiant d'emplacement invalide");
    erreur.status = 400;
    return next(erreur);
  }

  next();
}
