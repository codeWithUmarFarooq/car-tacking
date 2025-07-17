
const parseGPSBody = (bodyLine) => {
    try {
        const dataLine = bodyLine.split('*')[0].substring(1); 
        const parts = dataLine.split(',');
        const [
            type, time, status, lat, latDir, lon, lonDir,
            speed, course, date
        ] = parts;


        const convertToDecimal = (raw, direction) => {
            if (!raw) return null;
            const degLen = (direction === 'N' || direction === 'S') ? 2 : 3;
            const degrees = parseFloat(raw.substring(0, degLen));
            const minutes = parseFloat(raw.substring(degLen));
            let decimal = degrees + minutes / 60;
            if (direction === 'S' || direction === 'W') {
                decimal *= -1;
            }
            return decimal;
        };

        return {
            valid: status === 'A',
            utcTime: time,
            date: date,
            latitude: convertToDecimal(lat, latDir),
            longitude: convertToDecimal(lon, lonDir),
            speed: speed ? parseFloat(speed) : null,
            course: course ? parseFloat(course) : null
        };
    } catch (err) {
        console.error("❌ Failed to parse GPS body:", err.message);
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
};

export const parsePacket = (packet) => {
    try {
        const parts = packet.split('#').filter(Boolean);
        if (parts.length < 6) {
            console.log("length is less");
            return null;
        }
        const [imei, model, password, status, fixValue, customCode, bodyLine] = parts;

        const bodyLine_ = customCode?.includes('$GPRMC') ? customCode :
            bodyLine.includes('$GPRMC') ? bodyLine : '';

        const gpsData = parseGPSBody(bodyLine_)

        return {
            imei,
            model,
            password,
            status,
            fixValue,
            customCode,
            rawData: bodyLine,
            fullPacket: packet,
            gps: gpsData
        };
    } catch (err) {
        console.error('❌ Failed to parse packet:', err.message);
        return null;
    }
};
