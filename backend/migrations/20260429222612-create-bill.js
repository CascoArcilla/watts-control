'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    await queryInterface.createTable({ tableName: 'Bills', schema }, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      estimated_amount: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      watts_consumed: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      meterid: {
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'Meters', schema },
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'Users', schema },
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
    await queryInterface.dropTable({ tableName: 'Bills', schema });
  }
};