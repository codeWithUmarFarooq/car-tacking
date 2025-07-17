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
    const gprmcStart = body.indexOf('$GPRMC');
    if (gprmcStart === -1) {
        console.log('❌ $GPRMC not found in body:', body);
        return defaultGPS();
    }

    const gprmc = body.slice(gprmcStart).trim();
    const parts = gprmc.split(',');

    console.log('🧩 Raw $GPRMC sentence:', gprmc);
    console.log('🧩 Split parts:', parts);

    if (parts.length < 10) {
        console.log('❌ Not enough parts in $GPRMC:', parts);
        return defaultGPS();
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

    // 🔍 Log all values
    console.log('📍 Parsed Fields:');
    console.log('  ⏱️ utcTime:', utcTime);
    console.log('  ✅ fixStatus:', fixStatus);
    console.log('  📌 rawLat:', rawLat);
    console.log('  🧭 latDir:', latDir);
    console.log('  📌 rawLon:', rawLon);
    console.log('  🧭 lonDir:', lonDir);
    console.log('  🚀 speed:', speed);
    console.log('  ↪️ course:', course);
    console.log('  📅 date:', date);

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

function defaultGPS() {
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

export const parsePacket = (packet) => {
    try {
        const parts = packet.split('#').filter(Boolean);
        if (parts.length < 6) return null;

        const [imei, model, password, status, fixValue, bodyLine] = parts;

        // Extract voltage (e.g., 3828 => 3.828 V)
        const voltageMatch = bodyLine.match(/^(\d{4})/);
        const batteryVoltage = voltageMatch ? parseFloat(voltageMatch[1]) / 1000 : null;

        const gpsData = bodyLine.includes('$GPRMC')
            ? parseGPSBody(bodyLine)
            : defaultGPS();

        return {
            imei,
            model,
            password,
            status,
            fixValue,
            rawData: bodyLine,
            fullPacket: packet,
            batteryVoltage,
            gps: gpsData
        };
    } catch (err) {
        console.error('❌ Failed to parse packet:', err.message);
        return null;
    }
};
