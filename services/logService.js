// const knex = require('knex')(require('../../../knexfile').development);

async function saveLog(data) {
    // const tracker = await knex('trackers').where('imei', data.imei).first();

    if (!tracker) {
        console.log('🚫 Tracker not registered:', data.imei);
        return;
    }

    // await knex('tracker_logs').insert({
    //     tracker_id: tracker.id,
    //     lat: data.lat,
    //     lng: data.lng,
    //     speed: data.speed,
    //     battery: data.battery,
    //     recorded_at: data.timestamp
    // });

    // await knex('trackers')
    //     .where('id', tracker.id)
    //     .update({ last_seen_at: data.timestamp });

    console.log(`✅ Log saved for ${data.imei}`);
}

module.exports = { saveLog };
