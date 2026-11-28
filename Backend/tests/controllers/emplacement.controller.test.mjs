import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as modele from '../../src/models/emplacement.mjs';
import {
  getPlotByLieu,
  getPlotById,
  getAllPlots,
  addPlot,
  modifyPlot,
  deletePlot,
} from '../../src/controllers/emplacement.controller.mjs';

vi.mock('../../src/models/emplacement.mjs', () => ({
  findPlotByLieu: vi.fn(),
  findPlotByDescription: vi.fn(),
  findPlotById: vi.fn(),
  findAllPlots: vi.fn(),
  findPlotByComposanteAndLieu: vi.fn(),
  createPlot: vi.fn(),
  updatePlot: vi.fn(),
  deletePlot: vi.fn(),
}));

const createRes = () => {
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
    res = createRes();
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

  });

  describe('getPlotById', () => {
    it.each([
      ['une lettre', 'abc'],
      ['zéro', '0'],
      ['négatif', '-5'],
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

  describe('addPlot', () => {
    const donnees = {
      composante_id: 1,
      lieu_specifique: 'Aile A',
      fl_id: 1,
      ff_id: 1,
    };

    it('retourne 201 avec l’emplacement créé', async () => {
      const emplacement = { id: 11, ...donnees };
      modele.findPlotByComposanteAndLieu.mockResolvedValue(null);
      modele.createPlot.mockResolvedValue(emplacement);

      await addPlot({ body: donnees }, res, next);

      expect(modele.findPlotByComposanteAndLieu).toHaveBeenCalledWith(1, 'Aile A', null);
      expect(modele.createPlot).toHaveBeenCalledWith(donnees);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: { emplacement } }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('retourne 409 si le lieu existe déjà dans cet hôpital', async () => {
      modele.findPlotByComposanteAndLieu.mockResolvedValue({ id: 3 });

      await addPlot({ body: donnees }, res, next);

      const erreur = next.mock.calls[0][0];
      expect(erreur.status).toBe(409);
      expect(modele.createPlot).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('retourne 409 si la base refuse un doublon créé en même temps (code 23505)', async () => {
      const doublon = Object.assign(new Error('duplicate key'), { code: '23505' });
      modele.findPlotByComposanteAndLieu.mockResolvedValue(null);
      modele.createPlot.mockRejectedValue(doublon);

      await addPlot({ body: donnees }, res, next);

      expect(next.mock.calls[0][0].status).toBe(409);
      expect(res.json).not.toHaveBeenCalled();
    });

    it('transmet l’erreur à next si le modèle échoue', async () => {
      const erreur = new Error('DB down');
      modele.findPlotByComposanteAndLieu.mockResolvedValue(null);
      modele.createPlot.mockRejectedValue(erreur);

      await addPlot({ body: donnees }, res, next);

      expect(next).toHaveBeenCalledWith(erreur);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('modifyPlot', () => {
    const donnees = {
      composante_id: 1,
      lieu_specifique: 'Aile A',
      fl_id: 1,
      ff_id: 1,
    };

    it.each([
      ['une lettre', 'abc'],
      ['zéro', '0'],
      ['négatif', '-5'],
    ])('retourne 400 si l’id est %s', async (_nom, id) => {
      await modifyPlot({ params: { id }, body: donnees }, res, next);

      expect(next.mock.calls[0][0].status).toBe(400);
      expect(modele.updatePlot).not.toHaveBeenCalled();
    });

    it('retourne 200 avec l’emplacement modifié', async () => {
      const emplacement = { id: 5, ...donnees };
      modele.findPlotByComposanteAndLieu.mockResolvedValue(null);
      modele.updatePlot.mockResolvedValue(emplacement);

      await modifyPlot({ params: { id: '5' }, body: donnees }, res, next);

      expect(modele.findPlotByComposanteAndLieu).toHaveBeenCalledWith(1, 'Aile A', 5);
      expect(modele.updatePlot).toHaveBeenCalledWith(5, donnees);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: { emplacement } }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('retourne 409 si un autre emplacement de l’hôpital a déjà ce lieu', async () => {
      modele.findPlotByComposanteAndLieu.mockResolvedValue({ id: 3 });

      await modifyPlot({ params: { id: '5' }, body: donnees }, res, next);

      expect(next.mock.calls[0][0].status).toBe(409);
      expect(modele.updatePlot).not.toHaveBeenCalled();
    });

    it('retourne 409 si la base refuse un doublon créé en même temps (code 23505)', async () => {
      const doublon = Object.assign(new Error('duplicate key'), { code: '23505' });
      modele.findPlotByComposanteAndLieu.mockResolvedValue(null);
      modele.updatePlot.mockRejectedValue(doublon);

      await modifyPlot({ params: { id: '5' }, body: donnees }, res, next);

      expect(next.mock.calls[0][0].status).toBe(409);
      expect(res.json).not.toHaveBeenCalled();
    });

    it('retourne 404 si l’emplacement n’existe pas', async () => {
      modele.findPlotByComposanteAndLieu.mockResolvedValue(null);
      modele.updatePlot.mockResolvedValue(undefined);

      await modifyPlot({ params: { id: '99' }, body: donnees }, res, next);

      expect(next.mock.calls[0][0].status).toBe(404);
      expect(res.json).not.toHaveBeenCalled();
    });

    it('transmet l’erreur à next si le modèle échoue', async () => {
      const erreur = new Error('DB down');
      modele.findPlotByComposanteAndLieu.mockResolvedValue(null);
      modele.updatePlot.mockRejectedValue(erreur);

      await modifyPlot({ params: { id: '5' }, body: donnees }, res, next);

      expect(next).toHaveBeenCalledWith(erreur);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('deletePlot', () => {
    it.each([
      ['une lettre', 'abc'],
      ['zéro', '0'],
      ['négatif', '-5'],
      ['décimal', '1.5'],
    ])('retourne 400 si l’id est %s', async (_nom, id) => {
      await deletePlot({ params: { id } }, res, next);

      expect(next.mock.calls[0][0].status).toBe(400);
      expect(modele.deletePlot).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('retourne 204 et supprime l’emplacement (id converti en nombre)', async () => {
      modele.deletePlot.mockResolvedValue({ supprime: true, reservationsActives: false });

      await deletePlot({ params: { id: '5' } }, res, next);

      expect(modele.deletePlot).toHaveBeenCalledWith(5);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(next).not.toHaveBeenCalled();
    });

    it('retourne 404 si l’emplacement n’existe pas', async () => {
      modele.deletePlot.mockResolvedValue({ supprime: false, reservationsActives: false });

      await deletePlot({ params: { id: '99' } }, res, next);

      expect(next.mock.calls[0][0].status).toBe(404);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('retourne 409 si l’emplacement a des réservations en attente ou confirmées', async () => {
      modele.deletePlot.mockResolvedValue({ supprime: false, reservationsActives: true });

      await deletePlot({ params: { id: '5' } }, res, next);

      const erreur = next.mock.calls[0][0];
      expect(erreur.status).toBe(409);
      expect(erreur.message).toContain('Annulez-les');
      expect(res.status).not.toHaveBeenCalled();
    });

    it('retourne 409 si une réservation est créée pendant la suppression (code 23503)', async () => {
      const lie = Object.assign(new Error('foreign key violation'), { code: '23503' });
      modele.deletePlot.mockRejectedValue(lie);

      await deletePlot({ params: { id: '5' } }, res, next);

      expect(next.mock.calls[0][0].status).toBe(409);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('transmet l’erreur à next si le modèle échoue', async () => {
      const erreur = new Error('DB down');
      modele.deletePlot.mockRejectedValue(erreur);

      await deletePlot({ params: { id: '5' } }, res, next);

      expect(next).toHaveBeenCalledWith(erreur);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
