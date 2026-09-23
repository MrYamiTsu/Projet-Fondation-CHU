# Base de projet Express.js

Un projet de départ en **JavaScript avec `import/export`**, Express 5 et des commentaires en français. Les routes, les contrôleurs et les middlewares sont séparés pour faciliter les premiers ajouts.

## 1. Démarrer

Installe **Node.js 22.9.0 ou une version supérieure** : <https://nodejs.org/fr/download>. Les scripts utilisent les fonctions intégrées de Node.js pour charger `.env` et redémarrer le serveur pendant le développement.

Extrais le ZIP, puis ouvre un terminal dans le dossier qui contient `package.json`.

```bash
npm install
npm run dev
```

Ouvre ensuite <http://localhost:3000> ou <http://localhost:3000/api>.

Pour arrêter le serveur : **Ctrl + C**.

| Commande | Rôle |
| --- | --- |
| `npm install` | Installe Express et ses dépendances dans `node_modules`. |
| `npm run dev` | Lance le serveur et le redémarre quand un fichier JavaScript importé change. |
| `npm start` | Lance le serveur sans redémarrage automatique. |
| `npm ci` | Réinstalle exactement les versions du `package-lock.json`. |

Le dossier `node_modules` n'est pas inclus dans le ZIP : `npm install` le crée. Garde `package-lock.json` dans Git pour partager les mêmes versions de dépendances.

## 2. Personnaliser le port (facultatif)

Le projet fonctionne par défaut sur le port **3000**, même sans `.env`. Node peut afficher un message indiquant que ce fichier est absent : le démarrage continue normalement.

Pour changer la configuration, copie `.env.example` vers `.env` :

**Windows PowerShell :**

```powershell
Copy-Item .env.example .env
```

**Linux ou macOS :**

```bash
cp .env.example .env
```

Modifie ensuite la valeur de `PORT` dans `.env`. Relance le serveur après un changement de ce fichier. Les variables déjà présentes dans ton terminal ont priorité sur celles de `.env`.

`.env` est ignoré par Git. Partage uniquement `.env.example`, avec des valeurs d'exemple. `NODE_ENV` est disponible pour Express et pour tes futurs ajouts ; `npm start` ne le change pas automatiquement.

## 3. Arborescence et rôle des fichiers

Tous les chemins ci-dessous sont relatifs au dossier `express-starter/`.

| Chemin | Rôle |
| --- | --- |
| `package.json` | Dépendances, scripts npm et activation des modules ES. |
| `package-lock.json` | Versions exactes des dépendances installées. |
| `.env.example` | Exemple de configuration à copier vers `.env`. |
| `.gitignore` | Fichiers et dossiers à exclure de Git. |
| `README.md` | Ce guide. |
| `requests.http` | Exemples de requêtes GET et POST. |
| `public/index.html` | Page d'accueil statique. Ajoute ici tes fichiers CSS, JavaScript de navigateur et images. |
| `src/server.js` | Lit le port et démarre le serveur HTTP. |
| `src/app.js` | Configure Express et branche les middlewares et les routes. |
| `src/routes/index.routes.js` | Associe une URL et une méthode HTTP à un contrôleur. |
| `src/controllers/index.controller.js` | Traite les requêtes et construit les réponses. |
| `src/middlewares/logger.js` | Affiche la méthode, le chemin, le statut et la durée d'une requête. |
| `src/middlewares/notFound.js` | Renvoie une réponse JSON 404 pour les routes inconnues. |
| `src/middlewares/errorHandler.js` | Renvoie une réponse JSON lorsqu'une erreur survient. |

`app.js` configure l'application. `server.js` ouvre le port réseau. Cette séparation permet aussi d'importer l'application sans démarrer automatiquement un serveur.

## 4. Routes disponibles

| Méthode | Chemin | Résultat |
| --- | --- | --- |
| GET | `/` | Page HTML d'accueil. |
| GET | `/api` | Message d'accueil et liste des routes. |
| GET | `/api/bonjour/Ariel` | `{ "message": "Bonjour Ariel !" }` |
| POST | `/api/messages` | Lit et valide le champ `texte`, puis le renvoie. |
| Toutes | Chemin inconnu | Réponse JSON avec statut 404. |

Le POST attend un objet JSON avec un champ `texte` non vide de 500 caractères maximum. Le message est seulement renvoyé au client ; aucune base de données n'est configurée et aucun message n'est conservé.

Dans **PowerShell**, avec le serveur démarré dans un autre terminal :

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/messages -Method Post -ContentType "application/json" -Body '{"texte":"Bonjour Express !"}'
```

Dans **Linux ou macOS** :

```bash
curl -X POST http://localhost:3000/api/messages -H 'Content-Type: application/json' -d '{"texte":"Bonjour Express !"}'
```

Réponse attendue :

```json
{
  "message": "Message reçu.",
  "donnees": {
    "texte": "Bonjour Express !"
  }
}
```

Tu peux également utiliser Postman, ou ouvrir `requests.http` dans un éditeur compatible avec ce format, par exemple VS Code avec l'extension REST Client.

## 5. Ajouter ta première route

Dans `src/controllers/index.controller.js`, ajoute :

```js
export function obtenirProfil(req, res) {
  res.json({ nom: 'Ariel', domaine: 'Informatique' });
}
```

Dans `src/routes/index.routes.js`, ajoute `obtenirProfil` à l'import des contrôleurs, puis cette ligne **avant** `export default router` :

```js
router.get('/profil', obtenirProfil);
```

L'adresse devient <http://localhost:3000/api/profil>, car `app.js` ajoute déjà le préfixe `/api`.

Pour une fonctionnalité plus importante, crée son propre fichier de routes et son contrôleur, par exemple `produits.routes.js` et `produits.controller.js`, puis branche le routeur dans `app.js`.

## 6. Repères utiles

- `req.params` contient les paramètres de chemin, comme `:nom`.
- `req.query` contient les paramètres après `?`, par exemple `?page=2`.
- `req.body` contient les données du corps après passage par `express.json()` ou `express.urlencoded()`.
- `res.json(...)` envoie une réponse JSON.
- `res.status(400).json(...)` indique une requête invalide.
- `next()` passe au middleware suivant. Après avoir envoyé une réponse finale, termine le contrôleur au lieu d'appeler `next()`.
- Le middleware 404 vient après les routes. Le middleware d'erreur vient en dernier et conserve ses quatre paramètres.
- En Express 5, une erreur levée par un contrôleur `async` est transmise au middleware d'erreur.
- Les imports locaux incluent l'extension `.js`. Le champ `"type": "module"` active cette syntaxe dans `package.json`.

Cette base sert une page et une API depuis la même adresse. Si tu ajoutes ensuite un frontend sur un autre port, configure CORS pour son origine. Les dossiers `models/`, `services/` et une connexion à une base de données pourront être ajoutés lorsque ton projet en aura besoin.

## 7. Dépannage rapide

| Message ou problème | Action |
| --- | --- |
| `node` ou `npm` non reconnu | Installe Node.js, puis rouvre le terminal. |
| `bad option: --env-file-if-exists` | Vérifie `node --version` et installe Node.js 22.9.0 ou supérieur. |
| `Cannot find package 'express'` | Exécute `npm install` dans le dossier contenant `package.json`. |
| Le port est déjà utilisé | Arrête l'autre serveur ou change `PORT` dans `.env`, puis relance. |
| Une modification HTML ne s'affiche pas | Recharge la page dans le navigateur. |
| Le POST renvoie 400 | Envoie un JSON valide avec `Content-Type: application/json` et un champ `texte` non vide. |

## Documentation officielle

- Installation d'Express : <https://expressjs.com/en/starter/installing/>
- Routage : <https://expressjs.com/en/guide/routing/>
- Gestion des erreurs : <https://expressjs.com/en/guide/error-handling/>
- Options de Node.js (`--watch`, `--env-file-if-exists`) : <https://nodejs.org/api/cli.html>
