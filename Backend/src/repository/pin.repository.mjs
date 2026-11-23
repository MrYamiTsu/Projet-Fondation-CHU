import * as Pin from '../models/pin.mjs';
import { findPlotById } from '../models/emplacement.mjs';

export async function deletePinsByEtage(etageId) {
    return await Pin.deletePinsByEtage(etageId);
}

export async function createPin(hopitalId, etageId, emplacementId, x, y) {
    return await Pin.createPin(hopitalId, etageId, emplacementId, x, y);
}

export async function deletePin(id) {
    return await Pin.deletePin(id);
}

export async function getEmplacementById(id) {
    return await findPlotById(id);
}
