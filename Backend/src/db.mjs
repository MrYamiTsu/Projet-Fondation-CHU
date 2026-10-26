import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
  database: process.env.PGDATABASE || process.env.DB_NAME || 'projet_integrateur',
  user: process.env.PGUSER || process.env.DB_USER || 'postgres',
  password: String(process.env.PGPASSWORD || process.env.DB_PASSWORD || 'postgres')
});

pool.on('error', (error) => {
  console.error('Erreur de connexion PostgreSQL :', error.message);
});

export default pool;
