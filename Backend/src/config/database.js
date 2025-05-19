import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'variedades_karamelito',
    password: 'admin',
    port: 5432,
});

pool.on('connect', () => {
    console.log('Conexión exitosa a PostgreSQL');
});

pool.on('error', (err) => {
    console.error('Error en la conexión a PostgreSQL:', err);
});

const connectDatabase = () => pool.connect();

export { pool, connectDatabase };