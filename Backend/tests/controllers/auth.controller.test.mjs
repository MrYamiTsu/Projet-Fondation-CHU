import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  createUser,
  deleteUser as deleteUserRepository,
  findUserByEmail,
  updateProfile as updateProfileRepository
} from '../../src/models/auth.mjs';
import * as AuthController from '../../src/controllers/auth.controller.mjs';

vi.mock('../../src/models/auth.mjs', () => ({
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
  updateProfile: vi.fn(),
  deleteUser: vi.fn()
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

        await AuthController.register(requete, reponse, next);
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

        await AuthController.register(requete, reponse, next);
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

        await AuthController.register(requete, reponse, next);
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

        await AuthController.register(requete, reponse, next);
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

        await AuthController.login(requete, reponse, next);
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

        await AuthController.login(requete, reponse, next);
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

        await AuthController.login(requete, reponse, next);
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

        await AuthController.login(requete, reponse, next);
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

        await AuthController.login(requete, reponse, next);
      });

      it('transmet une erreur à next', () => {
        expect(next.mock.lastCall?.[0]).toBeInstanceOf(Error);
      });

      it('ne signe aucun jeton', () => {
        expect(jwt.sign).not.toHaveBeenCalled();
      });
    });
  });

  describe('updateProfile', () => {
    const donneesModification = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@example.com',
      password: 'NouveauMotDePasse456!'
    };
    const utilisateurModifie = {
      id: 1,
      nom: donneesModification.nom,
      prenom: donneesModification.prenom,
      email: donneesModification.email,
      role: 'user'
    };

    beforeEach(() => {
      requete = {
        user: { id: 1 },
        body: { ...donneesModification },
        originalUrl: '/auth/profile',
        method: 'PUT'
      };
    });

    describe('quand tous les paramètres sont valides, la modification réussit', () => {
      beforeEach(async () => {
        findUserByEmail.mockResolvedValue(undefined);
        bcrypt.hash.mockResolvedValue(motDePasseHache);
        updateProfileRepository.mockResolvedValue(utilisateurModifie);

        await AuthController.updateProfile(requete, reponse, next);
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

      it('retourne l’utilisateur modifié', () => {
        expect(reponse.json.mock.lastCall?.[0]?.data).toStrictEqual({ utilisateur: utilisateurModifie });
      });

      it('termine la requête sans appeler next', () => {
        expect(next).not.toHaveBeenCalled();
      });

      it('recherche le compte avec le courriel fourni', () => {
        expect(findUserByEmail).toHaveBeenCalledWith(donneesModification.email);
      });

      it('hache le nouveau mot de passe avec un coût de 12', () => {
        expect(bcrypt.hash).toHaveBeenCalledWith(donneesModification.password, 12);
      });

      it('met à jour le compte de l’utilisateur connecté avec le mot de passe haché', () => {
        expect(updateProfileRepository).toHaveBeenCalledWith(
          1,
          donneesModification.nom,
          donneesModification.prenom,
          donneesModification.email,
          motDePasseHache
        );
      });
    });

    describe('quand les champs contiennent des espaces superflus', () => {
      beforeEach(async () => {
        requete.body = {
          nom: '  Dupont ',
          prenom: ' Jean  ',
          email: '  jean.dupont@example.com ',
          password: donneesModification.password
        };
        findUserByEmail.mockResolvedValue(undefined);
        bcrypt.hash.mockResolvedValue(motDePasseHache);
        updateProfileRepository.mockResolvedValue(utilisateurModifie);

        await AuthController.updateProfile(requete, reponse, next);
      });

      it('recherche le compte avec le courriel nettoyé', () => {
        expect(findUserByEmail).toHaveBeenCalledWith(donneesModification.email);
      });

      it('enregistre le nom, le prénom et le courriel nettoyés', () => {
        expect(updateProfileRepository).toHaveBeenCalledWith(
          1,
          donneesModification.nom,
          donneesModification.prenom,
          donneesModification.email,
          motDePasseHache
        );
      });
    });

    describe('quand le courriel appartient déjà à l’utilisateur connecté', () => {
      beforeEach(async () => {
        findUserByEmail.mockResolvedValue({ ...utilisateurEnBase, id: 1 });
        bcrypt.hash.mockResolvedValue(motDePasseHache);
        updateProfileRepository.mockResolvedValue(utilisateurModifie);

        await AuthController.updateProfile(requete, reponse, next);
      });

      it('envoie le statut HTTP 200', () => {
        expect(reponse.status).toHaveBeenCalledWith(200);
      });

      it('termine la requête sans appeler next', () => {
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('quand le courriel est déjà utilisé par un autre utilisateur', () => {
      beforeEach(async () => {
        findUserByEmail.mockResolvedValue({ ...utilisateurEnBase, id: 2 });

        await AuthController.updateProfile(requete, reponse, next);
      });

      it('transmet une erreur 409 à next', () => {
        expect(next.mock.lastCall?.[0]?.status).toBe(409);
      });

      it('évite de modifier le compte', () => {
        expect(updateProfileRepository).not.toHaveBeenCalled();
      });

      it('évite de hacher le mot de passe', () => {
        expect(bcrypt.hash).not.toHaveBeenCalled();
      });

      it('laisse le middleware d’erreur envoyer la réponse', () => {
        expect(reponse.json).not.toHaveBeenCalled();
      });
    });

    describe.each([
      ['absent', undefined],
      ['vide', '']
    ])('quand un paramètre est %s', (_etat, valeur) => {
      describe.each(['nom', 'prenom', 'password'])('le champ %s', (champ) => {
        beforeEach(async () => {
          requete.body[champ] = valeur;
          findUserByEmail.mockResolvedValue(undefined);

          await AuthController.updateProfile(requete, reponse, next);
        });

        it('transmet une erreur 400 à next', () => {
          expect(next.mock.lastCall?.[0]?.status).toBe(400);
        });

        it('évite de hacher le mot de passe', () => {
          expect(bcrypt.hash).not.toHaveBeenCalled();
        });

        it('évite de modifier le compte', () => {
          expect(updateProfileRepository).not.toHaveBeenCalled();
        });

        it('laisse le middleware d’erreur envoyer la réponse', () => {
          expect(reponse.json).not.toHaveBeenCalled();
        });
      });
    });

    describe('quand le courriel est invalide', () => {
      describe('parce qu’il est absent', () => {
        beforeEach(async () => {
          delete requete.body.email;

          await AuthController.updateProfile(requete, reponse, next);
        });

        it('transmet une erreur à next', () => {
          expect(next.mock.lastCall?.[0]).toBeInstanceOf(Error);
        });

        it('évite de modifier le compte', () => {
          expect(updateProfileRepository).not.toHaveBeenCalled();
        });
      });

      // Le service ne valide pas le format du courriel (probablement fait dans un middleware de validation).
      it.todo('rejette un courriel mal formé avec une erreur 400');
    });

    describe('quand le mot de passe est invalide', () => {
      // Le service ne vérifie que la présence du mot de passe (testée plus haut), pas sa complexité ni sa longueur.
      it.todo('rejette un mot de passe qui ne respecte pas les règles avec une erreur 400');
    });

    describe('quand la base de données échoue', () => {
      const erreurConnexion = new Error('Base de données indisponible');

      describe('pendant la recherche du courriel', () => {
        beforeEach(async () => {
          findUserByEmail.mockRejectedValue(erreurConnexion);

          await AuthController.updateProfile(requete, reponse, next);
        });

        it('transmet l’erreur du modèle à next', () => {
          expect(next.mock.lastCall?.[0]).toBe(erreurConnexion);
        });

        it('laisse le middleware d’erreur envoyer la réponse', () => {
          expect(reponse.json).not.toHaveBeenCalled();
        });
      });

      describe('pendant la mise à jour du compte', () => {
        beforeEach(async () => {
          findUserByEmail.mockResolvedValue(undefined);
          bcrypt.hash.mockResolvedValue(motDePasseHache);
          updateProfileRepository.mockRejectedValue(erreurConnexion);

          await AuthController.updateProfile(requete, reponse, next);
        });

        it('transmet l’erreur du modèle à next', () => {
          expect(next.mock.lastCall?.[0]).toBe(erreurConnexion);
        });

        it('laisse le middleware d’erreur envoyer la réponse', () => {
          expect(reponse.json).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('deleteUser', () => {
    const utilisateurSupprime = { ...profilPublic, nom: 'Dupont', prenom: 'Jean' };

    beforeEach(() => {
      requete = {
        user: { id: 1 },
        originalUrl: '/auth/profile',
        method: 'DELETE'
      };
    });

    describe('quand le compte existe, la suppression réussit', () => {
      beforeEach(async () => {
        deleteUserRepository.mockResolvedValue(utilisateurSupprime);

        await AuthController.deleteUser(requete, reponse, next);
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

      it('retourne l’utilisateur supprimé', () => {
        expect(reponse.json.mock.lastCall?.[0]?.data).toStrictEqual({ utilisateur: utilisateurSupprime });
      });

      it('termine la requête sans appeler next', () => {
        expect(next).not.toHaveBeenCalled();
      });

      it('supprime le compte de l’utilisateur connecté', () => {
        expect(deleteUserRepository).toHaveBeenCalledWith(1);
      });
    });

    describe.each([
      ['une chaîne de caractères', '1'],
      ['zéro', 0],
      ['un nombre négatif', -5],
      ['un nombre décimal', 1.5],
      ['une valeur absente', undefined]
    ])('quand l’identifiant est %s', (_description, idInvalide) => {
      beforeEach(async () => {
        requete.user.id = idInvalide;

        await AuthController.deleteUser(requete, reponse, next);
      });

      it('transmet une erreur 400 à next', () => {
        expect(next.mock.lastCall?.[0]?.status).toBe(400);
      });

      it('évite de supprimer un compte', () => {
        expect(deleteUserRepository).not.toHaveBeenCalled();
      });

      it('laisse le middleware d’erreur envoyer la réponse', () => {
        expect(reponse.json).not.toHaveBeenCalled();
      });
    });

    describe('quand la base de données échoue', () => {
      const erreurConnexion = new Error('Base de données indisponible');

      beforeEach(async () => {
        deleteUserRepository.mockRejectedValue(erreurConnexion);

        await AuthController.deleteUser(requete, reponse, next);
      });

      it('transmet l’erreur du modèle à next', () => {
        expect(next.mock.lastCall?.[0]).toBe(erreurConnexion);
      });

      it('laisse le middleware d’erreur envoyer la réponse', () => {
        expect(reponse.json).not.toHaveBeenCalled();
      });
    });
  });
});