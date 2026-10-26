import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../../Backend/src/models/auth.mjs';

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

    const existant = await findUserByEmail(email);
    if (existant) {
      return res.status(409).json({ erreur: 'Cet utilisateur existe déjà.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nouvelUtilisateur = await createUser(nom, prenom || '', email, passwordHash);

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
