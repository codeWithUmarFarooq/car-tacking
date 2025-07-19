
import { TABLE } from "../../utils/enum/table.js"


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// TABLE
export async function up(Knex) {
    return Knex.schema.createTable(TABLE.USERS, table => {
        table.increments('id');
        table.string('name');
        table.string('email').unique();
        table.string('password_hash');
        table.string('phone').unique();
        table.string('address');
        table.enum('role', ['admin', 'customer']).defaultTo('customer');
        table.boolean('is_active').defaultTo(true);
        table.boolean("is_verified").defaultTo(false);
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.dropTableIfExists(TABLE.USERS);

};
