'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FeeConfs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      feeId: {
        type: Sequelize.INTEGER
      },
      meterId: {
        type: Sequelize.INTEGER
      },
      dca: {
        type: Sequelize.DOUBLE
      },
      bs_limit: {
        type: Sequelize.DOUBLE
      },
      bs_price: {
        type: Sequelize.DOUBLE
      },
      md_limit: {
        type: Sequelize.DOUBLE
      },
      md_price: {
        type: Sequelize.DOUBLE
      },
      sp_price: {
        type: Sequelize.DOUBLE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FeeConfs');
  }
};