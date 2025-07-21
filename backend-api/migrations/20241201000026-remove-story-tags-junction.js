'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        // Remove the story_tags junction table since Stories now relate to Tags only through TagSuggestions
        await queryInterface.dropTable('story_tags');
    },

    down: async(queryInterface, Sequelize) => {
        // Recreate the story_tags junction table if needed to rollback
        await queryInterface.createTable('story_tags', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            StoryId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Stories',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            TagId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Tags',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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
        });

        // Add unique constraint to prevent duplicate associations
        await queryInterface.addConstraint('story_tags', {
            fields: ['StoryId', 'TagId'],
            type: 'unique',
            name: 'story_tags_unique'
        });
    }
}; 