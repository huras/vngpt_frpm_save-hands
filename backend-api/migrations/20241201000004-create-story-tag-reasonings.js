'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('StoryTagReasonings', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            storyId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Stories',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            tagId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Tags',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            reasoning: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            source: {
                type: Sequelize.ENUM('ai_suggestion', 'manual_choice', 'user_explanation'),
                allowNull: false,
                defaultValue: 'ai_suggestion'
            },
            suggestionId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'TagSuggestions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            userExplanation: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            contextTags: {
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

        // Add indexes with error handling
        try {
            await queryInterface.addIndex('StoryTagReasonings', ['storyId', 'tagId'], {
                unique: true,
                name: 'unique_story_tag_reasoning'
            });
        } catch (error) {
            console.log('Index unique_story_tag_reasoning already exists, skipping...');
        }

        try {
            await queryInterface.addIndex('StoryTagReasonings', ['storyId'], {
                name: 'idx_story_tag_reasoning_story'
            });
        } catch (error) {
            console.log('Index idx_story_tag_reasoning_story already exists, skipping...');
        }

        try {
            await queryInterface.addIndex('StoryTagReasonings', ['tagId'], {
                name: 'idx_story_tag_reasoning_tag'
            });
        } catch (error) {
            console.log('Index idx_story_tag_reasoning_tag already exists, skipping...');
        }
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('StoryTagReasonings');
    }
}; 