import pool from '../db.mjs';

export async function findUserByEmail(email) {
  const requete = `
    SELECT id, email, password_hash, role
    FROM utilisateur
    WHERE LOWER(email) = LOWER($1)
  `;

  const result = await pool.query(requete, [email]);

  return result.rows[0];
}
export async function createUser(nom, prenom, email, passwordHash) {
  const requete = `
    INSERT INTO utilisateur (nom, prenom, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nom, prenom, email, role, actif, created_at, updated_at
  `;

  const result = await pool.query(requete, [
    nom,
    prenom,
    email,
    passwordHash
  ]);

  return result.rows[0];
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
    password.length < 12 
  ) {
    const erreur = new Error(
      "Le mot de passe doit contenir au moins 12 caractères."
    );
    erreur.status = 400;
    return next(erreur);
  }

  next();
}
