'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        // Update the ENUM to include evolution types
        // Note: SQLite doesn't support ALTER TYPE, so we need to recreate the column
        await queryInterface.changeColumn('TagSuggestionDirectives', 'directiveType', {
            type: Sequelize.ENUM('character_generation', 'character_evolution', 'place_generation', 'place_evolution', 'object_generation', 'object_evolution', 'arc_generation', 'arc_evolution', 'past_events_generation', 'past_events_evolution', 'general'),
            allowNull: false,
            defaultValue: 'general',
            comment: 'Type of directive this represents'
        });
    },

    down: async(queryInterface, Sequelize) => {
        // Revert to original ENUM
        await queryInterface.changeColumn('TagSuggestionDirectives', 'directiveType', {
            type: Sequelize.ENUM('character_generation', 'place_generation', 'object_generation', 'arc_generation', 'past_events_generation', 'general'),
            allowNull: false,
            defaultValue: 'general',
            comment: 'Type of directive this represents'
        });
    }
}; 