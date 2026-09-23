// Express reconnaît ce middleware à ses quatre paramètres : il doit rester en dernier.
export default function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
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
    message = 'Le corps de la requête est trop volumineux (maximum : 100 Ko).';
  }

  return res.status(status).json({ erreur: message });
}
