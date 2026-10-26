import { findHospitalById, findAllHospitals } from "../models/hopital.mjs";

export async function getHospitalById(req, res, next) {
  const id = req.query.id;

  if (!id || String(id).trim() === "" || isNaN(Number(id)) || Number(id) <= 0) {
    const erreur = new Error("Veuillez fournir un id valide");
    erreur.status = 400;

    return next(erreur);
  }

  const idNumerique = Number(id);

  try {
    const hopital = await findHospitalById(idNumerique);

    if (!hopital) {
      const erreur = new Error("Aucun hôpital trouvé avec cet id");
      erreur.status = 404;

      return next(erreur);
    }

    return res.status(200).json(hopital);
  } catch (erreur) {
    return next(erreur);
  }
}

export async function getAllHospitals(req, res, next) {
  try {
    const hopitaux = await findAllHospitals();

    return res.status(200).json(hopitaux);
  } catch (erreur) {
    return next(erreur);
  }
}
