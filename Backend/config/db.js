import dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
.then(() => console.log('connected to the database'))
.catch(err => console.error('database connection error',err))


export default pool;