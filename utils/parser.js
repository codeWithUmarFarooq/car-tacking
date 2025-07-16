// utils/parser.js
function parsePacket(packet) {
    try {
        const [meta, gpsRaw] = packet.split('\r\n').filter(Boolean);

        const parts = meta.replace(/#/g, ' ').trim().split(' ').filter(Boolean);
        if (parts.length < 5 || !gpsRaw) return null;

        const [imei, model, password, status, fixValue] = parts;

        // GPS Parsing ($GPRMC format)
        const gpsParts = gpsRaw.split(',');
        const gps = {};

        if (gpsRaw.startsWith('$GPRMC') && gpsParts.length >= 12) {
            gps.utcTime = gpsParts[1];
            gps.status = gpsParts[2]; // A = active, V = void
            gps.latitude = convertToDecimal(gpsParts[3], gpsParts[4]);
            gps.longitude = convertToDecimal(gpsParts[5], gpsParts[6]);
            gps.date = gpsParts[9];
        }

        return {
            imei,
            model,
            password,
            status,
            fixValue,
            gps,
            rawData: gpsRaw,
            fullPacket: packet
        };
    } catch (err) {
        console.error('❌ Failed to parse packet:', err.message);
        return null;
    }
}

// Convert NMEA lat/lon to decimal degrees
function convertToDecimal(coord, direction) {
    if (!coord || coord.length < 4) return null;

    const dotIndex = coord.indexOf('.');
    const degreesLength = dotIndex === -1 ? 2 : dotIndex - 2;
    const degrees = parseFloat(coord.slice(0, degreesLength));
    const minutes = parseFloat(coord.slice(degreesLength));

    let decimal = degrees + minutes / 60;
    if (direction === 'S' || direction === 'W') {
        decimal *= -1;
    }

    return decimal.toFixed(6); // 6 decimal places
}

module.exports = { parsePacket };

