'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    // 1. Cambiar tipo de dato de 'created_by' en la tabla 'Bills'
    await queryInterface.changeColumn({ tableName: 'Bills', schema }, 'created_by', {
      type: Sequelize.INTEGER,
      references: {
        model: { tableName: 'Users', schema },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });

    // 2. Cambiar tipo de dato de 'meterid' en la tabla 'Bills'
    await queryInterface.changeColumn({ tableName: 'Bills', schema }, 'meterid', {
      type: Sequelize.INTEGER,
      references: {
        model: { tableName: 'Meters', schema },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    // 1. Cambiar tipo de dato de 'created_by' en la tabla 'Bills'
    await queryInterface.changeColumn({ tableName: 'Bills', schema }, 'created_by', {
      type: Sequelize.INTEGER,
      references: {
        model: { tableName: 'Users', schema },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false
    });

    // 2. Cambiar tipo de dato de 'meterid' en la tabla 'Bills'
    await queryInterface.changeColumn({ tableName: 'Bills', schema }, 'meterid', {
      type: Sequelize.INTEGER,
      references: {
        model: { tableName: 'Meters', schema },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false
    });
  }
};
