'use strict';
const faker = require('faker')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Comments', [{
      text: faker.lorem.text().substring(0, 30),
      UserId: 1,
      RestaurantId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      text: faker.lorem.text().substring(0, 30),
      UserId: 1,
      RestaurantId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      text: faker.lorem.text().substring(0, 30),
      UserId: 1,
      RestaurantId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
