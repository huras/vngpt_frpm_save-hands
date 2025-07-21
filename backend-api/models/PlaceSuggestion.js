module.exports = (sequelize, Sequelize) => {
    const PlaceSuggestion = sequelize.define('PlaceSuggestion', {
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
            comment: 'Reference to the story this place suggestion belongs to'
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: 'Name of the suggested place/location'
        },
        high_level_description: {
            type: Sequelize.TEXT,
            allowNull: false,
            comment: 'High-level description of the place concept'
        },
        placeType: {
            type: Sequelize.ENUM('city', 'town', 'village', 'castle', 'school', 'hospital', 'shop', 'restaurant', 'park', 'forest', 'mountain', 'beach', 'island', 'space_station', 'underground', 'fantasy_realm', 'historical_period', 'future_setting'),
            allowNull: false,
            defaultValue: 'city',
            comment: 'Type of place/location'
        },
        atmosphere: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Atmosphere or mood of the place (e.g., mysterious, bustling, peaceful)'
        },
        significance: {
            type: Sequelize.ENUM('major', 'minor', 'background', 'pivotal'),
            allowNull: false,
            defaultValue: 'minor',
            comment: 'Significance of this place to the story'
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Detailed description of the place'
        },
        keyFeatures: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of key features or landmarks in this place'
        },
        inhabitants: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of types of people or creatures that inhabit this place'
        },
        storyEvents: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of potential story events that could happen here'
        },
        relatedTags: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of tag IDs that influenced this place suggestion'
        },
        sourceDirectives: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of directive IDs that contributed to this place'
        },
        confidence: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0.8,
            comment: 'AI confidence score for this place suggestion (0-1)'
        },
        userRating: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'User rating (1-5 stars) for this place suggestion'
        },
        ratingComment: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'User comment provided with the rating'
        },
        ratedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user rated this place suggestion'
        },
        isAccepted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Whether the user accepted this place suggestion'
        },
        acceptedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user accepted this place suggestion'
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Whether this place suggestion is currently active'
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
                name: 'idx_place_suggestion_story'
            },
            {
                fields: ['placeType'],
                name: 'idx_place_suggestion_type'
            },
            {
                fields: ['isAccepted'],
                name: 'idx_place_suggestion_accepted'
            },
            {
                fields: ['isActive'],
                name: 'idx_place_suggestion_active'
            },
            {
                fields: ['confidence'],
                name: 'idx_place_suggestion_confidence'
            }
        ]
    });

    // Instance methods
    PlaceSuggestion.prototype.getKeyFeaturesArray = function() {
        try {
            return this.keyFeatures ? JSON.parse(this.keyFeatures) : [];
        } catch (error) {
            console.error('Error parsing keyFeatures:', error);
            return [];
        }
    };

    PlaceSuggestion.prototype.getInhabitantsArray = function() {
        try {
            return this.inhabitants ? JSON.parse(this.inhabitants) : [];
        } catch (error) {
            console.error('Error parsing inhabitants:', error);
            return [];
        }
    };

    PlaceSuggestion.prototype.getStoryEventsArray = function() {
        try {
            return this.storyEvents ? JSON.parse(this.storyEvents) : [];
        } catch (error) {
            console.error('Error parsing storyEvents:', error);
            return [];
        }
    };

    PlaceSuggestion.prototype.getRelatedTagsArray = function() {
        try {
            return this.relatedTags ? JSON.parse(this.relatedTags) : [];
        } catch (error) {
            console.error('Error parsing relatedTags:', error);
            return [];
        }
    };

    PlaceSuggestion.prototype.getSourceDirectivesArray = function() {
        try {
            return this.sourceDirectives ? JSON.parse(this.sourceDirectives) : [];
        } catch (error) {
            console.error('Error parsing sourceDirectives:', error);
            return [];
        }
    };

    // Associations
    PlaceSuggestion.associate = function(models) {
        PlaceSuggestion.belongsTo(models.Story, {
            foreignKey: 'storyId',
            as: 'story'
        });
    };

    return PlaceSuggestion;
}; 