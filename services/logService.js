
import db from "../config/db.js";
function convertKnotsToMPH(knots) {
    const mph = knots * 1.15078;
    return parseFloat(mph.toFixed(2));
}
function normalizeStatus(rawStatus = '') {
    const status = rawStatus.toLowerCase();

    if (['auto', 'autolow', 'moving', 'still', 'outdoor'].includes(status)) return 'moving';
    if (['stopped', 'idle'].includes(status)) return 'stopped';
    if (['unplug', 'plug', 'sos', 'shake', 'lock'].includes(status)) return 'unknown';

    return 'unknown';
}
function convertGpsDateTime(dateStr, timeStr) {
    const day = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = '20' + dateStr.substring(4, 6);

    const hour = timeStr.substring(0, 2);
    const minute = timeStr.substring(2, 4);
    const second = timeStr.substring(4, 6);

    // Build a proper ISO string
    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;

    return new Date(isoString);
}


export const saveLog = async (data) => {
    try {
        const gps = data.gps || {};
        await db('logs').insert({
            imei: data.imei,
            latitude: gps.latitude,
            longitude: gps.longitude,
            speed_knots: convertKnotsToMPH(gps.speed) || 0,
            battery_voltage: (data.customCode / 1000) || 0,
            course: gps.course || 0,
            gps_valid: gps.valid,
            status: normalizeStatus(data.status),
            device_time: gps.date && gps.utcTime
                ? convertGpsDateTime(gps.date, gps.utcTime)
                : null
        });

        console.log('✅ Log saved to DB');
    } catch (err) {
        console.error('❌ Failed to save log:', err.message);
    }
};
