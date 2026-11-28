import { describe, it, expect, vi, beforeEach } from 'vitest';

import pool from '../../src/db.mjs';
import { deletePlot } from '../../src/models/emplacement.mjs';

vi.mock('../../src/db.mjs', () => ({
  default: {
    query: vi.fn(),
  },
}));

describe('emplacement.model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deletePlot', () => {
    it('exécute un DELETE valide avec l’id comme seul paramètre ($1)', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      await deletePlot(5);

      const [requete, valeurs] = pool.query.mock.calls[0];
      expect(requete.replace(/\s+/g, ' ').trim()).toMatch(
        /^DELETE FROM emplacement WHERE id ?= ?\$1$/i,
      );
      expect(valeurs).toEqual([5]);
    });

    it('retourne true si une ligne a été supprimée', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });

      await expect(deletePlot(5)).resolves.toBe(true);
    });

    it('retourne false si aucun emplacement ne correspond', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });

      await expect(deletePlot(99)).resolves.toBe(false);
    });

    it('propage les erreurs de la base', async () => {
      pool.query.mockRejectedValue(new Error('DB down'));

      await expect(deletePlot(5)).rejects.toThrow('DB down');
    });
  });
});
