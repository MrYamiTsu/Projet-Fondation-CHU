
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  validateRegister
} from '../../src/middlewares/auth.middleware.mjs';

describe('validateRegister', () => {

  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean@example.com',
        password: 'MotDePasse123!'
      }
    };

    res = {};
    next = vi.fn();
  });

  it('accepte les informations valides', () => {
    validateRegister(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('retourne 400 si le nom est absent', () => {
    delete req.body.nom;

    validateRegister(req, res, next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('retourne 400 si le prénom est vide', () => {
    req.body.prenom = '';

    validateRegister(req, res, next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('retourne 400 si le nom contient uniquement des espaces', () => {
    req.body.nom = '   ';

    validateRegister(req, res, next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('retourne 400 si le nom dépasse 100 caractères', () => {
    req.body.nom = 'A'.repeat(101);

    validateRegister(req, res, next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('retourne 400 si le prénom dépasse 100 caractères', () => {
    req.body.prenom = 'B'.repeat(101);

    validateRegister(req, res, next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('retourne 400 si email est invalide', () => {
    req.body.email = 'email-invalide';

    validateRegister(req, res, next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('retourne 400 si email est absent', () => {
    delete req.body.email;

    validateRegister(req, res, next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('retourne 400 si email dépasse 255 caractères', () => {
    req.body.email = 'a'.repeat(250) + '@test.com';

    validateRegister(req, res, next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('retourne 400 si le mot de passe est trop court', () => {
    req.body.password = '12345';

    validateRegister(req, res, next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('retourne 400 si le mot de passe est absent', () => {
    delete req.body.password;

    validateRegister(req, res, next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it('retourne 400 si le body est absent', () => {
    req.body = undefined;

    validateRegister(req, res, next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });

});
