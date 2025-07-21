module.exports = (sequelize, Sequelize) => {
    const NotableObjectSuggestion = sequelize.define('NotableObjectSuggestion', {
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
            onDelete: 'CASCADE',
            comment: 'Reference to the story this object suggestion belongs to'
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: 'Name of the suggested notable object'
        },
        high_level_description: {
            type: Sequelize.TEXT,
            allowNull: false,
            comment: 'High-level description of the object concept'
        },
        objectType: {
            type: Sequelize.ENUM('weapon', 'artifact', 'tool', 'vehicle', 'clothing', 'jewelry', 'book', 'document', 'technology', 'magical_item', 'symbol', 'trophy', 'heirloom', 'currency', 'medicine', 'food', 'furniture', 'decoration'),
            allowNull: false,
            defaultValue: 'artifact',
            comment: 'Type of object'
        },
        rarity: {
            type: Sequelize.ENUM('common', 'uncommon', 'rare', 'legendary', 'unique'),
            allowNull: false,
            defaultValue: 'uncommon',
            comment: 'Rarity of the object'
        },
        significance: {
            type: Sequelize.ENUM('plot_critical', 'character_important', 'world_building', 'atmospheric', 'background'),
            allowNull: false,
            defaultValue: 'character_important',
            comment: 'Significance of this object to the story'
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Detailed description of the object'
        },
        properties: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of object properties and capabilities'
        },
        history: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'History and origin of the object'
        },
        currentOwner: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Current owner or possessor of the object'
        },
        storyEvents: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of story events involving this object'
        },
        relatedTags: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of tag IDs that influenced this object suggestion'
        },
        sourceDirectives: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of directive IDs that contributed to this object'
        },
        confidence: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0.8,
            comment: 'AI confidence score for this object suggestion (0-1)'
        },
        userRating: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'User rating (1-5 stars) for this object suggestion'
        },
        ratingComment: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'User comment provided with the rating'
        },
        ratedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user rated this object suggestion'
        },
        isAccepted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Whether the user accepted this object suggestion'
        },
        acceptedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user accepted this object suggestion'
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Whether this object suggestion is currently active'
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
                name: 'idx_notable_object_suggestion_story'
            },
            {
                fields: ['objectType'],
                name: 'idx_notable_object_suggestion_type'
            },
            {
                fields: ['isAccepted'],
                name: 'idx_notable_object_suggestion_accepted'
            },
            {
                fields: ['isActive'],
                name: 'idx_notable_object_suggestion_active'
            },
            {
                fields: ['confidence'],
                name: 'idx_notable_object_suggestion_confidence'
            }
        ]
    });

    // Instance methods
    NotableObjectSuggestion.prototype.getPropertiesArray = function() {
        try {
            return this.properties ? JSON.parse(this.properties) : [];
        } catch (error) {
            console.error('Error parsing properties:', error);
            return [];
        }
    };

    NotableObjectSuggestion.prototype.getStoryEventsArray = function() {
        try {
            return this.storyEvents ? JSON.parse(this.storyEvents) : [];
        } catch (error) {
            console.error('Error parsing storyEvents:', error);
            return [];
        }
    };

    NotableObjectSuggestion.prototype.getRelatedTagsArray = function() {
        try {
            return this.relatedTags ? JSON.parse(this.relatedTags) : [];
        } catch (error) {
            console.error('Error parsing relatedTags:', error);
            return [];
        }
    };

    NotableObjectSuggestion.prototype.getSourceDirectivesArray = function() {
        try {
            return this.sourceDirectives ? JSON.parse(this.sourceDirectives) : [];
        } catch (error) {
            console.error('Error parsing sourceDirectives:', error);
            return [];
        }
    };

    // Associations
    NotableObjectSuggestion.associate = function(models) {
        NotableObjectSuggestion.belongsTo(models.Story, {
            foreignKey: 'storyId',
            as: 'story'
        });
    };

    return NotableObjectSuggestion;
}; 