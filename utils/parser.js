// utils/parser.js
function parsePacket(packet) {
    try {
        const parts = packet.split('#').filter(p => p !== '');

        if (parts.length < 5) {
            return null; // invalid structure
        }

        const [imei, model, password, status, fixValAndData] = parts;

        const result = {
            imei,
            model,
            password,
            status,
            fixValue: fixValAndData[0],
            data: fixValAndData.slice(1),
        };

        return result;
    } catch (err) {
        console.error('❌ Failed to parse packet:', err.message);
        return null;
    }
}

module.exports = {
    parsePacket
};
