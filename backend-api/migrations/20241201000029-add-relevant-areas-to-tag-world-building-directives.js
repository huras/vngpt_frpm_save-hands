'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.addColumn('TagWorldBuildingDirectives', 'relevantAreas', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of relevant directive types for this tag (e.g., ["character_generation", "place_generation"])'
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.removeColumn('TagWorldBuildingDirectives', 'relevantAreas');
    }
}; 