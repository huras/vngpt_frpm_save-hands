module.exports = (sequelize, Sequelize) => {
    const Story = sequelize.define('Story', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        brainstorm: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        lastReevaluatedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Timestamp of when tag suggestions were last re-evaluated'
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
    }, {});

    // Associations for Story
    Story.associate = function(models) {
        // One-to-Many relationship with TagSuggestion (primary way to relate to Tags)
        Story.hasMany(models.TagSuggestion, {
            foreignKey: 'storyId',
            as: 'tagSuggestions'
        });

        // One-to-Many relationship with StoryTagReasoning (reasoning for accepted tag relationships)
        Story.hasMany(models.StoryTagReasoning, {
            foreignKey: 'storyId',
            as: 'tagReasonings'
        });

        // Story expansion associations
        if (models.ArcSuggestion) {
            Story.hasMany(models.ArcSuggestion, {
                foreignKey: 'storyId',
                as: 'arcSuggestions'
            });
        }

        if (models.CharacterSuggestion) {
            Story.hasMany(models.CharacterSuggestion, {
                foreignKey: 'storyId',
                as: 'characterSuggestions'
            });
        }

        if (models.PlaceSuggestion) {
            Story.hasMany(models.PlaceSuggestion, {
                foreignKey: 'storyId',
                as: 'placeSuggestions'
            });
        }

        if (models.CharacterOrganizationSuggestion) {
            Story.hasMany(models.CharacterOrganizationSuggestion, {
                foreignKey: 'storyId',
                as: 'organizationSuggestions'
            });
        }

        if (models.NotableObjectSuggestion) {
            Story.hasMany(models.NotableObjectSuggestion, {
                foreignKey: 'storyId',
                as: 'objectSuggestions'
            });
        }
    };

    return Story;
};