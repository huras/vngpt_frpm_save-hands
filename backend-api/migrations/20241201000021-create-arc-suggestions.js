'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('ArcSuggestions', {
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
                onDelete: 'CASCADE',
                comment: 'Reference to the story this arc suggestion belongs to'
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'Name/title of the suggested arc'
            },
            high_level_description: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: 'High-level description of the arc concept'
            },
            arcType: {
                type: Sequelize.ENUM('character_arc', 'plot_arc', 'relationship_arc', 'world_arc', 'theme_arc'),
                allowNull: false,
                defaultValue: 'plot_arc',
                comment: 'Type of story arc'
            },
            complexity: {
                type: Sequelize.ENUM('simple', 'moderate', 'complex', 'epic'),
                allowNull: false,
                defaultValue: 'moderate',
                comment: 'Complexity level of the arc'
            },
            estimatedDuration: {
                type: Sequelize.ENUM('short', 'medium', 'long', 'series_spanning'),
                allowNull: false,
                defaultValue: 'medium',
                comment: 'Estimated duration of the arc'
            },
            keyEvents: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'JSON array of key events or milestones in this arc'
            },
            characterInvolvement: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'JSON array of character IDs involved in this arc'
            },
            relatedTags: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'JSON array of tag IDs that influenced this arc suggestion'
            },
            sourceDirectives: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'JSON array of directive IDs that contributed to this arc'
            },
            confidence: {
                type: Sequelize.FLOAT,
                allowNull: true,
                defaultValue: 0.8,
                comment: 'AI confidence score for this arc suggestion (0-1)'
            },
            userRating: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'User rating (1-5 stars) for this arc suggestion'
            },
            ratingComment: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'User comment provided with the rating'
            },
            ratedAt: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'When the user rated this arc suggestion'
            },
            isAccepted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'Whether the user accepted this arc suggestion'
            },
            acceptedAt: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'When the user accepted this arc suggestion'
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                comment: 'Whether this arc suggestion is currently active'
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
                    fields: ['storyId'],
                    name: 'idx_arc_suggestion_story'
                },
                {
                    fields: ['arcType'],
                    name: 'idx_arc_suggestion_type'
                },
                {
                    fields: ['isAccepted'],
                    name: 'idx_arc_suggestion_accepted'
                },
                {
                    fields: ['isActive'],
                    name: 'idx_arc_suggestion_active'
                },
                {
                    fields: ['confidence'],
                    name: 'idx_arc_suggestion_confidence'
                }
            ]
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('ArcSuggestions');
    }
}; 