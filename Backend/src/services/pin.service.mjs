import * as PinRepository from "../repository/pin.repository.mjs";
import * as EtageRepository from "../repository/etage.repository.mjs";


export async function createPin(etage_id, emplacement_id, x, y) {
  if (
    typeof etage_id !== "number" ||
    !Number.isInteger(etage_id)
  ) {
    const erreur = new Error(
      "Veuillez fournir un id d'étage entier positif valide",
    );
    erreur.status = 400;
    throw erreur;
  }

  if (
    typeof emplacement_id !== "number" ||
    !Number.isInteger(emplacement_id) ||
    emplacement_id <= 0
  ) {
    const erreur = new Error(
      "Veuillez fournir un id d'emplacement entier positif valide",
    );
    erreur.status = 400;
    throw erreur;
  }

  if (typeof x !== "number" || !Number.isFinite(x) || x < 0 || x > 1) {
    const erreur = new Error("Veuillez fournir une coordonnée x entre 0 et 1");
    erreur.status = 400;
    throw erreur;
  }

  if (typeof y !== "number" || !Number.isFinite(y) || y < 0 || y > 1) {
    const erreur = new Error("Veuillez fournir une coordonnée y entre 0 et 1");
    erreur.status = 400;
    throw erreur;
  }

  const etage = await EtageRepository.getEtageById(Number(etage_id));
  if (!etage) {
    const erreur = new Error("Étage non trouvé");
    erreur.status = 404;
    throw erreur;
  }

  if (!etage.image_url) {
    const erreur = new Error(
      "Cet étage n'a pas d'image : impossible d'y placer un pin",
    );
    erreur.status = 409;
    throw erreur;
  }

  const emplacement = await PinRepository.getEmplacementById(emplacement_id);
  if (!emplacement) {
    const erreur = new Error("Emplacement non trouvé");
    erreur.status = 404;
    throw erreur;
  }

  const pin = await PinRepository.createPin(
    etage.hopital_id,
    etage.id,
    emplacement_id,
    x,
    y,
  );

  return {
    ...pin,
    no_local_pavillon: emplacement.no_local_pavillon,
    lieu_specifique: emplacement.lieu_specifique,
    description: emplacement.description,
    valeur_toponymique: emplacement.valeur_toponymique,
    type_lieu: emplacement.type_lieu,
    categorie: emplacement.categorie,
    superficie: emplacement.superficie,
  };
}

export async function deletePin(id) {
  if (
    typeof id !== "number" ||
    !Number.isInteger(id) 
    
  ) {
    const erreur = new Error(
      "Veuillez fournir un id de pin entier positif valide",
    );
    erreur.status = 400;
    throw erreur;
  }

  return await PinRepository.deletePin(Number(id));
}