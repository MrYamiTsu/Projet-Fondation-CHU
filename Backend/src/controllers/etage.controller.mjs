import * as etageService from '../services/etage.services.mjs';

export async function getEtageById(req, res) {
    try {
        const id = req.params.id;
        const etage = await etageService.getEtageById(id);
        if (!etage) {
            return res.status(404).json({ message: 'Étage non trouvé' });
        }
        res.json(etage);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

export async function getAllEtageByHospital(req, res) {
    try {
        const nom = req.query.nom;
        const etages = await etageService.getAllEtageByHospital(nom);
        res.json(etages);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

export async function createEtage(req, res) {
    try {
        const { hopital_id, niveau, nom } = req.body;
        const newEtage = await etageService.createEtage(hopital_id, niveau, nom);
        res.status(201).json(newEtage);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

export async function deleteEtage(req, res) {
    try {
        const id = req.params.id;
        const deletedEtage = await etageService.deleteEtage(id);
        if (!deletedEtage) {
            return res.status(404).json({ message: 'Étage non trouvé' });
        }
        res.json(deletedEtage);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

export async function addImageToEtage(req, res) {
    try {
        const etage = await etageService.addImageToEtage(req.params.id, req.file);
        res.json(etage);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

export async function deleteImageFromEtage(req, res) {
    try {
        const etage = await etageService.deleteImageFromEtage(req.params.id);
        res.json(etage);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}
