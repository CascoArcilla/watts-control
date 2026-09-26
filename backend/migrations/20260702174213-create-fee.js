'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    await queryInterface.createTable({ tableName: 'Fees', schema }, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        unique: true
      },
      dca: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      bs_limit: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      bs_price: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      md_limit: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      md_price: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      sp_price: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    await queryInterface.dropTable({ tableName: 'Fees', schema });
  }
};