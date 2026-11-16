import pg from 'pg';

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || 'projet_integrateur',
      user: process.env.PGUSER || 'postgres',
      password: String(process.env.PGPASSWORD || 'postgres'),
    });

export default pool;
