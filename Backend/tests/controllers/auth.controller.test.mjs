import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../../src/models/auth.mjs';
import { login, register } from '../../src/controllers/auth.controller.mjs';

vi.mock('../../src/models/auth.mjs', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn()
}));

vi.mock('bcrypt', () => ({
  default: { hash: vi.fn(), compare: vi.fn() }
}));

vi.mock('jsonwebtoken', () => ({
  default: { sign: vi.fn() }
}));

const identifiants = {
  email: 'jean.dupont@example.com',
  password: 'MotDePasse123!'
};
const formulaireInscription = { nom: 'Dupont', prenom: 'Jean', ...identifiants };
const motDePasseHache = 'hachage-de-test';
const secretJwt = 'secret-de-test';
const jetonSigne = 'jeton-de-test';

const profilPublic = { id: 1, email: identifiants.email, role: 'user' };
const utilisateurCree = { ...profilPublic, nom: 'Dupont', prenom: 'Jean', actif: true };
const utilisateurEnBase = { ...profilPublic, password_hash: motDePasseHache };

describe('auth.controller', () => {
  let requete;
  let reponse;
  let next;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('JWT_SECRET', secretJwt);
    reponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('register', () => {
    beforeEach(() => {
      requete = {
        body: { ...formulaireInscription },
        originalUrl: '/auth/register',
        method: 'POST'
      };
    });

    describe('quand l’inscription réussit', () => {
      beforeEach(async () => {
        findUserByEmail.mockResolvedValue(undefined);
        bcrypt.hash.mockResolvedValue(motDePasseHache);
        createUser.mockResolvedValue(utilisateurCree);

        await register(requete, reponse, next);
      });

      it('envoie le statut HTTP 201', () => {
        expect(reponse.status).toHaveBeenCalledWith(201);
      });

      it('indique le succès dans le corps de la réponse', () => {
        expect(reponse.json.mock.lastCall?.[0]?.success).toBe(true);
      });

      it('indique le code 201 dans le corps de la réponse', () => {
        expect(reponse.json.mock.lastCall?.[0]?.statusCode).toBe(201);
      });

      it('retourne l’utilisateur créé', () => {
        expect(reponse.json.mock.lastCall?.[0]?.data).toStrictEqual({ utilisateur: utilisateurCree });
      });

      it('termine la requête sans appeler next', () => {
        expect(next).not.toHaveBeenCalled();
      });

      it('recherche le compte avec le courriel fourni', () => {
        expect(findUserByEmail).toHaveBeenCalledWith(identifiants.email);
      });

      it('hache le mot de passe avec un coût de 12', () => {
        expect(bcrypt.hash).toHaveBeenCalledWith(identifiants.password, 12);
      });

      it('crée le compte avec le mot de passe haché', () => {
        expect(createUser).toHaveBeenCalledWith(
          formulaireInscription.nom,
          formulaireInscription.prenom,
          identifiants.email,
          motDePasseHache
        );
      });
    });

    describe('quand le courriel est déjà utilisé', () => {
      beforeEach(async () => {
        findUserByEmail.mockResolvedValue(utilisateurEnBase);

        await register(requete, reponse, next);
      });

      it('transmet une erreur 409 à next', () => {
        expect(next.mock.lastCall?.[0]?.status).toBe(409);
      });

      it('évite de créer un deuxième compte', () => {
        expect(createUser).not.toHaveBeenCalled();
      });

      it('laisse le middleware d’erreur envoyer la réponse', () => {
        expect(reponse.json).not.toHaveBeenCalled();
      });
    });

    describe('quand PostgreSQL signale un doublon', () => {
      beforeEach(async () => {
        const erreurDoublon = new Error('Courriel déjà utilisé');
        erreurDoublon.code = '23505';

        findUserByEmail.mockResolvedValue(undefined);
        bcrypt.hash.mockResolvedValue(motDePasseHache);
        createUser.mockRejectedValue(erreurDoublon);

        await register(requete, reponse, next);
      });

      it('transmet une erreur 409 à next', () => {
        expect(next.mock.lastCall?.[0]?.status).toBe(409);
      });

      it('laisse le middleware d’erreur envoyer la réponse', () => {
        expect(reponse.json).not.toHaveBeenCalled();
      });
    });

    describe('quand la recherche du compte échoue', () => {
      const erreurConnexion = new Error('Base de données indisponible');

      beforeEach(async () => {
        findUserByEmail.mockRejectedValue(erreurConnexion);

        await register(requete, reponse, next);
      });

      it('transmet l’erreur du modèle à next', () => {
        expect(next.mock.lastCall?.[0]).toBe(erreurConnexion);
      });

      it('laisse le middleware d’erreur envoyer la réponse', () => {
        expect(reponse.json).not.toHaveBeenCalled();
      });
    });
  });

  describe('login', () => {
    beforeEach(() => {
      requete = {
        body: { ...identifiants },
        originalUrl: '/auth/login',
        method: 'POST'
      };
    });

    describe('quand les identifiants sont valides', () => {
      beforeEach(async () => {
        findUserByEmail.mockResolvedValue(utilisateurEnBase);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue(jetonSigne);

        await login(requete, reponse, next);
      });

      it('envoie le statut HTTP 200', () => {
        expect(reponse.status).toHaveBeenCalledWith(200);
      });

      it('indique le succès dans le corps de la réponse', () => {
        expect(reponse.json.mock.lastCall?.[0]?.success).toBe(true);
      });

      it('indique le code 200 dans le corps de la réponse', () => {
        expect(reponse.json.mock.lastCall?.[0]?.statusCode).toBe(200);
      });

      it('retourne uniquement les champs publics de l’utilisateur', () => {
        expect(reponse.json.mock.lastCall?.[0]?.data?.utilisateur).toStrictEqual(profilPublic);
      });

      it('retourne le jeton signé', () => {
        expect(reponse.json.mock.lastCall?.[0]?.data?.token).toBe(jetonSigne);
      });

      it('termine la requête sans appeler next', () => {
        expect(next).not.toHaveBeenCalled();
      });

      it('compare le mot de passe fourni au hachage enregistré', () => {
        expect(bcrypt.compare).toHaveBeenCalledWith(identifiants.password, motDePasseHache);
      });

      it('signe un jeton valable une heure avec l’identifiant et le rôle du compte', () => {
        expect(jwt.sign).toHaveBeenCalledWith(
          { id: utilisateurEnBase.id, role: utilisateurEnBase.role },
          secretJwt,
          { expiresIn: '1h' }
        );
      });
    });

    describe('quand le courriel est inconnu', () => {
      beforeEach(async () => {
        findUserByEmail.mockResolvedValue(undefined);

        await login(requete, reponse, next);
      });

      it('transmet une erreur 401 à next', () => {
        expect(next.mock.lastCall?.[0]?.status).toBe(401);
      });

      it('évite la comparaison du mot de passe', () => {
        expect(bcrypt.compare).not.toHaveBeenCalled();
      });

      it('laisse le middleware d’erreur envoyer la réponse', () => {
        expect(reponse.json).not.toHaveBeenCalled();
      });
    });

    describe('quand le mot de passe est incorrect', () => {
      beforeEach(async () => {
        findUserByEmail.mockResolvedValue(utilisateurEnBase);
        bcrypt.compare.mockResolvedValue(false);

        await login(requete, reponse, next);
      });

      it('transmet une erreur 401 à next', () => {
        expect(next.mock.lastCall?.[0]?.status).toBe(401);
      });

      it('ne signe aucun jeton', () => {
        expect(jwt.sign).not.toHaveBeenCalled();
      });

      it('laisse le middleware d’erreur envoyer la réponse', () => {
        expect(reponse.json).not.toHaveBeenCalled();
      });
    });

    describe('quand la recherche du compte échoue', () => {
      const erreurConnexion = new Error('Base de données indisponible');

      beforeEach(async () => {
        findUserByEmail.mockRejectedValue(erreurConnexion);

        await login(requete, reponse, next);
      });

      it('transmet l’erreur du modèle à next', () => {
        expect(next.mock.lastCall?.[0]).toBe(erreurConnexion);
      });
    });

    describe('quand le secret JWT est absent', () => {
      beforeEach(async () => {
        findUserByEmail.mockResolvedValue(utilisateurEnBase);
        bcrypt.compare.mockResolvedValue(true);
        delete process.env.JWT_SECRET;

        await login(requete, reponse, next);
      });

      it('transmet une erreur à next', () => {
        expect(next.mock.lastCall?.[0]).toBeInstanceOf(Error);
      });

      it('ne signe aucun jeton', () => {
        expect(jwt.sign).not.toHaveBeenCalled();
      });
    });
  });
});