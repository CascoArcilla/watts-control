'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    await queryInterface.changeColumn({ tableName: 'Users', schema }, 'first_name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.changeColumn({ tableName: 'Users', schema }, 'use_password', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    await queryInterface.changeColumn({ tableName: 'Users', schema }, 'first_name', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn({ tableName: 'Users', schema }, 'use_password', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  }
};
