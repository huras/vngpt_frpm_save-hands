'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('StoryTagReasonings', 'currentCommentaryId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'AICommentaries',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Reference to the current AI commentary for this story-tag relationship'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('StoryTagReasonings', 'currentCommentaryId');
  }
}; 