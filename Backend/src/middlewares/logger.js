export default function logger(req, res, next) {
  const debut = performance.now();

  res.on('finish', () => {
    const duree = Math.round(performance.now() - debut);
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duree} ms)`);
  });

  // Passe au middleware ou à la route suivante.
  next();
}
