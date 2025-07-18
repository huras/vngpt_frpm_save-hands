'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Since we changed the model to use STRING instead of ENUM,
    // this migration is no longer needed as the validation is handled in the model
    console.log('Migration: ai_regenerate trigger type is now supported via model validation');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Migration: No rollback needed for string field change');
  }
}; 