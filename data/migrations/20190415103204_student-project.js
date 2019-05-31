exports.up = function (knex) {
  return knex.schema.createTable('student_project', tbl => {

    tbl.increments();

    tbl.integer('student_id')
      .notNullable()
      .unsigned()
      .references('id')
      .inTable('students')
    // .onDelete('RESTRICT')
      .onDelete('CASCADE')

    tbl.integer('project_id')
      .notNullable()
      .unsigned()
      .references('id')
      .inTable('projects')
    // .onDelete('RESTRICT')
      .onDelete('CASCADE')

    tbl.integer('professor_id')
      .notNullable()
      .unsigned()
      .references('id')
      .inTable('users')
    // .onDelete('RESTRICT')
      .onDelete('CASCADE')

    tbl.integer('student_message')
      .nullable()
      .unsigned()
      .references('id')
      .inTable('messages')
    // .onDelete('RESTRICT')
      .onDelete('CASCADE')

    tbl.integer('professor_message')
      .nullable()
      .unsigned()
      .references('id')
      .inTable('messages')
    // .onDelete('RESTRICT')
      .onDelete('CASCADE')

  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('student_project');
};