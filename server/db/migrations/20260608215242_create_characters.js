export async function up(knex) {
  await knex.schema.createTable('books', (table) => {
    table.increments('id').primary()
    table.string('author').nullable()
    table.string('title').notNullable()
    table.string('series').nullable()
    table.string('genre').nullable()
    table.string('read_status').nullable()
    table.string('cover_image').nullable()
    table.string('notes').nullable()
  })
}

export async function down(knex) {
  await knex.schema.dropTable('books')
}
