const express = require('express');
const cors = require('cors');
const net = require('net');
const { parsePacket } = require('./utils/parser');
const { saveLog } = require('./services/logService');

const PORT = 5000;
const API_PORT = 3000;

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

// 🧪 Test API
app.get('/api/test', (req, res) => {
    res.json({ message: '🚀 API is working!' });
});

// 🚀 Start HTTP API Server
app.listen(API_PORT, () => {
    console.log(`✅ HTTP API server running on port ${API_PORT}`);
});

// 📡 Start TCP Server
const server = net.createServer(socket => {
    console.log('📡 Tracker connected');

    let buffer = '';

    socket.on('data', data => {
        buffer += data.toString(); // plain string, not hex
        console.log('📨 Data chunk received:', buffer);

        let startIndex = buffer.indexOf('#');
        while (startIndex !== -1) {
            const endIndex = buffer.indexOf('##', startIndex);
            if (endIndex === -1) break; // incomplete message

            const fullMessage = buffer.slice(startIndex, endIndex + 2); // include ##
            buffer = buffer.slice(endIndex + 2); // trim processed message

            console.log('✅ Full message:', fullMessage);

            const parsed = parsePacket(fullMessage);
            if (parsed) {
                saveLog(parsed);
            }

            startIndex = buffer.indexOf('#');
        }
    });


    socket.on('error', err => {
        console.error('💥 Socket error:', err.message);
    });

    socket.on('end', () => {
        console.log('❌ Tracker disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`✅ TCP Server listening on port ${PORT}`);
});
