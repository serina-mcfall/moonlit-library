export async function up(knex) {
  await knex.schema.alterTable('books', (table) => {
    table.text('my_thoughts').nullable()
    table.integer('rating').nullable()
    table.text('favorite_quote').nullable()
    table.text('favorite_character').nullable()
  })
}

export async function down(knex) {
  await knex.schema.alterTable('books', (table) => {
    table.dropColumn('my_thoughts')
    table.dropColumn('rating')
    table.dropColumn('favorite_quote')
    table.dropColumn('favorite_character')
  })
}
