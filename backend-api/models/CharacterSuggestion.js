module.exports = (sequelize, Sequelize) => {
    const CharacterSuggestion = sequelize.define('CharacterSuggestion', {
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
            comment: 'Reference to the story this character suggestion belongs to'
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: 'Name of the suggested character'
        },
        high_level_description: {
            type: Sequelize.TEXT,
            allowNull: false,
            comment: 'High-level description of the character concept'
        },
        characterType: {
            type: Sequelize.ENUM('protagonist', 'antagonist', 'supporting', 'mentor', 'love_interest', 'comic_relief', 'foil', 'deuteragonist'),
            allowNull: false,
            defaultValue: 'supporting',
            comment: 'Type of character in the story'
        },
        archetype: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Character archetype (e.g., Hero, Mentor, Trickster, etc.)'
        },
        personalityTraits: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of personality traits for this character'
        },
        background: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Character background and history'
        },
        motivations: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of character motivations and goals'
        },
        relationships: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of potential relationships with other characters'
        },
        relatedTags: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of tag IDs that influenced this character suggestion'
        },
        sourceDirectives: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of directive IDs that contributed to this character'
        },
        confidence: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0.8,
            comment: 'AI confidence score for this character suggestion (0-1)'
        },
        userRating: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'User rating (1-5 stars) for this character suggestion'
        },
        ratingComment: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'User comment provided with the rating'
        },
        ratedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user rated this character suggestion'
        },
        isAccepted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Whether the user accepted this character suggestion'
        },
        acceptedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user accepted this character suggestion'
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Whether this character suggestion is currently active'
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
                name: 'idx_character_suggestion_story'
            },
            {
                fields: ['characterType'],
                name: 'idx_character_suggestion_type'
            },
            {
                fields: ['isAccepted'],
                name: 'idx_character_suggestion_accepted'
            },
            {
                fields: ['isActive'],
                name: 'idx_character_suggestion_active'
            },
            {
                fields: ['confidence'],
                name: 'idx_character_suggestion_confidence'
            }
        ]
    });

    // Instance methods
    CharacterSuggestion.prototype.getPersonalityTraitsArray = function() {
        try {
            return this.personalityTraits ? JSON.parse(this.personalityTraits) : [];
        } catch (error) {
            console.error('Error parsing personalityTraits:', error);
            return [];
        }
    };

    CharacterSuggestion.prototype.getMotivationsArray = function() {
        try {
            return this.motivations ? JSON.parse(this.motivations) : [];
        } catch (error) {
            console.error('Error parsing motivations:', error);
            return [];
        }
    };

    CharacterSuggestion.prototype.getRelationshipsArray = function() {
        try {
            return this.relationships ? JSON.parse(this.relationships) : [];
        } catch (error) {
            console.error('Error parsing relationships:', error);
            return [];
        }
    };

    CharacterSuggestion.prototype.getRelatedTagsArray = function() {
        try {
            return this.relatedTags ? JSON.parse(this.relatedTags) : [];
        } catch (error) {
            console.error('Error parsing relatedTags:', error);
            return [];
        }
    };

    CharacterSuggestion.prototype.getSourceDirectivesArray = function() {
        try {
            return this.sourceDirectives ? JSON.parse(this.sourceDirectives) : [];
        } catch (error) {
            console.error('Error parsing sourceDirectives:', error);
            return [];
        }
    };

    // Associations
    CharacterSuggestion.associate = function(models) {
        CharacterSuggestion.belongsTo(models.Story, {
            foreignKey: 'storyId',
            as: 'story'
        });
    };

    return CharacterSuggestion;
}; 