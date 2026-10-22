export function validateLogin(req, res, next) {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== 'string' ||
    email.trim() === '' ||
    typeof password !== 'string' ||
    password === ''
  ) {
    const erreur = new Error(
      "Email et mot de passe obligatoires"
    );
    erreur.status = 400;
    return next(erreur);
  }

  next();
}
import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const erreur = new Error("Utilisateur non authentifié");
    erreur.status = 401;
    return next(erreur);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (erreur) {
    const authErreur = new Error("Token invalide ou expiré");
    authErreur.status = 401;
    return next(authErreur);
  }
}
export function requireAdmin(req, res, next) {
  if (!req.user) {
    const erreur = new Error("Utilisateur non authentifié");
    erreur.status = 401;
    return next(erreur);
  }

  if (req.user.role !== 'admin') {
    const erreur = new Error(
      "Accès refusé : droits administrateur requis"
    );
    erreur.status = 403;
    return next(erreur);
  }

  return next();
}


export function validateRegister(req, res, next) {
  const { nom, prenom, email, password } = req.body ?? {};

  if (
    typeof nom !== 'string' ||
    nom.trim() === '' ||
    nom.length > 100 ||
    typeof prenom !== 'string' ||
    prenom.trim() === '' ||
    prenom.length > 100
  ) {
    const erreur = new Error("Nom ou prénom invalide");
    erreur.status = 400;
    return next(erreur);
  }

  if (
    typeof email !== 'string' ||
    email.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    const erreur = new Error("Adresse email invalide");
    erreur.status = 400;
    return next(erreur);
  }

  if (
    typeof password !== 'string' ||
    password.length < 8
  ) {
    const erreur = new Error(
      "Le mot de passe doit contenir au moins 8 caractères."
    );
    erreur.status = 400;
    return next(erreur);
  }

  next();
}
