import pool from '../db.mjs';

export async function findUserByEmail(email) {
  const requete = `
    SELECT id, nom, prenom, email, password_hash, role, actif
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
    passwordHash,
  ]);

  return result.rows[0];
}
