function convertToDecimalDegrees(value, direction) {
    if (!value || !direction || isNaN(value)) return null;
    const isLat = direction === 'N' || direction === 'S';
    const degreeLength = isLat ? 2 : 3;
    const degrees = parseInt(value.slice(0, degreeLength), 10);
    const minutes = parseFloat(value.slice(degreeLength));
    let decimal = degrees + minutes / 60;

    if (direction === 'S' || direction === 'W') {
        decimal = -decimal;
    }
    return decimal;
}
function parseWiFiBody(body) {
    const timeMatch = body.match(/\$WIFI,(\d{6}\.\d{2})/);
    const dateMatch = body.match(/,(\d{6})\*/);

    const formattedTime = timeMatch
        ? `${timeMatch[1].slice(0, 2)}:${timeMatch[1].slice(2, 4)}:${timeMatch[1].slice(4, 6)}`
        : null;

    const date = dateMatch ? dateMatch[1] : null;
    const formattedDate = date?.length === 6
        ? `20${date.slice(4)}-${date.slice(2, 4)}-${date.slice(0, 2)}`
        : null;

    return {
        valid: false,
        utcTime: formattedTime,
        date: formattedDate
    };
}
function parseGPSBody(body) {
    const gpsMatch = body.match(/\$GPRMC,([^,]+),([AV]),([^,]+),([NS]),([^,]+),([EW]),([^,]*),([^,]*),([^,]+),/);
    if (!gpsMatch) return null;

    const [
        _,
        utcTime,
        fixStatus,
        rawLat, latDir,
        rawLon, lonDir,
        speed,
        course,
        date
    ] = gpsMatch;

    const valid = fixStatus === 'A';

    const latitude = convertToDecimalDegrees(rawLat, latDir);
    const longitude = convertToDecimalDegrees(rawLon, lonDir);

    const formattedTime = `${utcTime.slice(0, 2)}:${utcTime.slice(2, 4)}:${utcTime.slice(4, 6)}`;
    const formattedDate = `20${date.slice(4)}-${date.slice(2, 4)}-${date.slice(0, 2)}`; // YYYY-MM-DD

    return {
        latitude,
        longitude,
        valid,
        utcTime: formattedTime,
        date: formattedDate,
        speed: parseFloat(speed || 0),
        course: parseFloat(course || 0)
    };
}

export const parsePacket = (packet) => {
    try {
        const parts = packet.split('#').filter(Boolean);
        if (parts.length < 6) return null;

        const [imei, model, password, status, fixValue, bodyLine] = parts;

        let gpsData = {};
        if (bodyLine.includes('$GPRMC')) {
            gpsData = parseGPSBody(bodyLine) || {};
        } else if (bodyLine.includes('$WIFI')) {
            gpsData = parseWiFiBody(bodyLine) || {};
        }

        return {
            imei,
            model,
            password,
            status,
            fixValue,
            rawData: bodyLine,
            fullPacket: packet,
            gps: gpsData
        };
    } catch (err) {
        console.error('❌ Failed to parse packet:', err.message);
        return null;
    }
};

