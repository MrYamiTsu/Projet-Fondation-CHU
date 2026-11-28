import { describe, it, expect, vi, beforeEach } from 'vitest';

import pool from '../../src/db.mjs';
import {
  deletePlot,
  createPlot,
  updatePlot,
  findPlotById,
} from '../../src/models/emplacement.mjs';

const client = { query: vi.fn(), release: vi.fn() };

vi.mock('../../src/db.mjs', () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

const requetes = () => client.query.mock.calls.map(([sql]) => sql.replace(/\s+/g, ' ').trim());

describe('emplacement.model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pool.connect.mockResolvedValue(client);
  });

  describe('lectures avec champs calculés', () => {
    const verifierCalcul = (sql) => {
      const propre = sql.replace(/\s+/g, ' ');
      expect(propre).toContain('fl.fl * ff.ff * e.superficie AS superficie_ajuste');
      expect(propre).toContain(
        'superficie_ajuste / NULLIF(SUM(superficie_ajuste) OVER (), 0) AS poid_relatif',
      );
      expect(propre).toContain(
        'emplacement.*, hopital.acronyme, calculs.superficie_ajuste, calculs.poid_relatif',
      );
    };

    it('findPlotById calcule le poids sur tous les emplacements, pas seulement celui demandé', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 5 }] });
      await findPlotById(5);
      const sql = pool.query.mock.calls[0][0].replace(/\s+/g, ' ');
      verifierCalcul(sql);
      expect(sql.indexOf('WHERE emplacement.id = $1')).toBeGreaterThan(sql.indexOf('OVER ()'));
    });
  });

  describe('écritures', () => {
    const donnees = {
      composante_id: 1,
      lieu_specifique: 'Hall',
      superficie: 250,
      fl_id: 6,
      ff_id: 8,
      superficie_ajuste: 1,
      poid_relatif: 99,
    };

    it('createPlot n’écrit pas les champs calculés et renvoie la ligne recalculée', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 42 }] })
        .mockResolvedValueOnce({ rows: [{ id: 42, superficie_ajuste: 875 }] });

      const resultat = await createPlot(donnees);

      const [insert, valeurs] = pool.query.mock.calls[0];
      expect(insert).not.toMatch(/superficie_ajuste|poid_relatif/);
      expect(valeurs).not.toContain(99);
      expect(pool.query.mock.calls[1][1]).toEqual([42]);
      expect(resultat).toEqual({ id: 42, superficie_ajuste: 875 });
    });

    it('updatePlot renvoie undefined si l’emplacement n’existe pas', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(updatePlot(99, donnees)).resolves.toBeUndefined();
      expect(pool.query).toHaveBeenCalledOnce();
    });
  });

  describe('deletePlot', () => {
    it('supprime les réservations annulées puis l’emplacement, dans une transaction', async () => {
      client.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rowCount: 0 })
        .mockResolvedValueOnce({ rowCount: 2 })
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({});

      const resultat = await deletePlot(5);

      expect(resultat).toEqual({ supprime: true, reservationsActives: false });
      const sql = requetes();
      expect(sql[0]).toBe('BEGIN');
      expect(sql[1]).toMatch(/statut IS DISTINCT FROM 'cancelled' FOR UPDATE$/);
      expect(sql[2]).toBe('DELETE FROM reservation WHERE emplacement_id = $1');
      expect(sql[3]).toBe('DELETE FROM emplacement WHERE id = $1');
      expect(sql[4]).toBe('COMMIT');
      expect(client.query.mock.calls.slice(1, 4).every(([, valeurs]) => valeurs[0] === 5)).toBe(true);
      expect(client.release).toHaveBeenCalledOnce();
    });

    it('ne supprime rien s’il reste une réservation en attente ou confirmée', async () => {
      client.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({});

      const resultat = await deletePlot(5);

      expect(resultat).toEqual({ supprime: false, reservationsActives: true });
      expect(requetes()).toEqual(['BEGIN', expect.stringContaining('SELECT id FROM reservation'), 'ROLLBACK']);
      expect(client.release).toHaveBeenCalledOnce();
    });

    it('annule la transaction et propage l’erreur si la base échoue', async () => {
      client.query
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('DB down'))
        .mockResolvedValueOnce({});

      await expect(deletePlot(5)).rejects.toThrow('DB down');
      expect(requetes().at(-1)).toBe('ROLLBACK');
      expect(client.release).toHaveBeenCalledOnce();
    });
  });
});
