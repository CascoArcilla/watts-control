'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    await queryInterface.bulkInsert({ tableName: 'Groups', schema }, [
      {
        name: 'Administrador',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lector',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Propietario',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'public';
    await queryInterface.bulkDelete({ tableName: 'Groups', schema }, null, {});
  }
};
