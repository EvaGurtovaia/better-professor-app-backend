const faker = require('faker');

let messageList = []

for (let i = 1; i < 201; i++) {
  let message = {};
  message.message = faker.hacker.phrase();
  message.send_date = faker.date.future( 1 );
  messageList.push(message);
}


exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('messages').insert(messageList);
};
