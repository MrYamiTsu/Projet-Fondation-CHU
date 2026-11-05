import * as EtageRepository from "../models/etages.repository.mjs";

export async function getEtageById(id) {
  if (
    typeof id !== "string" ||
    id.trim() === "" ||
    !Number.isInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    const erreur = new Error("Veuillez fournir un id entier positif valide");
    erreur.status = 400;
    throw erreur;
  }

  return await EtageRepository.getEtageById(Number(id));
}

export async function getAllEtageByHospital(nom) {
  if (typeof nom !== "string" || nom.trim() === "") {
    const erreur = new Error("Veuillez fournir un nom d'hôpital valide");
    erreur.status = 400;
    throw erreur;
  }

  return await EtageRepository.getAllEtageByHospital(nom.trim());
}

export async function createEtage(hopital_id, niveau, nom) {
  if (
    typeof hopital_id !== "number" ||
    !Number.isInteger(hopital_id) ||
    hopital_id <= 0
  ) {
    const erreur = new Error(
      "Veuillez fournir un id d'hôpital entier positif valide",
    );
    erreur.status = 400;
    throw erreur;
  }

  if (typeof nom !== "string" || nom.trim() === "") {
    const erreur = new Error("Veuillez fournir un nom d'étage valide");
    erreur.status = 400;
    throw erreur;
  }

  if (typeof niveau !== "number" || !Number.isInteger(niveau)) {
    const erreur = new Error(
      "Veuillez fournir un niveau d'étage entier valide",
    );
    erreur.status = 400;
    throw erreur;
  }

  const etageExisting = await EtageRepository.getAllEtageByHospital(nom.trim());
  const niveauDejaUtilise = etageExisting.find(
    (etage) => etage.niveau === niveau,
  );

  if (niveauDejaUtilise) {
    const erreur = new Error(
      "Un étage avec ce niveau existe déjà pour cet hôpital",
    );
    erreur.status = 400;
    throw erreur;
  }

  const etage = {
    hopital_id: hopital_id,
    niveau: niveau,
    nom: nom,
  };

  return await EtageRepository.createEtage(etage);
}

export async function deleteEtage(id) {
  if (
    typeof id !== "string" ||
    id.trim() === "" ||
    !Number.isInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    const erreur = new Error("Veuillez fournir un id entier positif valide");
    erreur.status = 400;
    throw erreur;
  }

    return await EtageRepository.deleteEtage(Number(id));
}

