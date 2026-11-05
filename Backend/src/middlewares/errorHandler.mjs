export default function errorHandler(error, req, res, next) {
    if (res.headersSent) {
    return next(error);
  }

  const isDbDown = error.code === 'ECONNREFUSED' || (Array.isArray(error.errors) && error.errors.some((e) => e.code === 'ECONNREFUSED'));
  if (isDbDown) {
    console.warn('[SERVER] Connexion refusee : Impossible de joindre PostgreSQL sur le port 5432.');
    return res.status(503).json({
      success: false,
      erreur: 'Base de données PostgreSQL inaccessible (port 5432). Vérifiez que PostgreSQL est démarré.',
      code: 'DB_UNAVAILABLE'
    });
  }

  const status = Number.isInteger(error.status)
    && error.status >= 400
    && error.status <= 599
    ? error.status
    : 500;

  if (status >= 500) {
    console.error(error);
  }

  let message = status >= 500
    ? 'Une erreur interne est survenue.'
    : error.message || 'Requête invalide.';

  if (error.type === 'entity.parse.failed') {
    message = 'Le corps de la requête contient un JSON invalide.';
  } else if (error.type === 'entity.too.large') {
    message = 'Le corps de la requête est trop volumineux (maximum : 1Mb).';
  }

  return res.status(status).json({ erreur: message });
}
