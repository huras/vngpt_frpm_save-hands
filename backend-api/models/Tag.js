module.exports = (sequelize, Sequelize) => {
    const Tag = sequelize.define('Tag', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        thumb_url: {
            type: Sequelize.STRING,
            allowNull: true
        },
        short_description: {
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

    // Associations for Tag
    Tag.associate = function(models) {
        // Many-to-Many relationship with Story
        Tag.belongsToMany(models.Story, {
            through: 'story_tags', // Link table for the many-to-many relationship
            as: 'stories'
        });
    };

    return Tag;
};