import jwt from 'jsonwebtoken';

// Même valeur de repli que api/auth/login.js et api/auth/register.js,
// sinon les jetons signés à la connexion ne seraient pas vérifiables ici.
const JWT_SECRET_PAR_DEFAUT = 'fondation_chu_secret_jwt_key_2026_super_secure';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function setCors(res, methods) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', `${methods}, OPTIONS`);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function sendSuccess(req, res, statusCode, message, data) {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
    data,
  });
}

export function sendError(res, err) {
  const status =
    Number.isInteger(err?.status) && err.status >= 400 && err.status <= 599 ? err.status : 500;

  if (status >= 500) {
    console.error(err);
  }

  const message = status >= 500 ? 'Une erreur interne est survenue.' : err.message;
  return res.status(status).json({ success: false, message, erreur: message });
}

export function authenticate(req) {
  const header = req.headers?.authorization || '';

  if (!header.startsWith('Bearer ')) {
    throw new HttpError(401, 'Utilisateur non authentifié');
  }

  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET || JWT_SECRET_PAR_DEFAUT);
  } catch {
    throw new HttpError(401, 'Token invalide ou expiré');
  }
}

export function requireAdmin(req) {
  const user = authenticate(req);

  if (user.role !== 'admin') {
    throw new HttpError(403, 'Accès refusé : droits administrateur requis');
  }

  return user;
}

export function parseId(value, message) {
  const nombre = Number(value);

  if (value == null || String(value).trim() === '' || !Number.isSafeInteger(nombre) || nombre <= 0) {
    throw new HttpError(400, message);
  }

  return nombre;
}

// Segments du chemin passés par la réécriture de vercel.json (?route=a/b/c).
export function routeSegments(req) {
  const brut = req.query?.route;
  const valeur = Array.isArray(brut) ? brut.join('/') : brut || '';
  return String(valeur).split('/').filter(Boolean);
}
