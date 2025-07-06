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
        // Add associations here if needed in the future
    };

    return Story;
};