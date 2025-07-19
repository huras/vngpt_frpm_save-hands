module.exports = (sequelize, Sequelize) => {
    const StoryTagReasoning = sequelize.define('StoryTagReasoning', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
            allowNull: false,
            comment: 'The current reasoning behind why this tag was chosen for the story (references current AI commentary)'
        },
        source: {
            type: Sequelize.ENUM('ai_suggestion', 'manual_choice', 'user_explanation'),
            allowNull: false,
            defaultValue: 'ai_suggestion',
            comment: 'Source of the reasoning'
        },
        suggestionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'TagSuggestions',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            comment: 'Reference to the original suggestion if this came from an AI suggestion'
        },
        userExplanation: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Additional explanation provided by the user'
        },
        contextTags: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of tag IDs that were present when this reasoning was created'
        },
        currentCommentaryId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'AICommentaries',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            comment: 'Reference to the current AI commentary for this story-tag relationship'
        },
        userRating: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'User rating (1-5 stars) for this story-tag reasoning'
        },
        ratingComment: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'User comment provided with the rating'
        },
        ratedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user rated this story-tag reasoning'
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
                fields: ['storyId', 'tagId'],
                name: 'unique_story_tag_reasoning'
            },
            {
                fields: ['storyId'],
                name: 'idx_story_tag_reasoning_story'
            },
            {
                fields: ['tagId'],
                name: 'idx_story_tag_reasoning_tag'
            }
        ]
    });

    // Associations
    StoryTagReasoning.associate = function(models) {
        StoryTagReasoning.belongsTo(models.Story, {
            foreignKey: 'storyId',
            as: 'story'
        });
        
        StoryTagReasoning.belongsTo(models.Tag, {
            foreignKey: 'tagId',
            as: 'tag'
        });
        
        StoryTagReasoning.belongsTo(models.TagSuggestion, {
            foreignKey: 'suggestionId',
            as: 'originalSuggestion'
        });
        
        StoryTagReasoning.belongsTo(models.AICommentary, {
            foreignKey: 'currentCommentaryId',
            as: 'currentCommentary'
        });
    };

    return StoryTagReasoning;
}; 