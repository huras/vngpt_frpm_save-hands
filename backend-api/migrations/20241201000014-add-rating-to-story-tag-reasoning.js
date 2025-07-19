'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('StoryTagReasonings', 'userRating', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'User rating (1-5 stars) for this story-tag reasoning'
    });

    await queryInterface.addColumn('StoryTagReasonings', 'ratingComment', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'User comment provided with the rating'
    });

    await queryInterface.addColumn('StoryTagReasonings', 'ratedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When the user rated this story-tag reasoning'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('StoryTagReasonings', 'userRating');
    await queryInterface.removeColumn('StoryTagReasonings', 'ratingComment');
    await queryInterface.removeColumn('StoryTagReasonings', 'ratedAt');
  }
}; 