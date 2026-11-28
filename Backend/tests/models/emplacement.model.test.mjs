import { describe, it, expect, vi, beforeEach } from 'vitest';

import pool from '../../src/db.mjs';
import { deletePlot } from '../../src/models/emplacement.mjs';

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

    it('retourne supprime: false si l’emplacement n’existe pas', async () => {
      client.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rowCount: 0 })
        .mockResolvedValueOnce({ rowCount: 0 })
        .mockResolvedValueOnce({ rowCount: 0 })
        .mockResolvedValueOnce({});

      await expect(deletePlot(99)).resolves.toEqual({ supprime: false, reservationsActives: false });
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
