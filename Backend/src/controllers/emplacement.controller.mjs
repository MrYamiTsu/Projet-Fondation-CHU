import * as plotService from '../services/emplacement.service.mjs';
import { envoyerSucces } from '../utils/reponse.mjs';

export async function getPlotByLieu(req, res, next) {
  try {
    const emplacements = await plotService.getPlotByLieu(req.query.lieu);

    return res.status(200).json(emplacements);
  } catch (erreur) {
    return next(erreur);
  }
}

export async function getPlotById(req, res, next) {
  try {
    const emplacement = await plotService.getPlotById(req.params.id);

    return res.status(200).json(emplacement);
  } catch (erreur) {
    return next(erreur);
  }
}

export async function getAllPlots(req, res, next) {
  try {
    const emplacements = await plotService.getAllPlots();

    return res.status(200).json(emplacements);
  } catch (erreur) {
    return next(erreur);
  }
}

export async function addPlot(req, res, next) {
  try {
    const emplacement = await plotService.addPlot(req.body);

    return envoyerSucces(req, res, 201, 'Emplacement ajouté avec succès', { emplacement });
  } catch (erreur) {
    return next(erreur);
  }
}

export async function modifyPlot(req, res, next) {
  try {
    const emplacement = await plotService.modifyPlot(req.params.id, req.body);

    return envoyerSucces(req, res, 200, 'Emplacement modifié avec succès', { emplacement });
  } catch (erreur) {
    return next(erreur);
  }
}
