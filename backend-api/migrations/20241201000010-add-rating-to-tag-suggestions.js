'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TagSuggestions', 'userRating', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'User rating (1-5 stars) for this suggestion'
    });

    await queryInterface.addColumn('TagSuggestions', 'ratingComment', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'User comment provided with the rating'
    });

    await queryInterface.addColumn('TagSuggestions', 'ratedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When the user rated this suggestion'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('TagSuggestions', 'userRating');
    await queryInterface.removeColumn('TagSuggestions', 'ratingComment');
    await queryInterface.removeColumn('TagSuggestions', 'ratedAt');
  }
}; 