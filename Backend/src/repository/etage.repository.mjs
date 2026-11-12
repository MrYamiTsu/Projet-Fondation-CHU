import * as Etage from '../models/etage.model.mjs';

export async function getEtageById(id) {
    return await Etage.findEtageById(id);
}

export async function getAllEtageByHospital(nom) {
    return await Etage.findAllEtageByHospital(nom);
}

export async function createEtage(hopital_id, niveau, nom) {
    return await Etage.createEtage(hopital_id, niveau, nom);
}

export async function deleteEtage(id) {
    return await Etage.deleteEtage(id);
}

export async function addImageToEtage(etageId, imageUrl, imagePublicId) {
    return await Etage.AddImageToEtage(etageId, imageUrl, imagePublicId);
}

export async function deleteImageFromEtage(etageId) {
    return await Etage.DeleteImageFromEtage(etageId);
}