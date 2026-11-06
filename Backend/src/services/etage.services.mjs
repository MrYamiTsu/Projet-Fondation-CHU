import * as EtageRepository from "../repository/etage.repository.mjs";

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

  return await EtageRepository.createEtage(hopital_id, niveau, nom.trim());
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
