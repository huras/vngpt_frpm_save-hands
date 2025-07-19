module.exports = (sequelize, Sequelize) => {
    const TagSuggestion = sequelize.define('TagSuggestion', {
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
            comment: 'AI reasoning for why this tag was suggested'
        },
        confidence: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0.8,
            comment: 'AI confidence score (0-1) for this suggestion'
        },
        status: {
            type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'expired'),
            allowNull: false,
            defaultValue: 'pending',
            comment: 'Status of the suggestion'
        },
        acceptedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user accepted this suggestion'
        },
        rejectedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user rejected this suggestion'
        },
        rejectionReason: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Reason provided by user for rejecting this suggestion'
        },
        suggestionType: {
            type: Sequelize.ENUM('ai_generated', 'manual_search', 'similar_story'),
            allowNull: false,
            defaultValue: 'ai_generated',
            comment: 'How this suggestion was generated'
        },
        contextTags: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of tag IDs that were used as context for this suggestion'
        },
        userRating: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'User rating (1-5 stars) for this suggestion'
        },
        ratingComment: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'User comment provided with the rating'
        },
        ratedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user rated this suggestion'
        },
        previousVersionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'TagSuggestions',
                key: 'id'
            },
            comment: 'Reference to the previous version of this suggestion'
        },
        versionNumber: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: 'Version number of this suggestion'
        },
        regenerationReason: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Reason for regenerating this suggestion (user feedback, rating, etc.)'
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
                fields: ['storyId', 'tagId', 'status'],
                where: {
                    status: 'pending'
                },
                name: 'unique_pending_story_tag_suggestion'
            },
            {
                fields: ['storyId', 'tagId'],
                name: 'idx_story_tag_suggestion'
            },
            {
                fields: ['status'],
                name: 'idx_tag_suggestion_status'
            },
            {
                fields: ['storyId', 'status'],
                name: 'idx_story_suggestion_status'
            }
        ]
    });

    // Associations
    TagSuggestion.associate = function(models) {
        TagSuggestion.belongsTo(models.Story, {
            foreignKey: 'storyId',
            as: 'story'
        });
        
        TagSuggestion.belongsTo(models.Tag, {
            foreignKey: 'tagId',
            as: 'tag'
        });
    };

    return TagSuggestion;
}; 