
import db from "../config/db.js";
function normalizeStatus(rawStatus = '') {
    const status = rawStatus.toLowerCase();

    if (['auto', 'autolow', 'moving', 'still', 'outdoor'].includes(status)) return 'moving';
    if (['stopped', 'idle'].includes(status)) return 'stopped';
    if (['unplug', 'plug', 'sos', 'shake', 'lock'].includes(status)) return 'unknown';

    return 'unknown';
}

export const saveLog = async (data) => {
    try {
        const gps = data.gps || {};

        await db('logs').insert({
            imei: data.imei,
            latitude: gps.latitude,
            longitude: gps.longitude,
            speed_knots: gps.speed,
            course: gps.course,
            gps_valid: gps.valid,
            status: normalizeStatus(data.status),
            device_time: gps.date && gps.utcTime
                ? new Date(`${gps.date}T${gps.utcTime}Z`)
                : null
        });

        console.log('✅ Log saved to DB');
    } catch (err) {
        console.error('❌ Failed to save log:', err.message);
    }
};
