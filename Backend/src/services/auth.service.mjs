import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as AuthRepository from '../repository/auth.repository.mjs';

const BCRYPT_ROUNDS = 12;
const TOKEN_EXPIRATION = '1h';
const MESSAGE_EMAIL_UTILISE = 'Cette adresse email est déjà utilisée';

function creerErreur(message, status) {
  const erreur = new Error(message);
  erreur.status = status;
  return erreur;
}

function genererToken(utilisateur) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET non configuré');
  }

  return jwt.sign(
    { id: utilisateur.id, role: utilisateur.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRATION }
  );
}

export async function login(email, password) {
  const utilisateur = await AuthRepository.findUserByEmail(email);

  if (!utilisateur) {
    throw creerErreur('Identifiants invalides', 401);
  }

  const motDePasseValide = await bcrypt.compare(password, utilisateur.password_hash);

  if (!motDePasseValide) {
    throw creerErreur('Identifiants invalides', 401);
  }

  return {
    utilisateur: {
      id: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role
    },
    token: genererToken(utilisateur)
  };
}

export async function register({ nom, prenom, email, password }) {
  const emailNettoye = email.trim();

  const utilisateurExistant = await AuthRepository.findUserByEmail(emailNettoye);

  if (utilisateurExistant) {
    throw creerErreur(MESSAGE_EMAIL_UTILISE, 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    return await AuthRepository.createUser(
      nom.trim(),
      prenom.trim(),
      emailNettoye.toLowerCase(),
      passwordHash
    );
  } catch (erreur) {
    if (erreur.code === '23505') {
      throw creerErreur(MESSAGE_EMAIL_UTILISE, 409);
    }
    throw erreur;
  }
}

export async function updateProfile(userId, { nom, prenom, email, password }) {
  const utilisateurExistant = await AuthRepository.findUserByEmail(email.trim());

  if (utilisateurExistant && utilisateurExistant.id !== userId) {
    throw creerErreur(MESSAGE_EMAIL_UTILISE, 409);
  }

  if (!nom || !prenom || !email || !password) {
    throw creerErreur('Tous les champs sont requis', 400);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  return await AuthRepository.updateProfile(userId, nom.trim(), prenom.trim(), email.trim(), passwordHash);
}

export async function deleteUser(userId) {

  if (typeof userId !== 'number' || !Number.isInteger(userId) || userId <= 0) {
    throw creerErreur('Veuillez fournir un id d\'utilisateur entier positif valide', 400);
  }

  return await AuthRepository.deleteUser(userId);
}
