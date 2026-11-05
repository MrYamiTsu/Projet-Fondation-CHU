
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach
} from 'vitest';

import * as modele from '../../src/models/auth.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
  register,
  login
} from '../../src/controllers/auth.controller.mjs';

// Simuler le modèle PostgreSQL
vi.mock('../../src/models/auth.mjs', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn()
}));

// Simuler bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn()
  }
}));

// Simuler jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn()
  }
}));

// Créer une fausse réponse Express
function creerRes() {
  const res = {};

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  return res;
}

describe('auth.controller', () => {

  let req;
  let res;
  let next;

  const ancienSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    vi.resetAllMocks();

    req = {
      body: {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean@example.com',
        password: 'MotDePasse123!'
      },
      originalUrl: '/auth/register',
      method: 'POST'
    };

    res = creerRes();
    next = vi.fn();

    process.env.JWT_SECRET = 'secret-de-test';
  });

  afterEach(() => {
    if (ancienSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = ancienSecret;
    }
  });

  // ========================================
  // TESTS DE REGISTER
  // ========================================

  describe('register', () => {

    it('201 si le compte est créé', async () => {
      const utilisateur = {
        id: 1,
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean@example.com',
        role: 'user',
        actif: true
      };

      modele.findUserByEmail.mockResolvedValue(undefined);
      bcrypt.hash.mockResolvedValue('password-hache');
      modele.createUser.mockResolvedValue(utilisateur);

      await register(req, res, next);

      expect(modele.findUserByEmail)
        .toHaveBeenCalledWith('jean@example.com');

      expect(bcrypt.hash)
        .toHaveBeenCalledWith('MotDePasse123!', 12);

      expect(modele.createUser).toHaveBeenCalledWith(
        'Dupont',
        'Jean',
        'jean@example.com',
        'password-hache'
      );

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          statusCode: 201,
          data: {
            utilisateur
          }
        })
      );

      expect(next).not.toHaveBeenCalled();
    });

    it('409 si l’email existe déjà', async () => {
      modele.findUserByEmail.mockResolvedValue({
        id: 1,
        email: 'jean@example.com'
      });

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 409
        })
      );

      expect(modele.createUser).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('transmet une erreur PostgreSQL à next', async () => {
      const erreur = new Error('Erreur de connexion DB');

      modele.findUserByEmail.mockRejectedValue(erreur);

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(erreur);
      expect(res.json).not.toHaveBeenCalled();
    });

    it('409 si PostgreSQL détecte un email dupliqué', async () => {
      const erreur = new Error('Email dupliqué');
      erreur.code = '23505';

      modele.findUserByEmail.mockResolvedValue(undefined);
      bcrypt.hash.mockResolvedValue('password-hache');
      modele.createUser.mockRejectedValue(erreur);

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 409
        })
      );

      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // TESTS DE LOGIN
  // ========================================

  describe('login', () => {

    beforeEach(() => {
      req.body = {
        email: 'jean@example.com',
        password: 'MotDePasse123!'
      };

      req.originalUrl = '/auth/login';
    });

    it('200 et retourne un JWT si les identifiants sont valides', async () => {
      const utilisateur = {
        id: 1,
        email: 'jean@example.com',
        password_hash: 'password-hache',
        role: 'user'
      };

      modele.findUserByEmail.mockResolvedValue(utilisateur);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token-jwt-test');

      await login(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'MotDePasse123!',
        'password-hache'
      );

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, role: 'user' },
        'secret-de-test',
        { expiresIn: '1h' }
      );

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          statusCode: 200,
          data: {
            utilisateur: {
              id: 1,
              email: 'jean@example.com',
              role: 'user'
            },
            token: 'token-jwt-test'
          }
        })
      );

      expect(next).not.toHaveBeenCalled();
    });

    it('401 si l’email est inexistant', async () => {
      modele.findUserByEmail.mockResolvedValue(undefined);

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401
        })
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('401 si le mot de passe est incorrect', async () => {
      modele.findUserByEmail.mockResolvedValue({
        id: 1,
        email: 'jean@example.com',
        password_hash: 'password-hache',
        role: 'user'
      });

      bcrypt.compare.mockResolvedValue(false);

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401
        })
      );

      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('transmet une erreur du modèle à next', async () => {
      const erreur = new Error('Base de données indisponible');

      modele.findUserByEmail.mockRejectedValue(erreur);

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(erreur);
    });

    it('transmet une erreur si JWT_SECRET est absent', async () => {
      delete process.env.JWT_SECRET;

      modele.findUserByEmail.mockResolvedValue({
        id: 1,
        email: 'jean@example.com',
        password_hash: 'password-hache',
        role: 'user'
      });

      bcrypt.compare.mockResolvedValue(true);

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.any(Error)
      );

      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});
