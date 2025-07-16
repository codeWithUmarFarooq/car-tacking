import express from 'express';
import net from 'net';

import { saveLog } from '../services/logService.js';
import { parsePacket } from './parser.js';


export const tcpServer = net.createServer(socket => {
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
        // console.log('📨 Data chunk received:', buffer);

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
                saveLog(parsed);
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

