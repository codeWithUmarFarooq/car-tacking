import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { tcpServer } from './utils/data.js';
import db from './config/db.js';
import router from './routes/index.js';
// import knex from 'knex';

// import knex from '';
const TCP_PORT = 5000;
const API_PORT = 3000;

const app = express();
dotenv.config()
app.use(express.json());
app.use(cors({ origin: '*' }));
// console.log(process.env.DB_HOST)
// 🚀 Test API
app.get('/api/test', (req, res) => {
    res.json({ message: '🚀 API is working!' });
});
app.get('/api/logs', async (req, res) => {
    const logs = await db('logs').select('*').orderBy('id', 'desc').limit(100);
    res.json(logs);
});
app.use("/api/v1", router)
app.use((req, res) => {
    res
        .status(404)
        .json({ status: 404, success: false, message: "Route not found" });
});

// ✅ Start HTTP API Server
app.listen(API_PORT, () => {
    console.log(`✅ HTTP API server running on port ${API_PORT}`);
});



tcpServer.listen(TCP_PORT, () => {
    console.log(`✅ TCP server listening on port ${TCP_PORT}`);
});
