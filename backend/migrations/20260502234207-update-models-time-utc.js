'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    // Add UTC timestamp columns to Measures table
    await queryInterface.changeColumn({ tableName: 'Measures', schema }, 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.changeColumn({ tableName: 'Measures', schema }, 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Add UTC timestamp columns to Groups table
    await queryInterface.changeColumn({ tableName: 'Groups', schema }, 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.changeColumn({ tableName: 'Groups', schema }, 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },

  async down(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    // Remove UTC timestamp columns from Measures table
    await queryInterface.changeColumn({ tableName: 'Measures', schema }, 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
    });
    await queryInterface.changeColumn({ tableName: 'Measures', schema }, 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
    });

    // Remove UTC timestamp columns from Groups table
    await queryInterface.changeColumn({ tableName: 'Groups', schema }, 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
    });
    await queryInterface.changeColumn({ tableName: 'Groups', schema }, 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
    });
  }
};
