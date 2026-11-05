import * as Etage from '../models/etage.model.mjs';

export async function getEtageById(id) {
    return await Etage.findEtageById(id);
}

export async function getAllEtageByHospital(nom) {
    return await Etage.findAllEtageByHospital(nom);
}

export async function createEtage(etage) {
    return await Etage.createEtage(etage);
}

export async function deleteEtage(id) {
    return await Etage.deleteEtage(id);
}

export async function addImageToEtage(etageId, imageUrl) {
    return await Etage.AddImageToEtage(etageId, imageUrl);
}   

export async function deleteImageFromEtage(etageId) {
    return await Etage.DeleteImageFromEtage(etageId);
}