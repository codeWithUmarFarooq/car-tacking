const express = require('express');
const cors = require('cors');
const net = require('net');
const { parsePacket } = require('./utils/parser');
const { saveLog } = require('./services/logService');

const TCP_PORT = 5000;
const API_PORT = 3000;

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

// 🚀 Test API
app.get('/api/test', (req, res) => {
    res.json({ message: '🚀 API is working!' });
});

// ✅ Start HTTP API Server
app.listen(API_PORT, () => {
    console.log(`✅ HTTP API server running on port ${API_PORT}`);
});

// 📡 Start TCP Server
const tcpServer = net.createServer(socket => {
    console.log('📡 Tracker connected');

    let buffer = '';

    socket.on('data', data => {
        const raw = data.toString();

        // 🌐 Ignore HTTP browser requests
        if (raw.startsWith('GET /') || raw.includes('HTTP/1.1')) {
            console.log('🌐 Ignoring HTTP request');
            return;
        }

        buffer += raw;
        console.log('📨 Data chunk received:', buffer);

        // 🔄 Process multiple messages
        let startIndex = buffer.indexOf('#');
        while (startIndex !== -1) {
            const endIndex = buffer.indexOf('##', startIndex);
            if (endIndex === -1) break;

            const fullMessage = buffer.slice(startIndex, endIndex + 2);
            buffer = buffer.slice(endIndex + 2);

            console.log('✅ Full packet received:', fullMessage);

           const parsed = parsePacket(fullMessage);
if (parsed) {
    console.table({
        IMEI: parsed.imei,
        Model: parsed.model,
        Password: parsed.password,
        Status: parsed.status,
        Fix: parsed.fixValue,
        Latitude: parsed.gps.latitude,
        Longitude: parsed.gps.longitude,
        UTC_Time: parsed.gps.utcTime,
        Date: parsed.gps.date,
    });

    saveLog(parsed); // Save or store the raw + structured data
}

            startIndex = buffer.indexOf('#');
        }
    });

    socket.on('end', () => {
        console.log('❌ Tracker disconnected');
    });

    socket.on('error', err => {
        console.error('💥 Socket error:', err.message);
    });
});

tcpServer.listen(TCP_PORT, () => {
    console.log(`✅ TCP server listening on port ${TCP_PORT}`);
});
