'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('models', 'body_stars', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
    await queryInterface.addColumn('models', 'face_stars', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
    await queryInterface.addColumn('models', 'style_stars', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
  },

  async down (queryInterface, Sequelize) {
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('models', 'body_stars');
      await queryInterface.removeColumn('models', 'face_stars');
      await queryInterface.removeColumn('models', 'style_stars');
    }
  }
};
