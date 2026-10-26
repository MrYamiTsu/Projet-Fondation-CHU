import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../../Backend/src/models/auth.mjs';

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
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ erreur: 'Identifiants invalides' });
    }

    const utilisateur = await findUserByEmail(email);
    if (!utilisateur) {
      return res.status(401).json({ erreur: 'Identifiants invalides' });
    }

    const passwordValid = await bcrypt.compare(password, utilisateur.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ erreur: 'Identifiants invalides' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fondation_chu_secret_jwt_key_2026_super_secure';
    const token = jwt.sign(
      { id: utilisateur.id, role: utilisateur.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      data: {
        utilisateur: {
          id: utilisateur.id,
          email: utilisateur.email,
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          role: utilisateur.role
        },
        token
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ erreur: 'Erreur lors de la connexion', details: err.message });
  }
}
