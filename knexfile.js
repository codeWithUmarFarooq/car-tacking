import dotenv from 'dotenv';
dotenv.config();

/** @type {import('knex').Knex.Config} */
const config = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        },
        pool: {
            min: 2,
            max: 10,
            idleTimeoutMillis: 30000,
            acquireTimeoutMillis: 10000,
        },
        migrations: {
            directory: './db/migrations',
        },
        seeds: {
            directory: './db/seeds',
        },
    },
};

export default config;
