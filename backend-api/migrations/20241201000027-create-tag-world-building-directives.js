'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('TagWorldBuildingDirectives', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            tagSuggestionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'TagSuggestions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'Reference to the accepted TagSuggestion'
            },
            characterGeneration: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'AI-generated directives for character generation based on this tag'
            },
            placeGeneration: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'AI-generated directives for place generation based on this tag'
            },
            objectGeneration: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'AI-generated directives for object generation based on this tag'
            },
            arcGeneration: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'AI-generated directives for arc generation based on this tag'
            },
            pastEventsGeneration: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'AI-generated directives for past events generation based on this tag'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        }, {
            indexes: [
                {
                    unique: true,
                    fields: ['tagSuggestionId'],
                    name: 'unique_tag_world_building_directives_suggestion'
                },
                {
                    fields: ['tagSuggestionId'],
                    name: 'idx_tag_world_building_directives_suggestion'
                }
            ]
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('TagWorldBuildingDirectives');
    }
}; 