import app from './app.mjs';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST || '0.0.0.0';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT doit être un nombre entier entre 1 et 65535.');
  process.exit(1);
}

const server = app.listen(port, host, () => {
  console.log(`Serveur démarré : http://${host}:${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Le port ${port} est déjà utilisé. Modifie PORT dans .env.`);
  } else {
    console.error('Impossible de démarrer le serveur :', error.message);
  }

  process.exit(1);
});
