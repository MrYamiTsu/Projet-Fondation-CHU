import * as Pin from '../models/pin.mjs';

export async function deletePinsByEtage(etageId) {
    return await Pin.deletePinsByEtage(etageId);
}