# Fondation CHU de Québec - Gestion des Espaces et Commandites

Plateforme web de consultation, de filtrage et d'administration des opportunités de toponymie et de commandite pour les établissements hospitaliers du CHU de Québec-Université Laval (CHUL, NCH, HSFA, HSS).

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation et démarrage](#installation-et-démarrage)
  - [Variables d'environnement](#variables-denvironnement)
  - [Lancement en local](#lancement-en-local)
  - [Lancement avec Docker](#lancement-avec-docker)
- [Base de données](#base-de-données)
- [Scripts npm](#scripts-npm)
- [Tests](#tests)
- [Déploiement](#déploiement)

## Fonctionnalités

- **Carte et sites hospitaliers** : Sélection visuelle des établissements et filtrage des espaces associés.
- **Moteur de recherche et filtres** : Recherche textuelle, tri par secteur, disponibilité et plage de prix, avec synchronisation de l'URL via l'API History sans rechargement ni saut de page.
- **Fiches d'espaces** : Affichage des caractéristiques (dimensions, superficie ajustée, achalandage, valeur sur 15 ans, statut).
- **Réservation** : Formulaire de demande de réservation avec aperçu et téléversement d'image.
- **Gestion des comptes** : Authentification par jeton JWT, hachage des mots de passe avec bcrypt, et contrôle d'accès basé sur les rôles (utilisateur et administrateur).
- **Administration** : Interface de gestion du catalogue d'emplacements (ajout, édition, suppression).

## Stack technique

- **Client** : Vue 3 (Composition API), Pinia, Vue Router, Tailwind CSS v4, FontAwesome, Vite.
- **Serveur** : Node.js, Express 5, jsonwebtoken, bcrypt, pg (node-postgres).
- **Base de données** : PostgreSQL 16 (local ou Neon Database).
- **Fonctions serverless** : Endpoints situés dans `client/api/` pour l'hébergement Vercel.
- **Tests** : Vitest, Supertest.
- **Conteneurisation** : Docker, Docker Compose.

## Structure du projet

```text
.
├── Backend/
│   ├── bd/                     # Schéma SQL et données initiales
│   │   ├── creation_bd.sql
│   │   └── seed.sql
│   ├── src/
│   │   ├── controllers/        # Contrôleurs Express (auth, emplacements)
│   │   ├── middlewares/        # Validation et vérification des jetons
│   │   ├── models/             # Requêtes SQL
│   │   ├── routes/             # Définition des routes API
│   │   ├── db.mjs              # Configuration du pool PostgreSQL
│   │   └── server.mjs          # Point d'entrée de l'API
│   ├── tests/                  # Tests unitaires et d'intégration
│   └── package.json
├── client/
│   ├── api/                    # Endpoints serverless pour Vercel
│   │   ├── auth/
│   │   ├── emplacements/
│   │   └── _db.js
│   ├── src/
│   │   ├── components/         # Composants d'interface réutilisables
│   │   ├── router/             # Définition des routes et gestion du défilement
│   │   ├── stores/             # Stores Pinia (auth, plots)
│   │   └── views/              # Pages principales (Home, Détail, Réservation, Admin)
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── package.json                # Scripts d'orchestration racine
└── README.md
```

## Prérequis

- Node.js 22.x ou version supérieure
- npm 10.x ou version supérieure
- PostgreSQL 16 (ou accès à une instance Neon)
- Docker et Docker Compose (optionnel)

## Installation et démarrage

### Variables d'environnement

Créer un fichier `.env` à la racine du projet à partir de `.env.example` :

```env
# Base de données (PostgreSQL local ou URL Neon)
DATABASE_URL=
PGHOST=localhost
PGPORT=5432
PGDATABASE=projet_integrateur
PGUSER=postgres
PGPASSWORD=postgres

# Authentification
JWT_SECRET=cle_secrete_jwt_a_modifier

# Serveur et client
PORT=3000
VITE_API_URL=http://localhost:3000
```

### Lancement en local

1. Installer les dépendances du projet et du backend :

```bash
npm install
npm --prefix Backend install
```

2. Démarrer simultanément le client et l'API :

```bash
npm run dev
```

- Client : http://localhost:5173
- API Express : http://localhost:3000

### Lancement avec Docker

Pour démarrer l'ensemble des services (PostgreSQL, API et client) :

```bash
docker compose up --build
```

## Base de données

Les scripts d'initialisation se trouvent dans `Backend/bd/` :

- `creation_bd.sql` : création des tables (`Hopital`, `FL`, `FF`, `Emplacement`, `Achalandage`, `Utilisateur`).
- `seed.sql` : insertion des données initiales.

Exécution manuelle avec `psql` :

```bash
psql -U postgres -d projet_integrateur -f Backend/bd/creation_bd.sql
psql -U postgres -d projet_integrateur -f Backend/bd/seed.sql
```

## Scripts npm

Commandes à la racine :

- `npm run dev` : lance le serveur et le client en parallèle avec rechargement à chaud.
- `npm run client:dev` : lance uniquement le client Vite.
- `npm run server:dev` : lance uniquement le serveur Express en mode surveillance (`--watch`).
- `npm run build` : compile le client pour la production dans le dossier `dist/`.
- `npm run start` : lance le serveur Express et le client.

Commandes pour le backend (`Backend/`) :

- `npm --prefix Backend run test` : exécute Vitest en mode interactif.
- `npm --prefix Backend run test:run` : exécute tous les tests une seule fois.
- `npm --prefix Backend run coverage` : génère le rapport de couverture de code.

## Tests

La suite de tests automatisés couvre les routes d'authentification, les middlewares de protection et la gestion des emplacements :

```bash
npm --prefix Backend run test:run
```

## Déploiement

Le projet est configuré pour un déploiement sur Vercel :

- Le build client est géré par Vite (`npm run build`).
- Les requêtes sous `/api/*` sont traitées par les fonctions serverless dans `client/api/`.
- La variable `DATABASE_URL` doit être configurée dans les paramètres d'environnement de Vercel pour les environnements de production et de prévisualisation (Preview).
