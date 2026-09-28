'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    // Meters table: owner_meter -> userId
    await queryInterface.renameColumn({ tableName: 'Meters', schema }, 'owner_meter', 'userId');

    // Bills table: meterid -> meterId, created_by -> userId
    await queryInterface.renameColumn({ tableName: 'Bills', schema }, 'meterid', 'meterId');
    await queryInterface.renameColumn({ tableName: 'Bills', schema }, 'created_by', 'userId');

    // Measures table: meter -> meterId, take_by -> userId
    await queryInterface.renameColumn({ tableName: 'Measures', schema }, 'meter', 'meterId');
    await queryInterface.renameColumn({ tableName: 'Measures', schema }, 'take_by', 'userId');
  },

  async down(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    // Reverse changes
    await queryInterface.renameColumn({ tableName: 'Meters', schema }, 'userId', 'owner_meter');
    await queryInterface.renameColumn({ tableName: 'Bills', schema }, 'meterId', 'meterid');
    await queryInterface.renameColumn({ tableName: 'Bills', schema }, 'userId', 'created_by');
    await queryInterface.renameColumn({ tableName: 'Measures', schema }, 'meterId', 'meter');
    await queryInterface.renameColumn({ tableName: 'Measures', schema }, 'userId', 'take_by');
  }
};
