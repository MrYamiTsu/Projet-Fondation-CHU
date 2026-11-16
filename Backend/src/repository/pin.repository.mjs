import * as Pin from '../models/pin.mjs';

export async function deletePinsByEtage(etageId) {
    return await Pin.deletePinsByEtage(etageId);
}

export async function createPin(hopitalId, etageId, emplacementId, x, y) {
    return await Pin.createPin(hopitalId, etageId, emplacementId, x, y);
}

export async function deletePin(id) {
    return await Pin.deletePin(id);
}