'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('TagSuggestions', {
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
            confidence: {
                type: Sequelize.FLOAT,
                allowNull: true,
                defaultValue: 0.8
            },
            status: {
                type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'expired'),
                allowNull: false,
                defaultValue: 'pending'
            },
            acceptedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            rejectedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            suggestionType: {
                type: Sequelize.ENUM('ai_generated', 'manual_search', 'similar_story'),
                allowNull: false,
                defaultValue: 'ai_generated'
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
            await queryInterface.addIndex('TagSuggestions', ['storyId', 'tagId'], {
                unique: true,
                name: 'unique_story_tag_suggestion'
            });
        } catch (error) {
            console.log('Index unique_story_tag_suggestion already exists, skipping...');
        }

        try {
            await queryInterface.addIndex('TagSuggestions', ['status'], {
                name: 'idx_tag_suggestion_status'
            });
        } catch (error) {
            console.log('Index idx_tag_suggestion_status already exists, skipping...');
        }

        try {
            await queryInterface.addIndex('TagSuggestions', ['storyId', 'status'], {
                name: 'idx_story_suggestion_status'
            });
        } catch (error) {
            console.log('Index idx_story_suggestion_status already exists, skipping...');
        }
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('TagSuggestions');
    }
}; 