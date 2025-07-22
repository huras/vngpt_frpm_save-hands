'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        // Add new fields to TagSuggestionDirectives table
        await queryInterface.addColumn('TagSuggestionDirectives', 'tagWorldBuildingDirectivesId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'TagWorldBuildingDirectives',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
            comment: 'Reference to the TagWorldBuildingDirectives this directive belongs to'
        });

        await queryInterface.addColumn('TagSuggestionDirectives', 'directiveType', {
            type: Sequelize.ENUM('character_generation', 'place_generation', 'object_generation', 'arc_generation', 'past_events_generation', 'general'),
            allowNull: false,
            defaultValue: 'general',
            comment: 'Type of directive this represents'
        });

        // Add indexes for better performance
        await queryInterface.addIndex('TagSuggestionDirectives', {
            fields: ['tagWorldBuildingDirectivesId'],
            name: 'idx_tag_suggestion_directive_world_building'
        });

        await queryInterface.addIndex('TagSuggestionDirectives', {
            fields: ['directiveType'],
            name: 'idx_tag_suggestion_directive_type'
        });
    },

    down: async(queryInterface, Sequelize) => {
        // Remove indexes
        await queryInterface.removeIndex('TagSuggestionDirectives', 'idx_tag_suggestion_directive_world_building');
        await queryInterface.removeIndex('TagSuggestionDirectives', 'idx_tag_suggestion_directive_type');

        // Remove columns
        await queryInterface.removeColumn('TagSuggestionDirectives', 'directiveType');
        await queryInterface.removeColumn('TagSuggestionDirectives', 'tagWorldBuildingDirectivesId');
    }
}; 