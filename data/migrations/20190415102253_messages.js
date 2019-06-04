exports.up = function(knex) {
    return knex.schema.createTable("messages", messages => {
        messages.increments();

        messages.text("message").notNullable();

        messages.datetime("send_date").notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists("messages");
};
