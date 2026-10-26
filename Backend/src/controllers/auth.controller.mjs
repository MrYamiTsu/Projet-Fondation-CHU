import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../models/auth.mjs';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const utilisateur = await findUserByEmail(email);

    if (!utilisateur) {
      const erreur = new Error("Identifiants invalides");
      erreur.status = 401;
      return next(erreur);
    }

    const passwordValid = await bcrypt.compare(
      password,
      utilisateur.password_hash
    );

    if (!passwordValid) {
      const erreur = new Error("Identifiants invalides");
      erreur.status = 401;
      return next(erreur);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET non configuré");
    }

    const token = jwt.sign(
      {
        id: utilisateur.id,
        role: utilisateur.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Connexion réussie",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        utilisateur: {
          id: utilisateur.id,
          email: utilisateur.email,
          role: utilisateur.role
        },
        token
      }
    });

  } catch (erreur) {
    return next(erreur);
  }
}

export async function register(req, res, next) {
  try {
    const { nom, prenom, email, password } = req.body;

    const existingUser = await findUserByEmail(email.trim());

    if (existingUser) {
      const erreur = new Error("Cette adresse email est déjà utilisée");
      erreur.status = 409;
      return next(erreur);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const utilisateur = await createUser(
      nom.trim(),
      prenom.trim(),
      email.trim().toLowerCase(),
      passwordHash
    );

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Compte créé avec succès",
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      data: {
        utilisateur
      }
    });

  } catch (erreur) {
    if (erreur.code === '23505') {
      const conflit = new Error("Cette adresse email est déjà utilisée");
      conflit.status = 409;
      return next(conflit);
    }

    return next(erreur);
  }
}