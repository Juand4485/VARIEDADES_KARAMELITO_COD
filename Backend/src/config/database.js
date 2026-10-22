import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Se carga desde Backend aunque se inicie desde otra carpeta.
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

if (!process.env.PG_PASSWORD) {
    throw new Error('Completa PG_PASSWORD en Backend/.env antes de iniciar.');
}
const port = Number(process.env.PG_PORT || 5432);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PG_PORT debe ser un puerto valido.');
}
const pool = new Pool({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'variedades_karamelito',
    password: process.env.PG_PASSWORD,
    port,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('Error de conexion a PostgreSQL. Codigo:', err.code || 'CONEXION');
});

// query devuelve la conexion al pool al terminar la comprobacion.
const connectDatabase = () => pool.query('SELECT 1');
export { pool, connectDatabase };
