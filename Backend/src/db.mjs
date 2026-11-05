import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

// Charger le fichier .env à la racine du projet
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
dotenv.config();

const { Pool } = pg;

// Supporte Neon, Vercel Postgres, Supabase, ou variables PG* en local
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || 'projet_integrateur',
      user: process.env.PGUSER || 'postgres',
      password: String(process.env.PGPASSWORD || 'postgres'),
    };

const pool = new Pool(poolConfig);

pool.on('error', (error) => {
  console.error('Erreur de connexion PostgreSQL :', error.message);
});

export default pool;
