import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import * as modele from '../../src/models/emplacement.mjs';

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

const SECRET = 'secret-de-test';
let app;
let tokenAdmin;
let tokenUser;

beforeAll(async () => {
  process.env.JWT_SECRET = SECRET;
  tokenAdmin = jwt.sign({ id: 1, role: 'admin' }, SECRET);
  tokenUser = jwt.sign({ id: 2, role: 'user' }, SECRET);
  ({ default: app } = await import('../../src/app.mjs'));
});

describe('DELETE /emplacements/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 401 sans jeton', async () => {
    const res = await request(app).delete('/emplacements/5');

    expect(res.status).toBe(401);
    expect(modele.deletePlot).not.toHaveBeenCalled();
  });

  it('retourne 403 pour un utilisateur non administrateur', async () => {
    const res = await request(app)
      .delete('/emplacements/5')
      .set('Authorization', `Bearer ${tokenUser}`);

    expect(res.status).toBe(403);
    expect(modele.deletePlot).not.toHaveBeenCalled();
  });

  it('retourne 400 si l’id est invalide', async () => {
    const res = await request(app)
      .delete('/emplacements/abc')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(400);
    expect(modele.deletePlot).not.toHaveBeenCalled();
  });

  it('retourne 204 sans contenu quand un admin supprime un emplacement', async () => {
    modele.deletePlot.mockResolvedValue({ supprime: true, reservationsActives: false });

    const res = await request(app)
      .delete('/emplacements/5')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    expect(modele.deletePlot).toHaveBeenCalledWith(5);
  });

  it('retourne 404 si l’emplacement n’existe pas', async () => {
    modele.deletePlot.mockResolvedValue({ supprime: false, reservationsActives: false });

    const res = await request(app)
      .delete('/emplacements/99')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(404);
  });

  it('est aussi disponible sous /api/emplacements/:id', async () => {
    modele.deletePlot.mockResolvedValue({ supprime: true, reservationsActives: false });

    const res = await request(app)
      .delete('/api/emplacements/5')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(204);
  });
});
