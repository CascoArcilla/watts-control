'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    await queryInterface.createTable({ tableName: 'Measures', schema }, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      watts: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      take_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'Users', schema },
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      meter: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'Meters', schema },
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    const schema = queryInterface.sequelize.options.schema || 'public';
    await queryInterface.dropTable({ tableName: 'Measures', schema });
  }
};