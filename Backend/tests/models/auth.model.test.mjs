
import { describe, it, expect, vi, beforeEach } from 'vitest';

import pool from '../../src/db.mjs';

import {
  findUserByEmail,
  createUser
} from '../../src/models/auth.mjs';

// Simuler la connexion PostgreSQL
vi.mock('../../src/db.mjs', () => ({
  default: {
    query: vi.fn()
  }
}));

describe('auth.model', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findUserByEmail', () => {

    it('retourne un utilisateur si son email existe', async () => {
      const utilisateur = {
        id: 1,
        email: 'test@example.com',
        password_hash: 'hash123',
        role: 'user'
      };

      pool.query.mockResolvedValue({
        rows: [utilisateur]
      });

      const resultat = await findUserByEmail('test@example.com');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['test@example.com']
      );

      expect(resultat).toEqual(utilisateur);
    });

    it("retourne undefined si l'utilisateur n'existe pas", async () => {
      pool.query.mockResolvedValue({
        rows: []
      });

      const resultat = await findUserByEmail('inconnu@example.com');

      expect(resultat).toBeUndefined();
    });

    it("transmet une erreur si PostgreSQL échoue", async () => {
      const erreur = new Error('Erreur PostgreSQL');

      pool.query.mockRejectedValue(erreur);

      await expect(
        findUserByEmail('test@example.com')
      ).rejects.toThrow('Erreur PostgreSQL');
    });
  });

  describe('createUser', () => {

    it('crée un utilisateur et retourne ses informations', async () => {
      const utilisateur = {
        id: 2,
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean@example.com',
        role: 'user',
        actif: true
      };

      pool.query.mockResolvedValue({
        rows: [utilisateur]
      });

      const resultat = await createUser(
        'Dupont',
        'Jean',
        'jean@example.com',
        'motDePasseHache'
      );

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO utilisateur'),
        [
          'Dupont',
          'Jean',
          'jean@example.com',
          'motDePasseHache'
        ]
      );

      expect(resultat).toEqual(utilisateur);
      expect(resultat).not.toHaveProperty('password_hash');
    });

    it('transmet une erreur si PostgreSQL refuse la création', async () => {
      const erreur = new Error('Email déjà utilisé');

      pool.query.mockRejectedValue(erreur);

      await expect(
        createUser('Dupont', 'Jean', 'jean@example.com', 'hash')
      ).rejects.toThrow('Email déjà utilisé');
    });

  });
});
