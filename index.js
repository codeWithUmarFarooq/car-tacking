const express = require('express');
const cors = require('cors'); // ✅ Import CORS
const net = require('net');
const { parsePacket } = require('./utils/parser');
const { saveLog } = require('./services/logService');



const PORT = 5000;
const API_PORT = 3000;

const app = express();

app.use(express.json());

app.use(cors());


// const hexPacket = '436865636b20746869732061727469636c652069662074686520746f6f6c206e6f7420776f726b696e673a0d0a68747470733a2f2f68656c702e6d6963747261636b2e636f6d2f61727469636c65732f686f772d746f2d73657475702d6d743730302d7669612d7573622d636f6e6669672d746f6f6c';
// const result = parsePacket(hexPacket);

// console.log(result);
// const hexData = '436865636b20746869732061727469636c652069662074686520746f6f6c206e6f7420776f726b696e673a0d0a68747470733a2f2f68656c702e6d6963747261636b2e636f6d2f61727469636c65732f686f772d746f2d73657475702d6d743730302d7669612d7573622d636f6e6669672d746f6f6c';

// const asciiData = Buffer.from(hexData, 'hex').toString('utf8');
// console.log(asciiData);

// ✅ Allow all origins and methods
app.use(cors({ origin: '*' }));
// 🧪 Test API
app.get('/api/test', (req, res) => {
    res.json({ message: '🚀 API is working!' });
});

// 🚀 Start API Server
app.listen(API_PORT, () => {
    console.log(`✅ HTTP API server running on port ${API_PORT}`);
});

// 📡 Start TCP Server




const server = net.createServer(socket => {
    console.log('📡 Tracker connected');

    socket.on('data', buffer => {
        const hexData = buffer.toString('hex');
        console.log('📨 Data received:', hexData);

        // Here you can add parsing logic later
    });

    socket.on('end', () => {
        console.log('❌ Connection ended');
    });
});

server.listen(5000, () => {
    console.log('✅ Server listening on port 5000');
});

