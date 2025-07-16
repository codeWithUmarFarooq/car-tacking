function convertToDecimalDegrees(value, direction) {
    if (!value || !direction) return null;

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

function parseGPSBody(body) {
    const parts = body.trim().split(',');

    // Ensure it is a valid GPRMC sentence with enough parts
    if (!parts[0].includes('$GPRMC') || parts.length < 10) {
        return {
            latitude: null,
            longitude: null,
            valid: false,
            utcTime: null,
            date: null,
            speed: null,
            course: null
        };
    }

    const fixStatus = parts[2];
    const valid = fixStatus === 'A';

    const rawLat = parts[3];
    const latDir = parts[4];
    const rawLon = parts[5];
    const lonDir = parts[6];
    const speed = parts[7];
    const course = parts[8];
    const date = parts[9];
    const utcTime = parts[1];

    const latitude = convertToDecimalDegrees(rawLat, latDir);
    const longitude = convertToDecimalDegrees(rawLon, lonDir);

    const formattedTime = utcTime?.length >= 6
        ? `${utcTime.slice(0, 2)}:${utcTime.slice(2, 4)}:${utcTime.slice(4, 6)}`
        : null;

    const formattedDate = date?.length === 6
        ? `20${date.slice(4)}-${date.slice(2, 4)}-${date.slice(0, 2)}`
        : null;

    return {
        latitude: valid ? latitude : null,
        longitude: valid ? longitude : null,
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
        const gpsData = bodyLine.includes('$GPRMC')
            ? parseGPSBody(bodyLine)
            : {
                latitude: null,
                longitude: null,
                valid: false,
                utcTime: null,
                date: null,
                speed: null,
                course: null
            };
console.log("Parsed GPS:", gpsData);
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
