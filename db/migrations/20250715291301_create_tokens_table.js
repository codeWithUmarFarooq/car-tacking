import { TABLE } from "../../utils/enum/table.js"

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(Knex) {
    return Knex.schema.createTable(TABLE.TOKENS, table => {
        table.increments("id");
        table.integer("user_id").unsigned().references("id").inTable("users").onDelete("CASCADE");
        table.string("token").notNullable();
        table.enum("type", ["email_verification", "password_reset"]).notNullable();
        table.timestamp("expires_at").notNullable();
        table.timestamps(true, true);

    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.dropTableIfExists(TABLE.TOKENS);

};
