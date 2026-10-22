
import {
  findHospitalById,
  findAllHospitals,
  findHospitalEmplacements,
  createHospital,
  updateHospital,
  deleteHospital
} from "../models/hopital.mjs";


export async function getHospitalById(req, res, next) {
  const id = req.query.id;

  if (
    id == null ||
    String(id).trim() === "" ||
    !Number.isSafeInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    const erreur = new Error("Veuillez fournir un id valide");
    erreur.status = 400;
    return next(erreur);
  }

  try {
    const hopital = await findHospitalById(Number(id));

    if (!hopital) {
      const erreur = new Error("Aucun hôpital trouvé avec cet id");
      erreur.status = 404;
      return next(erreur);
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Hôpital récupéré avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        hopital
      }
    });

  } catch (erreur) {
    return next(erreur);
  }
}


export async function getAllHospitals(req, res, next) {
  try {
    const hopitaux = await findAllHospitals();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Hôpitaux récupérés avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        hopitaux,
        count: hopitaux.length
      }
    });

  } catch (erreur) {
    return next(erreur);
  }
}


export async function getHospitalEmplacements(req, res, next) {
  const { id } = req.params;

  if (
    !Number.isSafeInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    const erreur = new Error("Identifiant d'hôpital invalide");
    erreur.status = 400;
    return next(erreur);
  }

  try {
    const hopital = await findHospitalById(Number(id));

    if (!hopital) {
      const erreur = new Error("Hôpital introuvable");
      erreur.status = 404;
      return next(erreur);
    }

    const emplacements = await findHospitalEmplacements(Number(id));

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Emplacements récupérés avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        hopital,
        emplacements,
        count: emplacements.length
      }
    });

  } catch (erreur) {
    return next(erreur);
  }
}


export async function addHospital(req, res, next) {
  const { acronyme, nom } = req.body ?? {};

  if (
    typeof acronyme !== "string" ||
    acronyme.trim() === "" ||
    typeof nom !== "string" ||
    nom.trim() === ""
  ) {
    const erreur = new Error("Le nom et l'acronyme sont obligatoires");
    erreur.status = 400;
    return next(erreur);
  }

  try {
    const hopital = await createHospital(
      acronyme.trim(),
      nom.trim()
    );

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Hôpital créé avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        hopital
      }
    });

  } catch (erreur) {
    return next(erreur);
  }
}


export async function modifyHospital(req, res, next) {
  const { id } = req.params;
  const { acronyme, nom } = req.body ?? {};

  if (
    !Number.isSafeInteger(Number(id)) ||
    Number(id) <= 0
  ) {
    const erreur = new Error("Identifiant d'hôpital invalide");
    erreur.status = 400;
    return next(erreur);
  }

  if (
    typeof acronyme !== "string" ||
    acronyme.trim() === "" ||
    typeof nom !== "string" ||
    nom.trim() === ""
  ) {
    const erreur = new Error("Le nom et l'acronyme sont obligatoires");
    erreur.status = 400;
    return next(erreur);
  }

  try {
    const hopital = await updateHospital(
      Number(id),
      acronyme.trim(),
      nom.trim()
    );

    if (!hopital) {
      const erreur = new Error("Hôpital introuvable");
      erreur.status = 404;
      return next(erreur);
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Hôpital modifié avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        hopital
      }
    });

  } catch (erreur) {
    return next(erreur);
  }
}

