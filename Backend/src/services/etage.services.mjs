import * as EtageRepository from "../repository/etage.repository.mjs";
import * as PinRepository from "../repository/pin.repository.mjs";
import { uploadImage, deleteImage } from "../utils/cloudinary.mjs";

const TYPES_IMAGE = ["image/jpeg", "image/png", "image/webp"];
const TAILLE_MAX_IMAGE = 5 * 1024 * 1024; // 5 Mo

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

  const etage = await EtageRepository.deleteEtage(Number(id));

  if (etage && etage.image_public_id) {
    try {
      await deleteImage(etage.image_public_id);
    } catch (error) {
      console.error("Suppression de l'image Cloudinary impossible :", error);
    }
  }

  return etage;
}

export async function addImageToEtage(id, fichier) {
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

  if (!fichier || !Buffer.isBuffer(fichier.buffer)) {
    const erreur = new Error("Veuillez fournir une image");
    erreur.status = 400;
    throw erreur;
  }

  if (!TYPES_IMAGE.includes(fichier.mimetype)) {
    const erreur = new Error("L'image doit être au format JPEG, PNG ou WebP");
    erreur.status = 400;
    throw erreur;
  }

  if (fichier.size > TAILLE_MAX_IMAGE) {
    const erreur = new Error("L'image ne doit pas dépasser 5 Mo");
    erreur.status = 400;
    throw erreur;
  }

  const etage = await EtageRepository.getEtageById(Number(id));
  if (!etage) {
    const erreur = new Error("Étage non trouvé");
    erreur.status = 404;
    throw erreur;
  }

  const upload = await uploadImage(fichier.buffer, "etages");

  let etageImage;
  try {
    etageImage = await EtageRepository.addImageToEtage(
      Number(id),
      upload.secure_url,
      upload.public_id,
    );
  } catch (error) {
    // la BD a échoué : on retire la nouvelle image pour ne pas laisser d'orphelin
    await deleteImage(upload.public_id).catch(() => {});
    throw error;
  }

  // l'ancienne image n'est plus utilisée : on la supprime
  if (etage.image_public_id) {
    try {
      await deleteImage(etage.image_public_id);
    } catch (error) {
      console.error("Suppression de l'ancienne image impossible :", error);
    }
  }

  return etageImage;
}

export async function deleteImageFromEtage(id) {
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

  const etage = await EtageRepository.getEtageById(Number(id));
  if (!etage) {
    const erreur = new Error("Étage non trouvé");
    erreur.status = 404;
    throw erreur;
  }

  if (!etage.image_public_id) {
    const erreur = new Error("Cet étage n'a pas d'image");
    erreur.status = 404;
    throw erreur;
  }

  const etageMaj = await EtageRepository.deleteImageFromEtage(Number(id));

  await PinRepository.deletePinsByEtage(Number(id));

  try {
    await deleteImage(etage.image_public_id);
  } catch (error) {
    console.error("Suppression de l'image Cloudinary impossible :", error);
  }

  return etageMaj;
}
