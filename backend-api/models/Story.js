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
        // Many-to-Many relationship with Tag
        Story.belongsToMany(models.Tag, {
            through: 'story_tags', // Link table for the many-to-many relationship
            as: 'tags'
        });

        // One-to-Many relationship with TagSuggestion
        Story.hasMany(models.TagSuggestion, {
            foreignKey: 'storyId',
            as: 'tagSuggestions'
        });

        // One-to-Many relationship with StoryTagReasoning
        Story.hasMany(models.StoryTagReasoning, {
            foreignKey: 'storyId',
            as: 'tagReasonings'
        });
    };

    return Story;
};