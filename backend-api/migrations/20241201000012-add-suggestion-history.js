'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.addColumn('TagSuggestions', 'previousVersionId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'TagSuggestions',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('TagSuggestions', 'versionNumber', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
        });

        await queryInterface.addColumn('TagSuggestions', 'regenerationReason', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        // Add indexes for better performance
        await queryInterface.addIndex('TagSuggestions', ['previousVersionId'], {
            name: 'idx_tag_suggestion_previous_version'
        });

        await queryInterface.addIndex('TagSuggestions', ['storyId', 'tagId', 'versionNumber'], {
            name: 'idx_story_tag_version'
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.removeIndex('TagSuggestions', 'idx_story_tag_version');
        await queryInterface.removeIndex('TagSuggestions', 'idx_tag_suggestion_previous_version');
        await queryInterface.removeColumn('TagSuggestions', 'regenerationReason');
        await queryInterface.removeColumn('TagSuggestions', 'versionNumber');
        await queryInterface.removeColumn('TagSuggestions', 'previousVersionId');
    }
}; 