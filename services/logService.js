import knex from '../config/db.js';

export const saveLog = async (data) => {
    try {
        const gps = data.gps || {};

        await knex('logs').insert({
            imei: data.imei,
            latitude: gps.latitude ?? null,
            longitude: gps.longitude ?? null,
            speed_knots: gps.speed ?? null,
            course: gps.course ?? null,
            gps_valid: gps.valid ?? false,
            status: data.status?.toLowerCase() ?? 'unknown',
            device_time: gps.date && gps.utcTime
                ? new Date(`${gps.date}T${gps.utcTime}Z`)
                : null
        });

        console.log('✅ Log saved');
    } catch (err) {
        console.error('❌ Failed to save log:', err.message);
    }
};
