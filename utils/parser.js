function parsePacket(input) {
    const hex = Buffer.isBuffer(input) ? input.toString('hex') : input;
    if (!hex || typeof hex !== 'string')
        return null;

    const protocol = hex.slice(4, 6);
    if (protocol !== '12') return null; // Only process GPS info packets

    try {
        const imeiHex = hex.slice(8, 24);
        const imei = decodeImei(imeiHex);

        // Timestamp: YYMMDDHHmmSS (BCD)
        const timeHex = hex.slice(24, 36);
        const yy = bcdToDec(parseInt(timeHex.slice(0, 2), 16));
        const mm = bcdToDec(parseInt(timeHex.slice(2, 4), 16));
        const dd = bcdToDec(parseInt(timeHex.slice(4, 6), 16));
        const hh = bcdToDec(parseInt(timeHex.slice(6, 8), 16));
        const mi = bcdToDec(parseInt(timeHex.slice(8, 10), 16));
        const ss = bcdToDec(parseInt(timeHex.slice(10, 12), 16));
        const timestamp = new Date(2000 + yy, mm - 1, dd, hh, mi, ss);
        console.log(timeHex)

        // Latitude (bytes 12–15), Longitude (bytes 16–19)
        const latHex = hex.slice(38, 46);
        const lngHex = hex.slice(46, 54);
        const lat = toDecimalDegrees(latHex);
        const lng = toDecimalDegrees(lngHex);

        // Speed (byte 20)
        const speed = parseInt(hex.slice(54, 56), 16);
        console.log(speed);

        // Static battery placeholder (optional)
        const battery = 85;

        return {
            imei,
            lat,
            lng,
            speed,
            battery,
            timestamp
        };
    } catch (err) {
        console.error('Parse error:', err);
        return null;
    }
}

function decodeImei(hex) {
    let result = '';
    for (let i = 0; i < hex.length; i += 2) {
        result += parseInt(hex.substr(i, 2), 16).toString().padStart(2, '0');
    }
    return result;
}

function bcdToDec(bcd) {
    return ((bcd >> 4) * 10) + (bcd & 0x0f);
}

function toDecimalDegrees(coordHex) {
    const val = parseInt(coordHex, 16);
    return val / 30000;
}

module.exports = { parsePacket };
