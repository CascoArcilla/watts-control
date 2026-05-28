'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const isMysql = queryInterface.sequelize.getDialect() === 'mysql';
    // Add UTC timestamp columns to Measures table
    await queryInterface.changeColumn('Measures', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.changeColumn('Measures', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: isMysql ? Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') : Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Add UTC timestamp columns to Groups table
    await queryInterface.changeColumn('Groups', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.changeColumn('Groups', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: isMysql ? Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') : Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove UTC timestamp columns from Measures table
    await queryInterface.changeColumn('Measures', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
    });
    await queryInterface.changeColumn('Measures', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
    });

    // Remove UTC timestamp columns from Groups table
    await queryInterface.changeColumn('Groups', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
    });
    await queryInterface.changeColumn('Groups', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
    });
  }
};
