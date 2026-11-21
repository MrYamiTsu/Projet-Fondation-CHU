import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as modele from '../../src/models/emplacement.mjs';
import {
  getPlotByLieu,
  getPlotById,
  getAllPlots,
  addPlot,
} from '../../src/controllers/emplacement.controller.mjs';

vi.mock('../../src/models/emplacement.mjs', () => ({
  findPlotByLieu: vi.fn(),
  findPlotByDescription: vi.fn(),
  findPlotById: vi.fn(),
  findAllPlots: vi.fn(),
  createPlot: vi.fn(),
}));

const creerRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('emplacement.controller', () => {
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();
    res = creerRes();
    next = vi.fn();
  });

  describe('getPlotByLieu', () => {
    it.each([
      ['absent', undefined],
      ['vide', ''],
      ['uniquement des espaces', '   '],
    ])('retourne 400 si le lieu est %s', async (_nom, lieu) => {
      await getPlotByLieu({ query: { lieu } }, res, next);

      const erreur = next.mock.calls[0][0];
      expect(erreur).toBeInstanceOf(Error);
      expect(erreur.status).toBe(400);
      expect(modele.findPlotByLieu).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('retourne 200 avec les emplacements trouvés, lieu nettoyé par trim', async () => {
      const emplacements = [{ id: 1 }];
      modele.findPlotByLieu.mockResolvedValue(emplacements);

      await getPlotByLieu({ query: { lieu: '  Aile A  ' } }, res, next);

      expect(modele.findPlotByLieu).toHaveBeenCalledWith('Aile A');
      expect(modele.findPlotByDescription).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(emplacements);
      expect(next).not.toHaveBeenCalled();
    });

    it('retourne les suggestions par description si aucun lieu n’est trouvé', async () => {
      const suggestions = [{ id: 7, description: 'Près de l’aile A' }];
      modele.findPlotByLieu.mockResolvedValue([]);
      modele.findPlotByDescription.mockResolvedValue(suggestions);

      await getPlotByLieu({ query: { lieu: 'aile' } }, res, next);

      expect(modele.findPlotByDescription).toHaveBeenCalledWith('aile');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(suggestions);
    });

    it('transmet l’erreur à next si le modèle échoue', async () => {
      const erreur = new Error('DB down');
      modele.findPlotByLieu.mockRejectedValue(erreur);

      await getPlotByLieu({ query: { lieu: 'aile' } }, res, next);

      expect(next).toHaveBeenCalledWith(erreur);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getPlotById', () => {
    it.each([
      ['une lettre', 'abc'],
      ['zéro', '0'],
      ['négatif', '-5'],
      ['décimal', '1.5'],
      ['vide', ''],
      ['des espaces', '   '],
    ])('retourne 400 si l’id est %s', async (_nom, id) => {
      await getPlotById({ params: { id } }, res, next);

      expect(next.mock.calls[0][0].status).toBe(400);
      expect(modele.findPlotById).not.toHaveBeenCalled();
    });

    it('retourne 200 et appelle le modèle avec un nombre', async () => {
      modele.findPlotById.mockResolvedValue({ id: 5 });

      await getPlotById({ params: { id: '5' } }, res, next);

      expect(modele.findPlotById).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: 5 });
    });

    it('retourne 404 si l’emplacement n’existe pas', async () => {
      modele.findPlotById.mockResolvedValue(null);

      await getPlotById({ params: { id: '99' } }, res, next);

      expect(next.mock.calls[0][0].status).toBe(404);
      expect(res.json).not.toHaveBeenCalled();
    });

    it('transmet l’erreur à next si le modèle échoue', async () => {
      const erreur = new Error('DB down');
      modele.findPlotById.mockRejectedValue(erreur);

      await getPlotById({ params: { id: '5' } }, res, next);

      expect(next).toHaveBeenCalledWith(erreur);
    });
  });

  describe('getAllPlots', () => {
    it('retourne 200 avec tous les emplacements', async () => {
      const emplacements = [{ id: 1 }, { id: 2 }, { id: 3 }];
      modele.findAllPlots.mockResolvedValue(emplacements);

      await getAllPlots({}, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(emplacements);
    });

    it('transmet l’erreur à next si le modèle échoue', async () => {
      const erreur = new Error('DB down');
      modele.findAllPlots.mockRejectedValue(erreur);

      await getAllPlots({}, res, next);

      expect(next).toHaveBeenCalledWith(erreur);
    });
  });

  // La validation des champs est testée avec le middleware validatePlot,
  // pas ici : le controller reçoit des données déjà validées.
  describe('addPlot', () => {
    const donnees = {
      composante_id: 1,
      lieu_specifique: 'Aile A',
      fl_id: 1,
      ff_id: 1,
    };

    it('retourne 201 avec l’emplacement créé', async () => {
      const emplacement = { id: 11, ...donnees };
      modele.createPlot.mockResolvedValue(emplacement);

      await addPlot({ body: donnees }, res, next);

      expect(modele.createPlot).toHaveBeenCalledWith(donnees);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: { emplacement } }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('transmet l’erreur à next si le modèle échoue', async () => {
      const erreur = new Error('DB down');
      modele.createPlot.mockRejectedValue(erreur);

      await addPlot({ body: donnees }, res, next);

      expect(next).toHaveBeenCalledWith(erreur);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});