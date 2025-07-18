module.exports = (sequelize, Sequelize) => {
    const AICommentary = sequelize.define('AICommentary', {
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
        commentary: {
            type: Sequelize.TEXT,
            allowNull: false,
            comment: 'The AI commentary/reasoning for this tag-story relationship'
        },
        version: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: 'Version number of this commentary (increments with each update)'
        },
        isCurrent: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Whether this is the current/active commentary for this story-tag pair'
        },
        confidence: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0.8,
            comment: 'AI confidence score (0-1) for this commentary'
        },
        contextTags: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of tag IDs that were present when this commentary was generated'
        },
        storyContext: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON object containing story context when commentary was generated (title, brainstorm, etc.)'
        },
        triggerType: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'initial_suggestion',
            comment: 'What triggered this commentary generation',
            validate: {
                isIn: [['initial_suggestion', 'reevaluation', 'user_feedback', 'story_update', 'manual_update', 'ai_regenerate', 'ai_directive']]
            }
        },
        previousCommentaryId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'AICommentaries',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            comment: 'Reference to the previous commentary that this one replaces'
        },
        userFeedback: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'User feedback that led to this commentary update'
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
                fields: ['storyId', 'tagId', 'version'],
                name: 'unique_story_tag_commentary_version'
            },
            {
                fields: ['storyId', 'tagId', 'isCurrent'],
                name: 'idx_story_tag_current_commentary'
            },
            {
                fields: ['storyId'],
                name: 'idx_ai_commentary_story'
            },
            {
                fields: ['tagId'],
                name: 'idx_ai_commentary_tag'
            },
            {
                fields: ['triggerType'],
                name: 'idx_ai_commentary_trigger'
            }
        ]
    });

    // Associations
    AICommentary.associate = function(models) {
        AICommentary.belongsTo(models.Story, {
            foreignKey: 'storyId',
            as: 'story'
        });
        
        AICommentary.belongsTo(models.Tag, {
            foreignKey: 'tagId',
            as: 'tag'
        });
        
        AICommentary.belongsTo(models.AICommentary, {
            foreignKey: 'previousCommentaryId',
            as: 'previousCommentary'
        });
        
        AICommentary.hasMany(models.AICommentary, {
            foreignKey: 'previousCommentaryId',
            as: 'nextCommentaries'
        });
    };

    return AICommentary;
}; 