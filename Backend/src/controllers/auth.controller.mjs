import * as authService from '../services/auth.service.mjs';
import { envoyerSucces } from '../utils/reponse.mjs';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const { utilisateur, token } = await authService.login(email, password);

    return envoyerSucces(req, res, 200, 'Connexion réussie', { utilisateur, token });
  } catch (erreur) {
    return next(erreur);
  }
}

export async function register(req, res, next) {
  try {
    const { nom, prenom, email, password } = req.body;

    const utilisateur = await authService.register({ nom, prenom, email, password });

    return envoyerSucces(req, res, 201, 'Compte créé avec succès', { utilisateur });
  } catch (erreur) {
    return next(erreur);
  }
}
