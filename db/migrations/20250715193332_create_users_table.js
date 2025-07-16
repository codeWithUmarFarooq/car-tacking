// import { TABLE } from "../../utils/enum/table";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(Knex) {
    return Knex.schema.createTable("users", table => {
        table.increments('id');
        table.string('name');
        table.string('email').unique();
        table.string('password_hash');
        table.string('phone').unique();
        table.string('address');
        table.enum('role', ['admin', 'customer']).defaultTo('customer');
        table.boolean('is_active').defaultTo(true);
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.dropTableIfExists("users");

};
