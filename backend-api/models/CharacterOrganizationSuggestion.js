module.exports = (sequelize, Sequelize) => {
    const CharacterOrganizationSuggestion = sequelize.define('CharacterOrganizationSuggestion', {
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
            comment: 'Reference to the story this organization suggestion belongs to'
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            comment: 'Name of the suggested organization'
        },
        high_level_description: {
            type: Sequelize.TEXT,
            allowNull: false,
            comment: 'High-level description of the organization concept'
        },
        organizationType: {
            type: Sequelize.ENUM('government', 'military', 'school', 'corporation', 'guild', 'gang', 'family', 'religious', 'secret_society', 'academy', 'hospital', 'research_institute', 'mercenary_group', 'resistance_movement', 'royal_court', 'council'),
            allowNull: false,
            defaultValue: 'corporation',
            comment: 'Type of organization'
        },
        alignment: {
            type: Sequelize.ENUM('good', 'neutral', 'evil', 'chaotic', 'lawful', 'complex'),
            allowNull: false,
            defaultValue: 'neutral',
            comment: 'Moral alignment of the organization'
        },
        structure: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Organizational structure (e.g., hierarchy, democracy, oligarchy)'
        },
        purpose: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Primary purpose and goals of the organization'
        },
        leadership: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Description of the organization\'s leadership'
        },
        membership: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of member types and requirements'
        },
        resources: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of resources and capabilities'
        },
        conflicts: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of potential conflicts with other organizations or characters'
        },
        storyRole: {
            type: Sequelize.ENUM('ally', 'antagonist', 'neutral', 'pivotal', 'background'),
            allowNull: false,
            defaultValue: 'neutral',
            comment: 'Role of this organization in the story'
        },
        relatedTags: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of tag IDs that influenced this organization suggestion'
        },
        sourceDirectives: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'JSON array of directive IDs that contributed to this organization'
        },
        confidence: {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0.8,
            comment: 'AI confidence score for this organization suggestion (0-1)'
        },
        userRating: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'User rating (1-5 stars) for this organization suggestion'
        },
        ratingComment: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'User comment provided with the rating'
        },
        ratedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user rated this organization suggestion'
        },
        isAccepted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Whether the user accepted this organization suggestion'
        },
        acceptedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'When the user accepted this organization suggestion'
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Whether this organization suggestion is currently active'
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
                name: 'idx_character_organization_suggestion_story'
            },
            {
                fields: ['organizationType'],
                name: 'idx_character_organization_suggestion_type'
            },
            {
                fields: ['isAccepted'],
                name: 'idx_character_organization_suggestion_accepted'
            },
            {
                fields: ['isActive'],
                name: 'idx_character_organization_suggestion_active'
            },
            {
                fields: ['confidence'],
                name: 'idx_character_organization_suggestion_confidence'
            }
        ]
    });

    // Instance methods
    CharacterOrganizationSuggestion.prototype.getMembershipArray = function() {
        try {
            return this.membership ? JSON.parse(this.membership) : [];
        } catch (error) {
            console.error('Error parsing membership:', error);
            return [];
        }
    };

    CharacterOrganizationSuggestion.prototype.getResourcesArray = function() {
        try {
            return this.resources ? JSON.parse(this.resources) : [];
        } catch (error) {
            console.error('Error parsing resources:', error);
            return [];
        }
    };

    CharacterOrganizationSuggestion.prototype.getConflictsArray = function() {
        try {
            return this.conflicts ? JSON.parse(this.conflicts) : [];
        } catch (error) {
            console.error('Error parsing conflicts:', error);
            return [];
        }
    };

    CharacterOrganizationSuggestion.prototype.getRelatedTagsArray = function() {
        try {
            return this.relatedTags ? JSON.parse(this.relatedTags) : [];
        } catch (error) {
            console.error('Error parsing relatedTags:', error);
            return [];
        }
    };

    CharacterOrganizationSuggestion.prototype.getSourceDirectivesArray = function() {
        try {
            return this.sourceDirectives ? JSON.parse(this.sourceDirectives) : [];
        } catch (error) {
            console.error('Error parsing sourceDirectives:', error);
            return [];
        }
    };

    // Associations
    CharacterOrganizationSuggestion.associate = function(models) {
        CharacterOrganizationSuggestion.belongsTo(models.Story, {
            foreignKey: 'storyId',
            as: 'story'
        });
    };

    return CharacterOrganizationSuggestion;
}; 