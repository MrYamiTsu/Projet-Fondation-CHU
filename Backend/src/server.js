import app from './app.js';

// Les scripts npm chargent .env si ce fichier existe.
const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT doit être un nombre entier entre 1 et 65535.');
  process.exit(1);
}

const server = app.listen(port, () => {
  console.log(`Serveur démarré : http://localhost:${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Le port ${port} est déjà utilisé. Modifie PORT dans .env.`);
  } else {
    console.error('Impossible de démarrer le serveur :', error.message);
  }

  process.exit(1);
});
