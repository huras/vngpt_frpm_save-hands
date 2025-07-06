'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('Tags', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            thumb_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            short_description: {
                type: Sequelize.TEXT,
                allowNull: true
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

        // Create the junction table for many-to-many relationship
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
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('story_tags');
        await queryInterface.dropTable('Tags');
    }
};