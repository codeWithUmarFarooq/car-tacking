// utils/parser.js
function parsePacket(packet) {
    try {
        const parts = packet.split('#').filter(p => p !== '');

        if (parts.length < 5) return null;

        const [imei, model, password, status, fixValAndData] = parts;

        return {
            imei,
            model,
            password,
            status,
            fixValue: fixValAndData[0],
            rawData: fixValAndData.slice(1),
            fullPacket: packet
        };
    } catch (err) {
        console.error('❌ Failed to parse packet:', err.message);
        return null;
    }
}

module.exports = { parsePacket };
