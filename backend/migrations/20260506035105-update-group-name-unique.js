'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    await queryInterface.changeColumn({ tableName: 'Groups', schema }, 'name', {
      type: Sequelize.STRING,
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    await queryInterface.changeColumn({ tableName: 'Groups', schema }, 'name', {
      type: Sequelize.STRING,
      unique: false
    });
  }
};
