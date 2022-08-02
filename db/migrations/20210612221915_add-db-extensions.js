export function up(knex) {
  return knex.schema.raw(
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto" schema public'
  );
}

export function down(knex) {
  return knex.schema.raw('drop extension if exists "pgcrypto"');
}
