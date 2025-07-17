
import db from "../config/db.js";
function normalizeStatus(rawStatus = '') {
    const status = rawStatus.toLowerCase();

    if (['auto', 'autolow', 'moving', 'still', 'outdoor'].includes(status)) return 'moving';
    if (['stopped', 'idle'].includes(status)) return 'stopped';
    if (['unplug', 'plug', 'sos', 'shake', 'lock'].includes(status)) return 'unknown';

    return 'unknown';
}
function convertGpsDateTime(dateStr, timeStr) {
    // Example: dateStr = '170725', timeStr = '031435.00'
    const day = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = '20' + dateStr.substring(4, 6); // assumes 20XX

    const hour = timeStr.substring(0, 2);
    const minute = timeStr.substring(2, 4);
    const second = timeStr.substring(4, 6);

    // Build a proper ISO string
    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;

    return new Date(isoString); // Returns a valid Date object
}


export const saveLog = async (data) => {
    try {
        // console.log("Saving log data:", data);
        const gps = data.gps || {};
        // console.log("data", gps);

        await db('logs').insert({
            imei: data.imei,
            latitude: gps.latitude,
            longitude: gps.longitude,
            speed_knots: gps.speed,
            course: gps.course,
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
