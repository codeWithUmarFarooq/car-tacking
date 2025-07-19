
import { TABLE } from "../../utils/enum/table.js";


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// TABLE
export async function up(Knex) {
    return Knex.schema.createTable(TABLE.LOGS, table => {
        table.increments('id');
        table.string('imei').notNullable();
        table.decimal('latitude', 10, 6).nullable();
        table.decimal('longitude', 10, 6).nullable();
        table.decimal('speed_knots', 6, 2).nullable();
        table.decimal('course', 6, 2).nullable();;
        table.decimal('battery_voltage', 5, 2).nullable();;
        table.boolean('gps_valid').nullable();
        table.enum('status', ['moving', 'idle', 'stopped', 'unknown']).nullable();;
        table.timestamp('device_time').nullable();; // from GPS
        table.timestamps(true, true); // when saved in DB

    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.dropTableIfExists(TABLE.LOGS);

};
