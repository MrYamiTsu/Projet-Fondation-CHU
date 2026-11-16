import * as pinService from '../services/pin.service.mjs';

export async function createPin(req, res) {
    try {
        const { etage_id, emplacement_id, x, y } = req.body || {};
        const newPin = await pinService.createPin(etage_id, emplacement_id, x, y);
        res.status(201).json(newPin);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

export async function deletePin(req, res) {
    try {
        const id = req.params.id;
        const deletedPin = await pinService.deletePin(id);
        if (!deletedPin) {
            return res.status(404).json({ message: 'Pin non trouvé' });
        }
        res.json(deletedPin);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}