module.exports = (sequelize, Sequelize) => {
    const TagSuggestionPitch = sequelize.define('TagSuggestionPitch', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
            comment: 'Reference to the parent TagSuggestion'
        },
        pitch: {
            type: Sequelize.TEXT,
            allowNull: false,
            comment: 'The AI-generated pitch content'
        },
        pitchType: {
            type: Sequelize.ENUM('character_development', 'plot_enhancement', 'theme_exploration', 'world_building', 'conflict_creation', 'general'),
            allowNull: false,
            defaultValue: 'general',
            comment: 'Type/category of the pitch'
        },
        confidence: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0.8,
            comment: 'AI confidence score (0-1) for this pitch'
        },
        userRating: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'User rating (1-5 stars) for this pitch'
        },
        ratingComment: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'User comment provided with the rating'
        },
        ratedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user rated this pitch'
        },
        isFavorite: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Whether the user marked this pitch as favorite'
        },
        generationContext: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON string containing context used for pitch generation'
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
                fields: ['tagSuggestionId'],
                name: 'idx_tag_suggestion_pitch_suggestion'
            },
            {
                fields: ['pitchType'],
                name: 'idx_tag_suggestion_pitch_type'
            },
            {
                fields: ['userRating'],
                name: 'idx_tag_suggestion_pitch_rating'
            },
            {
                fields: ['isFavorite'],
                name: 'idx_tag_suggestion_pitch_favorite'
            }
        ]
    });

    // Associations
    TagSuggestionPitch.associate = function(models) {
        TagSuggestionPitch.belongsTo(models.TagSuggestion, {
            foreignKey: 'tagSuggestionId',
            as: 'tagSuggestion'
        });
    };

    return TagSuggestionPitch;
}; 