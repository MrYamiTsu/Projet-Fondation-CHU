import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ erreur: 'Méthode non autorisée' });
  }

  try {
    const { nom, prenom, email, password } = req.body || {};
    if (!email || !password || !nom) {
      return res.status(400).json({ erreur: 'Données manquantes' });
    }

    const checkReq = `SELECT id FROM utilisateur WHERE LOWER(email) = LOWER($1)`;
    const existant = await pool.query(checkReq, [email]);
    if (existant.rows.length > 0) {
      return res.status(409).json({ erreur: 'Cet utilisateur existe déjà.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const insertReq = `
      INSERT INTO utilisateur (nom, prenom, email, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nom, prenom, email, role, actif, created_at, updated_at
    `;
    const result = await pool.query(insertReq, [nom, prenom || '', email, passwordHash]);
    const nouvelUtilisateur = result.rows[0];

    const jwtSecret = process.env.JWT_SECRET || 'fondation_chu_secret_jwt_key_2026_super_secure';
    const token = jwt.sign(
      { id: nouvelUtilisateur.id, role: nouvelUtilisateur.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      data: {
        utilisateur: nouvelUtilisateur,
        token
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ erreur: "Erreur lors de l'inscription", details: err.message });
  }
}
