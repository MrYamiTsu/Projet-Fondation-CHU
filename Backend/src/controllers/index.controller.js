export function accueilApi(req, res) {
  res.json({
    message: 'Bienvenue dans ton API Express !',
    routes: [
      'GET /api',
      'GET /api/bonjour/:nom',
      'POST /api/messages',
    ],
  });
}

export function direBonjour(req, res) {
  // Un paramètre de l'URL se récupère dans req.params.
  const { nom } = req.params;
  res.json({ message: `Bonjour ${nom} !` });
}

export function recevoirMessage(req, res) {
  // Le corps JSON devient accessible grâce à express.json() dans app.js.
  const texte = req.body?.texte;

  if (typeof texte !== 'string' || texte.trim().length === 0) {
    return res.status(400).json({
      erreur: 'Le champ "texte" doit être une chaîne non vide.',
    });
  }

  if (texte.trim().length > 500) {
    return res.status(400).json({
      erreur: 'Le champ "texte" doit contenir au maximum 500 caractères.',
    });
  }

  // Cet exemple renvoie le message reçu sans l'enregistrer.
  return res.json({
    message: 'Message reçu.',
    donnees: { texte: texte.trim() },
  });
}
